import { Log } from "@/lib/hooks/useLogs";

/**
 * Export logs to CSV file with UTF-8 BOM for Arabic support
 */
export function exportLogsToCSV(logs: Log[], filename?: string) {
    // CSV headers in Arabic
    const headers = [
        "التاريخ",
        "النوع",
        "المقدار",
        "الحالة",
        "ملاحظات الطالب",
        "ملاحظات الشيخ",
        "تاريخ الإنشاء",
    ];

    // Type and status translations
    const typeLabels: Record<string, string> = {
        memorization: "حفظ",
        revision: "مراجعة",
    };

    const statusLabels: Record<string, string> = {
        pending_approval: "بانتظار الاعتماد",
        approved: "معتمد",
        rejected: "مرفوض",
    };

    // Build CSV rows
    const rows = logs.map((log) => {
        const amount = log.amount.pages
            ? `${log.amount.pages} صفحة`
            : `${log.amount.surah} (${log.amount.ayahFrom}-${log.amount.ayahTo})`;

        return [
            log.date,
            typeLabels[log.type] || log.type,
            amount,
            statusLabels[log.status] || log.status,
            log.studentNotes || "",
            log.teacherNotes || "",
            log.createdAt.toLocaleDateString("ar-SA"),
        ];
    });

    // Convert to CSV string
    const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");

    // Add UTF-8 BOM for Arabic support
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    // Generate filename
    const now = new Date();
    const defaultFilename = `halqati-logs-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.csv`;

    // Download file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
