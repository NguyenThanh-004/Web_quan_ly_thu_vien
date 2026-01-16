import { API_CONFIG } from '../Assets/JS/Config/api.config.js';
document.addEventListener('DOMContentLoaded', async () => {
  const username = sessionStorage.getItem('username');
  const accountId = sessionStorage.getItem('accountId');
  const token = sessionStorage.getItem('token');
  console.log('Logged in user:', username);
  console.log('User role:', sessionStorage.getItem('role'));
  console.log('Auth token:', sessionStorage.getItem('token'));
  const loginLink = document.querySelector('.login-link');
  const userMenu = document.querySelector('.user-menu');
  const usernameText = document.querySelector('.username-text');
  const btnUser = document.querySelector('.btn-user');
  const logoutBtn = document.querySelector('.btn-logout');

  // ===== CHƯA ĐĂNG NHẬP =====
  if (!username || !accountId) {
    window.location.href = '/Dang_nhap/Dang_nhap.html';
    return;
  }

  // ===== ĐÃ ĐĂNG NHẬP =====
  loginLink.style.display = 'none';
  userMenu.style.display = 'block';
  usernameText.textContent = username;

  // Toggle dropdown
  btnUser.addEventListener('click', () => {
    userMenu.classList.toggle('show');
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  });

  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });

  // ===== FETCH PROFILE =====
  try {
    

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/docgia/chitietdocgia?accountId=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Không lấy được dữ liệu độc giả');
    }

    const data = await response.json();
    console.log('Profile data:', data);

    // ===== HIỂN THỊ =====
    document.getElementById('profileName').textContent = data.tenDocGia;
    document.getElementById('profileId').textContent = `ID: ${data.docGiaId}`;

    document.getElementById('profileMoney').textContent =
      data.tienKyQuy.toLocaleString('vi-VN') + ' VND';

    document.getElementById('profileStatus').innerHTML =
      `<i class="fas fa-circle"></i> ${data.trangThaiDocGia}`;

    document.getElementById('infoName').textContent = data.tenDocGia;
    document.getElementById('infoEmail').textContent = data.email;
    document.getElementById('infoPhone').textContent = data.soDienThoai;
    document.getElementById('infoAddress').textContent = data.diaChi;

    const birthDate = new Date(data.ngaySinh).toLocaleDateString('vi-VN');
    document.getElementById('infoBirth').textContent = birthDate;

    document.getElementById('cardId').textContent = data.theThuVienId;
    document.getElementById('cardStatus').textContent = data.trangThai;
    document.getElementById('cardIssueDate').textContent = data.ngayCap;
    document.getElementById('cardExpiryDate').textContent = data.ngayHetHan;

  } catch (error) {
    console.error(error);
    alert('Không thể tải thông tin người dùng');
  }
});