(() => {
  const input = document.querySelector("[data-search-input]");
  const scope = document.querySelector("[data-search-scope]");
  const status = document.querySelector("[data-search-status]");
  const results = document.querySelector("[data-search-results]");
  if (!input || !status || !results) return;

  const validScopes = new Set(["post", "resource", "all"]);
  const scopeLabels = {
    all: "all content",
    post: "posts",
    resource: "resources"
  };
  const emptyLabels = {
    all: "pages or resources",
    post: "posts",
    resource: "resources"
  };

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const createText = (tag, text, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  };

  const renderEmpty = (message) => {
    results.innerHTML = "";
    results.append(createText("p", message, "muted"));
  };

  const getScope = () => {
    const value = scope?.value || "post";
    return validScopes.has(value) ? value : "post";
  };

  const itemMatchesScope = (item, selectedScope) =>
    selectedScope === "all" || (item.scope || item.type || "post") === selectedScope;

  const scoreItem = (item, terms) => {
    const title = normalize(item.title);
    const summary = normalize(item.summary);
    const content = normalize(item.content);
    const tags = normalize((item.tags || []).join(" "));
    let score = 0;

    for (const term of terms) {
      if (!term) continue;
      if (title.includes(term)) score += 8;
      if (tags.includes(term)) score += 5;
      if (summary.includes(term)) score += 3;
      if (content.includes(term)) score += 1;
      if (!title.includes(term) && !summary.includes(term) && !content.includes(term) && !tags.includes(term)) {
        return 0;
      }
    }

    return score;
  };

  const renderResults = (items, query, selectedScope = getScope()) => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      status.textContent = `Enter a search term to search ${scopeLabels[selectedScope]}.`;
      renderEmpty("Search results will appear here.");
      return;
    }

    const matches = items
      .filter((item) => itemMatchesScope(item, selectedScope))
      .map((item) => ({ item, score: scoreItem(item, terms) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    results.innerHTML = "";
    status.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"} in ${scopeLabels[selectedScope]} for "${query}".`;

    if (!matches.length) {
      renderEmpty(`No matching ${emptyLabels[selectedScope]} were found.`);
      return;
    }

    const list = document.createElement("ol");
    list.className = "result-list";
    matches.forEach(({ item }) => {
      const row = document.createElement("li");
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = item.title;
      const type = createText("span", item.type || "post", "result-type");
      const summary = createText("p", item.summary || "", "");
      row.append(type, link, summary);
      list.append(row);
    });
    results.append(list);
  };

  fetch(input.dataset.indexUrl, { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error("Search index failed to load.");
      return response.json();
    })
    .then((items) => {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q") || "";
      const initialScope = params.get("scope") || "post";
      input.value = initialQuery;
      if (scope) {
        scope.value = validScopes.has(initialScope) ? initialScope : "post";
      }
      renderResults(items, initialQuery);
      input.addEventListener("input", () => renderResults(items, input.value.trim()));
      scope?.addEventListener("change", () => renderResults(items, input.value.trim()));
    })
    .catch(() => {
      status.textContent = "Search is unavailable because the index could not be loaded.";
      renderEmpty("Try browsing the about or resources pages directly.");
    });
})();
