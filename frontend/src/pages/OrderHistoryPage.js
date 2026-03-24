import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch('http://localhost:5000/api/orders/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/auth');
            return;
          }
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
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
    return <div className="loading">Loading your orders...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

const handleCancelOrder = async (orderId) => {
  if (!window.confirm('Are you sure you want to cancel this order?')) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }

    const data = await response.json();
    setOrders(orders.map(order => 
      order._id === orderId ? data.order : order
    ));
    alert('Order cancelled successfully');
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert(`Error cancelling order: ${error.message}`);
  }
};

  return (
    <div className="order-history">
      <h2>Your Order History</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/map')}>Start Exploring Crafts</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order._id.substring(0, 8)}</div>
                <div className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="order-body">
                <div className="order-status">
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-total">
                  <span>Total:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="order-items-preview">
                  {order.items && order.items.slice(0, 3).map((item, index) => {
                    const product = item?.productId || {};
                    const rawUrl = product.imageUrl || '/fallback-image.jpg';
                    const imageUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl}`;
                    const name = product.name || 'Unknown Product';

                    return (
                      <div key={index} className="item-preview">
                        <img 
                          src={imageUrl} 
                          alt={name} 
                          className="item-image"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                        />
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                    );
                  })}
                  {order.items && order.items.length > 3 && (
                    <div className="more-items">+{order.items.length - 3} more</div>
                  )}
                </div>
              </div>
              
              <div className="order-footer">
                <button 
                  onClick={() => handleViewDetails(order._id)}
                  className="view-details-btn"
                >
                  View Details
                </button>
                
                {['Pending', 'Processing'].includes(order.status) && (
                  <button 
                    onClick={() => handleCancelOrder(order._id)}
                    className="cancel-order-btn"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;