export default async function ({ $auth }) {
    const token = $auth?.strategy?.token?.get?.();

    if (!token || $auth.loggedIn) {
        return;
    }

    try {
        await $auth.fetchUser();
    } catch (error) {
        await $auth.reset();
    }
}
