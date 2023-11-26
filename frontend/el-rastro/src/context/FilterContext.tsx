"use client"

import { createContext, useState } from "react"

export const FilterContext = createContext({
  minPrice: 0,
  maxPrice: 0,
  owner: "",
  setOwner: (owner: string) => {},
  title: "",
  handleTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => {},
  orderInitialDate: -1,
  setOrderInitialDate: (orderInitialDate: number) => {},
  orderCloseDate: -1,
  setOrderCloseDate: (orderCloseDate: number) => {},
  handleMyProducts: () => {},
  handleProductsBidded: () => {},
  handleProductsWon: () => {},
  activeTitle: "",
  handleActiveTitle: (title: string) => {},
  activeMinPrice: Number.MIN_SAFE_INTEGER,
  activeMaxPrice: Number.MAX_SAFE_INTEGER,
  setActiveMinPrice: (minPrice: number) => {},
  setActiveMaxPrice: (maxPrice: number) => {},
  handleMinPriceChange: (event: React.ChangeEvent<HTMLInputElement>) => {},
  handleMaxPriceChange: (event: React.ChangeEvent<HTMLInputElement>) => {},
  handleActiveFilters: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {},
})

export const FilterContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [owner, setOwner] = useState("")
  const [title, setTitle] = useState("")
  const [orderInitialDate, setOrderInitialDate] = useState(-1)
  const [orderCloseDate, setOrderCloseDate] = useState(-1)
  const [activeTitle, setActiveTitle] = useState("")
  const [activeMinPrice, setActiveMinPrice] = useState(Number.MIN_SAFE_INTEGER)
  const [activeMaxPrice, setActiveMaxPrice] = useState(Number.MAX_SAFE_INTEGER)

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isNaN(Number(event.target.value))) {
      return
    }
    setMinPrice(Number(event.target.value))
  }

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isNaN(Number(event.target.value))) {
      return
    }
    setMaxPrice(Number(event.target.value))
  }

  const handleActiveFilters = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (minPrice > 0) {
      setActiveMinPrice(minPrice)
    }
    if (maxPrice > 0) {
      setActiveMaxPrice(maxPrice)
    }
    if (title.length > 0) {
      setActiveTitle(title)
    }
  }

  // TODO: implement
  const handleMyProducts = () => {
    setOwner("me")
  }

  // TODO: implement
  const handleProductsBidded = () => {
    setOwner("my-bids")
  }

  // TODO: implement
  const handleProductsWon = () => {
    setOwner("my-won")
  }

  const handleActiveTitle = (title: string) => {
    setActiveTitle(title)
  }

  return (
    <FilterContext.Provider
      value={{
        minPrice,
        maxPrice,
        owner,
        setOwner,
        title,
        handleTitleChange,
        orderInitialDate,
        setOrderInitialDate,
        orderCloseDate,
        setOrderCloseDate,
        handleMyProducts,
        handleProductsBidded,
        handleProductsWon,
        activeTitle,
        handleActiveTitle,
        activeMinPrice,
        activeMaxPrice,
        setActiveMinPrice,
        setActiveMaxPrice,
        handleMinPriceChange,
        handleMaxPriceChange,
        handleActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}
