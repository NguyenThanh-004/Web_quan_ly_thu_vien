const apiBase = 'http://localhost:8080';
const token = sessionStorage.getItem('token');
console.log('Token:', token);
const main = document.querySelector('.main');
const bookGrid = document.getElementById('bookGrid');
const btnLoadMore = document.getElementById('btnLoadMore');
const btnScrollTop = document.getElementById('btnScrollTop');

let page = 0;
const size = 10;

/* ===== AUTH CHECK ===== */
if (!token) {
  alert('Bạn chưa đăng nhập');
  window.location.href = '../Dang_nhap/Dang_nhap.html';
}

/* ===== LOAD BOOK ===== */
async function loadBooks() {
  const res = await fetch(
    `${apiBase}/api/sach/admin/all?page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    alert('Không thể tải sách');
    return;
  }

  const data = await res.json();
  renderBooks(data.content);
  page++;

  if (data.last) btnLoadMore.style.display = 'none';
}

/* ===== RENDER ===== */
function renderBooks(books) {
  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.anhBia}">
      <h4>${book.tenSach}</h4>
      <p>${book.tacGiaList?.map(t => t.tenTacGia).join(', ') || 'Chưa rõ'}</p>
    `;
    bookGrid.appendChild(card);
  });
}

/* ===== SCROLL TOP ===== */
main.addEventListener('scroll', () => {
  btnScrollTop.style.display = main.scrollTop > 300 ? 'block' : 'none';
});

btnScrollTop.addEventListener('click', () => {
  main.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== EVENTS ===== */
btnLoadMore.addEventListener('click', loadBooks);

/* ===== INIT ===== */
loadBooks();

/* ===== LOGOUT ===== */
document.getElementById('logout_function').onclick = () => {
  sessionStorage.clear();
  window.location.href = '../Dang_nhap/Dang_nhap.html';
};

/* ================= MENU NAVIGATION (FIX) ================= */
document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu li[data-href]');

  menuItems.forEach(item => {
    const href = item.dataset.href;
    if (!href) return;

    const navigate = () => {
      window.location.href = href;
    };

    item.addEventListener('click', navigate);

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });

    // cho biết menu nào đã bind
    console.debug('[MENU]', item.id || item.textContent.trim(), '→', href);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.querySelector('.username-text');
  const username = sessionStorage.getItem('username');

  if (usernameEl) {
    usernameEl.textContent = username || 'Admin';
  }
});
