import React, { useState } from 'react';
import { Typography, Card, Table, Button, Tabs, Empty, Timeline, Tag, Drawer, Descriptions, Statistic, Row, Col, DatePicker } from 'antd';
import { FileTextOutlined, HeartOutlined, MedicineBoxOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const HealthRecords = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();

  // 模拟健康记录数据
  const healthRecords = [
    {
      id: 1,
      date: '2025-04-10',
      mainSymptoms: '咳嗽、流涕、喉咙痛',
      diagnosis: '普通感冒',
      recommendations: '多休息，多喝水，必要时服用布洛芬缓解症状',
      status: '已恢复'
    },
    {
      id: 2,
      date: '2025-03-22',
      mainSymptoms: '头痛、发热、全身酸痛',
      diagnosis: '流感',
      recommendations: '卧床休息，服用奥司他韦，监测体温',
      status: '已恢复'
    },
    {
      id: 3,
      date: '2025-02-15',
      mainSymptoms: '皮肤瘙痒、红疹',
      diagnosis: '过敏性皮炎',
      recommendations: '避免接触过敏原，使用抗过敏药物',
      status: '持续观察'
    }
  ];

  // 模拟健康指标数据
  const healthMetrics = [
    {
      date: '2025-04-12',
      weight: 68,
      bloodPressure: '120/80',
      heartRate: 72,
      bloodSugar: 5.2
    },
    {
      date: '2025-04-05',
      weight: 68.5,
      bloodPressure: '122/82',
      heartRate: 75,
      bloodSugar: 5.3
    },
    {
      date: '2025-03-29',
      weight: 69,
      bloodPressure: '125/85',
      heartRate: 78,
      bloodSugar: 5.4
    }
  ];

  // 模拟用药记录数据
  const medicationRecords = [
    {
      id: 1,
      medication: '布洛芬',
      dosage: '200mg',
      frequency: '每8小时一次',
      startDate: '2025-04-10',
      endDate: '2025-04-12',
      purpose: '缓解感冒症状'
    },
    {
      id: 2,
      medication: '奥司他韦',
      dosage: '75mg',
      frequency: '每12小时一次',
      startDate: '2025-03-22',
      endDate: '2025-03-27',
      purpose: '治疗流感'
    },
    {
      id: 3,
      medication: '氯雷他定',
      dosage: '10mg',
      frequency: '每日一次',
      startDate: '2025-02-15',
      endDate: '2025-02-22',
      purpose: '缓解过敏症状'
    }
  ];

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
      defaultSortOrder: 'descend'
    },
    {
      title: '主要症状',
      dataIndex: 'mainSymptoms',
      key: 'mainSymptoms',
    },
    {
      title: '诊断结果',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === '已恢复' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => showRecordDetail(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  const medicationColumns = [
    {
      title: '药物名称',
      dataIndex: 'medication',
      key: 'medication',
    },
    {
      title: '剂量',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: '频率',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      key: 'purpose',
    },
  ];

  const showRecordDetail = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>健康记录</Title>
      <Paragraph>
        查看您的历史问诊记录、健康指标和用药情况，帮助您更好地管理健康。
      </Paragraph>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <RangePicker style={{ width: '300px' }} placeholder={['开始日期', '结束日期']} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/consultation')}>
          新增问诊
        </Button>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              问诊记录
            </span>
          }
          key="1"
        >
          <Table
            columns={columns}
            dataSource={healthRecords}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <HeartOutlined />
              健康指标
            </span>
          }
          key="2"
        >
          {healthMetrics.length > 0 ? (
            <>
              <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="最新体重"
                      value={healthMetrics[0].weight}
                      suffix="kg"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="最新血压"
                      value={healthMetrics[0].bloodPressure}
                      suffix="mmHg"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="最新心率"
                      value={healthMetrics[0].heartRate}
                      suffix="bpm"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="最新血糖"
                      value={healthMetrics[0].bloodSugar}
                      suffix="mmol/L"
                      precision={1}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="健康指标历史记录">
                <Timeline mode="left">
                  {healthMetrics.map((metric, index) => (
                    <Timeline.Item key={index} label={metric.date}>
                      <p>体重: {metric.weight} kg</p>
                      <p>血压: {metric.bloodPressure} mmHg</p>
                      <p>心率: {metric.heartRate} bpm</p>
                      <p>血糖: {metric.bloodSugar} mmol/L</p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </>
          ) : (
            <Empty description="暂无健康指标数据" />
          )}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <MedicineBoxOutlined />
              用药记录
            </span>
          }
          key="3"
        >
          <Table
            columns={medicationColumns}
            dataSource={medicationRecords}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>

      <Drawer
        title="问诊记录详情"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={500}
      >
        {selectedRecord && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="日期">{selectedRecord.date}</Descriptions.Item>
              <Descriptions.Item label="主要症状">{selectedRecord.mainSymptoms}</Descriptions.Item>
              <Descriptions.Item label="诊断结果">{selectedRecord.diagnosis}</Descriptions.Item>
              <Descriptions.Item label="建议">{selectedRecord.recommendations}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRecord.status === '已恢复' ? 'green' : 'orange'}>
                  {selectedRecord.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '20px' }}>
              <Button type="primary" style={{ marginRight: '10px' }}>
                导出记录
              </Button>
              <Button>
                分享给医生
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default HealthRecords;
