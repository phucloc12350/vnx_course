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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f0f2f5',
      }}
    >
      {/* Header — full width */}
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

      {/* Messages area — scrollable, content centered at 800px */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 16px',
          maxHeight: 'calc(100vh - 133px)',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  padding: '6px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '78%',
                  }}
                >
                  <Avatar
                    icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: isUser ? '#1890ff' : '#52c41a',
                      flexShrink: 0,
                      marginLeft: isUser ? '10px' : '0',
                      marginRight: isUser ? '0' : '10px',
                    }}
                  />
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      backgroundColor: isUser ? '#1890ff' : '#ffffff',
                      color: isUser ? '#fff' : '#000',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      lineHeight: '1.6',
                    }}
                  >
                    {msg.parts?.filter((p: any) => p.type === 'text').map((p: any, i: number) => (
                      <ReactMarkdown
                        key={i}
                        components={{
                          p: ({ node, ...props }) => (
                            <div style={{ marginBottom: '6px' }} {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              style={{
                                color: isUser ? '#fff' : '#f5222d',
                                fontWeight: 600,
                                backgroundColor: isUser ? 'transparent' : '#fff1f0',
                                padding: '1px 5px',
                                borderRadius: '5px',
                              }}
                              {...props}
                            />
                          ),
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
            <div
              style={{
                textAlign: 'center',
                color: '#ff4d4f',
                padding: '14px 18px',
                margin: '8px 0',
                border: '1px solid #ffa39e',
                borderRadius: '12px',
                backgroundColor: '#fff2f0',
              }}
            >
              <strong>⚠️ Lỗi Hệ Thống:</strong>
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                {error.message.includes('Quota exceeded') || error.message.includes('429')
                  ? 'API Key Gemini của bạn đã hết hạn mức truy cập miễn phí. Vui lòng thử lại sau vài phút hoặc thay API Key khác trong file .env.local nhé!'
                  : 'Chi tiết lỗi: ' + error.message}
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — full width background, content centered at 800px */}
      <div
        style={{
          background: '#fff',
          borderTop: '1px solid #e8e8e8',
          padding: '14px 16px',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <form
            onSubmit={(e) => {
              if (!input.trim()) {
                e.preventDefault();
                return;
              }
              handleSubmit(e);
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              disabled={isLoading}
              size="large"
              autoFocus
              style={{ borderRadius: '10px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="large"
              disabled={isLoading || !input.trim()}
              htmlType="submit"
              style={{ borderRadius: '10px', minWidth: '100px' }}
            >
              {isLoading ? 'Đang soạn...' : 'Gửi'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
