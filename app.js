const PRODUCTS = window.NOVATREND_PRODUCTS || [];
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxAt7-osMmZbPYXvCBU3gotzBX_CkNNKh0qO9Gg0q39pCUCttzHIgegZ344x9iHuwzQQ/exec';
const STORE_EMAIL = 'nethun.exe@gmail.com';
const DEMO_ADMIN = { email: 'admin@gmail.com', password: 'nethun123', name: 'NovaTrend Admin', role: 'admin' };

const state = {
  filtered: [...PRODUCTS],
  visible: 24,
  cart: JSON.parse(localStorage.getItem('novatrend_cart') || '[]'),
  coupon: JSON.parse(localStorage.getItem('novatrend_coupon') || 'null'),
  user: JSON.parse(localStorage.getItem('novatrend_user') || 'null'),
  orders: JSON.parse(localStorage.getItem('novatrend_orders') || '[]'),
  reviews: JSON.parse(localStorage.getItem('novatrend_reviews') || 'null') || [
    { name: 'Sahan', rating: 5, text: 'Super clean site and my order arrived quickly. The checkout was very easy.' },
    { name: 'Ayesha', rating: 5, text: 'Love the product variety. Searching and filtering is really smooth.' },
    { name: 'Kavin', rating: 4.5, text: 'The new arrivals section is addictive. Good prices and great presentation.' },
    { name: 'Mihiri', rating: 5, text: 'I liked the simple cash-on-delivery checkout. Very clear from cart to order.' }
  ]
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => `$${Number(n).toFixed(2)}`;
const save = () => {
  localStorage.setItem('novatrend_cart', JSON.stringify(state.cart));
  localStorage.setItem('novatrend_coupon', JSON.stringify(state.coupon));
  localStorage.setItem('novatrend_orders', JSON.stringify(state.orders));
  localStorage.setItem('novatrend_reviews', JSON.stringify(state.reviews));
};

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2600);
}

function imageOrPlaceholder(url, alt = '') {
  return `<img src="${url}" alt="${alt}" loading="lazy" onerror="this.src='https://picsum.photos/seed/novatrend/500/500'">`;
}

function categories() { return [...new Set(PRODUCTS.map(p => p.category))]; }

function renderCategories() {
  const images = Object.fromEntries(PRODUCTS.map(p => [p.category, p.image]));
  $('#categoryGrid').innerHTML = categories().map(c => `<button class="category-card" data-category="${c}">${imageOrPlaceholder(images[c], c)}<div><b>${c}</b><small>Shop Now</small></div><span>→</span></button>`).join('');
  $('#categoryFilters').innerHTML = categories().map(c => `<label class="check"><input type="checkbox" value="${c}" data-cat-filter> ${c}</label>`).join('');
}

function stars(r) {
  const full = Math.round(r);
  return '★'.repeat(Math.min(full, 5)) + '☆'.repeat(Math.max(0, 5 - full));
}

function card(p) {
  const salePrice = p.discount ? p.price * (1 - p.discount / 100) : p.price;
  return `<article class="product-card" data-id="${p.id}">
    <button class="card-heart" data-heart="${p.id}" aria-label="Save">♡</button>
    <button class="product-image" data-product="${p.id}">${p.discount ? `<span class="discount">-${p.discount}%</span>` : ''}${p.badge ? `<span class="badge ${p.badge === 'Hot Deal' ? 'hot' : ''}">${p.badge}</span>` : ''}${imageOrPlaceholder(p.image, p.name)}</button>
    <div class="product-info"><div class="category-label">${p.category}</div><button class="product-name" data-product="${p.id}">${p.name}</button><div class="rating"><span>${stars(p.rating)}</span> <small>${p.rating} (${p.reviews})</small></div><div class="price-line"><b>${money(salePrice)}</b>${p.discount ? `<del>${money(p.price)}</del><span>${p.discount}% OFF</span>` : ''}</div><div class="card-actions"><button class="mini-btn" data-product="${p.id}">Quick View</button><button class="cart-mini" data-add="${p.id}">Add to Cart</button></div></div>
  </article>`;
}

function renderHomeProducts() {
  $('#newProducts').innerHTML = PRODUCTS.filter(p => p.isNew).slice(0, 4).map(card).join('');
  $('#bestProducts').innerHTML = PRODUCTS.filter(p => p.isBest).sort((a,b)=>b.rating-a.rating).slice(0, 3).map(card).join('');
}

function applyFilters() {
  const query = ($('#searchInput')?.value || '').trim().toLowerCase();
  const cats = $$('[data-cat-filter]:checked').map(x => x.value);
  const maxPrice = Number($('#priceRange')?.value || 500);
  const minRating = Number($('[data-rating].active')?.dataset.rating || 0);
  let arr = PRODUCTS.filter(p => {
    const sale = p.price * (1 - p.discount / 100);
    return (!query || `${p.name} ${p.category}`.toLowerCase().includes(query)) && (!cats.length || cats.includes(p.category)) && sale <= maxPrice && p.rating >= minRating;
  });
  const sort = $('#sortSelect')?.value || 'featured';
  if (sort === 'price-asc') arr.sort((a,b) => (a.price*(1-a.discount/100))-(b.price*(1-b.discount/100)));
  if (sort === 'price-desc') arr.sort((a,b) => (b.price*(1-b.discount/100))-(a.price*(1-a.discount/100)));
  if (sort === 'rating') arr.sort((a,b)=>b.rating-a.rating || b.reviews-a.reviews);
  if (sort === 'discount') arr.sort((a,b)=>b.discount-a.discount);
  state.filtered = arr; state.visible = 24;
  renderShop();
}

function renderShop() {
  const visible = state.filtered.slice(0, state.visible);
  $('#allProducts').innerHTML = visible.map(card).join('') || `<div class="empty-state"><h3>No products found</h3><p>Try another search or clear the filters.</p></div>`;
  $('#shopSummary').textContent = `${state.filtered.length} products found`;
  $('#loadMore').style.display = state.visible < state.filtered.length ? 'block' : 'none';
}

function cartItems() {
  return state.cart.map(item => ({...item, p: PRODUCTS.find(p=>p.id===item.id)})).filter(x=>x.p);
}
function cartTotals() {
  const subtotal = cartItems().reduce((s,{p,qty})=>s + p.price*(1-p.discount/100)*qty, 0);
  const discount = state.coupon?.percent ? subtotal * (state.coupon.percent/100) : 0;
  return { subtotal, discount, total: Math.max(0, subtotal-discount) };
}
function updateCartCount() { $('#cartCount').textContent = state.cart.reduce((s,x)=>s+x.qty,0); }

function renderCart() {
  const items = cartItems();
  $('#cartBody').innerHTML = items.length ? items.map(({p,qty})=>`<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div class="cart-item-main"><b>${p.name}</b><small>${money(p.price*(1-p.discount/100))}</small><div class="qty"><button data-qty="${p.id}" data-dir="-1">−</button><span>${qty}</span><button data-qty="${p.id}" data-dir="1">+</button><button class="remove" data-remove="${p.id}">Remove</button></div></div><b>${money(p.price*(1-p.discount/100)*qty)}</b></div>`).join('') : `<div class="empty-state"><h3>Your cart is empty</h3><p>Add a few products and come back here.</p></div>`;
  const {subtotal,discount,total} = cartTotals();
  $('#cartSubtotal').textContent = money(subtotal);
  $('#cartDiscount').textContent = `-${money(discount)}`;
  $('#cartTotal').textContent = money(total);
  $('#couponMsg').textContent = state.coupon ? `${state.coupon.code} applied — ${state.coupon.percent}% off` : '';
  updateCartCount();
}

function addToCart(id, qty = 1) {
  const found = state.cart.find(x=>x.id===id);
  if (found) found.qty += qty; else state.cart.push({id, qty});
  save(); renderCart(); toast('Added to cart');
}
function updateQty(id, delta) {
  const item = state.cart.find(x=>x.id===id); if (!item) return;
  item.qty += delta; if (item.qty <= 0) state.cart = state.cart.filter(x=>x.id!==id);
  save(); renderCart();
}

function applyCoupon(code) {
  const map = { NETHUN10: 10, SAVE10: 10, SAVE20: 20, NOVA30: 30 };
  const clean = (code || '').trim().toUpperCase();
  if (!clean) { state.coupon = null; toast('Coupon removed'); }
  else if (map[clean]) { state.coupon = {code: clean, percent: map[clean]}; toast(`${clean} applied`); }
  else { toast('Invalid coupon code'); return; }
  save(); renderCart(); populateCheckout();
}

function openModal(id) { const el = $('#'+id); el.classList.add('open'); el.setAttribute('aria-hidden','false'); }
function closeModal(id) { const el = $('#'+id); el.classList.remove('open'); el.setAttribute('aria-hidden','true'); }

function openProduct(id) {
  const p = PRODUCTS.find(x=>x.id===id); if (!p) return;
  const sale = p.price*(1-p.discount/100);
  $('#productDetail').innerHTML = `<div class="detail-gallery"><img src="${p.image}" alt="${p.name}"><div class="thumb-row">${p.images.map(src=>`<img src="${src}" alt="${p.name}">`).join('')}</div></div><div class="detail-copy"><span class="category-label">${p.category}</span><h2>${p.name}</h2><div class="rating"><span>${stars(p.rating)}</span> <small>${p.rating} · ${p.reviews} reviews</small></div><div class="detail-price"><b>${money(sale)}</b>${p.discount?`<del>${money(p.price)}</del><span>- ${p.discount}%</span>`:''}</div><p>${p.description}</p><ul class="feature-list"><li>Fast delivery</li><li>30-day easy returns</li><li>Secure checkout</li><li>Cash on Delivery available</li></ul><div class="detail-actions"><div class="qty-box"><button id="detailMinus">−</button><span id="detailQty">1</span><button id="detailPlus">+</button></div><button class="btn light" id="detailAdd">Add to Cart</button><button class="btn primary" id="detailBuy">Buy Now</button></div></div>`;
  let qty = 1;
  $('#detailMinus').onclick = ()=>{ qty=Math.max(1,qty-1); $('#detailQty').textContent=qty; };
  $('#detailPlus').onclick = ()=>{ qty++; $('#detailQty').textContent=qty; };
  $('#detailAdd').onclick = ()=>{ addToCart(id,qty); closeModal('productModal'); };
  $('#detailBuy').onclick = ()=>{ addToCart(id,qty); closeModal('productModal'); openCart(); setTimeout(openCheckout, 150); };
  openModal('productModal');
}

function openCart() { renderCart(); $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); }

function populateCheckout() {
  const items = cartItems();
  $('#checkoutItems').innerHTML = items.length ? items.map(({p,qty})=>`<div class="summary-item"><span>${p.name} × ${qty}</span><b>${money(p.price*(1-p.discount/100)*qty)}</b></div>`).join('') : '<p class="muted">No products in cart.</p>';
  const {subtotal,discount,total} = cartTotals();
  $('#checkoutSubtotal').textContent=money(subtotal); $('#checkoutDiscount').textContent=`-${money(discount)}`; $('#checkoutTotal').textContent=money(total);
  $('#checkoutCoupon').value = state.coupon?.code || '';
  if (state.user) {
    $('#checkName').value = state.user.name || '';
    $('#checkEmail').value = state.user.email || '';
  }
}
function openCheckout() {
  if (!state.cart.length) { toast('Your cart is empty'); return; }
  closeCart(); populateCheckout(); openModal('checkoutModal');
}

async function sendToAppsScript(payload) {
  try {
    const body = new URLSearchParams({ payload: JSON.stringify(payload) });
    const res = await fetch(SCRIPT_URL, { method: 'POST', body });
    return res.ok;
  } catch (e) { return false; }
}

function showProfile() {
  if (!state.user) { openModal('accountModal'); return; }
  $('#profileName').textContent = state.user.name || 'NovaTrend Customer';
  $('#profileEmail').textContent = state.user.email;
  $('#profileAvatar').textContent = (state.user.name || 'N').charAt(0).toUpperCase();
  renderOrders(); openModal('profileModal');
}
function renderOrders() {
  const mine = state.orders.filter(o => !state.user || o.email === state.user.email);
  $('#ordersList').innerHTML = mine.length ? '<h4>Your Orders</h4>' + mine.slice().reverse().map(o => '<div class="order-row"><div><b>#' + o.orderId + '</b><small>' + new Date(o.createdAt).toLocaleString() + '</small></div><div><b>' + money(o.total) + '</b><span class="status">' + o.status + '</span></div></div>').join('') : '<p class="muted">No orders yet. Your completed orders will appear here.</p>';
}

function login(email, password) {
  if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
    state.user = {name: DEMO_ADMIN.name,email:DEMO_ADMIN.email,role:'admin'};
  } else {
    const users = JSON.parse(localStorage.getItem('novatrend_users') || '[]');
    const user = users.find(u=>u.email===email && u.password===password);
    if (!user) { toast('Invalid email or password'); return false; }
    state.user = user;
  }
  localStorage.setItem('novatrend_user', JSON.stringify(state.user));
  closeModal('accountModal'); toast(`Welcome, ${state.user.name}`); updateAccountUI(); return true;
}
function updateAccountUI() {
  $('#accountBtn').textContent = state.user ? '◉' : '♙';
}

function renderReviews() {
  $('#reviewGrid').innerHTML = state.reviews.map(r=>`<article class="review-card"><div class="review-top"><div class="avatar">${r.name.charAt(0)}</div><div><b>${r.name}</b><div class="rating"><span>${stars(r.rating)}</span></div></div></div><p>“${r.text}”</p><small>Verified shopper</small></article>`).join('');
}

function updateCountdown() {
  const end = localStorage.getItem('novatrend_sale_end') || String(Date.now() + 36*60*60*1000); localStorage.setItem('novatrend_sale_end', end);
  const remaining = Math.max(0, Number(end)-Date.now());
  const sec = Math.floor(remaining/1000), d=Math.floor(sec/86400), h=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60), s=sec%60;
  $('#countdown').textContent = `${String(d).padStart(2,'0')} : ${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`;
}

function routeTo(route) {
  if (route === 'shop') document.querySelector('#shop').scrollIntoView({behavior:'smooth'});
  if (route === 'new') document.querySelector('#new').scrollIntoView({behavior:'smooth'});
  if (route === 'best') document.querySelector('#best').scrollIntoView({behavior:'smooth'});
  if (route === 'reviews') document.querySelector('#reviews').scrollIntoView({behavior:'smooth'});
  if (route === 'about') document.querySelector('#about').scrollIntoView({behavior:'smooth'});
  if (route === 'home') window.scrollTo({top:0, behavior:'smooth'});
}

function bind() {
  document.addEventListener('click', (e)=>{
    const productBtn = e.target.closest('[data-product]'); if (productBtn) { openProduct(Number(productBtn.dataset.product)); return; }
    const addBtn = e.target.closest('[data-add]'); if (addBtn) { addToCart(Number(addBtn.dataset.add)); return; }
    const cat = e.target.closest('[data-category]'); if (cat) { $('#searchInput').value=''; $$('[data-cat-filter]').forEach(x=>x.checked=false); const target=$(`[data-cat-filter][value="${cat.dataset.category}"]`); if(target) target.checked=true; applyFilters(); routeTo('shop'); return; }
    const heart = e.target.closest('[data-heart]'); if (heart) { heart.classList.toggle('active'); heart.textContent = heart.classList.contains('active') ? '♥' : '♡'; return; }
    const qty = e.target.closest('[data-qty]'); if (qty) { updateQty(Number(qty.dataset.qty), Number(qty.dataset.dir)); return; }
    const rem = e.target.closest('[data-remove]'); if (rem) { state.cart=state.cart.filter(x=>x.id!==Number(rem.dataset.remove)); save(); renderCart(); return; }
    const close = e.target.closest('[data-close]'); if(close) closeModal(close.dataset.close);
    const route = e.target.closest('[data-route]'); if (route) { e.preventDefault(); routeTo(route.dataset.route); $('#mobileNav').classList.remove('open'); }
  });

  $('#cartBtn').onclick=openCart; $('#closeCart').onclick=closeCart; $('#overlay').onclick=closeCart; $('#checkoutBtn').onclick=openCheckout;
  $('#accountBtn').onclick=showProfile; $('#searchBtn').onclick=()=>{ routeTo('shop'); $('#searchInput').focus(); };
  $('#menuBtn').onclick=()=>$('#mobileNav').classList.toggle('open');
  $('#loadMore').onclick=()=>{ state.visible += 24; renderShop(); };
  $('#filterToggle').onclick=()=>$('#filterPanel').classList.toggle('open');
  $('#searchInput').addEventListener('input', applyFilters); $('#sortSelect').addEventListener('change', applyFilters); $('#priceRange').addEventListener('input', ()=>{ $('#priceValue').textContent=money($('#priceRange').value); applyFilters(); });
  $$('#ratingFilters button').forEach(b=>b.onclick=()=>{ $$('#ratingFilters button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); applyFilters(); });
  $$('#categoryFilters input').forEach(x=>x.addEventListener('change', applyFilters));
  $('#clearFilters').onclick=()=>{ $('#searchInput').value=''; $('#priceRange').value=500; $('#priceValue').textContent='$500'; $$('#categoryFilters input').forEach(x=>x.checked=false); $$('#ratingFilters button').forEach(x=>x.classList.remove('active')); $('[data-rating="0"]').classList.add('active'); $('#sortSelect').value='featured'; applyFilters(); };
  $('#applyCoupon').onclick=()=>applyCoupon($('#couponInput').value); $('#applyCheckoutCoupon').onclick=()=>applyCoupon($('#checkoutCoupon').value);
  $('#flashSaleBtn').onclick=()=>{ $('#priceRange').value=300; $('#priceValue').textContent='$300'; $('#sortSelect').value='discount'; applyFilters(); routeTo('shop'); };
  $('#summerBtn').onclick=()=>{ const target=$('[data-cat-filter][value="Fashion"]'); $$('#categoryFilters input').forEach(x=>x.checked=false); if(target) target.checked=true; applyFilters(); routeTo('shop'); };
  $('#reviewBtn').onclick=()=>{ if(state.user) $('#reviewName').value=state.user.name; openModal('reviewModal'); };
  $('#ordersBtn').onclick=()=>$('#ordersList').scrollIntoView({behavior:'smooth'});
  $('#logoutBtn').onclick=()=>{ state.user=null; localStorage.removeItem('novatrend_user'); closeModal('profileModal'); updateAccountUI(); toast('Logged out successfully'); };

  $$('[data-account-tab]').forEach(btn=>btn.onclick=()=>{
    $$('[data-account-tab]').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
    const login = btn.dataset.accountTab==='login'; $('#loginPanel').classList.toggle('hidden',!login); $('#registerPanel').classList.toggle('hidden',login);
  });

  $('#loginForm').onsubmit=(e)=>{ e.preventDefault(); login($('#loginEmail').value.trim(), $('#loginPassword').value); };
  $('#registerForm').onsubmit=(e)=>{
    e.preventDefault(); const users=JSON.parse(localStorage.getItem('novatrend_users')||'[]'); const user={name:$('#regName').value.trim(),email:$('#regEmail').value.trim().toLowerCase(),password:$('#regPassword').value,role:'customer'};
    if(users.some(u=>u.email===user.email)){ toast('An account with that email already exists'); return; } users.push(user); localStorage.setItem('novatrend_users',JSON.stringify(users)); state.user=user; localStorage.setItem('novatrend_user',JSON.stringify(user)); closeModal('accountModal'); updateAccountUI(); toast('Account created');
  };

  $('#reviewForm').onsubmit=async(e)=>{e.preventDefault(); const r={name:$('#reviewName').value.trim(),rating:Number($('#reviewRating').value),text:$('#reviewText').value.trim()}; state.reviews.unshift(r); save(); renderReviews(); closeModal('reviewModal'); $('#reviewForm').reset(); toast('Review published'); await sendToAppsScript({type:'review', review:r, storeEmail:STORE_EMAIL, createdAt:new Date().toISOString()});};

  $('#checkoutForm').onsubmit=async(e)=>{
    e.preventDefault(); if(!state.cart.length){ toast('Your cart is empty'); closeModal('checkoutModal'); return; }
    const {subtotal,discount,total}=cartTotals();
    const payment = document.querySelector('input[name="payment"]:checked')?.value || 'Cash on Delivery';
    const order={
      orderId:'NT'+Date.now().toString().slice(-8), createdAt:new Date().toISOString(), name:$('#checkName').value.trim(), email:$('#checkEmail').value.trim(), phone:$('#checkPhone').value.trim(), address:$('#checkAddress').value.trim(), address2:$('#checkAddress2').value.trim(), payment, coupon:state.coupon?.code||'', items:cartItems().map(({p,qty})=>({id:p.id,name:p.name,category:p.category,qty,price:Number((p.price*(1-p.discount/100)).toFixed(2))})), subtotal:Number(subtotal.toFixed(2)), discount:Number(discount.toFixed(2)), total:Number(total.toFixed(2)), status:'Successful Order', storeEmail:STORE_EMAIL
    };
    state.orders.push(order); save();
    const sent=await sendToAppsScript({type:'order',order});
    state.cart=[]; state.coupon=null; save(); renderCart(); closeModal('checkoutModal');
    if(state.user && state.user.email===order.email){ /* keep profile */ }
    alert(`Order placed successfully!\n\nOrder ID: ${order.orderId}\nTotal: ${money(order.total)}\nPayment: Cash on Delivery\n\nYour order is saved in My Orders.\n${sent?'Google Sheets notification sent.':'Google Sheets is not connected yet — add the Apps Script code from the package.'}`);
  };

  $('#newsletterForm').onsubmit=(e)=>{e.preventDefault();toast('Thanks — you’re on the list!');e.target.reset();};
}

renderCategories(); renderHomeProducts(); renderShop(); renderCart(); renderReviews(); updateAccountUI(); $('#year').textContent=new Date().getFullYear(); bind(); updateCountdown(); setInterval(updateCountdown,1000);
