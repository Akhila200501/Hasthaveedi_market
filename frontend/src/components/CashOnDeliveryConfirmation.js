import React from 'react';
import '../styles/CashOnDeliveryConfirmation.css';

const CashOnDeliveryConfirmation = ({ amount, onConfirm, onCancel, isProcessing }) => {
  return (
    <div className="cod-confirmation">
      <h3>Cash on Delivery</h3>
      <div className="cod-amount">
        <span>Amount to pay on delivery:</span>
        <span>₹{amount.toFixed(2)}</span>
      </div>
      
      <div className="cod-instructions">
        <p>Please have exact change ready for the delivery person.</p>
        <p>Your order will be processed once payment is received.</p>
      </div>
      
      <div className="cod-actions">
        <button onClick={onCancel} disabled={isProcessing}>Cancel</button>
        <button
          onClick={() => onConfirm({
            transactionId: `COD-${Date.now()}`,
            amount,
            status: 'Pending' // Will be completed when delivered
          })}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
};

export default CashOnDeliveryConfirmation;