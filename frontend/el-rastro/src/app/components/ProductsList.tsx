"use client"

import ProductCard from "@/app/components/ProductCard"
import Filter from "@/app/components/Filter"
import { useContext, useEffect, useState } from "react"
import { FilterContext } from "@/context/FilterContext"
import NoProducts from "@/app/components/NoProducts"
import { Product } from "@/app/product.types"
import FilterPill from "@/app/components/FilterPill"
import Loading from "@/app/components/Loading"

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
            <Loading />
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
