
export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="bg-gradient-to-tr from-white to-slate-200">
          {children}
      </main>
    </>
  )
}