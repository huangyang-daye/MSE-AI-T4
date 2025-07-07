import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Steps, message, Select, Checkbox, DatePicker } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Register = () => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const next = () => {
    form.validateFields().then(() => {
      setCurrent(current + 1);
    }).catch(errorInfo => {
      console.log('验证失败:', errorInfo);
    });
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onFinish = (values) => {
    setLoading(true);
    // 模拟注册请求
    setTimeout(() => {
      setLoading(false);
      message.success('注册成功！');
      navigate('/login');
    }, 1500);
  };

  const steps = [
    {
      title: '账号信息',
      content: (
        <>
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

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 8, message: '密码长度不能少于8个字符!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="设置密码" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
          </Form.Item>
        </>
      ),
    },
    {
      title: '个人信息',
      content: (
        <>
          <Form.Item
            name="name"
            rules={[{ required: false, message: '请输入姓名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="姓名（选填）" size="large" />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[{ required: true, message: '请选择性别!' }]}
          >
            <Select placeholder="性别" size="large">
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="birthdate"
            rules={[{ required: true, message: '请选择出生日期!' }]}
          >
            <DatePicker placeholder="出生日期" size="large" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: false, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" size="large" />
          </Form.Item>
        </>
      ),
    },
    {
      title: '隐私协议',
      content: (
        <>
          <div style={{ height: '200px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '10px', marginBottom: '20px' }}>
            <Paragraph>
              <Text strong>隐私政策</Text>
            </Paragraph>
            <Paragraph>
              本应用重视用户的隐私保护，我们承诺会妥善保管您的个人信息。本隐私政策旨在向您说明我们如何收集、使用、存储和共享您的个人信息，以及您享有的相关权利。
            </Paragraph>
            <Paragraph>
              <Text strong>1. 信息收集</Text>
            </Paragraph>
            <Paragraph>
              我们收集的信息包括：您提供的个人信息（如姓名、性别、出生日期、联系方式）；健康相关信息（如病史、症状描述、用药情况）；设备信息和日志信息。
            </Paragraph>
            <Paragraph>
              <Text strong>2. 信息使用</Text>
            </Paragraph>
            <Paragraph>
              我们使用收集的信息用于：提供医疗问诊服务；改进我们的服务；保障您的账号安全。
            </Paragraph>
            <Paragraph>
              <Text strong>3. 信息保护</Text>
            </Paragraph>
            <Paragraph>
              我们采取严格的数据安全措施保护您的个人信息，包括数据加密、访问控制等技术手段。
            </Paragraph>
          </div>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意隐私政策')),
              },
            ]}
          >
            <Checkbox>我已阅读并同意<a href="#">隐私政策</a>和<a href="#">用户协议</a></Checkbox>
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          注册账号
        </Title>

        <Steps current={current} style={{ marginBottom: '30px' }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <div>{steps[current].content}</div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            {current > 0 && (
              <Button onClick={prev}>
                上一步
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next} style={{ marginLeft: 'auto' }}>
                下一步
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" htmlType="submit" loading={loading} style={{ marginLeft: 'auto' }}>
                注册
              </Button>
            )}
          </div>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Paragraph>
            已有账号？ <Link to="/login">立即登录</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default Register;
