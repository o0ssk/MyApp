// Firebase Auth error codes mapped to Arabic user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
    // Phone Auth errors
    "auth/invalid-phone-number": "رقم الهاتف غير صحيح. تأكد من إدخال الرقم بشكل صحيح.",
    "auth/too-many-requests": "تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً.",
    "auth/quota-exceeded": "تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً.",
    "auth/invalid-verification-code": "رمز التحقق غير صحيح. يرجى التحقق وإعادة المحاولة.",
    "auth/code-expired": "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.",
    "auth/missing-verification-code": "يرجى إدخال رمز التحقق.",
    "auth/invalid-verification-id": "حدث خطأ في التحقق. يرجى طلب رمز جديد.",

    // Email/Password errors
    "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل.",
    "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
    "auth/user-disabled": "تم تعطيل هذا الحساب.",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/weak-password": "كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.",
    "auth/invalid-credential": "بيانات الدخول غير صحيحة.",

    // Google Sign-In errors
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.",
    "auth/popup-blocked": "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة.",
    "auth/cancelled-popup-request": "تم إلغاء طلب تسجيل الدخول.",
    "auth/account-exists-with-different-credential": "يوجد حساب بنفس البريد الإلكتروني باستخدام طريقة دخول مختلفة.",

    // Network errors
    "auth/network-request-failed": "فشل الاتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.",
    "auth/timeout": "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",

    // reCAPTCHA errors
    "auth/captcha-check-failed": "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى.",
    "auth/missing-client-identifier": "يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.",

    // General errors
    "auth/internal-error": "حدث خطأ داخلي. يرجى المحاولة لاحقاً.",
    "auth/operation-not-allowed": "هذه العملية غير مسموح بها حالياً.",

    // Default
    "default": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
};

export function getAuthErrorMessage(errorCode: string): string {
    return AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES["default"];
}
