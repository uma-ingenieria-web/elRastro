import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Hello World</h1>
	  <Link href="user" style={{backgroundColor:"blue", padding:"40px 80px"}}>User</Link>
	  <Link href="product" style={{backgroundColor:"green", padding:"40px 80px"}}>Product</Link>
	  <Link href="chat" style={{backgroundColor:"red", padding:"40px 80px"}}>Chat</Link>
    </main>)
}
