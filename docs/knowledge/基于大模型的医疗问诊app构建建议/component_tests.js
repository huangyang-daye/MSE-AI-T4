// 前端组件测试脚本
// 测试免责声明模态框和问诊对话组件

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisclaimerModal from '../src/components/DisclaimerModal';
import ChatConsultation from '../src/pages/ChatConsultation';
import { BrowserRouter } from 'react-router-dom';

// 测试免责声明模态框
describe('DisclaimerModal', () => {
  const mockOnAccept = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('渲染免责声明模态框', () => {
    render(
      <DisclaimerModal 
        visible={true} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    expect(screen.getByText('医疗免责声明')).toBeInTheDocument();
    expect(screen.getByText('请在使用本应用前仔细阅读以下免责声明。使用本应用即表示您已阅读、理解并同意以下条款。')).toBeInTheDocument();
  });

  test('接受按钮在倒计时结束前应该被禁用', () => {
    render(
      <DisclaimerModal 
        visible={true} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    const acceptButton = screen.getByText(/同意并继续/);
    expect(acceptButton).toBeDisabled();
    
    // 快进倒计时
    jest.advanceTimersByTime(10000);
    
    // 倒计时结束后，按钮仍然禁用，因为复选框未选中
    expect(acceptButton).toBeDisabled();
  });

  test('选中复选框并倒计时结束后，接受按钮应该可用', async () => {
    render(
      <DisclaimerModal 
        visible={true} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // 快进倒计时
    jest.advanceTimersByTime(10000);
    
    // 选中复选框
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // 接受按钮应该可用
    const acceptButton = screen.getByText('同意并继续');
    expect(acceptButton).not.toBeDisabled();
    
    // 点击接受按钮
    fireEvent.click(acceptButton);
    
    // 应该调用onAccept回调
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });

  test('点击拒绝按钮应该调用onReject回调', () => {
    render(
      <DisclaimerModal 
        visible={true} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    const rejectButton = screen.getByText('不同意并退出');
    fireEvent.click(rejectButton);
    
    expect(mockOnReject).toHaveBeenCalledTimes(1);
  });
});

// 测试问诊对话组件
describe('ChatConsultation', () => {
  // 模拟路由
  const renderWithRouter = (ui) => {
    return render(
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    );
  };

  test('渲染问诊对话组件', () => {
    renderWithRouter(<ChatConsultation />);
    
    expect(screen.getByText('智能问诊')).toBeInTheDocument();
    expect(screen.getByText('请描述您的症状，AI助手将引导您完成问诊流程，并提供初步的诊疗建议。')).toBeInTheDocument();
  });

  test('初始欢迎消息应该显示', () => {
    renderWithRouter(<ChatConsultation />);
    
    expect(screen.getByText('您好！我是您的医疗问诊助手。请描述您的症状或健康问题，我会一步步引导您完成问诊。')).toBeInTheDocument();
  });

  test('用户应该能够发送消息', async () => {
    renderWithRouter(<ChatConsultation />);
    
    // 输入消息
    const input = screen.getByPlaceholderText('请输入您的症状或回答问题...');
    fireEvent.change(input, { target: { value: '我最近感到头痛、喉咙痛，并且有轻微发热。' } });
    
    // 点击发送按钮
    const sendButton = screen.getByText('发送');
    fireEvent.click(sendButton);
    
    // 用户消息应该显示在聊天窗口中
    expect(screen.getByText('我最近感到头痛、喉咙痛，并且有轻微发热。')).toBeInTheDocument();
    
    // 应该显示加载状态
    expect(screen.getByText('AI助手正在思考...')).toBeInTheDocument();
    
    // 等待AI回复（这里需要模拟API响应）
    // 在实际测试中，我们需要模拟API调用
  });

  test('选项按钮应该可以点击', async () => {
    // 这个测试需要模拟API响应，以显示选项按钮
    // 在实际测试中，我们需要模拟API调用并检查选项按钮的行为
  });
});
