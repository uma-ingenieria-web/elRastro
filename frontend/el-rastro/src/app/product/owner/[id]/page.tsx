import ProductList from "@/app/components/ProductsList"

let userUrl = ""

userUrl = `${process.env.BACKEND_SERVER_USER_SERVICE?? "http://localhost:8000"}/api/v1/user/`

async function getUser(id: string) {
  try {
    const user_result = await fetch(userUrl + id)
    const user = await user_result.json()
    return user
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is the backend service working?"
      )
    }
    console.error("Error fetching user:", error.message)
  }
}

async function ProductsOwner({ params }: { params: { id: string } }) {
  const username = await getUser(params.id).then((user) => {return user.username || ""})

  return <ProductList activeOwner={username} ownerId={params.id}/>
}

export default ProductsOwner
