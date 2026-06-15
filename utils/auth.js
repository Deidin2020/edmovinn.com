const AUTH_TOKEN_STORAGE_KEY = 'edmovinn.auth_token';
const AUTH_TOKEN_COOKIE_KEY = 'edmovinn_auth_token';

export function extractAccessToken(payload = {}) {
    if (!payload || typeof payload !== 'object') return null;

    return (
        payload.access_token ||
        payload.token ||
        payload.result?.access_token ||
        payload.result?.token ||
        payload.data?.access_token ||
        payload.data?.token ||
        payload.data?.result?.access_token ||
        payload.data?.result?.token ||
        null
    );
}

export function normalizeBearerToken(token = '') {
    if (!token || typeof token !== 'string') return '';

    return token.replace(/^Bearer\s+/i, '').trim();
}

function getBrowserCookie(name) {
    if (typeof document === 'undefined') return '';

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

    return match ? decodeURIComponent(match[1]) : '';
}

export function persistAuthToken(token = '') {
    const normalizedToken = normalizeBearerToken(token);

    if (!normalizedToken || typeof window === 'undefined') {
        return '';
    }

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken);
    document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=${encodeURIComponent(normalizedToken)}; path=/; max-age=1800; samesite=lax`;

    return normalizedToken;
}

export function readPersistedAuthToken() {
    if (typeof window === 'undefined') return '';

    const localStorageToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const normalizedLocalStorageToken = normalizeBearerToken(localStorageToken || '');

    if (normalizedLocalStorageToken) {
        return normalizedLocalStorageToken;
    }

    return normalizeBearerToken(getBrowserCookie(AUTH_TOKEN_COOKIE_KEY));
}

export function clearPersistedAuthToken() {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

export function getAuthToken($auth) {
    const token = normalizeBearerToken($auth?.strategy?.token?.get?.() || '');

    if (token) {
        return `Bearer ${token}`;
    }

    const persistedToken = readPersistedAuthToken();

    if (persistedToken) {
        return `Bearer ${persistedToken}`;
    }

    return '';
}
