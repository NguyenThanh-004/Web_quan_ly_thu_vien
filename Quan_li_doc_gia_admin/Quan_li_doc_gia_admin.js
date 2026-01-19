import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_doc_gia_admin loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

/* ================= STATE ================= */
let currentPage = 0;
let pageSize = 7;
let totalPages = 1;
let editingId = null;

/* ================= HELPER ================= */
function buildHeaders() {
  const headers = {};
  const token = sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function setStatus(msg) {
  const wrapper = document.querySelector('.table-wrapper');
  let status = document.getElementById('docgia-status');

  if (!status && wrapper) {
    status = document.createElement('div');
    status.id = 'docgia-status';
    status.style.margin = '8px 0';
    status.style.fontStyle = 'italic';
    wrapper.prepend(status);
  }

  if (status) status.textContent = msg || '';
}

/* ================= FETCH ================= */
async function fetchDocGia(page = 0, size = 7) {
  setStatus('Đang tải...');
  const url = `${apiBase}/docgia/all?page=${page}&size=${size}`;

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

/* ================= RENDER TABLE ================= */
function renderTable(pageData) {
  currentPage = pageData.number ?? 0;
  pageSize = pageData.size ?? pageSize;
  totalPages = pageData.totalPages ?? 1;

  const tbody = document.getElementById('docgia-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const list = pageData.content || [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">Không có độc giả.</td></tr>`;
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.docGiaId ?? ''}</td>
      <td>${item.tenDocGia ?? ''}</td>
      <td>${item.email ?? ''}</td>
      <td>${item.soDienThoai ?? ''}</td>
      <td>${item.ngaySinh ? item.ngaySinh.substring(0,10) : ''}</td>
      <td>${item.diaChi ?? ''}</td>
      <td>${item.tienKyQuy ?? 0}</td>
      <td>${item.trangThaiDocGia ?? ''}</td>
      <td>
        <div class="btn-action">
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit').onclick = () => openEditModal(item);
    tbody.appendChild(tr);
  });

  updatePagination();
}

/* ================= PAGINATION ================= */
function updatePagination() {
  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');
  const info = document.getElementById('page-info');

  if (!prev || !next || !info) return;

  prev.disabled = currentPage <= 0;
  next.disabled = currentPage >= totalPages - 1;
  info.textContent = `Page ${currentPage + 1} / ${totalPages}`;
}

/* ================= MODAL EDIT ================= */
function openEditModal(data) {
  editingId = data.docGiaId;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>Sửa độc giả</h3>
        <button class="modal-close">&times;</button>
      </div>

      <div class="modal-body">
        <input id="dg-ten" placeholder="Tên độc giả" value="${data.tenDocGia ?? ''}">
        <input id="dg-email" placeholder="Email" value="${data.email ?? ''}">
        <input id="dg-phone" placeholder="Số điện thoại" value="${data.soDienThoai ?? ''}">
        <input id="dg-ngaysinh" type="date" value="${data.ngaySinh ? data.ngaySinh.substring(0,10) : ''}">
        <input id="dg-diachi" placeholder="Địa chỉ" value="${data.diaChi ?? ''}">
        <input id="dg-kyquy" type="number" placeholder="Ký quỹ" value="${data.tienKyQuy ?? 0}">
        <select id="dg-trangthai">
          <option value="ACTIVE" ${data.trangThaiDocGia === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
          <option value="INACTIVE" ${data.trangThaiDocGia === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
        </select>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel">Hủy</button>
        <button class="btn-save">Lưu</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick =
  modal.querySelector('.btn-cancel').onclick = () => modal.remove();

  modal.querySelector('.btn-save').onclick = submitEditDocGia;
}

/* ================= UPDATE ================= */
async function submitEditDocGia() {
  const payload = {
    docGiaId: editingId,
    tenDocGia: document.getElementById('dg-ten').value.trim(),
    email: document.getElementById('dg-email').value.trim(),
    soDienThoai: document.getElementById('dg-phone').value.trim(),
    ngaySinh: document.getElementById('dg-ngaysinh').value || null,
    diaChi: document.getElementById('dg-diachi').value.trim(),
    tienKyQuy: Number(document.getElementById('dg-kyquy').value || 0),
    trangThaiDocGia: document.getElementById('dg-trangthai').value
  };

  if (!payload.tenDocGia) {
    alert('Tên độc giả không được để trống');
    return;
  }

  try {
    const resp = await fetch(`${apiBase}/docgia/admin/updatedocgia`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders()
      },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();

    if (!resp.ok) {
      alert(text || 'Sửa độc giả thất bại');
      return;
    }

    alert(text || 'Sửa độc giả thành công');
    document.querySelector('.modal-overlay').remove();
    fetchDocGia(currentPage, pageSize);

  } catch (err) {
    console.error(err);
    alert('Không kết nối được server');
  }
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');

  if (prev) prev.onclick = () => fetchDocGia(currentPage - 1, pageSize);
  if (next) next.onclick = () => fetchDocGia(currentPage + 1, pageSize);

  const usernameEl = document.querySelector('.username-text');
  if (usernameEl) {
    usernameEl.textContent =
      sessionStorage.getItem('username') || 'Khách';
  }

  fetchDocGia(0, pageSize);
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

// ================= MENU TÁC GIẢ =================
document.addEventListener('DOMContentLoaded', () => {
  const menuTacGia = document.getElementById('menu-tac-gia');
  if (!menuTacGia) return;

  const goTo = () => {
    window.location.href =
      menuTacGia.dataset.href ||
      '../Quan_li_tac_gia_admin/Quan_li_tac_gia_admin.html';
  };

  menuTacGia.addEventListener('click', goTo);
  menuTacGia.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// ================= MENU NHÀ XUẤT BẢN =================
document.addEventListener('DOMContentLoaded', () => {
  const menuNhaXuatBan = document.getElementById('menu-nha-xuat-ban');
  if (!menuNhaXuatBan) return;

  const goTo = () => {
    window.location.href =
      menuNhaXuatBan.dataset.href ||
      '../Quan_li_nha_xuat_ban_admin/Quan_li_nha_xuat_ban_admin.html';
  };

  menuNhaXuatBan.addEventListener('click', goTo);
  menuNhaXuatBan.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// ================= MENU THỂ LOẠI =================
document.addEventListener('DOMContentLoaded', () => {
  const menuTheLoai = document.getElementById('menu-the-loai');
  if (!menuTheLoai) return;

  const goTo = () => {
    window.location.href =
      menuTheLoai.dataset.href ||
      '../Quan_li_the_loai_admin/Quan_li_the_loai_admin.html';
  };

  menuTheLoai.addEventListener('click', goTo);
  menuTheLoai.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// ================= MENU THẺ THƯ VIỆN =================
document.addEventListener('DOMContentLoaded', () => {
  const menuTheThuVien = document.getElementById('menu-the-thu-vien');
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

// ================= MENU PHIẾU MƯỢN =================
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

// ================= MENU LĨNH VỰC =================
document.addEventListener('DOMContentLoaded', () => {
  const menuLinhVuc = document.getElementById('menu-linh-vuc');
  if (!menuLinhVuc) return;

  const goTo = () => {
    window.location.href =
      menuLinhVuc.dataset.href ||
      '../Quan_li_linh_vuc_admin/Quan_li_linh_vuc_admin.html';
  };

  menuLinhVuc.addEventListener('click', goTo);
  menuLinhVuc.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo();
    }
  });
});

// ================= MENU SÁCH =================
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
