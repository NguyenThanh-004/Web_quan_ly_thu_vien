// ================== DOM READY ==================
// Use global API_CONFIG (must be loaded before this script)
var apiBase = window.API_CONFIG?.BASE_URL || 'http://localhost:8080';

document.addEventListener("DOMContentLoaded", () => {
    // Show username
    const username = sessionStorage.getItem("username");
    const usernameText = document.querySelector(".username-text");
    if (usernameText) usernameText.textContent = username || "Admin";

    // Get book id from query
    const params = new URLSearchParams(window.location.search);
    const sachId = params.get("sachId");
    if (!sachId) return;
    loadBookDetail(sachId);
    loadBanSaoSach(sachId);

    // Add Copy Button: Show modal to create new copy
    const addCopyBtn = document.getElementById("btn-add-copy");
    if (addCopyBtn) {
        addCopyBtn.onclick = () => openAddCopyModal(sachId);
    }
// ===== ADD COPY MODAL =====
function openAddCopyModal(sachId) {
    const modal = document.getElementById("update-modal");
    if (!modal) return;
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h3>Thêm bản sao sách</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <label>
                    Tình trạng
                    <select id="add-copy-tinhtrang">
                        <option value="MOI">Mới</option>
                        <option value="CU">Cũ</option>
                    </select>
                </label>
                <label>
                    Trạng thái
                    <select id="add-copy-trangthai">
                        <option value="CON">Còn</option>
                        <option value="DA_MUON">Đã mượn</option>
                        <option value="HU_HONG">Hư hỏng</option>
                    </select>
                </label>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">Hủy</button>
                <button class="btn-save">Thêm</button>
            </div>
        </div>
    `;
    modal.style.display = "flex";
    modal.querySelector('.modal-close').onclick = () => closeAddCopyModal(modal);
    modal.querySelector('.btn-cancel').onclick = () => closeAddCopyModal(modal);
    modal.querySelector('.btn-save').onclick = () => handleAddCopy(sachId, modal);
}

function closeAddCopyModal(modal) {
    modal.style.display = "none";
    modal.innerHTML = "";
}

async function handleAddCopy(sachId, modal) {
    const token = sessionStorage.getItem("token");
    const payload = {
        sachId: Number(sachId),
        tinhTrangBanSaoSach: document.getElementById("add-copy-tinhtrang").value,
        trangThaiBanSaoSach: document.getElementById("add-copy-trangthai").value
    };
    try {
        const resp = await fetch(`${apiBase}/api/bansaosach/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const text = await resp.text();
        if (!resp.ok) throw new Error(text || "Không thể thêm bản sao");
        alert(text || "Thêm bản sao thành công");
        modal.style.display = "none";
        modal.innerHTML = "";
        loadBanSaoSach(sachId);
    } catch (err) {
        alert(err.message || "Không thể thêm bản sao");
    }
}
// ================== SHOW BOOK DUPLICATES ==================
async function loadBanSaoSach(sachId) {
    try {
        const token = sessionStorage.getItem("token");
        const resp = await fetch(`${apiBase}/api/bansaosach/danhsach?sachId=${sachId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error("Không thể tải danh sách bản sao");
        const data = await resp.json();
        renderBanSaoSach(data.content || []);
    } catch (err) {
        alert("Không thể tải danh sách bản sao");
    }
    // Bind update and delete buttons after book detail loads
    let currentBookData = null;

    // Patch renderBookData to save book data and bind buttons
    const origRenderBookData = renderBookData;
    renderBookData = function(data) {
        currentBookData = data;
        origRenderBookData(data);
        bindBookActions(data);
    };

    function bindBookActions(data) {
        const updateBtn = document.getElementById("btn-update-book");
        const deleteBtn = document.getElementById("btn-delete-book");
        if (updateBtn) {
            updateBtn.onclick = () => openUpdateModal(data);
        }
        if (deleteBtn) {
            deleteBtn.onclick = () => handleDeleteBook(data.sachId);
        }
    }

    function openUpdateModal(data) {
        const modal = document.getElementById("update-modal");
        if (!modal) return;
        modal.innerHTML = `
            <div class="modal-box large">
                <div class="modal-header">
                    <h2>Cập nhật sách</h2>
                    <span class="close">&times;</span>
                </div>

                <div class="card">
                    <h3>Thông tin sách</h3>

                    <form id="bookForm">
                        <div class="form-grid">

                            <!-- Ảnh -->
                            <div class="image-box">
                                <img id="previewImage" src="${data.anhBia || '/Assets/Images/no-cover.png'}" alt="Preview" />
                                <button type="button" class="btn-upload" onclick="document.getElementById('imageInput').click()">
                                    Tải ảnh
                                </button>
                                <input type="file" id="imageInput" hidden accept="image/*">
                            </div>

                            <!-- Thông tin -->
                            <div class="fields">
                                <label>
                                    Tên sách
                                    <input type="text" id="update-title" placeholder="Tên sách" value="${data.tenSach || ''}" required />
                                </label>

                                <label>
                                    Năm xuất bản
                                    <input type="date" id="update-namXuatBan" placeholder="Năm xuất bản" value="${data.namXuatBan ? new Date(data.namXuatBan).toISOString().slice(0,10) : ''}" />
                                </label>

                                <div class="row">
                                    <label>
                                        Số trang
                                        <input type="number" id="update-pages" min="1" placeholder="Số trang" value="${data.soTrang || ''}" />
                                    </label>

                                    <label>
                                        Khổ sách
                                        <input type="text" id="update-khoSach" placeholder="Khổ sách" value="${data.khoSach || ''}" />
                                    </label>
                                </div>

                                <div class="row">
                                    <label>
                                        Giá tiền
                                        <input type="number" id="update-giaTien" min="0" step="0.01" placeholder="Giá tiền" value="${data.giaTien || ''}" />
                                    </label>

                                    <label>
                                        Lĩnh vực
                                        <select id="update-linhVucId" required>
                                            <option value="">-- Đang tải --</option>
                                        </select>
                                    </label>
                                </div>

                                <div class="row">
                                    <label>
                                        Nhà xuất bản
                                        <select id="update-nhaXuatBanId" required>
                                            <option value="">-- Đang tải --</option>
                                        </select>
                                    </label>

                                    <label>
                                        Thể loại
                                        <select id="update-theLoaiId" required>
                                            <option value="">-- Đang tải --</option>
                                        </select>
                                    </label>
                                </div>

                                <label>
                                    Tác giả ID (cách nhau bằng dấu phẩy)
                                    <input type="text" id="update-tacGiaIds" placeholder="1,2,3" value="${data.tacGiaList ? data.tacGiaList.map(t=>t.tacGiaId).join(',') : ''}" required />
                                </label>
                            </div>

                        </div>

                        <button type="submit" class="btn-submit">Cập nhật</button>
                    </form>
                </div>
            </div>
        `;
        modal.style.display = "flex";
        modal.querySelector('.close').onclick = closeModal;
        modal.querySelector('.btn-submit').onclick = (e) => {
            e.preventDefault();
            handleUpdateBook(data.sachId);
        };
        
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
        
        // populate selects for Nhà xuất bản / Lĩnh vực / Thể loại
        populateUpdateSelects(data, modal);
        
        function closeModal() {
            modal.style.display = "none";
            modal.innerHTML = "";
        }
    }

    async function populateUpdateSelects(data, modal) {
        try {
            const token = sessionStorage.getItem("token");
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

            const selLv = modal.querySelector('#update-linhVucId');
            const selNxb = modal.querySelector('#update-nhaXuatBanId');
            const selTl = modal.querySelector('#update-theLoaiId');

            function fill(selectEl, items, idKey, nameKey) {
                if (!selectEl) return;
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

            // set selected values if available on data
            if (data.nhaXuatBanId && selNxb) selNxb.value = data.nhaXuatBanId;
            if (data.linhVucId && selLv) selLv.value = data.linhVucId;
            if (data.theLoaiId && selTl) selTl.value = data.theLoaiId;

        } catch (err) {
            console.error('Populate update selects error:', err);
        }
    }

    async function handleUpdateBook(sachId) {
        const modal = document.getElementById("update-modal");
        const token = sessionStorage.getItem("token");
        // Build payload matching UpdateSachAdminRequest
        const tacGiaIdsRaw = document.getElementById("update-tacGiaIds").value.trim();
        const tacGiaIds = tacGiaIdsRaw ? tacGiaIdsRaw.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id)) : [];
        const payload = {
            sachId,
            tenSach: document.getElementById("update-title").value.trim(),
            soTrang: Number(document.getElementById("update-pages").value),
            khoSach: document.getElementById("update-khoSach").value.trim(),
            anhBia: document.getElementById("update-anhBia").value.trim(),
            giaTien: Number(document.getElementById("update-giaTien").value),
            namXuatBan: document.getElementById("update-namXuatBan").value ? new Date(document.getElementById("update-namXuatBan").value) : null,
            nhaXuatBanId: Number(document.getElementById("update-nhaXuatBanId").value),
            linhVucId: Number(document.getElementById("update-linhVucId").value),
            theLoaiId: Number(document.getElementById("update-theLoaiId").value),
            tacGiaIds
        };
        try {
            const resp = await fetch(`${apiBase}/api/sach/admin/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const text = await resp.text();
            if (!resp.ok) {
                alert(text || "Cập nhật sách thất bại");
                return;
            }
            alert(text || "Cập nhật sách thành công");
            modal.style.display = "none";
            modal.innerHTML = "";
            loadBookDetail(sachId);
        } catch (err) {
            alert("Không thể cập nhật sách");
        }
    }

    async function handleDeleteBook(sachId) {
        if (!confirm("Bạn có chắc muốn xóa sách này?")) return;
        const token = sessionStorage.getItem("token");
        try {
            const resp = await fetch(`${apiBase}/api/sach/admin/delete?sachId=${encodeURIComponent(sachId)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const text = await resp.text();
            if (!resp.ok) {
                alert(text || "Xóa sách thất bại");
                return;
            }
            alert(text || "Xóa sách thành công");
            window.location.href = "/Quan_li_sach_admin/Quan_li_sach_admin.html";
        } catch (err) {
            alert("Không thể xóa sách");
        }
    }
}

function renderBanSaoSach(list) {
    const container = document.getElementById("copy-card-grid");
    if (!container) return;
    container.innerHTML = "";
    if (!list || !list.length) {
        container.innerHTML = '<p>Không có bản sao nào.</p>';
        return;
    }
    list.forEach(item => {
        const trangThaiText = 
            item.trangThaiBanSaoSach === "CON" ? "Còn"
            : item.trangThaiBanSaoSach === "DA_MUON" ? "Đã mượn"
            : "Hư hỏng";
        
        const statusClass = 
            item.trangThaiBanSaoSach === "CON" ? "available" : "borrowed";
        
        const tinhTrangText = 
            item.tinhTrangBanSaoSach === "MOI" ? "Mới" : "Cũ";
        
        container.innerHTML += `
            <div class="copy-card">
                <div class="copy-info">
                    <div class="copy-field">
                        <span>MÃ BẢN SAO</span>
                        <p>${item.banSaoSachId}</p>
                    </div>
                    <div class="copy-field">
                        <span>TÌNH TRẠNG</span>
                        <p>${tinhTrangText}</p>
                    </div>
                    <div class="copy-field">
                        <span>TRẠNG THÁI</span>
                        <p class="status ${statusClass}">${trangThaiText}</p>
                    </div>
                </div>
                <div class="copy-actions">
                    <button class="btn-copy-update" data-id="${item.banSaoSachId}" title="Cập nhật">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-copy-delete" data-id="${item.banSaoSachId}" title="Xóa">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    // Bind update and delete handlers
    document.querySelectorAll('.btn-copy-update').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const copyId = e.currentTarget.dataset.id;
            const copyData = list.find(item => item.banSaoSachId == copyId);
            openUpdateCopyModal(copyId, copyData);
        });
    });
    /* ===== COPY UPDATE MODAL FUNCTIONS ===== */
    async function openUpdateCopyModal(copyId, copyData) {
        const modal = document.getElementById("update-modal");
        if (!modal) return;
    
        const token = sessionStorage.getItem("token");
    
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Cập nhật bản sao</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <label>
                        Tình trạng
                        <select id="copy-tinhtrang">
                            <option value="MOI" ${copyData.tinhTrangBanSaoSach === 'MOI' ? 'selected' : ''}>Mới</option>
                            <option value="CU" ${copyData.tinhTrangBanSaoSach === 'CU' ? 'selected' : ''}>Cũ</option>
                        </select>
                    </label>
                    <label>
                        Trạng thái
                        <select id="copy-trangthai">
                            <option value="CON" ${copyData.trangThaiBanSaoSach === 'CON' ? 'selected' : ''}>Còn</option>
                            <option value="DA_MUON" ${copyData.trangThaiBanSaoSach === 'DA_MUON' ? 'selected' : ''}>Đã mượn</option>
                            <option value="HU_HONG" ${copyData.trangThaiBanSaoSach === 'HU_HONG' ? 'selected' : ''}>Hư hỏng</option>
                        </select>
                    </label>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel">Hủy</button>
                    <button class="btn-save">Lưu</button>
                </div>
            </div>
        `;
    
        modal.style.display = "flex";
    
        modal.querySelector('.modal-close').onclick = () => {
            modal.style.display = "none";
            modal.innerHTML = "";
        };
    
        modal.querySelector('.btn-cancel').onclick = () => {
            modal.style.display = "none";
            modal.innerHTML = "";
        };
    
        modal.querySelector('.btn-save').onclick = () => handleUpdateCopy(copyId, modal);
    }

    async function handleUpdateCopy(copyId, modal) {
        const token = sessionStorage.getItem("token");
        const sachId = new URLSearchParams(window.location.search).get("sachId");
    
        const payload = {
            banSaoSachId: copyId,
            sachId: Number(sachId),
            tinhTrangBanSaoSach: document.getElementById("copy-tinhtrang").value,
            trangThaiBanSaoSach: document.getElementById("copy-trangthai").value
        };
    
        try {
            const resp = await fetch(`${apiBase}/api/bansaosach/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        
            const text = await resp.text();
            if (!resp.ok) {
                alert(text || "Cập nhật bản sao thất bại");
                return;
            }
            alert(text || "Cập nhật bản sao thành công");
            modal.style.display = "none";
            modal.innerHTML = "";
            loadBanSaoSach(sachId);
        } catch (err) {
            alert("Không thể cập nhật bản sao");
        }
    }
    
    document.querySelectorAll('.btn-copy-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const copyId = e.currentTarget.dataset.id;
            handleDeleteCopy(copyId);
        });
    });
}
});

// ================== BOOK DETAIL ==================
async function loadBookDetail(sachId) {
    try {
        const token = sessionStorage.getItem("token");
        const resp = await fetch(`${apiBase}/api/sach/chitietsach?sachId=${sachId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error("Không thể tải chi tiết sách");
        const data = await resp.json();
        renderBookData(data);
    } catch (err) {
        alert("Không thể tải chi tiết sách");
    }
}

function renderBookData(data) {
    document.getElementById("api-cover").src = data.anhBia || "/Assets/Images/no-cover.png";
    document.getElementById("api-title").innerText = data.tenSach;
    const authors = data.tacGiaList?.map(t => t.tenTacGia).join(", ") || "Chưa rõ";
    const year = data.namXuatBan ? new Date(data.namXuatBan).getFullYear() : "";
    document.getElementById("api-meta").innerText = `${authors} • ${year}`;
    document.getElementById("api-publisher").innerText = data.nhaXuatBan || "";
    document.getElementById("api-year").innerText = year;
    document.getElementById("api-pages").innerText = data.soTrang || "";
    document.getElementById("api-id").innerText = data.sachId || "";
    document.getElementById("api-category").innerText = data.theLoai || "";
    document.getElementById("api-field").innerText = data.linhVuc || "";
}

/* ===== COPY MODAL FUNCTIONS ===== */
async function openUpdateCopyModal(copyId, copyData) {
    const modal = document.getElementById("update-modal");
    if (!modal) return;
    
    
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h3>Cập nhật bản sao</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <label>
                    Tình trạng
                    <select id="copy-tinhtrang">
                        <option value="MOI" ${copyData.tinhTrangBanSaoSach === 'MOI' ? 'selected' : ''}>Mới</option>
                        <option value="CU" ${copyData.tinhTrangBanSaoSach === 'CU' ? 'selected' : ''}>Cũ</option>
                    </select>
                </label>
                <label>
                    Trạng thái
                    <select id="copy-trangthai">
                        <option value="CON" ${copyData.trangThaiBanSaoSach === 'CON' ? 'selected' : ''}>Còn</option>
                        <option value="DA_MUON" ${copyData.trangThaiBanSaoSach === 'DA_MUON' ? 'selected' : ''}>Đã mượn</option>
                        <option value="HU_HONG" ${copyData.trangThaiBanSaoSach === 'HU_HONG' ? 'selected' : ''}>Hư hỏng</option>
                    </select>
                </label>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">Hủy</button>
                <button class="btn-save">Lưu</button>
            </div>
        </div>
    `;
    
    modal.style.display = "flex";
    
    modal.querySelector('.modal-close').onclick = () => {
        modal.style.display = "none";
        modal.innerHTML = "";
    };
    
    modal.querySelector('.btn-cancel').onclick = () => {
        modal.style.display = "none";
        modal.innerHTML = "";
    };
    
    modal.querySelector('.btn-save').onclick = () => handleUpdateCopy(copyId, modal);
}

async function handleUpdateCopy(copyId, modal) {
    const token = sessionStorage.getItem("token");
    const sachId = new URLSearchParams(window.location.search).get("sachId");
    
    const payload = {
        banSaoSachId: copyId,
        sachId: Number(sachId),
        tinhTrangBanSaoSach: document.getElementById("copy-tinhtrang").value,
        trangThaiBanSaoSach: document.getElementById("copy-trangthai").value
    };
    
    try {
        const resp = await fetch(`${apiBase}/api/bansaosach/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const text = await resp.text();
        if (!resp.ok) {
            alert(text || "Cập nhật bản sao thất bại");
            return;
        }
        
        alert(text || "Cập nhật bản sao thành công");
        modal.style.display = "none";
        modal.innerHTML = "";
        loadBanSaoSach(sachId);
    } catch (err) {
        alert("Không thể cập nhật bản sao");
    }
}

async function handleDeleteCopy(copyId) {
    if (!confirm("Bạn có chắc muốn xóa bản sao này?")) return;
    
    const token = sessionStorage.getItem("token");
    const sachId = new URLSearchParams(window.location.search).get("sachId");
    
    try {
        const resp = await fetch(`${apiBase}/api/bansaosach/delete?banSaoSachId=${encodeURIComponent(copyId)}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        const text = await resp.text();
        if (!resp.ok) {
            alert(text || "Xóa bản sao thất bại");
            return;
        }
        
        alert(text || "Xóa bản sao thành công");
        loadBanSaoSach(sachId);
    } catch (err) {
        alert("Không thể xóa bản sao");
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
