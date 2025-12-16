import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NovaFi Core',
    short_name: 'NovaFi',
    description: 'Next Gen Hybrid Banking Protocol',
    start_url: '/',
    display: 'standalone', // Убирает интерфейс браузера
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/icon', // Ссылка на нашу сгенерированную иконку
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}