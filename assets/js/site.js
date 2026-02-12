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
  window.addEventListener("hashchange", function () {
    applyLocationFocus(pageRoot);
  });

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

    if (currentPage === "projects") {
      renderProjectsPage(root, section, currentPage);
      return;
    }

    if (currentPage === "embedding") {
      renderProjectsPage(root, sections.projects || {}, "projects", { defaultSubtabKey: "word-embedding-demo" });
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
        return renderItemCard(item, { showKind: false, anchorId: buildItemAnchorId(currentPage, item) });
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

    applyLocationFocus(root);
  }

  function renderProjectsPage(root, section, currentPage, options) {
    const settings = options || {};
    const subtabs = (section.subtabs || []).filter(function (item) {
      return item && item.key;
    });

    if (!subtabs.length) {
      renderStandardPage(root, section, currentPage);
      return;
    }

    root.innerHTML =
      sectionHeader(section.title || "Projects", currentPage) +
      '<p class="page-description">' +
      escapeHtml(section.description || "") +
      "</p>" +
      '<div class="filter-chips project-subtabs" id="project-subtabs">' +
      subtabs
        .map(function (tab) {
          return (
            '<button class="filter-chip" type="button" data-subtab="' +
            escapeHtml(tab.key) +
            '">' +
            escapeHtml(tab.label || tab.key) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<section class="project-subtab-panel" id="project-subtab-panel"></section>';

    const tabsRoot = root.querySelector("#project-subtabs");
    const panelRoot = root.querySelector("#project-subtab-panel");
    if (!tabsRoot || !panelRoot) {
      return;
    }

    const requestedSubtab = getQueryParam("subtab");
    let activeKey = requestedSubtab || settings.defaultSubtabKey || subtabs[0].key;
    if (!subtabs.some(function (tab) { return tab.key === activeKey; })) {
      activeKey = subtabs[0].key;
    }

    function setActiveSubtab(key) {
      const selected = subtabs.find(function (tab) {
        return tab.key === key;
      }) || subtabs[0];

      activeKey = selected.key;
      Array.prototype.forEach.call(tabsRoot.querySelectorAll("button[data-subtab]"), function (button) {
        button.classList.toggle("active", button.dataset.subtab === activeKey);
      });

      if (selected.type === "embedding-workbench") {
        renderEmbeddingDemo(panelRoot, selected, currentPage, { compact: true });
        applyLocationFocus(panelRoot);
        return;
      }

      if (selected.type === "pareto-front-workbench") {
        renderParetoFrontDemo(panelRoot, selected, currentPage, { compact: true });
        applyLocationFocus(panelRoot);
        return;
      }

      panelRoot.innerHTML =
        '<article class="item-card soft">' +
        '<h3 class="item-title">' +
        escapeHtml(selected.title || selected.label || "Subtab") +
        "</h3>" +
        '<p class="item-description">' +
        escapeHtml(selected.description || "This project subtab is not implemented yet.") +
        "</p>" +
        "</article>";

      applyLocationFocus(panelRoot);
    }

    tabsRoot.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-subtab]");
      if (!button) {
        return;
      }
      setActiveSubtab(button.dataset.subtab || activeKey);
    });

    setActiveSubtab(activeKey);
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
          '<article class="item-card" id="' +
          escapeHtml(buildItemAnchorId("bio-education", item)) +
          '">' +
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

    applyLocationFocus(root);
  }

  function renderPapers(root, section, currentPage) {
    const sorted = sortByTimeline(section.items || []);
    const cards = sorted
      .map(function (item) {
        return renderItemCard(item, { showKind: true, anchorId: buildItemAnchorId(currentPage, item) });
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
    applyLocationFocus(root);
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

  function renderEmbeddingDemo(root, section, currentPage, options) {
    const settings = options || {};
    const compact = Boolean(settings.compact);
    const title = section.title || "Element Embedding Workbench";
    const description = section.description || "";
    const introHtml =
      (compact ? "" : sectionHeader(title, currentPage)) +
      '<p class="page-description">' +
      escapeHtml(description) +
      "</p>" +
      '<article id="embedding-how-to" class="item-card soft embedding-card embedding-intro-card">' +
      '<h3 class="embedding-card-title">How To Use This Demo</h3>' +
      '<ol class="embedding-guide-list">' +
      "<li>Select elements in the periodic table.</li>" +
      "<li>Set relative amounts in the Composition panel (for example, 60 and 40 means a 60:40 ratio).</li>" +
      "<li>Use the map and bar chart to inspect where your weighted composite sits and which property-word embeddings it is most similar to.</li>" +
      "</ol>" +
      '<p class="embedding-hint">Entered amounts are relative units only; values are normalized internally before projection and similarity scoring.</p>' +
      "</article>";

    root.innerHTML =
      introHtml +
      '<p class="embedding-disclaimer"><strong>Data source:</strong> Prepared embedding bundle in <code>assets/files/web_embeddings/meta.json</code> + <code>assets/files/web_embeddings/vectors.f32</code> (CSV and inline-script fallback supported). Composite vectors are weighted linear sums. No model training is performed.</p>' +
      '<article class="item-card soft embedding-card"><p class="item-description">Loading embedding dataset...</p></article>';

    loadEmbeddingDataset()
      .then(function (dataset) {
        root.innerHTML =
          introHtml +
          '<p class="embedding-disclaimer"><strong>Demo notice:</strong> This is an embedding-space exploration tool. Distances and similarities reflect language-context embeddings, not direct physical measurements.</p>' +
          '<div class="embedding-layout embedding-workbench-layout">' +
          '<aside class="embedding-column">' +
          '<article id="embedding-periodic-selector" class="item-card soft embedding-card">' +
          '<h3 class="embedding-card-title">Periodic Table Selector</h3>' +
          '<div class="periodic-grid-wrap"><div id="periodic-grid" class="periodic-grid" aria-label="Periodic table element selector"></div></div>' +
          '<p class="embedding-hint">Click elements to include or exclude them from the composite.</p>' +
          "</article>" +
          '<article id="embedding-composition" class="item-card soft embedding-card composition-card">' +
          '<div class="embedding-heading-row">' +
          '<h3 class="embedding-card-title">Composition</h3>' +
          '<button type="button" class="older-toggle-btn" id="composition-clear-btn">Clear</button>' +
          "</div>" +
          '<div id="composition-list" class="composition-list"></div>' +
          '<p id="composition-total" class="embedding-hint"></p>' +
          "</article>" +
          "</aside>" +
          '<section class="embedding-main-column">' +
          '<article id="embedding-map" class="item-card soft embedding-card">' +
          '<div class="embedding-heading-row">' +
          '<h3 class="embedding-card-title">Element Embedding Map (2D PCA)</h3>' +
          '<span class="embedding-selected-tag" id="composite-tag">Composite</span>' +
          "</div>" +
          '<p class="embedding-hint">Each dot is one element embedding projected to 2D PCA. Dots that are closer have more similar embedding context. The blue marker is your weighted composite.</p>' +
          '<div class="embedding-legend">' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot" style="background:#7fc792;"></span>s-block</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot" style="background:#74a9db;"></span>p-block</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot" style="background:#df6fa9;"></span>d-block</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot" style="background:#e7ae72;"></span>f-block</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot" style="background:#5c6ad8;"></span>composite</span>' +
          "</div>" +
          '<div class="embedding-map-wrap">' +
          '<svg id="periodic-embedding-map" class="embedding-map" viewBox="0 0 720 410" aria-label="Element embedding projection"></svg>' +
          "</div>" +
          "</article>" +
          '<article id="embedding-property-similarity" class="item-card soft embedding-card property-similarity-card">' +
          '<h3 class="embedding-card-title">Property Similarity (0-100%)</h3>' +
          '<p class="embedding-hint">Bars show cosine similarity between your composite embedding and each property-word embedding token.</p>' +
          '<div id="property-bars" class="property-bars"></div>' +
          "</article>" +
          "</section>" +
          "</div>";

        setupEmbeddingWorkbench(root, dataset);
        applyLocationFocus(root);
      })
      .catch(function () {
        root.innerHTML =
          introHtml +
          '<article class="item-card soft embedding-card"><p class="item-description">Unable to load embedding assets (<code>assets/files/web_embeddings/meta.json</code>, <code>assets/files/web_embeddings/vectors.f32</code>, CSV fallback, or inline bundle). Check that the files are present in deployment.</p></article>';

        applyLocationFocus(root);
      });
  }

  function renderParetoFrontDemo(root, section, currentPage, options) {
    const settings = options || {};
    const compact = Boolean(settings.compact);
    const title = section.title || "Ternary Composite Pareto Workbench";
    const description = section.description || "";
    const introHtml =
      (compact ? "" : sectionHeader(title, currentPage)) +
      '<p class="page-description">' +
      escapeHtml(description) +
      "</p>" +
      '<article id="pareto-how-to" class="item-card soft embedding-card embedding-intro-card">' +
      '<h3 class="embedding-card-title">How To Use This Demo</h3>' +
      '<ol class="embedding-guide-list">' +
      "<li>Select exactly three elements from the periodic table.</li>" +
      "<li>The demo generates all integer compositions (step 1) where concentrations sum to 100 and each selected element is present.</li>" +
      "<li>It computes cosine similarity to conductivity and dielectric embeddings, then highlights Pareto fronts in both optimization directions.</li>" +
      "</ol>" +
      '<p class="embedding-hint">Optimization directions: (1) maximize conductivity similarity + minimize dielectric similarity, and (2) minimize conductivity similarity + maximize dielectric similarity.</p>' +
      "</article>";

    root.innerHTML =
      introHtml +
      '<p class="embedding-disclaimer"><strong>Data source:</strong> Prepared embedding bundle in <code>assets/files/web_embeddings/meta.json</code> + <code>assets/files/web_embeddings/vectors.f32</code> (CSV and inline-script fallback supported). Composite vectors are weighted linear sums.</p>' +
      '<article class="item-card soft embedding-card"><p class="item-description">Loading embedding dataset...</p></article>';

    loadEmbeddingDataset()
      .then(function (dataset) {
        root.innerHTML =
          introHtml +
          '<p class="embedding-disclaimer"><strong>Demo notice:</strong> Pareto selection is based on language-embedding similarity and should be treated as semantic guidance rather than direct measurement.</p>' +
          '<div class="embedding-layout pareto-workbench-layout">' +
          '<aside class="embedding-column">' +
          '<article id="pareto-periodic-selector" class="item-card soft embedding-card">' +
          '<div class="embedding-heading-row">' +
          '<h3 class="embedding-card-title">Periodic Table (3-Element Selection)</h3>' +
          '<div class="pareto-panel-actions">' +
          '<button type="button" class="pareto-analyze-btn" id="pareto-analyze-btn">Analyze</button>' +
          '<button type="button" class="older-toggle-btn" id="pareto-clear-btn">Clear</button>' +
          "</div>" +
          "</div>" +
          '<div class="periodic-grid-wrap"><div id="pareto-periodic-grid" class="periodic-grid" aria-label="Periodic table element selector for Pareto demo"></div></div>' +
          '<div id="pareto-selection-status" class="pareto-selection-status"></div>' +
          "</article>" +
          '<article id="pareto-created-composites" class="item-card soft embedding-card pareto-composites-card">' +
          '<h3 class="embedding-card-title">Created Composites</h3>' +
          '<p class="embedding-hint">Generated combinations have integer concentrations in step 1, sum to 100, and include all three selected elements.</p>' +
          '<div id="pareto-composite-list" class="pareto-composite-list"></div>' +
          "</article>" +
          "</aside>" +
          '<section class="embedding-main-column">' +
          '<article id="pareto-material-plot" class="item-card soft embedding-card">' +
          '<h3 class="embedding-card-title">Material Composition Plot (2D Ternary Plane)</h3>' +
          '<p class="embedding-hint">Ternary composition plane for the three selected elements. Each point is one generated composite.</p>' +
          '<div class="pareto-legend">' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-all"></span>All composites</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-a"></span>Cond max + Dielectric min front</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-b"></span>Cond min + Dielectric max front</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-both"></span>In both fronts</span>' +
          "</div>" +
          '<div class="embedding-map-wrap">' +
          '<svg id="pareto-material-map" class="embedding-map" viewBox="0 0 720 360" aria-label="2D ternary material composition distribution"></svg>' +
          "</div>" +
          "</article>" +
          '<article id="pareto-embedding-plot" class="item-card soft embedding-card">' +
          '<h3 class="embedding-card-title">Embedding Distribution (2D t-SNE)</h3>' +
          '<p class="embedding-hint">t-SNE projection of generated composite embeddings only. Colored points are Pareto-optimal composites.</p>' +
          '<div class="pareto-legend">' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-all"></span>All composites</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-a"></span>Cond max + Dielectric min front</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-b"></span>Cond min + Dielectric max front</span>' +
          '<span class="embedding-legend-item"><span class="embedding-legend-dot pareto-dot-both"></span>In both fronts</span>' +
          "</div>" +
          '<div class="embedding-map-wrap">' +
          '<svg id="pareto-embedding-map" class="embedding-map" viewBox="0 0 720 410" aria-label="Composite embedding distribution with Pareto fronts"></svg>' +
          "</div>" +
          "</article>" +
          '<article id="pareto-front-summary" class="item-card soft embedding-card">' +
          '<h3 class="embedding-card-title">Pareto Front Summary</h3>' +
          '<div id="pareto-front-summary-body" class="pareto-front-summary-body"></div>' +
          "</article>" +
          "</section>" +
          "</div>";

        setupParetoFrontWorkbench(root, dataset);
        applyLocationFocus(root);
      })
      .catch(function () {
        root.innerHTML =
          introHtml +
          '<article class="item-card soft embedding-card"><p class="item-description">Unable to load embedding assets (<code>assets/files/web_embeddings/meta.json</code>, <code>assets/files/web_embeddings/vectors.f32</code>, CSV fallback, or inline bundle). Check that the files are present in deployment.</p></article>';

        applyLocationFocus(root);
      });
  }

  function setupParetoFrontWorkbench(root, dataset) {
    const periodicGrid = root.querySelector("#pareto-periodic-grid");
    const selectionStatus = root.querySelector("#pareto-selection-status");
    const analyzeBtn = root.querySelector("#pareto-analyze-btn");
    const clearBtn = root.querySelector("#pareto-clear-btn");
    const compositeList = root.querySelector("#pareto-composite-list");
    const materialMap = root.querySelector("#pareto-material-map");
    const embeddingMap = root.querySelector("#pareto-embedding-map");
    const summaryRoot = root.querySelector("#pareto-front-summary-body");

    if (!periodicGrid || !selectionStatus || !analyzeBtn || !clearBtn || !compositeList || !materialMap || !embeddingMap || !summaryRoot) {
      return;
    }

    const preferred = ["Ni", "Fe", "Co"].filter(function (symbol) {
      return Boolean(dataset.elementsBySymbol[symbol]);
    });
    const fallback = dataset.elements.slice(0, 3).map(function (entry) {
      return entry.symbol;
    });

    const state = {
      selectedSymbols: preferred.length === 3 ? preferred : fallback,
      hint: "",
      renderToken: 0,
      analysis: null
    };

    periodicGrid.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-symbol]");
      if (!button) {
        return;
      }

      const symbol = button.dataset.symbol || "";
      if (!symbol || !dataset.elementsBySymbol[symbol]) {
        return;
      }

      const existingIndex = state.selectedSymbols.indexOf(symbol);
      if (existingIndex !== -1) {
        state.selectedSymbols.splice(existingIndex, 1);
        state.hint = "";
        updateSelectionState();
        return;
      }

      if (state.selectedSymbols.length >= 3) {
        state.hint = "Only three elements can be selected at the same time. Deselect one element first.";
        updateSelectionState();
        return;
      }

      state.selectedSymbols.push(symbol);
      state.hint = "";
      updateSelectionState();
    });

    analyzeBtn.addEventListener("click", function () {
      runAnalysis();
    });

    clearBtn.addEventListener("click", function () {
      state.selectedSymbols = [];
      state.hint = "";
      updateSelectionState();
    });

    function updateSelectionState() {
      const selectedMap = {};
      state.selectedSymbols.forEach(function (symbol) {
        selectedMap[symbol] = 1;
      });

      renderPeriodicGrid(periodicGrid, dataset, selectedMap);
      renderParetoSelectionStatus(selectionStatus, state);
      analyzeBtn.textContent = "Analyze";
      analyzeBtn.disabled = state.selectedSymbols.length !== 3;
      state.renderToken += 1;
      state.analysis = null;

      if (state.selectedSymbols.length !== 3) {
        renderParetoPendingState(
          compositeList,
          materialMap,
          embeddingMap,
          summaryRoot,
          "Select three elements, then click Analyze."
        );
        return;
      }

      renderParetoPendingState(
        compositeList,
        materialMap,
        embeddingMap,
        summaryRoot,
        "Click Analyze to generate composites and run Pareto analysis."
      );
    }

    function runAnalysis() {
      if (state.selectedSymbols.length !== 3) {
        state.hint = "Select exactly three elements before running analysis.";
        renderParetoSelectionStatus(selectionStatus, state);
        return;
      }

      state.hint = "";
      renderParetoSelectionStatus(selectionStatus, state);
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing...";

      const trio = {
        first: state.selectedSymbols[0],
        second: state.selectedSymbols[1],
        third: state.selectedSymbols[2]
      };

      const composites = buildTernaryComposites(dataset, trio);
      const hasTargets = Boolean(dataset.propertyVectors.conductivity && dataset.propertyVectors.dielectric);
      const frontMaxCondMinDie = hasTargets
        ? computeParetoFrontIndices2D(composites, "simConductivity", "max", "simDielectric", "min")
        : new Set();
      const frontMinCondMaxDie = hasTargets
        ? computeParetoFrontIndices2D(composites, "simConductivity", "min", "simDielectric", "max")
        : new Set();

      state.analysis = {
        trio: trio,
        composites: composites,
        frontMaxCondMinDie: frontMaxCondMinDie,
        frontMinCondMaxDie: frontMinCondMaxDie,
        hasTargets: hasTargets
      };

      renderParetoCompositeList(compositeList, composites, trio, frontMaxCondMinDie, frontMinCondMaxDie);
      renderParetoMaterialPlot3D(materialMap, composites, trio, frontMaxCondMinDie, frontMinCondMaxDie);
      renderParetoSummary(summaryRoot, trio, composites, frontMaxCondMinDie, frontMinCondMaxDie, hasTargets);
      renderParetoEmbeddingLoading(embeddingMap, "Computing t-SNE projection...");

      const token = state.renderToken + 1;
      state.renderToken = token;
      window.setTimeout(function () {
        try {
          const layout = computeCompositeTsneLayout(composites);
          if (state.renderToken !== token || !state.analysis) {
            return;
          }
          applyTsneLayoutToComposites(composites, layout);
          renderParetoEmbeddingPlot(embeddingMap, composites, trio, frontMaxCondMinDie, frontMinCondMaxDie);
        } catch (error) {
          if (state.renderToken === token) {
            renderParetoEmbeddingLoading(embeddingMap, "Unable to compute t-SNE projection.");
          }
        } finally {
          analyzeBtn.textContent = "Analyze";
          analyzeBtn.disabled = state.selectedSymbols.length !== 3;
        }
      }, 0);
    }

    updateSelectionState();
  }

  function renderParetoPendingState(compositeList, materialMap, embeddingMap, summaryRoot, message) {
    renderParetoCompositeList(compositeList, [], null, new Set(), new Set(), message);
    renderParetoMaterialPlot3D(materialMap, [], null, new Set(), new Set(), message);
    renderParetoEmbeddingLoading(embeddingMap, message);
    summaryRoot.innerHTML = '<p class="embedding-hint">' + escapeHtml(message || "Click Analyze to run Pareto analysis.") + "</p>";
  }

  function renderParetoSelectionStatus(root, state) {
    const selected = state.selectedSymbols || [];
    if (!selected.length) {
      root.innerHTML = '<p class="embedding-hint">No element selected. Choose three elements to generate composites and Pareto fronts.</p>';
      return;
    }

    const chips = selected
      .map(function (symbol) {
        return '<span class="pareto-selected-chip">' + escapeHtml(symbol) + "</span>";
      })
      .join("");

    root.innerHTML =
      '<div class="pareto-selected-row">' +
      '<span class="embedding-hint">Selected:</span>' +
      chips +
      "</div>" +
      (state.hint ? '<p class="embedding-hint pareto-warning">' + escapeHtml(state.hint) + "</p>" : "");
  }

  function buildTernaryComposites(dataset, trio) {
    const symA = trio.first;
    const symB = trio.second;
    const symC = trio.third;
    const vecA = dataset.elementsBySymbol[symA].vector;
    const vecB = dataset.elementsBySymbol[symB].vector;
    const vecC = dataset.elementsBySymbol[symC].vector;

    const gram = [
      [dotProduct(vecA, vecA), dotProduct(vecA, vecB), dotProduct(vecA, vecC)],
      [dotProduct(vecB, vecA), dotProduct(vecB, vecB), dotProduct(vecB, vecC)],
      [dotProduct(vecC, vecA), dotProduct(vecC, vecB), dotProduct(vecC, vecC)]
    ];

    const transform = buildMetricTransformFromGram(gram);
    const hasConductivity = Boolean(dataset.propertyVectors.conductivity);
    const hasDielectric = Boolean(dataset.propertyVectors.dielectric);
    const condVec = dataset.propertyVectors.conductivity || null;
    const dielVec = dataset.propertyVectors.dielectric || null;
    const normCond = condVec ? Math.max(1e-12, vectorNorm(condVec)) : 1;
    const normDie = dielVec ? Math.max(1e-12, vectorNorm(dielVec)) : 1;

    const dotCond = condVec
      ? [dotProduct(vecA, condVec), dotProduct(vecB, condVec), dotProduct(vecC, condVec)]
      : [0, 0, 0];
    const dotDie = dielVec
      ? [dotProduct(vecA, dielVec), dotProduct(vecB, dielVec), dotProduct(vecC, dielVec)]
      : [0, 0, 0];

    const composites = [];
    for (let aConc = 1; aConc <= 98; aConc += 1) {
      for (let bConc = 1; bConc <= 99 - aConc; bConc += 1) {
        const cConc = 100 - aConc - bConc;
        if (cConc <= 0) {
          continue;
        }

        const w1 = aConc / 100;
        const w2 = bConc / 100;
        const w3 = cConc / 100;
        const normSq =
          w1 * w1 * gram[0][0] +
          w2 * w2 * gram[1][1] +
          w3 * w3 * gram[2][2] +
          2 * w1 * w2 * gram[0][1] +
          2 * w1 * w3 * gram[0][2] +
          2 * w2 * w3 * gram[1][2];
        const normComp = Math.max(1e-12, Math.sqrt(Math.max(0, normSq)));

        const cond = hasConductivity
          ? (w1 * dotCond[0] + w2 * dotCond[1] + w3 * dotCond[2]) / (normComp * normCond)
          : null;
        const die = hasDielectric
          ? (w1 * dotDie[0] + w2 * dotDie[1] + w3 * dotDie[2]) / (normComp * normDie)
          : null;

        const feature = applyMetricTransform([w1, w2, w3], transform);
        composites.push({
          label: symA + String(aConc) + symB + String(bConc) + symC + String(cConc),
          firstConc: aConc,
          secondConc: bConc,
          thirdConc: cConc,
          firstWeight: w1,
          secondWeight: w2,
          thirdWeight: w3,
          tsneFeature: feature,
          simConductivity: cond,
          simDielectric: die,
          tsneX: 0,
          tsneY: 0
        });
      }
    }

    return composites;
  }

  function buildMetricTransformFromGram(gram) {
    const g = [
      [Number(gram[0][0]) || 0, Number(gram[0][1]) || 0, Number(gram[0][2]) || 0],
      [Number(gram[1][0]) || 0, Number(gram[1][1]) || 0, Number(gram[1][2]) || 0],
      [Number(gram[2][0]) || 0, Number(gram[2][1]) || 0, Number(gram[2][2]) || 0]
    ];

    const jitters = [0, 1e-9, 1e-7, 1e-5];
    for (let attempt = 0; attempt < jitters.length; attempt += 1) {
      const jitter = jitters[attempt];
      const l = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];

      let ok = true;
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j <= i; j += 1) {
          let sum = g[i][j];
          if (i === j) {
            sum += jitter;
          }
          for (let k = 0; k < j; k += 1) {
            sum -= l[i][k] * l[j][k];
          }
          if (i === j) {
            if (sum <= 0) {
              ok = false;
              break;
            }
            l[i][j] = Math.sqrt(sum);
          } else {
            if (!l[j][j]) {
              ok = false;
              break;
            }
            l[i][j] = sum / l[j][j];
          }
        }
        if (!ok) {
          break;
        }
      }

      if (ok) {
        return l;
      }
    }

    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function applyMetricTransform(weights, lower) {
    const w1 = Number(weights[0]) || 0;
    const w2 = Number(weights[1]) || 0;
    const w3 = Number(weights[2]) || 0;
    const x = w1 * lower[0][0] + w2 * lower[1][0] + w3 * lower[2][0];
    const y = w1 * lower[0][1] + w2 * lower[1][1] + w3 * lower[2][1];
    const z = w1 * lower[0][2] + w2 * lower[1][2] + w3 * lower[2][2];
    return [x, y, z];
  }

  function computeParetoFrontIndices2D(items, primaryKey, primaryGoal, secondaryKey, secondaryGoal) {
    const indices = items
      .map(function (_, index) {
        return index;
      })
      .filter(function (index) {
        const item = items[index];
        return Number.isFinite(item[primaryKey]) && Number.isFinite(item[secondaryKey]);
      });

    indices.sort(function (leftIndex, rightIndex) {
      const left = items[leftIndex];
      const right = items[rightIndex];
      const leftPrimary = Number(left[primaryKey]);
      const rightPrimary = Number(right[primaryKey]);
      if (leftPrimary !== rightPrimary) {
        return primaryGoal === "max" ? rightPrimary - leftPrimary : leftPrimary - rightPrimary;
      }

      const leftSecondary = Number(left[secondaryKey]);
      const rightSecondary = Number(right[secondaryKey]);
      if (leftSecondary !== rightSecondary) {
        return secondaryGoal === "max" ? rightSecondary - leftSecondary : leftSecondary - rightSecondary;
      }

      return leftIndex - rightIndex;
    });

    const front = new Set();
    let bestSecondary = secondaryGoal === "max" ? -Infinity : Infinity;
    const eps = 1e-12;

    indices.forEach(function (index) {
      const value = Number(items[index][secondaryKey]);
      let onFront = false;
      if (secondaryGoal === "max") {
        if (value >= bestSecondary - eps) {
          onFront = true;
          bestSecondary = Math.max(bestSecondary, value);
        }
      } else {
        if (value <= bestSecondary + eps) {
          onFront = true;
          bestSecondary = Math.min(bestSecondary, value);
        }
      }

      if (onFront) {
        front.add(index);
      }
    });

    return front;
  }

  function renderParetoCompositeList(root, composites, trio, frontA, frontB, emptyMessage) {
    if (!trio || !composites.length) {
      root.innerHTML = '<p class="embedding-hint">' + escapeHtml(emptyMessage || "Select three elements to build the composite list.") + "</p>";
      return;
    }

    const summary =
      '<p class="embedding-hint">Generated composites: <strong>' +
      String(composites.length) +
      "</strong></p>";

    const rows = composites
      .map(function (entry, index) {
        const inA = frontA.has(index);
        const inB = frontB.has(index);
        const frontClass = inA && inB ? " both" : inA ? " front-a" : inB ? " front-b" : "";

        let frontBadge = "";
        if (inA) {
          frontBadge += '<span class="pareto-front-chip front-a">Cond max Dielectric min</span>';
        }
        if (inB) {
          frontBadge += '<span class="pareto-front-chip front-b">Cond min Dielectric max</span>';
        }

        return (
          '<div class="pareto-composite-row' +
          frontClass +
          '">' +
          '<div class="pareto-composite-main">' +
          '<span class="pareto-composite-label">' +
          escapeHtml(entry.label) +
          "</span>" +
          '<span class="pareto-composite-ratio">' +
          escapeHtml(trio.first) +
          ":" +
          String(entry.firstConc) +
          " | " +
          escapeHtml(trio.second) +
          ":" +
          String(entry.secondConc) +
          " | " +
          escapeHtml(trio.third) +
          ":" +
          String(entry.thirdConc) +
          "</span>" +
          "</div>" +
          '<div class="pareto-composite-scores">' +
          '<span class="pareto-score">Cond ' +
          escapeHtml(formatSimilarityPercent(entry.simConductivity)) +
          "</span>" +
          '<span class="pareto-score">Dielectric ' +
          escapeHtml(formatSimilarityPercent(entry.simDielectric)) +
          "</span>" +
          "</div>" +
          '<div class="pareto-front-chip-row">' +
          (frontBadge || '<span class="pareto-front-chip neutral">Not Pareto-selected</span>') +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    root.innerHTML = summary + rows;
  }

  function renderParetoMaterialPlot3D(svg, composites, trio, frontA, frontB, emptyMessage) {
    if (!svg) {
      return;
    }

    const width = 720;
    const height = 360;
    const margin = { left: 54, right: 24, top: 22, bottom: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const side = Math.min(innerWidth * 0.86, innerHeight * 0.94 * (2 / Math.sqrt(3)));
    const triHeight = (Math.sqrt(3) / 2) * side;
    const centerX = margin.left + innerWidth / 2;
    const topY = margin.top + (innerHeight - triHeight) / 2;

    const vertexFirst = { x: centerX, y: topY };
    const vertexSecond = { x: centerX - side / 2, y: topY + triHeight };
    const vertexThird = { x: centerX + side / 2, y: topY + triHeight };

    function ternaryToXY(first, second, third) {
      const total = Math.max(1, Number(first) + Number(second) + Number(third));
      const w1 = Number(first) / total;
      const w2 = Number(second) / total;
      const w3 = Number(third) / total;
      return {
        x: w1 * vertexFirst.x + w2 * vertexSecond.x + w3 * vertexThird.x,
        y: w1 * vertexFirst.y + w2 * vertexSecond.y + w3 * vertexThird.y
      };
    }

    if (!trio || !composites.length) {
      svg.innerHTML =
        '<rect x="' +
        String(margin.left) +
        '" y="' +
        String(margin.top) +
        '" width="' +
        String(innerWidth) +
        '" height="' +
        String(innerHeight) +
        '" class="embedding-map-bg"></rect>' +
        '<text class="embedding-axis-label" x="' +
        String(width / 2) +
        '" y="' +
        String(height / 2 + 8) +
        '">' +
        escapeHtml(emptyMessage || "Select three elements to generate composition points") +
        "</text>";
      return;
    }

    const edgePath =
      "M" +
      String(vertexFirst.x) +
      "," +
      String(vertexFirst.y) +
      " L" +
      String(vertexSecond.x) +
      "," +
      String(vertexSecond.y) +
      " L" +
      String(vertexThird.x) +
      "," +
      String(vertexThird.y) +
      " Z";

    const guideLevels = [0.2, 0.4, 0.6, 0.8];
    let guides = "";
    guideLevels.forEach(function (level) {
      const p1 = ternaryToXY(level * 100, (1 - level) * 100, 0);
      const p2 = ternaryToXY(level * 100, 0, (1 - level) * 100);
      guides += '<line class="embedding-grid-line" x1="' + String(p1.x) + '" y1="' + String(p1.y) + '" x2="' + String(p2.x) + '" y2="' + String(p2.y) + '"></line>';

      const q1 = ternaryToXY((1 - level) * 100, level * 100, 0);
      const q2 = ternaryToXY(0, level * 100, (1 - level) * 100);
      guides += '<line class="embedding-grid-line" x1="' + String(q1.x) + '" y1="' + String(q1.y) + '" x2="' + String(q2.x) + '" y2="' + String(q2.y) + '"></line>';

      const r1 = ternaryToXY((1 - level) * 100, 0, level * 100);
      const r2 = ternaryToXY(0, (1 - level) * 100, level * 100);
      guides += '<line class="embedding-grid-line" x1="' + String(r1.x) + '" y1="' + String(r1.y) + '" x2="' + String(r2.x) + '" y2="' + String(r2.y) + '"></line>';
    });

    const points = composites
      .map(function (entry, index) {
        const pointClass = paretoPointClass(frontA, frontB, index);
        const pos = ternaryToXY(entry.firstConc, entry.secondConc, entry.thirdConc);
        return (
          '<circle class="pareto-point ' +
          pointClass +
          '" cx="' +
          String(pos.x) +
          '" cy="' +
          String(pos.y) +
          '" r="' +
          String(pointClass === "all" ? 3.2 : 5.1) +
          '">' +
          "<title>" +
          escapeHtml(entry.label) +
          " | " +
          escapeHtml(trio.first) +
          " " +
          String(entry.firstConc) +
          ", " +
          escapeHtml(trio.second) +
          " " +
          String(entry.secondConc) +
          ", " +
          escapeHtml(trio.third) +
          " " +
          String(entry.thirdConc) +
          "</title>" +
          "</circle>"
        );
      })
      .join("");

    svg.innerHTML =
      '<rect x="' +
      String(margin.left) +
      '" y="' +
      String(margin.top) +
      '" width="' +
      String(innerWidth) +
      '" height="' +
      String(innerHeight) +
      '" class="embedding-map-bg"></rect>' +
      guides +
      '<path d="' +
      edgePath +
      '" fill="none" stroke="rgba(112,145,191,0.34)" stroke-width="1.5"></path>' +
      points +
      '<text class="embedding-axis-label" x="' +
      String(vertexFirst.x) +
      '" y="' +
      String(vertexFirst.y - 10) +
      '">' +
      escapeHtml(trio.first + " (100%)") +
      "</text>" +
      '<text class="embedding-axis-label" x="' +
      String(vertexSecond.x - 10) +
      '" y="' +
      String(vertexSecond.y + 16) +
      '" text-anchor="end">' +
      escapeHtml(trio.second + " (100%)") +
      "</text>" +
      '<text class="embedding-axis-label" x="' +
      String(vertexThird.x + 10) +
      '" y="' +
      String(vertexThird.y + 16) +
      '" text-anchor="start">' +
      escapeHtml(trio.third + " (100%)") +
      "</text>";
  }

  function renderParetoEmbeddingLoading(svg, message) {
    svg.innerHTML =
      '<rect x="54" y="20" width="646" height="346" class="embedding-map-bg"></rect>' +
      '<text class="embedding-axis-label" x="360" y="210">' +
      escapeHtml(message || "Computing t-SNE projection...") +
      "</text>";
  }

  function renderParetoEmbeddingPlot(svg, composites, trio, frontA, frontB) {
    const width = 720;
    const height = 410;
    const margin = { left: 54, right: 20, top: 20, bottom: 44 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    function scaleX(value) {
      const normalized = (value + 1) / 2;
      return margin.left + normalized * plotWidth;
    }

    function scaleY(value) {
      const normalized = 1 - (value + 1) / 2;
      return margin.top + normalized * plotHeight;
    }

    if (!composites.length) {
      renderParetoEmbeddingLoading(svg, "No composites available.");
      return;
    }

    let grid = "";
    for (let i = 0; i <= 6; i += 1) {
      const x = margin.left + (plotWidth / 6) * i;
      const y = margin.top + (plotHeight / 6) * i;
      grid += '<line x1="' + String(x) + '" y1="' + String(margin.top) + '" x2="' + String(x) + '" y2="' + String(height - margin.bottom) + '" class="embedding-grid-line"/>';
      grid += '<line x1="' + String(margin.left) + '" y1="' + String(y) + '" x2="' + String(width - margin.right) + '" y2="' + String(y) + '" class="embedding-grid-line"/>';
    }

    const points = composites
      .map(function (entry, index) {
        const pointClass = paretoPointClass(frontA, frontB, index);
        const radius = pointClass === "all" ? 3.1 : 5.6;
        return (
          '<circle class="pareto-point ' +
          pointClass +
          '" cx="' +
          String(scaleX(entry.tsneX || 0)) +
          '" cy="' +
          String(scaleY(entry.tsneY || 0)) +
          '" r="' +
          String(radius) +
          '">' +
          "<title>" +
          escapeHtml(entry.label) +
          " | Cond " +
          escapeHtml(formatSimilarityPercent(entry.simConductivity)) +
          ", Dielectric " +
          escapeHtml(formatSimilarityPercent(entry.simDielectric)) +
          "</title>" +
          "</circle>"
        );
      })
      .join("");

    const selectedLabel = trio
      ? '<text class="embedding-axis-label" x="' +
        String(margin.left + 8) +
        '" y="' +
        String(margin.top + 14) +
        '" text-anchor="start">' +
        escapeHtml("Selected: " + trio.first + " + " + trio.second + " + " + trio.third) +
        "</text>"
      : "";

    svg.innerHTML =
      '<rect x="' +
      String(margin.left) +
      '" y="' +
      String(margin.top) +
      '" width="' +
      String(plotWidth) +
      '" height="' +
      String(plotHeight) +
      '" class="embedding-map-bg"></rect>' +
      grid +
      points +
      selectedLabel +
      '<text class="embedding-axis-label" x="' +
      String(margin.left + plotWidth / 2) +
      '" y="' +
      String(height - 12) +
      '">t-SNE Axis 1</text>' +
      '<text class="embedding-axis-label embedding-axis-label-y" x="16" y="' +
      String(margin.top + plotHeight / 2) +
      '">t-SNE Axis 2</text>';
  }

  function paretoPointClass(frontA, frontB, index) {
    const inA = frontA.has(index);
    const inB = frontB.has(index);
    if (inA && inB) {
      return "both";
    }
    if (inA) {
      return "front-a";
    }
    if (inB) {
      return "front-b";
    }
    return "all";
  }

  function computeCompositeTsneLayout(composites) {
    const features = composites.map(function (entry) {
      return entry.tsneFeature;
    });
    const count = features.length;
    if (!count) {
      return { x: [], y: [] };
    }
    if (count === 1) {
      return { x: [0], y: [0] };
    }

    const landmarkCount = Math.min(420, count);
    const landmarks = selectTsneLandmarks(count, landmarkCount);
    const landmarkFeatures = landmarks.map(function (index) {
      return features[index];
    });
    const landmarkCoords = runExactTsne2d(landmarkFeatures, {
      perplexity: Math.min(30, Math.max(8, Math.floor(landmarkCount / 8))),
      iterations: 340,
      learningRate: 140
    });

    const byLandmark = {};
    landmarks.forEach(function (sourceIndex, landmarkIndex) {
      byLandmark[sourceIndex] = landmarkIndex;
    });

    const x = new Array(count);
    const y = new Array(count);
    const neighborCount = Math.min(8, landmarks.length);

    for (let i = 0; i < count; i += 1) {
      if (Object.prototype.hasOwnProperty.call(byLandmark, i)) {
        const landmarkIndex = byLandmark[i];
        x[i] = landmarkCoords.x[landmarkIndex];
        y[i] = landmarkCoords.y[landmarkIndex];
        continue;
      }

      const nearest = [];
      for (let j = 0; j < landmarks.length; j += 1) {
        const distSq = squaredDistance3(features[i], landmarkFeatures[j]);
        if (nearest.length < neighborCount) {
          nearest.push({ index: j, dist: distSq });
          nearest.sort(function (left, right) {
            return left.dist - right.dist;
          });
          continue;
        }
        if (distSq < nearest[nearest.length - 1].dist) {
          nearest[nearest.length - 1] = { index: j, dist: distSq };
          nearest.sort(function (left, right) {
            return left.dist - right.dist;
          });
        }
      }

      let sumW = 0;
      let px = 0;
      let py = 0;
      nearest.forEach(function (entry) {
        const weight = 1 / Math.max(1e-12, entry.dist + 1e-9);
        sumW += weight;
        px += landmarkCoords.x[entry.index] * weight;
        py += landmarkCoords.y[entry.index] * weight;
      });

      x[i] = sumW ? px / sumW : 0;
      y[i] = sumW ? py / sumW : 0;
    }

    return { x: x, y: y };
  }

  function selectTsneLandmarks(total, take) {
    if (take >= total) {
      return Array.from({ length: total }, function (_, index) {
        return index;
      });
    }

    const selected = [];
    const used = {};
    const step = total / take;
    for (let i = 0; i < take; i += 1) {
      const raw = Math.floor(i * step + step * 0.5);
      const index = Math.max(0, Math.min(total - 1, raw));
      if (!used[index]) {
        used[index] = true;
        selected.push(index);
      }
    }
    for (let fill = 0; selected.length < take && fill < total; fill += 1) {
      if (!used[fill]) {
        used[fill] = true;
        selected.push(fill);
      }
    }
    selected.sort(function (a, b) {
      return a - b;
    });
    return selected;
  }

  function runExactTsne2d(features, options) {
    const opts = options || {};
    const n = features.length;
    const perplexity = Math.max(5, Number(opts.perplexity) || 20);
    const iterations = Math.max(120, Number(opts.iterations) || 300);
    const learningRate = Math.max(10, Number(opts.learningRate) || 120);
    const momentumSwitch = Math.floor(iterations * 0.38);
    const exaggerationIters = Math.floor(iterations * 0.22);
    const earlyExaggeration = 4;

    const dist = new Float64Array(n * n);
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const value = squaredDistance3(features[i], features[j]);
        dist[i * n + j] = value;
        dist[j * n + i] = value;
      }
    }

    const pCond = new Float64Array(n * n);
    const targetEntropy = Math.log(perplexity);
    for (let i = 0; i < n; i += 1) {
      let beta = 1;
      let betaMin = -Infinity;
      let betaMax = Infinity;
      for (let iter = 0; iter < 40; iter += 1) {
        const row = computeGaussianRow(dist, n, i, beta);
        const entropyDiff = row.entropy - targetEntropy;
        if (Math.abs(entropyDiff) < 1e-4) {
          for (let j = 0; j < n; j += 1) {
            pCond[i * n + j] = row.probs[j];
          }
          break;
        }

        if (entropyDiff > 0) {
          betaMin = beta;
          beta = Number.isFinite(betaMax) ? (beta + betaMax) * 0.5 : beta * 2;
        } else {
          betaMax = beta;
          beta = Number.isFinite(betaMin) ? (beta + betaMin) * 0.5 : beta * 0.5;
        }

        if (iter === 39) {
          for (let j = 0; j < n; j += 1) {
            pCond[i * n + j] = row.probs[j];
          }
        }
      }
    }

    const pSym = new Float64Array(n * n);
    const inv2n = 1 / (2 * n);
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const value = (pCond[i * n + j] + pCond[j * n + i]) * inv2n;
        pSym[i * n + j] = value;
        pSym[j * n + i] = value;
      }
    }

    const y = new Float64Array(n * 2);
    const velocity = new Float64Array(n * 2);
    const grad = new Float64Array(n * 2);
    const init = buildPcaModel(features.map(function (feature) {
      return Float64Array.from(feature);
    }));

    for (let i = 0; i < n; i += 1) {
      const projected = init ? projectVector(Float64Array.from(features[i]), init) : { x: 0, y: 0 };
      y[i * 2] = projected.x * 1e-3;
      y[i * 2 + 1] = projected.y * 1e-3;
    }

    const qNumerator = new Float64Array(n * n);
    for (let iter = 0; iter < iterations; iter += 1) {
      grad.fill(0);
      qNumerator.fill(0);

      let qSum = 0;
      for (let i = 0; i < n; i += 1) {
        const yi0 = y[i * 2];
        const yi1 = y[i * 2 + 1];
        for (let j = i + 1; j < n; j += 1) {
          const dx = yi0 - y[j * 2];
          const dy = yi1 - y[j * 2 + 1];
          const num = 1 / (1 + dx * dx + dy * dy);
          qNumerator[i * n + j] = num;
          qNumerator[j * n + i] = num;
          qSum += 2 * num;
        }
      }
      const invQSum = 1 / Math.max(1e-12, qSum);
      const exaggeration = iter < exaggerationIters ? earlyExaggeration : 1;

      for (let i = 0; i < n; i += 1) {
        const yi0 = y[i * 2];
        const yi1 = y[i * 2 + 1];
        for (let j = i + 1; j < n; j += 1) {
          const dx = yi0 - y[j * 2];
          const dy = yi1 - y[j * 2 + 1];
          const num = qNumerator[i * n + j];
          const qij = num * invQSum;
          const pij = pSym[i * n + j] * exaggeration;
          const factor = 4 * (pij - qij) * num;
          const gx = factor * dx;
          const gy = factor * dy;
          grad[i * 2] += gx;
          grad[i * 2 + 1] += gy;
          grad[j * 2] -= gx;
          grad[j * 2 + 1] -= gy;
        }
      }

      const momentum = iter < momentumSwitch ? 0.5 : 0.8;
      let meanX = 0;
      let meanY = 0;
      for (let i = 0; i < n; i += 1) {
        velocity[i * 2] = momentum * velocity[i * 2] - learningRate * grad[i * 2];
        velocity[i * 2 + 1] = momentum * velocity[i * 2 + 1] - learningRate * grad[i * 2 + 1];
        y[i * 2] += velocity[i * 2];
        y[i * 2 + 1] += velocity[i * 2 + 1];
        meanX += y[i * 2];
        meanY += y[i * 2 + 1];
      }
      meanX /= n;
      meanY /= n;
      for (let i = 0; i < n; i += 1) {
        y[i * 2] -= meanX;
        y[i * 2 + 1] -= meanY;
      }
    }

    const outX = new Array(n);
    const outY = new Array(n);
    for (let i = 0; i < n; i += 1) {
      outX[i] = y[i * 2];
      outY[i] = y[i * 2 + 1];
    }
    return { x: outX, y: outY };
  }

  function computeGaussianRow(dist, n, rowIndex, beta) {
    const probs = new Float64Array(n);
    let sum = 0;
    for (let j = 0; j < n; j += 1) {
      if (j === rowIndex) {
        probs[j] = 0;
        continue;
      }
      const value = Math.exp(-dist[rowIndex * n + j] * beta);
      probs[j] = value;
      sum += value;
    }

    if (sum <= 1e-12) {
      const uniform = 1 / Math.max(1, n - 1);
      for (let j = 0; j < n; j += 1) {
        probs[j] = j === rowIndex ? 0 : uniform;
      }
      return { probs: probs, entropy: Math.log(Math.max(1, n - 1)) };
    }

    let entropy = 0;
    for (let j = 0; j < n; j += 1) {
      const normalized = probs[j] / sum;
      probs[j] = normalized;
      if (normalized > 1e-12) {
        entropy -= normalized * Math.log(normalized);
      }
    }
    return { probs: probs, entropy: entropy };
  }

  function squaredDistance3(a, b) {
    const dx = (Number(a[0]) || 0) - (Number(b[0]) || 0);
    const dy = (Number(a[1]) || 0) - (Number(b[1]) || 0);
    const dz = (Number(a[2]) || 0) - (Number(b[2]) || 0);
    return dx * dx + dy * dy + dz * dz;
  }

  function applyTsneLayoutToComposites(composites, layout) {
    const x = layout.x || [];
    const y = layout.y || [];
    if (!x.length || !y.length) {
      composites.forEach(function (entry) {
        entry.tsneX = 0;
        entry.tsneY = 0;
      });
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < x.length; i += 1) {
      minX = Math.min(minX, x[i]);
      maxX = Math.max(maxX, x[i]);
      minY = Math.min(minY, y[i]);
      maxY = Math.max(maxY, y[i]);
    }

    const spanX = Math.max(1e-9, maxX - minX);
    const spanY = Math.max(1e-9, maxY - minY);

    for (let i = 0; i < composites.length; i += 1) {
      const nx = ((x[i] - minX) / spanX) * 2 - 1;
      const ny = ((y[i] - minY) / spanY) * 2 - 1;
      composites[i].tsneX = clampNumber(nx, -1.2, 1.2, 0);
      composites[i].tsneY = clampNumber(ny, -1.2, 1.2, 0);
    }
  }

  function renderParetoSummary(root, trio, composites, frontA, frontB, hasTargets) {
    if (!trio) {
      root.innerHTML = '<p class="embedding-hint">Select three elements to run Pareto analysis.</p>';
      return;
    }

    if (!hasTargets) {
      root.innerHTML =
        '<p class="embedding-hint">This embedding bundle does not contain both <code>conductivity</code> and <code>dielectric</code> property vectors, so Pareto fronts cannot be computed.</p>';
      return;
    }

    const union = new Set();
    frontA.forEach(function (index) {
      union.add(index);
    });
    frontB.forEach(function (index) {
      union.add(index);
    });
    const selectedCount = union.size;
    const selectionRate = composites.length ? (selectedCount / composites.length) * 100 : 0;

    root.innerHTML =
      '<div class="pareto-summary-highlights">' +
      '<article class="pareto-summary-highlight">' +
      '<p class="pareto-summary-highlight-label">Total composites</p>' +
      '<p class="pareto-summary-highlight-value">' +
      String(composites.length) +
      "</p>" +
      "</article>" +
      '<article class="pareto-summary-highlight">' +
      '<p class="pareto-summary-highlight-label">After Pareto selection (union)</p>' +
      '<p class="pareto-summary-highlight-value">' +
      String(selectedCount) +
      "</p>" +
      '<p class="pareto-summary-highlight-sub">' +
      escapeHtml(selectionRate.toFixed(1)) +
      "% retained</p>" +
      "</article>" +
      "</div>" +
      '<div class="pareto-summary-metrics">' +
      '<span class="pareto-metric"><strong>' +
      String(frontA.size) +
      "</strong> on Cond max + Dielectric min front</span>" +
      '<span class="pareto-metric"><strong>' +
      String(frontB.size) +
      "</strong> on Cond min + Dielectric max front</span>" +
      '<span class="pareto-metric"><strong>' +
      String(frontA.size + frontB.size - selectedCount) +
      "</strong> overlap in both fronts</span>" +
      "</div>";
  }

  function formatSimilarityPercent(value) {
    if (!Number.isFinite(value)) {
      return "n/a";
    }
    const percent = similarityToPercent(value);
    return percent.toFixed(1) + "%";
  }

  function similarityToPercent(value) {
    return clampNumber(((Number(value) + 1) / 2) * 100, 0, 100, 0);
  }

  function setupEmbeddingWorkbench(root, dataset) {
    const periodicGrid = root.querySelector("#periodic-grid");
    const compositionList = root.querySelector("#composition-list");
    const compositionTotal = root.querySelector("#composition-total");
    const clearBtn = root.querySelector("#composition-clear-btn");
    const mapSvg = root.querySelector("#periodic-embedding-map");
    const propertyBars = root.querySelector("#property-bars");
    const compositeTag = root.querySelector("#composite-tag");

    if (!periodicGrid || !compositionList || !compositionTotal || !clearBtn || !mapSvg || !propertyBars || !compositeTag) {
      return;
    }

    const state = {
      selected: {}
    };

    if (dataset.elementsBySymbol.Ni) {
      state.selected.Ni = 60;
    }
    if (dataset.elementsBySymbol.Fe) {
      state.selected.Fe = 40;
    }
    if (!Object.keys(state.selected).length && dataset.elements.length) {
      state.selected[dataset.elements[0].symbol] = 100;
    }

    periodicGrid.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-symbol]");
      if (!button) {
        return;
      }

      const symbol = button.dataset.symbol || "";
      if (!symbol || !dataset.elementsBySymbol[symbol]) {
        return;
      }

      if (state.selected[symbol]) {
        delete state.selected[symbol];
      } else {
        state.selected[symbol] = 10;
      }

      updateAll();
    });

    compositionList.addEventListener("input", function (event) {
      const input = event.target;
      if (!input || !input.matches("[data-symbol][data-kind]")) {
        return;
      }

      const symbol = input.getAttribute("data-symbol") || "";
      const parsed = Number(input.value);
      const value = clampNumber(parsed, 0, 100, 0);

      if (!symbol || !dataset.elementsBySymbol[symbol]) {
        return;
      }

      if (value <= 0) {
        delete state.selected[symbol];
      } else {
        state.selected[symbol] = value;
      }

      updateAll();
    });

    compositionList.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-remove-symbol]");
      if (!button) {
        return;
      }

      const symbol = button.dataset.removeSymbol || "";
      if (symbol && state.selected[symbol]) {
        delete state.selected[symbol];
        updateAll();
      }
    });

    clearBtn.addEventListener("click", function () {
      state.selected = {};
      updateAll();
    });

    function updateAll() {
      const composite = computeCompositeVector(state.selected, dataset);
      renderPeriodicGrid(periodicGrid, dataset, state.selected);
      renderCompositionRows(compositionList, compositionTotal, composite);
      renderCompositeMap(mapSvg, dataset, composite, state.selected);
      renderPropertyScores(propertyBars, dataset, composite);
      compositeTag.textContent = composite ? formatCompositeLabel(composite.weights) : "Composite";
    }

    updateAll();
  }

  function renderPeriodicGrid(root, dataset, selected) {
    let html = "";
    for (let row = 1; row <= 9; row += 1) {
      for (let col = 1; col <= 18; col += 1) {
        const key = String(row) + "-" + String(col);
        const symbol = dataset.positionToSymbol[key] || "";
        if (!symbol) {
          html += '<div class="periodic-empty-cell" aria-hidden="true"></div>';
          continue;
        }

        const element = dataset.elementsBySymbol[symbol];
        const active = Boolean(selected[symbol]);
        html +=
          '<button type="button" class="periodic-element-btn' +
          (active ? " active" : "") +
          " block-" +
          escapeHtml(element.block) +
          '" data-symbol="' +
          escapeHtml(symbol) +
          '" title="' +
          escapeHtml(symbol) +
          '">' +
          escapeHtml(symbol) +
          "</button>";
      }
    }
    root.innerHTML = html;
  }

  function renderCompositionRows(listRoot, totalRoot, composite) {
    if (!composite || !composite.weights.length) {
      listRoot.innerHTML = '<p class="embedding-hint">No element selected yet. Pick elements from the table above.</p>';
      totalRoot.textContent = "Total entered amount: 0.0 (relative units).";
      return;
    }

    const rows = composite.weights
      .map(function (entry) {
        const value = entry.concentration.toFixed(1);
        return (
          '<div class="composition-row">' +
          '<span class="composition-symbol">' +
          escapeHtml(entry.symbol) +
          "</span>" +
          '<input class="composition-slider" type="range" min="0" max="100" step="0.5" value="' +
          escapeHtml(value) +
          '" data-symbol="' +
          escapeHtml(entry.symbol) +
          '" data-kind="range">' +
          '<input class="composition-input" type="number" min="0" max="100" step="0.1" value="' +
          escapeHtml(value) +
          '" data-symbol="' +
          escapeHtml(entry.symbol) +
          '" data-kind="number">' +
          '<span class="composition-weight">' +
          String(Math.round(entry.weight * 100)) +
          "%</span>" +
          '<button type="button" class="composition-remove" data-remove-symbol="' +
          escapeHtml(entry.symbol) +
          '" aria-label="Remove ' +
          escapeHtml(entry.symbol) +
          '">×</button>' +
          "</div>"
        );
      })
      .join("");

    listRoot.innerHTML = rows;
    totalRoot.textContent = "Total entered amount: " + composite.total.toFixed(1) + " relative units (internally normalized to 100% for projection/similarity).";
  }

  function renderPropertyScores(barsRoot, dataset, composite) {
    if (!composite) {
      barsRoot.innerHTML = '<p class="embedding-hint">No composite vector available.</p>';
      return;
    }

    const keys = ["conductivity", "dielectric", "overpotential", "resistance"].filter(function (key) {
      return Boolean(dataset.propertyVectors[key]);
    });
    const scored = keys
      .map(function (property) {
        const similarity = cosineSimilarity(composite.vector, dataset.propertyVectors[property]);
        const percent = clampNumber(((similarity + 1) / 2) * 100, 0, 100, 0);
        return { property: property, percent: percent };
      })
      .sort(function (a, b) {
        return b.percent - a.percent;
      });

    barsRoot.innerHTML = scored
      .map(function (entry) {
        return (
          '<div class="property-score-row">' +
          '<span class="property-score-label">' +
          escapeHtml(formatPropertyName(entry.property)) +
          "</span>" +
          '<div class="property-score-track"><span class="property-score-fill" style="width:' +
          entry.percent.toFixed(1) +
          '%;"></span></div>' +
          '<span class="property-score-value">' +
          entry.percent.toFixed(1) +
          "%</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderCompositeMap(svg, dataset, composite, selected) {
    const width = 720;
    const height = 410;
    const margin = { left: 54, right: 20, top: 20, bottom: 44 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    function scaleX(value) {
      const normalized = (value + 1) / 2;
      return margin.left + normalized * plotWidth;
    }

    function scaleY(value) {
      const normalized = 1 - (value + 1) / 2;
      return margin.top + normalized * plotHeight;
    }

    let grid = "";
    for (let i = 0; i <= 6; i += 1) {
      const x = margin.left + (plotWidth / 6) * i;
      const y = margin.top + (plotHeight / 6) * i;
      grid += '<line x1="' + String(x) + '" y1="' + String(margin.top) + '" x2="' + String(x) + '" y2="' + String(height - margin.bottom) + '" class="embedding-grid-line"/>';
      grid += '<line x1="' + String(margin.left) + '" y1="' + String(y) + '" x2="' + String(width - margin.right) + '" y2="' + String(y) + '" class="embedding-grid-line"/>';
    }

    const blockColor = { s: "#7fc792", p: "#74a9db", d: "#df6fa9", f: "#e7ae72" };

    const points = dataset.elements
      .map(function (element) {
        const x = scaleX(element.projX);
        const y = scaleY(element.projY);
        const isSelected = Boolean(selected[element.symbol]);
        const radius = isSelected ? 5.8 : 4;
        const color = blockColor[element.block] || "#8ca7cf";
        return (
          '<circle class="periodic-map-point' +
          (isSelected ? " selected" : "") +
          '" cx="' +
          String(x) +
          '" cy="' +
          String(y) +
          '" r="' +
          String(radius) +
          '" fill="' +
          escapeHtml(color) +
          '"></circle>'
        );
      })
      .join("");

    let compositeMark = "";
    if (composite) {
      const projected = projectVector(composite.vector, dataset.pca);
      const x = scaleX(projected.x);
      const y = scaleY(projected.y);
      const label = formatCompositeLabel(composite.weights);
      compositeMark =
        '<g class="embedding-annotation">' +
        '<circle class="periodic-composite-point" cx="' +
        String(x) +
        '" cy="' +
        String(y) +
        '" r="8"></circle>' +
        '<rect x="' +
        String(Math.min(width - margin.right - 220, x + 12)) +
        '" y="' +
        String(Math.max(margin.top + 8, y - 16)) +
        '" width="210" height="30" rx="10"></rect>' +
        '<text x="' +
        String(Math.min(width - margin.right - 208, x + 22)) +
        '" y="' +
        String(Math.max(margin.top + 28, y + 4)) +
        '">' +
        escapeHtml(label) +
        "</text>" +
        "</g>";
    }

    svg.innerHTML =
      '<rect x="' +
      String(margin.left) +
      '" y="' +
      String(margin.top) +
      '" width="' +
      String(plotWidth) +
      '" height="' +
      String(plotHeight) +
      '" class="embedding-map-bg"></rect>' +
      grid +
      points +
      compositeMark +
      '<text class="embedding-axis-label" x="' +
      String(margin.left + plotWidth / 2) +
      '" y="' +
      String(height - 12) +
      '">PCA Axis 1</text>' +
      '<text class="embedding-axis-label embedding-axis-label-y" x="16" y="' +
      String(margin.top + plotHeight / 2) +
      '">PCA Axis 2</text>';
  }

  function computeCompositeVector(selected, dataset) {
    const symbols = Object.keys(selected || {}).filter(function (symbol) {
      return dataset.elementsBySymbol[symbol] && Number(selected[symbol]) > 0;
    });

    if (!symbols.length) {
      return null;
    }

    const total = symbols.reduce(function (sum, symbol) {
      return sum + Number(selected[symbol]);
    }, 0);
    if (total <= 0) {
      return null;
    }

    const vector = new Float64Array(dataset.dim);
    const weights = [];

    symbols.forEach(function (symbol) {
      const concentration = Number(selected[symbol]);
      const weight = concentration / total;
      const source = dataset.elementsBySymbol[symbol].vector;
      for (let i = 0; i < dataset.dim; i += 1) {
        vector[i] += source[i] * weight;
      }
      weights.push({ symbol: symbol, concentration: concentration, weight: weight });
    });

    weights.sort(function (a, b) {
      return b.weight - a.weight;
    });

    return {
      vector: vector,
      total: total,
      weights: weights
    };
  }

  function formatCompositeLabel(weights) {
    const list = (weights || []).slice(0, 4);
    if (!list.length) {
      return "Composite";
    }
    return list
      .map(function (item) {
        return item.symbol + String(Math.round(item.weight * 100)) + "%";
      })
      .join(" + ");
  }

  function formatPropertyName(value) {
    const key = String(value || "").toLowerCase();
    if (key === "conductivity") {
      return "Conductivity";
    }
    if (key === "dielectric") {
      return "Dielectric";
    }
    if (key === "overpotential") {
      return "Overpotential";
    }
    if (key === "resistance") {
      return "Resistance";
    }
    if (key === "stability") {
      return "Stability";
    }
    return value;
  }

  function cosineSimilarity(a, b) {
    const length = Math.min((a && a.length) || 0, (b && b.length) || 0);
    if (!length) {
      return 0;
    }

    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < length; i += 1) {
      const av = Number(a[i]) || 0;
      const bv = Number(b[i]) || 0;
      dot += av * bv;
      magA += av * av;
      magB += bv * bv;
    }

    if (!magA || !magB) {
      return 0;
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  function loadEmbeddingDataset() {
    if (window.__embeddingDatasetPromise) {
      return window.__embeddingDatasetPromise;
    }

    window.__embeddingDatasetPromise = loadEmbeddingBinaryDataset()
      .catch(function (binaryError) {
        return loadEmbeddingCsvDataset().catch(function (csvError) {
          return loadInlineEmbeddingDataset().catch(function (inlineError) {
            throw inlineError || csvError || binaryError;
          });
        });
      });

    return window.__embeddingDatasetPromise;
  }

  function loadEmbeddingBinaryDataset() {
    return Promise.all([
      fetch("assets/files/web_embeddings/meta.json"),
      fetch("assets/files/web_embeddings/vectors.f32")
    ])
      .then(function (response) {
        const metaResponse = response[0];
        const vectorsResponse = response[1];
        if (!metaResponse.ok || !vectorsResponse.ok) {
          throw new Error("Failed to load binary embedding assets.");
        }
        return Promise.all([metaResponse.json(), vectorsResponse.arrayBuffer()]);
      })
      .then(function (payload) {
        return parseEmbeddingBinaryDataset(payload[0], payload[1]);
      });
  }

  function loadEmbeddingCsvDataset() {
    return fetch("assets/files/web_embeddings/embeddings.csv")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load embeddings.csv");
        }
        return response.text();
      })
      .then(function (text) {
        return parseEmbeddingCsvDataset(text);
      });
  }

  function loadInlineEmbeddingDataset() {
    const inline = window.__WEB_EMBEDDINGS_INLINE__;
    if (!inline || !inline.meta || !inline.vectorsBase64) {
      return Promise.reject(new Error("Inline embedding bundle unavailable."));
    }
    const vectorBuffer = decodeBase64ToArrayBuffer(inline.vectorsBase64);
    return Promise.resolve(parseEmbeddingBinaryDataset(inline.meta, vectorBuffer));
  }

  function decodeBase64ToArrayBuffer(base64) {
    const decoded = atob(String(base64 || ""));
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function parseEmbeddingBinaryDataset(meta, vectorBuffer) {
    const dim = Math.max(0, Number(meta && meta.dim) || 0);
    const count = Math.max(0, Number(meta && meta.count) || 0);
    const tokens = Array.isArray(meta && meta.tokens) ? meta.tokens : [];
    const kinds = Array.isArray(meta && meta.kind) ? meta.kind : [];
    if (!dim || !count || !tokens.length) {
      throw new Error("Embedding metadata is incomplete.");
    }

    const vectors = new Float32Array(vectorBuffer);
    const expected = count * dim;
    if (vectors.length < expected) {
      throw new Error("Embedding vector payload is truncated.");
    }
    const rows = Math.min(count, tokens.length, Math.floor(vectors.length / dim));

    const propertySet = {
      conductivity: true,
      dielectric: true,
      overpotential: true,
      resistance: true,
      stability: true
    };
    const periodicMap = buildPeriodicPositionMap();

    const elements = [];
    const elementsBySymbol = {};
    const propertyVectors = {};

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const token = String(tokens[rowIndex] || "").trim();
      if (!token) {
        continue;
      }
      const kind = String(kinds[rowIndex] || "").trim().toLowerCase();
      const vector = new Float64Array(dim);
      const offset = rowIndex * dim;
      for (let i = 0; i < dim; i += 1) {
        vector[i] = Number(vectors[offset + i]) || 0;
      }

      if ((kind === "element" || (!kind && !propertySet[token])) && periodicMap[token]) {
        const position = periodicMap[token];
        const block = inferElementBlock(position);
        const element = {
          symbol: token,
          vector: vector,
          position: position,
          block: block,
          projX: 0,
          projY: 0
        };
        elements.push(element);
        elementsBySymbol[token] = element;
      } else if (kind === "property" || propertySet[token]) {
        propertyVectors[token] = vector;
      }
    }

    if (!elements.length) {
      throw new Error("No element embeddings found in binary payload.");
    }

    const pca = buildPcaModel(
      elements.map(function (item) {
        return item.vector;
      })
    );

    elements.forEach(function (element) {
      const projected = projectVector(element.vector, pca);
      element.projX = projected.x;
      element.projY = projected.y;
    });

    const positionToSymbol = {};
    elements.forEach(function (element) {
      const key = String(element.position.row) + "-" + String(element.position.col);
      positionToSymbol[key] = element.symbol;
    });

    return {
      dim: dim,
      elements: elements,
      elementsBySymbol: elementsBySymbol,
      propertyVectors: propertyVectors,
      positionToSymbol: positionToSymbol,
      pca: pca
    };
  }

  function parseEmbeddingCsvDataset(csvText) {
    const lines = String(csvText || "")
      .trim()
      .split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error("Embedding CSV has no data rows.");
    }

    const dim = Math.max(0, lines[0].split(",").length - 2);
    const propertySet = {
      conductivity: true,
      dielectric: true,
      overpotential: true,
      resistance: true,
      stability: true
    };
    const periodicMap = buildPeriodicPositionMap();

    const elements = [];
    const elementsBySymbol = {};
    const propertyVectors = {};

    for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
      const row = lines[lineIndex];
      if (!row) {
        continue;
      }
      const fields = row.split(",");
      if (fields.length < 2 + dim) {
        continue;
      }

      const token = String(fields[0] || "").trim();
      const kind = String(fields[1] || "").trim();
      const vector = new Float64Array(dim);
      for (let i = 0; i < dim; i += 1) {
        vector[i] = Number(fields[i + 2]) || 0;
      }

      if (kind === "element" && periodicMap[token]) {
        const position = periodicMap[token];
        const block = inferElementBlock(position);
        const element = {
          symbol: token,
          vector: vector,
          position: position,
          block: block,
          projX: 0,
          projY: 0
        };
        elements.push(element);
        elementsBySymbol[token] = element;
      } else if (propertySet[token]) {
        propertyVectors[token] = vector;
      }
    }

    if (!elements.length) {
      throw new Error("No element embeddings found in CSV.");
    }

    const pca = buildPcaModel(
      elements.map(function (item) {
        return item.vector;
      })
    );

    elements.forEach(function (element) {
      const projected = projectVector(element.vector, pca);
      element.projX = projected.x;
      element.projY = projected.y;
    });

    const positionToSymbol = {};
    elements.forEach(function (element) {
      const key = String(element.position.row) + "-" + String(element.position.col);
      positionToSymbol[key] = element.symbol;
    });

    return {
      dim: dim,
      elements: elements,
      elementsBySymbol: elementsBySymbol,
      propertyVectors: propertyVectors,
      positionToSymbol: positionToSymbol,
      pca: pca
    };
  }

  function buildPeriodicPositionMap() {
    const rows = [
      ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
      ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
      ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
      ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
      ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
      ["Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "", "", ""],
      ["", "", "", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", ""],
      ["", "", "", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", ""],
      ["", "", "", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", ""]
    ];

    const mapping = {};
    rows.forEach(function (rowValues, rowIndex) {
      rowValues.forEach(function (symbol, colIndex) {
        if (!symbol) {
          return;
        }
        mapping[symbol] = {
          row: rowIndex + 1,
          col: colIndex + 1
        };
      });
    });

    return mapping;
  }

  function inferElementBlock(position) {
    if (position.row >= 8) {
      return "f";
    }
    if (position.col <= 2) {
      return "s";
    }
    if (position.col >= 13) {
      return "p";
    }
    return "d";
  }

  function buildPcaModel(vectors) {
    if (!vectors || !vectors.length) {
      return null;
    }

    const count = vectors.length;
    const dim = vectors[0].length;
    const mean = new Float64Array(dim);

    vectors.forEach(function (vector) {
      for (let i = 0; i < dim; i += 1) {
        mean[i] += vector[i];
      }
    });
    for (let i = 0; i < dim; i += 1) {
      mean[i] /= count;
    }

    const centered = vectors.map(function (vector) {
      const row = new Float64Array(dim);
      for (let i = 0; i < dim; i += 1) {
        row[i] = vector[i] - mean[i];
      }
      return row;
    });

    const covariance = new Float64Array(dim * dim);
    centered.forEach(function (row) {
      for (let i = 0; i < dim; i += 1) {
        const vi = row[i];
        const offset = i * dim;
        for (let j = i; j < dim; j += 1) {
          covariance[offset + j] += vi * row[j];
        }
      }
    });

    const inv = 1 / Math.max(1, count - 1);
    for (let i = 0; i < dim; i += 1) {
      for (let j = i; j < dim; j += 1) {
        const value = covariance[i * dim + j] * inv;
        covariance[i * dim + j] = value;
        if (i !== j) {
          covariance[j * dim + i] = value;
        }
      }
    }

    const pc1 = dominantEigenvector(covariance, dim, null);
    const pc2 = dominantEigenvector(covariance, dim, pc1);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    centered.forEach(function (row) {
      const x = dotProduct(row, pc1);
      const y = dotProduct(row, pc2);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    return {
      mean: mean,
      pc1: pc1,
      pc2: pc2,
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY
    };
  }

  function dominantEigenvector(matrix, dim, orthVector) {
    let vector = new Float64Array(dim);
    for (let i = 0; i < dim; i += 1) {
      vector[i] = 1 / dim + i * 1e-6;
    }

    for (let iter = 0; iter < 50; iter += 1) {
      const next = matVec(matrix, vector, dim);
      if (orthVector) {
        const projection = dotProduct(next, orthVector);
        for (let i = 0; i < dim; i += 1) {
          next[i] -= projection * orthVector[i];
        }
      }

      const norm = vectorNorm(next);
      if (!norm) {
        break;
      }
      for (let i = 0; i < dim; i += 1) {
        vector[i] = next[i] / norm;
      }
    }

    return vector;
  }

  function matVec(matrix, vector, dim) {
    const out = new Float64Array(dim);
    for (let i = 0; i < dim; i += 1) {
      let sum = 0;
      const offset = i * dim;
      for (let j = 0; j < dim; j += 1) {
        sum += matrix[offset + j] * vector[j];
      }
      out[i] = sum;
    }
    return out;
  }

  function dotProduct(a, b) {
    const length = Math.min((a && a.length) || 0, (b && b.length) || 0);
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  function vectorNorm(vector) {
    return Math.sqrt(dotProduct(vector, vector));
  }

  function projectVector(vector, pca) {
    if (!pca) {
      return { x: 0, y: 0 };
    }

    const dim = Math.min(vector.length, pca.mean.length);
    const centered = new Float64Array(dim);
    for (let i = 0; i < dim; i += 1) {
      centered[i] = vector[i] - pca.mean[i];
    }

    const rawX = dotProduct(centered, pca.pc1);
    const rawY = dotProduct(centered, pca.pc2);
    const spanX = Math.max(1e-9, pca.maxX - pca.minX);
    const spanY = Math.max(1e-9, pca.maxY - pca.minY);
    const x = ((rawX - pca.minX) / spanX) * 2 - 1;
    const y = ((rawY - pca.minY) / spanY) * 2 - 1;

    return {
      x: clampNumber(x, -1.2, 1.2, 0),
      y: clampNumber(y, -1.2, 1.2, 0)
    };
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
      renderTimelineYears(grouped, recentYears, currentPage) +
      "</div>" +
      (olderYears.length
        ? '<div class="timeline-controls"><button type="button" class="older-toggle-btn" id="older-toggle-btn">Show older years</button></div>' +
          '<div class="timeline older-years is-collapsed" id="older-years">' +
          renderTimelineYears(grouped, olderYears, currentPage) +
          "</div>"
        : "");

    setupTimelineToggle(root);
    applyLocationFocus(root);
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

  function renderTimelineYears(grouped, years, pageKey) {
    return years
      .map(function (year) {
        const items = grouped[year] || [];
        return (
          '<section class="timeline-year-group">' +
          '<h3 class="timeline-year">' +
          escapeHtml(String(year)) +
          "</h3>" +
          items
            .map(function (item) {
              return renderTimelineItem(item, pageKey);
            })
            .join("") +
          "</section>"
        );
      })
      .join("");
  }

  function renderTimelineItem(item, pageKey) {
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
      '<article class="timeline-item" id="' +
      escapeHtml(buildItemAnchorId(pageKey, item)) +
      '">' +
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
      '"' +
      (opts.anchorId ? ' id="' + escapeHtml(opts.anchorId) + '"' : "") +
      ' data-focus-target="' +
      escapeHtml(opts.anchorId || "") +
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
    if (pageKey === "embedding") {
      return iconEmbedding();
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

  function slugifyText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  function buildItemAnchorId(pageKey, item) {
    const main = slugifyText(item && (item.title || item.subtitle || item.meta || "item"));
    const extra = slugifyText(item && (item.subtitle || item.meta || ""));
    const year = String((item && item.year) || getItemYear(item) || "");
    const joined = [pageKey, main, extra, year].filter(Boolean).join("-");
    return "search-" + (joined || "target");
  }

  function getQueryParam(name) {
    try {
      const value = new URLSearchParams(window.location.search).get(name);
      return value || "";
    } catch (error) {
      return "";
    }
  }

  function applyLocationFocus(root) {
    const hash = String(window.location.hash || "").replace(/^#/, "");
    if (!hash) {
      return;
    }

    const target = document.getElementById(hash);
    if (!target) {
      return;
    }

    const olderRoot = target.closest("#older-years");
    if (olderRoot && olderRoot.classList.contains("is-collapsed")) {
      olderRoot.classList.remove("is-collapsed");
      const olderBtn = document.getElementById("older-toggle-btn");
      if (olderBtn) {
        olderBtn.textContent = "Hide older years";
      }
    }

    const highlightTarget = target.classList.contains("timeline-item")
      ? target.querySelector(".timeline-card") || target
      : target;

    window.requestAnimationFrame(function () {
      highlightTarget.classList.add("search-target-highlight");
      highlightTarget.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      window.setTimeout(function () {
        highlightTarget.classList.remove("search-target-highlight");
      }, 3200);
    });
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
      '<input id="search-input" class="search-input" type="search" placeholder="Search pages, papers, talks, demos..." autocomplete="off">' +
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

    searchResults.addEventListener("click", function (event) {
      const link = event.target.closest("a.search-result");
      if (!link) {
        return;
      }
      closeSearch();
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
        const anchorId = buildItemAnchorId(pageKey, item);
        entries.push({
          title: item.title || navItem.label,
          subtitle: navItem.label + (item.subtitle ? " - " + item.subtitle : ""),
          href: href + "#" + anchorId,
          searchable: [item.title, item.subtitle, item.meta, item.description, item.kind, navItem.label]
            .join(" ")
            .toLowerCase()
        });
      });

      (section.education || []).forEach(function (item) {
        entries.push({
          title: item.title || "Education",
          subtitle: "Bio - Education",
          href: href + "#" + buildItemAnchorId("bio-education", item),
          searchable: [item.title, item.subtitle, "education"].join(" ").toLowerCase()
        });
      });

      ((section.demo && section.demo.examples) || []).forEach(function (item) {
        entries.push({
          title: item.label || "Embedding example",
          subtitle: navItem.label + " - Synthetic demo",
          href: href,
          searchable: [item.label, item.text, (item.notes || []).join(" "), "embedding synthetic demo electrocatalyst"]
            .join(" ")
            .toLowerCase()
        });
      });

      (section.subtabs || []).forEach(function (tab) {
        const subtabHref = href + "?subtab=" + encodeURIComponent(tab.key) + "#project-subtab-panel";
        entries.push({
          title: tab.label || tab.title || "Project subtab",
          subtitle: navItem.label + " - Subtab",
          href: subtabHref,
          searchable: [tab.label, tab.title, tab.description, tab.type, tab.key, "project subtab demo embedding"]
            .join(" ")
            .toLowerCase()
        });
      });

      if (pageKey === "projects") {
        const embeddingTabHref = href + "?subtab=word-embedding-demo";
        const paretoTabHref = href + "?subtab=pareto-front-demo";
        entries.push({
          title: "Demo Instructions",
          subtitle: navItem.label,
          href: embeddingTabHref + "#embedding-how-to",
          searchable: "word embedding demo instructions how to use".toLowerCase()
        });
        entries.push({
          title: "Periodic Table Selector",
          subtitle: navItem.label,
          href: embeddingTabHref + "#embedding-periodic-selector",
          searchable: "periodic table elements concentration composite embedding projection".toLowerCase()
        });
        entries.push({
          title: "Composition",
          subtitle: navItem.label,
          href: embeddingTabHref + "#embedding-composition",
          searchable: "composition concentration ratio normalize amount".toLowerCase()
        });
        entries.push({
          title: "Embedding Map",
          subtitle: navItem.label,
          href: embeddingTabHref + "#embedding-map",
          searchable: "embedding map pca projection point location".toLowerCase()
        });
        entries.push({
          title: "Property Similarity",
          subtitle: navItem.label,
          href: embeddingTabHref + "#embedding-property-similarity",
          searchable: "conductivity dielectric overpotential resistance similarity score".toLowerCase()
        });
        entries.push({
          title: "Pareto Demo Instructions",
          subtitle: navItem.label,
          href: paretoTabHref + "#pareto-how-to",
          searchable: "pareto front demo instructions ternary composites conductivity dielectric".toLowerCase()
        });
        entries.push({
          title: "Pareto Periodic Selector",
          subtitle: navItem.label,
          href: paretoTabHref + "#pareto-periodic-selector",
          searchable: "periodic table select three elements pareto".toLowerCase()
        });
        entries.push({
          title: "Created Composites",
          subtitle: navItem.label,
          href: paretoTabHref + "#pareto-created-composites",
          searchable: "ternary composites list concentration sum 100 step 1".toLowerCase()
        });
        entries.push({
          title: "Material Composition Plot",
          subtitle: navItem.label,
          href: paretoTabHref + "#pareto-material-plot",
          searchable: "materials plot 3d concentration axes composition distribution".toLowerCase()
        });
        entries.push({
          title: "Pareto Embedding Plot",
          subtitle: navItem.label,
          href: paretoTabHref + "#pareto-embedding-plot",
          searchable: "embedding distribution tsne pareto front".toLowerCase()
        });
        entries.push({
          title: "Pareto Front Summary",
          subtitle: navItem.label,
          href: paretoTabHref + "#pareto-front-summary",
          searchable: "pareto selected materials conductivity dielectric optimization".toLowerCase()
        });
      }
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

  function clampNumber(value, min, max, fallback) {
    const resolvedFallback = Number.isFinite(fallback) ? fallback : 0;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return resolvedFallback;
    }
    return Math.max(min, Math.min(max, numeric));
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

  function iconEmbedding() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="6.5" cy="12" r="2.2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="6.5" r="2.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="12" r="2.2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="17.5" r="2.2" stroke="currentColor" stroke-width="1.8"/><path d="M8.2 10.3L10.3 8.2M13.7 8.2L15.8 10.3M15.8 13.7L13.7 15.8M10.3 15.8L8.2 13.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
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
