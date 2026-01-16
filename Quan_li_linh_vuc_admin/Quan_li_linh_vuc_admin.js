import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_linh_vuc_admin loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

// ================= LOGOUT =================
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout_function');
  if (!logoutBtn) return;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('accountId');
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

// ================= SIDEBAR TOGGLE =================
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

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// ================= PAGINATION STATE =================
let currentPage = 0;
let pageSize = 7;
let totalPages = 1;

// ================= HELPER =================
function buildHeaders() {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function setStatus(msg) {
  const wrapper = document.querySelector('.table-wrapper');
  let status = document.getElementById('linhvuc-status');

  if (!status && wrapper) {
    status = document.createElement('div');
    status.id = 'linhvuc-status';
    status.style.margin = '8px 0';
    status.style.fontStyle = 'italic';
    wrapper.prepend(status);
  }

  if (status) status.textContent = msg || '';
}

// ================= FETCH DATA =================
async function fetchLinhVuc(page = 0, size = 7) {
  setStatus('Đang tải...');
  const url = `${apiBase}/linhvuc/all?page=${page}&size=${size}`;

  try {
    const resp = await fetch(url, { headers: buildHeaders() });

    if (!resp.ok) {
      setStatus(`Lỗi tải dữ liệu: ${resp.status}`);
      return;
    }

    const data = await resp.json();
    renderTable(data);
    setStatus('');
  } catch (err) {
    console.error(err);
    setStatus('Không thể tải dữ liệu.');
  }
}

// ================= UPDATE =================
async function updateLinhVuc(id, tenLinhVuc) {
  const url = `${apiBase}/linhvuc/update/${id}`;

  try {
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders()
      },
      body: JSON.stringify({ tenLinhVuc })
    });

    if (!resp.ok) {
      alert('Cập nhật lĩnh vực thất bại');
      return;
    }

    alert('Cập nhật lĩnh vực thành công');
    fetchLinhVuc(currentPage, pageSize);
  } catch (err) {
    console.error(err);
    alert('Không thể cập nhật lĩnh vực');
  }
}

// ================= RENDER TABLE =================
function renderTable(pageData) {
  currentPage = pageData.number ?? 0;
  pageSize = pageData.size ?? pageSize;
  totalPages = pageData.totalPages ?? 1;

  const tbody = document.getElementById('publishers-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const list = pageData.content || [];
  if (list.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3">Không có lĩnh vực.</td></tr>';
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.linhVucId ?? ''}</td>
      <td>${item.tenLinhVuc ?? ''}</td>
      <td>
        <div class="btn-action">
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </div>
      </td>
    `;

    const btnEdit = tr.querySelector('.btn-edit');
    btnEdit.addEventListener('click', () => {
      const newName = prompt(
        'Nhập tên lĩnh vực mới:',
        item.tenLinhVuc
      );

      if (newName && newName.trim() !== '') {
        updateLinhVuc(item.linhVucId, newName.trim());
      }
    });

    tbody.appendChild(tr);
  });

  updatePagination();
}

// ================= PAGINATION UI =================
function updatePagination() {
  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');
  const info = document.getElementById('page-info');

  if (!prev || !next || !info) return;

  prev.disabled = currentPage <= 0;
  next.disabled = currentPage >= totalPages - 1;
  info.textContent = `Page ${currentPage + 1} / ${totalPages}`;
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');

  if (prev)
    prev.addEventListener('click', () =>
      fetchLinhVuc(currentPage - 1, pageSize)
    );

  if (next)
    next.addEventListener('click', () =>
      fetchLinhVuc(currentPage + 1, pageSize)
    );

  const usernameEl = document.querySelector('.username-text');
  if (usernameEl) {
    usernameEl.textContent =
      localStorage.getItem('username') || 'Khách';
  }

  fetchLinhVuc(0, pageSize);
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

// Navigate to Quản lý Nhà xuất bản when menu item clicked
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


