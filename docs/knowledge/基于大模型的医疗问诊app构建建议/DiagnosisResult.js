import React from 'react';
import { Typography, Card, Descriptions, Tag, Button, Divider, List, Row, Col, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, MedicineBoxOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const DiagnosisResult = () => {
  const navigate = useNavigate();

  // 模拟诊断结果数据
  const diagnosisData = {
    possibleConditions: [
      {
        name: '普通感冒',
        probability: '高',
        description: '普通感冒是由病毒引起的上呼吸道感染，通常会引起鼻塞、流涕、咳嗽、喉咙痛等症状。'
      },
      {
        name: '季节性过敏',
        probability: '中',
        description: '季节性过敏是由花粉、尘螨等过敏原引起的过敏反应，症状包括打喷嚏、流涕、鼻塞等。'
      },
      {
        name: '鼻窦炎',
        probability: '低',
        description: '鼻窦炎是鼻窦内壁的炎症，可能由感染或过敏引起，症状包括鼻塞、头痛、面部压力感等。'
      }
    ],
    recommendations: [
      {
        type: '就医建议',
        content: '建议在症状持续3天以上且没有改善时，前往医院耳鼻喉科就诊。',
        urgency: '一般'
      },
      {
        type: '自我护理',
        content: '多休息，保持充分的水分摄入，使用盐水洗鼻，可以缓解鼻塞症状。',
        urgency: '推荐'
      },
      {
        type: '生活调整',
        content: '避免接触可能的过敏原，保持室内空气流通，使用空气净化器可能有所帮助。',
        urgency: '推荐'
      }
    ],
    medications: [
      {
        name: '布洛芬',
        usage: '成人每次200-400mg，每6-8小时一次，不超过1200mg/天。',
        purpose: '缓解疼痛和发热',
        notes: '饭后服用，有胃病史者慎用。'
      },
      {
        name: '氯雷他定',
        usage: '成人每日一次，每次10mg。',
        purpose: '缓解过敏症状',
        notes: '可能导致嗜睡，服药后避免驾驶或操作机械。'
      },
      {
        name: '盐水鼻腔喷雾',
        usage: '每侧鼻腔2-3喷，每日3-4次。',
        purpose: '缓解鼻塞，湿润鼻腔',
        notes: '无明显副作用，可长期使用。'
      }
    ],
    warningSymptoms: [
      '高烧（体温超过39°C）持续不退',
      '呼吸困难或胸痛',
      '严重头痛伴随意识模糊',
      '症状持续一周以上且明显恶化'
    ]
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Alert
        message="免责声明"
        description="本诊断结果仅供参考，不构成医疗建议。如有严重症状，请立即就医。"
        type="warning"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Title level={2}>诊断结果与建议</Title>
      <Paragraph>
        基于您提供的症状和健康信息，我们为您生成了以下初步分析和建议。请注意，这些信息仅供参考，不能替代专业医生的诊断。
      </Paragraph>

      <Card title="可能的病因分析" style={{ marginBottom: '20px' }}>
        <List
          itemLayout="vertical"
          dataSource={diagnosisData.possibleConditions}
          renderItem={item => (
            <List.Item
              extra={
                <Tag color={
                  item.probability === '高' ? 'red' : 
                  item.probability === '中' ? 'orange' : 'green'
                }>
                  可能性: {item.probability}
                </Tag>
              }
            >
              <List.Item.Meta
                title={item.name}
                description={item.description}
              />
            </List.Item>
          )}
        />
        <Paragraph type="secondary" style={{ marginTop: '10px' }}>
          注意：以上分析基于您提供的信息，实际情况可能有所不同，请咨询医生获取准确诊断。
        </Paragraph>
      </Card>

      <Card title="诊疗建议" style={{ marginBottom: '20px' }}>
        <List
          itemLayout="horizontal"
          dataSource={diagnosisData.recommendations}
          renderItem={item => (
            <List.Item
              actions={[
                <Tag color={
                  item.urgency === '紧急' ? 'red' : 
                  item.urgency === '推荐' ? 'green' : 'blue'
                }>
                  {item.urgency}
                </Tag>
              ]}
            >
              <List.Item.Meta
                title={item.type}
                description={item.content}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="用药参考" style={{ marginBottom: '20px' }}>
        <Alert
          message="用药提示"
          description="以下药物信息仅供参考，请在医生指导下用药。自行用药前请仔细阅读药品说明书，确认无禁忌症。"
          type="info"
          showIcon
          style={{ marginBottom: '15px' }}
        />
        {diagnosisData.medications.map((med, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <Descriptions title={med.name} bordered size="small">
              <Descriptions.Item label="用法用量" span={3}>{med.usage}</Descriptions.Item>
              <Descriptions.Item label="用途" span={3}>{med.purpose}</Descriptions.Item>
              <Descriptions.Item label="注意事项" span={3}>{med.notes}</Descriptions.Item>
            </Descriptions>
          </div>
        ))}
      </Card>

      <Card title="需要注意的警示症状" style={{ marginBottom: '20px' }}>
        <Paragraph>
          如果出现以下症状，请立即就医：
        </Paragraph>
        <List
          dataSource={diagnosisData.warningSymptoms}
          renderItem={item => (
            <List.Item>
              <ExclamationCircleOutlined style={{ color: 'red', marginRight: '10px' }} />
              {item}
            </List.Item>
          )}
        />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <Button size="large" onClick={() => navigate('/consultation')}>
          返回问诊
        </Button>
        <Button type="primary" size="large" onClick={() => navigate('/health-records')}>
          保存到健康记录
        </Button>
      </div>
    </div>
  );
};

export default DiagnosisResult;
