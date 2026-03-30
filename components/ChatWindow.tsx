'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { Input, Button, Avatar, Typography, Modal, Select } from 'antd';
import { UserOutlined, RobotOutlined, SendOutlined, SettingOutlined } from '@ant-design/icons';
import { useAppContext } from '@/context/AppContext';

const { Title, Text } = Typography;
const { Option } = Select;

const userMarkdownComponents = {
  p: ({ node, ...props }: any) => <div style={{ marginBottom: '6px' }} {...props} />,
  strong: ({ node, ...props }: any) => (
    <strong
      style={{
        color: '#fff',
        fontWeight: 600,
        backgroundColor: 'transparent',
        padding: '1px 5px',
        borderRadius: '5px',
      }}
      {...props}
    />
  ),
};

const botMarkdownComponents = {
  p: ({ node, ...props }: any) => <div style={{ marginBottom: '6px' }} {...props} />,
  strong: ({ node, ...props }: any) => (
    <strong
      style={{
        color: '#f5222d',
        fontWeight: 600,
        backgroundColor: '#fff1f0',
        padding: '1px 5px',
        borderRadius: '5px',
      }}
      {...props}
    />
  ),
};

interface ChatWindowProps {
  initialMessages?: any[];
  onMessagesUpdate?: (messages: any[]) => void;
}

export default function ChatWindow({ initialMessages, onMessagesUpdate }: ChatWindowProps = {}) {
  const { level, setLevel, weakness, setWeakness } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatOptions: any = initialMessages?.length ? { messages: initialMessages } : {};
  const { messages, sendMessage, status, error } = useChat(chatOptions);

  // Lưu lịch sử sau khi AI trả lời xong
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const wasLoading =
      prevStatusRef.current === 'submitted' || prevStatusRef.current === 'streaming';
    const isDone = status !== 'submitted' && status !== 'streaming';
    if (wasLoading && isDone && messages.length > 0 && onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
    prevStatusRef.current = status;
  }, [status, messages, onMessagesUpdate]);

  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(
      { role: 'user', parts: [{ type: 'text', text: input }] } as any,
      { body: { level, weakness } }
    );
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          Cô Minh English
        </Title>
        <Button 
          type="default" 
          icon={<SettingOutlined />} 
          onClick={() => setIsModalOpen(true)}
          style={{ borderRadius: '8px' }}
        >
          Trình độ: {level.split(' ')[0]}
        </Button>
      </div>

      {/* Messages/Empty State area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isEmpty ? '0 16px' : '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isEmpty ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {isEmpty && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Avatar size={80} icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a', marginBottom: '16px' }} />
              <Title level={2} style={{ color: '#1890ff', margin: '0 0 8px 0' }}>Chào bạn!</Title>
              <Text style={{ fontSize: '16px', color: '#595959' }}>
                Mình là Cô Minh, hãy bắt đầu trò chuyện bằng tiếng Anh nhé.
                <br />Bạn có thể tuỳ chỉnh trình độ học ở góc phải trên cùng.
              </Text>
            </div>
          )}

          {!isEmpty && messages.map((msg, index) => {
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
                    maxWidth: '85%',
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
                        components={isUser ? userMarkdownComponents : botMarkdownComponents}
                      >
                        {p.text}
                      </ReactMarkdown>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {!isEmpty && isLoading && status === 'submitted' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '6px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: '78%',
                }}
              >
                <Avatar
                  icon={<RobotOutlined />}
                  style={{
                    backgroundColor: '#52c41a',
                    flexShrink: 0,
                    marginRight: '10px',
                  }}
                />
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '4px 18px 18px 18px',
                    backgroundColor: '#ffffff',
                    color: '#8c8c8c',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    fontStyle: 'italic',
                  }}
                >
                  Cô Minh đang suy nghĩ...
                </div>
              </div>
            </div>
          )}

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
          
          {/* Always have something to scroll to */}
          {!isEmpty && <div ref={messagesEndRef} style={{ height: 1 }} />}
        </div>
        
        {/* Render input directly under greeting when empty state */}
        {isEmpty && (
          <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: '10px' }}
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Nhập tin nhắn để bắt đầu trò chuyện..."
                disabled={isLoading}
                size="large"
                autoFocus
                style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                disabled={isLoading || !input.trim()}
                htmlType="submit"
                style={{ borderRadius: '10px', minWidth: '100px', boxShadow: '0 4px 12px rgba(24,144,255,0.3)' }}
              >
                {isLoading ? '...' : 'Gửi'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Fixed Input bar at the bottom when NOT empty */}
      {!isEmpty && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid #e8e8e8',
            padding: '14px 16px',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: '10px' }}
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Nhập tin nhắn..."
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
                {isLoading ? '...' : 'Gửi'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Level Settings Modal */}
      <Modal
        title="🎯 Thiết lập Trình độ & Phân tích Điểm yếu"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu thông tin"
        cancelText="Đóng"
        centered
      >
        <div style={{ padding: '8px 0' }}>
          <Text strong>Trình độ hiện tại</Text>
          <Select
            value={level}
            onChange={setLevel}
            style={{ width: '100%', marginTop: 8, marginBottom: 24 }}
            size="large"
          >
            <Option value="A0 (Mới bắt đầu)">A0 (Mới bắt đầu)</Option>
            <Option value="A1 (Sơ cấp)">A1 (Sơ cấp)</Option>
            <Option value="A2 (Tiền trung cấp)">A2 (Tiền trung cấp)</Option>
            <Option value="B1 (Trung cấp)">B1 (Trung cấp)</Option>
            <Option value="B2 (Trung cao cấp)">B2 (Trung cao cấp)</Option>
            <Option value="C1 (Cao cấp)">C1 (Cao cấp)</Option>
          </Select>

          <Text strong>Điểm yếu cần khắc phục</Text>
          <Input.TextArea
            value={weakness}
            onChange={(e) => setWeakness(e.target.value)}
            placeholder="Ví dụ: Lười học từ vựng, hay chia sai động từ, phát âm âm cuối yếu..."
            autoSize={{ minRows: 4, maxRows: 6 }}
            style={{ marginTop: 8, fontSize: '15px' }}
          />
        </div>
      </Modal>
    </div>
  );
}
