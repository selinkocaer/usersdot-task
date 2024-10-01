import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserList from './components/UserList';
import Definition from './components/Definition';

function App() {
  return (
    <Router>
      <div>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#1890ff' }}>
    UsersDot Application
  </h1>        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/definition" element={<Definition />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
