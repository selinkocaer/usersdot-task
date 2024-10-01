import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, message, Card, Pagination, Spin } from 'antd'; 
import { useNavigate } from 'react-router-dom'; 
import { DeleteOutlined } from '@ant-design/icons'; 
import debounce from 'lodash/debounce'; 
import './UserList.css'; 

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalUsers, setTotalUsers] = useState(0); 
  const PAGE_SIZE = 5; 
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]); 

  const fetchUsers = async () => {
    try {
      setLoading(true); 
      const response = await axios.get(`http://localhost:3000/users?page=${currentPage}&limit=${PAGE_SIZE}&query=${searchTerm}`);
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); 
    }
  };

  const handleSearch = debounce((value) => {
    setCurrentPage(1); 
    setSearchTerm(value); 
  },); 

  
  const onSearchTermChange = (e) => {
    const value = e.target.value;
    handleSearch(value); 
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: 'Sil',
      content: 'Bu kullanıcıyı silmek istediğinize emin misiniz?',
      okText: 'Evet',
      okType: 'danger',
      cancelText: 'Hayır',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/users/${userId}`);
          message.success('Kullanıcı başarıyla silindi!');
          fetchUsers(); 
        } catch (error) {
          message.error('Silme sırasında bir hata oluştu.');
        }
      },
    });
  };

  const handleOk = async (values) => {
    try {
      const sanitizedValues = {
        name: values.name ?? null,
        surname: values.surname ?? null,
        email: values.email ?? null,
        phone: values.phone ?? null,
        age: values.age ?? null,
        country: values.country ?? null,
        district: values.district ?? null,
        role: values.role ?? null,
      };
  
      await axios.put(`http://localhost:3000/users/${editingUser.id}`, sanitizedValues);
      message.success('Kullanıcı başarıyla güncellendi!');
      handleCancel();
      fetchUsers(); 
    } catch (error) {
      console.error('Güncelleme hatası:', error.response ? error.response.data : error.message);
      message.error('Güncelleme sırasında bir hata oluştu.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Ad', dataIndex: 'name', key: 'name' },
    { title: 'Soyad', dataIndex: 'surname', key: 'surname' },
    {
      title: 'Aksiyon',
      key: 'action',
      render: (text, user) => (
        <>
          <Button onClick={() => showEditModal(user)}>Düzenle</Button>
          <Button 
            type="danger" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(user.id)}
            style={{ marginLeft: 8 }}
          >
            Sil
          </Button>
        </>
      ),
    },
  ];

  if (error) return <div>Error: {error}</div>;

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE); 

  return (
    <div className="user-list-container">
      <h2>Kullanıcı Listesi</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Input 
          placeholder="Ara (Ad veya Soyad)"
          value={searchTerm}
          onChange={onSearchTermChange}
          style={{ width: '300px' }} 
        />
        <Button 
          type="primary" 
          onClick={() => navigate('/definition')} 
          style={{ marginLeft: 'auto' }} 
        >
          Kullanıcı Ekle
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Card className="user-table-card" bordered={false} style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%' }}>
          {loading ? <Spin /> : <Table dataSource={users} columns={columns} rowKey="id" pagination={false} />} {/* Disable built-in pagination */}
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <span>Toplam Kullanıcı: {totalUsers} | Toplam Sayfa: {totalPages}</span>
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={totalUsers}
          onChange={(page) => setCurrentPage(page)} 
          style={{ textAlign: 'right' }} 
        />
      </div>

      <Modal
        title="Kullanıcıyı Düzenle"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        style={{ top: '10%' }}
      >
        <Form
          initialValues={editingUser}
          onFinish={handleOk}
          layout="vertical"
        >
          <Form.Item name="name" label="Ad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="surname" label="Soyad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-posta" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label="Yaş" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="country" label="Ülke" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="district" label="Semt" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Rol" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Güncelle
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
