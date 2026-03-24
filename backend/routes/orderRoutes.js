const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

// Customer routes
router.post('/', protect, orderController.createOrder);
router.get('/history', protect, orderController.getOrderHistory);
router.get('/:id', protect, orderController.getOrderDetails);
router.put('/:id/cancel', protect, orderController.cancelOrder);

// Admin routes
router.put('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;