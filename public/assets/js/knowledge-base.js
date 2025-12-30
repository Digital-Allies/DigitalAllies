// Knowledge Base Data
const knowledgeBase = {
  'ADA Compliance': [
    {
      id: 'ada-compliance-guide',
      title: 'How to Make Your Website ADA Compliant',
      category: 'ADA Compliance',
      excerpt: 'Step-by-step guide to ensuring your website meets accessibility standards.',
      content: `# How to Make Your Website ADA Compliant

## Understanding ADA Compliance

The Americans with Disabilities Act (ADA) requires that websites be accessible to people with disabilities.

## Why It Matters

**Legal Protection**: Over 4,000 lawsuits filed in 2024 for inaccessible websites.

**Expanded Market**: 26% of US adults have some type of disability.

**Better SEO**: Accessible websites rank better in search engines.

## WCAG 2.1 Standards

### Visual Accessibility
- Color contrast ratio of at least 4.5:1
- Text resizable up to 200%
- No information conveyed by color alone

### Navigation
- Full keyboard navigation support
- Skip navigation links
- Clear focus indicators

**Our Service**: ADA Compliance Audit starting at $800

📞 Call: 928-228-5769`,
      keywords: ['ada', 'accessibility', 'wcag', 'compliance', 'website', 'disabilities', 'legal', 'standards']
    }
  ],
  'Consultation Preparation': [
    {
      id: 'consultation-prep',
      title: 'Getting Ready for Your Consultation',
      category: 'Consultation Preparation',
      excerpt: 'Checklist and tips for preparing for your strategic meeting.',
      content: `# Getting Ready for Your Digital Allies Consultation

## Our Services Overview

- ADA Compliant Website
- Website Audit
- Web Design & Development
- SEO Optimization
- Local SEO
- Tech Consulting

## Preparing for Your Consultation

### Step 1: Define Your Goals
- Identify your challenges
- Set specific goals
- Establish a budget

### Step 2: Gather Information
- Current website URL
- Analytics data
- Competitor list

### Step 3: Prepare Questions
- "How can I make my website ADA compliant?"
- "What are the key factors for SEO?"
- "How long does a project take?"

📞 Phone: 928-228-5769
📧 Email: contact@digitalallies.net`,
      keywords: ['consultation', 'preparation', 'meeting', 'planning', 'services', 'goals']
    }
  ],
  'Tech Consulting': [
    {
      id: 'choosing-kb-platform',
      title: 'Choosing the Right Knowledge Base Platform',
      category: 'Tech Consulting',
      excerpt: 'Comparison of knowledge base platforms for customer support.',
      content: `# Choosing the Right Platform

## Why You Need a Knowledge Base

- Reduce support load
- Improve customer satisfaction
- Scale support efficiently
- Train AI chatbots

## Top Platforms

### Document360 (Recommended)
**Pricing**: $149/month
**Best for**: SaaS companies
**Deployment**: 3-5 days

### Zendesk Guide
**Pricing**: $5/agent/month
**Best for**: Enterprise teams
**Deployment**: 1-2 weeks

### Freshdesk
**Pricing**: $15/agent/month
**Best for**: Small-medium teams
**Deployment**: 3-7 days

## Our Implementation Service

**Knowledge Base Setup**: Starting at $2,500
**Content Development**: $150/article
**Chatbot Integration**: Starting at $3,500

📞 Call: 928-228-5769`,
      keywords: ['knowledge base', 'platform', 'chatbot', 'support', 'customer service', 'software']
    }
  ],
  'SEO Optimization': [
    {
      id: 'local-seo-guide',
      title: 'Improving Local SEO Strategies',
      category: 'SEO Optimization',
      excerpt: 'Practical steps for boosting local search visibility.',
      content: `# Local SEO Strategies

## Why Local SEO Matters

- Increased visibility in "near me" searches
- Qualified traffic from nearby customers
- Better ROI than broad campaigns

## Key Components

### 1. Google Business Profile
- Complete your profile
- Gather reviews
- Post regular updates

### 2. Local Keywords
- "[service] near me"
- "[service] in [city]"
- Neighborhood terms

### 3. NAP Consistency
- Same Name, Address, Phone everywhere
- Critical for rankings

## Our Packages

**Local SEO Starter**: $500/month
**Local SEO Growth**: $800/month
**Local SEO Premium**: $1,200/month

📞 Call: 928-228-5769`,
      keywords: ['seo', 'local seo', 'google business', 'search', 'ranking', 'optimization']
    }
  ]
};

// State
let selectedCategory = null;
let selectedArticle = null;
let searchQuery = '';
let chatMessages = [
  { role: 'assistant', content: 'Hi! I\'m your Digital Allies assistant. I can help you with questions about our services, pricing, processes, and more. What would you like to know?' }
];

// Get all articles as flat array
const allArticles = Object.values(knowledgeBase).flat();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryPills();
  renderArticles();
  initializeSearch();
  initializeChatbot();
  renderChatMessages();
});

// Render category pills
function renderCategoryPills() {
  const container = document.getElementById('category-pills');
  const categories = Object.keys(knowledgeBase);
  
  let html = `
    <button 
      onclick="filterByCategory(null)"
      class="px-4 py-2 rounded-full font-medium transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}"
    >
      All Articles
    </button>
  `;
  
  categories.forEach(cat => {
    html += `
      <button 
        onclick="filterByCategory('${cat}')"
        class="px-4 py-2 rounded-full font-medium transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}"
      >
        ${cat}
      </button>
    `;
  });
  
  container.innerHTML = html;
}

// Filter by category
function filterByCategory(category) {
  selectedCategory = category;
  renderCategoryPills();
  renderArticles();
}

// Render articles
function renderArticles() {
  const container = document.getElementById('articles-grid');
  const noResults = document.getElementById('no-results');
  
  let articles = allArticles;
  
  // Filter by category
  if (selectedCategory) {
    articles = articles.filter(a => a.category === selectedCategory);
  }
  
  // Filter by search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.keywords.some(k => k.includes(query))
    );
  }
  
  if (articles.length === 0) {
    container.classList.add('hidden');
    noResults.classList.remove('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  noResults.classList.add('hidden');
  
  let html = '';
  articles.forEach(article => {
    html += `
      <div 
        onclick="showArticle('${article.id}')"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
      >
        <div class="flex items-start justify-between mb-3">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span class="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            ${article.category}
          </span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">
          ${article.title}
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          ${article.excerpt}
        </p>
        <button class="text-blue-600 font-medium text-sm flex items-center hover:text-blue-700">
          Read more 
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Show article
function showArticle(articleId) {
  const article = allArticles.find(a => a.id === articleId);
  if (!article) return;
  
  selectedArticle = article;
  
  // Update breadcrumb
  const breadcrumb = document.getElementById('breadcrumb');
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbSeparator = document.getElementById('breadcrumb-separator');
  const breadcrumbArticle = document.getElementById('breadcrumb-article');
  
  breadcrumb.classList.remove('hidden');
  breadcrumbCategory.textContent = article.category;
  breadcrumbSeparator.classList.remove('hidden');
  breadcrumbArticle.textContent = article.title;
  
  // Hide main view, show article view
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('article-view').classList.remove('hidden');
  
  // Render article content
  renderArticleContent(article);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render article content
function renderArticleContent(article) {
  const container = document.getElementById('article-content');
  
  const lines = article.content.split('\n');
  let html = '';
  let inList = false;
  
  lines.forEach(line => {
    if (line.startsWith('# ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h1 class="text-4xl font-bold text-gray-900 mb-6">${line.substring(2)}</h1>`;
    } else if (line.startsWith('## ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${line.substring(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">${line.substring(4)}</h3>`;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p class="font-bold text-gray-900 mt-4">${line.slice(2, -2)}</p>`;
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul class="list-disc ml-6 mb-4">';
        inList = true;
      }
      html += `<li class="text-gray-700 mb-2">${line.substring(2)}</li>`;
    } else if (line.trim()) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p class="text-gray-700 mb-4">${line}</p>`;
    }
  });
  
  if (inList) {
    html += '</ul>';
  }
  
  container.innerHTML = html;
}

// Reset view
function resetView() {
  selectedArticle = null;
  
  // Hide breadcrumb
  document.getElementById('breadcrumb').classList.add('hidden');
  document.getElementById('breadcrumb-separator').classList.add('hidden');
  
  // Show main view, hide article view
  document.getElementById('main-view').classList.remove('hidden');
  document.getElementById('article-view').classList.add('hidden');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize search
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderArticles();
  });
}

// Initialize chatbot
function initializeChatbot() {
  const toggle = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const iconOpen = document.getElementById('chatbot-icon-open');
  const iconClose = document.getElementById('chatbot-icon-close');
  const sendButton = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  
  toggle.addEventListener('click', () => {
    const isHidden = chatWindow.classList.contains('hidden');
    
    if (isHidden) {
      chatWindow.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
    } else {
      chatWindow.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
  });
  
  sendButton.addEventListener('click', sendMessage);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Send message
function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  chatMessages.push({ role: 'user', content: message });
  input.value = '';
  
  renderChatMessages();
  
  // Show typing indicator
  showTypingIndicator();
  
  // Generate response after delay
  setTimeout(() => {
    const response = generateResponse(message);
    chatMessages.push({ role: 'assistant', content: response });
    hideTypingIndicator();
    renderChatMessages();
  }, 1000);
}

// Generate response - IMPROVED WITH KNOWLEDGE BASE SEARCH
function generateResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // First, search the knowledge base for relevant articles
  const relevantArticles = allArticles.filter(article => {
    const matchesTitle = article.title.toLowerCase().includes(lowerMessage);
    const matchesContent = article.content.toLowerCase().includes(lowerMessage);
    const matchesKeywords = article.keywords.some(k => 
      lowerMessage.includes(k) || k.includes(lowerMessage.split(' ').find(word => word.length > 3))
    );
    const matchesCategory = article.category.toLowerCase().includes(lowerMessage);
    
    return matchesTitle || matchesContent || matchesKeywords || matchesCategory;
  });

  // If we found relevant articles, provide info from them
  if (relevantArticles.length > 0) {
    const article = relevantArticles[0];
    
    // Extract first few meaningful lines from content
    const contentLines = article.content.split('\n').filter(line => {
      return line.trim() && 
             !line.startsWith('#') && 
             !line.startsWith('**') &&
             line.length > 20;
    });
    
    const preview = contentLines.slice(0, 3).join(' ').substring(0, 200);
    
    return `I found information about "${article.title}":\n\n${article.excerpt}\n\n${preview}...\n\nWould you like me to show you the full article? You can also search for "${article.title}" above.\n\n📞 Need help? Call 928-228-5769`;
  }
  
  // Fallback responses for common queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
    return 'Our services are priced transparently:\n\n• Website Development: Starting at $1,800\n• ADA Compliance: $800\n• Local SEO: $500-$1,200/month\n• Knowledge Base Setup: $2,500+\n• Content Development: $150/article\n\nWhat specific service interests you?';
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('call') || lowerMessage.includes('phone')) {
    return '📞 Phone: 928-228-5769\n📧 Email: contact@digitalallies.net\n\nOffice Hours: Monday-Friday, 9 AM - 5 PM MST\n\nFree consultations available! What time works for you?';
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'Hello! Welcome to Digital Allies. I can help you find information about our services, pricing, and how we can grow your business online. Try asking about:\n\n• ADA Compliance\n• SEO Optimization\n• Website Development\n• Tech Consulting\n\nWhat would you like to know?';
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return 'I can help you find information from our knowledge base. Try asking about:\n\n• ADA Compliance & Accessibility\n• SEO Optimization & Local SEO\n• Knowledge Base Platforms\n• Consultation Preparation\n• Pricing & Services\n\nOr call us at 928-228-5769 for immediate assistance!';
  }

  // Default response
  return `I'm here to help! I can answer questions about:\n\n• ADA Compliance\n• Website Development\n• SEO & Local SEO\n• Tech Consulting\n• Our Services & Pricing\n\nTry searching the knowledge base above or ask me a specific question. You can also call us at 928-228-5769!`;
}

// Render chat messages
function renderChatMessages() {
  const container = document.getElementById('chat-messages');
  
  let html = '';
  chatMessages.forEach(msg => {
    const isUser = msg.role === 'user';
    html += `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[80%] p-3 rounded-lg ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}">
          <p class="text-sm whitespace-pre-line">${escapeHtml(msg.content)}</p>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show typing indicator
function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'flex justify-start';
  indicator.innerHTML = `
    <div class="bg-gray-100 p-3 rounded-lg">
      <div class="flex space-x-2">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
      </div>
    </div>
  `;
  
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}
