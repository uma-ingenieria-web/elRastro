import Image from 'next/image'

export default function ProductMenu({
  children,
} : {
  children: React.ReactNode
}) {
  return (
    <section>
    <h1>Products Menu</h1> 
    <div>
      {children}
    </div>
   </section>
  )
}
