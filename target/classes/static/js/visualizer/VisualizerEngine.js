/**
 * AlgoPulse - Interactive Visualizer Engine
 * Coordinates timeline playback, speed controls, DOM canvas rendering,
 * code line synchronization, and variable inspection.
 */
class VisualizerEngine {
  constructor(options = {}) {
    this.canvasId = options.canvasId || 'stage-canvas';
    this.codeContainerId = options.codeContainerId || 'code-lines-wrapper';
    this.narrativeId = options.narrativeId || 'narrative-card';
    this.variablesId = options.variablesId || 'variables-grid';
    this.stepCounterId = options.stepCounterId || 'step-counter';
    this.scrubberFillId = options.scrubberFillId || 'scrubber-fill';
    this.playBtnId = options.playBtnId || 'btn-play-pause';

    this.steps = [];
    this.currentStepIndex = 0;
    this.visualizerType = 'ARRAY_TWO_POINTER';
    this.isPlaying = false;
    this.playbackTimer = null;
    this.baseDelay = 1200; // ms per step at 1x
    this.speed = 1.0;

    this.initKeyboardShortcuts();
  }

  load(steps, type = 'ARRAY_TWO_POINTER') {
    this.pause();
    this.steps = Array.isArray(steps) ? steps : [];
    this.visualizerType = type;
    this.currentStepIndex = 0;

    // Ensure all steps have array inherited from base step if missing
    let baseArray = null;
    for (const s of this.steps) {
      if (s.array && Array.isArray(s.array) && s.array.length > 0) {
        baseArray = s.array;
        break;
      }
    }
    if (baseArray) {
      this.steps.forEach(s => {
        if (!s.array || !Array.isArray(s.array) || s.array.length === 0) {
          s.array = [...baseArray];
        }
      });
    }

    this.renderCurrentStep();
  }

  play() {
    if (this.steps.length === 0) return;
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.currentStepIndex = 0;
    }

    this.isPlaying = true;
    this.updatePlayButton();

    const stepDelay = Math.max(250, Math.round(this.baseDelay / this.speed));

    this.playbackTimer = setInterval(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.renderCurrentStep();
      } else {
        this.pause();
      }
    }, stepDelay);
  }

  pause() {
    this.isPlaying = false;
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updatePlayButton();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    this.pause();
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    }
  }

  prev() {
    this.pause();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  }

  reset() {
    this.pause();
    this.currentStepIndex = 0;
    this.renderCurrentStep();
  }

  seek(index) {
    if (index >= 0 && index < this.steps.length) {
      this.pause();
      this.currentStepIndex = index;
      this.renderCurrentStep();
    }
  }

  setSpeed(speedVal) {
    this.speed = parseFloat(speedVal) || 1.0;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  renderCurrentStep() {
    if (this.steps.length === 0) return;
    const step = this.steps[this.currentStepIndex];

    const renderer = (typeof Renderers !== 'undefined') ? Renderers : (typeof window !== 'undefined' ? window.Renderers : null);

    // 1. Render Graphical Data Structure Canvas
    const canvas = document.getElementById(this.canvasId);
    if (canvas && renderer && typeof renderer.render === 'function') {
      try {
        renderer.render(this.visualizerType, canvas, step);
      } catch (err) {
        console.error('Error executing renderer.render:', err);
      }
    }

    // 2. Render Interactive Logic Flowchart Diagram
    const flowCanvas = document.getElementById('stage-flowchart');
    if (flowCanvas && renderer && typeof renderer.renderFlowchart === 'function') {
      try {
        renderer.renderFlowchart(flowCanvas, step, this.visualizerType);
      } catch (err) {
        console.error('Error executing renderer.renderFlowchart:', err);
      }
    }

    // 3. Update Live Execution Evaluator Strip (HUD)
    this.updateEvaluatorStrip(step);

    // 4. Synchronize Java Code Line Highlighting
    this.syncCodeLines(step.highlightLines || []);

    // 5. Update Dry Run Narrative Card
    this.updateNarrative(step);

    // 6. Update Variables Inspector
    this.updateVariables(step.variables || {});

    // 7. Update Step Counter and Scrubber
    this.updateProgressControls();
  }

  updateEvaluatorStrip(step) {
    const stepBadge = document.getElementById('eval-step-badge');
    const lineBadge = document.getElementById('eval-line-badge');
    const exprEl = document.getElementById('eval-expr-text');
    const decisionEl = document.getElementById('eval-decision-text');
    const nodeTitleEl = document.getElementById('eval-flow-node-title');

    if (stepBadge) {
      stepBadge.textContent = `STEP ${this.currentStepIndex + 1}`;
    }

    if (lineBadge) {
      const lineNum = (step.highlightLines && step.highlightLines.length > 0) ? step.highlightLines[0] : '-';
      lineBadge.textContent = `Line ${lineNum}`;
    }

    if (exprEl) {
      if (step.expression) {
        exprEl.textContent = step.expression;
      } else if (step.variables && step.variables.sum !== undefined && step.variables.target !== undefined) {
        exprEl.textContent = `sum = ${step.variables.sum} | target = ${step.variables.target}`;
      } else if (step.variables && step.variables.mid !== undefined) {
        const midVal = (step.array && step.array[step.variables.mid] !== undefined) ? step.array[step.variables.mid] : '-';
        exprEl.textContent = `mid = ${step.variables.mid} (val: ${midVal}) | target = ${step.variables.target}`;
      } else {
        exprEl.textContent = step.explanation ? step.explanation.split('.')[0] : 'Processing algorithm state...';
      }
    }

    if (decisionEl) {
      if (step.status === 'success') {
        decisionEl.innerHTML = '<strong style="color:#34d399">Condition MET &#10003; Target found / Base case reached!</strong>';
      } else if (step.status === 'warning') {
        decisionEl.innerHTML = `<span style="color:#fbbf24">${step.explanation || 'Branch adjustment: updating invariant pointer'}</span>`;
      } else {
        decisionEl.textContent = step.explanation || 'Advancing to next execution frame';
      }
    }

    if (nodeTitleEl) {
      const activeNodeEl = document.querySelector('.flowchart-node.active-node .flowchart-node-title');
      if (activeNodeEl) {
        nodeTitleEl.textContent = activeNodeEl.textContent.trim();
      } else {
        nodeTitleEl.textContent = step.flowchartNode || 'Flow Node';
      }
    }
  }

  syncCodeLines(linesToHighlight) {
    const codeWrapper = document.getElementById(this.codeContainerId);
    if (!codeWrapper) return;

    const allLines = codeWrapper.querySelectorAll('.code-line');
    allLines.forEach(line => {
      const lineNum = parseInt(line.getAttribute('data-line'), 10);
      if (linesToHighlight.includes(lineNum)) {
        line.classList.add('highlighted');
        // Scroll only code container if tab is active/visible
        if (codeWrapper.offsetParent !== null) {
          const topPos = line.offsetTop - codeWrapper.offsetTop - 12;
          codeWrapper.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
        }
      } else {
        line.classList.remove('highlighted');
      }
    });
  }

  updateNarrative(step) {
    const card = document.getElementById(this.narrativeId);
    if (!card) return;

    card.className = `narrative-card ${step.status || 'info'}`;

    const iconEl = card.querySelector('.narrative-icon');
    if (iconEl) {
      let icon = '💡';
      if (step.status === 'warning') icon = '⚡';
      if (step.status === 'success') icon = '🎯';
      iconEl.textContent = icon;
    }

    const stepLabel = card.querySelector('.narrative-step-label');
    if (stepLabel) {
      stepLabel.textContent = `Step ${this.currentStepIndex + 1} of ${this.steps.length}`;
    }

    const textEl = card.querySelector('.narrative-text');
    if (textEl) {
      textEl.textContent = step.explanation || 'Stepping through algorithm...';
    }
  }

  updateVariables(vars) {
    const container = document.getElementById(this.variablesId);
    if (!container) return;

    container.innerHTML = '';
    const entries = Object.entries(vars);

    if (entries.length === 0) {
      container.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">No active variables in this step.</span>';
      return;
    }

    entries.forEach(([key, val]) => {
      const badge = document.createElement('div');
      badge.className = 'variable-badge';

      const keySpan = document.createElement('span');
      keySpan.className = 'var-key';
      keySpan.textContent = key;

      const valSpan = document.createElement('span');
      valSpan.className = 'var-val';
      valSpan.textContent = typeof val === 'object' ? JSON.stringify(val) : val;

      badge.appendChild(keySpan);
      badge.appendChild(valSpan);
      container.appendChild(badge);
    });
  }

  updateProgressControls() {
    const counter = document.getElementById(this.stepCounterId);
    if (counter) {
      counter.textContent = `Step ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }

    const fill = document.getElementById(this.scrubberFillId);
    if (fill && this.steps.length > 1) {
      const pct = (this.currentStepIndex / (this.steps.length - 1)) * 100;
      fill.style.width = `${pct}%`;
    }
  }

  updatePlayButton() {
    const btn = document.getElementById(this.playBtnId);
    if (btn) {
      if (this.isPlaying) {
        btn.innerHTML = '<span>⏸</span> Pause';
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-primary');
      } else {
        btn.innerHTML = '<span>▶</span> Play';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
      }
    }
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger when typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.reset();
      }
    });
  }

  /**
   * Universal Client-side Step Generator with Flowchart Nodes & Live Expressions
   */
  static generateCustomSteps(algorithm, inputData = {}) {
    const algo = (algorithm || 'ARRAY_TWO_POINTER').toUpperCase();

    // 1. Two Pointer / Array Pair Sum
    if (algo === 'ARRAY_TWO_POINTER' || algo === 'TWO_SUM') {
      const arr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [2, 7, 11, 15];
      // ensure sorted
      arr.sort((a, b) => a - b);
      const target = inputData.target !== undefined ? inputData.target : (arr[0] + arr[1]);
      const steps = [];

      let left = 0;
      let right = arr.length - 1;

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3, 4],
        pointers: { left, right },
        variables: { left, right, target },
        array: [...arr],
        activeIndices: [left, right],
        status: 'info',
        expression: `left = 0 (${arr[left]}), right = ${right} (${arr[right]}), target = ${target}`,
        explanation: `Initialize two pointers: left at index 0 and right at index ${right}. Target is ${target}.`
      });

      while (left < right) {
        const sum = arr[left] + arr[right];

        steps.push({
          step: steps.length + 1,
          flowchartNode: 'EVAL_SUM',
          highlightLines: [7],
          pointers: { left, right },
          variables: { left, right, sum, target },
          array: [...arr],
          activeIndices: [left, right],
          status: 'info',
          expression: `nums[${left}] (${arr[left]}) + nums[${right}] (${arr[right]}) = ${sum}`,
          explanation: `Calculate sum: ${arr[left]} + ${arr[right]} = ${sum}. Compare with target (${target}).`
        });

        if (sum === target) {
          steps.push({
            step: steps.length + 1,
            flowchartNode: 'BRANCH_FOUND',
            highlightLines: [8, 9],
            pointers: { left, right },
            variables: { left, right, sum, target, found: true, indices: `[${left + 1}, ${right + 1}]` },
            array: [...arr],
            activeIndices: [left, right],
            status: 'success',
            expression: `MATCH! ${arr[left]} + ${arr[right]} == ${target}`,
            explanation: `Match found! ${arr[left]} + ${arr[right]} equals target ${target}. Return 1-based indices [${left + 1}, ${right + 1}].`
          });
          return steps;
        } else if (sum < target) {
          steps.push({
            step: steps.length + 1,
            flowchartNode: 'BRANCH_LESS',
            highlightLines: [10, 11],
            pointers: { left, right },
            variables: { sum, target, comparison: `${sum} < ${target}`, action: 'left++' },
            array: [...arr],
            activeIndices: [left, right],
            status: 'warning',
            expression: `sum (${sum}) < target (${target}) ➔ Increment left pointer`,
            explanation: `Current sum (${sum}) is smaller than target (${target}). Increment left from ${left} to ${left + 1} to increase sum.`
          });
          left++;
        } else {
          steps.push({
            step: steps.length + 1,
            flowchartNode: 'BRANCH_GREATER',
            highlightLines: [12, 13],
            pointers: { left, right },
            variables: { sum, target, comparison: `${sum} > ${target}`, action: 'right--' },
            array: [...arr],
            activeIndices: [left, right],
            status: 'warning',
            expression: `sum (${sum}) > target (${target}) ➔ Decrement right pointer`,
            explanation: `Current sum (${sum}) is greater than target (${target}). Decrement right from ${right} to ${right - 1} to decrease sum.`
          });
          right--;
        }
      }

      steps.push({
        step: steps.length + 1,
        flowchartNode: 'END',
        highlightLines: [16],
        pointers: { left, right },
        variables: { found: false },
        array: [...arr],
        activeIndices: [],
        status: 'info',
        expression: `Search completed: no pair found`,
        explanation: `Pointers crossed without finding a pair summing to ${target}. Return [-1, -1].`
      });
      return steps;
    }

    // 2. Binary Search
    if (algo === 'BINARY_SEARCH') {
      const arr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [1, 3, 5, 7, 9, 11, 14, 18];
      arr.sort((a, b) => a - b);
      const target = inputData.target !== undefined ? inputData.target : 7;
      const steps = [];

      let low = 0;
      let high = arr.length - 1;

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3, 4],
        pointers: { low, high },
        variables: { low, high, target },
        array: [...arr],
        activeIndices: [low, high],
        status: 'info',
        expression: `low = 0, high = ${high}, target = ${target}`,
        explanation: `Initialize binary search window: low=0, high=${high}. Target = ${target}.`
      });

      while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);

        steps.push({
          step: steps.length + 1,
          flowchartNode: 'EVAL_MID',
          highlightLines: [7],
          pointers: { low, mid, high },
          variables: { low, mid, high, 'arr[mid]': arr[mid], target },
          array: [...arr],
          activeIndices: [mid],
          status: 'info',
          expression: `mid = ${low} + (${high} - ${low}) / 2 = ${mid} | arr[${mid}] = ${arr[mid]}`,
          explanation: `Calculated midpoint index ${mid} with value ${arr[mid]}. Compare with target ${target}.`
        });

        if (arr[mid] === target) {
          steps.push({
            step: steps.length + 1,
            flowchartNode: 'BRANCH_FOUND',
            highlightLines: [8, 9],
            pointers: { low, mid, high },
            variables: { mid, 'arr[mid]': arr[mid], target, found: true },
            array: [...arr],
            activeIndices: [mid],
            status: 'success',
            expression: `FOUND! arr[${mid}] (${arr[mid]}) == target (${target})`,
            explanation: `Target ${target} found at index ${mid}! Return ${mid}.`
          });
          return steps;
        } else if (arr[mid] < target) {
          steps.push({
            step: steps.length + 1,
            flowchartNode: 'BRANCH_LESS',
            highlightLines: [10, 11],
            pointers: { low, mid, high },
            variables: { mid, 'arr[mid]': arr[mid], target, action: `low = ${mid + 1}` },
            array: [...arr],
            activeIndices: [mid],
            status: 'warning',
            expression: `arr[${mid}] (${arr[mid]}) < ${target} ➔ Shift low to ${mid + 1}`,
            explanation: `arr[${mid}] (${arr[mid]}) is smaller than ${target}. Search right half by moving low to ${mid + 1}.`
          });
          low = mid + 1;
        } else {
          steps.push({
            step: steps.length + 1,
            flowchartNode: 'BRANCH_GREATER',
            highlightLines: [12, 13],
            pointers: { low, mid, high },
            variables: { mid, 'arr[mid]': arr[mid], target, action: `high = ${mid - 1}` },
            array: [...arr],
            activeIndices: [mid],
            status: 'warning',
            expression: `arr[${mid}] (${arr[mid]}) > ${target} ➔ Shift high to ${mid - 1}`,
            explanation: `arr[${mid}] (${arr[mid]}) is greater than ${target}. Search left half by moving high to ${mid - 1}.`
          });
          high = mid - 1;
        }
      }

      steps.push({
        step: steps.length + 1,
        flowchartNode: 'END',
        highlightLines: [16],
        pointers: {},
        variables: { found: false },
        array: [...arr],
        activeIndices: [],
        status: 'info',
        expression: `Search window exhausted. Return -1`,
        explanation: `Target ${target} does not exist in the array. Return -1.`
      });
      return steps;
    }

    // 3. Sorting (Bubble Sort Interactive Steps)
    if (algo === 'SORTING') {
      const arr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [5, 1, 4, 2, 8];
      const steps = [];
      const n = arr.length;

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3],
        pointers: { i: 0 },
        variables: { n, i: 0 },
        array: [...arr],
        activeIndices: [0],
        status: 'info',
        expression: `Starting sorting pass 0 across array of length ${n}`,
        explanation: `Initialize array sorting. We will compare adjacent pairs and bubble larger elements rightward.`
      });

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          const needSwap = arr[j] > arr[j + 1];

          steps.push({
            step: steps.length + 1,
            flowchartNode: 'COMPARE',
            highlightLines: [5],
            pointers: { j, 'j+1': j + 1 },
            variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
            array: [...arr],
            activeIndices: [j, j + 1],
            status: 'info',
            expression: `Compare arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]})`,
            explanation: `Comparing adjacent elements: ${arr[j]} and ${arr[j + 1]}.`
          });

          if (needSwap) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;

            steps.push({
              step: steps.length + 1,
              flowchartNode: 'SWAP',
              highlightLines: [6, 7],
              pointers: { j, 'j+1': j + 1 },
              variables: { swapped: true, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
              array: [...arr],
              activeIndices: [j, j + 1],
              status: 'warning',
              expression: `SWAP! ${temp} > ${arr[j]} ➔ Swapping positions`,
              explanation: `Inversion found (${temp} > ${arr[j]}). Swapped positions ${j} and ${j + 1}.`
            });
          }
        }
      }

      steps.push({
        step: steps.length + 1,
        flowchartNode: 'END',
        highlightLines: [12],
        pointers: {},
        variables: { sorted: true },
        array: [...arr],
        activeIndices: arr.map((_, idx) => idx),
        status: 'success',
        expression: `Array fully sorted: [${arr.join(', ')}]`,
        explanation: `All sorting passes completed! Array is in verified non-decreasing order.`
      });
      return steps;
    }

    // 4. Linked List Reversal
    if (algo === 'LINKED_LIST') {
      const arr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [1, 2, 3, 4, 5];
      const steps = [];

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3, 4],
        pointers: { prev: null, curr: arr[0] },
        variables: { prev: 'null', curr: arr[0] },
        array: [...arr],
        activeIndices: [0],
        status: 'info',
        expression: `prev = null, curr = node(${arr[0]})`,
        explanation: `Initialize reversal pointers: prev=null and curr points to head node (${arr[0]}).`
      });

      for (let i = 0; i < arr.length; i++) {
        const currVal = arr[i];
        const nextVal = (i + 1 < arr.length) ? arr[i + 1] : 'null';

        steps.push({
          step: steps.length + 1,
          flowchartNode: 'REVERSE_PTR',
          highlightLines: [7, 8],
          pointers: { curr: currVal },
          variables: { curr: currVal, next: nextVal },
          array: [...arr],
          activeIndices: [i],
          status: 'warning',
          expression: `curr (${currVal}).next ➔ prev | next = ${nextVal}`,
          explanation: `Save forward link next=${nextVal}. Invert current node's pointer to point back to prev.`
        });
      }

      steps.push({
        step: steps.length + 1,
        flowchartNode: 'END',
        highlightLines: [11],
        pointers: { head: arr[arr.length - 1] },
        variables: { newHead: arr[arr.length - 1] },
        array: [...arr].reverse(),
        activeIndices: [0],
        status: 'success',
        expression: `Reversal complete! New head is node(${arr[arr.length - 1]})`,
        explanation: `All pointer links inverted! The list is now fully reversed.`
      });
      return steps;
    }

    // 5. Stack (Valid Parentheses)
    if (algo === 'STACK') {
      const chars = ['(', '{', '}', ')'];
      const steps = [];

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3],
        pointers: {},
        variables: { stack: '[]', input: chars.join('') },
        array: ['(', '{', '}', ')'],
        activeIndices: [0],
        status: 'info',
        expression: `Stack initialized empty: []`,
        explanation: `Start parsing parentheses string: "${chars.join('')}". Stack is empty.`
      });

      steps.push({
        step: 2,
        flowchartNode: 'PUSH',
        highlightLines: [6],
        pointers: { top: 0 },
        variables: { push: '(', stack: "['(']" },
        array: ['(', '{', '}', ')'],
        activeIndices: [0],
        status: 'info',
        expression: `Opening bracket '(' ➔ Push to stack`,
        explanation: `Encountered opening bracket '('. Pushed onto stack.`
      });

      steps.push({
        step: 3,
        flowchartNode: 'PUSH',
        highlightLines: [6],
        pointers: { top: 1 },
        variables: { push: '{', stack: "['(', '{']" },
        array: ['(', '{', '}', ')'],
        activeIndices: [1],
        status: 'info',
        expression: `Opening bracket '{' ➔ Push to stack`,
        explanation: `Encountered opening bracket '{'. Pushed onto stack.`
      });

      steps.push({
        step: 4,
        flowchartNode: 'MATCH_POP',
        highlightLines: [9, 10],
        pointers: { top: 0 },
        variables: { token: '}', matched: '{', stack: "['(']" },
        array: ['(', '{', '}', ')'],
        activeIndices: [2],
        status: 'warning',
        expression: `Closing '}' matches top '{' ➔ POP stack`,
        explanation: `Encountered closing bracket '}'. Matches top of stack '{'. Popped match.`
      });

      steps.push({
        step: 5,
        flowchartNode: 'END',
        highlightLines: [14],
        pointers: {},
        variables: { stack: '[]', isValid: true },
        array: ['(', '{', '}', ')'],
        activeIndices: [0, 1, 2, 3],
        status: 'success',
        expression: `VALID! All brackets paired, stack is empty`,
        explanation: `All opening brackets successfully matched and stack is empty. String is valid!`
      });
      return steps;
    }

    // 6. Kadane's Algorithm
    if (algo === 'KADANE') {
      const arr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [-2, 1, -3, 4, -1, 2, 1, -5, 4];
      const steps = [];
      let currentSum = arr[0];
      let maxSum = arr[0];

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3, 4],
        pointers: { i: 0 },
        variables: { currentSum, maxSum, i: 0 },
        array: [...arr],
        activeIndices: [0],
        status: 'info',
        expression: `currentSum = ${arr[0]}, maxSum = ${arr[0]}`,
        explanation: `Initialize Kadane's algorithm: currentSum = ${arr[0]}, maxSum = ${arr[0]}.`
      });

      for (let i = 1; i < arr.length; i++) {
        const num = arr[i];
        const isReset = num > (currentSum + num);
        currentSum = Math.max(num, currentSum + num);
        const isNewPeak = currentSum > maxSum;
        if (isNewPeak) maxSum = currentSum;

        steps.push({
          step: steps.length + 1,
          flowchartNode: isReset ? 'BRANCH_RESET' : (isNewPeak ? 'UPDATE_MAX' : 'BRANCH_EXTEND'),
          highlightLines: [7, 8],
          pointers: { i },
          variables: { i, 'arr[i]': num, currentSum, maxSum },
          array: [...arr],
          activeIndices: [i],
          status: isNewPeak ? 'success' : (isReset ? 'warning' : 'info'),
          expression: `i=${i} (val:${num}) | currentSum=${currentSum} | maxSum=${maxSum}`,
          explanation: isReset 
            ? `At i=${i} (val ${num}): ${num} > (${currentSum - num} + ${num}). Subarray resets to start at ${num}.`
            : (isNewPeak ? `Subarray sum grew to ${currentSum}! New maximum maxSum=${maxSum} recorded!` : `Added ${num} to current sum: ${currentSum}.`)
        });
      }

      steps.push({
        step: steps.length + 1,
        flowchartNode: 'END',
        highlightLines: [10],
        pointers: {},
        variables: { maxSum, completed: true },
        array: [...arr],
        activeIndices: arr.map((_, i) => i),
        status: 'success',
        expression: `Kadane complete: Maximum subarray sum = ${maxSum}`,
        explanation: `Scan completed across array. Optimal contiguous subarray sum is ${maxSum}!`
      });
      return steps;
    }

    // 7. Fast & Slow Pointers (Middle of Linked List)
    if (algo === 'LINKED_LIST_FAST_SLOW') {
      const arr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [1, 2, 3, 4, 5];
      const steps = [];
      let slow = 0;
      let fast = 0;

      steps.push({
        step: 1,
        flowchartNode: 'START',
        highlightLines: [3, 4],
        pointers: { slow: arr[slow], fast: arr[fast] },
        variables: { slow: arr[slow], fast: arr[fast] },
        array: [...arr],
        activeIndices: [0],
        status: 'info',
        expression: `slow = node(${arr[0]}), fast = node(${arr[0]})`,
        explanation: `Initialize slow and fast pointers at list head (Node ${arr[0]}).`
      });

      while (fast < arr.length - 1 && fast + 1 < arr.length) {
        slow++;
        fast = Math.min(fast + 2, arr.length - 1);

        steps.push({
          step: steps.length + 1,
          flowchartNode: (fast >= arr.length - 2) ? 'END' : 'STEP_PTRS',
          highlightLines: [7, 8],
          pointers: { slow: arr[slow], fast: arr[fast] },
          variables: { slow: arr[slow], fast: arr[fast] },
          array: [...arr],
          activeIndices: [slow, fast],
          status: (fast >= arr.length - 1) ? 'success' : 'info',
          expression: `slow ➔ node(${arr[slow]}) | fast ➔ node(${arr[fast]})`,
          explanation: `Advance slow 1 step (to Node ${arr[slow]}) and fast 2 steps (to Node ${arr[fast]}).`
        });
      }

      steps.push({
        step: steps.length + 1,
        flowchartNode: 'END',
        highlightLines: [10],
        pointers: { middle: arr[slow] },
        variables: { middleNode: arr[slow] },
        array: [...arr],
        activeIndices: [slow],
        status: 'success',
        expression: `Middle Node found: node(${arr[slow]})`,
        explanation: `Fast pointer reached end. Slow pointer is at the exact middle Node (${arr[slow]}).`
      });
      return steps;
    }

    // 8. Tree Traversal
    if (algo === 'TREE_TRAVERSAL') {
      const nodes = [4, 2, 6, 1, 3, 5, 7];
      return [
        { step: 1, flowchartNode: 'START', highlightLines: [3, 4], pointers: { curr: 4 }, variables: { curr: 4, stack: '[4]' }, array: nodes, activeIndices: [0], status: 'info', expression: 'Push root Node(4) to stack, advance curr = curr.left (Node 2)', explanation: 'Push root Node(4) to traversal stack and step into left subtree.' },
        { step: 2, flowchartNode: 'TRAVERSE_LEFT', highlightLines: [7, 8], pointers: { curr: 2 }, variables: { curr: 2, stack: '[4, 2]' }, array: nodes, activeIndices: [1], status: 'info', expression: 'curr = Node(2) ➔ step left to Node(1)', explanation: 'Push Node(2) to stack, curr advances to leftmost leaf Node(1).' },
        { step: 3, flowchartNode: 'VISIT_NODE', highlightLines: [12, 13], pointers: { visited: 1 }, variables: { visited: 1, result: '[1]' }, array: [1], activeIndices: [3], status: 'success', expression: 'Pop Node(1) ➔ Add to inorder sequence [1]', explanation: 'Pop Node(1), visit value and append to inorder traversal list.' },
        { step: 4, flowchartNode: 'VISIT_NODE', highlightLines: [12, 13], pointers: { visited: 2 }, variables: { visited: 2, result: '[1, 2]' }, array: [1, 2], activeIndices: [1], status: 'success', expression: 'Pop Node(2) ➔ Sequence [1, 2], advance right to Node(3)', explanation: 'Pop Node(2), add 2 to sequence. Advance to right child Node(3).' },
        { step: 5, flowchartNode: 'END', highlightLines: [15], pointers: {}, variables: { completed: true, result: '[1, 2, 3, 4, 5, 6, 7]' }, array: nodes, activeIndices: [0, 1, 2, 3, 4, 5, 6], status: 'success', expression: 'Inorder Traversal complete: [1, 2, 3, 4, 5, 6, 7]', explanation: 'All binary tree nodes visited in sorted non-decreasing inorder sequence!' }
      ];
    }

    // 9. Graph BFS
    if (algo === 'GRAPH_BFS_DFS') {
      return [
        { step: 1, flowchartNode: 'START', highlightLines: [3, 4], pointers: { curr: 0 }, variables: { curr: 0, queue: [0], visited: [0], order: [0] }, array: [0, 1, 2, 3, 4], activeIndices: [0], status: 'info', expression: 'Enqueued start vertex 0, mark visited[0] = true', explanation: 'Initialize BFS: Enqueue source vertex 0 and mark visited.' },
        { step: 2, flowchartNode: 'EXPLORE_NEIGHBORS', highlightLines: [9, 10], pointers: { curr: 0 }, variables: { curr: 0, queue: [1, 2, 3], visited: [0, 1, 2, 3], order: [0] }, array: [0, 1, 2, 3, 4], activeIndices: [0, 1, 2, 3], status: 'info', expression: 'Dequeue vertex 0 ➔ Enqueue unvisited neighbors: 1, 2, 3', explanation: 'Visit vertex 0. Explore adjacent edges: push neighbors 1, 2, and 3 into Queue.' },
        { step: 3, flowchartNode: 'EXPLORE_NEIGHBORS', highlightLines: [9, 10], pointers: { curr: 1 }, variables: { curr: 1, queue: [2, 3], visited: [0, 1, 2, 3], order: [0, 1] }, array: [0, 1, 2, 3, 4], activeIndices: [1], status: 'info', expression: 'Dequeue vertex 1 ➔ Added to BFS order [0, 1]', explanation: 'Process vertex 1 from queue. Its neighbors are already visited.' },
        { step: 4, flowchartNode: 'EXPLORE_NEIGHBORS', highlightLines: [9, 10], pointers: { curr: 2 }, variables: { curr: 2, queue: [3, 4], visited: [0, 1, 2, 3, 4], order: [0, 1, 2] }, array: [0, 1, 2, 3, 4], activeIndices: [2, 4], status: 'info', expression: 'Dequeue vertex 2 ➔ Enqueue neighbor 4', explanation: 'Process vertex 2. Neighbor 4 is unvisited: mark visited and enqueue 4.' },
        { step: 5, flowchartNode: 'END', highlightLines: [15], pointers: {}, variables: { completed: true, queue: [], order: [0, 1, 2, 3, 4] }, array: [0, 1, 2, 3, 4], activeIndices: [0, 1, 2, 3, 4], status: 'success', expression: 'BFS finished! Traversal order: [0, 1, 2, 3, 4]', explanation: 'Queue is empty. BFS level-order traversal completed for all reachable vertices!' }
      ];
    }

    // 10. Recursion / Tower of Hanoi
    if (algo === 'RECURSION_TREE') {
      return [
        { step: 1, flowchartNode: 'START', highlightLines: [3], pointers: {}, variables: { n: 3, from: 'A', to: 'C', aux: 'B', disk: null }, array: [3, 2, 1], activeIndices: [0], status: 'info', expression: 'hanoi(3, A, C, B) ➔ Start 3 disks on Peg A', explanation: 'Solve Tower of Hanoi for 3 disks from Peg A to Peg C using Peg B as auxiliary.' },
        { step: 2, flowchartNode: 'MOVE_DISK', highlightLines: [5], pointers: {}, variables: { disk: 1, from: 'A', to: 'C' }, array: [1], activeIndices: [0], status: 'warning', expression: 'Move Disk 1: Peg A ➔ Peg C', explanation: 'Move smallest disk 1 directly from Peg A to Peg C.' },
        { step: 3, flowchartNode: 'MOVE_DISK', highlightLines: [6], pointers: {}, variables: { disk: 2, from: 'A', to: 'B' }, array: [2], activeIndices: [1], status: 'warning', expression: 'Move Disk 2: Peg A ➔ Peg B', explanation: 'Move medium disk 2 from Peg A to Peg B.' },
        { step: 4, flowchartNode: 'MOVE_DISK', highlightLines: [5], pointers: {}, variables: { disk: 3, from: 'A', to: 'C' }, array: [3], activeIndices: [2], status: 'success', expression: 'Move Disk 3: Peg A ➔ Peg C (Largest disk in position!)', explanation: 'Move largest disk 3 from Peg A to destination Peg C!' },
        { step: 5, flowchartNode: 'END', highlightLines: [8], pointers: {}, variables: { completed: true, totalMoves: 7 }, array: [3, 2, 1], activeIndices: [0, 1, 2], status: 'success', expression: 'Tower of Hanoi Solved! All 3 disks on Peg C', explanation: 'Recursion completed in 2^3 - 1 = 7 optimal moves. Peg C holds all disks in order.' }
      ];
    }

    // 11. Dynamic Programming Table
    if (algo === 'DP_TABLE') {
      const dp = [1, 1, 2, 3, 5, 8];
      return [
        { step: 1, flowchartNode: 'START', highlightLines: [3], pointers: { i: 0 }, variables: { n: 5, 'dp[0]': 1, 'dp[1]': 1 }, array: [1, 1, 0, 0, 0, 0], activeIndices: [0, 1], status: 'info', expression: 'Initialize DP table: dp[0] = 1, dp[1] = 1', explanation: 'Allocate DP table and set base cases: 1 way to reach step 0, 1 way to reach step 1.' },
        { step: 2, flowchartNode: 'COMPUTE_CELL', highlightLines: [6, 7], pointers: { i: 2 }, variables: { i: 2, 'dp[2]': 2, calculation: '1 + 1 = 2' }, array: [1, 1, 2, 0, 0, 0], activeIndices: [2], status: 'warning', expression: 'dp[2] = dp[1] + dp[0] = 1 + 1 = 2', explanation: 'Transition: dp[2] is sum of previous two steps = 2 ways.' },
        { step: 3, flowchartNode: 'COMPUTE_CELL', highlightLines: [6, 7], pointers: { i: 3 }, variables: { i: 3, 'dp[3]': 3, calculation: '2 + 1 = 3' }, array: [1, 1, 2, 3, 0, 0], activeIndices: [3], status: 'warning', expression: 'dp[3] = dp[2] + dp[1] = 2 + 1 = 3', explanation: 'Transition: dp[3] = 2 + 1 = 3 ways.' },
        { step: 4, flowchartNode: 'COMPUTE_CELL', highlightLines: [6, 7], pointers: { i: 5 }, variables: { i: 5, 'dp[5]': 8, calculation: '5 + 3 = 8' }, array: dp, activeIndices: [5], status: 'success', expression: 'dp[5] = dp[4] + dp[3] = 5 + 3 = 8 (Final Step)', explanation: 'Final state computed: 8 distinct ways to climb 5 stairs.' },
        { step: 5, flowchartNode: 'END', highlightLines: [9], pointers: {}, variables: { ways: 8, optimal: true }, array: dp, activeIndices: [5], status: 'success', expression: 'DP Tabulation Complete! Return dp[5] = 8', explanation: 'Tabulation finished in O(n) time and O(n) space. Result: 8.' }
      ];
    }

    // Default Fallback: Generic Array Steps
    const fallbackArr = (inputData.array && inputData.array.length > 0) ? [...inputData.array] : [10, 20, 30, 40];
    return [
      {
        step: 1,
        flowchartNode: 'START',
        highlightLines: [1, 2],
        pointers: { i: 0 },
        variables: { i: 0, val: fallbackArr[0] },
        array: [...fallbackArr],
        activeIndices: [0],
        status: 'info',
        expression: `Starting execution at index 0 (val: ${fallbackArr[0]})`,
        explanation: `Initialize algorithm state on dataset: [${fallbackArr.join(', ')}].`
      },
      {
        step: 2,
        flowchartNode: 'PROCESS',
        highlightLines: [4, 5],
        pointers: { i: Math.min(1, fallbackArr.length - 1) },
        variables: { i: 1, val: fallbackArr[1] || fallbackArr[0] },
        array: [...fallbackArr],
        activeIndices: [1],
        status: 'warning',
        expression: `Processing element at index 1`,
        explanation: `Advancing pointer and executing invariant step.`
      },
      {
        step: 3,
        flowchartNode: 'END',
        highlightLines: [8],
        pointers: {},
        variables: { status: 'complete' },
        array: [...fallbackArr],
        activeIndices: fallbackArr.map((_, i) => i),
        status: 'success',
        expression: `Execution completed successfully`,
        explanation: `Algorithm dry run finished with verified state.`
      }
    ];
  }

  /**
   * Helper template factory for creating rich questions with code & steps
   */
  static getTemplateForType(visualizerType) {
    const t = (visualizerType || 'ARRAY_TWO_POINTER').toUpperCase();

    if (t === 'BINARY_SEARCH') {
      return {
        title: 'Binary Search in Sorted Array',
        difficulty: 'EASY',
        statement: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.',
        constraints: '1 <= nums.length <= 10^4\n-10^4 <= nums[i], target <= 10^4\nAll integers in nums are unique and sorted.',
        examples: '[{"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4", "explanation": "9 exists in nums and its index is 4"}]',
        defaultInput: '{"array": [-1, 0, 3, 5, 9, 12], "target": 9}',
        bruteApproach: 'Perform linear search across the entire array in O(n) time.',
        bruteCode: 'public int search(int[] nums, int target) {\n    for (int i = 0; i < nums.length; i++) {\n        if (nums[i] == target) return i;\n    }\n    return -1;\n}',
        bruteTime: 'O(n)',
        bruteSpace: 'O(1)',
        optApproach: 'Halve the search space at each step by comparing target with the middle element.',
        optCode: 'public class Solution {\n    public int search(int[] nums, int target) {\n        int low = 0;\n        int high = nums.length - 1;\n        \n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (nums[mid] == target) {\n                return mid;\n            } else if (nums[mid] < target) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        return -1;\n    }\n}',
        optTime: 'O(log n)',
        optSpace: 'O(1)'
      };
    }

    if (t === 'SORTING') {
      return {
        title: 'Bubble Sort In-Place',
        difficulty: 'EASY',
        statement: 'Given an unsorted integer array, sort the array in non-decreasing order by repeatedly swapping adjacent elements that are out of order.',
        constraints: '1 <= nums.length <= 1000\n-10^5 <= nums[i] <= 10^5',
        examples: '[{"input": "nums = [5, 1, 4, 2, 8]", "output": "[1, 2, 4, 5, 8]"}]',
        defaultInput: '{"array": [5, 1, 4, 2, 8]}',
        bruteApproach: 'Perform n-1 passes, comparing adjacent pairs and bubbling maximums rightward.',
        bruteCode: 'public void bubbleSort(int[] nums) {\n    for (int i = 0; i < nums.length; i++) {\n        for (int j = 0; j < nums.length - 1; j++) {\n            if (nums[j] > nums[j + 1]) {\n                int t = nums[j]; nums[j] = nums[j + 1]; nums[j + 1] = t;\n            }\n        }\n    }\n}',
        bruteTime: 'O(n^2)',
        bruteSpace: 'O(1)',
        optApproach: 'Track whether any swaps were made in the inner loop to early-exit if already sorted.',
        optCode: 'public class Solution {\n    public int[] sortArray(int[] nums) {\n        int n = nums.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (nums[j] > nums[j + 1]) {\n                    int temp = nums[j];\n                    nums[j] = nums[j + 1];\n                    nums[j + 1] = temp;\n                }\n            }\n        }\n        return nums;\n    }\n}',
        optTime: 'O(n^2)',
        optSpace: 'O(1)'
      };
    }

    // Default: ARRAY_TWO_POINTER
    return {
      title: 'Two Sum - Sorted Array Two Pointer',
      difficulty: 'EASY',
      statement: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.',
      constraints: '2 <= numbers.length <= 3 * 10^4\n-1000 <= numbers[i], target <= 1000',
      examples: '[{"input": "numbers = [2, 7, 11, 15], target = 9", "output": "[1, 2]"}]',
      defaultInput: '{"array": [2, 7, 11, 15], "target": 9}',
      bruteApproach: 'Examine all n*(n-1)/2 pairs using nested loops.',
      bruteCode: 'public int[] twoSum(int[] nums, int target) {\n    for (int i = 0; i < nums.length; i++) {\n        for (int j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] == target) return new int[]{i + 1, j + 1};\n        }\n    }\n    return new int[]{-1, -1};\n}',
      bruteTime: 'O(n^2)',
      bruteSpace: 'O(1)',
      optApproach: 'Place two pointers at the boundaries and narrow inward according to whether sum is smaller or larger than target.',
      optCode: 'public class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int left = 0;\n        int right = numbers.length - 1;\n        \n        while (left < right) {\n            int sum = numbers[left] + numbers[right];\n            if (sum == target) {\n                return new int[]{left + 1, right + 1};\n            } else if (sum < target) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return new int[]{-1, -1};\n    }\n}',
      optTime: 'O(n)',
      optSpace: 'O(1)'
    };
  }
}

window.VisualizerEngine = VisualizerEngine;
