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
    setDoc,
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
    otherUserBadge?: string;
    otherUserFrame?: string;
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
async function fetchUserInfo(userId: string): Promise<{ name: string; avatar?: string; badge?: string; frame?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                name: data.name || "مستخدم",
                avatar: data.photoURL,
                badge: data.equippedBadge,
                frame: data.equippedFrame,
            };
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
    return { name: "مستخدم" };
}

// Helper: Find existing thread between two users
async function findExistingThread(currentUserId: string, otherUserId: string): Promise<string | null> {
    try {
        const threadsRef = collection(db, "threads");
        const q = query(
            threadsRef,
            where("participants", "array-contains", currentUserId)
        );
        const snapshot = await getDocs(q);

        const existingThread = snapshot.docs.find((d) => {
            const participants = d.data().participants;
            return participants.includes(otherUserId);
        });

        return existingThread ? existingThread.id : null;
    } catch (err) {
        console.error("Error finding existing thread:", err);
        return null;
    }
}

// Helper: Create a new thread between two users
async function createNewThread(
    currentUserId: string,
    otherUserId: string,
    circleId?: string
): Promise<{ success: boolean; threadId?: string; error?: string }> {
    try {
        // Sort participant IDs for consistent ordering
        const participants = [currentUserId, otherUserId].sort();

        // Fetch user info for both participants
        const [currentUserInfo, otherUserInfo] = await Promise.all([
            fetchUserInfo(currentUserId),
            fetchUserInfo(otherUserId),
        ]);

        // Create the thread document with all required fields
        const threadDoc = await addDoc(collection(db, "threads"), {
            participants,
            participantData: {
                [currentUserId]: {
                    name: currentUserInfo.name,
                    avatar: currentUserInfo.avatar || null,
                },
                [otherUserId]: {
                    name: otherUserInfo.name,
                    avatar: otherUserInfo.avatar || null,
                },
            },
            circleId: circleId || null,
            lastMessage: "",
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
        });

        // Create member docs for both users
        await Promise.all([
            setDoc(doc(db, "threads", threadDoc.id, "members", currentUserId), {
                lastReadAt: serverTimestamp(),
                joinedAt: serverTimestamp(),
            }),
            setDoc(doc(db, "threads", threadDoc.id, "members", otherUserId), {
                lastReadAt: new Timestamp(0, 0), // Never read
                joinedAt: serverTimestamp(),
            }),
        ]);

        console.log(`[Messages] ✅ Created new thread ${threadDoc.id} between ${currentUserId} and ${otherUserId}`);
        return { success: true, threadId: threadDoc.id };
    } catch (err: any) {
        console.error("[Messages] ❌ Create thread error:", err);
        return { success: false, error: err.message || "فشل في إنشاء المحادثة" };
    }
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

                    // Use cached participantData if available, otherwise fetch
                    let otherUserInfo: { name: string; avatar?: string; badge?: string; frame?: string } = { name: "مستخدم" };
                    if (data.participantData?.[otherUserId]) {
                        otherUserInfo = {
                            name: data.participantData[otherUserId].name || "مستخدم",
                            avatar: data.participantData[otherUserId].avatar,
                            badge: undefined,
                            frame: undefined,
                        };
                    } else {
                        otherUserInfo = await fetchUserInfo(otherUserId);
                    }

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
                        otherUserBadge: otherUserInfo.badge,
                        otherUserFrame: otherUserInfo.frame,
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

// Hook: Fetch messages for a specific thread (or create one on first message)
// threadIdOrUserId can be either an existing threadId OR a userId to start a new conversation with
export function useThreadMessages(threadIdOrUserId: string | null) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedThreadId, setResolvedThreadId] = useState<string | null>(null);
    const [isNewConversation, setIsNewConversation] = useState(false);
    const [threadInfo, setThreadInfo] = useState<{
        otherUserId: string;
        otherUserName: string;
        otherUserAvatar?: string;
        circleId?: string;
    } | null>(null);

    // Resolve the thread: check if it's a threadId or userId
    useEffect(() => {
        if (!user || !threadIdOrUserId) {
            setMessages([]);
            setIsLoading(false);
            setResolvedThreadId(null);
            setThreadInfo(null);
            return;
        }

        const resolveThread = async () => {
            setIsLoading(true);
            setError(null);

            console.log(`[Messages] 🔍 Resolving: "${threadIdOrUserId}"`);

            try {
                // First, try to fetch as a thread document
                let isExistingThread = false;
                try {
                    const threadDoc = await getDoc(doc(db, "threads", threadIdOrUserId));
                    if (threadDoc.exists()) {
                        isExistingThread = true;
                        // It's an existing thread
                        const data = threadDoc.data();
                        const otherUserId = data.participants.find((p: string) => p !== user.uid) || "";
                        const otherUserInfo = data.participantData?.[otherUserId] || await fetchUserInfo(otherUserId);

                        console.log(`[Messages] ✅ Found existing thread with ${otherUserId}`);
                        setResolvedThreadId(threadIdOrUserId);
                        setIsNewConversation(false);
                        setThreadInfo({
                            otherUserId,
                            otherUserName: otherUserInfo.name || "مستخدم",
                            otherUserAvatar: otherUserInfo.avatar,
                            circleId: data.circleId,
                        });
                        setIsLoading(false);
                        return;
                    }
                } catch (threadErr: any) {
                    // Thread lookup failed - might be permission error or doesn't exist
                    // This is OK, we'll treat it as a userId below
                    console.log(`[Messages] Thread lookup failed (expected for userId):`, threadErr?.code || threadErr);
                }

                if (isExistingThread) return;

                // Not a thread - treat as userId
                console.log(`[Messages] 🔍 Treating as userId, checking for existing thread...`);

                // First verify this is a valid user
                const otherUserInfo = await fetchUserInfo(threadIdOrUserId);
                console.log(`[Messages] User info:`, otherUserInfo);

                // Check for existing thread with this user
                const existingThreadId = await findExistingThread(user.uid, threadIdOrUserId);

                if (existingThreadId) {
                    console.log(`[Messages] ✅ Found existing thread ${existingThreadId} with this user`);
                    // Found existing thread with this user
                    const existingThreadDoc = await getDoc(doc(db, "threads", existingThreadId));
                    const data = existingThreadDoc.data();
                    const threadUserInfo = data?.participantData?.[threadIdOrUserId] || otherUserInfo;

                    setResolvedThreadId(existingThreadId);
                    setIsNewConversation(false);
                    setThreadInfo({
                        otherUserId: threadIdOrUserId,
                        otherUserName: threadUserInfo.name || "مستخدم",
                        otherUserAvatar: threadUserInfo.avatar,
                        circleId: data?.circleId,
                    });
                } else {
                    console.log(`[Messages] 🆕 No existing thread - new conversation with:`, otherUserInfo.name);
                    // No existing thread - this is a new conversation
                    setResolvedThreadId(null);
                    setIsNewConversation(true);
                    setThreadInfo({
                        otherUserId: threadIdOrUserId,
                        otherUserName: otherUserInfo.name || "مستخدم",
                        otherUserAvatar: otherUserInfo.avatar,
                        circleId: undefined,
                    });
                }

                setIsLoading(false);
            } catch (err: any) {
                console.error("[Messages] ❌ Error resolving thread:", err);
                console.error("[Messages] Error code:", err?.code);
                console.error("[Messages] Error message:", err?.message);

                // More specific error messages
                if (err?.code === "permission-denied") {
                    setError("لا تملك صلاحية الوصول لهذه المحادثة");
                } else if (err?.code === "unavailable") {
                    setError("تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
                } else {
                    setError("فشل في تحميل المحادثة");
                }
                setIsLoading(false);
            }
        };

        resolveThread();
    }, [user, threadIdOrUserId]);

    // Subscribe to messages once we have a resolved thread ID
    useEffect(() => {
        if (!user || !resolvedThreadId) {
            if (!isNewConversation) {
                setMessages([]);
            }
            return;
        }

        const messagesRef = collection(db, "threads", resolvedThreadId, "messages");
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
                setError(null);
            },
            (err) => {
                console.error("[Messages] Messages subscription error:", err);
                setError("فشل في تحميل الرسائل");
            }
        );

        return () => unsubscribe();
    }, [user, resolvedThreadId, isNewConversation]);

    // Send message (handles both existing threads and new conversations)
    const sendMessage = useCallback(async (content: string): Promise<{ success: boolean; error?: string }> => {
        if (!user || !content.trim()) {
            return { success: false, error: "بيانات غير صالحة" };
        }

        const messageContent = content.trim();
        let targetThreadId = resolvedThreadId;

        try {
            // If this is a new conversation, create the thread first
            if (!targetThreadId && threadInfo?.otherUserId) {
                console.log(`[Messages] 📤 Creating new conversation with user ${threadInfo.otherUserId}`);

                const result = await createNewThread(user.uid, threadInfo.otherUserId, threadInfo.circleId);

                if (!result.success || !result.threadId) {
                    console.error("[Messages] ❌ Failed to create thread:", result.error);
                    return { success: false, error: result.error || "فشل في إنشاء المحادثة" };
                }

                targetThreadId = result.threadId;
                setResolvedThreadId(targetThreadId);
                setIsNewConversation(false);

                console.log(`[Messages] ✅ Thread created: ${targetThreadId}`);
            }

            if (!targetThreadId) {
                return { success: false, error: "لم يتم تحديد المحادثة" };
            }

            // Add the message to the thread
            console.log(`[Messages] 📝 Adding message to thread ${targetThreadId}`);
            await addDoc(collection(db, "threads", targetThreadId, "messages"), {
                senderId: user.uid,
                content: messageContent,
                type: "text",
                createdAt: serverTimestamp(),
            });

            // Update thread's lastMessage and timestamp
            await updateDoc(doc(db, "threads", targetThreadId), {
                lastMessage: messageContent.slice(0, 100),
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            console.log(`[Messages] ✅ Message sent successfully`);
            return { success: true };
        } catch (err: any) {
            console.error("[Messages] ❌ Send message error:", err);

            // Provide specific error messages
            if (err.code === "permission-denied") {
                return { success: false, error: "لا تملك صلاحية إرسال الرسائل. تحقق من إعدادات Firebase." };
            }

            return { success: false, error: err.message || "فشل في إرسال الرسالة" };
        }
    }, [user, resolvedThreadId, threadInfo]);

    // Mark as read
    const markAsRead = useCallback(async () => {
        if (!user || !resolvedThreadId) return;

        try {
            const memberRef = doc(db, "threads", resolvedThreadId, "members", user.uid);
            const memberDoc = await getDoc(memberRef);

            if (memberDoc.exists()) {
                await updateDoc(memberRef, {
                    lastReadAt: serverTimestamp(),
                });
            } else {
                await setDoc(memberRef, { lastReadAt: serverTimestamp() });
            }
        } catch (err) {
            console.error("[Messages] Mark as read error:", err);
        }
    }, [user, resolvedThreadId]);

    return {
        messages,
        threadInfo,
        isLoading,
        error,
        sendMessage,
        markAsRead,
        isNewConversation,
        resolvedThreadId,
    };
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
            const existingThreadId = await findExistingThread(user.uid, otherUserId);

            if (existingThreadId) {
                setIsCreating(false);
                return { success: true, threadId: existingThreadId };
            }

            // Create new thread
            const result = await createNewThread(user.uid, otherUserId, circleId);
            setIsCreating(false);
            return result;
        } catch (err: any) {
            console.error("[Messages] Create/Open thread error:", err);
            setIsCreating(false);
            return { success: false, error: "فشل في إنشاء المحادثة" };
        }
    };

    return { createOrOpenThread, isCreating };
}
