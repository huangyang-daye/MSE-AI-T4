import React, { useState } from 'react';
import { Typography, Button, Card, Row, Col, Carousel, Checkbox, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { RightOutlined, MessageOutlined, SafetyOutlined, FileProtectOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Welcome = () => {
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const showDisclaimer = () => {
    setDisclaimerVisible(true);
  };

  const handleDisclaimerOk = () => {
    if (disclaimerChecked) {
      setDisclaimerVisible(false);
    }
  };

  const handleDisclaimerCancel = () => {
    setDisclaimerVisible(false);
  };

  const onDisclaimerCheckChange = (e) => {
    setDisclaimerChecked(e.target.checked);
  };

  return (
    <div className="welcome-container">
      <Title className="welcome-title">医疗问诊助手</Title>
      <Paragraph className="welcome-subtitle">
        基于大模型的智能医疗问诊系统，为您提供初步的诊疗建议和用药参考
      </Paragraph>

      <Carousel autoplay className="welcome-carousel">
        <div>
          <div style={{ height: '200px', background: '#1890ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3>智能问诊，一步一步引导您描述症状</h3>
          </div>
        </div>
        <div>
          <div style={{ height: '200px', background: '#52c41a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3>提供初步诊疗建议，帮助您更好地了解健康状况</h3>
          </div>
        </div>
        <div>
          <div style={{ height: '200px', background: '#722ed1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3>安全可靠，保护您的隐私</h3>
          </div>
        </div>
      </Carousel>

      <div className="welcome-features">
        <Card className="feature-card" title="智能问诊" extra={<MessageOutlined />}>
          通过自然语言对话，引导您描述症状，提供个性化的健康咨询服务。
        </Card>
        <Card className="feature-card" title="健康档案" extra={<FileProtectOutlined />}>
          记录您的健康数据，跟踪健康状况变化，为您提供更精准的健康建议。
        </Card>
        <Card className="feature-card" title="安全保障" extra={<SafetyOutlined />}>
          严格保护您的隐私数据，所有健康信息均经过加密处理，确保安全可靠。
        </Card>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Button type="primary" size="large" onClick={showDisclaimer}>
          开始使用 <RightOutlined />
        </Button>
        <Paragraph style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          点击"开始使用"即表示您同意我们的<a href="#" onClick={(e) => { e.preventDefault(); showDisclaimer(); }}>免责声明</a>和<a href="#">隐私政策</a>
        </Paragraph>
      </div>

      <Modal
        title="医疗免责声明"
        open={disclaimerVisible}
        onOk={handleDisclaimerOk}
        onCancel={handleDisclaimerCancel}
        okText="同意并继续"
        cancelText="取消"
        okButtonProps={{ disabled: !disclaimerChecked }}
        width={700}
      >
        <div style={{ maxHeight: '400px', overflow: 'auto', padding: '10px' }}>
          <Title level={4}>服务定位</Title>
          <Paragraph>
            本服务提供的所有内容，包括文本、图形、图像和其他材料，仅供参考。本服务不构成医疗建议、诊断或治疗，不能替代专业医疗人员的建议。
          </Paragraph>

          <Title level={4}>专业医疗建议</Title>
          <Paragraph>
            如果您对自身健康状况有任何疑问或担忧，请务必咨询您的医生或其他合格的医疗服务提供者。如果您认为自己可能有紧急医疗情况，请立即联系您的医生或拨打急救电话。
          </Paragraph>

          <Title level={4}>责任限制</Title>
          <Paragraph>
            本服务不推荐或支持任何特定的检查、医生、产品、手术、意见或其他信息。依赖本服务提供的任何信息，均由您自行承担风险。本服务提供方对因使用本服务而导致的任何直接或间接损失不承担责任。
          </Paragraph>

          <Title level={4}>信息时效性</Title>
          <Paragraph>
            医学信息随着科学的发展而迅速变化。我们会定期更新我们的内容，但不能保证所有信息都是最新的。请咨询您的医生或医护团队获取最新的医疗建议。
          </Paragraph>

          <Title level={4}>AI技术局限性</Title>
          <Paragraph>
            本服务使用人工智能技术，存在固有的局限性。AI回答可能不完全准确或全面，输出结果需要专业医疗人员审核，不应直接用于诊断或治疗决策。
          </Paragraph>
        </div>
        <Checkbox checked={disclaimerChecked} onChange={onDisclaimerCheckChange} style={{ marginTop: '20px' }}>
          我已阅读并理解上述免责声明，同意使用本服务
        </Checkbox>
      </Modal>
    </div>
  );
};

export default Welcome;
