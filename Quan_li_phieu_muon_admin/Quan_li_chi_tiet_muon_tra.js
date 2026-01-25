// Utility: format date to Vietnamese locale
// Utility: format money to Vietnamese currency
function formatMoney(amount) {
    if (isNaN(amount)) return '0đ';
    return Number(amount).toLocaleString('vi-VN') + 'đ';
}
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
        const tinhTrang = item.tinhTrangKhiTra || '';
        const html = `
            <div class="loan-book-item" style="position:relative;">
                <img src="${item.anhBia || ''}" alt="${item.tenSach || ''}">
                <div class="book-info">
                    <h3 class="book-title">${item.tenSach || ''}</h3>
                    <p class="book-copy-id">Mã bản sao sách: ${item.banSaoSachId || ''}</p>
                    <p class="book-borrow-detail-id">Mã chi tiết mượn trả: ${item.chiTietMuonTraId || ''}</p>
                    <div class="book-extra-info">
                        <span>Ngày trả: ${ngayTraText}</span>
                        <span>Tình trạng: 
                            <select class="dropdown-tinhtrang" data-chitietid="${item.chiTietMuonTraId}" style="margin-left:4px;">
                                <option value="DANG_MUON" ${tinhTrang === 'DANG_MUON' ? 'selected' : ''}>Đang mượn</option>
                                <option value="DA_TRA" ${tinhTrang === 'DA_TRA' ? 'selected' : ''}>Đã trả</option>
                                <option value="HU_HONG" ${tinhTrang === 'HU_HONG' ? 'selected' : ''}>Hư hỏng</option>
                                <option value="MAT" ${tinhTrang === 'MAT' ? 'selected' : ''}>Mất</option>
                                <option value="QUA_HAN" ${tinhTrang === 'QUA_HAN' ? 'selected' : ''}>Quá hạn</option>
                            </select>
                        </span>
                        <span class="fine">Tiền phạt: ${tienPhatText}</span>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });

    // Add event listeners for each dropdown
    listContainer.querySelectorAll('.dropdown-tinhtrang').forEach(dropdown => {
        dropdown.addEventListener('change', async function (e) {
            const chiTietId = dropdown.getAttribute('data-chitietid');
            const tinhTrang = dropdown.value;
            await updateChiTietStatus(chiTietId, tinhTrang);
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

    // ...existing code...
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
        console.log(`[UPDATE] Updating chiTietPhieuMuonId=${chiTietPhieuMuonId} to tinhTrang=${tinhTrang}`);
        const resp = await fetch(`${apiBase}/phieumuon/admin/update-chitiet-status?chiTietPhieuMuonId=${chiTietPhieuMuonId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tinhTrang })
        });
        if (resp.status === 403) {
            console.warn(`[UPDATE] 403 Forbidden for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}`);
            alert('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.');
            return;
        }
        if (!resp.ok) {
            console.error(`[UPDATE] Failed for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}`);
            alert('Cập nhật chi tiết thất bại');
            return;
        }
        console.log(`[UPDATE] Success for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}`);
        // No alert for success, just reload
        loadChiTietMuonTraAdmin();
    } catch (err) {
        console.error(`[UPDATE] Exception for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}:`, err);
        alert('Không thể cập nhật chi tiết');
    }
}
