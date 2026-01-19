/* ================= FIX LAYOUT SHIFT (QUAN TRỌNG) ================= */
// Luôn có scrollbar để tránh layout shift phụ
document.documentElement.style.overflowY = 'scroll';

/* ================= CONFIG ================= */
const apiBase = 'http://localhost:8080';
const token = sessionStorage.getItem('token');

/* ================= STATE ================= */
let currentPage = 0;
const pageSize = 10;
let fixedCardWidth = null;

/* ================= ELEMENT ================= */
const bookGrid = document.getElementById('bookGrid');
const btnLoadMore = document.getElementById('btnLoadMore');
const btnScrollTop = document.getElementById('btnScrollTop');

/* ================= CALCULATE CARD WIDTH ================= */
function calculateCardWidth() {
    if (!bookGrid) return;

    const columns = 5;   // ĐÚNG theo CSS: repeat(5, 1fr)
    const gap = 30;      // ĐÚNG theo CSS: gap: 30px

    const totalGap = gap * (columns - 1);
    const gridWidth = bookGrid.clientWidth - totalGap;

    fixedCardWidth = Math.floor(gridWidth / columns);
}

/* ================= LOAD BOOK ================= */
async function loadBooks() {
    try {
        const res = await fetch(
            `${apiBase}/api/sach/admin/all?page=${currentPage}&size=${pageSize}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        renderBooks(data.content);

        if (data.last) {
            btnLoadMore.style.display = 'none';
        }

        currentPage++;
    } catch (err) {
        console.error('Lỗi tải sách:', err);
        alert('Không thể tải danh sách sách');
    }
}

/* ================= RENDER ================= */
function renderBooks(books) {
    books.forEach(book => {
        const authors = book.tacGiaList
            ?.map(tg => tg.tenTacGia)
            .join(', ') || 'Chưa rõ';

        const card = document.createElement('div');
        card.className = 'book-card';

        // 🔒 KHÓA CỨNG WIDTH → KHÔNG BAO GIỜ THAY ĐỔI
        if (fixedCardWidth) {
            card.style.width = fixedCardWidth + 'px';
        }

        card.innerHTML = `
            <img src="${book.anhBia}" alt="${book.tenSach}">
            <h4>${book.tenSach}</h4>
            <p>${authors}</p>
        `;

        bookGrid.appendChild(card);
    });
}

/* ================= EVENT ================= */
btnLoadMore.addEventListener('click', loadBooks);

/* ================= SCROLL TO TOP ================= */
window.addEventListener('scroll', () => {
    if (!btnScrollTop) return;
    btnScrollTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('Bạn chưa đăng nhập');
        window.location.href = '../Dang_nhap/Dang_nhap.html';
        return;
    }

    calculateCardWidth(); // 👈 TÍNH WIDTH 1 LẦN DUY NHẤT
    loadBooks();
});
// ================= MENU TRANG CHỦ =================
document.addEventListener('DOMContentLoaded', () => {
  const menuHome = document.getElementById('menu-trang-chu');
  if (!menuHome) return;

  const goHome = () => {
    window.location.href =
      menuHome.dataset.href ||
      '../Trang_chu_admin/Trang_chu_admin.html';
  };

  menuHome.addEventListener('click', goHome);
  menuHome.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goHome();
    }
  });
});

// Navigate to Quản lý nhà xuất bản when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuNhaxuatban = document.getElementById('menu-nha-xuat-ban');
  if (!menuNhaxuatban) return;

  const goTo = () => {
    const href = menuNhaxuatban.dataset.href || '../Quan_li_nha_xuat_ban_admin/Quan_li_nha_xuat_ban_admin.html';
    window.location.href = href;
  };

  menuNhaxuatban.addEventListener('click', goTo);
  menuNhaxuatban.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      goTo();
    }
  });
});

// Navigate to Quản lý thể loại when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuTheLoai = document.getElementById('menu-the-loai');
  if (!menuTheLoai) return;

  const goTo = () => {
    const href = menuTheLoai.dataset.href || '../Quan_li_the_loai_admin/Quan_li_the_loai_admin.html';
    window.location.href = href;
  };

  menuTheLoai.addEventListener('click', goTo);
  menuTheLoai.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      goTo();
    }
  });
});

// Navigate to Quản lý lĩnh vực when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuLinhVuc = document.getElementById('menu-linh-vuc');
  if (!menuLinhVuc) return;

  const goTo = () => {
    const href = menuLinhVuc.dataset.href || '../Quan_li_linh_vuc_admin/Quan_li_linh_vuc_admin.html';
    window.location.href = href;
  };

  menuLinhVuc.addEventListener('click', goTo);
  menuLinhVuc.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      goTo();
    }
  });
});

// Navigate to Quản lý Độc giả when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuDocGia = document.getElementById('menu-doc-gia');
  if (!menuDocGia) return;

  const goTo = () => {
    window.location.href =
      menuDocGia.dataset.href ||
      '../Quan_li_doc_gia_admin/Quan_li_doc_gia_admin.html';
  };

  menuDocGia.addEventListener('click', goTo);
  menuDocGia.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// Navigate to Quản lý sách when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuSach = document.getElementById('menu-sach');
  if (!menuSach) return;

  const goTo = () => {
    window.location.href =
      menuSach.dataset.href ||
      '../Quan_li_sach_admin/Quan_li_sach_admin.html';
  };

  menuSach.addEventListener('click', goTo);
  menuSach.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// Navigate to Quản lý phiếu mượn when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuPhieuMuon = document.getElementById('menu-phieu-muon');
  if (!menuPhieuMuon) return;

  const goTo = () => {
    window.location.href =
      menuPhieuMuon.dataset.href ||
      '../Quan_li_phieu_muon_admin/Quan_li_phieu_muon_admin.html';
  };

  menuPhieuMuon.addEventListener('click', goTo);
  menuPhieuMuon.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// Navigate to Quản lý thẻ thư viện when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuTheThuVien = document.getElementById('menu-the-thu_vien');
  if (!menuTheThuVien) return;

  const goTo = () => {
    window.location.href =
      menuTheThuVien.dataset.href ||
      '../Quan_li_the_thu_vien_admin/Quan_li_the_thu_vien_admin.html';
  };

  menuTheThuVien.addEventListener('click', goTo);
  menuTheThuVien.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// ================= LOGOUT =================
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout_function');
  if (!logoutBtn) return;

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('accountId');
    window.location.href = '../Dang_nhap/Dang_nhap.html';
  };

  logoutBtn.addEventListener('click', logout);
  logoutBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logout();
    }
  });
});
