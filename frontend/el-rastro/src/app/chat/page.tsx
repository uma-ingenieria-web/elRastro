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
    origin: string;
    timestamp: string;
    text: string;
  }
}

const ChatPage = () => {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatsWithDetails[]>([]);

useEffect(() => {
  const fetchData = async () => {
    try {
        const chatsResponse = await fetch(`http://localhost:8006/api/v1/myChats/${(session?.user as any).id}}`);
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
      }
    };

    fetchData();
  }, [(session?.user as any).id]);

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