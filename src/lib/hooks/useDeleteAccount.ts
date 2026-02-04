import { useState } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { db } from "@/lib/firebase/client";
import { doc, writeBatch, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { deleteUser } from "firebase/auth";

export const useDeleteAccount = () => {
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        setError(null);

        try {
            const batch = writeBatch(db);
            const userRef = doc(db, "users", user.uid);

            // 1. Get User Role & Data to determine cleanup
            // We can read the doc locally or rely on what we might have in context.
            // Safer to read fresh.
            // Note: If user is already deleted from auth but not firestore, this might be tricky, 
            // but here we assume user is logged in.

            // However, to batch delete, we need to know what else to delete/update.
            // Strategy:
            // - Delete 'users/{uid}'
            // - If student: Find circleMembers where userId == uid -> Delete them.
            // - If sheikh: Find circles where sheikhIds contains uid -> Remove uid.

            // Fetch generic references
            // A. Circle Memberships (as Student)
            const membersRef = collection(db, "circleMembers");
            const qMembers = query(membersRef, where("userId", "==", user.uid));
            const memberSnaps = await getDocs(qMembers);

            memberSnaps.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // B. Circles (as Sheikh)
            // We can't do a "contains" query and update in batch easily without reading.
            // Actually, we can just delete the user doc and let the backend (or manual cleanup) handle the rest? 
            // No, the prompt requires us to clean up.

            // Find circles where this user is a sheikh
            const circlesRef = collection(db, "circles");
            const qCircles = query(circlesRef, where("sheikhIds", "array-contains", user.uid));
            const circleSnaps = await getDocs(qCircles);

            circleSnaps.forEach((circleDoc) => {
                // We cannot use batch.update for arrayRemove if we used same query? 
                // Yes we can.
                batch.update(circleDoc.ref, {
                    sheikhIds: arrayRemove(user.uid)
                });
            });

            // C. Delete User Profile
            batch.delete(userRef);

            // Execute Batch
            await batch.commit();

            // 2. Delete Auth
            await deleteUser(user);

            // Auth state listener handles redirect usually?
            // If not, window.location.href = "/"

        } catch (err: any) {
            console.error("Delete account error:", err);
            if (err.code === "auth/requires-recent-login") {
                setError("يجب إعادة تسجيل الدخول لتأكيد حذف الحساب لأسباب أمنية.");
            } else {
                setError(err.message || "فشل في حذف الحساب");
            }
            setIsDeleting(false); // Only reset if failed. If success, we are gone.
        }
    };

    return { deleteAccount, isDeleting, error };
};
