import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_tac_gia_admin loaded:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

/* ================= STATE ================= */
let currentPage = 0;
let pageSize = 7;
let totalPages = 1;
let editingId = null;

/* ================= HELPER ================= */
function buildHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';

  const token = sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

/* ================= FETCH ================= */
async function fetchTacGia(page = 0, size = 7) {
  try {
    const resp = await fetch(
      `${apiBase}/tacgia/all?page=${page}&size=${size}`,
      { headers: buildHeaders(false) }
    );

    if (!resp.ok) throw new Error(resp.status);

    const data = await resp.json();
    renderTable(data);

  } catch (err) {
    console.error(err);
    alert('Không tải được danh sách tác giả');
  }
}

/* ================= RENDER TABLE ================= */
function renderTable(pageData) {
  currentPage = pageData.number ?? 0;
  pageSize = pageData.size ?? pageSize;
  totalPages = pageData.totalPages ?? 1;

  const tbody = document.getElementById('books-table-body');
  tbody.innerHTML = '';

  if (!pageData.content || pageData.content.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">Không có tác giả</td>
      </tr>`;
    return;
  }

  pageData.content.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.tacGiaId}</td>
      <td>${item.tenTacGia}</td>
      <td>${item.noiLamViec || ''}</td>
      <td>${item.diaChi || ''}</td>
      <td>${item.ngayThangNamSinh || ''}</td>
      <td>
        <div class="btn-action">
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit').onclick = () => openModal(item);
    tr.querySelector('.btn-delete').onclick = () => deleteTacGia(item.tacGiaId);

    tbody.appendChild(tr);
  });

  updatePagination();
}

/* ================= PAGINATION ================= */
function updatePagination() {
  document.getElementById('prev-page').disabled = currentPage <= 0;
  document.getElementById('next-page').disabled = currentPage >= totalPages - 1;
  document.getElementById('page-info').textContent =
    `Page ${currentPage + 1} / ${totalPages}`;
}

/* ================= MODAL ================= */
function openModal(data = null) {
  editingId = data?.tacGiaId || null;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${editingId ? 'Sửa tác giả' : 'Thêm tác giả'}</h3>
        <button class="modal-close">&times;</button>
      </div>

      <div class="modal-body">
        <input id="tenTacGia" placeholder="Tên tác giả"
               value="${data?.tenTacGia || ''}">
        <input id="noiLam" placeholder="Nơi làm"
               value="${data?.noiLamViec || ''}">
        <input id="diaChi" placeholder="Địa chỉ"
               value="${data?.diaChi || ''}">
        <input id="ngaySinh" type="date"
               value="${data?.ngayThangNamSinh || ''}">
      </div>

      <div class="modal-footer">
        <button class="btn-cancel">Hủy</button>
        <button class="btn-save">
          ${editingId ? 'Cập nhật' : 'Thêm'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick =
  modal.querySelector('.btn-cancel').onclick = () => modal.remove();

  modal.querySelector('.btn-save').onclick = submitForm;
}

/* ================= FORM HELPERS ================= */
function buildPayload() {
  return {
    tenTacGia: document.getElementById('tenTacGia').value.trim(),
    noiLamViec: document.getElementById('noiLam').value.trim(),
    diaChi: document.getElementById('diaChi').value.trim(),
    ngayThangNamSinh: document.getElementById('ngaySinh').value
  };
}

function validatePayload(payload) {
  if (!payload.tenTacGia) {
    alert('Tên tác giả không được để trống');
    return false;
  }
  return true;
}

/* ================= CREATE ================= */
async function createTacGia() {
  const payload = buildPayload();
  if (!validatePayload(payload)) return;

  try {
    const resp = await fetch(`${apiBase}/tacgia/create`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload)
    });

    const text = await resp.text();

    if (!resp.ok) {
      alert(text || 'Thêm tác giả thất bại');
      return;
    }

    alert(text || 'Thêm tác giả thành công');
    document.querySelector('.modal-overlay').remove();
    fetchTacGia(currentPage, pageSize);

  } catch (err) {
    console.error(err);
    alert('Không kết nối được server');
  }
}

/* ================= UPDATE ================= */
async function updateTacGia() {
  const payload = buildPayload();
  if (!validatePayload(payload)) return;

  payload.tacGiaId = editingId;

  try {
    const resp = await fetch(`${apiBase}/tacgia/update`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(payload)
    });

    const text = await resp.text();

    if (!resp.ok) {
      alert(text || 'Cập nhật tác giả thất bại');
      return;
    }

    alert(text || 'Cập nhật thành công');
    document.querySelector('.modal-overlay').remove();
    fetchTacGia(currentPage, pageSize);

  } catch (err) {
    console.error(err);
    alert('Không kết nối được server');
  }
}

/* ================= SUBMIT ================= */
function submitForm() {
  if (editingId) {
    updateTacGia();
  } else {
    createTacGia();
  }
}

/* ================= DELETE ================= */
async function deleteTacGia(id) {
  if (!confirm('Bạn có chắc muốn xóa tác giả này?')) return;

  try {
    const resp = await fetch(`${apiBase}/tacgia/delete`, {
      method: 'DELETE',
      headers: buildHeaders(),
      body: JSON.stringify({ tacGiaId: id })
    });

    const text = await resp.text();

    if (!resp.ok) {
      alert(text || 'Xóa thất bại');
      return;
    }

    alert(text || 'Xóa thành công');
    fetchTacGia(currentPage, pageSize);

  } catch (err) {
    console.error(err);
    alert('Không kết nối được server');
  }
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prev-page').onclick =
    () => fetchTacGia(Math.max(0, currentPage - 1), pageSize);

  document.getElementById('next-page').onclick =
    () => fetchTacGia(Math.min(totalPages - 1, currentPage + 1), pageSize);

  const addBtn = document.querySelector('.add-button');
  if (addBtn) addBtn.onclick = () => openModal();

  fetchTacGia(0, pageSize);
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
