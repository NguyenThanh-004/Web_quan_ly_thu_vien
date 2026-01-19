import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Quan_li_the_loai_admin loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

/* ================= HELPER ================= */
function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/* ================= PAGINATION ================= */
let currentPage = 0;
let pageSize = 7;
let totalPages = 1;

/* ================= FETCH ================= */
async function fetchTheLoai(page = 0, size = 7) {
  const resp = await fetch(
    `${apiBase}/theloai/all?page=${page}&size=${size}`,
    { headers: buildHeaders() }
  );

  const data = await resp.json();
  renderTable(data);
}

/* ================= CREATE ================= */
async function createTheLoai(tenTheLoai) {
  const resp = await fetch(`${apiBase}/theloai/create`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ tenTheLoai })
  });

  if (!resp.ok) {
    alert('Thêm thể loại thất bại');
    return;
  }

  alert('Thêm thể loại thành công');
  fetchTheLoai(0, pageSize);
}

/* ================= UPDATE ================= */
async function updateTheLoai(id, tenTheLoai) {
  const resp = await fetch(`${apiBase}/theloai/update`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({
      theLoaiId: id,
      tenTheLoai
    })
  });

  if (!resp.ok) {
    alert('Cập nhật thất bại');
    return;
  }

  alert('Cập nhật thành công');
  fetchTheLoai(currentPage, pageSize);
}

/* ================= DELETE ================= */
async function deleteTheLoai(id) {
  if (!confirm('Bạn chắc chắn muốn xóa thể loại này?')) return;

  try {
    const resp = await fetch(
      `${apiBase}/theloai/delete?theLoaiId=${id}`,
      {
        method: 'DELETE',
        headers: buildHeaders()
      }
    );

    if (!resp.ok) {
      alert('Xóa thất bại');
      return;
    }

    alert('Đã xóa thể loại');
    fetchTheLoai(currentPage, pageSize);

  } catch (err) {
    console.error(err);
    alert('Không kết nối được server');
  }
}

/* ================= MODAL ================= */
function openModal(mode, data = {}) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${mode === 'add' ? 'Thêm thể loại' : 'Sửa thể loại'}</h3>
        <button class="modal-close">&times;</button>
      </div>

      <div class="modal-body">
        <input id="theloai-name" placeholder="Tên thể loại"
          value="${data.tenTheLoai || ''}">
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

  modal.querySelector('.btn-save').onclick = () => {
    const name = document.getElementById('theloai-name').value.trim();
    if (!name) {
      alert('Tên thể loại không được để trống');
      return;
    }

    if (mode === 'add') {
      createTheLoai(name);
    } else {
      updateTheLoai(data.theLoaiId, name);
    }

    modal.remove();
  };
}

/* ================= RENDER ================= */
function renderTable(pageData) {
  currentPage = pageData.number;
  totalPages = pageData.totalPages;

  const tbody = document.getElementById('publishers-table-body');
  tbody.innerHTML = '';

  if (!pageData.content.length) {
    tbody.innerHTML = `<tr><td colspan="3">Không có thể loại</td></tr>`;
    return;
  }

  pageData.content.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.theLoaiId}</td>
      <td>${item.tenTheLoai}</td>
      <td>
        <div class="btn-action">
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit').onclick = () =>
      openModal('edit', item);

    tr.querySelector('.btn-delete').onclick = () =>
      deleteTheLoai(item.theLoaiId);

    tbody.appendChild(tr);
  });

  document.getElementById('page-info').textContent =
    `Page ${currentPage + 1} / ${totalPages}`;

  document.getElementById('prev-page').disabled = currentPage === 0;
  document.getElementById('next-page').disabled =
    currentPage >= totalPages - 1;
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.add-button').onclick = () =>
    openModal('add');

  document.getElementById('prev-page').onclick = () =>
    fetchTheLoai(currentPage - 1, pageSize);

  document.getElementById('next-page').onclick = () =>
    fetchTheLoai(currentPage + 1, pageSize);

  fetchTheLoai();
});


/* ================= LOGOUT ================= */
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

document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.querySelector('.username-text');
  const username = sessionStorage.getItem('username');

  if (usernameEl) {
    usernameEl.textContent = username || 'Admin';
  }
});