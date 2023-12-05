"use client"

import ProductCard from "@/app/components/ProductCard"
import Filter from "@/app/components/Filter"
import { useContext, useEffect, useState } from "react"
import { FilterContext } from "@/context/FilterContext"
import NoProducts from "@/app/components/NoProducts"
import { Product } from "@/app/product.types"
import FilterPill from "@/app/components/FilterPill"

let productUrl = ""
let photoUrl = ""
if (process.env.NODE_ENV === "development") {
  productUrl = `http://localhost:8002/api/v1/products`
  photoUrl = `http://localhost:8003/api/v1/photo/`
} else {
  productUrl = `http://backend-micro-products/api/v1/products`
  photoUrl = `http://backend-micro-image-storage/api/v1/photo/`
}


async function getPhoto(id: string) {
  try {
    const photo_result = await fetch(photoUrl + id)
    const url = await photo_result.json()
    return url
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is the backend service working?"
      )
      return "https://picsum.photos/800/400"
    }
    console.error("Error fetching photo:", error.message)
    return "https://picsum.photos/800/400"
  }
}

async function getProducts(
  orderInitialDate: number,
  orderCloseDate: number,
  minPrice: number,
  maxPrice: number,
  title: string,
  owner: string
) {
  try {
    const result = await fetch(
      productUrl +
        `?orderInitialDate=${orderInitialDate}&orderCloseDate=${orderCloseDate}&minPrice=${minPrice}&maxPrice=${maxPrice}&title=${title}&username=${owner}`
    )
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

interface ProductListProps {
  activeOwner: string
  ownerId: string
}

export default function ProductList(props: ProductListProps) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [ownerPhoto, setOwnerPhoto] = useState("https://picsum.photos/800/400")

  const {
    activeMinPrice,
    activeMaxPrice,
    activeTitle,
    activeOrderInitialDate,
    activeOrderCloseDate,
    handleClearTitle,
    handleClearMinPrice,
    handleClearMaxPrice,
    handleClearOrderInitialDate,
    handleClearOrderCloseDate,
  } = useContext(FilterContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts(
          activeOrderInitialDate,
          activeOrderCloseDate,
          activeMinPrice,
          activeMaxPrice,
          activeTitle,
          props.activeOwner
        )
        setProducts(products)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [
    activeMinPrice,
    activeMaxPrice,
    activeTitle,
    activeOrderInitialDate,
    activeOrderCloseDate,
  ])

  useEffect(() => {
    const fetchOwnerPhoto = async () => {
      const url = await getPhoto(props.ownerId)
      setOwnerPhoto(url)
    }

    if (props.ownerId != "") {
      fetchOwnerPhoto()
    }
  }, [props.ownerId])

  const owner = props.activeOwner.split("#")[0]

  return (
    <>
      {!loading && products.length == 0 ? (
        <NoProducts />
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          {loading ? (
            <div className="h-[100vh] flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-black">
                Loading products...
              </h2>
              <h3 className="text-2xl font-semibold dark:text-gray-400 text-black">
                Hang on there...
              </h3>

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
              <section className="flex flex-col  p-4 mt-5 justify-center text-center">
                {owner == "" ? (
                  <div className="flex items-center justify-center mb-10">
                    <h1 className="text-5xl font-bold text-black">
                      Explore our products
                    </h1>
                  </div>
                ) : (
                  <div className={`flex flex-col ${owner.length < 20 && 'sm:flex-row'} items-center justify-between mb-10`}>
                    <h1 className={`text-5xl ${owner.length > 20 && 'mb-5'} pr-5 font-bold text-black`}>
                      {owner}'s products
                    </h1>
                    <img
                      className="w-20 h-20 mt-5 sm:mt-0 rounded-full mr-6 object-cover"
                      src={ownerPhoto}
                    />
                  </div>
                )}
                {activeMaxPrice != Number.MAX_SAFE_INTEGER ||
                activeMinPrice != Number.MIN_SAFE_INTEGER ||
                activeTitle != "" ||
                activeOrderInitialDate != -1 ||
                activeOrderCloseDate != -1 ? (
                  <div className="flex flex-wrap items-center text-sm ms-6 mb-6">
                    <p className="font-bold text-xl pb-2 pr-6">
                      Applied filters:
                    </p>
                    {activeTitle != "" ? (
                      <FilterPill
                        filter={`Title: ${activeTitle}`}
                        clearFilter={handleClearTitle}
                      />
                    ) : (
                      <></>
                    )}
                    {activeMaxPrice != Number.MAX_SAFE_INTEGER ? (
                      <FilterPill
                        filter={`Max price: ${activeMaxPrice}€`}
                        clearFilter={handleClearMaxPrice}
                      />
                    ) : (
                      <></>
                    )}
                    {activeMinPrice != Number.MIN_SAFE_INTEGER ? (
                      <FilterPill
                        filter={`Min price: ${activeMinPrice}€`}
                        clearFilter={handleClearMinPrice}
                      />
                    ) : (
                      <></>
                    )}
                    {activeOrderInitialDate != -1 ? (
                      <FilterPill
                        filter="Sorted by initial date"
                        clearFilter={handleClearOrderInitialDate}
                      />
                    ) : (
                      <></>
                    )}
                    {activeOrderCloseDate != -1 ? (
                      <FilterPill
                        filter="Sorted by close date"
                        clearFilter={handleClearOrderCloseDate}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <> </>
                )}
                <div
                  className={`grid px-5 ${
                    products.length === 1
                      ? "grid-cols-1"
                      : products.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : products.length === 3
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  } gap-4 place-items-center place-content-center`}
                >
                  {products.map((product: Product) => (
                    <ProductCard
                      activeOwner={props.activeOwner}
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </>
  )
}
