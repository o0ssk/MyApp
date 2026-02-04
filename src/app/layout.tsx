import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/hooks";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "حلقتي | منصة حلقات القرآن الكريم",
    description: "منصتكم المتكاملة لإدارة حلقات تحفيظ القرآن الكريم. تتبع الحفظ، إدارة الطلاب، والتواصل الفعال بين الشيخ والطلاب.",
    keywords: ["حلقات", "قرآن", "تحفيظ", "حلقتي", "إسلام", "تعليم"],
    authors: [{ name: "Halqati Team" }],
    openGraph: {
        title: "حلقتي | منصة حلقات القرآن الكريم",
        description: "منصتكم المتكاملة لإدارة حلقات تحفيظ القرآن الكريم",
        type: "website",
        locale: "ar_SA",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className="font-tajawal bg-background text-foreground antialiased transition-colors duration-300">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange={false}
                >
                    <AuthProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
