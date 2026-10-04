/* js/lab-bridge.js — showcase side of the Typography Lab protocol.
 *
 * A showcase describes its own controls once:
 *     LabBridge.define(manifest, { onState, onValues });
 * The site (index.html) builds the window's CONTROL_MODULE from that manifest,
 * so adding a new showcase never needs changes in app.js.
 *
 * Messages
 *   showcase -> site : MANIFEST {manifest}   CODE {text}
 *   site -> showcase : UPDATE_STATE {text, hue}   SET_PARAMS {values}
 */
(function () {
    const state = { text: 'SYSTEM', hue: 180 };
    const inFrame = window.parent && window.parent !== window;
    let manifest = null, values = {};
    let hooks = { onState() {}, onValues() {} };

    function post(msg) { if (inFrame) { try { window.parent.postMessage(msg, '*'); } catch (e) {} } }

    window.addEventListener('message', (e) => {
        const d = e.data;
        if (!d || typeof d !== 'object') return;
        if (d.type === 'UPDATE_STATE') {
            if (typeof d.text === 'string') state.text = d.text;
            if (d.hue !== undefined) state.hue = d.hue;
            hooks.onState(state);
        } else if (d.type === 'SET_PARAMS' && d.values && manifest) {
            manifest.params.forEach(p => { if (p.id in d.values) values[p.id] = d.values[p.id]; });
            hooks.onValues(values);
        }
    });

    window.LabBridge = {
        define(m, h) {
            manifest = m;
            hooks = Object.assign(hooks, h || {});
            values = {};
            m.params.forEach(p => { values[p.id] = p.value; });
            const start = m.initial && m.presets && m.presets[m.initial];
            if (start) Object.assign(values, start);
            hooks.onState(state);
            hooks.onValues(values);
            post({ type: 'MANIFEST', manifest: m });
        },
        sendCode(text) { post({ type: 'CODE', text }); },
        isStandalone: () => !inFrame
    };
})();
