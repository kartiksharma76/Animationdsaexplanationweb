/**
 * AlgoPulse - Main Application Controller
 * Handles routing, view switching, filter bindings, workspace synchronization,
 * quiz execution, student dashboard, and admin operations.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Application State
  const state = {
    currentView: 'explore',
    categories: [],
    questions: [],
    selectedQuestion: null,
    activeFilters: {
      categoryId: null,
      difficulty: '',
      search: '',
      status: 'all' // all, solved, in_progress, bookmarked
    },
    user: null,
    visualizer: null,
    activeQuiz: null,
    quizUserAnswers: {}
  };

  // Initialize Visualizer Engine
  state.visualizer = new VisualizerEngine({
    canvasId: 'stage-canvas',
    codeContainerId: 'code-lines-wrapper',
    narrativeId: 'narrative-card',
    variablesId: 'variables-grid',
    stepCounterId: 'step-counter',
    scrubberFillId: 'scrubber-fill',
    playBtnId: 'btn-play-pause'
  });

  // Bind Visualizer Control Buttons
  document.getElementById('btn-play-pause')?.addEventListener('click', () => state.visualizer.togglePlay());
  document.getElementById('btn-step-next')?.addEventListener('click', () => state.visualizer.next());
  document.getElementById('btn-step-prev')?.addEventListener('click', () => state.visualizer.prev());
  document.getElementById('btn-step-reset')?.addEventListener('click', () => state.visualizer.reset());
  document.getElementById('speed-slider')?.addEventListener('input', (e) => {
    state.visualizer.setSpeed(e.target.value);
    const lbl = document.getElementById('speed-val-label');
    if (lbl) lbl.textContent = `${e.target.value}x`;
  });

  document.getElementById('scrubber-track')?.addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    const targetIdx = Math.round(pct * (state.visualizer.steps.length - 1));
    state.visualizer.seek(targetIdx);
  });

  // Studio View Mode Switcher (Split, DS, Flowchart)
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode') || 'split';
      const wrapper = document.getElementById('stage-split-wrapper');
      if (wrapper) {
        wrapper.className = `stage-split-wrapper mode-${mode}`;
      }
    });
  });

  // Toggle Custom Input Drawer in Workspace
  document.getElementById('btn-toggle-custom-input')?.addEventListener('click', () => {
    const bar = document.getElementById('custom-input-bar-ws');
    if (bar) {
      bar.style.display = (bar.style.display === 'none' || !bar.style.display) ? 'flex' : 'none';
    }
  });

  // Toggle Fullscreen Focus Studio Mode (100% width)
  document.getElementById('btn-expand-studio')?.addEventListener('click', () => {
    const wsContainer = document.querySelector('.workspace-container');
    const label = document.getElementById('expand-studio-label');
    if (wsContainer) {
      wsContainer.classList.toggle('studio-expanded');
      const isExp = wsContainer.classList.contains('studio-expanded');
      if (label) {
        label.textContent = isExp ? 'Side-by-Side' : 'Expand';
      }
    }
  });

  // Check Auth on load
  await checkAuth();

  // Load Initial Categories and Questions
  await loadCategories();
  await loadQuestions();

  // Initial Routing based on URL hash
  handleRoute();

  // Navigation Links Binding
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      navigateTo(view);
    });
  });

  // Search & Filter Events
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.activeFilters.search = e.target.value.trim();
        loadQuestions();
      }, 300);
    });
  }

  // Difficulty Pills
  document.querySelectorAll('.pill-difficulty').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill-difficulty').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilters.difficulty = pill.getAttribute('data-difficulty') || '';
      loadQuestions();
    });
  });

  // Status Filter Pills
  document.querySelectorAll('.pill-status').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill-status').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilters.status = pill.getAttribute('data-status') || 'all';
      renderQuestionGrid();
    });
  });

  // Copy Code Button
  document.getElementById('btn-copy-code')?.addEventListener('click', () => {
    const codeEl = document.getElementById('code-lines-wrapper');
    if (!codeEl) return;
    const textLines = Array.from(codeEl.querySelectorAll('.code-line-text'))
      .map(span => span.textContent)
      .join('\n');

    navigator.clipboard.writeText(textLines).then(() => {
      showToast('Java code copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy code.', 'error');
    });
  });

  // Workspace Tabs
  document.querySelectorAll('.workspace-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.workspace-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Solution Code Toggle (Optimized vs Brute Force)
  document.getElementById('code-type-selector')?.addEventListener('change', (e) => {
    if (!state.selectedQuestion) return;
    const isBrute = e.target.value === 'brute';
    const code = isBrute ? state.selectedQuestion.bruteForceCode : state.selectedQuestion.optimizedCode;
    renderJavaCode(code || '// No code provided');
  });

  // Save Notes Button
  document.getElementById('btn-save-notes')?.addEventListener('click', async () => {
    if (!state.user) {
      openAuthModal('login');
      return;
    }
    if (!state.selectedQuestion) return;

    const notesText = document.getElementById('user-question-notes')?.value || '';
    try {
      await API.updateProgress(state.selectedQuestion.id, state.selectedQuestion.userStatus, notesText);
      state.selectedQuestion.userNotes = notesText;
      showToast('Study notes saved!', 'success');
    } catch (err) {
      showToast('Failed to save notes: ' + err.message, 'error');
    }
  });

  // Mark Solved Toggle
  document.getElementById('select-question-status')?.addEventListener('change', async (e) => {
    if (!state.user) {
      openAuthModal('login');
      return;
    }
    if (!state.selectedQuestion) return;

    const newStatus = e.target.value;
    try {
      await API.updateProgress(state.selectedQuestion.id, newStatus, state.selectedQuestion.userNotes || '');
      state.selectedQuestion.userStatus = newStatus;
      showToast(`Status updated to ${newStatus.replace('_', ' ')}!`, 'success');
      loadQuestions();
    } catch (err) {
      showToast('Failed to update progress: ' + err.message, 'error');
    }
  });

  // Workspace Bookmark Toggle
  document.getElementById('btn-workspace-bookmark')?.addEventListener('click', async () => {
    if (!state.user) {
      openAuthModal('login');
      return;
    }
    if (!state.selectedQuestion) return;

    try {
      const res = await API.toggleBookmark(state.selectedQuestion.id);
      state.selectedQuestion.isBookmarked = res.bookmarked;
      updateBookmarkBtnState(res.bookmarked);
      showToast(res.bookmarked ? 'Added to Bookmarks!' : 'Removed from Bookmarks.', 'info');
      loadQuestions();
    } catch (err) {
      showToast('Failed to toggle bookmark: ' + err.message, 'error');
    }
  });

  // Custom Input Sandbox Execution in Workspace
  document.getElementById('btn-run-custom-input')?.addEventListener('click', () => {
    const inputVal = document.getElementById('custom-input-array')?.value.trim();
    const targetVal = document.getElementById('custom-input-target')?.value.trim();

    if (!inputVal) {
      showToast('Please enter an array or list of values.', 'error');
      return;
    }

    try {
      const parsedArray = inputVal.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const parsedTarget = targetVal ? parseInt(targetVal, 10) : undefined;

      const algoType = (state.selectedQuestion?.visualizerType === 'BINARY_SEARCH') ? 'BINARY_SEARCH' : 'TWO_SUM';
      const steps = VisualizerEngine.generateCustomSteps(algoType, {
        array: parsedArray,
        target: parsedTarget
      });

      if (steps.length > 0) {
        state.visualizer.load(steps, state.selectedQuestion?.visualizerType || 'ARRAY_TWO_POINTER');
        showToast('Generated interactive steps for your custom input!', 'success');
      } else {
        showToast('Could not generate steps for this input.', 'warning');
      }
    } catch (err) {
      showToast('Invalid input format: ' + err.message, 'error');
    }
  });

  // Dedicated Visualizer Lab (Sandbox View) Runner
  document.getElementById('btn-sandbox-run')?.addEventListener('click', () => {
    const algo = document.getElementById('sandbox-algo-type')?.value || 'TWO_SUM';
    const rawArr = document.getElementById('sandbox-array')?.value.trim() || '';
    const rawTarget = document.getElementById('sandbox-target')?.value.trim();

    try {
      const parsedArray = rawArr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const parsedTarget = rawTarget ? parseInt(rawTarget, 10) : undefined;

      const steps = VisualizerEngine.generateCustomSteps(algo, {
        array: parsedArray,
        target: parsedTarget
      });

      if (steps.length === 0) {
        showToast('Could not generate simulation for this input.', 'warning');
        return;
      }

      // Open workspace view with custom simulation
      navigateTo('workspace');
      document.getElementById('ws-question-title').textContent = `Sandbox Simulation: ${algo === 'TWO_SUM' ? 'Two Pointer Two Sum' : 'Binary Search'}`;
      document.getElementById('ws-problem-statement').textContent = `Interactive sandbox trace on custom input: [${parsedArray.join(', ')}] with target ${parsedTarget !== undefined ? parsedTarget : 'N/A'}.`;
      document.getElementById('ws-constraints-text').textContent = 'User generated dataset.';
      
      const visType = (algo === 'BINARY_SEARCH') ? 'BINARY_SEARCH' : 'ARRAY_TWO_POINTER';
      state.visualizer.load(steps, visType);
      showToast('Custom sandbox simulation loaded in studio!', 'success');
    } catch (err) {
      showToast('Error generating simulation: ' + err.message, 'error');
    }
  });

  // Auth Modal Listeners
  setupAuthHandlers();

  // Admin Modal Listeners
  setupAdminHandlers();

  // Listen to Global Auth Changes
  window.addEventListener('auth-changed', async () => {
    await checkAuth();
    loadQuestions();
  });

  /* ==========================================================================
     CORE FUNCTIONS
     ========================================================================== */

  async function checkAuth() {
    state.user = API.getUser();
    renderAuthUI();
  }

  function renderAuthUI() {
    const authActions = document.getElementById('nav-auth-actions');
    const adminLink = document.querySelector('.nav-link[data-view="admin"]');

    if (!authActions) return;

    if (state.user) {
      const isAdmin = state.user.role === 'ROLE_ADMIN';
      if (adminLink) {
        adminLink.style.display = isAdmin ? 'flex' : 'none';
      }

      authActions.innerHTML = `
        <div class="streak-badge" title="Daily Problem Streak">
          🔥 ${state.user.streakDays || 1}d
        </div>
        <div class="user-profile-badge" id="btn-user-profile" title="View Profile">
          <div class="user-avatar">${(state.user.username || 'U')[0].toUpperCase()}</div>
          <span style="font-size: 0.88rem; font-weight: 600;">${state.user.username}</span>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-nav-logout" title="Log Out">Log Out</button>
      `;

      document.getElementById('btn-nav-logout')?.addEventListener('click', () => {
        API.logout();
        showToast('Logged out successfully.', 'info');
        navigateTo('explore');
      });

      document.getElementById('btn-user-profile')?.addEventListener('click', () => {
        navigateTo('dashboard');
      });
    } else {
      if (adminLink) adminLink.style.display = 'none';

      authActions.innerHTML = `
        <button class="btn btn-outline btn-sm" id="btn-nav-login">Sign In</button>
        <button class="btn btn-primary btn-sm" id="btn-nav-register">Register</button>
      `;

      document.getElementById('btn-nav-login')?.addEventListener('click', () => openAuthModal('login'));
      document.getElementById('btn-nav-register')?.addEventListener('click', () => openAuthModal('register'));
    }
  }

  async function loadCategories() {
    try {
      const categories = await API.getCategories();
      state.categories = categories;
      renderCategoryPills(categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  function renderCategoryPills(categories) {
    const container = document.getElementById('category-pills-row');
    if (!container) return;

    container.innerHTML = '<span class="filter-label">Topic:</span>';

    const allPill = document.createElement('div');
    allPill.className = `pill ${!state.activeFilters.categoryId ? 'active' : ''}`;
    allPill.textContent = 'All Topics';
    allPill.addEventListener('click', () => {
      document.querySelectorAll('#category-pills-row .pill').forEach(p => p.classList.remove('active'));
      allPill.classList.add('active');
      state.activeFilters.categoryId = null;
      loadQuestions();
    });
    container.appendChild(allPill);

    categories.forEach(cat => {
      const pill = document.createElement('div');
      pill.className = `pill ${state.activeFilters.categoryId === cat.id ? 'active' : ''}`;
      pill.innerHTML = `<span>${getCategoryIcon(cat.icon)}</span> ${cat.name}`;
      pill.addEventListener('click', () => {
        document.querySelectorAll('#category-pills-row .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFilters.categoryId = cat.id;
        loadQuestions();
      });
      container.appendChild(pill);
    });
  }

  async function loadQuestions() {
    const grid = document.getElementById('questions-grid');
    if (grid) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted)">Loading algorithmic problems...</div>';
    }

    try {
      const questions = await API.getQuestions({
        categoryId: state.activeFilters.categoryId,
        difficulty: state.activeFilters.difficulty,
        search: state.activeFilters.search
      });
      state.questions = questions;
      renderQuestionGrid();
      updateHeroStats();
    } catch (err) {
      if (grid) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--accent-rose)">Failed to load questions: ${err.message}</div>`;
      }
    }
  }

  function renderQuestionGrid() {
    const grid = document.getElementById('questions-grid');
    if (!grid) return;

    let filtered = state.questions;
    if (state.activeFilters.status === 'solved') {
      filtered = filtered.filter(q => q.userStatus === 'SOLVED');
    } else if (state.activeFilters.status === 'in_progress') {
      filtered = filtered.filter(q => q.userStatus === 'IN_PROGRESS');
    } else if (state.activeFilters.status === 'bookmarked') {
      filtered = filtered.filter(q => q.isBookmarked);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted)">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="margin-bottom: 0.5rem; color: var(--text-primary)">No matching questions found</h3>
          <p>Try clearing your filters or searching with another keyword.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    filtered.forEach(q => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.style.cursor = 'pointer';

      const diffBadgeClass = `badge-${q.difficulty.toLowerCase()}`;
      const statusClass = (q.userStatus || 'NOT_STARTED').toLowerCase();

      const isBm = q.isBookmarked || q.bookmarked;
      card.innerHTML = `
        <div>
          <div class="card-top">
            <div class="card-badges">
              <span class="badge ${diffBadgeClass}">${q.difficulty}</span>
              <span class="badge badge-category">${q.categoryName || 'DSA'}</span>
              <span class="badge badge-type">🎬 ${formatVisualizerName(q.visualizerType)}</span>
            </div>
            <button class="btn-star ${isBm ? 'bookmarked' : ''}" data-id="${q.id}" title="${isBm ? 'Remove Bookmark' : 'Add to Bookmarks'}">
              ${isBm ? '★' : '☆'}
            </button>
          </div>

          <h3 class="question-title">
            <a href="#/question/${q.slug}" class="question-link" data-slug="${q.slug}">${q.title}</a>
          </h3>

          <p class="question-snippet">${q.problemStatement || 'Interactive step-by-step visualizer with Java solution and dry run.'}</p>
        </div>

        <div>
          <div class="card-bottom" style="margin-top: 1rem;">
            <div class="status-indicator">
              <span class="status-dot ${statusClass}"></span>
              <span style="color: var(--text-secondary)">${formatStatus(q.userStatus)}</span>
            </div>
            <button class="btn btn-primary btn-open-visualizer" data-slug="${q.slug}" style="font-weight: 700; font-size: 0.92rem; padding: 0.55rem 1.2rem; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
              🎬 Watch Animation ➜
            </button>
          </div>
        </div>
      `;

      // Bookmark button listener
      card.querySelector('.btn-star').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!state.user) {
          openAuthModal('login');
          return;
        }
        try {
          const res = await API.toggleBookmark(q.id);
          q.isBookmarked = res.bookmarked;
          renderQuestionGrid();
          showToast(res.bookmarked ? 'Saved to bookmarks!' : 'Bookmark removed.', 'info');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });

      // Clicking anywhere on card opens the animated workspace
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-star')) {
          e.preventDefault();
          openQuestionWorkspace(q.slug);
        }
      });

      grid.appendChild(card);
    });
  }

  function updateHeroStats() {
    const totalEl = document.getElementById('hero-stat-total');
    const catEl = document.getElementById('hero-stat-categories');
    const solvedEl = document.getElementById('hero-stat-solved');

    if (totalEl) totalEl.textContent = state.questions.length || '16+';
    if (catEl) catEl.textContent = state.categories.length || '12';
    if (solvedEl) {
      const solved = state.questions.filter(q => q.userStatus === 'SOLVED').length;
      solvedEl.textContent = solved;
    }
  }

  /* ==========================================================================
     QUESTION WORKSPACE (DETAIL & VISUALIZER)
     ========================================================================== */

  async function openQuestionWorkspace(slugOrId) {
    navigateTo('workspace');
    window.scrollTo({ top: 0, behavior: 'instant' });

    const leftPanel = document.querySelector('.workspace-left-panel');
    if (leftPanel) {
      leftPanel.scrollTop = 0;
    }

    try {
      const question = await API.getQuestion(slugOrId);
      state.selectedQuestion = question;
      renderQuestionWorkspace(question);
    } catch (err) {
      showToast('Failed to load question details: ' + err.message, 'error');
      navigateTo('explore');
    }
  }

  function renderQuestionWorkspace(q) {
    // 1. Header Information
    document.getElementById('ws-question-title').textContent = q.title;
    const diffBadge = document.getElementById('ws-question-difficulty');
    if (diffBadge) {
      diffBadge.className = `badge badge-${q.difficulty.toLowerCase()}`;
      diffBadge.textContent = q.difficulty;
    }
    const catBadge = document.getElementById('ws-question-category');
    if (catBadge) {
      catBadge.textContent = q.categoryName;
    }

    // Status & Bookmark dropdown/buttons
    const statusSelect = document.getElementById('select-question-status');
    if (statusSelect) {
      statusSelect.value = q.userStatus || 'NOT_STARTED';
    }
    updateBookmarkBtnState(q.isBookmarked);

    // 2. Tab 1: Problem Description
    document.getElementById('ws-problem-statement').textContent = q.problemStatement;
    document.getElementById('ws-constraints-text').textContent = q.constraints || 'Standard competitive programming memory and time constraints apply.';

    // Examples
    const examplesContainer = document.getElementById('ws-examples-container');
    if (examplesContainer) {
      examplesContainer.innerHTML = '';
      let examples = [];
      try {
        examples = JSON.parse(q.examplesJson || '[]');
      } catch (e) {
        examples = [];
      }

      examples.forEach((ex, i) => {
        const box = document.createElement('div');
        box.className = 'example-box';
        box.innerHTML = `
          <div class="example-title">Example ${i + 1}</div>
          <div class="example-content">
            <div><strong style="color:var(--text-primary)">Input:</strong> ${ex.input}</div>
            <div><strong style="color:var(--text-primary)">Output:</strong> ${ex.output}</div>
            ${ex.explanation ? `<div style="margin-top:0.4rem; color:var(--text-muted)"><strong>Explanation:</strong> ${ex.explanation}</div>` : ''}
          </div>
        `;
        examplesContainer.appendChild(box);
      });
    }

    // 3. Tab 2: Approaches & Complexities
    document.getElementById('ws-brute-approach').textContent = q.bruteForceApproach || 'Iterate through all combinations.';
    document.getElementById('ws-brute-time').textContent = q.bruteForceTime || 'O(n^2)';
    document.getElementById('ws-brute-space').textContent = q.bruteForceSpace || 'O(1)';

    document.getElementById('ws-optimized-approach').textContent = q.optimizedApproach || 'Optimal linear pass.';
    document.getElementById('ws-optimized-time').textContent = q.optimizedTime || 'O(n)';
    document.getElementById('ws-optimized-space').textContent = q.optimizedSpace || 'O(1)';

    // 4. Tab 3: Java Solution Code
    renderJavaCode(q.optimizedCode || '// No Java code available');

    // 5. Tab 4: Interactive Quiz for this Question
    loadQuestionQuiz(q.id);

    // 6. Tab 5: Notes
    const notesEl = document.getElementById('user-question-notes');
    if (notesEl) {
      notesEl.value = q.userNotes || '';
    }

    // 7. Initialize Studio Canvas & Steps
    let steps = [];
    try {
      steps = JSON.parse(q.visualizationStepsJson || '[]');
    } catch (e) {
      steps = [];
    }

    // Setup Custom input placeholders based on question's default input
    try {
      const defInput = JSON.parse(q.defaultInputJson || '{}');
      const inputArrEl = document.getElementById('custom-input-array');
      const inputTgtEl = document.getElementById('custom-input-target');
      if (inputArrEl && defInput.array) {
        inputArrEl.value = Array.isArray(defInput.array) ? defInput.array.join(', ') : defInput.array;
      }
      if (inputTgtEl && defInput.target !== undefined) {
        inputTgtEl.value = defInput.target;
      }
    } catch (e) {
      console.warn('Could not parse defaultInputJson', e);
    }

    // Load into visualizer engine
    state.visualizer.load(steps, q.visualizerType);

    // Synchronize URL hash
    window.location.hash = `/question/${q.slug}`;

    // Auto-start animation after brief moment for immediate visual engagement
    setTimeout(() => {
      if (state.visualizer && !state.visualizer.isPlaying && state.visualizer.steps.length > 0) {
        state.visualizer.play();
      }
    }, 450);
  }

  function renderJavaCode(rawCode) {
    const wrapper = document.getElementById('code-lines-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '';
    const lines = rawCode.split('\n');

    lines.forEach((lineText, index) => {
      const lineNum = index + 1;
      const lineDiv = document.createElement('div');
      lineDiv.className = 'code-line';
      lineDiv.setAttribute('data-line', lineNum);

      const numSpan = document.createElement('span');
      numSpan.className = 'code-line-num';
      numSpan.textContent = lineNum;

      const textSpan = document.createElement('span');
      textSpan.className = 'code-line-text';
      textSpan.innerHTML = highlightJavaSyntax(lineText);

      lineDiv.appendChild(numSpan);
      lineDiv.appendChild(textSpan);
      wrapper.appendChild(lineDiv);
    });
  }

  function highlightJavaSyntax(code) {
    if (!code) return '';
    // Protect string literals and comments first using tokens to prevent HTML attribute collision
    const stringPool = [];
    let processed = code.replace(/(".*?"|'.*?')/g, (match) => {
      const token = `___STR_${stringPool.length}___`;
      stringPool.push(`<span class="token-string">${escapeHtml(match)}</span>`);
      return token;
    });

    const commentPool = [];
    processed = processed.replace(/(\/\/.+$)/g, (match) => {
      const token = `___CMT_${commentPool.length}___`;
      commentPool.push(`<span class="token-comment">${escapeHtml(match)}</span>`);
      return token;
    });

    // Escape raw HTML characters
    processed = escapeHtml(processed);

    // Highlight keywords
    processed = processed.replace(/\b(public|private|protected|class|interface|static|final|return|void|int|boolean|char|double|float|long|new|if|else|while|for|break|continue|try|catch|throw)\b/g, '<span class="token-keyword">$1</span>');

    // Highlight types
    processed = processed.replace(/\b(String|List|ArrayList|Map|HashMap|Set|HashSet|Stack|Queue|Deque|ArrayDeque|TreeNode|ListNode|Arrays|Math|System)\b/g, '<span class="token-type">$1</span>');

    // Highlight numbers
    processed = processed.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');

    // Restore comments and strings
    commentPool.forEach((html, i) => {
      processed = processed.replace(`___CMT_${i}___`, html);
    });
    stringPool.forEach((html, i) => {
      processed = processed.replace(`___STR_${i}___`, html);
    });

    return processed;
  }

  function updateBookmarkBtnState(isBookmarked) {
    const btn = document.getElementById('btn-workspace-bookmark');
    if (!btn) return;
    if (isBookmarked) {
      btn.innerHTML = '★ Bookmarked';
      btn.classList.add('bookmarked');
      btn.style.color = 'var(--accent-amber)';
    } else {
      btn.innerHTML = '☆ Bookmark';
      btn.classList.remove('bookmarked');
      btn.style.color = 'var(--text-secondary)';
    }
  }

  async function loadQuestionQuiz(questionId) {
    const quizPane = document.getElementById('tab-quiz');
    if (!quizPane) return;

    quizPane.innerHTML = '<div style="color:var(--text-muted); padding:2rem; text-align:center">Loading algorithmic quiz...</div>';

    try {
      const quiz = await API.getQuizByQuestion(questionId);
      state.activeQuiz = quiz;
      state.quizUserAnswers = {};
      renderInlineQuiz(quiz, quizPane);
    } catch (err) {
      quizPane.innerHTML = `
        <div style="text-align:center; padding: 2.5rem 1rem; color: var(--text-muted)">
          <div style="font-size:2rem; margin-bottom: 0.5rem">📝</div>
          <p>No dedicated quiz available for this question yet. Check the global <a href="#/quizzes" style="color:var(--accent-cyan)">Quizzes Hub</a>!</p>
        </div>
      `;
    }
  }

  function renderInlineQuiz(quiz, container) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem">
        <h3 style="font-size: 1.25rem; margin-bottom: 0.4rem">${quiz.title}</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem">${quiz.description || ''}</p>
      </div>
      <div id="inline-quiz-questions-list"></div>
      <div style="margin-top: 1.5rem">
        <button class="btn btn-primary" id="btn-submit-inline-quiz">Submit Answers &#10003;</button>
      </div>
      <div id="inline-quiz-result-area" style="margin-top: 1.5rem"></div>
    `;

    const qList = document.getElementById('inline-quiz-questions-list');
    quiz.questions.forEach((qq, idx) => {
      const qCard = document.createElement('div');
      qCard.className = 'example-box';
      qCard.style.marginBottom = '1.25rem';
      qCard.innerHTML = `
        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem">
          ${idx + 1}. ${qq.questionText}
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem">
          ${renderQuizOption(qq.id, 'A', qq.optionA)}
          ${renderQuizOption(qq.id, 'B', qq.optionB)}
          ${renderQuizOption(qq.id, 'C', qq.optionC)}
          ${renderQuizOption(qq.id, 'D', qq.optionD)}
        </div>
      `;

      qCard.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          state.quizUserAnswers[qq.id] = e.target.value;
        });
      });

      qList.appendChild(qCard);
    });

    document.getElementById('btn-submit-inline-quiz')?.addEventListener('click', async () => {
      if (!state.user) {
        openAuthModal('login');
        return;
      }

      try {
        const result = await API.submitQuiz(quiz.id, state.quizUserAnswers);
        renderQuizResult(result, document.getElementById('inline-quiz-result-area'));
        showToast(`Quiz completed! Score: ${result.score}/${result.totalQuestions}`, 'success');
      } catch (err) {
        showToast('Quiz submission error: ' + err.message, 'error');
      }
    });
  }

  function renderQuizOption(questionId, letter, text) {
    if (!text) return '';
    return `
      <label style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; background: var(--bg-surface); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.88rem; transition: background 0.15s">
        <input type="radio" name="quiz_q_${questionId}" value="${letter}" style="accent-color: var(--accent-cyan)">
        <span><strong>${letter}.</strong> ${text}</span>
      </label>
    `;
  }

  function renderQuizResult(result, container) {
    if (!container) return;
    const isPassed = result.percentage >= 50;

    container.innerHTML = `
      <div style="background: ${isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; border: 1px solid ${isPassed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}; border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1rem">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem">
          <h4 style="color: ${isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-size: 1.15rem">
            ${isPassed ? '🎉 Quiz Completed!' : 'Keep Learning!'}
          </h4>
          <span style="font-family: var(--font-mono); font-weight: 700; font-size: 1.1rem">
            ${result.score} / ${result.totalQuestions} (${result.percentage}%)
          </span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem">${result.feedback}</p>
        <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem">Detailed Explanation Review:</div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem">
          ${result.questions.map((q, idx) => `
            <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem">
              <div style="font-weight: 600; margin-bottom: 0.3rem">
                ${idx + 1}. ${q.questionText}
                <span style="float: right; color: ${q.correct ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">
                  ${q.correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              <div style="color: var(--text-muted); font-size: 0.8rem">
                Correct answer: <strong style="color: var(--accent-cyan)">${q.correctOption}</strong> | Selected: <strong>${q.selectedOption || 'None'}</strong>
              </div>
              <div style="margin-top: 0.35rem; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 0.35rem">
                ${q.explanation}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     STUDENT LEARNING DASHBOARD
     ========================================================================== */

  async function loadDashboard() {
    if (!state.user) {
      openAuthModal('login');
      return;
    }

    try {
      const stats = await API.getUserStats();
      const bookmarks = await API.getBookmarks();

      // Top Stats
      document.getElementById('dash-total-solved').textContent = stats.totalSolved || 0;
      document.getElementById('dash-total-questions').textContent = stats.totalQuestions || 0;
      document.getElementById('dash-pct-bar').style.width = `${stats.overallPercentage || 0}%`;
      document.getElementById('dash-pct-text').textContent = `${stats.overallPercentage || 0}% Completed`;

      // Difficulties
      document.getElementById('dash-easy-solved').textContent = `${stats.easySolved} / ${stats.easyTotal}`;
      document.getElementById('dash-easy-bar').style.width = stats.easyTotal ? `${(stats.easySolved / stats.easyTotal) * 100}%` : '0%';

      document.getElementById('dash-medium-solved').textContent = `${stats.mediumSolved} / ${stats.mediumTotal}`;
      document.getElementById('dash-medium-bar').style.width = stats.mediumTotal ? `${(stats.mediumSolved / stats.mediumTotal) * 100}%` : '0%';

      document.getElementById('dash-hard-solved').textContent = `${stats.hardSolved} / ${stats.hardTotal}`;
      document.getElementById('dash-hard-bar').style.width = stats.hardTotal ? `${(stats.hardSolved / stats.hardTotal) * 100}%` : '0%';

      // Categories Breakdown
      const catContainer = document.getElementById('dash-categories-list');
      if (catContainer) {
        catContainer.innerHTML = '';
        (stats.categoryProgress || []).forEach(cp => {
          const row = document.createElement('div');
          row.style.marginBottom = '0.85rem';
          row.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.3rem">
              <span><strong>${cp.categoryName}</strong></span>
              <span style="font-family: var(--font-mono); color: var(--text-muted)">${cp.solvedCount} / ${cp.totalCount} (${cp.completionPercentage}%)</span>
            </div>
            <div style="height: 6px; background: var(--bg-surface); border-radius: var(--radius-full); overflow: hidden">
              <div style="height: 100%; width: ${cp.completionPercentage}%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo)); border-radius: var(--radius-full)"></div>
            </div>
          `;
          catContainer.appendChild(row);
        });
      }

      // Bookmarks Table
      const bGrid = document.getElementById('dash-bookmarks-list');
      if (bGrid) {
        bGrid.innerHTML = '';
        if (bookmarks.length === 0) {
          bGrid.innerHTML = '<div style="color:var(--text-muted); padding:1rem">No bookmarked questions yet. Star any problem to save it here!</div>';
        } else {
          bookmarks.forEach(bq => {
            const item = document.createElement('div');
            item.className = 'example-box';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';
            item.innerHTML = `
              <div>
                <span class="badge badge-${bq.difficulty.toLowerCase()}" style="margin-right: 0.5rem">${bq.difficulty}</span>
                <strong style="color: var(--text-primary)">${bq.title}</strong>
                <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem">(${bq.categoryName})</span>
              </div>
              <button class="btn btn-outline btn-sm btn-open-bm" data-slug="${bq.slug}">Open Visualizer &#10140;</button>
            `;
            item.querySelector('.btn-open-bm').addEventListener('click', () => {
              openQuestionWorkspace(bq.slug);
            });
            bGrid.appendChild(item);
          });
        }
      }
    } catch (err) {
      showToast('Failed to load dashboard: ' + err.message, 'error');
    }
  }

  /* ==========================================================================
     ADMIN MANAGEMENT PORTAL
     ========================================================================== */

  async function loadAdminPortal() {
    if (!state.user || state.user.role !== 'ROLE_ADMIN') {
      showToast('Admin privileges required', 'error');
      navigateTo('explore');
      return;
    }

    try {
      const stats = await API.getAdminStats();
      document.getElementById('admin-stat-questions').textContent = stats.totalQuestions || 0;
      document.getElementById('admin-stat-users').textContent = stats.totalUsers || 0;
      document.getElementById('admin-stat-categories').textContent = stats.totalCategories || 0;
      document.getElementById('admin-stat-quizzes').textContent = stats.totalQuizAttempts || 0;

      renderAdminTable();
    } catch (err) {
      showToast('Failed to load admin stats: ' + err.message, 'error');
    }
  }

  function renderAdminTable() {
    const tbody = document.getElementById('admin-questions-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    state.questions.forEach(q => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-subtle)';
      tr.innerHTML = `
        <td style="padding: 0.85rem 1rem; font-family: var(--font-mono); font-size: 0.82rem">${q.id}</td>
        <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-primary)">${q.title}</td>
        <td style="padding: 0.85rem 1rem"><span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
        <td style="padding: 0.85rem 1rem">${q.categoryName || 'DSA'}</td>
        <td style="padding: 0.85rem 1rem; font-family: var(--font-mono); font-size: 0.8rem">${q.visualizerType}</td>
        <td style="padding: 0.85rem 1rem; text-align: right">
          <button class="btn btn-outline btn-sm btn-admin-edit" data-id="${q.id}" style="margin-right:0.4rem">Edit</button>
          <button class="btn btn-danger btn-sm btn-admin-delete" data-id="${q.id}">Delete</button>
        </td>
      `;

      tr.querySelector('.btn-admin-edit').addEventListener('click', () => openEditQuestionModal(q.id));
      tr.querySelector('.btn-admin-delete').addEventListener('click', () => confirmDeleteQuestion(q.id, q.title));

      tbody.appendChild(tr);
    });
  }

  function setupAdminHandlers() {
    // Add Question Buttons (Accessible in Navbar & Hero)
    document.getElementById('btn-admin-new-question')?.addEventListener('click', () => openQuestionModal('create'));
    document.getElementById('btn-nav-add-question')?.addEventListener('click', () => openQuestionModal('create'));
    document.getElementById('btn-hero-add-question')?.addEventListener('click', () => openQuestionModal('create'));

    // Instant Featured Demos
    document.getElementById('btn-hero-launch-first')?.addEventListener('click', () => {
      openQuestionWorkspace('two-sum-sorted');
    });

    document.getElementById('nav-live-studio')?.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = state.selectedQuestion ? state.selectedQuestion.slug : 'two-sum-sorted';
      openQuestionWorkspace(slug);
    });

    document.querySelectorAll('.featured-demo-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.getAttribute('data-slug');
        if (slug) openQuestionWorkspace(slug);
      });
    });

    // Title to slug live binding
    document.getElementById('admin-form-title')?.addEventListener('input', (e) => {
      const slugInput = document.getElementById('admin-form-slug');
      const isEdit = document.getElementById('admin-form-question-id').value;
      if (slugInput && !isEdit) {
        slugInput.value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    });

    // Auto-update form template when visualizer type changes
    document.getElementById('admin-form-vis-type')?.addEventListener('change', (e) => {
      const isCreate = !document.getElementById('admin-form-question-id').value;
      if (isCreate) {
        const visType = e.target.value;
        const tpl = VisualizerEngine.getTemplateForType(visType);
        if (tpl) {
          const titleInput = document.getElementById('admin-form-title');
          if (titleInput && (!titleInput.value || titleInput.value.includes('Two Sum') || titleInput.value.includes('Binary Search') || titleInput.value.includes('Bubble Sort'))) {
            titleInput.value = tpl.title;
            const slugInput = document.getElementById('admin-form-slug');
            if (slugInput) slugInput.value = tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          }
          document.getElementById('admin-form-difficulty').value = tpl.difficulty;
          document.getElementById('admin-form-statement').value = tpl.statement;
          document.getElementById('admin-form-constraints').value = tpl.constraints;
          document.getElementById('admin-form-examples').value = tpl.examples;
          document.getElementById('admin-form-def-input').value = tpl.defaultInput;
          document.getElementById('admin-form-brute-app').value = tpl.bruteApproach;
          document.getElementById('admin-form-brute-code').value = tpl.bruteCode;
          document.getElementById('admin-form-brute-time').value = tpl.bruteTime;
          document.getElementById('admin-form-brute-space').value = tpl.bruteSpace;
          document.getElementById('admin-form-opt-app').value = tpl.optApproach;
          document.getElementById('admin-form-opt-code').value = tpl.optCode;
          document.getElementById('admin-form-opt-time').value = tpl.optTime;
          document.getElementById('admin-form-opt-space').value = tpl.optSpace;

          let parsedInput = {};
          try { parsedInput = JSON.parse(tpl.defaultInput); } catch (err) {}
          const steps = VisualizerEngine.generateCustomSteps(visType, parsedInput);
          document.getElementById('admin-form-vis-steps').value = JSON.stringify(steps, null, 2);
          showToast(`Loaded ${visType.replace(/_/g, ' ')} template with animated steps!`, 'info');
        }
      }
    });

    // Auto-Generate Steps Helper inside Modal
    document.getElementById('btn-auto-gen-modal-steps')?.addEventListener('click', () => {
      const visType = document.getElementById('admin-form-vis-type').value;
      const defInputRaw = document.getElementById('admin-form-def-input').value.trim();

      let parsedInput = { array: [2, 7, 11, 15], target: 9 };
      try {
        if (defInputRaw) parsedInput = JSON.parse(defInputRaw);
      } catch (e) {
        showToast('Using default dataset for generation', 'info');
      }

      const steps = VisualizerEngine.generateCustomSteps(visType, parsedInput);

      if (steps.length > 0) {
        document.getElementById('admin-form-vis-steps').value = JSON.stringify(steps, null, 2);
        showToast(`Generated ${steps.length} animated steps with logic flowchart nodes!`, 'success');
      } else {
        showToast('Please check default input format.', 'warning');
      }
    });

    // Form Submit (Creates or Updates question and immediately launches visualizer)
    document.getElementById('form-admin-question')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-form-question-id').value;

      let title = document.getElementById('admin-form-title').value.trim();
      let slug = document.getElementById('admin-form-slug').value.trim();
      if (!slug) {
        slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('question-' + Date.now().toString().slice(-4));
      }

      let stepsJson = document.getElementById('admin-form-vis-steps').value.trim();
      const visType = document.getElementById('admin-form-vis-type').value;

      // Auto-generate steps if empty
      if (!stepsJson || stepsJson === '[]') {
        const defInputRaw = document.getElementById('admin-form-def-input').value.trim();
        let parsedInput = {};
        try {
          if (defInputRaw) parsedInput = JSON.parse(defInputRaw);
        } catch (err) {}
        const steps = VisualizerEngine.generateCustomSteps(visType, parsedInput);
        stepsJson = JSON.stringify(steps);
      }

      const payload = {
        title: title,
        slug: slug,
        categoryId: parseInt(document.getElementById('admin-form-category').value, 10),
        difficulty: document.getElementById('admin-form-difficulty').value,
        problemStatement: document.getElementById('admin-form-statement').value.trim(),
        constraints: document.getElementById('admin-form-constraints').value.trim(),
        examplesJson: document.getElementById('admin-form-examples').value.trim(),
        bruteForceApproach: document.getElementById('admin-form-brute-app').value.trim(),
        bruteForceCode: document.getElementById('admin-form-brute-code').value.trim(),
        bruteForceTime: document.getElementById('admin-form-brute-time').value.trim(),
        bruteForceSpace: document.getElementById('admin-form-brute-space').value.trim(),
        optimizedApproach: document.getElementById('admin-form-opt-app').value.trim(),
        optimizedCode: document.getElementById('admin-form-opt-code').value.trim(),
        optimizedTime: document.getElementById('admin-form-opt-time').value.trim(),
        optimizedSpace: document.getElementById('admin-form-opt-space').value.trim(),
        visualizerType: visType,
        defaultInputJson: document.getElementById('admin-form-def-input').value.trim(),
        visualizationStepsJson: stepsJson
      };

      try {
        let result;
        if (id) {
          result = await API.updateQuestion(id, payload);
          showToast('Question updated successfully!', 'success');
        } else {
          result = await API.createQuestion(payload);
          showToast('Question created with live animation!', 'success');
        }
        closeModal('modal-admin-question');
        await loadQuestions();

        // Immediately open the newly created / updated question in the live visualizer!
        if (result && result.slug) {
          openQuestionWorkspace(result.slug);
        }
      } catch (err) {
        showToast('Error saving question: ' + err.message, 'error');
      }
    });
  }

  async function openEditQuestionModal(questionId) {
    try {
      const q = await API.getQuestion(questionId);
      openQuestionModal('edit', q);
    } catch (err) {
      showToast('Failed to load question details: ' + err.message, 'error');
    }
  }

  function openQuestionModal(mode = 'create', q = null) {
    const modal = document.getElementById('modal-admin-question');
    const titleEl = document.getElementById('admin-modal-title');
    if (!modal) return;

    titleEl.textContent = mode === 'create' ? 'Add New DSA Question' : `Edit Question #${q?.id}`;
    document.getElementById('admin-form-question-id').value = q ? q.id : '';

    // Populate category dropdown
    const catSelect = document.getElementById('admin-form-category');
    if (catSelect) {
      catSelect.innerHTML = '';
      state.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        catSelect.appendChild(opt);
      });
      if (q && q.categoryId) catSelect.value = q.categoryId;
    }

    if (mode === 'create') {
      const initialType = 'ARRAY_TWO_POINTER';
      const tpl = VisualizerEngine.getTemplateForType(initialType);

      document.getElementById('admin-form-title').value = '';
      document.getElementById('admin-form-slug').value = '';
      document.getElementById('admin-form-difficulty').value = tpl.difficulty;
      document.getElementById('admin-form-statement').value = tpl.statement;
      document.getElementById('admin-form-constraints').value = tpl.constraints;
      document.getElementById('admin-form-examples').value = tpl.examples;
      document.getElementById('admin-form-brute-app').value = tpl.bruteApproach;
      document.getElementById('admin-form-brute-code').value = tpl.bruteCode;
      document.getElementById('admin-form-brute-time').value = tpl.bruteTime;
      document.getElementById('admin-form-brute-space').value = tpl.bruteSpace;
      document.getElementById('admin-form-opt-app').value = tpl.optApproach;
      document.getElementById('admin-form-opt-code').value = tpl.optCode;
      document.getElementById('admin-form-opt-time').value = tpl.optTime;
      document.getElementById('admin-form-opt-space').value = tpl.optSpace;
      document.getElementById('admin-form-vis-type').value = initialType;
      document.getElementById('admin-form-def-input').value = tpl.defaultInput;

      // Immediately pre-generate animated steps with flowchart nodes!
      const initialSteps = VisualizerEngine.generateCustomSteps(initialType, JSON.parse(tpl.defaultInput));
      document.getElementById('admin-form-vis-steps').value = JSON.stringify(initialSteps, null, 2);
    } else {
      document.getElementById('admin-form-title').value = q ? q.title : '';
      document.getElementById('admin-form-slug').value = q ? q.slug : '';
      document.getElementById('admin-form-difficulty').value = q ? q.difficulty : 'EASY';
      document.getElementById('admin-form-statement').value = q ? q.problemStatement : '';
      document.getElementById('admin-form-constraints').value = q ? q.constraints : '';
      document.getElementById('admin-form-examples').value = q ? q.examplesJson : '[{"input": "nums = [1, 2], target = 3", "output": "[0, 1]"}]';
      document.getElementById('admin-form-brute-app').value = q ? q.bruteForceApproach : '';
      document.getElementById('admin-form-brute-code').value = q ? q.bruteForceCode : '';
      document.getElementById('admin-form-brute-time').value = q ? q.bruteForceTime : 'O(n^2)';
      document.getElementById('admin-form-brute-space').value = q ? q.bruteForceSpace : 'O(1)';
      document.getElementById('admin-form-opt-app').value = q ? q.optimizedApproach : '';
      document.getElementById('admin-form-opt-code').value = q ? q.optimizedCode : '';
      document.getElementById('admin-form-opt-time').value = q ? q.optimizedTime : 'O(n)';
      document.getElementById('admin-form-opt-space').value = q ? q.optimizedSpace : 'O(1)';
      document.getElementById('admin-form-vis-type').value = q ? q.visualizerType : 'ARRAY_TWO_POINTER';
      document.getElementById('admin-form-def-input').value = q ? q.defaultInputJson : '{"array": [1, 2, 3]}';
      document.getElementById('admin-form-vis-steps').value = q ? q.visualizationStepsJson : '[]';
    }

    openModal('modal-admin-question');
  }

  async function confirmDeleteQuestion(id, title) {
    if (confirm(`Are you sure you want to delete question "${title}" (ID: ${id})? This action cannot be undone.`)) {
      try {
        await API.deleteQuestion(id);
        showToast('Question deleted successfully.', 'success');
        await loadQuestions();
        loadAdminPortal();
      } catch (err) {
        showToast('Failed to delete question: ' + err.message, 'error');
      }
    }
  }

  /* ==========================================================================
     QUIZZES HUB VIEW
     ========================================================================== */

  async function loadQuizzesHub() {
    const listContainer = document.getElementById('quizzes-hub-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="color:var(--text-muted); padding:3rem; text-align:center">Loading algorithmic quizzes...</div>';

    try {
      const quizzes = await API.getQuizzes();
      if (quizzes.length === 0) {
        listContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:3rem">No quizzes available right now.</div>';
        return;
      }

      listContainer.innerHTML = '';
      quizzes.forEach(quiz => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
          <div>
            <div class="card-top">
              <span class="badge badge-category">${quiz.categoryName || 'General DSA'}</span>
              <span class="badge badge-type">${quiz.totalQuestions} Questions</span>
            </div>
            <h3 class="question-title">${quiz.title}</h3>
            <p class="question-snippet">${quiz.description || 'Test and solidify your understanding of algorithm mechanics and edge cases.'}</p>
          </div>
          <div class="card-bottom" style="margin-top: 1rem">
            <span style="font-size:0.8rem; color:var(--text-muted)">Mastery Level: Conceptual</span>
            <button class="btn btn-primary btn-sm btn-take-quiz" data-id="${quiz.id}">
              Take Quiz &#10140;
            </button>
          </div>
        `;

        card.querySelector('.btn-take-quiz').addEventListener('click', () => {
          if (!state.user) {
            openAuthModal('login');
            return;
          }
          openStandaloneQuizModal(quiz.id);
        });

        listContainer.appendChild(card);
      });
    } catch (err) {
      listContainer.innerHTML = `<div style="color:var(--accent-rose); text-align:center; padding:2rem">Failed to load quizzes: ${err.message}</div>`;
    }
  }

  async function openStandaloneQuizModal(quizId) {
    try {
      const quiz = await API.getQuiz(quizId);
      state.activeQuiz = quiz;
      state.quizUserAnswers = {};

      const modal = document.getElementById('modal-quiz-runner');
      const body = document.getElementById('modal-quiz-runner-body');
      renderInlineQuiz(quiz, body);
      openModal('modal-quiz-runner');
    } catch (err) {
      showToast('Error opening quiz: ' + err.message, 'error');
    }
  }

  /* ==========================================================================
     AUTHENTICATION MODAL & LOGIC
     ========================================================================== */

  function setupAuthHandlers() {
    // Tab switching in Auth modal
    document.getElementById('tab-btn-login')?.addEventListener('click', () => setAuthModalTab('login'));
    document.getElementById('tab-btn-register')?.addEventListener('click', () => setAuthModalTab('register'));

    // Quick Fill demo logins
    document.getElementById('btn-quick-admin')?.addEventListener('click', () => {
      document.getElementById('auth-login-username').value = 'admin';
      document.getElementById('auth-login-password').value = 'Admin@123';
    });

    document.getElementById('btn-quick-student')?.addEventListener('click', () => {
      document.getElementById('auth-login-username').value = 'student';
      document.getElementById('auth-login-password').value = 'Student@123';
    });

    // Login Form Submit
    document.getElementById('form-auth-login')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('auth-login-username').value.trim();
      const p = document.getElementById('auth-login-password').value;

      try {
        await API.login(u, p);
        closeModal('modal-auth');
        showToast(`Welcome back, ${u}!`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Register Form Submit
    document.getElementById('form-auth-register')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('auth-reg-username').value.trim();
      const email = document.getElementById('auth-reg-email').value.trim();
      const p = document.getElementById('auth-reg-password').value;

      try {
        await API.register(u, email, p);
        closeModal('modal-auth');
        showToast(`Account created! Welcome, ${u}!`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  function openAuthModal(mode = 'login') {
    setAuthModalTab(mode);
    openModal('modal-auth');
  }

  function setAuthModalTab(mode) {
    const isLogin = mode === 'login';
    document.getElementById('tab-btn-login')?.classList.toggle('active', isLogin);
    document.getElementById('tab-btn-register')?.classList.toggle('active', !isLogin);
    document.getElementById('form-auth-login').style.display = isLogin ? 'block' : 'none';
    document.getElementById('form-auth-register').style.display = !isLogin ? 'block' : 'none';
  }

  /* ==========================================================================
     ROUTING & VIEW MANAGEMENT
     ========================================================================== */

  function navigateTo(viewName) {
    state.currentView = viewName;

    // Update Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });

    // Toggle views
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.style.display = 'none';
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.style.display = 'block';
      window.scrollTo(0, 0);
    }

    // Trigger on-demand loads
    if (viewName === 'dashboard') {
      loadDashboard();
    } else if (viewName === 'admin') {
      loadAdminPortal();
    } else if (viewName === 'quizzes') {
      loadQuizzesHub();
    }
  }

  // Handle URL hash routing
  // Handle URL hash routing
  function handleRoute() {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('/question/')) {
      const slug = hash.replace('/question/', '');
      openQuestionWorkspace(slug);
    } else if (hash === '/dashboard') {
      navigateTo('dashboard');
    } else if (hash === '/quizzes') {
      navigateTo('quizzes');
    } else if (hash === '/admin') {
      navigateTo('admin');
    } else if (hash === '/workspace') {
      const slug = state.selectedQuestion ? state.selectedQuestion.slug : 'two-sum-sorted';
      openQuestionWorkspace(slug);
    } else if (hash === '/sandbox') {
      navigateTo('sandbox');
    } else {
      navigateTo('explore');
    }
  }

  window.addEventListener('hashchange', handleRoute);

  // Modal Helpers
  window.openModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  };

  window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  };

  // Close modals on backdrop or close button
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.classList.remove('active'));
    });
  });

  // Toast System
  window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Utility formatters
  function formatVisualizerName(visType) {
    if (!visType) return 'Visualizer';
    return visType.replace(/_/g, ' ');
  }

  function formatStatus(status) {
    switch (status) {
      case 'SOLVED': return 'Solved';
      case 'IN_PROGRESS': return 'In Progress';
      default: return 'Not Started';
    }
  }

  function getCategoryIcon(iconName) {
    switch (iconName) {
      case 'grid': return '▦';
      case 'type': return '🔤';
      case 'link': return '☍';
      case 'layers': return '▤';
      case 'inbox': return '📥';
      case 'search': return '🔍';
      case 'bar-chart-2': return '📊';
      case 'git-pull-request': return '🌲';
      case 'share-2': return '🕸';
      case 'refresh-cw': return '🔄';
      case 'zap': return '⚡';
      case 'cpu': return '🧮';
      default: return '✦';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
