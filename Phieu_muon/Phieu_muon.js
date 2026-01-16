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
                    <button class="btn-detail-loan"><i class="fas fa-book"></i> Chi tiết mượn trả</button>
                </div>
            </div>
        </div>
    `
        )
        .join("");
}

document.addEventListener("DOMContentLoaded", () => {
    renderLoans(loans);
});
