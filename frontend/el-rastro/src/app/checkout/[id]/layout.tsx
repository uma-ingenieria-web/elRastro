import Navbar from "@/app/components/Navbar"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main>
        {children}
      </main>
    </>
  )
}