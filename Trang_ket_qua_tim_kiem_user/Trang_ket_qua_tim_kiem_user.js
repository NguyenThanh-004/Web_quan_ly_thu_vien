let keyword = "";
let currentPage = 0;
const pageSize = 10;

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
  const keywordSpan = document.getElementById("searchKeyword");
  if (username) {
    // 🔹 ĐÃ ĐĂNG NHẬP → THAY NAV
    loginLink.style.display = 'none';
    userMenu.style.display = 'block';
    libraryActions.style.display = 'block';
    usernameText.textContent = username;

    btnUser.addEventListener('click', () => {
      userMenu.classList.toggle('show');
    });

    logoutBtn.addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = '/Dang_nhap/Dang_nhap.html';
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('show');
      }
    });
  }
    // LẤY KEYWORD TỪ URL
    const params = new URLSearchParams(window.location.search);
    keyword = params.get("keyword");
    if (keywordSpan && keyword) {
        const maxLength = 30;

        const displayKeyword =
            keyword.length > maxLength
                ? keyword.substring(0, maxLength) + "..."
                : keyword;

        keywordSpan.textContent = ` "${displayKeyword}"`;
    }
    if (!keyword || keyword.trim() === "") {
        console.warn("Không có keyword");
        return;
    }
    searchBooks(true); // lần đầu load
});

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

const bookGrid = document.getElementById("bookGrid");
const loadMoreDiv = document.querySelector(".load-more");
const btnLoadMore = document.getElementById("btnLoadMore");


async function searchBooks(reset = false) {
    console.log("keyword:", keyword, "page:", currentPage);
    try {
        if (!keyword || keyword.trim() === "") {
            console.warn("Keyword rỗng, không gọi API");
            return;
        }

        if (reset) {
            currentPage = 0;
            bookGrid.innerHTML = "";
        }
        //const token = sessionStorage.getItem("token");
        const response = await fetch(
            `http://localhost:8080/api/sach/search?keyword=${encodeURIComponent(keyword)}&page=0&size=100`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        renderBooks(data.content || []);

        // 🔥 logic nút Xem thêm CHUẨN
        if (data.totalElements <= pageSize || data.last) {
            btnLoadMore.style.display = "none";
        } else {
            btnLoadMore.style.display = "block";
        }

        currentPage++;

    } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        btnLoadMore.style.display = "none";
    }
}

function adjustMainContentHeight() {
  const main = document.querySelector('.main-content');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  if (!main || !header || !footer) return;

  const vh = window.innerHeight;
  const headerH = header.offsetHeight;
  const footerH = footer.offsetHeight;

  const minH = vh - headerH - footerH;

  if (minH > 0) {
    main.style.minHeight = minH + 'px';
  }
}


const emptyState = document.getElementById("emptyState");
const mainContent = document.querySelector(".main-content");
function renderBooks(books) {
    if (books.length === 0 && bookGrid.children.length === 0) {
      emptyState.style.display = "flex";
      loadMoreDiv.style.display = "none";
      btnLoadMore.style.display = 'none';
      adjustMainContentHeight();
      return;
    }
    emptyState.style.display = "none";
    books.forEach(book => {
        const authors = (book.tacGiaList || [])
            .map(tg => tg.tenTacGia)
            .join(", ");

        const card = document.createElement("div");
        card.className = "book-card";
        card.innerHTML = `
            <img src="${book.anhBia}" alt="${book.tenSach}">
            <h4>${book.tenSach}</h4>
            <p>${authors}</p>
        `;
        card.addEventListener("click", () => {
            goToDetail(book.sachId);
        });
        bookGrid.appendChild(card);
    });
}

function goToDetail(sachId) {
    window.location.href =
        `/Trang_chi_tiet_sach/Trang_chi_tiet_sach.html?sachId=${sachId}`;
}

btnLoadMore.addEventListener("click", () => {
    searchBooks(false);
});


const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");

// Đổ keyword hiện tại vào ô input (nếu có)
if (keyword) {
    searchInput.value = keyword;
}

// Click nút tìm kiếm
btnSearch.addEventListener("click", doSearch);

// Enter để tìm
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        doSearch();
    }
});

function doSearch() {
    const value = searchInput.value.trim();
    if (!value) return;

    window.location.href =
        `/Trang_ket_qua_tim_kiem_user/Trang_ket_qua_tim_kiem_user.html?keyword=${encodeURIComponent(value)}`;
}
