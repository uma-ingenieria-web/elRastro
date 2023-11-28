import Navbar from "@/app/components/Navbar"

export default function ProductLayout({
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