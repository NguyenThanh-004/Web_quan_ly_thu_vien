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
    loadViolationWarningForLoanPage();
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
        case "QUA_HAN": return "Quá hạn";
        case "HUY": return "Huỷ";
        case "HOAN_TAT": return "Hoàn tất";
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
        <div class="loan-card" data-loan-id="${item.phieuMuonId}">
            <div class="loan-card-header">
                <i class="far fa-file-alt"></i> PHIẾU MƯỢN
            </div>
            <div class="loan-card-body">
                <div class="info-group">
                    <div class="info-item">
                        <label>MÃ PHIẾU MƯỢN</label>
                        <p>${item.phieuMuonId}</p>
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
    handleScrollFromCart(list);
}

async function handleScrollFromCart(list) {

    const params = new URLSearchParams(window.location.search);
    if (params.get("from") !== "cart") return;

    const token = sessionStorage.getItem("token");

    let firstViolationCard = null;

    for (const phieu of list) {

        if (
            phieu.trangThaiPhieuMuon === "HUY" ||
            phieu.trangThaiPhieuMuon === "HOAN_TAT" ||
            phieu.trangThaiPhieuMuon === "DANG_CHO"
        ) {
            continue;
        }

        try {
            const res = await fetch(
                `http://localhost:8080/api/phieumuon/chitietmuontra?phieuMuonId=${phieu.phieuMuonId}`,
                {
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );

            if (!res.ok) continue;

            const detailData = await res.json();
            const chiTietList = detailData.content || detailData || [];

            let hasOverdue = false;
            let hasSerious = false;

            chiTietList.forEach(item => {
                if (item.tinhTrangKhiTra === "QUA_HAN") {
                    hasOverdue = true;
                }
                if (
                    item.tinhTrangKhiTra === "MAT" ||
                    item.tinhTrangKhiTra === "HU_HONG"
                ) {
                    hasSerious = true;
                }
            });

            if (hasOverdue || hasSerious) {

                const card = document.querySelector(
                    `[data-loan-id="${phieu.phieuMuonId}"]`
                );

                if (!card) continue;

                if (!firstViolationCard) {
                    firstViolationCard = card;
                }

                // 🔴 Nếu có mất/hỏng → đỏ
                if (hasSerious) {
                    card.classList.add("highlight-serious");
                }
                // 🟡 Nếu chỉ quá hạn → vàng
                else if (hasOverdue) {
                    card.classList.add("highlight-warning");
                }
            }

        } catch (err) {
            console.error(err);
        }
    }

    // 👉 Scroll tới phiếu vi phạm đầu tiên
    if (firstViolationCard) {
        firstViolationCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

function goToChiTiet(phieuMuonId) {
    window.location.href =
        `/Trang_chi_tiet_muon_tra/Trang_chi_tiet_muon_tra.html?phieuMuonId=${phieuMuonId}`;
}

function filterPhieuMuon(status) {
    let apiStatus = "TAT_CA";

    switch (status) {
        case "DANG_CHO": apiStatus = "DANG_CHO"; break;
        case "DANG_MUON": apiStatus = "DANG_MUON"; break;
        case "HUY": apiStatus = "HUY"; break;
        case "HOAN_TAT": apiStatus = "HOAN_TAT"; break;
        case "QUA_HAN": apiStatus = "QUA_HAN"; break;
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

async function loadViolationWarningForLoanPage() {
    const token = sessionStorage.getItem("token");

    let soQuaHan = 0;
    let soMat = 0;
    let soHong = 0;

    try {
        const res = await fetch(
            "http://localhost:8080/api/phieumuon/load?trangThai=TAT_CA",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!res.ok) return;

        const data = await res.json();
        const phieuList = data.content || [];

        for (const phieu of phieuList) {

            if (
                phieu.trangThaiPhieuMuon === "HUY" ||
                phieu.trangThaiPhieuMuon === "HOAN_TAT" ||
                phieu.trangThaiPhieuMuon === "DANG_CHO"
            ) {
                continue;
            }

            if (
                phieu.trangThaiPhieuMuon === "DANG_MUON" ||
                phieu.trangThaiPhieuMuon === "QUA_HAN"
            ) {

                const detailRes = await fetch(
                    `http://localhost:8080/api/phieumuon/chitietmuontra?phieuMuonId=${phieu.phieuMuonId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                if (!detailRes.ok) continue;

                const detailData = await detailRes.json();
                const chiTietList = detailData.content || detailData || [];

                chiTietList.forEach(item => {
                    switch (item.tinhTrangKhiTra) {
                        case "QUA_HAN":
                            soQuaHan++;
                            break;
                        case "MAT":
                            soMat++;
                            break;
                        case "HU_HONG":
                            soHong++;
                            break;
                    }
                });
            }
        }

        showLoanWarning(soQuaHan, soMat, soHong);

    } catch (err) {
        console.error("Lỗi load cảnh báo:", err);
    }
}

function showLoanWarning(soQuaHan, soMat, soHong) {
    const warningBox = document.getElementById("loan-warning");
    if (!warningBox) return;

    // ❌ Không có vi phạm gì
    if (soQuaHan === 0 && soMat === 0 && soHong === 0) {
        warningBox.style.display = "none";
        return;
    }

    let message = "";
    const parts = [];

    // 🔹 Phần quá hạn
    if (soQuaHan > 0) {
        parts.push(`${soQuaHan} quyển sách quá hạn`);
    }

    // 🔹 Phần hỏng
    if (soHong > 0) {
        parts.push(`${soHong} quyển sách bị hỏng`);
    }

    // 🔹 Phần mất
    if (soMat > 0) {
        parts.push(`${soMat} quyển sách bị mất`);
    }

    // =========================
    // XỬ LÝ TỪNG NHÓM TRƯỜNG HỢP
    // =========================

    // 1️⃣ Chỉ quá hạn
    if (soQuaHan > 0 && soMat === 0 && soHong === 0) {
        message = `Bạn có ${soQuaHan} quyển sách quá hạn.`;
        warningBox.classList.remove("serious");
    }
    // 2️⃣ Chỉ hỏng hoặc mất
    else if (soQuaHan === 0 && (soMat > 0 || soHong > 0)) {
        message = `Bạn có ${parts.join(" và ")}. Vui lòng xử lý vi phạm.`;
        warningBox.classList.add("serious");
    }
    // 3️⃣ Có cả quá hạn và vi phạm
    else {
        message = `Bạn có ${parts.join(", ").replace(/,([^,]*)$/, " và$1")}. Vui lòng xử lý vi phạm.`;
        warningBox.classList.add("serious");
    }

    warningBox.textContent = "⚠ " + message;
    warningBox.style.display = "block";
}