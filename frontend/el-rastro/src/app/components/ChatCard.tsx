"use client"
// components/ChatCard.js
import React from 'react';
import Link from 'next/link';

interface ChatWithDetails {
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
        timestamp: string;
        origin: string;
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

function ChatCard({ _id, product, user, lastMessage }: ChatWithDetails) {
    const isCurrentUser = user._id === lastMessage.origin;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',  // Centra horizontalmente
            marginTop: '10px',  // Ajusta el margen superior
        }}>
            <div style={{
                maxWidth: "1000px",
                width: '100%',  // Asegura que no ocupe toda la página
                margin: '10px',
                padding: '10px',
                borderRadius: '15px',  // Ajusta el radio para hacerlo más redondeado
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',  // Evita que el contenido se desborde
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.2em' }}><strong>{product.title}</strong></h2>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',  // Cambia la dirección de los elementos a columnas
                    alignItems: 'flex-start',  // Alinea los elementos a la izquierda
                    marginBottom: '10px',
                }}>
                    <img
                        src="https://picsum.photos/800/400"
                        alt="Product"
                        style={{
                            borderRadius: '50%',
                            width: '80px',
                            height: '80px',
                            border: '1px solid #ddd',  // Añade un borde a la imagen
                            marginBottom: '10px',
                        }}
                    />
                    <div style={{
                        textAlign: 'left',
                        fontSize: '1.1em',
                        flex: 1,
                        wordWrap: 'break-word',
                        // Agrega estilos para limitar el tamaño del mensaje
                        maxWidth: '100%',  // Ajusta el ancho máximo del mensaje
                        overflow: 'hidden',  // Oculta el contenido que desborda el contenedor
                    }}>
                        {isCurrentUser ? (
                            <p><strong>You:</strong> {lastMessage.text}</p>
                        ) : (
                            <p><strong>{user.username}:</strong> {lastMessage.text}</p>
                        )}
                    </div>
                </div>
                <div style={{
                    textAlign: 'right',
                    fontSize: '0.8em',
                    color: '#777',  // Ajusta el color del texto
                }}>{formatDate(lastMessage.timestamp)}</div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '10px',
                }}>
                    <Link href={`../chat/${_id}`}>
                        <div style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            padding: '8px 15px',
                            backgroundColor: '#007bff',  // Ajusta el color de fondo
                            color: '#fff',  // Ajusta el color del texto
                            textDecoration: 'none',  // Elimina el subrayado del enlace
                        }}>Open Chat</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ChatCard;
