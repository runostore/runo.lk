const BASE_PRODUCTS = Array.isArray(window.NOVATREND_PRODUCTS) ? window.NOVATREND_PRODUCTS : [];
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxAt7-osMmZbPYXvCBU3gotzBX_CkNNKh0qO9Gg0q39pCUCttzHIgegZ344x9iHuwzQQ/exec';
const STORE_EMAIL = 'nethun.exe@gmail.com';
const ADMIN = { email: 'admin@gmail.com', password: 'nethun123', name: 'RUNO Admin', role: 'admin' };
const LKR = n => `LKR ${Math.round(Number(n) || 0).toLocaleString('en-LK')}`;
const USD_TO_LKR = 325;
const PRODUCT_PRICE = p => Number(p.price || 0) * USD_TO_LKR;
const SALE_PRICE = p => PRODUCT_PRICE(p) * (1 - (Number(p.discount) || 0) / 100);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const customProducts = JSON.parse(localStorage.getItem('runo_custom_products') || '[]');
const products = [...BASE_PRODUCTS, ...customProducts];
const state = {
  products,
  filtered: [...products],
  visible: 24,
  cart: JSON.parse(localStorage.getItem('runo_cart') || '[]'),
  coupon: JSON.parse(localStorage.getItem('runo_coupon') || 'null'),
  user: JSON.parse(localStorage.getItem('runo_user') || 'null'),
  orders: JSON.parse(localStorage.getItem('runo_orders') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('runo_wishlist') || '[]'),
  reviews: JSON.parse(localStorage.getItem('runo_reviews') || 'null') || [
    {name:'Sahan',rating:5,text:'Very clean experience. Product browsing is smooth and checkout was easy.'},
    {name:'Ayesha',rating:5,text:'Love the product variety. The glass-style UI feels premium without being confusing.'},
    {name:'Kavin',rating:4.5,text:'Good prices and a lot of options. I found exactly what I needed using search.'},
    {name:'Mihiri',rating:5,text:'COD checkout is clear and simple. The order confirmation looks really nice.'}
  ]
};

function save(){
  localStorage.setItem('runo_cart',JSON.stringify(state.cart));
  localStorage.setItem('runo_coupon',JSON.stringify(state.coupon));
  localStorage.setItem('runo_orders',JSON.stringify(state.orders));
  localStorage.setItem('runo_wishlist',JSON.stringify(state.wishlist));
  localStorage.setItem('runo_reviews',JSON.stringify(state.reviews));
  localStorage.setItem('runo_user',JSON.stringify(state.user));
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function img(url,alt=''){return `<img src="${url}" alt="${alt.replaceAll('"','&quot;')}" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/runo-${encodeURIComponent(alt)}/700/700'">`}
function categories(){return [...new Set(state.products.map(p=>p.category))]}
function stars(r){const n=Math.max(0,Math.min(5,Math.round(Number(r)||0)));return '★'.repeat(n)+'☆'.repeat(5-n)}
function productById(id){return state.products.find(p=>Number(p.id)===Number(id))}
function openModal(id){const el=$('#'+id);if(!el)return;el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')}
function closeModal(id){const el=$('#'+id);if(!el)return;el.classList.remove('open');el.setAttribute('aria-hidden','true');if(!$$('.modal.open').length)document.body.classList.remove('modal-open')}
function scrollToId(id){const el=$(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}

function renderCategories(){
  const categoryImages=Object.fromEntries(state.products.map(p=>[p.category,p.image]));
  $('#categoryGrid').innerHTML=categories().map(c=>`<button class="category-card" data-category="${c}">${img(categoryImages[c],c)}<div><b>${c}</b><small>${state.products.filter(p=>p.category===c).length} products</small></div><span>↗</span></button>`).join('');
  $('#categoryFilters').innerHTML=categories().map(c=>`<label class="check"><input type="checkbox" value="${c}" data-cat-filter> ${c}</label>`).join('');
}

function card(p){
  const sale=SALE_PRICE(p);const wished=state.wishlist.includes(Number(p.id));
  return `<article class="product-card reveal"><div class="product-media"><button data-product="${p.id}" aria-label="View ${p.name}">${p.discount?`<span class="discount-badge">-${p.discount}%</span>`:''}${p.isNew?'<span class="new-badge">NEW</span>':''}${img(p.image,p.name)}</button><button class="heart ${wished?'active':''}" data-heart="${p.id}" aria-label="Wishlist">${wished?'♥':'♡'}</button></div><div class="product-info"><div class="product-category">${p.category}</div><button class="product-name" data-product="${p.id}">${p.name}</button><div class="rating-row"><span class="stars">${stars(p.rating)}</span><small>${Number(p.rating).toFixed(1)} (${p.reviews})</small></div><div class="price-row"><strong>${LKR(sale)}</strong>${p.discount?`<del>${LKR(PRODUCT_PRICE(p))}</del><span>${p.discount}% OFF</span>`:''}</div><div class="card-actions"><button class="quick-btn" data-product="${p.id}">Quick view</button><button class="add-btn" data-add="${p.id}">Add to cart</button></div></div></article>`;
}
function renderHomeProducts(){
  $('#newProducts').innerHTML=state.products.filter(p=>p.isNew).slice(0,8).map(card).join('');
  $('#bestProducts').innerHTML=state.products.filter(p=>p.isBest).sort((a,b)=>b.rating-a.rating).slice(0,8).map(card).join('');
  observeReveals();
}
function getFilterState(){
  const query=($('#searchInput')?.value||'').trim().toLowerCase();
  const cats=$$('[data-cat-filter]:checked').map(x=>x.value);
  const max=Number($('#priceRange')?.value||162500);
  const minRating=Number($('[data-rating].active')?.dataset.rating||0);
  return {query,cats,max,minRating};
}
function applyFilters(){
  const {query,cats,max,minRating}=getFilterState();
  let arr=state.products.filter(p=>{
    const hay=`${p.name} ${p.category} ${p.description||''}`.toLowerCase();
    return (!query||hay.includes(query))&&(!cats.length||cats.includes(p.category))&&SALE_PRICE(p)<=max&&Number(p.rating)>=minRating;
  });
  const sort=$('#sortSelect')?.value||'featured';
  if(sort==='price-asc')arr.sort((a,b)=>SALE_PRICE(a)-SALE_PRICE(b));
  if(sort==='price-desc')arr.sort((a,b)=>SALE_PRICE(b)-SALE_PRICE(a));
  if(sort==='rating')arr.sort((a,b)=>Number(b.rating)-Number(a.rating)||Number(b.reviews)-Number(a.reviews));
  if(sort==='discount')arr.sort((a,b)=>Number(b.discount)-Number(a.discount));
  state.filtered=arr;state.visible=24;renderShop();
}
function renderShop(){
  const list=state.filtered.slice(0,state.visible);$('#allProducts').innerHTML=list.length?list.map(card).join(''):`<div class="empty-state"><h3>No products found</h3><p>Try another search, category or price range.</p></div>`;
  $('#shopSummary').textContent=`${state.filtered.length} matching products from ${state.products.length} in the store.`;
  $('#resultCount').textContent=`Showing ${list.length} / ${state.filtered.length}`;
  const q=$('#searchInput').value.trim();$('#activeSearch').textContent=q?`Search: “${q}”`:'';
  $('#loadMore').style.display=state.visible<state.filtered.length?'block':'none';observeReveals();
}
function clearFilters(){
  $('#searchInput').value='';$('#globalSearch').value='';if($('#mobileSearch'))$('#mobileSearch').value='';$('#priceRange').value=162500;$('#priceValue').textContent=LKR(162500);$('#sortSelect').value='featured';$$('[data-cat-filter]').forEach(x=>x.checked=false);$$('[data-rating]').forEach(x=>x.classList.remove('active'));$('[data-rating="0"]').classList.add('active');applyFilters();
}
function setSearch(q){$('#searchInput').value=q;$('#globalSearch').value=q;$('#mobileSearch').value=q;applyFilters();scrollToId('#shop')}

function cartItems(){return state.cart.map(i=>({qty:Number(i.qty),p:productById(i.id)})).filter(x=>x.p)}
function cartTotals(){const subtotal=cartItems().reduce((s,{p,qty})=>s+SALE_PRICE(p)*qty,0);const discount=state.coupon?.percent?subtotal*(state.coupon.percent/100):0;return {subtotal,discount,total:Math.max(0,subtotal-discount)}}
function updateCartCount(){$('#cartCount').textContent=state.cart.reduce((s,x)=>s+Number(x.qty),0)}
function renderCart(){
  const items=cartItems();
  $('#cartBody').innerHTML=items.length?items.map(({p,qty})=>`<div class="cart-item">${img(p.image,p.name)}<div class="cart-item-main"><b>${p.name}</b><small>${LKR(SALE_PRICE(p))}</small><div class="qty"><button data-qty="${p.id}" data-dir="-1">−</button><span>${qty}</span><button data-qty="${p.id}" data-dir="1">+</button><button class="remove" data-remove="${p.id}">Remove</button></div></div><b>${LKR(SALE_PRICE(p)*qty)}</b></div>`).join(''):`<div class="empty-state"><h3>Your cart is empty</h3><p>Add a product and come back here.</p><button class="btn btn-outline" onclick="closeCart();scrollToId('#shop')">Start shopping</button></div>`;
  const {subtotal,discount,total}=cartTotals();$('#cartSubtotal').textContent=LKR(subtotal);$('#cartDiscount').textContent=discount?`- ${LKR(discount)}`:LKR(0);$('#cartTotal').textContent=LKR(total);$('#couponMsg').textContent=state.coupon?`${state.coupon.code} applied — ${state.coupon.percent}% off`:'';updateCartCount();
}
function openCart(){$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');$('#overlay').classList.add('show');renderCart()}
function closeCart(){$('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true');$('#overlay').classList.remove('show')}
function addToCart(id,qty=1){const item=state.cart.find(x=>Number(x.id)===Number(id));if(item)item.qty+=qty;else state.cart.push({id:Number(id),qty:Number(qty)});save();renderCart();toast('Added to cart 🛒')}
function updateQty(id,dir){const item=state.cart.find(x=>Number(x.id)===Number(id));if(!item)return;item.qty+=dir;if(item.qty<=0)state.cart=state.cart.filter(x=>Number(x.id)!==Number(id));save();renderCart()}
function applyCoupon(code){const map={NETHUN10:10,SAVE10:10,SAVE20:20,NOVA30:30,RUNO10:10};const clean=(code||'').trim().toUpperCase();if(!clean){state.coupon=null;save();renderCart();populateCheckout();toast('Coupon removed');return}if(!map[clean]){toast('Invalid coupon code');return}state.coupon={code:clean,percent:map[clean]};save();renderCart();populateCheckout();toast(`${clean} applied ✅`)}

function openProduct(id){
  const p=productById(id);if(!p)return;const sale=SALE_PRICE(p);
  const images=(p.images&&p.images.length?p.images:[p.image,p.image,p.image]);
  $('#productDetail').innerHTML=`<div class="product-detail-grid"><div class="detail-gallery"><img src="${images[0]}" alt="${p.name}"><div class="detail-thumbs">${images.map(x=>`<img src="${x}" alt="${p.name}">`).join('')}</div></div><div class="detail-copy"><span class="section-kicker">${p.category}</span><h2>${p.name}</h2><div class="rating-row"><span class="stars">${stars(p.rating)}</span><small>${Number(p.rating).toFixed(1)} • ${p.reviews} reviews</small></div><div class="detail-price"><strong>${LKR(sale)}</strong>${p.discount?`<del>${LKR(PRODUCT_PRICE(p))}</del><span>-${p.discount}%</span>`:''}</div><p>${p.description||'A carefully selected RUNO Store product made for everyday use.'}</p><ul class="feature-list"><li>Islandwide delivery</li><li>Cash on Delivery available</li><li>30-day returns</li><li>Secure checkout</li></ul><div class="detail-actions"><div class="qty-box"><button id="detailMinus">−</button><span id="detailQty">1</span><button id="detailPlus">+</button></div><button class="btn btn-outline" id="detailAdd">Add to cart</button><button class="btn btn-dark" id="detailBuy">Buy now ↗</button></div></div></div>`;
  let qty=1;$('#detailMinus').onclick=()=>{qty=Math.max(1,qty-1);$('#detailQty').textContent=qty};$('#detailPlus').onclick=()=>{qty+=1;$('#detailQty').textContent=qty};$('#detailAdd').onclick=()=>{addToCart(id,qty);closeModal('productModal')};$('#detailBuy').onclick=()=>{addToCart(id,qty);closeModal('productModal');openCheckout()};openModal('productModal');
}
function populateCheckout(){
  $('#checkoutItems').innerHTML=cartItems().length?cartItems().map(({p,qty})=>`<div class="summary-item"><span>${p.name} × ${qty}</span><b>${LKR(SALE_PRICE(p)*qty)}</b></div>`).join(''):'<div class="empty-state small">Cart is empty.</div>';
  const {subtotal,discount,total}=cartTotals();$('#checkoutSubtotal').textContent=LKR(subtotal);$('#checkoutDiscount').textContent=discount?`- ${LKR(discount)}`:LKR(0);$('#checkoutTotal').textContent=LKR(total);$('#checkoutCoupon').value=state.coupon?.code||'';if(state.user){$('#checkName').value=state.user.name||'';$('#checkEmail').value=state.user.email||''}
}
function openCheckout(){if(!state.cart.length){toast('Your cart is empty');return}closeCart();populateCheckout();openModal('checkoutModal')}
async function sendToAppsScript(payload){try{const body=new URLSearchParams({payload:JSON.stringify(payload)});const res=await fetch(SCRIPT_URL,{method:'POST',body});return res.ok}catch(e){return false}}

function renderReviews(){$('#reviewGrid').innerHTML=state.reviews.map(r=>`<article class="review-card reveal"><div class="review-top"><div class="avatar">${String(r.name||'R').charAt(0).toUpperCase()}</div><div><b>${r.name}</b><div class="stars">${stars(r.rating)}</div></div></div><p>“${r.text}”</p><small>Verified shopper</small></article>`).join('');observeReveals()}
function renderOrders(){
  const mine=state.orders.filter(o=>state.user?.role==='admin'||o.email===state.user?.email);$('#ordersList').innerHTML=mine.length?mine.slice().reverse().map(o=>`<div class="order-row"><div><b>#${o.orderId}</b><small>${new Date(o.createdAt).toLocaleString('en-LK')}</small></div><div><b>${LKR(o.total)}</b><span class="status">${o.status||'Successful Order'}</span></div></div>`).join(''):'<p class="form-hint">No orders yet. Completed orders will appear here.</p>';
  $('#profileOrderCount').textContent=mine.length;
}
function renderWishlist(){const wish=state.wishlist.map(id=>productById(id)).filter(Boolean);$('#profileWishCount').textContent=wish.length;$('#wishlistList').innerHTML=wish.length?wish.map(p=>`<div class="wishlist-row">${img(p.image,p.name)}<div><b>${p.name}</b><small>${LKR(SALE_PRICE(p))}</small></div><button class="btn btn-outline" data-add="${p.id}">Add</button></div>`).join(''):'<div class="empty-state small"><h3>No wishlist items</h3><p>Tap ♡ on any product.</p></div>'}
function showProfile(){if(!state.user){openModal('accountModal');return}$('#profileName').textContent=state.user.name||'RUNO Customer';$('#profileEmail').textContent=state.user.email;$('#profileAvatar').textContent=(state.user.name||'R').charAt(0).toUpperCase();renderOrders();renderWishlist();$('#adminPanelBtn').classList.toggle('hidden',state.user.role!=='admin');openModal('profileModal')}
function updateAccountUI(){const btn=$('#accountBtn');btn.innerHTML=state.user?`<span>${(state.user.name||'R').charAt(0).toUpperCase()}</span>`:'<span>◯</span>'}
function login(email,password){
  email=email.toLowerCase();if(email===ADMIN.email&&password===ADMIN.password){state.user=ADMIN;save();closeModal('accountModal');updateAccountUI();toast('Welcome back, Admin 👑');return true}
  const users=JSON.parse(localStorage.getItem('runo_users')||'[]');const user=users.find(u=>u.email===email&&u.password===password);if(!user){toast('Invalid email or password');return false}state.user=user;save();closeModal('accountModal');updateAccountUI();toast(`Welcome, ${user.name}`);return true
}
function logout(){state.user=null;localStorage.removeItem('runo_user');updateAccountUI();closeModal('profileModal');closeModal('adminModal');toast('Logged out successfully')}

function renderAdmin(){
  if(state.user?.role!=='admin'){toast('Admin login required');return}
  $('#adminSummary').innerHTML=[['Orders',state.orders.length],['Products',state.products.length],['Reviews',state.reviews.length],['Local sales',LKR(state.orders.reduce((s,o)=>s+Number(o.total||0),0))]].map(([l,v])=>`<div class="admin-stat"><span>${l}</span><b>${v}</b></div>`).join('');
  renderAdminOrders();renderAdminProducts();populateAdminCategory();openModal('adminModal')
}
function renderAdminOrders(){const list=state.orders.slice().reverse();$('#adminOrdersPanel').innerHTML=list.length?`<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>${list.map(o=>`<tr><td>#${o.orderId}<br><small>${new Date(o.createdAt).toLocaleDateString('en-LK')}</small></td><td>${o.name}<br><small>${o.email}</small></td><td>${o.phone}</td><td>${LKR(o.total)}</td><td>${o.payment}</td><td class="status-cell">${o.status}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state small"><h3>No orders yet</h3><p>Orders placed from this browser will appear here.</p></div>'}
function renderAdminProducts(){const custom=JSON.parse(localStorage.getItem('runo_custom_products')||'[]');$('#adminProductsPanel').innerHTML=`<div class="product-admin-list">${custom.length?custom.map(p=>`<div class="admin-product-row">${img(p.image,p.name)}<div><b>${p.name}</b><small>${p.category} • ${LKR(SALE_PRICE(p))}</small></div><button data-delete-product="${p.id}">Delete</button></div>`).join(''):'<div class="empty-state small"><h3>No custom products</h3><p>Your 400 base products are already loaded. Use “Add Product” to add more.</p></div>'}</div>`}
function populateAdminCategory(){$('#adminProductCategory').innerHTML=categories().map(c=>`<option value="${c}">${c}</option>`).join('')}
function addCustomProduct(e){e.preventDefault();const custom=JSON.parse(localStorage.getItem('runo_custom_products')||'[]');const id=900000+Date.now()%100000;const product={id,name:$('#adminProductName').value.trim(),category:$('#adminProductCategory').value,price:Number($('#adminProductPrice').value)/USD_TO_LKR,discount:Number($('#adminProductDiscount').value)||0,rating:5,reviews:0,image:$('#adminProductImage').value.trim(),images:[$('#adminProductImage').value.trim()],badge:'',description:$('#adminProductDescription').value.trim()||'A new RUNO Store product.',isNew:true,isBest:false};custom.push(product);localStorage.setItem('runo_custom_products',JSON.stringify(custom));state.products.push(product);renderCategories();renderHomeProducts();applyFilters();renderAdmin();$('#addProductForm').reset();toast('Product added to the store ✅')}
function removeCustomProduct(id){const custom=JSON.parse(localStorage.getItem('runo_custom_products')||'[]').filter(p=>Number(p.id)!==Number(id));localStorage.setItem('runo_custom_products',JSON.stringify(custom));state.products=state.products.filter(p=>Number(p.id)!==Number(id));applyFilters();renderCategories();renderHomeProducts();renderAdmin();toast('Custom product removed')}

function showSuccess(order,sent){$('#successOrderId').textContent=order.orderId;$('#successTotal').textContent=LKR(order.total);$('#successBackendNote').textContent=sent?'Order saved to Google Sheets and notification email flow was triggered.':'Order saved locally. Connect Apps Script to also send it to Google Sheets/email.';openModal('successModal')}
async function placeOrder(e){
  e.preventDefault();if(!state.cart.length){toast('Your cart is empty');closeModal('checkoutModal');return}
  const {subtotal,discount,total}=cartTotals();const order={orderId:'RUNO-'+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),name:$('#checkName').value.trim(),email:$('#checkEmail').value.trim().toLowerCase(),phone:$('#checkPhone').value.trim(),city:$('#checkCity').value.trim(),address:$('#checkAddress').value.trim(),address2:$('#checkAddress2').value.trim(),payment:document.querySelector('input[name="payment"]:checked')?.value||'Cash on Delivery',coupon:state.coupon?.code||'',items:cartItems().map(({p,qty})=>({id:p.id,name:p.name,category:p.category,qty,price:Number(SALE_PRICE(p).toFixed(2))})),subtotal:Number(subtotal.toFixed(2)),discount:Number(discount.toFixed(2)),total:Number(total.toFixed(2)),status:'Successful Order'};
  state.orders.push(order);save();const sent=await sendToAppsScript({type:'order',order,storeEmail:STORE_EMAIL});state.cart=[];state.coupon=null;save();renderCart();closeModal('checkoutModal');if(!state.user){state.user={name:order.name,email:order.email,role:'customer'};save();updateAccountUI()}showSuccess(order,sent)
}

function startHero(){let current=0,timer;const slides=$$('.hero-slide'),dots=$$('#heroDots button');function go(i){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===current));dots.forEach((d,n)=>d.classList.toggle('active',n===current))}function restart(){clearInterval(timer);timer=setInterval(()=>go(current+1),6500)}$('#heroPrev').onclick=()=>{go(current-1);restart()};$('#heroNext').onclick=()=>{go(current+1);restart()};dots.forEach(d=>d.onclick=()=>{go(Number(d.dataset.slideTo));restart()});restart()}
function updateCountdown(){const key='runo_sale_end';let end=localStorage.getItem(key);if(!end||Number(end)<Date.now()){end=String(Date.now()+36*60*60*1000);localStorage.setItem(key,end)}let rem=Math.max(0,Number(end)-Date.now());const sec=Math.floor(rem/1000),d=Math.floor(sec/86400),h=Math.floor((sec%86400)/3600),m=Math.floor((sec%3600)/60),s=sec%60;$('#countdown').textContent=[d,h,m,s].map(x=>String(x).padStart(2,'0')).join(' : ')}
function observeReveals(){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});$$('.reveal:not(.visible)').forEach(x=>io.observe(x))}
function bind(){
  document.addEventListener('click',e=>{
    const product=e.target.closest('[data-product]');if(product){openProduct(Number(product.dataset.product));return}
    const add=e.target.closest('[data-add]');if(add){addToCart(Number(add.dataset.add));return}
    const heart=e.target.closest('[data-heart]');if(heart){const id=Number(heart.dataset.heart);state.wishlist=state.wishlist.includes(id)?state.wishlist.filter(x=>x!==id):[...state.wishlist,id];save();heart.classList.toggle('active');heart.textContent=heart.classList.contains('active')?'♥':'♡';toast(heart.classList.contains('active')?'Saved to wishlist':'Removed from wishlist');return}
    const cat=e.target.closest('[data-category]');if(cat){$$('[data-cat-filter]').forEach(x=>x.checked=x.value===cat.dataset.category);applyFilters();scrollToId('#shop');return}
    const qty=e.target.closest('[data-qty]');if(qty){updateQty(Number(qty.dataset.qty),Number(qty.dataset.dir));return}
    const rem=e.target.closest('[data-remove]');if(rem){state.cart=state.cart.filter(x=>Number(x.id)!==Number(rem.dataset.remove));save();renderCart();return}
    const del=e.target.closest('[data-delete-product]');if(del){removeCustomProduct(Number(del.dataset.deleteProduct));return}
    const closer=e.target.closest('[data-close]');if(closer){closeModal(closer.dataset.close);return}
    const tab=e.target.closest('[data-profile-tab]');if(tab){$$('[data-profile-tab]').forEach(x=>x.classList.remove('active'));tab.classList.add('active');['overview','orders','wishlist'].forEach(k=>$('#profile'+k.charAt(0).toUpperCase()+k.slice(1)).classList.toggle('hidden',k!==tab.dataset.profileTab));return}
    const atab=e.target.closest('[data-admin-tab]');if(atab){$$('[data-admin-tab]').forEach(x=>x.classList.remove('active'));atab.classList.add('active');$('#adminOrdersPanel').classList.toggle('hidden',atab.dataset.adminTab!=='orders');$('#adminProductsPanel').classList.toggle('hidden',atab.dataset.adminTab!=='products');$('#adminAddPanel').classList.toggle('hidden',atab.dataset.adminTab!=='add');return}
    const shortcut=e.target.closest('[data-shortcut]');if(shortcut){applyFilters();if(shortcut.dataset.shortcut==='new')setSearch('');return}
  });
  $('#cartBtn').onclick=openCart;$('#closeCart').onclick=closeCart;$('#overlay').onclick=closeCart;$('#checkoutBtn').onclick=openCheckout;$('#accountBtn').onclick=showProfile;$('#mobileSearchBtn').onclick=()=>$('#mobileSearchPanel').classList.toggle('open');$('#menuBtn').onclick=()=>$('#mobileNav').classList.toggle('open');
  $('#globalSearch').addEventListener('input',e=>{setSearch(e.target.value);$('#searchInput').value=e.target.value});$('#mobileSearch').addEventListener('input',e=>setSearch(e.target.value));$('#searchInput').addEventListener('input',e=>{ $('#globalSearch').value=e.target.value;applyFilters() });$('#clearSearch').onclick=()=>{$('#searchInput').value='';$('#globalSearch').value='';$('#mobileSearch').value='';applyFilters()};
  $('#sortSelect').addEventListener('change',applyFilters);$('#priceRange').addEventListener('input',()=>{$('#priceValue').textContent=LKR($('#priceRange').value);applyFilters()});document.addEventListener('change',e=>{if(e.target.matches('[data-cat-filter]'))applyFilters()});$$('#ratingFilters [data-rating]').forEach(b=>b.onclick=()=>{$$('#ratingFilters [data-rating]').forEach(x=>x.classList.remove('active'));b.classList.add('active');applyFilters()});$('#clearFilters').onclick=clearFilters;$('#filterToggle').onclick=()=>$('#filterPanel').classList.toggle('open');
  $('#applyCoupon').onclick=()=>applyCoupon($('#couponInput').value);$('#applyCheckoutCoupon').onclick=()=>applyCoupon($('#checkoutCoupon').value);$('#flashSaleBtn').onclick=()=>{$('#sortSelect').value='discount';$('#priceRange').value=100000;$('#priceValue').textContent=LKR(100000);applyFilters();scrollToId('#shop')};
  $('#reviewBtn').onclick=()=>{if(state.user)$('#reviewName').value=state.user.name;openModal('reviewModal')};$('#logoutBtn').onclick=logout;$('#adminPanelBtn').onclick=renderAdmin;$('#profileShop').onclick=()=>{closeModal('profileModal');scrollToId('#shop')};$('#successOrders').onclick=()=>{closeModal('successModal');showProfile();setTimeout(()=>{$('[data-profile-tab="orders"]').click()},100)};
  $('#footerAccount').onclick=showProfile;$('#footerOrders').onclick=()=>{if(!state.user)openModal('accountModal');else showProfile()};$('#footerAdmin').onclick=renderAdmin;
  $$('[data-account-tab]').forEach(btn=>btn.onclick=()=>{$$('[data-account-tab]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const isLogin=btn.dataset.accountTab==='login';$('#loginPanel').classList.toggle('hidden',!isLogin);$('#registerPanel').classList.toggle('hidden',isLogin)});
  $('#loginForm').onsubmit=e=>{e.preventDefault();login($('#loginEmail').value.trim(),$('#loginPassword').value)};
  $('#registerForm').onsubmit=e=>{e.preventDefault();const users=JSON.parse(localStorage.getItem('runo_users')||'[]');const user={name:$('#regName').value.trim(),email:$('#regEmail').value.trim().toLowerCase(),password:$('#regPassword').value,role:'customer'};if(users.some(u=>u.email===user.email)||user.email===ADMIN.email){toast('That email is already in use');return}users.push(user);localStorage.setItem('runo_users',JSON.stringify(users));state.user=user;save();closeModal('accountModal');updateAccountUI();toast('Account created 🎉')};
  $('#reviewForm').onsubmit=async e=>{e.preventDefault();const r={name:$('#reviewName').value.trim(),rating:Number($('#reviewRating').value),text:$('#reviewText').value.trim()};state.reviews.unshift(r);save();renderReviews();closeModal('reviewModal');e.target.reset();toast('Review published ✅');await sendToAppsScript({type:'review',review:r,storeEmail:STORE_EMAIL,createdAt:new Date().toISOString()})};
  $('#checkoutForm').onsubmit=placeOrder;$('#addProductForm').onsubmit=addCustomProduct;$('#newsletterForm').onsubmit=e=>{e.preventDefault();toast('Thanks — you are on the list ✨');e.target.reset()};
  window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()};if(e.key==='Escape'){$$('.modal.open').forEach(x=>closeModal(x.id));closeCart()}});
  window.addEventListener('scroll',()=>{$('#siteHeader').classList.toggle('scrolled',window.scrollY>20);$('#backTop').classList.toggle('show',window.scrollY>500)});$('#backTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
}

renderCategories();renderHomeProducts();applyFilters();renderCart();renderReviews();updateAccountUI();$('#year').textContent=new Date().getFullYear();bind();startHero();updateCountdown();setInterval(updateCountdown,1000);observeReveals();
