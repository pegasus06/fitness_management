import { outLogin } from '@/services/ant-design-pro/api';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, message } from 'antd';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { history, useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录
 * 核心功能：退出自动保存当前登录账号，下次登录页自动回填
 */
const loginOut = async (setInitialState: any, userInfo: any) => {
  // 调用后端登出接口
  await outLogin();
  // 清除登录令牌
  localStorage.removeItem('token');

  // 统一 key：lastLoginAccount 和登录页完全对应
  // 退出时保存当前账号，保证永久记住
  if (userInfo?.userAccount) {
    localStorage.setItem('lastLoginAccount', userInfo.userAccount);
  }

  message.success('退出登录成功');
  const { pathname, search } = history.location;

  // 延迟跳转，保证提示展示完成、组件不瞬间销毁
  setTimeout(() => {
    // 清空全局用户信息
    setInitialState((s: any) => ({ ...s, currentUser: undefined }));
    // 跳转到登录页，携带回调地址
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }, 800);
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  // 菜单点击事件
  const onMenuClick = useCallback(
    async (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        await loginOut(setInitialState, currentUser);
        return;
      }
      // 个人中心、个人设置跳转
      history.push(`/account/${key}`);
    },
    [setInitialState, currentUser],
  );

  // 加载中占位
  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
    </span>
  );


  if (!initialState) {
    return loading;
  }

  // 菜单列表
  const menuItems: ItemType[] = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick} items={menuItems} />
  );

  // 未登录展示游客信息
  if (!currentUser) {
    return (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} icon={<UserOutlined />} alt="avatar" />
          <span className={`${styles.name} anticon`}>游客</span>
        </span>
      </HeaderDropdown>

    );
  }

  // 兼容多种后端用户名字段
  const userName = currentUser.userName || currentUser.username || '';
  const avatarUrl = currentUser.avatarUrl || currentUser.avatarurl;

  return (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        {avatarUrl ? (
          <Avatar size="small" className={styles.avatar} src={avatarUrl} alt="avatar" />
        ) : (
          <Avatar size="small" className={styles.avatar} icon={<UserOutlined />} alt="avatar" />
        )}
        <span className={`${styles.name} anticon`}>{userName}</span>
      </span>
    </HeaderDropdown>
  );
}
export default AvatarDropdown;
