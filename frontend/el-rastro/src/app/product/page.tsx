"use client";

import dynamic from 'next/dynamic';
const OpenStreetMap = dynamic(() => import('../components/Map'), {
  ssr: false,
})

export default function ProductMenu() {
  return (
    <section>
    <h1>Products Menu</h1> 
    {/* <OpenStreetMap /> */}
    </section>
  )
}
