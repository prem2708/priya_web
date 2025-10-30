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

  // Product image front/back toggle
  document.addEventListener('click', function(e) {
    const btn = e.target;
    if (!(btn instanceof Element)) return;
    if (btn.classList.contains('toggle-back')) {
      const card = btn.closest('.product-card');
      if (!card) return;
      const img = card.querySelector('.product-image');
      if (!img) return;
      const isFront = !btn.classList.contains('showing-back');
      const front = btn.getAttribute('data-front');
      const back = btn.getAttribute('data-back');
      if (isFront) {
        img.src = back;
        btn.classList.add('showing-back');
        btn.textContent = 'Front';
      } else {
        img.src = front;
        btn.classList.remove('showing-back');
        btn.textContent = 'Back';
      }
    }
  });

  // Product Modal logic
  const modal = document.getElementById('productModal');
  const modalImg = document.getElementById('modalSliderImg');
  const modalPrev = document.getElementById('modalSliderPrev');
  const modalNext = document.getElementById('modalSliderNext');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalAdd = document.getElementById('modalAddToCart');
  const modalClose = document.getElementById('productModalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');

  let modalState = null; // {id, images:[], idx, title, price}

  function openModalWithProduct(card) {
    if (!card) return;
    const id = card.getAttribute('data-product-id');
    const front = card.getAttribute('data-front');
    const back = card.getAttribute('data-back');
    const title = card.querySelector('.product-title')?.innerText || '';
    const price = card.querySelector('.price')?.innerText || '₹60';
    const images = [front];
    if (back) images.push(back);
    modalState = {id, images, idx:0, title, price};
    setModalContent();
    modal.style.display = 'flex';
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;
    setTimeout(()=>modal.focus(),80);
    document.body.style.overflow = 'hidden';
  }
  function setModalContent() {
    if (!modalState) return;
    modalImg.src = modalState.images[modalState.idx];
    modalTitle.textContent = modalState.title;
    modalPrice.textContent = modalState.price;
    modalAdd.setAttribute('data-id', modalState.id);
    // Set modal ingredient
    var ingr = document.getElementById('modalIngredient');
    if (ingr) ingr.textContent = modalState.title;
    if (modalState.images.length < 2) {
      modalPrev.style.visibility = 'hidden';
      modalNext.style.visibility = 'hidden';
    } else {
      modalPrev.style.visibility = 'visible';
      modalNext.style.visibility = 'visible';
    }
  }
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-modal', 'false');
    document.body.style.overflow = '';
    modalState = null;
  }
  modalPrev.addEventListener('click', ()=>{
    if (!modalState) return;
    modalState.idx = (modalState.idx - 1 + modalState.images.length) % modalState.images.length;
    setModalContent();
  });
  modalNext.addEventListener('click', ()=>{
    if (!modalState) return;
    modalState.idx = (modalState.idx + 1) % modalState.images.length;
    setModalContent();
  });
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e){
    if (modal.style.display === 'flex' && (e.key === 'Escape' || e.key === 'Esc')) closeModal();
  });
  document.addEventListener('click', function(e){
    const tgt = e.target;
    if (tgt.classList.contains('open-modal')) {
      const card = tgt.closest('.product-card');
      openModalWithProduct(card);
    }
    if (tgt.id === 'modalAddToCart') {
      // Add to cart for modal
      if (!modalState) return;
      const card = document.querySelector(`.product-card[data-product-id="${modalState.id}"]`);
      if (card) {
        // Use primary image for thumb (front)
        const name = card.querySelector('.product-title')?.innerText || '';
        const price = card.querySelector('.price')?.innerText.replace(/[^\d]/g,'') || '60';
        const thumb = modalState.images[0];
        addToCart({id:modalState.id, name, price, thumb});
        closeModal();
      }
    }
  });

  // Hero slider (auto slide all front images)
  (function heroSliderInit() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide-img');
    let idx = 0;
    function showSlide(i) {
      slides.forEach((img, k) => img.style.display = (k === i ? 'block' : 'none'));
    }
    function nextSlide() {
      idx = (idx + 1) % slides.length;
      showSlide(idx);
    }
    showSlide(idx);
    setInterval(nextSlide, 2800);
  })();
})();


