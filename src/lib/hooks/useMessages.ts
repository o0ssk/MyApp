"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

// Types
export interface Thread {
    id: string;
    participants: string[];
    circleId?: string;
    lastMessage: string;
    lastMessageAt: Date;
    updatedAt: Date;
    // Computed
    otherUserId: string;
    otherUserName?: string;
    otherUserAvatar?: string;
    isUnread: boolean;
    unreadCount?: number;
}

export interface ThreadMember {
    lastReadAt: Date;
    muted?: boolean;
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    type: "text";
    createdAt: Date;
}

// Fetch user info helper
async function fetchUserInfo(userId: string): Promise<{ name: string; avatar?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return { name: data.name || "مستخدم", avatar: data.avatar };
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
    return { name: "مستخدم" };
}

// Hook: Fetch all threads for current user
export function useThreads() {
    const { user } = useAuth();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setThreads([]);
            setIsLoading(false);
            return;
        }

        const threadsRef = collection(db, "threads");
        const q = query(
            threadsRef,
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const threadsData: Thread[] = [];

                for (const docSnap of snapshot.docs) {
                    const data = docSnap.data();
                    const otherUserId = data.participants.find((p: string) => p !== user.uid) || "";

                    // Fetch member doc to check lastReadAt
                    let isUnread = false;
                    try {
                        const memberDoc = await getDoc(doc(db, "threads", docSnap.id, "members", user.uid));
                        if (memberDoc.exists()) {
                            const memberData = memberDoc.data();
                            const lastReadAt = memberData.lastReadAt?.toDate() || new Date(0);
                            const lastMessageAt = data.lastMessageAt?.toDate() || new Date();
                            isUnread = lastMessageAt > lastReadAt;
                        } else {
                            isUnread = true; // No member doc means never read
                        }
                    } catch (err) {
                        console.error("Error checking read status:", err);
                    }

                    // Fetch other user info
                    const otherUserInfo = await fetchUserInfo(otherUserId);

                    threadsData.push({
                        id: docSnap.id,
                        participants: data.participants,
                        circleId: data.circleId,
                        lastMessage: data.lastMessage || "",
                        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                        otherUserId,
                        otherUserName: otherUserInfo.name,
                        otherUserAvatar: otherUserInfo.avatar,
                        isUnread,
                    });
                }

                setThreads(threadsData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Threads error:", err);
                setError("فشل في تحميل المحادثات");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Total unread count
    const totalUnread = threads.filter((t) => t.isUnread).length;

    return { threads, isLoading, error, totalUnread };
}

// Hook: Fetch messages for a specific thread
export function useThreadMessages(threadId: string | null) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [threadInfo, setThreadInfo] = useState<{
        otherUserId: string;
        otherUserName: string;
        circleId?: string;
    } | null>(null);

    useEffect(() => {
        if (!user || !threadId) {
            setMessages([]);
            setIsLoading(false);
            return;
        }

        // Fetch thread info
        const fetchThreadInfo = async () => {
            try {
                const threadDoc = await getDoc(doc(db, "threads", threadId));
                if (threadDoc.exists()) {
                    const data = threadDoc.data();
                    const otherUserId = data.participants.find((p: string) => p !== user.uid) || "";
                    const otherUserInfo = await fetchUserInfo(otherUserId);
                    setThreadInfo({
                        otherUserId,
                        otherUserName: otherUserInfo.name,
                        circleId: data.circleId,
                    });
                }
            } catch (err) {
                console.error("Error fetching thread info:", err);
            }
        };
        fetchThreadInfo();

        // Subscribe to messages
        const messagesRef = collection(db, "threads", threadId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"), limit(200));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const messagesData: Message[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    senderId: d.data().senderId,
                    content: d.data().content,
                    type: d.data().type || "text",
                    createdAt: d.data().createdAt?.toDate() || new Date(),
                }));
                setMessages(messagesData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Messages error:", err);
                setError("فشل في تحميل الرسائل");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, threadId]);

    // Send message
    const sendMessage = async (content: string): Promise<{ success: boolean; error?: string }> => {
        if (!user || !threadId || !content.trim()) {
            return { success: false, error: "بيانات غير صالحة" };
        }

        try {
            // Add message
            await addDoc(collection(db, "threads", threadId, "messages"), {
                senderId: user.uid,
                content: content.trim(),
                type: "text",
                createdAt: serverTimestamp(),
            });

            // Update thread lastMessage
            await updateDoc(doc(db, "threads", threadId), {
                lastMessage: content.trim().slice(0, 100),
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (err: any) {
            console.error("Send message error:", err);
            return { success: false, error: "فشل في إرسال الرسالة" };
        }
    };

    // Mark as read
    const markAsRead = async () => {
        if (!user || !threadId) return;

        try {
            const memberRef = doc(db, "threads", threadId, "members", user.uid);
            await updateDoc(memberRef, {
                lastReadAt: serverTimestamp(),
            }).catch(async () => {
                // If member doc doesn't exist, create it
                const memberDoc = await getDoc(memberRef);
                if (!memberDoc.exists()) {
                    // Use setDoc to create
                    const { setDoc } = await import("firebase/firestore");
                    await setDoc(memberRef, { lastReadAt: serverTimestamp() });
                }
            });
        } catch (err) {
            console.error("Mark as read error:", err);
        }
    };

    return { messages, threadInfo, isLoading, error, sendMessage, markAsRead };
}

// Hook: Create or find existing thread with another user
export function useCreateThread() {
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);

    const createOrOpenThread = async (
        otherUserId: string,
        circleId?: string
    ): Promise<{ success: boolean; threadId?: string; error?: string }> => {
        if (!user || !otherUserId) {
            return { success: false, error: "بيانات غير صالحة" };
        }

        setIsCreating(true);

        try {
            // Check if thread already exists
            const threadsRef = collection(db, "threads");
            const q = query(
                threadsRef,
                where("participants", "array-contains", user.uid)
            );
            const snapshot = await getDocs(q);

            // Find thread with the other user
            const existingThread = snapshot.docs.find((d) => {
                const participants = d.data().participants;
                return participants.includes(otherUserId);
            });

            if (existingThread) {
                setIsCreating(false);
                return { success: true, threadId: existingThread.id };
            }

            // Create new thread
            const participants = [user.uid, otherUserId].sort();
            const threadDoc = await addDoc(collection(db, "threads"), {
                participants,
                circleId: circleId || null,
                lastMessage: "",
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Create member docs for both
            const { setDoc } = await import("firebase/firestore");
            await setDoc(doc(db, "threads", threadDoc.id, "members", user.uid), {
                lastReadAt: serverTimestamp(),
            });
            await setDoc(doc(db, "threads", threadDoc.id, "members", otherUserId), {
                lastReadAt: new Timestamp(0, 0), // Never read
            });

            setIsCreating(false);
            return { success: true, threadId: threadDoc.id };
        } catch (err: any) {
            console.error("Create thread error:", err);
            setIsCreating(false);
            return { success: false, error: "فشل في إنشاء المحادثة" };
        }
    };

    return { createOrOpenThread, isCreating };
}
