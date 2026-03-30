document.addEventListener("DOMContentLoaded", () => {

  // ── Search ───────────────────────────────────────────────
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const cards = document.querySelectorAll('.product-card');
  const noResults = document.getElementById('noResults');
  const noResultsQuery = document.getElementById('noResultsQuery');
  const searchResultsLabel = document.getElementById('searchResultsLabel');

  function filterProducts(query) {
    const q = query.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const name = card.dataset.name || '';
      const tags = card.dataset.tags || '';
      const title = card.querySelector('h2').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const price = card.querySelector('.price').textContent.toLowerCase();

      const matches = !q ||
        name.includes(q) ||
        tags.includes(q) ||
        title.includes(q) ||
        desc.includes(q) ||
        price.includes(q);

      if (matches) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (q && visibleCount === 0) {
      noResults.classList.add('show');
      noResultsQuery.textContent = query.trim();
    } else {
      noResults.classList.remove('show');
    }

    if (q) {
      searchResultsLabel.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''} for "${query.trim()}"`;
      searchResultsLabel.classList.add('active');
    } else {
      searchResultsLabel.textContent = '';
      searchResultsLabel.classList.remove('active');
    }

    searchClear.style.opacity = q ? '1' : '0';
    searchClear.style.pointerEvents = q ? 'auto' : 'none';
  }

  searchInput.addEventListener('input', (e) => filterProducts(e.target.value));

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    filterProducts('');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
      filterProducts('');
    }
  });

  // ── Cart ───────────────────────────────────────────────
  let cart = [];

  const cartModal = document.getElementById('cartModal');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountBadge = document.getElementById('cartCount');
  const cartEmptyMsg = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutToast = document.getElementById('checkoutToast');

  function openCart() {
    cartModal.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartModal.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('cartNavBtn').addEventListener('click', openCart);
  cartOverlay.addEventListener('click', closeCart);
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);

  function addToCart(id, name, priceStr, img) {
    const price = parseInt(priceStr.replace(/[₹,]/g, ''), 10);
    const existing = cart.find(i => i.id === id);

    if (existing) existing.qty++;
    else cart.push({ id, name, price, img, qty: 1 });

    renderCart();
    updateBadge();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
    updateBadge();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else renderCart();
    updateBadge();
  }

  function renderCart() {
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
      cartEmptyMsg.style.display = 'flex';
      cartFooter.style.display = 'none';
      return;
    }

    cartEmptyMsg.style.display = 'none';
    cartFooter.style.display = 'block';

    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.img}" class="cart-item-img"/>
        <div>
          <strong>${item.name}</strong>
          <div>₹${item.price.toLocaleString('en-IN')}</div>
          <div>
            <button onclick="changeQty('${item.id}', -1)">-</button>
            ${item.qty}
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button onclick="removeFromCart('${item.id}')">Remove</button>
      `;
      cartItemsList.appendChild(li);
    });

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  function updateBadge() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    cartCountBadge.textContent = total;
    cartCountBadge.style.display = total > 0 ? 'flex' : 'none';
  }

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    closeCart();
    cart = [];
    renderCart();
    updateBadge();

    checkoutToast.classList.add('show');
    setTimeout(() => checkoutToast.classList.remove('show'), 3000);
  });

  // ── Attach buttons ───────────────────────────────────────
  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.querySelector('h2').textContent;
    const priceStr = card.querySelector('.price').textContent;
    const img = card.querySelector('img').src;
    const id = card.dataset.name;

    const oldBtn = card.querySelector('button');
    oldBtn.remove();

    const seeMore = document.createElement('button');
    seeMore.textContent = 'See More';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add to Cart';
    addBtn.addEventListener('click', () => addToCart(id, name, priceStr, img));

    card.appendChild(seeMore);
    card.appendChild(addBtn);
  });

});
