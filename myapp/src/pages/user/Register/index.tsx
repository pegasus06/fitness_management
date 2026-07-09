import Footer from '@/components/Footer';
import { register } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';
import { SYSTEM_LOGO, FORGET_PASSWORD } from '@/constants';

// 错误提示组件
const RegisterMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Register: React.FC = () => {
  // 错误信息、加载状态
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { initialState } = useModel('@@initialState');

  // 注册表单提交
  const handleRegister = async (values: API.RegisterParams) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      // 调用注册接口
      const res = await register(values);
      if (res.code === 0) {
        message.success('注册成功，请前往登录！');
        // 跳转到登录页
        history.push('/user/login');
        return;
      }
      setErrorMsg(res.message || '注册失败，请检查信息');
    } catch (err) {
      setErrorMsg('服务异常，注册请求失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm 
          logo={<img alt="logo" src={SYSTEM_LOGO} />}
          title="Fitness Management"
          subTitle={'一款集中式健身后台管理系统'}
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            submitButtonProps: {
              loading: submitting,
              size: 'large',
              block: true,
            },
            searchConfig: {
              submitText: '注册',
            }
          }}
          onFinish={handleRegister}
        >
          {/* 错误提示 */}
          {errorMsg && <RegisterMessage content={errorMsg} />}

<Tabs
  activeKey="register"
  onChange={(key) => {
    if (key === 'login') {
      history.push('/user/login');
    }
  }}
  items={[
    {
      key: 'login',
      label: '账号登录',
    },
    {
      key: 'register',
      label: '账号注册',
    },
  ]}
/>

          {/* 账号 */}
          <ProFormText
            name="userAccount"
            placeholder="请输入账号"
            rules={[
              { required: true, message: '账号不能为空' },
              { min: 4, max: 16, message: '账号长度4-16位' },
            ]}
          />

          {/* 手机号 + 验证码 */}
          <ProFormText
            name="phone"
            placeholder="请输入手机号"
            rules={[
              { required: true, message: '手机号不能为空' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' },
            ]}
          />
          <ProFormCaptcha
            name="captcha"
            phoneName="phone"
            placeholder="请输入验证码"
            captchaTextRender={(timing, count) => {
              if (timing) return `${count}s后重新获取`;
              return '获取验证码';
            }}
            onGetCaptcha={async (phone) => {
              await getFakeCaptcha(phone);
              message.success('验证码发送成功');
            }}
            rules={[{ required: true, message: '请输入验证码' }]}
          />

          {/* 密码 */}
          <ProFormText.Password
            name="userPassword"
            placeholder="请输入密码"
            rules={[
              { required: true, message: '密码不能为空' },
              { min: 6, max: 16, message: '密码长度6-16位' },
            ]}
          />

          {/* 确认密码 */}
          <ProFormText.Password
            name="checkPassword"
            placeholder="请再次输入密码"
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('userPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入密码不一致'));
                },
              }),
            ]}
          />

          {/* 用户协议勾选 */}
          <ProFormCheckbox name="agree" rules={[{ required: true, message: '请阅读并同意协议' }]}>
            我已阅读并同意《用户使用协议》
          </ProFormCheckbox>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Register;