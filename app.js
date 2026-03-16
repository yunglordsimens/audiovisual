/* js/app.js v9.0 — Typography Lab Core */

let selectedId = null;
let previewId = null;
let nodeMap = {};

const labState = {
    text: "TYPOGRAPHY",
    params: { a: 0.5, b: 0.5, c: 0.1 },
    hue: 180
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof siteData === 'undefined') return;

    // --- REFS ---
    const bgFrame   = document.getElementById('background-iframe');
    const inputEl   = document.getElementById('global-text-input');
    const win       = document.getElementById('window-container');
    const winTitle  = document.getElementById('win-title');
    const winContent= document.getElementById('win-content');
    const treeEl    = document.getElementById('tree-container');

    // ==========================================
    // 1. BRIDGE — send state to iframes
    // ==========================================
    let broadcastTimer = null;
    function broadcastState() {
        clearTimeout(broadcastTimer);
        broadcastTimer = setTimeout(() => {
            const msg = { type: 'UPDATE_STATE', ...labState };
            try { if (bgFrame.contentWindow) bgFrame.contentWindow.postMessage(msg, '*'); } catch(e) {}
            const wf = win.querySelector('.win-iframe');
            try { if (wf && wf.contentWindow) wf.contentWindow.postMessage(msg, '*'); } catch(e) {}
        }, 16); // ~60fps throttle
    }

    // After iframe loads, send current state
    function onFrameReady(frame) {
        if (!frame) return;
        frame.addEventListener('load', () => {
            setTimeout(() => {
                try {
                    const msg = { type: 'UPDATE_STATE', ...labState };
                    frame.contentWindow.postMessage(msg, '*');
                } catch(e) {}
            }, 100);
        });
    }

    // ==========================================
    // 2. INPUT CONTROLS
    // ==========================================
    if (inputEl) {
        inputEl.addEventListener('input', () => {
            labState.text = inputEl.value.trim() || "EMPTY";
            broadcastState();
        });
    }

    const sliderMap = { 'param-a': 'a', 'param-b': 'b', 'param-c': 'c' };
    const valMap    = { 'param-a': 'val-a', 'param-b': 'val-b', 'param-c': 'val-c' };
    Object.keys(sliderMap).forEach(sid => {
        const slider = document.getElementById(sid);
        if (!slider) return;
        slider.addEventListener('input', () => {
            labState.params[sliderMap[sid]] = slider.value / 100;
            const valEl = document.getElementById(valMap[sid]);
            if (valEl) valEl.textContent = slider.value;
            broadcastState();
        });
    });

    // ==========================================
    // 3. EXPORT
    // ==========================================
    document.querySelectorAll('.btn-mini[data-fmt]').forEach(btn => {
        btn.addEventListener('click', () => exportGraph(btn.dataset.fmt));
    });

    function exportGraph(format) {
        const svgEl = document.querySelector('#graph-layer svg');
        if (!svgEl) return;

        const clone = svgEl.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Inline computed styles
        clone.querySelectorAll('*').forEach(el => {
            const cs = window.getComputedStyle(el);
            ['fill','stroke','strokeWidth','fontFamily','fontSize','opacity'].forEach(p => {
                if (cs[p]) el.style[p] = cs[p];
            });
        });

        const svgStr = new XMLSerializer().serializeToString(clone);
        const name = `typo_lab_${Date.now()}`;

        if (format === 'svg') {
            download(URL.createObjectURL(new Blob([svgStr], {type:'image/svg+xml'})), `${name}.svg`);
        } else {
            const img = new Image();
            const url = URL.createObjectURL(new Blob([svgStr], {type:'image/svg+xml'}));
            img.onload = () => {
                const c = document.createElement('canvas');
                const s = 2;
                c.width = svgEl.clientWidth * s; c.height = svgEl.clientHeight * s;
                const ctx = c.getContext('2d');
                if (format === 'jpeg') { ctx.fillStyle = '#050508'; ctx.fillRect(0,0,c.width,c.height); }
                ctx.scale(s,s); ctx.drawImage(img,0,0);
                download(c.toDataURL(`image/${format}`, 0.92), `${name}.${format === 'jpeg' ? 'jpg' : format}`);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }
    }
    function download(url, name) {
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
    }

    // ==========================================
    // 4. MENU TREE BUILDER
    // ==========================================
    let totalNodes = 0;
    function buildMenu(data, parent, prefix = "", isRoot = true) {
        data.forEach((item, i) => {
            totalNodes++;
            const isLast = i === data.length - 1;
            const row = document.createElement('div');
            row.className = 'tree-item';

            const art = document.createElement('span');
            art.className = 'ascii-art';
            art.textContent = prefix + (isRoot ? "" : (isLast ? "└─ " : "├─ "));

            const text = document.createElement('span');
            text.className = `clickable-text tree-type-${item.type || 'cat'}`;
            text.textContent = item.label;
            text.dataset.id = item.id;

            text.addEventListener('mouseenter', () => handleHover(item.id));
            text.addEventListener('mouseleave', () => handleMouseLeave());
            text.addEventListener('click', (e) => { e.stopPropagation(); handleClick(item.id); });

            row.append(art, text);
            parent.append(row);

            if (item.children) {
                buildMenu(item.children, parent,
                    prefix + (isRoot ? "" : (isLast ? "   " : "│  ")), false);
            }
        });
    }
    buildMenu(siteData, treeEl);
    
    const ncEl = document.getElementById('node-count');
    if (ncEl) ncEl.textContent = totalNodes;

    // ==========================================
    // 5. D3 FORCE GRAPH
    // ==========================================
    const nodes = [], links = [];
    function flatten(data, pid = null) {
        data.forEach(d => {
            nodeMap[d.id] = d;
            const short = d.label.length > 18 ? d.label.substring(0,18)+'..' : d.label;
            nodes.push({ id: d.id, label: short, type: d.type || 'cat', w: short.length * 7 + 16 });
            if (pid) links.push({ source: pid, target: d.id });
            if (d.children) flatten(d.children, d.id);
        });
    }
    flatten(siteData);

    const W = window.innerWidth, H = window.innerHeight;
    const svg = d3.select('#graph-layer').append('svg')
        .attr('width','100%').attr('height','100%')
        .attr('viewBox', [0, 0, W, H]);

    const g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', e => g.attr('transform', e.transform)));

    const sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(90))
        .force('charge', d3.forceManyBody().strength(-350))
        .force('center', d3.forceCenter(W * 0.6, H * 0.5))
        .force('collide', d3.forceCollide().radius(d => d.w / 2 + 8));

    const linkEl = g.append('g').selectAll('line').data(links).enter().append('line')
        .attr('stroke', '#00FFFF').attr('stroke-opacity', 0.3).attr('stroke-width', 1);

    const nodeEl = g.append('g').selectAll('rect').data(nodes).enter().append('rect')
        .attr('width', d => d.w).attr('height', 20).attr('rx', 3)
        .attr('id', d => `node-${d.id}`)
        .call(d3.drag()
            .on('start', (e,d) => { if(!e.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
            .on('drag', (e,d) => { d.fx=e.x; d.fy=e.y; })
            .on('end', (e,d) => { if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; })
        );

    nodeEl.on('mouseenter', (e,d) => handleHover(d.id))
          .on('mouseleave', handleMouseLeave)
          .on('click', (e,d) => { e.stopPropagation(); handleClick(d.id); });

    const labelEl = g.append('g').selectAll('text').data(nodes).enter().append('text')
        .text(d => d.label).attr('class','d3-label');

    sim.on('tick', () => {
        linkEl.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
              .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
        nodeEl.attr('x',d=>d.x-d.w/2).attr('y',d=>d.y-10);
        labelEl.attr('x',d=>d.x).attr('y',d=>d.y);
    });

    // ==========================================
    // 6. INTERACTION: hover / click / deselect
    // ==========================================
    function handleHover(id) {
        if (!nodeMap[id]) return;
        previewId = id;
        d3.selectAll('rect').classed('preview-node', false);
        d3.select(`#node-${id}`).classed('preview-node', true);
        
        document.querySelectorAll('.clickable-text').forEach(el => el.classList.remove('preview-mode'));
        const menuEl = document.querySelector(`.clickable-text[data-id="${id}"]`);
        if (menuEl) menuEl.classList.add('preview-mode');
    }

    function handleMouseLeave() {
        previewId = null;
        d3.selectAll('rect').classed('preview-node', false);
        document.querySelectorAll('.clickable-text').forEach(el => el.classList.remove('preview-mode'));
    }

    function handleClick(id) {
        if (!nodeMap[id]) return;
        
        // Toggle off if same node
        if (selectedId === id) { closeWindow(); return; }
        
        selectedId = id;
        const data = nodeMap[id];
        labState.hue = (parseInt(id.replace(/\D/g,'') || '0') * 45) % 360;

        // Update D3 visuals
        d3.selectAll('rect').classed('active-node', false).classed('preview-node', false);
        d3.select(`#node-${id}`).classed('active-node', true);

        // Update menu
        document.querySelectorAll('.clickable-text').forEach(el => el.classList.remove('active','preview-mode'));
        const menuEl = document.querySelector(`.clickable-text[data-id="${id}"]`);
        if (menuEl) {
            menuEl.classList.add('active');
            menuEl.scrollIntoView({ behavior:'smooth', block:'center' });
        }

        // Background iframe: load showcase for ambient effect
        if (data.url && !data.url.startsWith('http')) {
            bgFrame.src = data.url;
            onFrameReady(bgFrame);
        } else {
            bgFrame.src = 'about:blank';
        }

        showWindow(data);
        sim.alpha(0.15).restart();
    }

    // ==========================================
    // 7. FLOATING WINDOW
    // ==========================================
    function showWindow(data) {
        winTitle.textContent = data.label;
        winContent.innerHTML = '';

        // Description
        const desc = document.createElement('div');
        desc.className = 'win-desc';
        desc.textContent = data.description;
        winContent.appendChild(desc);

        if (data.url && !data.url.startsWith('http')) {
            // Load showcase in iframe
            const frame = document.createElement('iframe');
            frame.className = 'win-iframe';
            frame.src = data.url;
            onFrameReady(frame);
            winContent.appendChild(frame);
        } else {
            // No demo — show placeholder
            const empty = document.createElement('div');
            empty.className = 'win-empty';
            empty.textContent = data.url
                ? 'External link — open in new tab'
                : 'Demo coming soon...';
            winContent.appendChild(empty);
        }

        win.style.display = 'flex';
        broadcastState();
    }

    function closeWindow() {
        win.style.display = 'none';
        selectedId = null;
        bgFrame.src = 'about:blank';
        d3.selectAll('rect').classed('active-node', false);
        document.querySelectorAll('.clickable-text').forEach(el => el.classList.remove('active'));
    }

    document.getElementById('win-close').onclick = closeWindow;

    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.clickable-text') && !e.target.closest('rect') &&
            !e.target.closest('#window-container') && !e.target.closest('.control-deck') &&
            !e.target.closest('.brutalist-input-wrapper')) {
            closeWindow();
        }
    });

    // ==========================================
    // 8. DRAG — universal for panels
    // ==========================================
    function makeDraggable(el, handle) {
        let dragging = false, sx, sy, il, it;

        handle.addEventListener('mousedown', (e) => {
            dragging = true; sx = e.clientX; sy = e.clientY;
            const r = el.getBoundingClientRect();
            il = r.left; it = r.top;
            el.style.animation = 'none';
            el.style.position = 'fixed';
            el.style.transform = 'none';
            el.style.margin = '0';
            el.style.left = il + 'px';
            el.style.top = it + 'px';
            document.body.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            e.preventDefault();
            el.style.left = (il + e.clientX - sx) + 'px';
            el.style.top  = (it + e.clientY - sy) + 'px';
        });

        window.addEventListener('mouseup', () => {
            if (dragging) { dragging = false; document.body.style.cursor = ''; }
        });
    }

    makeDraggable(win, document.getElementById('win-header'));
    makeDraggable(document.getElementById('control-deck'), document.getElementById('deck-header'));
    makeDraggable(document.getElementById('input-module'), document.getElementById('input-header'));

    // ==========================================
    // 9. RESIZER (sidebar width)
    // ==========================================
    const resizer = document.getElementById('resizer');
    const menu = document.getElementById('menu-panel');
    let isResizing = false;

    if (resizer && menu) {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const x = e.clientX;
            if (x > 200 && x < 700) menu.style.width = x + 'px';
        });
        window.addEventListener('mouseup', () => {
            if (isResizing) { isResizing = false; document.body.style.cursor = ''; }
        });
    }

    // ==========================================
    // 10. KEYBOARD
    // ==========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeWindow();
    });
});
