'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('vnx-username', values.username);
      messageApi.success('Chào mừng trở lại! 👋');
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      messageApi.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px',
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
          border: 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12, lineHeight: 1 }}>👩‍🏫</div>
          <Title level={3} style={{ margin: 0, marginBottom: 6, color: '#262626' }}>
            Lớp Tiếng Anh VNX
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Đăng nhập để vào lớp học
          </Text>
        </div>

        <Form
          onFinish={handleLogin}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="Tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Nhập tài khoản"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Nhập mật khẩu"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              borderRadius: 10,
              height: 48,
              fontSize: 16,
              fontWeight: 600,
              marginTop: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
