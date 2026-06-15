const POST_AUTH_REDIRECT_KEY = 'post_auth_redirect';

function isClient() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizePath(path = '') {
    if (typeof path !== 'string') return '';

    const trimmed = path.trim();

    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return '';

    return trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`;
}

export function setPostAuthRedirect(path = '') {
    if (!isClient()) return;

    const normalizedPath = normalizePath(path);

    if (!normalizedPath) return;

    window.localStorage.setItem(POST_AUTH_REDIRECT_KEY, normalizedPath);
}

export function getPostAuthRedirect() {
    if (!isClient()) return '';

    return normalizePath(window.localStorage.getItem(POST_AUTH_REDIRECT_KEY) || '');
}

export function clearPostAuthRedirect() {
    if (!isClient()) return;

    window.localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
}

export function consumePostAuthRedirect() {
    const redirectPath = getPostAuthRedirect();
    clearPostAuthRedirect();
    return redirectPath;
}

export function resolvePostAuthRedirect({ redirectPath = '', locale = 'en', localePath, fallback = '/dashboard' } = {}) {
    const normalizedRedirectPath = normalizePath(redirectPath);
    const normalizedFallbackPath = normalizePath(fallback) || '/dashboard';
    const localePrefix = `/${locale}`;

    if (normalizedRedirectPath) {
        if (normalizedRedirectPath === localePrefix || normalizedRedirectPath.startsWith(`${localePrefix}/`)) {
            return normalizedRedirectPath;
        }

        if (typeof localePath === 'function') {
            return localePath(normalizedRedirectPath);
        }

        return normalizedRedirectPath;
    }

    if (typeof localePath === 'function') {
        return localePath(normalizedFallbackPath);
    }

    return normalizedFallbackPath;
}
