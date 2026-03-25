// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  app: {
    baseURL: '/matcap-demo/',
    head: {
      title: 'Matcap Explorer - Three.js Demo',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/matcap-demo/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/matcap-demo/favicon.png' }
      ],
      meta: [
        { name: 'description', content: 'Interactive demo showcasing Matcap materials in Three.js with PBR comparison' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      (await import('@tailwindcss/vite')).default()
    ],
    optimizeDeps: {
      include: ['lucide-vue-next', 'three']
    }
  }
})
