import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/GiftAssistant.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

const GiftAssistantPage = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Namaste! 🙏 I'm your HasthaVeedhi Gift Assistant. I can help you find the perfect handcrafted gift, explain our mission, or guide you through our Craft Map.\n\nWhat would you like to know today?", 
      isBot: true 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, fetchCartItems } = useCart();

  const suggestions = [
    "What is HasthaVeedhi's mission?",
    "Show me gifts under ₹2000",
    "Show me products above ₹3000",
    "How does the Craft Map work?",
    "Tell me about Ajrakh printing",
    "How do I buy a product?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format bot text with markdown-like styling
  const formatBotText = (text) => {
    if (!text) return '';
    
    // Split into lines and process
    return text.split('\n').map((line, i) => {
      // Bold text **text**
      const parts = [];
      let remaining = line;
      let key = 0;
      
      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch) {
          const beforeBold = remaining.substring(0, boldMatch.index);
          if (beforeBold) parts.push(<span key={key++}>{beforeBold}</span>);
          parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        } else {
          parts.push(<span key={key++}>{remaining}</span>);
          remaining = '';
        }
      }
      
      return (
        <React.Fragment key={i}>
          {parts.length > 0 ? parts : line}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const handleSendMessage = async (messageText) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    const userMessage = { text: text, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_BASE}/api/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!response.ok) {
        // Even error responses from our API include a reply
        setMessages(prev => [...prev, { 
          text: data.reply || "I'm having a brief issue. Please try again!", 
          isBot: true 
        }]);
        if (data.products) setProducts(data.products);
        return;
      }

      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
      
    } catch (err) {
      console.error('Chat Error:', err);
      
      // Provide offline/fallback response when backend is unreachable
      const offlineResponse = getOfflineResponse(text);
      setMessages(prev => [...prev, { 
        text: offlineResponse, 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
      // Focus back on input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Offline fallback responses when backend is completely unreachable
  const getOfflineResponse = (prompt) => {
    const lower = prompt.toLowerCase();
    
    if (lower.includes("mission") || lower.includes("about") || lower.includes("what is")) {
      return "🌿 HasthaVeedhi bridges the gap between India's finest artisans and global craft enthusiasts. We empower artisan communities through fair trade, preserve heritage crafts, and create sustainable livelihoods. Every purchase supports a real artisan family! 🇮🇳";
    }
    if (lower.includes("map") || lower.includes("craft map")) {
      return "🗺️ Our Interactive Craft Map lets you explore India's incredible craft diversity! Click on any state to discover unique crafts, find artisans, and shop by region. It's your gateway to India's creative heritage! Go to the Home page to try it out.";
    }
    if (lower.includes("buy") || lower.includes("purchase") || lower.includes("order") || lower.includes("checkout")) {
      return "🛒 Buying is simple! Browse products → Add to Cart → Checkout securely. You can also use 'Buy Now' for instant purchase. Track your orders anytime from 'My Orders' section!";
    }
    if (lower.includes("gift") || lower.includes("recommend") || lower.includes("suggest")) {
      return "🎁 Great gift ideas from our collection:\n\n• Weddings: Banarasi Silk, Tanjore Paintings\n• Birthdays: Blue Pottery, Madhubani Art\n• Home Décor: Warli Paintings, Terracotta\n\nPlease make sure the server is running to see product recommendations!";
    }
    if (lower.match(/^(hi|hello|hey|namaste)/)) {
      return "Namaste! 🙏 Welcome! I'm currently having trouble connecting to my full knowledge base, but I can still help with basic questions about HasthaVeedhi. Try asking about our mission, the Craft Map, or how to buy!";
    }
    
    return "I'm having trouble connecting right now 🔄 Please make sure the backend server is running on port 5000.\n\nIn the meantime, try:\n• Exploring the Craft Map from the Home page\n• Browsing products in the Shop\n• Checking your Wishlist or Orders\n\nI'll be back to full power shortly! 🙏";
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add to cart');
      navigate('/auth');
      return;
    }

    try {
      await addToCart(productId, 1);
      await fetchCartItems();
      alert('✅ Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart: ' + err.message);
    }
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue');
      navigate('/auth');
      return;
    }

    if (!product.availability) {
      alert('Product is out of stock');
      return;
    }

    navigate('/checkout', {
      state: {
        directProduct: product,
        quantity: 1
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <nav className="assistant-nav">
          <button onClick={() => navigate('/map')}>Home</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
          <button onClick={() => navigate('/orders')}>My Orders</button>
          <button onClick={() => navigate('/cart')}>My Cart</button>
          <button 
            onClick={() => navigate('/auth')} 
            className="logout-btn"
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="assistant-title">
        <h1>🎁 Gift Assistant</h1>
        <p>Ask me for gift recommendations or craft information</p>
      </div>

      <div className="assistant-layout">
        {/* Chat Section */}
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.isBot ? 'bot' : 'user'} message-animate`}
              >
                {message.isBot && (
                  <div className="bot-avatar">🤖</div>
                )}
                <div className="message-content">
                  {message.isBot ? formatBotText(message.text) : message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot message-animate">
                <div className="bot-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="suggestions-container">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                className="suggestion-chip" 
                onClick={() => handleSuggestionClick(s)}
                disabled={isLoading}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="chat-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? (
                <span className="send-loading">●●●</span>
              ) : (
                <span className="send-icon">➤</span>
              )}
            </button>
          </form>
        </div>

        {/* Products Section */}
        <div className="products-section">
          {products.length > 0 ? (
            <>
              <h3>✨ Recommended Products</h3>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card">
                    <img 
                      src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/280x220?text=Handcrafted+Product'; }}
                    />
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p className="craft">{product.craft}</p>
                      <p className="price">₹{product.price?.toLocaleString('en-IN')}</p>
                      <p className={`stock ${product.availability ? 'in' : 'out'}`}>
                        {product.availability ? '● In Stock' : '● Out of Stock'}
                      </p>
                      <div className="actions">
                        <button 
                          onClick={() => handleBuyNow(product)}
                          disabled={!product.availability}
                          className="buy-btn"
                        >
                          Buy Now
                        </button>
                        <button 
                          onClick={() => handleAddToCart(product._id)}
                          disabled={!product.availability}
                          className="cart-btn"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3>Discover Handcrafted Treasures</h3>
              <p>Ask about products to see personalized recommendations here</p>
              <div className="empty-suggestions">
                <span onClick={() => handleSuggestionClick("Show me gifts under ₹2000")}>
                  "Show me gifts under ₹2000"
                </span>
                <span onClick={() => handleSuggestionClick("Tell me about Banarasi silk")}>
                  "Tell me about Banarasi silk"
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftAssistantPage;