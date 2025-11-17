'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, Row, Col, Statistic, Avatar, List, Button, Space, Tag, Spin } from 'antd';
import { 
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  RiseOutlined,
  CalendarOutlined,
  TeamOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ArrowUpOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  const stats = [
    {
      title: 'Tổng nhân viên',
      value: 248,
      prefix: <UserOutlined />,
      suffix: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
      valueStyle: { color: '#3f8600' },
      change: '+12%',
    },
    {
      title: 'Dự án đang chạy',
      value: 32,
      prefix: <ProjectOutlined />,
      suffix: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
      valueStyle: { color: '#722ed1' },
      change: '+5%',
    },
    {
      title: 'Tổng lương tháng',
      value: '2.4B',
      prefix: '₫',
      suffix: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
      valueStyle: { color: '#cf1322' },
      change: '+8%',
    },
    {
      title: 'Hiệu suất',
      value: 94,
      suffix: '%',
      prefix: <RiseOutlined />,
      valueStyle: { color: '#fa8c16' },
      change: '+2%',
    },
  ];

  const activities = [
    {
      title: 'Nguyễn Văn A đã hoàn thành task "Thiết kế giao diện"',
      time: '2 giờ trước',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    },
    {
      title: 'Trần Thị B đã tạo dự án mới "Website E-commerce"',
      time: '3 giờ trước',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
    },
    {
      title: 'Lê Văn C đã cập nhật tiến độ sprint #12',
      time: '5 giờ trước',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
    },
    {
      title: 'Phạm Thị D đã yêu cầu nghỉ phép',
      time: '1 ngày trước',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4',
    },
  ];

  // Loading state
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  const displayName = user?.full_name || user?.username || 'Người dùng';
  const roleName = user?.roles?.[0]?.name || 'Nhân viên';

  return (
    <div style={{ padding: 24 }}>
      {/* Welcome Card */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          border: 'none',
        }}
      >
        <Space direction="vertical" size={8}>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 'bold', margin: 0 }}>
            Xin chào, {displayName}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Chào mừng bạn quay trở lại với hệ thống quản lý - {roleName}
          </p>
          <Space style={{ marginTop: 12 }}>
            <Tag color="blue" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}>
              @{user?.username}
            </Tag>
            {user?.employee_code && (
              <Tag color="purple" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}>
                {user.employee_code}
              </Tag>
            )}
          </Space>
        </Space>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle}
              />
              <Tag color="success" style={{ marginTop: 8 }}>
                {stat.change}
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Content Row */}
      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <Card
            title="Hoạt động gần đây"
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={item.title}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card title="Thao tác nhanh">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Button
                type="dashed"
                icon={<TeamOutlined />}
                block
                size="large"
              >
                Thêm nhân viên
              </Button>
              <Button
                type="dashed"
                icon={<FolderOpenOutlined />}
                block
                size="large"
              >
                Tạo dự án mới
              </Button>
              <Button
                type="dashed"
                icon={<CalendarOutlined />}
                block
                size="large"
              >
                Điểm danh
              </Button>
              <Button
                type="dashed"
                icon={<CheckCircleOutlined />}
                block
                size="large"
              >
                Tạo yêu cầu
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}