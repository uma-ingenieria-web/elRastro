"use client"
import { FilterContextProvider } from "@/context/FilterContext"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FilterContextProvider>{children}</FilterContextProvider>
    </SessionProvider>
  )
}
