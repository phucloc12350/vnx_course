'use client';

import React, { useState } from 'react';
import { Layout, Menu, Select, Input, Typography, Modal } from 'antd';
import {
  MessageOutlined,
  BookOutlined,
  SettingOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Option } = Select;
const { Text } = Typography;

const AppSidebar = ({ level, setLevel, weakness, setWeakness }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        defaultSelectedKeys={['1']}
        onClick={(e) => {
          if (e.key === 'levels') {
            setIsModalOpen(true);
          }
        }}
        items={[
          {
            key: '1',
            icon: <MessageOutlined />,
            label: 'Cô Minh English',
          },
          {
            key: '2',
            icon: <BookOutlined />,
            label: 'Bài tập Ngữ pháp',
          },
          {
            key: 'levels',
            icon: <TrophyOutlined />,
            label: 'Chọn trình độ',
          },
          {
            key: '3',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
          },
        ]}
      />

      <Modal
        title="🎯 Thiết lập Trình độ & Phân tích Điểm yếu"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu thông tin"
        cancelText="Đóng"
        centered
      >
        <div style={{ padding: '8px 0' }}>
          <Text strong>Trình độ hiện tại</Text>
          <Select
            value={level}
            onChange={setLevel}
            style={{ width: '100%', marginTop: 8, marginBottom: 24 }}
            size="large"
          >
            <Option value="A0 (Mới bắt đầu)">A0 (Mới bắt đầu)</Option>
            <Option value="A1 (Sơ cấp)">A1 (Sơ cấp)</Option>
            <Option value="A2 (Tiền trung cấp)">A2 (Tiền trung cấp)</Option>
            <Option value="B1 (Trung cấp)">B1 (Trung cấp)</Option>
            <Option value="B2 (Trung cao cấp)">B2 (Trung cao cấp)</Option>
            <Option value="C1 (Cao cấp)">C1 (Cao cấp)</Option>
          </Select>

          <Text strong>Điểm yếu cần khắc phục</Text>
          <Input.TextArea
            value={weakness}
            onChange={(e) => setWeakness(e.target.value)}
            placeholder="Ví dụ: Lười học từ vựng, hay chia sai động từ, phát âm âm cuối yếu..."
            autoSize={{ minRows: 4, maxRows: 6 }}
            style={{ marginTop: 8, fontSize: '15px' }}
          />
        </div>
      </Modal>
    </Sider>
  );
};

export default AppSidebar;
