"use client"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { Product, Rate } from "@/app/product.types"
import { useSession } from "next-auth/react"
import { TbMessageQuestion } from "react-icons/tb"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { MdOutlineZoomOutMap } from "react-icons/md"
import Link from "next/link"
import { FaExternalLinkAlt } from "react-icons/fa"
import NotFound from "@/app/not-found"
import Closed from "@/app/closed"
import { motion } from "framer-motion"
import StaticMap from "@/app/components/StaticMap"

const photoURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:8003/api/v1/photo/`
    : `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_IMAGE_STORAGE_SERVICE?? "http://localhost:8003"}/api/v1/photo/`

const apiUrl =
  process.env.NODE_ENV === "development"
    ? `http://localhost:8002/api/v1/products/`
    : `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_PRODUCT_SERVICE?? "http://localhost:8002"}/api/v1/products/`

const rateUrl =
  process.env.NODE_ENV === "development"
    ? `http://localhost:8007/api/v2/users/`
    : `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_RATING_SERVICE?? "http://localhost:8007"}/api/v2/users/`



async function getPhoto(id: string) {
  try {
    const photo_result = await fetch(photoURL + id)
    const url = await photo_result.json()
    return url
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is the backend service working?"
      )
      return "https://picsum.photos/800/400"
    }
    console.error("Error fetching photo:", error.message)
    return "https://picsum.photos/800/400"
  }
}

async function getRating(id: string, userId: string) {
  try {
    const result_p = await fetch(apiUrl + id)
    const product = await result_p.json()
    const id_usr = (userId === product.owner._id) ? product.buyer._id : product.owner._id;
    const result = await fetch(rateUrl + id_usr + "/ratings");
    const rates: Rate[] = await result.json();
    const rate = rates.find((x) => x.product._id === id)
    if (rate?.value)
      return rate?.value;
    return 0;
  } catch(error: any) {
    console.error("Error fetching product:", error.message)
    return 0;
  }
}

async function getProduct(id: string) {
  try {
    const result = await fetch(apiUrl + id)
    const product = await result.json()
    return product
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is the backend service working?"
      )
      return null
    }
    console.error("Error fetching product:", error.message)
    return null
  }
}

function Product({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { id } = params
  const [product, setProduct] = useState<Product | null>(null)
  const [imageOpen, setImageOpen] = useState(false)
  const [productPhoto, setProductPhoto] = useState(
    "https://picsum.photos/800/400"
  )
  const [validBid, setValidBid] = useState(true)
  const [bidAmount, setBidAmount] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [bidDone, setBidDone] = useState(false)
  const [userIsLastBidder, setUserIsLastBidder] = useState(false)
  const [closed, setClosed] = useState(false)
  const [found, setFound] = useState(true)
  const [rate, setRate] = useState(0)
  const [rating, setRating] = useState(0)
  const [validRating, setValidRating] = useState(true)
  const [map, setMap] = useState((<></>))

  const userId = (session?.user as LoggedUser)?.id || ""

  useEffect(() => {
    const fetchRating = async () => {
      const ratingFetched = await getRating(id, userId);
      setRating(ratingFetched);
    }
    const fetchProduct = async () => {
      const productFetched = await getProduct(id)
      setProduct(productFetched)
      setMap(StaticMap({position: [productFetched.owner.location.lat, productFetched.owner.location.lon], popup: productFetched.owner.username}));
      if (productFetched.detail === "Invalid ObjectId format") {
        setFound(false)
        return
      }
      setCurrentPrice(
        productFetched
          ? productFetched.bids.length == 0
            ? productFetched.initialPrice
            : productFetched.bids[productFetched.bids.length - 1].amount
          : 0
      )
      setUserIsLastBidder(
        productFetched.bids.length != 0 &&
          productFetched?.bids[productFetched.bids.length - 1].bidder._id ===
            userId
      )
      setClosed(new Date(productFetched?.closeDate) < new Date())
    }
    const fetchPhoto = async () => {
      const url = await getPhoto(id)
      setProductPhoto(url)
    }

    fetchRating();
    fetchProduct()
    fetchPhoto()
  }, [id])

  const createChat = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_CHAT_SERVICE}/api/v1/chat/${id}?interested_id=${
          (session?.user as any).id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      )
      const chatData = await response.json()
      router.push(`../../chat/${chatData?._id}`)
    } catch (error) {
      console.error("Error creating chat", error)
    }
  }

  const formattedCloseDate = product
    ? new Date(product.closeDate).toLocaleDateString()
    : ""

  const makeBid = async (newBid: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_BID_SERVICE}/api/v1/bids/${id}/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: newBid,
          }),
        }
      )
      const bidData = await response.json()
      setValidBid(true)
      setUserIsLastBidder(true)
      setCurrentPrice(bidData.amount)
      setBidDone(true)
      setBidAmount(0)
    } catch (error) {
      console.error("Error creating bid", error)
    }
  }

  const handleRate = async () => {
    if (product && typeof rate === "number") {
      if (rate >= 1 && rate <= 5) {
        setRating(rate);
        await fetch(rateUrl + id + "/" + userId + "/ratings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: rate,
            }),
        });
      } else {
        setValidRating(false);
      }
    }
  }

  const handleNewBid = () => {
    if (product && typeof bidAmount === "number") {
      const newBid = bidAmount
      if (product.bids.length == 0) {
        newBid > product.initialPrice ? makeBid(newBid) : setValidBid(false)
      } else {
        newBid > product.bids[product.bids.length - 1].amount
          ? makeBid(newBid)
          : setValidBid(false)
      }
    }
  }

  return !found ? (
    <NotFound />
  ) : closed && (!userIsLastBidder && !(userId && product?.owner._id === userId)) ? (
    <Closed />
  ) : (
    <div className="flex justify-center items-center h-screen">
      <div className="flex bg-gray-100 p-8 rounded-lg shadow-lg h-auto md:flex-row flex-col justify-center  md:space-x-32">
        <div className="flex-shrink-0 mb-8 md:mb-0">
          <Modal isOpen={imageOpen} onRequestClose={() => setImageOpen(false)}>
            <div className="flex items-center justify-center h-full">
              <button
                onClick={() => setImageOpen(false)}
                className="absolute top-0 right-0 m-4 cursor-pointer h-16 w-16"
              >
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
              className="absolute bottom-0 right-0 cursor-pointer h-16 w-16 bg-gray-100 bg-opacity-10 rounded-2xl"
            >
              <MdOutlineZoomOutMap className="w-full h-full" />
            </button>
          </div>
          <div className="mt-4">
            <p>
              <span className="text-gray-600 font-semibold text-sm">
                Closing date:{" "}
              </span>
              <span className="text-sm">{formattedCloseDate}</span>
            </p>
            <p>
              <span className="text-gray-600 font-semibold text-sm">
                Product owner:{" "}
              </span>
              {/* <span className="text-sm">{product?.owner.username.split("#")[0]}</span> */}
              <Link
                className="text-sm text-gray-600"
                href={`/user/profile/${product?.owner._id}`}
              >
                {product?.owner.username.split("#")[0]}
                <FaExternalLinkAlt />
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <h2 className="text-4xl font-bold text-center">{product?.title}</h2>
          <div className="mt-auto mb-4">
            {closed && userIsLastBidder && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="text-green-500 font-semibold text-lg italic text-center px-4 pb-10 pt-3"
              >
                🎉 Congratulations! You won the auction!
              </motion.p>
            )}
            <p>
              <span className="text-gray-600 font-semibold">Description: </span>
              {product?.description}
            </p>
          </div>
          <div className="border-t border-b border-gray-300 py-2 mb-4 flex justify-between flex-col">
            <div className="flex justify-between w-full">
              <span className="text-gray-600 font-semibold">
                Current price:{" "}
              </span>
              <span
                className={`font-bold text-xl ${
                  userIsLastBidder ? "text-green-500 font-bold" : ""
                }`}
              >
                {currentPrice}€{userIsLastBidder && " (Winning bid!)"}
              </span>
            </div>
            <div className="mt-4 flex justify-center">
              {!validBid && (
                <p
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-base mr-4"
                  role="warn"
                >
                  New bid amount must be higher than the current price.
                </p>
              )}
              {bidDone && (
                <p>
                  <span className="text-green-500 font-semibold">
                    Bid done!
                  </span>
                </p>
              )}
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value))}
                className={`border border-gray-300 rounded-md w-32 px-2 py-1 ml-2 ${
                  userId && !closed
                    ? "cursor-pointer"
                    : "cursor-not-allowed bg-gray-300"
                }`}
                placeholder="Bid amount"
                disabled={!userId || closed || userId === product?.owner._id}
              />
              <button
                onClick={handleNewBid}
                className={`text-white px-4 py-1 rounded-md ml-2 ${
                  userId && !closed && userId !== product?.owner._id
                    ? "cursor-pointer bg-green-500"
                    : "cursor-not-allowed bg-gray-300"
                }`}
                disabled={closed || !userId || userId === product?.owner._id}
              >
                Make Bid
              </button>
            </div>
          </div>
          <div className="mb-4">
          {userId && closed && (
          (rating != 0) &&
            <>
              <p>Rated with {rating} ⭐</p>
            </>
          ||
            <>
              <p className="mb-2">⭐ Rate your interaction with this sell 😄</p>
              {!validRating && (
                <p className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-base mr-4" role="warn">
                  Rate must be between 1 and 5.
                </p>
              )}
              <input
                type="number"
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className={`border border-gray-300 rounded-md w-32 px-2 py-1 ml-2 ${userId && "cursor-pointer"}`}
                placeholder="1-5 ⭐"
              />
              <button
                onClick={handleRate}
                className={`text-white px-4 py-1 rounded-md ml-2 ${userId && "cursor-pointer bg-green-500"}`}
              >
                Rate
              </button>
            </>)}
          </div>
          {map}

          <div className="mb-4">
            <div className="flex justify-center items-center flex-1 h-full flex-row">
              {!userId && (
                <p
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-base mr-4"
                  role="alert"
                >
                  Log in to make bids, chat with the product owner and more!
                </p>
              )}
              <button
                className={`w-20 h-20 border-2 border-gray-300 mb-4 ${
                  userId ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                } ml-auto`}
                onClick={createChat}
                disabled={!userId}
              >
                <TbMessageQuestion alt="Open chat" className="w-full h-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product
