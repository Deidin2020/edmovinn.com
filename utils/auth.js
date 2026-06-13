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

export function getAuthToken($auth) {
    const token = $auth?.strategy?.token?.get?.();

    if (typeof token === 'string' && token.trim()) {
        return token;
    }

    return '';
}
