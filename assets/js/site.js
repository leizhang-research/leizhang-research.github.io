(function () {
  const data = window.SITE_DATA;
  if (!data) {
    return;
  }

  const page = document.body.dataset.page || "bio";
  const navRoot = document.getElementById("site-nav");
  const profileRoot = document.getElementById("profile-pane");
  const pageRoot = document.getElementById("page-content");

  if (!navRoot || !profileRoot || !pageRoot) {
    return;
  }

  applyStoredTheme();
  renderNav(navRoot, page, data);
  renderProfile(profileRoot, data.profile);
  renderPage(pageRoot, page, data.sections);
  setupThemeToggle();
  setupSearch();

  function renderNav(root, activePage, siteData) {
    const links = siteData.nav
      .map(function (item) {
        const activeClass = item.page === activePage ? "active" : "";
        return '<li><a class="' + activeClass + '" href="' + escapeHtml(item.file) + '">' + escapeHtml(item.label) + "</a></li>";
      })
      .join("");

    root.innerHTML =
      '<a class="brand" href="index.html">' +
      escapeHtml(siteData.profile.name) +
      '</a>' +
      '<ul class="nav-links">' +
      links +
      "</ul>" +
      '<div class="nav-icons">' +
      '<button class="icon-btn icon-btn-action" type="button" id="search-btn" aria-label="Search">' +
      iconSearch() +
      "</button>" +
      '<button class="icon-btn icon-btn-action" type="button" id="theme-btn" aria-label="Toggle theme">' +
      "</button>" +
      "</div>";
  }

  function renderProfile(root, profile) {
    const socials = (profile.socials || [])
      .map(function (social) {
        return (
          '<a href="' +
          escapeHtml(social.href || "#") +
          '" aria-label="' +
          escapeHtml(social.label || "Social") +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(social.short || "") +
          "</a>"
        );
      })
      .join("");

    const cv = profile.cv || { label: "Download CV", href: "#", download: false };
    const downloadAttr = cv.download ? ' download=""' : "";
    const avatarPosition = profile.avatarPosition || "50% 20%";
    const rawZoom = Number(profile.avatarZoom);
    const avatarZoom = Number.isFinite(rawZoom) && rawZoom > 0 ? rawZoom : 1;
    const avatarFit = profile.avatarFit === "contain" ? "contain" : "cover";
    const avatarOffsetX = normalizeOffset(profile.avatarOffsetX);
    const avatarOffsetY = normalizeOffset(profile.avatarOffsetY);

    root.innerHTML =
      '<div class="avatar-wrap"><img src="' +
      escapeHtml(profile.avatar || "") +
      '" alt="' +
      escapeHtml(profile.name || "Profile") +
      ' profile photo" style="object-position:' +
      escapeHtml(avatarPosition) +
      ";object-fit:" +
      escapeHtml(avatarFit) +
      ";--avatar-offset-x:" +
      escapeHtml(avatarOffsetX) +
      ";--avatar-offset-y:" +
      escapeHtml(avatarOffsetY) +
      ";transform:translate(var(--avatar-offset-x), var(--avatar-offset-y)) scale(" +
      escapeHtml(String(avatarZoom)) +
      ');transform-origin:center center;clip-path:circle(50% at 50% 50%);"></div>' +
      '<h1 class="profile-name">' +
      escapeHtml(profile.name || "") +
      "</h1>" +
      '<p class="pronouns">' +
      escapeHtml(profile.pronouns || "") +
      "</p>" +
      '<p class="role">' +
      escapeHtml(profile.role || "") +
      "</p>" +
      '<p class="org">' +
      escapeHtml(profile.organization || "") +
      "</p>" +
      '<a class="cta" href="' +
      escapeHtml(cv.href || "#") +
      '"' +
      downloadAttr +
      ">" +
      iconFile() +
      escapeHtml(cv.label || "Download CV") +
      "</a>" +
      '<div class="socials">' +
      socials +
      "</div>";
  }

  function renderPage(root, currentPage, sections) {
    const section = sections[currentPage] || sections.bio;

    if (currentPage === "bio") {
      renderBio(root, section, currentPage);
      return;
    }

    if (currentPage === "papers") {
      renderPapers(root, section, currentPage);
      return;
    }

    if (currentPage === "talks" || currentPage === "news") {
      renderTimelinePage(root, section, currentPage);
      return;
    }

    renderStandardPage(root, section, currentPage);
  }

  function renderStandardPage(root, section, currentPage) {
    const sorted = sortByTimeline(section.items || []);
    const cards = sorted
      .map(function (item) {
        return renderItemCard(item, { showKind: false });
      })
      .join("");

    root.innerHTML =
      sectionHeader(section.title || "", currentPage) +
      '<p class="page-description">' +
      escapeHtml(section.description || "") +
      "</p>" +
      '<div class="list-grid">' +
      cards +
      "</div>";
  }

  function renderBio(root, section, currentPage) {
    const summaryParagraphs = (data.profile.summary || [])
      .map(function (paragraph) {
        return '<p class="summary-paragraph">' + escapeHtml(paragraph) + "</p>";
      })
      .join("");

    const educationCards = (section.education || [])
      .map(function (item) {
        return (
          '<article class="item-card">' +
          '<h3 class="item-title">' +
          escapeHtml(item.title || "") +
          "</h3>" +
          '<p class="item-subtitle">' +
          escapeHtml(item.subtitle || "") +
          "</p>" +
          "</article>"
        );
      })
      .join("");

    root.innerHTML =
      sectionHeader(section.title || "", currentPage) +
      summaryParagraphs +
      '<div class="subsection-title">' +
      '<span class="title-icon" aria-hidden="true">' +
      iconCap() +
      "</span>" +
      "<h3>Education</h3>" +
      "</div>" +
      '<div class="list-grid education-grid">' +
      educationCards +
      "</div>";
  }

  function renderPapers(root, section, currentPage) {
    const sorted = sortByTimeline(section.items || []);
    const cards = sorted
      .map(function (item) {
        return renderItemCard(item, { showKind: true });
      })
      .join("");

    root.innerHTML =
      sectionHeader(section.title || "", currentPage) +
      '<p class="page-description">' +
      escapeHtml(section.description || "") +
      "</p>" +
      '<div class="filter-chips" id="paper-filters">' +
      '<button class="filter-chip active" type="button" data-filter="all">All</button>' +
      '<button class="filter-chip" type="button" data-filter="published">Published</button>' +
      '<button class="filter-chip" type="button" data-filter="preprint">Preprint</button>' +
      '<button class="filter-chip" type="button" data-filter="patent">Patents</button>' +
      "</div>" +
      '<div class="list-grid" id="paper-list">' +
      cards +
      "</div>";

    setupPaperFilters(root);
  }

  function setupPaperFilters(root) {
    const filterRoot = root.querySelector("#paper-filters");
    const cards = Array.prototype.slice.call(root.querySelectorAll("#paper-list .item-card"));
    if (!filterRoot || !cards.length) {
      return;
    }

    filterRoot.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-filter]");
      if (!button) {
        return;
      }

      const filter = button.dataset.filter || "all";
      Array.prototype.forEach.call(filterRoot.querySelectorAll(".filter-chip"), function (chip) {
        chip.classList.toggle("active", chip === button);
      });

      cards.forEach(function (card) {
        const kind = card.dataset.kind || "";
        let visible = false;

        if (filter === "all") {
          visible = true;
        } else if (filter === "published") {
          visible = kind === "published" || kind === "peer-reviewed";
        } else {
          visible = kind === filter;
        }

        card.classList.toggle("is-hidden", !visible);
      });
    });
  }

  function renderTimelinePage(root, section, currentPage) {
    const sorted = sortByTimeline(section.items || []);
    const grouped = groupByYear(sorted);
    const years = Object.keys(grouped)
      .map(function (value) {
        return Number(value);
      })
      .sort(function (a, b) {
        return b - a;
      });

    const currentYear = new Date().getFullYear();
    let recentYears = years.filter(function (year) {
      return year >= currentYear - 2;
    });

    if (!recentYears.length) {
      recentYears = years.slice(0, 3);
    }

    const recentSet = new Set(recentYears);
    const olderYears = years.filter(function (year) {
      return !recentSet.has(year);
    });

    root.innerHTML =
      sectionHeader(section.title || "", currentPage) +
      '<p class="page-description">' +
      escapeHtml(section.description || "") +
      "</p>" +
      '<div class="timeline">' +
      renderTimelineYears(grouped, recentYears) +
      "</div>" +
      (olderYears.length
        ? '<div class="timeline-controls"><button type="button" class="older-toggle-btn" id="older-toggle-btn">Show older years</button></div>' +
          '<div class="timeline older-years is-collapsed" id="older-years">' +
          renderTimelineYears(grouped, olderYears) +
          "</div>"
        : "");

    setupTimelineToggle(root);
  }

  function setupTimelineToggle(root) {
    const btn = root.querySelector("#older-toggle-btn");
    const olderRoot = root.querySelector("#older-years");
    if (!btn || !olderRoot) {
      return;
    }

    btn.addEventListener("click", function () {
      const isCollapsed = olderRoot.classList.contains("is-collapsed");
      olderRoot.classList.toggle("is-collapsed", !isCollapsed);
      btn.textContent = isCollapsed ? "Hide older years" : "Show older years";
    });
  }

  function renderTimelineYears(grouped, years) {
    return years
      .map(function (year) {
        const items = grouped[year] || [];
        return (
          '<section class="timeline-year-group">' +
          '<h3 class="timeline-year">' +
          escapeHtml(String(year)) +
          "</h3>" +
          items.map(renderTimelineItem).join("") +
          "</section>"
        );
      })
      .join("");
  }

  function renderTimelineItem(item) {
    const bullets = (item.bullets || [])
      .map(function (bullet) {
        return "<li>" + escapeHtml(bullet) + "</li>";
      })
      .join("");

    const links = (item.links || [])
      .map(function (link) {
        const href = escapeHtml(link.href || "#");
        const external = /^https?:\/\//.test(link.href || "");
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return '<a class="card-link" href="' + href + '"' + attrs + ">" + escapeHtml(link.label || "Link") + "</a>";
      })
      .join("");

    return (
      '<article class="timeline-item">' +
      '<div class="timeline-dot" aria-hidden="true"></div>' +
      '<div class="timeline-card">' +
      '<h4 class="item-title">' +
      escapeHtml(item.title || "") +
      "</h4>" +
      (item.subtitle ? '<p class="item-subtitle">' + escapeHtml(item.subtitle) + "</p>" : "") +
      (item.meta ? '<p class="item-meta">' + escapeHtml(item.meta) + "</p>" : "") +
      (item.description ? '<p class="item-description">' + escapeHtml(item.description) + "</p>" : "") +
      (bullets ? '<ul class="item-bullets">' + bullets + "</ul>" : "") +
      (links ? '<div class="card-links">' + links + "</div>" : "") +
      "</div>" +
      "</article>"
    );
  }

  function renderItemCard(item, options) {
    const opts = options || {};

    const bullets = (item.bullets || [])
      .map(function (bullet) {
        return "<li>" + escapeHtml(bullet) + "</li>";
      })
      .join("");

    const links = (item.links || [])
      .map(function (link) {
        const href = escapeHtml(link.href || "#");
        const external = /^https?:\/\//.test(link.href || "");
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return '<a class="card-link" href="' + href + '"' + attrs + ">" + escapeHtml(link.label || "Link") + "</a>";
      })
      .join("");

    const kindTag = opts.showKind && item.kind ? '<p class="item-kind">' + escapeHtml(formatKind(item.kind)) + "</p>" : "";

    return (
      '<article class="item-card soft" data-kind="' +
      escapeHtml(item.kind || "") +
      '" data-year="' +
      escapeHtml(String(getItemYear(item) || "")) +
      '">' +
      kindTag +
      '<h3 class="item-title">' +
      escapeHtml(item.title || "") +
      "</h3>" +
      (item.subtitle ? '<p class="item-subtitle">' + escapeHtml(item.subtitle) + "</p>" : "") +
      (item.meta ? '<p class="item-meta">' + escapeHtml(item.meta) + "</p>" : "") +
      (item.description ? '<p class="item-description">' + escapeHtml(item.description) + "</p>" : "") +
      (bullets ? '<ul class="item-bullets">' + bullets + "</ul>" : "") +
      (links ? '<div class="card-links">' + links + "</div>" : "") +
      "</article>"
    );
  }

  function sectionHeader(title, pageKey) {
    return (
      '<div class="section-title">' +
      '<span class="title-icon" aria-hidden="true">' +
      iconForPage(pageKey) +
      "</span>" +
      "<h2>" +
      escapeHtml(title) +
      "</h2>" +
      "</div>"
    );
  }

  function iconForPage(pageKey) {
    if (pageKey === "bio") {
      return iconSummary();
    }
    if (pageKey === "papers") {
      return iconBook();
    }
    if (pageKey === "talks") {
      return iconMic();
    }
    if (pageKey === "news") {
      return iconNews();
    }
    if (pageKey === "experience") {
      return iconBriefcase();
    }
    if (pageKey === "projects") {
      return iconProjects();
    }
    if (pageKey === "teaching") {
      return iconCap();
    }
    return iconSummary();
  }

  function sortByTimeline(items) {
    return (items || []).slice().sort(function (a, b) {
      const yearA = getItemYear(a);
      const yearB = getItemYear(b);

      if (yearA !== yearB) {
        return yearB - yearA;
      }

      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }

  function groupByYear(items) {
    return (items || []).reduce(function (acc, item) {
      const year = getItemYear(item);
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    }, {});
  }

  function getItemYear(item) {
    if (typeof item.year === "number" && Number.isFinite(item.year)) {
      return item.year;
    }

    const candidates = [item.meta, item.subtitle, item.title];
    for (let i = 0; i < candidates.length; i += 1) {
      const value = String(candidates[i] || "");
      const match = value.match(/\b(19|20)\d{2}\b/);
      if (match) {
        return Number(match[0]);
      }
    }

    return 0;
  }

  function formatKind(kind) {
    if (kind === "preprint") {
      return "Preprint";
    }
    if (kind === "patent") {
      return "Patent";
    }
    if (kind === "published") {
      return "Published";
    }
    if (kind === "peer-reviewed") {
      return "Published";
    }
    return "";
  }

  function setupThemeToggle() {
    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn) {
      return;
    }

    syncThemeButton();

    themeBtn.addEventListener("click", function () {
      const isDark = document.body.classList.contains("theme-dark");
      setTheme(isDark ? "light" : "dark", true);
    });
  }

  function applyStoredTheme() {
    let storedTheme = "light";
    try {
      const saved = window.localStorage.getItem("lz-theme");
      if (saved === "light" || saved === "dark") {
        storedTheme = saved;
      }
    } catch (error) {
      storedTheme = "light";
    }

    setTheme(storedTheme, false);
  }

  function setTheme(theme, persist) {
    const useDark = theme === "dark";
    document.body.classList.toggle("theme-dark", useDark);

    if (persist) {
      try {
        window.localStorage.setItem("lz-theme", useDark ? "dark" : "light");
      } catch (error) {
      }
    }

    syncThemeButton();
  }

  function syncThemeButton() {
    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn) {
      return;
    }

    const isDark = document.body.classList.contains("theme-dark");
    themeBtn.innerHTML = isDark ? iconSun() : iconMoon();
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  function setupSearch() {
    const searchBtn = document.getElementById("search-btn");
    if (!searchBtn) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="Site search">' +
      '<div class="search-header">' +
      '<input id="search-input" class="search-input" type="search" placeholder="Search pages, papers, talks, news..." autocomplete="off">' +
      '<button id="search-close" class="search-close" type="button" aria-label="Close search">' +
      iconClose() +
      "</button>" +
      "</div>" +
      '<div id="search-results" class="search-results"></div>' +
      "</div>";

    document.body.appendChild(overlay);

    const searchInput = overlay.querySelector("#search-input");
    const searchResults = overlay.querySelector("#search-results");
    const searchClose = overlay.querySelector("#search-close");
    const searchIndex = buildSearchIndex(data);

    function openSearch() {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      searchInput.value = "";
      renderResults("");
      window.setTimeout(function () {
        searchInput.focus();
      }, 20);
    }

    function closeSearch() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }

    function renderResults(query) {
      const trimmed = query.trim().toLowerCase();
      const results = filterSearchResults(searchIndex, trimmed).slice(0, 12);

      if (!results.length) {
        searchResults.innerHTML = '<p class="search-empty">No results found.</p>';
        return;
      }

      searchResults.innerHTML = results
        .map(function (entry) {
          return (
            '<a class="search-result" href="' +
            escapeHtml(entry.href) +
            '">' +
            '<span class="search-result-title">' +
            escapeHtml(entry.title) +
            "</span>" +
            '<span class="search-result-subtitle">' +
            escapeHtml(entry.subtitle) +
            "</span>" +
            "</a>"
          );
        })
        .join("");
    }

    searchBtn.addEventListener("click", openSearch);
    searchClose.addEventListener("click", closeSearch);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeSearch();
      }
    });

    searchInput.addEventListener("input", function () {
      renderResults(searchInput.value);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeSearch();
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    });
  }

  function buildSearchIndex(siteData) {
    const entries = [];
    const pageMap = siteData.nav.reduce(function (acc, navItem) {
      acc[navItem.page] = navItem;
      return acc;
    }, {});

    (siteData.nav || []).forEach(function (navItem) {
      entries.push({
        title: navItem.label,
        subtitle: "Page",
        href: navItem.file,
        searchable: (navItem.label + " page").toLowerCase()
      });
    });

    Object.keys(siteData.sections || {}).forEach(function (pageKey) {
      const section = siteData.sections[pageKey] || {};
      const navItem = pageMap[pageKey] || { file: "index.html", label: pageKey };
      const href = navItem.file || "index.html";

      if (section.title) {
        entries.push({
          title: section.title,
          subtitle: navItem.label,
          href: href,
          searchable: (section.title + " " + (section.description || "") + " " + navItem.label).toLowerCase()
        });
      }

      (section.items || []).forEach(function (item) {
        entries.push({
          title: item.title || navItem.label,
          subtitle: navItem.label + (item.subtitle ? " - " + item.subtitle : ""),
          href: href,
          searchable: [item.title, item.subtitle, item.meta, item.description, item.kind, navItem.label]
            .join(" ")
            .toLowerCase()
        });
      });

      (section.education || []).forEach(function (item) {
        entries.push({
          title: item.title || "Education",
          subtitle: "Bio - Education",
          href: href,
          searchable: [item.title, item.subtitle, "education"].join(" ").toLowerCase()
        });
      });
    });

    return entries;
  }

  function filterSearchResults(index, query) {
    if (!query) {
      return index;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    return index.filter(function (entry) {
      return terms.every(function (term) {
        return entry.searchable.indexOf(term) !== -1;
      });
    });
  }

  function normalizeOffset(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value) + "px";
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    return "0px";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function iconSearch() {
    return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.7 16.7M11 18C14.866 18 18 14.866 18 11C18 7.134 14.866 4 11 4C7.134 4 4 7.134 4 11C4 14.866 7.134 18 11 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  function iconMoon() {
    return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3C10.73 4.62 10.87 6.35 11.6 7.88C12.33 9.41 13.6 10.63 15.15 11.29C16.7 11.95 18.44 12.01 20 11.46" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function iconSun() {
    return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  function iconSummary() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2.2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9H16M8 13H12M8 17H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function iconBook() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 4.5C5 3.67 5.67 3 6.5 3H18V19H6.5C5.67 19 5 19.67 5 20.5V4.5Z" stroke="currentColor" stroke-width="1.8"/><path d="M18 19H6.5C5.67 19 5 19.67 5 20.5C5 21.33 5.67 22 6.5 22H18" stroke="currentColor" stroke-width="1.8"/><path d="M9 7H15M9 11H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function iconMic() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M5 11C5 14.31 7.69 17 11 17H13C16.31 17 19 14.31 19 11M12 17V21M9 21H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function iconNews() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6.5C4 5.67 4.67 5 5.5 5H18.5C19.33 5 20 5.67 20 6.5V17.5C20 18.33 19.33 19 18.5 19H6.5C5.12 19 4 17.88 4 16.5V6.5Z" stroke="currentColor" stroke-width="1.8"/><path d="M7 9H17M7 12H17M7 15H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function iconBriefcase() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7M3 12H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function iconProjects() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7H20M7 4V10M17 4V10M5.5 20H18.5C19.33 20 20 19.33 20 18.5V7.5C20 6.67 19.33 6 18.5 6H5.5C4.67 6 4 6.67 4 7.5V18.5C4 19.33 4.67 20 5.5 20Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 14L10.5 16.5L16 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function iconCap() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4L3 9L12 14L21 9L12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 11.4V15.5C7 16.4 9.2 18 12 18C14.8 18 17 16.4 17 15.5V11.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function iconFile() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }

  function iconClose() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }
})();
