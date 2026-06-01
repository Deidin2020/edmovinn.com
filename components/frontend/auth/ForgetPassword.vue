<template>
  <div class="forgot-card">
    <div class="forgot-card__header">
      <h3 class="forgot-card__title">
        {{ $t('pages.forgotPassword.title') }}
      </h3>
      <p class="forgot-card__description">
        {{ $t('pages.forgotPassword.description') }}
      </p>
    </div>

    <form class="forgot-card__form" @submit.prevent="forgotPassword">
      <div class="forgot-card__field">
        <label>{{ $t('inputs.phone') }}</label>

        <vue-phone-number-input
          v-model="contact_number"
          :placeholder="$t('phone_number.placeholder')"
          mode="international"
          :translations="translations"
          :default-country-code="country_code"
          @update="updatePhoneNumber"
        />

        <small
          v-if="errors && 'mobile' in errors"
          class="text-sm text-danger"
          v-for="(fieldError, index) in errors['mobile']"
          :key="`mobile-${index}`"
        >
          {{ fieldError }}<br>
        </small>

        <small v-if="error" class="text-sm text-danger">
          {{ error }}
        </small>
      </div>

      <button
        type="submit"
        class="forgot-card__submit"
        :disabled="loading"
      >
        <span>{{ loading ? actionCopy.loading : $t('actions.continue') }}</span>
      </button>
    </form>

    <div class="forgot-card__footer">
      <p>{{ actionCopy.backLabel }}</p>
      <NuxtLink :to="localePath('/auth')">
        {{ $t('actions.login') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

const ACTION_COPY = {
  en: {
    loading: 'Sending code...',
    backLabel: 'Remembered your password?',
  },
  ar: {
    loading: 'جاري إرسال الرمز...',
    backLabel: 'تذكرت كلمة المرور؟',
  },
};

export default {
  data() {
    return {
      contact_number: null,
      mobile: null,
      error: null,
      errors: {},
      loading: false,
      translations: {
        phoneNumberLabel: this.$t('inputs.phone_number_placeholder'),
      },
    };
  },
  computed: {
    ...mapGetters({
      country_code: 'visitor/countryCode',
    }),
    actionCopy() {
      return this.$i18n.locale === 'ar' ? ACTION_COPY.ar : ACTION_COPY.en;
    },
  },
  mounted() {
    this.fetchVisitorInfo();
  },
  methods: {
    ...mapActions('visitor', ['fetchVisitorInfo']),
    updatePhoneNumber({ formattedNumber }) {
      this.mobile = formattedNumber;
      this.error = null;
      this.errors = {};
    },
    forgotPassword() {
      if (!this.mobile) {
        this.error = this.$t('validations.required');
        return;
      }

      this.loading = true;

      this.$axios.$post('/api/tenant/forgot-password', {
        mobile: this.mobile,
      })
        .then((value) => {
          this.$successAlert(value.message ?? this.$t('notification.success'));
          this.$router.push(this.localePath('/auth/password-otp?mobile=' + this.mobile));
        })
        .catch((errors) => {
          if (errors.response.status !== 422) {
            this.$dangerAlert(this.$t('notification.error_occurred'));
          }

          this.errors = errors.response.data.errors;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.forgot-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  padding: 2rem;
}

.forgot-card__header {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.forgot-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.7rem;
  font-weight: 800;
}

.forgot-card__description {
  margin: 0;
  color: #64748b;
  line-height: 1.8;
}

.forgot-card__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.forgot-card__field {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.forgot-card__field label {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.forgot-card__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3.25rem;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #0284c7, #0f766e);
  color: #ffffff;
  font-size: 0.96rem;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.forgot-card__submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(2, 132, 199, 0.22);
}

.forgot-card__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.forgot-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
}

.forgot-card__footer p {
  margin: 0;
}

.forgot-card__footer a {
  color: #0284c7;
  font-weight: 700;
}

@media (max-width: 575px) {
  .forgot-card {
    padding: 1.35rem;
  }

  .forgot-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
