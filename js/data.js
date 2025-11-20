/* js/data.js - Full Archive Structure */

const siteData = [
    {
        id: "root",
        label: "Typography Research Site",
        type: "root",
        description: "Web-Based Experiments & Collections. A comprehensive archive of typographic technologies.",
        children: [
            // --- LEVEL 1 ---
            {
                id: "1",
                label: "1: Basics HTML + CSS + JS",
                type: "level",
                description: "Core Standards for Text Manipulation. The foundation of the web.",
                children: [
                    { 
                        id: "1-1", label: "Canvas Typography", type: "cat", sketch: "pixel-storm",
                        url: "showcase-canvas-pixel.html", // <--- ПОДКЛЮЧЕНО
                        description: "Pixel Effects & Basic Animations using HTML5 Canvas API." 
                    },
                    { 
                        id: "1-2", label: "CSS Kinetic Text", type: "cat", 
                        url: "showcase-css-kinetic.html", // <--- ПОДКЛЮЧЕНО
                        description: "Animations & Transitions using pure CSS keyframes." 
                    },
                    { 
                        id: "1-3", label: "CSS Effects", type: "cat", 
                        url: "showcase-css-filters.html", // <--- ПОДКЛЮЧЕНО
                        description: "Filters (Blur, Contrast) & Transforms (Skew, Rotate)." 
                    },
                    { 
                        id: "1-4", label: "SVG Text Paths", type: "cat", 
                        url: "showcase-svg-text.html", // <--- ПОДКЛЮЧЕНО
                        description: "Vector Paths, Outlines & Stroke manipulation." 
                    },
                    { 
                        id: "1-5", label: "JS DOM Text", type: "cat", 
                        url: "showcase-js-dom.html", // <--- ПОДКЛЮЧЕНО
                        description: "Dynamic Generation & Events manipulation in the DOM." 
                    },
                    { 
                        id: "1-6", label: "Web Anim API", type: "cat", 
                        url: "showcase-web-anim-api.html", // <--- ПОДКЛЮЧЕНО
                        description: "Programmatic Easing & Transitions using WAAPI." 
                    }
                ]
            },
            
            // --- LEVEL 2 ---
            {
                id: "2",
                label: "2: JS Libraries (Canvas/WebGL)",
                type: "level",
                description: "Enhanced Visuals & Interactivity using external frameworks.",
                children: [
                    {
                        id: "2-1", label: "p5.js Creative Coding", type: "lib", url: "https://p5js.org/",
                        description: "Framework for creative coding and visual arts.",
                        children: [
                            { id: "2-1-1", label: "Typography Experiments", type: "cat", description: "Basic Manipulation & Effects." },
                            { id: "2-1-2", label: "Generative Typography", type: "cat", description: "Algorithmic & Procedural generation." },
                            { id: "2-1-3", label: "Kinetic Typography", type: "cat", description: "Motion & Animation principles." },
                            { id: "2-1-4", label: "Interactive Typography", type: "cat", description: "User-Driven Changes." },
                            { id: "2-1-5", label: "Text Effects", type: "cat", description: "Distortions & Particles." },
                            { id: "2-1-6", label: "Sound Reactive", type: "cat", description: "Audio Responses & FFT." },
                            { id: "2-1-7", label: "Audiovisual Type", type: "cat", description: "Sound-Visual Integrations." },
                            { id: "2-1-8", label: "Design Tools", type: "cat", description: "Typography Creation Aids." }
                        ]
                    },
                    {
                        id: "2-2", label: "Three.js 3D Rendering", type: "lib",
                        description: "3D Rendering with WebGL.",
                        children: [
                            { 
                                id: "2-2-1", label: "3D Text Geometries", type: "cat", 
                                url: "showcase-three-text.html", // <--- ПОДКЛЮЧЕНО
                                description: "Extruded & Spatial Letters." 
                            },
                            { id: "2-2-2", label: "Shader Materials", type: "cat", description: "Custom Effects on Fonts." },
                            { id: "2-2-3", label: "Camera Interactions", type: "cat", description: "Orbiting & Viewing Type." },
                            { id: "2-2-4", label: "Particle-Based Fonts", type: "cat", description: "Dynamic Dispersions." }
                        ]
                    },
                    {
                        id: "2-3", label: "D3.js Data Viz", type: "lib",
                        description: "Data-Driven Visualizations.",
                        children: [
                            { id: "2-3-1", label: "Word Clouds", type: "cat", description: "Force-Directed Layouts." },
                            { id: "2-3-2", label: "Text Hierarchies", type: "cat", description: "Animated Structures." },
                            { id: "2-3-3", label: "Data-Bound Animations", type: "cat", description: "Transitions & Updates." }
                        ]
                    },
                    {
                        id: "2-4", label: "Zdog Pseudo-3D", type: "lib",
                        description: "Flat-shaded pseudo-3D engine.",
                        children: [
                            { id: "2-4-1", label: "3D Letter Icons", type: "cat", description: "Flat-Shaded Models." },
                            { id: "2-4-2", label: "Animated Text Shapes", type: "cat", description: "Simple Rotations." }
                        ]
                    },
                    {
                        id: "2-5", label: "Paper.js Vectors", type: "lib",
                        description: "Vector Graphics & Paths.",
                        children: [
                            { id: "2-5-1", label: "Bezier Glyph Editing", type: "cat", description: "Curve Manipulations." },
                            { id: "2-5-2", label: "Deformable Text", type: "cat", description: "Path-Based Distortions." }
                        ]
                    },
                    {
                        id: "2-6", label: "opentype.js Parsing", type: "lib",
                        description: "Font Parsing & Editing.",
                        children: [
                            { id: "2-6-1", label: "Glyph Manipulations", type: "cat", description: "Shape Extractions." },
                            { id: "2-6-2", label: "Custom Kerning", type: "cat", description: "Font Subsetting Experiments." }
                        ]
                    }
                ]
            },
            
            // --- LEVEL 3 ---
            {
                id: "3",
                label: "3: WebGL & Shaders",
                type: "level",
                description: "GPU-Accelerated Effects & Complex Distortions.",
                children: [
                    {
                        id: "3-1", label: "Raw WebGL", type: "lib",
                        description: "Native GPU Rendering.",
                        children: [
                            { id: "3-1-1", label: "Fragment Shaders", type: "cat", description: "Glow & Fragmentation." },
                            { id: "3-1-2", label: "Vertex Distortions", type: "cat", description: "Custom Geometry Effects." }
                        ]
                    },
                    {
                        id: "3-2", label: "Regl Wrapper", type: "lib",
                        description: "Simplified WebGL Wrapper.",
                        children: [
                            { id: "3-2-1", label: "Modular Shaders", type: "cat", description: "Noise & Text Distortions." },
                            { id: "3-2-2", label: "Performance Opts", type: "cat", description: "High-Res Type." }
                        ]
                    },
                    {
                        id: "3-3", label: "GLSL Shaders", type: "lib",
                        description: "Shadertoy-Style Effects.",
                        children: [
                            { id: "3-3-1", label: "Wavy & Fractal", type: "cat", description: "Real-Time Animations." },
                            { id: "3-3-2", label: "Psychedelic", type: "cat", description: "Color & Pattern Shifts." }
                        ]
                    },
                    {
                        id: "3-4", label: "glslify Modules", type: "lib",
                        description: "Modular Shader Composition.",
                        children: [
                            { id: "3-4-1", label: "Reusable Modules", type: "cat", description: "Audio-Modulated Effects." },
                            { id: "3-4-2", label: "Browserifiable", type: "cat", description: "Typography Integrations." }
                        ]
                    },
                    {
                        id: "3-5", label: "WebGPU Next-Gen", type: "lib",
                        description: "Emerging High-Performance API.",
                        children: [
                            { id: "3-5-1", label: "VR/AR Rendering", type: "cat", description: "Efficient Shaders." },
                            { id: "3-5-2", label: "Next-Gen Distortions", type: "cat", description: "Advanced Computations." }
                        ]
                    }
                ]
            },

            // --- LEVEL 4 ---
            {
                id: "4",
                label: "4: Real-Time Input",
                type: "level",
                description: "Device & Media APIs for Responsive Experiments.",
                children: [
                    {
                        id: "4-1", label: "Mic & FFT", type: "lib",
                        description: "Microphone & Frequency Analysis.",
                        children: [
                            { id: "4-1-1", label: "Beat-Pulsing", type: "cat", description: "Frequency Scaling." },
                            { id: "4-1-2", label: "Sound Visualizers", type: "cat", description: "Text Waveforms." }
                        ]
                    },
                    {
                        id: "4-2", label: "Web MIDI API", type: "lib",
                        description: "Controller Integrations.",
                        children: [
                            { id: "4-2-1", label: "Knob-Twisted Fonts", type: "cat", description: "Real-Time Adjustments." },
                            { id: "4-2-2", label: "MIDI Animations", type: "cat", description: "Glyph Transformations." }
                        ]
                    },
                    {
                        id: "4-3", label: "WebRTC / Camera", type: "lib",
                        description: "Camera & Streams.",
                        children: [
                            { id: "4-3-1", label: "Face-Tracking", type: "cat", description: "Movement-Reactive." },
                            { id: "4-3-2", label: "Video Distortions", type: "cat", description: "Text Overlays." }
                        ]
                    },
                    {
                        id: "4-4", label: "ml5.js Machine Learning", type: "lib",
                        description: "Machine Learning in Browser.",
                        children: [
                            { id: "4-4-1", label: "Pose Detection", type: "cat", description: "Hand-Gestured Changes." },
                            { id: "4-4-2", label: "Body-Tracked", type: "cat", description: "Interactive Scenes." }
                        ]
                    },
                    {
                        id: "4-5", label: "TensorFlow.js", type: "lib",
                        description: "On-Device Neural Nets.",
                        children: [
                            { id: "4-5-1", label: "Style Transfer", type: "cat", description: "AI-Generated Variations." },
                            { id: "4-5-2", label: "Model-Trained", type: "cat", description: "Generative Experiments." }
                        ]
                    },
                    {
                        id: "4-6", label: "Device Orientation", type: "lib",
                        description: "Motion Inputs.",
                        children: [
                            { id: "4-6-1", label: "Tilt Rotations", type: "cat", description: "Parallax Effects." },
                            { id: "4-6-2", label: "Shake Interactions", type: "cat", description: "Scrambling & Reforms." }
                        ]
                    }
                ]
            },

            // --- LEVEL 5 ---
            {
                id: "5",
                label: "5: Animation & Export",
                type: "level",
                description: "Polished Outputs, Sequences & Sharing.",
                children: [
                    {
                        id: "5-1", label: "GSAP Animation", type: "lib",
                        description: "High-Performance Animations.",
                        children: [
                            { id: "5-1-1", label: "Kinetic Timelines", type: "cat", description: "Sequenced Stories." },
                            { id: "5-1-2", label: "Easing & Morphing", type: "cat", description: "Smooth Text Changes." }
                        ]
                    },
                    {
                        id: "5-2", label: "Lottie Animations", type: "lib",
                        description: "JSON-Based from After Effects.",
                        children: [
                            { id: "5-2-1", label: "Vector Playback", type: "cat", description: "Imported Animations." },
                            { id: "5-2-2", label: "Interactive Lottie", type: "cat", description: "User-Triggered." }
                        ]
                    },
                    {
                        id: "5-3", label: "CCapture.js", type: "lib",
                        description: "Canvas Recording.",
                        children: [
                            { id: "5-3-1", label: "GIF/MP4 Exports", type: "cat", description: "Loop Captures." },
                            { id: "5-3-2", label: "Generative Shares", type: "cat", description: "Video Outputs." }
                        ]
                    },
                    {
                        id: "5-4", label: "html2canvas", type: "lib",
                        description: "DOM to Image.",
                        children: [
                            { id: "5-4-1", label: "Screenshots", type: "cat", description: "Sharing Experiments." },
                            { id: "5-4-2", label: "Static Exports", type: "cat", description: "Interactive Captures." }
                        ]
                    }
                ]
            },

            // --- LEVEL 6 ---
            {
                id: "6",
                label: "6: Advanced 3D, VR/AR",
                type: "level",
                description: "Spatial Contexts & Immersive Typography.",
                children: [
                    {
                        id: "6-1", label: "A-Frame VR/AR", type: "lib",
                        description: "WebVR/AR Framework.",
                        children: [
                            { id: "6-1-1", label: "VR Sculptures", type: "cat", description: "3D Typographic Environments." },
                            { id: "6-1-2", label: "AR Overlays", type: "cat", description: "Real-World Integrations." }
                        ]
                    },
                    {
                        id: "6-2", label: "Babylon.js Physics", type: "lib",
                        description: "3D Engine with Physics.",
                        children: [
                            { id: "6-2-1", label: "Falling Letters", type: "cat", description: "Collision Simulations." },
                            { id: "6-2-2", label: "Material Textures", type: "cat", description: "Realistic Rendering." }
                        ]
                    },
                    {
                        id: "6-3", label: "PlayCanvas Game", type: "lib",
                        description: "Game-Like 3D Engine.",
                        children: [
                            { id: "6-3-1", label: "Collab Editing", type: "cat", description: "Multi-User Scenes." },
                            { id: "6-3-2", label: "Physics Type", type: "cat", description: "Game Elements." }
                        ]
                    }
                ]
            }
        ]
    }
];