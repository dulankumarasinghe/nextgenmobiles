// Global variables
let products = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Make products array globally accessible
window.products = products;

// Safely encode image URLs and normalize relative paths
function safeImageUrl(url) {
    try {
        if (!url) return 'https://via.placeholder.com/300x250?text=No+Image';
        if (/^(images|uploads)\//i.test(url)) {
            url = `./${url}`;
        }
        return encodeURI(url);
    } catch (_) {
        return 'https://via.placeholder.com/300x250?text=No+Image';
    }
}

// Allowed images list and mapper
const ALLOWED_IMAGES = [
    'images/15pro.jpg',
    'images/nothing.jpg',
    'images/OnePlus-12-5G-Silky-Black.jpg',
    'images/p60 pro.jpg',
    'images/pixel 8.jpg',
    'images/s24.jpg',
    'images/Sony-Xperia-1-V-Black.jpg',
    'images/Xiaomi-14-ultra-16gb-512gb-price-in-sri-lanka-600x546.jpg'
];

function mapImageForProduct(p) {
    const name = (p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    if (brand.includes('apple') || /iphone/.test(name)) return 'images/15pro.jpg';
    if (brand.includes('samsung') || /galaxy|s24/.test(name)) return 'images/s24.jpg';
    if (brand.includes('google') || /pixel/.test(name)) return 'images/pixel 8.jpg';
    if (brand.includes('oneplus')) return 'images/OnePlus-12-5G-Silky-Black.jpg';
    if (brand.includes('huawei') || /p60/.test(name)) return 'images/p60 pro.jpg';
    if (brand.includes('xiaomi')) return 'images/Xiaomi-14-ultra-16gb-512gb-price-in-sri-lanka-600x546.jpg';
    if (brand.includes('sony') || /xperia/.test(name)) return 'images/Sony-Xperia-1-V-Black.jpg';
    return 'images/nothing.jpg';
}

// Display filtered products
function displayFilteredProducts(filteredProducts) {
    const container = document.getElementById('productsContainer');
    if (!container) return; // Exit if container doesn't exist
    
    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No products found</h4>
                <p class="text-muted">Try adjusting your search terms</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Make displayFilteredProducts globally accessible
window.displayFilteredProducts = displayFilteredProducts;

// Load products from backend
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products = data.map(p => ({ ...p, image: mapImageForProduct(p) }));
        window.products = products; // Update global reference
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to static data if backend is not available
        products = getStaticProducts();
        window.products = products; // Update global reference
        displayProducts();
    }
}

// Static product data (fallback)
function getStaticProducts() {
    return [
        {
            id: 1,
            name: "iPhone 15 Pro",
            price: 999,
            image: "images/15pro.jpg",
            description: "Latest iPhone with advanced camera system",
            brand: "Apple",
            storage: "128GB",
            color: "Natural Titanium"
        },
        {
            id: 2,
            name: "Samsung Galaxy S24",
            price: 899,
            image: "images/s24.jpg",
            description: "Premium Android smartphone with AI features",
            brand: "Samsung",
            storage: "256GB",
            color: "Titanium Gray"
        },
        {
            id: 3,
            name: "Google Pixel 8",
            price: 699,
            image: "images/pixel 8.jpg",
            description: "Pure Android experience with excellent camera",
            brand: "Google",
            storage: "128GB",
            color: "Obsidian"
        },
        {
            id: 4,
            name: "OnePlus 12",
            price: 799,
            image: "images/OnePlus-12-5G-Silky-Black.jpg",
            description: "Fast charging and smooth performance",
            brand: "OnePlus",
            storage: "256GB",
            color: "Silky Black"
        },
        {
            id: 5,
            name: "Xiaomi 14",
            price: 599,
            image: "images/Xiaomi-14-ultra-16gb-512gb-price-in-sri-lanka-600x546.jpg",
            description: "Great value flagship smartphone",
            brand: "Xiaomi",
            storage: "128GB",
            color: "Black"
        },
        {
            id: 6,
            name: "Huawei P60 Pro",
            price: 899,
            image: "images/p60 pro.jpg",
            description: "Premium camera and design",
            brand: "Huawei",
            storage: "256GB",
            color: "Rococo Pearl"
        }
    ];
}

// Display products on the page
function displayProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return; // Exit if container doesn't exist
    
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Make displayProducts globally accessible
window.displayProducts = displayProducts;

// Create product card HTML
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';

    col.innerHTML = `
        <div class="card product-card h-100">
            <img src="${safeImageUrl(product.image)}" class="card-img-top product-img" alt="${product.name}" onclick="viewProduct(${product.id})" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x250?text=Image+Not+Found';">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title" onclick="viewProduct(${product.id})" style="cursor: pointer;">${product.name}</h5>
                <p class="card-text text-muted">${product.description}</p>
                <div class="mt-auto">
                    <h4 class="text-primary">$${product.price}</h4>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline-secondary" onclick="viewProduct(${product.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    return col;
}

// View product details - make globally accessible
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Make viewProduct globally accessible
window.viewProduct = viewProduct;

// Override addToCart to use products array
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Use the common addToCart function with product data
        window.addToCart(productId, product);
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
