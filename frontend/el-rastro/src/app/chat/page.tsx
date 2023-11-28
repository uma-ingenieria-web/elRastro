"use client"
import React, { useEffect, useState } from "react";
import ChatCard from "../components/ChatCard";

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
  user: {
    _id: string;
    username: string;
  };
  lastMessage: {
    _id: string;
    origin: string;
    timestamp: string;
    text: string;
  }
}

const ChatPage = () => {
  const [chats, setChats] = useState<ChatsWithDetails[]>([]);

  const userId = '654b5d2c4da4bf53381f1ba2';

  useEffect(() => {
    const fetchData = async () => {
      try {
        let chatsInfoURL = ""
        if (process.env.NODE_ENV === "development") {
          chatsInfoURL = `http://localhost:8006/api/v1/myChats/${userId}`
        } else {
          chatsInfoURL = `http://backend-micro-chats/api/v1/myChats/${userId}`
        }
        const chatsResponse = await fetch(chatsInfoURL);
        const chatsData = await chatsResponse.json();

        // Obtener información adicional para cada chat
        const chatsWithDetails = await Promise.all(
          chatsData.map(async (chat: Chat) => {
            let productInfoURL = ""
            if (process.env.NODE_ENV === "development") {
              productInfoURL = `http://localhost:8002/api/v1/products/${chat.product._id}`
            } else {
              productInfoURL = `http://backend-micro-products/api/v1/products/${chat.product._id}`
            }
            const productResponse = await fetch(productInfoURL);
            const productData = await productResponse.json();
            
            let userInfoURL = ""
            if (process.env.NODE_ENV === "development") {
              userInfoURL = `http://localhost:8000/api/v1/user/${chat.vendor._id}`
            } else {
              userInfoURL = `http://backend-micro-users/api/v1/user/${chat.vendor._id}`
            }
            const userResponse = await fetch(userInfoURL);
            const userData = await userResponse.json();

            let messagesInfoURL = ""
            if (process.env.NODE_ENV === "development") {
              messagesInfoURL = `http://localhost:8006/api/v1/chat/${chat._id}/messages`
            } else {
              messagesInfoURL = `http://backend-micro-chats/api/v1/chat/${chat._id}/messages`
            }
            const messagesResponse = await fetch(messagesInfoURL);
            const messagesData = await messagesResponse.json();
            const lastMessage = messagesData[messagesData.length - 1];

            return {
              _id: chat._id,
              product: productData,
              user: userData,
              lastMessage: lastMessage,
            };
          })
        );

        setChats(chatsWithDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <section className="flex flex-col p-4 mt-5 justify-center">
        <div className="flex items-center justify-center mb-10">
          <h1 className="text-4xl font-bold">Your chats</h1>
        </div>
      <div>
        {chats.map((chat) => (
          <ChatCard key={chat._id} {...chat} />
        ))}
      </div>
    </section>
  );
};

export default ChatPage;