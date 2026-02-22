import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  title: "Boks SDK",
  description: "Unofficial Reverse Engineering & SDK for Boks Parcel Boxes",
  base: process.env.BASE_URL || '/',
  outDir: '../public',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  vite: {
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('../../src', import.meta.url)) }
      ]
    }
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API Reference', link: '/docs/index.html', target: '_blank' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Protocol Details', link: '/guide/protocol' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Interactive Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Initialization Demo', link: '/examples/initialization' },
            { text: 'History Sync', link: '/examples/history' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thib3113/boks-sdk-js' }
    ],

    footer: {
      message: 'Released under ISC License. Not affiliated with Boks.',
      copyright: 'Copyright © 2025-present Thib3113'
    }
  }
})
