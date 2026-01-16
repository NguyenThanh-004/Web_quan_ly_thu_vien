// hiển thị mật khẩu //
import { API_CONFIG } from '../Assets/JS/Config/api.config.js';

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const eye = document.querySelector('.password-box .eye');
  if (!passwordInput || !eye) return;

  const toggle = () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eye.classList.toggle('fa-eye');
    eye.classList.toggle('fa-eye-slash');
  };

  eye.addEventListener('click', toggle);
  eye.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  // ô nhập và call API
  const form = document.querySelector('.login-form');
  if (!form) return;

  const usernameInput = form.querySelector('input[type="text"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const subtitle = form.querySelector('.subtitle');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (usernameInput && usernameInput.value) ? usernameInput.value.trim() : '';
    const password = (passwordInput && passwordInput.value) ? passwordInput.value : '';

    // thông báo 
    if (!username || !password) {
      subtitle.textContent = 'Vui lòng nhập tên đăng nhập và mật khẩu.';
      subtitle.style.color = 'red';
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng nhập...';
    subtitle.textContent = 'Đang kiểm tra thông tin...';
    subtitle.style.color = '#666';

    try {
      const res = await fetch(API_CONFIG.BASE_URL + '/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Đăng nhập thất bại');
      }

      const data = await res.json();
      console.log('LOGIN RESPONSE:', data);
      console.log('ROLE TYPE:', typeof data.role);
      console.log('ROLE VALUE:', `"${data.role}"`);
      // lưu session
      sessionStorage.setItem('accountId', data.accountId);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('role', data.role);
      sessionStorage.setItem('token', data.token);

      // nối đến trang chủ
      if (data.role === 'ADMIN') {
        window.location.href = '/Trang_chu_admin/Trang_chu_admin.html';
      } else {
        window.location.href = '/Trang_chu/Trang_chu.html';
      }
    } catch (err) {
      subtitle.textContent = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      subtitle.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

const guestBtn = document.querySelector('.guest-btn');

guestBtn.addEventListener('click', () => {
    window.location.href = '/Trang_chu/Trang_chu.html';
});
