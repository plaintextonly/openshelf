const BOOKS_CSV_URL = "books.csv?v=1";
const categories = ["すべて", "ミステリ", "SF", "ブロマンス", "BL", "友達以上BL未満", "関係性小説", "その他"];
const ITEMS_PER_PAGE = 5;
let books = [];

const state = {
  category: "すべて",
  query: "",
  sort: "read-desc",
  page: 1
};

const categoryList = document.querySelector("#categoryList");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const resultCount = document.querySelector("#resultCount");
const bookList = document.querySelector("#bookList");
const pagination = document.querySelector("#pagination");
const emptyState = document.querySelector("#emptyState");
const focusSearch = document.querySelector("#focusSearch");
const backToTop = document.querySelector("#backToTop");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.some((cell) => cell.trim()));
}

function splitList(value) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isKuVisible(value) {
  return ["true", "1", "on", "yes", "ku"].includes(value.trim().toLowerCase());
}

function csvRowsToBooks(rows) {
  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));

    return {
      title: record.title.trim(),
      author: record.author.trim(),
      categories: splitList(record.categories),
      keywords: splitList(record.keywords),
      checkedAt: record.checkedAt.trim(),
      comment: record.comment.trim(),
      color: record.color.trim() || "#102b47",
      amazonUrl: record.amazonUrl.trim(),
      imageUrl: record.imageUrl.trim(),
      ku: record.ku.trim()
    };
  }).filter((book) => book.title && isKuVisible(book.ku));
}

async function loadBooks() {
  resultCount.textContent = "読み込み中...";

  try {
    const response = await fetch(BOOKS_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`CSV load failed: ${response.status}`);

    books = csvRowsToBooks(parseCsv(await response.text()));
    renderBooks();
  } catch (error) {
    console.error(error);
    bookList.innerHTML = "";
    pagination.innerHTML = "";
    resultCount.textContent = "検索結果：0件";
    emptyState.hidden = false;
    emptyState.textContent = "本データを読み込めませんでした。ローカル確認時は簡易サーバー経由で開いてください。";
  }
}

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

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const current = page === state.page ? ' aria-current="page"' : "";
    return `<button type="button" data-page="${page}"${current}>${page}</button>`;
  }).join("");

  pagination.innerHTML = `
    <button type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>前へ</button>
    ${pageButtons}
    <button type="button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""}>次へ</button>
  `;
}

function renderBooks() {
  const filtered = sortBooks(books.filter(matchesBook));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  state.page = Math.min(state.page, totalPages);
  const startIndex = (state.page - 1) * ITEMS_PER_PAGE;
  const visibleBooks = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  resultCount.textContent = `検索結果：${filtered.length}件`;
  emptyState.hidden = filtered.length > 0;

  bookList.innerHTML = visibleBooks.map((book) => `
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

  renderPagination(filtered.length);
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.category = button.dataset.category;
  state.page = 1;
  createCategoryButtons();
  renderBooks();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = searchInput.value;
  state.page = 1;
  renderBooks();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  state.page = 1;
  renderBooks();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  state.page = 1;
  renderBooks();
});

pagination.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  state.page = Number(button.dataset.page);
  renderBooks();
  bookList.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

focusSearch.addEventListener("click", () => {
  searchInput.focus();
});

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("is-visible", window.scrollY > 500);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

createCategoryButtons();
loadBooks();
