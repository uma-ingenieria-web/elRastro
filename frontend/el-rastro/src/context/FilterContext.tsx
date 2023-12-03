"use client"

import { createContext, useState } from "react"

export const FilterContext = createContext({
  minPrice: 0,
  maxPrice: 0,
  title: "",
  handleTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => {},
  orderInitialDate: -1,
  setOrderInitialDate: (orderInitialDate: number) => {},
  orderCloseDate: -1,
  setOrderCloseDate: (orderCloseDate: number) => {},
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
  handleClearFilters: () => {},
  activeOrderInitialDate: -1,
  activeOrderCloseDate: -1,
  setActiveOrderInitialDate: (orderInitialDate: number) => {},
  setActiveOrderCloseDate: (orderCloseDate: number) => {},
  handleClearTitle: () => {},
  handleClearMinPrice: () => {},
  handleClearMaxPrice: () => {},
  handleClearOrderInitialDate: () => {},
  handleClearOrderCloseDate: () => {},
})

export const FilterContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [title, setTitle] = useState("")
  const [orderInitialDate, setOrderInitialDate] = useState(-1)
  const [orderCloseDate, setOrderCloseDate] = useState(-1)
  const [activeOrderInitialDate, setActiveOrderInitialDate] = useState(-1)
  const [activeOrderCloseDate, setActiveOrderCloseDate] = useState(-1)
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
    } else {
      setActiveMinPrice(Number.MIN_SAFE_INTEGER)
    }

    if (maxPrice > 0) {
      setActiveMaxPrice(maxPrice)
    } else {
      setActiveMaxPrice(Number.MAX_SAFE_INTEGER)
    }
    setActiveTitle(title)

    setActiveOrderInitialDate(orderInitialDate)
    setActiveOrderCloseDate(orderCloseDate)
  }

  const handleClearFilters = () => {
    setMinPrice(0)
    setMaxPrice(0)
    setTitle("")
    setOrderInitialDate(-1)
    setOrderCloseDate(-1)
    setActiveMinPrice(Number.MIN_SAFE_INTEGER)
    setActiveMaxPrice(Number.MAX_SAFE_INTEGER)
    setActiveTitle("")
    setOrderInitialDate(-1)
    setOrderCloseDate(-1)
    setActiveOrderInitialDate(-1)
    setActiveOrderCloseDate(-1)
  }

  const handleActiveTitle = (title: string) => {
    setActiveTitle(title)
  }

  const handleClearTitle = () => {
    setActiveTitle("")
    setTitle("")
  }

  const handleClearMinPrice = () => {
    setActiveMinPrice(Number.MIN_SAFE_INTEGER)
    setMinPrice(0)
  }

  const handleClearMaxPrice = () => {
    setActiveMaxPrice(Number.MAX_SAFE_INTEGER)
    setMaxPrice(0)
  }

  const handleClearOrderInitialDate = () => {
    setActiveOrderInitialDate(-1)
    setOrderInitialDate(-1)
  }

  const handleClearOrderCloseDate = () => {
    setActiveOrderCloseDate(-1)
    setOrderCloseDate(-1)
  }

  return (
    <FilterContext.Provider
      value={{
        minPrice,
        maxPrice,
        title,
        handleTitleChange,
        orderInitialDate,
        setOrderInitialDate,
        orderCloseDate,
        setOrderCloseDate,
        activeTitle,
        handleActiveTitle,
        activeMinPrice,
        activeMaxPrice,
        setActiveMinPrice,
        setActiveMaxPrice,
        handleMinPriceChange,
        handleMaxPriceChange,
        handleActiveFilters,
        handleClearFilters,
        activeOrderInitialDate,
        activeOrderCloseDate,
        setActiveOrderInitialDate,
        setActiveOrderCloseDate,
        handleClearTitle,
        handleClearMinPrice,
        handleClearMaxPrice,
        handleClearOrderInitialDate,
        handleClearOrderCloseDate,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}
