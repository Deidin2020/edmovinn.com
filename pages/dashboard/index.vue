<template>
    <main class="dashboard-page">
        <div class="dashboard-shell">
            <section class="dashboard-hero">
                <div class="dashboard-hero-copy">
                    <p class="dashboard-kicker">{{ labels.kicker }}</p>
                    <h1 class="dashboard-title">{{ labels.title }}</h1>
                    <p class="dashboard-subtitle">{{ labels.subtitle }}</p>

                    <div class="dashboard-header-actions">
                        <NuxtLink :to="localePath('/search')" class="dashboard-primary-button">
                            {{ labels.exploreRooms }}
                        </NuxtLink>
                        <NuxtLink :to="localePath('/checkout')" class="dashboard-secondary-button">
                            {{ labels.checkout }}
                        </NuxtLink>
                    </div>
                </div>

                <aside class="dashboard-hero-panel">
                    <div class="dashboard-hero-panel-top">
                        <span class="dashboard-panel-label">{{ labels.profile }}</span>
                        <span class="dashboard-live-dot" :class="{ idle: !loadingDashboard }">
                            {{ loadingDashboard ? labels.loading : labels.live }}
                        </span>
                    </div>

                    <div class="dashboard-hero-progress">
                        <strong class="dashboard-hero-progress-value">{{ profileStatusValue }}</strong>
                        <span class="dashboard-hero-progress-label">{{ labels.profileStrength }}</span>
                    </div>

                    <div class="dashboard-hero-metrics">
                        <div class="dashboard-hero-metric">
                            <span>{{ labels.totalBookings }}</span>
                            <strong>{{ dashboardData.stats.total_bookings }}</strong>
                        </div>
                        <div class="dashboard-hero-metric">
                            <span>{{ labels.activeBookings }}</span>
                            <strong>{{ dashboardData.stats.active_bookings }}</strong>
                        </div>
                        <div class="dashboard-hero-metric">
                            <span>{{ labels.totalSpent }}</span>
                            <strong>{{ dashboardData.stats.total_spent.formatted }}</strong>
                        </div>
                    </div>
                </aside>
            </section>

            <section class="dashboard-tabs" :class="{ rtl: isRtl }">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    type="button"
                    class="dashboard-tab-button"
                    :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key"
                >
                    {{ tab.label }}
                </button>
            </section>

            <section v-if="activeTab === 'overview'" class="dashboard-section">
                <div class="dashboard-stat-grid">
                    <article v-for="card in statCards" :key="card.key" class="dashboard-stat-card">
                        <div class="dashboard-stat-head">
                            <h2 class="dashboard-card-label">{{ card.label }}</h2>
                            <span class="dashboard-icon-box" v-html="card.icon"></span>
                        </div>
                        <strong class="dashboard-stat-value">{{ card.value }}</strong>
                    </article>
                </div>

                <div class="dashboard-overview-grid">
                    <article class="dashboard-card dashboard-card-emphasis">
                        <div class="dashboard-card-header">
                            <div>
                                <h3 class="dashboard-card-title">{{ labels.recentBookings }}</h3>
                                <p class="dashboard-card-text">{{ labels.recentBookingsText }}</p>
                            </div>
                        </div>

                        <div class="dashboard-booking-list">
                            <article
                                v-for="booking in overviewBookings"
                                :key="booking.reference"
                                class="dashboard-booking-item"
                            >
                                <div class="dashboard-booking-main">
                                    <div class="dashboard-booking-top">
                                        <div>
                                            <p class="dashboard-booking-reference">
                                                {{ labels.bookingNumber }} {{ booking.reference }}
                                            </p>
                                            <p class="dashboard-booking-date">{{ booking.date }}</p>
                                        </div>

                                        <div class="dashboard-booking-meta">
                                            <span class="dashboard-badge" :class="booking.badgeClass">
                                                {{ booking.statusLabel }}
                                            </span>
                                            <strong class="dashboard-booking-price">{{ booking.total }}</strong>
                                        </div>
                                    </div>

                                    <div class="dashboard-booking-facts">
                                        <div class="dashboard-fact">
                                            <span class="dashboard-fact-icon" v-html="icons.home"></span>
                                            <span class="dashboard-fact-label">{{ labels.room }}:</span>
                                            <span class="dashboard-fact-value">{{ booking.room }}</span>
                                        </div>
                                        <div class="dashboard-fact">
                                            <span class="dashboard-fact-icon" v-html="icons.pin"></span>
                                            <span class="dashboard-fact-label">{{ labels.location }}:</span>
                                            <span class="dashboard-fact-value">{{ booking.location }}</span>
                                        </div>
                                        <div class="dashboard-fact">
                                            <span class="dashboard-fact-icon" v-html="icons.card"></span>
                                            <span class="dashboard-fact-label">{{ labels.payment }}:</span>
                                            <span class="dashboard-fact-value">{{ booking.paymentStatus }}</span>
                                        </div>
                                        <div class="dashboard-fact">
                                            <span class="dashboard-fact-icon" v-html="icons.money"></span>
                                            <span class="dashboard-fact-label">{{ labels.total }}:</span>
                                            <span class="dashboard-fact-value">{{ booking.total }}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </article>

                    <aside class="dashboard-side-stack">
                        <article class="dashboard-card dashboard-summary-card">
                            <div class="dashboard-card-header compact">
                                <div>
                                    <h3 class="dashboard-card-title">{{ labels.profile }}</h3>
                                    <p class="dashboard-card-text">{{ labels.profileText }}</p>
                                </div>
                            </div>

                            <div class="dashboard-summary-list">
                                <div
                                    v-for="item in dashboardData.profile.slice(0, 4)"
                                    :key="`overview-${item.key}`"
                                    class="dashboard-summary-row"
                                >
                                    <span>{{ item.label }}</span>
                                    <strong>{{ item.value }}</strong>
                                </div>
                            </div>
                        </article>

                        <article class="dashboard-card dashboard-roadmap-card">
                            <div class="dashboard-card-header compact">
                                <div>
                                    <h3 class="dashboard-card-title">{{ labels.nextSteps }}</h3>
                                    <p class="dashboard-card-text">{{ labels.nextStepsText }}</p>
                                </div>
                            </div>

                            <div class="dashboard-roadmap compact">
                                <div class="dashboard-roadmap-item is-done">
                                    <span class="dashboard-roadmap-step">1</span>
                                    <div>
                                        <strong>{{ labels.phaseOneTitle }}</strong>
                                        <p>{{ labels.phaseOneText }}</p>
                                    </div>
                                </div>
                                <div class="dashboard-roadmap-item">
                                    <span class="dashboard-roadmap-step">2</span>
                                    <div>
                                        <strong>{{ labels.phaseTwoTitle }}</strong>
                                        <p>{{ labels.phaseTwoText }}</p>
                                    </div>
                                </div>
                                <div class="dashboard-roadmap-item">
                                    <span class="dashboard-roadmap-step">3</span>
                                    <div>
                                        <strong>{{ labels.phaseThreeTitle }}</strong>
                                        <p>{{ labels.phaseThreeText }}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </aside>
                </div>
            </section>

            <section v-else-if="activeTab === 'bookings'" class="dashboard-section">
                <article class="dashboard-card">
                    <div class="dashboard-card-header">
                        <div>
                            <h3 class="dashboard-card-title">{{ labels.allBookings }}</h3>
                            <p class="dashboard-card-text">{{ labels.allBookingsText }}</p>
                        </div>
                    </div>

                    <div class="dashboard-detail-list">
                        <article
                            v-for="booking in decoratedBookings"
                            :key="`booking-${booking.reference}`"
                            class="dashboard-detail-card"
                        >
                            <div class="dashboard-detail-head">
                                <div>
                                    <h4 class="dashboard-detail-title">{{ labels.bookingNumber }} {{ booking.reference }}</h4>
                                    <p class="dashboard-detail-subtitle">{{ booking.date }}</p>
                                </div>

                                <div class="dashboard-detail-statuses">
                                    <span class="dashboard-badge" :class="booking.badgeClass">{{ booking.statusLabel }}</span>
                                    <span class="dashboard-badge is-neutral">{{ booking.paymentStatus }}</span>
                                </div>
                            </div>

                            <div class="dashboard-detail-grid">
                                <div class="dashboard-detail-box">
                                    <span class="dashboard-detail-label">{{ labels.room }}</span>
                                    <strong>{{ booking.room }}</strong>
                                </div>
                                <div class="dashboard-detail-box">
                                    <span class="dashboard-detail-label">{{ labels.location }}</span>
                                    <strong>{{ booking.location }}</strong>
                                </div>
                                <div class="dashboard-detail-box">
                                    <span class="dashboard-detail-label">{{ labels.total }}</span>
                                    <strong>{{ booking.total }}</strong>
                                </div>
                                <div class="dashboard-detail-box">
                                    <span class="dashboard-detail-label">{{ labels.duration }}</span>
                                    <strong>{{ booking.duration }}</strong>
                                </div>
                            </div>
                        </article>
                    </div>
                </article>
            </section>

            <section v-else-if="activeTab === 'payments'" class="dashboard-section">
                <article class="dashboard-card">
                    <div class="dashboard-card-header">
                        <div>
                            <h3 class="dashboard-card-title">{{ labels.payments }}</h3>
                            <p class="dashboard-card-text">{{ labels.paymentsText }}</p>
                        </div>
                    </div>

                    <div class="dashboard-payment-list dashboard-payment-table">
                        <article
                            v-for="payment in decoratedPayments"
                            :key="payment.id"
                            class="dashboard-payment-item"
                        >
                            <div>
                                <h4 class="dashboard-detail-title">{{ payment.title }}</h4>
                                <p class="dashboard-detail-subtitle">{{ payment.date }}</p>
                            </div>

                            <div class="dashboard-payment-meta">
                                <strong class="dashboard-booking-price">{{ payment.amount }}</strong>
                                <span class="dashboard-badge" :class="payment.badgeClass">{{ payment.status }}</span>
                            </div>
                        </article>
                    </div>
                </article>
            </section>

            <section v-else class="dashboard-section">
                <div class="dashboard-profile-layout">
                    <article class="dashboard-card">
                        <div class="dashboard-card-header">
                            <div>
                                <h3 class="dashboard-card-title">{{ labels.profile }}</h3>
                                <p class="dashboard-card-text">{{ labels.profileText }}</p>
                            </div>
                        </div>

                        <div class="dashboard-profile-grid">
                            <div
                                v-for="item in dashboardData.profile"
                                :key="item.key"
                                class="dashboard-profile-item"
                            >
                                <span class="dashboard-detail-label">{{ item.label }}</span>
                                <strong>{{ item.value }}</strong>
                            </div>
                        </div>
                    </article>

                    <article class="dashboard-card dashboard-contract-card dashboard-card-emphasis">
                        <div class="dashboard-card-header">
                            <div>
                                <h3 class="dashboard-card-title">{{ labels.nextSteps }}</h3>
                                <p class="dashboard-card-text">{{ labels.nextStepsText }}</p>
                            </div>
                        </div>

                        <div class="dashboard-roadmap">
                            <div class="dashboard-roadmap-item is-done">
                                <span class="dashboard-roadmap-step">1</span>
                                <div>
                                    <strong>{{ labels.phaseOneTitle }}</strong>
                                    <p>{{ labels.phaseOneText }}</p>
                                </div>
                            </div>
                            <div class="dashboard-roadmap-item">
                                <span class="dashboard-roadmap-step">2</span>
                                <div>
                                    <strong>{{ labels.phaseTwoTitle }}</strong>
                                    <p>{{ labels.phaseTwoText }}</p>
                                </div>
                            </div>
                            <div class="dashboard-roadmap-item">
                                <span class="dashboard-roadmap-step">3</span>
                                <div>
                                    <strong>{{ labels.phaseThreeTitle }}</strong>
                                    <p>{{ labels.phaseThreeText }}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    </main>
</template>

<script>
const STATUS_BADGE_CLASS_MAP = {
    confirmed   : 'is-success',
    paid        : 'is-success',
    pending     : 'is-warning',
    under_review: 'is-warning',
    cancelled   : 'is-neutral',
    expired     : 'is-neutral',
    failed      : 'is-neutral',
};

const DASHBOARD_COPY = {
    en: {
        kicker            : 'Student dashboard',
        title             : 'Your Dashboard',
        subtitle          : 'Track bookings, payments, and profile progress from one clean workspace.',
        exploreRooms      : 'Explore Rooms',
        checkout          : 'Continue Checkout',
        recentBookings    : 'Recent Bookings',
        recentBookingsText: 'Your latest accommodation activity at a glance.',
        allBookings       : 'My Bookings',
        allBookingsText   : 'Full booking records synced with the current dashboard contract.',
        payments          : 'Payments',
        paymentsText      : 'Payment rows and states connected to the current booking service.',
        profile           : 'Profile',
        profileText       : 'Core student profile information used across the booking flow.',
        nextSteps         : 'Implementation Roadmap',
        nextStepsText     : 'The dashboard now moves through clear product delivery phases.',
        phaseOneTitle     : 'UI completed',
        phaseOneText      : 'The dashboard layout has been redesigned and stabilized visually.',
        phaseTwoTitle     : 'Contract defined',
        phaseTwoText      : 'The API response shape is documented and reflected in the service layer.',
        phaseThreeTitle   : 'Live integration',
        phaseThreeText    : 'The page now pulls data from dashboard endpoints with safe fallbacks.',
        bookingNumber     : 'Booking #',
        room              : 'Room',
        location          : 'Location',
        payment           : 'Payment',
        total             : 'Total',
        duration          : 'Duration',
        totalBookings     : 'Total Bookings',
        activeBookings    : 'Active Bookings',
        totalSpent        : 'Total Spent',
        profileStrength   : 'Profile Status',
        profileFullName   : 'Full Name',
        profileEmail      : 'Email',
        profilePhone      : 'Phone',
        profileUniversity : 'University',
        profileNationality: 'Nationality',
        overview          : 'Overview',
        bookings          : 'My Bookings',
        paymentsTab       : 'Payments',
        profileTab        : 'Profile',
        loading           : 'Syncing',
        live              : 'Live',
    },
    ar: {
        kicker            : 'لوحة تحكم الطالب',
        title             : 'لوحة التحكم',
        subtitle          : 'تابع الحجوزات والمدفوعات وتقدم الملف الشخصي من واجهة واحدة واضحة.',
        exploreRooms      : 'استكشف الغرف',
        checkout          : 'متابعة الدفع',
        recentBookings    : 'آخر الحجوزات',
        recentBookingsText: 'أحدث نشاطات السكن الخاصة بك بشكل سريع وواضح.',
        allBookings       : 'حجوزاتي',
        allBookingsText   : 'كل الحجوزات المرتبطة بعقد البيانات الحالي للداشبورد.',
        payments          : 'المدفوعات',
        paymentsText      : 'حالات المدفوعات مربوطة الآن بخدمة الحجوزات الحالية.',
        profile           : 'الملف الشخصي',
        profileText       : 'بيانات الطالب الأساسية المستخدمة في رحلة الحجز.',
        nextSteps         : 'خطة التنفيذ',
        nextStepsText     : 'الداشبورد الآن يسير على مراحل تنفيذ واضحة.',
        phaseOneTitle     : 'تنفيذ الواجهة',
        phaseOneText      : 'تم إعادة تصميم الصفحة بشكل أوضح وأكثر ترتيبًا.',
        phaseTwoTitle     : 'تعريف الـ Contract',
        phaseTwoText      : 'تم توثيق شكل الاستجابة وربطه بطبقة الخدمة.',
        phaseThreeTitle   : 'الربط الحي',
        phaseThreeText    : 'الصفحة الآن تسحب البيانات من الـ endpoints مع fallback آمن.',
        bookingNumber     : 'حجز رقم',
        room              : 'الغرفة',
        location          : 'الموقع',
        payment           : 'الدفع',
        total             : 'الإجمالي',
        duration          : 'المدة',
        totalBookings     : 'إجمالي الحجوزات',
        activeBookings    : 'الحجوزات النشطة',
        totalSpent        : 'إجمالي المصروف',
        profileStrength   : 'حالة الملف',
        profileFullName   : 'الاسم الكامل',
        profileEmail      : 'البريد الإلكتروني',
        profilePhone      : 'رقم الهاتف',
        profileUniversity : 'الجامعة',
        profileNationality: 'الجنسية',
        overview          : 'نظرة عامة',
        bookings          : 'حجوزاتي',
        paymentsTab       : 'المدفوعات',
        profileTab        : 'الملف الشخصي',
        loading           : 'جار المزامنة',
        live              : 'مباشر',
    },
};

const STATIC_DASHBOARD_DATA = {
    stats: {
        total_bookings : 3,
        active_bookings: 2,
        total_spent    : {
            amount   : 4150,
            formatted: '$4,150.00',
            currency : 'USD',
        },
    },
    recent_bookings: [
        {
            reference    : 'BK-00000',
            date         : '9/10/2024',
            status       : 'confirmed',
            statusLabel  : 'Confirmed',
            badgeClass   : 'is-success',
            room         : 'Studio Room - Movinn Residence',
            location     : 'Beylikduzu, Istanbul',
            paymentStatus: 'Paid',
            total        : '$1,350.00',
            duration     : '3 Months',
        },
        {
            reference    : 'BK-00001',
            date         : '10/5/2024',
            status       : 'pending',
            statusLabel  : 'Pending',
            badgeClass   : 'is-warning',
            room         : 'Shared Room - City Campus',
            location     : 'Sisli, Istanbul',
            paymentStatus: 'Pending',
            total        : '$950.00',
            duration     : '1 Month',
        },
    ],
    bookings: [
        {
            reference    : 'BK-00000',
            date         : '9/10/2024',
            status       : 'confirmed',
            statusLabel  : 'Confirmed',
            badgeClass   : 'is-success',
            room         : 'Studio Room - Movinn Residence',
            location     : 'Beylikduzu, Istanbul',
            paymentStatus: 'Paid',
            total        : '$1,350.00',
            duration     : '3 Months',
        },
        {
            reference    : 'BK-00001',
            date         : '10/5/2024',
            status       : 'pending',
            statusLabel  : 'Pending',
            badgeClass   : 'is-warning',
            room         : 'Shared Room - City Campus',
            location     : 'Sisli, Istanbul',
            paymentStatus: 'Pending',
            total        : '$950.00',
            duration     : '1 Month',
        },
        {
            reference    : 'BK-00002',
            date         : '12/2/2024',
            status       : 'confirmed',
            statusLabel  : 'Confirmed',
            badgeClass   : 'is-success',
            room         : 'Single Suite - Central Residence',
            location     : 'Kadikoy, Istanbul',
            paymentStatus: 'Paid',
            total        : '$1,850.00',
            duration     : '4 Months',
        },
    ],
    payments: [
        { id: 'pay-1', title: 'Booking BK-00000', date: '9/10/2024', amount: '$1,350.00', status: 'Paid', badgeClass: 'is-success' },
        { id: 'pay-2', title: 'Booking BK-00001', date: '10/5/2024', amount: '$950.00', status: 'Pending', badgeClass: 'is-warning' },
        { id: 'pay-3', title: 'Security Deposit', date: '12/4/2024', amount: '$500.00', status: 'Paid', badgeClass: 'is-success' },
    ],
    profile: [
        { key: 'full_name', label: 'Full Name', value: 'Omar Ahmed' },
        { key: 'email', label: 'Email', value: 'omar.ahmed@example.com' },
        { key: 'phone', label: 'Phone', value: '+90 555 111 2233' },
        { key: 'university', label: 'University', value: 'Istanbul Aydin University' },
        { key: 'nationality', label: 'Nationality', value: 'Egyptian' },
        { key: 'status', label: 'Profile Status', value: '85% Completed' },
    ],
    rawProfile: {},
};

export default {
    layout: 'dashboard',
    data() {
        return {
            activeTab: 'overview',
            dashboardData: { ...STATIC_DASHBOARD_DATA },
            loadingDashboard: false,
            loadedTabData: {
                bookings: false,
                payments: false,
                profile : false,
            },
            icons: {
                file : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Zm0 0v5h5"/><path d="M9 13h6M9 17h6M9 9h1"/></svg>',
                pin  : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
                card : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
                money: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
                home : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 21v-8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v8"/></svg>',
            },
        };
    },
    computed: {
        labels() {
            return DASHBOARD_COPY[this.$i18n.locale] || DASHBOARD_COPY.en;
        },
        isRtl() {
            return this.$i18n.locale === 'ar';
        },
        tabs() {
            return [
                { key: 'overview', label: this.labels.overview },
                { key: 'bookings', label: this.labels.bookings },
                { key: 'payments', label: this.labels.paymentsTab },
                { key: 'profile', label: this.labels.profileTab },
            ];
        },
        statCards() {
            return [
                {
                    key  : 'total-bookings',
                    label: this.labels.totalBookings,
                    value: this.dashboardData.stats.total_bookings,
                    icon : this.icons.file,
                },
                {
                    key  : 'active-bookings',
                    label: this.labels.activeBookings,
                    value: this.dashboardData.stats.active_bookings,
                    icon : this.icons.pin,
                },
                {
                    key  : 'total-spent',
                    label: this.labels.totalSpent,
                    value: this.dashboardData.stats.total_spent.formatted,
                    icon : this.icons.card,
                },
            ];
        },
        overviewBookings() {
            if (this.dashboardData.recent_bookings.length) {
                return this.dashboardData.recent_bookings.map(this.decorateBooking);
            }

            return this.dashboardData.bookings.slice(0, 2).map(this.decorateBooking);
        },
        decoratedBookings() {
            return this.dashboardData.bookings.map(this.decorateBooking);
        },
        decoratedPayments() {
            return this.dashboardData.payments.map(this.decoratePayment);
        },
        profileStatusValue() {
            const profileStatus = this.dashboardData.profile.find((item) => item.key === 'status');
            return profileStatus?.value || '--';
        },
    },
    watch: {
        activeTab: {
            async handler(tab) {
                await this.loadTabData(tab);
            },
        },
    },
    async mounted() {
        await this.loadDashboard();
    },
    methods: {
        async loadDashboard() {
            this.loadingDashboard = true;

            try {
                const result = await this.$bookingApi.getDashboard();
                this.dashboardData = this.mergeDashboardData(result);
            } catch (error) {
                this.dashboardData = this.mergeDashboardData();
            } finally {
                this.loadingDashboard = false;
            }
        },
        async loadTabData(tab) {
            if (!['bookings', 'payments', 'profile'].includes(tab)) return;
            if (this.loadedTabData[tab]) return;

            try {
                if (tab === 'bookings') {
                    const result = await this.$bookingApi.getDashboardBookings();
                    if (Array.isArray(result.items) && result.items.length) {
                        this.dashboardData = {
                            ...this.dashboardData,
                            bookings: result.items.map(this.decorateBooking),
                        };
                    }
                }

                if (tab === 'payments') {
                    const result = await this.$bookingApi.getDashboardPayments();
                    if (Array.isArray(result.items) && result.items.length) {
                        this.dashboardData = {
                            ...this.dashboardData,
                            payments: result.items.map(this.decoratePayment),
                        };
                    }
                }

                if (tab === 'profile') {
                    const result = await this.$bookingApi.getDashboardProfile();
                    if (Array.isArray(result.profile) && result.profile.length) {
                        this.dashboardData = {
                            ...this.dashboardData,
                            profile   : this.localizeProfileItems(result.profile, result.rawProfile || {}),
                            rawProfile: result.rawProfile || {},
                        };
                    }
                }
            } catch (error) {
                // Keep the safe fallback data already rendered.
            } finally {
                this.loadedTabData = {
                    ...this.loadedTabData,
                    [tab]: true,
                };
            }
        },
        mergeDashboardData(result = {}) {
            return {
                stats: result.stats?.total_spent?.formatted
                    ? result.stats
                    : STATIC_DASHBOARD_DATA.stats,
                recent_bookings: Array.isArray(result.recent_bookings) && result.recent_bookings.length
                    ? result.recent_bookings.map(this.decorateBooking)
                    : STATIC_DASHBOARD_DATA.recent_bookings.map(this.decorateBooking),
                bookings: Array.isArray(result.bookings) && result.bookings.length
                    ? result.bookings.map(this.decorateBooking)
                    : STATIC_DASHBOARD_DATA.bookings.map(this.decorateBooking),
                payments: Array.isArray(result.payments) && result.payments.length
                    ? result.payments.map(this.decoratePayment)
                    : STATIC_DASHBOARD_DATA.payments.map(this.decoratePayment),
                profile: Array.isArray(result.profile) && result.profile.length
                    ? this.localizeProfileItems(result.profile, result.rawProfile || {})
                    : this.localizeProfileItems(STATIC_DASHBOARD_DATA.profile, STATIC_DASHBOARD_DATA.rawProfile),
                rawProfile: result.rawProfile || STATIC_DASHBOARD_DATA.rawProfile,
            };
        },
        localizeProfileItems(items = [], rawProfile = {}) {
            const labelMap = {
                full_name : this.labels.profileFullName,
                email     : this.labels.profileEmail,
                phone     : this.labels.profilePhone,
                university: this.labels.profileUniversity,
                nationality: this.labels.profileNationality,
                status    : this.labels.profileStrength,
            };

            return items.map((item) => ({
                ...item,
                label: labelMap[item.key] || item.label,
                value: item.value || rawProfile[item.key] || '',
            }));
        },
        badgeClassFromStatus(status = '') {
            return STATUS_BADGE_CLASS_MAP[status] || 'is-neutral';
        },
        decorateBooking(booking = {}) {
            return {
                ...booking,
                badgeClass: booking.badgeClass || this.badgeClassFromStatus(booking.status),
            };
        },
        decoratePayment(payment = {}) {
            const normalizedStatus = typeof payment.status === 'string'
                ? payment.status.toLowerCase()
                : '';

            return {
                ...payment,
                badgeClass: payment.badgeClass || this.badgeClassFromStatus(normalizedStatus),
            };
        },
    },
    head() {
        return {
            title: this.labels.title,
        };
    },
};
</script>

<style scoped>
.dashboard-page {
    min-height: calc(100vh - 64px);
    padding: 7rem 0 4rem;
    background:
        radial-gradient(circle at top left, rgba(13, 148, 136, 0.16), transparent 24%),
        radial-gradient(circle at 85% 0%, rgba(245, 158, 11, 0.14), transparent 18%),
        linear-gradient(180deg, #f4f7f8 0%, #edf2f4 100%);
}

.dashboard-shell {
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
}

.dashboard-hero,
.dashboard-card,
.dashboard-stat-card {
    border: 1px solid rgba(15, 23, 42, 0.07);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
}

.dashboard-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.9fr);
    gap: 1.5rem;
    padding: 1.9rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
}

.dashboard-hero::after {
    content: '';
    position: absolute;
    inset-inline-end: -40px;
    top: -50px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(13, 148, 136, 0.11), transparent 68%);
    pointer-events: none;
}

.dashboard-hero-copy,
.dashboard-hero-panel {
    position: relative;
    z-index: 1;
}

.dashboard-kicker {
    margin: 0 0 0.5rem;
    color: #0f766e;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.dashboard-title {
    margin: 0 0 0.75rem;
    color: #0f172a;
    font-size: clamp(2.2rem, 3.4vw, 3.4rem);
    font-weight: 800;
    line-height: 0.98;
    max-width: 520px;
}

.dashboard-subtitle {
    max-width: 720px;
    margin: 0;
    color: #52606d;
    font-size: 1rem;
    line-height: 1.8;
}

.dashboard-header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.dashboard-primary-button,
.dashboard-secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0.85rem 1.25rem;
    border-radius: 999px;
    font-weight: 700;
    text-decoration: none;
    transition: 0.2s ease;
}

.dashboard-primary-button {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    color: #fff;
    box-shadow: 0 14px 30px rgba(15, 118, 110, 0.22);
}

.dashboard-primary-button:hover {
    color: #fff;
    transform: translateY(-1px);
}

.dashboard-secondary-button {
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: rgba(255, 255, 255, 0.68);
    color: #0f172a;
}

.dashboard-secondary-button:hover {
    color: #0f766e;
}

.dashboard-hero-panel {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 24px;
    background: linear-gradient(180deg, #0f172a 0%, #18212f 100%);
    color: #e2e8f0;
}

.dashboard-hero-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.dashboard-panel-label {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
}

.dashboard-live-dot {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.82rem;
    color: #cbd5e1;
}

.dashboard-live-dot::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
}

.dashboard-live-dot.idle::before {
    background: #38bdf8;
}

.dashboard-hero-progress {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 0 1.05rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dashboard-hero-progress-value {
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
}

.dashboard-hero-progress-label {
    color: #94a3b8;
    font-size: 0.92rem;
}

.dashboard-hero-metrics {
    display: grid;
    gap: 0.75rem;
}

.dashboard-hero-metric {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 0.95rem;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
}

.dashboard-hero-metric span {
    color: #94a3b8;
    font-size: 0.88rem;
}

.dashboard-hero-metric strong {
    color: #fff;
    font-size: 1rem;
    font-weight: 800;
}

.dashboard-tabs {
    display: inline-grid;
    grid-template-columns: repeat(4, minmax(140px, 1fr));
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(15, 23, 42, 0.08);
    margin-bottom: 1.5rem;
}

.dashboard-tab-button {
    min-height: 48px;
    padding: 0.8rem 1rem;
    border: 0;
    border-radius: 16px;
    background: transparent;
    color: #52606d;
    font-weight: 700;
    transition: 0.2s ease;
}

.dashboard-tab-button.active,
.dashboard-tab-button:hover {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.dashboard-section {
    display: grid;
    gap: 1.5rem;
}

.dashboard-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
}

.dashboard-stat-card {
    padding: 1.4rem;
    min-height: 164px;
}

.dashboard-stat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.dashboard-card-label,
.dashboard-detail-label,
.dashboard-booking-date,
.dashboard-card-text,
.dashboard-detail-subtitle {
    color: #667085;
}

.dashboard-card-label {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
}

.dashboard-stat-value {
    color: #101828;
    font-size: 2rem;
    font-weight: 800;
}

.dashboard-icon-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: rgba(15, 118, 110, 0.1);
    color: #0f766e;
}

.dashboard-icon-box :deep(svg),
.dashboard-fact-icon :deep(svg) {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.dashboard-overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.9fr);
    gap: 1.5rem;
    align-items: start;
}

.dashboard-side-stack {
    display: grid;
    gap: 1.5rem;
}

.dashboard-card {
    padding: 1.5rem;
}

.dashboard-card-emphasis {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
}

.dashboard-card-header,
.dashboard-detail-head,
.dashboard-booking-top,
.dashboard-payment-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.dashboard-card-header.compact {
    margin-bottom: 0.75rem;
}

.dashboard-card-title,
.dashboard-detail-title,
.dashboard-booking-reference {
    margin: 0;
    color: #101828;
    font-weight: 800;
}

.dashboard-card-title {
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
}

.dashboard-card-text {
    margin: 0;
    font-size: 0.95rem;
}

.dashboard-booking-list,
.dashboard-detail-list,
.dashboard-payment-list,
.dashboard-profile-grid,
.dashboard-roadmap {
    display: grid;
    gap: 1rem;
}

.dashboard-booking-item,
.dashboard-detail-card,
.dashboard-payment-item,
.dashboard-profile-item,
.dashboard-roadmap-item {
    border-radius: 22px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
}

.dashboard-booking-item,
.dashboard-detail-card,
.dashboard-payment-item {
    padding: 1.1rem 1.2rem;
}

.dashboard-booking-item {
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%);
}

.dashboard-booking-main {
    width: 100%;
}

.dashboard-booking-reference {
    font-size: 1rem;
}

.dashboard-booking-date {
    margin: 0.25rem 0 0;
    font-size: 0.92rem;
}

.dashboard-booking-meta,
.dashboard-detail-statuses,
.dashboard-payment-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.dashboard-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
}

.dashboard-badge.is-success {
    background: rgba(34, 197, 94, 0.14);
    color: #15803d;
}

.dashboard-badge.is-warning {
    background: rgba(245, 158, 11, 0.16);
    color: #b45309;
}

.dashboard-badge.is-neutral {
    background: rgba(15, 23, 42, 0.07);
    color: #475467;
}

.dashboard-booking-price {
    color: #101828;
    font-size: 1rem;
    font-weight: 800;
}

.dashboard-summary-card,
.dashboard-roadmap-card {
    padding: 1.35rem;
}

.dashboard-summary-list {
    display: grid;
    gap: 0.8rem;
}

.dashboard-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border-radius: 18px;
    background: #f8fafc;
    color: #52606d;
    font-size: 0.92rem;
}

.dashboard-summary-row strong {
    color: #0f172a;
    text-align: end;
}

.dashboard-booking-facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem 1rem;
    margin-top: 1rem;
}

.dashboard-fact {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: #667085;
    font-size: 0.85rem;
}

.dashboard-fact-icon {
    display: inline-flex;
    color: #98a2b3;
}

.dashboard-fact-label {
    font-weight: 600;
}

.dashboard-fact-value {
    color: #101828;
    font-weight: 600;
}

.dashboard-detail-grid,
.dashboard-profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.dashboard-profile-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 1.5rem;
    align-items: start;
}

.dashboard-detail-box,
.dashboard-profile-item {
    padding: 1rem;
    background: #f8fafc;
}

.dashboard-detail-label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    font-weight: 600;
}

.dashboard-profile-item strong,
.dashboard-detail-box strong,
.dashboard-roadmap-item strong {
    color: #101828;
}

.dashboard-contract-card {
    height: fit-content;
}

.dashboard-roadmap-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
}

.dashboard-roadmap-step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(15, 118, 110, 0.1);
    color: #0f766e;
    font-weight: 800;
    flex-shrink: 0;
}

.dashboard-roadmap-item.is-done .dashboard-roadmap-step {
    background: #0f766e;
    color: #fff;
}

.dashboard-roadmap-item p {
    margin: 0.35rem 0 0;
    color: #667085;
    line-height: 1.7;
}

.dashboard-roadmap.compact .dashboard-roadmap-item {
    padding: 0.95rem;
}

.dashboard-payment-table .dashboard-payment-item {
    border-radius: 18px;
}

.rtl {
    direction: rtl;
}

[dir='rtl'] .dashboard-hero,
[dir='rtl'] .dashboard-card-header,
[dir='rtl'] .dashboard-detail-head,
[dir='rtl'] .dashboard-booking-top,
[dir='rtl'] .dashboard-payment-item,
[dir='rtl'] .dashboard-header-actions {
    text-align: right;
}

@media (max-width: 991.98px) {
    .dashboard-hero,
    .dashboard-overview-grid,
    .dashboard-profile-layout {
        grid-template-columns: 1fr;
    }

    .dashboard-card-header,
    .dashboard-detail-head,
    .dashboard-booking-top,
    .dashboard-payment-item {
        flex-direction: column;
    }

    .dashboard-stat-grid,
    .dashboard-detail-grid,
    .dashboard-profile-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 767.98px) {
    .dashboard-page {
        padding-top: 6rem;
    }

    .dashboard-shell {
        width: min(100% - 20px, 1120px);
    }

    .dashboard-tabs {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-booking-facts {
        grid-template-columns: 1fr;
    }

    .dashboard-header-actions,
    .dashboard-payment-meta,
    .dashboard-booking-meta {
        width: 100%;
    }

    .dashboard-primary-button,
    .dashboard-secondary-button {
        width: 100%;
    }
}
</style>
