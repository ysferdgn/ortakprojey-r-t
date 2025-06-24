import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from '../utils/axios';

const quickActions = [
  'En uysal köpek türleri',
  'Tavsiye edilen mama markaları',
  'Kedi tuvalet eğitimi',
  'İlk defa evcil hayvan sahipleniyorum',
  'Köpeklerde tuvalet eğitimi',
  'Kedilerde tüy dökme',
  'Köpeklerde sosyalleşme',
  'Kediler için oyuncak önerisi',
];

const QUICK_ACTIONS_VISIBLE = 4;
const AI_MESSAGE_TRUNCATE = 220;

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Merhaba! 🐾 Ben senin Evcil Hayvan Asistanınım. Evcil hayvan bakımı, eğitimi veya sahiplenme hakkında bana istediğini sorabilirsin!' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [quickStart, setQuickStart] = useState(0);
  const [expandedMsgs, setExpandedMsgs] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setError(null);
    try {
      // Sadece son 5 mesajı geçmiş olarak gönder
      const history = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      const res = await axios.post('/api/ai-chat', {
        message: msg,
        history
      });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.text }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Üzgünüm, şu anda cevap veremiyorum.' }]);
      setError('Yapay zeka servisi kullanılamıyor.');
    } finally {
      setTyping(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  const handleQuickLeft = () => {
    setQuickStart((prev) => Math.max(0, prev - 1));
  };
  const handleQuickRight = () => {
    setQuickStart((prev) => Math.min(quickActions.length - QUICK_ACTIONS_VISIBLE, prev + 1));
  };

  const toggleExpand = (idx) => {
    setExpandedMsgs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div>
      {/* Yüzen Sohbet Butonu */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-green-700 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 flex items-center justify-center w-16 h-16 hover:scale-110 group"
          onClick={() => setOpen(true)}
          aria-label="Evcil Hayvan Asistanını Aç"
        >
          <ChatBubbleLeftRightIcon className="h-7 w-7 group-hover:animate-bounce" />
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            🐾
          </div>
        </button>
      )}

      {/* Sohbet Penceresi */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-fadeIn transition-all duration-300 border border-gray-100 overflow-hidden">
          {/* Başlık */}
          <div className="flex items-center justify-between px-4 py-3 bg-green-700 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                🐾
              </div>
              <div>
                <h3 className="font-semibold text-sm">Evcil Hayvan Asistanı</h3>
                <p className="text-xs opacity-90">Her zaman yardıma hazır</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              aria-label="Sohbeti Kapat"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm
                    ${msg.sender === 'user' 
                      ? 'bg-green-700 hover:bg-green-600 text-white ml-4' 
                      : 'bg-white text-gray-800 border border-gray-200 mr-4'
                    }`}
                >
                  {msg.sender === 'ai' && msg.text.length > AI_MESSAGE_TRUNCATE ? (
                    <>
                      {expandedMsgs[idx] ? (
                        <>
                          {msg.text}
                          <button className="block text-green-700 text-xs mt-2 underline" onClick={() => toggleExpand(idx)}>
                            Daha az gör
                          </button>
                        </>
                      ) : (
                        <>
                          {msg.text.slice(0, AI_MESSAGE_TRUNCATE)}...
                          <button className="block text-green-700 text-xs mt-2 underline" onClick={() => toggleExpand(idx)}>
                            Devamını oku
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 bg-white text-gray-800 shadow-sm border border-gray-200 mr-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Hızlı Sorgular */}
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <style>{`
              .scrollbar-thin-custom::-webkit-scrollbar {
                height: 4px;
                background: transparent;
              }
              .scrollbar-thin-custom::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 2px;
                transition: height 0.2s, background 0.2s;
                height: 4px;
              }
              .scrollbar-thin-custom:hover::-webkit-scrollbar-thumb,
              .scrollbar-thin-custom:active::-webkit-scrollbar-thumb {
                background: #4CAF50;
                height: 8px;
              }
              /* Firefox */
              .scrollbar-thin-custom {
                scrollbar-width: thin;
                scrollbar-color: #d1d5db transparent;
              }
              .scrollbar-thin-custom:hover {
                scrollbar-color: #4CAF50 transparent;
              }
            `}</style>
            <div className="flex-1 min-w-0">
              <div className="flex overflow-x-auto flex-nowrap gap-2 scrollbar-thin-custom pr-1">
                {quickActions.slice(quickStart, quickStart + QUICK_ACTIONS_VISIBLE).map((action, i) => (
                  <button
                    key={quickStart + i}
                    className="bg-gray-100 hover:bg-green-600 hover:text-white text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border border-gray-200 hover:border-green-600 hover:shadow-md whitespace-nowrap"
                    onClick={() => sendMessage(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Giriş */}
          <div className="flex items-center px-4 py-3 bg-white border-t border-gray-100">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                placeholder="Evcil hayvanın hakkında bir şey sor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="Mesajını yaz"
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-600 text-white rounded-full p-2 transition-all duration-200 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || typing}
                aria-label="Mesajı Gönder"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;