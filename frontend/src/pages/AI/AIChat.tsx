import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axios';
import './AIChat.css';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/ai/chat', { message: input });
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-header">
        <h1>AI Asistan</h1>
        <p>Size nasıl yardımcı olabilirim?</p>
      </div>
      <div className="ai-chat-messages">
        {messages.length === 0 && (
          <div className="ai-chat-welcome">
            <p>Merhaba! Ben KIEL-AI-FULL asistanıyım. Size nasıl yardımcı olabilirim?</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            <div className="ai-message-content">
              {msg.role === 'assistant' && <span className="ai-icon">🤖</span>}
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-message assistant">
            <div className="ai-message-content">
              <span className="ai-icon">🤖</span>
              <p>Yazıyor...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="ai-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mesajınızı yazın..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Gönder
        </button>
      </form>
    </div>
  );
};

export default AIChat;

