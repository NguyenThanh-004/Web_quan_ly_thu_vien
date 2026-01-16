// Dữ liệu mẫu (Thay thế bằng kết quả Call API của bạn)
const cartData = [
    {
        id: "TGG1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        status: "Available",
        genre: "Viễn tưởng",
        cover: "https://via.placeholder.com/100x150",
    },
    {
        id: "SABH14",
        title: "Sapiens: A Brief History",
        author: "Yuval Noah Harari",
        status: "1 copy left",
        genre: "Lịch sử",
        cover: "https://via.placeholder.com/100x150",
    },
];

function renderCartItems(items) {
    const container = document.getElementById("cart-items-list");
    if (items.length === 0) {
        container.innerHTML = "<p>Giỏ sách của bạn đang trống.</p>";
        return;
    }

    container.innerHTML = items
        .map(
            (item) => `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-cover">
                <img src="${item.cover}" alt="${item.title}">
            </div>
            <div class="item-info">
                <div class="item-top">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-controls">
                        <input type="checkbox" class="item-checkbox" checked>
                        <button class="btn-remove-item" onclick="removeItem('${
                            item.id
                        }')">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <p class="item-author">Của <span>${item.author}</span></p>
                <div class="item-tags">
                    <span class="tag-status ${
                        item.status === "Available" ? "available" : "low-stock"
                    }">${item.status}</span>
                    <span class="tag-genre">${item.genre}</span>
                </div>
                <p class="item-id">Mã sách: ${item.id}</p>
            </div>
        </div>
    `
        )
        .join("");
}

// Hàm giả định để xóa item
function removeItem(id) {
    console.log("Xóa sách mã:", id);
    // Viết hàm Call API xóa ở đây
}

document.addEventListener("DOMContentLoaded", () => {
    renderCartItems(cartData);
});
