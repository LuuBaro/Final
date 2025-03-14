import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Edit, Trash2, PlusCircle, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
} from '../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
  });
  const [editUser, setEditUser] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsFetching(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error.message);
        toast.error(error.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const userData = { ...newUser };
      const newUserData = await registerUser(userData);
      setUsers([newUserData, ...users]);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'USER' });
      setCurrentPage(1);
      toast.success('Người dùng đã được thêm!');
    } catch (error) {
      console.error('Lỗi khi thêm người dùng:', error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '', // Không điền sẵn mật khẩu
      phone: user.phone || '',
      role: user.role,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const userData = { ...newUser };
      if (!userData.password) delete userData.password; // Không gửi password nếu không thay đổi
      const updatedUserData = await updateUser(editUser.id, userData);
      setUsers(users.map((u) => (u.id === editUser.id ? updatedUserData : u)));
      setEditUser(null);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'USER' });
      toast.success('Người dùng đã được cập nhật!');
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Bạn có chắc muốn xóa người dùng này?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  await deleteUser(userId);
                  setUsers(users.filter((u) => u.id !== userId));
                  toast.success('Người dùng đã được xóa!');
                  toast.dismiss(t.id);
                } catch (error) {
                  toast.error(error.message);
                  toast.dismiss(t.id);
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Có
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Không
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (isFetching) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý người dùng</h2>

      {/* Form thêm/sửa người dùng */}
      <form
        onSubmit={editUser ? handleUpdateUser : handleAddUser}
        className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4"
      >
        <div className="md:col-span-1">
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Tên"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="md:col-span-1">
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Email"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="off" // Ngăn tự động điền email
            required
          />
        </div>
        <div className="md:col-span-1">
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder={editUser ? 'Mật khẩu mới (nếu thay đổi)' : 'Mật khẩu'}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="new-password" // Ngăn tự động điền mật khẩu
            required={!editUser} // Chỉ bắt buộc khi thêm mới
            key={editUser ? `edit-password-${editUser.id}` : 'new-password'} // Key động để reset input
          />
        </div>
        <div className="md:col-span-1">
          <input
            type="text"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            placeholder="Số điện thoại"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-1">
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="md:col-span-1 flex space-x-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h-8z"
                ></path>
              </svg>
            ) : editUser ? (
              <Edit className="w-5 h-5" />
            ) : (
              <PlusCircle className="w-5 h-5" />
            )}
            <span>{editUser ? 'Cập nhật' : 'Thêm'}</span>
          </button>
          {editUser && (
            <button
              type="button"
              onClick={() =>
                setNewUser({ name: '', email: '', password: '', phone: '', role: 'USER' }) &
                setEditUser(null)
              }
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Ô tìm kiếm */}
      <div className="mb-4 flex justify-between items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
          />
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3">ID</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone || 'N/A'}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={isProcessing}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Sau
        </button>
      </div>

      <Toaster />
    </motion.div>
  );
};

export default UserManagement;