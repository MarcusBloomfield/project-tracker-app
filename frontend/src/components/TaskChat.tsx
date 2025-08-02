import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../utils/taskManager';
import '../css/TaskChat.css';

interface TaskChatProps {
  projectId: string;
  tasks: Task[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const TaskChat: React.FC<TaskChatProps> = ({ projectId, tasks }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getTasksContext = () => {
    const taskSummary = tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      dueDate: task.dueDate,
      tags: task.tags
    }));

    return `Project: ${projectId}
Total Tasks: ${tasks.length}
Completed: ${tasks.filter(t => t.status === 'completed').length}
In Progress: ${tasks.filter(t => t.status === 'in-progress').length}
To Do: ${tasks.filter(t => t.status === 'todo').length}

Task Details:
${JSON.stringify(taskSummary, null, 2)}`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are a helpful project management assistant. You have access to the following project tasks and should help the user understand, organize, and manage their tasks. Always provide specific, actionable advice.

${getTasksContext()}

Please help the user with their questions about these tasks. Be concise but helpful.`;

      const response = await window.api.invokeEvent('chat:send-message', {
        messages: [{ role: 'user', content: inputMessage }],
        systemPrompt
      });

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorText = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="task-chat-tab">
      <div className="chat-header">
        <h2>🤖 Task Assistant</h2>
        <div className="chat-controls">
          <button onClick={clearChat} className="clear-button" title="Clear chat">
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>👋 Hi! I'm your task assistant. I can help you with:</p>
            <ul>
              <li>Analyzing your project tasks</li>
              <li>Suggesting task prioritization</li>
              <li>Identifying bottlenecks</li>
              <li>Providing productivity tips</li>
            </ul>
            <p>Ask me anything about your {tasks.length} tasks!</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your tasks..."
          rows={3}
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputMessage.trim() || isLoading}
          className="send-button"
        >
          📤 Send
        </button>
      </div>
    </div>
  );
};

export default TaskChat;