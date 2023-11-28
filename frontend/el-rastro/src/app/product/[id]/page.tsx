import { redirect } from "next/navigation";
import React from "react";
import { ProductInterface } from "@/app/product.types";

async function Product({ params }: { params: { id: string } }) {
    const { id } = params;

    let apiUrl = "";
    if (process.env.NODE_ENV === "development") {
      apiUrl = `http://localhost:8002/api/v1/products/${id}`;
    } else {
      apiUrl = `http://backend-micro-image-storage/api/v1/products/${id}`;
    }

    async function getProduct(): Promise<ProductInterface> {
      try {
        const response = await fetch(apiUrl);
        const product = await response.json();
        return product;
      } catch (error) {
        throw new Error("Failed to fetch product");
      }
    }

    try {
      const product = await getProduct();
      return <div>{product.title}</div>;
    } catch (error: any) {
      if (error.cause?.code === "ECONNREFUSED") {
        console.error("Error connecting to backend API. Is backend service working?");
      }
      redirect("/");
    }
}

export default Product;
