import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_nha_xuat_ban_admin loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

/* =====================================================
   LOGOUT
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout_function');
  if (!logoutBtn) return;

  const logout = () => {
    sessionStorage.clear();
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

/* =====================================================
   SIDEBAR TOGGLE
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!menuToggle || !sidebar) return;

  const toggle = () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  menuToggle.addEventListener('click', toggle);
  menuToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  document.addEventListener('click', e => {
    if (!sidebar.classList.contains('open')) return;
    if (e.target.closest('.sidebar') || e.target.closest('#menu-toggle')) return;
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

/* =====================================================
   PAGINATION STATE
===================================================== */
let currentPage = 0;
let pageSize = 7;
let totalPages = 1;

/* =====================================================
   HELPERS
===================================================== */
function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function setStatus(msg) {
  const wrapper = document.querySelector('.table-wrapper');
  let status = document.getElementById('publishers-status');

  if (!status && wrapper) {
    status = document.createElement('div');
    status.id = 'publishers-status';
    status.style.margin = '8px 0';
    status.style.fontStyle = 'italic';
    wrapper.prepend(status);
  }
  if (status) status.textContent = msg || '';
}

/* =====================================================
   FETCH BOOKS BY PUBLISHER
===================================================== */
async function fetchBooksByPublisher(nhaXuatBanId) {
  try {
    const resp = await fetch(`${apiBase}/sach/nhaxuatban?nhaXuatBanId=${nhaXuatBanId}`, {
      headers: buildHeaders()
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.content || [];
  } catch (err) {
    console.error('Error fetching books:', err);
    return [];
  }
}

/* =====================================================
   MODAL
===================================================== */
function createModal() {
  if (document.getElementById('publisher-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'publisher-modal';
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box" id="modal-box-content">
        <div class="modal-header">
          <h3 id="modal-title">Thêm NXB</h3>
          <button class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <label>Tên nhà xuất bản</label>
          <input id="modal-name" type="text">

          <label>Địa chỉ</label>
          <input id="modal-address" type="text">
        </div>

        <div class="modal-footer">
          <button id="modal-cancel" class="btn-cancel">Hủy</button>
          <button id="modal-save" class="btn-save">Cập nhật</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick = closeModal;
  modal.querySelector('#modal-cancel').onclick = closeModal;
  modal.querySelector('.modal-overlay').onclick = e => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  };
}

function openModal({ title, data = {}, onSave }) {
  createModal();
  
  const isEditing = !!data.nhaXuatBanId;
  const modalBox = document.getElementById('modal-box-content');
  
  // Always reset and rebuild structure from scratch
  const contentWrapper = modalBox.querySelector('.modal-content-wrapper');
  if (contentWrapper) {
    contentWrapper.remove();
  }
  modalBox.classList.remove('modal-with-books');
  
  // Clear existing body and footer
  const existingBody = modalBox.querySelector('.modal-body');
  const existingFooter = modalBox.querySelector('.modal-footer');
  if (existingBody) existingBody.remove();
  if (existingFooter) existingFooter.remove();
  
  // Recreate fresh body and footer
  const freshBody = document.createElement('div');
  freshBody.className = 'modal-body';
  freshBody.innerHTML = `
    <label>Tên nhà xuất bản</label>
    <input id="modal-name" type="text">

    <label>Địa chỉ</label>
    <input id="modal-address" type="text">
  `;
  modalBox.appendChild(freshBody);
  
  const freshFooter = document.createElement('div');
  freshFooter.className = 'modal-footer';
  freshFooter.innerHTML = `
    <button id="modal-cancel" class="btn-cancel">Hủy</button>
    <button id="modal-save" class="btn-save">Cập nhật</button>
  `;
  modalBox.appendChild(freshFooter);

  document.getElementById('modal-title').textContent = title;
  const nameInput = document.getElementById('modal-name');
  const addrInput = document.getElementById('modal-address');

  nameInput.value = data.tenNhaXuatBan || '';
  addrInput.value = data.diaChi || '';

  // If editing, restructure modal with two columns
  if (isEditing) {
    modalBox.classList.add('modal-with-books');
    
    // Get current body and footer
    const modalBody = modalBox.querySelector('.modal-body');
    const modalFooter = modalBox.querySelector('.modal-footer');
    
    // Create wrapper for content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content-wrapper';
    
    // Move body to form container
    const formContainer = document.createElement('div');
    formContainer.className = 'modal-form-container';
    formContainer.appendChild(modalBody);
    
    // Create books container
    const booksContainer = document.createElement('div');
    booksContainer.className = 'modal-books-container';
    booksContainer.innerHTML = `
      <div class="books-carousel-section">
        <h3>Sách của nhà xuất bản</h3>
        <div class="books-carousel">
          <div class="books-display" id="books-display">
            <div class="book-list-item" style="display:none;">Danh sách sách</div>
          </div>
          <div class="book-card">
            <img src="" alt="Book" class="book-cover">
            <p class="book-title">Đang tải...</p>
          </div>
        </div>
        <p class="book-counter" id="book-counter"></p>
      </div>
    `;
    
    // Build layout: form on top, books section below
    contentWrapper.appendChild(formContainer);
    contentWrapper.appendChild(booksContainer);
    
    // Insert content wrapper
    modalBox.appendChild(contentWrapper);
    
    // Move footer outside to modal level
    modalFooter.remove();
    const newFooter = document.createElement('div');
    newFooter.className = 'modal-footer';
    newFooter.innerHTML = `
      <button id="modal-cancel" class="btn-cancel">Hủy</button>
      <button id="modal-save" class="btn-save">Cập nhật</button>
    `;
    modalBox.appendChild(newFooter);
    
    // Setup carousel
    let books = [];
    let currentBookIndex = 0;

    async function loadBooks() {
      books = await fetchBooksByPublisher(data.nhaXuatBanId);
      if (books.length > 0) {
        renderBooksList();
        displayBook(0);
      } else {
        document.getElementById('books-display').innerHTML = '<p style="color: #999;">Không có sách nào</p>';
      }
    }

    function renderBooksList() {
      const booksList = document.getElementById('books-display');
      booksList.innerHTML = '';
      books.forEach((book, index) => {
        const item = document.createElement('div');
        item.className = 'book-list-item' + (index === 0 ? ' active' : '');
        item.textContent = book.tenSach;
        item.onclick = () => {
          displayBook(index);
          document.querySelectorAll('.book-list-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
        };
        booksList.appendChild(item);
      });
    }

    function displayBook(index) {
      if (books.length === 0) return;
      currentBookIndex = index;
      const book = books[index];
      const bookCard = booksContainer.querySelector('.book-card');
      bookCard.innerHTML = `
        <a href="/Quan_li_sach_admin/Quan_li_chi_tiet_sach.html?sachId=${book.sachId}" style="cursor: pointer; text-decoration: none;">
          <img src="${book.anhBia}" alt="${book.tenSach}" class="book-cover" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'" style="cursor: pointer;">
        </a>
        <p class="book-title">${book.tenSach}</p>
      `;
      document.getElementById('book-counter').textContent = `${index + 1} / ${books.length}`;
    }

    loadBooks();
  }

  document.getElementById('modal-save').onclick = () => {
    if (!nameInput.value.trim()) {
      alert('Tên nhà xuất bản không được để trống');
      return;
    }
    onSave({
      tenNhaXuatBan: nameInput.value.trim(),
      diaChi: addrInput.value.trim()
    });
    closeModal();
  };

  document.getElementById('publisher-modal').style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('publisher-modal');
  if (modal) {
    // Reset modal structure when closing
    const modalBox = document.getElementById('modal-box-content');
    if (modalBox && modalBox.classList.contains('modal-with-books')) {
      const contentWrapper = modalBox.querySelector('.modal-content-wrapper');
      if (contentWrapper) {
        contentWrapper.remove();
      }
      modalBox.classList.remove('modal-with-books');
    }
    
    modal.style.display = 'none';
  }
}

/* =====================================================
   API
===================================================== */
async function fetchPublishers(page = 0, size = 7) {
  setStatus('Đang tải...');
  const resp = await fetch(
    `${apiBase}/nhaxuatban/all?page=${page}&size=${size}`,
    { headers: buildHeaders() }
  );

  if (!resp.ok) {
    setStatus('Không thể tải dữ liệu');
    return;
  }

  const data = await resp.json();
  setStatus('');
  renderTable(data);
}

async function createPublisher(data) {
  const resp = await fetch(`${apiBase}/nhaxuatban/create`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data)
  });

  if (!resp.ok) return alert('Thêm thất bại');
  alert('Thêm thành công');
  fetchPublishers(0, pageSize);
}

async function updatePublisher(id, data) {
  const resp = await fetch(`${apiBase}/nhaxuatban/update`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ nhaXuatBanId: id, ...data })
  });

  if (!resp.ok) return alert('Cập nhật thất bại');
  alert('Cập nhật thành công');
  fetchPublishers(currentPage, pageSize);
}

async function deletePublisher(id) {
  if (!confirm('Bạn chắc chắn muốn xóa nhà xuất bản này?')) return;

  const resp = await fetch(`${apiBase}/nhaxuatban/delete?nhaXuatBanId=${id}`, {
    method: 'DELETE',
    headers: buildHeaders()
  });

  if (!resp.ok) return alert('Xóa thất bại');
  alert('Đã xóa nhà xuất bản');
  fetchPublishers(currentPage, pageSize);
}

/* =====================================================
   RENDER TABLE
===================================================== */
function renderTable(pageData) {
  currentPage = pageData.number;
  totalPages = pageData.totalPages;

  const tbody = document.getElementById('publishers-table-body');
  tbody.innerHTML = '';

  if (!pageData.content.length) {
    tbody.innerHTML =
      '<tr><td colspan="4">Không có nhà xuất bản.</td></tr>';
    return;
  }

  pageData.content.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.nhaXuatBanId}</td>
      <td>${item.tenNhaXuatBan}</td>
      <td>${item.diaChi || ''}</td>
      <td>
        <div class="btn-action">
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit').onclick = () =>
      openModal({
        title: 'Sửa nhà xuất bản',
        data: item,
        onSave: data => updatePublisher(item.nhaXuatBanId, data)
      });

    tr.querySelector('.btn-delete').onclick = () =>
      deletePublisher(item.nhaXuatBanId);

    tbody.appendChild(tr);
  });

  document.getElementById('page-info').textContent =
    `Page ${currentPage + 1} / ${totalPages}`;

  document.getElementById('prev-page').disabled = currentPage === 0;
  document.getElementById('next-page').disabled =
    currentPage >= totalPages - 1;
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.add-button').onclick = () =>
    openModal({
      title: 'Thêm nhà xuất bản',
      onSave: createPublisher
    });

  document.getElementById('prev-page').onclick = () =>
    fetchPublishers(currentPage - 1, pageSize);

  document.getElementById('next-page').onclick = () =>
    fetchPublishers(currentPage + 1, pageSize);

  const usernameEl = document.querySelector('.username-text');
  if (usernameEl)
    usernameEl.textContent =
      sessionStorage.getItem('username') || 'Khách';

  fetchPublishers();
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

// Navigate to Quản lý Tác giả when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuTacGia = document.getElementById('menu-tac-gia');
  if (!menuTacGia) return;

  const goTo = () => {
    const href = menuTacGia.dataset.href || '../Quan_li_tac_gia_admin/Quan_li_tac_gia_admin.html';
    window.location.href = href;
  };

  menuTacGia.addEventListener('click', goTo);
  menuTacGia.addEventListener('keydown', (e) => {
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