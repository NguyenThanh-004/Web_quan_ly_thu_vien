const apiBase = 'http://localhost:8080';
const token = sessionStorage.getItem('token');
console.log('Token:', token);
const main = document.querySelector('.main');
const bookGrid = document.getElementById('bookGrid');
const btnLoadMore = document.getElementById('btnLoadMore');
const btnScrollTop = document.getElementById('btnScrollTop');

let page = 0;
const size = 10;

/* ===== AUTH CHECK ===== */
if (!token) {
  alert('Bạn chưa đăng nhập');
  window.location.href = '../Dang_nhap/Dang_nhap.html';
}

/* ===== LOAD BOOK ===== */
async function loadBooks() {
  const res = await fetch(
    `${apiBase}/api/sach/all?page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    alert('Không thể tải sách');
    return;
  }

  const data = await res.json();
  renderBooks(data.content);
  page++;

  if (data.last) btnLoadMore.style.display = 'none';
}

/* ===== RENDER ===== */
function renderBooks(books) {
  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <a href="/Quan_li_sach_admin/Quan_li_chi_tiet_sach.html?sachId=${book.sachId}">
        <img src="${book.anhBia}" style="cursor:pointer;">
      </a>
      <h4>${book.tenSach}</h4>
      <p>${book.tacGiaList?.map(t => t.tenTacGia).join(', ') || 'Chưa rõ'}</p>
    `;
    bookGrid.appendChild(card);
  });
}

/* ===== SEARCH FUNCTION ===== */
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');

async function searchBooks(keyword) {
  // If search box is empty, reload all books
  if (!keyword.trim()) {
    bookGrid.innerHTML = '';
    page = 0;
    btnLoadMore.style.display = 'block';
    loadBooks();
    return;
  }

  try {
    const res = await fetch(
      `${apiBase}/api/sach/search?keyword=${encodeURIComponent(keyword)}&page=0&size=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      alert('Không thể tìm kiếm sách');
      return;
    }

    const data = await res.json();
    bookGrid.innerHTML = '';
    page = 0;
    renderBooks(data.content || data);
    btnLoadMore.style.display = data.last ? 'none' : 'block';
  } catch (err) {
    console.error('Search error:', err);
    alert('Lỗi khi tìm kiếm');
  }
}

btnSearch.addEventListener('click', () => {
  const keyword = searchInput.value.trim();
  searchBooks(keyword);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    btnSearch.click();
  }
});

/* ===== SCROLL TOP ===== */
main.addEventListener('scroll', () => {
  btnScrollTop.style.display = main.scrollTop > 300 ? 'block' : 'none';
});

btnScrollTop.addEventListener('click', () => {
  main.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== EVENTS ===== */
btnLoadMore.addEventListener('click', loadBooks);

/* ===== INIT ===== */
loadBooks();

/* ===== ADD BOOK MODAL ===== */
document.getElementById('btnAddBook').addEventListener('click', () => {
  showAddBookModal();
});

/* ===== REPORT BUTTON ===== */
document.getElementById('btnReport').addEventListener('click', () => {
  alert('Chức năng báo cáo đang được phát triển');
  // TODO: Implement report generation (PDF export, etc.)
});

function showAddBookModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'addBookModal';
  modal.innerHTML = `
    <div class="modal-header">
      <h2>Thêm sách</h2>
      <span class="close">&times;</span>
    </div>

    <div class="card">
      <h3>Thông tin sách</h3>

      <form id="bookForm">
        <div class="form-grid">

          <!-- Ảnh -->
          <div class="image-box">
            <img id="previewImage" src="" alt="Preview" />
            <button type="button" class="btn-upload" onclick="document.getElementById('imageInput').click()">
              Tải ảnh
            </button>
            <input type="file" id="imageInput" hidden accept="image/*">
          </div>

          <!-- Thông tin -->
          <div class="fields">
            <label>
              Tên sách
              <input type="text" name="tenSach" required />
            </label>

            <label>
              Năm xuất bản
              <input type="date" name="namXuatBan" />
            </label>

            <div class="row">
              <label>
                Số trang
                <input type="number" name="soTrang" />
              </label>

              <label>
                Khổ sách
                <input type="text" name="khoSach" />
              </label>
            </div>

            <div class="row">
              <label>
                Giá tiền
                <input type="number" name="giaTien" step="0.01" />
              </label>

              <label>
                Lĩnh vực
                <select name="linhVucId" id="select-linhvuc" required>
                  <option value="">-- Đang tải --</option>
                </select>
              </label>
            </div>

            <div class="row">
              <label>
                Nhà xuất bản
                <select name="nhaXuatBanId" id="select-nhaxuatban" required>
                  <option value="">-- Đang tải --</option>
                </select>
              </label>

              <label>
                Thể loại
                <select name="theLoaiId" id="select-theloai" required>
                  <option value="">-- Đang tải --</option>
                </select>
              </label>
            </div>

            <label>
              Tác giả ID (cách nhau bằng dấu phẩy)
              <input type="text" name="tacGiaIds" placeholder="1,2,3" required />
            </label>
          </div>

        </div>

        <button type="submit" class="btn-submit">Thêm</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Handle close button
  modal.querySelector('.close').addEventListener('click', () => {
    modal.remove();
  });

  // Handle modal click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Handle image preview
  const imageInput = modal.querySelector('#imageInput');
  const previewImage = modal.querySelector('#previewImage');
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Populate select dropdowns (linh vuc, nha xuat ban, the loai)
  (async function populateSelects() {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [lvResp, nxbResp, tlResp] = await Promise.all([
        fetch(`${apiBase}/api/linhvuc/all?page=0&size=200`, { headers }),
        fetch(`${apiBase}/api/nhaxuatban/all?page=0&size=200`, { headers }),
        fetch(`${apiBase}/api/theloai/all?page=0&size=200`, { headers })
      ]);

      const [lvData, nxbData, tlData] = await Promise.all([
        lvResp.ok ? lvResp.json() : { content: [] },
        nxbResp.ok ? nxbResp.json() : { content: [] },
        tlResp.ok ? tlResp.json() : { content: [] }
      ]);

      const selLv = modal.querySelector('#select-linhvuc');
      const selNxb = modal.querySelector('#select-nhaxuatban');
      const selTl = modal.querySelector('#select-theloai');

      // helper to fill
      function fill(selectEl, items, idKey, nameKey) {
        selectEl.innerHTML = '<option value="">-- Chọn --</option>';
        (items || []).forEach(it => {
          const opt = document.createElement('option');
          opt.value = it[idKey];
          opt.textContent = it[nameKey];
          selectEl.appendChild(opt);
        });
      }

      fill(selLv, lvData.content, 'linhVucId', 'tenLinhVuc');
      fill(selNxb, nxbData.content, 'nhaXuatBanId', 'tenNhaXuatBan');
      fill(selTl, tlData.content, 'theLoaiId', 'tenTheLoai');

    } catch (err) {
      console.error('Populate selects error:', err);
    }
  })();

  // Handle form submission
  const bookForm = modal.querySelector('#bookForm');
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleAddBook(modal, imageInput.files[0]);
  });
}

async function handleAddBook(modal, imageFile) {
  const form = modal.querySelector('#bookForm');
  const formData = new FormData(form);

  // Parse tacGiaIds from comma-separated string to array
  const tacGiaIdsStr = formData.get('tacGiaIds');
  const tacGiaIds = tacGiaIdsStr ? tacGiaIdsStr.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id)) : [];

  // Upload image if provided
  let anhBia = '';
  if (imageFile) {
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', imageFile);
      // TODO: Replace with actual image upload API endpoint
      const uploadResp = await fetch(`${apiBase}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm
      });
      if (uploadResp.ok) {
        const uploadData = await uploadResp.json();
        anhBia = uploadData.url || uploadData.imagePath || '';
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Tải ảnh thất bại');
      return;
    }
  }

  // Create book payload
  // Read select values directly to ensure we get numeric IDs
  const selNxb = modal.querySelector('#select-nhaxuatban');
  const selLv = modal.querySelector('#select-linhvuc');
  const selTl = modal.querySelector('#select-theloai');

  const payload = {
    tenSach: formData.get('tenSach'),
    soTrang: Number(formData.get('soTrang')) || 0,
    khoSach: formData.get('khoSach'),
    anhBia: anhBia,
    giaTien: Number(formData.get('giaTien')) || 0,
    namXuatBan: formData.get('namXuatBan') ? new Date(formData.get('namXuatBan')).toISOString().split('T')[0] : null,
    nhaXuatBanId: selNxb ? Number(selNxb.value) : Number(formData.get('nhaXuatBanId')),
    linhVucId: selLv ? Number(selLv.value) : Number(formData.get('linhVucId')),
    theLoaiId: selTl ? Number(selTl.value) : Number(formData.get('theLoaiId')),
    tacGiaIds: tacGiaIds
  };

  try {
    const resp = await fetch(`${apiBase}/api/sach/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    if (!resp.ok) {
      alert(text || 'Thêm sách thất bại');
      return;
    }

    alert(text || 'Thêm sách thành công');
    modal.remove();
    page = 0;
    bookGrid.innerHTML = '';
    loadBooks();
  } catch (err) {
    console.error('Add book error:', err);
    alert('Không thể thêm sách');
  }
}

/* ===== LOGOUT ===== */
document.getElementById('logout_function').onclick = () => {
  sessionStorage.clear();
  window.location.href = '../Dang_nhap/Dang_nhap.html';
};

/* ================= MENU NAVIGATION (FIX) ================= */
document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu li[data-href]');

  menuItems.forEach(item => {
    const href = item.dataset.href;
    if (!href) return;

    const navigate = () => {
      window.location.href = href;
    };

    item.addEventListener('click', navigate);

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });

    // cho biết menu nào đã bind
    console.debug('[MENU]', item.id || item.textContent.trim(), '→', href);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.querySelector('.username-text');
  const username = sessionStorage.getItem('username');

  if (usernameEl) {
    usernameEl.textContent = username || 'Admin';
  }
});
