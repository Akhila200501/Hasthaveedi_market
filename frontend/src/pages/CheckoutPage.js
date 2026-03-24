import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import PayPalMock from '../components/PayPalMock';
import CreditCardMock from '../components/CreditCardMock';
import CashOnDeliveryConfirmation from '../components/CashOnDeliveryConfirmation';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const paymentMethods = [
    { id: 'PayPal', label: 'PayPal', icon: 'fab fa-paypal' },
    { id: 'CreditCard', label: 'Credit Card', icon: 'far fa-credit-card' },
    { id: 'CashOnDelivery', label: 'Cash on Delivery', icon: 'fas fa-money-bill-wave' }
  ];

  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null);
  const { cartItems, clearCart } = useCart();

  useEffect(() => {
    if (locationState?.directProduct) {
      setDirectCheckoutItem({
        productId: locationState.directProduct,
        quantity: locationState.quantity || 1
      });
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [locationState, cartItems, navigate]);

  const cartItemsToUse = directCheckoutItem ? [directCheckoutItem] : cartItems;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!shippingAddress.phone.trim() || !/^\d{10}$/.test(shippingAddress.phone)) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const orderItems = cartItemsToUse.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        discount: item.productId.discount
      }));

      const data = {
        shippingAddress,
        paymentMethod,
        items: orderItems,
        totalAmount: calculateTotal()
      };

      setOrderData(data);
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors(prev => ({
        ...prev,
        submitError: error.message || 'Checkout failed. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult, pendingOrderData = orderData) => {
    try {
      setIsPaymentProcessing(true);
      const token = localStorage.getItem('token');
      if (!pendingOrderData) {
        throw new Error('Order data is not set. Please retry checkout.');
      }
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...pendingOrderData,
          paymentStatus: paymentResult.status
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to place order');
      }

      await clearCart();
      setShowPaymentModal(false);
      
      navigate('/order-confirmation', { 
        state: { 
          order: data.order,
          paymentMethod: orderData.paymentMethod 
        } 
      });
      
    } catch (error) {
      console.error('Order creation error:', error);
      setErrors(prev => ({
        ...prev,
        submitError: error.message || 'Order creation failed after payment.'
      }));
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItemsToUse.reduce((total, item) => {
      const discountedPrice = item.productId.price * (1 - (item.productId.discount / 100));
      return total + (discountedPrice * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className="step active">1. Shipping</div>
          <div className={`step ${showPaymentModal ? 'active' : ''}`}>2. Payment</div>
          <div className="step">3. Confirmation</div>
        </div>
      </div>
      
      {errors.submitError && (
        <div className="alert alert-danger">
          {errors.submitError}
        </div>
      )}
      
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <section className="form-section">
            <h2>Shipping Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label>Address Line 1 <span className="required">*</span></label>
              <input
                type="text"
                name="addressLine1"
                value={shippingAddress.addressLine1}
                onChange={handleChange}
                className={errors.addressLine1 ? 'error' : ''}
              />
              {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
            </div>
            
            <div className="form-group">
              <label>Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                value={shippingAddress.addressLine2}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City <span className="required">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
              
              <div className="form-group">
                <label>State <span className="required">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Postal Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  className={errors.postalCode ? 'error' : ''}
                />
                {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <select
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleChange}
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </section>
          
          <section className="payment-section">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <div 
                  key={method.id} 
                  className={`payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <i className={method.icon}></i>
                  <span>{method.label}</span>
                </div>
              ))}
            </div>
          </section>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-back"
              onClick={() => navigate(directCheckoutItem ? '/shop' : '/cart')}
            >
              {directCheckoutItem ? 'Back to Shop' : 'Back to Cart'}
            </button>
            <button 
              type="submit" 
              className="btn-continue"
              disabled={isSubmitting || cartItemsToUse.length === 0}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </>
              ) : 'Continue to Payment'}
            </button>
          </div>
        </form>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItemsToUse.map(item => {
              const discountedPrice = item.productId.price * (1 - (item.productId.discount / 100));
              
              return (
                <div key={item.productId._id} className="order-item">
                  <div className="item-image-container">
                    <img 
                      src={item.productId.imageUrl ? 
                        `${item.productId.imageUrl}` : 
                        '/fallback-image.jpg'}
                      alt={item.productId.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/fallback-image.jpg';
                      }}
                    />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.productId.name}</h4>
                    <div className="item-price">
                      {item.productId.discount > 0 && (
                        <span className="original-price">
                          ₹{item.productId.price.toFixed(2)}
                        </span>
                      )}
                      <span className="discounted-price">
                        ₹{discountedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="total-row">
              <span>Tax</span>
              <span>₹0.00</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-content">
              <button 
                className="close-modal"
                onClick={() => setShowPaymentModal(false)}
              >
                &times;
              </button>
              
              {paymentMethod === 'PayPal' && (
                <PayPalMock 
                  amount={parseFloat(orderData.totalAmount)}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPaymentModal(false)}
                />
              )}
              
              {paymentMethod === 'CreditCard' && (
                <CreditCardMock 
                  amount={parseFloat(orderData.totalAmount)}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPaymentModal(false)}
                />
              )}
              
              {paymentMethod === 'CashOnDelivery' && (
                <CashOnDeliveryConfirmation 
                  amount={parseFloat(orderData?.totalAmount || 0)}
                  onConfirm={(paymentResult) => handlePaymentSuccess(paymentResult, orderData)}
                  onCancel={() => setShowPaymentModal(false)}
                  isProcessing={isPaymentProcessing}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;