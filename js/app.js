/* js/app.js v8.1 - Tree lines + path highlight, calm graph, window resize fix */

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
        .force('center', d3.forceCenter(width * 0.6, height * 0.5))
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
        simulation.force('center', d3.forceCenter(window.innerWidth * 0.6, window.innerHeight * 0.5));
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

    // --- F. WINDOW & DRAG LOGIC ---
    const win = document.getElementById('window-container');
    document.getElementById('win-close').onclick = () => {
        win.style.display = 'none';
        bgFrame.src = "about:blank";
        clearSelection();
    };

    function showWindow(data) {
        document.getElementById('win-title').textContent = data.label;
        const contentDiv = document.getElementById('win-content');
        contentDiv.innerHTML = `<div class="win-desc">${data.description}</div>`;
        if (data.url) {
            const frame = document.createElement('iframe');
            frame.className = 'win-iframe';
            frame.src = data.url;
            frame.onload = () => broadcastState();
            contentDiv.appendChild(frame);
        }
        win.style.display = 'flex';
        // First open: place the window in pixels (no translate(-50%)), so the native
        // resize corner grows the window normally instead of in both directions.
        if (!win.dataset.placed) {
            win.style.left = Math.max(10, (window.innerWidth - win.offsetWidth) / 2) + 'px';
            win.style.top = Math.max(10, (window.innerHeight - win.offsetHeight) / 2) + 'px';
            win.dataset.placed = '1';
        }
        win.style.animation = 'none';
        void win.offsetWidth;
        win.style.animation = '';
    }

    // --- UNIVERSAL DRAG FUNCTION (FIXED) ---
    function makeDraggable(element, handle) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // 1. ВАЖНО: Отключаем CSS-анимацию
            element.style.animation = 'none';
            
            // 2. Получаем точные координаты
            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            // 3. Переключаем на фиксированное позиционирование
            element.style.position = 'fixed'; 
            element.style.transform = 'none';
            element.style.margin = '0';
            
            element.style.left = initialLeft + 'px';
            element.style.top = initialTop + 'px';
            
            document.body.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = (initialLeft + dx) + 'px';
            element.style.top = (initialTop + dy) + 'px';
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = 'default';
            }
        });
    }

    makeDraggable(document.getElementById('window-container'), document.getElementById('win-header'));
    const deck = document.getElementById('control-deck');
    const deckHeader = document.getElementById('deck-header');
    if (deck && deckHeader) makeDraggable(deck, deckHeader);
    const inputMod = document.getElementById('input-module');
    const inputHead = document.getElementById('input-header');
    if (inputMod && inputHead) makeDraggable(inputMod, inputHead);

    const resizer = document.getElementById('resizer');
    let isResizing = false;
    if(resizer) {
        resizer.onmousedown = () => { isResizing = true; document.body.style.cursor = 'ew-resize'; };
        window.addEventListener('mousemove', e => {
            if (isResizing && e.clientX > 200 && e.clientX < 800) menu.style.width = e.clientX + 'px';
        });
        window.addEventListener('mouseup', () => { isResizing = false; });
    }
});