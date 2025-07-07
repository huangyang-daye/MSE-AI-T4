import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    // 模拟登录请求
    setTimeout(() => {
      setLoading(false);
      message.success('登录成功！');
      navigate('/health-profile');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          登录
        </Title>
        
        <Tabs defaultActiveKey="phone">
          <TabPane tab="手机号登录" key="phone">
            <Form
              name="login_phone"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号!' },
                  { pattern: /^1\d{10}$/, message: '请输入有效的手机号!' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="手机号" size="large" />
              </Form.Item>

              <Form.Item
                name="verificationCode"
                rules={[{ required: true, message: '请输入验证码!' }]}
              >
                <div style={{ display: 'flex' }}>
                  <Input placeholder="验证码" size="large" style={{ flex: 1 }} />
                  <Button type="primary" style={{ marginLeft: '10px' }}>
                    获取验证码
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="账号密码登录" key="account">
            <Form
              name="login_account"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名/邮箱!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名/邮箱" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Paragraph>
            还没有账号？ <Link to="/register">立即注册</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default Login;
