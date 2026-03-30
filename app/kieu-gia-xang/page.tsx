'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Input, Button, Avatar, Typography, Tag, Spin } from 'antd';
import {
  UserOutlined,
  SendOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Transport cố định — không tạo lại mỗi render
const transport = new DefaultChatTransport({ api: '/api/kieu-gia-xang' });

// ─── Render tool invocation ───────────────────────────────────────────────────
function ToolBadge({ toolInvocation }: { toolInvocation: any }) {
  const { toolName, state } = toolInvocation;

  const config: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    get_fuel_prices: {
      label: 'Kiểm tra giá xăng PVOIL',
      icon: '⛽',
      color: '#fa8c16',
    },
    send_discord_report: {
      label: 'Gửi báo cáo Discord',
      icon: '📢',
      color: '#722ed1',
    },
  };

  const cfg = config[toolName] ?? { label: toolName, icon: '🔧', color: '#1890ff' };

  if (state === 'call' || state === 'partial-call') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff7e6',
          border: `1px solid ${cfg.color}40`,
          borderRadius: 10,
          padding: '6px 12px',
          marginBottom: 6,
          fontSize: 13,
        }}
      >
        <Spin indicator={<LoadingOutlined style={{ color: cfg.color, fontSize: 14 }} />} />
        <span style={{ color: cfg.color }}>
          {cfg.icon} Đang {cfg.label.toLowerCase()}...
        </span>
      </div>
    );
  }

  const hasError = toolInvocation.result?.error;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: hasError ? '#fff2f0' : '#f6ffed',
        border: `1px solid ${hasError ? '#ffa39e' : '#b7eb8f'}`,
        borderRadius: 10,
        padding: '6px 12px',
        marginBottom: 6,
        fontSize: 13,
      }}
    >
      {hasError ? (
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      ) : (
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      )}
      <span style={{ color: hasError ? '#ff4d4f' : '#389e0d' }}>
        {cfg.icon} {hasError ? `Lỗi: ${toolInvocation.result.error}` : `${cfg.label} thành công`}
      </span>
    </div>
  );
}

// ─── Message bubbles ──────────────────────────────────────────────────────────
const mdComponents = {
  p: ({ node: _n, ...props }: any) => <div style={{ marginBottom: 4 }} {...props} />,
  strong: ({ node: _n, ...props }: any) => (
    <strong style={{ color: '#d46b08', fontWeight: 700 }} {...props} />
  ),
  table: ({ node: _n, ...props }: any) => (
    <table
      style={{
        borderCollapse: 'collapse',
        marginTop: 8,
        fontSize: 13,
        width: '100%',
      }}
      {...props}
    />
  ),
  th: ({ node: _n, ...props }: any) => (
    <th
      style={{
        border: '1px solid #ffd591',
        padding: '4px 10px',
        background: '#fff7e6',
        textAlign: 'left',
      }}
      {...props}
    />
  ),
  td: ({ node: _n, ...props }: any) => (
    <td
      style={{ border: '1px solid #ffe7ba', padding: '4px 10px' }}
      {...props}
    />
  ),
};

const userMdComponents = {
  p: ({ node: _n, ...props }: any) => <div style={{ marginBottom: 4 }} {...props} />,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function KieuGiaXangPage() {
  const { messages, sendMessage, status, error } = useChat({ transport });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'submitted' || status === 'streaming';
  const isEmpty = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ parts: [{ type: 'text', text }] } as any);
    setInput('');
  };

  const quickButtons = [
    'Xăng hôm nay bao nhiêu?',
    'Giá dầu diesel mới nhất?',
    'Cập nhật giá xăng mới nhất đi!',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fffbe6' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          background: 'linear-gradient(90deg, #fa8c16 0%, #ffa940 100%)',
          borderBottom: '1px solid #ffd591',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>⛽</span>
          <div>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              Chị Kiều Giá Xăng
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              Nguồn: PVOIL • Báo cáo qua Discord
            </Text>
          </div>
        </div>
      </div>

      {/* Messages */}
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
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Empty state */}
          {isEmpty && (
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>⛽</div>
              <Title level={2} style={{ color: '#fa8c16', margin: '0 0 8px' }}>
                Chị Kiều xin chào!
              </Title>
              <Text style={{ fontSize: 15, color: '#595959' }}>
                Hỏi chị về giá xăng hôm nay nhé.
                <br />
                Chị sẽ tự đi lấy dữ liệu từ PVOIL và báo cáo liền!
              </Text>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                {quickButtons.map((q) => (
                  <Button
                    key={q}
                    onClick={() => {
                      sendMessage({ parts: [{ type: 'text', text: q }] } as any);
                    }}
                    style={{
                      borderRadius: 20,
                      borderColor: '#fa8c16',
                      color: '#fa8c16',
                      background: '#fff7e6',
                    }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {!isEmpty &&
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    padding: '4px 0',
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
                      icon={isUser ? <UserOutlined /> : undefined}
                      style={{
                        backgroundColor: isUser ? '#1890ff' : '#fa8c16',
                        flexShrink: 0,
                        marginLeft: isUser ? 10 : 0,
                        marginRight: isUser ? 0 : 10,
                        fontSize: isUser ? undefined : 18,
                      }}
                    >
                      {!isUser && '⛽'}
                    </Avatar>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {/* Tool invocation badges */}
                      {!isUser &&
                        msg.parts
                          ?.filter((p: any) => p.type === 'tool-invocation')
                          .map((p: any, i: number) => (
                            <ToolBadge key={i} toolInvocation={p.toolInvocation} />
                          ))}

                      {/* Text content */}
                      {msg.parts?.some((p: any) => p.type === 'text' && p.text?.trim()) && (
                        <div
                          style={{
                            padding: '10px 16px',
                            borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                            backgroundColor: isUser ? '#1890ff' : '#ffffff',
                            color: isUser ? '#fff' : '#262626',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                            lineHeight: 1.65,
                            border: isUser ? 'none' : '1px solid #ffe7ba',
                          }}
                        >
                          {msg.parts
                            ?.filter((p: any) => p.type === 'text' && p.text?.trim())
                            .map((p: any, i: number) => (
                              <ReactMarkdown
                                key={i}
                                components={isUser ? userMdComponents : mdComponents}
                              >
                                {p.text}
                              </ReactMarkdown>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Loading indicator */}
          {!isEmpty && isLoading && status === 'submitted' && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar style={{ backgroundColor: '#fa8c16', fontSize: 18 }}>⛽</Avatar>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '4px 18px 18px 18px',
                    background: '#fff',
                    border: '1px solid #ffe7ba',
                    color: '#8c8c8c',
                    fontStyle: 'italic',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  }}
                >
                  <Spin size="small" style={{ marginRight: 8 }} />
                  Chị Kiều đang tra giá...
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                textAlign: 'center',
                color: '#ff4d4f',
                padding: '12px 16px',
                border: '1px solid #ffa39e',
                borderRadius: 12,
                backgroundColor: '#fff2f0',
              }}
            >
              <strong>⚠️ Lỗi:</strong> {error.message}
            </div>
          )}

          {!isEmpty && <div ref={messagesEndRef} style={{ height: 1 }} />}
        </div>

        {/* Quick buttons + input khi empty state */}
        {isEmpty && (
          <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi chị về giá xăng hôm nay..."
                disabled={isLoading}
                size="large"
                autoFocus
                style={{ borderRadius: 10, borderColor: '#ffa940' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                disabled={isLoading || !input.trim()}
                htmlType="submit"
                style={{
                  borderRadius: 10,
                  minWidth: 100,
                  background: '#fa8c16',
                  borderColor: '#fa8c16',
                }}
              >
                Gửi
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Fixed input bar */}
      {!isEmpty && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid #ffe7ba',
            padding: '14px 16px',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                size="large"
                autoFocus
                style={{ borderRadius: 10, borderColor: '#ffa940' }}
                onPressEnter={() => handleSubmit()}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                disabled={isLoading || !input.trim()}
                onClick={() => handleSubmit()}
                style={{
                  borderRadius: 10,
                  minWidth: 100,
                  background: '#fa8c16',
                  borderColor: '#fa8c16',
                }}
              >
                {isLoading ? '...' : 'Gửi'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
