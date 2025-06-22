import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaComments, FaPaperPlane, FaSpinner, FaArrowLeft, FaSearch, FaTrash } from 'react-icons/fa';
import api, { messages as messagesApi, conversationsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const ConversationList = ({ conversations, onSelect, selectedConversationId, onDelete }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    return (
        <div className="flex flex-col h-full border-r border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Sohbetler</h2>
                <div className="relative mt-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Sohbetlerde ara..."
                        className="w-full bg-gray-100 border-none rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {conversations.length > 0 ? (
                    conversations.map(convo => (
                        <div
                            key={convo._id}
                            onClick={() => onSelect(convo._id)}
                            className={`group flex items-center p-4 cursor-pointer hover:bg-gray-100 ${selectedConversationId === convo._id ? 'bg-blue-50' : ''}`}
                        >
                            <div className="relative w-12 h-12">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                                    {getInitials(convo.otherParticipant?.name)}
                                </div>
                                {/* Can add online indicator later */}
                                {/* <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span> */}
                            </div>
                            <div className="ml-4 flex-grow">
                                <p className="font-semibold text-gray-800">{convo.otherParticipant?.name || 'Bilinmeyen Kullanıcı'}</p>
                                <p className="text-sm text-gray-500 truncate">{convo.lastMessage?.text || 'Henüz mesaj yok...'}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent onSelect from firing
                                    onDelete(convo._id);
                                }}
                                className="ml-2 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Sohbeti Sil"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">Sohbet bulunamadı.</div>
                )}
            </div>
        </div>
    );
};

const ChatWindow = ({ conversationId, user }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        };

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/conversations/${conversationId}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error("Mesajlar yüklenirken hata oluştu", err);
                // If the conversation was deleted, the selected ID might be invalid
                if (err.response && err.response.status === 404) {
                    setMessages([]); // Clear messages if conversation not found
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [conversationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || !user) return;

        setSending(true);
        try {
            const response = await api.post(`/conversations/${conversationId}/messages`, { text: newMessage.trim() });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Mesaj gönderilirken bir hata oluştu');
        } finally {
            setSending(false);
        }
    };

    if (!conversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                <FaComments size={48} />
                <p className="mt-4 text-lg">Sohbeti görüntülemek için birini seçin.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex-auto overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <FaSpinner className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMyMessage = msg.sender?._id === user?.id;
                        
                        return (
                            <div key={msg._id} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col space-y-1 text-base max-w-lg mx-2 ${isMyMessage ? 'order-1 items-end' : 'order-2 items-start'}`}>
                                    <div className={`px-4 py-2 rounded-2xl inline-block ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                        <p className="break-words">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Bir mesaj yazın..."
                        className="w-full p-3 pr-12 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPaperPlane size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};


export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const conversationIdFromUrl = params.get('conversation');
        if (conversationIdFromUrl) {
            setSelectedConversationId(conversationIdFromUrl);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const res = await api.get('/conversations');
                setConversations(res.data);
            } catch (err) {
                console.error("Sohbetler yüklenirken hata oluştu", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const handleDeleteConversation = async (conversationId) => {
        if (!window.confirm('Bu sohbeti ve içindeki tüm mesajları kalıcı olarak silmek istediğinizden emin misiniz?')) {
            return;
        }
        try {
            await conversationsApi.deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c._id !== conversationId));
            // If the deleted conversation was selected, unselect it
            if (selectedConversationId === conversationId) {
                setSelectedConversationId(null);
                // Optionally clear the URL parameter
                navigate('/messages', { replace: true });
            }
        } catch (err) {
            console.error('Sohbet silinirken hata oluştu:', err);
            alert('Sohbet silinirken bir hata oluştu.');
        }
    };

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <div className="p-4 border-b bg-white flex-shrink-0">
                 <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    title="Ana Sayfaya Dön"
                >
                    <FaArrowLeft className="text-lg" />
                    Ana Sayfa
                </button>
            </div>
            <div className="flex flex-auto overflow-hidden">
                <div style={{ flex: '0 0 380px' }} className="flex-col h-full hidden md:flex">
                    <ConversationList
                        conversations={conversations}
                        onSelect={setSelectedConversationId}
                        selectedConversationId={selectedConversationId}
                        onDelete={handleDeleteConversation}
                    />
                </div>
                <div className="flex-auto h-full flex flex-col">
                    <ChatWindow conversationId={selectedConversationId} user={user} />
                </div>
            </div>
        </div>
    );
} 