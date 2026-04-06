/*
  GAMMA PCs — script.js
  Technology Backbone of E-Commerce
  Objective: Dynamic product catalog with search, filter & sort
  Data Layer: JavaScript object array simulating a MySQL products table
*/

document.addEventListener("DOMContentLoaded", () => {

  // ─────────────────────────────────────────────────────────────
  //  DATABASE LAYER
  //  Simulates a MySQL `products` table with columns:
  //  id, name, description, price, category, tags, image, stock
  // ─────────────────────────────────────────────────────────────
  const ProductsDB = {
    table: [
      {
        id: "zeus",
        name: "ZEUS",
        description: "Top of the Line Performance",
        price: 150000,
        category: "gaming",
        tags: ["top", "performance", "flagship", "premium", "4k"],
        image: "Assets/The Zeus.jpg",
        stock: 5
      },
      {
        id: "kratos",
        name: "KRATOS",
        description: "Budget Friendly Gaming Beast",
        price: 70000,
        category: "gaming",
        tags: ["budget", "gaming", "beast", "affordable", "mid-range"],
        image: "Assets/The Kratos.jpg",
        stock: 12
      },
      {
        id: "thor",
        name: "THOR",
        description: "Ultimate Workstation PC",
        price: 100000,
        category: "workstation",
        tags: ["workstation", "ultimate", "professional", "creator", "rendering"],
        image: "Assets/Thor.jpeg",
        stock: 8
      },
      {
        id: "poseidon",
        name: "POSEIDON",
        description: "Limited Edition Event Build",
        price: 170000,
        category: "limited",
        tags: ["limited", "edition", "event", "special", "exclusive"],
        image: "Assets/Poseidon.jpg",
        stock: 2
      }
    ],

    /*
      SELECT * FROM products
      WHERE (name LIKE '%q%' OR tags LIKE '%q%' OR description LIKE '%q%')
      AND category = :category
      AND price <= :maxPrice
      ORDER BY :sortField :sortDir
    */
    query({ search = "", category = "all", maxPrice = Infinity, sort = "default" }) {
      let results = [...this.table];

      // WHERE search
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.includes(q)) ||
          p.price.toString().includes(q)
        );
      }

      // WHERE category
      if (category !== "all") {
        results = results.filter(p => p.category === category);
      }

      // WHERE price <= maxPrice
      results = results.filter(p => p.price <= maxPrice);

      // ORDER BY
      const sorts = {
        "price-asc":  (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        "name-asc":   (a, b) => a.name.localeCompare(b.name),
        "default":    () => 0
      };
      results.sort(sorts[sort] || sorts["default"]);

      return results;
    }
  };


  // ─────────────────────────────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────────────────────────────
  const state = {
    search: "",
    category: "all",
    maxPrice: 200000,
    sort: "default"
  };

  let cart = [];   // [{ id, name, price, img, qty }]


  // ─────────────────────────────────────────────────────────────
  //  DOM REFS
  // ─────────────────────────────────────────────────────────────
  const searchInput       = document.getElementById("searchInput");
  const searchClear       = document.getElementById("searchClear");
  const priceRange        = document.getElementById("priceRange");
  const priceLabel        = document.getElementById("priceLabel");
  const sortSelect        = document.getElementById("sortSelect");
  const productsGrid      = document.getElementById("productsGrid");
  const noResults         = document.getElementById("noResults");
  const noResultsQuery    = document.getElementById("noResultsQuery");
  const searchResultsLabel = document.getElementById("searchResultsLabel");

  const cartModal         = document.getElementById("cartModal");
  const cartOverlay       = document.getElementById("cartOverlay");
  const cartItemsList     = document.getElementById("cartItemsList");
  const cartTotalEl       = document.getElementById("cartTotal");
  const cartCountBadge    = document.getElementById("cartCount");
  const cartEmptyMsg      = document.getElementById("cartEmpty");
  const cartFooter        = document.getElementById("cartFooter");
  const checkoutBtn       = document.getElementById("checkoutBtn");
  const checkoutToast     = document.getElementById("checkoutToast");


  // ─────────────────────────────────────────────────────────────
  //  RENDER CATALOG
  // ─────────────────────────────────────────────────────────────
  function renderCatalog() {
    const results = ProductsDB.query(state);

    productsGrid.innerHTML = "";

    if (results.length === 0) {
      noResults.classList.add("show");
      noResultsQuery.textContent = state.search || "selected filters";
    } else {
      noResults.classList.remove("show");
    }

    // Update results label
    if (state.search || state.category !== "all" || state.maxPrice < 200000) {
      searchResultsLabel.textContent = `${results.length} result${results.length !== 1 ? "s" : ""}`;
      if (state.search) searchResultsLabel.textContent += ` for "${state.search}"`;
      searchResultsLabel.classList.add("active");
    } else {
      searchResultsLabel.textContent = "";
      searchResultsLabel.classList.remove("active");
    }

    // Build cards
    results.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="card-badge ${product.category}">${product.category}</div>
        <img src="${product.image}" alt="${product.name} PC" loading="lazy">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <span class="price">₹${product.price.toLocaleString("en-IN")}</span>
        <div class="stock-info ${product.stock <= 3 ? "low-stock" : ""}">
          <i class="ri-box-3-line"></i>
          ${product.stock <= 3 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
        </div>
        <div class="card-buttons">
          <button class="see-more-btn">See More</button>
          <button class="add-to-cart-btn" data-id="${product.id}">
            <i class="ri-shopping-cart-add-line"></i> Add to Cart
          </button>
        </div>
      `;

      // Add to Cart listener
      card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
        addToCart(product.id, product.name, product.price, product.image);
        const btn = e.currentTarget;
        btn.textContent = "✓ Added";
        btn.classList.add("added");
        setTimeout(() => {
          btn.innerHTML = '<i class="ri-shopping-cart-add-line"></i> Add to Cart';
          btn.classList.remove("added");
        }, 1500);
      });

      productsGrid.appendChild(card);
    });
  }


  // ─────────────────────────────────────────────────────────────
  //  SEARCH
  // ─────────────────────────────────────────────────────────────
  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    searchClear.style.opacity = state.search ? "1" : "0";
    searchClear.style.pointerEvents = state.search ? "auto" : "none";
    renderCatalog();
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    state.search = "";
    searchClear.style.opacity = "0";
    searchClear.style.pointerEvents = "none";
    searchInput.focus();
    renderCatalog();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === "Escape") {
      searchInput.value = "";
      state.search = "";
      searchInput.blur();
      searchClear.style.opacity = "0";
      renderCatalog();
    }
  });


  // ─────────────────────────────────────────────────────────────
  //  CATEGORY CHIPS
  // ─────────────────────────────────────────────────────────────
  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    state.category = chip.dataset.cat;
    renderCatalog();
  });


  // ─────────────────────────────────────────────────────────────
  //  PRICE RANGE SLIDER
  // ─────────────────────────────────────────────────────────────
  priceRange.addEventListener("input", () => {
    state.maxPrice = parseInt(priceRange.value);
    priceLabel.textContent = `₹${state.maxPrice.toLocaleString("en-IN")}`;
    renderCatalog();
  });


  // ─────────────────────────────────────────────────────────────
  //  SORT
  // ─────────────────────────────────────────────────────────────
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    renderCatalog();
  });


  // ─────────────────────────────────────────────────────────────
  //  CART — OPEN / CLOSE
  // ─────────────────────────────────────────────────────────────
  function openCart() {
    cartModal.classList.add("open");
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartModal.classList.remove("open");
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("cartNavBtn").addEventListener("click", openCart);
  cartOverlay.addEventListener("click", closeCart);
  document.getElementById("cartCloseBtn").addEventListener("click", closeCart);


  // ─────────────────────────────────────────────────────────────
  //  CART — DATA OPERATIONS
  // ─────────────────────────────────────────────────────────────
  function addToCart(id, name, price, img) {
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
    else { renderCart(); updateBadge(); }
  }

  // Expose to inline HTML (qty buttons use these)
  window.removeFromCart = removeFromCart;
  window.changeQty = changeQty;


  // ─────────────────────────────────────────────────────────────
  //  CART — RENDER
  // ─────────────────────────────────────────────────────────────
  function renderCart() {
    cartItemsList.innerHTML = "";

    if (cart.length === 0) {
      cartEmptyMsg.style.display = "flex";
      cartFooter.style.display = "none";
      return;
    }

    cartEmptyMsg.style.display = "none";
    cartFooter.style.display = "block";

    cart.forEach(item => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <img src="${item.img}" class="cart-item-img" alt="${item.name}"/>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-unit">₹${item.price.toLocaleString("en-IN")} each</span>
          <div class="cart-qty-controls">
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-subtotal">₹${(item.price * item.qty).toLocaleString("en-IN")}</span>
          <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;
      cartItemsList.appendChild(li);
    });

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    cartTotalEl.textContent = `₹${total.toLocaleString("en-IN")}`;
  }

  function updateBadge() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    cartCountBadge.textContent = total;
    cartCountBadge.style.display = total > 0 ? "flex" : "none";
  }


  // ─────────────────────────────────────────────────────────────
  //  CHECKOUT
  // ─────────────────────────────────────────────────────────────
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    closeCart();
    cart = [];
    renderCart();
    updateBadge();
    checkoutToast.classList.add("show");
    setTimeout(() => checkoutToast.classList.remove("show"), 3500);
  });


  // ─────────────────────────────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────────────────────────────
  renderCatalog();

});