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
  const result = await fetch(apiUrl, { method: "GET" })
  const products = await result.json()
  return products
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
}

export default async function ProductMenu() {
  const products = await getProducts()

  return (
    <section className="flex flex-col p-4 mt-12 justify-center">
      <div className="flex items-center justify-center mb-10">
        <h1 className="text-6xl font-bold">Products</h1>
      </div>
      <section className="grid grid-cols-1 px-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center place-content-center">
        {products.map((product: Product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </section>
    </section>
  )
}
