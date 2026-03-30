'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import AppSidebar from '@/components/Sidebar';
import AppHeader from '@/components/AppHeader';
import { usePathname } from 'next/navigation';

const { Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
      <AppSidebar collapsed={collapsed} />
      <Layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <Content
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: 16,
            backgroundColor: '#f0f2f5',
          }}
        >
          <div
            style={{
              height: '100%',
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
