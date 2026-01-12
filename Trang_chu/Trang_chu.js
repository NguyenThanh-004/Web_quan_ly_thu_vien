document.addEventListener('DOMContentLoaded', () => {
  // === CHECK LOGIN NGAY KHI LOAD ===
  const username = localStorage.getItem('username');
  console.log('Logged in user:', username);
  console.log('User role:', localStorage.getItem('role'));
  console.log('Auth token:', localStorage.getItem('token'));
  const loginLink = document.querySelector('.login-link');
  const userMenu = document.querySelector('.user-menu');
  const usernameText = document.querySelector('.username-text');
  const btnUser = document.querySelector('.btn-user');
  const logoutBtn = document.querySelector('.btn-logout');

  // 🔹 CHƯA ĐĂNG NHẬP → GIỮ NGUYÊN NAV
  if (!username) {
    return;
  }

  // 🔹 ĐÃ ĐĂNG NHẬP → THAY NAV
  loginLink.style.display = 'none';
  userMenu.style.display = 'block';
  usernameText.textContent = username;

  // Toggle dropdown
  btnUser.addEventListener('click', () => {
    userMenu.classList.toggle('show');
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  });

  // Click ngoài → đóng dropdown
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });
});

