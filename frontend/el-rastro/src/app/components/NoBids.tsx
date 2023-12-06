"use client"

import Link from "next/link"
import React from "react"
import { HiOutlineEmojiSad } from "react-icons/hi"
import { useContext } from "react"
import { FilterContext } from "@/context/FilterContext"

interface NoBidsProps {
    loggedIn: boolean
}

function NoBids(props : NoBidsProps) {
  const { handleClearFilters } = useContext(FilterContext)

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-5xl font-bold text-black mb-3">{props.loggedIn ? "You don't have made any bids" : "You must be logged in"}</h2>
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

export default NoBids
