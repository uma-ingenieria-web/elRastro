"use client"

import { FilterContext } from "@/context/FilterContext"
import React, { useContext, useState } from "react"
import { MdOutlineDateRange } from "react-icons/md"
import { GoSearch } from "react-icons/go"
import { useSession } from "next-auth/react"
import Link from "next/link"

function Filter() {
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const { data: session } = useSession()

  const userId = (session?.user as any)?.id || ""

  const {
    minPrice,
    maxPrice,
    title,
    orderCloseDate,
    orderInitialDate,
    handleTitleChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    handleActiveFilters,
    handleClearFilters,
    setOrderInitialDate,
    setOrderCloseDate,
  } = useContext(FilterContext)

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen)
  }

  const applyFilters = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    handleActiveFilters(e)
    toggleDrawer()
  }

  const clearFilters = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    handleClearFilters()
    toggleDrawer()
  }

  const handleOrderInitialDate: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    setOrderInitialDate(orderInitialDate == 1 ? -1 : 1)
  }

  const handleOrderCloseDate: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    setOrderCloseDate(orderCloseDate == 1 ? -1 : 1)
  }

  const handleKeyPressInitialDate = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setOrderInitialDate(orderInitialDate == 1 ? -1 : 1)
    }
  }

  const handleKeyPressCloseDate = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setOrderCloseDate(orderCloseDate == 1 ? -1 : 1)
    }
  }

  return (
    <div>
      <div className="fixed z-10 bottom-3 left-3 text-center">
        <button
          className={`bg-blue-500 text-white ${
            isDrawerOpen ? "hidden" : ""
          } active:bg-blue-800 font-semibold uppercase text-md sm:text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150`}
          type="button"
          data-drawer-target="drawer-navigation"
          data-drawer-show="drawer-navigation"
          aria-controls="drawer-navigation"
          onClick={toggleDrawer}
        >
          <div className="flex flex-row items-center align-middle">
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white sm:mr-3 mr-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 18"
            >
              <path d="M18.85 1.1A1.99 1.99 0 0 0 17.063 0H2.937a2 2 0 0 0-1.566 3.242L6.99 9.868 7 14a1 1 0 0 0 .4.8l4 3A1 1 0 0 0 13 17l.01-7.134 5.66-6.676a1.99 1.99 0 0 0 .18-2.09Z" />
            </svg>
            <span className="hidden sm:inline ">Show Filters</span>
          </div>
        </button>
      </div>

      <div
        id="drawer-navigation"
        className={`flex flex-col justify-between h-full fixed top-0 left-0 z-40 w-80 p-4 overflow-y-auto transition-transform ${
          isDrawerOpen ? "" : "-translate-x-full"
        } bg-white dark:bg-gray-800`}
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label"
      >
        <h5
          tabIndex={0}
          id="drawer-navigation-label"
          className="text-lg font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Filters
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 end-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={toggleDrawer}
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="h-calc[100vh-5rem] flex-1 py-4 overflow-y-auto text-lg">
          <div className="h-full text-center px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul className="space-y-2 h-full font-medium">
              <li>
                <div className="ms-2 flex flex-row">
                  <GoSearch className="w-6 h-6" />
                  <span
                    tabIndex={0}
                    className="text-xl flex-1 ms-3 font-medium text-left rtl:text-right whitespace-nowrap"
                  >
                    Look for products
                  </span>
                </div>
                <div className="flex flex-col items-center mt-2 ps-3">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="simple-search"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-12 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Search..."
                      value={title}
                      onChange={handleTitleChange}
                    />
                  </div>
                </div>
              </li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-example"
                data-collapse-toggle="dropdown-example"
                onClick={toggleDropdown}
              >
                <svg
                  className={`flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white ${
                    !isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 21"
                >
                  <path
                    d={isDropdownOpen ? "M15 11l-7-7-7 7" : "M15 11l-7-7-7 7"}
                  />
                </svg>
                <span className="text-xl flex-1 ms-3 font-medium text-left rtl:text-right whitespace-nowrap">
                  My Products
                </span>
              </button>

              <ul
                id="dropdown-example"
                className={`${
                  isDropdownOpen ? "block" : "hidden"
                } py-2 space-y-2`}
              >
                {session?.user ? (
                  <>
                    <li>
                      <Link href={`/product/owner/${userId}`}>
                        <p
                          tabIndex={0}
                          className="text-xl cursor-pointer flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        >
                          On sale products
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link href={`/bid/${userId}`}>
                        <p
                          tabIndex={0}
                          className="text-xl cursor-pointer flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        >
                          My bids
                        </p>
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className="justify-center items-center flex">
                    <p
                      tabIndex={0}
                      className="outline-1 border border-gray-300 shadow-md text-left text-xl cursor-not-allowed flex items-center justify-center ml-6 w-full p-2 text-gray-500 transition duration-75 rounded-lg pl-11"
                    >
                      Log in to view your products
                    </p>
                  </li>
                )}
              </ul>

              <li>
                <div className="flex flex-row align-middle mt-3 items-center">
                  <svg
                    className="ms-2 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 21"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.583 5.445h.01M8.86 16.71l-6.573-6.63a.993.993 0 0 1 0-1.4l7.329-7.394A.98.98 0 0 1 10.31 1l5.734.007A1.968 1.968 0 0 1 18 2.983v5.5a.994.994 0 0 1-.316.727l-7.439 7.5a.975.975 0 0 1-1.385.001Z"
                    />
                  </svg>
                  <span
                    tabIndex={0}
                    className="text-xl ms-3 flex-1 text-left rtl:text-right whitespace-nowrap text-black"
                  >
                    Filter by price
                  </span>
                </div>
                <div className="flex flex-col space-y-1 mt-3 ml-6">
                  {maxPrice != 0 && maxPrice != 0 && maxPrice < minPrice && (
                    <div
                      className="-ms-5 flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                      role="alert"
                    >
                      <svg
                        className="flex-shrink-0 inline w-4 h-4 me-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                      </svg>
                      <span className="sr-only">Info</span>
                      <div>
                        <span tabIndex={0} className="font-medium">
                          Maximal price must be greater than minimal price
                        </span>
                      </div>
                    </div>
                  )}
                  <div tabIndex={0} className="flex flex-col">
                    <span className="text-black text-left">Max price</span>
                    <input
                      type="money"
                      placeholder="Max price"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-right"
                      value={maxPrice == 0 ? "" : maxPrice}
                      onChange={handleMaxPriceChange}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span tabIndex={0} className="text-black text-left">
                      Min price
                    </span>
                    <input
                      type="money"
                      placeholder="Min price"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-right"
                      value={minPrice == 0 ? "" : minPrice}
                      onChange={handleMinPriceChange}
                    />
                  </div>
                </div>
              </li>
              <li></li>
              <li className="mr-2 -ml-2 flex flex-col">
                <div className="ms-2 flex flex-row align-text-bottom mt-5">
                  <MdOutlineDateRange className="ms-2 w-6 h-6" />
                  <span
                    tabIndex={0}
                    className="text-xl flex-1 font-medium ms-3 mb-4 text-left rtl:text-right whitespace-nowrap"
                  >
                    Order by
                  </span>
                </div>
                <label className="ml-8 relative inline-flex items-center mb-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={orderInitialDate == 1}
                    onChange={handleOrderInitialDate}
                    onKeyDown={handleKeyPressInitialDate}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-5 text-sm font-semibold text-gray-900 dark:text-gray-300">
                    Initial Date
                  </span>
                </label>
                <label className="ml-8 relative inline-flex items-center mb-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={orderCloseDate == 1}
                    className="sr-only peer"
                    onChange={handleOrderCloseDate}
                    onKeyDown={handleKeyPressCloseDate}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-5 text-sm font-semibold text-gray-900 dark:text-gray-300">
                    Close Date
                  </span>
                </label>
              </li>
              <li className="mr-2 -ml-2 mt-auto">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="mt-2 flex flex-row justify-between w-full p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                  <span className="text-white font-bold text-lg">
                    Apply filters
                  </span>
                </button>
              </li>
              <li className="mr-2 -ml-2 ">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 flex flex-row justify-between w-full p-2.5 ms-2 text-sm font-medium text-white bg-red-700 rounded-lg border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                >
                  <svg
                    className="w-6 h-6 text-white-800 dark:text-white"
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
                  <span className="text-white font-bold text-lg">
                    Clear filter
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filter
