// Loads .env into the real process.env for server-side use only (server-middleware,
// axios baseURL, ...). Do NOT use @nuxtjs/dotenv here: it writes into `options.env`,
// which Nuxt inlines into the public client bundle key by key.
require('dotenv').config();

export default {
    server: {
        port: process.env.SERVER_PORT || 8000
    },

    // Explicit allowlist of variables exposed to the browser.
    // Without this block Nuxt sets `options.env = process.env`, so every server
    // variable — including the Kuveyt Turk merchant credentials — ends up in the
    // client bundle. Never add a secret here.
    env: {
        API_URL           : process.env.API_URL || '',
        API_BASE_URL      : process.env.API_BASE_URL || '',
        HOST_NAME         : process.env.HOST_NAME || '',
        ALGOLIA_APP_ID    : process.env.ALGOLIA_APP_ID || '',
        ALGOLIA_SEARCH_KEY: process.env.ALGOLIA_SEARCH_KEY || '',
    },

    ssr: true,
    target: 'server',
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'edmovinn',
        titleTemplate: '%s',
        meta: [
            {charset: 'utf-8'},
            {name: 'viewport', content: 'width=device-width, initial-scale=1'},
            { property: 'og:image', content: 'https://edmovinn.com/img/edmovinn-logo-Main.png' }, 
            { property: 'og:url', content: 'https://edmovinn.com' },

             // Twitter Card Tags
            { name: 'twitter:card', content: 'https://edmovinn.com/img/edmovinn-logo-Main.png' },
            { name: 'twitter:site', content: '@edmovinn' }, 
            { name: 'twitter:title', content: 'edmovinn' },
            { name: 'twitter:description', content: ''},
            { name: 'twitter:image', content: 'https://edmovinn.com/img/edmovinn-logo-Main.png' },

            {hid: 'meta_description', name: 'meta_description', content: ''},
            {hid: 'meta_title', name: 'meta_title', content: ''},
            {name: 'format-detection', content: 'telephone=no'}
        ],
        link: [
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/favicon.ico'
            }
        ],
        script: [
            {
              hid: 'gtm-script',
              innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-N2X95CJZ');`,
              type: 'text/javascript',
              charset: 'utf-8'
            }
          ],
          __dangerouslyDisableSanitizersByTagID: {
            'gtm-script': ['innerHTML']
          }
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        'assets/scss/app.scss'
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        '~~/plugins/direction-control',
        '~/plugins/vue-awesome-swiper.js',
        '~/plugins/vue-cool-lightbox.js',
        '~/plugins/vue-pagination.js',
        '~/plugins/vue-phone.js',
        '~/plugins/vue-inline-svg.js',
        '~/plugins/observe-visibility.js',
        '~/plugins/vue-masonry-css.js',
        '~/plugins/schemas-generator.js',
        '~/plugins/axios.js',
        '~/plugins/algolia.js',
        '~/plugins/auth-bootstrap.client.js',
        '~/plugins/booking-api.js',
        {
            src: '~/plugins/bootstrap.bundle.min.js',
            mode: 'client'
        },
        {
            src: "~/plugins/aos.js",
            ssr: false
        },
        {src: "~/plugins/vue2-google-maps", ssr: true},
        {src: '~/plugins/sweet-alert', mode: 'client'}
    ],

    components: {
        dirs: [
            '~/components',
            '~/components/frontend',
            '~/components/frontend/auth',
            '~/components/frontend/common',
            '~/components/frontend/home',
            '~/components/frontend/layouts',
            '~/components/global',
            '~/components/search'
        ]
    },
    router: {
        middleware: [
            // 'redirect-auth',
        ],
    },
    serverMiddleware: [
        { path: '/api/kuveyt', handler: '~/server-middleware/kuveyt.js' }
    ],
    
    buildModules: [
        '@nuxtjs/style-resources',
        '@nuxtjs/pwa',
    ],

    styleResources: {
        scss: [
        ]
    },

    modules: [
        '@nuxtjs/axios',
        '@nuxtjs/i18n',
        'nuxt-vue-multiselect',
        ['cookie-universal-nuxt', {alias: 'cookiz'}],
        '@nuxtjs/auth-next',
        'dropzone-nuxt',
    ],


    auth: {
        strategies: {
            local: {
                endpoints: {
                    login: {
                        url: '/api/tenant/login',
                        method: 'post'
                    },
                    logout: {
                        url: '/api/tenant/logout',
                        method: 'get'
                    },
                    user: {
                        url: '/api/tenant/me',
                        method: 'get',
                    }
                },
                token: {
                    property: 'access_token',
                    type: 'Bearer',
                    maxAge: 1800
                },
                user: {
                    property: 'result.tenant'
                }
            }
        },

        redirect: {
            login   : '/auth',
            home    : false,
            logout  : false,
            callback: false
        }
    },

    build: {
        transpile: [
            ['cookie-universal-nuxt', {alias: 'cookiz'}],
            'vue2-google-maps'
        ],
        dir: '.nuxt',
        terser: {
            terserOptions: {
                compress: true,
                mangle: true,   
            }
        },
        extractCSS: true, 
        optimizeCSS: true  
    },
    axios: {
        proxy: false,
        proxyHeader: false,
        baseURL: process.env.API_URL
    },

    i18n: {
        locales: [
            {
                code: 'en',
                iso: 'en-US',
                file: 'en.js',
                dir: 'ltr',
                name: 'English',
                flag: '/media/flags/united-states.svg'
            },
            {
                code: 'ar',
                iso: 'ar-EG',
                file: 'ar.js',
                dir: 'rtl',
                name: 'عربي',
                flag: '/media/flags/saudi-arabia.svg'
            },
             {
                code: 'tr',
                iso: 'tr-TR',
                file: 'tr.js',
                dir: 'ltr',
                name: 'Turkish',
                flag: '/media/flags/saudi-arabia.svg'
            },
        ],
        vueI18n: {
            fallbackLocale: 'en'
        },
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected'
        },
        defaultLocale: 'en',
        defaultDirection: 'ltr',
        langDir: '~/locales/'
    },

    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: ['babel-loader'],
                    exclude: /node_modules(?!\/vue-chartjs\/)/
                }
            ]
        }
    },


}
