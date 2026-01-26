document.addEventListener('DOMContentLoaded', () => {
  // === CHECK LOGIN NGAY KHI LOAD ===
  const username = sessionStorage.getItem('username');
  console.log('Logged in user:', username);
  console.log('User role:', sessionStorage.getItem('role'));
  console.log('Auth token:', sessionStorage.getItem('token'));
  const token = sessionStorage.getItem('token');
  const loginLink = document.querySelector('.login-link');
  const userMenu = document.querySelector('.user-menu');
  const libraryActions = document.querySelector('.library-actions');
  const usernameText = document.querySelector('.username-text');
  const btnUser = document.querySelector('.btn-user');
  const logoutBtn = document.querySelector('.btn-logout');
  const cartRaw = sessionStorage.getItem('cart');
  const cart = cartRaw ? JSON.parse(cartRaw) : null;
  console.log('Cart content:', cart);
  // 🔹 CHƯA ĐĂNG NHẬP → GIỮ NGUYÊN NAV
  if (!username) {
    window.location.href = '/Dang_nhap/Dang_nhap.html';
    return;
  }

  // 🔹 ĐÃ ĐĂNG NHẬP → THAY NAV
  loginLink.style.display = 'none';
  userMenu.style.display = 'block';
  libraryActions.style.display = 'block';
  usernameText.textContent = username;

  // Toggle dropdown
  btnUser.addEventListener('click', () => {
    userMenu.classList.toggle('show');
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  });


  // Click ngoài → đóng dropdown
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });


  // ================== SCROLL TO TOP ==================
const btnScrollTop = document.getElementById('btnScrollTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    btnScrollTop.style.display = 'flex';
  } else {
    btnScrollTop.style.display = 'none';
  }
});

btnScrollTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});


  if (!cart || !cart.selectedBanSaoSachIds || cart.selectedBanSaoSachIds.length === 0) {
    renderEmptyCart();
    return;
  }

  fetch("http://localhost:8080/api/cart/view", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
          selectedBanSaoSachIds: cart.selectedBanSaoSachIds
      })
  })
  .then(res => {
      if (!res.ok) throw new Error("Lỗi API giỏ sách");
      return res.json();
  })
  .then(data => {
      renderCartItems(data.content);
  })
  .catch(err => {
      console.error(err);
  });
});

function renderCartItems(list) {
    const container = document.getElementById('cart-items');
    container.innerHTML = ''; 

    list.forEach(item => {
        const authors = item.tacGiaList.map(a => a.tenTacGia).join(', ');
        const tinhTrangText = item.tinhTrangBanSaoSach === 'MOI' ? 'Mới' : 'Cũ';
        const tinhTrangClass = item.tinhTrangBanSaoSach === 'MOI' ? 'new' : 'old';

        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.anhBia || 'https://via.placeholder.com/80x110'}">

                <div class="cart-info">
                    <h4>${item.tenSach}</h4>
                    <p class="author">${authors}</p>
                    <p class="meta">Mã bản sao: ${item.banSaoSachId}</p>
                    <p class="status ${tinhTrangClass}">
                        Tình trạng: ${tinhTrangText}
                    </p>
                </div>

                <div class="cart-actions">
                    <input type="checkbox"
                    class="cart-check"
                    data-id="${item.banSaoSachId}"
                    checked>
                    <button class="remove-item"
                        onclick="removeFromCart(${item.banSaoSachId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}


function removeFromCart(banSaoSachId) {
    const cart = JSON.parse(sessionStorage.getItem('cart'));
    cart.selectedBanSaoSachIds =
        cart.selectedBanSaoSachIds.filter(id => id !== banSaoSachId);

    sessionStorage.setItem('cart', JSON.stringify(cart));

    // Reload lại giỏ
    location.reload();
}

function renderEmptyCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = `
        <p style="
            text-align:center;
            margin-top:40px;
            color:#777;
            font-size:15px;
        ">
            🛒 Giỏ sách của bạn đang trống
        </p>
    `;
}


document.querySelector('.clear-cart')
    .addEventListener('click', () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ sách?')) return;

        sessionStorage.setItem('cart', JSON.stringify({
            selectedBanSaoSachIds: []
        }));

        renderEmptyCart();
    });


function getSelectedBanSaoIds() {
    const checkedBoxes =
        document.querySelectorAll('.cart-check:checked');
    console.log('CHECKED BOXES:', checkedBoxes);
    return Array.from(checkedBoxes)
        .map(cb => Number(cb.dataset.id));
}

document.querySelector('.btn-borrow')
    .addEventListener('click', async () => {

    const selectedBanSaoSachIds = getSelectedBanSaoIds();
    console.log('length selected:', selectedBanSaoSachIds.length); 
    // ❌ Không chọn gì
    if (selectedBanSaoSachIds.length === 0) {
        alert('Bạn chưa chọn bản sao nào để mượn');
        return;
    }

    const token = sessionStorage.getItem('token');

    try {
        const res = await fetch(
            "http://localhost:8080/api/phieumuon/create",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    selectedBanSaoSachIds: selectedBanSaoSachIds
                })
            }
        );

        let data = null;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            data = await res.text(); // <-- TEXT tiếng Việt
        }

        if (!res.ok) {
            alert(data?.message || data || "Tạo phiếu mượn thất bại");
            return;
        }

        alert("📚 Mượn sách thành công!");
        removeBorrowedFromCart(selectedBanSaoSachIds);
        window.location.href = '/Trang_lich_su_muon/Trang_lich_su_muon.html';
    } catch (err) {
        alert(err.message);
    }
});

function removeBorrowedFromCart(borrowedIds) {
    const cart =
        JSON.parse(sessionStorage.getItem('cart'));

    const remainIds =
        cart.selectedBanSaoSachIds
            .filter(id => !borrowedIds.includes(id));

    sessionStorage.setItem(
        'cart',
        JSON.stringify({
            selectedBanSaoSachIds: remainIds
        })
    );

    if (remainIds.length === 0) {
        renderEmptyCart();
    } else {
        reloadCartFromAPI(remainIds);
    }
}

function reloadCartFromAPI(ids) {
    const token = sessionStorage.getItem('token');
    fetch('http://localhost:8080/api/cart/view', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            selectedBanSaoSachIds: ids
        })
    })
    .then(res => res.json())
    .then(data => {
        renderCartItems(data.content);
    });
}
