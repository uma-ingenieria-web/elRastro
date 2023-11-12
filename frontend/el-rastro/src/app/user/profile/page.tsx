import Image from 'next/image'

export default function UserProfilePage({
  children,
} : {
  children: React.ReactNode
}) {
  return (
    <>
      <h1>User Profile</h1> 
      <div>
        {children}
      </div>
    </>
  )
}
