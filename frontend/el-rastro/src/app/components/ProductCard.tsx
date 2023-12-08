"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import { ProductInterface } from "@/app/product.types"
import { MdModeEdit } from "react-icons/md"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

let photoURL = ""
let productURL = ""
if (process.env.NODE_ENV === "development") {
  photoURL = `http://localhost:8003/api/v1/photo/`
  productURL = `http://localhost:8002/api/v1/products`
} else {
  photoURL = `http://backend-micro-image-storage/api/v1/photo/`
  productURL = `http://backend-micro-products/api/v1/products`
}

async function getPhoto(id: string) {
  try {
    const photo_result = await fetch(photoURL + id)
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

async function getProductsSold(id: string) {
  try {
    const result = await fetch(productURL + `/sold/${id}`)
    const products = await result.json()
    return products
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is the backend service working?"
      )
      return 0
    }
    console.error("Error fetching amount of products sold:", error.message)
    return 0
  }
}

async function getRating(id: string) {
  try {
    const res = await fetch(`http://localhost:8007/api/v2/users/${id}/rating`)
    const res_json = await res.json()
    if (res_json) {
      return (
        <>
          <svg
            className="w-4 h-4 ms-1 text-yellow-300"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>{" "}
          {res_json}
        </>
      )
    }
    return (
      <>
        <svg
          className="w-4 h-4 ms-1 text-gray-300 dark:text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 22 20"
        >
          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
        </svg>{" "}
        Not Rated
      </>
    )
  } catch (error: any) {
    return <span>Ratings Not Found</span>
  }
}

function ProductCard(props: ProductInterface) {
  const product = props.product
  const [productsSold, setProductsSold] = useState(0)
  const [rating, setRating] = useState(<div>Loading...</div>)
  const [isHovered, setIsHovered] = useState(false)

  const { data: session } = useSession()

  const userId = (session?.user as LoggedUser)?.id || ""

  const formattedCloseDate = new Date(
    props.product.closeDate
  ).toLocaleDateString()
  const closed = new Date(product.closeDate) < new Date()

  const [showPopup, setShowPopup] = useState(false)
  const [productPhoto, setProductPhoto] = useState(
    "https://picsum.photos/800/400"
  )
  const [ownerPhoto, setOwnerPhoto] = useState("https://picsum.photos/800/400")

  const handleHoverEnter = () => {
    setShowPopup(true)
  }

  const handleHoverLeave = () => {
    setShowPopup(false)
  }

  useEffect(() => {
    const fetchPhoto = async () => {
      const url = await getPhoto(product._id)
      setProductPhoto(url)
    }

    const fetchOwnerPhoto = async () => {
      const url = await getPhoto(product.owner._id)
      setOwnerPhoto(url)
    }

    const fetchSoldProducts = async () => {
      const soldProducts = await getProductsSold(product.owner._id)
      setProductsSold(soldProducts)
    }

    const fetchRatings = async () => {
      const ratings = await getRating(product.owner._id)
      setRating(ratings)
    }

    fetchSoldProducts()
    fetchOwnerPhoto()
    fetchPhoto()
    fetchRatings()
  }, [product._id, product.owner._id])

  const ownerUsername = props.activeOwner.split("#")[0]

  return (
    <div className="flex flex-col justify-between w-full max-w-lg h-full bg-white border border-gray-200 rounded-lg drop-shadow-2xl dark:bg-gray-800 dark:border-gray-700">
      <Link className="w-full h-52 sm:h-32" href={"/product/" + product._id}>
        <img
          className="h-full w-full object-fit mb-3 rounded-t-lg object-center"
          src={productPhoto}
          alt="product image"
        />
      </Link>
      <div className="px-5 pb-5 flex flex-col justify-between flex-grow mt-3">
        <div className="flex flex-row justify-between items-center md:items-start mt-2">
          <Link href={"/product/" + product._id}>
            <h5
              className={`text-3xl sm:text-2xl max-[342px]:text-xl pr-3 font-semibold tracking-tight text-gray-900 dark:text-white mb-2 ${
                product.title.split(" ")[0].length > 10
                  ? "max-w-full overflow-hidden overflow-ellipsis"
                  : ""
              }`}
            >
              {product.title}
            </h5>
          </Link>
          <Link
            href={`/user/profile/${product.owner._id}`}
            className="flex-shrink-0 relative group"
          >
            <div
              className="relative group"
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}
            >
              {ownerPhoto && (
                <div className="flex items-center">
                  <img
                    className="max-[342px]:w-9 max-[342px]:h-9 inline-block object-cover h-16 w-16 sm:h-10 sm:w-10 rounded-full cursor-pointer transition-transform transform group-hover:scale-110"
                    src={ownerPhoto}
                    alt="user image"
                  />
                </div>
              )}
              {showPopup && (
                <div
                  data-popover
                  id="popover-user-profile"
                  role="tooltip"
                  className="absolute z-10 inline-block w-64 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600 transition-opacity duration-300 opacity-100 left-auto right-0"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <img
                        className="w-10 h-10 mr-2 object-cover rounded-full"
                        src={ownerPhoto}
                        alt="owner's avatar"
                      />
                      <p className="text-base font-semibold leading-none text-gray-900 dark:text-white">
                        {product.owner.username.split("#")[0]}
                      </p>
                      <div></div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex text-sm">
                        {" "}
                        {productsSold} products sold
                      </div>
                      <div className="flex text-sm">{rating}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="mt-2 text-lg sm:text:md text-gray-700 dark:text-gray-400">
            {product.description.length > 30
              ? product.description.substring(0, 30) + "..."
              : product.description}
          </p>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-3xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {product.bids.length == 0
              ? product.initialPrice
              : product.bids[product.bids.length - 1].amount}
            €
          </div>
          <div className="ml-4 align-middle">
            {closed && !ownerUsername ? (
              <Link href={`/product/owner/${product.owner._id}`}>
                <button className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 hover:scale-105 transform transition-all duration-300">
                  More like this
                </button>
              </Link>
            ) : (
              <Link href={`/product/${product._id}`}>
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 hover:scale-105 transform transition-all duration-300">
                  Show more
                </button>
              </Link>
            )}
          </div>
        </div>
        {userId && product.owner._id === userId && (
          <div className="fixed top-2 right-2 inline-block">
            <Link href={`/product/${product._id}/edit`}>
              <motion.button
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 8px rgb(0,0,0)" }}
                whileTap={{ scale: 0.9 }}
                className="bg-blue-500 text-white px-4 py-2 rounded-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <MdModeEdit />
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : -40,
                  }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-4 transform -translate-x-full bg-gray-800 text-white px-2 py-1 rounded-md pointer-events-none"
                  style={{ display: "flex", whiteSpace: "nowrap" }}
                >
                  Edit Product
                </motion.div>
              </motion.button>
            </Link>
          </div>
        )}
        <p
          className={`mt-3 text-sm ${
            new Date(props.product.closeDate) > new Date()
              ? "text-gray-500 dark:text-gray-400"
              : "text-red-500 dark:text-red-400"
          } `}
        >
          <strong>{closed ? "Closed on" : "Open until"}</strong>:{" "}
          {formattedCloseDate}
        </p>
      </div>
    </div>
  )
}

export default ProductCard
