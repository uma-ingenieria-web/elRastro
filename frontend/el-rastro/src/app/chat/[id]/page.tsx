"use client";
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useSession } from "next-auth/react";

interface Message {
  chat: {
    _id: string;
  };
  timestamp: string;
  origin: {
    _id: string;
  };
  text: string;
}

interface ChatInfo {
  vendor: {
    _id: string;
  };
  interested: {
    _id: string;
  };
  product: {
    _id: string;
  };
}

interface ProductInfo {
  title: string;
}

interface UserInfo {
  _id: string;
  username: string;
}

export default function ChatPageId({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_CHAT_SERVICE?? "http://localhost:8006"}/api/v1/chat/${id}`);
      const chatData = await result.json();
      setChatInfo(chatData);

      const messagesResult = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_CHAT_SERVICE?? "http://localhost:8006"}/api/v1/chat/${id}/messages`);
      const messagesData = await messagesResult.json();
      setMessages(messagesData);

      const productResult = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_PRODUCT_SERVICE?? "http://localhost:8002"}/api/v1/products/${chatData.product._id}`);
      const productData = await productResult.json();
      setProductInfo(productData);

      let userData;
      if ((session?.user as any).id == chatData.interested._id) {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_USER_SERVICE}/api/v1/user/${chatData.vendor._id}`);
        userData = await userResponse.json();
      } else {
        userData = { _id: "0", username: "Anonymous" };
      }
      setUserInfo(userData);

      setNewMessageText('');
      setIsSendButtonDisabled(true);
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!newMessageText.trim()) {
        return;
      }

      const response = await fetch(`http://localhost:8006/api/v1/chat/${id}/send?origin_id=${(session?.user as any).id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessageText }),
      });

      if (response.ok) {
        fetchData();
      } else {
        console.error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  function formatMessageDate(timestamp: string) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' } as Intl.DateTimeFormatOptions;
    return date.toLocaleDateString('en-US', options);
  }

  return (
    <>
      {loading ? (
        <div className="h-[100vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-black">
          Loading chat...
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-4xl border border-gray-300 rounded overflow-hidden flex flex-col h-120">
          {productInfo && (
            <div className="p-4 border-b border-gray-300 bg-gray-200">
              <h2 className="text-lg font-semibold">Conversation: {' '}
                <Link href={`../product/${chatInfo?.product._id}`} className="cursor-pointer hover:underline">
                  <strong>{productInfo.title}</strong>
                </Link>
              </h2>
            </div>
          )}
          <div className="flex flex-col h-full relative">
            <div className="flex justify-between p-2 font-bold">
              <div className="w-1/2 text-center">You</div>
              {userInfo?.username !== 'Anonymous' ? (
                <div className="w-1/2 text-center">
                  <Link href={`../../user/profile/${userInfo?._id}`} className="cursor-pointer hover:underline">
                    {userInfo?.username}
                  </Link>
                </div>
              ) : (
                <div className="w-1/2 text-center">{userInfo?.username}</div>
              )}
            </div>
            <div
              ref={messagesContainerRef}
              className="overflow-y-auto flex-1 relative max-h-96 mb-2"
            >
              <table className="w-full table-fixed border-collapse">
                <tbody>
                  {messages.map((message, index) => (
                    <tr key={index}>
                      <td className="text-left p-2 break-all">
                        {message.origin._id === (session?.user as any).id && (
                          <div
                            className="bg-gray-400 border border-gray-300 rounded p-2 mb-2 flex flex-col"
                          >
                            <div>{message.text}</div>
                            <div className="text-sm text-gray-600">{formatMessageDate(message.timestamp)}</div>
                          </div>
                        )}
                      </td>
                      <td className="text-right p-2 break-all">
                        {message.origin._id !== (session?.user as any).id && (
                          <div
                            className="bg-gray-300 border border-gray-300 rounded p-2 mb-2 flex flex-col"
                          >
                            <div>{message.text}</div>
                            <div className="text-sm text-gray-600">{formatMessageDate(message.timestamp)}</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-300 bg-gray-200 flex items-center justify-between sticky bottom-0 w-full">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => {
                  setNewMessageText(e.target.value);
                  setIsSendButtonDisabled(!e.target.value.trim());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSendButtonDisabled) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 mr-4"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSendButtonDisabled}
                className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>)}
    </>
  );
}