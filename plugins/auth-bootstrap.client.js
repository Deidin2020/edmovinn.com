import { clearPersistedAuthToken, getAuthToken, normalizeBearerToken, persistAuthToken } from '@/utils/auth';

export default async function ({ $auth }) {
    const token = getAuthToken($auth);

    if (!token || $auth.loggedIn) {
        return;
    }

    try {
        persistAuthToken(token);
        await $auth.setUserToken(normalizeBearerToken(token));
        await $auth.fetchUser();
    } catch (error) {
        clearPersistedAuthToken();
        await $auth.reset();
    }
}
