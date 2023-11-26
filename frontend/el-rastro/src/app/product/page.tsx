"use client"

import dynamic from "next/dynamic"
import ProductCard from "../components/ProductCard"
import Filter from "../components/Filter"
import { useContext, useEffect, useState } from "react"
import { FilterContext } from "@/context/FilterContext"

const OpenStreetMap = dynamic(() => import("../components/Map"), {
  ssr: false,
})

let apiUrl = ""
if (process.env.NODE_ENV === "development") {
  apiUrl = `http://localhost:8002/api/v1/products`
} else {
  apiUrl = `http://backend-micro-products/api/v1/products`
}

async function getProducts() {
  try {
    const result = await fetch(apiUrl)
    const products = await result.json()
    return products
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is backend service working?"
      )
      return []
    }
    console.error("Error fetching products:", error.message)
    return []
  }
}

interface User {
  id: string
  username: string
  image: string
}

interface Bid {
  id: string
  amount: number
  bidder: User
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  initialPrice: number
  initialDate: Date
  closeDate: Date
  weight: number
  owner: User
  bids: Bid[]
}

export default function ProductMenu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // const algo = useContext(FilterContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts()
        setProducts(products)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {loading ? (
        <div className="h-[100vh] flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-black">Loading products...</h2>
          <h3 className="text-2xl font-semibold dark:text-gray-400 text-black">Hang on there...</h3>

          <div className="flex items-center justify-center w-32 h-32 border border-gray-200 rounded-full bg-gray-50 dark:bg-gray-800 dark:border-gray-700 mt-4">
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex">
          <Filter />
          <section className="flex flex-col p-4 mt-5 justify-center text-center">
            <div className="flex items-center justify-center mb-10">
              <h1 className="text-4xl font-bold text-black">
                Explore our products
              </h1>
            </div>

            <div className="grid grid-cols-1 px-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center place-content-center">
              {products.map((product: Product) => (
                <ProductCard
                  image={"https://picsum.photos/800/400"}
                  key={product.id}
                  {...product}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
