/* ================= FIX LAYOUT SHIFT (QUAN TRỌNG) ================= */
// Luôn có scrollbar để tránh layout shift phụ
document.documentElement.style.overflowY = 'scroll';

/* ================= CONFIG ================= */
const apiBase = 'http://localhost:8080';
const token = sessionStorage.getItem('token');

/* ================= STATE ================= */
let currentPage = 0;
const pageSize = 10;
let fixedCardWidth = null;

/* ================= ELEMENT ================= */
const bookGrid = document.getElementById('bookGrid');
const btnLoadMore = document.getElementById('btnLoadMore');
const btnScrollTop = document.getElementById('btnScrollTop');

/* ================= CALCULATE CARD WIDTH ================= */
function calculateCardWidth() {
    if (!bookGrid) return;

    const columns = 5;   // ĐÚNG theo CSS: repeat(5, 1fr)
    const gap = 30;      // ĐÚNG theo CSS: gap: 30px

    const totalGap = gap * (columns - 1);
    const gridWidth = bookGrid.clientWidth - totalGap;

    fixedCardWidth = Math.floor(gridWidth / columns);
}

/* ================= LOAD BOOK ================= */
async function loadBooks() {
    try {
        const res = await fetch(
            `${apiBase}/api/sach/admin/all?page=${currentPage}&size=${pageSize}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        renderBooks(data.content);

        if (data.last) {
            btnLoadMore.style.display = 'none';
        }

        currentPage++;
    } catch (err) {
        console.error('Lỗi tải sách:', err);
        alert('Không thể tải danh sách sách');
    }
}

/* ================= RENDER ================= */
function renderBooks(books) {
    books.forEach(book => {
        const authors = book.tacGiaList
            ?.map(tg => tg.tenTacGia)
            .join(', ') || 'Chưa rõ';

        const card = document.createElement('div');
        card.className = 'book-card';

        // 🔒 KHÓA CỨNG WIDTH → KHÔNG BAO GIỜ THAY ĐỔI
        if (fixedCardWidth) {
            card.style.width = fixedCardWidth + 'px';
        }

        card.innerHTML = `
            <img src="${book.anhBia}" alt="${book.tenSach}">
            <h4>${book.tenSach}</h4>
            <p>${authors}</p>
        `;

        bookGrid.appendChild(card);
    });
}

/* ================= EVENT ================= */
btnLoadMore.addEventListener('click', loadBooks);

/* ================= SCROLL TO TOP ================= */
window.addEventListener('scroll', () => {
    if (!btnScrollTop) return;
    btnScrollTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('Bạn chưa đăng nhập');
        window.location.href = '../Dang_nhap/Dang_nhap.html';
        return;
    }

    calculateCardWidth(); // 👈 TÍNH WIDTH 1 LẦN DUY NHẤT
    loadBooks();
});
