import Image from 'next/image'

export default function UserPage({
  children,
} : {
  children: React.ReactNode
}) {
  return (
    <>
      <h1>User Menu</h1> 
      <div>
        {children}
      </div>
    </>
  )
}
