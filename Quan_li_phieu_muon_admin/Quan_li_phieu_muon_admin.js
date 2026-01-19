import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_phieu_muon_admin loaded, API base:', API_CONFIG.BASE_URL);
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

// ================= PAGINATION STATE =================
let currentPage = 0;
let pageSize = 5;
let totalPages = 1;

// ================= HELPER =================
function buildHeaders(isJson = false) {
  const headers = {};
  const token = sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function setStatus(msg) {
  let status = document.getElementById('phieumuon-status');
  const list = document.getElementById('phieu-muon-list');

  if (!status && list) {
    status = document.createElement('div');
    status.id = 'phieumuon-status';
    status.style.margin = '8px 0';
    status.style.fontStyle = 'italic';
    list.before(status);
  }
  if (status) status.textContent = msg || '';
}

// ================= FETCH PHIẾU MƯỢN =================
async function fetchPhieuMuon(page = 0, size = 5) {
  setStatus('Đang tải dữ liệu...');
  const url = `${apiBase}/phieumuon/admin/load?page=${page}&size=${size}`;

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
    renderPhieuMuon(data);
    setStatus('');
  } catch (err) {
    console.error(err);
    setStatus('Không thể tải dữ liệu.');
  }
}

// ================= RENDER CARD =================
function renderPhieuMuon(pageData) {
  currentPage = pageData.number ?? 0;
  pageSize = pageData.size ?? pageSize;
  totalPages = pageData.totalPages ?? 1;

  const container = document.getElementById('phieu-muon-list');
  if (!container) return;
  container.innerHTML = '';

  const list = pageData.content || [];
  if (list.length === 0) {
    container.innerHTML = '<p>Không có phiếu mượn.</p>';
    updatePagination();
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'phieu-muon-card';

    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">
          <i class="fa-solid fa-file-invoice"></i> PHIẾU MƯỢN
        </span>
        <button class="btn-edit" data-id="${item.phieuMuonId}">
          <i class="fa-solid fa-pen"></i>
        </button>
      </div>

      <div class="card-body">
        <div class="info">
          <span class="label">Mã phiếu mượn</span>
          <span class="value">${item.phieuMuonId ?? ''}</span>
        </div>

        <div class="info">
          <span class="label">Mã thẻ thư viện</span>
          <span class="value">${item.theThuVien ?? ''}</span>
        </div>

        <div class="info">
          <span class="label">Ngày mượn</span>
          <span class="value">${formatDate(item.ngayMuon)}</span>
        </div>

        <div class="info">
          <span class="label">Trạng thái</span>
          <span class="value">${mapTrangThai(item.trangThaiPhieuMuon)}</span>
        </div>
      </div>

      <div class="card-footer">
        <button class="btn-detail" data-id="${item.phieuMuonId}">
          <i class="fa-solid fa-eye"></i> Chi tiết mượn trả
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  bindActions();
  updatePagination();
}

// ================= UPDATE STATUS =================
async function updateTrangThaiPhieuMuon(phieuMuonId, trangThai) {
  try {
    const resp = await fetch(`${apiBase}/phieumuon/admin/update-status`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ phieuMuonId, trangThai })
    });

    if (!resp.ok) {
      alert('Cập nhật trạng thái thất bại');
      return;
    }
  } catch (err) {
    console.error(err);
    alert('Không thể cập nhật trạng thái');
  }
}

// ================= UPDATE CHI TIẾT =================
async function updateChiTietStatus(phieuMuonId) {
  try {
    const resp = await fetch(`${apiBase}/phieumuon/admin/update-chitiet-status`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ phieuMuonId })
    });

    if (!resp.ok) {
      alert('Cập nhật chi tiết thất bại');
    }
  } catch (err) {
    console.error(err);
    alert('Không thể cập nhật chi tiết');
  }
}

// ================= BIND EVENTS =================
function bindActions() {
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', e => {
      const id = e.target.dataset.id;
      updateTrangThaiPhieuMuon(id, e.target.value);
    });
  });

  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      updateChiTietStatus(id);
    });
  });
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
      fetchPhieuMuon(currentPage - 1, pageSize)
    );

  if (next)
    next.addEventListener('click', () =>
      fetchPhieuMuon(currentPage + 1, pageSize)
    );

  const usernameEl = document.querySelector('.username-text');
  if (usernameEl) {
    usernameEl.textContent =
      sessionStorage.getItem('username') || 'Khách';
  }

  fetchPhieuMuon(0, pageSize);
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

// ================= MENU ĐỘC GIẢ =================
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

function mapTrangThai(status) {
    switch (status) {
        case "DANG_CHO": return "Đang chờ";
        case "DANG_MUON": return "Đang mượn";
        case "HUY": return "Huỷ";
        case "HOAN_THANH": return "Hoàn thành";
        default: return status;
    }
}