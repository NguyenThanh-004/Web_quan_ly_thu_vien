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
    // Trong thực tế, bạn sẽ lấy ID từ URL (vd: ?id=BS-8492) để gọi API
    // Ở đây ta dùng dữ liệu mock để hiển thị ngay
    displayLoanDetails(mockLoanDetail);

    // Xử lý nút đóng (X) quay lại trang trước
    const btnClose = document.querySelector(".btn-close");
    if (btnClose) {
        btnClose.addEventListener("click", (e) => {
            e.preventDefault();
            window.history.back();
        });
    }
});
