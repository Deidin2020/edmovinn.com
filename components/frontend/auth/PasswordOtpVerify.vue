<template>
  <div>
    <div class="row form-section col-md-10">
      <div class="login-form-box mt-5 pt-5">
        <h3 class="title">
          {{ $t('pages.verify.title') }}
        </h3>

        <p>
          {{ $t('pages.verify.description') }}
          <span class="text-primary">
            {{ form?.mobile }}
          </span>
        </p>
        <div class="row">
          <OtpInput @value="form.code = $event" :is-valid="!error">
            <template #errorMessage>
              <small class="text-sm text-danger">
                {{ error }}
              </small>
            </template>
          </OtpInput>

          <div class="form-group w-100 mt-5">
            <button class="btn btn-primary w-100 mt-15" type="button" @click="verifyMobile">
              {{ $t('actions.continue') }}
            </button>
          </div>

          <div class="resend pt-2 text-center w-100">
            <p>
              {{ $t('pages.verify.did_not_receive_code') }}

              <span v-if="resendTimer > 0">
                ({{ resendTimer }}s)
              </span>

              <a href="#" @click.prevent="resendCode" v-else>
                {{ $t('actions.resend') }}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        mobile: null,
        code: null,
      },
      error: null,
      redirect: null,
      resendTimer: 0,
      resendInterval: null,
      SendCode: true,
    }
  },
  mounted() {
    if (this.$route.query.mobile) {
      // get mobile number from query params and add + to it and remove spaces from number
      this.form.mobile = '+' + this.$route.query.mobile.replace(/\s/g, '')
      localStorage.setItem('mobile', this.form.mobile)
    }

    this.form.mobile = localStorage.getItem('mobile')

    if (!this.form.mobile) {
      this.$router.push(this.localePath({ path: '/auth', query: { tab: 'signup' } }))
    }
    this.resendTimer = 30

    this.resendInterval = setInterval(() => {
      if (this.resendTimer > 0) {
        this.resendTimer--
      } else {
        clearInterval(this.resendInterval)
      }
    }, 1000)
  },
  methods: {
    // sendVerificationCode(){
    //   this.resendCode();
    //   this.SendCode=false;
    //   this.resendTimer = 60;
    //   },
    verifyMobile() {
      this.error = null

      if (!this.form.code || this.form.code.length !== 6) {
        this.error = this.$t('notification.invalid_code');
        return;
      }
      this.$axios.$post('api/tenant/verify-forgot-otp', this.form)
        .then(response => {
          //  console.log(response)
          this.$successAlert(response.message)

          localStorage.setItem('reset_token', response.result.reset_token)

          this.$router.push(this.localePath('/auth/reset-password?reset_token=' + response.result.reset_token))
        }).catch(error => {
          // console.log(error)
          this.error = error.response.data.message
        })
    },
    resendCode() {
      this.$axios.$post('api/tenant/resend-mobile-code', { mobile: this.form.mobile })
        .then(response => {
          this.$successAlert(response.message)

          this.resendTimer = 30

          this.resendInterval = setInterval(() => {
            if (this.resendTimer > 0) {
              this.resendTimer--
            } else {
              clearInterval(this.resendInterval)
            }
          }, 1000)
        }).catch(error => {
          this.$dangerAlert(error.response.data.message)
        })
    }
  },
  beforeDestroy() {
    clearInterval(this.resendInterval)
  },
}
</script>
