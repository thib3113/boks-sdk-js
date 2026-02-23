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

  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      link: '/fr/',
      title: "SDK Boks",
      description: "Reverse Engineering et SDK non-officiel pour les colisettes Boks",
      themeConfig: {
        nav: [
          { text: 'Accueil', link: '/fr/' },
          { text: 'Guide', link: '/fr/guide/' },
          { text: 'Exemples', link: '/fr/examples/' },
          { text: 'Référence API', link: '/docs/index.html', target: '_blank' }
        ],
        sidebar: {
          '/fr/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Démarrage', link: '/fr/guide/' },
                { text: 'Récupérer ses Clés', link: '/fr/guide/credentials' },
                { text: 'Glossaire', link: '/fr/guide/glossary' }
              ]
            },
            {
              text: 'Protocole & Architecture',
              items: [
                { text: 'Protocole BLE', link: '/fr/guide/protocol' },
                { text: 'Algorithme PIN', link: '/fr/guide/pin-algorithm' },
                { text: 'Historique Firmware', link: '/fr/guide/firmware-history' },
                { text: 'Bugs & Particularités', link: '/fr/guide/quirks' }
              ]
            }
          ],
          '/fr/examples/': [
            {
              text: 'Exemples Interactifs',
              items: [
                { text: 'Présentation', link: '/fr/examples/' },
                { text: 'Démo Initialisation', link: '/fr/examples/initialization' },
                { text: 'Démo Ouverture', link: '/fr/examples/open-door' },
                { text: 'Sync Historique', link: '/fr/examples/history' },
                { text: 'Batterie & Matériel', link: '/fr/examples/battery' }
              ]
            }
          ]
        }
      }
    }
  },

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
            { text: 'Retrieving Credentials', link: '/guide/credentials' },
            { text: 'Glossary', link: '/guide/glossary' }
          ]
        },
        {
          text: 'Protocol & Architecture',
          items: [
            { text: 'BLE Protocol', link: '/guide/protocol' },
            { text: 'PIN Algorithm', link: '/guide/pin-algorithm' },
            { text: 'Firmware History', link: '/guide/firmware-history' },
            { text: 'Known Quirks', link: '/guide/quirks' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Interactive Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Initialization Demo', link: '/examples/initialization' },
            { text: 'Open Door Demo', link: '/examples/open-door' },
            { text: 'History Sync', link: '/examples/history' },
            { text: 'Battery & Hardware', link: '/examples/battery' }
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
