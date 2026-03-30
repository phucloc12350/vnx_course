'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  MessageOutlined,
  ReadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

const AppSidebar = ({ collapsed }: AppSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  let activePage = 'co-minh';
  if (pathname.includes('/tu-dien-co-lanh')) activePage = 'tu-dien';
  if (pathname.includes('/kieu-gia-xang')) activePage = 'gia-xang';

  return (
    <Sider
      collapsed={collapsed}
      collapsedWidth={64}
      width={210}
      theme="light"
      style={{
        height: '100vh',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: collapsed ? '1.4rem' : '1.1rem',
          fontWeight: 'bold',
          color: '#1890ff',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: '0 8px',
          transition: 'font-size 0.2s',
        }}
      >
        {collapsed ? '📚' : 'Lớp Tiếng Anh'}
      </div>

      {/* Menu navigation */}
      <Menu
        mode="inline"
        selectedKeys={[activePage]}
        inlineCollapsed={collapsed}
        style={{ borderRight: 0, flex: 1 }}
        onClick={(e) => {
          if (e.key === 'co-minh') router.push('/chat-co-minh');
          else if (e.key === 'tu-dien') router.push('/tu-dien-co-lanh');
          else if (e.key === 'gia-xang') router.push('/kieu-gia-xang');
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
            label: 'Kiều Giá Xăng',
          },
        ]}
      />
    </Sider>
  );
};

export default AppSidebar;
