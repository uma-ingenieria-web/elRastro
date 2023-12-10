import dynamic from 'next/dynamic';

const StaticMap = dynamic(
  () => import('./StaticMap'),
  {
    ssr: false,
  }
);

export default StaticMap;
