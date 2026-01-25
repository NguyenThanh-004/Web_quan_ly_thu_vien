document.addEventListener('DOMContentLoaded', () => {

  /* ================= NAVIGATION ================= */
  const navigateHome = () => {
    window.location.href = '../Trang_chu_admin/Trang_chu_admin.html';
  };

  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', navigateHome);
    closeBtn.addEventListener('keydown', e => {
      if (['Enter', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault();
        navigateHome();
      }
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') navigateHome();
  });

  /* ================= FORM ================= */
  const usernameInput = document.querySelector('#Username');
  const passwordInput = document.querySelector('#Password');
  const submitBtn = document.querySelector('.btn-submit');

  if (!submitBtn) {
    return;
  }

  console.log(usernameInput, passwordInput, submitBtn);
  const setDisabled = (state) => {
    submitBtn.disabled = state;
    submitBtn.textContent = state ? 'Đang gửi...' : 'Đăng ký';
  };

  /* ================= SUBMIT ================= */
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = usernameInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const token = sessionStorage.getItem('token');
    if (!username || !password) {
      alert('Vui lòng nhập username và password');
      return;
    }

    setDisabled(true);

    try {

      const res = await fetch('http://localhost:8080/api/accounts/create/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      // ⚠️ đọc body 1 lần duy nhất
      const rawText = await res.text();

      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
      }

      if (res.status === 201 || res.status === 200) {
        alert('Tạo admin thành công 🎉');
        navigateHome();
        return;
      }

      const msg =
        data?.message ||
        data?.error ||
        rawText ||
        'Không xác định';

      alert('Lỗi: ' + msg);

    } catch (err) {
      alert('Không kết nối được server');
    } finally {
      setDisabled(false);
    }
  });

  /* ================= ENTER TO SUBMIT ================= */
  if (passwordInput) {
    passwordInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitBtn.click();
      }
    });
  }

});
