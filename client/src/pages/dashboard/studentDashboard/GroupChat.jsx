// src/pages/GroupChat.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, Users, MessageCircle, AlertTriangle, X, User } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupChat() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/groups/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log(res.data)
      setGroups(res.data.groups || []);
      if (res.data.groups?.length > 0) {
        setSelectedGroup(res.data.groups[0]);
      }
    } catch (err) {
      toast.error('Failed to load your groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (!selectedGroup) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll for new messages

    return () => clearInterval(interval);
  }, [selectedGroup]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${selectedGroup._id}/messages`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
        console.log(err)
      toast.error(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedGroup) return;

    setSending(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${selectedGroup._id}/message`,
        { content: content.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setContent('');
      fetchMessages();
      toast.success('Message sent');
    } catch (err) {
        console.log(err)
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openGroupModal = () => setShowGroupModal(true);
  const closeGroupModal = () => setShowGroupModal(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h4 className="text-xl md:text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="h-8 w-8" />
            Group Chat
          </h4>

          {groups.length > 0 && (
            <div className="w-full md:w-80">
              <select
                value={selectedGroup?._id || ''}
                onChange={(e) => {
                  const group = groups.find((g) => g._id === e.target.value);
                  setSelectedGroup(group);
                }}
                className="w-full p-3 bg-indigo-600 border border-indigo-500 rounded-xl text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              >
                <option value="">Select a Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.participants?.length || 0} members)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 md:p-6">
        {loadingGroups ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-3xl shadow-xl p-12">
            <MessageCircle className="h-20 w-20 text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Groups Yet</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              You haven't joined or created any group chats yet. Teachers or admins can add you to class or school groups.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        ) : !selectedGroup ? (
          <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-3xl shadow-xl p-12">
            <Users className="h-20 w-20 text-indigo-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Select a Group</h2>
            <p className="text-lg text-gray-600 max-w-md">
              Choose a group from the dropdown above to start chatting.
            </p>
          </div>
        ) : (
          <>
            {/* Group Header - Clickable */}
            <div
              onClick={openGroupModal}
              className="bg-indigo-600 text-white p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition rounded-t-3xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  {selectedGroup.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedGroup.name}</h3>
                  <p className="text-sm opacity-90">
                    {selectedGroup.participants?.length || 0} members • Click for details
                  </p>
                </div>
              </div>
              <Users size={24} />
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-white rounded-b-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
              {/* Messages List */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">No messages yet. Be the first to send!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender._id.toString() === localStorage.getItem('userId'); // Adjust based on your auth
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                          }`}
                        >
                          {!isMe && (
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={msg.sender.profilePicture || '/default-avatar.png'}
                                alt={msg.sender.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <p className="font-medium text-sm opacity-90">
                                {msg.sender.name}
                              </p>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-2 opacity-70 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-gray-200 bg-white flex items-center gap-3"
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none max-h-32"
                  rows={1}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !content.trim()}
                  className={`p-4 rounded-full transition-all ${
                    sending || !content.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {sending ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <Send size={24} />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Group Members Modal */}
      {showGroupModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-modal-fade">
            {/* Modal Header */}
            <div className="bg-indigo-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                  {selectedGroup.name[0]}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{selectedGroup.name}</h2>
                  <p className="text-sm opacity-90">
                    {selectedGroup.participants?.length || 0} members
                  </p>
                </div>
              </div>
              <button
                onClick={closeGroupModal}
                className="p-2 rounded-full hover:bg-indigo-500 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedGroup.description && (
                <p className="text-gray-700 mb-6 italic border-l-4 border-indigo-200 pl-4">
                  {selectedGroup.description}
                </p>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} />
                Group Members
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedGroup.participants?.length > 0 ? (
                  selectedGroup.participants.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
                    >
                 
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center py-8">
                    No members yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}