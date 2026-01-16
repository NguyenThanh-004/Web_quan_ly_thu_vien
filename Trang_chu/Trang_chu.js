
document.addEventListener('DOMContentLoaded', () => {
  // === CHECK LOGIN NGAY KHI LOAD ===
  const username = sessionStorage.getItem('username');
  console.log('Logged in user:', username);
  console.log('User role:', sessionStorage.getItem('role'));
  console.log('Auth token:', sessionStorage.getItem('token'));
  const loginLink = document.querySelector('.login-link');
  const userMenu = document.querySelector('.user-menu');
  const libraryActions = document.querySelector('.library-actions');
  const usernameText = document.querySelector('.username-text');
  const btnUser = document.querySelector('.btn-user');
  const logoutBtn = document.querySelector('.btn-logout');

  // 🔹 CHƯA ĐĂNG NHẬP → GIỮ NGUYÊN NAV
  if (!username) {
    return;
  }

  // 🔹 ĐÃ ĐĂNG NHẬP → THAY NAV
  loginLink.style.display = 'none';
  userMenu.style.display = 'block';
  libraryActions.style.display = 'block';
  usernameText.textContent = username;

  // Toggle dropdown
  btnUser.addEventListener('click', () => {
    userMenu.classList.toggle('show');
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  });

  // Click ngoài → đóng dropdown
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });
});


// ================== LOAD BOOK LIST ==================
let currentPage = 0;
const pageSize = 10;

const bookGrid = document.getElementById('bookGrid');
const btnLoadMore = document.getElementById('btnLoadMore');

async function loadBooks() {
  try {
    const response = await fetch(
      `http://localhost:8080/api/sach/all?page=${currentPage}&size=${pageSize}`
    );

    const data = await response.json();

    renderBooks(data.content);

    if (data.last) {
      btnLoadMore.style.display = 'none';
    }

    currentPage++;
  } catch (error) {
    console.error('Lỗi khi tải sách:', error);
  }
}

function renderBooks(books) {
  books.forEach(book => {
    const authors = book.tacGiaList
      .map(tg => tg.tenTacGia)
      .join(', ');

    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');

    bookCard.innerHTML = `
      <img src="${book.anhBia}" alt="${book.tenSach}">
      <h4>${book.tenSach}</h4>
      <p>${authors}</p>
    `;

    bookGrid.appendChild(bookCard);
  });
}

// Load lần đầu
loadBooks();

// Click "Xem thêm"
btnLoadMore.addEventListener('click', loadBooks);


// ================== SCROLL TO TOP ==================
const btnScrollTop = document.getElementById('btnScrollTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    btnScrollTop.style.display = 'flex';
  } else {
    btnScrollTop.style.display = 'none';
  }
});

btnScrollTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
