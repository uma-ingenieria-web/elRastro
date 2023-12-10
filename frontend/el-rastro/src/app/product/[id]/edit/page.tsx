"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/app/product.types";
import { useSession } from "next-auth/react";
import Modal from "react-modal";
import { MdClose, MdOutlineZoomOutMap } from "react-icons/md";

interface Props {
    initialProduct: Product;
    image: string;
}

const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_PRODUCT_SERVICE?? "http://localhost:8002"}/api/v1/products/`;

const photoUrl =`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_IMAGE_STORAGE_SERVICE?? "http://localhost:8003"}/api/v1/photo/`;

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

function EditProduct({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: session } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [productPhoto, setProductPhoto] = useState("https://picsum.photos/800/400");
    const [imageOpen, setImageOpen] = useState(false);

    const [title, setTitle] = useState(product?.title || "");
    const [description, setDescription] = useState(product?.description || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const userId = (session?.user as LoggedUser)?.id || "";

    useEffect(() => {
        const fetchProduct = async () => {
            const productFetched = await getProduct(id);
            setProduct(productFetched);
            setTitle(productFetched.title);
            setDescription(productFetched.description);
        };
        const fetchPhoto = async () => {
            const url = await getPhoto(id);
            setProductPhoto(url);
        };

        fetchProduct();
        fetchPhoto();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        
        // Devuelve un Type Error

        // fetch(apiUrl + product?._id, {
        //     method: "PUT",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         title: title,
        //         description: description,
        //         weight: 5,
        //     }),
        // })
        //     .then((response) => response.json())
        //     .then((data) => {
        //         if (!selectedFile) {
        //             router.push(`/product/${id}`);
        //         } else {
        //             const formData = new FormData();
        //             formData.append("file", selectedFile!);
        //             fetch(photoUrl + data._id, {
        //                 method: "POST",
        //                 body: formData,
        //             })
        //                 .then((response) => response.json())
        //                 .then((data) => {
        //                     router.push(`/product/${id}`);
        //                 })
        //                 .catch((error) => {
        //                     console.error("Error:", error);
        //                 });
        //         }
        //     })
        //     .catch((error) => {
        //         console.error("Error:", error);
        //     });
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-row max-w-[70vw] max-h-[70vh] items-center">
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
                <div className="relative w-96 mr-10">
                    <h2 className="text-2xl font-bold text-center">Previous image:</h2>
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

                <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-lg rounded h-full">
                    <h2 className="text-2xl font-bold text-center">Product data:</h2>
                    <label className="block mb-2">
                        Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Title for your product"
                        />
                    </label>
                    <label className="block mb-2">
                        Description:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Description for your product"></textarea>
                    </label>
                    <label className="block mb-2">
                        Product Image:
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full z-10 w-full">
                        Edit Product
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditProduct;
