import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, message, Row, Col, Card } from 'antd'; 
import { useNavigate } from 'react-router-dom'; 
import './Definition.css'; 

const Definition = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    country: '',
    district: '',
    role: '',
  });
  
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('http://localhost:3000/users', values); 
      console.log('Kullanıcı başarıyla eklendi:', response.data);
      
     
      navigate('/'); 

   
      setFormData({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        country: '',
        district: '',
        role: '',
      });
      message.success('Kullanıcı başarıyla eklendi!');
    } catch (error) {
      console.error('Hata:', error);
      message.error('Kullanıcı eklenirken hata oluştu.'); 
    }
  };

  return (
    <div className="definition-container">
      <h2>Yeni Kullanıcı Ekle</h2>
      <Card style={{ width: '100%', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Form layout="vertical" onFinish={handleSubmit} className="definition-form">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Ad" rules={[{ required: true }]}>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="surname" label="Soyad" rules={[{ required: true }]}>
                <Input name="surname" value={formData.surname} onChange={handleChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="E-posta" rules={[{ required: true, type: 'email' }]}>
                <Input name="email" value={formData.email} onChange={handleChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="password" label="Şifre" rules={[{ required: true }]}>
                <Input.Password name="password" value={formData.password} onChange={handleChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="age" label="Yaş" rules={[{ required: true }]}>
                <Input type="number" name="age" value={formData.age} onChange={handleChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="country" label="Ülke" rules={[{ required: true }]}>
                <Input name="country" value={formData.country} onChange={handleChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="district" label="Semt" rules={[{ required: true }]}>
                <Input name="district" value={formData.district} onChange={handleChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Rol" rules={[{ required: true }]}>
                <Input name="role" value={formData.role} onChange={handleChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Button 
                style={{ width: '100%' }} 
                onClick={() => navigate('/')}
              >
                Geri
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Kullanıcı Ekle
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default Definition;
