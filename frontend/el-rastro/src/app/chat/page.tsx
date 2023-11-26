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
        const chatsResponse = await fetch(`http://localhost:8006/api/v1/myChats/${userId}`);
        const chatsData = await chatsResponse.json();

        // Obtener información adicional para cada chat
        const chatsWithDetails = await Promise.all(
          chatsData.map(async (chat: Chat) => {
            const productResponse = await fetch(`http://localhost:8002/api/v1/products/${chat.product._id}`);
            const productData = await productResponse.json();

            const userResponse = await fetch(`http://localhost:8000/api/v1/user/${chat.vendor._id}`);
            const userData = await userResponse.json();

            const messagesResponse = await fetch(`http://localhost:8006/api/v1/chat/${chat._id}/messages`);
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