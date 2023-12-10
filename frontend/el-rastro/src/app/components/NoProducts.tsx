"use client"

import Link from "next/link"
import React from "react"
import { HiOutlineEmojiSad } from "react-icons/hi"
import { useContext } from "react"
import { FilterContext } from "@/context/FilterContext"

function NoProducts() {
  const { handleClearFilters } = useContext(FilterContext)

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-5xl font-bold text-black mb-3">No products found</h2>
      <h3 className="text-3xl font-semibold dark:text-gray-400 text-black">
        Try using a different filter
      </h3>
      <HiOutlineEmojiSad className="text-9xl text-gray-400" />
      <Link
        className="flex flex-row font-semibold ml-3 text-blue-500 hover:underline mt-4 align-middle items-center    "
        href="/product"
        onClick={handleClearFilters}
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white mr-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 7 1 4l3-3m0 12h6.5a4.5 4.5 0 1 0 0-9H2"
          />
        </svg>
        Go back
      </Link>
    </div>
  )
}

export default NoProducts
