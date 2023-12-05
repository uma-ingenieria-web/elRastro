"use client"

import NoProducts from "@/app/components/NoProducts"
import { Product } from "@/app/product.types"
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
  const [loading, setLoading] = useState(true)
  const [bids, setBids] = useState<UserBids>({ open: [], lost: [], won: [] })

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

  return (
    <>
      {!loading && bids.open.length === 0 && bids.won.length === 0 && bids.lost.length === 0 ? (
        <NoProducts />
      ) : (
        <div>
          {bids.open.map((bid) => (
            <div key={bid._id}>
              {bid.title}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Bid
