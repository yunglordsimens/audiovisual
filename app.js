/* * app.js v2.2
 * * Включает:
 * 1. p5.js - фоновая анимация
 * 2. D3.js - логика графа
 * 3. Логика взаимодействия (клики, resizer, описание)
 *
 * * ИЗМЕНЕНИЯ:
 * - (4.1) mX, mY вынесены в глоб. скоуп для исправления "отставания" мыши.
 * - (4) animationMode теперь управляется через data-sketch из HTML.
 * - (1) Логика кликов ищет .clickable-text.
 * - (1) D3-лейблам добавлен класс .d3-label.
 */

// --- 1. p5.js background animation ---

let activeItem = null;
let currentHue = 0;
let animationMode = 'default';
let bodies = [];
const totalAmount = 500;
let mX = 0, mY = 0; // <-- ИСПРАВЛЕНИЕ 4.1: Вынесены из draw()

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('background-canvas');
    colorMode(HSB, 360, 100, 100);
    background(0);
    initDefaultParticles();
}

function initDefaultParticles() {
    bodies = [];
    let param = activeItem ? parseInt(activeItem.split('-').pop() || '1') : 0;
    for (let i = 0; i < totalAmount; i++) {
        bodies.push(new Ball(param));
    }
}

function draw() {
    // let mX = 0, mY = 0; // <-- ИСПРАВЛЕНИЕ 4.1: Удалено отсюда
    mX += 0.3 * (mouseX - mX); // <-- Теперь сглаживание работает
    mY += 0.3 * (mouseY - mY); // <-- Теперь сглаживание работает

    if (animationMode === 'default') {
        background(0, 0, 0, 0.05);
        stroke(180, 50, 100, 0.03); 
        for (let i = 0; i < totalAmount; i++) bodies[i].render(mX, mY);
        return;
    }

    if (animationMode === 'wave') {
        background(0, 0, 0, 0.1);
        let time = millis() * 0.001;
        stroke((currentHue + time * 50) % 360, 80, 100, 0.05);
        for (let i = 0; i < totalAmount; i++) {
            let b = bodies[i];
            b.Xv += 0.5 * sin(time + b.X * 0.01) * b.w;
            b.Yv += 0.3 * cos(time + b.Y * 0.01) * b.w;
            b.render(mX, mY);
        }
    } else if (animationMode === 'pulse') {
        background(0, 0, 0, 0.1);
        let pulse = (sin(millis() * 0.002) + 1) * 0.5;
        stroke(currentHue, 80, 100 * pulse, 0.08);
        for (let i = 0; i < totalAmount; i++) bodies[i].render(mX, mY);
    } else if (animationMode === 'spiral') {
        background(0, 0, 0, 0.1);
        let time = millis() * 0.001;
        stroke((currentHue + time * 30) % 360, 80, 100, 0.05);
        for (let i = 0; i < totalAmount; i++) {
            let b = bodies[i];
            let angle = time + i * 0.1;
            b.Xv += cos(angle) * 0.5 * b.w;
            b.Yv += sin(angle) * 0.5 * b.w;
            b.render(mX, mY);
        }
    } else if (animationMode === 'pixel-storm') { 
        // Новый режим для "Canvas" (пока простой)
        background(0, 0, 0, 0.2);
        stroke(currentHue, 80, 100, 0.05);
         for (let i = 0; i < totalAmount; i++) {
            let b = bodies[i];
            b.Xv += (random(-2, 2) - b.Xv) * 0.1; // "пьяное" движение
            b.Yv += (random(-2, 2) - b.Yv) * 0.1;
            b.render(mX, mY);
        }
    } else { // 'default' active state (если вдруг что)
        background(0, 0, 0, 0.1);
        stroke(currentHue, 80, 100, 0.05);
        for (let i = 0; i < totalAmount; i++) bodies[i].render(mX, mY);
    }
}

class Ball {
    constructor(param) {
        this.X = random(width);
        this.Y = random(height);
        this.w = random(1 / (3 + param / 2), 3 + param / 2);
        this.Xv = this.Yv = 0;
        this.pX = this.X;
        this.pY = this.Y;
        this.decelerationFactor = 1.05;
        this.drag = 0.01;
    }
    render(mX, mY) {
        if (!mouseIsPressed) {
            this.Xv /= this.decelerationFactor;
            this.Yv /= this.decelerationFactor;
        }
        this.Xv += this.drag * (mX - this.X) * this.w;
        this.Yv += this.drag * (mY - this.Y) * this.w;
        this.X += this.Xv;
        this.Y += this.Yv;
        line(this.X, this.Y, this.pX, this.pY);
        this.pX = this.X;
        this.pY = this.Y;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


// --- 2. D3.js Graph Logic ---
document.addEventListener('DOMContentLoaded', () => {

    const nodeMap = {};
    const nodes = [];
    const links = [];
    const charWidth = 6; 
    const labelPadding = 10; 

    document.querySelectorAll('.clickable-text').forEach(el => {
        const id = el.dataset.id;
        const text = el.textContent.trim();
        const label = text; 
        
        nodeMap[id] = { 
            id, 
            label: label, 
            description: el.dataset.description || `Description for ${text} not found.`,
            type: el.dataset.type || 'cat',
            url: el.dataset.url || null,
            sketch: el.dataset.sketch || null, // ИЗМЕНЕНИЕ 4: Считываем скетч
            width: label.length * charWidth + labelPadding 
        };
        nodes.push(nodeMap[id]);

        if (id.includes('-')) {
            const parts = id.split('-');
            const parentId = parts.slice(0, -1).join('-');
            if (nodeMap[parentId]) {
                links.push({ source: parentId, target: id });
            }
        } else if (id !== 'root') {
            links.push({ source: 'root', target: id });
        }
    });

    const graphContainer = document.getElementById('graph-container');
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;

    const svg = d3.select('.graph')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, width, height]);

    const zoom = d3.zoom()
        .scaleExtent([0.1, 5]) 
        .filter(event => event.type === 'wheel' || event.button === 1) 
        .on('zoom', zoomed);

    svg.call(zoom);
    const g = svg.append('g');
    function zoomed({ transform }) {
        g.attr('transform', transform);
    }

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.width / 2 + 5)); // Улучшенная коллизия

    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#00FFFF')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5);

    const node = g.append('g')
        .selectAll('rect')
        .data(nodes)
        .enter()
        .append('rect')
        .attr('width', d => d.width) 
        .attr('height', 20)
        .attr('rx', 5) 
        .attr('ry', 5)
        .attr('class', d => `node-type-${d.type}`) 
        .attr('id', d => `node-${d.id}`)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    const label = g.append('g')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .text(d => d.label) 
        .attr('y', 13)
        .attr('class', 'd3-label'); // ИЗМЕНЕНИЕ 1: Используем класс

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('x', d => d.x - d.width / 2)
            .attr('y', d => d.y - 10); 

        label
            .attr('x', d => d.x)
            .attr('y', d => d.y + 3);
    });

    
    // --- 3. Interaction Logic ---

    const resizer = document.querySelector('.resizer');
    const menu = document.querySelector('.menu');
    let isResizing = false;
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
        document.getElementById('description').style.pointerEvents = 'none';
    });
    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 100 && newWidth < window.innerWidth - 100) {
                menu.style.flex = `0 0 ${newWidth}px`;
            }
        }
    });
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.getElementById('description').style.pointerEvents = 'auto';
    });

    
    let currentActive = null;

    function showDescription(id) {
        const descDiv = document.getElementById('description');
        const nodeData = nodeMap[id];
        descDiv.innerHTML = ''; 
        const textElement = document.createElement('p');
        textElement.textContent = nodeData.description;
        descDiv.appendChild(textElement);
        descDiv.style.display = 'block';
    }
    
    function showDemo(id) {
        const descDiv = document.getElementById('description');
        const nodeData = nodeMap[id];
        descDiv.innerHTML = `
            <p>${nodeData.description}</p>
            <iframe src="${nodeData.url}"></iframe>`;
        descDiv.style.display = 'block';
    }

    function clearActive() {
        if (currentActive) {
            document.querySelector(`.clickable-text[data-id="${currentActive}"]`).classList.remove('active');
            d3.select(`#node-${currentActive}`).classed('active', false); 
            d3.selectAll('.d3-label').filter(function(d) { return d && d.id === currentActive; }).classed('active', false);
        }
        const descDiv = document.getElementById('description');
        descDiv.style.display = 'none';
        descDiv.innerHTML = ''; 
        
        activeItem = null;
        animationMode = 'default'; // ИЗМЕНЕНИЕ 4: Сброс на 'default'
        currentActive = null;
        
        initDefaultParticles(); // Пересоздаем частицы для режима 'default'
    }

    function setActive(id) {
        if (currentActive === id) { 
            clearActive();
            return;
        }
        
        clearActive();
        currentActive = id; 
        activeItem = id;    
        
        const nodeData = nodeMap[id];
        
        // ИЗМЕНЕНИЕ 4: Устанавливаем режим анимации из data-sketch
        animationMode = nodeData.sketch || 'default'; // Если скетч не задан, ставим 'default'
        currentHue = (parseInt(id.split('-').pop() || '0') * 37) % 360; 

        initDefaultParticles(); // Пересоздаем частицы с новыми параметрами

        // Подсветка
        document.querySelector(`.clickable-text[data-id="${id}"]`).classList.add('active');
        d3.select(`#node-${id}`).classed('active', true);
        d3.selectAll('.d3-label').filter(function(d) { return d && d.id === id; }).classed('active', true);

        if (nodeData.url) {
            showDemo(id);
        } else {
            showDescription(id);
        }
        
        simulation.alpha(0.3).restart(); 
    }

    // Навешиваем обработчики кликов
    document.querySelectorAll('.clickable-text').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.dataset.id;
            setActive(id);
        });
    });

    node.on('click', (event, d) => {
        event.stopPropagation();
        setActive(d.id);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.clickable-text') && !e.target.closest('rect')) {
            clearActive();
        }
    });

});