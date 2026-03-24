import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingStepper from '../components/TrackingStepper';
import '../styles/OrderDetailsPage.css';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancelling(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      setOrder(data.order);
      alert('Order cancelled successfully');
    } catch (err) {
      alert(`Error cancelling order: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Shipped':
        return 'status-shipped';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Processing':
        return 'status-processing';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!order) {
    return <div className="not-found">Order not found</div>;
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      const data = await response.json();
      setOrder(data.order);
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status Update Error:', err);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-details-page">
      <button 
        onClick={() => navigate(-1)}
        className="back-button"
      >
        &larr; Back to Orders
      </button>
      
      <div className="order-header">
      <TrackingStepper status={order.status} onStatusChange={handleStatusChange} />
        <h2>Order #{order._id.substring(0, 8)}</h2>
        <div className="order-meta">
          <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
          <span className={`status-badge ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>
      
      <div className="order-sections">
        <div className="order-section">
          <h3>Order Items</h3>
          <div className="order-items">
            {order.items.map(item => {
              const discountedPrice = item.priceAtPurchase * (1 - (item.discountAtPurchase / 100));
              const totalPrice = discountedPrice * item.quantity;
              
              return (
                <div key={item.productId._id} className="order-item">
                  <img 
                    src={item.productId.imageUrl?.startsWith('http') ? item.productId.imageUrl : `${item.productId.imageUrl}`}
                    alt={item.productId.name} 
                    className="item-image"
                    onError={(e) => { e.target.src = '/fallback-image.jpg'; }}
                  />
                  <div className="item-details">
                    <h4>{item.productId.name}</h4>
                    <p className="item-craft">{item.productId.craft}</p>
                    <div className="item-price">
                      {item.discountAtPurchase > 0 ? (
                        <>
                          <span className="original-price">
                            ₹{item.priceAtPurchase.toFixed(2)}
                          </span>
                          <span className="discounted-price">
                            ₹{discountedPrice.toFixed(2)}
                          </span>
                          <span className="discount-badge">
                            {item.discountAtPurchase}% OFF
                          </span>
                        </>
                      ) : (
                        <span>₹{item.priceAtPurchase.toFixed(2)}</span>
                      )}
                    </div>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                    <p className="item-total">Total: ₹{totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="order-section">
          <h3>Shipping Information</h3>
          <div className="shipping-info">
            <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
            <p><strong>Address:</strong> {order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
          </div>
        </div>
        
        <div className="order-section">
          <h3>Payment Information</h3>
          <div className="payment-info">
            <p><strong>Method:</strong> {order.payment.method}</p>
            <p><strong>Status:</strong> 
              <span className={`payment-status ${order.payment.status.toLowerCase()}`}>
                {order.payment.status}
              </span>
            </p>
            <p><strong>Amount:</strong> ₹{order.payment.amount.toFixed(2)}</p>
            {order.payment.transactionId && (
              <p><strong>Transaction ID:</strong> {order.payment.transactionId}</p>
            )}
            {order.payment.paymentDate && (
              <p><strong>Date:</strong> {new Date(order.payment.paymentDate).toLocaleString()}</p>
            )}
          </div>
        </div>
        
        <div className="order-section">
          <h3>Order Summary</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row grand-total">
              <span>Total:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {['Pending', 'Processing'].includes(order.status) && (
        <div className="order-actions">
          <button 
            onClick={handleCancelOrder}
            className="cancel-order-btn"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;