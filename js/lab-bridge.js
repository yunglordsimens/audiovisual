/* lab-bridge.js — Shared communication bridge for all showcase units */

window.LabBridge = (function() {
    let state = {
        text: "INIT",
        params: { a: 0.5, b: 0.5, c: 0.1 },
        hue: 180,
        type: 'UPDATE_STATE'
    };

    const listeners = [];
    let textChangeListeners = [];

    // Listen for messages from parent (index.html)
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'UPDATE_STATE') {
            const oldText = state.text;
            state = { ...e.data };
            
            // Update CSS variables
            const root = document.documentElement;
            root.style.setProperty('--hue', state.hue);
            root.style.setProperty('--val-a', state.params.a);
            root.style.setProperty('--val-b', state.params.b);
            root.style.setProperty('--val-c', state.params.c);

            // Notify listeners
            const textChanged = oldText !== state.text;
            listeners.forEach(fn => fn(state, textChanged));
            if (textChanged) textChangeListeners.forEach(fn => fn(state));
        }
    });

    return {
        getState: () => state,
        
        // Called on every state update (params or text)
        onUpdate: (fn) => { listeners.push(fn); },
        
        // Called only when text changes (for expensive operations like re-scanning)
        onTextChange: (fn) => { textChangeListeners.push(fn); },
        
        // Helper for mode switching buttons
        initModeButtons: (callback) => {
            window.setMode = function(mode, btn) {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(mode);
            };
        },

        // Check if running standalone (not in iframe)
        isStandalone: () => window.self === window.top
    };
})();
