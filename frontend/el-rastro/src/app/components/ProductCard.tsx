"use client"

import Link from "next/link"
import React, { useState } from "react"

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
  image: string
  owner: Owner
}

function ProductCard(product: Product) {
  const formattedCloseDate = new Date(product.closeDate).toLocaleDateString()
  const closed = new Date(product.closeDate) < new Date()

  product.owner.image = product.owner.image || "https://picsum.photos/800/400"

  const [showPopup, setShowPopup] = useState(false)

  const handleHoverEnter = () => {
    setShowPopup(true)
  }

  const handleHoverLeave = () => {
    setShowPopup(false)
  }

  return (
    <div className="w-full max-w-lg h-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <Link href="#">
        <img
          className="mb-3 rounded-t-lg"
          src={product.image}
          alt="product image"
        />
      </Link>
      <div className="px-5 pb-5">
        <div className="flex flex-col justify-between items-center md:items-start mt-2">
          <Link href="#">
            <h5 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
              {product.title}
            </h5>
          </Link>
          <Link href="#">
            <div
              className="relative group"
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}
            >
              {product.owner.image && (
                <div className="flex items-center">
                  <img
                    className="inline-block h-10 w-10 rounded-full cursor-pointer transition-transform transform group-hover:scale-110"
                    src={product.owner.image}
                    alt="user image"
                  />
                  <p className="ml-2 text-gray-900 dark:text-white font-normal text-lg">
                    {product.owner.username}
                  </p>
                </div>
              )}
              {showPopup && (
                <div className="hidden md:block absolute bg-white p-2 rounded shadow top-full left-0 mt-2">
                  <p className="text-gray-900 text-center dark:text-white">
                    Go to profile
                  </p>
                </div>
              )}
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            {product.description.length > 30
              ? product.description.substring(0, 30) + "..."
              : product.description}
          </p>
        </div>
        <div className="flex justify-between items-end mt-3">
          <div className="text-3xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {product.initialPrice}€
          </div>
          <div className="ml-4">
            {closed ? (
              <button className="text-black bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                Closed
              </button>
            ) : (
              <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Bid
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {closed ? "Closed" : "Closes"} on: {formattedCloseDate}
        </p>
      </div>
    </div>
  )
}

export default ProductCard
