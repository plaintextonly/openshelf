const books = [
  {
    title: "宵待草の誘い",
    author: "西澤保彦",
    categories: ["ミステリ", "短編"],
    keywords: ["余韻", "不思議", "静か"],
    checkedAt: "2025-09-21",
    comment: "日常のすぐ隣にある、少し不穏で不思議な世界。短編でサクッと読めるのに、余韻が残る。",
    color: "#102b47"
  },
  {
    title: "七回目の夏",
    author: "西澤保彦",
    categories: ["ミステリ", "日常"],
    keywords: ["夏", "記憶", "青春"],
    checkedAt: "2025-09-21",
    comment: "どこにでもある夏の、どこにもない物語。",
    color: "#7f9b8d"
  },
  {
    title: "解けない夜",
    author: "西澤保彦",
    categories: ["ミステリ", "連作短編"],
    keywords: ["夜", "謎", "会話"],
    checkedAt: "2025-09-21",
    comment: "謎がすべて解けなくても、きっとこの夜は嫌いにならない。",
    color: "#17223a"
  },
  {
    title: "硝子の庭で",
    author: "青井夏海",
    categories: ["ミステリ", "ロマンス"],
    keywords: ["庭", "家族", "秘密"],
    checkedAt: "2025-08-14",
    comment: "柔らかい会話の奥に、手触りのある秘密が沈んでいる一冊。",
    color: "#496a70"
  },
  {
    title: "夜明け前の喫茶店",
    author: "近藤史恵",
    categories: ["日常", "エッセイ"],
    keywords: ["喫茶店", "仕事", "朝"],
    checkedAt: "2025-08-03",
    comment: "忙しい日の終わりに読むと、少しだけ呼吸が整う。",
    color: "#6e5a4b"
  },
  {
    title: "星を綴る人",
    author: "小川一水",
    categories: ["SF", "短編"],
    keywords: ["宇宙", "手紙", "未来"],
    checkedAt: "2025-07-22",
    comment: "遠い未来の話なのに、手元の紙をめくるような近さがある。",
    color: "#203c65"
  },
  {
    title: "霧の国の郵便屋",
    author: "梨木香歩",
    categories: ["ファンタジー", "日常"],
    keywords: ["旅", "手紙", "霧"],
    checkedAt: "2025-06-30",
    comment: "静かな世界を歩いていく気持ちよさ。雨の日に読みたい。",
    color: "#8b9794"
  },
  {
    title: "古書店の午後",
    author: "北村薫",
    categories: ["ミステリ", "日常"],
    keywords: ["本屋", "古書", "午後"],
    checkedAt: "2025-06-18",
    comment: "大きな事件より、小さな違和感が好きな日にぴったり。",
    color: "#755c43"
  },
  {
    title: "眠れない森の記録",
    author: "恒川光太郎",
    categories: ["ホラー", "ファンタジー"],
    keywords: ["森", "怪異", "夜"],
    checkedAt: "2025-05-29",
    comment: "怖いのに美しい。ページの向こう側に、戻れない森がある。",
    color: "#26362f"
  },
  {
    title: "小さな余白の作り方",
    author: "群ようこ",
    categories: ["エッセイ"],
    keywords: ["暮らし", "余白", "家"],
    checkedAt: "2025-05-07",
    comment: "自分のペースを取り戻したいときの、軽くて頼もしい読書。",
    color: "#a28a6c"
  },
  {
    title: "月曜日の探偵",
    author: "坂木司",
    categories: ["ミステリ", "日常"],
    keywords: ["仕事", "探偵", "月曜日"],
    checkedAt: "2025-04-16",
    comment: "週明けの重さを、ちょっとだけ物語に預けられる。",
    color: "#315777"
  },
  {
    title: "海辺の翻訳者",
    author: "宮下奈都",
    categories: ["ロマンス", "日常"],
    keywords: ["海", "言葉", "手紙"],
    checkedAt: "2025-03-25",
    comment: "ことばを選ぶ人たちの、静かで明るい距離感が残る。",
    color: "#527c91"
  }
];

const categories = ["すべて", "ミステリ", "ロマンス", "SF", "ファンタジー", "ホラー", "エッセイ", "日常", "その他"];
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
  const query = encodeURIComponent(`${book.title} ${book.author} Kindle Unlimited`);
  return `https://www.amazon.co.jp/s?k=${query}`;
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
      <div class="cover" style="background-color: ${book.color};">
        <span class="cover-title">${book.title}</span>
      </div>
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
        <a class="amazon-link" href="${amazonUrl(book)}" target="_blank" rel="noopener">Amazonで見る</a>
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
