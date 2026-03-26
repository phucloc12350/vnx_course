'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import AppSidebar, { type PageKey } from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import DictionaryWindow from '@/components/DictionaryWindow';

const { Content } = Layout;

export default function Home() {
  const [level, setLevel] = useState('A1 (Sơ cấp)');
  const [weakness, setWeakness] = useState('');
  const [activePage, setActivePage] = useState<PageKey>('co-minh');

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <AppSidebar
        level={level}
        setLevel={setLevel}
        weakness={weakness}
        setWeakness={setWeakness}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <Layout>
        <Content style={{ margin: 0, minHeight: 280, flex: 1 }}>
          {activePage === 'co-minh' && (
            <ChatWindow level={level} weakness={weakness} />
          )}
          {activePage === 'tu-dien' && (
            <DictionaryWindow />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
