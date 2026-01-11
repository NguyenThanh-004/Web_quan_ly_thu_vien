document.addEventListener('DOMContentLoaded', () => {

  /* ================= DEBUG LOG ================= */
  const debugLog = (msg) => {
    console.log('[Dang_ky_admin]', msg);
    let el = document.getElementById('debug-log');
    if (!el) {
      el = document.createElement('div');
      el.id = 'debug-log';
      Object.assign(el.style, {
        position: 'fixed',
        right: '12px',
        bottom: '12px',
        maxWidth: '360px',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        padding: '8px',
        borderRadius: '6px',
        zIndex: '9999'
      });
      document.body.appendChild(el);
    }
    const item = document.createElement('div');
    item.textContent = new Date().toLocaleTimeString() + ' - ' + msg;
    el.appendChild(item);
    while (el.childNodes.length > 6) el.removeChild(el.firstChild);
  };

  debugLog('Page loaded');

  /* ================= NAVIGATION ================= */
  const navigateHome = () => {
    debugLog('Navigate home');
    window.location.href = '/Trang_chu_admin/Trang_chu_admin.html';
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
    debugLog('submitBtn not found');
    return;
  }

  debugLog('submitBtn found');
  if (!usernameInput) debugLog('usernameInput not found'); else debugLog('usernameInput found');
  if (!passwordInput) debugLog('passwordInput not found'); else debugLog('passwordInput found');

  const setDisabled = (state) => {
    submitBtn.disabled = state;
    submitBtn.textContent = state ? 'Đang gửi...' : 'Đăng ký';
    debugLog('submitBtn ' + (state ? 'disabled' : 'enabled'));
  };

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    debugLog('Submit clicked');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) {
      debugLog('validation failed: missing username or password');
      alert('Vui lòng nhập username và password');
      return;
    }

    setDisabled(true);

    try {
      const res = await fetch('http://localhost:8080/api/accounts/create/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      debugLog('Status: ' + res.status);

      // ⚠️ ĐỌC BODY 1 LẦN DUY NHẤT
       const rawText = await res.text();
      debugLog('Response: ' + rawText);

      let data = null;
      try { data = rawText ? JSON.parse(rawText) : null; } catch {}

      if (res.status === 201) {
        alert('Tạo admin thành công');
        navigateHome();
        return;
      }

      const msg = data?.message || data?.error || rawText || 'Unknown error';
      alert('Lỗi: ' + msg);

    } catch (err) {
      debugLog('Fetch error: ' + err.message);
      alert('Không kết nối được server');
    } finally {
      setDisabled(false);
    }
  });

  if (passwordInput) {
    passwordInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        debugLog('Enter pressed in password, submitting');
        submitBtn.click();
      }
    });
  } else {
    debugLog('passwordInput not found; Enter will not submit');
  }

});
