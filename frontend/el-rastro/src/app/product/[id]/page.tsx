"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Product } from '@/app/product.types';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

function Product({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Fetch product data on the client side
    const apiUrl =
      process.env.NODE_ENV === 'development'
        ? `http://localhost:8002/api/v1/products/${id}`
        : `http://backend-micro-image-storage/api/v1/products/${id}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((productData) => setProduct(productData))
      .catch(() => {
        console.error('Failed to fetch product');
      });
  }, [id]);

  const createChat = async () => {
    try {
      const response = await fetch(`http://localhost:8006/api/v1/chat/${id}?interested_id=${(session?.user as any).id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      const chatData = await response.json();
      console.log(chatData);
      router.push(`../../chat/${chatData?._id}`);
      
    } catch (error) {
      console.error('Error creating chat', error);
    }
  };

  return (
    <div>
      {product && (
        <>
          <div>{product.title}</div>
          <Image
            src="/chat_image.jpg"
            alt="Open chat"
            className="w-20 h-20 border-2 border-gray-300 mb-4 cursor-pointer"
            onClick={createChat}
            width={100}
            height={100}
          />
        </>
      )}
    </div>
  );
}

export default Product;
