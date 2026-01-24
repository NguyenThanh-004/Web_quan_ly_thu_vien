// Utility: format date to Vietnamese locale
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
}
import { API_CONFIG } from '../Assets/JS/Config/api.config.js';


async function loadChiTietMuonTraAdmin() {
    const phieuMuonId = getPhieuMuonIdFromUrl();
    const token = sessionStorage.getItem('token');
    const apiBase = API_CONFIG && (API_CONFIG.baseUrl || API_CONFIG.BASE_URL);

    if (!apiBase) {
        console.error('[Quan_li_chi_tiet_muon_tra.js] API_CONFIG.baseUrl is undefined!');
        alert('Lỗi cấu hình API: API_CONFIG.baseUrl không xác định.');
        return;
    }
    if (!phieuMuonId) {
        console.error('[Quan_li_chi_tiet_muon_tra.js] phieuMuonId is undefined! URL must include ?phieuMuonId=...');
        alert('Thiếu mã phiếu mượn trên URL (?phieuMuonId=...)');
        return;
    }
    try {
        const resp = await fetch(`${apiBase}/phieumuon/chitietmuontra?phieuMuonId=${phieuMuonId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            console.error('[Quan_li_chi_tiet_muon_tra.js] Error loading chi tiết mượn trả:', resp.status, await resp.text());
            alert('Không thể tải chi tiết mượn trả');
            return;
        }
        const data = await resp.json();
        displayLoanDetailsAdmin(phieuMuonId, data);
    } catch (err) {
        console.error('[Quan_li_chi_tiet_muon_tra.js] Exception in loadChiTietMuonTraAdmin:', err);
        alert('Không thể tải chi tiết mượn trả');
    }
}
function getPhieuMuonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('phieuMuonId');
}

function mapTinhTrang(status) {
    switch (status) {
        case 'DA_TRA': return 'Đã trả';
        case 'HU_HONG': return 'Hư hỏng';
        case 'MAT': return 'Mất';
        case 'DANG_MUON': return 'Đang mượn';
        case 'QUA_HAN': return 'Quá hạn';
        default: return 'Đang chờ';
    }
}

function displayLoanDetailsAdmin(phieuMuonId, list) {
    if (!Array.isArray(list) || !list.length) {
        document.getElementById('loan-books-list').innerHTML = '<p>Không có chi tiết mượn trả.</p>';
        return;
    }
    // Hạn trả (giống nhau cho tất cả chi tiết)
    const hanTra = list[0].hanTra;
    let tongTienPhat = 0;
    list.forEach(item => {
        if (item.tienPhat && !isNaN(item.tienPhat)) tongTienPhat += Number(item.tienPhat);
    });
    // Meta chung
    document.getElementById('api-loan-id').innerText = phieuMuonId;
    document.getElementById('api-due-date').innerText = formatDate(hanTra);
    document.getElementById('api-fine').innerText = tongTienPhat > 0 ? formatMoney(tongTienPhat) : '0đ';
    // Danh sách sách
    const listContainer = document.getElementById('loan-books-list');
    listContainer.innerHTML = '';
    list.forEach(item => {
        const ngayTraText = item.ngayTra ? formatDate(item.ngayTra) : 'Chưa trả';
        const tienPhatText = item.tienPhat && Number(item.tienPhat) > 0 ? Number(item.tienPhat).toLocaleString('vi-VN') + 'đ' : '0đ';
        const tinhTrang = mapTinhTrang(item.tinhTrangKhiTra);
        const html = `
            <div class="loan-book-item" style="position:relative;">
                <img src="${item.anhBia || ''}" alt="${item.tenSach || ''}">
                <div class="book-info">
                    <h3 class="book-title">${item.tenSach || ''}</h3>
                    <p class="book-copy-id">Mã bản sao sách: ${item.banSaoSachId || ''}</p>
                    <p class="book-borrow-detail-id">Mã chi tiết mượn trả: ${item.chiTietMuonTraId || ''}</p>
                    <div class="book-extra-info">
                        <span>Ngày trả: ${ngayTraText}</span>
                        <span>Tình trạng: ${tinhTrang}</span>
                        <span class="fine">Tiền phạt: ${tienPhatText}</span>
                    </div>
                    <!-- Update button moved below extra info -->
                    <div style="margin-top:12px;">
                        <button class="btn-update-loan-detail-item" data-chitietid="${item.chiTietMuonTraId}" style="padding:6px 14px;background:#1976d2;color:#fff;border:none;border-radius:4px;cursor:pointer;">Cập nhật tình trạng</button>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });

    // Add event listeners for each update button
    listContainer.querySelectorAll('.btn-update-loan-detail-item').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const chiTietId = btn.getAttribute('data-chitietid');
            // Remove any existing form
            const oldForm = listContainer.querySelector('.hover-update-form');
            if (oldForm) oldForm.remove();

            // Find the item data
            const itemData = list.find(i => String(i.chiTietMuonTraId) === String(chiTietId)) || {};
            // Create hover form
            const hoverForm = document.createElement('form');
            hoverForm.className = 'hover-update-form';
            hoverForm.style.position = 'absolute';
            hoverForm.style.top = (btn.offsetTop + btn.offsetHeight + 6) + 'px';
            hoverForm.style.left = btn.offsetLeft + 'px';
            hoverForm.style.minWidth = '220px';
            hoverForm.style.background = '#f8f8f8';
            hoverForm.style.padding = '16px 14px';
            hoverForm.style.borderRadius = '6px';
            hoverForm.style.boxShadow = '0 2px 12px rgba(0,0,0,0.13)';
            hoverForm.style.zIndex = 1000;
            hoverForm.innerHTML = `
                <label style="font-weight:bold;">Tình trạng mới:
                    <select name="tinhTrang">
                        <option value="DA_TRA" ${itemData.tinhTrangKhiTra === 'DA_TRA' ? 'selected' : ''}>Đã trả</option>
                        <option value="HU_HONG" ${itemData.tinhTrangKhiTra === 'HU_HONG' ? 'selected' : ''}>Hư hỏng</option>
                        <option value="MAT" ${itemData.tinhTrangKhiTra === 'MAT' ? 'selected' : ''}>Mất</option>
                        <option value="DANG_MUON" ${itemData.tinhTrangKhiTra === 'DANG_MUON' ? 'selected' : ''}>Đang mượn</option>
                        <option value="QUA_HAN" ${itemData.tinhTrangKhiTra === 'QUA_HAN' ? 'selected' : ''}>Quá hạn</option>
                    </select>
                </label>
                <div style="margin-top:12px;text-align:right">
                    <button type="submit" style="padding:6px 16px;background:#1976d2;color:#fff;border:none;border-radius:4px;cursor:pointer;">Lưu</button>
                    <button type="button" class="cancel-update-loan-detail" style="margin-left:8px;padding:6px 16px;background:#aaa;color:#fff;border:none;border-radius:4px;cursor:pointer;">Hủy</button>
                </div>
            `;
            btn.parentNode.appendChild(hoverForm);

            // Cancel button
            hoverForm.querySelector('.cancel-update-loan-detail').onclick = () => hoverForm.remove();

            // Submit handler
            hoverForm.onsubmit = async (ev) => {
                ev.preventDefault();
                const tinhTrang = hoverForm.tinhTrang.value;
                await updateChiTietStatus(chiTietId, tinhTrang);
                hoverForm.remove();
            };

            // Close on outside click
            setTimeout(() => {
                function closeOnClick(e) {
                    if (hoverForm && !hoverForm.contains(e.target) && e.target !== btn) {
                        hoverForm.remove();
                        document.removeEventListener('mousedown', closeOnClick);
                    }
                }
                document.addEventListener('mousedown', closeOnClick);
            }, 0);
        });
    });
}

async function loadChiTietMuonTra() {
    const phieuMuonId = getPhieuMuonIdFromUrl();
    const token = sessionStorage.getItem("token");

    if (!phieuMuonId) {
        alert("Thiếu mã phiếu mượn");
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:8080/api/phieumuon/chitietmuontra?phieuMuonId=${phieuMuonId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!res.ok) throw new Error("Không tải được chi tiết mượn trả");

        const data = await res.json();
        mapAndDisplayFromAPI(phieuMuonId, data);
    } catch (err) {
        console.error(err);
        alert("Lỗi khi tải chi tiết mượn trả");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Hiển thị tên người dùng nếu có
    const usernameEl = document.querySelector('.username-text');
    if (usernameEl) {
        usernameEl.textContent = sessionStorage.getItem('username') || 'Khách';
    }
    loadChiTietMuonTraAdmin();

    // Add update button to the left side of the loan-detail-card
    const card = document.querySelector('.loan-detail-card');
    if (card) {
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Cập nhật chi tiết';
        updateBtn.className = 'btn-update-loan-detail';
        updateBtn.style.marginRight = 'auto';
        updateBtn.style.marginBottom = '20px';
        updateBtn.style.padding = '8px 18px';
        updateBtn.style.fontWeight = 'bold';
        updateBtn.style.background = '#1976d2';
        updateBtn.style.color = '#fff';
        updateBtn.style.border = 'none';
        updateBtn.style.borderRadius = '5px';
        updateBtn.style.cursor = 'pointer';
        updateBtn.style.display = 'block';
        updateBtn.style.position = 'relative';
        card.insertBefore(updateBtn, card.firstChild);

        // Hover form logic
        let hoverForm = null;
        function closeHoverForm(e) {
            if (hoverForm && (!e || (e.target !== hoverForm && !hoverForm.contains(e.target) && e.target !== updateBtn))) {
                hoverForm.remove();
                hoverForm = null;
                document.removeEventListener('mousedown', closeHoverForm);
            }
        }

        updateBtn.addEventListener('click', async (event) => {
            const phieuMuonId = getPhieuMuonIdFromUrl();
            if (!phieuMuonId) {
                console.error('[UpdateButtonError] Thiếu mã phiếu mượn để cập nhật!');
                alert('Thiếu mã phiếu mượn để cập nhật!');
                return;
            }
            // Remove any existing form
            if (hoverForm) {
                hoverForm.remove();
                hoverForm = null;
                document.removeEventListener('mousedown', closeHoverForm);
                return;
            }

            // Get current data for the form (from the first book item)
            const list = window._lastLoanDetailList || [];
            const first = list[0] || {};
            // Create hover form
            hoverForm = document.createElement('form');
            hoverForm.id = 'update-loan-detail-form';
            hoverForm.style.position = 'absolute';
            hoverForm.style.top = (updateBtn.offsetTop + updateBtn.offsetHeight + 6) + 'px';
            hoverForm.style.left = updateBtn.offsetLeft + 'px';
            hoverForm.style.minWidth = '260px';
            hoverForm.style.background = '#f8f8f8';
            hoverForm.style.padding = '18px 16px';
            hoverForm.style.borderRadius = '6px';
            hoverForm.style.boxShadow = '0 2px 12px rgba(0,0,0,0.13)';
            hoverForm.style.zIndex = 1000;
            hoverForm.innerHTML = `
                <h4 style="margin-top:0">Cập nhật chi tiết mượn trả</h4>
                <label>Trạng thái phiếu mượn:
                    <select name="trangThai">
                        <option value="DANG_CHO" ${first.trangThaiPhieuMuon === 'DANG_CHO' ? 'selected' : ''}>Đang chờ</option>
                        <option value="DANG_MUON" ${first.trangThaiPhieuMuon === 'DANG_MUON' ? 'selected' : ''}>Đang mượn</option>
                        <option value="HUY" ${first.trangThaiPhieuMuon === 'HUY' ? 'selected' : ''}>Huỷ</option>
                        <option value="QUA_HAN" ${first.trangThaiPhieuMuon === 'QUA_HAN' ? 'selected' : ''}>Quá hạn</option>
                        <option value="HOAN_TAT" ${first.trangThaiPhieuMuon === 'HOAN_TAT' ? 'selected' : ''}>Hoàn tất</option>
                    </select>
                </label>
                <div style="margin-top:12px;text-align:right">
                    <button type="submit" style="padding:6px 16px;background:#1976d2;color:#fff;border:none;border-radius:4px;cursor:pointer;">Lưu</button>
                    <button type="button" id="cancel-update-loan-detail" style="margin-left:8px;padding:6px 16px;background:#aaa;color:#fff;border:none;border-radius:4px;cursor:pointer;">Hủy</button>
                </div>
            `;
            // Position the form relative to the button
            updateBtn.parentNode.appendChild(hoverForm);

            // Cancel button
            hoverForm.querySelector('#cancel-update-loan-detail').onclick = () => closeHoverForm();

            // Submit handler
            hoverForm.onsubmit = async (e) => {
                e.preventDefault();
                const trangThai = hoverForm.trangThai.value;
                await updateChiTietStatus(phieuMuonId, trangThai);
                closeHoverForm();
            };

            // Close on outside click
            setTimeout(() => document.addEventListener('mousedown', closeHoverForm), 0);
        });
    }
});

// Update function using the API for a single chiTietPhieuMuonId
async function updateChiTietStatus(chiTietPhieuMuonId, tinhTrang) {
    const token = sessionStorage.getItem('token');
    const apiBase = API_CONFIG && (API_CONFIG.baseUrl || API_CONFIG.BASE_URL);
    if (!token) {
        console.error('[UpdateButtonError] Không tìm thấy token khi cập nhật chi tiết!');
        alert('Bạn chưa đăng nhập');
        return;
    }
    try {
        const resp = await fetch(`${apiBase}/phieumuon/admin/update-chitiet-status?chiTietPhieuMuonId=${chiTietPhieuMuonId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tinhTrang })
        });
        if (resp.status === 403) {
            console.error('[UpdateButtonError] 403 Forbidden from update-chitiet-status for chiTietPhieuMuonId:', chiTietPhieuMuonId);
            alert('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.');
            return;
        }
        if (!resp.ok) {
            console.error('[UpdateButtonError] Error updating chi tiết:', resp.status, await resp.text());
            alert('Cập nhật chi tiết thất bại');
            return;
        }
        alert('Cập nhật chi tiết thành công');
        // Optionally reload details
        loadChiTietMuonTraAdmin();
    } catch (err) {
        console.error('[UpdateButtonError] Exception in updateChiTietStatus:', err);
        alert('Không thể cập nhật chi tiết');
    }
}
