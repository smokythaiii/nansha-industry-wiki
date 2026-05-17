const searches = document.querySelectorAll(".search-form");
const isSearchPage = document.body.classList.contains("search-page");
const isDetailPage = document.body.classList.contains("detail-page");
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";
const isFilePreview = window.location.protocol === "file:";
let activeWiki = null;

const fallbackIndustries = [
  {
    id: "low-altitude-economy",
    title: "低空经济",
    type: "产业 Wiki",
    summary: "沉淀低空制造、飞行服务、空域管理、场景应用与监管政策图谱。",
    url: "../wiki/low-altitude-economy/",
    keywords: ["低空经济", "飞行服务", "空域管理", "无人机", "eVTOL", "应用场景", "政策"],
    meta: ["场景 38 个", "关系 1.7k", "政策 74 条"],
  },
  {
    id: "artificial-intelligence",
    title: "人工智能",
    type: "产业 Wiki",
    summary: "覆盖大模型应用、算力基础设施、智能制造、城市治理与产业服务场景。",
    url: "#",
    keywords: ["人工智能", "AI", "大模型", "算力", "智能制造", "城市治理", "RAG", "LLM"],
    meta: ["企业 342 家", "实体 8.1k", "来源 920 篇"],
  },
];

function rootPrefix() {
  if (isDetailPage) return "../../";
  if (isSearchPage) return "../";
  return "./";
}

function searchUrl(query) {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : "";

  if (isFilePreview) {
    if (isDetailPage) return `../../search/index.html${suffix}`;
    return isSearchPage ? `./index.html${suffix}` : `./search/index.html${suffix}`;
  }

  return `/search${suffix}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(`${rootPrefix()}${path}`);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

function normalizeSearchText(item) {
  return [item.title, item.type, item.summary, ...(item.keywords || []), ...(item.meta || [])]
    .join(" ")
    .toLowerCase();
}

function renderSearchCards(items) {
  const container = document.querySelector(".search-results");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      const tag = item.url && item.url !== "#" ? "a" : "div";
      const href = tag === "a" ? ` href="${escapeHtml(item.url)}"` : "";
      const meta = (item.meta || []).map((entry) => `<span>${escapeHtml(entry)}</span>`).join("");
      const searchText = escapeHtml(normalizeSearchText(item));

      return `<${tag} class="result-card" ${href} data-search="${searchText}" hidden>
        <span class="result-type">${escapeHtml(item.type)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.summary)}</p>
        <div class="result-meta">${meta}</div>
      </${tag}>`;
    })
    .join("");
}

function filterResults(query) {
  const normalized = query.trim().toLowerCase();
  const resultCards = document.querySelectorAll(".result-card");
  let visibleCount = 0;

  resultCards.forEach((card) => {
    const haystack = `${card.textContent} ${card.dataset.search || ""}`.toLowerCase();
    const match = normalized && haystack.includes(normalized);
    card.hidden = !match;
    if (match) visibleCount += 1;
  });

  const empty = document.querySelector(".search-empty");
  if (!empty) return;

  empty.classList.toggle("is-compact", Boolean(normalized));
  empty.classList.toggle("has-results", visibleCount > 0);
  const title = empty.querySelector(".search-empty-title");
  const subtitle = empty.querySelector(".search-empty-subtitle");

  if (!normalized) {
    title.textContent = "输入你要查找的产业、企业、政策或项目。";
    subtitle.textContent = "结果将随着输入实时显示。";
  } else if (visibleCount > 0) {
    title.textContent = `找到 ${visibleCount} 个相关结果`;
    subtitle.textContent = "基于产业 Wiki、知识图谱节点与 LLM 能力说明匹配。";
  } else {
    title.textContent = "暂无匹配结果";
    subtitle.textContent = "可以尝试输入产业名称、企业方向、政策主题或技术关键词。";
  }
}

function renderShareButton() {
  return `<button aria-label="Share section">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
    </svg>
  </button>`;
}

function renderSection(section) {
  const title = `<div class="section-title-row"><h2>${escapeHtml(section.title)}</h2>${renderShareButton()}</div>`;

  if (section.type === "table") {
    const headers = section.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const rows = section.rows
      .map((row) => {
        const cells = row.cells
          .map((cell, index) => {
            if (Array.isArray(cell)) {
              return `<td>${cell.map((tag) => `<code>${escapeHtml(tag)}</code>`).join("")}</td>`;
            }
            const content = index === 0 ? `<strong>${escapeHtml(cell)}</strong>` : escapeHtml(cell);
            return `<td>${content}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
    const after = (section.after || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");

    return `<section id="${escapeHtml(section.id)}" class="wiki-section">
      ${title}
      <div class="wiki-table-wrap">
        <table class="wiki-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
      </div>
      ${after}
    </section>`;
  }

  if (section.type === "evidence") {
    const paragraphs = (section.content || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    const evidence = (section.evidence || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    return `<section id="${escapeHtml(section.id)}" class="wiki-section">
      ${title}
      ${paragraphs}
      <div class="evidence-list">${evidence}</div>
    </section>`;
  }

  if (section.type === "code") {
    const paragraphs = (section.content || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    return `<section id="${escapeHtml(section.id)}" class="wiki-section">
      ${title}
      <div class="code-block">
        <div class="code-toolbar"><span>${escapeHtml(section.codeLabel || "code")}</span><button>Copy</button></div>
        <pre><code>${escapeHtml(section.code || "")}</code></pre>
      </div>
      ${paragraphs}
    </section>`;
  }

  if (section.type === "sources") {
    const sources = (section.sources || [])
      .map(
        (source) => `<div class="source-card">
          <span>${escapeHtml(source.kind)}</span>
          <strong>${escapeHtml(source.title)}</strong>
          <p>${escapeHtml(source.status)}</p>
        </div>`,
      )
      .join("");
    return `<section id="${escapeHtml(section.id)}" class="wiki-section">${title}<div class="source-grid">${sources}</div></section>`;
  }

  const paragraphs = (section.content || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  return `<section id="${escapeHtml(section.id)}" class="wiki-section">${title}${paragraphs}</section>`;
}

function renderWikiPage(wiki) {
  const tocNav = document.querySelector(".toc nav");
  const wikiMeta = document.querySelector(".wiki-meta");
  const wikiContent = document.querySelector(".wiki-content");
  if (!tocNav || !wikiMeta || !wikiContent) return;

  tocNav.innerHTML = wiki.sections
    .map((section) => `<a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>`)
    .join("");
  wikiMeta.innerHTML = `<p>This wiki was automatically generated on ${escapeHtml(wiki.generatedAt)} based on 南沙产业知识图谱 <code>${escapeHtml(wiki.graphVersion)}</code>.</p>
    <p>${escapeHtml(wiki.warning)}</p>`;

  const nodes = wiki.graph.nodes
    .map((node) => `<div class="graph-node ${escapeHtml(node.className)}">${escapeHtml(node.label)}</div>`)
    .join("");
  const lines = wiki.graph.lines.map((line) => `<div class="graph-line ${escapeHtml(line)}"></div>`).join("");
  const sections = wiki.sections.map(renderSection).join("");

  wikiContent.innerHTML = `<article class="wiki-card">
    <header class="wiki-header">
      <div>
        <h1>${escapeHtml(wiki.title)}</h1>
        <span class="gemini-badge"><span>✦</span> ${escapeHtml(wiki.badge)}</span>
      </div>
      <a class="source-link" href="${escapeHtml(wiki.sourceUrl)}" aria-label="View source graph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
      </a>
    </header>
    <section class="diagram-card" aria-label="${escapeHtml(wiki.graph.label)}">
      ${nodes}
      ${lines}
      <button aria-label="Zoom diagram">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
          <path d="M11.5 8v7M8 11.5h7" />
        </svg>
      </button>
    </section>
    ${sections}
  </article>`;
}

function flattenSectionText(section) {
  const parts = [section.title, ...(section.content || []), ...(section.after || []), ...(section.evidence || [])];

  if (section.rows) {
    section.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        if (Array.isArray(cell)) {
          parts.push(...cell);
        } else {
          parts.push(cell);
        }
      });
    });
  }

  if (section.sources) {
    section.sources.forEach((source) => parts.push(source.title, source.kind, source.status));
  }

  if (section.code) {
    parts.push(section.code);
  }

  return parts.join(" ");
}

function pickSectionsForQuestion(question) {
  if (!activeWiki) return [];
  const normalized = question.toLowerCase();
  const tokens = normalized
    .split(/[\s,，。？?、；;：:！!]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const scored = activeWiki.sections.map((section) => {
    const text = flattenSectionText(section).toLowerCase();
    let score = 0;

    tokens.forEach((token) => {
      if (text.includes(token)) score += 2;
    });

    if (/政策|支持|扶持|条款|适配/.test(question) && section.id === "policy") score += 6;
    if (/产业链|节点|企业|项目|上下游|招商/.test(question) && ["chain", "companies"].includes(section.id)) score += 5;
    if (/来源|引用|依据|材料/.test(question) && section.id === "sources") score += 6;
    if (/llm|rag|生成|机制|模型|wiki/i.test(question) && section.id === "llm") score += 6;
    if (/概览|介绍|是什么|低空/.test(question) && section.id === "overview") score += 4;

    return { section, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.section);
}

function answerQuestion(question) {
  const sections = pickSectionsForQuestion(question);
  const selected = sections.length ? sections : activeWiki.sections.slice(0, 2);
  const snippets = selected
    .map((section) => {
      if (section.content?.length) return section.content[0];
      if (section.after?.length) return section.after[0];
      if (section.rows?.length) {
        return `${section.title}包含${section.rows.map((row) => row.cells[0]).join("、")}等条目。`;
      }
      if (section.sources?.length) {
        return `当前 Wiki 记录了${section.sources.map((source) => source.title).join("、")}等示例来源。`;
      }
      return section.title;
    })
    .slice(0, 2);

  return {
    text: `基于当前《${activeWiki.title}》Wiki，${snippets.join(" ")} 这是一条本地模拟回答，后续可以替换为真实 LLM/RAG 接口。`,
    sources: selected.map((section) => section.title),
  };
}

function appendChatMessage(role, html) {
  const thread = document.querySelector(".chat-thread");
  if (!thread) return;
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.innerHTML = html;
  thread.appendChild(message);
  thread.scrollTop = thread.scrollHeight;
}

function initChat() {
  if (!isDetailPage) return;

  const toggle = document.querySelector(".chat-toggle");
  const close = document.querySelector(".chat-close");
  const form = document.querySelector(".chat-form");
  const input = form?.querySelector("input");

  toggle?.addEventListener("click", () => {
    document.body.classList.add("chat-open");
    document.querySelector(".chat-drawer")?.setAttribute("aria-hidden", "false");
    input?.focus();
  });

  close?.addEventListener("click", () => {
    document.body.classList.remove("chat-open");
    document.querySelector(".chat-drawer")?.setAttribute("aria-hidden", "true");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    appendChatMessage("user", escapeHtml(question));
    input.value = "";

    const answer = answerQuestion(question);
    const sources = answer.sources.map((source) => `<span>${escapeHtml(source)}</span>`).join("");
    appendChatMessage(
      "assistant",
      `${escapeHtml(answer.text)}<div class="chat-answer-sources">${sources}</div>`,
    );
  });
}

function bindSearchForms() {
  searches.forEach((form) => {
    const input = form.querySelector("input");
    if (!input) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();

      if (query) {
        window.location.href = searchUrl(query);
      }
    });
  });
}

async function initSearchPage() {
  const queryInput = document.querySelector("#search-query");
  const items = await loadJson("data/industries.json", fallbackIndustries);
  renderSearchCards(items);

  if (!queryInput) return;
  queryInput.value = initialQuery;
  filterResults(initialQuery);
  queryInput.focus();

  queryInput.addEventListener("input", () => {
    const nextQuery = queryInput.value.trim();
    window.history.replaceState(null, "", searchUrl(nextQuery));
    filterResults(nextQuery);
  });
}

async function initDetailPage() {
  const wikiId = document.body.dataset.wikiId;
  if (!wikiId) return;
  const wiki = await loadJson(`data/wiki-${wikiId}.json`, null);
  if (wiki) {
    activeWiki = wiki;
    renderWikiPage(wiki);
  }
}

bindSearchForms();

if (isSearchPage) {
  initSearchPage();
}

if (isDetailPage) {
  initDetailPage();
  initChat();
}
