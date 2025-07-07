import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Tabs, Select, DatePicker, Radio, Checkbox, Row, Col, Divider } from 'antd';
import { UserOutlined, MedicineBoxOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const HealthProfile = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const onFinish = (values) => {
    console.log('健康档案信息:', values);
    // 保存健康档案信息
    navigate('/consultation');
  };

  return (
    <div className="health-profile-container">
      <Title level={2}>健康档案</Title>
      <Paragraph>
        完善您的健康档案信息，帮助我们提供更准确的问诊服务。带 * 的为必填项。
      </Paragraph>

      <Form
        form={form}
        name="healthProfile"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          height: '',
          weight: '',
          bloodType: '',
          allergies: [],
          chronicDiseases: [],
          familyHistory: [],
          smokingStatus: 'never',
          drinkingStatus: 'never',
          exerciseFrequency: 'rarely'
        }}
      >
        <Card className="profile-section" title="基本信息">
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="height"
                label="身高 (cm)"
                rules={[{ pattern: /^[0-9]*$/, message: '请输入有效的身高' }]}
              >
                <Input placeholder="请输入身高" suffix="cm" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="weight"
                label="体重 (kg)"
                rules={[{ pattern: /^[0-9]*$/, message: '请输入有效的体重' }]}
              >
                <Input placeholder="请输入体重" suffix="kg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="bloodType" label="血型">
            <Select placeholder="请选择血型">
              <Option value="A">A型</Option>
              <Option value="B">B型</Option>
              <Option value="AB">AB型</Option>
              <Option value="O">O型</Option>
              <Option value="unknown">不确定</Option>
            </Select>
          </Form.Item>
        </Card>

        <Card className="profile-section" title="病史信息">
          <Form.Item name="allergies" label="过敏史">
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="drug">药物过敏</Checkbox></Col>
                <Col span={8}><Checkbox value="food">食物过敏</Checkbox></Col>
                <Col span={8}><Checkbox value="pollen">花粉过敏</Checkbox></Col>
                <Col span={8}><Checkbox value="dust">粉尘过敏</Checkbox></Col>
                <Col span={8}><Checkbox value="animal">动物毛发过敏</Checkbox></Col>
                <Col span={8}><Checkbox value="other">其他过敏</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="allergiesDetail" label="过敏详情">
            <TextArea placeholder="请详细描述您的过敏情况，如过敏原、症状等" rows={3} />
          </Form.Item>

          <Form.Item name="chronicDiseases" label="慢性病史">
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="hypertension">高血压</Checkbox></Col>
                <Col span={8}><Checkbox value="diabetes">糖尿病</Checkbox></Col>
                <Col span={8}><Checkbox value="heartDisease">心脏病</Checkbox></Col>
                <Col span={8}><Checkbox value="asthma">哮喘</Checkbox></Col>
                <Col span={8}><Checkbox value="arthritis">关节炎</Checkbox></Col>
                <Col span={8}><Checkbox value="other">其他</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="chronicDiseasesDetail" label="慢性病详情">
            <TextArea placeholder="请详细描述您的慢性病情况，如确诊时间、治疗方法等" rows={3} />
          </Form.Item>

          <Form.Item name="familyHistory" label="家族病史">
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="hypertension">高血压</Checkbox></Col>
                <Col span={8}><Checkbox value="diabetes">糖尿病</Checkbox></Col>
                <Col span={8}><Checkbox value="heartDisease">心脏病</Checkbox></Col>
                <Col span={8}><Checkbox value="cancer">癌症</Checkbox></Col>
                <Col span={8}><Checkbox value="stroke">中风</Checkbox></Col>
                <Col span={8}><Checkbox value="other">其他</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="currentMedications" label="当前用药情况">
            <TextArea placeholder="请列出您目前正在服用的药物，包括处方药和非处方药" rows={3} />
          </Form.Item>
        </Card>

        <Card className="profile-section" title="生活习惯">
          <Form.Item name="smokingStatus" label="吸烟情况">
            <Radio.Group>
              <Radio value="never">从不吸烟</Radio>
              <Radio value="former">已戒烟</Radio>
              <Radio value="occasional">偶尔吸烟</Radio>
              <Radio value="regular">经常吸烟</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="drinkingStatus" label="饮酒情况">
            <Radio.Group>
              <Radio value="never">从不饮酒</Radio>
              <Radio value="occasional">偶尔饮酒</Radio>
              <Radio value="regular">经常饮酒</Radio>
              <Radio value="heavy">大量饮酒</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="exerciseFrequency" label="运动频率">
            <Radio.Group>
              <Radio value="rarely">几乎不运动</Radio>
              <Radio value="occasionally">偶尔运动</Radio>
              <Radio value="regularly">每周1-3次</Radio>
              <Radio value="frequently">每周4次以上</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="dietHabits" label="饮食习惯">
            <TextArea placeholder="请描述您的饮食习惯，如是否有特殊饮食要求、偏好等" rows={3} />
          </Form.Item>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" style={{ marginRight: '10px' }}>
            保存并继续
          </Button>
          <Button htmlType="button" size="large" onClick={() => navigate('/consultation')}>
            跳过此步
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HealthProfile;
