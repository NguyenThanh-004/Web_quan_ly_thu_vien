document.addEventListener('DOMContentLoaded', () => {
  checkLoginUI();
  const params = new URLSearchParams(window.location.search);
  const sachId = params.get('sachId');
  console.log('Sach ID:', sachId);
  if (!sachId) {
    console.error('Không tìm thấy sachId trong URL');
    return;
  }
  
  loadBookDetail(sachId);
});

function checkLoginUI() {
  const username = sessionStorage.getItem('username');
  const token = sessionStorage.getItem('token');
  console.log('Logged in user:', username);
  console.log('Auth token:', token);
  const loginLink = document.querySelector('.login-link');
  const userMenu = document.querySelector('.user-menu');
  const libraryActions = document.querySelector('.library-actions');
  const usernameText = document.querySelector('.username-text');
  const btnUser = document.querySelector('.btn-user');
  const logoutBtn = document.querySelector('.btn-logout');

  // Chưa đăng nhập
  if (!username || !token) {
    return;
  }

  // Đã đăng nhập
  loginLink.style.display = 'none';
  userMenu.style.display = 'block';
  libraryActions.style.display = 'block';
  usernameText.textContent = username;

  btnUser.addEventListener('click', () => {
    userMenu.classList.toggle('show');
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/Dang_nhap/Dang_nhap.html';
  });

  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && !btnUser.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });
}

async function loadBookDetail() {
    const params = new URLSearchParams(window.location.search);
    const sachId = params.get("sachId");

    console.log("Sach ID:", sachId);

    if (!sachId) {
        console.error("Không có sachId");
        return;
    }

    const token = sessionStorage.getItem("token");

    try {
        const res = await fetch(
            `http://localhost:8080/api/sach/chitietsach?sachId=${sachId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            throw new Error("API lỗi");
        }

        const data = await res.json();
        renderBookData(data);

    } catch (err) {
        console.error("Lỗi tải chi tiết sách:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadBookDetail);



// Hàm này bạn sẽ gọi sau khi fetch() từ API thành công
function renderBookData(data) {
    // Ảnh bìa
    document.getElementById("api-cover").src =
        data.anhBia || "https://via.placeholder.com/220x320";

    // Tên sách
    document.getElementById("api-title").innerText = data.tenSach;

    // Tác giả (nhiều tác giả)
    const authors = data.tacGiaList
        .map(tg => tg.tenTacGia)
        .join(", ");

    // Năm xuất bản (format)
    const year = data.namXuatBan
        ? new Date(data.namXuatBan).getFullYear()
        : "";

    document.getElementById("api-meta").innerText =
        `${authors} • ${year}`;

    // Grid thông tin
    document.getElementById("api-publisher").innerText = data.nhaXuatBan;
    document.getElementById("api-year").innerText = year;
    document.getElementById("api-pages").innerText = data.soTrang;
    document.getElementById("api-id").innerText = data.sachId;
    document.getElementById("api-category").innerText = data.theLoai;
    document.getElementById("api-field").innerText = data.linhVuc;
}



// Hàm render danh sách sách liên quan
function renderRelatedList(books) {
    const container = document.getElementById("related-api-list");
    container.innerHTML = books
        .map(
            (book) => `
        <div class="book-item-card">
            <img src="${book.cover}" alt="${book.title}">
            <h4>${book.title}</h4>
            <p>${book.author}</p>
        </div>
    `
        )
        .join("");
}