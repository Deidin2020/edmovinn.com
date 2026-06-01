<template>
  <div id="main-wrapper" class="main-wrapper">
    <BreadCrumb :title="item.title" />
    <section class="privacy-policy-area">
      <div class="container">
        <div class="row row--30">
          <div class="col-lg-8 m-auto">
            <div class="privacy-policy">
              <div class="text-block">
                <h3 class="title">{{ item.title }}</h3>
              </div>
              <div>
                <div v-html="item.description"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    try {
      const { data } = await $axios.get('/api/pages/privacy-policy');
      return { item: data.result.page || {} };
    } catch (error) {
      return { item: {} };
    }
  },

  head() {
    return {
      title: this.item.title,
      script: [
        {
          type: 'application/ld+json',
          json: this.$generateBreadCrumbSchema([
            {
              name: 'Home',
              url: 'https://edmovinn.com'
            },
            {
              name: this.item.title,
              url: 'https://edmovinn.com/privacy-policy'
            }
          ])
        }
      ],
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.item.meta_description
        }
      ]
    };
  }
};
</script>