const apiBase = 'http://localhost:8080';
const token = sessionStorage.getItem('token');
console.log('Token:', token);
const main = document.querySelector('.main');
const bookGrid = document.getElementById('bookGrid');
const btnLoadMore = document.getElementById('btnLoadMore');
const btnScrollTop = document.getElementById('btnScrollTop');

let page = 0;
const pagesize = 10;
const moresize = 10;

/* ===== AUTH CHECK ===== */
if (!token) {
  alert('Bạn chưa đăng nhập');
  window.location.href = '../Dang_nhap/Dang_nhap.html';
}

/* ===== LOAD BOOK ===== */
async function loadBooks(isLoadMore = false) {
  const size = isLoadMore ? moresize : pagesize;
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
btnScrollTop.addEventListener('click', () => {
  main.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== EVENTS ===== */
btnLoadMore.addEventListener('click', () => loadBooks(true));

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
    <div class="modal-box large">
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
                <div class="theloai-dropdown-wrapper">
                  <div class="theloai-dropdown-trigger" id="theloaiTrigger">
                    <span id="theloaiPlaceholder">-- Chọn thể loại --</span>
                    <i class="fa-solid fa-chevron-down"></i>
                  </div>
                  <div class="theloai-dropdown-menu" id="theloaiDropdown" style="display: none;">
                    <div id="theloaiList"></div>
                  </div>
                </div>
                <input type="hidden" name="theLoaiId" id="theLoaiId" required />
              </label>
            </div>

            <label>
              Tác giả
              <div class="tacgia-dropdown-wrapper">
                <div class="tacgia-dropdown-trigger" id="tacgiaTrigger">
                  <span id="tacgiaPlaceholder">-- Chọn tác giả --</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="tacgia-dropdown-menu" id="tacgiaDropdown" style="display: none;">
                  <div id="tacgiaList"></div>
                </div>
              </div>
              <input type="hidden" name="tacGiaIds" id="tacGiaIds" required />
            </label>
          </div>

        </div>

        <button type="submit" class="btn-submit">Thêm</button>
      </form>
    </div>
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

  // Handle image upload and preview
  const imageInput = modal.querySelector('#imageInput');
  const previewImage = modal.querySelector('#previewImage');
  // Use closure to share state between modal and handleAddBook
  let uploadedImageUrl = '';
  let uploading = false;

  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    console.log('[IMAGE UPLOAD] File selected:', { fileName: file?.name, fileSize: file?.size, fileType: file?.type });
    
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImage.src = event.target.result;
      };
      reader.readAsDataURL(file);

      // Show uploading status
      previewImage.style.opacity = '0.5';
      previewImage.title = 'Đang tải ảnh...';
      uploading = true;
      uploadedImageUrl = '';
      
      console.log('[IMAGE UPLOAD] Starting upload to:', `${apiBase}/api/images/upload`);
      
      try {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        console.log('[IMAGE UPLOAD] FormData prepared, sending request...');
        
        const uploadResp = await fetch(`${apiBase}/api/images/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: uploadForm
        });
        
        console.log('[IMAGE UPLOAD] Response received:', { status: uploadResp.status, statusText: uploadResp.statusText });
        
        if (uploadResp.ok) {
          // Backend now returns JSON { imageUrl: ... }
          const data = await uploadResp.json();
          console.log('[IMAGE UPLOAD] Success - Response data:', data);
          
          uploadedImageUrl = data && data.imageUrl ? data.imageUrl : '';
          previewImage.style.opacity = '1';
          previewImage.title = uploadedImageUrl ? 'Tải ảnh thành công' : 'Không nhận được URL ảnh';
          
          console.log('[IMAGE UPLOAD] Uploaded URL:', uploadedImageUrl);
          
          if (!uploadedImageUrl) {
            console.warn('[IMAGE UPLOAD] Warning: No imageUrl in response');
            alert('Không nhận được URL ảnh');
          }
        } else {
          uploadedImageUrl = '';
          previewImage.title = 'Tải ảnh thất bại';
          const errText = await uploadResp.text();
          console.error('[IMAGE UPLOAD] Upload failed:', { status: uploadResp.status, error: errText });
          
          let errorMsg = 'Tải ảnh thất bại';
          try {
            const errData = JSON.parse(errText);
            if (errData && errData.error) errorMsg += ': ' + errData.error;
            console.error('[IMAGE UPLOAD] Parsed error:', errData);
          } catch (parseErr) {
            console.error('[IMAGE UPLOAD] Error parsing response:', parseErr);
          }
          alert(errorMsg);
        }
      } catch (err) {
        uploadedImageUrl = '';
        previewImage.title = 'Tải ảnh thất bại';
        console.error('[IMAGE UPLOAD] Exception during upload:', err);
        alert('Tải ảnh thất bại: ' + (err && err.message ? err.message : err));
      }
      
      uploading = false;
      console.log('[IMAGE UPLOAD] Upload process completed. Uploading:', uploading);
    }
  });

  // Populate select dropdowns (linh vuc, nha xuat ban, the loai) and tacgia dropdown
  (async function populateSelects() {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [lvResp, nxbResp, tlResp, tgResp] = await Promise.all([
        fetch(`${apiBase}/api/linhvuc/all?page=0&size=200`, { headers }),
        fetch(`${apiBase}/api/nhaxuatban/all?page=0&size=200`, { headers }),
        fetch(`${apiBase}/api/theloai/all?page=0&size=200`, { headers }),
        fetch(`${apiBase}/api/tacgia/all?page=0&size=200`, { headers })
      ]);

      const [lvData, nxbData, tlData, tgData] = await Promise.all([
        lvResp.ok ? lvResp.json() : { content: [] },
        nxbResp.ok ? nxbResp.json() : { content: [] },
        tlResp.ok ? tlResp.json() : { content: [] },
        tgResp.ok ? tgResp.json() : { content: [] }
      ]);

      const selLv = modal.querySelector('#select-linhvuc');
      const selNxb = modal.querySelector('#select-nhaxuatban');
      const selTl = modal.querySelector('#select-theloai');

      // helper to fill regular selects
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
      // Populate theloai custom dropdown (upward)
      populateTheloaiDropdown(tlData.content || []);

      // Populate tacgia dropdown with checkboxes
      populateTacgiaDropdown(tgData.content || []);

    } catch (err) {
      console.error('Populate selects error:', err);
    }
  })();

  // Populate tacgia dropdown with checkboxes
  function populateTacgiaDropdown(tacgiaList) {
    const tacgiaListEl = modal.querySelector('#tacgiaList');
    const tacgiaTrigger = modal.querySelector('#tacgiaTrigger');
    const tacgiaDropdown = modal.querySelector('#tacgiaDropdown');
    const tacGiaIdsInput = modal.querySelector('#tacGiaIds');
    const tacgiaPlaceholder = modal.querySelector('#tacgiaPlaceholder');
    
    let selectedTacgiaIds = [];

    tacgiaListEl.innerHTML = '';
    (tacgiaList || []).forEach(tg => {
      const label = document.createElement('label');
      label.className = 'tacgia-checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tg.tacGiaId;
      
      const text = document.createElement('span');
      text.textContent = tg.tenTacGia;
      
      label.appendChild(text);
      label.appendChild(checkbox);
      tacgiaListEl.appendChild(label);

      // Manually handle checkbox toggle by tracking label clicks
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        // Read the current state before toggle
        const wasChecked = checkbox.checked;
        // Toggle it
        checkbox.checked = !wasChecked;
        
        // Now update the selectedTacgiaIds array based on new state
        const newCheckedState = checkbox.checked;
        if (newCheckedState) {
          if (!selectedTacgiaIds.includes(tg.tacGiaId)) {
            selectedTacgiaIds.push(tg.tacGiaId);
          }
        } else {
          selectedTacgiaIds = selectedTacgiaIds.filter(id => id !== tg.tacGiaId);
        }
        updateTacgiaDisplay();
      });
    });

    function updateTacgiaDisplay() {
      tacGiaIdsInput.value = selectedTacgiaIds.join(',');
      if (selectedTacgiaIds.length === 0) {
        tacgiaPlaceholder.textContent = '-- Chọn tác giả --';
      } else {
        const selectedNames = Array.from(tacgiaListEl.querySelectorAll('input:checked')).map(cb => {
          return cb.parentElement.textContent.trim();
        });
        tacgiaPlaceholder.textContent = selectedNames.join(', ');
      }
    }

    // Toggle dropdown visibility
    tacgiaTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = tacgiaDropdown.style.display !== 'none';
      tacgiaDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Prevent clicks inside dropdown from propagating
    tacgiaDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!modal.querySelector('.tacgia-dropdown-wrapper').contains(e.target)) {
        tacgiaDropdown.style.display = 'none';
      }
    }, { once: false });
  }

  // Populate theloai dropdown (upward, no checkboxes)
  function populateTheloaiDropdown(theloaiList) {
    const theloaiListEl = modal.querySelector('#theloaiList');
    const theloaiTrigger = modal.querySelector('#theloaiTrigger');
    const theloaiDropdown = modal.querySelector('#theloaiDropdown');
    const theLoaiIdInput = modal.querySelector('#theLoaiId');
    const theloaiPlaceholder = modal.querySelector('#theloaiPlaceholder');
    
    let selectedTheloaiId = null;

    theloaiListEl.innerHTML = '';
    (theloaiList || []).forEach(tl => {
      const item = document.createElement('div');
      item.className = 'theloai-dropdown-item';
      item.textContent = tl.tenTheLoai;
      theloaiListEl.appendChild(item);

      // Handle item click
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTheloaiId = tl.theLoaiId;
        theLoaiIdInput.value = selectedTheloaiId;
        theloaiPlaceholder.textContent = tl.tenTheLoai;
        theloaiDropdown.style.display = 'none';
      });
    });

    // Toggle dropdown visibility
    theloaiTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = theloaiDropdown.style.display !== 'none';
      theloaiDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Prevent clicks inside dropdown from propagating
    theloaiDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!modal.querySelector('.theloai-dropdown-wrapper').contains(e.target)) {
        theloaiDropdown.style.display = 'none';
      }
    }, { once: false });
  }

  // Handle form submission
  const bookForm = modal.querySelector('#bookForm');
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (uploading) {
      alert('Vui lòng chờ tải ảnh xong trước khi thêm sách!');
      return;
    }
    await handleAddBook(modal, uploadedImageUrl);
  });
}

async function handleAddBook(modal, imageFile) {
  const form = modal.querySelector('#bookForm');
  const formData = new FormData(form);

  // Parse tacGiaIds from comma-separated string to array
  const tacGiaIdsStr = formData.get('tacGiaIds');
  const tacGiaIds = tacGiaIdsStr ? tacGiaIdsStr.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id)) : [];

  // Use uploaded image URL if available
  let anhBia = '';
  if (imageFile) {
    anhBia = imageFile;
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
