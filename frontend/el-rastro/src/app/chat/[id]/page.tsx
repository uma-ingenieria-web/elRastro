"use client"
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
  product_id: string;
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Marcador de posición para la carga de datos existente
      // Reemplaza esta parte con tu lógica para cargar datos
      const result = await fetch(`http://localhost:8008/api/v1/chat/${id}`);
      const chatData = await result.json();
      setChatInfo(chatData);
      console.log('Chat Data:', chatData);

      const messagesResult = await fetch(`http://localhost:8008/api/v1/chat/${id}/messages`);
      const messagesData = await messagesResult.json();
      setMessages(messagesData);
      console.log('Messages Data:', messagesData);

      const productResult = await fetch(`http://localhost:8002/api/v1/products/${chatData.product_id}`);
      const productData = await productResult.json();
      setProductInfo(productData);
      console.log('Product Data:', productData);

      setNewMessageText(''); // Limpiar el campo de texto después de cargar los datos
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch(`http://localhost:8008/api/v1/chat/${id}/send?origin_id=${chatInfo?.vendor._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessageText }),
      });

      if (response.ok) {
        // Recargar los datos después de enviar el mensaje
        fetchData();
      } else {
        console.error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center flex-col h-screen bg-gray-100">
      {productInfo && (
        <div style={{ marginBottom: '10px' }}>
          Conversation for {productInfo.title}
        </div>
      )}
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.origin._id === chatInfo?.vendor._id ? 'left' : 'right',
              padding: '5px',
              border: '1px solid #ccc',
              margin: '5px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.origin._id === chatInfo?.vendor._id ? 'flex-start' : 'flex-end',
            }}
          >
            <div>{message.text}</div>
            <div style={{ fontSize: '0.8em', color: '#888' }}>{message.timestamp}</div>
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}