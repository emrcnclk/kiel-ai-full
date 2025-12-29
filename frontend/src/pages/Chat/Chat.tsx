import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import axiosInstance from '../../utils/axios';
import { Message } from '../../types';
import { RootState } from '../../store/store';
import './Chat.css';

const Chat = () => {
  const { partnerId } = useParams();
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(partnerId || null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accessToken) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('new_message', (data: Message) => {
        setMessages(prev => [...prev, data]);
      });

      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [accessToken]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner);
    }
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/chat/conversations');
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    try {
      const response = await axiosInstance.get(`/chat/messages/${partnerId}`);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedPartner) return;

    if (socket) {
      socket.emit('send_message', {
        receiverId: selectedPartner,
        content: message,
      });
    } else {
      try {
        await axiosInstance.post('/chat/send', {
          receiverId: selectedPartner,
          content: message,
        });
        fetchMessages(selectedPartner);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }

    setMessage('');
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h2>Konuşmalar</h2>
        {conversations.map((conv) => (
          <div
            key={typeof conv.partner.id === 'object' ? conv.partner.id._id : conv.partner.id}
            className={`conversation-item ${selectedPartner === (typeof conv.partner.id === 'object' ? conv.partner.id._id : conv.partner.id) ? 'active' : ''}`}
            onClick={() => setSelectedPartner(typeof conv.partner.id === 'object' ? conv.partner.id._id : conv.partner.id)}
          >
            <div className="conversation-info">
              <strong>{conv.partner.email}</strong>
              {conv.lastMessage && (
                <p className="last-message">{conv.lastMessage.content}</p>
              )}
            </div>
            {conv.unreadCount > 0 && (
              <span className="unread-badge">{conv.unreadCount}</span>
            )}
          </div>
        ))}
      </div>
      <div className="chat-main">
        {selectedPartner ? (
          <>
            <div className="chat-messages">
              {messages.map((msg) => {
                const isOwn = typeof msg.sender === 'object' ? msg.sender.id === user?.id : msg.sender === user?.id;
                return (
                  <div key={msg._id} className={`message ${isOwn ? 'own' : 'other'}`}>
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesaj yazın..."
              />
              <button type="submit">Gönder</button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <p>Bir konuşma seçin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

