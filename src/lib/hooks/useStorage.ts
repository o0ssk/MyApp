"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL, StorageError } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface UploadState {
    progress: number;
    url: string | null;
    error: string | null;
    uploading: boolean;
}

// Map Firebase Storage error codes to Arabic messages
function getArabicErrorMessage(error: StorageError): string {
    switch (error.code) {
        case "storage/unauthorized":
        case "storage/unauthenticated":
            return "لا تملك صلاحية الرفع. تأكد من تسجيل الدخول.";
        case "storage/canceled":
            return "تم إلغاء التحميل";
        case "storage/quota-exceeded":
            return "تم تجاوز حد المساحة المتاحة";
        case "storage/retry-limit-exceeded":
            return "فشل الاتصال. حاول مرة أخرى.";
        case "storage/invalid-checksum":
            return "الملف تالف. حاول رفعه مرة أخرى.";
        case "storage/server-file-wrong-size":
            return "خطأ في حجم الملف. حاول مرة أخرى.";
        default:
            return `فشل في تحميل الصورة: ${error.message}`;
    }
}

export function useStorage() {
    const [state, setState] = useState<UploadState>({
        progress: 0,
        url: null,
        error: null,
        uploading: false,
    });

    const uploadFile = async (file: File, path: string): Promise<{ url: string | null; error: string | null }> => {
        // Reset state
        setState({
            progress: 0,
            url: null,
            error: null,
            uploading: true,
        });

        // Validate file type
        if (!file.type.startsWith("image/")) {
            const error = "يمكنك تحميل الصور فقط";
            setState((prev) => ({ ...prev, error, uploading: false }));
            return { url: null, error };
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            const error = "حجم الصورة يجب أن لا يتجاوز 2 ميجابايت";
            setState((prev) => ({ ...prev, error, uploading: false }));
            return { url: null, error };
        }

        try {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setState((prev) => ({ ...prev, progress }));
                    },
                    (error: StorageError) => {
                        // Error callback - CRITICAL: Set uploading to false
                        console.error("Upload error:", error.code, error.message);
                        const errorMessage = getArabicErrorMessage(error);
                        setState({
                            progress: 0,
                            url: null,
                            error: errorMessage,
                            uploading: false, // Always stop spinner
                        });
                        resolve({ url: null, error: errorMessage });
                    },
                    async () => {
                        // Success callback
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            setState({
                                progress: 100,
                                url: downloadURL,
                                error: null,
                                uploading: false,
                            });
                            resolve({ url: downloadURL, error: null });
                        } catch (err: any) {
                            console.error("Get download URL error:", err);
                            const errorMessage = "فشل في الحصول على رابط الصورة";
                            setState({
                                progress: 0,
                                url: null,
                                error: errorMessage,
                                uploading: false, // Always stop spinner
                            });
                            resolve({ url: null, error: errorMessage });
                        }
                    }
                );
            });
        } catch (err: any) {
            // Outer catch for unexpected errors (e.g., storage not initialized)
            console.error("Storage initialization error:", err);
            const error = "خطأ غير متوقع في التحميل. تحقق من اتصالك.";
            setState({
                progress: 0,
                url: null,
                error,
                uploading: false, // Always stop spinner
            });
            return { url: null, error };
        }
    };

    // Reset function for manual cleanup
    const reset = () => {
        setState({
            progress: 0,
            url: null,
            error: null,
            uploading: false,
        });
    };

    return {
        ...state,
        uploadFile,
        reset,
    };
}
