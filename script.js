// Session Management (10 minutes persistence)
const SESSION_KEY = 'fruitshop_session';
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

function setSession(email) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        email,
        loginTime: Date.now()
    }));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function getSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
        return JSON.parse(session);
    } catch {
        return null;
    }
}

function isSessionValid(session) {
    if (!session) return false;
    return (Date.now() - session.loginTime) < SESSION_DURATION;
}

// User Management with localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function addUser(userData) {
    const users = getUsers();
    users[userData.email] = {
        id: Date.now(), // Simple ID generation
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        password: userData.password // In a real app, this should be hashed
    };
    setUsers(users);
}

function getUserByEmail(email) {
    const users = getUsers();
    return users[email] || null;
}

// Show logged in user
function showLoggedInUser(email) {
    // Get user data from sessionStorage (set during login)
    const userData = sessionStorage.getItem('user');
    if (!userData) return;
    
    try {
        const user = JSON.parse(userData);
        document.getElementById('user-name').textContent = `Hello, ${user.username}`;
        document.getElementById('user-info').style.display = 'inline-block';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('auth-section').querySelector('#login-form').style.display = 'none';
        document.getElementById('auth-section').querySelector('#register-form').style.display = 'none';
        document.getElementById('auth-tabs').style.display = 'none';
        
        const nav = document.getElementById('main-nav');
        if (nav) nav.style.display = 'flex';
        
        updateCartCountFromStorage();
        updateWishlistCountFromStorage();
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
}

// Check session on page load
const session = getSession();
if (session && isSessionValid(session)) {
    showLoggedInUser(session.email);
} else {
    clearSession();
}

// Authentication UI
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Event listeners for auth tabs
if (document.getElementById('show-login') && document.getElementById('show-register')) {
    document.getElementById('show-login').onclick = showLogin;
    document.getElementById('show-register').onclick = showRegister;
}

// Registration form
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.onsubmit = async function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const address = document.getElementById('register-address').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const error = document.getElementById('register-error');
        
        error.style.display = 'none';
        
        if (password !== confirm) {
            error.textContent = 'Passwords do not match.';
            error.style.display = 'block';
            return;
        }
        
        // Call Flask backend
        try {
            const res = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, phone, address, password })
            });
            const data = await res.json();
            if (!res.ok) {
                error.textContent = data.error || 'Registration failed.';
                error.style.display = 'block';
                return;
            }
            
            alert('Registration successful! You can now log in.');
            registerForm.reset();
            showLogin();
        } catch (err) {
            console.error('Registration error:', err);
            error.textContent = 'Network error. Please try again.';
            error.style.display = 'block';
        }
    };
}

// Login form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const error = document.getElementById('login-error');
        
        error.style.display = 'none';
        
        // Call Flask backend
        try {
            const res = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                error.textContent = data.error || 'Login failed.';
                error.style.display = 'block';
                return;
            }
            
            // Save user info in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data));
            setSession(email); // Set session with email
            showLoggedInUser(email);
            loginForm.reset();
        } catch (err) {
            console.error('Login error:', err);
            error.textContent = 'Network error. Please try again.';
            error.style.display = 'block';
        }
    };
}

// Sign out
const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', function() {
        clearSession();
        sessionStorage.removeItem('user'); // Clear user data from sessionStorage
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('auth-section').querySelector('#login-form').style.display = 'block';
        document.getElementById('auth-tabs').style.display = 'block';
        
        const nav = document.getElementById('main-nav');
        if (nav) nav.style.display = 'none';
    });
}

// Fruit data for modal
const fruitData = {
    'Apple': {
        rate: '₹225 per kg',
        img: 'apple_new.jpg'
    },
    'Banana': {
        rate: '₹80 per dozen',
        img: 'banana_new.jpg'
    },
    'Orange': {
        rate: '₹100 per kg',
        img: 'orange_new.jpg'
    },
    'Strawberry': {
        rate: '₹450 per kg',
        img: 'strawberry_new.jpg'
    },
    'Grapes': {
        rate: '₹200 per kg',
        img: 'grapes_new.jpg'
    },
    'Pineapple': {
        rate: '₹150 per piece',
        img: 'pineapple_new.jpg'
    },
    'Mango': {
        rate: '₹100 per kg',
        img: 'mango_new (1).jpg'
    },
    'Watermelon': {
        rate: '₹75 per kg',
        img: 'watermelon_new.jpg'
    },
    'Papaya': {
        rate: '₹60 per kg',
        img: 'papaya_new.jpg'
    },
    'Kiwi': {
        rate: '₹200 per 3 piece',
        img: 'kiwi_new.jpg'
    },

    'Cherry': {
        rate: '₹525 per kg',
        img: 'cherry_new.jpg'
    },
    'Blueberry': {
        rate: '₹600 per kg',
        img: 'blueberry_new.jpg'
    },
    'Guava': {
        rate: '₹150 per kg',
        img: 'guava_new.jpg'
    },
    'Lemon': {
        rate: '₹100 per 15 piece',
        img: 'lemon_new.jpg'
    }
};

// Modal functionality
const fruitModal = document.getElementById('fruit-modal');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalRate = document.getElementById('modal-rate');
const modalAddCart = document.getElementById('modal-add-cart');
const modalAddWishlist = document.getElementById('modal-add-wishlist');
const modalClose = document.getElementById('modal-close');
let currentFruit = null;

// Show modal on product click
if (fruitModal) {
    document.querySelectorAll('.product').forEach(product => {
        product.addEventListener('click', function(e) {
            // Prevent modal opening if Buy Now button is clicked
            if (e.target.classList.contains('buy-now')) return;
            
            const name = product.querySelector('h3').textContent;
            const data = fruitData[name];
            if (!data) return;
            
            currentFruit = name;
            modalImg.src = data.img;
            modalName.textContent = name;
            modalRate.textContent = data.rate;
            fruitModal.style.display = 'flex';
        });
    });
    
    // Close modal
    modalClose.onclick = () => { fruitModal.style.display = 'none'; };
    fruitModal.onclick = (e) => { if (e.target === fruitModal) fruitModal.style.display = 'none'; };
}

// User-specific cart/wishlist management
function getCurrentUserEmail() {
    const session = getSession();
    return session && isSessionValid(session) ? session.email : null;
}

function getUserCartKey(email) {
    return email ? `cart_${email}` : null;
}

function getUserWishlistKey(email) {
    return email ? `wishlist_${email}` : null;
}

function getUserCart(email) {
    if (!email) return [];
    return JSON.parse(localStorage.getItem(getUserCartKey(email)) || '[]');
}

function setUserCart(email, cart) {
    if (!email) return;
    localStorage.setItem(getUserCartKey(email), JSON.stringify(cart));
}

function getUserWishlist(email) {
    if (!email) return [];
    return JSON.parse(localStorage.getItem(getUserWishlistKey(email)) || '[]');
}

function setUserWishlist(email, wishlist) {
    if (!email) return;
    localStorage.setItem(getUserWishlistKey(email), JSON.stringify(wishlist));
}

// Update cart/wishlist counts
function updateCartCountFromStorage() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const email = getCurrentUserEmail();
    let cart = getUserCart(email);
    let total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    cartCount.textContent = total;
}

function updateWishlistCountFromStorage() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (!wishlistCount) return;
    
    const email = getCurrentUserEmail();
    let wishlist = getUserWishlist(email);
    let total = wishlist.reduce((sum, item) => sum + (item.qty || 1), 0);
    wishlistCount.textContent = total;
}

// Modal add to cart/wishlist functionality
if (fruitModal) {
    modalAddCart.onclick = () => {
        const email = getCurrentUserEmail();
        if (!email) {
            alert('Please log in to add to cart!');
            return;
        }
        
        let cart = getUserCart(email);
        let found = cart.find(item => item.name === currentFruit);
        
        if (found) {
            found.qty = (found.qty || 1) + 1;
        } else {
            cart.push({ name: currentFruit, qty: 1 });
        }
        
        setUserCart(email, cart);
        alert(currentFruit + ' added to cart!');
        updateCartCountFromStorage();
    };
    
    modalAddWishlist.onclick = () => {
        const email = getCurrentUserEmail();
        if (!email) {
            alert('Please log in to add to wishlist!');
            return;
        }
        
        let wishlist = getUserWishlist(email);
        let found = wishlist.find(item => item.name === currentFruit);
        
        if (found) {
            found.qty = (found.qty || 1) + 1;
        } else {
            wishlist.push({ name: currentFruit, qty: 1 });
        }
        
        setUserWishlist(email, wishlist);
        alert(currentFruit + ' added to wishlist!');
        updateWishlistCountFromStorage();
    };
}

// QR Payment Modal functionality
const qrPaymentModal = document.getElementById('qr-payment-modal');
const qrModalClose = document.getElementById('qr-modal-close');
const qrConfirmPayment = document.getElementById('qr-confirm-payment');
const qrCancelPayment = document.getElementById('qr-cancel-payment');
let currentPurchaseData = null;

// Close QR modal
if (qrPaymentModal) {
    qrModalClose.onclick = () => { qrPaymentModal.style.display = 'none'; };
    qrPaymentModal.onclick = (e) => { if (e.target === qrPaymentModal) qrPaymentModal.style.display = 'none'; };
    qrCancelPayment.onclick = () => { qrPaymentModal.style.display = 'none'; };
}

// Show QR payment modal
function showQRPaymentModal(itemName, itemPrice, quantity = 1) {
    const total = itemPrice * quantity;
    
    document.getElementById('qr-item-name').textContent = itemName;
    document.getElementById('qr-item-price').textContent = `₹${itemPrice} × ${quantity}`;
    document.getElementById('qr-total-amount').textContent = `₹${total.toFixed(2)}`;
    
    currentPurchaseData = { itemName, itemPrice, quantity, total };
    qrPaymentModal.style.display = 'flex';
}

// Confirm payment and process purchase
if (qrConfirmPayment) {
    qrConfirmPayment.onclick = async function() {
        // Validate shipping details
        const fullName = document.getElementById('qr-full-name').value.trim();
        const phone = document.getElementById('qr-phone').value.trim();
        const altPhone = document.getElementById('qr-alt-phone').value.trim();
        const address = document.getElementById('qr-address').value.trim();
        const city = document.getElementById('qr-city').value.trim();
        const pincode = document.getElementById('qr-pincode').value.trim();
        
        // Required field validation
        if (!fullName || !phone || !address || !city || !pincode) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Phone number validation
        if (!/^[0-9]{10,15}$/.test(phone)) {
            alert('Please enter a valid phone number (10-15 digits).');
            return;
        }
        
        // Alternate phone validation (if provided)
        if (altPhone && !/^[0-9]{10,15}$/.test(altPhone)) {
            alert('Please enter a valid alternate phone number (10-15 digits).');
            return;
        }
        
        // Pincode validation
        if (!/^[0-9]{6}$/.test(pincode)) {
            alert('Please enter a valid 6-digit pincode.');
            return;
        }
        
        // Show shipping details confirmation
        const shippingDetails = {
            fullName,
            phone,
            altPhone,
            address,
            city,
            pincode
        };
        
        const confirmShipping = confirm(
            `Please confirm your shipping details:\n\n` +
            `Name: ${fullName}\n` +
            `Phone: ${phone}\n` +
            `Address: ${address}\n` +
            `City: ${city}\n` +
            `Pincode: ${pincode}\n\n` +
            `Proceed with QR payment?`
        );
        
        if (confirmShipping) {
            await processPayment('QR Payment', shippingDetails);
        }
    };
}

// Payment Method Selection Modal functionality
const paymentMethodModal = document.getElementById('payment-method-modal');
const paymentMethodClose = document.getElementById('payment-method-close');
const paymentMethodCancel = document.getElementById('payment-method-cancel');
const qrPaymentBtn = document.getElementById('qr-payment-btn');
const cardPaymentBtn = document.getElementById('card-payment-btn');
const codPaymentBtn = document.getElementById('cod-payment-btn');
let currentPaymentData = null;

// Close payment method modal
if (paymentMethodModal) {
    paymentMethodClose.onclick = () => { paymentMethodModal.style.display = 'none'; };
    paymentMethodModal.onclick = (e) => { if (e.target === paymentMethodModal) paymentMethodModal.style.display = 'none'; };
    paymentMethodCancel.onclick = () => { paymentMethodModal.style.display = 'none'; };
}

// Show payment method selection modal
function showPaymentMethodModal(itemName, itemPrice, quantity = 1) {
    const total = itemPrice * quantity;
    
    document.getElementById('pm-item-name').textContent = itemName;
    document.getElementById('pm-item-price').textContent = `₹${itemPrice} × ${quantity}`;
    document.getElementById('pm-total-amount').textContent = `₹${total.toFixed(2)}`;
    
    currentPaymentData = { itemName, itemPrice, quantity, total };
    paymentMethodModal.style.display = 'flex';
}

// Payment method button handlers
if (qrPaymentBtn) {
    qrPaymentBtn.onclick = () => {
        paymentMethodModal.style.display = 'none';
        showQRPaymentModal(currentPaymentData.itemName, currentPaymentData.itemPrice, currentPaymentData.quantity);
    };
}

if (cardPaymentBtn) {
    cardPaymentBtn.onclick = () => {
        paymentMethodModal.style.display = 'none';
        showCardPaymentModal(currentPaymentData.itemName, currentPaymentData.itemPrice, currentPaymentData.quantity);
    };
}

if (codPaymentBtn) {
    codPaymentBtn.onclick = () => {
        paymentMethodModal.style.display = 'none';
        showCODPaymentModal(currentPaymentData.itemName, currentPaymentData.itemPrice, currentPaymentData.quantity);
    };
}

// Card Payment Modal functionality
const cardPaymentModal = document.getElementById('card-payment-modal');
const cardModalClose = document.getElementById('card-modal-close');
const cardConfirmPayment = document.getElementById('card-confirm-payment');
const cardCancelPayment = document.getElementById('card-cancel-payment');

// Close card modal
if (cardPaymentModal) {
    cardModalClose.onclick = () => { cardPaymentModal.style.display = 'none'; };
    cardPaymentModal.onclick = (e) => { if (e.target === cardPaymentModal) cardPaymentModal.style.display = 'none'; };
    cardCancelPayment.onclick = () => { cardPaymentModal.style.display = 'none'; };
}

// Show card payment modal
function showCardPaymentModal(itemName, itemPrice, quantity = 1) {
    const total = itemPrice * quantity;
    
    document.getElementById('card-item-name').textContent = itemName;
    document.getElementById('card-item-price').textContent = `₹${itemPrice} × ${quantity}`;
    document.getElementById('card-total-amount').textContent = `₹${total.toFixed(2)}`;
    
    currentPaymentData = { itemName, itemPrice, quantity, total };
    cardPaymentModal.style.display = 'flex';
}

// Card payment confirmation
if (cardConfirmPayment) {
    cardConfirmPayment.onclick = async function() {
        const cardNumber = document.getElementById('card-number').value.trim();
        const cardExpiry = document.getElementById('card-expiry').value.trim();
        const cardCvv = document.getElementById('card-cvv').value.trim();
        
        if (!cardNumber || !cardExpiry || !cardCvv) {
            alert('Please fill in all card details.');
            return;
        }
        
        if (cardNumber.length < 16) {
            alert('Please enter a valid card number.');
            return;
        }
        
        if (cardCvv.length < 3) {
            alert('Please enter a valid CVV.');
            return;
        }
        
        // Process card payment
        await processPayment('Card Payment');
    };
}

// Cash on Delivery Modal functionality
const codPaymentModal = document.getElementById('cod-payment-modal');
const codModalClose = document.getElementById('cod-modal-close');
const codConfirmPayment = document.getElementById('cod-confirm-payment');
const codCancelPayment = document.getElementById('cod-cancel-payment');

// Close COD modal
if (codPaymentModal) {
    codModalClose.onclick = () => { codPaymentModal.style.display = 'none'; };
    codPaymentModal.onclick = (e) => { if (e.target === codPaymentModal) codPaymentModal.style.display = 'none'; };
    codCancelPayment.onclick = () => { codPaymentModal.style.display = 'none'; };
}

// Show COD payment modal
function showCODPaymentModal(itemName, itemPrice, quantity = 1) {
    const total = itemPrice * quantity;
    
    document.getElementById('cod-item-name').textContent = itemName;
    document.getElementById('cod-item-price').textContent = `₹${itemPrice} × ${quantity}`;
    document.getElementById('cod-total-amount').textContent = `₹${total.toFixed(2)}`;
    
    currentPaymentData = { itemName, itemPrice, quantity, total };
    codPaymentModal.style.display = 'flex';
}

// COD payment confirmation
if (codConfirmPayment) {
    codConfirmPayment.onclick = async function() {
        // Validate shipping details
        const fullName = document.getElementById('cod-full-name').value.trim();
        const phone = document.getElementById('cod-phone').value.trim();
        const altPhone = document.getElementById('cod-alt-phone').value.trim();
        const address = document.getElementById('cod-address').value.trim();
        const city = document.getElementById('cod-city').value.trim();
        const pincode = document.getElementById('cod-pincode').value.trim();
        
        // Required field validation
        if (!fullName || !phone || !address || !city || !pincode) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Phone number validation
        if (!/^[0-9]{10,15}$/.test(phone)) {
            alert('Please enter a valid phone number (10-15 digits).');
            return;
        }
        
        // Alternate phone validation (if provided)
        if (altPhone && !/^[0-9]{10,15}$/.test(altPhone)) {
            alert('Please enter a valid alternate phone number (10-15 digits).');
            return;
        }
        

        
        // Pincode validation
        if (!/^[0-9]{6}$/.test(pincode)) {
            alert('Please enter a valid 6-digit pincode.');
            return;
        }
        
        // Show shipping details confirmation
        const shippingDetails = {
            fullName,
            phone,
            altPhone,
            address,
            city,
            pincode
        };
        
        const confirmShipping = confirm(
            `Please confirm your shipping details:\n\n` +
            `Name: ${fullName}\n` +
            `Phone: ${phone}\n` +
            `Address: ${address}\n` +
            `City: ${city}\n` +
            `Pincode: ${pincode}\n\n` +
            `Proceed with order?`
        );
        
        if (confirmShipping) {
            await processPayment('Cash on Delivery', shippingDetails);
        }
    };
}

// Generic payment processing function
async function processPayment(paymentMethod, shippingDetails = null) {
    if (!currentPaymentData) return;
    
    const email = getCurrentUserEmail();
    if (!email) {
        alert('Please log in to purchase items!');
        return;
    }
    
    const userData = sessionStorage.getItem('user');
    if (!userData) {
        alert('User session not found. Please login again.');
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        const userId = user.id;
        
        // Prepare purchase data
        const purchaseData = {
            user_id: userId,
            item_name: currentPaymentData.itemName,
            quantity: currentPaymentData.quantity,
            price: currentPaymentData.itemPrice
        };
        
        // Add shipping address for COD and QR orders
        if ((paymentMethod === 'Cash on Delivery' || paymentMethod === 'QR Payment') && shippingDetails) {
            // Format shipping address as a single string
            const shippingAddress = `${shippingDetails.fullName}, ${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.pincode}, Phone: ${shippingDetails.phone}`;
            purchaseData.shipping_address = shippingAddress;
        }
        
        // Process purchase
        const res = await fetch('http://localhost:5000/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseData)
        });
        
        if (res.ok) {
            const responseData = await res.json();
            let successMessage = `${paymentMethod} successful! ${currentPaymentData.itemName} has been purchased.\nTotal: ₹${currentPaymentData.total.toFixed(2)}`;
            
            // Add order ID to success message
            if (responseData.order_id) {
                successMessage += `\n\nOrder ID: ${responseData.order_id}`;
            }
            
            // Add shipping info for COD and QR orders
            if ((paymentMethod === 'Cash on Delivery' || paymentMethod === 'QR Payment') && shippingDetails) {
                successMessage += `\n\nShipping to: ${shippingDetails.fullName}\nAddress: ${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.pincode}\nPhone: ${shippingDetails.phone}`;
            }
            
            alert(successMessage);
            
            // Close all modals
            qrPaymentModal.style.display = 'none';
            cardPaymentModal.style.display = 'none';
            codPaymentModal.style.display = 'none';
            
            // Clear form fields
            document.getElementById('card-number').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-cvv').value = '';
            
            // Clear form fields
            if (paymentMethod === 'Cash on Delivery') {
                document.getElementById('cod-full-name').value = '';
                document.getElementById('cod-phone').value = '';
                document.getElementById('cod-alt-phone').value = '';
                document.getElementById('cod-address').value = '';
                document.getElementById('cod-city').value = '';
                document.getElementById('cod-pincode').value = '';
            }
            
            // Clear QR form fields
            if (paymentMethod === 'QR Payment') {
                document.getElementById('qr-full-name').value = '';
                document.getElementById('qr-phone').value = '';
                document.getElementById('qr-alt-phone').value = '';
                document.getElementById('qr-address').value = '';
                document.getElementById('qr-city').value = '';
                document.getElementById('qr-pincode').value = '';
            }
        } else {
            const errorData = await res.json();
            alert(`Purchase failed: ${errorData.error || 'Unknown error'}`);
        }
        
    } catch (err) {
        console.error('Purchase error:', err);
        alert('Error processing purchase. Please try again.');
    }
}

// Buy Now button functionality
document.querySelectorAll('.buy-now').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent modal from opening
        const product = this.closest('.product');
        const name = product.querySelector('h3').textContent;
        const data = fruitData[name];
        
        if (!data) {
            alert('Product data not found!');
            return;
        }
        
        // Check if user is logged in
        const email = getCurrentUserEmail();
        if (!email) {
            alert('Please log in to purchase items!');
            return;
        }
        
        // Extract price from rate string (e.g., '₹225 per kg')
        const match = data.rate.match(/₹(\d+(?:\.\d+)?)/);
        const price = match ? parseFloat(match[1]) : 0;
        
        if (price === 0) {
            alert('Invalid price for this item!');
            return;
        }
        
        // Show payment method selection modal
        showPaymentMethodModal(name, price, 1);
    });
});

// --- Flask Backend Integration for Purchases ---
async function addPurchase(user_id, item_name, quantity, price) {
    const res = await fetch('http://localhost:5000/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, item_name, quantity, price })
    });
    const data = await res.json();
    if (!res.ok) {
        alert(data.error || 'Purchase failed.');
        return;
    }
    alert('Purchase successful!');
}

// Initialize counts on page load
updateCartCountFromStorage();
updateWishlistCountFromStorage(); 