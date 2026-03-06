import React from 'react';

const products = [
  { id: 1, name: 'iPhone 15 Pro', category: 'Điện thoại', price: 28990000, stock: 45, image: '📱' },
  { id: 2, name: 'MacBook Air M3', category: 'Laptop', price: 32990000, stock: 20, image: '💻' },
  { id: 3, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6490000, stock: 120, image: '🎧' },
  { id: 4, name: 'iPad Pro M4', category: 'Máy tính bảng', price: 33990000, stock: 15, image: '📟' },
  { id: 5, name: 'Apple Watch Ultra 2', category: 'Đồng hồ', price: 21990000, stock: 30, image: '⌚' },
  { id: 6, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22990000, stock: 55, image: '📱' },
  { id: 7, name: 'Sony WH-1000XM5', category: 'Phụ kiện', price: 8490000, stock: 40, image: '🎧' },
  { id: 8, name: 'Dell XPS 15', category: 'Laptop', price: 42990000, stock: 10, image: '💻' },
];

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' ₫';
}

function ProductList() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách sản phẩm</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {products.length} sản phẩm
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" key={product.id}>
            <div className="p-6 text-center">
              <div className="text-5xl mb-4">{product.image}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{product.category}</span>
                <p className="text-xl font-bold text-green-600 mt-3">{formatPrice(product.price)}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.stock > 20 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.stock > 20 ? 'Còn hàng' : 'Sắp hết'}
                  </span>
                  <span className="text-xs text-gray-500">{product.stock} sản phẩm</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
}

export default ProductList;
