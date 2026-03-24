const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

// Initialize Gemini AI - with safety check
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini AI initialized successfully");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not set - using fallback mode");
  }
} catch (err) {
  console.error("❌ Gemini AI initialization failed:", err.message);
}

// ========================
// BUILT-IN KNOWLEDGE BASE
// ========================
const knowledgeBase = {
  mission: `🌿 **HasthaVeedhi's Mission**

HasthaVeedhi bridges the gap between India's finest artisans and global craft enthusiasts. We are dedicated to:

• **Empowering artisan communities** with fair trade practices
• **Preserving heritage crafts** passed down through generations
• **Creating sustainable livelihoods** for traditional craftspeople
• **Connecting buyers directly** with authentic handmade products

Every purchase on HasthaVeedhi supports a real artisan family and keeps India's rich craft traditions alive! 🇮🇳`,

  craftMap: `🗺️ **How the Craft Map Works**

Our Interactive Craft Map lets you explore India's incredible craft diversity:

1. **Browse the Map** — Click on any Indian state to discover its unique crafts
2. **Explore Clusters** — Each region highlights its signature craft traditions
3. **Discover Artisans** — Find artisans working in specific craft forms
4. **Shop by Region** — Buy authentic products directly from artisan clusters

From Kashmir's Pashmina shawls to Kerala's Coir products, the Craft Map is your gateway to India's creative heritage! 🎨`,

  howToBuy: `🛒 **How to Buy on HasthaVeedhi**

Buying is simple and secure:

1. **Browse** — Use the Craft Map or search for specific crafts
2. **Select** — Click on a product to see details, pricing & artisan info
3. **Add to Cart** — Click "Add to Cart" or "Buy Now" for instant purchase
4. **Checkout** — Review your order and proceed to secure payment
5. **Track** — View your order status in "My Orders"

You can also save items to your Wishlist for later! ❤️`,

  crafts: {
    "ajrakh": `🎨 **Ajrakh Block Printing**

Ajrakh is a traditional block printing technique from Kutch, Gujarat, dating back over 4,000 years. Key features:

• Uses natural dyes from indigo, madder root, and pomegranate
• Intricate geometric and floral patterns
• Each piece goes through 14-16 stages of printing and washing
• Traditionally printed on both sides of the fabric
• UNESCO recognized as Intangible Cultural Heritage`,

    "bandhani": `🌈 **Bandhani (Tie-Dye)**

Bandhani is Gujarat and Rajasthan's signature tie-dye art:

• Tiny knots are tied by hand to create patterns
• Traditional colors include red, yellow, green, and blue
• A single saree can have thousands of hand-tied dots
• Dating back to the Indus Valley Civilization
• Popular for weddings and festive occasions`,

    "banarasi": `✨ **Banarasi Silk Sarees**

The crown jewel of Indian textiles from Varanasi:

• Woven with real gold and silver zari threads
• Known for elaborate Mughal-inspired motifs
• A single saree can take 15 days to 6 months to weave
• Recognized with a GI (Geographical Indication) tag
• Considered essential for Hindu wedding trousseaus`,

    "chanderi": `🌸 **Chanderi Sarees**

Delicate handwoven sarees from Chanderi, Madhya Pradesh:

• Known for their sheer texture and lightweight feel
• Feature traditional coin, peacock, and floral motifs
• Blend of silk and cotton for a unique drape
• Over 300 years of weaving tradition
• GI-tagged to protect authenticity`,

    "madhubani": `🎭 **Madhubani Painting**

A vibrant folk art from Bihar's Mithila region:

• Uses natural pigments and dyes
• Characterized by eye-catching geometrical patterns
• Traditionally painted on freshly plastered mud walls
• Five distinctive styles: Bharni, Kachni, Tantrik, Godna, and Kohbar
• Now applied to canvas, paper, and fabric`,

    "chikankari": `🪡 **Chikankari Embroidery**

Lucknow's exquisite hand embroidery tradition:

• Delicate white thread on white fabric (shadow work)
• Over 36 different types of stitches
• Mughal-era craft dating back 400+ years
• Features floral and paisley motifs
• Applied on cotton, chiffon, georgette, and silk`,

    "pattachitra": `🖼️ **Pattachitra**

Classical scroll paintings from Odisha and West Bengal:

• Painted on specially prepared cloth or dried palm leaves
• Depicts mythological narratives and folktales
• Uses natural colors from minerals and plants
• Characterized by bold outlines and vibrant colors
• Ancient art form dating back to 5th century BCE`,

    "blue pottery": `💙 **Blue Pottery of Jaipur**

Rajasthan's iconic ceramic craft:

• Made without clay — uses quartz stone powder, glass, and gum
• Distinctive blue and white patterns
• Influenced by Turko-Persian ceramic art
• Floral and animal motifs are signature designs
• Each piece is hand-shaped and hand-painted`,

    "warli": `🏡 **Warli Painting**

Tribal art from Maharashtra:

• Uses basic geometric shapes — circles, triangles, squares
• Originally painted on mud walls with rice paste
• Depicts daily life, nature, and harvest celebrations
• One of the oldest art forms in India (2500-3000 BCE)
• Now popular on canvas, cards, and home décor`,

    "phulkari": `🌺 **Phulkari Embroidery**

Punjab's vibrant needlework tradition:

• Name means "flower work" in Punjabi
• Embroidered from the wrong side of the fabric
• Uses bright, untwisted silk thread (pat)
• Traditional wedding and celebration wear
• Bagh phulkari covers the entire cloth surface`,

    "pashmina": `🧣 **Pashmina Shawls**

Kashmir's legendary textile luxury:

• Made from the fine undercoat of Himalayan Changthangi goats
• Each shawl takes 2-3 years to complete
• Incredibly soft and warm — 6 times finer than human hair
• Hand-spun and hand-woven on traditional looms
• World-famous for exquisite hand embroidery (Sozni)`,

    "kantha": `🧵 **Kantha Stitch**

Bengal and Bangladesh's running stitch art:

• Uses simple running stitches to create intricate patterns
• Traditionally made from recycled sari fabric
• Depicts mythological scenes and nature
• Each piece tells a unique story
• Celebrated as a sustainable craft tradition`,

    "kondapalli": `🎎 **Kondapalli Toys**

Andhra Pradesh's iconic wooden toy craft:

• Made from Tella Poniki (softwood) found in Kondapalli Hills
• Brightly painted with natural vegetable dyes
• Depict mythological characters, animals, and village life
• Lightweight and eco-friendly
• Nearly 400 years of crafting tradition`,

    "tanjore": `🎆 **Tanjore Paintings**

Tamil Nadu's classical art of gold-leaf painting:

• Rich, vivid colors with gold foil overlay
• Predominantly Hindu religious themes
• 3D effect created with layers of plaster and gems
• Originated under the Chola dynasty (16th century)
• Each painting is handcrafted over several weeks`,

    "terracotta": `🏺 **Terracotta Craft**

One of India's oldest crafts across multiple states:

• Made from natural clay, shaped and fired
• Includes pottery, figurines, jewelry, and home décor
• Each region has its own unique style and technique
• Eco-friendly and sustainable
• Prominent in West Bengal, Rajasthan and Tamil Nadu`,

    "pochampally": `🧶 **Pochampally Ikat Sarees**

Telangana's signature double-ikat weaving:

• Known as the "Silk City of India"
• Threads are tie-dyed before weaving for geometric patterns
• UNESCO recognized as a creative city of crafts
• GI-tagged to protect authenticity
• Takes 4-5 days to complete one saree`
  }
};

// Smart response generator using knowledge base
function generateSmartResponse(prompt) {
  const lower = prompt.toLowerCase().trim();

  // Mission / About
  if (lower.includes("mission") || lower.includes("about") || lower.includes("what is hasthaveedhi") || lower.includes("who are you") || lower.includes("what do you do")) {
    return knowledgeBase.mission;
  }

  // Craft Map
  if (lower.includes("craft map") || lower.includes("map") || lower.includes("explore") || lower.includes("discover")) {
    return knowledgeBase.craftMap;
  }

  // How to buy
  if (lower.includes("how do i buy") || lower.includes("how to buy") || lower.includes("checkout") || lower.includes("purchase") || lower.includes("how to order")) {
    return knowledgeBase.howToBuy;
  }

  // Specific craft queries
  for (const [key, info] of Object.entries(knowledgeBase.crafts)) {
    if (lower.includes(key)) {
      return info;
    }
  }

  // Greeting
  if (lower.match(/^(hi|hello|hey|namaste|namaskar|hola|howdy)/)) {
    return `Namaste! 🙏 Welcome to HasthaVeedhi!

I'm your Gift Assistant, here to help you:

• 🎁 Find the perfect handcrafted gift
• 🎨 Learn about India's traditional crafts
• 🗺️ Navigate our Craft Map
• 🛒 Help with shopping and orders

What would you like to explore today?`;
  }

  // Thanks
  if (lower.match(/^(thanks|thank you|thx|ty|dhanyavad)/)) {
    return `You're welcome! 😊 It's my pleasure to help you discover India's beautiful crafts. Feel free to ask me anything else about HasthaVeedhi!`;
  }

  // Gift suggestions
  if (lower.includes("gift") || lower.includes("recommend") || lower.includes("suggest") || lower.includes("occasion") || lower.includes("birthday") || lower.includes("wedding") || lower.includes("anniversary")) {
    return `🎁 **Gift Recommendations**

Here are some great gift ideas from our artisan collection:

**For Weddings:** Banarasi Silk Sarees, Tanjore Paintings, Pashmina Shawls
**For Birthdays:** Blue Pottery, Madhubani Paintings, Kondapalli Toys
**For Home Décor:** Warli Paintings, Terracotta Craft, Pattachitra Art
**For Special Occasions:** Chikankari Embroidery, Phulkari Dupattas, Chanderi Sarees

💡 *Tip: Try asking "Show me gifts under ₹2000" for budget-specific recommendations!*

What occasion are you shopping for? I can narrow it down! 🎯`;
  }

  // Price queries - only return static response if no specific price number is mentioned
  // If they mention a specific price (e.g. "above 2000", "under 500"), let it fall through to product matching
  const hasSpecificPrice = lower.match(/\d+/);
  if (!hasSpecificPrice && (lower.includes("price") || lower.includes("cost") || lower.includes("expensive") || lower.includes("cheap") || lower.includes("affordable") || lower.includes("budget"))) {
    return null; // Return null so it falls through to product matching / AI
  }

  // Shipping / Delivery
  if (lower.includes("shipping") || lower.includes("delivery") || lower.includes("deliver") || lower.includes("track")) {
    return `📦 **Shipping & Delivery**

• All products are carefully packaged by our artisans
• Standard delivery takes 5-7 business days
• Track your order anytime from "My Orders" section
• We deliver across India and selected international locations

Need help with a specific order? Check the "My Orders" page for real-time updates! 🚚`;
  }

  // Artisan info
  if (lower.includes("artisan") || lower.includes("craftsman") || lower.includes("maker") || lower.includes("who makes")) {
    return `👨‍🎨 **Our Artisans**

HasthaVeedhi works directly with artisan communities across India:

• Each artisan is verified and their craft heritage is documented
• Fair trade practices ensure artisans get a majority of the revenue
• We support artisan families in over 20 Indian states
• Many of our artisans are award-winning national craft experts

When you buy from HasthaVeedhi, you directly support these talented families! 🤝`;
  }

  // Fallback
  return null;
}

exports.chatWithGemini = async (req, res) => {
  const { prompt } = req.body;
  
  try {
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 1. Try built-in knowledge base first for common questions
    const smartResponse = generateSmartResponse(prompt);

    // 2. Fetch products from DB
    let products = [];
    try {
      products = await Product.find({})
        .select('name price craft description imageUrl availability')
        .lean();
    } catch (dbErr) {
      console.warn("⚠️ Could not fetch products:", dbErr.message);
    }

    // 3. Find matching products for the sidebar
    const getMatchingProducts = (promptText) => {
      if (!products.length) return [];
      const lowerPrompt = promptText.toLowerCase();

      // "under/below X" filter
      const underMatch = lowerPrompt.match(/(?:under|below|less than|upto|up to|within)\s*₹?\s*(\d+)/);
      if (underMatch) {
        const maxPrice = parseInt(underMatch[1]);
        return products.filter(p => p.price <= maxPrice);
      }

      // "above/over/more than X" filter
      const aboveMatch = lowerPrompt.match(/(?:above|over|more than|greater than|exceeding|starting from|from|upwards of)\s*₹?\s*(\d+)/);
      if (aboveMatch) {
        const minPrice = parseInt(aboveMatch[1]);
        return products.filter(p => p.price >= minPrice);
      }

      // "between X and Y" filter
      const betweenMatch = lowerPrompt.match(/(?:between|from)\s*₹?\s*(\d+)\s*(?:and|to|-|–)\s*₹?\s*(\d+)/);
      if (betweenMatch) {
        const minPrice = parseInt(betweenMatch[1]);
        const maxPrice = parseInt(betweenMatch[2]);
        return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
      }

      // "around/approximately X" filter (±20% range)
      const aroundMatch = lowerPrompt.match(/(?:around|approximately|approx|near|~)\s*₹?\s*(\d+)/);
      if (aroundMatch) {
        const targetPrice = parseInt(aroundMatch[1]);
        const minPrice = targetPrice * 0.8;
        const maxPrice = targetPrice * 1.2;
        return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
      }

      // Generic price mention with just a number (e.g., "price above 2000" or "₹2000 products")
      const priceGeneric = lowerPrompt.match(/(?:price|cost|₹)\s*(?:of\s*)?(?:above|over|more|greater)?\s*(\d+)/);
      if (priceGeneric && (lowerPrompt.includes('above') || lowerPrompt.includes('over') || lowerPrompt.includes('more'))) {
        const minPrice = parseInt(priceGeneric[1]);
        return products.filter(p => p.price >= minPrice);
      }
      if (priceGeneric) {
        const targetPrice = parseInt(priceGeneric[1]);
        // Show products around that price range (±30%)
        return products.filter(p => p.price >= targetPrice * 0.7 && p.price <= targetPrice * 1.3);
      }

      // Name/Craft/Description filter
      const matches = products.filter(p =>
        p.name.toLowerCase().includes(lowerPrompt) ||
        p.craft.toLowerCase().includes(lowerPrompt) ||
        (p.description && p.description.toLowerCase().includes(lowerPrompt)) ||
        lowerPrompt.includes(p.craft.toLowerCase())
      );
      if (matches.length > 0) return matches;

      // Keyword matching
      const keywords = lowerPrompt.split(/\s+/).filter(w => w.length > 3);
      const keywordMatches = products.filter(p =>
        keywords.some(k =>
          p.name.toLowerCase().includes(k) || p.craft.toLowerCase().includes(k)
        )
      );
      if (keywordMatches.length > 0) return keywordMatches;

      // If nothing matched, return all products as general browse
      return products;
    };

    const matchingProducts = getMatchingProducts(prompt);

    // 4. If we have a smart response and no AI needed, return immediately
    if (smartResponse && !genAI) {
      return res.json({
        reply: smartResponse,
        products: matchingProducts.slice(0, 6)
      });
    }

    // 5. Try Gemini AI
    if (genAI) {
      try {
        const productList = products.map(p =>
          `- ${p.name}: ${p.craft}, ₹${p.price}. ${p.availability ? 'In Stock' : 'Out of Stock'}. Description: ${p.description || 'N/A'}`
        ).join('\n');

        const instructionPrompt = `
          PLATFORM NAME: HasthaVeedhi
          MISSION: Bridging the gap between India's finest artisans and global craft enthusiasts. Authentic, handmade, and ethically sourced.
          CORE VALUES: Empowering local communities, transparent revenue for artisans, sustainable livelihoods, and preserving traditional stories.
          
          KEY FEATURES:
          - INTERACTIVE CRAFT MAP: Locate regional craft clusters across India.
          - DIRECT MARKETPLACE: Browse and buy authentic products directly from artisans.
          - ORDER MANAGEMENT: Transparent tracking of deliveries and orders.
          - WISHLIST: Save favorite crafts for later.
          - GIFT ASSISTANT: (You) Personalized recommendations based on occasion and budget.

          IDENTITY: You are the warm, knowledgeable Gift Assistant of HasthaVeedhi. You know Indian crafts, history, and artisan traditions deeply.

          USER QUERY: "${prompt}"

          AVAILABLE PRODUCTS:
          ${productList}

          RULES:
          1. Respond warmly and professionally about HasthaVeedhi and Indian crafts.
          2. When recommending products, only use products from the list above.
          3. Keep responses concise (under 200 words), use bullet points for product lists.
          4. Use emojis sparingly for warmth.
          5. Never invent products not in the list.
          6. If asked non-craft questions, politely redirect to HasthaVeedhi topics.
        `;

        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 800
          }
        });

        const result = await model.generateContent(instructionPrompt);
        const response = await result.response;
        const text = response.text();

        return res.json({
          reply: text,
          products: matchingProducts.slice(0, 6)
        });

      } catch (aiErr) {
        console.error("⚠️ Gemini AI failed, using fallback:", aiErr.message);
        // Fall through to fallback
      }
    }

    // 6. Fallback: Use smart response or generate a product-based response
    if (smartResponse) {
      return res.json({
        reply: smartResponse,
        products: matchingProducts.slice(0, 6)
      });
    }

    // 7. Final fallback: product-based response
    if (matchingProducts.length > 0) {
      const lowerPrompt = prompt.toLowerCase();
      let contextMsg = "Here are some products I found related to your query";
      
      // Generate context-aware message
      const underMatch = lowerPrompt.match(/(?:under|below|less than)[\s₹]*(\d+)/);
      const aboveMatch = lowerPrompt.match(/(?:above|over|more than|greater than)[\s₹]*(\d+)/);
      const betweenMatch = lowerPrompt.match(/(?:between|from)[\s₹]*(\d+)\s*(?:and|to|-|–)[\s₹]*(\d+)/);
      
      if (underMatch) {
        contextMsg = `🎁 Here are authentic handcrafted products under ₹${underMatch[1]}`;
      } else if (aboveMatch) {
        contextMsg = `✨ Here are our premium handcrafted products above ₹${aboveMatch[1]}`;
      } else if (betweenMatch) {
        contextMsg = `🎯 Here are handcrafted products between ₹${betweenMatch[1]} and ₹${betweenMatch[2]}`;
      }

      const productNames = matchingProducts.slice(0, 4).map(p => `• **${p.name}** (${p.craft}) — ₹${p.price.toLocaleString('en-IN')}`).join('\n');
      const totalCount = matchingProducts.length;
      
      return res.json({
        reply: `${contextMsg}:\n\n${productNames}${totalCount > 4 ? `\n\n...and ${totalCount - 4} more!` : ''}\n\nCheck the product cards on the right for full details. You can add them to cart or buy directly! 🛒`,
        products: matchingProducts.slice(0, 6)
      });
    }

    // 8. Generic helpful response
    return res.json({
      reply: `Thank you for your question! 😊 Here are some things I can help you with:

• 🎁 **Gift recommendations** — "Show me gifts under ₹2000"
• 🎨 **Craft information** — "Tell me about Madhubani painting"
• 🗺️ **Craft Map** — "How does the Craft Map work?"
• 🛒 **Shopping help** — "How do I buy a product?"
• 🏛️ **About us** — "What is HasthaVeedhi's mission?"

Try one of these or ask me anything about Indian handicrafts! 🇮🇳`,
      products: []
    });

  } catch (err) {
    console.error("❌ Chat error:", err.message || err);
    res.status(500).json({
      error: "Service temporarily unavailable",
      reply: "I'm experiencing a brief hiccup! 🙏 Please try again in a moment. In the meantime, feel free to explore our Craft Map or browse the shop!",
      products: []
    });
  }
};