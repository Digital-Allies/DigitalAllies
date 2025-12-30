/**
 * blog-dynamic-load.js
 * Dynamically loads blog posts from /content/blog-index.json
 * Updated to support accessibility fields (Alt Text).
 */

document.addEventListener('DOMContentLoaded', () => {
    const blogContainer = document.querySelector('#blog-posts-container'); // Ensure this ID exists in your HTML
    if (!blogContainer) return;

    fetch('/content/blog-index.json')
        .then(response => response.json())
        .then(data => {
            const posts = data.posts || [];
            
            if (posts.length === 0) {
                blogContainer.innerHTML = '<p class="text-center text-gray-500">No posts found.</p>';
                return;
            }

            // Clear loading state
            blogContainer.innerHTML = '';

            posts.forEach(post => {
                // Check if post is published (simple check)
                const publishDate = new Date(post.publishDate);
                if (publishDate > new Date()) return; 

                const article = document.createElement('article');
                article.className = 'bg-white/90 backdrop-blur rounded-2xl border border-pale-blue p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1';
                
                // Use new CMS fields: featuredImageAlt and description
                const altText = post.featuredImageAlt || post.title; 
                const excerpt = post.description || post.excerpt || 'Read more...';
                const category = post.category || 'General';
                
                article.innerHTML = `
                    <div class="mb-4">
                        <span class="bg-primary-blue text-white px-3 py-1 rounded-full text-sm font-medium">${category}</span>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-dark mb-3">
                        <a href="/content/blog/${post.slug}.html" class="hover:underline text-primary-blue">
                            ${post.title}
                        </a>
                    </h2>
                    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-medium mb-4">
                        <span>${publishDate.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>${post.readingTime || 5} min read</span>
                    </div>
                    <p class="text-gray-medium mb-6 leading-relaxed">${excerpt}</p>
                    
                    ${post.tags && post.tags.length ? `
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${post.tags.slice(0, 3).map(tag => `<span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">#${tag}</span>`).join('')}
                    </div>` : ''}

                    <a href="/content/blog/${post.slug}.html" class="inline-flex items-center text-primary-blue font-semibold hover:underline group">
                        Read More
                        <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </a>
                `;
                
                blogContainer.appendChild(article);
            });
        })
        .catch(err => {
            console.error('Error loading blog posts:', err);
            blogContainer.innerHTML = '<p class="text-center text-red-500">Unable to load posts at this time.</p>';
        });
});
