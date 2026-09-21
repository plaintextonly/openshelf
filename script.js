const books = [
  {
    title: "ゾンビですがなにか？",
    author: "涼木いちか",
    categories: ["ブロマンス", "日常SF", "短編"],
    keywords: ["余韻", "不思議", "静か"],
    checkedAt: "2026-09-21",
    comment: "日常のすぐ隣にある、少し不穏で不思議な世界。短編でサクッと読めるのに、余韻が残る。",
    color: "#102b47",
    amazonUrl: "https://link.amazon/B0bvsdrMr",
    imageUrl: "https://m.media-amazon.com/images/I/81gZ+973iaL.jpg"
  },
  {
    title: "友達だから、違うだろ",
    author: "涼木いちか",
    categories: ["ブロマンス", "友達以上BL未満","関係性小説"],
    keywords: ["夏", "記憶", "青春"],
    checkedAt: "2026-09-21",
    comment: "どこにでもある夏の、どこにもない物語。",
    color: "#7f9b8d",
    amazonUrl: "https://link.amazon/B03BJC6ET",
    imageUrl: "https://m.media-amazon.com/images/I/51SSoiMR+OL.jpg"
  },
  {
    title: "友達だから、違うだろ２",
    author: "涼木いちか",
    categories: ["ブロマンス", "友達以上BL未満","関係性小説"],
    keywords: ["海", "言葉", "手紙"],
    checkedAt: "2026-09-21",
    comment: "ことばを選ぶ人たちの、静かで明るい距離感が残る。",
    color: "#527c91",
    amazonUrl: "https://link.amazon/B0iTNGemC",
    imageUrl: "https://m.media-amazon.com/images/I/41Gf0RpEyVL.jpg"
  }
];

const categories = ["すべて", "ミステリ", "ブロマンス", "BL", "友達以上BL未満", "関係性小説", "その他"];
const state = {
  category: "すべて",
  query: "",
  sort: "read-desc"
};

const categoryList = document.querySelector("#categoryList");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const resultCount = document.querySelector("#resultCount");
const bookList = document.querySelector("#bookList");
const emptyState = document.querySelector("#emptyState");
const focusSearch = document.querySelector("#focusSearch");

function createCategoryButtons() {
  categoryList.innerHTML = categories.map((category) => {
    const pressed = category === state.category ? "true" : "false";
    return `<button type="button" data-category="${category}" aria-pressed="${pressed}">${category}</button>`;
  }).join("");
}

function normalize(value) {
  return value.toString().trim().toLowerCase();
}

function formatDate(value) {
  return value.replaceAll("-", "/");
}

function amazonUrl(book) {
  if (book.amazonUrl && book.amazonUrl.trim()) {
    return book.amazonUrl.trim();
  }

  const query = encodeURIComponent(`${book.title} ${book.author} Kindle Unlimited`);
  return `https://www.amazon.co.jp/s?k=${query}`;
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function bookCover(book) {
  if (book.imageUrl && book.imageUrl.trim()) {
    return `
      <div class="cover cover-photo">
        <img class="cover-image"
          src="${escapeAttribute(book.imageUrl.trim())}"
          alt="${escapeAttribute(`${book.title}の表紙`)}"
          loading="lazy">
      </div>
    `;
  }

  return `
    <div class="cover" style="background-color: ${escapeAttribute(book.color)};">
      <span class="cover-title">${book.title}</span>
    </div>
  `;
}

function matchesBook(book) {
  const inCategory = state.category === "すべて" || book.categories.includes(state.category);
  const haystack = normalize([
    book.title,
    book.author,
    book.comment,
    ...book.categories,
    ...book.keywords
  ].join(" "));
  return inCategory && haystack.includes(normalize(state.query));
}

function sortBooks(items) {
  return [...items].sort((a, b) => {
    if (state.sort === "read-asc") return a.checkedAt.localeCompare(b.checkedAt);
    if (state.sort === "title-asc") return a.title.localeCompare(b.title, "ja");
    if (state.sort === "author-asc") return a.author.localeCompare(b.author, "ja");
    return b.checkedAt.localeCompare(a.checkedAt);
  });
}

function renderBooks() {
  const filtered = sortBooks(books.filter(matchesBook));
  resultCount.textContent = `検索結果：${filtered.length}件`;
  emptyState.hidden = filtered.length > 0;

  bookList.innerHTML = filtered.map((book) => `
    <article class="book-card">
      ${bookCover(book)}
      <div class="book-body">
        <h2>${book.title}</h2>
        <p class="author">${book.author}</p>
        <div class="tag-list" aria-label="カテゴリ">
          ${book.categories.map((category) => `<span>${category}</span>`).join("")}
        </div>
        <p class="comment">${book.comment}</p>
      </div>
      <div class="book-meta">
        <span>KU確認日：${formatDate(book.checkedAt)}</span>
        <a class="amazon-link" href="${escapeAttribute(amazonUrl(book))}" target="_blank" rel="noopener">Amazonで見る</a>
      </div>
    </article>
  `).join("");
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.category = button.dataset.category;
  createCategoryButtons();
  renderBooks();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = searchInput.value;
  renderBooks();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderBooks();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderBooks();
});

focusSearch.addEventListener("click", () => {
  searchInput.focus();
});

createCategoryButtons();
renderBooks();
