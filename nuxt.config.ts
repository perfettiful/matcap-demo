// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  $production: {
    app: {
      baseURL: '/matcap-demo/',
    }
  },

  app: {
    head: {
      title: 'Matcap Explorer - Three.js Demo',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
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
