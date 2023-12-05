"use client"
import React, { useEffect, useState } from "react";
import ChatCard from "../components/ChatCard";
import { useSession } from "next-auth/react";

interface Chat {
  _id: string;
  interested: {
    _id: string;
  };
  vendor: {
    _id: string;
  };
  product: {
    _id: string;
  };
}

interface ChatsWithDetails {
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
    origin: {
      _id: string;
    };
    timestamp: string;
    text: string;
  }
}

const ChatPage = () => {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatsWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as any)?.id 
useEffect(() => {
  const fetchData = async () => {
    try {
        const chatsResponse = await fetch(`http://localhost:8006/api/v1/myChats/${userId}`);
        const chatsData = await chatsResponse.json();

        const chatsWithDetails = await Promise.all(
          chatsData.map(async (chat: Chat) => {
            const productResponse = await fetch(`http://localhost:8002/api/v1/products/${chat.product._id}`);
            const productData = await productResponse.json();

            const imageResponse = await fetch(`http://localhost:8003/api/v1/photo/${chat.product._id}`);
            const imageData = await imageResponse.json();
            
            let userData;
            if ((session?.user as any).id == chat.interested._id) {
              const userResponse = await fetch(`http://localhost:8000/api/v1/user/${chat.vendor._id}`);
              userData = await userResponse.json();
            } else {
              userData = {_id: "0", username: "Anonymous"};
            }
            
            const messageResponse = await fetch(`http://localhost:8006/api/v1/chat/${chat._id}/lastMessage`);
            const lastMessageData = await messageResponse.json();

            return {
              _id: chat._id,
              product: productData,
              image: imageData,
              user: userData,
              lastMessage: lastMessageData,
            };
          })
        );

        setChats(chatsWithDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <>
      {loading ? (
        <div className="h-[100vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-black">
          Loading chats...
        </h2>
        <h3 className="text-2xl font-semibold dark:text-gray-400 text-black">
          Hang on there...
        </h3>

        <div className="flex items-center justify-center w-32 h-32 border border-gray-200 rounded-full bg-gray-50 dark:bg-gray-800 dark:border-gray-700 mt-4">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        </div>
      </div>
      ) : (
      <div className="flex flex-col p-4 mt-5 justify-center">
          <div className="flex items-center justify-center mb-10">
            <h1 className="text-4xl font-bold">Your chats</h1>
          </div>
        <div>
          {chats.map((chat) => (
            <ChatCard key={chat._id} {...chat} />
          ))}
        </div>
      </div>)}
    </>
  );
};

export default ChatPage;