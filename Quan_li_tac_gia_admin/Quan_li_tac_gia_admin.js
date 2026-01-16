import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_tac_gia_admin module loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

// nút đăng xuất
document.addEventListener('DOMContentLoaded', () => {
  const logout_function = document.getElementById('logout_function');
  if (!logout_function) return;

  const navigate = () => {
    // clear local auth data then redirect to login
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('accountId');
    window.location.href = '../Dang_nhap/Dang_nhap.html';
  };

  logout_function.addEventListener('click', navigate);
  logout_function.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      navigate();
    }
  });
});

// sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (!menuToggle || !sidebar) return;

  const toggle = () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  menuToggle.addEventListener('click', toggle);
  menuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggle();
    }
  });

  // tắt sidebar khi click ngoài
  document.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('open')) return;
    if (e.target.closest('.sidebar') || e.target.closest('#menu-toggle')) return;
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });

  // tắt sidebar khi zoom to màn hình
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// quay về trang chủ admin
document.addEventListener('DOMContentLoaded', () => {
  const menuTrangChu = document.getElementById('menu-trang-chu');
  if (!menuTrangChu) return;

  const navigateToAdminHome = () => {
    const href = menuTrangChu.dataset.href || '../Trang_chu_admin/Trang_chu_admin.html';
    window.location.href = href;
  };

  menuTrangChu.addEventListener('click', navigateToAdminHome);
  menuTrangChu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      navigateToAdminHome();
    }
  });
});

// Navigate to Quản lý nhà x when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuNhaXuatBan = document.getElementById('menu-nha-xuat-ban');
  if (!menuNhaXuatBan) return;

  const goTo = () => {
    const href = menuNhaXuatBan.dataset.href || '../Quan_li_nha_xuat_ban_admin/Quan_li_nha_xuat_ban_admin.html';
    window.location.href = href;
  };

  menuNhaXuatBan.addEventListener('click', goTo);
  menuNhaXuatBan.addEventListener('keydown', (e) => {
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

// ---- lấy tác giả và render bảng ----
let currentPage = 0;
let pageSize = 7; // hiển thị 7 tác giả mỗi trang
let totalPages = 1;

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('vi-VN');
}

function setStatus(msg) {
  const statusEl = document.getElementById('authors-status');
  if (statusEl) statusEl.textContent = msg;
  else if (msg) console.info('Status:', msg);
}

function buildHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function fetchAuthors(page = 0, size = 7) {
  setStatus('Đang tải...');
  const url = `${apiBase}/tacgia/all?page=${page}&size=${size}`;
  console.debug('Fetching authors from', url);
  try {
    const resp = await fetch(url, { headers: buildHeaders(false) });

    if (resp.status === 401) {
      setStatus('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
      console.warn('Fetch authors unauthorized (401)');
      return;
    }
    if (resp.status === 403) {
      setStatus('Bạn không có quyền truy cập (403). Xin đăng nhập bằng tài khoản quản trị.');
      console.warn('Fetch authors forbidden (403)');
      return;
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error('Fetch authors failed', resp.status, text);
      setStatus(`Lỗi tải dữ liệu: ${resp.status}`);
      const tbody = document.getElementById('books-table-body');
      if (tbody) tbody.innerHTML = `<tr><td colspan="6">Lỗi tải dữ liệu: ${resp.status}</td></tr>`;
      return;
    }

    const data = await resp.json();
    renderAuthorsTable(data);
    setStatus('');
  } catch (err) {
    console.error('Failed to fetch authors', err);
    setStatus('Không thể tải dữ liệu: ' + (err.message || err));
    const tbody = document.getElementById('books-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6">Không thể tải dữ liệu.</td></tr>';
  }
}

function renderAuthorsTable(pageData) {
  currentPage = pageData.number ?? 0;
  pageSize = pageData.size ?? pageSize;
  totalPages = pageData.totalPages ?? 1;

  const tbody = document.getElementById('books-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const list = pageData.content || [];
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Không có tác giả.</td></tr>';
  }

  list.forEach((item, idx) => {
    const tr = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.textContent = item.tacGiaId ?? '';

    const nameTd = document.createElement('td');
    nameTd.textContent = item.tenTacGia ?? '';

    const placeTd = document.createElement('td');
    placeTd.textContent = item.noiLamViec ?? '';

    const addressTd = document.createElement('td');
    addressTd.textContent = item.diaChi ?? '';

    const dobTd = document.createElement('td');
    dobTd.textContent = formatDate(item.ngayThangNamSinh);

    const actionTd = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'btn-action';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Sửa';
    editBtn.addEventListener('click', () => onEditAuthor(item.tacGiaId));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Xóa';
    deleteBtn.addEventListener('click', () => onDeleteAuthor(item.tacGiaId));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    actionTd.appendChild(actions);

    tr.appendChild(idTd);
    tr.appendChild(nameTd);
    tr.appendChild(placeTd);
    tr.appendChild(addressTd);
    tr.appendChild(dobTd);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  updatePaginationControls();
}

function updatePaginationControls() {
  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');
  const info = document.getElementById('page-info');
  if (!prev || !next || !info) return;

  prev.disabled = currentPage <= 0;
  next.disabled = currentPage >= totalPages - 1;
  info.textContent = `Page ${currentPage + 1} / ${totalPages}`;
}

/*function onEditAuthor(tacGiaId) {
  // sửa tác giả
  window.location.href = `sua_tac_gia.html?tacGiaId=${tacGiaId}`;
}*/

/*async function onDeleteAuthor(tacGiaId) {
  //xóa tác giả
  const ok = confirm('Bạn có chắc muốn xóa tác giả này không?');
  if (!ok) return;
  try {
    const resp = await fetch(`${apiBase}/tacgia/${tacGiaId}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error(`Delete failed: ${resp.status}`);
    // refresh trang
    alert('Xóa tác giả thành công.');
    fetchAuthors(currentPage, pageSize);
  } catch (err) {
    console.error('Delete failed', err);
    alert('Không thể xóa tác giả.');
  }
}*/

// Create author form will be implemented later; the interactive prompt-based create was removed.

// khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');
  const wrapper = document.querySelector('.table-wrapper');

  if (prev) prev.addEventListener('click', () => fetchAuthors(Math.max(0, currentPage - 1), pageSize));
  if (next) next.addEventListener('click', () => fetchAuthors(Math.min(totalPages - 1, currentPage + 1), pageSize));

  // Note: 'Add' control removed; will add a proper form later.

  // thêm phần trạng thái (hiển thị lỗi/đang tải)
  if (wrapper && !document.getElementById('authors-status')) {
    const status = document.createElement('div');
    status.id = 'authors-status';
    status.style.margin = '8px 0';
    status.style.color = '#333';
    status.style.fontStyle = 'italic';
    // insert after the add button container if present, otherwise at top
    const after = wrapper.querySelector('.add-button-container') || wrapper.firstChild;
    if (after && after.parentNode) after.parentNode.insertBefore(status, after.nextSibling);
    else wrapper.insertBefore(status, wrapper.firstChild);
    console.debug('Authors status element added');
  }

  // hiển thị username nếu có token
  const usernameEl = document.querySelector('.username-text');
  const storedUser = sessionStorage.getItem('username');
  if (usernameEl) {
    usernameEl.textContent = storedUser ? storedUser : 'Khách';
  }

  // lấy dữ liệu 
  fetchAuthors(0, pageSize);
});