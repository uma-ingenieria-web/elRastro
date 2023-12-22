"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/app/product.types";
import { useSession } from "next-auth/react";
import Modal from "react-modal";
import { MdClose, MdOutlineZoomOutMap } from "react-icons/md";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import NotFound from "@/app/not-found";
import { fetchWithToken } from "../../../../lib/authFetch";

interface Props {
    initialProduct: Product;
    image: string;
}

const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_PRODUCT_SERVICE ?? "http://localhost:8002"}/api/v1/products/`;

const photoUrl = `${
    process.env.NEXT_PUBLIC_BACKEND_CLIENT_IMAGE_STORAGE_SERVICE ?? "http://localhost:8003"
}/api/v1/photo/`;

const userMeURL = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_USER_SERVICE ?? "http://localhost:8000"}/api/v1/user/me`;

const carbonUrl = `${
    process.env.NEXT_PUBLIC_BACKEND_CLIENT_CARBON_FOOTPRINT_SERVICE ?? "http://localhost:8009"
}/api/v2/carbon`;

async function getUser(session) {
    try {
        const user_result = await fetchWithToken(userMeURL, {}, session);
        const user = await user_result.json();
        return user;
    } catch (error: any) {
        if (error.cause?.code === "ECONNREFUSED") {
            console.error("Error connecting to backend API. Is the backend service working?");
            return null;
        }
        console.error("Error fetching user:", error.message);
        return null;
    }
}

async function getCO2Rate(
    origin_lat: number,
    origin_lon: number,
    destination_lat: number,
    destination_lon: number,
    weight: number
) {
    try {
        const result = await fetch(
            `${carbonUrl}?origin_lat=${origin_lat}&origin_lon=${origin_lon}&destination_lat=${destination_lat}&destination_lon=${destination_lon}&weight=${weight}`
        );
        const rate = await result.json();
        return rate;
    } catch (error: any) {
        console.error("Error fetching co2 rate:", error.message);
        return 0;
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

async function getPhoto(id: string) {
    try {
        const photo_result = await fetch(photoUrl + id);
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

function createOrder(data, actions, currentPrice, description) {
    return actions.order
        .create({
            purchase_units: [
                {
                    description: description,
                    amount: {
                        currency_code: "USD",
                        value: currentPrice,
                    },
                },
            ],
        })
        .then((orderID) => {
            return orderID;
        });
}

function onApprove(data2, actions, id, setSuccess, token) {
    return actions.order.capture().then(function (details) {
        const { payer } = details;

        fetch(apiUrl + id + "/payment", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        }).then((res) => {
            if (res.ok) {
                setSuccess(true);
            } else {
                console.error("Error");
            }
        });
    });
}

function CheckoutProduct({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: session } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [productPhoto, setProductPhoto] = useState("https://picsum.photos/800/400");
    const [imageOpen, setImageOpen] = useState(false);

    const [title, setTitle] = useState(product?.title || "");
    const [closed, setClosed] = useState(false);
    const [userIsLastBidder, setUserIsLastBidder] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [found, setFound] = useState(true);
    const [success, setSuccess] = useState(false);
    const [description, setDescription] = useState("");
    const [co2Rate, setCO2Rate] = useState<number | string>("co2");

    const [userId, setUserId] = useState("");

    const paypalClient = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    useEffect(() => {
        const fetchProduct = async () => {
            const productFetched = await getProduct(id);
            if (productFetched.detail === "Invalid ObjectId format") {
                setFound(false);
                return;
            }

            setProduct(productFetched);
            setTitle(productFetched.title);
            setCurrentPrice(
                productFetched
                    ? productFetched.bids.length === 0
                        ? productFetched.initialPrice
                        : productFetched.bids[productFetched.bids.length - 1].amount
                    : 0
            );

            setUserIsLastBidder(
                productFetched.bids.length !== 0 &&
                    productFetched.bids[productFetched.bids.length - 1].bidder._id === userId
            );
            setClosed(new Date(productFetched.closeDate) < new Date());
            setDescription(productFetched.description);
        };
        const fetchPhoto = async () => {
            const url = await getPhoto(id);
            setProductPhoto(url);
        };

        fetchProduct();
        fetchPhoto();
    }, [id]);

    useEffect(() => {
        if (session?.user) {
            setUserId((session?.user as LoggedUser).id);
        }
    }, [session]);

    useEffect(() => {
        if (product && session) {
            const fetchCO2Rate = async () => {
                const userFetched = await getUser(session);
                let location = {
                    lat: 36.62035,
                    lon: -4.49976,
                };
                if (userFetched && userFetched.location) {
                    location = userFetched.location;
                }
                const rate = await getCO2Rate(
                    product.owner.location.lat,
                    product.owner.location.lon,
                    location.lat,
                    location.lon,
                    product.weight
                );
                if (rate && !rate.error) setCO2Rate(rate);
            };

            fetchCO2Rate();
        }
    }, [product, session]);

    return !found ? (
        <NotFound />
    ) : (
        <PayPalScriptProvider options={{ "client-id": paypalClient ?? "" }}>
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="flex flex-row max-w-[70vw] max-h-[70vh] items-center bg-white shadow-lg rounded-lg p-5">
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
                    <div className="relative w-96 mr-12">
                        <h2 className="text-2xl font-bold text-center">Product image:</h2>
                        <img
                            src={productPhoto}
                            alt={product?.title}
                            className="w-full h-96 object-cover rounded-lg cursor-pointer"
                        />
                        <button
                            onClick={() => setImageOpen(true)}
                            className="absolute bottom-0 right-0 cursor-pointer h-16 w-16 bg-gray-100 bg-opacity-10 rounded-2xl">
                            <MdOutlineZoomOutMap className="w-full h-full" />
                        </button>
                    </div>
                    <div className="flex flex-col justify-center h-full">
                        <h2 className="text-gray-600 font-semibold text-sm">You are about to buy:</h2>
                        <h3 className="text-2xl font-bold text-center">{title}</h3>
                        <h4 className="text-xl font-semibold text-center mb-10">
                            The final price is: {currentPrice + (co2Rate as number)} € (included {co2Rate} € of CO2 emissions)
                        </h4>
                        {!success && product && description && session && id && currentPrice != 0 && co2Rate != "co2" && (
                            <PayPalButtons
                                style={{ layout: "vertical" }}
                                createOrder={(data, actions) => createOrder(data, actions, Math.floor((currentPrice + (co2Rate as number)) * 100) / 100, description)}
                                onApprove={(data, actions) =>
                                    onApprove(data, actions, id, setSuccess, session.accessToken)
                                }
                            />
                        )}
                        {success && <h2 className="mt-10 text-xl text-green-500">Payment made successfully!</h2>}
                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}

export default CheckoutProduct;
