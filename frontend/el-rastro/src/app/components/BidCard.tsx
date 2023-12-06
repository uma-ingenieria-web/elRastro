import { Product } from "@/app/product.types"
import ProductGrid from "./ProductGrid"

interface BidCardProps {
  title: string
  color: string
  products: Product[]
}

const BidCard = (props: BidCardProps) => {
  return (
    <>
      <section
        className={`bid-section bg-gradient-to-r from-${props.color}-300 to-${props.color}-500 border border-${props.color}-500 rounded-md shadow-md p-6 mb-6 transform transition-transform hover:scale-105`}
      >
        <div className="flex flex-col items-center justify-center">
          <h2 className={`text-4xl pt-3 font-bold mb-4 text-white underline`}>
            {props.title}
          </h2>
        </div>
      </section>
      <div className="mb-6">
        <ProductGrid products={props.products} activeOwner="" />
      </div>
    </>
  )
}

export default BidCard
