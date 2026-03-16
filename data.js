/* js/data.js v9.0 — Full Archive Structure */

const siteData = [
    {
        id: "root",
        label: "Typography Research",
        type: "root",
        description: "Web-Based Experiments & Collections. Interactive archive of typographic technologies and techniques.",
        children: [
            {
                id: "1", label: "1: HTML + CSS + JS", type: "level",
                description: "Core web standards for text manipulation. The foundation of all web typography.",
                children: [
                    { id: "1-1", label: "Canvas Pixel FX", type: "cat", url: "showcase-canvas-pixel.html",
                      description: "Pixel-level text effects using 2D Canvas API. Draw text, scan pixels, create particle storms." },
                    { id: "1-2", label: "CSS Kinetic", type: "cat", url: "showcase-css-kinetic.html",
                      description: "Kinetic text using pure CSS. Marquee scrolling, variable sizing, speed control." },
                    { id: "1-3", label: "CSS Filters", type: "cat", url: "showcase-css-filters.html",
                      description: "CSS filter effects: Liquid blur, RGB shift, Neon glow, Glitch, Vaporwave, Hazard stripes." },
                    { id: "1-4", label: "SVG Vectors", type: "cat", url: "showcase-svg-text.html",
                      description: "SVG vector text: Neon wire animation, elastic Bezier paths, displacement glitch filters." },
                    { id: "1-5", label: "JS DOM Engine", type: "cat", url: "showcase-js-dom.html",
                      description: "DOM manipulation: Matrix decoder effect, kinetic stacking, floating letter physics." },
                    { id: "1-6", label: "Web Anim API", type: "cat", url: "showcase-web-anim-api.html",
                      description: "Web Animations API: Elastic keyframes, staggered waves, playback rate time warping." }
                ]
            },
            {
                id: "2", label: "2: JS Libraries", type: "level",
                description: "Enhanced visuals using external frameworks and canvas/WebGL libraries.",
                children: [
                    {
                        id: "2-1", label: "p5.js Creative Coding", type: "lib",
                        description: "Framework for creative coding. Particle systems, generative art, pixel scanning.",
                        children: [
                            { id: "2-1-1", label: "Particle Swarm", type: "cat", url: "showcase-p5-experiments.html",
                              description: "p5.js particle text: Swarm physics, line web connections, Perlin noise fluid flow." },
                            { id: "2-1-2", label: "Generative Type", type: "cat", description: "Algorithmic & procedural generation of letterforms." },
                            { id: "2-1-3", label: "Kinetic Type", type: "cat", description: "Motion & animation of text in p5.js canvas." },
                            { id: "2-1-4", label: "Interactive Type", type: "cat", description: "Mouse, touch, and keyboard driven text changes." },
                            { id: "2-1-5", label: "Text Distortions", type: "cat", description: "Per-pixel effects, particle explosions, wave distortions." },
                            { id: "2-1-6", label: "Sound Reactive", type: "cat", description: "FFT audio analysis driving text parameters." },
                            { id: "2-1-7", label: "Audiovisual", type: "cat", description: "Combined sound synthesis and visual typography." },
                            { id: "2-1-8", label: "Design Tools", type: "cat", description: "Typography creation and layout aids." }
                        ]
                    },
                    {
                        id: "2-2", label: "Three.js 3D", type: "lib",
                        description: "3D rendering with WebGL for spatial typography.",
                        children: [
                            { id: "2-2-1", label: "3D Text Geometry", type: "cat", url: "showcase-three-text.html",
                              description: "Three.js extruded 3D text with rotation, depth control, and dynamic materials." },
                            { id: "2-2-2", label: "Shader Materials", type: "cat", description: "Custom GLSL effects on 3D font surfaces." },
                            { id: "2-2-3", label: "Camera Controls", type: "cat", description: "Orbit, zoom, and fly-through 3D type scenes." },
                            { id: "2-2-4", label: "Particle Fonts", type: "cat", description: "Dynamic particle dispersions forming letters." }
                        ]
                    },
                    {
                        id: "2-3", label: "D3.js Data Viz", type: "lib",
                        description: "Data-driven document visualization. Powers this site's graph.",
                        children: [
                            { id: "2-3-1", label: "Word Clouds", type: "cat", description: "Force-directed text layouts." },
                            { id: "2-3-2", label: "Text Hierarchies", type: "cat", description: "Treemaps, dendrograms, and animated structures." },
                            { id: "2-3-3", label: "Data Animations", type: "cat", description: "Data-bound transitions and live updates." }
                        ]
                    },
                    {
                        id: "2-4", label: "Zdog Pseudo-3D", type: "lib",
                        description: "Flat-shaded pseudo-3D illustrations.",
                        children: [
                            { id: "2-4-1", label: "3D Letter Icons", type: "cat", description: "Illustrative 3D letterforms." },
                            { id: "2-4-2", label: "Animated Shapes", type: "cat", description: "Simple rotations and transformations." }
                        ]
                    },
                    {
                        id: "2-5", label: "Paper.js Vectors", type: "lib",
                        description: "Vector graphics and path manipulation.",
                        children: [
                            { id: "2-5-1", label: "Bezier Editing", type: "cat", description: "Glyph curve manipulations." },
                            { id: "2-5-2", label: "Deformable Text", type: "cat", description: "Path-based distortions." }
                        ]
                    },
                    {
                        id: "2-6", label: "opentype.js", type: "lib",
                        description: "Font file parsing and editing.",
                        children: [
                            { id: "2-6-1", label: "Glyph Extraction", type: "cat", description: "Vector shape extractions from fonts." },
                            { id: "2-6-2", label: "Custom Kerning", type: "cat", description: "Font subsetting experiments." }
                        ]
                    }
                ]
            },
            {
                id: "3", label: "3: WebGL & Shaders", type: "level",
                description: "GPU-accelerated effects and complex distortions.",
                children: [
                    { id: "3-1", label: "Raw WebGL", type: "lib", description: "Native GPU rendering.",
                      children: [
                          { id: "3-1-1", label: "Fragment Shaders", type: "cat", description: "Pixel-level glow and fragmentation." },
                          { id: "3-1-2", label: "Vertex Distortions", type: "cat", description: "Custom geometry manipulation." }
                    ]},
                    { id: "3-2", label: "GLSL Effects", type: "lib", description: "Shadertoy-style shader effects.",
                      children: [
                          { id: "3-2-1", label: "Wavy & Fractal", type: "cat", description: "Real-time noise animations." },
                          { id: "3-2-2", label: "Psychedelic", type: "cat", description: "Color and pattern shifts." }
                    ]},
                    { id: "3-3", label: "WebGPU", type: "lib", description: "Next-generation high-performance API.",
                      children: [
                          { id: "3-3-1", label: "Compute Shaders", type: "cat", description: "Advanced text computations." },
                          { id: "3-3-2", label: "VR/AR Rendering", type: "cat", description: "Immersive text rendering." }
                    ]}
                ]
            },
            {
                id: "4", label: "4: Real-Time Input", type: "level",
                description: "Device and media APIs for responsive experiments.",
                children: [
                    { id: "4-1", label: "Mic & FFT", type: "lib", description: "Microphone frequency analysis.",
                      children: [
                          { id: "4-1-1", label: "Beat-Pulsing", type: "cat", description: "Frequency-driven text scaling." },
                          { id: "4-1-2", label: "Sound Visualizers", type: "cat", description: "Text-based waveforms." }
                    ]},
                    { id: "4-2", label: "Web MIDI", type: "lib", description: "MIDI controller integration.",
                      children: [
                          { id: "4-2-1", label: "Knob Control", type: "cat", description: "Real-time font adjustments." },
                          { id: "4-2-2", label: "MIDI Triggers", type: "cat", description: "Note-driven glyph changes." }
                    ]},
                    { id: "4-3", label: "Camera Input", type: "lib", description: "WebRTC video streams.",
                      children: [
                          { id: "4-3-1", label: "Face-Tracking", type: "cat", description: "Movement-reactive text." },
                          { id: "4-3-2", label: "Video Distortion", type: "cat", description: "Video texture overlays." }
                    ]},
                    { id: "4-4", label: "ML in Browser", type: "lib", description: "ml5.js and TensorFlow.js.",
                      children: [
                          { id: "4-4-1", label: "Pose Detection", type: "cat", description: "Body-driven text animation." },
                          { id: "4-4-2", label: "Style Transfer", type: "cat", description: "AI-generated font variations." }
                    ]},
                    { id: "4-5", label: "Device Motion", type: "lib", description: "Accelerometer and gyroscope.",
                      children: [
                          { id: "4-5-1", label: "Tilt Effects", type: "cat", description: "Parallax and rotation." },
                          { id: "4-5-2", label: "Shake Triggers", type: "cat", description: "Motion-driven scrambling." }
                    ]}
                ]
            },
            {
                id: "5", label: "5: Animation & Export", type: "level",
                description: "Polished outputs, sequences, and sharing tools.",
                children: [
                    { id: "5-1", label: "GSAP", type: "lib", description: "GreenSock high-performance animation.",
                      children: [
                          { id: "5-1-1", label: "Timelines", type: "cat", description: "Sequenced kinetic stories." },
                          { id: "5-1-2", label: "Morphing", type: "cat", description: "SVG path morphing." }
                    ]},
                    { id: "5-2", label: "Lottie", type: "lib", description: "After Effects JSON animations.",
                      children: [
                          { id: "5-2-1", label: "Vector Playback", type: "cat", description: "Imported AE animations." },
                          { id: "5-2-2", label: "Interactive", type: "cat", description: "User-triggered Lottie." }
                    ]},
                    { id: "5-3", label: "Recording", type: "lib", description: "Canvas capture and export.",
                      children: [
                          { id: "5-3-1", label: "GIF/MP4", type: "cat", description: "Loop captures." },
                          { id: "5-3-2", label: "Screenshots", type: "cat", description: "Static frame exports." }
                    ]}
                ]
            },
            {
                id: "6", label: "6: 3D / VR / AR", type: "level",
                description: "Spatial and immersive typography contexts.",
                children: [
                    { id: "6-1", label: "A-Frame VR", type: "lib", description: "WebVR/AR framework.",
                      children: [
                          { id: "6-1-1", label: "VR Sculptures", type: "cat", description: "3D typographic environments." },
                          { id: "6-1-2", label: "AR Overlays", type: "cat", description: "Real-world text integration." }
                    ]},
                    { id: "6-2", label: "Babylon.js", type: "lib", description: "3D engine with physics.",
                      children: [
                          { id: "6-2-1", label: "Physics Type", type: "cat", description: "Falling letter simulations." },
                          { id: "6-2-2", label: "PBR Materials", type: "cat", description: "Realistic text rendering." }
                    ]}
                ]
            }
        ]
    }
];
