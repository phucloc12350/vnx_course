'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  MessageOutlined,
  ReadOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Sider } = Layout;

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  let activePage = 'co-minh';
  if (pathname.includes('/tu-dien-co-lanh')) activePage = 'tu-dien';
  if (pathname.includes('/kieu-gia-xang')) activePage = 'gia-xang';

  const handleLogout = async () => {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      theme="light"
      style={{
        height: '100vh',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#1890ff',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
        }}
      >
        Lớp Tiếng Anh
      </div>

      {/* Menu navigation */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={[activePage]}
          style={{ borderRight: 0 }}
          onClick={(e) => {
            if (e.key === 'co-minh') {
              router.push('/chat-co-minh');
            } else if (e.key === 'tu-dien') {
              router.push('/tu-dien-co-lanh');
            } else if (e.key === 'gia-xang') {
              router.push('/kieu-gia-xang');
            }
          }}
          items={[
            {
              key: 'co-minh',
              icon: <MessageOutlined />,
              label: 'Cô Minh English',
            },
            {
              key: 'tu-dien',
              icon: <ReadOutlined />,
              label: 'Từ Điển Cô Lành',
            },
            {
              key: 'gia-xang',
              icon: <ThunderboltOutlined style={{ color: '#fa8c16' }} />,
              label: '⛽ Kiều Giá Xăng',
            },
          ]}
        />
      </div>

      {/* Logout button — ghim ở đáy */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          flexShrink: 0,
        }}
      >
        <Button
          icon={<LogoutOutlined />}
          loading={logoutLoading}
          onClick={handleLogout}
          block
          danger
          style={{ borderRadius: 10 }}
        >
          Đăng xuất
        </Button>
      </div>
    </Sider>
  );
};

export default AppSidebar;
