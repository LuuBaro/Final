export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Áo Thun Basic Đen",
    price: 199000,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "ao"
  },
  {
    id: 2,
    name: "Quần Jean Slim Fit",
    price: 459000,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "quan"
  },
  {
    id: 3,
    name: "Áo Khoác Bomber",
    price: 699000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "ao"
  },
  {
    id: 4,
    name: "Áo Sơ Mi Trắng",
    price: 359000,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "ao"
  },
  {
    id: 5,
    name: "Quần Kaki Nam",
    price: 399000,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "quan"
  },
  {
    id: 6,
    name: "Áo Polo Basic",
    price: 299000,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "ao"
  },
  {
    id: 7,
    name: "Quần Short Thể Thao",
    price: 259000,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "quan"
  },
  {
    id: 8,
    name: "Áo Thun Graphic",
    price: 259000,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "ao"
  }
];

export const categories = [
  {
    id: "ao",
    title: "Áo",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "quan",
    title: "Quần",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ao-khoac",
    title: "Áo Khoác",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "phu-kien",
    title: "Phụ Kiện",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];