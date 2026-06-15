<script>
export default {
    middleware: ['guest'],
    asyncData({ app, redirect }) {
        return redirect(app.localePath({ path: '/auth', query: { tab: 'signin' } }));
    },
};
</script>
