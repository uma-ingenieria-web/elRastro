import ProductList from "@/app/components/ProductsList"

function ProductsOwner({ params }: { params: { username: string } }) {

  return <ProductList activeOwner={params.username}/>
}

export default ProductsOwner
