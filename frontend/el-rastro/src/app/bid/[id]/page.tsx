"use client"

import NoBids from "@/app/components/NoBids"
import ProductGrid from "@/app/components/ProductGrid"
import NotFound from "@/app/not-found"
import { Product } from "@/app/product.types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

let productUrl = ""
if (process.env.NODE_ENV === "development") {
  productUrl = `http://localhost:8002/api/v1/products`
} else {
  productUrl = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_PRODUCT_SERVICE?? "http://localhost:8002"}/api/v1/products`
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
        <NoBids loggedIn={userId !== "" && userId === params.id} />
      ) : (
        <div className="space-y-6">
          {bids.open.length > 0 && (
            <>
              <section
                className={`bid-section bg-gradient-to-r from-blue-300 to-blue-500 border border-blue-500 rounded-md shadow-md p-6 mb-6 transform transition-transform hover:scale-105`}
              >
                <div className="flex flex-col items-center justify-center">
                  <h2
                    className={`text-5xl pt-3 font-bold mb-4 text-white`}
                  >
                    Open
                  </h2>
                </div>
              </section>
              <div className="mb-6">
                <ProductGrid products={bids.open} activeOwner="" />
              </div>
            </>
          )}
          {bids.won.length > 0 && (
            <>
              <section
                className={`bid-section bg-gradient-to-r from-green-300 to-green-500 border border-green-500 rounded-md shadow-md p-6 mb-6 transform transition-transform hover:scale-105`}
              >
                <div className="flex flex-col items-center justify-center">
                  <h2
                    className={`text-5xl pt-3 font-bold mb-4 text-white`}
                  >
                    Won
                  </h2>
                </div>
              </section>
              <div className="mb-6">
                <ProductGrid products={bids.won} activeOwner="" />
              </div>
            </>
          )}
          {bids.lost.length > 0 && (
            <>
              <section
                className={`bid-section bg-gradient-to-r from-red-300 to-red-500 border border-red-500 rounded-md shadow-md p-6 mb-6 transform transition-transform hover:scale-105`}
              >
                <div className="flex flex-col items-center justify-center">
                  <h2
                    className={`text-5xl pt-3 font-bold mb-4 text-white`}
                  >
                    Lost
                  </h2>
                </div>
              </section>
              <div className="mb-6">
                <ProductGrid products={bids.lost} activeOwner="" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Bid
