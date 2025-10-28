(function(){
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const toast = document.getElementById('toast');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  const formatCurrency = (v)=> Number(v).toLocaleString('en-IN');

  /** Cart state */
  /** @type {Record<string,{id:string,name:string,price:number,qty:number,thumb:string}>} */
  const cart = {};

  function openCart(){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); }
  function closeCart(){ cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); }
  function toggleCart(){ cartDrawer.classList.toggle('open'); }

  function showToast(message){
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 1500);
  }

  function recalc(){
    let total = 0; let count = 0;
    Object.values(cart).forEach(item=>{ total += item.price * item.qty; count += item.qty; });
    cartTotalEl.textContent = formatCurrency(total);
    cartCountEl.textContent = count;
  }

  function render(){
    const items = Object.values(cart);
    if(items.length === 0){
      cartItemsEl.innerHTML = '<p style="color:#6a5f57">Your cart is empty.</p>';
      recalc();
      return;
    }
    cartItemsEl.innerHTML = items.map(item=>`
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-thumb"><img src="${item.thumb}" alt="${item.name}"></div>
        <div class="cart-info">
          <span class="cart-title">${item.name}</span>
          <span class="cart-meta">₹${formatCurrency(item.price)}</span>
            <div class="qty">
              <button class="decrease" aria-label="Decrease quantity">−</button>
              <input class="qty-input" type="number" min="1" max="5" value="${item.qty}" aria-label="Quantity">
              <button class="increase" aria-label="Increase quantity">+</button>
            </div>
        </div>
        <button class="cart-remove" aria-label="Remove">Remove</button>
      </div>
    `).join('');
    recalc();
  }

  function addToCart({id,name,price,thumb}){
    if(!cart[id]) cart[id] = {id,name,price:Number(price),qty:0,thumb};
    cart[id].qty += 1;
    render();
    showToast(`${name} added to cart`);
  }

  function removeFromCart(id){
    delete cart[id];
    render();
  }

  function updateQty(id,qty){
    const q = Math.max(1, Math.min(5, Number(qty)||1)); // Limit to 5
    if(cart[id]){ cart[id].qty = q; render(); }
  }

  // Event: open/close cart
  cartBtn.addEventListener('click', toggleCart);
  cartClose.addEventListener('click', closeCart);
  cartDrawer.addEventListener('click', (e)=>{ if(e.target === cartDrawer) closeCart(); });

  // Event: add to cart / buy now
  document.addEventListener('click', (e)=>{
    const target = e.target;
    if(!(target instanceof Element)) return;

    if(target.classList.contains('add-to-cart') || target.classList.contains('buy-now')){
      const id = target.getAttribute('data-id');
      const name = target.getAttribute('data-name');
      const price = Number(target.getAttribute('data-price'));
      // Find closest product image as thumb
      const card = target.closest('.product-card');
      const img = card ? card.querySelector('img') : null;
      const thumb = img ? img.getAttribute('src') : 'assets/WhatsApp%20Image%202025-10-28%20at%204.25.24%20PM.jpeg';
      addToCart({id,name,price,thumb});
      if(target.classList.contains('buy-now')) openCart();
    }

    if(target.classList.contains('cart-remove')){
      const id = target.closest('.cart-item')?.getAttribute('data-id');
      if(id) removeFromCart(id);
    }

    if(target.classList.contains('increase') || target.classList.contains('decrease')){
      const row = target.closest('.cart-item');
      const id = row?.getAttribute('data-id');
      if(!id) return;
      const input = row.querySelector('.qty-input');
      const current = Number(input.value)||1;
      const next = target.classList.contains('increase') ? Math.min(5,current+1) : Math.max(1,current-1);
      input.value = String(next);
      updateQty(id,next);
    }
  });

  // Qty input direct change
  cartItemsEl.addEventListener('input', (e)=>{
    const target = e.target;
    if(!(target instanceof HTMLInputElement)) return;
    if(!target.classList.contains('qty-input')) return;
    const row = target.closest('.cart-item');
    const id = row?.getAttribute('data-id');
    if(id) updateQty(id, target.value);
  });

  // Smooth scroll for anchor links with class .scroll-link and nav links
  function smoothScrollTo(hash){
    const el = document.querySelector(hash);
    if(!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 64; // offset for header
    window.scrollTo({top:y,behavior:'smooth'});
  }

  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click', (e)=>{
      const href = link.getAttribute('href');
      if(href && href.length > 1){
        e.preventDefault();
        smoothScrollTo(href);
        nav.classList.remove('open');
      }
    });
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', ()=>{
    nav.classList.toggle('open');
  });

  // Checkout redirect to Google Form
  checkoutBtn.addEventListener('click', ()=>{
    if(Object.values(cart).length===0){ showToast('Your cart is empty'); return; }
    window.open('https://forms.gle/mKBwfJHkv1wXsojx7', '_blank');
  });

  // Contact form basic client-side validation and mock submit
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    if(!name || !email || !message){ showToast('Please fill all fields'); return; }
    showToast('Thanks for reaching out!');
    form.reset();
  });

  // Seed: if URL includes ?demo=1 add an item
  if(new URLSearchParams(location.search).get('demo')==='1'){
    addToCart({id:'munga-saag',name:'Munga Saag',price:60,thumb:'assets/WhatsApp%20Image%202025-10-28%20at%204.25.24%20PM.jpeg'});
  }
})();


