import { getAuthToken } from '@/utils/auth';

function syncRequestHeaders($axios, app, $auth) {
    $axios.setHeader('local', app.i18n.locale);

    const token = getAuthToken($auth);
    $axios.setHeader('Authorization', token || false);
}

export default function ({ $axios, redirect, app, $auth }) {
    syncRequestHeaders($axios, app, $auth);

    $axios.onRequest(config => {
        syncRequestHeaders($axios, app, $auth);
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



