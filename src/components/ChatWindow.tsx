'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { Input, Button, Avatar, Typography } from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ChatWindowProps {
  level?: string;
  weakness?: string;
}

export default function ChatWindow({ level, weakness }: ChatWindowProps) {
  const { messages, sendMessage, status, error } = useChat();

  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(
      { role: 'user', parts: [{ type: 'text', text: input }] } as any,
      { body: { level, weakness } }
    );
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn dòng tin nhắn đến cuối cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          Cô Minh English
        </Title>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          maxHeight: 'calc(100vh - 135px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <Avatar
                    icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: isUser ? '#1890ff' : '#52c41a',
                      marginLeft: isUser ? '12px' : '0',
                      marginRight: isUser ? '0' : '12px',
                    }}
                  />
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '16px',
                      backgroundColor: isUser ? '#1890ff' : '#ffffff',
                      color: isUser ? '#fff' : '#000',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.5',
                    }}
                  >
                    {msg.parts?.filter((p: any) => p.type === 'text').map((p: any, i: number) => (
                      <ReactMarkdown 
                        key={i}
                        components={{
                          p: ({node, ...props}) => <div style={{ marginBottom: '8px', display: 'inline-block' }} {...props} />,
                          strong: ({node, ...props}) => (
                            <strong 
                              style={{ 
                                color: isUser ? '#fff' : '#f5222d', 
                                fontWeight: 600, 
                                backgroundColor: isUser ? 'transparent' : '#fff1f0',
                                padding: '2px 4px',
                                borderRadius: '4px'
                              }} 
                              {...props} 
                            />
                          )
                        }}
                      >
                        {p.text}
                      </ReactMarkdown>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {error && (
            <div style={{ textAlign: 'center', color: '#ff4d4f', padding: '12px', margin: '8px 0', border: '1px solid #ffa39e', borderRadius: '8px', backgroundColor: '#fff2f0' }}>
              <strong>⚠️ Lỗi Hệ Thống:</strong>
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                {error.message.includes('Quota exceeded') || error.message.includes('429') 
                  ? 'API Key Gemini của bạn đã hết hạn mức truy cập miễn phí. Vui lòng thử lại sau vài phút hoặc thay API Key khác trong file .env.local nhé!'
                  : ('Chi tiết lỗi: ' + error.message)}
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #e8e8e8' }}>
        <form
          onSubmit={(e) => {
            if (!input.trim()) {
              e.preventDefault();
              return;
            }
            handleSubmit(e);
          }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            disabled={isLoading}
            size="large"
            autoFocus
            style={{ borderRadius: '8px' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            size="large"
            disabled={isLoading || !input.trim()}
            htmlType="submit"
            style={{ borderRadius: '8px', minWidth: '100px' }}
          >
            {isLoading ? 'Đang soạn...' : 'Gửi'}
          </Button>
        </form>
      </div>
    </div>
  );
}
