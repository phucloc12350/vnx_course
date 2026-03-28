'use client';

import React from 'react';
import { Layout } from 'antd';
import AppSidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

const { Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Trang login không cần sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', width: '100%' }}>
      <AppSidebar />
      <Layout>
        <Content style={{ margin: 0, minHeight: 280, flex: 1, backgroundColor: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
