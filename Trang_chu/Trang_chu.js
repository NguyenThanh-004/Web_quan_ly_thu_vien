
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
  loadRecommendations();
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
const recommendSection = document.querySelector('.recommend-section');
const recommendGrid = document.getElementById('recommendGrid');

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

    bookCard.addEventListener('click', () => {
      goToDetail(book.sachId);
    });

    bookGrid.appendChild(bookCard);
  });
}


function goToDetail(sachId) {
    window.location.href =
        `/Trang_chi_tiet_sach/Trang_chi_tiet_sach.html?sachId=${sachId}`;
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

// ================== SEARCH ==================
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');

btnSearch.addEventListener('click', () => {
  const keyword = searchInput.value.trim();

  if (!keyword) {
   // alert('Vui lòng nhập từ khóa tìm kiếm');
    return;
  }

  // Chuyển sang trang kết quả + query param
  window.location.href =
    `/Trang_ket_qua_tim_kiem_user/Trang_ket_qua_tim_kiem_user.html?keyword=${encodeURIComponent(keyword)}`;
});

// Enter để tìm
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    btnSearch.click();
  }
});


async function loadRecommendations() {
  try {
    const token = sessionStorage.getItem('token');

    const response = await fetch(
      `http://localhost:8080/api/recommendation?limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Không thể tải gợi ý");
    }

    const books = await response.json();

    renderRecommendBooks(books);

    // Hiện section
    recommendSection.style.display = 'block';

  } catch (error) {
    console.error("Lỗi khi tải gợi ý:", error);
  }
}

const recommendPageSize = 5;
let currentRecommendPage = 0;
let totalRecommendPages = 0;

function renderRecommendBooks(books) {
  recommendGrid.innerHTML = '';

  totalRecommendPages = Math.ceil(books.length / recommendPageSize);

  for (let i = 0; i < totalRecommendPages; i++) {
    const page = document.createElement('div');
    page.classList.add('recommend-page');

    books
      .slice(i * recommendPageSize, (i + 1) * recommendPageSize)
      .forEach(book => {
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

        bookCard.addEventListener('click', () => {
          goToDetail(book.sachId);
        });

        page.appendChild(bookCard);
      });

    recommendGrid.appendChild(page);
  }

  currentRecommendPage = 0;
  updateRecommendSlider();
}


function updateRecommendSlider() {
  recommendGrid.style.transform =
    `translateX(-${currentRecommendPage * 100}%)`;

  recommendLeft.disabled = currentRecommendPage === 0;
  recommendRight.disabled = currentRecommendPage === totalRecommendPages - 1;
}


const recommendLeft = document.getElementById('recommendLeft');
const recommendRight = document.getElementById('recommendRight');

recommendRight.addEventListener('click', () => {
  if (currentRecommendPage < totalRecommendPages - 1) {
    currentRecommendPage++;
    updateRecommendSlider();
  }
});

recommendLeft.addEventListener('click', () => {
  if (currentRecommendPage > 0) {
    currentRecommendPage--;
    updateRecommendSlider();
  }
});


