// Dữ liệu mẫu mượn từ API
const loans = [
    {
        loanId: "BS-8492",
        cardId: "LC-445582",
        date: "6/1/2026",
        status: "Chờ",
    },
    {
        loanId: "BS-8493",
        cardId: "LC-445582",
        date: "5/1/2026",
        status: "Chờ",
    },
];

function renderLoans(data) {
    const list = document.getElementById("loan-list");
    list.innerHTML = data
        .map(
            (item) => `
        <div class="loan-card">
            <div class="loan-card-header">
                <i class="far fa-file-alt"></i> PHIẾU MƯỢN
            </div>
            <div class="loan-card-body">
                <div class="info-group">
                    <div class="info-item">
                        <label>MÃ PHIẾU MƯỢN</label>
                        <p>${item.loanId}</p>
                    </div>
                    <div class="info-item">
                        <label>MÃ THẺ THƯ VIỆN</label>
                        <p>${item.cardId}</p>
                    </div>
                    <div class="info-item">
                        <label>NGÀY MƯỢN</label>
                        <p>${item.date}</p>
                    </div>
                </div>
                <div class="status-group">
                    <label>TRẠNG THÁI</label>
                    <p class="status-text">${item.status}</p>
                </div>
                <div class="action-group">
                    <button class="btn-detail-loan" onclick="window.location.href='/Trang_chi_tiet_muon_tra/Trang_chi_tiet_muon_tra.html'"><i class="fas fa-book"></i> Chi tiết mượn trả</button>
                </div>
            </div>
        </div>
    `
        )
        .join("");
}

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
   
    loadPhieuMuon("TAT_CA");

});

const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");

filterBtn.addEventListener("click", () => {
    filterMenu.style.display =
        filterMenu.style.display === "block" ? "none" : "block";
});

filterMenu.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
        const status = item.dataset.status;
        filterBtn.innerHTML = `${item.innerText} <i class="fas fa-chevron-down"></i>`;
        filterMenu.style.display = "none";

        filterPhieuMuon(status);
    });
});

// Click ra ngoài thì đóng menu
document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-box")) {
        filterMenu.style.display = "none";
    }
});


function mapTrangThai(status) {
    switch (status) {
        case "DANG_CHO": return "Đang chờ";
        case "DANG_MUON": return "Đang mượn";
        case "HUY": return "Huỷ";
        case "HOAN_THANH": return "Hoàn thành";
        default: return status;
    }
}

async function loadPhieuMuon(trangThai = "TAT_CA") {
    const token = sessionStorage.getItem("token");

    try {
        const res = await fetch(
            `http://localhost:8080/api/phieumuon/load?trangThai=${trangThai}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!res.ok) throw new Error("Lỗi load phiếu mượn");

        const data = await res.json();
        renderLoansFromAPI(data.content || []);
    } catch (err) {
        console.error(err);
        alert("Không tải được danh sách phiếu mượn");
    }
}


function renderLoansFromAPI(list) {
    const container = document.getElementById("loan-list");

    if (!list.length) {
        container.innerHTML = "<p>Không có phiếu mượn</p>";
        return;
    }

    container.innerHTML = list.map(item => `
        <div class="loan-card">
            <div class="loan-card-header">
                <i class="far fa-file-alt"></i> PHIẾU MƯỢN
            </div>
            <div class="loan-card-body">
                <div class="info-group">
                    <div class="info-item">
                        <label>MÃ PHIẾU MƯỢN</label>
                        <p>PM-${item.phieuMuonId}</p>
                    </div>
                    <div class="info-item">
                        <label>MÃ THẺ THƯ VIỆN</label>
                        <p>${item.theThuVien}</p>
                    </div>
                    <div class="info-item">
                        <label>NGÀY MƯỢN</label>
                        <p>${new Date(item.ngayMuon).toLocaleDateString("vi-VN")}</p>
                    </div>
                </div>

                <div class="status-group">
                    <label>TRẠNG THÁI</label>
                    <p class="status-text">${mapTrangThai(item.trangThaiPhieuMuon)}</p>
                </div>

                <div class="action-group">
                    <button class="btn-detail-loan"
                        onclick="goToChiTiet(${item.phieuMuonId})">
                        <i class="fas fa-book"></i> Chi tiết mượn trả
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function goToChiTiet(phieuMuonId) {
    window.location.href =
        `/Trang_chi_tiet_muon_tra/Trang_chi_tiet_muon_tra.html?phieuMuonId=${phieuMuonId}`;
}

function filterPhieuMuon(status) {
    let apiStatus = "TAT_CA";

    switch (status) {
        case "PENDING": apiStatus = "DANG_CHO"; break;
        case "BORROWING": apiStatus = "DANG_MUON"; break;
        case "CANCELLED": apiStatus = "HUY"; break;
        case "DONE": apiStatus = "HOAN_THANH"; break;
        default: apiStatus = "TAT_CA";
    }

    loadPhieuMuon(apiStatus);
}


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