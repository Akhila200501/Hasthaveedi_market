import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import '../styles/ShopPage.css';

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, fetchCartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartFeedback, setCartFeedback] = useState('');

  const craft = new URLSearchParams(location.search).get('craft');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = craft 
          ? `/api/products/craft/${encodeURIComponent(craft)}`
          : '/api/products';

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(data);
        setFiltered(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/products/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const wishlistData = await response.json();
          setWishlist(wishlistData.map(product => product._id));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [craft]);

  const toggleWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const isWishlisted = wishlist.includes(productId);
      const url = `/api/products/wishlist/${isWishlisted ? 'remove' : 'add'}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setWishlist(prev => 
          isWishlisted 
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        navigate('/auth');
        return;
      }

      const product = filteredProducts.find(p => p._id === productId) ||
                      products.find(p => p._id === productId);

      if (!product) {
        alert('Product not found');
        return;
      }

      // Explicit check — only block if explicitly false
      if (product.availability === false) {
        alert('This product is out of stock and cannot be added to cart');
        return;
      }

      // Use CartContext's addToCart — updates state AND calls the API
      await addToCart(productId, 1);
      await fetchCartItems(); // Refresh cart from server

      setCartFeedback('✅ Added to cart!');
      setTimeout(() => setCartFeedback(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart: ' + error.message);
    }
  };
  
  const handleBuyNow = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to proceed with checkout');
      navigate('/auth');
      return;
    }

    // Check both filtered and main products array
    let product = filteredProducts.find(p => p._id === productId) || 
                 products.find(p => p._id === productId);

    if (!product) {
      alert('Product not found');
      return;
    }

    // Strict availability check
    if (product.availability === false || product.availability === 'false') {
      alert('❗ This product is currently out of stock and cannot be purchased');
      return;
    }

    navigate('/checkout', { 
      state: { 
        directProduct: product,
        quantity: 1 
      } 
    });
  } catch (error) {
    console.error('Buy Now error:', error);
    alert(`Error: ${error.message}`);
  }
};

  return (
    <div className="shop-page">
      <header className="shop-header">
        <h1>CraftShop</h1>
        <nav>
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/orders')}>My Orders</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button onClick={() => navigate('/gift-assistant')}>Gift Assistant</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <h2>{craft ? `${craft} Products` : 'All Products'}</h2>

      {error && (
        <div className="error-message">
          Error loading products: {error}
        </div>
      )}

      {cartFeedback && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
          background: '#2ecc71', color: 'white', padding: '12px 24px',
          borderRadius: '8px', fontWeight: '600', fontSize: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {cartFeedback}
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const discountedPrice = product.price * (1 - (product.discount/100));
            return (
              <div key={product._id} className="product-card">
                  <img 
  src={product.imageUrl.startsWith('http') ? 
    product.imageUrl : 
    `${product.imageUrl}`
  }
  alt={product.name}
  onError={(e) => {
    e.target.onerror = null; 
    e.target.src = '/fallback-image.jpg';
  }}

                  onClick={() => setSelectedProduct(product)}
                />
                <div className="product-info">
                  <h3>{product.name || 'Unnamed Product'}</h3>
                  <p className="craft-type">{product.craft || 'Unknown Craft'}</p>
                  
                  <div className="price-container">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="discounted-price">
                          ₹{discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                        <span className="discount-badge">
                          {product.discount}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="price">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <p className={`availability ${product.availability ? 'in-stock' : 'out-of-stock'}`}>
                    {product.availability ? 'In Stock' : 'Out of Stock'}
                  </p>

                  <div className="product-actions">
                    <button 
                      className="buy-now" 
                      onClick={() => handleBuyNow(product._id)}
                      disabled={!product.availability}
                    >
                      Buy Now
                    </button>
                    <button 
                      className="add-to-cart" 
                      onClick={() => handleAddToCart(product._id)}
                      disabled={!product.availability}
                    >
                      Add to Cart
                    </button>
                    <FaHeart
                      className="wishlist-icon-inline"
                      color={wishlist.includes(product._id) ? 'red' : 'gray'}
                      size={30}
                      onClick={() => toggleWishlist(product._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-products-message">
            {loading ? 'Loading...' : 'No products found'}
          </p>
        )}
      </div>

      {selectedProduct && (
        <div className="product-modal">
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setSelectedProduct(null)}
            >
              &times;
            </button>
            <h3>{selectedProduct.name}</h3>
            <img 
              src={selectedProduct.imageUrl ? 
                `${selectedProduct.imageUrl}` : 
                '/fallback-image.jpg'}
              alt={selectedProduct.name}
              className="modal-image"
            />
            <p className="product-description">
              {selectedProduct.description || 'No description available'}
            </p>
            <p className="seller-contact">
              <strong>Contact Seller:</strong> {selectedProduct.sellerContact || 'Not provided'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;