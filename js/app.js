/* js/app.js v8.3 - control module lives in the deck, code panel, overview windows, custom resize, mobile */

// --- GLOBALS ---
let selectedId = null;
let previewId = null;
let nodeMap = {};
let labState = {
    text: "Philipelepeleplein",
    params: { a: 0.5, b: 0.5, c: 0.1 },
    hue: 0
};

// ==========================================
// 1. MAIN LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof siteData === 'undefined') return;

    // --- REFERENCES ---
    const bgFrame = document.getElementById('background-iframe');
    const winFrameClass = 'win-iframe';
    const inputEl = document.getElementById('global-text-input');

    // --- A. BRIDGE FUNCTION ---
    function broadcastState() {
        const message = { type: 'UPDATE_STATE', ...labState };
        if (bgFrame.contentWindow) bgFrame.contentWindow.postMessage(message, '*');
        const winFrame = document.querySelector(`.${winFrameClass}`);
        if (winFrame && winFrame.contentWindow) winFrame.contentWindow.postMessage(message, '*');
    }

    // --- B. INPUTS ---
    if (inputEl) {
        inputEl.addEventListener('input', (e) => {
            labState.text = e.target.value.trim() || "EMPTY";
            broadcastState();
        });
    }

    ['param-a', 'param-b', 'param-c'].forEach(id => {
        const slider = document.getElementById(id);
        if(slider) {
            slider.addEventListener('input', () => {
                if(id === 'param-a') labState.params.a = slider.value / 100;
                if(id === 'param-b') labState.params.b = slider.value / 100;
                if(id === 'param-c') labState.params.c = slider.value / 100;
                broadcastState();
            });
        }
    });

    // ==========================================
    // NEW: EXPORT LOGIC
    // ==========================================
    document.querySelectorAll('.btn-mini[data-fmt]').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.fmt;
            exportGraph(format);
        });
    });

    function exportGraph(format) {
        const svgEl = document.querySelector('#graph-layer svg');
        if (!svgEl) { alert("No graph found!"); return; }

        // 1. Подготовка SVG данных
        // Клонируем ноду, чтобы не ломать реальный граф при очистке стилей
        const clonedSvg = svgEl.cloneNode(true);
        // ВАЖНО: Нужно явно прописать стили внутрь SVG для корректного экспорта,
        // так как внешний CSS файл не применится к сохраненному SVG/Canvas.
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clonedSvg.querySelectorAll('*').forEach(el => {
             const computedStyle = window.getComputedStyle(el);
             if(computedStyle.fill) el.style.fill = computedStyle.fill;
             if(computedStyle.stroke) el.style.stroke = computedStyle.stroke;
             if(computedStyle.strokeWidth) el.style.strokeWidth = computedStyle.strokeWidth;
             if(computedStyle.fontFamily) el.style.fontFamily = computedStyle.fontFamily;
             if(computedStyle.fontSize) el.style.fontSize = computedStyle.fontSize;
             if(computedStyle.filter) el.style.filter = computedStyle.filter;
             if(computedStyle.textAnchor) el.setAttribute('text-anchor', computedStyle.textAnchor);
             if(computedStyle.dominantBaseline) el.setAttribute('dominant-baseline', computedStyle.dominantBaseline);
        });
        
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSvg);

        // Добавляем CSS шрифты внутрь SVG для надежности (не всегда срабатывает, но полезно)
        svgString = svgString.replace('>', `><style>@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap'); text { font-family: 'Share Tech Mono', monospace; }</style>`);

        const fileName = `typography_lab_${new Date().getTime()}`;

        if (format === 'svg') {
            // --- SVG EXPORT (Простой) ---
            const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            triggerDownload(URL.createObjectURL(blob), `${fileName}.svg`);
        } else {
            // --- RASTER EXPORT (PNG/JPG через Canvas) ---
            const img = new Image();
            // Конвертируем SVG строку в base64, чтобы скормить её картинке
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                // Увеличиваем разрешение для качества (x2)
                const scale = 2;
                canvas.width = svgEl.clientWidth * scale;
                canvas.height = svgEl.clientHeight * scale;
                const ctx = canvas.getContext('2d');
                
                // Заливаем фон черным для JPG (иначе будет прозрачный/черный)
                if(format === 'jpeg') {
                    ctx.fillStyle = '#050508';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);
                
                const imgURL = canvas.toDataURL(`image/${format}`, 0.9);
                triggerDownload(imgURL, `${fileName}.${format}`);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
    }

    // Вспомогательная функция для скачивания
    function triggerDownload(url, name) {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    // ==========================================


    // --- C. MENU BUILDER (nested lists, lines drawn in CSS) ---
    const treeContainer = document.getElementById('tree-container');
    const menu = document.getElementById('menu-panel');
    const parentOf = {};
    function buildMenu(data, parentEl, pid = null) {
        const ul = document.createElement('ul');
        ul.className = pid === null ? 'tree' : 'tree-branch';
        data.forEach(item => {
            parentOf[item.id] = pid;
            const li = document.createElement('li');
            li.dataset.node = item.id;
            const text = document.createElement('span');
            text.className = 'clickable-text' + (item.url ? ' has-demo' : '') + (item.type ? ' tree-' + item.type : '');
            text.textContent = item.label;
            text.dataset.id = item.id;
            text.addEventListener('mouseenter', () => handleHover(item.id));
            text.addEventListener('mouseleave', () => handleMouseLeave());
            text.addEventListener('click', (e) => { e.stopPropagation(); handleClick(item.id); });
            li.appendChild(text);
            if (item.children) buildMenu(item.children, li, item.id);
            ul.appendChild(li);
        });
        parentEl.appendChild(ul);
    }
    buildMenu(siteData, treeContainer);

    // root -> ... -> id
    function pathTo(id) {
        const out = [];
        let cur = id;
        while (cur !== null && cur !== undefined) { out.push(cur); cur = parentOf[cur]; }
        return out;
    }

    // kind: 'act' (selected) or 'pv' (hover preview)
    function markMenuPath(id, kind) {
        treeContainer.querySelectorAll(`li.${kind}-path, li.${kind}-thru`)
            .forEach(li => li.classList.remove(`${kind}-path`, `${kind}-thru`));
        if (!id) return;
        pathTo(id).forEach(nid => {
            const li = treeContainer.querySelector(`li[data-node="${CSS.escape(nid)}"]`);
            if (!li) return;
            li.classList.add(`${kind}-path`);
            // the vertical line passes along every earlier sibling on its way down
            let s = li.previousElementSibling;
            while (s) { s.classList.add(`${kind}-thru`); s = s.previousElementSibling; }
        });
    }

    // --- D. D3 GRAPH ---
    const nodes = [], links = [];
    function flatten(data, pid = null) {
        data.forEach(d => {
            nodeMap[d.id] = d;
            const short = d.label.length > 15 ? d.label.substring(0,15)+'..' : d.label;
            nodes.push({ id: d.id, label: short, type: d.type || 'cat', w: short.length * 7 + 20 });
            if (pid) links.push({ source: pid, target: d.id });
            if (d.children) flatten(d.children, d.id);
        });
    }
    flatten(siteData);

    const width = window.innerWidth, height = window.innerHeight;
    const svg = d3.select('#graph-layer').append('svg').attr('width', '100%').attr('height', '100%');
    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);
    
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width * (width <= 760 ? 0.5 : 0.6), height * 0.5))
        .force('collide', d3.forceCollide().radius(d => d.w/2 + 10));
    
    const link = g.append('g').selectAll('line').data(links).enter().append('line').attr('stroke', '#00FFFF').attr('stroke-opacity', 0.4);
    const node = g.append('g').selectAll('rect').data(nodes).enter().append('rect')
        .attr('width', d => d.w).attr('height', 20).attr('rx', 4)
        .attr('class', d => `node-${d.type}`).attr('id', d => `node-${d.id}`)
        .call(d3.drag().on('start', dragStart).on('drag', dragging).on('end', dragEnd));
    
    node.on('mouseenter', (e, d) => handleHover(d.id))
        .on('mouseleave', handleMouseLeave)
        .on('click', (e, d) => { e.stopPropagation(); handleClick(d.id); });

    const label = g.append('g').selectAll('text').data(nodes).enter().append('text')
        .text(d => d.label)
        .attr('class', 'd3-label')
        .attr('dy', 1)
        .attr('text-anchor', 'middle'); 

    simulation.on('tick', () => {
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('x', d => d.x - d.w/2).attr('y', d => d.y - 10);
        label.attr('x', d => d.x).attr('y', d => d.y);
    });
    
    // A plain click no longer wakes the simulation (that was the graph "jumping" on every click).
    // It only reheats once the node is actually being dragged.
    function dragStart(e, d) { d.fx = d.x; d.fy = d.y; d._moved = false; }
    function dragging(e, d) {
        if (!d._moved) { d._moved = true; if (!e.active) simulation.alphaTarget(0.3).restart(); }
        d.fx = e.x; d.fy = e.y;
    }
    function dragEnd(e, d) { if (d._moved && !e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; d._moved = false; }

    function markGraphPath(id, kind) {
        const onPath = new Set(id ? pathTo(id) : []);
        node.classed(`${kind}-node`, d => onPath.has(d.id));
        label.classed(`${kind}-label`, d => onPath.has(d.id));
        link.classed(`${kind}-link`, d => onPath.has(d.source.id) && onPath.has(d.target.id));
        if (kind === 'act') svg.classed('has-sel', !!id);
    }

    // keep the graph centred when the browser window changes size
    window.addEventListener('resize', () => {
        simulation.force('center', d3.forceCenter(window.innerWidth * (window.innerWidth <= 760 ? 0.5 : 0.6), window.innerHeight * 0.5));
        simulation.alpha(0.1).restart();
    });

    // --- E. VISUALS ---
    function handleHover(id) {
        if (!nodeMap[id]) return;
        previewId = id;
        updateVisuals(id, true);
    }
    function handleMouseLeave() {
        // just drop the preview; the selected path stays as it is (no re-scroll of the menu)
        previewId = null;
        resetVisuals();
    }
    function handleClick(id) {
        if (!nodeMap[id]) return;
        selectedId = id;
        updateVisuals(id, false);
        document.body.classList.remove('menu-open'); // mobile: close the index drawer
        const data = nodeMap[id];
        labState.hue = (parseInt(id.replace(/\D/g,'') || '0') * 45) % 360;
        showWindow(data);
        if (data.url) { bgFrame.src = data.url; bgFrame.onload = () => broadcastState(); }
        else { bgFrame.src = "about:blank"; }
    }
    function updateVisuals(id, isPreview) {
        if (isPreview) {
            d3.selectAll('rect').classed('preview-node', false);
            d3.select(`#node-${id}`).classed('preview-node', true);
            document.querySelectorAll('.clickable-text.preview-mode').forEach(el => el.classList.remove('preview-mode'));
            const pv = document.querySelector(`.clickable-text[data-id="${id}"]`);
            if (pv) pv.classList.add('preview-mode');
            markMenuPath(id, 'pv');
            markGraphPath(id, 'pv');
            return;
        }
        resetVisuals();
        d3.selectAll('rect').classed('active-node', false);
        d3.select(`#node-${id}`).classed('active-node', true);
        document.querySelectorAll('.clickable-text.active').forEach(el => el.classList.remove('active'));
        const menuEl = document.querySelector(`.clickable-text[data-id="${id}"]`);
        if (menuEl) {
            menuEl.classList.add('active');
            menuEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        markMenuPath(id, 'act');
        markGraphPath(id, 'act');
    }
    function resetVisuals() {
        d3.selectAll('rect').classed('preview-node', false);
        document.querySelectorAll('.clickable-text').forEach(el => el.classList.remove('preview-mode'));
        markMenuPath(null, 'pv');
        markGraphPath(null, 'pv');
    }
    function clearSelection() {
        selectedId = null;
        d3.selectAll('.active-node').classed('active-node', false);
        document.querySelectorAll('.active.clickable-text').forEach(el => el.classList.remove('active'));
        markMenuPath(null, 'act');
        markGraphPath(null, 'act');
    }

    // ==========================================
    // F. WINDOW
    // ==========================================
    const win = document.getElementById('window-container');
    const contentDiv = document.getElementById('win-content');
    const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

    function closeWindow() {
        win.style.display = 'none';
        bgFrame.src = "about:blank";
        unmountLocal();
        clearSelection();
    }
    document.getElementById('win-close').onclick = closeWindow;

    function countDemos(item) { return item.children ? item.children.reduce((s, c) => s + countDemos(c), 0) : (item.url ? 1 : 0); }
    function countLeaves(item) { return item.children ? item.children.reduce((s, c) => s + countLeaves(c), 0) : 1; }
    function tagFor(item) {
        if (item.children) { const d = countDemos(item); return { text: `${d}/${countLeaves(item)} DEMO`, live: d > 0 }; }
        return item.url ? { text: 'DEMO', live: true } : { text: 'SOON', live: false };
    }

    function showWindow(data) {
        document.getElementById('win-title').textContent = data.label;
        unmountLocal();
        contentDiv.innerHTML = '';
        const desc = document.createElement('div');
        desc.className = 'win-desc';
        desc.textContent = data.description || '';
        contentDiv.appendChild(desc);

        if (data.url) {
            const frame = document.createElement('iframe');
            frame.className = 'win-iframe';
            frame.src = data.url;
            frame.onload = () => broadcastState();
            contentDiv.appendChild(frame);
        } else if (data.children) {
            // section nodes (Basics, JS Libraries...) list what is inside instead of opening empty
            const grid = document.createElement('div');
            grid.className = 'win-overview';
            data.children.forEach(k => {
                const tag = tagFor(k);
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'ov-item' + (tag.live ? ' live' : '');
                b.dataset.goto = k.id;
                b.innerHTML = '<span class="ov-top"><span class="ov-name"></span><span class="ov-tag"></span></span><span class="ov-desc"></span>';
                b.querySelector('.ov-name').textContent = k.label;
                b.querySelector('.ov-tag').textContent = tag.text;
                b.querySelector('.ov-desc').textContent = k.description || '';
                grid.appendChild(b);
            });
            contentDiv.appendChild(grid);
        } else {
            const empty = document.createElement('div');
            empty.className = 'win-empty';
            empty.innerHTML = '<div class="we-tag">NO DEMO YET</div><div>This node is on the map, the experiment is still to be built.</div>';
            contentDiv.appendChild(empty);
        }

        win.style.display = 'flex';
        if (!win.dataset.placed && !isMobile()) {
            win.style.left = Math.max(10, (window.innerWidth - win.offsetWidth) / 2) + 'px';
            win.style.top = Math.max(10, (window.innerHeight - win.offsetHeight) / 2) + 'px';
            win.dataset.placed = '1';
        }
        win.style.animation = 'none';
        void win.offsetWidth;
        win.style.animation = '';
    }
    contentDiv.addEventListener('click', (e) => {
        const b = e.target.closest('[data-goto]');
        if (b) handleClick(b.dataset.goto);
    });

    // --- DRAG (pointer events: mouse, pen and touch) ---
    // Pointer capture + iframes switched off while dragging, so the cursor
    // passing over a demo no longer "drops" the panel.
    function makeDraggable(el, handle, opts = {}) {
        if (!el || !handle) return;
        let s = null;
        handle.style.touchAction = 'none';
        handle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 || e.target.closest('button, input, select')) return;
            if (opts.desktopOnly && isMobile()) return;
            const r = el.getBoundingClientRect();
            s = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, id: e.pointerId };
            Object.assign(el.style, { animation: 'none', position: 'fixed', transform: 'none', margin: '0', right: 'auto', bottom: 'auto', left: r.left + 'px', top: r.top + 'px' });
            try { handle.setPointerCapture(e.pointerId); } catch (_) {}
            document.body.classList.add('is-dragging');
            e.preventDefault();
        });
        handle.addEventListener('pointermove', (e) => {
            if (!s || e.pointerId !== s.id) return;
            const l = Math.min(window.innerWidth - 60, Math.max(60 - el.offsetWidth, s.l + e.clientX - s.x));
            const t = Math.min(window.innerHeight - 30, Math.max(0, s.t + e.clientY - s.y));
            el.style.left = l + 'px';
            el.style.top = t + 'px';
        });
        const end = () => { if (s) { s = null; document.body.classList.remove('is-dragging'); } };
        handle.addEventListener('pointerup', end);
        handle.addEventListener('pointercancel', end);
    }

    // --- WINDOW RESIZE: own grip (the native corner was eaten by the iframe) ---
    const grip = document.createElement('div');
    grip.className = 'win-grip';
    grip.title = 'Resize';
    win.appendChild(grip);
    let rs = null;
    grip.addEventListener('pointerdown', (e) => {
        if (isMobile()) return;
        const r = win.getBoundingClientRect();
        rs = { x: e.clientX, y: e.clientY, w: r.width, h: r.height, id: e.pointerId };
        Object.assign(win.style, { animation: 'none', left: r.left + 'px', top: r.top + 'px' });
        grip.setPointerCapture(e.pointerId);
        document.body.classList.add('is-dragging');
        e.preventDefault();
        e.stopPropagation();
    });
    grip.addEventListener('pointermove', (e) => {
        if (!rs || e.pointerId !== rs.id) return;
        win.style.width = Math.max(340, rs.w + e.clientX - rs.x) + 'px';
        win.style.height = Math.max(240, rs.h + e.clientY - rs.y) + 'px';
    });
    const endResize = () => { if (rs) { rs = null; document.body.classList.remove('is-dragging'); } };
    grip.addEventListener('pointerup', endResize);
    grip.addEventListener('pointercancel', endResize);

    makeDraggable(win, document.getElementById('win-header'), { desktopOnly: true });
    const deckEl = document.getElementById('control-deck');
    const deckHeader = document.getElementById('deck-header');
    makeDraggable(deckEl, deckHeader, { desktopOnly: true });
    makeDraggable(document.getElementById('input-module'), document.getElementById('input-header'), { desktopOnly: true });

    // sidebar width
    const resizer = document.getElementById('resizer');
    if (resizer) {
        let on = false;
        resizer.style.touchAction = 'none';
        resizer.addEventListener('pointerdown', (e) => { on = true; resizer.setPointerCapture(e.pointerId); document.body.classList.add('is-dragging'); });
        resizer.addEventListener('pointermove', (e) => { if (on && e.clientX > 200 && e.clientX < 800) menu.style.width = e.clientX + 'px'; });
        const stop = () => { on = false; document.body.classList.remove('is-dragging'); };
        resizer.addEventListener('pointerup', stop);
        resizer.addEventListener('pointercancel', stop);
    }

    // --- MOBILE: index drawer + collapsible bottom deck ---
    const menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.className = 'menu-toggle';
    menuToggle.textContent = '≡ INDEX';
    menuToggle.onclick = () => document.body.classList.toggle('menu-open');
    document.body.appendChild(menuToggle);
    if (isMobile()) deckEl.classList.add('deck-min');
    deckHeader.addEventListener('click', () => { if (isMobile()) deckEl.classList.toggle('deck-min'); });

    // ==========================================
    // G. CONTROL MODULE (one, in the deck)
    // The open showcase describes its own parameters (js/lab-bridge.js -> MANIFEST),
    // the deck turns that description into controls. Nothing here is showcase-specific.
    // ==========================================
    const deckLocal = document.createElement('div');
    deckLocal.className = 'deck-local';
    deckHeader.after(deckLocal);

    const codePanel = document.createElement('div');
    codePanel.className = 'code-panel';
    codePanel.hidden = true;
    codePanel.innerHTML = '<div class="code-header"><span>:: CODE <i>LIVE</i></span><button type="button" class="code-close" aria-label="Close code">×</button></div><pre class="code-body"></pre>';
    document.body.appendChild(codePanel);
    makeDraggable(codePanel, codePanel.querySelector('.code-header'), { desktopOnly: true });
    const codeBody = codePanel.querySelector('.code-body');
    let codeOpen = false;
    try { codeOpen = localStorage.getItem('tlab.codeOpen') === '1'; } catch (e) {}
    function setCodeOpen(v) {
        codeOpen = v;
        try { localStorage.setItem('tlab.codeOpen', v ? '1' : '0'); } catch (e) {}
        codePanel.hidden = !(v && local);
        const b = deckLocal.querySelector('[data-code-toggle]');
        if (b) b.classList.toggle('on', v);
    }
    codePanel.querySelector('.code-close').onclick = () => setCodeOpen(false);

    const LS_KEY = 'tlab.v3.params.';
    let local = null; // { manifest, values, url, preset, collapsed:Set, title }

    function defaultsOf(m) { const v = {}; m.params.forEach(p => { v[p.id] = p.value; }); return v; }
    function startValues(m) {
        const v = defaultsOf(m);
        if (m.initial && m.presets && m.presets[m.initial]) Object.assign(v, m.presets[m.initial]);
        return v;
    }
    function loadSaved(url) { try { return JSON.parse(localStorage.getItem(LS_KEY + url) || 'null'); } catch (e) { return null; } }
    let saveTimer = null;
    function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => { if (local) { try { localStorage.setItem(LS_KEY + local.url, JSON.stringify(local.values)); } catch (e) {} } }, 300);
    }
    function pushParams() {
        if (!local) return;
        const msg = { type: 'SET_PARAMS', values: local.values };
        const wf = document.querySelector('.win-iframe');
        [wf && wf.contentWindow, bgFrame.contentWindow].forEach(w => { try { if (w) w.postMessage(msg, '*'); } catch (e) {} });
    }
    let pushRaf = 0;
    function schedulePush() { if (!pushRaf) pushRaf = requestAnimationFrame(() => { pushRaf = 0; pushParams(); }); }

    window.addEventListener('message', (e) => {
        const d = e.data;
        if (!d || typeof d !== 'object') return;
        const wf = document.querySelector('.win-iframe');
        const fromWin = wf && e.source === wf.contentWindow;
        if (d.type === 'MANIFEST') {
            if (fromWin) mountLocal(d.manifest);
            else if (e.source === bgFrame.contentWindow) pushParams(); // keep the blurred background in sync
        } else if (d.type === 'CODE' && fromWin) {
            codeBody.textContent = String(d.text || '');
        }
    });

    function mountLocal(m) {
        if (!m || !Array.isArray(m.params) || !Array.isArray(m.groups)) return;
        const node = nodeMap[selectedId] || {};
        const url = node.url || 'unknown';
        const values = startValues(m);
        const saved = loadSaved(url);
        if (saved) m.params.forEach(p => { if (p.id in saved) values[p.id] = saved[p.id]; });
        local = { manifest: m, values, url, preset: saved ? null : (m.initial || null), collapsed: new Set(), title: node.label || '' };
        deckEl.classList.add('has-local');
        deckEl.classList.remove('deck-min');
        renderLocal();
        setCodeOpen(codeOpen);
        pushParams();
    }
    function unmountLocal() {
        local = null;
        deckLocal.innerHTML = '';
        deckEl.classList.remove('has-local');
        codePanel.hidden = true;
        codeBody.textContent = '';
    }

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    function fmtVal(p, v) {
        const step = p.step || 1;
        const dec = step >= 1 ? 0 : String(step).split('.')[1].length;
        return (+v).toFixed(dec) + (p.unit || '');
    }
    const visible = (p, v) => !p.when || p.when.in.includes(v[p.when.param]);
    function paramHTML(p, val) {
        const id = esc(p.id), label = esc(p.label || p.id);
        if (p.type === 'range') {
            return `<label class="ctl-p"><span class="ctl-l">${label}<output data-out="${id}">${fmtVal(p, val)}</output></span>
                <input type="range" data-p="${id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${val}"></label>`;
        }
        if (p.type === 'select') {
            return `<div class="ctl-p"><span class="ctl-l">${label}</span><div class="ctl-chips">${
                p.options.map(o => `<button type="button" class="ctl-chip ${o === val ? 'on' : ''}" data-p="${id}" data-v="${esc(o)}">${esc(o)}</button>`).join('')
            }</div></div>`;
        }
        if (p.type === 'color') {
            return `<label class="ctl-p ctl-row"><span class="ctl-l">${label}</span>
                <span class="ctl-color"><output data-out="${id}">${esc(val)}</output><input type="color" data-p="${id}" value="${esc(val)}"></span></label>`;
        }
        return '';
    }
    function renderLocal() {
        if (!local) return;
        const { manifest: m, values: v } = local;
        const keep = deckEl.scrollTop;
        let h = `<div class="dl-top"><span class="dl-name">${esc(local.title.toUpperCase())}</span>
            <button type="button" class="ctl-chip ${codeOpen ? 'on' : ''}" data-code-toggle>&lt;/&gt; CODE</button></div>`;
        if (m.presets) {
            h += `<div class="ctl-sec">PRESETS</div><div class="ctl-chips">${
                Object.keys(m.presets).map(k => `<button type="button" class="ctl-chip ${local.preset === k ? 'on' : ''}" data-preset="${esc(k)}">${esc(k)}</button>`).join('')
            }<button type="button" class="ctl-chip ghost" data-preset="__reset">RESET</button></div>`;
        }
        // optional layers as one row of switches, so OFF layers cost no scroll at all
        const layers = m.groups.filter(g => g.toggle);
        if (layers.length) {
            h += `<div class="ctl-sec">LAYERS</div><div class="ctl-chips">${
                layers.map(g => `<button type="button" class="ctl-chip layer ${v[g.toggle] ? 'on' : ''}" data-toggle="${esc(g.toggle)}" aria-pressed="${!!v[g.toggle]}">${esc(g.label)}</button>`).join('')
            }</div>`;
        }
        // settings: base groups + switched-on layers, each can be folded
        m.groups.filter(g => !g.toggle || v[g.toggle]).forEach(g => {
            const params = m.params.filter(p => p.group === g.id && p.id !== g.toggle && visible(p, v));
            if (!params.length) return;
            const folded = local.collapsed.has(g.id);
            h += `<div class="ctl-sect ${folded ? 'collapsed' : ''}"><button type="button" class="ctl-shead" data-fold="${esc(g.id)}">${esc(g.label)}<span class="car">${folded ? '+' : '–'}</span></button><div class="ctl-sbody">`;
            params.forEach(p => { h += paramHTML(p, v[p.id]); });
            h += `</div></div>`;
        });
        deckLocal.innerHTML = h;
        deckEl.scrollTop = keep;
    }
    function changed(rerender) {
        if (rerender) renderLocal();
        schedulePush();
        scheduleSave();
    }
    function dropPreset() {
        if (!local || !local.preset) return;
        local.preset = null;
        deckLocal.querySelectorAll('[data-preset].on').forEach(b => b.classList.remove('on'));
    }

    deckLocal.addEventListener('input', (e) => {
        const el = e.target;
        if (!local || !el.dataset || !el.dataset.p) return;
        const p = local.manifest.params.find(x => x.id === el.dataset.p);
        if (!p) return;
        local.values[p.id] = p.type === 'range' ? +el.value : el.value;
        const out = deckLocal.querySelector(`[data-out="${CSS.escape(p.id)}"]`);
        if (out) out.textContent = p.type === 'range' ? fmtVal(p, el.value) : el.value;
        dropPreset();
        changed(false);
    });
    deckLocal.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !local) return;
        if (b.hasAttribute('data-code-toggle')) { setCodeOpen(!codeOpen); return; }
        if (b.dataset.fold) {
            local.collapsed.has(b.dataset.fold) ? local.collapsed.delete(b.dataset.fold) : local.collapsed.add(b.dataset.fold);
            renderLocal();
            return;
        }
        if (b.dataset.preset) {
            const k = b.dataset.preset, m = local.manifest;
            local.values = k === '__reset' ? defaultsOf(m) : Object.assign(defaultsOf(m), m.presets[k]);
            local.preset = k === '__reset' ? null : k;
            changed(true);
        } else if (b.dataset.toggle) {
            local.values[b.dataset.toggle] = !local.values[b.dataset.toggle];
            dropPreset();
            changed(true);
        } else if (b.dataset.p && b.dataset.v !== undefined) {
            local.values[b.dataset.p] = b.dataset.v;
            dropPreset();
            changed(true);
        }
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && win.style.display === 'flex') closeWindow(); });
});
