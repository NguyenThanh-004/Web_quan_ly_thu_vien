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
  // Always request all phiếu mượn by setting trangThai=TAT_CA
  const url = `${apiBase}/phieumuon/admin/load?page=${page}&size=${size}&trangThai=TAT_CA`;
  console.log('[fetchPhieuMuon] Fetching:', url);

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
    console.log('[fetchPhieuMuon] API response:', data);
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
    // Show raw API response for debugging
    container.innerHTML = `
      <p>Không có phiếu mượn.</p>
      <details style="margin-top:8px;">
        <summary>API response (debug)</summary>
        <pre style="max-width:100%;overflow:auto;background:#f8f8f8;border:1px solid #ccc;padding:8px;">${JSON.stringify(pageData, null, 2)}</pre>
      </details>
    `;
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

      </div>

      <div class="card-body">
        <div class="info">
          <span class="label">Mã phiếu mượn</span>
          <span class="value">${item.phieuMuonId ?? ''}</span>
        </div>

        <div class="info">
          <span class="label">Mã thẻ thư viện</span>
          <span class="value">${item.theThuVien ? item.theThuVien : ''}</span>
        </div>

        <div class="info">
          <span class="label">Số sách mượn</span>
          <span class="value" id="book-count-${item.phieuMuonId}">
            <i>Đang tải...</i>
          </span>
        </div>

        <div class="info">
          <span class="label">Ngày mượn</span>
          <span class="value">${formatDate(item.ngayMuon)}</span>
        </div>

        <div class="info">
          <span class="label">Trạng thái</span>
          <span class="value">
            <select class="status-select" data-id="${item.phieuMuonId}">
              <option value="DANG_CHO" ${item.trangThaiPhieuMuon === 'DANG_CHO' ? 'selected' : ''}>Đang chờ</option>
              <option value="DANG_MUON" ${item.trangThaiPhieuMuon === 'DANG_MUON' ? 'selected' : ''}>Đang mượn</option>
              <option value="HUY" ${item.trangThaiPhieuMuon === 'HUY' ? 'selected' : ''}>Huỷ</option>
              <option value="HOAN_THANH" ${item.trangThaiPhieuMuon === 'HOAN_THANH' ? 'selected' : ''}>Hoàn thành</option>
            </select>
          </span>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-detail" data-id="${item.phieuMuonId}">
          <i class="fa-solid fa-eye"></i> Chi tiết mượn trả
        </button>
      </div>
    `;
    container.appendChild(card);
      getSoSachDangMuon(item.phieuMuonId).then(count => {
      const el = document.getElementById(`book-count-${item.phieuMuonId}`);
      if (el) el.textContent = count;
    });
  });
  bindActions();
  updatePagination();
}

// ================= UPDATE STATUS =================
async function updateTrangThaiPhieuMuon(phieuMuonId, trangThai) {

  try {
    const resp = await fetch(`${apiBase}/phieumuon/admin/update-status/${phieuMuonId}`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ trangThai })
    });

    if (!resp.ok) {
      alert('Cập nhật trạng thái thất bại');
      return;
    }
    // Reload data after update
    fetchPhieuMuon(currentPage, pageSize);
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

  document.querySelectorAll('.btn-chitietmuontra').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await showChiTietMuonTraModal(id);
    });
  });
// ================= SHOW CHI TIẾT MUỢN TRẢ MODAL =================
async function showChiTietMuonTraModal(phieuMuonId) {
  try {
    const resp = await fetch(`${apiBase}/api/phieumuon/chitietmuontra?phieuMuonId=${phieuMuonId}`, {
      headers: buildHeaders()
    });
    if (!resp.ok) {
      alert('Không thể tải chi tiết mượn trả');
      return;
    }
    const data = await resp.json();
    showModalChiTietMuonTra(data);
  } catch (err) {
    console.error(err);
    alert('Không thể tải chi tiết mượn trả');
  }
}

function showModalChiTietMuonTra(list) {
  let modal = document.getElementById('chitiet-muontra-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'chitiet-muontra-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>Chi tiết mượn trả</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${Array.isArray(list) && list.length > 0
          ? list.map(ct => `
              <div class='chitiet-muontra'>
                <span>Mã chi tiết: ${ct.chiTietMuonTraId ?? ''}</span><br>
                <span>Ngày trả: ${formatDate(ct.ngayTra)}</span><br>
                <span>Tiền phạt: ${ct.tienPhat ?? ''}</span><br>
              </div>
            `).join('')
          : 'Không có chi tiết.'}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}
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

async function getSoSachDangMuon(phieuMuonId) {
  const token = sessionStorage.getItem('token');
  const res = await fetch(
    `http://localhost:8080/api/phieumuon/chitietmuontra?phieuMuonId=${phieuMuonId}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }        
  });
  if (!res.ok) return 0;
  const list = await res.json();
  if (!Array.isArray(list)) return 0;

  return list.filter(ct => ct.ngayTra === null).length;
}
