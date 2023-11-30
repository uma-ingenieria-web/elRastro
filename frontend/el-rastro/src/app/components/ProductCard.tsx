"use client"

import Link from "next/link"
import React, { useState } from "react"
import { ProductInterface } from "@/app/product.types"

function ProductCard(product: ProductInterface) {
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
      <Link href={"/product/" + product._id}>
        <img
          className="mb-3 rounded-t-lg"
          src={product.image}
          alt="product image"
        />
      </Link>
      <div className="px-5 pb-5">
        <div className="flex flex-row justify-between items-center md:items-start mt-2">
          <Link href={"/product/" + product._id}>
            <h5
              className={`text-3xl sm:text-2xl pr-3 font-semibold tracking-tight text-gray-900 dark:text-white mb-2 ${
                product.title.split(" ")[0].length > 10
                  ? "max-w-full overflow-hidden overflow-ellipsis"
                  : ""
              }`}
            >
              {product.title}
            </h5>
          </Link>
          <Link href="#" className="flex-shrink-0 relative group">
            <div
              className="relative group"
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}
            >
              {product.owner.image && (
                <div className="flex items-center">
                  <img
                    className="inline-block h-16 w-16 sm:h-10 sm:w-10 rounded-full cursor-pointer transition-transform transform group-hover:scale-110"
                    src={product.owner.image}
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
                        className="w-10 h-10 rounded-full"
                        src={product.owner.image}
                        alt="owner's avatar"
                      />
                      <p className="text-base font-semibold leading-none text-gray-900 dark:text-white">
                        {product.owner.username}
                      </p>
                      <div></div>
                    </div>
                    <p className="mt-5 text-sm">
                      Number of products sold:{" "}
                      {/* Add number of products sold */}
                    </p>
                    <div className="flex text-sm">{/* Add rating */}</div>
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
        <div className="flex justify-between items-end mt-3">
          <div className="text-3xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {product.bids.length == 0
              ? product.initialPrice
              : product.bids[product.bids.length - 1].amount}
            €
          </div>
          <div className="ml-4">
            {closed ? (
              <button className="text-black bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-lg sm:text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                Closed
              </button>
            ) : (
              <Link href={`/product/${product._id}`}>
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Show more
                </button>
              </Link>
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
