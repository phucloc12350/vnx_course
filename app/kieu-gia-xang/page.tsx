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
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Transport cố định — không tạo lại mỗi render
const transport = new DefaultChatTransport({ api: '/api/kieu-gia-xang' });

// ─── Block hiển thị INPUT hoặc OUTPUT ────────────────────────────────────────
function IOBlock({
  label,
  accentColor,
  children,
}: {
  label: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: '1px solid #f0f0f0' }}>
      <div
        style={{
          padding: '3px 12px',
          background: '#f5f5f5',
          borderLeft: `3px solid ${accentColor}`,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#8c8c8c', letterSpacing: 1 }}>
          {label}
        </Text>
      </div>
      {children}
    </div>
  );
}

// ─── Bảng giá từ data tool output ────────────────────────────────────────────
function PriceTable({ output }: { output: any }) {
  if (!output?.prices || typeof output.prices !== 'object') return null;
  const entries = Object.entries(output.prices as Record<string, string>);
  if (entries.length === 0) return null;

  return (
    <div style={{ background: '#fff' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg,#fa8c16,#ffa940)' }}>
              <th style={{ padding: '8px 14px', textAlign: 'left', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Loại nhiên liệu
              </th>
              <th style={{ padding: '8px 14px', textAlign: 'right', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Giá (đ/lít)
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, price], i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? '#fff' : '#fffbe6',
                  borderBottom: '1px solid #ffe7ba',
                }}
              >
                <td style={{ padding: '7px 14px', color: '#262626' }}>{name}</td>
                <td style={{ padding: '7px 14px', textAlign: 'right', fontWeight: 600, color: '#d46b08', fontFamily: 'monospace' }}>
                  {String(price).replace(' đ/lít', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── OUTPUT: raw JSON với URL tự động thành link ─────────────────────────────
function ToolOutputContent({ text }: { text: string }) {
  return (
    <pre style={{
      margin: 0, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace',
      background: '#fafafa', color: '#262626', whiteSpace: 'pre-wrap',
      wordBreak: 'break-all', maxHeight: 300, overflowY: 'auto',
    }}>
      {text}
    </pre>
  );
}

// ─── Render tool invocation (AI SDK v6) ──────────────────────────────────────
// part.type = 'tool-{name}', fields: state, input, output (NOT toolInvocation/args/result)
function ToolBadge({ part }: { part: any }) {
  const [open, setOpen] = useState(true);

  // 'tool-gia_xang' → 'gia_xang'
  const toolName: string = part?.type === 'dynamic-tool'
    ? (part?.toolName ?? 'tool')
    : (part?.type?.startsWith('tool-') ? part.type.slice(5) : (part?.toolName ?? 'tool'));

  const state = part?.state ?? '';

  const config: Record<string, { label: string; color: string }> = {
    gia_xang:            { label: 'gia_xang',            color: '#fa8c16' },
    send_discord_report: { label: 'send_discord_report',  color: '#722ed1' },
  };
  const cfg = config[toolName] ?? { label: toolName, color: '#1890ff' };

  // AI SDK v6 states
  const isLoading = state === 'input-streaming' || state === 'input-available';
  const isDone    = state === 'output-available';
  const hasError  = state === 'output-error';

  const outputText = part?.output != null
    ? (typeof part.output === 'string' ? part.output : JSON.stringify(part.output, null, 2))
    : (part?.errorText ?? '');

  const bodyVisible = isLoading || open;

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${hasError ? '#ffa39e' : isLoading ? '#ffd591' : '#d9f7be'}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      fontSize: 13,
      maxWidth: 580,
    }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div
        onClick={() => { if (isDone || hasError) setOpen((v) => !v); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          cursor: (isDone || hasError) ? 'pointer' : 'default',
          background: isLoading ? '#fffbe6' : hasError ? '#fff2f0' : '#f6ffed',
          userSelect: 'none',
        }}
      >
        {isLoading ? (
          <Spin indicator={<LoadingOutlined style={{ color: cfg.color, fontSize: 12 }} />} />
        ) : hasError ? (
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 13 }} />
        ) : (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13 }} />
        )}
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#595959', flex: 1 }}>
          {cfg.label}
        </span>
        {isLoading ? (
          <span style={{ color: cfg.color, fontSize: 11 }}>đang gọi…</span>
        ) : hasError ? (
          <span style={{ color: '#ff4d4f', fontSize: 11 }}>lỗi</span>
        ) : (
          <span style={{ color: '#8c8c8c', fontSize: 11 }}>
            {open ? <UpOutlined /> : <DownOutlined />}
          </span>
        )}
      </div>

      {/* ── OUTPUT khi tool chạy xong ─────────────────── */}
      {bodyVisible && (isDone || hasError) && (
        <IOBlock label="OUTPUT" accentColor={hasError ? '#ff4d4f' : '#52c41a'}>
          <ToolOutputContent text={outputText} />
        </IOBlock>
      )}

      {/* ── OUTPUT skeleton khi đang chờ ──────────────── */}
      {isLoading && (
        <IOBlock label="OUTPUT" accentColor="#d9d9d9">
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Spin indicator={<LoadingOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />} />
            <Text type="secondary" style={{ fontSize: 12 }}>đang chờ kết quả…</Text>
          </div>
        </IOBlock>
      )}
    </div>
  );
}

// ─── Message bubbles ──────────────────────────────────────────────────────────
const mdComponents = {
  p: ({ node: _n, ...props }: any) => <div style={{ marginBottom: 6 }} {...props} />,
  strong: ({ node: _n, ...props }: any) => (
    <strong style={{ color: '#d46b08', fontWeight: 700 }} {...props} />
  ),
  em: ({ node: _n, ...props }: any) => (
    <em style={{ color: '#8c8c8c', fontSize: 12 }} {...props} />
  ),
  a: ({ node: _n, ...props }: any) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#1890ff', textDecoration: 'underline', fontWeight: 500 }}
      {...props}
    />
  ),
  table: ({ node: _n, ...props }: any) => (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          fontSize: 14,
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
        }}
        {...props}
      />
    </div>
  ),
  thead: ({ node: _n, ...props }: any) => (
    <thead style={{ background: 'linear-gradient(90deg,#fa8c16,#ffa940)', color: '#fff' }} {...props} />
  ),
  th: ({ node: _n, ...props }: any) => (
    <th
      style={{
        padding: '8px 14px',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: 0.3,
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
      {...props}
    />
  ),
  tbody: ({ node: _n, ...props }: any) => <tbody {...props} />,
  tr: ({ node: _n, ...props }: any) => (
    <tr
      style={{ borderBottom: '1px solid #ffe7ba', transition: 'background 0.15s' }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff7e6')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      {...props}
    />
  ),
  td: ({ node: _n, ...props }: any) => (
    <td
      style={{
        padding: '8px 14px',
        fontSize: 14,
        color: '#262626',
        verticalAlign: 'middle',
      }}
      {...props}
    />
  ),
};

const userMdComponents = {
  p: ({ node: _n, ...props }: any) => <div style={{ marginBottom: 4 }} {...props} />,
};

// Khi có pricesOutput → override ul để render PriceTable thay danh sách giá
function createMdComponents(pricesOutput?: any) {
  if (!pricesOutput?.prices) return mdComponents;
  return {
    ...mdComponents,
    ul: () => <PriceTable output={pricesOutput} />,
  };
}

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
                      {/* Render parts theo đúng thứ tự: tool → text → tool → text ... */}
                      {msg.parts?.map((p: any, i: number) => {
                        // AI SDK v6: type = 'tool-{name}' hoặc 'dynamic-tool'
                        if (!isUser && (p.type?.startsWith('tool-') || p.type === 'dynamic-tool')) {
                          return <ToolBadge key={i} part={p} />;
                        }
                        if (p.type === 'text' && p.text?.trim()) {
                          // Tìm part gia_xang gần nhất trước text này để lấy data bảng giá
                          const partsArr: any[] = msg.parts ?? [];
                          const prevGiaXang = partsArr
                            .slice(0, i)
                            .reverse()
                            .find((pp: any) =>
                              pp.type === 'tool-gia_xang' &&
                              pp.state === 'output-available' &&
                              pp.output?.prices
                            );
                          const aiMdComponents = isUser
                            ? userMdComponents
                            : createMdComponents((prevGiaXang as any)?.output);
                          return (
                            <div
                              key={i}
                              style={{
                                padding: '10px 16px',
                                borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                backgroundColor: isUser ? '#1890ff' : '#ffffff',
                                color: isUser ? '#fff' : '#262626',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                lineHeight: 1.65,
                                border: isUser ? 'none' : '1px solid #ffe7ba',
                                overflow: 'hidden',
                              }}
                            >
                              <ReactMarkdown components={aiMdComponents}>
                                {p.text}
                              </ReactMarkdown>
                            </div>
                          );
                        }
                        return null;
                      })}
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
