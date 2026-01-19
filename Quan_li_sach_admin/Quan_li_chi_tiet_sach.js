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
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Cập nhật sách</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <input id="update-title" placeholder="Tên sách" value="${data.tenSach || ''}">
                    <input id="update-pages" type="number" min="1" placeholder="Số trang" value="${data.soTrang || ''}">
                    <input id="update-khoSach" placeholder="Khổ sách" value="${data.khoSach || ''}">
                    <input id="update-anhBia" placeholder="Ảnh bìa (URL)" value="${data.anhBia || ''}">
                    <input id="update-giaTien" type="number" min="0" step="0.01" placeholder="Giá tiền" value="${data.giaTien || ''}">
                                        <input id="update-namXuatBan" type="date" placeholder="Năm xuất bản" value="${data.namXuatBan ? new Date(data.namXuatBan).toISOString().slice(0,10) : ''}">
                                        <label>
                                            Nhà xuất bản
                                            <select id="update-nhaXuatBanId">
                                                <option value="">-- Đang tải --</option>
                                            </select>
                                        </label>
                                        <label>
                                            Lĩnh vực
                                            <select id="update-linhVucId">
                                                <option value="">-- Đang tải --</option>
                                            </select>
                                        </label>
                                        <label>
                                            Thể loại
                                            <select id="update-theLoaiId">
                                                <option value="">-- Đang tải --</option>
                                            </select>
                                        </label>
                    <input id="update-tacGiaIds" placeholder="ID Tác giả (cách nhau bằng dấu phẩy)" value="${data.tacGiaList ? data.tacGiaList.map(t=>t.tacGiaId).join(',') : ''}">
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel">Hủy</button>
                    <button class="btn-save">Lưu</button>
                </div>
            </div>
        `;
        modal.style.display = "flex";
        modal.querySelector('.modal-close').onclick = closeModal;
        modal.querySelector('.btn-cancel').onclick = closeModal;
        modal.querySelector('.btn-save').onclick = () => handleUpdateBook(data.sachId);
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
            openUpdateCopyModal(copyId, list.find(item => item.banSaoSachId == copyId));
        });
    });
    
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
    
    const token = sessionStorage.getItem("token");
    
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h3>Cập nhật bản sao</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <input id="copy-id" type="text" placeholder="Mã bản sao" value="${copyData.banSaoSachId}" disabled>
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
