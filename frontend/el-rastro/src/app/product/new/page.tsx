"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/app/product.types";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "../../../../lib/authFetch";

const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_PRODUCT_SERVICE?? "http://localhost:8002"}/api/v1/products`;

const photoUrl = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_IMAGE_STORAGE_SERVICE?? "http://localhost:8003"}/api/v1/photo/`;

function CreateProduct() {
    const { data: session } = useSession();
    const router = useRouter();
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [weight, setWeight] = useState(0);
    const [endDate, setEndDate] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const userId = (session?.user as LoggedUser)?.id || "";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const buildISODate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        const second = date.getSeconds().toString().padStart(2, "0");

        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();

        if (!title || !description || !price || !endDate || !selectedFile || !weight) {
            alert("Please fill all the fields");
            return;
        }
        fetchWithToken(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                initialPrice: price,
                closeDate: buildISODate(new Date(endDate)),
                weight: weight,
            }),
        }, session)
            .then((response) => response.json())
            .then((data) => {
                const formData = new FormData();
                formData.append("file", selectedFile!);
                fetchWithToken(photoUrl + data._id, {
                    method: "POST",
                    body: formData,
                }, session)
                    .then((response) => response.json())
                    .then((data) => {
                        router.push(`/product/`);
                    })
                    .catch((error) => {
                        // Handle errors
                        console.error("Error:", error);
                    });
            })
            .catch((error) => {
                // Handle errors
                console.error("Error:", error);
            });
    };

    function getFormattedDate(today: Date = new Date()) {
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
        const dayTomorrow = (today.getDate() + 1).toString().padStart(2, "0");

        return `${year}-${month}-${dayTomorrow}`;
    }

    const handleDateChange = (e: any) => {
        const date = e.target.value;
        setEndDate(date);
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-4 bg-white shadow-lg rounded">
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
                    Initial price:
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Initial price for your product"
                    />
                </label>
                <label className="block mb-2">
                    Product Image:
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </label>
                {/* Input with a calendar to let the user choose a date in the future */}
                <label className="block mb-2">
                    Auction end date:
                    <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded"
                        min={getFormattedDate()}
                        onChange={handleDateChange}
                    />
                </label>
                <label className="block mb-2">
                    Weight:
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Weight for your product"
                    />
                </label>
                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full z-10 w-full">
                    Create Product
                </button>
            </form>
        </div>
    );
}

export default CreateProduct;
