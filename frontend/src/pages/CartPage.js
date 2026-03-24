import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/CartPage.css';

const CartPage = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart,
    loading,
    error
  } = useCart();
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.productId.price * (1 - (item.productId.discount / 100));
      return total + (discountedPrice * item.quantity);
    }, 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h1>CraftShop</h1>
        <nav>
          <button onClick={() => navigate(-1)} className="back-button"> &larr; Back </button>
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/orders')}>My Orders</button>
          <button onClick={() => navigate('/auth')} className="logout">Logout</button>
        </nav>
      </header>

      <h2>Your Shopping Cart</h2>

      {error && (
        <div className="error-message">
          Error loading cart: {error}
        </div>
      )}

      <div className="cart-container">
        {loading ? (
          <p>Loading your cart...</p>
        ) : cartItems.length > 0 ? (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const product = item.productId;
                const discountedPrice = product.price * (1 - (product.discount / 100));
                
                return (
                  <div key={product._id} className="cart-item">
                    <img src={`${process.env.REACT_APP_API_URL || ''}${product.imageUrl}`} 
                      alt={product.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{product.name}</h3>
                      <p className="craft-type">{product.craft}</p>
                      
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

                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button 
                        className="remove-item"
                        onClick={() => removeFromCart(product._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <button 
                className="checkout-button"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/map')}>Explore Crafts</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;