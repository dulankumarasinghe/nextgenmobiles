from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import json
import os
import uuid
from datetime import datetime
import hashlib
import secrets

# Serve static files directly from project root so index.html, common.js, etc. are available at '/'
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Static product data (no database as requested)
PRODUCTS = [
    {
        "id": 1,
        "name": "iPhone 15 Pro",
        "price": 999,
        "image": "https://via.placeholder.com/300x300?text=iPhone+15+Pro",
        "description": "Latest iPhone with advanced camera system",
        "brand": "Apple",
        "storage": "128GB",
        "color": "Natural Titanium"
    },
    {
        "id": 2,
        "name": "Samsung Galaxy S24",
        "price": 899,
        "image": "https://via.placeholder.com/300x300?text=Galaxy+S24",
        "description": "Premium Android smartphone with AI features",
        "brand": "Samsung",
        "storage": "256GB",
        "color": "Titanium Gray"
    },
    {
        "id": 3,
        "name": "Google Pixel 8",
        "price": 699,
        "image": "https://via.placeholder.com/300x300?text=Pixel+8",
        "description": "Pure Android experience with excellent camera",
        "brand": "Google",
        "storage": "128GB",
        "color": "Obsidian"
    },
    {
        "id": 4,
        "name": "OnePlus 12",
        "price": 799,
        "image": "https://via.placeholder.com/300x300?text=OnePlus+12",
        "description": "Fast charging and smooth performance",
        "brand": "OnePlus",
        "storage": "256GB",
        "color": "Silky Black"
    },
    {
        "id": 5,
        "name": "Xiaomi 14",
        "price": 599,
        "image": "https://via.placeholder.com/300x300?text=Xiaomi+14",
        "description": "Great value flagship smartphone",
        "brand": "Xiaomi",
        "storage": "128GB",
        "color": "Black"
    },
    {
        "id": 6,
        "name": "Huawei P60 Pro",
        "price": 899,
        "image": "https://via.placeholder.com/300x300?text=P60+Pro",
        "description": "Premium camera and design",
        "brand": "Huawei",
        "storage": "256GB",
        "color": "Rococo Pearl"
    },
    {
        "id": 7,
        "name": "Sony Xperia 1 V",
        "price": 1299,
        "image": "https://via.placeholder.com/300x300?text=Xperia+1+V",
        "description": "Professional camera smartphone",
        "brand": "Sony",
        "storage": "256GB",
        "color": "Black"
    },
    {
        "id": 8,
        "name": "Nothing Phone 2",
        "price": 599,
        "image": "https://via.placeholder.com/300x300?text=Nothing+Phone+2",
        "description": "Unique transparent design",
        "brand": "Nothing",
        "storage": "128GB",
        "color": "White"
    }
]

# In-memory storage (no database)
orders = []
order_counter = 1
users = []
user_files = {}
contacts = []

# Sample users for demo
users = [
    {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": hashlib.sha256("password123".encode()).hexdigest(),
        "phone": "+1 (555) 123-4567",
        "address": "123 Main St, City, State 12345",
        "birthDate": "1990-01-01",
        "createdAt": "2024-01-01T00:00:00Z"
    }
]

# Sample orders for demo
orders = [
    {
        "id": 1,
        "userId": 1,
        "orderNumber": "ORD-2024-001",
        "date": "2024-01-15",
        "status": "delivered",
        "total": 999.00,
        "items": [
            {
                "id": 1,
                "name": "iPhone 15 Pro",
                "price": 999,
                "quantity": 1,
                "image": "https://via.placeholder.com/60x60?text=iPhone+15+Pro"
            }
        ],
        "shippingAddress": "123 Main St, City, State 12345",
        "trackingNumber": "TRK123456789"
    }
]

@app.route('/')
def index():
    """Serve the main HTML page"""
    return app.send_static_file('index.html')

@app.route('/api/products')
def get_products():
    """Get all products"""
    return jsonify(PRODUCTS)

@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    """Get a specific product by ID"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/search')
def search_products():
    """Search products by name or brand"""
    query = request.args.get('q', '')
    if not query:
        return jsonify(PRODUCTS)
    
    # Detect common SQL injection patterns in the search query and return a flag for CTF
    q_lower = query.lower()
    sqli_patterns = ["' or ", '" or ', "'--", '/*', '*/', '--', ';', ' union ', ' select ', ' drop ', ' insert ', ' update ', ' delete ']
    if any(pat in q_lower for pat in sqli_patterns) or "'1'='1" in q_lower or ' or 1=1' in q_lower:
        return jsonify({
            'message': 'SQL Injection detected in search!',
            'flag': 'THM{SQL_INJECTION_SUCCESS}',
            'vulnerability': 'SQL Injection',
            'description': 'You successfully exploited the SQL injection vulnerability in the products search endpoint!',
            'payload': query,
            'exploit_type': 'Query manipulation in search parameter'
        })
    
    filtered_products = [
        p for p in PRODUCTS 
        if q_lower in p['name'].lower() or q_lower in p['brand'].lower()
    ]
    return jsonify(filtered_products)

@app.route('/api/products/filter')
def filter_products():
    """Filter products by brand, price range, etc."""
    brand = request.args.get('brand')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    filtered_products = PRODUCTS.copy()
    
    if brand:
        filtered_products = [p for p in filtered_products if p['brand'].lower() == brand.lower()]
    
    if min_price is not None:
        filtered_products = [p for p in filtered_products if p['price'] >= min_price]
    
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p['price'] <= max_price]
    
    return jsonify(filtered_products)

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    global order_counter
    
    try:
        data = request.get_json()
        
        if not data or 'items' not in data:
            return jsonify({'error': 'Invalid order data'}), 400
        
        # Validate order items and calculate total
        total_amount = 0
        order_items = []
        for item in data['items']:
            product = next((p for p in PRODUCTS if p['id'] == item['id']), None)
            if not product:
                return jsonify({'error': f'Product {item["id"]} not found'}), 400
            
            item_total = product['price'] * item['quantity']
            total_amount += item_total
            
            order_items.append({
                'id': product['id'],
                'name': product['name'],
                'price': product['price'],
                'quantity': item['quantity'],
                'image': product['image']
            })
        
        # Create order
        order = {
            'id': order_counter,
            'userId': 1,  # In real app, get from JWT token
            'orderNumber': f'ORD-2024-{order_counter:03d}',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'status': 'pending',
            'total': total_amount,
            'items': order_items,
            'shippingAddress': data.get('shipping_address', ''),
            'trackingNumber': None,
            'createdAt': datetime.now().isoformat() + 'Z'
        }
        
        orders.append(order)
        order_counter += 1
        
        return jsonify({
            'message': 'Order created successfully',
            'order_id': order['id'],
            'order_number': order['orderNumber'],
            'total_amount': total_amount
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<int:order_id>')
def get_order(order_id):
    """Get order by ID"""
    order = next((o for o in orders if o['id'] == order_id), None)
    if order:
        return jsonify(order)
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete order - VULNERABLE TO CSRF"""
    try:
        # VULNERABLE: No CSRF token validation
        # In real scenario, should check CSRF token
        
        # Check if order exists
        order = next((o for o in orders if o['id'] == order_id), None)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check for CSRF exploitation (missing CSRF token)
        csrf_token = request.headers.get('X-CSRF-Token')
        if not csrf_token:
            # CSRF vulnerability detected - return flag
            return jsonify({
                'message': 'CSRF Vulnerability Detected!',
                'flag': 'THM{CSRF_EXPLOIT_SUCCESS}',
                'vulnerability': 'Cross-Site Request Forgery (CSRF)',
                'description': 'You successfully exploited the CSRF vulnerability by deleting an order without proper CSRF protection!',
                'deleted_order_id': order_id,
                'exploit_type': 'CSRF on state-changing action (order deletion)'
            }), 200
        
        # Normal deletion logic (if CSRF token was provided)
        orders.remove(order)
        return jsonify({'message': 'Order deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/brands')
def get_brands():
    """Get all available brands"""
    brands = list(set(product['brand'] for product in PRODUCTS))
    return jsonify(sorted(brands))

@app.route('/api/stats')
def get_stats():
    """Get basic statistics"""
    total_products = len(PRODUCTS)
    total_orders = len(orders)
    # 'total' is the key used in created orders; avoid KeyError on 'total_amount'
    total_revenue = sum(order.get('total', 0) for order in orders)
    
    return jsonify({
        'total_products': total_products,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'average_order_value': (total_revenue / total_orders) if total_orders > 0 else 0
    })

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if any(user['email'] == data['email'] for user in users):
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        new_user = {
            'id': len(users) + 1,
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': data['email'],
            'password': hashlib.sha256(data['password'].encode()).hexdigest(),
            'phone': data.get('phone', ''),
            'address': data.get('address', ''),
            'birthDate': data.get('birthDate', ''),
            'createdAt': datetime.now().isoformat() + 'Z'
        }
        
        users.append(new_user)
        
        # Return user without password
        user_response = {k: v for k, v in new_user.items() if k != 'password'}
        return jsonify({
            'message': 'User registered successfully',
            'user': user_response
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user - VULNERABLE TO SQL INJECTION"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # VULNERABLE SQL QUERY - Simulating SQL injection vulnerability
        # In real scenario, this would be: f"SELECT * FROM users WHERE email='{email}' AND password='{password}'"
        sql_query = f"SELECT * FROM users WHERE email='{email}' AND password='{password}'"
        
        # Check for SQL injection patterns (simulated detection for CTF)
        payload = f"{email}|{password}"
        payload_lower = payload.lower()
        sql_patterns = ["'", '"', ';', '--', '/*', '*/', ' union ', ' select ', ' drop ', ' insert ', ' update ', ' delete ', " or ", "' or '"]
        if any(pattern.strip() in payload_lower for pattern in sql_patterns) or "'1'='1" in payload_lower or ' or 1=1' in payload_lower:
            # SQL Injection detected - return flag
            return jsonify({
                'message': 'SQL Injection detected!',
                'flag': 'THM{SQL_INJECTION_SUCCESS}',
                'vulnerability': 'SQL Injection',
                'description': 'You successfully exploited the SQL injection vulnerability in the login form!',
                'sql_query': sql_query,
                'payload': payload
            }), 200
        
        # Normal login logic
        user = next((u for u in users if u['email'] == email), None)
        if not user or user['password'] != hashlib.sha256(password.encode()).hexdigest():
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate token (simple implementation)
        token = secrets.token_urlsafe(32)
        
        # Return user without password
        user_response = {k: v for k, v in user.items() if k != 'password'}
        return jsonify({
            'message': 'Login successful',
            'user': user_response,
            'token': token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User profile endpoints
@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    """Update user profile - VULNERABLE TO IDOR"""
    try:
        data = request.get_json()
        user_id = data.get('id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # VULNERABLE: No proper authorization check - allows IDOR
        # In real scenario, should verify user can only edit their own profile
        
        # Check for IDOR exploitation (trying to edit another user's profile)
        if user_id != 1:  # Default user ID is 1
            return jsonify({
                'message': 'IDOR Vulnerability Detected!',
                'flag': 'THM{IDOR_EXPLOIT_SUCCESS}',
                'vulnerability': 'Insecure Direct Object Reference (IDOR)',
                'description': 'You successfully exploited the IDOR vulnerability by accessing another user\'s profile!',
                'target_user_id': user_id,
                'exploit_type': 'Profile modification without authorization'
            }), 200
        
        # Find user
        user = next((u for u in users if u['id'] == user_id), None)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user data
        for key, value in data.items():
            if key not in ['id', 'password', 'createdAt']:
                user[key] = value
        
        # Return updated user without password
        user_response = {k: v for k, v in user.items() if k != 'password'}
        return jsonify(user_response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# IDOR GET endpoint to fetch arbitrary user profile by ID via URL (CTF helper)
@app.route('/api/user/profile/<int:user_id>')
def get_profile_by_id(user_id):
    """Get user profile by ID - VULNERABLE TO IDOR (for CTF)"""
    try:
        # VULNERABLE: No authorization check
        if user_id != 1:
            return jsonify({
                'message': 'IDOR Vulnerability Detected!',
                'flag': 'THM{IDOR_EXPLOIT_SUCCESS}',
                'vulnerability': 'Insecure Direct Object Reference (IDOR)',
                'description': "You successfully exploited the IDOR vulnerability by accessing another user's profile via URL parameter!",
                'target_user_id': user_id,
                'exploit_type': 'Profile access without authorization'
            }), 200
        
        # Return the demo user (id 1) when requested
        user = next((u for u in users if u['id'] == 1), None)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user_response = {k: v for k, v in user.items() if k != 'password'}
        return jsonify(user_response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/orders')
def get_user_orders():
    """Get orders for authenticated user"""
    try:
        # In a real app, you'd get user_id from JWT token
        user_id = 1  # Demo user ID
        
        user_orders = [order for order in orders if order.get('userId') == user_id]
        return jsonify(user_orders)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# File upload endpoints
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload file (intentionally vulnerable to unrestricted file upload for CTF)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Always save the file regardless of extension (VULNERABLE BRANCH when not allowed)
        is_allowed = allowed_file(file.filename)
        filename = str(uuid.uuid4()) + '_' + file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Store file info
        file_info = {
            'id': str(uuid.uuid4()),
            'filename': file.filename,
            'saved_filename': filename,
            'filepath': filepath,
            'size': os.path.getsize(filepath),
            'upload_date': datetime.now().isoformat() + 'Z'
        }
        
        # In a real app, you'd associate this with the user
        user_id = 1
        if user_id not in user_files:
            user_files[user_id] = []
        user_files[user_id].append(file_info)
        
        if is_allowed:
            # Normal (non-flag) success for allowed extensions
            return jsonify({
                'message': 'File uploaded successfully',
                'file': file_info
            })
        else:
            # VULNERABILITY: Unrestricted file upload accepted
            return jsonify({
                'message': 'Unrestricted File Upload Vulnerability Detected!',
                'flag': 'THM{UNRESTRICTED_FILE_UPLOAD_SUCCESS}',
                'vulnerability': 'Unrestricted File Upload',
                'description': 'You uploaded a disallowed file type and the server accepted and stored it.',
                'exploit_type': 'Missing server-side validation on file type',
                'file': file_info
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/files')
def get_user_files():
    """Get user's uploaded files"""
    try:
        user_id = 1  # Demo user ID
        files = user_files.get(user_id, [])
        return jsonify(files)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Contact endpoints
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Submit contact form - VULNERABLE TO STORED XSS"""
    try:
        data = request.get_json()
        
        # Check for XSS patterns in the message field
        xss_patterns = ['<script>', '</script>', 'javascript:', 'onload=', 'onerror=', 'onclick=', 'alert(', 'document.cookie']
        message = data.get('message', '')
        
        if any(pattern in message.lower() for pattern in xss_patterns):
            # XSS detected - return flag
            return jsonify({
                'message': 'Stored XSS Vulnerability Detected!',
                'flag': 'THM{STORED_XSS_SUCCESS}',
                'vulnerability': 'Stored Cross-Site Scripting (XSS)',
                'description': 'You successfully exploited the stored XSS vulnerability in the contact form!',
                'payload': message,
                'exploit_type': 'Stored XSS in contact message field'
            }), 200
        
        contact_message = {
            'id': len(contacts) + 1,
            'firstName': data.get('firstName'),
            'lastName': data.get('lastName'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'subject': data.get('subject'),
            'message': message,  # VULNERABLE: No HTML sanitization
            'newsletter': data.get('newsletter', False),
            'submittedAt': datetime.now().isoformat() + 'Z'
        }
        
        contacts.append(contact_message)
        
        return jsonify({
            'message': 'Contact form submitted successfully',
            'contactId': contact_message['id']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting NextGen Mobiles Backend...")
    print("Available endpoints:")
    print("- GET  /api/products - Get all products")
    print("- GET  /api/products/<id> - Get specific product")
    print("- GET  /api/products/search?q=query - Search products")
    print("- GET  /api/products/filter?brand=X&min_price=Y&max_price=Z - Filter products")
    print("- POST /api/orders - Create new order")
    print("- GET  /api/orders/<id> - Get order by ID")
    print("- GET  /api/brands - Get all brands")
    print("- GET  /api/stats - Get statistics")
    print("\nFrontend will be available at: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
