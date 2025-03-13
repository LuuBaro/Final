import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Edit, Trash2, X } from "lucide-react";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

const API_URL = "http://localhost:8080/api/categories";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách loại sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      if (editCategory) {
        const response = await axios.put(`${API_URL}/${editCategory.id}`, newCategory);
        setCategories(categories.map((c) => (c.id === editCategory.id ? response.data : c)));
        toast.success("Cập nhật thành công!");
      } else {
        const response = await axios.post(API_URL, newCategory);
        setCategories([...categories, response.data]);
        toast.success("Thêm loại sản phẩm thành công!");
      }
      resetForm();
    } catch (error) {
      toast.error("Lỗi khi xử lý yêu cầu!");
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setNewCategory({ name: category.name, description: category.description });
  };

  const handleDeleteCategory = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center">
          <p className="text-gray-800">Bạn có chắc muốn xóa loại sản phẩm này?</p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`${API_URL}/${id}`);
                  setCategories(categories.filter((c) => c.id !== id));
                  toast.success("Đã xóa loại sản phẩm!");
                } catch (error) {
                  toast.error("Lỗi khi xóa loại sản phẩm!");
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Xóa
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };
  

  const resetForm = () => {
    setNewCategory({ name: "", description: "" });
    setEditCategory(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý loại sản phẩm</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          name="name"
          value={newCategory.name}
          onChange={handleChange}
          placeholder="Tên loại sản phẩm"
          className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="text"
          name="description"
          value={newCategory.description}
          onChange={handleChange}
          placeholder="Mô tả sản phẩm"
          className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          {editCategory ? "Cập nhật" : "Thêm"}
        </button>
        {editCategory && (
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <span className="w-10 h-5 flex items-center justify-center" > Hủy </span>
          </button>
        )}
      </form>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-indigo-600 text-white">
            <th className="p-3">Tên loại</th>
            <th className="p-3">Mô tả</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <motion.tr key={category.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{category.name}</td>
              <td className="p-3">{category.description}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="bg-blue-500 text-white p-2 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="bg-red-500 text-white p-2 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <Toaster />
    </motion.div>
  );
};

export default CategoryManagement;
