/**
 * Dữ liệu mẫu (Khi có API, bạn sẽ thay thế phần này bằng fetch)
 */
const mockLoanDetail = {
    loanId: "BS-8492",
    detailId: "MT-BS-8492",
    dueDate: "16/1/2026",
    returnDate: "0/0/0000",
    fine: "0.00đ",
    books: [
        {
            title: "The Great Gatsby",
            copyId: "TGG1-1",
            cover: "https://via.placeholder.com/80x120",
        },
        {
            title: "Nhà giả kim",
            copyId: "NGK1-1",
            cover: "https://via.placeholder.com/80x120",
        },
    ],
};

function formatDate(isoString) {
    if (!isoString) return "Chưa trả";
    return new Date(isoString).toLocaleDateString("vi-VN");
}

function formatMoney(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
}

function getPhieuMuonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("phieuMuonId");
}

/**
 * Hàm hiển thị thông tin phiếu mượn lên giao diện
 */
function displayLoanDetails(data) {
    // 1. Đổ dữ liệu vào các thẻ meta
    document.getElementById("api-loan-id").innerText = data.loanId;
    document.getElementById("api-detail-id").innerText = data.detailId;
    document.getElementById("api-due-date").innerText = data.dueDate;
    document.getElementById("api-return-date").innerText = data.returnDate;
    document.getElementById("api-fine").innerText = data.fine;

    // 2. Render danh sách sách
    const listContainer = document.getElementById("loan-books-list");

    // Xóa dữ liệu mẫu cũ trong HTML trước khi render mới
    listContainer.innerHTML = "";

    data.books.forEach((book) => {
        const bookHTML = `
            <div class="loan-book-item">
                <img src="${book.cover}" alt="${book.title}">
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-copy-id">Mã bản sao sách: ${book.copyId}</p>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML("beforeend", bookHTML);
    });
}

/**
 * Khởi tạo khi trang web tải xong
 */
document.addEventListener("DOMContentLoaded", () => {
    // === CHECK LOGIN NGAY KHI LOAD ===
    const username = sessionStorage.getItem('username');
    console.log('Logged in user:', username);
    console.log('User role:', sessionStorage.getItem('role'));
    console.log('Auth token:', sessionStorage.getItem('token'));
    const loginLink = document.querySelector('.login-link');
    const userMenu = document.querySelector('.user-menu');
    const libraryActions = document.querySelector('.library-actions');
    const usernameText = document.querySelector('.username-text');
    const btnUser = document.querySelector('.btn-user');
    const logoutBtn = document.querySelector('.btn-logout');

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

    loadChiTietMuonTra();

    // Xử lý nút đóng (X) quay lại trang trước
    const btnClose = document.querySelector(".btn-close");
    if (btnClose) {
        btnClose.addEventListener("click", (e) => {
            e.preventDefault();
            window.history.back();
        });
    }
});

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


function mapAndDisplayFromAPI(phieuMuonId, list) {
    if (!list.length) return;

    // Hạn trả (giống nhau)
    const hanTra = list[0].hanTra;

    // Meta chung
    document.getElementById("api-loan-id").innerText = `${phieuMuonId}`;
    document.getElementById("api-detail-id").innerText = `${phieuMuonId}`;
    document.getElementById("api-due-date").innerText = formatDate(hanTra);

    // Danh sách sách
    const listContainer = document.getElementById("loan-books-list");
    listContainer.innerHTML = "";

    list.forEach(item => {
        const ngayTraText = item.ngayTra
            ? formatDate(item.ngayTra)
            : "Chưa trả";

        const tienPhatText = item.tienPhat > 0
            ? formatMoney(item.tienPhat)
            : "0đ";

        const html = `
            <div class="loan-book-item">
                <img src="${item.anhBia}" alt="${item.tenSach}">
                <div class="book-info">
                    <h3 class="book-title">${item.tenSach}</h3>

                    <p class="book-copy-id">
                        Mã bản sao sách: ${item.banSaoSachId}
                    </p>

                    <div class="book-extra-info">
                        <span>Ngày trả: ${ngayTraText}</span>
                        <span>Tình trạng: ${mapTinhTrang(item.tinhTrangKhiTra)}</span>
                        <span class="fine">Tiền phạt: ${tienPhatText}</span>
                    </div>
                </div>
            </div>
        `;

        listContainer.insertAdjacentHTML("beforeend", html);
    });
}


function mapTinhTrang(status) {
    switch (status) {
        case "DA_TRA": return "Đã trả";
        case "HU_HONG": return "Hư hỏng";
        case "MAT": return "Mất";
        case "DANG_MUON": return "Đang mượn";
        case "QUA_HAN": return "Quá hạn";
        default: return "Đang chờ";
    }
}
