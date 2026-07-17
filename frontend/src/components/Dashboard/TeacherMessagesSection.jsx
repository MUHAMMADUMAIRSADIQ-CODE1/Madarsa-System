import { useState, useEffect, useCallback } from 'react';
import teacherAcademicService from '../../services/teacherAcademicService';
import { useAuth } from '../../context/AuthContext';
import {
  FiMail, FiSend, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight,
  FiMessageSquare, FiPlus, FiX, FiUser, FiClock, FiArrowLeft
} from 'react-icons/fi';

export default function TeacherMessagesSection() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const teacherId = user?._id || user?.id;

  const fetchConversations = useCallback(async (p = 1) => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const res = await teacherAcademicService.getConversations(teacherId, { page: p, limit: 20 });
      const data = res?.data || res;
      setConversations(data?.conversations || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  const fetchMessages = useCallback(async (convId) => {
    if (!teacherId) return;
    try {
      const res = await teacherAcademicService.getMessages(convId, teacherId);
      const data = res?.data || res;
      setMessages(data?.messages || []);
      setCurrentConversation(data?.conversation || null);
    } catch (err) {
      setError(err.message);
    }
  }, [teacherId]);

  useEffect(() => { fetchConversations(page); }, [page, fetchConversations]);

  const handleSelectConversation = async (conv) => {
    setCurrentConversation(conv);
    setMessages([]);
    await fetchMessages(conv._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    setSending(true);
    try {
      await teacherAcademicService.sendMessage({
        conversationId: currentConversation._id,
        content: newMessage.trim(),
        senderRole: 'teacher',
      });
      setNewMessage('');
      setSuccess('Message sent');
      fetchMessages(currentConversation._id);
      fetchConversations(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const recipientId = formData.get('recipientId');
    const content = formData.get('content');
    const subject = formData.get('subject');
    if (!recipientId || !content) return;

    setSending(true);
    try {
      await teacherAcademicService.sendMessage({
        recipientId,
        recipientRole: formData.get('recipientRole') || 'student',
        content,
        subject: subject || '',
        senderRole: 'teacher',
      });
      setShowComposeModal(false);
      setSuccess('Message sent');
      fetchConversations(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (convId) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await teacherAcademicService.deleteConversation(convId, teacherId);
      setSuccess('Conversation deleted');
      if (currentConversation?._id === convId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      fetchConversations(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Conversation List View
  if (!currentConversation) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border-light flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-dark">Messages</h2>
            <p className="text-sm text-text-light mt-1">{conversations.length > 0 ? `${conversations.length} conversations` : 'Send and receive messages'}</p>
          </div>
          <button onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark text-sm">
            <FiPlus className="w-4 h-4" /> Compose
          </button>
        </div>

        {error && <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        {success && <div className="m-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

        {loading ? (
          <div className="p-5 space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <FiMail className="w-16 h-16 text-border-light mx-auto mb-4" />
            <p className="text-text-light font-medium">No messages yet</p>
            <p className="text-sm text-text-light mt-2">Start a conversation with a student or admin</p>
            <button onClick={() => setShowComposeModal(true)}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark text-sm">
              <FiPlus className="w-4 h-4 inline mr-1.5" /> Compose Message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {conversations.map(conv => {
              const otherParticipant = conv.participants?.find(p => p.user?._id !== user?._id);
              return (
                <div key={conv._id}
                  className="flex items-center gap-4 p-4 sm:p-5 hover:bg-bg-light cursor-pointer transition-colors"
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    {otherParticipant?.user?.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-text-dark text-sm truncate">
                        {otherParticipant?.user?.fullName || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full font-bold">{conv.unreadCount}</span>
                        )}
                        <span className="text-xs text-text-light">{formatTime(conv.lastMessage?.sentAt)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-light capitalize">{otherParticipant?.role}</p>
                    {conv.lastMessage && (
                      <p className="text-sm text-text-body truncate mt-0.5">{conv.lastMessage.content}</p>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv._id); }}
                    className="p-1.5 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Conversation Detail View
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border-light flex items-center gap-3">
        <button onClick={() => { setCurrentConversation(null); setMessages([]); }}
          className="p-2 hover:bg-bg-light rounded-lg transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {currentConversation.participants?.find(p => p.user?._id !== user?._id)?.user?.fullName?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-dark">
            {currentConversation.participants?.find(p => p.user?._id !== user?._id)?.user?.fullName || 'Unknown'}
          </p>
          <p className="text-xs text-text-light capitalize">
            {currentConversation.participants?.find(p => p.user?._id !== user?._id)?.role || ''}
            {currentConversation.subject && ` - ${currentConversation.subject}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        {messages.map((msg, idx) => {
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
          const senderName = msg.sender?.fullName || msg.senderRole || 'Unknown';
          return (
            <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-xl ${isMine ? 'bg-primary text-white' : 'bg-bg-light text-text-dark'}`}>
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-text-light'}`}>{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-8 text-text-light">
            <FiMessageSquare className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">No messages in this conversation yet</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-light">
        <div className="flex gap-3">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..." onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            className="flex-1 px-4 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
          <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
            className="px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowComposeModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-dark">New Message</h3>
              <button onClick={() => setShowComposeModal(false)} className="text-text-light hover:text-text-dark"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleNewConversation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Recipient ID *</label>
                <input type="text" name="recipientId" required placeholder="MongoDB User ID"
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Recipient Role</label>
                  <select name="recipientRole" className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Subject</label>
                  <input type="text" name="subject" placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Message *</label>
                <textarea name="content" required rows={4}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={sending}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send'}
                </button>
                <button type="button" onClick={() => setShowComposeModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-border-light text-text-body rounded-xl font-semibold hover:bg-bg-light">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
