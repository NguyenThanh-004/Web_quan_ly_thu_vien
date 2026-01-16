// Hàm này bạn sẽ gọi sau khi fetch() từ API thành công
function renderBookData(data) {
    document.getElementById("api-cover").src = data.cover_url;
    document.getElementById("api-title").innerText = data.title;
    document.getElementById(
        "api-meta"
    ).innerText = `${data.author} • ${data.year} • ${data.category}`;
    document.getElementById(
        "api-stock"
    ).innerText = `Còn ${data.stock} bản sao`;
    document.getElementById("api-desc").innerText = data.description;
    document.getElementById("api-publisher").innerText = data.publisher;
    document.getElementById("api-year").innerText = data.year;
    document.getElementById("api-pages").innerText = data.pages;
    document.getElementById("api-id").innerText = data.book_code;
}

// Hàm render danh sách sách liên quan
function renderRelatedList(books) {
    const container = document.getElementById("related-api-list");
    container.innerHTML = books
        .map(
            (book) => `
        <div class="book-item-card">
            <img src="${book.cover}" alt="${book.title}">
            <h4>${book.title}</h4>
            <p>${book.author}</p>
        </div>
    `
        )
        .join("");
}
