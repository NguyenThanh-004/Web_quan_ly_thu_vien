import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.debug('Dang_ky_doc_gia loaded, API base:', API_CONFIG.BASE_URL);
const apiBase = API_CONFIG.BASE_URL;

// ================= HELPER =================
function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = sessionStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

// ================= CLOSE BUTTON =================
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.close-btn');
  if (!closeBtn) return;

  const goHome = () => {
    window.location.href =
      closeBtn.dataset.href ||
      '../Trang_chu_admin/Trang_chu_admin.html';
  };

  closeBtn.addEventListener('click', goHome);
  closeBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goHome();
    }
  });
});

// ================= REGISTER DOC GIA =================
document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.querySelector('.btn-submit');
  if (!btnSubmit) return;

  const register = async () => {
    const payload = {
      fullName: document.getElementById('TenDocGia')?.value.trim(),
      email: document.getElementById('Email')?.value.trim(),
      dateOfBirth: document.getElementById('NgaySinh')?.value,
      phone: document.getElementById('SoDienThoai')?.value.trim(),
      address: document.getElementById('DiaChi')?.value.trim(),
      password: document.getElementById('Password')?.value,
      deposit: Number(document.getElementById('TienQuy')?.value || 0),
      cardIssueDate: document.getElementById('NgayCap')?.value,
      cardExpireDate: document.getElementById('NgayHetHan')?.value,
      role: 'USER'
    };

    // validate cơ bản
    if (!payload.fullName || !payload.email || !payload.password) {
      alert('Vui lòng nhập đầy đủ Tên độc giả, Email và Password');
      return;
    }

    try {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Đang đăng ký...';

      const resp = await fetch(
        `${apiBase}/api/accounts/create/user`,
        {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || `HTTP ${resp.status}`);
      }

      alert('Đăng ký độc giả thành công 🎉');

      // quay về trang chủ admin
      window.location.href =
        '../Trang_chu_admin/Trang_chu_admin.html';

    } catch (err) {
      console.error('Register error:', err);
      alert('Lỗi đăng ký: ' + err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Đăng ký';
    }
  };

  btnSubmit.addEventListener('click', register);
  btnSubmit.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      register();
    }
  });
});
