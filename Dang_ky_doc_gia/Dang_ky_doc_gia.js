import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

console.log('API BASE:', API_CONFIG.BASE_URL);

// ================= TOKEN / USER =================
const token = sessionStorage.getItem('token');
const usernameLogin = sessionStorage.getItem('username');

console.log('Login username:', usernameLogin);
console.log('Token:', token);

// ================= HELPER =================
function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// yyyy-MM-dd  -->  dd/MM/yyyy
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ================= REGISTER =================
document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.querySelector('.btn-submit');
  if (!btnSubmit) return;

  const register = async () => {

    // ================= PAYLOAD ĐÚNG BACKEND =================
    const payload = {
      username: document.getElementById('Username')?.value.trim(),
      password: document.getElementById('Password')?.value,

      tenDocGia: document.getElementById('TenDocGia')?.value.trim(),
      email: document.getElementById('Email')?.value.trim(),
      soDienThoai: document.getElementById('SoDienThoai')?.value.trim(),
      diaChi: document.getElementById('DiaChi')?.value.trim(),

      ngaySinh: formatDateToDDMMYYYY(
        document.getElementById('NgaySinh')?.value
      ),
      ngayHetHan: formatDateToDDMMYYYY(
        document.getElementById('NgayHetHan')?.value
      ),

      soLuongSachDuocMuon: Number(
        document.getElementById('SoSachToiDa')?.value || 5
      )
    };

    console.log('REGISTER PAYLOAD:', payload);

    // ================= VALIDATE =================
    if (
      !payload.username ||
      !payload.password ||
      !payload.tenDocGia ||
      !payload.email
    ) {
      alert('Vui lòng nhập đầy đủ Username, Password, Tên độc giả, Email');
      return;
    }

    try {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Đang đăng ký...';

      const resp = await fetch(
        `${API_CONFIG.BASE_URL}/accounts/create/user`,
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
  document.querySelector('.close-btn').addEventListener('click', () => {
    window.location.href = '../Trang_chu_admin/Trang_chu_admin.html';
  });
});
