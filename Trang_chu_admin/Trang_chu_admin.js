// Redirect to login if token is missing
if (!sessionStorage.getItem('token')) {
  window.location.href = '/Dang_nhap/Dang_nhap.html';
}
console.log('TOKEN:', sessionStorage.getItem('token'));
// ===== Real-time stats function =====
async function fetchStat({ url, key, selector }) {
  const token = sessionStorage.getItem('token');
  const el = document.querySelector(selector);
  console.log(`[BUGLOG] Fetching stat`, { url, key, selector, token });
  if (!token) {
    if (el) el.textContent = 'Lỗi: Không có token';
    console.error(`[BUGLOG] No token for stat`, { url, key, selector });
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    console.log(`[BUGLOG] Response for ${url}:`, res);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[BUGLOG] Error response for ${url}:`, errorText);
      throw new Error(errorText || 'Lỗi kết nối API');
    }
    const data = await res.json();
    console.log(`[BUGLOG] Data for ${url}:`, data);
    
    // Handle different response formats
    let value = data[key];
    if (value === undefined) {
      // If key not found, try to get the first numeric value
      value = Object.values(data).find(v => typeof v === 'number');
    }
    if (el) el.textContent = value !== undefined ? value : '0';
  } catch (err) {
    if (el) el.textContent = `Lỗi: ${err.message}`;
    console.error(`[BUGLOG] API ${url} error:`, err);
  }
}

// Show real-time stats on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchStat({
    url: 'http://localhost:8080/api/sach/admin/count',
    key: 'totalDauSach',
    selector: '#stat-totalDauSach',
  });
  fetchStat({
    url: 'http://localhost:8080/api/phieumuon/admin/count',
    key: 'totalPhieuMuon',
    selector: '#stat-totalPhieuMuon',
  });
  fetchStat({
    url: 'http://localhost:8080/api/phieumuon/admin/count/qua-han',
    key: 'totalPhieuMuonQuaHan',
    selector: '#stat-totalPhieuMuonQuaHan',
  });
  fetchStat({
    url: 'http://localhost:8080/api/docgia/admin/count',
    key: 'totalDocGia',
    selector: '#stat-totalDocGia',
  });
});

// chuyển qua form đăng ký admin
document.addEventListener('DOMContentLoaded', () => {
  const adminCard = document.getElementById('register-admin') || document.querySelector('.quick-card[aria-label="Đăng ký admin"]');
  if (!adminCard) return;

  const navigate = () => {
    window.location.href = '/dang_ky_admin/Dang_ky_admin.html';
  };

  adminCard.addEventListener('click', navigate);
  adminCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      navigate();
    }
  });
});

// chuyển qua form đăng ký độc giả

document.addEventListener('DOMContentLoaded', () => {
  const userCard = document.getElementById('register-user') || document.querySelector('.quick-card[aria-label="Đăng ký độc giả"]');
  if (!userCard) return;

  const navigate = () => {
    window.location.href = '/dang_ky_doc_gia/Dang_ky_doc_gia.html';
  };

  userCard.addEventListener('click', navigate);
  userCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      navigate();
    }
  });
});

// chuyển qua form phiếu mượn
document.addEventListener('DOMContentLoaded', () => {
  const phieuMuonCard = document.getElementById('phieu-muon');
  if (!phieuMuonCard) return;

  const goTo = () => {
    const href = phieuMuonCard.dataset.href || '../Quan_li_phieu_muon_admin/Quan_li_phieu_muon_admin.html';
    window.location.href = href;
  };

  phieuMuonCard.addEventListener('click', goTo);
  phieuMuonCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      goTo();
    }
  });
});

// chuyển về trang đăng nhập //
document.addEventListener('DOMContentLoaded', () => {
  const logout_function = document.getElementById('logout_function') || document.querySelector('.logout');
  if (!logout_function) return;

  const navigate = () => {
    // clear stored auth and redirect to login
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('accountId');
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  };

  logout_function.addEventListener('click', navigate);
  logout_function.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      navigate();
    }
  });
});

// Menu toggle for small screens
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

  // close sidebar when clicking outside (on small screens)
  document.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('open')) return;
    if (e.target.closest('.sidebar') || e.target.closest('#menu-toggle')) return;
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });

  // ensure sidebar is closed when resizing to larger screens
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
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

// Navigate to Quản thẻ thư viện when menu item clicked
document.addEventListener('DOMContentLoaded', () => {
  const menuTheThuVien = document.getElementById('menu-the-thu-vien');
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

// Add book handler
document.addEventListener('DOMContentLoaded', () => {
  const themSachCard = document.getElementById('them-sach');
  if (!themSachCard) return;

  const goTo = () => {
    // Navigate to book admin page where add book modal is available
    window.location.href = '../Quan_li_sach_admin/Quan_li_sach_admin.html';
  };

  themSachCard.addEventListener('click', goTo);
  themSachCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      goTo();
    }
  });
});

// show username in header if present
document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.querySelector('.username-text');
  const storedUser = sessionStorage.getItem('username');
  if (usernameEl) usernameEl.textContent = storedUser ? storedUser : 'Khách';
});
document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) {
    alert('Bạn chưa đăng nhập');
    window.location.href = '/Dang_nhap/Dang_nhap.html';
    return;
  }

  // nếu là trang admin thì nên check role
  if (role !== 'ADMIN') {
    alert('Bạn không có quyền truy cập trang này');
    sessionStorage.clear();
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  }
});
