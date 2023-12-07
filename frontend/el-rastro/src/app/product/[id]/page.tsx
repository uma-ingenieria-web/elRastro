"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Product } from "@/app/product.types";
import { useSession } from "next-auth/react";
import { TbMessageQuestion } from "react-icons/tb";
import Modal from "react-modal";
import { MdClose } from "react-icons/md";
import { MdOutlineZoomOutMap } from "react-icons/md";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import NotFound from "@/app/not-found";
import Closed from "@/app/closed";

const photoURL =
    process.env.NODE_ENV === "development"
        ? `http://localhost:8003/api/v1/photo/`
        : `http://backend-micro-image-storage/api/v1/photo/`;

const apiUrl =
    process.env.NODE_ENV === "development"
        ? `http://localhost:8002/api/v1/products/`
        : `http://backend-micro-products/api/v1/products/`;

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

async function getProduct(id: string) {
    try {
        const result = await fetch(apiUrl + id);
        const product = await result.json();
        return product;
    } catch (error: any) {
        if (error.cause?.code === "ECONNREFUSED") {
            console.error("Error connecting to backend API. Is the backend service working?");
            return null;
        }
        console.error("Error fetching product:", error.message);
        return null;
    }
}

function Product({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const { id } = params;
    const [product, setProduct] = useState<Product | null>(null);
    const [imageOpen, setImageOpen] = useState(false);
    const [productPhoto, setProductPhoto] = useState("https://picsum.photos/800/400");
    const [validBid, setValidBid] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bidDone, setBidDone] = useState(false);
    const [userIsLastBidder, setUserIsLastBidder] = useState(false);
    const [closed, setClosed] = useState(false);
    const [found, setFound] = useState(true);

    const userId = (session?.user as LoggedUser)?.id || "";

    useEffect(() => {
        const fetchProduct = async () => {
            const productFetched = await getProduct(id);
            setProduct(productFetched);
            if (productFetched.detail === "Invalid ObjectId format") {
                setFound(false);
                return;
            }
            setCurrentPrice(
                productFetched
                    ? productFetched.bids.length == 0
                        ? productFetched.initialPrice
                        : productFetched.bids[productFetched.bids.length - 1].amount
                    : 0
            );
            setUserIsLastBidder(productFetched.bids.length != 0 && productFetched?.bids[productFetched.bids.length - 1].bidder._id === userId);
            setClosed(new Date(productFetched?.closeDate) < new Date());
        };
        const fetchPhoto = async () => {
            const url = await getPhoto(id);
            setProductPhoto(url);
        };

        fetchProduct();
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
            router.push(`../../chat/${chatData?._id}`);
        } catch (error) {
            console.error("Error creating chat", error);
        }
    };

    const formattedCloseDate = product ? new Date(product.closeDate).toLocaleDateString() : "";

    const makeBid = async (newBid: number) => {
        try {
            const response = await fetch(`http://localhost:8001/api/v1/bids/${id}/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: newBid,
                }),
            });
            const bidData = await response.json();
            setValidBid(true);
            setUserIsLastBidder(true);
            setCurrentPrice(bidData.amount);
            setBidDone(true);
            setBidAmount(0);
        } catch (error) {
            console.error("Error creating bid", error);
        }
    };

    const handleNewBid = () => {
        if (product && typeof bidAmount === "number") {
            const newBid = bidAmount;
            if (product.bids.length == 0) {
                newBid > product.initialPrice ? makeBid(newBid) : setValidBid(false);
            } else {
                newBid > product.bids[product.bids.length - 1].amount ? makeBid(newBid) : setValidBid(false);
            }
        }
    };

    return !found ? (
        <NotFound />
    ) : (closed && !userIsLastBidder) ? <Closed /> : (
        <div className="flex justify-center items-center h-screen">
            <div className="flex bg-gray-100 p-8 rounded-lg shadow-lg h-auto md:flex-row flex-col justify-center  md:space-x-32">
                <div className="flex-shrink-0 mb-8 md:mb-0">
                    <Modal isOpen={imageOpen} onRequestClose={() => setImageOpen(false)}>
                        <div className="flex items-center justify-center h-full">
                            <button
                                onClick={() => setImageOpen(false)}
                                className="absolute top-0 right-0 m-4 cursor-pointer h-16 w-16">
                                <MdClose className="w-full h-full" />
                            </button>
                            <img
                                src={productPhoto}
                                alt={product?.title}
                                onClick={() => setImageOpen(true)}
                                className="max-h-full max-w-full"
                            />
                        </div>
                    </Modal>
                    <div className="relative">
                        <img
                            src={productPhoto}
                            alt={product?.title}
                            onClick={() => setImageOpen(true)}
                            className="w-96 h-96 object-cover rounded-lg cursor-pointer"
                        />
                        <button
                            onClick={() => setImageOpen(true)}
                            className="absolute bottom-0 right-0 cursor-pointer h-16 w-16 bg-gray-100 bg-opacity-10 rounded-2xl">
                            <MdOutlineZoomOutMap className="w-full h-full" />
                        </button>
                    </div>
                    <div className="mt-4">
                        <p>
                            <span className="text-gray-600 font-semibold text-sm">Closing date: </span>
                            <span className="text-sm">{formattedCloseDate}</span>
                        </p>
                        <p>
                            <span className="text-gray-600 font-semibold text-sm">Product owner: </span>
                            {/* <span className="text-sm">{product?.owner.username.split("#")[0]}</span> */}
                            <Link className="text-sm text-gray-600" href={`/user/profile/${product?.owner._id}`}>
                                {product?.owner.username.split("#")[0]}
                                <FaExternalLinkAlt />
                            </Link>
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
                            <span className={`font-bold text-xl ${userIsLastBidder ? "text-green-500 font-bold" : ""}`}>
                                {currentPrice}€{userIsLastBidder && " (Winning bid!)"}
                            </span>
                        </div>
                        <div className="mt-4 flex justify-center">
                            {!validBid && (
                                <p
                                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-base mr-4"
                                    role="warn">
                                    New bid amount must be higher than the current price.
                                </p>
                            )}
                            {bidDone && (
                                <p>
                                    <span className="text-green-500 font-semibold">Bid done!</span>
                                </p>
                            )}
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(parseInt(e.target.value))}
                                className={`border border-gray-300 rounded-md w-32 px-2 py-1 ml-2 ${
                                    userId ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                                }`}
                                placeholder="Bid amount"
                                disabled={!userId}
                            />
                            <button
                                onClick={handleNewBid}
                                className={`text-white px-4 py-1 rounded-md ml-2 ${
                                    userId ? "cursor-pointer bg-green-500" : "cursor-not-allowed bg-gray-300"
                                }`}
                                disabled={!userId}>
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
                            {!userId && (
                                <p
                                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-base mr-4"
                                    role="alert">
                                    Log in to make bids, chat with the product owner and more!
                                </p>
                            )}
                            <button
                                className={`w-20 h-20 border-2 border-gray-300 mb-4 ${
                                    userId ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                                } ml-auto`}
                                onClick={createChat}
                                disabled={!userId}>
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
