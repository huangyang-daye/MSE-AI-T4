import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  const location = useLocation();
  
  // 不在欢迎页、登录页和注册页显示导航栏
  const hideNavigation = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      {!hideNavigation && (
        <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={[
              {
                key: '/health-profile',
                label: <Link to="/health-profile">健康档案</Link>,
              },
              {
                key: '/consultation',
                label: <Link to="/consultation">开始问诊</Link>,
              },
              {
                key: '/health-records',
                label: <Link to="/health-records">健康记录</Link>,
              },
            ]}
          />
        </Header>
      )}
      <Content style={{ padding: '0 50px', marginTop: 16 }}>
        <div className="site-layout-content">
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        医疗问诊App ©{new Date().getFullYear()} 基于大模型的医疗问诊应用
      </Footer>
    </Layout>
  );
}

export default App;
