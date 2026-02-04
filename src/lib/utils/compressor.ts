/**
 * Image Compression Utility for Avatar Uploads
 * 
 * Compresses images to small Base64 strings suitable for Firestore storage.
 * - Resizes to max 150x150 pixels
 * - Compresses to JPEG at 60% quality
 * - Returns Data URL (Base64 string)
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 150,
    maxHeight: 150,
    quality: 0.6,
    maxSizeKB: 900, // Firestore doc limit is 1MB, leave buffer
};

/**
 * Compresses an image file to a small Base64 string
 * @param file - The image file to compress
 * @param options - Optional compression settings
 * @returns Promise<string> - The compressed image as a Data URL
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validate file type
    if (!file.type.startsWith("image/")) {
        throw new Error("يمكنك تحميل الصور فقط");
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculate new dimensions while maintaining aspect ratio
                    let { width, height } = img;
                    const maxW = opts.maxWidth!;
                    const maxH = opts.maxHeight!;

                    if (width > maxW || height > maxH) {
                        const ratio = Math.min(maxW / width, maxH / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    // Create canvas and draw resized image
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        throw new Error("فشل في إنشاء السياق الرسومي");
                    }

                    // Use high-quality image smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";

                    // Draw the image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Export as JPEG with compression
                    const base64 = canvas.toDataURL("image/jpeg", opts.quality);

                    // Check final size (Base64 is ~33% larger than binary)
                    const sizeKB = (base64.length * 0.75) / 1024;
                    console.log(`[Compressor] Output: ${width}x${height}, ${sizeKB.toFixed(1)}KB`);

                    if (sizeKB > opts.maxSizeKB!) {
                        throw new Error(
                            `الصورة كبيرة جداً (${sizeKB.toFixed(0)}KB). الحد الأقصى ${opts.maxSizeKB}KB`
                        );
                    }

                    resolve(base64);
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = () => {
                reject(new Error("فشل في تحميل الصورة. تأكد من أنها صورة صالحة."));
            };

            img.src = event.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error("فشل في قراءة الملف"));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Compresses an image with multiple quality attempts
 * If first attempt is too large, tries lower quality
 */
export async function compressImageWithRetry(
    file: File,
    options: CompressionOptions = {}
): Promise<string> {
    const qualities = [0.6, 0.4, 0.2];

    for (const quality of qualities) {
        try {
            return await compressImage(file, { ...options, quality });
        } catch (err: any) {
            // If it's a size error, try lower quality
            if (err.message?.includes("كبيرة جداً") && quality !== qualities[qualities.length - 1]) {
                console.log(`[Compressor] Retrying with quality ${qualities[qualities.indexOf(quality) + 1]}`);
                continue;
            }
            throw err;
        }
    }

    throw new Error("فشل في ضغط الصورة. جرب صورة أصغر.");
}
