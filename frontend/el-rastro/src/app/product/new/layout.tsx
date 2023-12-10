import Navbar from "@/app/components/Navbar"

export default function CreateProductLayout({
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