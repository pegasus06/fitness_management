import React, { useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import { search } from '@/services/ant-design-pro/api';

const columns: ProColumns<API.CurrentUser>[] = [
  {
    dataIndex: 'id',
    valueType: 'indexBorder',
    width: 48,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    copyable: true,
    search: true,
  },
  {
    title: '用户账户',
    dataIndex: 'userAccount',
    copyable: true,
    search: false,
  },
  {
    title: '头像地址',
    dataIndex: 'avatarUrl',
    copyable: true,
    search:false
  },
  {
    title: '性别',
    dataIndex: 'gender',
    valueEnum: {
      0: { text: '未知' },
      1: { text: '男' },
      2: { text: '女' },
    },    search:false

  },
  {
    title: '电话',
    dataIndex: 'phone',
    copyable: true,    search:false

  },
  {
    title: '邮箱',
    dataIndex: 'email',
    copyable: true,    search:false

  },
  {
    title: '状态',
    dataIndex: 'userStatus',
    valueEnum: {
      0: { text: '正常', status: 'Success' },
      1: { text: '禁用', status: 'Error' },
    },    search:false

  },
  {
    title: '角色',
    dataIndex: 'userRole',
    valueEnum: {
      0: { text: '普通用户' },
      1: { text: '管理员', status: 'Warning' },
    },    search:false

  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
    hideInSearch: true,    search:false

  },
  // 注释时间区间，后端不支持，避免干扰
  // {
  //   title: '创建时间',
  //   dataIndex: 'createTime',
  //   valueType: 'dateRange',
  //   hideInTable: true,
  //   search: {
  //     transform: (value) => {
  //       if (!value || !Array.isArray(value)) return {};
  //       return {
  //         startTime: value[0],
  //         endTime: value[1],
  //       };
  //     },
  //   },
  // },
  {
    title: '操作',
    valueType: 'option',
    key: 'option',
    render: (_, record, __, action) => [
      <a
        key="edit"
        onClick={() => {
          message.info('编辑用户：' + record.username);
          action?.startEditable(record.id);
        }}
      >
        编辑
      </a>,
      <TableDropdown
        key="more"
        menus={[
          { key: 'delete', name: '删除', danger: true },
        ]}
        onSelect={async (key) => {
          if (key === 'delete') {
            message.success('删除成功');
            action?.reload();
          }
        }}
      />,
    ],
  },
];

export default () => {
  const actionRef = useRef<ActionType>();

  return (
    <ProTable<API.CurrentUser>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params = {}) => {
        console.log('表单params', params);
        const query: Record<string, string> = {};
        if (params.username?.trim()) {
          query.userName = params.username.trim();
        }
        const res = await search(query);
        console.log('传给后端', query);

        if (res.code !== 0) {
          message.error(res.message || '查询用户失败');
          return { data: [], success: false };
        }
        return {
          data: res.data || [],
          success: true,
        };
      }}
      editable={{
        type: 'multiple',
      }}
      columnsState={{
        persistenceKey: 'user-manage-table',
        persistenceType: 'localStorage',
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      // 关闭路由同步，解决地址栏有参数但接口不带的问题
      form={{
        syncToUrl: false,
      }}
      pagination={false}
      dateFormatter="string"
      headerTitle="用户管理"
      toolBarRender={() => [
        <Button key="add" icon={<PlusOutlined />} type="primary">
          新建用户
        </Button>,
      ]}
    />
  );
};