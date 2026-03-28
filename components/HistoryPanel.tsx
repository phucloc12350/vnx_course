'use client';

import React from 'react';
import { Button, Typography, Tooltip, Empty, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, MessageOutlined, HistoryOutlined } from '@ant-design/icons';
import type { Conversation } from '@/types/chat';

const { Text } = Typography;

interface HistoryPanelProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN');
}

export default function HistoryPanel({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: HistoryPanelProps) {
  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        borderLeft: '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <HistoryOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: 14 }}>
            Lịch sử trò chuyện
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNew}
          block
          style={{ borderRadius: 10 }}
        >
          Chat mới
        </Button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {conversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Chưa có cuộc trò chuyện nào
              </Text>
            }
            style={{ marginTop: 40 }}
          />
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                style={{
                  padding: '10px 10px 10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isActive ? '#e6f4ff' : 'transparent',
                  border: `1px solid ${isActive ? '#91caff' : 'transparent'}`,
                  marginBottom: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 6,
                  transition: 'background 0.15s, border 0.15s',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginBottom: 3,
                    }}
                  >
                    <MessageOutlined
                      style={{ color: isActive ? '#1890ff' : '#8c8c8c', fontSize: 11, flexShrink: 0 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#1890ff' : '#262626',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {conv.title}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Text style={{ fontSize: 11, color: '#bfbfbf' }}>
                      {formatDate(conv.updatedAt)}
                    </Text>
                    {conv.messages.length > 0 && (
                      <Text style={{ fontSize: 11, color: '#bfbfbf' }}>
                        · {conv.messages.length} tin nhắn
                      </Text>
                    )}
                  </div>
                </div>

                <Popconfirm
                  title="Xóa cuộc trò chuyện?"
                  description="Hành động này không thể hoàn tác."
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    onDelete(conv.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Xóa">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#ff4d4f',
                        flexShrink: 0,
                        opacity: 0.5,
                        borderRadius: 6,
                      }}
                    />
                  </Tooltip>
                </Popconfirm>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Text type="secondary" style={{ fontSize: 11 }}>
          💾 Lưu trên trình duyệt này
        </Text>
      </div>
    </div>
  );
}
