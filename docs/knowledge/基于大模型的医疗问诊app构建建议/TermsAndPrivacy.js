import React from 'react';
import { Typography, Card, Divider, Collapse, Alert } from 'antd';
import { SafetyOutlined, FileProtectOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const TermsAndPrivacy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Title level={2}>用户协议与隐私政策</Title>
      
      <Alert
        message="重要提示"
        description="请仔细阅读以下用户协议和隐私政策。使用本应用即表示您已同意这些条款。"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />
      
      <Card title={<><SafetyOutlined /> 用户协议</>} style={{ marginBottom: '20px' }}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="1. 服务条款" key="1">
            <Paragraph>
              1.1 本协议是您与本应用开发者、运营者之间关于使用本应用服务所订立的协议。
            </Paragraph>
            <Paragraph>
              1.2 您在使用本应用前，应当仔细阅读本协议，并确认您已经完全理解并接受本协议的全部内容。
            </Paragraph>
            <Paragraph>
              1.3 本应用可能会不时修改本协议。修改后的协议一经发布，即代替原协议。您可以随时查阅最新版用户协议。
            </Paragraph>
          </Panel>
          
          <Panel header="2. 服务说明" key="2">
            <Paragraph>
              2.1 本应用是一个基于大模型的医疗问诊应用，主要功能是通过AI引导用户说出自己的病症，然后给出初步的诊疗建议和用药建议。
            </Paragraph>
            <Paragraph>
              2.2 本应用提供的所有信息、内容和服务仅供参考，不构成医疗建议、诊断或治疗。本应用不能替代专业医疗咨询、诊断或治疗。
            </Paragraph>
            <Paragraph>
              2.3 本应用可能会因系统维护、升级或其他原因暂停服务，我们将尽可能提前通知，但不保证服务不会中断或延迟。
            </Paragraph>
          </Panel>
          
          <Panel header="3. 用户行为规范" key="3">
            <Paragraph>
              3.1 您在使用本应用时，必须遵守中华人民共和国相关法律法规。
            </Paragraph>
            <Paragraph>
              3.2 您不得利用本应用从事任何违法或不当的活动，包括但不限于：
            </Paragraph>
            <Paragraph>
              a) 提供虚假信息；<br />
              b) 传播违法、有害信息；<br />
              c) 侵犯他人知识产权或其他合法权益；<br />
              d) 干扰本应用的正常运行；<br />
              e) 其他违反法律法规或本协议的行为。
            </Paragraph>
            <Paragraph>
              3.3 如您违反上述规定，本应用有权采取警告、限制或终止服务等措施。
            </Paragraph>
          </Panel>
          
          <Panel header="4. 免责声明" key="4">
            <Paragraph>
              4.1 本应用提供的所有信息、内容和服务仅供参考，不构成医疗建议、诊断或治疗。
            </Paragraph>
            <Paragraph>
              4.2 使用本应用不会在您与本应用开发者、运营者或其关联方之间建立医患关系。
            </Paragraph>
            <Paragraph>
              4.3 尽管我们努力提供准确、最新的信息，但我们不能保证本应用提供的所有信息都是完全准确、全面或最新的。
            </Paragraph>
            <Paragraph>
              4.4 您应当对自己的健康决策负责。在根据本应用提供的信息采取任何行动前，您应当咨询医疗专业人员。
            </Paragraph>
            <Paragraph>
              4.5 本应用不适用于医疗紧急情况。如果您认为自己正在经历医疗紧急情况，请立即拨打急救电话120或前往最近的医院急诊科。
            </Paragraph>
            <Paragraph>
              4.6 在法律允许的最大范围内，本应用开发者、运营者及其关联方对于因使用或无法使用本应用而导致的任何直接、间接、附带、特殊、惩罚性或后果性损害不承担责任，即使已被告知此类损害的可能性。
            </Paragraph>
          </Panel>
          
          <Panel header="5. 知识产权" key="5">
            <Paragraph>
              5.1 本应用的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、代码等，均受知识产权法律法规保护。
            </Paragraph>
            <Paragraph>
              5.2 未经本应用或相关权利人书面许可，您不得以任何方式使用、复制、修改、传播或发布上述内容。
            </Paragraph>
          </Panel>
          
          <Panel header="6. 协议终止" key="6">
            <Paragraph>
              6.1 本协议自您同意之日起生效，直至您或本应用终止服务为止。
            </Paragraph>
            <Paragraph>
              6.2 如您违反本协议，本应用有权终止向您提供服务。
            </Paragraph>
            <Paragraph>
              6.3 本协议终止后，本应用不再对您承担任何义务，但本协议另有规定的除外。
            </Paragraph>
          </Panel>
          
          <Panel header="7. 适用法律与争议解决" key="7">
            <Paragraph>
              7.1 本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。
            </Paragraph>
            <Paragraph>
              7.2 如双方就本协议内容或其执行发生任何争议，应尽量友好协商解决；协商不成时，任何一方均可向有管辖权的人民法院提起诉讼。
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
      
      <Card title={<><LockOutlined /> 隐私政策</>} style={{ marginBottom: '20px' }}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="1. 信息收集" key="1">
            <Paragraph>
              1.1 为了提供服务，我们可能会收集以下信息：
            </Paragraph>
            <Paragraph>
              a) 个人信息：包括但不限于姓名、性别、出生日期、联系方式等；<br />
              b) 健康信息：包括但不限于病史、症状描述、用药情况等；<br />
              c) 设备信息：包括但不限于设备型号、操作系统、浏览器类型等；<br />
              d) 日志信息：包括但不限于IP地址、访问时间、访问页面等。
            </Paragraph>
            <Paragraph>
              1.2 我们收集信息的方式包括：
            </Paragraph>
            <Paragraph>
              a) 您主动提供的信息；<br />
              b) 自动收集的信息；<br />
              c) 来自第三方的信息（如您授权的其他应用）。
            </Paragraph>
          </Panel>
          
          <Panel header="2. 信息使用" key="2">
            <Paragraph>
              2.1 我们使用收集的信息用于：
            </Paragraph>
            <Paragraph>
              a) 提供医疗问诊服务；<br />
              b) 改进我们的服务；<br />
              c) 保障您的账号安全；<br />
              d) 向您发送服务通知；<br />
              e) 进行数据分析和研究；<br />
              f) 履行法律法规规定的义务。
            </Paragraph>
            <Paragraph>
              2.2 我们不会将您的个人信息用于与服务无关的目的。
            </Paragraph>
          </Panel>
          
          <Panel header="3. 信息共享" key="3">
            <Paragraph>
              3.1 我们不会向第三方出售您的个人信息。
            </Paragraph>
            <Paragraph>
              3.2 在以下情况下，我们可能会共享您的信息：
            </Paragraph>
            <Paragraph>
              a) 获得您的明确同意；<br />
              b) 为提供服务必须与合作伙伴共享；<br />
              c) 应法律法规要求或政府主管部门的强制性要求；<br />
              d) 为保护我们的权利、财产或安全，或保护用户或公众的权利、财产或安全。
            </Paragraph>
          </Panel>
          
          <Panel header="4. 信息保护" key="4">
            <Paragraph>
              4.1 我们采取严格的数据安全措施保护您的个人信息，包括但不限于：
            </Paragraph>
            <Paragraph>
              a) 数据加密；<br />
              b) 访问控制；<br />
              c) 安全审计；<br />
              d) 灾难恢复。
            </Paragraph>
            <Paragraph>
              4.2 尽管我们采取了这些措施，但请注意互联网并非绝对安全的环境，我们无法保证您的信息在传输过程中绝对安全。
            </Paragraph>
          </Panel>
          
          <Panel header="5. 信息存储" key="5">
            <Paragraph>
              5.1 我们会在必要的时间内保存您的信息，除非法律要求或允许在更长的时间内保存这些信息。
            </Paragraph>
            <Paragraph>
              5.2 我们的服务器可能位于中国境内或境外。我们会确保这些服务器所在地的数据保护法律提供与中国法律相当的保护水平。
            </Paragraph>
          </Panel>
          
          <Panel header="6. 您的权利" key="6">
            <Paragraph>
              6.1 您有权：
            </Paragraph>
            <Paragraph>
              a) 访问您的个人信息；<br />
              b) 更正不准确的信息；<br />
              c) 删除您的信息；<br />
              d) 撤回您的同意；<br />
              e) 注销您的账号。
            </Paragraph>
            <Paragraph>
              6.2 如您希望行使上述权利，请通过本应用提供的联系方式与我们联系。
            </Paragraph>
          </Panel>
          
          <Panel header="7. 儿童隐私" key="7">
            <Paragraph>
              7.1 本应用不面向16岁以下的儿童。
            </Paragraph>
            <Paragraph>
              7.2 如果我们发现自己收集了16岁以下儿童的个人信息，我们会立即删除这些信息。
            </Paragraph>
            <Paragraph>
              7.3 如果您是16岁以下儿童的父母或监护人，发现您的孩子向我们提供了个人信息，请与我们联系。
            </Paragraph>
          </Panel>
          
          <Panel header="8. 隐私政策更新" key="8">
            <Paragraph>
              8.1 我们可能会不时更新本隐私政策。
            </Paragraph>
            <Paragraph>
              8.2 当本隐私政策发生重大变更时，我们会通过应用内通知或其他方式通知您。
            </Paragraph>
            <Paragraph>
              8.3 继续使用我们的服务即表示您同意修改后的隐私政策。
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
      
      <Card title={<><MedicineBoxOutlined /> 医疗信息处理声明</>}>
        <Paragraph>
          本应用严格遵守《中华人民共和国基本医疗卫生与健康促进法》、《中华人民共和国执业医师法》、《互联网诊疗管理办法》等相关法律法规，对用户提供的健康信息进行严格保护。
        </Paragraph>
        
        <Title level={4}>医疗信息处理原则</Title>
        <Paragraph>
          1. <Text strong>合法性原则</Text>：我们仅在法律允许的范围内收集和处理您的健康信息。
        </Paragraph>
        <Paragraph>
          2. <Text strong>最小必要原则</Text>：我们仅收集为提供服务所必需的健康信息。
        </Paragraph>
        <Paragraph>
          3. <Text strong>透明性原则</Text>：我们明确告知您我们如何收集、使用和保护您的健康信息。
        </Paragraph>
        <Paragraph>
          4. <Text strong>安全性原则</Text>：我们采取严格的技术和管理措施保护您的健康信息安全。
        </Paragraph>
        
        <Divider />
        
        <Alert
          message="特别提示"
          description="本应用提供的健康信息和建议仅供参考，不构成医疗诊断或治疗建议。如有健康问题，请咨询专业医疗人员。"
          type="warning"
          showIcon
        />
      </Card>
    </div>
  );
};

export default TermsAndPrivacy;
