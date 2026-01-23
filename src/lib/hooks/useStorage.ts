"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface UploadState {
    progress: number;
    url: string | null;
    error: string | null;
    uploading: boolean;
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
                    (error) => {
                        console.error("Upload error:", error);
                        const errorMessage = "فشل في تحميل الصورة: " + error.message;
                        setState((prev) => ({ ...prev, error: errorMessage, uploading: false }));
                        resolve({ url: null, error: errorMessage });
                    },
                    async () => {
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
                            setState((prev) => ({ ...prev, error: errorMessage, uploading: false }));
                            resolve({ url: null, error: errorMessage });
                        }
                    }
                );
            });
        } catch (err: any) {
            console.error("Storage error:", err);
            const error = "خطأ غير متوقع في التحميل";
            setState((prev) => ({ ...prev, error, uploading: false }));
            return { url: null, error };
        }
    };

    return {
        ...state,
        uploadFile,
    };
}
