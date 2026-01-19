// ================== GLOBAL ==================
let allBanSao = [];
let visibleCount = 4;
const STEP = 4;

let relatedPage = 0;
const RELATED_SIZE = 5;
let relatedTotalPages = 0;
let currentTheLoai = null;

// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {
    checkLoginUI();

    const params = new URLSearchParams(window.location.search);
    const sachId = params.get("sachId");

    if (!sachId) {
        console.error("Không tìm thấy sachId trong URL");
        return;
    }

    loadBookDetail(sachId);

    // Gắn sự kiện xem thêm (AN TOÀN)
    const viewMoreBtn = document.querySelector(".view-more");
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener("click", () => {
            visibleCount += STEP;
            renderBanSaoSach();
            toggleViewMoreButton();
        });
    }
});

// ================== LOGIN UI ==================
function checkLoginUI() {
    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");
    const giosach= sessionStorage.getItem("cart");
    console.log("CART CONTENT:", giosach);
    if (!username || !token) return;

    const loginLink = document.querySelector(".login-link");
    const userMenu = document.querySelector(".user-menu");
    const libraryActions = document.querySelector(".library-actions");
    const usernameText = document.querySelector(".username-text");
    const btnUser = document.querySelector(".btn-user");
    const logoutBtn = document.querySelector(".btn-logout");
    
    loginLink.style.display = "none";
    userMenu.style.display = "block";
    libraryActions.style.display = "block";
    usernameText.textContent = username;

    btnUser.addEventListener("click", () => {
        userMenu.classList.toggle("show");
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "/Dang_nhap/Dang_nhap.html";
    });

    document.addEventListener("click", (e) => {
        if (!userMenu.contains(e.target) && !btnUser.contains(e.target)) {
            userMenu.classList.remove("show");
        }
    });
    document.getElementById("btn-prev-related")?.addEventListener("click", () => {
        if (relatedPage > 0) {
            relatedPage--;
            loadRelatedBooks();
        }
    });

    document.getElementById("btn-next-related")?.addEventListener("click", () => {
        if (relatedPage < relatedTotalPages - 1) {
            relatedPage++;
            loadRelatedBooks();
        }
    });
}

// ================== BOOK DETAIL ==================
async function loadBookDetail(sachId) {
    try {
        const res = await fetch(
            `http://localhost:8080/api/sach/chitietsach?sachId=${sachId}`
        );

        if (!res.ok) throw new Error("Lỗi API chi tiết sách");
        
        const data = await res.json();
        console.log("Book Detail Data:", data);
        renderBookData(data);
        loadBanSaoSach(sachId);
    } catch (err) {
        console.error(err);
    }
}

function renderBookData(data) {
    document.getElementById("api-cover").src =
        data.anhBia || "https://via.placeholder.com/220x320";

    document.getElementById("api-title").innerText = data.tenSach;

    const authors = data.tacGiaList.map(t => t.tenTacGia).join(", ");
    const year = data.namXuatBan
        ? new Date(data.namXuatBan).getFullYear()
        : "";

    document.getElementById("api-meta").innerText = `${authors} • ${year}`;

    document.getElementById("api-publisher").innerText = data.nhaXuatBan;
    document.getElementById("api-year").innerText = year;
    document.getElementById("api-pages").innerText = data.soTrang;
    document.getElementById("api-id").innerText = data.sachId;
    document.getElementById("api-category").innerText = data.theLoai;
    document.getElementById("api-field").innerText = data.linhVuc;

    currentTheLoai = data.theLoai;
    relatedPage = 0;          //reset về trang đầu
    loadRelatedBooks();
}

// ================== RELATED BOOKS ==================
async function loadRelatedBooks() {
    if (!currentTheLoai) return;

    try {
        const res = await fetch(
            `http://localhost:8080/api/sach/theloai?tenTheLoai=${encodeURIComponent(currentTheLoai)}`
        );

        if (!res.ok) throw new Error("Lỗi API sách liên quan");

        const data = await res.json();

        const allBooks = data.content || [];

        relatedTotalPages = Math.ceil(allBooks.length / RELATED_SIZE);

        const start = relatedPage * RELATED_SIZE;
        const end = start + RELATED_SIZE;
        const pageItems = allBooks.slice(start, end);

        renderRelatedBooks(pageItems);
        updateRelatedNav();
    } catch (err) {
        console.error(err);
    }
}



function renderRelatedBooks(list) {
    const container = document.getElementById("related-grid");
    if (!container) return;

    container.innerHTML = "";

    list.forEach(book => {
        const authors = book.tacGiaList.map(t => t.tenTacGia).join(", ");
        container.innerHTML += `
            <div class="related-card"
                 onclick="goToBookDetail(${book.sachId})">
                <img src="${book.anhBia || "https://via.placeholder.com/150"}">
                <h4>${book.tenSach}</h4>
                <p>${authors}</p>
            </div>
        `;
    });
}

function updateRelatedNav() {
    const prevBtn = document.getElementById("btn-prev-related");
    const nextBtn = document.getElementById("btn-next-related");

    // Nếu chỉ có 1 trang hoặc không có sách
    if (relatedTotalPages <= 1) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
        return;
    }



    prevBtn.disabled = relatedPage === 0;
    nextBtn.disabled = relatedPage >= relatedTotalPages - 1;
}

function goToBookDetail(sachId) {
    window.location.href =
        `/Trang_chi_tiet_sach/Trang_chi_tiet_sach.html?sachId=${sachId}`;
}

// ================== COPY LIST ==================
async function loadBanSaoSach(sachId) {
    try {
        const res = await fetch(
            `http://localhost:8080/api/bansaosach/danhsach?sachId=${sachId}`
        );

        if (!res.ok) throw new Error("Lỗi API bản sao");

        const data = await res.json();
        allBanSao = data.content || [];
        visibleCount = 4;

        renderBanSaoSach();
        toggleViewMoreButton();
    } catch (err) {
        console.error(err);
    }
}

function renderBanSaoSach() {
    const container = document.querySelector(".copy-card-grid");
    if (!container) return;

    container.innerHTML = "";

    allBanSao.slice(0, visibleCount).forEach(item => {
        const trangThaiText =
            item.trangThaiBanSaoSach === "CON"
                ? "Còn"
                : item.trangThaiBanSaoSach === "DA_MUON"
                ? "Đã mượn"
                : "Hư hỏng";

        const statusClass =
            item.trangThaiBanSaoSach === "CON"
                ? "available"
                : "borrowed";

        const disabled =
            item.trangThaiBanSaoSach !== "CON" ? "disabled" : "";

        container.innerHTML += `
            <div class="copy-card">
                <div class="copy-info">
                    <div class="copy-field">
                        <span>MÃ BẢN SAO</span>
                        <p>${item.banSaoSachId}</p>
                    </div>
                    <div class="copy-field">
                        <span>TÌNH TRẠNG</span>
                        <p>${item.tinhTrangBanSaoSach === "MOI" ? "Mới" : "Cũ"}</p>
                    </div>
                    <div class="copy-field">
                        <span>TRẠNG THÁI</span>
                        <p class="status ${statusClass}">${trangThaiText}</p>
                    </div>
                </div>

                <button class="btn-copy-add"
                        ${disabled}
                        onclick="handleCopyAdd(${item.banSaoSachId})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    });
}


function toggleViewMoreButton() {
    const viewMoreBtn = document.querySelector(".view-more");
    if (!viewMoreBtn) return;

    viewMoreBtn.style.display =
        visibleCount >= allBanSao.length ? "none" : "block";
}

// ================== SCROLL TOP ==================
const btnScrollTop = document.getElementById("btnScrollTop");
if (btnScrollTop) {
    window.addEventListener("scroll", () => {
        btnScrollTop.style.display =
            window.scrollY > 300 ? "flex" : "none";
    });

    btnScrollTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function isLoggedIn() {
    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");
    return username && token;
}

function handleCopyAdd(banSaoSachId) {
    if (!isLoggedIn()) {
        alert("Bạn cần đăng nhập để thêm bản sao!");
        return;
    }

    let cartRaw = sessionStorage.getItem("cart");
    let cart;

    try {
        cart = cartRaw ? JSON.parse(cartRaw) : null;
    } catch {
        cart = null;
    }

    if (!cart || !Array.isArray(cart.selectedBanSaoSachIds)) {
        cart = { selectedBanSaoSachIds: [] };
    }

    if (cart.selectedBanSaoSachIds.includes(banSaoSachId)) {
        alert("Bản sao này đã có trong giỏ!");
        return;
    }

    cart.selectedBanSaoSachIds.push(banSaoSachId);
    sessionStorage.setItem("cart", JSON.stringify(cart));

    alert("Đã thêm bản sao vào giỏ sách!");
}


function renderRelatedBooks(list) {
    const container = document.getElementById("related-grid");
    if (!container) return;

    container.innerHTML = "";

    // 👇 THÊM
    container.classList.toggle("single", list.length === 1);

    list.forEach(book => {
        const authors = book.tacGiaList.map(t => t.tenTacGia).join(", ");
        container.innerHTML += `
            <div class="related-card"
                 onclick="goToBookDetail(${book.sachId})">
                <img src="${book.anhBia || "https://via.placeholder.com/150"}">
                <h4>${book.tenSach}</h4>
                <p>${authors}</p>
            </div>
        `;
    });
}