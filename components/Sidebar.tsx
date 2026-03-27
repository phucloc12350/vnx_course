'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  MessageOutlined,
  SettingOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Sider } = Layout;

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  let activePage = 'co-minh';
  if (pathname.includes('/tu-dien-co-lanh')) {
    activePage = 'tu-dien';
  }

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      theme="light"
      style={{
        height: '100vh',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        className="logo"
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#1890ff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        Lớp Tiếng Anh
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activePage]}
        onClick={(e) => {
          if (e.key === 'co-minh') {
            router.push('/chat-co-minh');
          } else if (e.key === 'tu-dien') {
            router.push('/tu-dien-co-lanh');
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
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
          },
        ]}
      />
    </Sider>
  );
};

export default AppSidebar;
