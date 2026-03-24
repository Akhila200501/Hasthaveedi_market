// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ArtisanMarketMap from './pages/MapPage';
import SellerDashboard from './pages/SellerPage';
import ShopPage from "./pages/ShopPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import Wishlist from "./pages/Wishlist";
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import GiftAssistantPage from './pages/GiftAssistantPage';
import About from './pages/About';

const App = () => {
  return (
    <CartProvider>
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customer-map" element={<ArtisanMarketMap />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/map" element={<ArtisanMarketMap />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
      <Route path="/orders/:id" element={<OrderDetailsPage />} />
      <Route path="/gift-assistant" element={<GiftAssistantPage />} />
      <Route path="/about" element={<About />} />
    </Routes>
    </CartProvider>
  );
};

export default App;