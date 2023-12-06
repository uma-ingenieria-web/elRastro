"use client"

import BidCard from "@/app/components/BidCard"
import NoBids from "@/app/components/NoBids"
import NotFound from "@/app/not-found"
import { Product } from "@/app/product.types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

let productUrl = ""
if (process.env.NODE_ENV === "development") {
  productUrl = `http://localhost:8002/api/v1/products`
} else {
  productUrl = `http://backend-micro-products/api/v1/products`
}

interface UserBids {
  open: Product[]
  lost: Product[]
  won: Product[]
}

async function getBids(id: string) {
  try {
    const result = await fetch(productUrl + `/bids/${id}`)
    const products = await result.json()
    return products
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is the backend service working?"
      )
      return []
    }
    console.error("Error fetching products:", error.message)
    return []
  }
}

function Bid({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [bids, setBids] = useState<UserBids>({ open: [], lost: [], won: [] })

  const userId = (session?.user as LoggedUser)?.id || ""

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getBids(params.id)
        setBids(products)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  return userId !== "" && userId !== params.id ? (
    <NotFound /> 
  ) : (
    <div className="mb-8">
      {!loading &&
      bids.open.length === 0 &&
      bids.won.length === 0 &&
      bids.lost.length === 0 ? (
        <NoBids loggedIn={(userId !== "" && userId === params.id)} />
      ) : (
        <div className="space-y-6">
          {bids.open.length > 0 && (
            <BidCard title="Open" color="blue" products={bids.open} />
          )}
          {bids.won.length > 0 && (
            <BidCard title="Won" color="green" products={bids.won} />
          )}
          {bids.lost.length > 0 && (
            <BidCard title="Lost" color="red" products={bids.lost} />
          )}
        </div>
      )}
    </div>
  )
}

export default Bid
