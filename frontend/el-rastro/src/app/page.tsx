import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <section className="hero">
        <h1 className="text-8xl font-bold text-center">El Rastro</h1>
        <h2 className="text-lg">The online marketplace for buying and selling products.</h2>
        
      </section>
      <section className="navigation flex justify-center space-x-4 mt-8">
        <Link href="auth/log-in" className="bg-yellow-500 text-white px-8 py-4 rounded-lg">Login</Link>
        <Link href="auth/sign-up" className="bg-gray-500 text-white px-8 py-4 rounded-lg">Sign up</Link>
      </section>
      <section className="navigation flex justify-center space-x-4 mt-8">
        <Link href="user" className="bg-blue-500 text-white px-8 py-4 rounded-lg">User</Link>
        <Link href="product" className="bg-green-500 text-white px-8 py-4 rounded-lg">Product</Link>
        <Link href="chat" className="bg-red-500 text-white px-8 py-4 rounded-lg">Chat</Link>
      </section>
    </main>
  )
}
