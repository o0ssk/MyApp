"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

interface ComposerProps {
    onSend: (content: string) => Promise<{ success: boolean; error?: string }>;
    disabled?: boolean;
}

export function Composer({ onSend, disabled = false }: ComposerProps) {
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
        }
    }, [content]);

    const handleSend = async () => {
        if (!content.trim() || isSending || disabled) return;

        setIsSending(true);
        const result = await onSend(content);
        setIsSending(false);

        if (result.success) {
            setContent("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = content.trim().length > 0 && !isSending && !disabled;

    return (
        <div className="flex items-end gap-2 p-4 bg-surface border-t border-border">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                rows={1}
                disabled={disabled}
                className="flex-1 px-4 py-3 bg-sand border border-border rounded-2xl text-text resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 placeholder:text-text-muted disabled:opacity-50"
                style={{ maxHeight: 120 }}
                aria-label="رسالة جديدة"
            />
            <motion.button
                whileHover={{ scale: canSend ? 1.05 : 1 }}
                whileTap={{ scale: canSend ? 0.95 : 1 }}
                onClick={handleSend}
                disabled={!canSend}
                className={`p-3 rounded-xl transition-colors ${canSend
                        ? "bg-gold text-white hover:bg-gold/90"
                        : "bg-sand text-text-muted cursor-not-allowed"
                    }`}
                aria-label="إرسال الرسالة"
            >
                {isSending ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <Send size={20} className="rotate-180" />
                )}
            </motion.button>
        </div>
    );
}
