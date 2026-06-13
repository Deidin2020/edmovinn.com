import { getAuthToken } from '@/utils/auth';

const PUBLIC_TENANT_ENDPOINTS = [
    '/api/tenant/login',
    '/api/tenant/register',
    '/api/tenant/forgot-password',
    '/api/tenant/verify-forgot-otp',
    '/api/tenant/resend-mobile-code',
    '/api/tenant/reset-password',
    '/api/tenant/auth/google/url',
    '/api/tenant/google/url',
    '/api/tenant/gmail',
];

function shouldAttachAuthHeader(url = '') {
    if (!url || typeof url !== 'string') return false;
    if (!url.startsWith('/api/tenant/')) return false;

    return !PUBLIC_TENANT_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
}

export default function ({ $axios, redirect, app, $auth }) {
    $axios.setHeader('local', app.i18n.locale);
    $axios.setHeader('Authorization', false);

    $axios.onRequest(config => {
        config.headers = config.headers || {};
        config.headers.local = app.i18n.locale;

        const token = getAuthToken($auth);

        if (token && shouldAttachAuthHeader(config.url)) {
            config.headers.Authorization = token;
        } else if (config.headers.Authorization) {
            delete config.headers.Authorization;
        }

        return config;
    });

    $axios.onError(error => {
        const code = parseInt(error.response && error.response.status);

        if (code === 401) {
            const lang = app.i18n.locale;

            if (lang === 'en') {
                redirect('/auth');
            } else {
                redirect('/' + lang + '/auth');
            }
        }

        return Promise.reject(error);
    });
}



