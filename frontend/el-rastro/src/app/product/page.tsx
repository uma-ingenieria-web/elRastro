import dynamic from "next/dynamic"
import ProductCard from "../components/ProductCard"
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
    const result = await fetch(apiUrl, { method: "GET" })
    const products = await result.json()
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

interface Owner {
  id: string
  username: string
  image: string
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
  owner: Owner
}

export default async function ProductMenu() {
  const products = await getProducts()

  return (
    <section className="flex flex-col p-4 mt-5 justify-center">
      <div className="flex items-center justify-center mb-10">
        <h1 className="text-6xl font-bold">Explore our products</h1>
      </div>
      {/* Add a lateral hamburger menu to filter by my products or products i have bidded for */}
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
  )
}
