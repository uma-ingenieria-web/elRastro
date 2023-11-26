"use client"

import { createContext, useState } from "react";

export const FilterContext = createContext({});

export const FilterContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  
    const [minPrice, setMinPrice] = useState(0);

  return (
    <FilterContext.Provider
      value={{
        minPrice,
        setMinPrice,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
