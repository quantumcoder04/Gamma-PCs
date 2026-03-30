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

  // Show/hide no results
  if (q && visibleCount === 0) {
    noResults.classList.add('show');
    noResultsQuery.textContent = query.trim();
  } else {
    noResults.classList.remove('show');
  }

  // Update results label
  if (q) {
    searchResultsLabel.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''} for "${query.trim()}"`;
    searchResultsLabel.classList.add('active');
  } else {
    searchResultsLabel.textContent = '';
    searchResultsLabel.classList.remove('active');
  }

  // Show/hide clear button
  searchClear.style.opacity = q ? '1' : '0';
  searchClear.style.pointerEvents = q ? 'auto' : 'none';
}

searchInput.addEventListener('input', (e) => filterProducts(e.target.value));

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  filterProducts('');
});

// '/' to focus search, Escape to clear
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