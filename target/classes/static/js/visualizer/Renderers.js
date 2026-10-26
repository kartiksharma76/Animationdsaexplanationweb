/**
 * AlgoPulse - Visualizer Renderers
 * Specialised graphical renderers for Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, DP.
 */
const Renderers = (() => {

  /**
   * Render Linear Array with Floating Pointers
   */
  function renderArray(container, stepData) {
    let array = stepData.array;
    if (!array || !Array.isArray(array) || array.length === 0) {
      if (stepData.variables && Array.isArray(stepData.variables.array)) {
        array = stepData.variables.array;
      } else {
        array = [];
      }
    }
    const pointers = stepData.pointers || {};
    const activeIndices = stepData.activeIndices || [];
    const status = stepData.status || 'info';

    container.innerHTML = '';
    if (array.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem; padding: 2rem; text-align: center;">[ Array Data Structure Ready ]</div>';
      return;
    }

    const arrayWrapper = document.createElement('div');
    arrayWrapper.className = 'array-container';
    if (array.length > 6) {
      arrayWrapper.classList.add('compact-array');
    }

    // Map which pointers exist at each index
    const pointerMap = {};
    for (const [name, idx] of Object.entries(pointers)) {
      if (idx !== null && idx !== undefined && idx >= 0 && idx < array.length) {
        if (!pointerMap[idx]) pointerMap[idx] = [];
        pointerMap[idx].push(name);
      }
    }

    array.forEach((val, idx) => {
      const cellWrapper = document.createElement('div');
      cellWrapper.className = 'array-cell-wrapper';

      // Pointers above cell
      if (pointerMap[idx] && pointerMap[idx].length > 0) {
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'pointer-badge-container';

        pointerMap[idx].forEach(ptrName => {
          const lbl = document.createElement('div');
          lbl.className = `pointer-label pointer-${ptrName.toLowerCase()}`;
          lbl.textContent = ptrName;
          badgeContainer.appendChild(lbl);
        });

        const arrow = document.createElement('div');
        arrow.className = 'pointer-arrow';
        const primaryPtr = pointerMap[idx][0].toLowerCase();
        arrow.style.borderTopColor = getPointerColor(primaryPtr);
        badgeContainer.appendChild(arrow);

        cellWrapper.appendChild(badgeContainer);
      }

      // Array box
      const box = document.createElement('div');
      box.className = 'array-box';
      box.textContent = val;

      if (activeIndices.includes(idx)) {
        box.classList.add('active');
        if (status === 'warning') box.classList.add('swapping');
        if (status === 'success') box.classList.add('sorted');
      }

      // Shading eliminated binary search regions
      if (pointers.low !== undefined && pointers.high !== undefined) {
        if (idx < pointers.low || idx > pointers.high) {
          box.classList.add('eliminated');
        }
      }

      cellWrapper.appendChild(box);

      // Index label below
      const indexLbl = document.createElement('div');
      indexLbl.className = 'array-index';
      indexLbl.textContent = idx;
      cellWrapper.appendChild(indexLbl);

      arrayWrapper.appendChild(cellWrapper);
    });

    container.appendChild(arrayWrapper);

    // Auto-scroll stage-canvas horizontally so active cell/pointer is never clipped
    setTimeout(() => {
      const activeBox = container.querySelector('.array-cell-wrapper .array-box.active');
      const activePtr = container.querySelector('.array-cell-wrapper .pointer-badge-container');
      const targetWrapper = (activeBox || activePtr)?.closest('.array-cell-wrapper');
      if (targetWrapper && container) {
        const offsetLeft = targetWrapper.offsetLeft;
        const targetScroll = offsetLeft - (container.clientWidth / 2) + (targetWrapper.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    }, 40);
  }

  /**
   * Render Linked List Nodes with Arrow Links
   */
  function renderLinkedList(container, stepData) {
    const array = stepData.array || [];
    const pointers = stepData.pointers || {};
    const activeIndices = stepData.activeIndices || [];

    container.innerHTML = '';
    const llCanvas = document.createElement('div');
    llCanvas.className = 'linked-list-canvas';

    array.forEach((val, idx) => {
      const nodeCard = document.createElement('div');
      nodeCard.className = 'll-node-card';
      if (activeIndices.includes(idx)) {
        nodeCard.style.borderColor = 'var(--accent-cyan)';
        nodeCard.style.boxShadow = '0 0 15px var(--accent-cyan-glow)';
      }

      const valPart = document.createElement('div');
      valPart.className = 'll-node-val';
      valPart.textContent = val;

      const ptrPart = document.createElement('div');
      ptrPart.className = 'll-node-ptr';
      ptrPart.textContent = (idx < array.length - 1) ? 'next' : 'null';

      nodeCard.appendChild(valPart);
      nodeCard.appendChild(ptrPart);

      // Node pointers badge (prev, curr, next)
      const activePtrs = [];
      for (const [pName, pVal] of Object.entries(pointers)) {
        if (pVal === val || pVal === idx) activePtrs.push(pName);
      }

      if (activePtrs.length > 0) {
        const badge = document.createElement('div');
        badge.className = 'pointer-badge-container';
        activePtrs.forEach(p => {
          const l = document.createElement('div');
          l.className = `pointer-label pointer-${p.toLowerCase()}`;
          l.textContent = p;
          badge.appendChild(l);
        });
        nodeCard.appendChild(badge);
      }

      llCanvas.appendChild(nodeCard);

      if (idx < array.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'll-arrow';
        arrow.innerHTML = '&#10140;';
        llCanvas.appendChild(arrow);
      }
    });

    container.appendChild(llCanvas);

    // Auto-scroll stage-canvas horizontally so active node is centered
    setTimeout(() => {
      const activeNode = container.querySelector('.ll-node-card[style*="rgb(6, 182, 212)"], .ll-node-card:has(.pointer-badge-container)');
      if (activeNode && container) {
        const offsetLeft = activeNode.offsetLeft;
        const targetScroll = offsetLeft - (container.clientWidth / 2) + (activeNode.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    }, 40);
  }

  /**
   * Render Vertical Stack
   */
  function renderStack(container, stepData) {
    const variables = stepData.variables || {};
    const stackItems = variables.stack || [];

    container.innerHTML = '';
    const stackWrapper = document.createElement('div');
    stackWrapper.style.display = 'flex';
    stackWrapper.style.flexDirection = 'column';
    stackWrapper.style.alignItems = 'center';
    stackWrapper.style.gap = '1.5rem';

    // Top indicator
    const topLabel = document.createElement('div');
    topLabel.style.fontSize = '0.8rem';
    topLabel.style.fontFamily = 'var(--font-mono)';
    topLabel.style.color = 'var(--accent-cyan)';
    topLabel.textContent = `Stack Size: ${stackItems.length} (LIFO)`;
    stackWrapper.appendChild(topLabel);

    const stackCanvas = document.createElement('div');
    stackCanvas.className = 'stack-canvas';

    if (stackItems.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.style.fontSize = '0.85rem';
      emptyMsg.style.padding = '1.5rem';
      emptyMsg.textContent = '[ Empty Stack ]';
      stackCanvas.appendChild(emptyMsg);
    } else {
      stackItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'stack-item';
        div.textContent = typeof item === 'object' ? JSON.stringify(item) : item;
        if (index === stackItems.length - 1) {
          div.style.borderColor = 'var(--accent-cyan)';
          div.style.boxShadow = '0 0 12px var(--accent-cyan-glow)';
        }
        stackCanvas.appendChild(div);
      });
    }

    stackWrapper.appendChild(stackCanvas);
    container.appendChild(stackWrapper);
  }

  /**
   * Render Queue / Deque
   */
  function renderQueue(container, stepData) {
    const variables = stepData.variables || {};
    const queue = variables.queue || variables.deque || [];

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '1rem';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.gap = '1rem';
    header.style.fontSize = '0.8rem';
    header.style.fontFamily = 'var(--font-mono)';
    header.innerHTML = '<span style="color:var(--accent-emerald)">&#10140; Front (Dequeue)</span> | <span style="color:var(--accent-indigo)">Back (Enqueue) &#10140;</span>';
    wrapper.appendChild(header);

    const qBox = document.createElement('div');
    qBox.style.display = 'flex';
    qBox.style.alignItems = 'center';
    qBox.style.gap = '0.5rem';
    qBox.style.padding = '0.75rem 1rem';
    qBox.style.background = 'rgba(15, 23, 42, 0.6)';
    qBox.style.border = '2px dashed var(--accent-cyan)';
    qBox.style.borderRadius = 'var(--radius-md)';
    qBox.style.minWidth = '240px';
    qBox.style.minHeight = '70px';

    if (queue.length === 0) {
      const empty = document.createElement('div');
      empty.style.color = 'var(--text-muted)';
      empty.style.fontSize = '0.85rem';
      empty.style.width = '100%';
      empty.style.textAlign = 'center';
      empty.textContent = '[ Empty Queue ]';
      qBox.appendChild(empty);
    } else {
      queue.forEach(item => {
        const itemBox = document.createElement('div');
        itemBox.className = 'array-box active';
        itemBox.style.width = 'auto';
        itemBox.style.padding = '0 0.85rem';
        itemBox.textContent = item;
        qBox.appendChild(itemBox);
      });
    }

    wrapper.appendChild(qBox);
    container.appendChild(wrapper);
  }

  /**
   * Render Binary Tree via SVG
   */
  function renderTree(container, stepData) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'svg-canvas-wrapper';

    const activeIndices = stepData.activeIndices || [];
    const pointers = stepData.pointers || {};

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 420 240');
    svg.style.cssText = 'width: 100%; max-width: 420px; height: auto; overflow: visible; display: block; margin: 0 auto;';

    // Default 3-level tree nodes layout
    const nodes = [
      { id: 0, val: 4, x: 210, y: 35 },
      { id: 1, val: 2, x: 110, y: 110 },
      { id: 2, val: 6, x: 310, y: 110 },
      { id: 3, val: 1, x: 60, y: 190 },
      { id: 4, val: 3, x: 160, y: 190 },
      { id: 5, val: 5, x: 260, y: 190 },
      { id: 6, val: 7, x: 360, y: 190 }
    ];

    const edges = [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]
    ];

    // Draw Edges
    edges.forEach(([from, to]) => {
      const u = nodes[from];
      const v = nodes[to];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', u.x);
      line.setAttribute('y1', u.y);
      line.setAttribute('x2', v.x);
      line.setAttribute('y2', v.y);
      line.setAttribute('class', 'tree-edge-line');
      svg.appendChild(line);
    });

    // Draw Nodes
    nodes.forEach(n => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', n.x);
      circle.setAttribute('cy', n.y);
      circle.setAttribute('r', '20');
      circle.setAttribute('class', 'tree-node-circle');

      if (activeIndices.includes(n.id) || pointers.curr === n.val || pointers.visited === n.val) {
        circle.setAttribute('class', 'tree-node-circle visited');
        circle.setAttribute('stroke', '#10b981');
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', n.x);
      text.setAttribute('y', n.y);
      text.setAttribute('class', 'tree-node-text');
      text.textContent = n.val;

      g.appendChild(circle);
      g.appendChild(text);
      svg.appendChild(g);
    });

    wrapper.appendChild(svg);
    container.appendChild(wrapper);
  }

  /**
   * Dedicated SVG Graph Visualizer (BFS / DFS Network)
   */
  function renderGraph(container, stepData) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'svg-canvas-wrapper';
    wrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:0.75rem; width:100%;';

    const activeIndices = stepData.activeIndices || [];
    const pointers = stepData.pointers || {};
    const vars = stepData.variables || {};

    // 5 Graph Nodes in a clean layout
    const nodes = [
      { id: 0, label: '0', x: 210, y: 40 },
      { id: 1, label: '1', x: 90,  y: 110 },
      { id: 2, label: '2', x: 330, y: 110 },
      { id: 3, label: '3', x: 130, y: 195 },
      { id: 4, label: '4', x: 290, y: 195 }
    ];

    const edges = [
      [0, 1], [0, 2], [0, 3], [2, 4], [1, 3]
    ];

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 420 240');
    svg.style.cssText = 'width: 100%; max-width: 420px; height: auto; overflow: visible; display: block; margin: 0 auto;';

    // Draw Edges
    edges.forEach(([uIdx, vIdx]) => {
      const u = nodes[uIdx];
      const v = nodes[vIdx];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', u.x);
      line.setAttribute('y1', u.y);
      line.setAttribute('x2', v.x);
      line.setAttribute('y2', v.y);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.18)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '4 2');
      svg.appendChild(line);
    });

    // Draw Nodes
    nodes.forEach(n => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const isCurrent = (pointers.curr === n.id || vars.curr === n.id || activeIndices[0] === n.id);
      const isVisited = (activeIndices.includes(n.id) || (vars.visited && Array.isArray(vars.visited) && vars.visited.includes(n.id)));

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', n.x);
      circle.setAttribute('cy', n.y);
      circle.setAttribute('r', '22');

      if (isCurrent) {
        circle.setAttribute('fill', 'rgba(6, 182, 212, 0.35)');
        circle.setAttribute('stroke', 'var(--accent-cyan)');
        circle.setAttribute('stroke-width', '3');
      } else if (isVisited) {
        circle.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
        circle.setAttribute('stroke', 'var(--accent-emerald)');
        circle.setAttribute('stroke-width', '2.5');
      } else {
        circle.setAttribute('fill', '#1e293b');
        circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
        circle.setAttribute('stroke-width', '1.5');
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', n.x);
      text.setAttribute('y', n.y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-family', 'var(--font-mono)');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-size', '14');
      text.textContent = n.label;

      g.appendChild(circle);
      g.appendChild(text);

      if (isCurrent) {
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badge.setAttribute('x', n.x);
        badge.setAttribute('y', n.y - 28);
        badge.setAttribute('text-anchor', 'middle');
        badge.setAttribute('fill', 'var(--accent-cyan)');
        badge.setAttribute('font-family', 'var(--font-mono)');
        badge.setAttribute('font-size', '11');
        badge.setAttribute('font-weight', '700');
        badge.textContent = '● VISITING';
        g.appendChild(badge);
      }

      svg.appendChild(g);
    });

    wrapper.appendChild(svg);

    // Queue / Visited Strip
    const stateStrip = document.createElement('div');
    stateStrip.style.cssText = 'display:flex; gap:1.2rem; justify-content:center; align-items:center; background:rgba(15,23,42,0.6); padding:6px 14px; border-radius:20px; border:1px solid rgba(255,255,255,0.08); font-family:var(--font-mono); font-size:0.8rem;';
    const queueContent = vars.queue ? (Array.isArray(vars.queue) ? `[ ${vars.queue.join(', ')} ]` : JSON.stringify(vars.queue)) : (pointers.queue || '[ ]');
    const orderContent = vars.order ? (Array.isArray(vars.order) ? `[ ${vars.order.join(', ')} ]` : JSON.stringify(vars.order)) : '[]';
    stateStrip.innerHTML = `<span style="color:var(--accent-cyan);">Queue: <strong style="color:#fff;">${queueContent}</strong></span> <span style="color:var(--accent-emerald);">Order: <strong style="color:#fff;">${orderContent}</strong></span>`;
    wrapper.appendChild(stateStrip);

    container.appendChild(wrapper);
  }

  /**
   * Render Dynamic Programming Grid & State Formula
   */
  function renderDPTable(container, stepData) {
    const array = stepData.array || [];
    const pointers = stepData.pointers || {};
    const activeIndices = stepData.activeIndices || [];
    const vars = stepData.variables || {};

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'dp-stage-wrapper';

    // Header badge
    const header = document.createElement('div');
    header.className = 'dp-header-badge';
    header.innerHTML = `
      <div class="dp-title">📊 1D Dynamic Programming State</div>
      <div class="dp-subtitle">dp[i] = Number of distinct paths to reach step i</div>
    `;
    wrapper.appendChild(header);

    // Formula card if active calculation
    const activeI = pointers.i !== undefined ? pointers.i : (activeIndices.length > 0 ? activeIndices[activeIndices.length - 1] : null);
    const formulaCard = document.createElement('div');
    formulaCard.className = 'dp-formula-card';
    if (vars.calculation) {
      formulaCard.innerHTML = `<span>⚡ Recurrence:</span> <strong>${vars.calculation}</strong>`;
    } else if (activeI !== null && activeI >= 2) {
      formulaCard.innerHTML = `<span>⚡ Recurrence:</span> <strong>dp[${activeI}] = dp[${activeI - 1}] + dp[${activeI - 2}]</strong>`;
    } else {
      formulaCard.innerHTML = `<span>🌱 Base Cases:</span> <strong>dp[0] = 1, dp[1] = 1, dp[2] = 2</strong>`;
    }
    wrapper.appendChild(formulaCard);

    // Table Grid
    const dpContainer = document.createElement('div');
    dpContainer.className = 'dp-table-container';

    // Index labels row
    const indicesRow = document.createElement('div');
    indicesRow.className = 'dp-indices-row';
    array.forEach((_, idx) => {
      const tag = document.createElement('div');
      tag.className = 'dp-index-tag';
      tag.textContent = `i = ${idx}`;
      indicesRow.appendChild(tag);
    });
    dpContainer.appendChild(indicesRow);

    // Values row
    const row = document.createElement('div');
    row.className = 'dp-table-row';

    array.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'dp-cell';
      cell.textContent = val;

      if (idx === activeI) {
        cell.classList.add('active-calc');
      } else if (activeI !== null && (idx === activeI - 1 || idx === activeI - 2)) {
        cell.classList.add('active-prev');
      }

      row.appendChild(cell);
    });

    dpContainer.appendChild(row);
    wrapper.appendChild(dpContainer);
    container.appendChild(wrapper);
  }

  /**
   * Render Container With Most Water (Vertical Pillars + Reservoir)
   */
  function renderContainerWater(container, stepData) {
    const array = stepData.array || [];
    const pointers = stepData.pointers || {};
    const vars = stepData.variables || {};
    const left = pointers.left !== undefined ? pointers.left : (vars.left !== undefined ? vars.left : 0);
    const right = pointers.right !== undefined ? pointers.right : (vars.right !== undefined ? vars.right : array.length - 1);

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'container-water-canvas';

    const maxWaterVal = vars.maxWater !== undefined ? vars.maxWater : (vars.area || 0);
    const currArea = vars.area !== undefined ? vars.area : ((right - left) * Math.min(array[left] || 0, array[right] || 0));
    const widthVal = right - left;

    // Top Stats Strip
    const statsStrip = document.createElement('div');
    statsStrip.className = 'water-stats-badge';
    statsStrip.innerHTML = `
      <span style="color:var(--accent-cyan);">Left: <strong>${left} (h=${array[left] || 0})</strong></span>
      <span style="color:var(--accent-pink);">Right: <strong>${right} (h=${array[right] || 0})</strong></span>
      <span style="color:#93c5fd;">Width: <strong>${widthVal}</strong></span>
      <span style="color:var(--accent-emerald);">Current Area: <strong>${currArea}</strong></span>
      <span style="color:var(--accent-amber);">Max Water: <strong>${maxWaterVal}</strong></span>
    `;
    wrapper.appendChild(statsStrip);

    // Pillars Stage
    const stage = document.createElement('div');
    stage.className = 'water-chart-stage';

    const maxVal = Math.max(...array, 8);
    const scale = 140 / maxVal;

    // Draw pillars
    array.forEach((val, idx) => {
      const col = document.createElement('div');
      col.className = 'water-pillar-wrapper';
      if (idx === left) col.classList.add('active-l');
      if (idx === right) col.classList.add('active-r');

      if (idx === left) {
        const ptrL = document.createElement('div');
        ptrL.className = 'water-pillar-pointer';
        ptrL.style.background = '#3b82f6';
        ptrL.style.color = '#fff';
        ptrL.textContent = 'L';
        col.appendChild(ptrL);
      } else if (idx === right) {
        const ptrR = document.createElement('div');
        ptrR.className = 'water-pillar-pointer';
        ptrR.style.background = '#ec4899';
        ptrR.style.color = '#fff';
        ptrR.textContent = 'R';
        col.appendChild(ptrR);
      }

      const bar = document.createElement('div');
      bar.className = 'water-pillar-bar';
      bar.style.height = `${Math.max(16, val * scale)}px`;
      bar.textContent = val;
      col.appendChild(bar);

      const idxLabel = document.createElement('div');
      idxLabel.className = 'water-pillar-idx';
      idxLabel.textContent = idx;
      col.appendChild(idxLabel);

      stage.appendChild(col);
    });

    wrapper.appendChild(stage);
    container.appendChild(wrapper);
  }

  /**
   * Render Non-overlapping Intervals Timeline
   */
  function renderIntervals(container, stepData) {
    const vars = stepData.variables || {};
    const pointers = stepData.pointers || {};
    const activeIdx = pointers.i !== undefined ? pointers.i : 0;
    const status = stepData.status || 'info';

    // Default intervals array
    let intervals = [
      [1, 2], [2, 3], [1, 3], [3, 4]
    ];
    if (vars.sorted) {
      try {
        intervals = typeof vars.sorted === 'string' ? JSON.parse(vars.sorted.replace(/'/g, '"')) : vars.sorted;
      } catch (e) {
        intervals = [[1, 2], [2, 3], [1, 3], [3, 4]];
      }
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'intervals-canvas';

    // Stats strip
    const statsStrip = document.createElement('div');
    statsStrip.className = 'intervals-stats-strip';
    const removedCount = vars.removed !== undefined ? vars.removed : 0;
    const prevEnd = vars.prevEnd !== undefined ? vars.prevEnd : 2;
    statsStrip.innerHTML = `
      <span style="color:var(--accent-cyan);">prevEnd Line: <strong>${prevEnd}</strong></span>
      <span style="color:var(--accent-amber);">Removed Overlaps: <strong>${removedCount}</strong></span>
    `;
    wrapper.appendChild(statsStrip);

    // Intervals List
    const list = document.createElement('div');
    list.className = 'intervals-list';

    // Timeline spans from 0 to 5
    const timelineMin = 0;
    const timelineMax = 5;
    const timelineRange = timelineMax - timelineMin;

    intervals.forEach(([start, end], idx) => {
      const row = document.createElement('div');
      row.className = 'interval-row';

      const isCurrent = (idx === activeIdx);
      const isOverlap = isCurrent && (vars.overlap === true || status === 'warning');

      if (isCurrent) {
        row.classList.add(isOverlap ? 'active-remove' : 'active-keep');
      }

      // Interval tag
      const tag = document.createElement('div');
      tag.className = 'interval-tag';
      tag.textContent = `[${start}, ${end}]`;
      row.appendChild(tag);

      // Track & Bar
      const track = document.createElement('div');
      track.className = 'interval-track';

      const bar = document.createElement('div');
      bar.className = 'interval-bar';
      const leftPct = ((start - timelineMin) / timelineRange) * 100;
      const widthPct = Math.max(8, ((end - start) / timelineRange) * 100);
      bar.style.left = `${leftPct}%`;
      bar.style.width = `${widthPct}%`;
      bar.textContent = `${start} ➔ ${end}`;
      track.appendChild(bar);
      row.appendChild(track);

      // Status Badge
      const badge = document.createElement('div');
      badge.className = 'interval-status-badge';
      if (isCurrent && isOverlap) {
        badge.style.background = 'rgba(244, 63, 94, 0.2)';
        badge.style.color = '#f43f5e';
        badge.textContent = '❌ Overlap! Removed';
      } else if (isCurrent) {
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#10b981';
        badge.textContent = '✓ Kept (Earliest End)';
      } else if (idx < activeIdx) {
        badge.style.background = 'rgba(255, 255, 255, 0.08)';
        badge.style.color = 'var(--text-muted)';
        badge.textContent = 'Retained';
      } else {
        badge.style.background = 'rgba(255, 255, 255, 0.05)';
        badge.style.color = 'var(--text-muted)';
        badge.textContent = 'Pending';
      }
      row.appendChild(badge);

      list.appendChild(row);
    });

    wrapper.appendChild(list);
    container.appendChild(wrapper);
  }

  /**
   * Render Recursion / Tower of Hanoi Canvas
   */
  function renderRecursion(container, stepData) {
    const vars = stepData.variables || {};
    container.innerHTML = '';

    const hanoiWrapper = document.createElement('div');
    hanoiWrapper.className = 'recursion-canvas-wrapper';
    hanoiWrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:1.2rem; width:100%;';

    // Current Action Indicator
    const actionBadge = document.createElement('div');
    actionBadge.style.cssText = 'font-size:0.85rem; font-family:var(--font-mono); color:var(--accent-cyan); background:rgba(6,182,212,0.12); padding:4px 12px; border-radius:12px; border:1px solid rgba(6,182,212,0.3);';
    actionBadge.textContent = vars.disk ? `Move Disk ${vars.disk}: Peg ${vars.from} ➔ Peg ${vars.to}` : (stepData.explanation || 'Recursive Step');
    hanoiWrapper.appendChild(actionBadge);

    // 3 Rods Display
    const rodsContainer = document.createElement('div');
    rodsContainer.style.cssText = 'display:flex; justify-content:space-around; align-items:flex-end; width:100%; max-width:100%; height:180px; background:rgba(15,23,42,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1.5rem 0.5rem 0; position:relative; box-sizing:border-box;';

    const pegs = ['A', 'B', 'C'];
    pegs.forEach(pegName => {
      const pegCol = document.createElement('div');
      pegCol.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:flex-end; flex:1; max-width:100px; height:100%; position:relative;';

      // Vertical Rod
      const pole = document.createElement('div');
      pole.style.cssText = 'position:absolute; width:6px; height:110px; background:rgba(255,255,255,0.2); border-radius:3px; bottom:24px;';
      pegCol.appendChild(pole);

      // Disks stack on this rod
      const disksStack = document.createElement('div');
      disksStack.style.cssText = 'display:flex; flex-direction:column-reverse; align-items:center; gap:4px; z-index:2; margin-bottom:24px; min-height:40px; width:100%;';

      let diskSizes = [];
      if (vars.to === pegName && vars.disk) {
        diskSizes = [vars.disk];
      } else if (vars.from !== pegName && pegName === 'A' && !vars.disk) {
        diskSizes = [3, 2, 1];
      }

      diskSizes.forEach(size => {
        const disk = document.createElement('div');
        const diskWidth = Math.min(80, 24 + size * 16);
        disk.style.cssText = `width:${diskWidth}px; height:16px; border-radius:8px; background:linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo)); box-shadow:0 0 10px rgba(6,182,212,0.4); display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:#fff; font-family:var(--font-mono);`;
        disk.textContent = size;
        disksStack.appendChild(disk);
      });
      pegCol.appendChild(disksStack);

      // Base label
      const baseLbl = document.createElement('div');
      baseLbl.style.cssText = 'font-weight:700; font-size:0.85rem; color:var(--text-secondary); font-family:var(--font-mono); padding-top:4px;';
      baseLbl.textContent = `Peg ${pegName}`;
      pegCol.appendChild(baseLbl);

      rodsContainer.appendChild(pegCol);
    });

    hanoiWrapper.appendChild(rodsContainer);
    container.appendChild(hanoiWrapper);
  }

  function getPointerColor(ptr) {
    switch (ptr) {
      case 'left': return '#3b82f6';
      case 'right': return '#ec4899';
      case 'mid': return '#8b5cf6';
      case 'i': return '#06b6d4';
      case 'j': return '#f59e0b';
      case 'slow': return '#10b981';
      case 'fast': return '#f43f5e';
      default: return '#06b6d4';
    }
  }

  /**
   * Flowchart Graph Definitions for All Core Algorithm Types
   */
  const FLOWCHART_DEFINITIONS = {
    ARRAY_TWO_POINTER: [
      { id: 'START', title: '1. Init Pointers', code: 'left = 0, right = n - 1', type: 'start' },
      { id: 'CHECK_LOOP', title: '2. Loop Invariant', code: 'while (left < right)', type: 'condition' },
      { id: 'EVAL_SUM', title: '3. Compute Sum', code: 'sum = nums[left] + nums[right]', type: 'process' },
      {
        type: 'branch_group',
        branches: [
          { id: 'BRANCH_FOUND', title: '4a. Match Found', code: 'sum == target\n➔ return [left+1, right+1]', type: 'success' },
          { id: 'BRANCH_LESS', title: '4b. Sum < Target', code: 'sum < target\n➔ left++ (increase sum)', type: 'branch' },
          { id: 'BRANCH_GREATER', title: '4c. Sum > Target', code: 'sum > target\n➔ right-- (decrease sum)', type: 'branch' }
        ]
      },
      { id: 'END', title: '5. Terminate / Return', code: 'return solution or [-1, -1]', type: 'end' }
    ],
    CONTAINER_WATER: [
      { id: 'START', title: '1. Init Bounds', code: 'left = 0, right = n - 1\nmaxWater = 0', type: 'start' },
      { id: 'CHECK_LOOP', title: '2. Pointers Converging', code: 'while (left < right)', type: 'condition' },
      { id: 'COMPUTE_AREA', title: '3. Calculate Area', code: 'w = right - left\nh = min(height[left], height[right])\narea = w * h', type: 'process' },
      { id: 'UPDATE_MAX', title: '4. Update Max Water', code: 'maxWater = max(maxWater, area)', type: 'success' },
      {
        type: 'branch_group',
        branches: [
          { id: 'MOVE_LEFT', title: '5a. Advance Left', code: 'height[left] < height[right]\n➔ left++ (seek taller line)', type: 'branch' },
          { id: 'MOVE_RIGHT', title: '5b. Retreat Right', code: 'height[right] <= height[left]\n➔ right-- (seek taller line)', type: 'branch' }
        ]
      },
      { id: 'END', title: '6. Max Water Found', code: 'return maxWater', type: 'end' }
    ],
    KADANE: [
      { id: 'START', title: '1. Init State', code: 'currentSum = nums[0]\nmaxSum = nums[0]', type: 'start' },
      { id: 'LOOP_CHECK', title: '2. Iterate Elements', code: 'for i = 1 to n - 1', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'BRANCH_RESET', title: '3a. Reset Subarray', code: 'nums[i] > currentSum + nums[i]\n➔ currentSum = nums[i]', type: 'branch' },
          { id: 'BRANCH_EXTEND', title: '3b. Extend Subarray', code: 'currentSum + nums[i] >= nums[i]\n➔ currentSum += nums[i]', type: 'process' }
        ]
      },
      { id: 'UPDATE_MAX', title: '4. Record Max Sum', code: 'maxSum = max(maxSum, currentSum)', type: 'success' },
      { id: 'END', title: '5. Max Subarray Found', code: 'return maxSum', type: 'end' }
    ],
    BINARY_SEARCH: [
      { id: 'START', title: '1. Init Bounds', code: 'low = 0, high = n - 1', type: 'start' },
      { id: 'CHECK_LOOP', title: '2. Search Window', code: 'while (low <= high)', type: 'condition' },
      { id: 'EVAL_MID', title: '3. Compute Mid', code: 'mid = low + (high - low) / 2', type: 'process' },
      {
        type: 'branch_group',
        branches: [
          { id: 'BRANCH_FOUND', title: '4a. Target Hit', code: 'nums[mid] == target ➔ Found!', type: 'success' },
          { id: 'BRANCH_LESS', title: '4b. Search Right', code: 'nums[mid] < target ➔ low = mid + 1', type: 'branch' },
          { id: 'BRANCH_GREATER', title: '4c. Search Left', code: 'nums[mid] > target ➔ high = mid - 1', type: 'branch' }
        ]
      },
      { id: 'END', title: '5. Result Return', code: 'return targetIndex or -1', type: 'end' }
    ],
    SLIDING_WINDOW: [
      { id: 'START', title: '1. Init Window', code: 'left = 0, right = 0, best = 0', type: 'start' },
      { id: 'EXPAND', title: '2. Expand Window', code: 'Include nums[right] in window', type: 'process' },
      { id: 'CHECK_VALID', title: '3. Invariant Check', code: 'Is window state valid?', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'SHRINK', title: '4a. Shrink Left', code: 'while (invalid) left++', type: 'branch' },
          { id: 'UPDATE', title: '4b. Record Best', code: 'best = max(best, windowSize)', type: 'success' }
        ]
      },
      { id: 'END', title: '5. Return Result', code: 'return best answer', type: 'end' }
    ],
    SORTING: [
      { id: 'START', title: '1. Init Pass', code: 'for i = 0 to n - 1', type: 'start' },
      { id: 'COMPARE', title: '2. Compare Pair', code: 'if (nums[j] > nums[j + 1])', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'SWAP', title: '3a. Out of Order', code: 'swap(nums[j], nums[j + 1])', type: 'branch' },
          { id: 'KEEP', title: '3b. Preserved Order', code: 'Advance j++ (no swap)', type: 'process' }
        ]
      },
      { id: 'END', title: '4. Pass Completed', code: 'Array sorted in-place', type: 'end' }
    ],
    LINKED_LIST: [
      { id: 'START', title: '1. Setup Pointers', code: 'prev = null, curr = head', type: 'start' },
      { id: 'CHECK_CURR', title: '2. Traversal Check', code: 'while (curr != null)', type: 'condition' },
      { id: 'SAVE_NEXT', title: '3. Cache Next Pointer', code: 'next = curr.next', type: 'process' },
      { id: 'REVERSE_PTR', title: '4. Invert Link Pointer', code: 'curr.next = prev', type: 'branch' },
      { id: 'STEP_FWD', title: '5. Move References', code: 'prev = curr; curr = next', type: 'process' },
      { id: 'END', title: '6. Return Reversed Head', code: 'return prev (new head)', type: 'end' }
    ],
    LINKED_LIST_FAST_SLOW: [
      { id: 'START', title: '1. Init Fast & Slow', code: 'slow = head, fast = head', type: 'start' },
      { id: 'CHECK_LOOP', title: '2. Check Fast Step', code: 'while (fast != null && fast.next != null)', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'STEP_PTRS', title: '3a. Step Pointers', code: 'slow = slow.next\nfast = fast.next.next', type: 'process' },
          { id: 'END', title: '3b. Middle Detected', code: 'Fast reached boundary\n➔ return slow (mid)', type: 'success' }
        ]
      }
    ],
    STACK: [
      { id: 'START', title: '1. Init Stack', code: 'Stack<Character> stack = new Stack<>()', type: 'start' },
      { id: 'READ_CHAR', title: '2. Read Next Token', code: 'for char c in s.toCharArray()', type: 'process' },
      { id: 'CHECK_OPEN', title: '3. Bracket Check', code: 'isOpening(c)?', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'PUSH', title: '4a. Push Symbol', code: 'stack.push(c)', type: 'process' },
          { id: 'MATCH_POP', title: '4b. Pop & Match', code: 'c matches stack.pop()?', type: 'branch' }
        ]
      },
      { id: 'END', title: '5. Validate Balance', code: 'return stack.isEmpty()', type: 'end' }
    ],
    QUEUE: [
      { id: 'START', title: '1. Init Monotonic Deque', code: 'Deque<Integer> dq = new ArrayDeque<>()', type: 'start' },
      { id: 'CHECK_WINDOW', title: '2. Evict Out of Window', code: 'if (dq.peek() <= i - k) dq.pollFirst()', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'POP_SMALLER', title: '3a. Maintain Decreasing', code: 'while (!dq.isEmpty() && nums[dq.last] <= nums[i]) dq.pollLast()', type: 'branch' },
          { id: 'PUSH_INDEX', title: '3b. Enqueue Element', code: 'dq.offerLast(i)', type: 'process' }
        ]
      },
      { id: 'RECORD_MAX', title: '4. Record Window Max', code: 'if (i >= k - 1) res.add(nums[dq.first])', type: 'success' }
    ],
    TREE_TRAVERSAL: [
      { id: 'START', title: '1. Inorder Call', code: 'inorder(TreeNode root)', type: 'start' },
      { id: 'CHECK_NULL', title: '2. Null Check', code: 'if (root == null) return', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'TRAVERSE_LEFT', title: '3a. Recurse Left', code: 'inorder(root.left)', type: 'process' },
          { id: 'VISIT_NODE', title: '3b. Visit Value', code: 'result.add(root.val)', type: 'success' },
          { id: 'TRAVERSE_RIGHT', title: '3c. Recurse Right', code: 'inorder(root.right)', type: 'process' }
        ]
      },
      { id: 'END', title: '4. Traversal Finished', code: 'return traversalList', type: 'end' }
    ],
    GRAPH_BFS_DFS: [
      { id: 'START', title: '1. Queue & Visited Set', code: 'q.offer(start); visited.add(start)', type: 'start' },
      { id: 'CHECK_QUEUE', title: '2. Queue Loop', code: 'while (!q.isEmpty())', type: 'condition' },
      { id: 'DEQUEUE_NODE', title: '3. Dequeue Node', code: 'int curr = q.poll()', type: 'process' },
      {
        type: 'branch_group',
        branches: [
          { id: 'EXPLORE_NEIGHBORS', title: '4a. Expand Edge', code: 'for (int v : adj[curr]) if (!visited[v])', type: 'branch' },
          { id: 'ENQUEUE_NEIGHBOR', title: '4b. Enqueue Unvisited', code: 'visited[v] = true; q.offer(v)', type: 'process' }
        ]
      },
      { id: 'END', title: '5. Traversal Complete', code: 'All reachable vertices visited', type: 'end' }
    ],
    GREEDY_INTERVALS: [
      { id: 'START', title: '1. Sort Intervals', code: 'Arrays.sort(intervals, byEnd)', type: 'start' },
      { id: 'CHECK_OVERLAP', title: '2. Overlap Check', code: 'if (curr.start < prev.end)', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'MERGE_INTERVAL', title: '3a. Remove Overlap', code: 'removedCount++', type: 'branch' },
          { id: 'APPEND_NEW', title: '3b. Keep Non-overlapping', code: 'prev.end = curr.end', type: 'process' }
        ]
      },
      { id: 'END', title: '4. Greedy Result', code: 'return removedCount', type: 'end' }
    ],
    RECURSION_TREE: [
      { id: 'START', title: '1. Recursive Call', code: 'hanoi(n, from, to, aux)', type: 'start' },
      { id: 'BASE_CHECK', title: '2. Base Case', code: 'if (n == 1) moveDisk(1, from, to)', type: 'condition' },
      {
        type: 'branch_group',
        branches: [
          { id: 'SUB_CALL_1', title: '3a. Subproblem 1', code: 'hanoi(n - 1, from, aux, to)', type: 'process' },
          { id: 'MOVE_DISK', title: '3b. Move Largest Disk', code: 'Move Disk n from to', type: 'branch' },
          { id: 'SUB_CALL_2', title: '3c. Subproblem 2', code: 'hanoi(n - 1, aux, to, from)', type: 'process' }
        ]
      },
      { id: 'END', title: '4. Recursion Complete', code: 'Total moves = 2^n - 1', type: 'end' }
    ],
    DP_TABLE: [
      { id: 'START', title: '1. Allocate DP Array', code: 'int[] dp = new int[n + 1]', type: 'start' },
      { id: 'BASE_CASES', title: '2. Seed Base Values', code: 'dp[0] = 1, dp[1] = 1', type: 'process' },
      { id: 'LOOP_STATE', title: '3. State Transition Loop', code: 'for (int i = 2; i <= n; i++)', type: 'condition' },
      { id: 'COMPUTE_CELL', title: '4. Recurrence Formula', code: 'dp[i] = dp[i-1] + dp[i-2]', type: 'branch' },
      { id: 'END', title: '5. Optimal Subproblem', code: 'return dp[n]', type: 'end' }
    ],
    GENERIC: [
      { id: 'START', title: '1. Initialize State', code: 'Prepare data structure & pointers', type: 'start' },
      { id: 'PROCESS', title: '2. Execute Operation', code: 'Process element and evaluate state', type: 'process' },
      { id: 'EVAL', title: '3. Branch Decision', code: 'Check invariant and update structure', type: 'condition' },
      { id: 'END', title: '4. Return Result', code: 'Algorithm dry run completed', type: 'end' }
    ]
  };

  /**
   * Determine Active Flowchart Node from Step Data
   */
  function resolveActiveNode(nodes, stepData, visualizerType) {
    if (stepData.flowchartNode) return stepData.flowchartNode;

    const status = stepData.status || 'info';
    const vars = stepData.variables || {};
    const stepNum = stepData.step || 1;

    if (status === 'success') {
      if (visualizerType === 'ARRAY_TWO_POINTER' || visualizerType === 'BINARY_SEARCH') return 'BRANCH_FOUND';
      return 'END';
    }

    if (stepNum === 1) return 'START';

    if (visualizerType === 'ARRAY_TWO_POINTER') {
      if (vars.comparison && vars.comparison.includes('>')) return 'BRANCH_GREATER';
      if (vars.comparison && vars.comparison.includes('<')) return 'BRANCH_LESS';
      if (vars.sum !== undefined) return 'EVAL_SUM';
      return 'CHECK_LOOP';
    }

    if (visualizerType === 'CONTAINER_WATER') {
      if (status === 'success') return 'UPDATE_MAX';
      if (stepData.pointers && stepData.pointers.left >= stepData.pointers.right) return 'END';
      if (stepData.explanation && stepData.explanation.toLowerCase().includes('advance left')) return 'MOVE_LEFT';
      if (stepData.explanation && stepData.explanation.toLowerCase().includes('decrement right')) return 'MOVE_RIGHT';
      return 'COMPUTE_AREA';
    }

    if (visualizerType === 'KADANE') {
      if (status === 'success' && vars.maxSum !== undefined) return 'UPDATE_MAX';
      if (stepData.explanation && stepData.explanation.includes('resets')) return 'BRANCH_RESET';
      if (status === 'warning') return 'BRANCH_EXTEND';
      return 'LOOP_CHECK';
    }

    if (visualizerType === 'BINARY_SEARCH') {
      if (vars.comparison && vars.comparison.includes('<')) return 'BRANCH_LESS';
      if (vars.comparison && vars.comparison.includes('>')) return 'BRANCH_GREATER';
      if (vars.mid !== undefined) return 'EVAL_MID';
      return 'CHECK_LOOP';
    }

    if (visualizerType === 'SLIDING_WINDOW') {
      if (status === 'warning') return 'SHRINK';
      if (status === 'success') return 'UPDATE';
      return 'EXPAND';
    }

    if (visualizerType === 'SORTING') {
      if (status === 'warning') return 'SWAP';
      return 'COMPARE';
    }

    if (visualizerType === 'LINKED_LIST') {
      if (stepData.pointers && stepData.pointers.curr === null) return 'END';
      if (status === 'warning') return 'REVERSE_PTR';
      return 'STEP_FWD';
    }

    if (visualizerType === 'LINKED_LIST_FAST_SLOW') {
      if (status === 'success') return 'END';
      return 'STEP_PTRS';
    }

    if (visualizerType === 'STACK') {
      if (status === 'warning') return 'MATCH_POP';
      return 'PUSH';
    }

    if (visualizerType === 'QUEUE') {
      if (status === 'warning') return 'POP_SMALLER';
      if (status === 'success') return 'RECORD_MAX';
      return 'PUSH_INDEX';
    }

    if (visualizerType === 'TREE_TRAVERSAL') {
      if (status === 'success') return 'VISIT_NODE';
      return (stepNum % 2 === 0) ? 'TRAVERSE_LEFT' : 'TRAVERSE_RIGHT';
    }

    if (visualizerType === 'GRAPH_BFS_DFS') {
      if (status === 'success') return 'EXPLORE_NEIGHBORS';
      return 'DEQUEUE_NODE';
    }

    if (visualizerType === 'GREEDY_INTERVALS') {
      if (vars.overlap) return 'MERGE_INTERVAL';
      return 'CHECK_OVERLAP';
    }

    if (visualizerType === 'RECURSION_TREE') {
      if (status === 'success') return 'MOVE_DISK';
      return 'SUB_CALL_1';
    }

    if (visualizerType === 'DP_TABLE') {
      if (stepNum <= 2) return 'BASE_CASES';
      return 'COMPUTE_CELL';
    }

    return (stepNum % 2 === 0) ? 'EVAL' : 'PROCESS';
  }

  /**
   * Render Interactive Dynamic Flowchart
   */
  function renderFlowchart(container, stepData, visualizerType) {
    if (!container || !stepData) return;
    container.innerHTML = '';

    const defKey = FLOWCHART_DEFINITIONS[visualizerType] ? visualizerType : 'GENERIC';
    const flowDef = FLOWCHART_DEFINITIONS[defKey];
    const activeNodeId = resolveActiveNode(flowDef, stepData, visualizerType);

    const flowContainer = document.createElement('div');
    flowContainer.className = 'flowchart-container';

    // Header badge
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = 'width: 100%; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;';
    headerTitle.innerHTML = `
      <span>🔀 Logic Flowchart Diagram</span>
      <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${visualizerType.replace(/_/g, ' ')}</span>
    `;
    flowContainer.appendChild(headerTitle);

    flowDef.forEach((nodeItem, idx) => {
      // Connectors between sequential nodes
      if (idx > 0) {
        const connector = document.createElement('div');
        connector.className = 'flowchart-connector';
        if (nodeItem.id === activeNodeId || (nodeItem.branches && nodeItem.branches.some(b => b.id === activeNodeId))) {
          connector.classList.add('active-edge');
        }
        connector.innerHTML = `
          <div class="flowchart-connector-line"></div>
          <div class="flowchart-connector-arrow">&#9660;</div>
        `;
        flowContainer.appendChild(connector);
      }

      if (nodeItem.type === 'branch_group') {
        const branchGroup = document.createElement('div');
        branchGroup.className = 'flowchart-branch-group';

        nodeItem.branches.forEach(branch => {
          const bNode = createNodeElement(branch, activeNodeId, stepData);
          branchGroup.appendChild(bNode);
        });

        flowContainer.appendChild(branchGroup);
      } else {
        const nodeEl = createNodeElement(nodeItem, activeNodeId, stepData);
        flowContainer.appendChild(nodeEl);
      }
    });

    container.appendChild(flowContainer);
  }

  function createNodeElement(nodeDef, activeNodeId, stepData) {
    const el = document.createElement('div');
    const isActive = (nodeDef.id === activeNodeId);
    el.className = `flowchart-node node-${nodeDef.type} ${isActive ? 'active-node' : ''}`;
    el.setAttribute('data-node-id', nodeDef.id);

    if (isActive) {
      setTimeout(() => {
        const flowBox = document.getElementById('stage-flowchart');
        if (flowBox && el) {
          const topPos = el.offsetTop - flowBox.offsetTop - 20;
          flowBox.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
        }
      }, 50);
    }

    let icon = '📦';
    if (nodeDef.type === 'start') icon = '🏁';
    if (nodeDef.type === 'condition') icon = '🔄';
    if (nodeDef.type === 'success') icon = '🎯';
    if (nodeDef.type === 'branch') icon = '⚡';
    if (nodeDef.type === 'end') icon = '✅';

    let liveValHtml = '';
    if (isActive) {
      const vars = stepData.variables || {};
      const pairs = Object.entries(vars).map(([k, v]) => `${k}=${v}`).join(', ');
      if (pairs) {
        liveValHtml = `<div class="flowchart-node-val-live">Live: ${pairs}</div>`;
      }
    }

    el.innerHTML = `
      <div class="flowchart-node-header">
        <div class="flowchart-node-title">
          <span>${icon}</span> ${nodeDef.title}
        </div>
        <span class="flowchart-node-type-badge">${nodeDef.type.replace('_', ' ')}</span>
      </div>
      <div class="flowchart-node-code">${nodeDef.code}</div>
      ${liveValHtml}
    `;

    return el;
  }

  return {
    render(type, container, stepData) {
      if (!container || !stepData) return;

      if (type === 'CONTAINER_WATER' || (stepData.variables && (stepData.variables.maxWater !== undefined || stepData.variables.waterArea !== undefined))) {
        renderContainerWater(container, stepData);
        return;
      }

      switch (type) {
        case 'ARRAY_TWO_POINTER':
        case 'KADANE':
        case 'SLIDING_WINDOW':
        case 'BINARY_SEARCH':
        case 'SORTING':
          renderArray(container, stepData);
          break;
        case 'GREEDY_INTERVALS':
          renderIntervals(container, stepData);
          break;
        case 'LINKED_LIST':
        case 'LINKED_LIST_FAST_SLOW':
          renderLinkedList(container, stepData);
          break;
        case 'STACK':
          renderStack(container, stepData);
          break;
        case 'QUEUE':
          renderQueue(container, stepData);
          break;
        case 'TREE_TRAVERSAL':
          renderTree(container, stepData);
          break;
        case 'GRAPH_BFS_DFS':
          renderGraph(container, stepData);
          break;
        case 'RECURSION_TREE':
          renderRecursion(container, stepData);
          break;
        case 'DP_TABLE':
          renderDPTable(container, stepData);
          break;
        default:
          renderArray(container, stepData);
      }
    },
    renderFlowchart
  };
})();

// Universally expose Renderers to global window object
if (typeof window !== 'undefined') {
  window.Renderers = Renderers;
}
