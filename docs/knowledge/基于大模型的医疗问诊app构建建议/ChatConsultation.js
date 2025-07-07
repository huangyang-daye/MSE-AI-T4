import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Typography, Card, Tag, Radio, Checkbox, Row, Col, Spin, Avatar, Tooltip, Upload, message } from 'antd';
import { SendOutlined, AudioOutlined, PictureOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ChatConsultation = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '您好！我是您的医疗问诊助手。请描述您的症状或健康问题，我会一步步引导您完成问诊。',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionOptions, setQuestionOptions] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 模拟发送消息并获取回复
  const sendMessage = () => {
    if (inputValue.trim() === '') return;

    // 添加用户消息
    const userMessage = {
      type: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // 模拟AI回复延迟
    setTimeout(() => {
      // 根据用户输入生成下一个问题
      generateNextQuestion(inputValue);
      setLoading(false);
    }, 1000);
  };

  // 模拟生成下一个问题
  const generateNextQuestion = (userInput) => {
    // 这里是模拟的问诊流程逻辑
    // 实际应用中应该调用后端API获取大模型的回复
    
    let botResponse;
    let options = [];
    
    // 简单的问诊流程模拟
    if (messages.length === 1) {
      // 第一轮对话，询问症状持续时间
      botResponse = `感谢您的描述。请问这些症状持续了多长时间？`;
      options = [
        '今天刚开始',
        '1-3天',
        '4-7天',
        '一周以上',
        '一个月以上'
      ];
    } else if (messages.length === 3) {
      // 第二轮对话，询问是否有其他症状
      botResponse = `了解了。除了您提到的主要症状外，是否还有以下伴随症状？`;
      options = [
        '发热',
        '头痛',
        '乏力',
        '食欲不振',
        '恶心呕吐',
        '腹泻',
        '其他'
      ];
      setCurrentQuestion('accompaniedSymptoms');
    } else if (messages.length === 5) {
      // 第三轮对话，询问是否有用药
      botResponse = `您是否已经服用过任何药物来缓解症状？`;
      options = [
        '是',
        '否'
      ];
    } else if (messages.length === 7) {
      // 第四轮对话，询问是否有过敏史
      botResponse = `您是否有任何药物或食物过敏史？`;
      options = [
        '是',
        '否'
      ];
    } else if (messages.length === 9) {
      // 第五轮对话，询问是否有慢性病史
      botResponse = `您是否患有以下任何慢性疾病？`;
      options = [
        '高血压',
        '糖尿病',
        '心脏病',
        '哮喘',
        '无'
      ];
      setCurrentQuestion('chronicDiseases');
    } else if (messages.length >= 11) {
      // 问诊结束，提供初步诊断
      botResponse = `感谢您提供的信息。根据您的描述，我已经收集了足够的信息进行初步分析。请点击下方按钮查看诊疗建议。`;
      
      // 添加机器人消息
      const botMessage = {
        type: 'bot',
        content: botResponse,
        time: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // 延迟导航到诊断结果页面
      setTimeout(() => {
        navigate('/diagnosis-result');
      }, 2000);
      
      return;
    }
    
    // 添加机器人消息
    const botMessage = {
      type: 'bot',
      content: botResponse,
      time: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setQuestionOptions(options);
  };

  // 处理选项点击
  const handleOptionClick = (option) => {
    setInputValue(option);
  };

  // 处理多选选项提交
  const handleMultipleOptionsSubmit = (selectedOptions) => {
    if (selectedOptions.length === 0) {
      setInputValue('无');
    } else {
      setInputValue(selectedOptions.join('、'));
    }
  };

  // 渲染消息
  const renderMessages = () => {
    return messages.map((msg, index) => (
      <div key={index} className={`message message-${msg.type}`}>
        <Avatar 
          icon={msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />} 
          style={{ 
            backgroundColor: msg.type === 'user' ? '#1890ff' : '#52c41a',
            marginRight: msg.type === 'user' ? 0 : '10px',
            marginLeft: msg.type === 'user' ? '10px' : 0
          }}
        />
        <div className="message-content">
          {msg.content}
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
            {msg.time}
          </div>
        </div>
      </div>
    ));
  };

  // 渲染选项按钮
  const renderOptions = () => {
    if (currentQuestion === 'accompaniedSymptoms' || currentQuestion === 'chronicDiseases') {
      // 多选选项
      return (
        <Card style={{ marginTop: '10px' }}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {questionOptions.map((option, index) => (
                <Col span={8} key={index}>
                  <Checkbox value={option}>{option}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
          <Button 
            type="primary" 
            style={{ marginTop: '10px' }}
            onClick={(e) => {
              const checkboxGroup = e.target.closest('.ant-card').querySelector('.ant-checkbox-group');
              const selectedOptions = Array.from(checkboxGroup.querySelectorAll('.ant-checkbox-checked'))
                .map(checkbox => checkbox.closest('.ant-checkbox-wrapper').innerText);
              handleMultipleOptionsSubmit(selectedOptions);
            }}
          >
            确认
          </Button>
        </Card>
      );
    } else {
      // 单选选项
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
          {questionOptions.map((option, index) => (
            <Button 
              key={index} 
              style={{ margin: '0 10px 10px 0' }}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="chat-container">
      <Title level={2}>智能问诊</Title>
      <Paragraph>
        请描述您的症状，AI助手将引导您完成问诊流程，并提供初步的诊疗建议。
      </Paragraph>
      
      <div className="chat-messages">
        {renderMessages()}
        {loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin tip="AI助手正在思考..." />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {questionOptions.length > 0 && renderOptions()}
      
      <div className="chat-input">
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="请输入您的症状或回答问题..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Tooltip title="语音输入">
              <Button icon={<AudioOutlined />} style={{ marginRight: '10px' }} />
            </Tooltip>
            <Tooltip title="上传图片">
              <Button icon={<PictureOutlined />} />
            </Tooltip>
          </div>
          <Button type="primary" icon={<SendOutlined />} onClick={sendMessage}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConsultation;
