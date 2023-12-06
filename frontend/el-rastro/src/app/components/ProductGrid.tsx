import React from 'react'
import ProductCard from '@/app/components/ProductCard'
import { Product } from '@/app/product.types'

interface ProductGridProps {
    products: Product[];
    activeOwner: string;
}

function ProductGrid(props: ProductGridProps) {
  return (
    <div
              className={`${
                props.products.length === 1
                  ? "flex justify-center items-center w-full"
                  : ""
              }`}
            >
              <div
                className={`grid px-5 ${
                    props.products.length === 1
                    ? "grid-cols-1 w-96"
                    : props.products.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : props.products.length === 3
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                    : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                } gap-4 place-items-center place-content-center`}
              >
                {props.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    activeOwner={""}
                    product={product}
                  />
                ))}
              </div>
            </div>
  )
}

export default ProductGrid