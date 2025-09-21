// Global variables
let products = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Make products array globally accessible
window.products = products;

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
        products = await response.json();
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
            image: "https://via.placeholder.com/300x300?text=iPhone+15+Pro",
            description: "Latest iPhone with advanced camera system",
            brand: "Apple",
            storage: "128GB",
            color: "Natural Titanium"
        },
        {
            id: 2,
            name: "Samsung Galaxy S24",
            price: 899,
            image: "https://via.placeholder.com/300x300?text=Galaxy+S24",
            description: "Premium Android smartphone with AI features",
            brand: "Samsung",
            storage: "256GB",
            color: "Titanium Gray"
        },
        {
            id: 3,
            name: "Google Pixel 8",
            price: 699,
            image: "https://via.placeholder.com/300x300?text=Pixel+8",
            description: "Pure Android experience with excellent camera",
            brand: "Google",
            storage: "128GB",
            color: "Obsidian"
        },
        {
            id: 4,
            name: "OnePlus 12",
            price: 799,
            image: "https://via.placeholder.com/300x300?text=OnePlus+12",
            description: "Fast charging and smooth performance",
            brand: "OnePlus",
            storage: "256GB",
            color: "Silky Black"
        },
        {
            id: 5,
            name: "Xiaomi 14",
            price: 599,
            image: "https://via.placeholder.com/300x300?text=Xiaomi+14",
            description: "Great value flagship smartphone",
            brand: "Xiaomi",
            storage: "128GB",
            color: "Black"
        },
        {
            id: 6,
            name: "Huawei P60 Pro",
            price: 899,
            image: "https://via.placeholder.com/300x300?text=P60+Pro",
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
            <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;" onclick="viewProduct(${product.id})">
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
