// src/pages/Messages.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, AlertCircle, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/messages/recipients`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTeachers(res.data.teachers || []);
      setAdmins(res.data.admins || []);
    } catch (err) {
      toast.error(err.response.data?.message || 'Failed to load recipients');
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setConversations(res.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations');
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (id) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSend = async (e, threadId = null) => {
    e.preventDefault();
    if (selectedRecipients.length === 0 && !threadId) {
      toast.error('Select at least one recipient');
      return;
    }
    if (!content.trim()) {
      toast.error('Enter message content');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/messages/send`, {
        recipients: threadId ? [] : selectedRecipients, // For replies, recipients are from original
        subject,
        content,
        threadId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success(threadId ? 'Reply sent!' : 'Message sent!');
      setSelectedRecipients([]);
      setSubject('');
      setContent('');
      setShowCompose(false);
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchConversations();
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const getThreadMessages = (threadId) => {
    return conversations.filter(m => m._id === threadId || m.threadId === threadId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
          Messages & Conversations
        </h1>

        <button
          onClick={() => setShowCompose(!showCompose)}
          className="mb-8 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
        >
          <Send size={20} />
          {showCompose ? 'Close Compose' : 'Compose New Message'}
        </button>

        {showCompose && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-10 mb-10">
            <form onSubmit={(e) => handleSend(e)} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Recipients *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Teachers</h3>
                    <div className="space-y-2">
                      {teachers.map((teacher) => (
                        <label key={teacher._id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(teacher._id.toString())}
                            onChange={() => toggleRecipient(teacher._id.toString())}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            disabled={sending}
                          />
                          <span className="text-gray-900">{teacher.name}</span>
                        </label>
                      ))}
                      {teachers.length === 0 && <p className="text-gray-500">No teachers available.</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Admins</h3>
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <label key={admin._id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(admin._id.toString())}
                            onChange={() => toggleRecipient(admin._id.toString())}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            disabled={sending}
                          />
                          <span className="text-gray-900">{admin.name}</span>
                        </label>
                      ))}
                      {admins.length === 0 && <p className="text-gray-500">No admins available.</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  placeholder="e.g. Inquiry about grades"
                  disabled={sending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[200px] text-lg"
                  placeholder="Write your message here..."
                  required
                  disabled={sending}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`w-full py-4 px-8 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                  sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                }`}
              >
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={22} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {conversations.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No Conversations Yet
              </h2>
              <p className="text-gray-600">
                Start a new message above.
              </p>
            </div>
          ) : (
            conversations.filter(m => !m.threadId).map((originalMsg) => {
              const threadMessages = conversations.filter(m => m.threadId === originalMsg._id || m._id === originalMsg._id);
              return (
                <div key={originalMsg._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thread: {originalMsg.subject || 'No Subject'}
                  </h3>

                  {threadMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((msg) => (
                    <div key={msg._id} className="mb-6 pb-6 border-b last:border-b-0 last:pb-0 last:mb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={msg.sender.profilePicture || '/default-avatar.png'}
                            alt={msg.sender.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {msg.sender.name} ({msg.sender.role})
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {msg.status !== 'read' && msg.recipients.some(r => r._id.toString() === localStorage.getItem('userId')) && (
                          <button
                            onClick={() => markAsRead(msg._id)}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition text-sm"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>

                      {/* Full Sender Details */}
                      <div className="p-4 bg-gray-50 rounded-xl mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Sender Details:</p>
                        <p><strong>Email:</strong> {msg.sender.email}</p>
                        <p><strong>Phone:</strong> {msg.sender.phone || 'N/A'}</p>
                        {msg.sender.role === 'student' && (
                          <>
                            <p><strong>Student ID:</strong> {msg.sender.studentId}</p>
                            <p><strong>Class:</strong> {msg.sender.class}</p>
                          </>
                        )}
                        {msg.sender.role === 'parent' && msg.sender.children && msg.sender.children.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Child(ren) Details:</p>
                            {msg.sender.children.map((child) => (
                              <div key={child._id} className="mb-2 pl-4 border-l-4 border-indigo-200">
                                <p><strong>Name:</strong> {child.name}</p>
                                <p><strong>Student ID:</strong> {child.studentId}</p>
                                <p><strong>Class:</strong> {child.class}</p>
                                <p><strong>Roll Number:</strong> {child.rollNumber || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-800 whitespace-pre-line">{msg.content}</p>
                    </div>
                  ))}

                  {/* Reply Form */}
                  <div className="mt-6">
                    <form onSubmit={(e) => handleSend(e, originalMsg._id)} className="space-y-4">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[100px]"
                        placeholder="Write your reply here..."
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Reply size={20} />
                        {sending ? 'Sending...' : 'Send Reply'}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}