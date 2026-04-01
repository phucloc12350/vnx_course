'use client';

import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Avatar } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppHeader({ collapsed, onToggle }: AppHeaderProps) {
  const router = useRouter();
  const [username, setUsername] = useState('Admin');
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vnx-username');
    if (stored) setUsername(stored);
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('vnx-username');
    router.push('/login');
  };

  return (
    <div
      style={{
        background: '#fff',
        padding: '0 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        flexShrink: 0,
      }}
    >
      {/* Toggle sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: 16, width: 40, height: 40, borderRadius: 8 }}
      />

      {/* User info + logout */}
      <Space size={8} align="center">
        <Avatar
          icon={<UserOutlined />}
          size={32}
          style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1 }}>
            Xin chào,
          </Text>
          <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1, marginTop: 2 }}>
            {username}
          </Text>
        </div>
        <div style={{ width: 1, height: 20, background: '#e8e8e8', margin: '0 4px' }} />
        <Button
          icon={<LogoutOutlined />}
          danger
          loading={logoutLoading}
          onClick={handleLogout}
          size="small"
          style={{ borderRadius: 8 }}
        >
          Đăng xuất
        </Button>
      </Space>
    </div>
  );
}
