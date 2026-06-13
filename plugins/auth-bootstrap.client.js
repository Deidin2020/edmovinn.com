import { getAuthToken } from '@/utils/auth';

export default async function ({ $auth }) {
    const token = getAuthToken($auth);

    if (!token || $auth.loggedIn) {
        return;
    }

    try {
        await $auth.fetchUser();
    } catch (error) {
        await $auth.reset();
    }
}
