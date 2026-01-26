import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_linh_vuc_admin loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

// ================== HELPERS ==================
function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ================== MODAL ==================
function createModal() {
  if (document.getElementById('linhvuc-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'linhvuc-modal';
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modal-title">Thêm lĩnh vực</h3>
          <button class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <label>Tên lĩnh vực</label>
          <input type="text" id="linhvuc-name" placeholder="Nhập tên lĩnh vực">
        </div>

        <div class="modal-footer">
          <button id="modal-cancel" class="btn-cancel">Hủy</button>
          <button id="modal-save" class="btn-save">Lưu</button>
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

function openModal({ title, value = '', onSave }) {
  createModal();

  document.getElementById('modal-title').textContent = title;
  const input = document.getElementById('linhvuc-name');
  input.value = value;
  input.focus();

  document.getElementById('modal-save').onclick = () => {
    if (!input.value.trim()) {
      alert('Tên lĩnh vực không được để trống');
      return;
    }
    onSave(input.value.trim());
    closeModal();
  };

  document.getElementById('linhvuc-modal').style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('linhvuc-modal');
  if (modal) modal.style.display = 'none';
}

// ================== PAGINATION ==================
let currentPage = 0;
let pageSize = 7;
let totalPages = 1;

// ================== API ==================
async function fetchLinhVuc(page = 0, size = 7) {
  const resp = await fetch(
    `${apiBase}/linhvuc/all?page=${page}&size=${size}`,
    { headers: buildHeaders() }
  );
  const data = await resp.json();
  renderTable(data);
}

async function createLinhVuc(tenLinhVuc) {
  const resp = await fetch(`${apiBase}/linhvuc/create`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ tenLinhVuc })
  });

  if (!resp.ok) return alert('Thêm lĩnh vực thất bại');
  alert('Thêm lĩnh vực thành công');
  fetchLinhVuc(0, pageSize);
}

async function updateLinhVuc(id, tenLinhVuc) {
  const resp = await fetch(`${apiBase}/linhvuc/update`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ 
      linhVucId: id,
      tenLinhVuc: tenLinhVuc
     })
  });

  // if (!resp.ok) return alert('Cập nhật thất bại');
  if (!resp.ok)  {
    const errorData = await resp.json().catch(() => ({}));
    console.error('Cập nhật thất bại:', errorData);
    return alert('Cập nhật thất bại' + (errorData.message || "Loi system"));
  }
  alert('Cập nhật thành công');
  fetchLinhVuc(currentPage, pageSize);
}

async function deleteLinhVuc(id) {
  if (!confirm('Bạn chắc chắn muốn xóa lĩnh vực này?')) return;

  try {
    const resp = await fetch(
      `${apiBase}/linhvuc/delete?linhVucId=${id}`,
      {
        method: 'DELETE',
        headers: buildHeaders()
      }
    );

    if (!resp.ok) {
      alert('Xóa thất bại');
      return;
    }

    alert('Đã xóa lĩnh vực');

    /* ===== RELOAD BẢNG ===== */
    currentPage = 0;

    const tableBody = document.querySelector('#linhvucTableBody');
    if (tableBody) {
      tableBody.innerHTML = '';
    }

    fetchLinhVuc(currentPage, pageSize);

  } catch (err) {
    console.error(err);
    alert('Không kết nối được server' + err.message);
  }
}

// ================== RENDER ==================
function renderTable(pageData) {
  currentPage = pageData.number;
  totalPages = pageData.totalPages;

  const tbody = document.getElementById('publishers-table-body');
  tbody.innerHTML = '';

  if (!pageData.content.length) {
    tbody.innerHTML = `<tr><td colspan="3">Không có dữ liệu</td></tr>`;
    return;
  }

  pageData.content.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.linhVucId}</td>
      <td>${item.tenLinhVuc}</td>
      <td>
        <div class="btn-action">
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit').onclick = () =>
      openModal({
        title: 'Sửa lĩnh vực',
        value: item.tenLinhVuc,
        onSave: v => updateLinhVuc(item.linhVucId, v)
      });

    tr.querySelector('.btn-delete').onclick = () =>
      deleteLinhVuc(item.linhVucId);

    tbody.appendChild(tr);
  });

  document.getElementById('page-info').textContent =
    `Page ${currentPage + 1} / ${totalPages}`;

  document.getElementById('prev-page').disabled = currentPage === 0;
  document.getElementById('next-page').disabled =
    currentPage >= totalPages - 1;
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.add-button').onclick = () =>
    openModal({
      title: 'Thêm lĩnh vực',
      onSave: createLinhVuc
    });

  document.getElementById('prev-page').onclick = () =>
    fetchLinhVuc(currentPage - 1, pageSize);

  document.getElementById('next-page').onclick = () =>
    fetchLinhVuc(currentPage + 1, pageSize);

  fetchLinhVuc();
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


document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.querySelector('.username-text');
  const username = sessionStorage.getItem('username');

  if (usernameEl) {
    usernameEl.textContent = username || 'Admin';
  }
});