// Shared JavaScript functions for Mobile Shop
// This file contains common functions used across all pages

// Global cart management
let cart = [];

// Initialize cart from localStorage
function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add product to cart
function addToCart(productId, productData = null) {
    // If productData is provided, use it; otherwise find in products array
    let product = productData;
    if (!product && typeof products !== 'undefined') {
        product = products.find(p => p.id === productId);
    }
    
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

// Update quantity in cart
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartDisplay();
    }
}

// Update cart display
function updateCartDisplay() {
    updateCartBadge();
    updateCartModal();
}

// Update cart badge
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Update cart modal content
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="row align-items-center">
                <div class="col-2">
                    <img src="${item.image}" class="img-fluid rounded" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
                </div>
                <div class="col-4">
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">$${item.price}</small>
                </div>
                <div class="col-3">
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="btn btn-outline-secondary btn-sm disabled">${item.quantity}</span>
                        <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="col-2">
                    <h6 class="mb-0">$${itemTotal.toFixed(2)}</h6>
                </div>
                <div class="col-1">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = total.toFixed(2);
}

// Checkout function
async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const user = localStorage.getItem('user');
    if (!user) {
        alert('Please login to complete your order!');
        window.location.href = 'login.html';
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const orderData = {
            items: cart.map(item => ({
                id: item.id,
                quantity: item.quantity
            })),
            customer_name: JSON.parse(user).firstName + ' ' + JSON.parse(user).lastName,
            customer_email: JSON.parse(user).email
        };

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            const message = `Thank you for your order!\n\nOrder ID: ${result.order_id}\nTotal: $${total.toFixed(2)}\n\nYour order has been placed successfully.`;
            alert(message);
            
            // Clear cart
            cart = [];
            localStorage.removeItem('cart');
            updateCartDisplay();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            if (modal) modal.hide();
            
            // Redirect to orders page
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1000);
        } else {
            throw new Error('Failed to create order');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to process order. Please try again.');
    }
}

// Authentication functions
function checkAuthStatus() {
    const user = localStorage.getItem('user');
    const userDropdown = document.getElementById('userDropdown');
    const loginNav = document.getElementById('loginNav');
    const userName = document.getElementById('userName');

    if (user) {
        const userData = JSON.parse(user);
        if (userName) userName.textContent = userData.firstName || 'User';
        if (userDropdown) userDropdown.style.display = 'block';
        if (loginNav) loginNav.style.display = 'none';
    } else {
        if (userDropdown) userDropdown.style.display = 'none';
        if (loginNav) loginNav.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Search functionality
function searchProducts(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (!query) {
        if (typeof displayProducts === 'function') {
            displayProducts();
        }
        return;
    }
    
    // Use window.products if available, otherwise try to get from global products
    const productsArray = window.products || (typeof products !== 'undefined' ? products : []);
    
    if (productsArray.length > 0) {
        const filteredProducts = productsArray.filter(product => 
            product.name.toLowerCase().includes(query) ||
            (product.brand && product.brand.toLowerCase().includes(query)) ||
            product.description.toLowerCase().includes(query)
        );
        
        if (typeof displayFilteredProducts === 'function') {
            displayFilteredProducts(filteredProducts);
        } else if (typeof displayProducts === 'function') {
            // Fallback: temporarily replace products array and call displayProducts
            const originalProducts = window.products;
            window.products = filteredProducts;
            displayProducts();
            window.products = originalProducts;
        }
    }
}

// Navigation functions
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Notification system
function showNotification(message, type = 'success') {
    const alertClass = type === 'error' ? 'alert-danger' : 
                      type === 'success' ? 'alert-success' : 'alert-info';
    
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i> 
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Initialize common functionality
function initializeCommon() {
    initializeCart();
    updateCartDisplay();
    checkAuthStatus();
}

// Auto-initialize when DOM is loaded
// Show vulnerability flag modal (shared)
function showVulnerabilityFlag(data) {
    const flagModal = document.createElement('div');
    flagModal.className = 'modal fade';
    flagModal.id = 'flagModal';
    flagModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-flag"></i> Vulnerability Exploited!
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-success">
                        <h4><i class="fas fa-trophy"></i> Flag Captured!</h4>
                        <h2 class="text-center text-primary">${data.flag}</h2>
                    </div>
                    ${data.vulnerability ? `<h5>Vulnerability: ${data.vulnerability}</h5>` : ''}
                    ${data.description ? `<p>${data.description}</p>` : ''}
                    ${data.sql_query ? `<p><strong>SQL Query:</strong> <code>${data.sql_query}</code></p>` : ''}
                    ${data.payload ? `<p><strong>Payload:</strong> <code>${data.payload}</code></p>` : ''}
                    ${data.target_user_id ? `<p><strong>Target User ID:</strong> ${data.target_user_id}</p>` : ''}
                    ${data.deleted_order_id ? `<p><strong>Deleted Order ID:</strong> ${data.deleted_order_id}</p>` : ''}
                    ${data.exploit_type ? `<p><strong>Exploit Type:</strong> ${data.exploit_type}</p>` : ''}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>`;

    document.body.appendChild(flagModal);
    const modal = new bootstrap.Modal(flagModal);
    modal.show();

    flagModal.addEventListener('hidden.bs.modal', function() {
        if (flagModal.parentElement) {
            flagModal.remove();
        }
    });
}

// Expose globally
window.showVulnerabilityFlag = showVulnerabilityFlag;

document.addEventListener('DOMContentLoaded', initializeCommon);
