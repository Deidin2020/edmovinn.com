<template>
  <button class="google-auth-button" @click="loginWithGoogle">
    <img src="/img/auth/icon-google.svg" alt="google" title="google" />
    <span>{{ this.$t('login_with_google') }}</span>
  </button>
</template>

<script>
export default {
  methods: {
    async loginWithGoogle() {
      try {
        const endpoints = [
          '/api/tenant/auth/google/url',
          '/api/tenant/google/url',
          '/api/tenant/gmail',
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await this.$axios.get(endpoint);
            const redirectUrl = response?.data?.redirectUrl || response?.data?.result?.redirect_url;

            if (redirectUrl) {
              window.location.href = redirectUrl;
              return;
            }
          } catch (error) {
            if (endpoint === endpoints[endpoints.length - 1]) {
              throw error;
            }
          }
        }

        this.$dangerAlert(this.$t('notification.error_occurred'));
      } catch (error) {
        this.$dangerAlert(error?.response?.data?.message ?? this.$t('notification.error_occurred'));
      }
    },
  }
}
</script>

<style scoped>
.google-auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3rem;
  margin-top: 0.75rem;
  padding: 0.8rem 1rem;
  border: 1px solid #d7deeb;
  border-radius: 14px;
  background: #ffffff;
  color: #111827;
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.google-auth-button:hover {
  transform: translateY(-1px);
  border-color: #c8d4ec;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.google-auth-button img {
  width: 20px;
  height: 20px;
}
</style>
