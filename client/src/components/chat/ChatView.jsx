import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Hash,
  User,
  Users,
  Search,
  MoreVertical,
  Reply,
  CheckCheck,
  Radio,
  Image as ImageIcon,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../common/Avatar';

const EMOJI_LIST = ['👍', '❤️', '🔥', '🚀', '🎉', '👀', '💯'];

export const ChatView = ({ workspaceId, initialConversationId = null }) => {
  const { user } = useAuth();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const { success, error } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Conversations
  useEffect(() => {
    if (!workspaceId) return;
    const fetchConvs = async () => {
      try {
        setLoading(true);
        const res = await chatService.getConversations(workspaceId);
        if (res.success && res.conversations) {
          setConversations(res.conversations);
          const initial =
            res.conversations.find((c) => c._id === initialConversationId) ||
            res.conversations[0];
          setActiveConv(initial);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConvs();
  }, [workspaceId, initialConversationId]);

  // Fetch Messages for Active Conversation
  useEffect(() => {
    if (!activeConv?._id) return;

    const fetchMsgs = async () => {
      try {
        const res = await chatService.getMessages(activeConv._id);
        if (res.success && res.messages) {
          setMessages(res.messages);
          scrollToBottom();
          // Mark as read
          chatService.markAsRead(activeConv._id);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMsgs();
  }, [activeConv?._id]);

  // Real-Time Socket Events for Chat
  useEffect(() => {
    if (!activeConv?._id || !socket) return;
    joinConversation(activeConv._id);

    // Message received
    const handleMessageReceived = ({ conversationId, message }) => {
      if (conversationId === activeConv._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    // Typing status
    const handleTyping = ({ conversationId, user: typingUser, isTyping }) => {
      if (conversationId === activeConv._id && typingUser?.id !== user._id) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (isTyping) next.add(typingUser.name);
          else next.delete(typingUser.name);
          return next;
        });
      }
    };

    // Reaction updated
    const handleMessageReacted = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    socket.on('message:received', handleMessageReceived);
    socket.on('message:typing', handleTyping);
    socket.on('message:reacted', handleMessageReacted);

    return () => {
      leaveConversation(activeConv._id);
      socket.off('message:received', handleMessageReceived);
      socket.off('message:typing', handleTyping);
      socket.off('message:reacted', handleMessageReacted);
    };
  }, [activeConv?._id, socket, user._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Typing Handlers
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && activeConv) {
      socket.emit('message:typing:start', {
        conversationId: activeConv._id,
        user: { id: user._id, name: user.name },
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('message:typing:stop', {
          conversationId: activeConv._id,
          user: { id: user._id, name: user.name },
        });
      }, 2000);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socket && activeConv) {
      socket.emit('message:typing:stop', {
        conversationId: activeConv._id,
        user: { id: user._id, name: user.name },
      });
    }

    try {
      const res = await chatService.sendMessage(activeConv._id, {
        text: textToSend,
        replyTo: replyingTo?._id || null,
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setReplyingTo(null);
        scrollToBottom();

        // Broadcast over socket
        socket?.emit('message:send', {
          conversationId: activeConv._id,
          workspaceId,
          message: res.message,
        });
      }
    } catch (err) {
      error('Failed', 'Could not send message');
    }
  };

  // File Upload in Chat
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspaceId);

    setUploading(true);
    try {
      const uploadRes = await fileService.uploadFile(formData);
      if (uploadRes.success && uploadRes.file) {
        const res = await chatService.sendMessage(activeConv._id, {
          text: `Shared a file: ${file.name}`,
          attachments: [
            {
              name: file.name,
              url: uploadRes.file.url,
              fileType: file.type,
              size: file.size,
            },
          ],
        });

        if (res.success && res.message) {
          setMessages((prev) => [...prev, res.message]);
          scrollToBottom();
          socket?.emit('message:send', {
            conversationId: activeConv._id,
            workspaceId,
            message: res.message,
          });
        }
      }
    } catch (err) {
      error('Upload Failed', 'Could not upload attachment to chat');
    } finally {
      setUploading(false);
    }
  };

  // React to Message
  const handleReact = async (messageId, emoji) => {
    try {
      const res = await chatService.reactToMessage(messageId, emoji);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? res.message : m))
        );
        socket?.emit('message:react', {
          conversationId: activeConv._id,
          messageId,
          reactions: res.message.reactions,
        });
      }
    } catch (err) {}
  };

  const getConvTitle = (conv) => {
    if (!conv) return '';
    if (conv.type === 'workspace') return `# ${conv.name || 'general'}`;
    if (conv.type === 'project') return `# ${conv.project?.name || conv.name}`;
    if (conv.type === 'direct') {
      const other = conv.participants?.find((p) => p._id !== user._id);
      return other?.name || conv.name || 'Direct Message';
    }
    return conv.name || 'Channel';
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-2xl bg-surface-900/80 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Left Sidebar: Conversations list */}
      <div className="w-64 sm:w-72 border-r border-slate-800 bg-surface-950/60 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-4 h-4 text-brand-400 animate-pulse" />
            Live Channels & DMs
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => {
            const isActive = activeConv?._id === conv._id;
            const title = getConvTitle(conv);
            const isDM = conv.type === 'direct';
            const otherUser = isDM
              ? conv.participants?.find((p) => p._id !== user._id)
              : null;

            return (
              <button
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-white font-semibold border border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isDM ? (
                  <Avatar
                    src={otherUser?.avatar}
                    name={otherUser?.name}
                    size="xs"
                    status={otherUser?.status || 'offline'}
                    showStatus
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate">{title}</p>
                  {conv.lastMessage?.text && (
                    <p className="text-[10px] text-slate-500 truncate">
                      {conv.lastMessage.text}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chat View */}
      <div className="flex-1 flex flex-col bg-surface-950/30">
        {/* Chat Header */}
        {activeConv && (
          <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-surface-950/50">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {getConvTitle(activeConv)}
              </h3>
              {activeConv.participants && (
                <span className="text-xs text-slate-400">
                  ({activeConv.participants.length} members)
                </span>
              )}
            </div>

            {/* Live active typing notification banner */}
            {typingUsers.size > 0 && (
              <span className="text-xs text-brand-400 font-medium animate-pulse">
                {Array.from(typingUsers).join(', ')}{' '}
                {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </span>
            )}
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;

            return (
              <div
                key={msg._id}
                className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <Avatar
                    src={msg.sender?.avatar}
                    name={msg.sender?.name}
                    size="sm"
                    status={msg.sender?.status}
                    showStatus
                  />
                )}

                <div className={`max-w-[75%] sm:max-w-md ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender name & timestamp */}
                  <div
                    className={`flex items-center gap-2 mb-1 text-[11px] ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isMe && (
                      <span className="font-semibold text-white">
                        {msg.sender?.name || 'User'}
                      </span>
                    )}
                    <span className="text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm break-words relative transition-all ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-600/20'
                        : 'bg-surface-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    {/* Reply preview */}
                    {msg.replyTo && (
                      <div className="text-xs opacity-75 pb-1 mb-1 border-b border-white/20 italic">
                        Replying to: "{msg.replyTo.text?.slice(0, 30)}..."
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-black/20 rounded-xl text-xs hover:bg-black/30 transition-colors"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="truncate underline">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Quick Reactions bar (hover trigger) */}
                    <div
                      className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-surface-900 border border-slate-700 rounded-full px-2 py-0.5 shadow-md ${
                        isMe ? '-left-20' : '-right-20'
                      }`}
                    >
                      {EMOJI_LIST.slice(0, 3).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(msg._id, emoji)}
                          className="hover:scale-125 text-xs transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-slate-400 hover:text-white p-0.5 text-xs"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Reaction pills */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          onClick={() => handleReact(msg._id, r.emoji)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs cursor-pointer hover:bg-slate-700"
                        >
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-surface-950/60">
          {/* Reply alert banner */}
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
              <span>
                Replying to <span className="font-semibold text-white">{replyingTo.sender?.name}</span>:{' '}
                "{replyingTo.text?.slice(0, 40)}..."
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message ${getConvTitle(activeConv)}...`}
              className="flex-1 bg-surface-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
