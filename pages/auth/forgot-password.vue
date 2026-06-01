<template>
  <main class="forgot-password-page">
    <section class="forgot-shell">
      <div class="forgot-shell__content">
        <div class="forgot-shell__intro">
          <span class="forgot-shell__eyebrow">{{ content.eyebrow }}</span>
          <h1>{{ content.title }}</h1>
          <p>{{ content.description }}</p>

          <ul class="forgot-shell__highlights">
            <li v-for="item in content.highlights" :key="item">
              <span class="forgot-shell__bullet"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="forgot-shell__card">
          <ForgetPassword />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
const COPY = {
  en: {
    eyebrow: 'Account recovery',
    title: 'Reset your password without friction',
    description: 'Enter your mobile number and we will send a one-time code so you can securely create a new password.',
    highlights: [
      'OTP is sent to your registered mobile number.',
      'The flow takes less than two minutes.',
      'You will choose a fresh password after verification.',
    ],
  },
  ar: {
    eyebrow: 'استعادة الحساب',
    title: 'استرجاع كلمة المرور بشكل واضح وسريع',
    description: 'أدخل رقم الموبايل المرتبط بحسابك وسنرسل لك رمز تحقق لمرة واحدة حتى تنشئ كلمة مرور جديدة بأمان.',
    highlights: [
      'سيصل رمز التحقق على رقم الموبايل المسجل.',
      'العملية بالكامل لا تأخذ أكثر من دقائق قليلة.',
      'بعد التحقق ستتمكن من تعيين كلمة مرور جديدة مباشرة.',
    ],
  },
};

export default {
  middleware: ['guest'],
  computed: {
    content() {
      return this.$i18n.locale === 'ar' ? COPY.ar : COPY.en;
    },
  },
};
</script>

<style scoped>
.forgot-password-page {
  min-height: calc(100vh - 4rem);
  padding: 6rem 1.25rem 2rem;
  background:
    radial-gradient(circle at top left, rgba(0, 163, 255, 0.16), transparent 32%),
    radial-gradient(circle at bottom right, rgba(21, 94, 239, 0.18), transparent 28%),
    linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%);
}

.forgot-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.forgot-shell__content {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 460px);
  gap: 2rem;
  align-items: stretch;
}

.forgot-shell__intro,
.forgot-shell__card {
  border: 1px solid rgba(201, 213, 225, 0.9);
  border-radius: 30px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.08);
}

.forgot-shell__intro {
  padding: 3rem;
  background:
    linear-gradient(135deg, rgba(14, 116, 144, 0.96), rgba(10, 37, 64, 0.94)),
    #0f172a;
  color: #f8fafc;
}

.forgot-shell__eyebrow {
  display: inline-flex;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #bae6fd;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.forgot-shell__intro h1 {
  margin: 1.25rem 0 1rem;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
  color: #ffffff;
}

.forgot-shell__intro p {
  max-width: 46rem;
  margin: 0;
  color: rgba(226, 232, 240, 0.92);
  font-size: 1rem;
  line-height: 1.9;
}

.forgot-shell__highlights {
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1rem;
}

.forgot-shell__highlights li {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.forgot-shell__bullet {
  width: 0.7rem;
  height: 0.7rem;
  flex: 0 0 0.7rem;
  border-radius: 999px;
  background: #38bdf8;
  box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.16);
}

.forgot-shell__card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
}

@media (max-width: 991px) {
  .forgot-password-page {
    padding-top: 5.5rem;
  }

  .forgot-shell__content {
    grid-template-columns: 1fr;
  }

  .forgot-shell__intro,
  .forgot-shell__card {
    border-radius: 24px;
  }

  .forgot-shell__intro {
    padding: 2rem;
  }
}

@media (max-width: 575px) {
  .forgot-password-page {
    padding-inline: 0.9rem;
  }

  .forgot-shell__intro {
    padding: 1.5rem;
  }
}
</style>
