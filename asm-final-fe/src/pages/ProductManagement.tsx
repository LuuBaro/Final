// src/components/ProductManagement.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Edit, Trash2, PlusCircle, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '../firebaseConfig';
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct } from '../services/productService';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
    imageFile: null,
  });
  const [editProduct, setEditProduct] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const productsPerPage = 5;

  // Lấy danh sách sản phẩm và loại sản phẩm khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error.message);
        toast.error(error.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  // Xử lý thay đổi file
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct((prev) => ({
        ...prev,
        imageFile: file,
      }));
    }
  };

  // Upload hình ảnh lên Firebase và lấy URL
  const uploadImageToFirebase = async (file) => {
    const storageRef = ref(storage, `images/${file.name}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Lỗi khi upload lên Firebase:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at:', downloadURL);
          resolve(downloadURL);
        }
      );
    });
  };

  // Thêm sản phẩm mới
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      let imageUrl = '';
      if (newProduct.imageFile) {
        imageUrl = await uploadImageToFirebase(newProduct.imageFile);
      }

      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: {
          id: newProduct.categoryId,
        },
        imageUrl,
      };

      console.log('Product data gửi đi:', productData);

      const newProductData = await addProduct(productData);

      const selectedCategory = categories.find((cat) => cat.id === newProduct.categoryId);
      const newProductWithCategory = {
        ...newProductData,
        category: selectedCategory || { id: newProduct.categoryId, name: 'N/A' },
      };

      // Thêm sản phẩm mới vào đầu danh sách và đặt lại trang về 1
      setProducts([newProductWithCategory, ...products]);
      setNewProduct({ name: '', price: '', stock: '', categoryId: '', imageUrl: '', imageFile: null });
      setCurrentPage(1); // Đặt lại trang về 1 để hiển thị sản phẩm mới ở đầu
      toast.success('Sản phẩm đã được thêm!');
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.category.id,
      imageUrl: product.imageUrl || '',
      imageFile: null,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      let imageUrl = newProduct.imageUrl;
      if (newProduct.imageFile) {
        imageUrl = await uploadImageToFirebase(newProduct.imageFile);
      }

      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: {
          id: newProduct.categoryId,
        },
        imageUrl,
      };

      console.log('Product data gửi đi:', productData);

      const updatedProductData = await updateProduct(editProduct.id, productData);

      const selectedCategory = categories.find((cat) => cat.id === newProduct.categoryId);
      const updatedProductWithCategory = {
        ...updatedProductData,
        category: selectedCategory || { id: newProduct.categoryId, name: 'N/A' },
      };

      setProducts(products.map((p) => (p.id === editProduct.id ? updatedProductWithCategory : p)));
      setEditProduct(null);
      setNewProduct({ name: '', price: '', stock: '', categoryId: '', imageUrl: '', imageFile: null });
      toast.success('Sản phẩm đã được cập nhật!');
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    toast.promise(
      new Promise(async (resolve, reject) => {
        const confirmDelete = await new Promise((res) => {
          toast(
            (t) => (
              <div className="flex flex-col items-center">
                <p className="text-gray-800">Bạn có chắc muốn xóa sản phẩm này?</p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      res(true);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      res(false);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ),
            { duration: 5000 }
          );
        });
  
        if (confirmDelete) {
          try {
            setIsProcessing(true);
            await deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
            resolve("Sản phẩm đã bị xóa!");
          } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error.message);
            reject(error.message || "Lỗi khi xóa sản phẩm!");
          } finally {
            setIsProcessing(false);
          }
        } else {
          reject("Hủy xóa sản phẩm!");
        }
      }),
      
    );
  };
  

  // Tìm kiếm sản phẩm
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sắp xếp sản phẩm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'price') {
      return sortConfig.direction === 'asc'
        ? a.price - b.price
        : b.price - a.price;
    }
    if (sortConfig.key === 'stock') {
      return sortConfig.direction === 'asc'
        ? a.stock - b.stock
        : b.stock - a.stock;
    }
    return 0;
  });

  // Phân trang
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Xử lý sắp xếp
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  if (isFetching) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý sản phẩm</h2>

      <form
        onSubmit={editProduct ? handleUpdateProduct : handleAddProduct}
        className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 relative"
      >
        <div className="md:col-span-2">
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="Tên sản phẩm"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-full truncate"
            required
          />
        </div>
        <div className="md:col-span-1">
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            placeholder="Giá"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-full"
            required
            min="0"
          />
        </div>
        <div className="md:col-span-1">
          <input
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            placeholder="Số lượng"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-full"
            required
            min="0"
          />
        </div>
        <div className="md:col-span-1">
          <select
            value={newProduct.categoryId}
            onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-full"
            required
          >
            <option value="">Chọn loại sản phẩm</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-lg max-w-full"
          />
        </div>
        <div className="md:col-span-1 flex space-x-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors relative"
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
            ) : editProduct ? (
              <Edit className="w-5 h-5" />
            ) : (
              <PlusCircle className="w-5 h-5" />
            )}
            <span className="w-full">{editProduct ? 'Cập nhật' : 'Thêm'}</span>
          </button>
          {editProduct && (
            <button
              type="button"
              onClick={() => {
                setEditProduct(null);
                setNewProduct({ name: '', price: '', stock: '', categoryId: '', imageUrl: '', imageFile: null });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="mb-4 flex justify-between items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
          />
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      <div className="overflow-x-auto relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
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
          </div>
        )}
        <table className="w-full text-left">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3">Hình ảnh</th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('name')}>
                Tên {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('price')}>
                Giá {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('stock')}>
                Số lượng {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3">Loại</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </td>
                <td className="p-3 truncate max-w-xs">{product.name}</td>
                <td className="p-3">{product.price} VNĐ</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">{product.category?.name || 'N/A'}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={isProcessing}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
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

export default ProductManagement;