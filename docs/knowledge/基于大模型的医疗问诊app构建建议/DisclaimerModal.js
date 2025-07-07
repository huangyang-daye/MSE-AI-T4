import React, { useState, useEffect } from 'react';
import { Modal, Typography, Checkbox, Button, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const DisclaimerModal = ({ visible, onAccept, onReject }) => {
  const [checked, setChecked] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // 倒计时效果，确保用户至少阅读10秒
  useEffect(() => {
    let timer;
    if (visible && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [visible, countdown]);

  const handleAccept = () => {
    if (checked) {
      // 保存用户同意记录到本地存储
      localStorage.setItem('disclaimerAccepted', 'true');
      localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
      onAccept();
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '10px' }} />
          <span>医疗免责声明</span>
        </div>
      }
      open={visible}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="reject" onClick={onReject}>
          不同意并退出
        </Button>,
        <Button
          key="accept"
          type="primary"
          disabled={!checked || countdown > 0}
          onClick={handleAccept}
        >
          {countdown > 0 ? `同意并继续 (${countdown}s)` : '同意并继续'}
        </Button>
      ]}
      width={700}
    >
      <div style={{ maxHeight: '400px', overflow: 'auto', padding: '10px', marginBottom: '20px' }}>
        <Title level={4}>医疗咨询免责声明</Title>
        
        <Paragraph>
          <Text strong>请在使用本应用前仔细阅读以下免责声明。使用本应用即表示您已阅读、理解并同意以下条款。</Text>
        </Paragraph>
        
        <Alert
          message="重要提示"
          description="本应用不提供医疗诊断，仅作为初步咨询工具。如有紧急情况，请立即拨打急救电话120或前往最近的医院就诊。"
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        
        <Title level={5}>1. 非医疗建议</Title>
        <Paragraph>
          本应用提供的所有信息、内容和服务仅供参考，不构成医疗建议、诊断或治疗。本应用不能替代专业医疗咨询、诊断或治疗。对于任何健康问题，您应当咨询合格的医疗专业人员。
        </Paragraph>
        
        <Title level={5}>2. 无医患关系</Title>
        <Paragraph>
          使用本应用不会在您与本应用开发者、运营者或其关联方之间建立医患关系。本应用的AI助手不是医生，不具备医疗执业资格，不能提供专业医疗诊断。
        </Paragraph>
        
        <Title level={5}>3. 信息准确性</Title>
        <Paragraph>
          尽管我们努力提供准确、最新的信息，但我们不能保证本应用提供的所有信息都是完全准确、全面或最新的。医学知识不断发展，治疗方法可能随时间变化。
        </Paragraph>
        
        <Title level={5}>4. 用户责任</Title>
        <Paragraph>
          您应当对自己的健康决策负责。在根据本应用提供的信息采取任何行动前，您应当咨询医疗专业人员。对于您因依赖本应用提供的信息而采取或不采取的任何行动，我们不承担任何责任。
        </Paragraph>
        
        <Title level={5}>5. 紧急情况</Title>
        <Paragraph>
          本应用不适用于医疗紧急情况。如果您认为自己正在经历医疗紧急情况，请立即拨打急救电话120或前往最近的医院急诊科。
        </Paragraph>
        
        <Title level={5}>6. 隐私保护</Title>
        <Paragraph>
          我们重视您的隐私。您在本应用中提供的健康信息将按照我们的隐私政策进行处理。请注意，尽管我们采取措施保护您的信息，但互联网传输不能保证100%的安全性。
        </Paragraph>
        
        <Title level={5}>7. 责任限制</Title>
        <Paragraph>
          在法律允许的最大范围内，本应用开发者、运营者及其关联方对于因使用或无法使用本应用而导致的任何直接、间接、附带、特殊、惩罚性或后果性损害不承担责任，即使已被告知此类损害的可能性。
        </Paragraph>
        
        <Title level={5}>8. 适用法律</Title>
        <Paragraph>
          本免责声明受中华人民共和国法律管辖，并按其解释。与本免责声明相关的任何争议应提交至有管辖权的法院解决。
        </Paragraph>
      </div>
      
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
        我已阅读并理解上述免责声明，并同意其条款和条件。我理解这不是医疗诊断服务，如有健康问题应咨询专业医生。
      </Checkbox>
    </Modal>
  );
};

export default DisclaimerModal;
