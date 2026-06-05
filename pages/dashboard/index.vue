<template>
  <main class="dashboard-page" dir="ltr">
    <div class="shell">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          type="button"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-show="activeTab === 'overview'" class="section active">
        <div class="stat-row">
          <div class="stat-card">
            <div>
              <div class="stat-label">{{ t.overview.totalBookings }}</div>
              <div class="stat-value">{{ dashboardStats.total_bookings }}</div>
            </div>
            <div class="stat-icon si-blue" v-html="icons.file"></div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">{{ t.overview.activeBookings }}</div>
              <div class="stat-value">{{ dashboardStats.active_bookings }}</div>
            </div>
            <div class="stat-icon si-green" v-html="icons.pin"></div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">{{ t.overview.totalPaid }}</div>
              <div class="stat-value">{{ dashboardStats.total_paid.formatted }}</div>
            </div>
            <div class="stat-icon si-amber" v-html="icons.card"></div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">{{ t.overview.recentBookingsTitle }}</h3>
          <p class="card-sub">{{ t.overview.recentBookingsSub }}</p>
          <div class="booking-list">
            <div v-for="booking in recentBookings" :key="booking.reference" class="booking-row">
              <div class="booking-header">
                <div>
                  <p class="booking-ref">{{ t.common.bookingPrefix }}{{ booking.reference }}</p>
                  <p class="booking-date">{{ formatDate(booking.date) }}</p>
                </div>
                <div class="booking-right">
                  <span class="booking-amount">{{ booking.amount }}</span>
                  <span class="badge" :class="statusClass(booking.statusKey)">
                    {{ statusLabel(booking.statusKey) }}
                  </span>
                </div>
              </div>
              <div class="facts">
                <div class="fact">
                  <span v-html="icons.home"></span>
                  <span class="fact-label">{{ t.common.roomLabel }}</span>
                  <span class="fact-val">{{ booking.room }}</span>
                </div>
                <div class="fact">
                  <span v-html="icons.pin"></span>
                  <span class="fact-label">{{ t.common.locationLabel }}</span>
                  <span class="fact-val">{{ booking.location }}</span>
                </div>
                <div class="fact">
                  <span v-html="icons.card"></span>
                  <span class="fact-label">{{ t.common.paymentLabel }}</span>
                  <span class="fact-val">{{ paymentStatusLabel(booking.paymentKey) }}</span>
                </div>
                <div class="fact">
                  <span v-html="icons.money"></span>
                  <span class="fact-label">{{ t.common.totalLabel }}</span>
                  <span class="fact-val">{{ booking.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'bookings'" class="section active">
        <div class="card">
          <h3 class="card-title">{{ t.bookings.title }}</h3>
          <p class="card-sub">{{ t.bookings.subtitle }}</p>
          <div class="booking-list">
            <div v-for="booking in bookings" :key="booking.reference" class="booking-row">
              <div class="booking-header">
                <div>
                  <p class="booking-ref">{{ t.common.bookingPrefix }}{{ booking.reference }}</p>
                  <p class="booking-date">{{ t.bookings.createdOn }} {{ formatDate(booking.date) }}</p>
                </div>
                <div class="booking-right">
                  <span class="badge" :class="paymentStatusClass(booking.paymentKey)">
                    {{ paymentStatusLabel(booking.paymentKey, booking.paymentDisplayKey) }}
                  </span>
                  <span class="badge" :class="statusClass(booking.statusKey)">
                    {{ statusLabel(booking.statusKey) }}
                  </span>
                </div>
              </div>

              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">{{ t.bookings.items }}</span>
                  <span class="meta-val">{{ bookingItemsLabel(booking.itemsCount) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">{{ t.bookings.university }}</span>
                  <span class="meta-val">{{ booking.university }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">{{ t.common.total }}</span>
                  <span class="meta-val">{{ booking.total }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">{{ t.bookings.paymentMethod }}</span>
                  <span class="meta-val">{{ paymentMethodLabel(booking.paymentMethodKey) }}</span>
                </div>
              </div>

              <div class="accom">
                <div class="accom-row">
                  <div>
                    <div class="accom-title">{{ booking.room }}</div>
                    <div class="accom-sub">{{ booking.location }}</div>
                  </div>
                  <div class="accom-price">
                    <strong>{{ booking.amount }}</strong>
                    <div class="accom-sub">{{ bookingPriceLine(booking) }}</div>
                  </div>
                </div>
              </div>

              <div class="process">
                <div class="process-top">
                  <span class="process-title">{{ t.bookings.processTitle }}</span>
                  <span class="process-pct" :style="{ color: booking.progressColor }">{{ booking.progress }}</span>
                </div>
                <div class="bar-wrap">
                  <div class="bar" :class="booking.barClass" :style="{ width: booking.progress }"></div>
                </div>

                <div class="steps">
                  <div class="step done" @click="togglePanel(`${booking.reference}-1`)">
                    <div class="step-circle" v-html="icons.home"></div>
                    <p class="step-num">{{ t.steps.step }} 1</p>
                    <p class="step-name">{{ t.steps.selectRoom }}</p>
                    <span class="step-badge done">{{ t.states.completed }}</span>
                  </div>
                  <div class="step-arrow" v-html="icons.arrow"></div>

                  <div
                    class="step"
                    :class="booking.docsDone ? 'done' : 'prog'"
                    @click="togglePanel(`${booking.reference}-2`)"
                  >
                    <div class="step-circle" v-html="icons.upload"></div>
                    <p class="step-num">{{ t.steps.step }} 2</p>
                    <p class="step-name">{{ t.steps.uploadDocuments }}</p>
                    <span class="step-badge" :class="booking.docsDone ? 'done' : 'prog'">
                      {{ booking.docsDone ? t.states.completed : t.states.inProgress }}
                    </span>
                  </div>
                  <div class="step-arrow" v-html="icons.arrow"></div>

                  <div class="step" :class="booking.paymentDone ? 'done' : 'prog'" @click="togglePanel(`${booking.reference}-3`)">
                    <div class="step-circle" v-html="icons.card"></div>
                    <p class="step-num">{{ t.steps.step }} 3</p>
                    <p class="step-name">{{ t.steps.payment }}</p>
                    <span class="step-badge" :class="booking.paymentDone ? 'done' : 'prog'">
                      {{ booking.paymentDone ? t.states.completed : t.states.inProgress }}
                    </span>
                  </div>
                  <div class="step-arrow" v-html="icons.arrow"></div>

                  <div class="step" :class="booking.finalDone ? 'done' : 'prog'" @click="togglePanel(`${booking.reference}-4`)">
                    <div class="step-circle" v-html="icons.check"></div>
                    <p class="step-num">{{ t.steps.step }} 4</p>
                    <p class="step-name">{{ t.steps.finalStatus }}</p>
                    <span class="step-badge" :class="booking.finalDone ? 'done' : 'prog'">
                      {{ booking.finalDone ? t.states.completed : t.states.inProgress }}
                    </span>
                  </div>
                </div>

                <div class="step-panel" :class="['done-panel', { open: openPanel === `${booking.reference}-1` }]">
                  <div class="panel-head">
                    <div class="panel-icon done" v-html="icons.home"></div>
                    <div>
                      <strong>{{ t.panels.roomSelectionComplete }}</strong>
                      <p>{{ t.panels.roomSelectionDesc }}</p>
                    </div>
                    <span class="badge is-success panel-ml">{{ t.states.completed }}</span>
                  </div>
                  <div class="info-grid">
                    <div class="info-cell">
                      <span class="meta-label">{{ t.common.location }}</span>
                      <strong>{{ booking.location }}</strong>
                    </div>
                    <div class="info-cell">
                      <span class="meta-label">{{ t.bookings.roomDetails }}</span>
                      <strong>{{ booking.roomDetails }}</strong>
                    </div>
                    <div class="info-cell">
                      <span class="meta-label">{{ t.bookings.totalCost }}</span>
                      <strong>{{ booking.total }}</strong>
                    </div>
                    <div class="info-cell">
                      <span class="meta-label">{{ t.bookings.duration }}</span>
                      <strong>{{ booking.duration }}</strong>
                    </div>
                  </div>
                  <p class="note ok">{{ t.panels.roomSelectionNote }}</p>
                </div>

                <div class="step-panel" :class="['prog-panel', { open: openPanel === `${booking.reference}-2` }]">
                  <div class="panel-head">
                    <div class="panel-icon prog" v-html="icons.upload"></div>
                    <div>
                      <strong>{{ t.panels.documentUpload }}</strong>
                      <p>{{ t.panels.documentUploadDesc }}</p>
                    </div>
                    <span class="badge is-warning panel-ml">{{ booking.docsDone ? t.states.completed : t.states.inProgress }}</span>
                  </div>
                  <div class="doc-list">
                    <div v-for="doc in booking.documents" :key="doc.name" class="doc-item">
                      <span>{{ translateDocName(doc.nameKey) }}</span>
                      <span class="badge" :class="doc.statusClass">{{ stateLabel(doc.stateKey) }}</span>
                    </div>
                  </div>
                  <p class="note warn">{{ t.panels.uploadAllDocs }}</p>
                </div>

                <div
                  class="step-panel"
                  :class="[booking.paymentDone ? 'done-panel' : 'prog-panel', { open: openPanel === `${booking.reference}-3` }]"
                >
                  <div class="panel-head">
                    <div class="panel-icon" :class="booking.paymentDone ? 'done' : 'prog'" v-html="icons.card"></div>
                    <div>
                      <strong>{{ t.panels.paymentProcessing }}</strong>
                      <p>{{ paymentMethodLabel(booking.paymentMethodKey) }}</p>
                    </div>
                    <span class="badge panel-ml" :class="paymentStatusClass(booking.paymentKey)">
                      {{ paymentStatusLabel(booking.paymentKey, booking.paymentDisplayKey) }}
                    </span>
                  </div>
                  <div class="pay-lines">
                    <div v-for="line in booking.paymentLines" :key="line.labelKey" class="pay-line">
                      <span class="meta-label">{{ t.paymentLines[line.labelKey] }}</span>
                      <strong>{{ line.value }}</strong>
                    </div>
                  </div>
                  <div class="pay-total">
                    <span class="label">{{ t.common.total }}</span>
                    <span class="val">{{ booking.total }}</span>
                  </div>
                  <p class="note" :class="booking.paymentDone ? 'ok' : 'warn'">
                    {{ booking.paymentDone ? t.panels.paymentConfirmed : t.panels.paymentUnderReview }}
                  </p>
                </div>

                <div
                  class="step-panel"
                  :class="[booking.finalDone ? 'done-panel' : 'prog-panel', { open: openPanel === `${booking.reference}-4` }]"
                >
                  <div class="panel-head">
                    <div class="panel-icon" :class="booking.finalDone ? 'done' : 'prog'" v-html="icons.check"></div>
                    <div>
                      <strong>{{ t.panels.finalBookingStatus }}</strong>
                      <p>{{ t.panels.finalBookingStatusDesc }}</p>
                    </div>
                    <span class="badge panel-ml" :class="booking.finalDone ? 'is-success' : 'is-warning'">
                      {{ booking.finalDone ? stateLabel('confirmed') : t.states.inProgress }}
                    </span>
                  </div>
                  <div class="final-rows">
                    <div v-for="item in booking.finalItems" :key="item.labelKey" class="final-item">
                      <span>{{ t.finalItems[item.labelKey] }}</span>
                      <span class="badge" :class="item.statusClass">{{ stateLabel(item.stateKey) }}</span>
                    </div>
                  </div>
                  <p class="note" :class="booking.finalDone ? 'ok' : 'warn'">
                    {{ booking.finalDone ? t.panels.bookingCompleted : t.panels.applicationReviewNote }}
                  </p>
                </div>
              </div>

              <div class="status-bar">
                <div class="status-item" :class="booking.statusItemClass">{{ t.statusBar[booking.statusSummaryKey] }}</div>
                <div class="status-item" :class="booking.paymentItemClass">{{ t.statusBar[booking.paymentSummaryKey] }}</div>
                <div class="status-item" :class="booking.docsItemClass">{{ t.statusBar[booking.docsSummaryKey] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'payments'" class="section active">
        <div class="card">
          <h3 class="card-title">{{ t.payments.title }}</h3>
          <p class="card-sub">{{ t.payments.subtitle }}</p>
          <div class="pay-list">
            <div v-for="payment in payments" :key="payment.reference" class="pay-row">
              <div class="pay-left">
                <div class="pay-icon" :class="payment.iconClass" v-html="icons.card"></div>
                <div>
                  <p class="booking-ref">{{ paymentReferenceLabel(payment) }}</p>
                  <p class="booking-date">{{ paymentMethodCodeLabel(payment.methodCode) }} | {{ formatDate(payment.date) }}</p>
                </div>
              </div>
              <div class="pay-right-grp">
                <span class="booking-amount">{{ payment.total }}</span>
                <span class="badge" :class="paymentStatusClass(payment.statusKey)">
                  {{ paymentStatusLabel(payment.statusKey) }}
                </span>
                <div class="pay-actions">
                  <button class="btn-outline" type="button" @click="openModal(payment.id)">
                    <span v-html="icons.eye"></span>
                    {{ t.payments.viewInvoice }}
                  </button>
                  <button class="btn-outline" type="button" @click="printInvoice">
                    <span v-html="icons.print"></span>
                    {{ t.payments.print }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'profile'" class="section active">
        <div class="card">
          <div class="card-head">
            <div>
              <h3 class="card-title">{{ t.profile.title }}</h3>
              <p class="card-sub">{{ t.profile.subtitle }}</p>
            </div>
            <button class="edit-btn" type="button">
              <span v-html="icons.edit"></span>
              {{ t.profile.edit }}
            </button>
          </div>
          <div class="profile-header">
            <div class="avatar">{{ profileInitials }}</div>
            <div>
              <div class="profile-name">{{ profileName }}</div>
              <div class="profile-email">{{ profileEmail }}</div>
              <div class="profile-hint">{{ t.profile.hint }}</div>
            </div>
          </div>
          <div class="profile-grid">
            <div v-for="item in profileItems" :key="item.labelKey" class="profile-item">
              <span class="meta-label">{{ t.profile.fields[item.labelKey] }}</span>
              <strong>{{ profileValue(item) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-for="payment in payments"
      :key="`${payment.id}-modal`"
      class="modal-backdrop"
      :class="{ open: activeModal === payment.id }"
      @click="closeModal($event, payment.id)"
    >
      <div class="modal">
        <div class="card-head" style="margin-bottom: 1rem">
          <div>
            <h3 class="card-title">{{ t.payments.invoice }}</h3>
            <p class="card-sub">{{ paymentReferenceLabel(payment) }}</p>
          </div>
          <button class="btn-outline" type="button" @click="activeModal = null">{{ t.common.close }}</button>
        </div>
        <div class="profile-grid">
          <div class="profile-item">
            <span class="meta-label">{{ t.payments.status }}</span>
            <strong>{{ paymentStatusLabel(payment.statusKey) }}</strong>
          </div>
          <div class="profile-item">
            <span class="meta-label">{{ t.payments.method }}</span>
            <strong>{{ paymentMethodLabel(payment.methodLabelKey) }}</strong>
          </div>
          <div class="profile-item">
            <span class="meta-label">{{ t.payments.grandTotal }}</span>
            <strong>{{ payment.total }}</strong>
          </div>
          <div class="profile-item">
            <span class="meta-label">{{ t.payments.date }}</span>
            <strong>{{ formatDate(payment.date) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
const svg = {
  file: '<svg viewBox="0 0 24 24"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M9 13h6M9 17h6M9 9h1"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  card: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 21v-8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v8"/></svg>',
  money: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
};

const messages = {
  en: {
    title: 'Movinn Dashboard',
    tabs: { overview: 'Overview', bookings: 'My Bookings', payments: 'Payments', profile: 'Profile' },
    common: {
      bookingPrefix: 'Booking #',
      roomLabel: 'Room:',
      locationLabel: 'Location:',
      paymentLabel: 'Payment:',
      totalLabel: 'Total:',
      total: 'Total',
      location: 'Location',
      close: 'Close',
      roomUnit: 'room',
      monthShort: 'mo',
      depositShort: 'deposit',
    },
    overview: {
      totalBookings: 'Total Bookings',
      activeBookings: 'Active Bookings',
      totalPaid: 'Total Paid Amount',
      recentBookingsTitle: 'Recent Bookings',
      recentBookingsSub: 'Your latest accommodation bookings',
    },
    bookings: {
      title: 'All Bookings',
      subtitle: 'View and manage all of your accommodation bookings',
      createdOn: 'Created on',
      items: 'Items',
      university: 'University',
      paymentMethod: 'Payment Method',
      processTitle: 'Interactive Process Flow',
      roomDetails: 'Room Details',
      totalCost: 'Total Cost',
      duration: 'Duration',
    },
    steps: {
      step: 'Step',
      selectRoom: 'Select Room',
      uploadDocuments: 'Upload Documents',
      payment: 'Payment',
      finalStatus: 'Final Status',
    },
    states: {
      completed: 'Completed',
      inProgress: 'In Progress',
      confirmed: 'Confirmed',
      pending: 'Pending',
      paid: 'Paid',
      pendingPayment: 'Pending Payment',
      uploaded: 'Uploaded',
      notUploaded: 'Not Uploaded',
      underReview: 'Under Review',
    },
    panels: {
      roomSelectionComplete: 'Room Selection Complete',
      roomSelectionDesc: 'The room was selected and reserved successfully',
      roomSelectionNote: 'Room successfully selected and reserved',
      documentUpload: 'Document Upload',
      documentUploadDesc: 'Upload the required documents to continue',
      uploadAllDocs: 'Please upload all required documents to proceed',
      paymentProcessing: 'Payment Processing',
      paymentConfirmed: 'Payment confirmed successfully.',
      paymentUnderReview: "Payment under review. We'll notify you once payment is confirmed.",
      finalBookingStatus: 'Final Booking Status',
      finalBookingStatusDesc: 'Application review and final confirmation',
      bookingCompleted: 'Booking completed and confirmed.',
      applicationReviewNote: "Your application is being reviewed. You'll receive an update within 2-3 business days.",
    },
    paymentLines: {
      roomRent: 'Room Rent',
      securityDeposit: 'Security Deposit',
    },
    finalItems: {
      applicationReview: 'Application Review',
      roomAssignment: 'Room Assignment',
      bookingConfirmation: 'Booking Confirmation',
    },
    statusBar: {
      bookingConfirmed: 'Booking Confirmed',
      bookingUnderReview: 'Booking Under Review',
      paidSuccessfully: 'Paid Successfully',
      paymentUnderReview: 'Payment Under Review',
      docsPartial: 'Docs: Partially Uploaded',
      docsMissing: 'Docs: Not Uploaded',
    },
    payments: {
      title: 'Payment History',
      subtitle: 'Track all of your payments and transactions',
      viewInvoice: 'View Invoice',
      print: 'Print',
      invoice: 'Invoice',
      securityDeposit: 'Security Deposit',
      status: 'Status',
      method: 'Payment Method',
      grandTotal: 'Grand Total',
      date: 'Date',
    },
    profile: {
      title: 'Personal Information',
      subtitle: 'Core student details',
      edit: 'Edit Profile',
      hint: 'JPG, PNG up to 5MB',
      fields: {
        fullName: 'Full Name',
        university: 'University',
        email: 'Email',
        nationality: 'Nationality',
        mobile: 'Mobile Number',
        address: 'Address',
        birthDate: 'Date of Birth',
        profileStatus: 'Profile Status',
      },
    },
    docs: {
      passportCopy: 'Passport Copy',
      acceptanceLetter: 'University Acceptance Letter',
      financialStatement: 'Financial Statement',
    },
    paymentMethods: {
      creditCard: 'Credit Card',
      bankTransfer: 'Bank Transfer',
    },
    paymentMethodCodes: {
      credit_card: 'credit_card',
      bank_transfer: 'bank_transfer',
    },
  },
  ar: {
    title: 'لوحة تحكم Movinn',
    tabs: { overview: 'نظرة عامة', bookings: 'حجوزاتي', payments: 'المدفوعات', profile: 'الملف الشخصي' },
    common: {
      bookingPrefix: 'الحجز #',
      roomLabel: 'الغرفة:',
      locationLabel: 'الموقع:',
      paymentLabel: 'الدفع:',
      totalLabel: 'الإجمالي:',
      total: 'الإجمالي',
      location: 'الموقع',
      close: 'إغلاق',
      roomUnit: 'غرفة',
      monthShort: 'شهريًا',
      depositShort: 'تأمين',
    },
    overview: {
      totalBookings: 'إجمالي الحجوزات',
      activeBookings: 'الحجوزات النشطة',
      totalPaid: 'إجمالي المبلغ المدفوع',
      recentBookingsTitle: 'الحجوزات الأخيرة',
      recentBookingsSub: 'أحدث حجوزات الإقامة الخاصة بك',
    },
    bookings: {
      title: 'جميع الحجوزات',
      subtitle: 'عرض وإدارة جميع حجوزات الإقامة الخاصة بك',
      createdOn: 'تم الإنشاء في',
      items: 'العناصر',
      university: 'الجامعة',
      paymentMethod: 'طريقة الدفع',
      processTitle: 'مسار الحجز التفاعلي',
      roomDetails: 'تفاصيل الغرفة',
      totalCost: 'التكلفة الإجمالية',
      duration: 'المدة',
    },
    steps: {
      step: 'الخطوة',
      selectRoom: 'اختيار الغرفة',
      uploadDocuments: 'رفع المستندات',
      payment: 'الدفع',
      finalStatus: 'الحالة النهائية',
    },
    states: {
      completed: 'مكتمل',
      inProgress: 'قيد التنفيذ',
      confirmed: 'مؤكد',
      pending: 'قيد الانتظار',
      paid: 'مدفوع',
      pendingPayment: 'بانتظار الدفع',
      uploaded: 'تم الرفع',
      notUploaded: 'لم يتم الرفع',
      underReview: 'قيد المراجعة',
    },
    panels: {
      roomSelectionComplete: 'اكتمل اختيار الغرفة',
      roomSelectionDesc: 'تم اختيار الغرفة وحجزها بنجاح',
      roomSelectionNote: 'تم اختيار الغرفة وحجزها بنجاح',
      documentUpload: 'رفع المستندات',
      documentUploadDesc: 'ارفع المستندات المطلوبة للمتابعة',
      uploadAllDocs: 'يرجى رفع جميع المستندات المطلوبة للمتابعة',
      paymentProcessing: 'معالجة الدفع',
      paymentConfirmed: 'تم تأكيد الدفع بنجاح.',
      paymentUnderReview: 'الدفع قيد المراجعة. سنقوم بإشعارك فور تأكيد الدفع.',
      finalBookingStatus: 'الحالة النهائية للحجز',
      finalBookingStatusDesc: 'مراجعة الطلب والتأكيد النهائي',
      bookingCompleted: 'تم إكمال الحجز وتأكيده.',
      applicationReviewNote: 'طلبك قيد المراجعة. ستتلقى تحديثًا خلال يومي عمل إلى ثلاثة أيام.',
    },
    paymentLines: {
      roomRent: 'إيجار الغرفة',
      securityDeposit: 'التأمين',
    },
    finalItems: {
      applicationReview: 'مراجعة الطلب',
      roomAssignment: 'تخصيص الغرفة',
      bookingConfirmation: 'تأكيد الحجز',
    },
    statusBar: {
      bookingConfirmed: 'تم تأكيد الحجز',
      bookingUnderReview: 'الحجز قيد المراجعة',
      paidSuccessfully: 'تم الدفع بنجاح',
      paymentUnderReview: 'الدفع قيد المراجعة',
      docsPartial: 'المستندات: مرفوع جزئيًا',
      docsMissing: 'المستندات: غير مرفوعة',
    },
    payments: {
      title: 'سجل المدفوعات',
      subtitle: 'تتبع جميع المدفوعات والمعاملات الخاصة بك',
      viewInvoice: 'عرض الفاتورة',
      print: 'طباعة',
      invoice: 'الفاتورة',
      securityDeposit: 'التأمين',
      status: 'الحالة',
      method: 'طريقة الدفع',
      grandTotal: 'الإجمالي',
      date: 'التاريخ',
    },
    profile: {
      title: 'المعلومات الشخصية',
      subtitle: 'بيانات الطالب الأساسية',
      edit: 'تعديل الملف الشخصي',
      hint: 'JPG, PNG حتى 5MB',
      fields: {
        fullName: 'الاسم الكامل',
        university: 'الجامعة',
        email: 'البريد الإلكتروني',
        nationality: 'الجنسية',
        mobile: 'رقم الجوال',
        address: 'العنوان',
        birthDate: 'تاريخ الميلاد',
        profileStatus: 'حالة الملف',
      },
    },
    docs: {
      passportCopy: 'نسخة جواز السفر',
      acceptanceLetter: 'خطاب قبول الجامعة',
      financialStatement: 'كشف حساب مالي',
    },
    paymentMethods: {
      creditCard: 'بطاقة ائتمان',
      bankTransfer: 'تحويل بنكي',
    },
    paymentMethodCodes: {
      credit_card: 'بطاقة_ائتمان',
      bank_transfer: 'تحويل_بنكي',
    },
  },
  tr: {
    title: 'Movinn Paneli',
    tabs: { overview: 'Genel Bakis', bookings: 'Rezervasyonlarim', payments: 'Odemeler', profile: 'Profil' },
    common: {
      bookingPrefix: 'Rezervasyon #',
      roomLabel: 'Oda:',
      locationLabel: 'Konum:',
      paymentLabel: 'Odeme:',
      totalLabel: 'Toplam:',
      total: 'Toplam',
      location: 'Konum',
      close: 'Kapat',
      roomUnit: 'oda',
      monthShort: 'ay',
      depositShort: 'depozito',
    },
    overview: {
      totalBookings: 'Toplam Rezervasyon',
      activeBookings: 'Aktif Rezervasyonlar',
      totalPaid: 'Toplam Odenen Tutar',
      recentBookingsTitle: 'Son Rezervasyonlar',
      recentBookingsSub: 'En son konaklama rezervasyonlariniz',
    },
    bookings: {
      title: 'Tum Rezervasyonlar',
      subtitle: 'Tum konaklama rezervasyonlarinizi goruntuleyin ve yonetin',
      createdOn: 'Olusturulma tarihi',
      items: 'Ogeler',
      university: 'Universite',
      paymentMethod: 'Odeme Yontemi',
      processTitle: 'Etkilesimli Surec Akisi',
      roomDetails: 'Oda Detaylari',
      totalCost: 'Toplam Tutar',
      duration: 'Sure',
    },
    steps: {
      step: 'Adim',
      selectRoom: 'Oda Secimi',
      uploadDocuments: 'Belgeleri Yukle',
      payment: 'Odeme',
      finalStatus: 'Son Durum',
    },
    states: {
      completed: 'Tamamlandi',
      inProgress: 'Suruyor',
      confirmed: 'Onaylandi',
      pending: 'Beklemede',
      paid: 'Odendi',
      pendingPayment: 'Odeme Bekleniyor',
      uploaded: 'Yuklendi',
      notUploaded: 'Yuklenmedi',
      underReview: 'Incelemede',
    },
    panels: {
      roomSelectionComplete: 'Oda Secimi Tamamlandi',
      roomSelectionDesc: 'Oda basariyla secildi ve rezerve edildi',
      roomSelectionNote: 'Oda basariyla secildi ve rezerve edildi',
      documentUpload: 'Belge Yukleme',
      documentUploadDesc: 'Devam etmek icin gerekli belgeleri yukleyin',
      uploadAllDocs: 'Devam etmek icin tum gerekli belgeleri yukleyin',
      paymentProcessing: 'Odeme Islemi',
      paymentConfirmed: 'Odeme basariyla onaylandi.',
      paymentUnderReview: 'Odeme incelemede. Onaylandiginda sizi bilgilendirecegiz.',
      finalBookingStatus: 'Son Rezervasyon Durumu',
      finalBookingStatusDesc: 'Basvuru incelemesi ve son onay',
      bookingCompleted: 'Rezervasyon tamamlandi ve onaylandi.',
      applicationReviewNote: 'Basvurunuz inceleniyor. 2-3 is gunu icinde guncelleme alacaksiniz.',
    },
    paymentLines: {
      roomRent: 'Oda Ucreti',
      securityDeposit: 'Depozito',
    },
    finalItems: {
      applicationReview: 'Basvuru Incelemesi',
      roomAssignment: 'Oda Atamasi',
      bookingConfirmation: 'Rezervasyon Onayi',
    },
    statusBar: {
      bookingConfirmed: 'Rezervasyon Onaylandi',
      bookingUnderReview: 'Rezervasyon Incelemede',
      paidSuccessfully: 'Odeme Basariyla Tamamlandi',
      paymentUnderReview: 'Odeme Incelemede',
      docsPartial: 'Belgeler: Kismen Yuklendi',
      docsMissing: 'Belgeler: Yuklenmedi',
    },
    payments: {
      title: 'Odeme Gecmisi',
      subtitle: 'Tum odemelerinizi ve islemlerinizi takip edin',
      viewInvoice: 'Faturayi Gor',
      print: 'Yazdir',
      invoice: 'Fatura',
      securityDeposit: 'Depozito',
      status: 'Durum',
      method: 'Odeme Yontemi',
      grandTotal: 'Genel Toplam',
      date: 'Tarih',
    },
    profile: {
      title: 'Kisisel Bilgiler',
      subtitle: 'Temel ogrenci bilgileri',
      edit: 'Profili Duzenle',
      hint: 'JPG, PNG en fazla 5MB',
      fields: {
        fullName: 'Tam Ad',
        university: 'Universite',
        email: 'E-posta',
        nationality: 'Uyruk',
        mobile: 'Telefon Numarasi',
        address: 'Adres',
        birthDate: 'Dogum Tarihi',
        profileStatus: 'Profil Durumu',
      },
    },
    docs: {
      passportCopy: 'Pasaport Kopyasi',
      acceptanceLetter: 'Universite Kabul Mektubu',
      financialStatement: 'Finansal Durum Belgesi',
    },
    paymentMethods: {
      creditCard: 'Kredi Karti',
      bankTransfer: 'Banka Havalesi',
    },
    paymentMethodCodes: {
      credit_card: 'kredi_karti',
      bank_transfer: 'banka_havalesi',
    },
  },
};

const rawRecentBookings = [
  {
    reference: 'BK-00000',
    date: '2024-09-10',
    amount: '$1,350',
    statusKey: 'confirmed',
    room: 'Studio Room - Movinn Residence',
    location: 'Beylikduzu, Istanbul',
    paymentKey: 'paid',
    total: '$1,350.00',
  },
  {
    reference: 'BK-00001',
    date: '2024-10-05',
    amount: '$950',
    statusKey: 'pending',
    room: 'Shared Room - City Campus',
    location: 'Sisli, Istanbul',
    paymentKey: 'pending',
    total: '$950.00',
  },
];

const rawBookings = [
  {
    reference: 'BK-00000',
    date: '2024-09-10',
    paymentKey: 'paid',
    paymentDisplayKey: 'paid',
    statusKey: 'confirmed',
    itemsCount: 1,
    university: 'Istanbul Aydin University',
    total: '$1,350.00',
    paymentMethodKey: 'creditCard',
    room: 'Studio Room - Movinn Residence',
    roomDetails: 'A-101 • Studio Room - Movinn Residence',
    location: 'Beylikduzu, Istanbul',
    amount: '$1,350',
    rentAmount: '$1,100',
    depositAmount: '$250',
    progress: '75%',
    progressColor: '#3b6d11',
    barClass: 'green',
    docsDone: false,
    paymentDone: true,
    finalDone: true,
    duration: '2024-06-30 → 2024-09-01',
    documents: [
      { nameKey: 'passportCopy', stateKey: 'uploaded', statusClass: 'is-success' },
      { nameKey: 'acceptanceLetter', stateKey: 'uploaded', statusClass: 'is-success' },
      { nameKey: 'financialStatement', stateKey: 'pending', statusClass: 'is-warning' },
    ],
    paymentLines: [
      { labelKey: 'roomRent', value: '$1,100' },
      { labelKey: 'securityDeposit', value: '$250' },
    ],
    finalItems: [
      { labelKey: 'applicationReview', stateKey: 'completed', statusClass: 'is-success' },
      { labelKey: 'roomAssignment', stateKey: 'completed', statusClass: 'is-success' },
      { labelKey: 'bookingConfirmation', stateKey: 'confirmed', statusClass: 'is-success' },
    ],
    statusSummaryKey: 'bookingConfirmed',
    statusItemClass: 'is-success',
    paymentSummaryKey: 'paidSuccessfully',
    paymentItemClass: 'is-success',
    docsSummaryKey: 'docsPartial',
    docsItemClass: 'is-warning',
  },
  {
    reference: 'BK-00001',
    date: '2024-10-05',
    paymentKey: 'pending',
    paymentDisplayKey: 'pendingPayment',
    statusKey: 'pending',
    itemsCount: 1,
    university: 'Istanbul Bilgi University',
    total: '$950.00',
    paymentMethodKey: 'bankTransfer',
    room: 'Shared Room - City Campus',
    roomDetails: 'A-205 • Shared Room - City Campus',
    location: 'Sisli, Istanbul',
    amount: '$950',
    rentAmount: '$800',
    depositAmount: '$150',
    progress: '25%',
    progressColor: '#854f0b',
    barClass: 'amber',
    docsDone: false,
    paymentDone: false,
    finalDone: false,
    duration: '2024-06-30 → 2024-09-01',
    documents: [
      { nameKey: 'passportCopy', stateKey: 'notUploaded', statusClass: 'is-danger' },
      { nameKey: 'acceptanceLetter', stateKey: 'notUploaded', statusClass: 'is-danger' },
      { nameKey: 'financialStatement', stateKey: 'notUploaded', statusClass: 'is-danger' },
    ],
    paymentLines: [
      { labelKey: 'roomRent', value: '$800' },
      { labelKey: 'securityDeposit', value: '$150' },
    ],
    finalItems: [
      { labelKey: 'applicationReview', stateKey: 'underReview', statusClass: 'is-warning' },
      { labelKey: 'roomAssignment', stateKey: 'pending', statusClass: 'is-neutral' },
      { labelKey: 'bookingConfirmation', stateKey: 'pending', statusClass: 'is-neutral' },
    ],
    statusSummaryKey: 'bookingUnderReview',
    statusItemClass: 'is-warning',
    paymentSummaryKey: 'paymentUnderReview',
    paymentItemClass: 'is-warning',
    docsSummaryKey: 'docsMissing',
    docsItemClass: 'is-neutral',
  },
];

const rawPayments = [
  {
    id: 'inv1',
    reference: 'BK-00000',
    methodCode: 'credit_card',
    methodLabelKey: 'creditCard',
    date: '2024-09-10',
    total: '$1,350.00',
    statusKey: 'paid',
    iconClass: 'green',
  },
  {
    id: 'inv2',
    reference: 'BK-00001',
    methodCode: 'bank_transfer',
    methodLabelKey: 'bankTransfer',
    date: '2024-10-05',
    total: '$950.00',
    statusKey: 'pending',
    iconClass: 'amber',
  },
  {
    id: 'inv3',
    referenceKey: 'securityDeposit',
    reference: 'DEPOSIT-0001',
    methodCode: 'credit_card',
    methodLabelKey: 'creditCard',
    date: '2024-12-04',
    total: '$500.00',
    statusKey: 'paid',
    iconClass: 'green',
  },
];

const rawProfileItems = [
  { labelKey: 'fullName', value: 'Ahmed Al-Rashidi' },
  { labelKey: 'university', value: 'Istanbul Aydin University' },
  { labelKey: 'email', value: 'demo@edmovinn.com' },
  { labelKey: 'nationality', value: 'Saudi Arabian' },
  { labelKey: 'mobile', value: '+966501234567' },
  { labelKey: 'address', value: 'Istanbul, Turkey' },
  { labelKey: 'birthDate', value: '2000-05-15' },
  { labelKey: 'profileStatus', value: '85%' },
];

export default {
  layout: 'dashboard',
  middleware: ['auth', 'profile_completed', 'verified'],

  data() {
    return {
      activeTab: 'overview',
      activeModal: null,
      openPanel: null,
      isDashboardLoading: false,
      tabLoadingState: {
        overview: false,
        bookings: false,
        payments: false,
        profile : false,
      },
      loadedTabs: {
        overview: false,
        bookings: false,
        payments: false,
        profile : false,
      },
      icons: svg,
      dashboardStats: {
        total_bookings: 3,
        active_bookings: 2,
        total_paid: {
          amount: 2300,
          formatted: '$2,300',
          currency: 'USD',
        },
      },
      recentBookings: rawRecentBookings,
      bookings: rawBookings,
      payments: rawPayments,
      profileItems: rawProfileItems,
      profileData: {
        full_name: rawProfileItems[0].value,
        email    : rawProfileItems[2].value,
      },
    };
  },

  computed: {
    currentLocale() {
      return ['ar', 'tr', 'en'].includes(this.$i18n.locale) ? this.$i18n.locale : 'en';
    },
    t() {
      return messages[this.currentLocale] || messages.en;
    },
    tabs() {
      return [
        { key: 'overview', label: this.t.tabs.overview },
        { key: 'bookings', label: this.t.tabs.bookings },
        { key: 'payments', label: this.t.tabs.payments },
        { key: 'profile', label: this.t.tabs.profile },
      ];
    },
    profileName() {
      return this.profileData.full_name || rawProfileItems[0].value;
    },
    profileEmail() {
      return this.profileData.email || rawProfileItems[2].value;
    },
    profileInitials() {
      const initials = this.profileName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('');

      return initials || 'NA';
    },
  },

  mounted() {
    this.fetchDashboard();
  },

  methods: {
    async selectTab(tabKey) {
      this.activeTab = tabKey;

      if (this.loadedTabs[tabKey]) {
        return;
      }

      await this.fetchTabData(tabKey);
    },
    async fetchDashboard() {
      this.isDashboardLoading = true;
      this.tabLoadingState.overview = true;

      try {
        const dashboard = await this.$bookingApi.getDashboard();
        this.applyDashboardData(dashboard);
        this.loadedTabs.overview = true;
      } catch (error) {
        // Keep the static fallback data so the dashboard remains usable.
      } finally {
        this.tabLoadingState.overview = false;
        this.isDashboardLoading = false;
      }
    },
    async fetchTabData(tabKey) {
      if (!['bookings', 'payments', 'profile'].includes(tabKey)) {
        return;
      }

      if (this.tabLoadingState[tabKey]) {
        return;
      }

      this.tabLoadingState[tabKey] = true;

      try {
        if (tabKey === 'bookings') {
          const response = await this.$bookingApi.getDashboardBookings();

          if (Array.isArray(response.items)) {
            this.bookings = response.items;
          }

          this.loadedTabs.bookings = true;
        }

        if (tabKey === 'payments') {
          const response = await this.$bookingApi.getDashboardPayments();

          if (Array.isArray(response.items)) {
            this.payments = response.items;
          }

          this.loadedTabs.payments = true;
        }

        if (tabKey === 'profile') {
          const response = await this.$bookingApi.getDashboardProfile();

          if (response.rawProfile && Object.keys(response.rawProfile).length) {
            this.applyProfileData(response.rawProfile || {});
          }

          this.loadedTabs.profile = true;
        }
      } catch (error) {
        // Keep the last known state or fallback data when a tab request fails.
      } finally {
        this.tabLoadingState[tabKey] = false;
      }
    },
    applyDashboardData(dashboard = {}) {
      if (dashboard.stats) {
        this.dashboardStats = {
          total_bookings : dashboard.stats.total_bookings ?? this.dashboardStats.total_bookings,
          active_bookings: dashboard.stats.active_bookings ?? this.dashboardStats.active_bookings,
          total_paid     : dashboard.stats.total_paid || dashboard.stats.total_spent || this.dashboardStats.total_paid,
        };
      }

      if (Array.isArray(dashboard.recent_bookings)) {
        this.recentBookings = dashboard.recent_bookings;
      }

      if (Array.isArray(dashboard.bookings)) {
        this.bookings = dashboard.bookings;
      }

      if (Array.isArray(dashboard.payments)) {
        this.payments = dashboard.payments;
      }

      if (dashboard.rawProfile) {
        this.applyProfileData(dashboard.rawProfile);
      }
    },
    applyProfileData(profile = {}) {
      this.profileData = {
        ...this.profileData,
        ...profile,
      };

      this.profileItems = [
        { labelKey: 'fullName', value: profile.full_name || rawProfileItems[0].value },
        { labelKey: 'university', value: profile.university || rawProfileItems[1].value },
        { labelKey: 'email', value: profile.email || rawProfileItems[2].value },
        { labelKey: 'nationality', value: profile.nationality || rawProfileItems[3].value },
        { labelKey: 'mobile', value: profile.mobile || profile.phone || rawProfileItems[4].value },
        { labelKey: 'address', value: profile.address || rawProfileItems[5].value },
        { labelKey: 'birthDate', value: profile.date_of_birth || rawProfileItems[6].value },
        { labelKey: 'profileStatus', value: `${String(profile.completion?.percentage || rawProfileItems[7].value).replace('%', '')}%` },
      ];
    },
    togglePanel(id) {
      this.openPanel = this.openPanel === id ? null : id;
    },
    openModal(id) {
      this.activeModal = id;
    },
    closeModal(event, id) {
      if (event.target === event.currentTarget && this.activeModal === id) {
        this.activeModal = null;
      }
    },
    printInvoice() {
      window.print();
    },
    statusClass(key) {
      if (key === 'confirmed' || key === 'completed') return 'is-success';
      if (key === 'pending' || key === 'underReview') return 'is-warning';
      return 'is-neutral';
    },
    paymentStatusClass(key) {
      if (key === 'paid') return 'is-success';
      if (key === 'pending' || key === 'underReview') return 'is-warning';
      return 'is-neutral';
    },
    stateLabel(key) {
      return this.t.states[key] || key;
    },
    statusLabel(key) {
      return this.stateLabel(key);
    },
    paymentStatusLabel(key, overrideKey) {
      return this.stateLabel(overrideKey || key);
    },
    translateDocName(key) {
      return this.t.docs[key] || key;
    },
    paymentMethodLabel(key) {
      return this.t.paymentMethods[key] || key;
    },
    paymentMethodCodeLabel(key) {
      return this.t.paymentMethodCodes[key] || key;
    },
    bookingItemsLabel(count) {
      return `${count} ${this.t.common.roomUnit}`;
    },
    bookingPriceLine(booking) {
      return `${booking.rentAmount}/${this.t.common.monthShort} + ${booking.depositAmount} ${this.t.common.depositShort}`;
    },
    paymentReferenceLabel(payment) {
      if (payment.referenceKey && this.t.payments[payment.referenceKey]) {
        return this.t.payments[payment.referenceKey];
      }
      if (payment.referenceLabel) {
        return payment.referenceLabel;
      }
      return `${this.t.common.bookingPrefix}${payment.reference}`;
    },
    formatDate(date) {
      const value = new Date(date);
      if (Number.isNaN(value.getTime())) return date;
      return new Intl.DateTimeFormat(this.currentLocale, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(value);
    },
    profileValue(item) {
      if (item.labelKey === 'birthDate') {
        return this.formatDate(item.value);
      }
      if (item.labelKey === 'profileStatus') {
        return `${item.value} ${this.t.states.completed}`;
      }
      return item.value;
    },
  },

  head() {
    return {
      title: this.t.title,
      htmlAttrs: {
        lang: this.currentLocale,
      },
    };
  },
};
</script>

<style scoped>
*{box-sizing:border-box;margin:0;padding:0}
.dashboard-page{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f3;color:#1a1a1a;min-height:100vh;padding-top:96px;direction:ltr;text-align:left}
.shell{width:min(1100px,calc(100% - 32px));margin:2rem auto}
.tabs{display:flex;background:#fff;border-bottom:1px solid #e2e2dc;border-radius:12px 12px 0 0;overflow:hidden;margin-bottom:0}
.tab{padding:14px 28px;font-size:14px;font-weight:500;color:#6b6b6b;background:transparent;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer;transition:.2s}
.tab.active{color:#1a5c3a;border-bottom-color:#1a5c3a}
.tab:hover:not(.active){color:#1a5c3a}
.section{display:none;padding-top:1.25rem}
.section.active{display:grid;gap:1.25rem}
.stat-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.stat-card{background:#fff;border-radius:12px;border:.5px solid #e2e2dc;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between}
.stat-label{font-size:13px;color:#6b6b6b;margin-bottom:6px}
.stat-value{font-size:26px;font-weight:600;color:#1a1a1a}
.stat-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stat-icon :deep(svg){width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.si-green{background:#eaf3de;color:#3b6d11}
.si-blue{background:#e8f0fe;color:#1a56b0}
.si-amber{background:#fef8e7;color:#854f0b}
.card{background:#fff;border-radius:12px;border:.5px solid #e2e2dc;padding:1.5rem}
.card-title{font-size:17px;font-weight:600;color:#1a1a1a;margin:0 0 4px}
.card-sub{font-size:13px;color:#6b6b6b;margin:0 0 1.25rem}
.card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.25rem}
.booking-list{display:grid;gap:12px}
.booking-row{border:.5px solid #e2e2dc;border-radius:10px;padding:1rem 1.25rem}
.booking-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.booking-ref{font-weight:600;font-size:15px;color:#1a1a1a;margin:0}
.booking-date{font-size:12px;color:#6b6b6b;margin:2px 0 0}
.booking-right{display:flex;align-items:center;gap:8px}
.booking-amount{font-size:18px;font-weight:700;color:#1a1a1a}
.badge{display:inline-flex;align-items:center;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600}
.badge.is-success{background:#dcf5e8;color:#0f6e40}
.badge.is-warning{background:#fff3e0;color:#b45309}
.badge.is-neutral{background:#f1f0eb;color:#6b6b6b}
.badge.is-danger{background:#fcebeb;color:#a32d2d}
.facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px;margin-top:8px}
.fact{display:flex;align-items:center;gap:5px;font-size:12px;color:#6b6b6b}
.fact :deep(svg){width:14px;height:14px;flex-shrink:0;fill:none;stroke:#b4b2a9;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.fact-label{font-weight:600}
.fact-val{color:#1a1a1a;font-weight:500}
.meta-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0}
.meta-item{background:#f5f5f3;border-radius:8px;padding:8px 12px}
.meta-label{display:block;font-size:11px;color:#6b6b6b;margin-bottom:3px}
.meta-val{font-size:13px;font-weight:500;color:#1a1a1a}
.accom{background:#f5f5f3;border-radius:8px;padding:10px 14px;margin-bottom:12px}
.accom-row{display:flex;justify-content:space-between;align-items:center;gap:1rem}
.accom-title{font-size:13px;font-weight:600;color:#1a1a1a}
.accom-sub{font-size:12px;color:#6b6b6b;margin:2px 0 0}
.accom-price{text-align:right}
.accom-price strong{font-size:15px;font-weight:700;color:#1a1a1a}
.process{background:#f5f5f3;border-radius:10px;padding:1rem;margin-top:12px}
.process-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.process-title{font-size:13px;font-weight:600;color:#1a1a1a}
.process-pct{font-size:13px;font-weight:700}
.bar-wrap{background:#e2e2dc;border-radius:4px;height:6px;margin-bottom:1rem;overflow:hidden}
.bar{height:100%;border-radius:4px;transition:width .3s}
.bar.green{background:#3b6d11}
.bar.amber{background:#c8a84b}
.steps{display:grid;grid-template-columns:1fr 20px 1fr 20px 1fr 20px 1fr;align-items:start;gap:4px}
.step{border:1.5px solid #e2e2dc;border-radius:10px;padding:.75rem;text-align:center;cursor:pointer;transition:.2s;background:#fff}
.step:hover{border-color:#1a5c3a}
.step.done{border-color:#3b6d11;background:#eaf3de}
.step.prog{border-color:#c8a84b;background:#fef8e7}
.step-arrow{display:flex;align-items:center;justify-content:center;padding-top:18px;color:#b4b2a9}
.step-arrow :deep(svg){width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#e2e2dc;color:#6b6b6b}
.step-circle :deep(svg){width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.step.done .step-circle{background:#eaf3de;color:#3b6d11}
.step.prog .step-circle{background:#fef8e7;color:#854f0b}
.step-num{font-size:11px;color:#6b6b6b;margin:0}
.step-name{font-size:12px;font-weight:600;color:#1a1a1a;margin:2px 0 4px}
.step-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600}
.step-badge.done{background:#eaf3de;color:#3b6d11}
.step-badge.prog{background:#fef8e7;color:#854f0b}
.step-panel{margin-top:12px;border-radius:10px;padding:1rem;border:.5px solid #e2e2dc;display:none}
.step-panel.open{display:block}
.step-panel.done-panel{background:#f6fbf2;border-color:#c0dd97}
.step-panel.prog-panel{background:#fffbf0;border-color:#fac775}
.panel-head{display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:.5px solid #e2e2dc}
.panel-head strong{font-size:14px;font-weight:600;color:#1a1a1a;display:block}
.panel-head p{font-size:12px;color:#6b6b6b;margin:2px 0 0}
.panel-icon{width:40px;height:40px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.panel-icon :deep(svg){width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.panel-icon.done{background:#eaf3de;color:#3b6d11}
.panel-icon.prog{background:#fef8e7;color:#854f0b}
.panel-ml{margin-left:auto}
.info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.info-cell{background:rgba(255,255,255,.7);border-radius:8px;padding:8px 12px}
.info-cell strong{font-size:13px;font-weight:600;color:#1a1a1a;display:block;margin-top:2px}
.doc-list{display:grid;gap:8px;margin-bottom:10px}
.doc-item{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.7);border-radius:8px;padding:8px 12px;font-size:13px;font-weight:500;color:#1a1a1a}
.pay-lines{display:grid;gap:8px;margin-bottom:10px}
.pay-line{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.7);border-radius:8px;padding:8px 12px}
.pay-line strong{font-size:14px;font-weight:600;color:#1a1a1a}
.pay-total{display:flex;justify-content:space-between;align-items:center;background:#fef8e7;border:.5px solid #fac775;border-radius:8px;padding:10px 14px}
.pay-total .label{font-size:14px;font-weight:500;color:#633806}
.pay-total .val{font-size:18px;font-weight:700;color:#633806}
.final-rows{display:grid;gap:8px;margin-bottom:10px}
.final-item{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.7);border-radius:8px;padding:8px 12px;font-size:13px;font-weight:500;color:#1a1a1a}
.note{font-size:12px;color:#6b6b6b;margin:8px 0 0;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,.6)}
.note.warn{background:#fef8e7;color:#854f0b}
.note.ok{background:#eaf3de;color:#3b6d11}
.status-bar{display:flex;gap:8px;margin-top:12px}
.status-item{flex:1;padding:7px;border-radius:8px;font-size:12px;text-align:center;font-weight:600}
.status-item.is-success{background:#dcf5e8;color:#0f6e40}
.status-item.is-warning{background:#fff3e0;color:#b45309}
.status-item.is-neutral{background:#f1f0eb;color:#6b6b6b}
.pay-list{display:grid;gap:0}
.pay-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:.5px solid #e2e2dc;gap:12px}
.pay-row:last-child{border-bottom:none}
.pay-left{display:flex;align-items:center;gap:12px}
.pay-icon{width:36px;height:36px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.pay-icon :deep(svg){width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.pay-icon.green{background:#eaf3de;color:#3b6d11}
.pay-icon.amber{background:#fef8e7;color:#854f0b}
.pay-right-grp{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.pay-actions{display:flex;gap:6px}
.btn-outline{display:flex;align-items:center;gap:4px;padding:5px 12px;border-radius:6px;border:.5px solid #e2e2dc;background:#fff;font-size:12px;cursor:pointer;color:#6b6b6b;transition:.2s}
.btn-outline:hover{color:#1a5c3a;border-color:#1a5c3a}
.btn-outline :deep(svg){width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.profile-header{display:flex;align-items:center;gap:1.25rem;margin-bottom:1.25rem;padding-bottom:1.25rem;border-bottom:.5px solid #e2e2dc}
.avatar{width:64px;height:64px;border-radius:50%;background:#eaf3de;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#3b6d11;flex-shrink:0}
.profile-name{font-size:18px;font-weight:600;color:#1a1a1a}
.profile-email{font-size:13px;color:#6b6b6b;margin:2px 0 0}
.profile-hint{font-size:12px;color:#6b6b6b;margin:4px 0 0}
.profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.profile-item{background:#f5f5f3;border-radius:8px;padding:10px 14px}
.profile-item strong{font-size:14px;font-weight:500;color:#1a1a1a;display:block;margin-top:2px}
.edit-btn{display:flex;align-items:center;gap:6px;background:#1a5c3a;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.edit-btn :deep(svg){width:14px;height:14px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:999}
.modal-backdrop.open{display:flex}
.modal{background:#fff;border-radius:16px;padding:1.5rem;width:min(560px,calc(100% - 32px))}
@media(max-width:991px){
  .stat-row{grid-template-columns:1fr}
  .meta-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .steps{grid-template-columns:1fr}
  .step-arrow{display:none}
  .info-grid{grid-template-columns:1fr}
  .profile-grid{grid-template-columns:1fr}
}
@media(max-width:767px){
  .dashboard-page{padding-top:88px}
  .tabs{flex-wrap:wrap}
  .tab{flex:1 0 40%}
  .facts{grid-template-columns:1fr}
  .meta-grid{grid-template-columns:1fr 1fr}
  .pay-row{flex-direction:column;align-items:flex-start}
  .pay-right-grp{width:100%;justify-content:flex-start}
  .status-bar{flex-direction:column}
  .booking-header{flex-direction:column;gap:8px}
  .card-head{flex-direction:column}
}
</style>
