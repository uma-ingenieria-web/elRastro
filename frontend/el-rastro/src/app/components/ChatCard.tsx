import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";

interface ChatWithDetails {
    _id: string;
    product: {
        _id: string;
        title: string;
    };
    image: string;
    user: {
        _id: string;
        username: string;
    };
    lastMessage: {
        _id: string;
        timestamp: string;
        origin: {
            _id: string;
        };
        text: string;
    };
}

function formatDate(timestamp: string) {
    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return new Date(timestamp).toLocaleString('en-US', options);
}

function ChatCard({ _id, product, image, user, lastMessage }: ChatWithDetails) {
    const { data: session } = useSession();
    let isCurrentUser = (session?.user as any).id === lastMessage.origin._id;

    return (
        <div className="flex justify-center mt-5">
            <div className="max-w-2xl w-full mx-2 p-4 bg-white rounded shadow">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold"><strong>{product.title}</strong></h2>
                    </div>
                </div>
                <div className="flex flex-col items-start mb-4">
                    <Link href={`../product/${product._id}`} className="cursor-pointer">
                        <Image
                            src={image}
                            alt="Product image"
                            className="w-20 h-20 border-2 border-gray-300 mb-4"
                            width={100}
                            height={100}
                        />
                    </Link>
                    <div className="text-left text-base max-w-full">
                        {isCurrentUser ? (
                            <p className="break-all"><strong>You:</strong> {lastMessage.text}</p>
                        ) : (
                            <p className="break-all"><strong>{user.username}:</strong> {lastMessage.text}</p>
                        )}
                    </div>
                </div>
                <div className="text-right text-xs text-gray-700">{formatDate(lastMessage.timestamp)}</div>
                <div className="flex justify-center items-center mt-4">
                    <Link href={`../chat/${_id}`} className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded no-underline hover:bg-blue-700">
                        Open Chat
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ChatCard;