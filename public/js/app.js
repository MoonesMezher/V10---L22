/* FoodHub SPA — see public/js/app.js */
const State = {
    user: null,
    cart: JSON.parse(localStorage.getItem('foodhub_cart') || '[]')
};

const FOOD_EMOJIS = ['🍕', '🍔', '🍣', '🌮', '🍜', '🥗', '🍱', '🥘', '🍛', '🥙'];
const REST_EMOJIS = ['🍽️', '🏪', '🥡', '🍳', '🫕', '🥂'];

function emojiFromId(id, list) {
    if (!id) return list[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return list[Math.abs(hash) % list.length];
}

function formatPrice(val) {
    return `$${parseFloat(val || 0).toFixed(2)}`;
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function saveCart() {
    localStorage.setItem('foodhub_cart', JSON.stringify(State.cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const count = State.cart.reduce((s, i) => s + i.count, 0);
    if (count > 0) { badge.hidden = false; badge.textContent = count; }
    else { badge.hidden = true; }
}

function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

function showModal(title, html, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    modal.innerHTML = `<h2>${title}</h2>${html}<div class="modal-actions">
        <button class="btn btn-ghost btn-sm" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary btn-sm" id="modal-confirm">Confirm</button>
    </div>`;
    overlay.hidden = false;
    document.getElementById('modal-cancel').onclick = () => { overlay.hidden = true; };
    document.getElementById('modal-confirm').onclick = async () => { await onConfirm(); overlay.hidden = true; };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.hidden = true; };
}

function loading() {
    return `<div class="loading"><div class="spinner"></div><p>Loading...</p></div>`;
}

function emptyState(icon, title, text, btnHtml = '') {
    return `<div class="empty-state"><div class="empty-state-icon">${icon}</div><h3>${title}</h3><p>${text}</p>${btnHtml}</div>`;
}

function statusBadge(status) {
    return `<span class="status-badge status-${status}">${status.replace(/-/g, ' ')}</span>`;
}

const ORDER_STEPS = ['pending', 'accepted', 'in-progress', 'on-the-way', 'completed'];

function orderTimeline(status) {
    const idx = ORDER_STEPS.indexOf(status);
    return `<div class="order-timeline">${ORDER_STEPS.map((step, i) => {
        let cls = i < idx ? 'done' : i === idx ? 'active' : '';
        return `<div class="timeline-step ${cls}"><div class="timeline-dot">${i < idx ? '✓' : i + 1}</div><span>${step.replace(/-/g, ' ')}</span></div>`;
    }).join('')}</div>`;
}

function parseErrors(err) {
    if (err.data?.errors) return err.data.errors.map(e => e.message).join(', ');
    if (typeof err.data === 'string') return err.data;
    return err.message || 'Something went wrong';
}

function requireAuth(role) {
    if (!State.user) { toast('Please sign in first', 'warning'); navigate('#/login'); return false; }
    if (role && State.user.role !== role) { toast('You do not have access to this page', 'error'); navigate('#/'); return false; }
    return true;
}

function updateNav() {
    const loginBtn = document.getElementById('btn-login');
    const registerBtn = document.getElementById('btn-register');
    const userMenu = document.getElementById('user-menu');
    const ownerLink = document.querySelector('.nav-owner');
    const driverLink = document.querySelector('.nav-driver');
    const authLinks = document.querySelectorAll('.nav-auth');

    if (State.user) {
        loginBtn.hidden = registerBtn.hidden = true;
        userMenu.hidden = false;
        document.getElementById('user-name').textContent = State.user.name;
        document.getElementById('user-avatar').textContent = State.user.name.charAt(0).toUpperCase();
        authLinks.forEach(el => el.hidden = false);
        ownerLink.hidden = State.user.role !== 'resturant-owner';
        driverLink.hidden = State.user.role !== 'driver';
    } else {
        loginBtn.hidden = registerBtn.hidden = false;
        userMenu.hidden = true;
        authLinks.forEach(el => el.hidden = true);
        ownerLink.hidden = driverLink.hidden = true;
    }
    updateCartBadge();
}

async function loadUser() {
    try {
        const res = await API.auth.profile();
        State.user = res.data || null;
    } catch {
        State.user = null;
    }
    updateNav();
}

document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
        await API.auth.logout();
        State.user = null;
        updateNav();
        toast('Signed out successfully', 'success');
        navigate('#/');
    } catch (err) { toast(parseErrors(err), 'error'); }
});

document.getElementById('user-menu-btn').addEventListener('click', () => {
    document.getElementById('user-menu').classList.toggle('open');
});
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) document.getElementById('user-menu').classList.remove('open');
});
document.getElementById('mobile-toggle').addEventListener('click', () => {
    document.getElementById('navbar').classList.toggle('open');
});

const main = document.getElementById('main-content');
function navigate(hash) { window.location.hash = hash; }

function parseRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    return { path: parts[0] || 'home', params: parts.slice(1) };
}

function setActiveNav() {
    const route = parseRoute();
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href').slice(2);
        link.classList.toggle('active', href === route.path || (route.path === 'home' && href === ''));
    });
}

async function render() {
    setActiveNav();
    const { path, params } = parseRoute();
    document.getElementById('navbar').classList.remove('open');
    main.innerHTML = loading();

    const pages = {
        home: renderHome, login: renderLogin, register: renderRegister,
        restaurant: () => renderRestaurant(params[0]), cart: renderCart,
        orders: () => params[0] ? renderOrderDetail(params[0]) : renderOrders,
        profile: renderProfile, owner: renderOwnerDashboard, driver: renderDriverDashboard
    };

    try {
        const pageFn = pages[path] || pages.home;
        main.innerHTML = typeof pageFn === 'function' ? await pageFn() : await pageFn;
        bindAll();
    } catch (err) {
        main.innerHTML = emptyState('😕', 'Something went wrong', parseErrors(err), `<a href="#/" class="btn btn-primary">Go Home</a>`);
    }
}

window.addEventListener('hashchange', render);
window.addEventListener('load', async () => { await loadUser(); render(); });

async function renderHome() {
    const restaurants = (await API.resturants.getAll()).data || [];
    const cards = restaurants.map(r => `
        <a href="#/restaurant/${r._id}" class="card">
            <div class="card-img">${r.photo && r.photo !== 'img.png' ? `<img src="${r.photo}" alt="${r.title}">` : emojiFromId(r._id, REST_EMOJIS)}</div>
            <div class="card-body"><h3>${r.title}</h3><p>${r.descrption || r.address || 'Great food awaits'}</p>
                <div class="card-meta"><span class="rating">★ ${r.avgRate || 'New'}</span><span>📍 ${r.address}</span></div>
            </div>
        </a>`).join('');

    return `<section class="hero"><div class="container"><div class="hero-content">
        <h1>Craving something delicious?</h1>
        <p>Discover top-rated restaurants near you. Order your favorite meals and get them delivered fast.</p>
        <div class="hero-actions">
            <a href="#/" class="btn btn-primary btn-lg">Browse Restaurants</a>
            ${!State.user ? '<a href="#/register" class="btn btn-ghost btn-lg">Create Account</a>' : ''}
        </div></div><div class="hero-visual">🍕</div></div></section>
        <div class="container"><div class="page-header"><h1>Restaurants Near You</h1>
        <p>${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} available</p></div>
        ${restaurants.length ? `<div class="grid grid-3">${cards}</div>` : emptyState('🏪', 'No restaurants yet', 'Restaurant owners can add restaurants from the dashboard.', State.user?.role === 'resturant-owner' ? '<a href="#/owner" class="btn btn-primary">Go to Dashboard</a>' : '')}
        </div>`;
}

function renderLogin() {
    if (State.user) { navigate('#/'); return ''; }
    return `<div class="container form-page"><div class="form-card"><h1>Welcome back</h1><p class="subtitle">Sign in to your FoodHub account</p>
        <div id="login-error" class="form-error" hidden></div>
        <form id="login-form"><div class="form-group"><label>Email</label><input type="email" id="login-email" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="login-password" required></div>
        <button type="submit" class="btn btn-primary btn-block">Sign In</button></form>
        <p class="form-footer">Don't have an account? <a href="#/register">Sign up</a></p></div></div>`;
}

function renderRegister() {
    if (State.user) { navigate('#/'); return ''; }
    return `<div class="container form-page"><div class="form-card"><h1>Create account</h1><p class="subtitle">Join FoodHub and start ordering</p>
        <div id="register-error" class="form-error" hidden></div>
        <form id="register-form">
        <div class="form-group"><label>Full Name</label><input type="text" id="reg-name" required minlength="3" maxlength="30"></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="reg-phone" required></div>
        <div class="form-group"><label>Email</label><input type="email" id="reg-email" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="reg-password" required><small>Min 8 chars, 1 number, 1 uppercase, 1 symbol, 2 lowercase</small></div>
        <button type="submit" class="btn btn-primary btn-block">Create Account</button></form>
        <p class="form-footer">Already have an account? <a href="#/login">Sign in</a></p></div></div>`;
}

async function renderRestaurant(id) {
    if (!id) { navigate('#/'); return ''; }
    const res = await API.resturants.getOne(id);
    const restaurant = res.data;
    const sections = res.sections || [];
    let menuHtml = '';

    for (const section of sections) {
        const dishes = (await API.dishs.getAll(section._id)).data || [];
        menuHtml += `<h2 class="section-title">${section.title}</h2>`;
        if (!dishes.length) { menuHtml += `<p style="color:var(--text-muted);margin-bottom:24px">No dishes yet.</p>`; continue; }
        menuHtml += `<div class="dish-list">${dishes.map(d => `
            <div class="dish-item ${d.available ? '' : 'unavailable'}">
                <div class="dish-item-img">${emojiFromId(d._id, FOOD_EMOJIS)}</div>
                <div class="dish-item-info"><h4>${d.title}</h4><p>${d.descrption || 'Delicious dish'}</p></div>
                <span class="dish-price">${formatPrice(d.price)}</span>
                ${d.available ? `<button class="btn btn-primary btn-sm add-dish-btn" data-id="${d._id}" data-title="${d.title}" data-price="${d.price}" data-restaurant="${restaurant._id}" data-restaurant-name="${restaurant.title}">Add</button>` : ''}
            </div>`).join('')}</div>`;
    }

    const reviews = (await API.rates.getAll(id)).data || [];
    return `<div class="container"><div class="restaurant-header">
        <div class="restaurant-header-img">${emojiFromId(restaurant._id, REST_EMOJIS)}</div>
        <div class="restaurant-header-info"><h1>${restaurant.title}</h1><p>${restaurant.descrption || ''}</p>
        <div class="card-meta"><span class="rating">★ ${restaurant.avgRate || 'New'}</span><span>📍 ${restaurant.address}</span></div></div></div>
        ${sections.length ? menuHtml : emptyState('📋', 'Menu coming soon', 'No menu items yet.')}
        ${reviews.length ? `<h2 class="section-title">Reviews</h2>${reviews.map(r => `<div class="review-card"><div class="review-header"><span>${r.userId?.name || 'Customer'}</span><span class="rating">★ ${r.stars}</span></div><p>${r.comment || ''}</p></div>`).join('')}` : ''}
        </div>`;
}

async function renderCart() {
    if (!requireAuth()) return '';
    if (!State.cart.length) return `<div class="container">${emptyState('🛒', 'Your cart is empty', 'Browse restaurants and add dishes.', '<a href="#/" class="btn btn-primary">Browse</a>')}</div>`;
    const subtotal = State.cart.reduce((s, i) => s + i.price * i.count, 0);
    const total = subtotal + 2.99;
    return `<div class="container"><div class="page-header"><h1>Your Cart</h1><p>${State.cart[0].resturantName}</p></div>
        <div class="cart-layout"><div class="cart-items">${State.cart.map((item, idx) => `
            <div class="cart-item"><div class="cart-item-info"><h4>${item.title}</h4><span class="price">${formatPrice(item.price)} each</span></div>
            <div class="qty-control"><button class="qty-minus" data-idx="${idx}">−</button><span>${item.count}</span><button class="qty-plus" data-idx="${idx}">+</button></div>
            <span class="dish-price">${formatPrice(item.price * item.count)}</span>
            <button class="cart-remove" data-idx="${idx}">✕</button></div>`).join('')}
        </div><div class="cart-summary"><h3>Order Summary</h3>
            <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
            <div class="summary-row"><span>Delivery</span><span>${formatPrice(2.99)}</span></div>
            <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
            <button class="btn btn-primary btn-block" id="checkout-btn" style="margin-top:20px">Place Order</button>
            <button class="btn btn-ghost btn-block" id="clear-cart-btn" style="margin-top:8px">Clear Cart</button>
        </div></div></div>`;
}

async function renderOrders() {
    if (!requireAuth()) return '';
    const orders = (await API.orders.getAll()).data || [];
    if (!orders.length) return `<div class="container">${emptyState('📦', 'No orders yet', 'Order history appears here.', '<a href="#/" class="btn btn-primary">Order Now</a>')}</div>`;
    return `<div class="container"><div class="page-header"><h1>My Orders</h1></div>${orders.map(o => `
        <div class="order-card"><div class="order-card-header"><div><h3>${o.resturantId?.title || 'Restaurant'}</h3>
        <span class="order-id">#${o._id.slice(-8).toUpperCase()}</span></div>${statusBadge(o.status)}</div>
        <div class="card-meta"><span>${formatDate(o.createdAt)}</span><span>${formatPrice(o.total)}</span></div>
        <div style="margin-top:16px"><a href="#/orders/${o._id}" class="btn btn-outline btn-sm">Details</a>
        ${o.status === 'pending' ? `<button class="btn btn-ghost btn-sm cancel-order" data-id="${o._id}">Cancel</button>` : ''}</div></div>`).join('')}</div>`;
}

async function renderOrderDetail(id) {
    if (!requireAuth()) return '';
    const res = await API.orders.getOne(id);
    const order = res.data;
    const items = res.items || [];
    let rateSection = '';
    if (order.status === 'completed' && State.user.role === 'customer') {
        rateSection = `<div class="form-card" style="margin-top:24px" id="rate-section"><h3>Rate this order</h3>
            <div class="star-rating" id="star-rating">${[1,2,3,4,5].map(n => `<button type="button" data-star="${n}">★</button>`).join('')}</div>
            <div class="form-group"><textarea id="rate-comment" rows="3" placeholder="Optional comment"></textarea></div>
            <button class="btn btn-primary btn-sm" id="submit-rate">Submit Review</button></div>`;
    }
    return `<div class="container"><a href="#/orders" style="color:var(--text-muted)">← Back</a>
        <div class="page-header" style="margin-top:16px"><h1>Order #${order._id.slice(-8).toUpperCase()}</h1></div>
        ${order.status !== 'canceled' ? orderTimeline(order.status) : statusBadge(order.status)}
        <div class="order-card">${items.map(i => `<div class="summary-row"><span>${i.dishId?.title || 'Dish'} × ${i.count}</span><span>${formatPrice(i.total)}</span></div>`).join('')}
        <div class="summary-row total"><span>Total</span><span>${formatPrice(order.total)}</span></div></div>${rateSection}</div>`;
}

async function renderProfile() {
    if (!requireAuth()) return '';
    const user = State.user;
    return `<div class="container"><div class="page-header"><h1>My Profile</h1></div>
        <div class="profile-layout"><div class="profile-sidebar"><div class="profile-avatar-lg">${user.name.charAt(0).toUpperCase()}</div>
        <h3>${user.name}</h3><span class="profile-role">${user.role.replace('-', ' ')}</span></div>
        <div class="profile-details">
            <div class="detail-row"><label>Email</label><span>${user.email}</span></div>
            <div class="detail-row"><label>Phone</label><span>${user.phone || '—'}</span></div>
            <div class="detail-row"><label>Address</label><span>${user.address || '—'}</span></div>
        </div></div></div>`;
}

async function renderOwnerDashboard() {
    if (!requireAuth('resturant-owner')) return '';
    const restaurants = (await API.resturants.getAll()).data || [];
    const sections = (await API.sections.getAll()).data || [];
    let allDishes = [];
    for (const s of sections) allDishes = allDishes.concat((await API.dishs.getAll(s._id)).data || []);
    let orders = [];
    for (const r of restaurants) {
        try { orders = orders.concat((await API.orders.getAll({ resturantId: r._id })).data || []); } catch {}
    }

    return `<div class="container"><div class="page-header"><h1>Restaurant Dashboard</h1></div>
        <div class="dashboard-tabs">
            <button class="tab-btn active" data-tab="restaurants">Restaurants</button>
            <button class="tab-btn" data-tab="sections">Sections</button>
            <button class="tab-btn" data-tab="dishes">Dishes</button>
            <button class="tab-btn" data-tab="orders">Orders</button>
        </div>
        <div class="tab-panel active" id="tab-restaurants"><div class="panel-header"><h2>Restaurants</h2><button class="btn btn-primary btn-sm" id="add-restaurant-btn">+ Add</button></div>
        ${restaurants.length ? `<table class="data-table"><thead><tr><th>Name</th><th>Address</th><th>Rating</th><th>Actions</th></tr></thead><tbody>
        ${restaurants.map(r => `<tr><td>${r.title}</td><td>${r.address}</td><td>★ ${r.avgRate || 0}</td><td class="table-actions">
        <button class="btn-delete delete-restaurant" data-id="${r._id}">Delete</button></td></tr>`).join('')}</tbody></table>` : emptyState('🏪', 'No restaurants', 'Add your first restaurant.')}</div>
        <div class="tab-panel" id="tab-sections"><div class="panel-header"><h2>Sections</h2><button class="btn btn-primary btn-sm" id="add-section-btn">+ Add</button></div>
        ${sections.length ? `<table class="data-table"><thead><tr><th>Title</th><th>Restaurant</th></tr></thead><tbody>
        ${sections.map(s => `<tr><td>${s.title}</td><td>${s.resturantId?.title || ''}</td></tr>`).join('')}</tbody></table>` : emptyState('📋', 'No sections', '')}</div>
        <div class="tab-panel" id="tab-dishes"><div class="panel-header"><h2>Dishes</h2><button class="btn btn-primary btn-sm" id="add-dish-btn">+ Add</button></div>
        ${allDishes.length ? `<table class="data-table"><thead><tr><th>Name</th><th>Price</th></tr></thead><tbody>
        ${allDishes.map(d => `<tr><td>${d.title}</td><td>${formatPrice(d.price)}</td></tr>`).join('')}</tbody></table>` : emptyState('🍽️', 'No dishes', '')}</div>
        <div class="tab-panel" id="tab-orders">${orders.length ? orders.map(o => `<div class="order-card"><div class="order-card-header"><h3>#${o._id.slice(-8).toUpperCase()}</h3>${statusBadge(o.status)}</div>
        ${o.status === 'pending' ? `<button class="btn btn-success btn-sm accept-order" data-id="${o._id}">Accept</button>` : ''}
        ${o.status === 'accepted' ? `<button class="btn btn-primary btn-sm progress-order" data-id="${o._id}">Prepare</button>` : ''}
        ${o.status === 'in-progress' ? `<button class="btn btn-primary btn-sm ready-order" data-id="${o._id}">Ready</button>` : ''}</div>`).join('') : emptyState('📦', 'No orders', '')}</div></div>`;
}

async function renderDriverDashboard() {
    if (!requireAuth('driver')) return '';
    const available = (await API.orders.getAll({ available: 'true' })).data || [];
    const myOrders = ((await API.orders.getAll()).data || []).filter(o => o.status !== 'completed' && o.status !== 'canceled');
    return `<div class="container"><div class="page-header"><h1>Delivery Dashboard</h1></div>
        <h2>Available</h2>${available.length ? available.map(o => `<div class="order-card"><h3>${o.resturantId?.title}</h3><p>${formatPrice(o.total)}</p>
        <button class="btn btn-primary btn-sm accept-delivery" data-id="${o._id}">Accept</button></div>`).join('') : emptyState('🚗', 'None available', '')}
        <h2 style="margin-top:32px">Active</h2>${myOrders.length ? myOrders.map(o => `<div class="order-card">${statusBadge(o.status)}${orderTimeline(o.status)}
        ${o.status === 'on-the-way' ? `<button class="btn btn-success btn-sm complete-delivery" data-id="${o._id}">Delivered</button>` : ''}</div>`).join('') : emptyState('📦', 'No active deliveries', '')}</div>`;
}

function bindAll() {
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('login-error');
        try {
            State.user = (await API.auth.login({ email: document.getElementById('login-email').value, password: document.getElementById('login-password').value })).user;
            updateNav(); toast(`Welcome, ${State.user.name}!`, 'success'); navigate('#/');
        } catch (err) { errEl.textContent = parseErrors(err); errEl.hidden = false; }
    });

    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('register-error');
        try {
            await API.auth.register({ name: document.getElementById('reg-name').value, phone: document.getElementById('reg-phone').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-password').value });
            toast('Account created! Sign in.', 'success'); navigate('#/login');
        } catch (err) { errEl.textContent = parseErrors(err); errEl.hidden = false; }
    });

    document.querySelectorAll('.add-dish-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const { id, title, price, restaurant, restaurantName } = btn.dataset;
            if (State.cart[0]?.resturantId && State.cart[0].resturantId !== restaurant) { toast('One restaurant per order', 'warning'); return; }
            const existing = State.cart.find(i => i.dishId === id);
            if (existing) existing.count++; else State.cart.push({ dishId: id, title, price: parseFloat(price), count: 1, resturantId: restaurant, resturantName: restaurantName });
            saveCart(); toast(`${title} added`, 'success');
        });
    });

    document.querySelectorAll('.qty-minus').forEach(btn => { btn.addEventListener('click', () => { const i = +btn.dataset.idx; State.cart[i].count > 1 ? State.cart[i].count-- : State.cart.splice(i, 1); saveCart(); render(); }); });
    document.querySelectorAll('.qty-plus').forEach(btn => { btn.addEventListener('click', () => { State.cart[+btn.dataset.idx].count++; saveCart(); render(); }); });
    document.querySelectorAll('.cart-remove').forEach(btn => { btn.addEventListener('click', () => { State.cart.splice(+btn.dataset.idx, 1); saveCart(); render(); }); });
    document.getElementById('clear-cart-btn')?.addEventListener('click', () => { State.cart = []; saveCart(); render(); });
    document.getElementById('checkout-btn')?.addEventListener('click', async () => {
        try {
            await API.orders.add({ resturantId: State.cart[0].resturantId, items: State.cart.map(i => ({ dishId: i.dishId, count: i.count })) });
            State.cart = []; saveCart(); toast('Order placed!', 'success'); navigate('#/orders');
        } catch (err) { toast(parseErrors(err), 'error'); }
    });

    document.querySelectorAll('.cancel-order').forEach(btn => { btn.addEventListener('click', async () => { await API.orders.cancel(btn.dataset.id); toast('Canceled', 'success'); render(); }); });

    let selectedStars = 0;
    const stars = document.querySelectorAll('#star-rating button');
    stars.forEach(btn => { btn.addEventListener('click', () => { selectedStars = +btn.dataset.star; stars.forEach((s, i) => s.classList.toggle('active', i < selectedStars)); }); });
    document.getElementById('submit-rate')?.addEventListener('click', async () => {
        if (!selectedStars) return toast('Select a rating', 'warning');
        const orderId = parseRoute().params[0];
        const order = (await API.orders.getOne(orderId)).data;
        try {
            await API.rates.add({ stars: selectedStars, comment: document.getElementById('rate-comment').value, resturantId: order.resturantId._id || order.resturantId, orderId });
            toast('Review submitted!', 'success'); document.getElementById('rate-section')?.remove();
        } catch (err) { toast(parseErrors(err), 'error'); }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    document.getElementById('add-restaurant-btn')?.addEventListener('click', () => {
        showModal('Add Restaurant', `<div class="form-group"><label>Title</label><input id="m-title"></div>
            <div class="form-group"><label>Description</label><textarea id="m-desc"></textarea></div>
            <div class="form-group"><label>Address</label><input id="m-address"></div>
            <div class="form-group"><label>Location</label><input id="m-location" placeholder="lat,lng"></div>`, async () => {
            await API.resturants.add({ title: document.getElementById('m-title').value, descrption: document.getElementById('m-desc').value, address: document.getElementById('m-address').value, location: document.getElementById('m-location').value });
            toast('Added', 'success'); render();
        });
    });

    document.getElementById('add-section-btn')?.addEventListener('click', async () => {
        const opts = ((await API.resturants.getAll()).data || []).map(r => `<option value="${r._id}">${r.title}</option>`).join('');
        showModal('Add Section', `<div class="form-group"><label>Restaurant</label><select id="m-restaurant">${opts}</select></div>
            <div class="form-group"><label>Title</label><input id="m-title"></div>`, async () => {
            await API.sections.add({ resturantId: document.getElementById('m-restaurant').value, title: document.getElementById('m-title').value });
            toast('Added', 'success'); render();
        });
    });

    document.getElementById('add-dish-btn')?.addEventListener('click', async () => {
        const opts = ((await API.sections.getAll()).data || []).map(s => `<option value="${s._id}">${s.title}</option>`).join('');
        showModal('Add Dish', `<div class="form-group"><label>Section</label><select id="m-section">${opts}</select></div>
            <div class="form-group"><label>Title</label><input id="m-title"></div>
            <div class="form-group"><label>Price</label><input id="m-price" type="number" step="0.01"></div>`, async () => {
            await API.dishs.add({ sectionId: document.getElementById('m-section').value, title: document.getElementById('m-title').value, price: document.getElementById('m-price').value, available: true });
            toast('Added', 'success'); render();
        });
    });

    document.querySelectorAll('.delete-restaurant').forEach(btn => {
        btn.addEventListener('click', () => showModal('Delete?', '<p>Confirm delete</p>', async () => { await API.resturants.remove(btn.dataset.id); render(); }));
    });
    document.querySelectorAll('.accept-order').forEach(btn => { btn.addEventListener('click', async () => { await API.orders.update(btn.dataset.id, { status: 'accepted' }); render(); }); });
    document.querySelectorAll('.progress-order').forEach(btn => { btn.addEventListener('click', async () => { await API.orders.update(btn.dataset.id, { status: 'in-progress' }); render(); }); });
    document.querySelectorAll('.ready-order').forEach(btn => { btn.addEventListener('click', async () => { await API.orders.update(btn.dataset.id, { status: 'on-the-way' }); render(); }); });
    document.querySelectorAll('.accept-delivery').forEach(btn => { btn.addEventListener('click', async () => { await API.orders.update(btn.dataset.id, { driverId: State.user._id, status: 'on-the-way' }); render(); }); });
    document.querySelectorAll('.complete-delivery').forEach(btn => { btn.addEventListener('click', async () => { await API.orders.update(btn.dataset.id, { status: 'completed' }); render(); }); });
}
