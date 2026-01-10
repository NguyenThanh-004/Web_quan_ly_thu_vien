// hien thi mat khau //
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
});
