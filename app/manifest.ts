import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Website Resmi RT 05 RW 19 Sangkal Putung',
    short_name: 'RT 05 RW 19',
    description: 'Pusat Informasi dan Layanan Publik Digital Warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#0F172A',
    icons: [
      {
        src: '/logo-rt.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-rt.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
