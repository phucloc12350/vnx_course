'use client';

import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Tag,
  Typography,
  Descriptions,
  Skeleton,
  message,
  List,
  Divider,
  Space,
} from 'antd';
import { SearchOutlined, BookOutlined, BulbOutlined } from '@ant-design/icons';
import type { WordDefinition } from '@/types/dictionary';

const { Title, Text } = Typography;

const LEVEL_COLOR: Record<string, string> = {
  'Dễ': 'success',
  'Trung bình': 'warning',
  'Khó': 'error',
};

export default function DictionaryWindow() {
  const [inputWord, setInputWord] = useState('');
  const [result, setResult] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSearch = async () => {
    const word = inputWord.trim();
    if (!word) {
      messageApi.warning('Bạn chưa nhập từ vựng kìa! Cô Lành chờ đó nha 👀');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: WordDefinition = await res.json();
      setResult(data);
    } catch (err: any) {
      const msg = err.message || 'Không rõ lỗi';
      if (msg.includes('429') || msg.includes('Quota')) {
        messageApi.error('API Key hết hạn mức rồi! Nghỉ xíu rồi tra lại nha bạn ơi 😅');
      } else {
        messageApi.error(`Cô Lành không biết từ này hoặc bị lỗi kết nối: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f0f2f5',
      }}
    >
      {contextHolder}

      {/* Header — full width */}
      <div
        style={{
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#722ed1' }}>
          📖 Từ Điển Cô Lành
        </Title>
      </div>

      {/* Content — scrollable, centered at 800px */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 16px',
          maxHeight: 'calc(100vh - 69px)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Search card */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(114, 46, 209, 0.08)',
              border: '1px solid #d3adf7',
            }}
          >
            <Space orientation="vertical" style={{ width: '100%' }} size={10}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                💡 Nhập một từ tiếng Anh bất kỳ, Cô Lành sẽ giải thích theo cách... rất riêng của Cô!
              </Text>
              <div style={{ display: 'flex', gap: 10 }}>
                <Input
                  size="large"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ví dụ: procrastinate, ephemeral, serendipity..."
                  prefix={<SearchOutlined style={{ color: '#722ed1' }} />}
                  disabled={loading}
                  style={{ borderRadius: 10, borderColor: '#d3adf7' }}
                  autoFocus
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<BookOutlined />}
                  loading={loading}
                  onClick={handleSearch}
                  disabled={!inputWord.trim()}
                  style={{
                    borderRadius: 10,
                    minWidth: 120,
                    backgroundColor: '#722ed1',
                    borderColor: '#722ed1',
                  }}
                >
                  {loading ? 'Đang tra...' : 'Tra từ'}
                </Button>
              </div>
            </Space>
          </Card>

          {/* Loading Skeleton */}
          {loading && (
            <Card style={{ borderRadius: 16 }}>
              <Skeleton active paragraph={{ rows: 7 }} />
            </Card>
          )}

          {/* Result Card */}
          {!loading && result && (
            <Card
              style={{
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(114, 46, 209, 0.12)',
                border: '1px solid #d3adf7',
              }}
            >
              {/* Word + phonetic + level */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                  {result.word}
                </Title>
                <Text style={{ fontSize: 18, color: '#8c8c8c', fontStyle: 'italic' }}>
                  {result.phonetic}
                </Text>
                <Tag
                  color={LEVEL_COLOR[result.level] ?? 'default'}
                  style={{ fontSize: 13, padding: '2px 12px', borderRadius: 20 }}
                >
                  {result.level}
                </Tag>
              </div>

              {/* Meaning + example */}
              <Descriptions
                column={1}
                bordered
                size="middle"
                style={{ marginBottom: 20 }}
                labelStyle={{ fontWeight: 600, backgroundColor: '#f9f0ff', width: 140 }}
              >
                <Descriptions.Item label="📝 Nghĩa">
                  <Text style={{ fontSize: 15 }}>{result.meaning}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="💬 Ví dụ">
                  <Text style={{ fontSize: 15, fontStyle: 'italic' }}>{result.example}</Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Grammar notes */}
              <Divider style={{ color: '#722ed1', borderColor: '#d3adf7' }}>
                <BulbOutlined /> Lưu ý Ngữ pháp
              </Divider>
              <List
                dataSource={result.grammar_notes}
                renderItem={(note, idx) => (
                  <List.Item style={{ paddingLeft: 0, paddingRight: 0, borderColor: '#f0f0f0' }}>
                    <Space align="start">
                      <Tag
                        color="purple"
                        style={{ minWidth: 28, textAlign: 'center', borderRadius: 20 }}
                      >
                        {idx + 1}
                      </Tag>
                      <Text>{note}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Empty state */}
          {!loading && !result && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 24px',
                color: '#bfbfbf',
              }}
            >
              <div style={{ fontSize: 72, marginBottom: 16 }}>📚</div>
              <Title level={4} style={{ color: '#bfbfbf' }}>
                Tra từ nào đi bạn ơi!
              </Title>
              <Text type="secondary">
                Cô Lành đang ngồi chờ để giải thích từ vựng cho bạn đây~
              </Text>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
