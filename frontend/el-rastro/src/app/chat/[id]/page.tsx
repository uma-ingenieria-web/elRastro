"use client";
import { useEffect, useState } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const result = await fetch(`http://localhost:8008/api/v1/chat/${id}`);
      const chatData = await result.json();
      setChatInfo(chatData);

      const messagesResult = await fetch(`http://localhost:8008/api/v1/chat/${id}/messages`);
      const messagesData = await messagesResult.json();
      setMessages(messagesData);

      const productResult = await fetch(`http://localhost:8002/api/v1/products/${chatData.product._id}`);
      const productData = await productResult.json();
      setProductInfo(productData);

      setNewMessageText('');
      setIsSendButtonDisabled(true);
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

      const response = await fetch(`http://localhost:8008/api/v1/chat/${id}/send?origin_id=${chatInfo?.vendor._id}`, {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div style={{ width: '500px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
        {productInfo && (
          <div style={{ padding: '10px', borderBottom: '1px solid #ccc', backgroundColor: '#f5f5f5' }}>
            Conversation for: {productInfo.title}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', fontWeight: 'bold' }}>
            <div style={{ width: '50%', textAlign: 'center' }}>VENDOR</div>
            <div style={{ width: '50%', textAlign: 'center' }}>INTERESTED</div>
          </div>
          <div style={{ overflowY: 'auto', flex: '1', position: 'relative', maxHeight: '80%' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <tbody>
                {messages.map((message, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'left', padding: '5px', wordWrap: 'break-word' }}>
                      {message.origin._id === chatInfo?.vendor._id && (
                        <div
                          style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '5px',
                            marginBottom: '5px',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div>{message.text}</div>
                          <div style={{ fontSize: '0.8em', color: '#888' }}>{formatMessageDate(message.timestamp)}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', padding: '5px', wordWrap: 'break-word' }}>
                      {message.origin._id === chatInfo?.interested._id && (
                        <div
                          style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '5px',
                            marginBottom: '5px',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div>{message.text}</div>
                          <div style={{ fontSize: '0.8em', color: '#888' }}>{formatMessageDate(message.timestamp)}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #ccc', backgroundColor: '#f5f5f5', display: 'flex', position: 'absolute', bottom: '0', width: '100%' }}>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => {
                setNewMessageText(e.target.value);
                setIsSendButtonDisabled(!e.target.value.trim());
              }}
              placeholder="Type your message..."
              style={{ width: 'calc(100% - 70px)', marginRight: '10px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSendButtonDisabled}
              style={{
                padding: '5px 10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}