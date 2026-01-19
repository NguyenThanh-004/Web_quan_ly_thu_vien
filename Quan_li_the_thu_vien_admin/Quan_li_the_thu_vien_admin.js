import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_the_thu_vien_admin loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

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

// ================= MENU NAV =================
document.addEventListener('DOMContentLoaded', () => {
  const bindNav = (id, fallback) => {
    const el = document.getElementById(id);
    if (!el) return;
    const go = () => (window.location.href = el.dataset.href || fallback);
    el.addEventListener('click', go);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  };

  bindNav('menu-trang-chu', '../Trang_chu_admin/Trang_chu_admin.html');
  bindNav('menu-tac-gia', '../Quan_li_tac_gia_admin/Quan_li_tac_gia_admin.html');
  bindNav('menu-nha-xuat-ban', '../Quan_li_nha_xuat_ban_admin/Quan_li_nha_xuat_ban_admin.html');
  bindNav('menu-linh-vuc', '../Quan_li_linh_vuc_admin/Quan_li_linh_vuc_admin.html');
  bindNav('menu-doc-gia', '../Quan_li_doc_gia_admin/Quan_li_doc_gia_admin.html');
});

// ================= PAGINATION STATE =================
let currentPage = 0;
let pageSize = 5;
let totalPages = 1;

// ================= HELPER =================
function buildHeaders() {
  const headers = {};
  const token = sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function setStatus(msg) {
  const wrapper = document.querySelector('.table-wrapper');
  let status = document.getElementById('thethuvien-status');

  if (!status && wrapper) {
    status = document.createElement('div');
    status.id = 'thethuvien-status';
    status.style.margin = '8px 0';
    status.style.fontStyle = 'italic';
    wrapper.prepend(status);
  }

  if (status) status.textContent = msg || '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

// ================= FETCH DATA =================
async function fetchTheThuVien(page = 0, size = 5) {
  setStatus('Đang tải...');
  const url = `${apiBase}/thethuvien/all?page=${page}&size=${size}`;

  try {
    const resp = await fetch(url, { headers: buildHeaders() });

    if (resp.status === 401) {
      setStatus('Bạn chưa đăng nhập.');
      return;
    }
    if (resp.status === 403) {
      setStatus('Bạn không có quyền truy cập.');
      return;
    }
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

// ================= RENDER TABLE =================
function renderTable(pageData) {
  currentPage = pageData.number ?? 0;
  pageSize = pageData.size ?? pageSize;
  totalPages = pageData.totalPages ?? 1;

  const tbody = document.getElementById('library-cards-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const list = pageData.content || [];
  if (list.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7">Không có thẻ thư viện.</td></tr>';
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.theThuVienId ?? ''}</td>
      <td>${item.tenDocGia ?? ''}</td>
      <td>${formatDate(item.ngayCap)}</td>
      <td>${formatDate(item.ngayHetHan)}</td>
      <td>${item.trangThai ?? ''}</td>
      <td>${item.soLuongSachDuocMuon ?? 0}</td>
      <td><button class="btn-update" data-id="${item.theThuVienId}" data-exp="${item.ngayHetHan}" data-status="${item.trangThai}">Sửa</button></td>
    `;
    tbody.appendChild(tr);
  });
  bindUpdateButtons();
// ================= UPDATE MODAL & FUNCTION =================
function bindUpdateButtons() {
  document.querySelectorAll('.btn-update').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const exp = btn.dataset.exp;
      const status = btn.dataset.status;
      showUpdateModal(id, exp, status);
    });
  });
}

function showUpdateModal(theThuVienId, ngayHetHan, trangThai) {
  const old = document.getElementById('update-modal');
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.id = 'update-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" id="close-update-modal">&times;</span>
      <h2>Cập nhật thẻ thư viện</h2>
      <form id="update-form">
        <input type="hidden" name="theThuVienId" value="${theThuVienId}">
        <div>
          <label>Ngày hết hạn</label>
          <input type="date" name="ngayHetHan" value="${ngayHetHan ? new Date(ngayHetHan).toISOString().slice(0,10) : ''}" required>
        </div>
        <div>
          <label>Trạng thái</label>
          <select name="trangThai">
            <option value="HOAT_DONG" ${trangThai === 'HOAT_DONG' ? 'selected' : ''}>Hoạt động</option>
            <option value="VO_HIEU" ${trangThai === 'VO_HIEU' ? 'selected' : ''}>Vô hiệu</option>
          </select>
        </div>
        <button type="submit">Lưu</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-update-modal').onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  document.getElementById('update-form').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      theThuVienId: Number(form.theThuVienId.value),
      ngayHetHan: form.ngayHetHan.value,
      trangThai: form.trangThai.value
    };
    try {
      const resp = await fetch(`${apiBase}/thethuvien/update`, {
        method: 'PUT',
        headers: { ...buildHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!resp.ok) {
        alert('Cập nhật thất bại');
        return;
      }
      alert('Cập nhật thành công');
      modal.remove();
      fetchTheThuVien(currentPage, pageSize);
    } catch (err) {
      alert('Lỗi khi cập nhật');
    }
  };
}

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
      fetchTheThuVien(currentPage - 1, pageSize)
    );

  if (next)
    next.addEventListener('click', () =>
      fetchTheThuVien(currentPage + 1, pageSize)
    );

  const usernameEl = document.querySelector('.username-text');
  if (usernameEl) {
    usernameEl.textContent =
      sessionStorage.getItem('username') || 'Khách';
  }

  fetchTheThuVien(0, pageSize);
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

// Navigate to Quản lý phiếu mượn when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuPhieuMuon = document.getElementById('menu-phieu-muon');
  if (!menuPhieuMuon) return;

  const goTo = () => {
    const href = menuPhieuMuon.dataset.href || '../Quan_li_phieu_muon_admin/Quan_li_phieu_muon_admin.html';
    window.location.href = href;
  };

  menuPhieuMuon.addEventListener('click', goTo);
  menuPhieuMuon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
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
    const href = menuSach.dataset.href || '../Quan_li_sach_admin/Quan_li_sach_admin.html';
    window.location.href = href;
  };

  menuSach.addEventListener('click', goTo);
  menuSach.addEventListener('keydown', (e) => {
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

// Navigate to Quản lý thẻ thư viện when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuTheThuVien = document.getElementById('menu-the-thu_vien');
  if (!menuTheThuVien) return;

  const goTo = () => {
    const href = menuTheThuVien.dataset.href || '../Quan_li_the_thu_vien_admin/Quan_li_the_thu_vien_admin.html';
    window.location.href = href;
  };

  menuTheThuVien.addEventListener('click', goTo);
  menuTheThuVien.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      goTo();
    }
  });
});
