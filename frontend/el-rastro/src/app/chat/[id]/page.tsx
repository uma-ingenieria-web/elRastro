"use client";
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

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

export default function ChatPageId({ params }: { params: { id: string } }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const result = await fetch(`http://localhost:8006/api/v1/chat/${id}`);
      const chatData = await result.json();
      setChatInfo(chatData);

      const messagesResult = await fetch(`http://localhost:8006/api/v1/chat/${id}/messages`);
      const messagesData = await messagesResult.json();
      setMessages(messagesData);

      const productResult = await fetch(`http://localhost:8002/api/v1/products/${chatData.product._id}`);
      const productData = await productResult.json();
      setProductInfo(productData);

      setNewMessageText('');
      setIsSendButtonDisabled(true);
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!newMessageText.trim()) {
        return;
      }

      const response = await fetch(`http://localhost:8006/api/v1/chat/${id}/send?origin_id=${chatInfo?.vendor._id}`, {
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl border border-gray-300 rounded overflow-hidden flex flex-col h-120">
        {productInfo && (
          <div className="p-4 border-b border-gray-300 bg-gray-200">
            <h2 className="text-lg font-semibold">Conversation: 
              <Link href={`../products/${chatInfo?.product._id}`} className="cursor-pointer">
                <strong>{productInfo.title}</strong>
              </Link>
            </h2>
          </div>
        )}
        <div className="flex flex-col h-full relative">
          <div className="flex justify-between p-2 font-bold">
            <div className="w-1/2 text-center">VENDOR</div>
            <div className="w-1/2 text-center">INTERESTED</div>
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
                      {message.origin._id === chatInfo?.vendor._id && (
                        <div
                          className="bg-gray-400 border border-gray-300 rounded p-2 mb-2 flex flex-col"
                        >
                          <div>{message.text}</div>
                          <div className="text-sm text-gray-600">{formatMessageDate(message.timestamp)}</div>
                        </div>
                      )}
                    </td>
                    <td className="text-right p-2 break-all">
                      {message.origin._id === chatInfo?.interested._id && (
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
    </div>
  );
}