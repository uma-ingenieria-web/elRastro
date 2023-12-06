"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Product } from "@/app/product.types";
import { useSession } from "next-auth/react";
import { TbMessageQuestion } from "react-icons/tb";

let photoURL = "";
if (process.env.NODE_ENV === "development") {
    photoURL = `http://localhost:8003/api/v1/photo/`;
} else {
    photoURL = `http://backend-micro-image-storage/api/v1/photo/`;
}

async function getPhoto(id: string) {
    try {
        const photo_result = await fetch(photoURL + id);
        const url = await photo_result.json();
        return url;
    } catch (error: any) {
        if (error.cause?.code === "ECONNREFUSED") {
            console.error("Error connecting to backend API. Is the backend service working?");
            return "https://picsum.photos/800/400";
        }
        console.error("Error fetching photo:", error.message);
        return "https://picsum.photos/800/400";
    }
}

function Product({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const { id } = params;
    const [product, setProduct] = useState<Product | null>(null);
    const [productPhoto, setProductPhoto] = useState("https://picsum.photos/800/400");

    const isLoggedIn = (session?.user as any)?.id !== undefined;

    useEffect(() => {
        // Fetch product data on the client side
        const apiUrl =
            process.env.NODE_ENV === "development"
                ? `http://localhost:8002/api/v1/products/${id}`
                : `http://backend-micro-products/api/v1/products/${id}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((productData) => setProduct(productData))
            .catch(() => {
                console.error("Failed to fetch product");
            });

        const fetchPhoto = async () => {
            const url = await getPhoto(id);
            setProductPhoto(url);
        };

        fetchPhoto();
    }, [id]);

    const createChat = async () => {
        try {
            const response = await fetch(
                `http://localhost:8006/api/v1/chat/${id}?interested_id=${(session?.user as any).id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                }
            );
            const chatData = await response.json();
            console.log(chatData);
            router.push(`../../chat/${chatData?._id}`);
        } catch (error) {
            console.error("Error creating chat", error);
        }
    };

    const formattedCloseDate = product ? new Date(product.closeDate).toLocaleDateString() : "";

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex bg-gray-100 p-8 rounded-lg shadow-lg h-auto md:flex-row flex-col justify-center  md:space-x-32">
                <div className="flex-shrink-0 mb-8 md:mb-0">
                    <img src={productPhoto} alt={product?.title} className="w-96 h-96 object-cover rounded-lg" />
                    <div className="mt-4">
                        <p>
                            <span className="text-gray-600 font-semibold text-sm">Closing date: </span>
                            <span className="text-sm">{formattedCloseDate}</span>
                        </p>
                        <p>
                            <span className="text-gray-600 font-semibold text-sm">Product owner: </span>
                            <span className="text-sm">{product?.owner.username.split("#")[0]}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    <h2 className="text-4xl font-bold text-center">{product?.title}</h2>
                    <div className="mt-auto mb-4">
                        <p>
                            <span className="text-gray-600 font-semibold">Description: </span>
                            {product?.description}
                        </p>
                    </div>
                    <div className="border-t border-b border-gray-300 py-2 mb-4 flex justify-between flex-col">
                        <div className="flex justify-between w-full">
                            <span className="text-gray-600 font-semibold">Current price: </span>
                            <span className="font-bold text-2xl">
                                {product?.bids.length == 0
                                    ? product?.initialPrice
                                    : product?.bids[product.bids.length - 1].amount}
                                €
                            </span>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <input
                                type="number"
                                className={`border border-gray-300 rounded-md w-32 px-2 py-1 ml-auto ${
                                    isLoggedIn ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                                }`}
                                placeholder="Bid amount"
                                disabled={!isLoggedIn}
                            />
                            <button
                                className={`text-white px-4 py-1 rounded-md ml-2 ${
                                    isLoggedIn ? "cursor-pointer bg-green-500" : "cursor-not-allowed bg-gray-300"
                                }`}
                                disabled={!isLoggedIn}>
                                Make Bid
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p>
                            <span className="text-gray-600 font-semibold">Rating: </span>Implement ratings***
                        </p>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-center items-center flex-1 h-full flex-row">
                            {!isLoggedIn && (
                                <p
                                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-base mr-4"
                                    role="alert">
                                    Log in to make bids, chat with the product owner and more!
                                </p>
                            )}
                            <button
                                className={`w-20 h-20 border-2 border-gray-300 mb-4 ${
                                    isLoggedIn ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                                } ml-auto`}
                                onClick={createChat}
                                disabled={!isLoggedIn}>
                                <TbMessageQuestion alt="Open chat" className="w-full h-full" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product;
