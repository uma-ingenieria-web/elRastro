import Navbar from "../components/Navbar"

export default function DashboardLayout({
    children, // will be a page or nested layout
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