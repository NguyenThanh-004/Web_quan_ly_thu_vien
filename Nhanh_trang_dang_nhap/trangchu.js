// Back to top button
const backTopBtn = document.getElementById('backTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backTopBtn.classList.add('show');
    } else {
        backTopBtn.classList.remove('show');
    }
});

backTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Search functionality
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        console.log('Tìm kiếm:', query);
        // Thêm logic tìm kiếm ở đây
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// View more button
const viewMoreBtn = document.querySelector('.view-more-btn');
viewMoreBtn.addEventListener('click', () => {
    console.log('Xem thêm sách');
    // Thêm logic load more ở đây
});
