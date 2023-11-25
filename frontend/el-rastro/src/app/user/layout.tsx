import Navbar from "../components/Navbar"

export default function UserLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <>
        <Navbar />
        <main>
          {/* Include shared UI here e.g. a header or sidebar */}
          {children}
        </main>
      </>
    )
  }