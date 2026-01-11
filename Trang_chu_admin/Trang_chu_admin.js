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
// chuyển về trang đăng nhập //
document.addEventListener('DOMContentLoaded', () => {
  const logout_function = document.getElementById('logout_function') || document.querySelector('.logout');
  if (!logout_function) return;

  const navigate = () => {
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