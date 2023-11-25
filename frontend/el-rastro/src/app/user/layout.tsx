export default function UserLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <>
        <main>
          {/* Include shared UI here e.g. a header or sidebar */}
          {children}
        </main>
      </>
    )
  }