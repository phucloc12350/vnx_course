'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import AppSidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

const { Content } = Layout;

export default function Home() {
  const [level, setLevel] = useState('A1 (Sơ cấp)');
  const [weakness, setWeakness] = useState('');

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <AppSidebar 
        level={level} 
        setLevel={setLevel} 
        weakness={weakness} 
        setWeakness={setWeakness} 
      />
      <Layout>
        <Content style={{ margin: 0, minHeight: 280, flex: 1 }}>
          <ChatWindow level={level} weakness={weakness} />
        </Content>
      </Layout>
    </Layout>
  );
}
