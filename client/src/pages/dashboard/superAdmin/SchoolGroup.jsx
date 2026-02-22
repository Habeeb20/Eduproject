


// src/pages/admin/SchoolWideGroup.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Send,
  Loader2,
  Users,
  UserX,
  Lock,
  Unlock,
  Plus,
  Search,
  AlertTriangle,
  MessageCircle,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolWideGroup() {
  const [group, setGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]); // Teachers + Parents to add
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const messagesEndRef = useRef(null);

  const userId = localStorage.getItem('userId'); // Adjust based on your auth

  useEffect(() => {
    fetchSchoolGroup();
  }, []);

  const fetchSchoolGroup = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/groups/school-wide`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGroup(res.data.group);
      setParticipants(res.data.group?.participants || []);
      setNewName(res.data.group?.name || '');

      // Fetch potential users to add (teachers + parents not yet in group)
      const usersRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/school-recipients`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const filtered = usersRes.data.users.filter(
        u => !res.data.group.participants.some(p => p.id === u._id)
      );
      setAvailableUsers(filtered);
      console.log(filtered)
    } catch (err) {
      console.log(err);
      if (err.response?.status === 404) {
        toast.info('School-wide group not created yet.');
      } else {
        toast.error('Failed to load school-wide group');
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll messages every 10s
  useEffect(() => {
    if (!group) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [group]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/messages`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !group) return;

    if (group.isBlocked && !group.admins.some(a => a._id.toString() === userId)) {
      toast.error('Group is blocked. Only admins can send messages.');
      return;
    }

    setSending(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/message`,
        { content: content.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setContent('');
      fetchMessages();
      toast.success('Message sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const toggleAddUser = (userId) => {
    setSelectedToAdd(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const addParticipants = async () => {
    if (selectedToAdd.length === 0) {
      toast.error('Select at least one user to add');
      return;
    }

    setAdding(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/add-participants`,
        { userIds: selectedToAdd },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Participants added');
      setSelectedToAdd([]);
      setShowAddModal(false);
      fetchSchoolGroup();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add participants');
    } finally {
      setAdding(false);
    }
  };

  const removeParticipant = async (userId) => {
    if (!window.confirm('Remove this participant?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/participant/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setParticipants(prev => prev.filter(p => p._id !== userId));
      toast.success('Participant removed');
    } catch (err) {
      toast.error('Failed to remove participant');
    }
  };

  const toggleBlock = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/block`,
        { isBlocked: !group.isBlocked },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGroup(res.data.group);
      toast.success(`Group ${group.isBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (err) {
      toast.error('Failed to update block status');
    }
  };

  const handleEditName = async () => {
    if (!newName.trim()) {
      toast.error('Group name cannot be empty');
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/name`,
        { name: newName.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGroup(res.data.group);
      setEditingName(false);
      toast.success('Group name updated');
    } catch (err) {
      toast.error('Failed to update group name');
    }
  };

  const isAdmin = group?.admins?.some(a => a._id?.toString() === userId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            School-Wide Group Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            No school-wide communication group has been created yet.
          </p>
          {isAdmin && (
            <button
              onClick={() => {/* Add create group logic here if needed */}}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition shadow-lg"
            >
              Create School Group
            </button>
          )}
        </div>
      </div>
    );
  }

  // Non-participant check
  if (!group.participants.some(p => p.id?.toString() === userId) && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8">
            You are not a member of the school-wide group.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              {group.name[0]}
            </div>
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="p-2 border border-white/30 bg-transparent text-white rounded"
                  />
                  <button onClick={handleEditName} className="text-white">
                    <Save size={20} />
                  </button>
                  <button onClick={() => setEditingName(false)} className="text-white">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
                  {isAdmin && (
                    <button onClick={() => setEditingName(true)} className="text-white opacity-80 hover:opacity-100">
                      <Edit size={20} />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm opacity-90">
                {group.participants?.length || 0} members • School-Wide
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-4">
              <button
                onClick={toggleBlock}
                className={`px-5 py-2 rounded-lg font-medium transition ${
                  group.isBlocked
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white shadow-md`}
              >
                {group.isBlocked ? (
                  <>
                    <Unlock size={18} className="inline mr-2" />
                    Unblock Group
                  </>
                ) : (
                  <>
                    <Lock size={18} className="inline mr-2" />
                    Block Group
                  </>
                )}
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition text-white shadow-md flex items-center gap-2"
              >
                <Plus size={18} />
                Add Members
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 md:p-6">
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender._id.toString() === userId;
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

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-gray-200 bg-white flex items-center gap-3"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                group.isBlocked && !isAdmin
                  ? 'Group is blocked. Only admins can send messages.'
                  : 'Type your message...'
              }
              className="flex-1 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none max-h-32"
              rows={1}
              disabled={sending || (group.isBlocked && !isAdmin)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !content.trim() || (group.isBlocked && !isAdmin)}
              className={`p-4 rounded-full transition-all ${
                sending || !content.trim() || (group.isBlocked && !isAdmin)
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
      </main>

      {/* Add Members Modal (Admin Only) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h2 className="text-2xl font-bold">Add Members</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-indigo-700 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teachers or parents..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div className="max-h-[50vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                {availableUsers
                  .filter(
                    u =>
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.role.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
                    <label
                      key={user._id}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedToAdd.includes(user._id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedToAdd.includes(user._id)}
                        onChange={() => toggleAddUser(user._id)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <img
                        src={user.profilePicture || '/default-avatar.png'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                      </div>
                    </label>
                  ))}
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addParticipants}
                  disabled={adding || selectedToAdd.length === 0}
                  className={`px-6 py-3 rounded-xl text-white font-medium transition ${
                    adding || selectedToAdd.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  {adding ? (
                    <>
                      <Loader2 className="animate-spin inline mr-2" size={18} />
                      Adding...
                    </>
                  ) : (
                    'Add Selected'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}