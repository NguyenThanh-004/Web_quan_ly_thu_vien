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

console.log('[Script Loaded] Quan_li_chi_tiet_muon_tra.js loaded');


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
        // Load reader information
        if (data && data.length > 0) {
            const chiTietId = data[0].chiTietMuonTraId;
            loadReaderInfo(chiTietId, token, apiBase);
        }
    } catch (err) {
        console.error('[Quan_li_chi_tiet_muon_tra.js] Exception in loadChiTietMuonTraAdmin:', err);
        alert('Không thể tải chi tiết mượn trả');
    }
}
function getPhieuMuonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('phieuMuonId');
}

async function loadReaderInfo(chiTietId, token, apiBase) {
    try {
        console.log(`[Reader Info] Loading reader info for chiTietId=${chiTietId}`);
        const resp = await fetch(`${apiBase}/phieumuon/admin/chitietphieumuon/doc-gia?chiTietId=${chiTietId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            console.error('[Quan_li_chi_tiet_muon_tra.js] Error loading reader info:', resp.status, await resp.text());
            return;
        }
        const readerData = await resp.json();
        console.log('[Reader Info] Received data:', readerData);
        displayReaderInfo(readerData);
    } catch (err) {
        console.error('[Quan_li_chi_tiet_muon_tra.js] Exception in loadReaderInfo:', err);
    }
}

function displayReaderInfo(reader) {
    if (!reader) {
        console.warn('[Reader Info] No reader data to display');
        return;
    }
    
    console.log('[Reader Info] Displaying reader info:', reader);
    
    const nameEl = document.getElementById('api-reader-name');
    const emailEl = document.getElementById('api-reader-email');
    const phoneEl = document.getElementById('api-reader-phone');
    const addressEl = document.getElementById('api-reader-address');
    const dobEl = document.getElementById('api-reader-dob');
    const depositEl = document.getElementById('api-reader-deposit');
    
    if (nameEl) nameEl.innerText = reader.tenDocGia || '';
    if (emailEl) emailEl.innerText = reader.email || '';
    if (phoneEl) phoneEl.innerText = reader.soDienThoai || '';
    if (addressEl) addressEl.innerText = reader.diaChi || '';
    if (dobEl) dobEl.innerText = formatDate(reader.ngaySinh);
    if (depositEl) depositEl.innerText = reader.tienKyQuy ? formatMoney(reader.tienKyQuy) : '0đ';
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
                                <option class="tinhtrang-option-wait" value="DANG_MUON" ${tinhTrang === 'DANG_MUON' ? 'selected' : ''}>Đang mượn</option>
                                <option class="tinhtrang-option-good" value="DA_TRA" ${tinhTrang === 'DA_TRA' ? 'selected' : ''}>Đã trả</option>
                                <option class="tinhtrang-option-bad" value="QUA_HAN" ${tinhTrang === 'QUA_HAN' ? 'selected' : ''}>Quá hạn</option>
                                <option class="tinhtrang-option-very-bad" value="HU_HONG" ${tinhTrang === 'HU_HONG' ? 'selected' : ''}>Hư hỏng</option>
                                <option class="tinhtrang-option-very-bad" value="MAT" ${tinhTrang === 'MAT' ? 'selected' : ''}>Mất</option>                               
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
        
        // ✅ SET MÀU NGAY KHI RENDER (GIỐNG bindActions)
        updateSelectColor(dropdown);

    // ✅ ĐỔI MÀU + GỌI API KHI CHANGE
        dropdown.addEventListener('change', async function () {
            updateSelectColor(dropdown); // đổi màu ngay

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
    console.log('[PAGE LOADED] DOMContentLoaded event fired');
    console.log('[PAGE LOADED] API_CONFIG:', API_CONFIG);
    
    // Check token info
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    console.log('[PAGE LOADED] Token present:', !!token);
    console.log('[PAGE LOADED] Username:', username);
    
    // Decode and log token info if present
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const decoded = JSON.parse(atob(parts[1]));
                console.log('[PAGE LOADED] Token decoded:', decoded);
            }
        } catch (e) {
            console.warn('[PAGE LOADED] Could not decode token:', e);
        }
    }
    
    // Hiển thị tên người dùng nếu có
    const usernameEl = document.querySelector('.username-text');
    if (usernameEl) {
        usernameEl.textContent = username || 'Khách';
    }
    
    console.log('[PAGE LOADED] About to call loadChiTietMuonTraAdmin()');
    loadChiTietMuonTraAdmin();

    // ...existing code...
});

// Update function using the API for a single chiTietPhieuMuonId
async function updateChiTietStatus(chiTietPhieuMuonId, tinhTrang) {
    const token = sessionStorage.getItem('token');
    const apiBase = API_CONFIG && (API_CONFIG.baseUrl || API_CONFIG.BASE_URL);
    
    console.log('[UPDATE] Starting update with:', { chiTietPhieuMuonId, tinhTrang, token: token ? 'present' : 'missing', apiBase });
    
    if (!token) {
        console.error('[UpdateButtonError] Không tìm thấy token khi cập nhật chi tiết!');
        alert('Bạn chưa đăng nhập');
        return;
    }
    
    if (!apiBase) {
        console.error('[UpdateButtonError] API base URL is not configured!');
        alert('Lỗi cấu hình API');
        return;
    }
    
    try {
        const url = `${apiBase}/phieumuon/admin/update-chitiet-status?chiTietPhieuMuonId=${chiTietPhieuMuonId}`;
        console.log(`[UPDATE] Request URL: ${url}`);
        console.log(`[UPDATE] Request body:`, { tinhTrang });
        
        const resp = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tinhTrang })
        });
        
        const responseText = await resp.text();
        console.log(`[UPDATE] Response status: ${resp.status}, body:`, responseText);
        
        if (resp.status === 403) {
            console.warn(`[UPDATE] 403 Forbidden for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}`);
            alert('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.');
            return;
        }
        
        if (!resp.ok) {
            console.error(`[UPDATE] Failed with status ${resp.status}: ${responseText}`);
            alert(`Cập nhật chi tiết thất bại: ${responseText || 'Lỗi không xác định'}`);
            return;
        }
        
        console.log(`[UPDATE] Success for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}`);
        // Reload the data without alert
        loadChiTietMuonTraAdmin();
    } catch (err) {
        console.error(`[UPDATE] Exception for chiTietPhieuMuonId=${chiTietPhieuMuonId}, tinhTrang=${tinhTrang}:`, err);
        alert(`Không thể cập nhật chi tiết: ${err.message}`);
    }
}
// ================= UPDATE SELECT COLOR ================= // Cập nhật màu sắc của select dựa trên giá trị
function updateSelectColor(select) {
    select.classList.remove('wait', 'good', 'bad', 'very-bad');

    switch (select.value) {
        case 'DANG_MUON':
            select.classList.add('wait');
            break;
        case 'DA_TRA':
            select.classList.add('good');
            break;
        case 'QUA_HAN':
            select.classList.add('bad');
            break;
        case 'HU_HONG':
            select.classList.add('very-bad');
            break;
        case 'MAT':
            select.classList.add('very-bad');
            break;
    }
}   