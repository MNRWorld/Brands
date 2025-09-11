(() => {
  const pageSize = 12;
  const currentPage = { products: 1, brands: 1, groups: 1 };
  let products = [];
  let brands = [];
  let groups = [];

  function formatDate(d) {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return d; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  function makeCard(item, type) {
    const el = document.createElement('article');
    el.className = 'card';

    // Pill logic
    let pillClass = "grpill";
    let pillIcon = '<i class="fa-solid fa-minus"></i>';
    if (item.pill === "gpill") {
      pillClass = "gpill";
      pillIcon = '<i class="fa-solid fa-check"></i>';
    } else if (item.pill === "rpill") {
      pillClass = "rpill";
      pillIcon = '<i class="fa-solid fa-xmark"></i>';
    }

    el.innerHTML = `
      <div class="thumb"><img src="${item.thumb}" alt="${escapeHtml(item.name)}"></div>
      <div class="meta">
        <div class="meta-header">
          <h3 class="title">${escapeHtml(item.name)}</h3>
          <div class="badge ${pillClass}">${pillIcon}</div>
        </div>
        <div class="rating">${item.rating}</div>
        <div class="dates">
          <div>Start: <strong>${formatDate(item.start)}</strong></div>
          <div>End: <strong>${formatDate(item.end)}</strong></div>
        </div>
        <button class="show-review">Details</button>
        <div class="review">${escapeHtml(item.review || "No details added yet.")}</div>
      </div>
    `;

    const btn = el.querySelector('.show-review');
    const reviewDiv = el.querySelector('.review');

    btn.addEventListener('click', () => {
        if (reviewDiv.style.display === 'none' || reviewDiv.style.display === '') {
            reviewDiv.style.display = 'block';
            btn.textContent = 'Hide Details';
        } else {
            reviewDiv.style.display = 'none';
            btn.textContent = 'Show Details';
        }
    });

    return el;
  }

  function updateCounts() {
    if(document.getElementById("productCount")) document.getElementById("productCount").textContent = products.length;
    if(document.getElementById("brandCount")) document.getElementById("brandCount").textContent = brands.length;
    if(document.getElementById("groupCount")) document.getElementById("groupCount").textContent = groups.length;
  }

  function renderList(containerId, items, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!items || items.length === 0) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = `No ${type.toLowerCase()} yet.`;
      container.appendChild(e);
      updateCounts();
      return;
    }
    const page = currentPage[containerId];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const reversed = [...items].reverse();
    const pagedItems = reversed.slice(start, end);
    const grid = document.createElement('div');
    grid.className = 'grid';
    pagedItems.forEach(it => grid.appendChild(makeCard(it, type)));
    container.appendChild(grid);

    const controls = document.createElement('div');
    controls.className = "pagination";
    controls.style.display = "flex";
    controls.style.justifyContent = "center";
    controls.style.marginTop = "15px";
    controls.style.gap = "10px";
    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.disabled = page === 1;
    prevBtn.onclick = () => {
      currentPage[containerId]--;
      renderList(containerId, items, type);
    };
    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.disabled = end >= items.length;
    nextBtn.onclick = () => {
      currentPage[containerId]++;
      renderList(containerId, items, type);
    };
    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    container.appendChild(controls);

    updateCounts();
  }

  function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(x => {
          x.classList.remove('active');
          x.setAttribute('aria-selected','false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        if(target === 'products') renderList('products', products, 'Product');
        if(target === 'brands') renderList('brands', brands, 'Brand');
        if(target === 'groups') renderList('groups', groups, 'Group');
      });
    });
  }

  function setupSearch() {
    const input = document.getElementById("searchInput");
    if(!input) return;
    input.addEventListener("keyup", function() {
      let filter = this.value.toLowerCase();
      let activeTab = document.querySelector(".tab.active").getAttribute("data-tab");
      let items = (activeTab === "products" ? products : activeTab === "brands" ? brands : groups);
      let filtered = items.filter(it => it.name.toLowerCase().includes(filter));
      currentPage[activeTab] = 1;
      renderList(activeTab, filtered, 
        activeTab === "products" ? "Product" : activeTab === "brands" ? "Brand" : "Group"
      );
    });
  }

  function loadData() {
    fetch('data/products.json')
      .then(res => res.json())
      .then(data => { products = data; updateCounts(); renderList('products', products, 'Product'); })
      .catch(err => console.error('Error loading products:', err));

    fetch('data/brands.json')
      .then(res => res.json())
      .then(data => { brands = data; updateCounts(); })
      .catch(err => console.error('Error loading brands:', err));

    fetch('data/groups.json')
      .then(res => res.json())
      .then(data => { groups = data; updateCounts(); })
      .catch(err => console.error('Error loading groups:', err));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupSearch();
    loadData();
  });
})();
