import Image from 'next/image'

export default function ChatPage({
  children,
} : {
  children: React.ReactNode
}) {
  return (
    <section>
    <h1>Chat Menu</h1> 
    <div>
      {children}
    </div>
   </section>
  )
}
