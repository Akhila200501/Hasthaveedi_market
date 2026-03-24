import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SellerPage.css';
import { useNavigate } from 'react-router-dom';


const craftNames = [
  "Ajrakh Block Printing", "Apatani Weaving", "Aranmula Kannadi", "Bandhani",
  "Banarasi Silk Sarees", "Bastar Iron Craft", "Blue Pottery", "Chamba Rumal",
  "Chanderi Sarees", "Chikankari", "Coir Products", "Dharmavaram Silk Sarees",
  "Gadwal Sarees", "Gollabhama Sarees", "Godna Art", "Kantha Stitch", "Kondapalli Toys",
  "Kondagaon", "Madhubani Painting", "Maheshwari Sarees", "Manipuri Dance Costumes",
  "Mangalagiri Sarees", "Muga Silk Weaving", "Naga Shawls", "Nirmal Paintings", "Pattachitra",
  "Pashmina Shawls", "Pembarthi Brassware", "Phad Painting", "Phulkari Embroidery", "Pochampally sarees",
  "Risa and Rignai Weaving", "Shell Craft", "Tanjore Paintings", "Terracotta Craft", "Thangka Paintings",
  "Uppada Jamdani Sarees", "Venkatagiri Sarees", "Warli Painting"
];

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    craft: '',
    availability: true,
    imageUrl: '',
    description: '',
    sellerContact: ''
  });

  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [editProductData, setEditProductData] = useState({ 
    availability: true, 
    discount: 0,
    description: '',
    sellerContact: ''
  });

  // Safe product fetching with error handling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await axios.get(
          '/api/products/my-products',
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );

        const safeProducts = (response.data?.products || []).map(product => ({
          _id: product?._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          name: product?.name || 'Unnamed Product',
          price: product?.price || 0,
          craft: product?.craft || 'Unknown Craft',
          imageUrl: product?.imageUrl || '',
          availability: Boolean(product?.availability),
          discount: Math.max(0, Math.min(100, product?.discount || 0))
        })).filter(Boolean);

        setProducts(safeProducts);
      } catch (error) {
        console.error('Product fetch error:', error);
        alert('Failed to load products. Please try again later.');
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth', { replace: true });  // Proper React Router navigation
  };

  // Image upload handler with error handling
  const handleImageChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
  
      // Add file size validation (recommended)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size too large (max 5MB)');
        return;
      }
  
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await axios.post(
        '/api/products/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 10000 // Add timeout
        }
      );
  
      // Verify response structure
      if (!response.data?.imageUrl) {
        throw new Error('Invalid response from server');
      }
  
      setNewProduct(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl 
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(error.message || 'Image upload failed. Please try again.');
      // Reset file input on error
      e.target.value = '';
    }
  };

  // Product submission handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
  
      // Add frontend validation
      if (!newProduct.imageUrl) {
        throw new Error('Please upload an image first');
      }
  
      const productToAdd = {
        ...newProduct,
        price: Math.max(0, parseFloat(newProduct.price) || 0), // Prevent negative prices
        craft: newProduct.craft.trim(),
        availability: Boolean(newProduct.availability)
      };
  
      const response = await axios.post(
        '/api/products/add',
        productToAdd,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // Add timeout
        }
      );
  
      // Verify successful response
      if (!response.data?.product?._id) {
        throw new Error('Failed to get product ID from response');
      }
  
      setProducts(prev => [...prev, response.data.product]);
      
      setNewProduct({
        name: '',
        price: '',
        craft: '',
        availability: true,
        imageUrl: ''
      });
      
      setShowAddForm(false);
      alert('Product added successfully!');
    } catch (error) {
      console.error('Add product error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to add product';
      alert(errorMessage);
    }
  };

  // Product deletion handler
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(prev => prev.filter(p => p._id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  };

  // Product update handler
  const handleUpdateProduct = async (productId, updates) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, ...response.data.product } : p
      ));
      setEditProductId(null);
      alert('Product updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update product');
    }
  };

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <div className="header-actions">
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
          aria-label="Add new product"
        >
          Add Product +
        </button>
        <button 
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
        </button>
      </div>
      </div>
      <div className="products-container">
        <h2>Existing Products ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="empty-state">
            <p style={{ color: 'red' }}>No products found. Start by adding your first product!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.imageUrl ? (
                    <img 
                    src={product.imageUrl.startsWith('http') ? 
                      product.imageUrl : 
                      `http://localhost:5000${product.imageUrl}`
                    }
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/fallback-image.jpg';
                    }}
                  />
                  ) : (
                    <div className="image-placeholder">
                      <span>No Image Available</span>
                    </div>
                  )}
                </div>
                
                <div className="product-details">
                  <h3>{product.name || 'Unnamed Product'}</h3>
                  <p className="craft-type">{product.craft || 'Unknown Craft'}</p>
                  <p className="price">
  {product.discount > 0 ? (
    <>
      <span className="original-price">
        ₹{(product.price || 0).toLocaleString('en-IN')}
      </span>
      <span className="discounted-price">
      {'\u20B9'}{((product.price || 0) * (1 - (product.discount/100))).toLocaleString('en-IN')}
      </span>
      <span className="discount-badge">
        {product.discount}% OFF
      </span>
    </>
  ) : (
    <span>
    {'\u20B9'}{(product.price || 0).toLocaleString('en-IN')}
    </span>
  )}
</p>

                  {editProductId === product._id ? (
                    <div className="edit-form">
 <label>
    Product Name:
    <input
      type="text"
      value={editProductData.name || product.name}
      onChange={e => setEditProductData(prev => ({
        ...prev,
        name: e.target.value
      }))}
      required
    />
  </label>
  
  <label>
    Price (₹):
    <input
      type="number"
      value={editProductData.price || product.price}
      onChange={e => setEditProductData(prev => ({
        ...prev,
        price: e.target.value
      }))}
      min="0"
      step="0.01"
      required
    />
  </label>
                      <label>
                        Availability:
                        <select
                          value={editProductData.availability.toString()}
                          onChange={e => setEditProductData(prev => ({
                            ...prev,
                            availability: e.target.value === 'true'
                          }))}
                        >
                          <option value="true">Available</option>
                          <option value="false">Out of Stock</option>
                        </select>
                      </label>
                      
                      <label>
                        Discount (%):
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editProductData.discount}
                          onChange={e => setEditProductData(prev => ({
                            ...prev,
                            discount: Math.max(0, Math.min(100, Number(e.target.value)))
                          }))}
                        />
                      </label>

                      <div className="edit-actions">
                        <button
                          className="save-btn"
                          onClick={() => handleUpdateProduct(product._id, {
                            name: editProductData.name || product.name,
                            price: editProductData.price || product.price,
                            availability: editProductData.availability,
                            discount: editProductData.discount
                          })}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditProductId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`availability ${product.availability ? 'in-stock' : 'out-of-stock'}`}>
                        {product.availability ? 'In Stock' : 'Out of Stock'}
                      </p>
                      <div className="product-actions">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditProductId(product._id);
                            setEditProductData({
                              availability: product.availability,
                              discount: product.discount || 0
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-product-modal">
            <button 
              className="close-modal"
              onClick={() => setShowAddForm(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            
            <h2>Add New Product</h2>
            
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={e => setNewProduct(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                  minLength="2"
                  maxLength="100"
                />
              </div>
              
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct(prev => ({
                    ...prev,
                    price: e.target.value
                  }))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Craft Type *</label>
                <select
                  value={newProduct.craft}
                  onChange={e => setNewProduct(prev => ({
                    ...prev,
                    craft: e.target.value
                  }))}
                  required
                >
                  <option value="">Select Craft Type</option>
                  {craftNames.map((craft, index) => (
                    <option key={index} value={craft}>
                      {craft}
                    </option>
                  ))}
                </select>
              </div>
              
            <div className="form-group">
              <label htmlFor="product-image">Product Image *</label>
              <div className="file-input-container">
                <label className="file-input-label">
                📁 <span>Click to upload or drag and drop</span>
                
                <input
                  type="file"
                  id="product-image"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
                </label>
              </div>
                {newProduct.imageUrl && (
                  <div className="image-preview-container">
                  <img 
                    src={newProduct.imageUrl} 
                    alt="Preview" 
                    className="image-preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${process.env.PUBLIC_URL}/fallback-image.jpg`;
                    }}
                  />
                  </div>
                )}
              </div>
              
              <button type="submit" className="submit-btn">
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;