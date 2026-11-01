import React, { createContext, useContext, useState, useEffect } from "react";
import { legacyCopy } from "@/content/legacy-copy";

export type Language = "en" | "ar" | "tr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation objects
const translations = {
  en: {
    // Header
    "header.home": "Home",
    "header.discover": "Discover Rooms",
    "header.about": "About",
    "header.contact": "Contact",
    "header.language": "Language",
    "header.signin": "Sign In",
    "header.signup": "Sign Up",

    // Footer
    "footer.description": "Your trusted partner for premium student accommodation in Turkey.",
    "footer.quickLinks": "Quick Links",
    "footer.contactInfo": "Contact Info",
    "footer.languages": "Languages",
    "footer.rights": "© 2024 MovInn. All rights reserved.",
    "footer.madeWith": "Made with",
    "footer.inTurkey": "in Turkey",

    // Dashboard
    "dashboard.overview": "Overview",
    "dashboard.bookings": "My Bookings",
    "dashboard.payments": "Payments",
    "dashboard.profile": "Profile",
    "dashboard.totalBookings": "Total Bookings",
    "dashboard.activeBookings": "Active Bookings",
    "dashboard.totalSpent": "Total Spent",
    "dashboard.recentBookings": "Recent Bookings",
    "dashboard.latestBookings": "Your latest accommodation bookings",
    "dashboard.noBookings": "No bookings yet",
    "dashboard.allBookings": "All Bookings",
    "dashboard.viewManageBookings": "View and manage all your accommodation bookings",
    "dashboard.paymentHistory": "Payment History",
    "dashboard.trackPayments": "Track all your payments and transactions",
    "dashboard.viewInvoice": "View Invoice",
    "dashboard.print": "Print",
    "dashboard.noPayments": "No payment history found",
    "dashboard.personalInfo": "Personal Information",
    "dashboard.editProfile": "Edit Profile",
    "dashboard.changePhoto": "Change Photo",
    "dashboard.uploading": "Uploading...",
    "dashboard.saveChanges": "Save Changes",
    "dashboard.cancel": "Cancel",
    "dashboard.fullName": "Full Name",
    "dashboard.email": "Email",
    "dashboard.mobile": "Mobile",
    "dashboard.dateOfBirth": "Date of Birth",
    "dashboard.university": "University",
    "dashboard.nationality": "Nationality",
    "dashboard.address": "Address",
    "dashboard.notProvided": "Not provided",

    // Checkout
    "checkout.orderSummary": "Order Summary",
    "checkout.total": "Total:",
    "checkout.paymentMethod": "Payment Method",
    "checkout.choosePayment": "Choose your preferred payment method",
    "checkout.payAtProperty": "Pay at Property",
    "checkout.payAtPropertyDesc": "Pay when you arrive at the accommodation",
    "checkout.bankTransfer": "Bank Transfer",
    "checkout.bankTransferDesc": "Transfer directly to our bank account",
    "checkout.creditCard": "Credit Card",
    "checkout.creditCardDesc": "Pay securely with your credit card",
    "checkout.personalInfo": "Personal Information",
    "checkout.fillDetails": "Please fill in your personal details",
    "checkout.firstName": "First Name",
    "checkout.lastName": "Last Name",
    "checkout.emailAddress": "Email Address",
    "checkout.mobileNumber": "Mobile Number",
    "checkout.universityName": "University Name",
    "checkout.emergencyContact": "Emergency Contact Information",
    "checkout.emergencyContactDesc": "Please provide an emergency contact person",
    "checkout.emergencyName": "Emergency Contact Name",
    "checkout.emergencyPhone": "Emergency Contact Phone",
    "checkout.relation": "Relation",
    "checkout.continueTerms": "Continue to Terms & Conditions",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.confirm": "Confirm",
    "common.close": "Close",
  },

  ar: {
    // Header
    "header.home": "الرئيسية",
    "header.discover": "اكتشف الغرف",
    "header.about": "حولنا",
    "header.contact": "تواصل معنا",
    "header.language": "اللغة",
    "header.signin": "تسجيل الدخول",
    "header.signup": "إنشاء حساب",

    // Footer
    "footer.description": "شريكك الموثوق للإقامة الطلابية المتميزة في تركيا.",
    "footer.quickLinks": "روابط سريعة",
    "footer.contactInfo": "معلومات الاتصال",
    "footer.languages": "اللغات",
    "footer.rights": "© 2024 موفين. جميع الحقوق محفوظة.",
    "footer.madeWith": "صُنع بـ",
    "footer.inTurkey": "في تركيا",

    // Dashboard
    "dashboard.overview": "نظرة عامة",
    "dashboard.bookings": "حجوزاتي",
    "dashboard.payments": "المدفوعات",
    "dashboard.profile": "الملف الشخصي",
    "dashboard.totalBookings": "إجمالي الحجوزات",
    "dashboard.activeBookings": "الحجوزات النشطة",
    "dashboard.totalSpent": "إجمالي المبلغ المدفوع",
    "dashboard.recentBookings": "الحجوزات الأخيرة",
    "dashboard.latestBookings": "أحدث حجوزات الإقامة الخاصة بك",
    "dashboard.noBookings": "لا توجد حجوزات بعد",
    "dashboard.allBookings": "جميع الحجوزات",
    "dashboard.viewManageBookings": "عرض وإدارة جميع حجوزات الإقامة الخاصة بك",
    "dashboard.paymentHistory": "تاريخ المدفوعات",
    "dashboard.trackPayments": "تتبع جميع المدفوعات والمعاملات الخاصة بك",
    "dashboard.viewInvoice": "عرض الفاتورة",
    "dashboard.print": "طباعة",
    "dashboard.noPayments": "لم يتم العثور على تاريخ مدفوعات",
    "dashboard.personalInfo": "المعلومات الشخصية",
    "dashboard.editProfile": "تعديل الملف الشخصي",
    "dashboard.changePhoto": "تغيير الصورة",
    "dashboard.uploading": "جاري الرفع...",
    "dashboard.saveChanges": "حفظ التغييرات",
    "dashboard.cancel": "إلغاء",
    "dashboard.fullName": "الاسم الكامل",
    "dashboard.email": "البريد الإلكتروني",
    "dashboard.mobile": "الهاتف المحمول",
    "dashboard.dateOfBirth": "تاريخ الميلاد",
    "dashboard.university": "الجامعة",
    "dashboard.nationality": "الجنسية",
    "dashboard.address": "العنوان",
    "dashboard.notProvided": "غير محدد",

    // Checkout
    "checkout.orderSummary": "ملخص الطلب",
    "checkout.total": "الإجمالي:",
    "checkout.paymentMethod": "طريقة الدفع",
    "checkout.choosePayment": "اختر طريقة الدفع المفضلة لديك",
    "checkout.payAtProperty": "الدفع في العقار",
    "checkout.payAtPropertyDesc": "ادفع عند وصولك إلى السكن",
    "checkout.bankTransfer": "حوالة بنكية",
    "checkout.bankTransferDesc": "حول مباشرة إلى حسابنا البنكي",
    "checkout.creditCard": "بطاقة ائتمان",
    "checkout.creditCardDesc": "ادفع بأمان باستخدام بطاقتك الائتمانية",
    "checkout.personalInfo": "المعلومات الشخصية",
    "checkout.fillDetails": "يرجى ملء تفاصيلك الشخصية",
    "checkout.firstName": "الاسم الأول",
    "checkout.lastName": "اسم العائلة",
    "checkout.emailAddress": "عنوان البريد الإلكتروني",
    "checkout.mobileNumber": "رقم الهاتف المحمول",
    "checkout.universityName": "اسم الجامعة",
    "checkout.emergencyContact": "معلومات الاتصال في حالات الطوارئ",
    "checkout.emergencyContactDesc": "يرجى تقديم شخص للاتصال في حالات الطوارئ",
    "checkout.emergencyName": "اسم جهة الاتصال للطوارئ",
    "checkout.emergencyPhone": "هاتف جهة الاتصال للطوارئ",
    "checkout.relation": "العلاقة",
    "checkout.continueTerms": "المتابعة إلى الشروط والأحكام",

    // Common
    "common.loading": "جاري التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.confirm": "تأكيد",
    "common.close": "إغلاق",
  },
};

const turkish: Record<string, string> = {
  "header.home": "Ana sayfa",
  "header.discover": "Odaları keşfet",
  "header.about": "Hakkımızda",
  "header.contact": "İletişim",
  "header.language": "Dil",
  "header.signin": "Giriş yap",
  "header.signup": "Kayıt ol",
  "footer.quickLinks": "Hızlı bağlantılar",
  "footer.contactInfo": "İletişim",
  "footer.languages": "Diller",
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const prefix = window.location.pathname.split("/")[1];
    const saved = localStorage.getItem("language");
    return prefix === "ar" || prefix === "tr" || prefix === "en" ? prefix
      : saved === "ar" || saved === "tr" ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);

    // Update document direction and language
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return (
      legacyCopy(language, key) ??
      ((language === "tr" ? turkish[key] || translations.en[key] : translations[language][key]) ||
        key)
    );
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
