import { Navbar } from "flowbite-react"

export default function DashboardLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <>
          <Navbar />
          {children}
        </>
    )
  }