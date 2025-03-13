import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// User pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Demo from './pages/demo';

// Admin pages
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import OrderManagement from './pages/OrderManagement';
import ReportAnalytics from './pages/ReportAnalytics';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Các route có Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="orders" element={<Orders />} />
          <Route path="demo" element={<Demo />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Dashboard có Sidebar và Header */}
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

// Admin Layout
function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      <div
        className="flex-1  transition-all duration-300 overflow-y-auto"
        style={{ marginLeft: isSidebarCollapsed ? 64 : 256 }}
      >
        <Header />
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reports" element={<ReportAnalytics />} />
          <Route path="users" element={<div>Quản lý người dùng</div>} />
          <Route path="settings" element={<div>Cài đặt</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;