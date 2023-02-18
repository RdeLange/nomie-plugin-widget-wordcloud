
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function createNotificationStore (timeout) {
        const _notifications = writable([]);

        function send (message, type = "default", timeout) {
            _notifications.update(state => {
                return [...state, { id: id(), type, message, timeout }]
            });
        }

        const notifications = derived(_notifications, ($_notifications, set) => {
            set($_notifications);
            if ($_notifications.length > 0) {
                const timer = setTimeout(() => {
                    _notifications.update(state => {
                        state.shift();
                        return state
                    });
                }, $_notifications[0].timeout);
                return () => {
                    clearTimeout(timer);
                }
            }
        });
        const { subscribe } = notifications;

        return {
            subscribe,
            send,
    				default: (msg, timeout) => send(msg, "default", timeout),
            danger: (msg, timeout) => send(msg, "danger", timeout),
            warning: (msg, timeout) => send(msg, "warning", timeout),
            info: (msg, timeout) => send(msg, "info", timeout),
            success: (msg, timeout) => send(msg, "success", timeout),
        }
    }

    function id() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    const notifications = createNotificationStore();

    /* src/components/toast.svelte generated by Svelte v3.49.0 */
    const file$F = "src/components/toast.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (25:12) {#if notification.icon}
    function create_if_block$t(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*notification*/ ctx[2].icon) + " svelte-1bgp0ep"));
    			add_location(i, file$F, 24, 35, 729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$notifications*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*notification*/ ctx[2].icon) + " svelte-1bgp0ep"))) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$t.name,
    		type: "if",
    		source: "(25:12) {#if notification.icon}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each $notifications as notification (notification.id)}
    function create_each_block$5(key_1, ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*notification*/ ctx[2].message + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1_transition;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let if_block = /*notification*/ ctx[2].icon && create_if_block$t(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(div0, "class", "content svelte-1bgp0ep");
    			add_location(div0, file$F, 23, 12, 644);
    			attr_dev(div1, "class", "toast svelte-1bgp0ep");
    			set_style(div1, "background", /*themes*/ ctx[0][/*notification*/ ctx[2].type]);
    			add_location(div1, file$F, 17, 8, 466);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*$notifications*/ 2) && t0_value !== (t0_value = /*notification*/ ctx[2].message + "")) set_data_dev(t0, t0_value);

    			if (/*notification*/ ctx[2].icon) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$t(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*themes, $notifications*/ 3) {
    				set_style(div1, "background", /*themes*/ ctx[0][/*notification*/ ctx[2].type]);
    			}
    		},
    		r: function measure() {
    			rect = div1.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div1);
    			stop_animation();
    			add_transform(div1, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div1, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { y: 30 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { y: 30 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(17:4) {#each $notifications as notification (notification.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$I(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$notifications*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*notification*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "notifications svelte-1bgp0ep");
    			add_location(div, file$F, 15, 0, 369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*themes, $notifications*/ 3) {
    				each_value = /*$notifications*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$I($$self, $$props, $$invalidate) {
    	let $notifications;
    	validate_store(notifications, 'notifications');
    	component_subscribe($$self, notifications, $$value => $$invalidate(1, $notifications = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toast', slots, []);

    	let { themes = {
    		danger: "#E26D69",
    		success: "#84C991",
    		warning: "#f0ad4e",
    		info: "#5bc0de",
    		default: "#2CBEFF"
    	} } = $$props;

    	const writable_props = ['themes'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('themes' in $$props) $$invalidate(0, themes = $$props.themes);
    	};

    	$$self.$capture_state = () => ({
    		flip,
    		fly,
    		notifications,
    		themes,
    		$notifications
    	});

    	$$self.$inject_state = $$props => {
    		if ('themes' in $$props) $$invalidate(0, themes = $$props.themes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [themes, $notifications];
    }

    class Toast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, { themes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toast",
    			options,
    			id: create_fragment$I.name
    		});
    	}

    	get themes() {
    		throw new Error("<Toast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set themes(value) {
    		throw new Error("<Toast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Button/ButtonSkeleton.svelte generated by Svelte v3.49.0 */

    const file$E = "node_modules/carbon-components-svelte/src/Button/ButtonSkeleton.svelte";

    // (35:0) {:else}
    function create_else_block$6(ctx) {
    	let div;
    	let mounted;
    	let dispose;
    	let div_levels = [/*$$restProps*/ ctx[2]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--skeleton", true);
    			toggle_class(div, "bx--btn", true);
    			toggle_class(div, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(div, "bx--btn--sm", /*size*/ ctx[1] === 'small');
    			toggle_class(div, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(div, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    			add_location(div, file$E, 35, 2, 801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler_1*/ ctx[9], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler_1*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]]));
    			toggle_class(div, "bx--skeleton", true);
    			toggle_class(div, "bx--btn", true);
    			toggle_class(div, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(div, "bx--btn--sm", /*size*/ ctx[1] === 'small');
    			toggle_class(div, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(div, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(35:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if href}
    function create_if_block$s(ctx) {
    	let a;
    	let t_value = "" + "";
    	let t;
    	let a_rel_value;
    	let mounted;
    	let dispose;

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{
    			rel: a_rel_value = /*$$restProps*/ ctx[2].target === '_blank'
    			? 'noopener noreferrer'
    			: undefined
    		},
    		{ role: "button" },
    		/*$$restProps*/ ctx[2]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			set_attributes(a, a_data);
    			toggle_class(a, "bx--skeleton", true);
    			toggle_class(a, "bx--btn", true);
    			toggle_class(a, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(a, "bx--btn--sm", /*size*/ ctx[1] === 'small');
    			toggle_class(a, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(a, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    			add_location(a, file$E, 16, 2, 337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
    				dirty & /*$$restProps*/ 4 && a_rel_value !== (a_rel_value = /*$$restProps*/ ctx[2].target === '_blank'
    				? 'noopener noreferrer'
    				: undefined) && { rel: a_rel_value },
    				{ role: "button" },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]
    			]));

    			toggle_class(a, "bx--skeleton", true);
    			toggle_class(a, "bx--btn", true);
    			toggle_class(a, "bx--btn--field", /*size*/ ctx[1] === 'field');
    			toggle_class(a, "bx--btn--sm", /*size*/ ctx[1] === 'small');
    			toggle_class(a, "bx--btn--lg", /*size*/ ctx[1] === 'lg');
    			toggle_class(a, "bx--btn--xl", /*size*/ ctx[1] === 'xl');
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$s.name,
    		type: "if",
    		source: "(16:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$H(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[0]) return create_if_block$s;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props, $$invalidate) {
    	const omit_props_names = ["href","size"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonSkeleton', slots, []);
    	let { href = undefined } = $$props;
    	let { size = "default" } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('href' in $$new_props) $$invalidate(0, href = $$new_props.href);
    		if ('size' in $$new_props) $$invalidate(1, size = $$new_props.size);
    	};

    	$$self.$capture_state = () => ({ href, size });

    	$$self.$inject_state = $$new_props => {
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('size' in $$props) $$invalidate(1, size = $$new_props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		href,
    		size,
    		$$restProps,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class ButtonSkeleton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, { href: 0, size: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonSkeleton",
    			options,
    			id: create_fragment$H.name
    		});
    	}

    	get href() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Button/Button.svelte generated by Svelte v3.49.0 */
    const file$D = "node_modules/carbon-components-svelte/src/Button/Button.svelte";
    const get_default_slot_changes$4 = dirty => ({ props: dirty[0] & /*buttonProps*/ 512 });
    const get_default_slot_context$4 = ctx => ({ props: /*buttonProps*/ ctx[9] });

    // (163:0) {:else}
    function create_else_block$5(ctx) {
    	let button;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[8] && create_if_block_4$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	var switch_value = /*icon*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-hidden": "true",
    				class: "bx--btn__icon",
    				"aria-label": /*iconDescription*/ ctx[3]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let button_levels = [/*buttonProps*/ ctx[9]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(button, button_data);
    			add_location(button, file$D, 163, 2, 4429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (switch_instance) {
    				mount_component(switch_instance, button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[33](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_2*/ ctx[24], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_2*/ ctx[25], false, false, false),
    					listen_dev(button, "mouseenter", /*mouseenter_handler_2*/ ctx[26], false, false, false),
    					listen_dev(button, "mouseleave", /*mouseleave_handler_2*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasIconOnly*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$3(ctx);
    					if_block.c();
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 8) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[3];

    			if (switch_value !== (switch_value = /*icon*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, button, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty[0] & /*buttonProps*/ 512 && /*buttonProps*/ ctx[9]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			/*button_binding*/ ctx[33](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(163:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (143:28) 
    function create_if_block_2$4(ctx) {
    	let a;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[8] && create_if_block_3$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	var switch_value = /*icon*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-hidden": "true",
    				class: "bx--btn__icon",
    				"aria-label": /*iconDescription*/ ctx[3]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let a_levels = [/*buttonProps*/ ctx[9]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(a, a_data);
    			add_location(a, file$D, 144, 2, 4046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			if (switch_instance) {
    				mount_component(switch_instance, a, null);
    			}

    			/*a_binding*/ ctx[32](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler_1*/ ctx[20], false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler_1*/ ctx[21], false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler_1*/ ctx[22], false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler_1*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasIconOnly*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$3(ctx);
    					if_block.c();
    					if_block.m(a, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 8) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[3];

    			if (switch_value !== (switch_value = /*icon*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, a, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [dirty[0] & /*buttonProps*/ 512 && /*buttonProps*/ ctx[9]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			/*a_binding*/ ctx[32](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(143:28) ",
    		ctx
    	});

    	return block;
    }

    // (141:13) 
    function create_if_block_1$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context$4);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, buttonProps*/ 262656)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes$4),
    						get_default_slot_context$4
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(141:13) ",
    		ctx
    	});

    	return block;
    }

    // (130:0) {#if skeleton}
    function create_if_block$r(ctx) {
    	let buttonskeleton;
    	let current;

    	const buttonskeleton_spread_levels = [
    		{ href: /*href*/ ctx[7] },
    		{ size: /*size*/ ctx[1] },
    		/*$$restProps*/ ctx[10],
    		{
    			style: /*hasIconOnly*/ ctx[8] && 'width: 3rem;'
    		}
    	];

    	let buttonskeleton_props = {};

    	for (let i = 0; i < buttonskeleton_spread_levels.length; i += 1) {
    		buttonskeleton_props = assign(buttonskeleton_props, buttonskeleton_spread_levels[i]);
    	}

    	buttonskeleton = new ButtonSkeleton({
    			props: buttonskeleton_props,
    			$$inline: true
    		});

    	buttonskeleton.$on("click", /*click_handler*/ ctx[28]);
    	buttonskeleton.$on("mouseover", /*mouseover_handler*/ ctx[29]);
    	buttonskeleton.$on("mouseenter", /*mouseenter_handler*/ ctx[30]);
    	buttonskeleton.$on("mouseleave", /*mouseleave_handler*/ ctx[31]);

    	const block = {
    		c: function create() {
    			create_component(buttonskeleton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(buttonskeleton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const buttonskeleton_changes = (dirty[0] & /*href, size, $$restProps, hasIconOnly*/ 1410)
    			? get_spread_update(buttonskeleton_spread_levels, [
    					dirty[0] & /*href*/ 128 && { href: /*href*/ ctx[7] },
    					dirty[0] & /*size*/ 2 && { size: /*size*/ ctx[1] },
    					dirty[0] & /*$$restProps*/ 1024 && get_spread_object(/*$$restProps*/ ctx[10]),
    					dirty[0] & /*hasIconOnly*/ 256 && {
    						style: /*hasIconOnly*/ ctx[8] && 'width: 3rem;'
    					}
    				])
    			: {};

    			buttonskeleton.$set(buttonskeleton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonskeleton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonskeleton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(buttonskeleton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$r.name,
    		type: "if",
    		source: "(130:0) {#if skeleton}",
    		ctx
    	});

    	return block;
    }

    // (172:4) {#if hasIconOnly}
    function create_if_block_4$3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[3]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$D, 172, 6, 4578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iconDescription*/ 8) set_data_dev(t, /*iconDescription*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(172:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    // (153:4) {#if hasIconOnly}
    function create_if_block_3$3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[3]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$D, 153, 6, 4190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iconDescription*/ 8) set_data_dev(t, /*iconDescription*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(153:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$G(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$r, create_if_block_1$6, create_if_block_2$4, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*skeleton*/ ctx[5]) return 0;
    		if (/*as*/ ctx[4]) return 1;
    		if (/*href*/ ctx[7] && !/*disabled*/ ctx[6]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	let hasIconOnly;
    	let buttonProps;

    	const omit_props_names = [
    		"kind","size","expressive","isSelected","icon","iconDescription","tooltipAlignment","tooltipPosition","as","skeleton","disabled","href","tabindex","type","ref"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { kind = "primary" } = $$props;
    	let { size = "default" } = $$props;
    	let { expressive = false } = $$props;
    	let { isSelected = false } = $$props;
    	let { icon = undefined } = $$props;
    	let { iconDescription = undefined } = $$props;
    	let { tooltipAlignment = "center" } = $$props;
    	let { tooltipPosition = "bottom" } = $$props;
    	let { as = false } = $$props;
    	let { skeleton = false } = $$props;
    	let { disabled = false } = $$props;
    	let { href = undefined } = $$props;
    	let { tabindex = "0" } = $$props;
    	let { type = "button" } = $$props;
    	let { ref = null } = $$props;
    	const ctx = getContext("ComposedModal");

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('kind' in $$new_props) $$invalidate(11, kind = $$new_props.kind);
    		if ('size' in $$new_props) $$invalidate(1, size = $$new_props.size);
    		if ('expressive' in $$new_props) $$invalidate(12, expressive = $$new_props.expressive);
    		if ('isSelected' in $$new_props) $$invalidate(13, isSelected = $$new_props.isSelected);
    		if ('icon' in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ('iconDescription' in $$new_props) $$invalidate(3, iconDescription = $$new_props.iconDescription);
    		if ('tooltipAlignment' in $$new_props) $$invalidate(14, tooltipAlignment = $$new_props.tooltipAlignment);
    		if ('tooltipPosition' in $$new_props) $$invalidate(15, tooltipPosition = $$new_props.tooltipPosition);
    		if ('as' in $$new_props) $$invalidate(4, as = $$new_props.as);
    		if ('skeleton' in $$new_props) $$invalidate(5, skeleton = $$new_props.skeleton);
    		if ('disabled' in $$new_props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ('href' in $$new_props) $$invalidate(7, href = $$new_props.href);
    		if ('tabindex' in $$new_props) $$invalidate(16, tabindex = $$new_props.tabindex);
    		if ('type' in $$new_props) $$invalidate(17, type = $$new_props.type);
    		if ('ref' in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		kind,
    		size,
    		expressive,
    		isSelected,
    		icon,
    		iconDescription,
    		tooltipAlignment,
    		tooltipPosition,
    		as,
    		skeleton,
    		disabled,
    		href,
    		tabindex,
    		type,
    		ref,
    		getContext,
    		ButtonSkeleton,
    		ctx,
    		hasIconOnly,
    		buttonProps
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('kind' in $$props) $$invalidate(11, kind = $$new_props.kind);
    		if ('size' in $$props) $$invalidate(1, size = $$new_props.size);
    		if ('expressive' in $$props) $$invalidate(12, expressive = $$new_props.expressive);
    		if ('isSelected' in $$props) $$invalidate(13, isSelected = $$new_props.isSelected);
    		if ('icon' in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ('iconDescription' in $$props) $$invalidate(3, iconDescription = $$new_props.iconDescription);
    		if ('tooltipAlignment' in $$props) $$invalidate(14, tooltipAlignment = $$new_props.tooltipAlignment);
    		if ('tooltipPosition' in $$props) $$invalidate(15, tooltipPosition = $$new_props.tooltipPosition);
    		if ('as' in $$props) $$invalidate(4, as = $$new_props.as);
    		if ('skeleton' in $$props) $$invalidate(5, skeleton = $$new_props.skeleton);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ('href' in $$props) $$invalidate(7, href = $$new_props.href);
    		if ('tabindex' in $$props) $$invalidate(16, tabindex = $$new_props.tabindex);
    		if ('type' in $$props) $$invalidate(17, type = $$new_props.type);
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ('hasIconOnly' in $$props) $$invalidate(8, hasIconOnly = $$new_props.hasIconOnly);
    		if ('buttonProps' in $$props) $$invalidate(9, buttonProps = $$new_props.buttonProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ref*/ 1) {
    			if (ctx && ref) {
    				ctx.declareRef(ref);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*icon*/ 4) {
    			$$invalidate(8, hasIconOnly = icon && !$$slots.default);
    		}

    		$$invalidate(9, buttonProps = {
    			type: href && !disabled ? undefined : type,
    			tabindex,
    			disabled: disabled === true ? true : undefined,
    			href,
    			"aria-pressed": hasIconOnly && kind === "ghost" && !href
    			? isSelected
    			: undefined,
    			...$$restProps,
    			class: [
    				"bx--btn",
    				expressive && "bx--btn--expressive",
    				(size === "small" && !expressive || size === "sm" && !expressive || size === "small" && !expressive) && "bx--btn--sm",
    				size === "field" && !expressive || size === "md" && !expressive && "bx--btn--md",
    				size === "field" && "bx--btn--field",
    				size === "small" && "bx--btn--sm",
    				size === "lg" && "bx--btn--lg",
    				size === "xl" && "bx--btn--xl",
    				kind && `bx--btn--${kind}`,
    				disabled && "bx--btn--disabled",
    				hasIconOnly && "bx--btn--icon-only",
    				hasIconOnly && "bx--tooltip__trigger",
    				hasIconOnly && "bx--tooltip--a11y",
    				hasIconOnly && tooltipPosition && `bx--btn--icon-only--${tooltipPosition}`,
    				hasIconOnly && tooltipAlignment && `bx--tooltip--align-${tooltipAlignment}`,
    				hasIconOnly && isSelected && kind === "ghost" && "bx--btn--selected",
    				$$restProps.class
    			].filter(Boolean).join(" ")
    		});
    	};

    	return [
    		ref,
    		size,
    		icon,
    		iconDescription,
    		as,
    		skeleton,
    		disabled,
    		href,
    		hasIconOnly,
    		buttonProps,
    		$$restProps,
    		kind,
    		expressive,
    		isSelected,
    		tooltipAlignment,
    		tooltipPosition,
    		tabindex,
    		type,
    		$$scope,
    		slots,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1,
    		click_handler_2,
    		mouseover_handler_2,
    		mouseenter_handler_2,
    		mouseleave_handler_2,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		a_binding,
    		button_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$G,
    			create_fragment$G,
    			safe_not_equal,
    			{
    				kind: 11,
    				size: 1,
    				expressive: 12,
    				isSelected: 13,
    				icon: 2,
    				iconDescription: 3,
    				tooltipAlignment: 14,
    				tooltipPosition: 15,
    				as: 4,
    				skeleton: 5,
    				disabled: 6,
    				href: 7,
    				tabindex: 16,
    				type: 17,
    				ref: 0
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$G.name
    		});
    	}

    	get kind() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kind(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expressive() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expressive(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDescription() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDescription(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipAlignment() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipAlignment(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipPosition() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipPosition(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get skeleton() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skeleton(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/WarningFilled.svelte generated by Svelte v3.49.0 */

    const file$C = "node_modules/carbon-components-svelte/src/icons/WarningFilled.svelte";

    // (24:2) {#if title}
    function create_if_block$q(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$C, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$q.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$F(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let if_block = /*title*/ ctx[1] && create_if_block$q(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25\tc-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z");
    			add_location(path0, file$C, 24, 2, 579);
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "d", "M17.5,23.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22\tC16.8,22,17.5,22.7,17.5,23.5z M17.1,8h-2.2v11h2.2V8z");
    			attr_dev(path1, "data-icon-path", "inner-path");
    			attr_dev(path1, "opacity", "0");
    			add_location(path1, file$C, 26, 10, 777);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$C, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$q(ctx);
    					if_block.c();
    					if_block.m(svg, path0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WarningFilled', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class WarningFilled extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WarningFilled",
    			options,
    			id: create_fragment$F.name
    		});
    	}

    	get size() {
    		throw new Error("<WarningFilled>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<WarningFilled>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<WarningFilled>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<WarningFilled>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/WarningAltFilled.svelte generated by Svelte v3.49.0 */

    const file$B = "node_modules/carbon-components-svelte/src/icons/WarningAltFilled.svelte";

    // (24:2) {#if title}
    function create_if_block$p(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$B, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$p.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$E(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let if_block = /*title*/ ctx[1] && create_if_block$p(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "d", "M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z");
    			attr_dev(path0, "data-icon-path", "inner-path");
    			add_location(path0, file$B, 24, 2, 579);
    			attr_dev(path1, "d", "M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z");
    			add_location(path1, file$B, 27, 39, 722);
    			attr_dev(path2, "d", "M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z");
    			add_location(path2, file$B, 29, 10, 886);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$B, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$p(ctx);
    					if_block.c();
    					if_block.m(svg, path0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WarningAltFilled', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class WarningAltFilled extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WarningAltFilled",
    			options,
    			id: create_fragment$E.name
    		});
    	}

    	get size() {
    		throw new Error("<WarningAltFilled>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<WarningAltFilled>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<WarningAltFilled>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<WarningAltFilled>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/ChevronDown.svelte generated by Svelte v3.49.0 */

    const file$A = "node_modules/carbon-components-svelte/src/icons/ChevronDown.svelte";

    // (24:2) {#if title}
    function create_if_block$o(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$A, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$o.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$o(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z");
    			add_location(path, file$A, 24, 2, 579);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$A, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$o(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChevronDown', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class ChevronDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronDown",
    			options,
    			id: create_fragment$D.name
    		});
    	}

    	get size() {
    		throw new Error("<ChevronDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ChevronDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ChevronDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ChevronDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/Close.svelte generated by Svelte v3.49.0 */

    const file$z = "node_modules/carbon-components-svelte/src/icons/Close.svelte";

    // (24:2) {#if title}
    function create_if_block$n(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$z, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$n.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$n(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z");
    			add_location(path, file$z, 24, 2, 579);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$z, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$n(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Close', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class Close extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Close",
    			options,
    			id: create_fragment$C.name
    		});
    	}

    	get size() {
    		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Close>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Close>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/OverflowMenuVertical.svelte generated by Svelte v3.49.0 */

    const file$y = "node_modules/carbon-components-svelte/src/icons/OverflowMenuVertical.svelte";

    // (24:2) {#if title}
    function create_if_block$m(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$y, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$m.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$B(ctx) {
    	let svg;
    	let circle0;
    	let circle1;
    	let circle2;
    	let if_block = /*title*/ ctx[1] && create_if_block$m(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			attr_dev(circle0, "cx", "16");
    			attr_dev(circle0, "cy", "8");
    			attr_dev(circle0, "r", "2");
    			add_location(circle0, file$y, 24, 2, 579);
    			attr_dev(circle1, "cx", "16");
    			attr_dev(circle1, "cy", "16");
    			attr_dev(circle1, "r", "2");
    			add_location(circle1, file$y, 24, 40, 617);
    			attr_dev(circle2, "cx", "16");
    			attr_dev(circle2, "cy", "24");
    			attr_dev(circle2, "r", "2");
    			add_location(circle2, file$y, 25, 12, 659);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$y, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, circle0);
    			append_dev(svg, circle1);
    			append_dev(svg, circle2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$m(ctx);
    					if_block.c();
    					if_block.m(svg, circle0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OverflowMenuVertical', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class OverflowMenuVertical extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OverflowMenuVertical",
    			options,
    			id: create_fragment$B.name
    		});
    	}

    	get size() {
    		throw new Error("<OverflowMenuVertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<OverflowMenuVertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<OverflowMenuVertical>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<OverflowMenuVertical>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/OverflowMenuHorizontal.svelte generated by Svelte v3.49.0 */

    const file$x = "node_modules/carbon-components-svelte/src/icons/OverflowMenuHorizontal.svelte";

    // (24:2) {#if title}
    function create_if_block$l(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$x, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$l.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let svg;
    	let circle0;
    	let circle1;
    	let circle2;
    	let if_block = /*title*/ ctx[1] && create_if_block$l(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			attr_dev(circle0, "cx", "8");
    			attr_dev(circle0, "cy", "16");
    			attr_dev(circle0, "r", "2");
    			add_location(circle0, file$x, 24, 2, 579);
    			attr_dev(circle1, "cx", "16");
    			attr_dev(circle1, "cy", "16");
    			attr_dev(circle1, "r", "2");
    			add_location(circle1, file$x, 24, 40, 617);
    			attr_dev(circle2, "cx", "24");
    			attr_dev(circle2, "cy", "16");
    			attr_dev(circle2, "r", "2");
    			add_location(circle2, file$x, 25, 12, 659);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$x, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, circle0);
    			append_dev(svg, circle1);
    			append_dev(svg, circle2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$l(ctx);
    					if_block.c();
    					if_block.m(svg, circle0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OverflowMenuHorizontal', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class OverflowMenuHorizontal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OverflowMenuHorizontal",
    			options,
    			id: create_fragment$A.name
    		});
    	}

    	get size() {
    		throw new Error("<OverflowMenuHorizontal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<OverflowMenuHorizontal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<OverflowMenuHorizontal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<OverflowMenuHorizontal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/OverflowMenu/OverflowMenu.svelte generated by Svelte v3.49.0 */
    const file$w = "node_modules/carbon-components-svelte/src/OverflowMenu/OverflowMenu.svelte";
    const get_menu_slot_changes = dirty => ({});
    const get_menu_slot_context = ctx => ({});

    // (233:20)      
    function fallback_block$7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*icon*/ ctx[1];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-label": /*iconDescription*/ ctx[10],
    				title: /*iconDescription*/ ctx[10],
    				class: "bx--overflow-menu__icon " + /*iconClass*/ ctx[9]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 1024) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[10];
    			if (dirty[0] & /*iconDescription*/ 1024) switch_instance_changes.title = /*iconDescription*/ ctx[10];
    			if (dirty[0] & /*iconClass*/ 512) switch_instance_changes.class = "bx--overflow-menu__icon " + /*iconClass*/ ctx[9];

    			if (switch_value !== (switch_value = /*icon*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$7.name,
    		type: "fallback",
    		source: "(233:20)      ",
    		ctx
    	});

    	return block;
    }

    // (241:2) {#if open}
    function create_if_block$k(ctx) {
    	let ul;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "role", "menu");
    			attr_dev(ul, "tabindex", "-1");
    			attr_dev(ul, "aria-label", /*ariaLabel*/ ctx[13]);
    			attr_dev(ul, "data-floating-menu-direction", /*direction*/ ctx[5]);
    			attr_dev(ul, "class", /*menuOptionsClass*/ ctx[8]);
    			toggle_class(ul, "bx--overflow-menu-options", true);
    			toggle_class(ul, "bx--overflow-menu--flip", /*flipped*/ ctx[7]);
    			toggle_class(ul, "bx--overflow-menu-options--open", /*open*/ ctx[0]);
    			toggle_class(ul, "bx--overflow-menu-options--light", /*light*/ ctx[6]);
    			toggle_class(ul, "bx--overflow-menu-options--sm", /*size*/ ctx[4] === 'sm');
    			toggle_class(ul, "bx--overflow-menu-options--xl", /*size*/ ctx[4] === 'xl');
    			toggle_class(ul, "bx--breadcrumb-menu-options", !!/*ctxBreadcrumbItem*/ ctx[14]);
    			add_location(ul, file$w, 241, 4, 5720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			/*ul_binding*/ ctx[30](ul);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 4194304)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[22],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[22])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[22], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty[0] & /*ariaLabel*/ 8192) {
    				attr_dev(ul, "aria-label", /*ariaLabel*/ ctx[13]);
    			}

    			if (!current || dirty[0] & /*direction*/ 32) {
    				attr_dev(ul, "data-floating-menu-direction", /*direction*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*menuOptionsClass*/ 256) {
    				attr_dev(ul, "class", /*menuOptionsClass*/ ctx[8]);
    			}

    			if (dirty[0] & /*menuOptionsClass*/ 256) {
    				toggle_class(ul, "bx--overflow-menu-options", true);
    			}

    			if (dirty[0] & /*menuOptionsClass, flipped*/ 384) {
    				toggle_class(ul, "bx--overflow-menu--flip", /*flipped*/ ctx[7]);
    			}

    			if (dirty[0] & /*menuOptionsClass, open*/ 257) {
    				toggle_class(ul, "bx--overflow-menu-options--open", /*open*/ ctx[0]);
    			}

    			if (dirty[0] & /*menuOptionsClass, light*/ 320) {
    				toggle_class(ul, "bx--overflow-menu-options--light", /*light*/ ctx[6]);
    			}

    			if (dirty[0] & /*menuOptionsClass, size*/ 272) {
    				toggle_class(ul, "bx--overflow-menu-options--sm", /*size*/ ctx[4] === 'sm');
    			}

    			if (dirty[0] & /*menuOptionsClass, size*/ 272) {
    				toggle_class(ul, "bx--overflow-menu-options--xl", /*size*/ ctx[4] === 'xl');
    			}

    			if (dirty[0] & /*menuOptionsClass, ctxBreadcrumbItem*/ 16640) {
    				toggle_class(ul, "bx--breadcrumb-menu-options", !!/*ctxBreadcrumbItem*/ ctx[14]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_binding*/ ctx[30](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$k.name,
    		type: "if",
    		source: "(241:2) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$z(ctx) {
    	let html_tag;
    	let html_anchor;
    	let t0;
    	let button;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	const menu_slot_template = /*#slots*/ ctx[23].menu;
    	const menu_slot = create_slot(menu_slot_template, ctx, /*$$scope*/ ctx[22], get_menu_slot_context);
    	const menu_slot_or_fallback = menu_slot || fallback_block$7(ctx);
    	let if_block = /*open*/ ctx[0] && create_if_block$k(ctx);

    	let button_levels = [
    		{ type: "button" },
    		{ "aria-haspopup": "" },
    		{ "aria-expanded": /*open*/ ctx[0] },
    		{ "aria-label": /*ariaLabel*/ ctx[13] },
    		{ id: /*id*/ ctx[11] },
    		/*$$restProps*/ ctx[18]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			t0 = space();
    			button = element("button");
    			if (menu_slot_or_fallback) menu_slot_or_fallback.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			html_tag.a = html_anchor;
    			set_attributes(button, button_data);
    			toggle_class(button, "bx--overflow-menu", true);
    			toggle_class(button, "bx--overflow-menu--open", /*open*/ ctx[0]);
    			toggle_class(button, "bx--overflow-menu--light", /*light*/ ctx[6]);
    			toggle_class(button, "bx--overflow-menu--sm", /*size*/ ctx[4] === 'sm');
    			toggle_class(button, "bx--overflow-menu--xl", /*size*/ ctx[4] === 'xl');
    			add_location(button, file$w, 190, 0, 4535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*styles*/ ctx[12], document.head);
    			append_dev(document.head, html_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);

    			if (menu_slot_or_fallback) {
    				menu_slot_or_fallback.m(button, null);
    			}

    			append_dev(button, t1);
    			if (if_block) if_block.m(button, null);
    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[31](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*click_handler_1*/ ctx[29], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[24], false, false, false),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[32], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler*/ ctx[25], false, false, false),
    					listen_dev(button, "mouseenter", /*mouseenter_handler*/ ctx[26], false, false, false),
    					listen_dev(button, "mouseleave", /*mouseleave_handler*/ ctx[27], false, false, false),
    					listen_dev(button, "keydown", /*keydown_handler*/ ctx[28], false, false, false),
    					listen_dev(button, "keydown", /*keydown_handler_1*/ ctx[33], false, false, false),
    					listen_dev(button, "focusout", /*focusout_handler*/ ctx[34], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*styles*/ 4096) html_tag.p(/*styles*/ ctx[12]);

    			if (menu_slot) {
    				if (menu_slot.p && (!current || dirty[0] & /*$$scope*/ 4194304)) {
    					update_slot_base(
    						menu_slot,
    						menu_slot_template,
    						ctx,
    						/*$$scope*/ ctx[22],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[22])
    						: get_slot_changes(menu_slot_template, /*$$scope*/ ctx[22], dirty, get_menu_slot_changes),
    						get_menu_slot_context
    					);
    				}
    			} else {
    				if (menu_slot_or_fallback && menu_slot_or_fallback.p && (!current || dirty[0] & /*icon, iconDescription, iconClass*/ 1538)) {
    					menu_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}

    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$k(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				{ type: "button" },
    				{ "aria-haspopup": "" },
    				(!current || dirty[0] & /*open*/ 1) && { "aria-expanded": /*open*/ ctx[0] },
    				(!current || dirty[0] & /*ariaLabel*/ 8192) && { "aria-label": /*ariaLabel*/ ctx[13] },
    				(!current || dirty[0] & /*id*/ 2048) && { id: /*id*/ ctx[11] },
    				dirty[0] & /*$$restProps*/ 262144 && /*$$restProps*/ ctx[18]
    			]));

    			toggle_class(button, "bx--overflow-menu", true);
    			toggle_class(button, "bx--overflow-menu--open", /*open*/ ctx[0]);
    			toggle_class(button, "bx--overflow-menu--light", /*light*/ ctx[6]);
    			toggle_class(button, "bx--overflow-menu--sm", /*size*/ ctx[4] === 'sm');
    			toggle_class(button, "bx--overflow-menu--xl", /*size*/ ctx[4] === 'xl');
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu_slot_or_fallback, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			if (menu_slot_or_fallback) menu_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			/*button_binding*/ ctx[31](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let styles;

    	const omit_props_names = [
    		"size","direction","open","light","flipped","menuOptionsClass","icon","iconClass","iconDescription","id","buttonRef","menuRef"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $currentIndex;
    	let $items;
    	let $currentId;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OverflowMenu', slots, ['menu','default']);
    	let { size = undefined } = $$props;
    	let { direction = "bottom" } = $$props;
    	let { open = false } = $$props;
    	let { light = false } = $$props;
    	let { flipped = false } = $$props;
    	let { menuOptionsClass = undefined } = $$props;
    	let { icon = OverflowMenuVertical } = $$props;
    	let { iconClass = undefined } = $$props;
    	let { iconDescription = "Open and close list of options" } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { buttonRef = null } = $$props;
    	let { menuRef = null } = $$props;
    	const ctxBreadcrumbItem = getContext("BreadcrumbItem");
    	const dispatch = createEventDispatcher();
    	const items = writable([]);
    	validate_store(items, 'items');
    	component_subscribe($$self, items, value => $$invalidate(21, $items = value));
    	const currentId = writable(undefined);
    	validate_store(currentId, 'currentId');
    	component_subscribe($$self, currentId, value => $$invalidate(36, $currentId = value));
    	const focusedId = writable(undefined);
    	const currentIndex = writable(-1);
    	validate_store(currentIndex, 'currentIndex');
    	component_subscribe($$self, currentIndex, value => $$invalidate(20, $currentIndex = value));
    	let buttonWidth = undefined;
    	let onMountAfterUpdate = true;

    	setContext("OverflowMenu", {
    		focusedId,
    		add: ({ id, text, primaryFocus, disabled }) => {
    			items.update(_ => {
    				if (primaryFocus) {
    					currentIndex.set(_.length);
    				}

    				return [
    					..._,
    					{
    						id,
    						text,
    						primaryFocus,
    						disabled,
    						index: _.length
    					}
    				];
    			});
    		},
    		update: id => {
    			currentId.set(id);
    		},
    		change: direction => {
    			let index = $currentIndex + direction;

    			if (index < 0) {
    				index = $items.length - 1;
    			} else if (index >= $items.length) {
    				index = 0;
    			}

    			let disabled = $items[index].disabled;

    			while (disabled) {
    				index = index + direction;

    				if (index < 0) {
    					index = $items.length - 1;
    				} else if (index >= $items.length) {
    					index = 0;
    				}

    				disabled = $items[index].disabled;
    			}

    			currentIndex.set(index);
    		}
    	});

    	afterUpdate(() => {
    		if ($currentId) {
    			const { index, text } = $items.filter(_ => _.id === $currentId)[0];
    			dispatch("close", { index, text });
    			$$invalidate(0, open = false);
    		}

    		if (open) {
    			const { width, height } = buttonRef.getBoundingClientRect();
    			$$invalidate(19, buttonWidth = width);

    			if (!onMountAfterUpdate && $currentIndex < 0) {
    				menuRef.focus();
    			}

    			if (flipped) {
    				$$invalidate(3, menuRef.style.left = "auto", menuRef);
    				$$invalidate(3, menuRef.style.right = 0, menuRef);
    			}

    			if (direction === "top") {
    				$$invalidate(3, menuRef.style.top = "auto", menuRef);
    				$$invalidate(3, menuRef.style.bottom = height + "px", menuRef);
    			} else if (direction === "bottom") {
    				$$invalidate(3, menuRef.style.top = height + "px", menuRef);
    			}

    			if (ctxBreadcrumbItem) {
    				$$invalidate(3, menuRef.style.top = height + 10 + "px", menuRef);
    				$$invalidate(3, menuRef.style.left = -11 + "px", menuRef);
    			}
    		}

    		if (!open) {
    			items.set([]);
    			currentId.set(undefined);
    			currentIndex.set(0);
    		}

    		onMountAfterUpdate = false;
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler_1 = ({ target }) => {
    		if (buttonRef && buttonRef.contains(target)) return;

    		if (menuRef && !menuRef.contains(target)) {
    			$$invalidate(0, open = false);
    		}
    	};

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menuRef = $$value;
    			$$invalidate(3, menuRef);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			buttonRef = $$value;
    			$$invalidate(2, buttonRef);
    		});
    	}

    	const click_handler_2 = ({ target }) => {
    		if (!(menuRef && menuRef.contains(target))) {
    			$$invalidate(0, open = !open);
    		}
    	};

    	const keydown_handler_1 = e => {
    		if (open) {
    			if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) {
    				e.preventDefault();
    			} else if (e.key === 'Escape') {
    				e.stopPropagation();
    				$$invalidate(0, open = false);
    				buttonRef.focus();
    			}
    		}
    	};

    	const focusout_handler = e => {
    		if (open) {
    			if (!buttonRef.contains(e.relatedTarget)) {
    				$$invalidate(0, open = false);
    			}
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$invalidate(39, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(18, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(4, size = $$new_props.size);
    		if ('direction' in $$new_props) $$invalidate(5, direction = $$new_props.direction);
    		if ('open' in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ('light' in $$new_props) $$invalidate(6, light = $$new_props.light);
    		if ('flipped' in $$new_props) $$invalidate(7, flipped = $$new_props.flipped);
    		if ('menuOptionsClass' in $$new_props) $$invalidate(8, menuOptionsClass = $$new_props.menuOptionsClass);
    		if ('icon' in $$new_props) $$invalidate(1, icon = $$new_props.icon);
    		if ('iconClass' in $$new_props) $$invalidate(9, iconClass = $$new_props.iconClass);
    		if ('iconDescription' in $$new_props) $$invalidate(10, iconDescription = $$new_props.iconDescription);
    		if ('id' in $$new_props) $$invalidate(11, id = $$new_props.id);
    		if ('buttonRef' in $$new_props) $$invalidate(2, buttonRef = $$new_props.buttonRef);
    		if ('menuRef' in $$new_props) $$invalidate(3, menuRef = $$new_props.menuRef);
    		if ('$$scope' in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		size,
    		direction,
    		open,
    		light,
    		flipped,
    		menuOptionsClass,
    		icon,
    		iconClass,
    		iconDescription,
    		id,
    		buttonRef,
    		menuRef,
    		createEventDispatcher,
    		getContext,
    		setContext,
    		afterUpdate,
    		writable,
    		OverflowMenuVertical,
    		OverflowMenuHorizontal,
    		ctxBreadcrumbItem,
    		dispatch,
    		items,
    		currentId,
    		focusedId,
    		currentIndex,
    		buttonWidth,
    		onMountAfterUpdate,
    		styles,
    		ariaLabel,
    		$currentIndex,
    		$items,
    		$currentId
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(39, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(4, size = $$new_props.size);
    		if ('direction' in $$props) $$invalidate(5, direction = $$new_props.direction);
    		if ('open' in $$props) $$invalidate(0, open = $$new_props.open);
    		if ('light' in $$props) $$invalidate(6, light = $$new_props.light);
    		if ('flipped' in $$props) $$invalidate(7, flipped = $$new_props.flipped);
    		if ('menuOptionsClass' in $$props) $$invalidate(8, menuOptionsClass = $$new_props.menuOptionsClass);
    		if ('icon' in $$props) $$invalidate(1, icon = $$new_props.icon);
    		if ('iconClass' in $$props) $$invalidate(9, iconClass = $$new_props.iconClass);
    		if ('iconDescription' in $$props) $$invalidate(10, iconDescription = $$new_props.iconDescription);
    		if ('id' in $$props) $$invalidate(11, id = $$new_props.id);
    		if ('buttonRef' in $$props) $$invalidate(2, buttonRef = $$new_props.buttonRef);
    		if ('menuRef' in $$props) $$invalidate(3, menuRef = $$new_props.menuRef);
    		if ('buttonWidth' in $$props) $$invalidate(19, buttonWidth = $$new_props.buttonWidth);
    		if ('onMountAfterUpdate' in $$props) onMountAfterUpdate = $$new_props.onMountAfterUpdate;
    		if ('styles' in $$props) $$invalidate(12, styles = $$new_props.styles);
    		if ('ariaLabel' in $$props) $$invalidate(13, ariaLabel = $$new_props.ariaLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(13, ariaLabel = $$props["aria-label"] || "menu");

    		if ($$self.$$.dirty[0] & /*$items, $currentIndex*/ 3145728) {
    			if ($items[$currentIndex]) {
    				focusedId.set($items[$currentIndex].id);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*id, buttonWidth*/ 526336) {
    			$$invalidate(12, styles = `<style>
    #${id} .bx--overflow-menu-options.bx--overflow-menu-options:after {
      width: ${buttonWidth ? buttonWidth + "px" : "2rem"};
    }
  <\/style>`);
    		}
    	};

    	if (ctxBreadcrumbItem) {
    		$$invalidate(1, icon = OverflowMenuHorizontal);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		open,
    		icon,
    		buttonRef,
    		menuRef,
    		size,
    		direction,
    		light,
    		flipped,
    		menuOptionsClass,
    		iconClass,
    		iconDescription,
    		id,
    		styles,
    		ariaLabel,
    		ctxBreadcrumbItem,
    		items,
    		currentId,
    		currentIndex,
    		$$restProps,
    		buttonWidth,
    		$currentIndex,
    		$items,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler,
    		click_handler_1,
    		ul_binding,
    		button_binding,
    		click_handler_2,
    		keydown_handler_1,
    		focusout_handler
    	];
    }

    class OverflowMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$z,
    			create_fragment$z,
    			safe_not_equal,
    			{
    				size: 4,
    				direction: 5,
    				open: 0,
    				light: 6,
    				flipped: 7,
    				menuOptionsClass: 8,
    				icon: 1,
    				iconClass: 9,
    				iconDescription: 10,
    				id: 11,
    				buttonRef: 2,
    				menuRef: 3
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OverflowMenu",
    			options,
    			id: create_fragment$z.name
    		});
    	}

    	get size() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flipped() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flipped(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuOptionsClass() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuOptionsClass(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDescription() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDescription(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonRef() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonRef(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuRef() {
    		throw new Error("<OverflowMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuRef(value) {
    		throw new Error("<OverflowMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/OverflowMenu/OverflowMenuItem.svelte generated by Svelte v3.49.0 */
    const file$v = "node_modules/carbon-components-svelte/src/OverflowMenu/OverflowMenuItem.svelte";

    // (88:2) {:else}
    function create_else_block$4(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
    	const default_slot_or_fallback = default_slot || fallback_block_1$1(ctx);
    	let button_levels = [/*buttonProps*/ ctx[7]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			add_location(button, file$v, 88, 4, 2234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[24](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_1*/ ctx[19], false, false, false),
    					listen_dev(button, "click", /*click_handler_3*/ ctx[25], false, false, false),
    					listen_dev(button, "keydown", /*keydown_handler_1*/ ctx[20], false, false, false),
    					listen_dev(button, "keydown", /*keydown_handler_3*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*text*/ 2)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*buttonProps*/ 128 && /*buttonProps*/ ctx[7]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*button_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(88:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#if href}
    function create_if_block$j(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
    	const default_slot_or_fallback = default_slot || fallback_block$6(ctx);
    	let a_levels = [/*buttonProps*/ ctx[7]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(a, a_data);
    			add_location(a, file$v, 65, 4, 1766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(a, null);
    			}

    			/*a_binding*/ ctx[21](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[17], false, false, false),
    					listen_dev(a, "click", /*click_handler_2*/ ctx[22], false, false, false),
    					listen_dev(a, "keydown", /*keydown_handler*/ ctx[18], false, false, false),
    					listen_dev(a, "keydown", /*keydown_handler_2*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*text*/ 2)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [dirty & /*buttonProps*/ 128 && /*buttonProps*/ ctx[7]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*a_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$j.name,
    		type: "if",
    		source: "(64:2) {#if href}",
    		ctx
    	});

    	return block;
    }

    // (105:12)          
    function fallback_block_1$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[1]);
    			toggle_class(div, "bx--overflow-menu-options__option-content", true);
    			add_location(div, file$v, 105, 8, 2575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(105:12)          ",
    		ctx
    	});

    	return block;
    }

    // (82:12)          
    function fallback_block$6(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[1]);
    			toggle_class(div, "bx--overflow-menu-options__option-content", true);
    			add_location(div, file$v, 82, 8, 2102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$6.name,
    		type: "fallback",
    		source: "(82:12)          ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$j, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let li_levels = [{ role: "none" }, { id: /*id*/ ctx[6] }, /*$$restProps*/ ctx[11]];
    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			set_attributes(li, li_data);
    			toggle_class(li, "bx--overflow-menu-options__option", true);
    			toggle_class(li, "bx--overflow-menu--divider", /*hasDivider*/ ctx[4]);
    			toggle_class(li, "bx--overflow-menu-options__option--danger", /*danger*/ ctx[5]);
    			toggle_class(li, "bx--overflow-menu-options__option--disabled", /*disabled*/ ctx[3]);
    			add_location(li, file$v, 54, 0, 1421);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(li, null);
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [
    				{ role: "none" },
    				(!current || dirty & /*id*/ 64) && { id: /*id*/ ctx[6] },
    				dirty & /*$$restProps*/ 2048 && /*$$restProps*/ ctx[11]
    			]));

    			toggle_class(li, "bx--overflow-menu-options__option", true);
    			toggle_class(li, "bx--overflow-menu--divider", /*hasDivider*/ ctx[4]);
    			toggle_class(li, "bx--overflow-menu-options__option--danger", /*danger*/ ctx[5]);
    			toggle_class(li, "bx--overflow-menu-options__option--disabled", /*disabled*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let buttonProps;

    	const omit_props_names = [
    		"text","href","primaryFocus","disabled","hasDivider","danger","requireTitle","id","ref"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $focusedId;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OverflowMenuItem', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { text = "Provide text" } = $$props;
    	let { href = "" } = $$props;
    	let { primaryFocus = false } = $$props;
    	let { disabled = false } = $$props;
    	let { hasDivider = false } = $$props;
    	let { danger = false } = $$props;
    	let { requireTitle = true } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { ref = null } = $$props;
    	const { focusedId, add, update, change } = getContext("OverflowMenu");
    	validate_store(focusedId, 'focusedId');
    	component_subscribe($$self, focusedId, value => $$invalidate(14, $focusedId = value));
    	add({ id, text, primaryFocus, disabled });

    	afterUpdate(() => {
    		if (ref && primaryFocus) {
    			ref.focus();
    		}
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	const click_handler_2 = () => {
    		update(id);
    	};

    	const keydown_handler_2 = ({ key }) => {
    		if (key === 'ArrowDown') {
    			change(1);
    		} else if (key === 'ArrowUp') {
    			change(-1);
    		}
    	};

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	const click_handler_3 = () => {
    		update(id);
    	};

    	const keydown_handler_3 = ({ key }) => {
    		if (key === 'ArrowDown') {
    			change(1);
    		} else if (key === 'ArrowUp') {
    			change(-1);
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('text' in $$new_props) $$invalidate(1, text = $$new_props.text);
    		if ('href' in $$new_props) $$invalidate(2, href = $$new_props.href);
    		if ('primaryFocus' in $$new_props) $$invalidate(12, primaryFocus = $$new_props.primaryFocus);
    		if ('disabled' in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('hasDivider' in $$new_props) $$invalidate(4, hasDivider = $$new_props.hasDivider);
    		if ('danger' in $$new_props) $$invalidate(5, danger = $$new_props.danger);
    		if ('requireTitle' in $$new_props) $$invalidate(13, requireTitle = $$new_props.requireTitle);
    		if ('id' in $$new_props) $$invalidate(6, id = $$new_props.id);
    		if ('ref' in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		text,
    		href,
    		primaryFocus,
    		disabled,
    		hasDivider,
    		danger,
    		requireTitle,
    		id,
    		ref,
    		getContext,
    		afterUpdate,
    		focusedId,
    		add,
    		update,
    		change,
    		buttonProps,
    		$focusedId
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('text' in $$props) $$invalidate(1, text = $$new_props.text);
    		if ('href' in $$props) $$invalidate(2, href = $$new_props.href);
    		if ('primaryFocus' in $$props) $$invalidate(12, primaryFocus = $$new_props.primaryFocus);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('hasDivider' in $$props) $$invalidate(4, hasDivider = $$new_props.hasDivider);
    		if ('danger' in $$props) $$invalidate(5, danger = $$new_props.danger);
    		if ('requireTitle' in $$props) $$invalidate(13, requireTitle = $$new_props.requireTitle);
    		if ('id' in $$props) $$invalidate(6, id = $$new_props.id);
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ('buttonProps' in $$props) $$invalidate(7, buttonProps = $$new_props.buttonProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$focusedId, id*/ 16448) {
    			$$invalidate(12, primaryFocus = $focusedId === id);
    		}

    		if ($$self.$$.dirty & /*href, disabled, requireTitle, text*/ 8206) {
    			$$invalidate(7, buttonProps = {
    				role: "menuitem",
    				tabindex: "-1",
    				class: "bx--overflow-menu-options__btn",
    				disabled: href ? undefined : disabled,
    				href: href ? href : undefined,
    				title: requireTitle
    				? $$slots.default ? undefined : text
    				: undefined
    			});
    		}
    	};

    	return [
    		ref,
    		text,
    		href,
    		disabled,
    		hasDivider,
    		danger,
    		id,
    		buttonProps,
    		focusedId,
    		update,
    		change,
    		$$restProps,
    		primaryFocus,
    		requireTitle,
    		$focusedId,
    		$$scope,
    		slots,
    		click_handler,
    		keydown_handler,
    		click_handler_1,
    		keydown_handler_1,
    		a_binding,
    		click_handler_2,
    		keydown_handler_2,
    		button_binding,
    		click_handler_3,
    		keydown_handler_3
    	];
    }

    class OverflowMenuItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {
    			text: 1,
    			href: 2,
    			primaryFocus: 12,
    			disabled: 3,
    			hasDivider: 4,
    			danger: 5,
    			requireTitle: 13,
    			id: 6,
    			ref: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OverflowMenuItem",
    			options,
    			id: create_fragment$y.name
    		});
    	}

    	get text() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryFocus() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryFocus(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasDivider() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasDivider(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requireTitle() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requireTitle(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<OverflowMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<OverflowMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Grid/Grid.svelte generated by Svelte v3.49.0 */

    const file$u = "node_modules/carbon-components-svelte/src/Grid/Grid.svelte";
    const get_default_slot_changes$3 = dirty => ({ props: dirty & /*props*/ 2 });
    const get_default_slot_context$3 = ctx => ({ props: /*props*/ ctx[1] });

    // (54:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let div_levels = [/*props*/ ctx[1]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$u, 54, 2, 1398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*props*/ 2 && /*props*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(54:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:0) {#if as}
    function create_if_block$i(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context$3);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, props*/ 514)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes$3),
    						get_default_slot_context$3
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$i.name,
    		type: "if",
    		source: "(52:0) {#if as}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$i, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*as*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let props;

    	const omit_props_names = [
    		"as","condensed","narrow","fullWidth","noGutter","noGutterLeft","noGutterRight","padding"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Grid', slots, ['default']);
    	let { as = false } = $$props;
    	let { condensed = false } = $$props;
    	let { narrow = false } = $$props;
    	let { fullWidth = false } = $$props;
    	let { noGutter = false } = $$props;
    	let { noGutterLeft = false } = $$props;
    	let { noGutterRight = false } = $$props;
    	let { padding = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('condensed' in $$new_props) $$invalidate(2, condensed = $$new_props.condensed);
    		if ('narrow' in $$new_props) $$invalidate(3, narrow = $$new_props.narrow);
    		if ('fullWidth' in $$new_props) $$invalidate(4, fullWidth = $$new_props.fullWidth);
    		if ('noGutter' in $$new_props) $$invalidate(5, noGutter = $$new_props.noGutter);
    		if ('noGutterLeft' in $$new_props) $$invalidate(6, noGutterLeft = $$new_props.noGutterLeft);
    		if ('noGutterRight' in $$new_props) $$invalidate(7, noGutterRight = $$new_props.noGutterRight);
    		if ('padding' in $$new_props) $$invalidate(8, padding = $$new_props.padding);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		as,
    		condensed,
    		narrow,
    		fullWidth,
    		noGutter,
    		noGutterLeft,
    		noGutterRight,
    		padding,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('condensed' in $$props) $$invalidate(2, condensed = $$new_props.condensed);
    		if ('narrow' in $$props) $$invalidate(3, narrow = $$new_props.narrow);
    		if ('fullWidth' in $$props) $$invalidate(4, fullWidth = $$new_props.fullWidth);
    		if ('noGutter' in $$props) $$invalidate(5, noGutter = $$new_props.noGutter);
    		if ('noGutterLeft' in $$props) $$invalidate(6, noGutterLeft = $$new_props.noGutterLeft);
    		if ('noGutterRight' in $$props) $$invalidate(7, noGutterRight = $$new_props.noGutterRight);
    		if ('padding' in $$props) $$invalidate(8, padding = $$new_props.padding);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(1, props = {
    			...$$restProps,
    			class: [
    				$$restProps.class,
    				"bx--grid",
    				condensed && "bx--grid--condensed",
    				narrow && "bx--grid--narrow",
    				fullWidth && "bx--grid--full-width",
    				noGutter && "bx--no-gutter",
    				noGutterLeft && "bx--no-gutter--left",
    				noGutterRight && "bx--no-gutter--right",
    				padding && "bx--row-padding"
    			].filter(Boolean).join(" ")
    		});
    	};

    	return [
    		as,
    		props,
    		condensed,
    		narrow,
    		fullWidth,
    		noGutter,
    		noGutterLeft,
    		noGutterRight,
    		padding,
    		$$scope,
    		slots
    	];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {
    			as: 0,
    			condensed: 2,
    			narrow: 3,
    			fullWidth: 4,
    			noGutter: 5,
    			noGutterLeft: 6,
    			noGutterRight: 7,
    			padding: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$x.name
    		});
    	}

    	get as() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condensed() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condensed(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get narrow() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set narrow(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullWidth() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullWidth(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutter() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutter(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutterLeft() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutterLeft(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutterRight() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutterRight(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Grid/Row.svelte generated by Svelte v3.49.0 */

    const file$t = "node_modules/carbon-components-svelte/src/Grid/Row.svelte";
    const get_default_slot_changes$2 = dirty => ({ props: dirty & /*props*/ 2 });
    const get_default_slot_context$2 = ctx => ({ props: /*props*/ ctx[1] });

    // (50:0) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	let div_levels = [/*props*/ ctx[1]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$t, 50, 2, 1267);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*props*/ 2 && /*props*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(50:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if as}
    function create_if_block$h(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$2);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, props*/ 258)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$h.name,
    		type: "if",
    		source: "(48:0) {#if as}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$h, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*as*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let props;
    	const omit_props_names = ["as","condensed","narrow","noGutter","noGutterLeft","noGutterRight","padding"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, ['default']);
    	let { as = false } = $$props;
    	let { condensed = false } = $$props;
    	let { narrow = false } = $$props;
    	let { noGutter = false } = $$props;
    	let { noGutterLeft = false } = $$props;
    	let { noGutterRight = false } = $$props;
    	let { padding = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('condensed' in $$new_props) $$invalidate(2, condensed = $$new_props.condensed);
    		if ('narrow' in $$new_props) $$invalidate(3, narrow = $$new_props.narrow);
    		if ('noGutter' in $$new_props) $$invalidate(4, noGutter = $$new_props.noGutter);
    		if ('noGutterLeft' in $$new_props) $$invalidate(5, noGutterLeft = $$new_props.noGutterLeft);
    		if ('noGutterRight' in $$new_props) $$invalidate(6, noGutterRight = $$new_props.noGutterRight);
    		if ('padding' in $$new_props) $$invalidate(7, padding = $$new_props.padding);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		as,
    		condensed,
    		narrow,
    		noGutter,
    		noGutterLeft,
    		noGutterRight,
    		padding,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('condensed' in $$props) $$invalidate(2, condensed = $$new_props.condensed);
    		if ('narrow' in $$props) $$invalidate(3, narrow = $$new_props.narrow);
    		if ('noGutter' in $$props) $$invalidate(4, noGutter = $$new_props.noGutter);
    		if ('noGutterLeft' in $$props) $$invalidate(5, noGutterLeft = $$new_props.noGutterLeft);
    		if ('noGutterRight' in $$props) $$invalidate(6, noGutterRight = $$new_props.noGutterRight);
    		if ('padding' in $$props) $$invalidate(7, padding = $$new_props.padding);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(1, props = {
    			...$$restProps,
    			class: [
    				$$restProps.class,
    				"bx--row",
    				condensed && "bx--row--condensed",
    				narrow && "bx--row--narrow",
    				noGutter && "bx--no-gutter",
    				noGutterLeft && "bx--no-gutter--left",
    				noGutterRight && "bx--no-gutter--right",
    				padding && "bx--row-padding"
    			].filter(Boolean).join(" ")
    		});
    	};

    	return [
    		as,
    		props,
    		condensed,
    		narrow,
    		noGutter,
    		noGutterLeft,
    		noGutterRight,
    		padding,
    		$$scope,
    		slots
    	];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {
    			as: 0,
    			condensed: 2,
    			narrow: 3,
    			noGutter: 4,
    			noGutterLeft: 5,
    			noGutterRight: 6,
    			padding: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get as() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condensed() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condensed(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get narrow() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set narrow(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutter() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutter(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutterLeft() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutterLeft(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutterRight() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutterRight(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Grid/Column.svelte generated by Svelte v3.49.0 */

    const file$s = "node_modules/carbon-components-svelte/src/Grid/Column.svelte";
    const get_default_slot_changes$1 = dirty => ({ props: dirty & /*props*/ 2 });
    const get_default_slot_context$1 = ctx => ({ props: /*props*/ ctx[1] });

    // (115:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	let div_levels = [/*props*/ ctx[1]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$s, 115, 2, 2896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[13],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*props*/ 2 && /*props*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(115:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (113:0) {#if as}
    function create_if_block$g(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, props*/ 8194)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[13],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(113:0) {#if as}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$g, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*as*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let columnClass;
    	let props;

    	const omit_props_names = [
    		"as","noGutter","noGutterLeft","noGutterRight","padding","aspectRatio","sm","md","lg","xlg","max"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Column', slots, ['default']);
    	let { as = false } = $$props;
    	let { noGutter = false } = $$props;
    	let { noGutterLeft = false } = $$props;
    	let { noGutterRight = false } = $$props;
    	let { padding = false } = $$props;
    	let { aspectRatio = undefined } = $$props;
    	let { sm = undefined } = $$props;
    	let { md = undefined } = $$props;
    	let { lg = undefined } = $$props;
    	let { xlg = undefined } = $$props;
    	let { max = undefined } = $$props;
    	const breakpoints = ["sm", "md", "lg", "xlg", "max"];

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('noGutter' in $$new_props) $$invalidate(2, noGutter = $$new_props.noGutter);
    		if ('noGutterLeft' in $$new_props) $$invalidate(3, noGutterLeft = $$new_props.noGutterLeft);
    		if ('noGutterRight' in $$new_props) $$invalidate(4, noGutterRight = $$new_props.noGutterRight);
    		if ('padding' in $$new_props) $$invalidate(5, padding = $$new_props.padding);
    		if ('aspectRatio' in $$new_props) $$invalidate(6, aspectRatio = $$new_props.aspectRatio);
    		if ('sm' in $$new_props) $$invalidate(7, sm = $$new_props.sm);
    		if ('md' in $$new_props) $$invalidate(8, md = $$new_props.md);
    		if ('lg' in $$new_props) $$invalidate(9, lg = $$new_props.lg);
    		if ('xlg' in $$new_props) $$invalidate(10, xlg = $$new_props.xlg);
    		if ('max' in $$new_props) $$invalidate(11, max = $$new_props.max);
    		if ('$$scope' in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		as,
    		noGutter,
    		noGutterLeft,
    		noGutterRight,
    		padding,
    		aspectRatio,
    		sm,
    		md,
    		lg,
    		xlg,
    		max,
    		breakpoints,
    		columnClass,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('noGutter' in $$props) $$invalidate(2, noGutter = $$new_props.noGutter);
    		if ('noGutterLeft' in $$props) $$invalidate(3, noGutterLeft = $$new_props.noGutterLeft);
    		if ('noGutterRight' in $$props) $$invalidate(4, noGutterRight = $$new_props.noGutterRight);
    		if ('padding' in $$props) $$invalidate(5, padding = $$new_props.padding);
    		if ('aspectRatio' in $$props) $$invalidate(6, aspectRatio = $$new_props.aspectRatio);
    		if ('sm' in $$props) $$invalidate(7, sm = $$new_props.sm);
    		if ('md' in $$props) $$invalidate(8, md = $$new_props.md);
    		if ('lg' in $$props) $$invalidate(9, lg = $$new_props.lg);
    		if ('xlg' in $$props) $$invalidate(10, xlg = $$new_props.xlg);
    		if ('max' in $$props) $$invalidate(11, max = $$new_props.max);
    		if ('columnClass' in $$props) $$invalidate(12, columnClass = $$new_props.columnClass);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sm, md, lg, xlg, max*/ 3968) {
    			$$invalidate(12, columnClass = [sm, md, lg, xlg, max].map((breakpoint, i) => {
    				const name = breakpoints[i];

    				if (breakpoint === true) {
    					return `bx--col-${name}`;
    				} else if (typeof breakpoint === "number") {
    					return `bx--col-${name}-${breakpoint}`;
    				} else if (typeof breakpoint === "object") {
    					let bp = [];

    					if (typeof breakpoint.span === "number") {
    						bp = [...bp, `bx--col-${name}-${breakpoint.span}`];
    					} else if (breakpoint.span === true) {
    						bp = [...bp, `bx--col-${name}`];
    					}

    					if (typeof breakpoint.offset === "number") {
    						bp = [...bp, `bx--offset-${name}-${breakpoint.offset}`];
    					}

    					return bp.join(" ");
    				}
    			}).filter(Boolean).join(" "));
    		}

    		$$invalidate(1, props = {
    			...$$restProps,
    			class: [
    				$$restProps.class,
    				columnClass,
    				!columnClass && "bx--col",
    				noGutter && "bx--no-gutter",
    				noGutterLeft && "bx--no-gutter--left",
    				noGutterRight && "bx--no-gutter--right",
    				aspectRatio && `bx--aspect-ratio bx--aspect-ratio--${aspectRatio}`,
    				padding && "bx--col-padding"
    			].filter(Boolean).join(" ")
    		});
    	};

    	return [
    		as,
    		props,
    		noGutter,
    		noGutterLeft,
    		noGutterRight,
    		padding,
    		aspectRatio,
    		sm,
    		md,
    		lg,
    		xlg,
    		max,
    		columnClass,
    		$$scope,
    		slots
    	];
    }

    class Column extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {
    			as: 0,
    			noGutter: 2,
    			noGutterLeft: 3,
    			noGutterRight: 4,
    			padding: 5,
    			aspectRatio: 6,
    			sm: 7,
    			md: 8,
    			lg: 9,
    			xlg: 10,
    			max: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Column",
    			options,
    			id: create_fragment$v.name
    		});
    	}

    	get as() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutter() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutter(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutterLeft() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutterLeft(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutterRight() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutterRight(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aspectRatio() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aspectRatio(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xlg() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xlg(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/LocalStorage/LocalStorage.svelte generated by Svelte v3.49.0 */

    function create_fragment$u(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clearAll() {
    	localStorage.clear();
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LocalStorage', slots, []);
    	let { key = "local-storage-key" } = $$props;
    	let { value = "" } = $$props;

    	function clearItem() {
    		localStorage.removeItem(key);
    	}

    	const dispatch = createEventDispatcher();
    	let prevValue = value;

    	function setItem() {
    		if (typeof value === "object") {
    			localStorage.setItem(key, JSON.stringify(value));
    		} else {
    			localStorage.setItem(key, value);
    		}
    	}

    	onMount(() => {
    		const item = localStorage.getItem(key);

    		if (item != null) {
    			try {
    				$$invalidate(0, value = JSON.parse(item));
    			} catch(e) {
    				$$invalidate(0, value = item);
    			}
    		} else {
    			setItem();
    			dispatch("save");
    		}
    	});

    	afterUpdate(() => {
    		if (prevValue !== value) {
    			setItem();
    			dispatch("update", { prevValue, value });
    		}

    		prevValue = value;
    	});

    	const writable_props = ['key', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LocalStorage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('key' in $$props) $$invalidate(1, key = $$props.key);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		key,
    		value,
    		clearItem,
    		clearAll,
    		onMount,
    		afterUpdate,
    		createEventDispatcher,
    		dispatch,
    		prevValue,
    		setItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(1, key = $$props.key);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('prevValue' in $$props) prevValue = $$props.prevValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, key, clearItem, clearAll];
    }

    class LocalStorage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			key: 1,
    			value: 0,
    			clearItem: 2,
    			clearAll: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LocalStorage",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get key() {
    		throw new Error("<LocalStorage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<LocalStorage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<LocalStorage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<LocalStorage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearItem() {
    		return this.$$.ctx[2];
    	}

    	set clearItem(value) {
    		throw new Error("<LocalStorage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearAll() {
    		return clearAll;
    	}

    	set clearAll(value) {
    		throw new Error("<LocalStorage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Select/Select.svelte generated by Svelte v3.49.0 */
    const file$r = "node_modules/carbon-components-svelte/src/Select/Select.svelte";
    const get_labelText_slot_changes$2 = dirty => ({});
    const get_labelText_slot_context$2 = ctx => ({});

    // (136:4) {#if !noLabel}
    function create_if_block_10(ctx) {
    	let label;
    	let current;
    	const labelText_slot_template = /*#slots*/ ctx[26].labelText;
    	const labelText_slot = create_slot(labelText_slot_template, ctx, /*$$scope*/ ctx[25], get_labelText_slot_context$2);
    	const labelText_slot_or_fallback = labelText_slot || fallback_block$5(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (labelText_slot_or_fallback) labelText_slot_or_fallback.c();
    			attr_dev(label, "for", /*id*/ ctx[5]);
    			toggle_class(label, "bx--label", true);
    			toggle_class(label, "bx--visually-hidden", /*hideLabel*/ ctx[14]);
    			toggle_class(label, "bx--label--disabled", /*disabled*/ ctx[4]);
    			add_location(label, file$r, 136, 6, 3392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (labelText_slot_or_fallback) {
    				labelText_slot_or_fallback.m(label, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (labelText_slot) {
    				if (labelText_slot.p && (!current || dirty[0] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						labelText_slot,
    						labelText_slot_template,
    						ctx,
    						/*$$scope*/ ctx[25],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[25])
    						: get_slot_changes(labelText_slot_template, /*$$scope*/ ctx[25], dirty, get_labelText_slot_changes$2),
    						get_labelText_slot_context$2
    					);
    				}
    			} else {
    				if (labelText_slot_or_fallback && labelText_slot_or_fallback.p && (!current || dirty[0] & /*labelText*/ 8192)) {
    					labelText_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 32) {
    				attr_dev(label, "for", /*id*/ ctx[5]);
    			}

    			if (dirty[0] & /*hideLabel*/ 16384) {
    				toggle_class(label, "bx--visually-hidden", /*hideLabel*/ ctx[14]);
    			}

    			if (dirty[0] & /*disabled*/ 16) {
    				toggle_class(label, "bx--label--disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labelText_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labelText_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (labelText_slot_or_fallback) labelText_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(136:4) {#if !noLabel}",
    		ctx
    	});

    	return block;
    }

    // (143:31)            
    function fallback_block$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*labelText*/ ctx[13]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*labelText*/ 8192) set_data_dev(t, /*labelText*/ ctx[13]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$5.name,
    		type: "fallback",
    		source: "(143:31)            ",
    		ctx
    	});

    	return block;
    }

    // (148:4) {#if inline}
    function create_if_block_6$1(ctx) {
    	let div1;
    	let div0;
    	let select;
    	let select_aria_describedby_value;
    	let select_aria_invalid_value;
    	let select_disabled_value;
    	let select_required_value;
    	let t0;
    	let chevrondown;
    	let t1;
    	let div0_data_invalid_value;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	chevrondown = new ChevronDown({
    			props: { class: "bx--select__arrow" },
    			$$inline: true
    		});

    	let if_block0 = /*invalid*/ ctx[7] && create_if_block_9$1(ctx);
    	let if_block1 = /*invalid*/ ctx[7] && create_if_block_8$1(ctx);
    	let if_block2 = /*helperText*/ ctx[11] && create_if_block_7$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			select = element("select");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			create_component(chevrondown.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(select, "aria-describedby", select_aria_describedby_value = /*invalid*/ ctx[7] ? /*errorId*/ ctx[16] : undefined);
    			attr_dev(select, "aria-invalid", select_aria_invalid_value = /*invalid*/ ctx[7] || undefined);
    			select.disabled = select_disabled_value = /*disabled*/ ctx[4] || undefined;
    			select.required = select_required_value = /*required*/ ctx[15] || undefined;
    			attr_dev(select, "id", /*id*/ ctx[5]);
    			attr_dev(select, "name", /*name*/ ctx[6]);
    			toggle_class(select, "bx--select-input", true);
    			toggle_class(select, "bx--select-input--sm", /*size*/ ctx[1] === 'sm');
    			toggle_class(select, "bx--select-input--xl", /*size*/ ctx[1] === 'xl');
    			add_location(select, file$r, 153, 10, 3859);
    			attr_dev(div0, "data-invalid", div0_data_invalid_value = /*invalid*/ ctx[7] || undefined);
    			toggle_class(div0, "bx--select-input__wrapper", true);
    			add_location(div0, file$r, 149, 8, 3735);
    			toggle_class(div1, "bx--select-input--inline__wrapper", true);
    			add_location(div1, file$r, 148, 6, 3672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, select);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			/*select_binding*/ ctx[33](select);
    			append_dev(div0, t0);
    			mount_component(chevrondown, div0, null);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*handleChange*/ ctx[21], false, false, false),
    					listen_dev(select, "input", /*input_handler*/ ctx[30], false, false, false),
    					listen_dev(select, "focus", /*focus_handler*/ ctx[31], false, false, false),
    					listen_dev(select, "blur", /*blur_handler*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[25],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[25])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[25], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty[0] & /*invalid, errorId*/ 65664 && select_aria_describedby_value !== (select_aria_describedby_value = /*invalid*/ ctx[7] ? /*errorId*/ ctx[16] : undefined)) {
    				attr_dev(select, "aria-describedby", select_aria_describedby_value);
    			}

    			if (!current || dirty[0] & /*invalid*/ 128 && select_aria_invalid_value !== (select_aria_invalid_value = /*invalid*/ ctx[7] || undefined)) {
    				attr_dev(select, "aria-invalid", select_aria_invalid_value);
    			}

    			if (!current || dirty[0] & /*disabled*/ 16 && select_disabled_value !== (select_disabled_value = /*disabled*/ ctx[4] || undefined)) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (!current || dirty[0] & /*required*/ 32768 && select_required_value !== (select_required_value = /*required*/ ctx[15] || undefined)) {
    				prop_dev(select, "required", select_required_value);
    			}

    			if (!current || dirty[0] & /*id*/ 32) {
    				attr_dev(select, "id", /*id*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*name*/ 64) {
    				attr_dev(select, "name", /*name*/ ctx[6]);
    			}

    			if (dirty[0] & /*size*/ 2) {
    				toggle_class(select, "bx--select-input--sm", /*size*/ ctx[1] === 'sm');
    			}

    			if (dirty[0] & /*size*/ 2) {
    				toggle_class(select, "bx--select-input--xl", /*size*/ ctx[1] === 'xl');
    			}

    			if (/*invalid*/ ctx[7]) {
    				if (if_block0) {
    					if (dirty[0] & /*invalid*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_9$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*invalid*/ 128 && div0_data_invalid_value !== (div0_data_invalid_value = /*invalid*/ ctx[7] || undefined)) {
    				attr_dev(div0, "data-invalid", div0_data_invalid_value);
    			}

    			if (/*invalid*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*helperText*/ ctx[11]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7$1(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(chevrondown.$$.fragment, local);
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(chevrondown.$$.fragment, local);
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*select_binding*/ ctx[33](null);
    			destroy_component(chevrondown);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(148:4) {#if inline}",
    		ctx
    	});

    	return block;
    }

    // (173:10) {#if invalid}
    function create_if_block_9$1(ctx) {
    	let warningfilled;
    	let current;

    	warningfilled = new WarningFilled({
    			props: { class: "bx--select__invalid-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(warningfilled.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(warningfilled, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(warningfilled.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(warningfilled.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(warningfilled, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(173:10) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    // (177:8) {#if invalid}
    function create_if_block_8$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*invalidText*/ ctx[8]);
    			attr_dev(div, "id", /*errorId*/ ctx[16]);
    			toggle_class(div, "bx--form-requirement", true);
    			add_location(div, file$r, 177, 10, 4666);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*invalidText*/ 256) set_data_dev(t, /*invalidText*/ ctx[8]);

    			if (dirty[0] & /*errorId*/ 65536) {
    				attr_dev(div, "id", /*errorId*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(177:8) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    // (183:6) {#if helperText}
    function create_if_block_7$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*helperText*/ ctx[11]);
    			toggle_class(div, "bx--form__helper-text", true);
    			toggle_class(div, "bx--form__helper-text--disabled", /*disabled*/ ctx[4]);
    			add_location(div, file$r, 183, 8, 4824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*helperText*/ 2048) set_data_dev(t, /*helperText*/ ctx[11]);

    			if (dirty[0] & /*disabled*/ 16) {
    				toggle_class(div, "bx--form__helper-text--disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(183:6) {#if helperText}",
    		ctx
    	});

    	return block;
    }

    // (192:4) {#if !inline}
    function create_if_block$f(ctx) {
    	let div;
    	let select;
    	let select_aria_describedby_value;
    	let select_disabled_value;
    	let select_required_value;
    	let select_aria_invalid_value;
    	let t0;
    	let chevrondown;
    	let t1;
    	let t2;
    	let div_data_invalid_value;
    	let t3;
    	let t4;
    	let t5;
    	let if_block4_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	chevrondown = new ChevronDown({
    			props: { class: "bx--select__arrow" },
    			$$inline: true
    		});

    	let if_block0 = /*invalid*/ ctx[7] && create_if_block_5$1(ctx);
    	let if_block1 = !/*invalid*/ ctx[7] && /*warn*/ ctx[9] && create_if_block_4$2(ctx);
    	let if_block2 = !/*invalid*/ ctx[7] && /*helperText*/ ctx[11] && create_if_block_3$2(ctx);
    	let if_block3 = /*invalid*/ ctx[7] && create_if_block_2$3(ctx);
    	let if_block4 = !/*invalid*/ ctx[7] && /*warn*/ ctx[9] && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			create_component(chevrondown.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			attr_dev(select, "id", /*id*/ ctx[5]);
    			attr_dev(select, "name", /*name*/ ctx[6]);
    			attr_dev(select, "aria-describedby", select_aria_describedby_value = /*invalid*/ ctx[7] ? /*errorId*/ ctx[16] : undefined);
    			select.disabled = select_disabled_value = /*disabled*/ ctx[4] || undefined;
    			select.required = select_required_value = /*required*/ ctx[15] || undefined;
    			attr_dev(select, "aria-invalid", select_aria_invalid_value = /*invalid*/ ctx[7] || undefined);
    			toggle_class(select, "bx--select-input", true);
    			toggle_class(select, "bx--select-input--sm", /*size*/ ctx[1] === 'sm');
    			toggle_class(select, "bx--select-input--xl", /*size*/ ctx[1] === 'xl');
    			add_location(select, file$r, 196, 8, 5147);
    			attr_dev(div, "data-invalid", div_data_invalid_value = /*invalid*/ ctx[7] || undefined);
    			toggle_class(div, "bx--select-input__wrapper", true);
    			add_location(div, file$r, 192, 6, 5031);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			/*select_binding_1*/ ctx[34](select);
    			append_dev(div, t0);
    			mount_component(chevrondown, div, null);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*handleChange*/ ctx[21], false, false, false),
    					listen_dev(select, "input", /*input_handler_1*/ ctx[27], false, false, false),
    					listen_dev(select, "focus", /*focus_handler_1*/ ctx[28], false, false, false),
    					listen_dev(select, "blur", /*blur_handler_1*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 33554432)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[25],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[25])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[25], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 32) {
    				attr_dev(select, "id", /*id*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*name*/ 64) {
    				attr_dev(select, "name", /*name*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*invalid, errorId*/ 65664 && select_aria_describedby_value !== (select_aria_describedby_value = /*invalid*/ ctx[7] ? /*errorId*/ ctx[16] : undefined)) {
    				attr_dev(select, "aria-describedby", select_aria_describedby_value);
    			}

    			if (!current || dirty[0] & /*disabled*/ 16 && select_disabled_value !== (select_disabled_value = /*disabled*/ ctx[4] || undefined)) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (!current || dirty[0] & /*required*/ 32768 && select_required_value !== (select_required_value = /*required*/ ctx[15] || undefined)) {
    				prop_dev(select, "required", select_required_value);
    			}

    			if (!current || dirty[0] & /*invalid*/ 128 && select_aria_invalid_value !== (select_aria_invalid_value = /*invalid*/ ctx[7] || undefined)) {
    				attr_dev(select, "aria-invalid", select_aria_invalid_value);
    			}

    			if (dirty[0] & /*size*/ 2) {
    				toggle_class(select, "bx--select-input--sm", /*size*/ ctx[1] === 'sm');
    			}

    			if (dirty[0] & /*size*/ 2) {
    				toggle_class(select, "bx--select-input--xl", /*size*/ ctx[1] === 'xl');
    			}

    			if (/*invalid*/ ctx[7]) {
    				if (if_block0) {
    					if (dirty[0] & /*invalid*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*invalid*/ ctx[7] && /*warn*/ ctx[9]) {
    				if (if_block1) {
    					if (dirty[0] & /*invalid, warn*/ 640) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*invalid*/ 128 && div_data_invalid_value !== (div_data_invalid_value = /*invalid*/ ctx[7] || undefined)) {
    				attr_dev(div, "data-invalid", div_data_invalid_value);
    			}

    			if (!/*invalid*/ ctx[7] && /*helperText*/ ctx[11]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$2(ctx);
    					if_block2.c();
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*invalid*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$3(ctx);
    					if_block3.c();
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (!/*invalid*/ ctx[7] && /*warn*/ ctx[9]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$5(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(chevrondown.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(chevrondown.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*select_binding_1*/ ctx[34](null);
    			destroy_component(chevrondown);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(192:4) {#if !inline}",
    		ctx
    	});

    	return block;
    }

    // (216:8) {#if invalid}
    function create_if_block_5$1(ctx) {
    	let warningfilled;
    	let current;

    	warningfilled = new WarningFilled({
    			props: { class: "bx--select__invalid-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(warningfilled.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(warningfilled, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(warningfilled.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(warningfilled.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(warningfilled, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(216:8) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    // (219:8) {#if !invalid && warn}
    function create_if_block_4$2(ctx) {
    	let warningaltfilled;
    	let current;

    	warningaltfilled = new WarningAltFilled({
    			props: {
    				class: "bx--select__invalid-icon bx--select__invalid-icon--warning"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(warningaltfilled.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(warningaltfilled, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(warningaltfilled.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(warningaltfilled.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(warningaltfilled, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(219:8) {#if !invalid && warn}",
    		ctx
    	});

    	return block;
    }

    // (225:6) {#if !invalid && helperText}
    function create_if_block_3$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*helperText*/ ctx[11]);
    			toggle_class(div, "bx--form__helper-text", true);
    			toggle_class(div, "bx--form__helper-text--disabled", /*disabled*/ ctx[4]);
    			add_location(div, file$r, 225, 8, 6086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*helperText*/ 2048) set_data_dev(t, /*helperText*/ ctx[11]);

    			if (dirty[0] & /*disabled*/ 16) {
    				toggle_class(div, "bx--form__helper-text--disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(225:6) {#if !invalid && helperText}",
    		ctx
    	});

    	return block;
    }

    // (233:6) {#if invalid}
    function create_if_block_2$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*invalidText*/ ctx[8]);
    			attr_dev(div, "id", /*errorId*/ ctx[16]);
    			toggle_class(div, "bx--form-requirement", true);
    			add_location(div, file$r, 233, 8, 6287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*invalidText*/ 256) set_data_dev(t, /*invalidText*/ ctx[8]);

    			if (dirty[0] & /*errorId*/ 65536) {
    				attr_dev(div, "id", /*errorId*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(233:6) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    // (238:6) {#if !invalid && warn}
    function create_if_block_1$5(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*warnText*/ ctx[10]);
    			attr_dev(div, "id", /*errorId*/ ctx[16]);
    			toggle_class(div, "bx--form-requirement", true);
    			add_location(div, file$r, 238, 8, 6432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*warnText*/ 1024) set_data_dev(t, /*warnText*/ ctx[10]);

    			if (dirty[0] & /*errorId*/ 65536) {
    				attr_dev(div, "id", /*errorId*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(238:6) {#if !invalid && warn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	let if_block0 = !/*noLabel*/ ctx[12] && create_if_block_10(ctx);
    	let if_block1 = /*inline*/ ctx[2] && create_if_block_6$1(ctx);
    	let if_block2 = !/*inline*/ ctx[2] && create_if_block$f(ctx);
    	let div1_levels = [/*$$restProps*/ ctx[22]];
    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			toggle_class(div0, "bx--select", true);
    			toggle_class(div0, "bx--select--inline", /*inline*/ ctx[2]);
    			toggle_class(div0, "bx--select--light", /*light*/ ctx[3]);
    			toggle_class(div0, "bx--select--invalid", /*invalid*/ ctx[7]);
    			toggle_class(div0, "bx--select--disabled", /*disabled*/ ctx[4]);
    			toggle_class(div0, "bx--select--warning", /*warn*/ ctx[9]);
    			add_location(div0, file$r, 127, 2, 3125);
    			set_attributes(div1, div1_data);
    			toggle_class(div1, "bx--form-item", true);
    			add_location(div1, file$r, 126, 0, 3071);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*noLabel*/ ctx[12]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*noLabel*/ 4096) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*inline*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*inline*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!/*inline*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*inline*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$f(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*inline*/ 4) {
    				toggle_class(div0, "bx--select--inline", /*inline*/ ctx[2]);
    			}

    			if (dirty[0] & /*light*/ 8) {
    				toggle_class(div0, "bx--select--light", /*light*/ ctx[3]);
    			}

    			if (dirty[0] & /*invalid*/ 128) {
    				toggle_class(div0, "bx--select--invalid", /*invalid*/ ctx[7]);
    			}

    			if (dirty[0] & /*disabled*/ 16) {
    				toggle_class(div0, "bx--select--disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty[0] & /*warn*/ 512) {
    				toggle_class(div0, "bx--select--warning", /*warn*/ ctx[9]);
    			}

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [dirty[0] & /*$$restProps*/ 4194304 && /*$$restProps*/ ctx[22]]));
    			toggle_class(div1, "bx--form-item", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let errorId;

    	const omit_props_names = [
    		"selected","size","inline","light","disabled","id","name","invalid","invalidText","warn","warnText","helperText","noLabel","labelText","hideLabel","ref","required"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $defaultValue;
    	let $selectedValue;
    	let $itemTypesByValue;
    	let $defaultSelectId;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Select', slots, ['labelText','default']);
    	let { selected = undefined } = $$props;
    	let { size = undefined } = $$props;
    	let { inline = false } = $$props;
    	let { light = false } = $$props;
    	let { disabled = false } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { name = undefined } = $$props;
    	let { invalid = false } = $$props;
    	let { invalidText = "" } = $$props;
    	let { warn = false } = $$props;
    	let { warnText = "" } = $$props;
    	let { helperText = "" } = $$props;
    	let { noLabel = false } = $$props;
    	let { labelText = "" } = $$props;
    	let { hideLabel = false } = $$props;
    	let { ref = null } = $$props;
    	let { required = false } = $$props;
    	const dispatch = createEventDispatcher();
    	const selectedValue = writable(selected);
    	validate_store(selectedValue, 'selectedValue');
    	component_subscribe($$self, selectedValue, value => $$invalidate(36, $selectedValue = value));
    	const defaultSelectId = writable(null);
    	validate_store(defaultSelectId, 'defaultSelectId');
    	component_subscribe($$self, defaultSelectId, value => $$invalidate(38, $defaultSelectId = value));
    	const defaultValue = writable(null);
    	validate_store(defaultValue, 'defaultValue');
    	component_subscribe($$self, defaultValue, value => $$invalidate(24, $defaultValue = value));
    	const itemTypesByValue = writable({});
    	validate_store(itemTypesByValue, 'itemTypesByValue');
    	component_subscribe($$self, itemTypesByValue, value => $$invalidate(37, $itemTypesByValue = value));

    	setContext("Select", {
    		selectedValue,
    		setDefaultValue: (id, value) => {
    			/**
     * Use the first `SelectItem` value as the
     * default value if `selected` is `undefined`.
     */
    			if ($defaultValue === null) {
    				defaultSelectId.set(id);
    				defaultValue.set(value);
    			} else {
    				if ($defaultSelectId === id) {
    					selectedValue.set(value);
    				}
    			}

    			itemTypesByValue.update(types => ({ ...types, [value]: typeof value }));
    		}
    	});

    	const handleChange = ({ target }) => {
    		let value = target.value;

    		if ($itemTypesByValue[value] === "number") {
    			value = Number(value);
    		}

    		selectedValue.set(value);
    	};

    	let prevSelected = undefined;

    	afterUpdate(() => {
    		$$invalidate(23, selected = $selectedValue);

    		if (prevSelected !== undefined && selected !== prevSelected) {
    			dispatch("change", $selectedValue);
    		}

    		prevSelected = selected;
    	});

    	function input_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	function select_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(22, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('selected' in $$new_props) $$invalidate(23, selected = $$new_props.selected);
    		if ('size' in $$new_props) $$invalidate(1, size = $$new_props.size);
    		if ('inline' in $$new_props) $$invalidate(2, inline = $$new_props.inline);
    		if ('light' in $$new_props) $$invalidate(3, light = $$new_props.light);
    		if ('disabled' in $$new_props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ('id' in $$new_props) $$invalidate(5, id = $$new_props.id);
    		if ('name' in $$new_props) $$invalidate(6, name = $$new_props.name);
    		if ('invalid' in $$new_props) $$invalidate(7, invalid = $$new_props.invalid);
    		if ('invalidText' in $$new_props) $$invalidate(8, invalidText = $$new_props.invalidText);
    		if ('warn' in $$new_props) $$invalidate(9, warn = $$new_props.warn);
    		if ('warnText' in $$new_props) $$invalidate(10, warnText = $$new_props.warnText);
    		if ('helperText' in $$new_props) $$invalidate(11, helperText = $$new_props.helperText);
    		if ('noLabel' in $$new_props) $$invalidate(12, noLabel = $$new_props.noLabel);
    		if ('labelText' in $$new_props) $$invalidate(13, labelText = $$new_props.labelText);
    		if ('hideLabel' in $$new_props) $$invalidate(14, hideLabel = $$new_props.hideLabel);
    		if ('ref' in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ('required' in $$new_props) $$invalidate(15, required = $$new_props.required);
    		if ('$$scope' in $$new_props) $$invalidate(25, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		selected,
    		size,
    		inline,
    		light,
    		disabled,
    		id,
    		name,
    		invalid,
    		invalidText,
    		warn,
    		warnText,
    		helperText,
    		noLabel,
    		labelText,
    		hideLabel,
    		ref,
    		required,
    		createEventDispatcher,
    		setContext,
    		afterUpdate,
    		writable,
    		ChevronDown,
    		WarningFilled,
    		WarningAltFilled,
    		dispatch,
    		selectedValue,
    		defaultSelectId,
    		defaultValue,
    		itemTypesByValue,
    		handleChange,
    		prevSelected,
    		errorId,
    		$defaultValue,
    		$selectedValue,
    		$itemTypesByValue,
    		$defaultSelectId
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('selected' in $$props) $$invalidate(23, selected = $$new_props.selected);
    		if ('size' in $$props) $$invalidate(1, size = $$new_props.size);
    		if ('inline' in $$props) $$invalidate(2, inline = $$new_props.inline);
    		if ('light' in $$props) $$invalidate(3, light = $$new_props.light);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ('id' in $$props) $$invalidate(5, id = $$new_props.id);
    		if ('name' in $$props) $$invalidate(6, name = $$new_props.name);
    		if ('invalid' in $$props) $$invalidate(7, invalid = $$new_props.invalid);
    		if ('invalidText' in $$props) $$invalidate(8, invalidText = $$new_props.invalidText);
    		if ('warn' in $$props) $$invalidate(9, warn = $$new_props.warn);
    		if ('warnText' in $$props) $$invalidate(10, warnText = $$new_props.warnText);
    		if ('helperText' in $$props) $$invalidate(11, helperText = $$new_props.helperText);
    		if ('noLabel' in $$props) $$invalidate(12, noLabel = $$new_props.noLabel);
    		if ('labelText' in $$props) $$invalidate(13, labelText = $$new_props.labelText);
    		if ('hideLabel' in $$props) $$invalidate(14, hideLabel = $$new_props.hideLabel);
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ('required' in $$props) $$invalidate(15, required = $$new_props.required);
    		if ('prevSelected' in $$props) prevSelected = $$new_props.prevSelected;
    		if ('errorId' in $$props) $$invalidate(16, errorId = $$new_props.errorId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*id*/ 32) {
    			$$invalidate(16, errorId = `error-${id}`);
    		}

    		if ($$self.$$.dirty[0] & /*selected, $defaultValue*/ 25165824) {
    			selectedValue.set(selected ?? $defaultValue);
    		}
    	};

    	return [
    		ref,
    		size,
    		inline,
    		light,
    		disabled,
    		id,
    		name,
    		invalid,
    		invalidText,
    		warn,
    		warnText,
    		helperText,
    		noLabel,
    		labelText,
    		hideLabel,
    		required,
    		errorId,
    		selectedValue,
    		defaultSelectId,
    		defaultValue,
    		itemTypesByValue,
    		handleChange,
    		$$restProps,
    		selected,
    		$defaultValue,
    		$$scope,
    		slots,
    		input_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		input_handler,
    		focus_handler,
    		blur_handler,
    		select_binding,
    		select_binding_1
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$t,
    			create_fragment$t,
    			safe_not_equal,
    			{
    				selected: 23,
    				size: 1,
    				inline: 2,
    				light: 3,
    				disabled: 4,
    				id: 5,
    				name: 6,
    				invalid: 7,
    				invalidText: 8,
    				warn: 9,
    				warnText: 10,
    				helperText: 11,
    				noLabel: 12,
    				labelText: 13,
    				hideLabel: 14,
    				ref: 0,
    				required: 15
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get selected() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalidText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalidText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warn() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warn(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warnText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warnText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get helperText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set helperText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Select/SelectItem.svelte generated by Svelte v3.49.0 */
    const file$q = "node_modules/carbon-components-svelte/src/Select/SelectItem.svelte";

    function create_fragment$s(ctx) {
    	let option;
    	let t_value = (/*text*/ ctx[1] || /*value*/ ctx[0]) + "";
    	let t;
    	let option_class_value;
    	let option_style_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*value*/ ctx[0];
    			option.value = option.__value;
    			option.disabled = /*disabled*/ ctx[3];
    			option.hidden = /*hidden*/ ctx[2];
    			option.selected = /*selected*/ ctx[4];
    			attr_dev(option, "class", option_class_value = /*$$restProps*/ ctx[5].class);
    			attr_dev(option, "style", option_style_value = /*$$restProps*/ ctx[5].style);
    			toggle_class(option, "bx--select-option", true);
    			add_location(option, file$q, 34, 0, 732);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text, value*/ 3 && t_value !== (t_value = (/*text*/ ctx[1] || /*value*/ ctx[0]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*value*/ 1) {
    				prop_dev(option, "__value", /*value*/ ctx[0]);
    				option.value = option.__value;
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(option, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*hidden*/ 4) {
    				prop_dev(option, "hidden", /*hidden*/ ctx[2]);
    			}

    			if (dirty & /*selected*/ 16) {
    				prop_dev(option, "selected", /*selected*/ ctx[4]);
    			}

    			if (dirty & /*$$restProps*/ 32 && option_class_value !== (option_class_value = /*$$restProps*/ ctx[5].class)) {
    				attr_dev(option, "class", option_class_value);
    			}

    			if (dirty & /*$$restProps*/ 32 && option_style_value !== (option_style_value = /*$$restProps*/ ctx[5].style)) {
    				attr_dev(option, "style", option_style_value);
    			}

    			if (dirty & /*$$restProps*/ 32) {
    				toggle_class(option, "bx--select-option", true);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	const omit_props_names = ["value","text","hidden","disabled"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectItem', slots, []);
    	let { value = "" } = $$props;
    	let { text = "" } = $$props;
    	let { hidden = false } = $$props;
    	let { disabled = false } = $$props;
    	const id = "ccs-" + Math.random().toString(36);
    	const ctx = getContext("Select") || getContext("TimePickerSelect");
    	let selected = false;

    	const unsubscribe = ctx.selectedValue.subscribe(currentValue => {
    		$$invalidate(4, selected = currentValue === value);
    	});

    	onMount(() => {
    		return () => unsubscribe();
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('text' in $$new_props) $$invalidate(1, text = $$new_props.text);
    		if ('hidden' in $$new_props) $$invalidate(2, hidden = $$new_props.hidden);
    		if ('disabled' in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		text,
    		hidden,
    		disabled,
    		getContext,
    		onMount,
    		id,
    		ctx,
    		selected,
    		unsubscribe
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('text' in $$props) $$invalidate(1, text = $$new_props.text);
    		if ('hidden' in $$props) $$invalidate(2, hidden = $$new_props.hidden);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('selected' in $$props) $$invalidate(4, selected = $$new_props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			ctx?.setDefaultValue?.(id, value);
    		}
    	};

    	return [value, text, hidden, disabled, selected, $$restProps];
    }

    class SelectItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			value: 0,
    			text: 1,
    			hidden: 2,
    			disabled: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectItem",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get value() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/TextArea/TextArea.svelte generated by Svelte v3.49.0 */
    const file$p = "node_modules/carbon-components-svelte/src/TextArea/TextArea.svelte";
    const get_labelText_slot_changes$1 = dirty => ({});
    const get_labelText_slot_context$1 = ctx => ({});

    // (69:2) {#if (labelText || $$slots.labelText) && !hideLabel}
    function create_if_block_3$1(ctx) {
    	let div;
    	let label;
    	let t;
    	let current;
    	const labelText_slot_template = /*#slots*/ ctx[20].labelText;
    	const labelText_slot = create_slot(labelText_slot_template, ctx, /*$$scope*/ ctx[19], get_labelText_slot_context$1);
    	const labelText_slot_or_fallback = labelText_slot || fallback_block$4(ctx);
    	let if_block = /*maxCount*/ ctx[5] && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			if (labelText_slot_or_fallback) labelText_slot_or_fallback.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", /*id*/ ctx[14]);
    			toggle_class(label, "bx--label", true);
    			toggle_class(label, "bx--visually-hidden", /*hideLabel*/ ctx[11]);
    			toggle_class(label, "bx--label--disabled", /*disabled*/ ctx[7]);
    			add_location(label, file$p, 70, 6, 1646);
    			toggle_class(div, "bx--text-area__label-wrapper", true);
    			add_location(div, file$p, 69, 4, 1590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);

    			if (labelText_slot_or_fallback) {
    				labelText_slot_or_fallback.m(label, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (labelText_slot) {
    				if (labelText_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						labelText_slot,
    						labelText_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(labelText_slot_template, /*$$scope*/ ctx[19], dirty, get_labelText_slot_changes$1),
    						get_labelText_slot_context$1
    					);
    				}
    			} else {
    				if (labelText_slot_or_fallback && labelText_slot_or_fallback.p && (!current || dirty[0] & /*labelText*/ 1024)) {
    					labelText_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 16384) {
    				attr_dev(label, "for", /*id*/ ctx[14]);
    			}

    			if (dirty[0] & /*hideLabel*/ 2048) {
    				toggle_class(label, "bx--visually-hidden", /*hideLabel*/ ctx[11]);
    			}

    			if (dirty[0] & /*disabled*/ 128) {
    				toggle_class(label, "bx--label--disabled", /*disabled*/ ctx[7]);
    			}

    			if (/*maxCount*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labelText_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labelText_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (labelText_slot_or_fallback) labelText_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(69:2) {#if (labelText || $$slots.labelText) && !hideLabel}",
    		ctx
    	});

    	return block;
    }

    // (77:31)            
    function fallback_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*labelText*/ ctx[10]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*labelText*/ 1024) set_data_dev(t, /*labelText*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(77:31)            ",
    		ctx
    	});

    	return block;
    }

    // (81:6) {#if maxCount}
    function create_if_block_4$1(ctx) {
    	let div;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text("/");
    			t2 = text(/*maxCount*/ ctx[5]);
    			toggle_class(div, "bx--label", true);
    			toggle_class(div, "bx--label--disabled", /*disabled*/ ctx[7]);
    			add_location(div, file$p, 81, 8, 1922);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*maxCount*/ 32) set_data_dev(t2, /*maxCount*/ ctx[5]);

    			if (dirty[0] & /*disabled*/ 128) {
    				toggle_class(div, "bx--label--disabled", /*disabled*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(81:6) {#if maxCount}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if invalid}
    function create_if_block_2$2(ctx) {
    	let warningfilled;
    	let current;

    	warningfilled = new WarningFilled({
    			props: { class: "bx--text-area__invalid-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(warningfilled.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(warningfilled, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(warningfilled.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(warningfilled.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(warningfilled, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(92:4) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    // (120:2) {#if !invalid && helperText}
    function create_if_block_1$4(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*helperText*/ ctx[9]);
    			toggle_class(div, "bx--form__helper-text", true);
    			toggle_class(div, "bx--form__helper-text--disabled", /*disabled*/ ctx[7]);
    			add_location(div, file$p, 120, 4, 2932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*helperText*/ 512) set_data_dev(t, /*helperText*/ ctx[9]);

    			if (dirty[0] & /*disabled*/ 128) {
    				toggle_class(div, "bx--form__helper-text--disabled", /*disabled*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(120:2) {#if !invalid && helperText}",
    		ctx
    	});

    	return block;
    }

    // (128:2) {#if invalid}
    function create_if_block$e(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*invalidText*/ ctx[13]);
    			attr_dev(div, "id", /*errorId*/ ctx[16]);
    			toggle_class(div, "bx--form-requirement", true);
    			add_location(div, file$p, 128, 4, 3101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*invalidText*/ 8192) set_data_dev(t, /*invalidText*/ ctx[13]);

    			if (dirty[0] & /*errorId*/ 65536) {
    				attr_dev(div, "id", /*errorId*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(128:2) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let textarea;
    	let textarea_aria_invalid_value;
    	let textarea_aria_describedby_value;
    	let textarea_maxlength_value;
    	let div0_data_invalid_value;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = (/*labelText*/ ctx[10] || /*$$slots*/ ctx[17].labelText) && !/*hideLabel*/ ctx[11] && create_if_block_3$1(ctx);
    	let if_block1 = /*invalid*/ ctx[12] && create_if_block_2$2(ctx);

    	let textarea_levels = [
    		{
    			"aria-invalid": textarea_aria_invalid_value = /*invalid*/ ctx[12] || undefined
    		},
    		{
    			"aria-describedby": textarea_aria_describedby_value = /*invalid*/ ctx[12] ? /*errorId*/ ctx[16] : undefined
    		},
    		{ disabled: /*disabled*/ ctx[7] },
    		{ id: /*id*/ ctx[14] },
    		{ name: /*name*/ ctx[15] },
    		{ cols: /*cols*/ ctx[3] },
    		{ rows: /*rows*/ ctx[4] },
    		{ placeholder: /*placeholder*/ ctx[2] },
    		{ readOnly: /*readonly*/ ctx[8] },
    		{
    			maxlength: textarea_maxlength_value = /*maxCount*/ ctx[5] ?? undefined
    		},
    		/*$$restProps*/ ctx[18]
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	let if_block2 = !/*invalid*/ ctx[12] && /*helperText*/ ctx[9] && create_if_block_1$4(ctx);
    	let if_block3 = /*invalid*/ ctx[12] && create_if_block$e(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			set_attributes(textarea, textarea_data);
    			toggle_class(textarea, "bx--text-area", true);
    			toggle_class(textarea, "bx--text-area--light", /*light*/ ctx[6]);
    			toggle_class(textarea, "bx--text-area--invalid", /*invalid*/ ctx[12]);
    			add_location(textarea, file$p, 94, 4, 2261);
    			attr_dev(div0, "data-invalid", div0_data_invalid_value = /*invalid*/ ctx[12] || undefined);
    			toggle_class(div0, "bx--text-area__wrapper", true);
    			add_location(div0, file$p, 87, 2, 2076);
    			toggle_class(div1, "bx--form-item", true);
    			add_location(div1, file$p, 61, 0, 1435);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, textarea);
    			if (textarea.autofocus) textarea.focus();
    			/*textarea_binding*/ ctx[32](textarea);
    			set_input_value(textarea, /*value*/ ctx[0]);
    			append_dev(div1, t2);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t3);
    			if (if_block3) if_block3.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[33]),
    					listen_dev(textarea, "change", /*change_handler*/ ctx[25], false, false, false),
    					listen_dev(textarea, "input", /*input_handler*/ ctx[26], false, false, false),
    					listen_dev(textarea, "keydown", /*keydown_handler*/ ctx[27], false, false, false),
    					listen_dev(textarea, "keyup", /*keyup_handler*/ ctx[28], false, false, false),
    					listen_dev(textarea, "focus", /*focus_handler*/ ctx[29], false, false, false),
    					listen_dev(textarea, "blur", /*blur_handler*/ ctx[30], false, false, false),
    					listen_dev(textarea, "paste", /*paste_handler*/ ctx[31], false, false, false),
    					listen_dev(div1, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(div1, "mouseover", /*mouseover_handler*/ ctx[22], false, false, false),
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[23], false, false, false),
    					listen_dev(div1, "mouseleave", /*mouseleave_handler*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((/*labelText*/ ctx[10] || /*$$slots*/ ctx[17].labelText) && !/*hideLabel*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*labelText, $$slots, hideLabel*/ 134144) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*invalid*/ ctx[12]) {
    				if (if_block1) {
    					if (dirty[0] & /*invalid*/ 4096) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
    				(!current || dirty[0] & /*invalid*/ 4096 && textarea_aria_invalid_value !== (textarea_aria_invalid_value = /*invalid*/ ctx[12] || undefined)) && {
    					"aria-invalid": textarea_aria_invalid_value
    				},
    				(!current || dirty[0] & /*invalid, errorId*/ 69632 && textarea_aria_describedby_value !== (textarea_aria_describedby_value = /*invalid*/ ctx[12] ? /*errorId*/ ctx[16] : undefined)) && {
    					"aria-describedby": textarea_aria_describedby_value
    				},
    				(!current || dirty[0] & /*disabled*/ 128) && { disabled: /*disabled*/ ctx[7] },
    				(!current || dirty[0] & /*id*/ 16384) && { id: /*id*/ ctx[14] },
    				(!current || dirty[0] & /*name*/ 32768) && { name: /*name*/ ctx[15] },
    				(!current || dirty[0] & /*cols*/ 8) && { cols: /*cols*/ ctx[3] },
    				(!current || dirty[0] & /*rows*/ 16) && { rows: /*rows*/ ctx[4] },
    				(!current || dirty[0] & /*placeholder*/ 4) && { placeholder: /*placeholder*/ ctx[2] },
    				(!current || dirty[0] & /*readonly*/ 256) && { readOnly: /*readonly*/ ctx[8] },
    				(!current || dirty[0] & /*maxCount*/ 32 && textarea_maxlength_value !== (textarea_maxlength_value = /*maxCount*/ ctx[5] ?? undefined)) && { maxlength: textarea_maxlength_value },
    				dirty[0] & /*$$restProps*/ 262144 && /*$$restProps*/ ctx[18]
    			]));

    			if (dirty[0] & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}

    			toggle_class(textarea, "bx--text-area", true);
    			toggle_class(textarea, "bx--text-area--light", /*light*/ ctx[6]);
    			toggle_class(textarea, "bx--text-area--invalid", /*invalid*/ ctx[12]);

    			if (!current || dirty[0] & /*invalid*/ 4096 && div0_data_invalid_value !== (div0_data_invalid_value = /*invalid*/ ctx[12] || undefined)) {
    				attr_dev(div0, "data-invalid", div0_data_invalid_value);
    			}

    			if (!/*invalid*/ ctx[12] && /*helperText*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$4(ctx);
    					if_block2.c();
    					if_block2.m(div1, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*invalid*/ ctx[12]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$e(ctx);
    					if_block3.c();
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*textarea_binding*/ ctx[32](null);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let errorId;

    	const omit_props_names = [
    		"value","placeholder","cols","rows","maxCount","light","disabled","readonly","helperText","labelText","hideLabel","invalid","invalidText","id","name","ref"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextArea', slots, ['labelText']);
    	const $$slots = compute_slots(slots);
    	let { value = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { cols = 50 } = $$props;
    	let { rows = 4 } = $$props;
    	let { maxCount = undefined } = $$props;
    	let { light = false } = $$props;
    	let { disabled = false } = $$props;
    	let { readonly = false } = $$props;
    	let { helperText = "" } = $$props;
    	let { labelText = "" } = $$props;
    	let { hideLabel = false } = $$props;
    	let { invalid = false } = $$props;
    	let { invalidText = "" } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { name = undefined } = $$props;
    	let { ref = null } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function paste_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(18, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('placeholder' in $$new_props) $$invalidate(2, placeholder = $$new_props.placeholder);
    		if ('cols' in $$new_props) $$invalidate(3, cols = $$new_props.cols);
    		if ('rows' in $$new_props) $$invalidate(4, rows = $$new_props.rows);
    		if ('maxCount' in $$new_props) $$invalidate(5, maxCount = $$new_props.maxCount);
    		if ('light' in $$new_props) $$invalidate(6, light = $$new_props.light);
    		if ('disabled' in $$new_props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ('readonly' in $$new_props) $$invalidate(8, readonly = $$new_props.readonly);
    		if ('helperText' in $$new_props) $$invalidate(9, helperText = $$new_props.helperText);
    		if ('labelText' in $$new_props) $$invalidate(10, labelText = $$new_props.labelText);
    		if ('hideLabel' in $$new_props) $$invalidate(11, hideLabel = $$new_props.hideLabel);
    		if ('invalid' in $$new_props) $$invalidate(12, invalid = $$new_props.invalid);
    		if ('invalidText' in $$new_props) $$invalidate(13, invalidText = $$new_props.invalidText);
    		if ('id' in $$new_props) $$invalidate(14, id = $$new_props.id);
    		if ('name' in $$new_props) $$invalidate(15, name = $$new_props.name);
    		if ('ref' in $$new_props) $$invalidate(1, ref = $$new_props.ref);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		placeholder,
    		cols,
    		rows,
    		maxCount,
    		light,
    		disabled,
    		readonly,
    		helperText,
    		labelText,
    		hideLabel,
    		invalid,
    		invalidText,
    		id,
    		name,
    		ref,
    		WarningFilled,
    		errorId
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$new_props.placeholder);
    		if ('cols' in $$props) $$invalidate(3, cols = $$new_props.cols);
    		if ('rows' in $$props) $$invalidate(4, rows = $$new_props.rows);
    		if ('maxCount' in $$props) $$invalidate(5, maxCount = $$new_props.maxCount);
    		if ('light' in $$props) $$invalidate(6, light = $$new_props.light);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ('readonly' in $$props) $$invalidate(8, readonly = $$new_props.readonly);
    		if ('helperText' in $$props) $$invalidate(9, helperText = $$new_props.helperText);
    		if ('labelText' in $$props) $$invalidate(10, labelText = $$new_props.labelText);
    		if ('hideLabel' in $$props) $$invalidate(11, hideLabel = $$new_props.hideLabel);
    		if ('invalid' in $$props) $$invalidate(12, invalid = $$new_props.invalid);
    		if ('invalidText' in $$props) $$invalidate(13, invalidText = $$new_props.invalidText);
    		if ('id' in $$props) $$invalidate(14, id = $$new_props.id);
    		if ('name' in $$props) $$invalidate(15, name = $$new_props.name);
    		if ('ref' in $$props) $$invalidate(1, ref = $$new_props.ref);
    		if ('errorId' in $$props) $$invalidate(16, errorId = $$new_props.errorId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*id*/ 16384) {
    			$$invalidate(16, errorId = `error-${id}`);
    		}
    	};

    	return [
    		value,
    		ref,
    		placeholder,
    		cols,
    		rows,
    		maxCount,
    		light,
    		disabled,
    		readonly,
    		helperText,
    		labelText,
    		hideLabel,
    		invalid,
    		invalidText,
    		id,
    		name,
    		errorId,
    		$$slots,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		change_handler,
    		input_handler,
    		keydown_handler,
    		keyup_handler,
    		focus_handler,
    		blur_handler,
    		paste_handler,
    		textarea_binding,
    		textarea_input_handler
    	];
    }

    class TextArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$r,
    			create_fragment$r,
    			safe_not_equal,
    			{
    				value: 0,
    				placeholder: 2,
    				cols: 3,
    				rows: 4,
    				maxCount: 5,
    				light: 6,
    				disabled: 7,
    				readonly: 8,
    				helperText: 9,
    				labelText: 10,
    				hideLabel: 11,
    				invalid: 12,
    				invalidText: 13,
    				id: 14,
    				name: 15,
    				ref: 1
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextArea",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get value() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cols() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cols(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxCount() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxCount(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get helperText() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set helperText(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelText() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelText(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideLabel() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideLabel(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalidText() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalidText(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Toggle/Toggle.svelte generated by Svelte v3.49.0 */
    const file$o = "node_modules/carbon-components-svelte/src/Toggle/Toggle.svelte";
    const get_labelB_slot_changes = dirty => ({});
    const get_labelB_slot_context = ctx => ({});
    const get_labelA_slot_changes = dirty => ({});
    const get_labelA_slot_context = ctx => ({});
    const get_labelText_slot_changes = dirty => ({});
    const get_labelText_slot_context = ctx => ({});

    // (85:29)          
    function fallback_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*labelText*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labelText*/ 32) set_data_dev(t, /*labelText*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(85:29)          ",
    		ctx
    	});

    	return block;
    }

    // (94:28)            
    function fallback_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*labelA*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labelA*/ 8) set_data_dev(t, /*labelA*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(94:28)            ",
    		ctx
    	});

    	return block;
    }

    // (99:28)            
    function fallback_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*labelB*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labelB*/ 16) set_data_dev(t, /*labelB*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(99:28)            ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let span0;
    	let t1;
    	let span3;
    	let span1;
    	let t2;
    	let span2;
    	let span3_style_value;
    	let label_aria_label_value;
    	let div_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const labelText_slot_template = /*#slots*/ ctx[12].labelText;
    	const labelText_slot = create_slot(labelText_slot_template, ctx, /*$$scope*/ ctx[11], get_labelText_slot_context);
    	const labelText_slot_or_fallback = labelText_slot || fallback_block_2(ctx);
    	const labelA_slot_template = /*#slots*/ ctx[12].labelA;
    	const labelA_slot = create_slot(labelA_slot_template, ctx, /*$$scope*/ ctx[11], get_labelA_slot_context);
    	const labelA_slot_or_fallback = labelA_slot || fallback_block_1(ctx);
    	const labelB_slot_template = /*#slots*/ ctx[12].labelB;
    	const labelB_slot = create_slot(labelB_slot_template, ctx, /*$$scope*/ ctx[11], get_labelB_slot_context);
    	const labelB_slot_or_fallback = labelB_slot || fallback_block$3(ctx);

    	let div_levels = [
    		/*$$restProps*/ ctx[9],
    		{
    			style: div_style_value = "" + (/*$$restProps*/ ctx[9]['style'] + "; user-select: none")
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			span0 = element("span");
    			if (labelText_slot_or_fallback) labelText_slot_or_fallback.c();
    			t1 = space();
    			span3 = element("span");
    			span1 = element("span");
    			if (labelA_slot_or_fallback) labelA_slot_or_fallback.c();
    			t2 = space();
    			span2 = element("span");
    			if (labelB_slot_or_fallback) labelB_slot_or_fallback.c();
    			attr_dev(input, "role", "switch");
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*toggled*/ ctx[0];
    			input.disabled = /*disabled*/ ctx[2];
    			attr_dev(input, "id", /*id*/ ctx[7]);
    			attr_dev(input, "name", /*name*/ ctx[8]);
    			toggle_class(input, "bx--toggle-input", true);
    			toggle_class(input, "bx--toggle-input--small", /*size*/ ctx[1] === 'sm');
    			add_location(input, file$o, 55, 2, 1226);
    			toggle_class(span0, "bx--visually-hidden", /*hideLabel*/ ctx[6]);
    			add_location(span0, file$o, 83, 4, 1852);
    			attr_dev(span1, "aria-hidden", "true");
    			toggle_class(span1, "bx--toggle__text--off", true);
    			add_location(span1, file$o, 92, 6, 2082);
    			attr_dev(span2, "aria-hidden", "true");
    			toggle_class(span2, "bx--toggle__text--on", true);
    			add_location(span2, file$o, 97, 6, 2229);
    			attr_dev(span3, "style", span3_style_value = /*hideLabel*/ ctx[6] && 'margin-top: 0');
    			toggle_class(span3, "bx--toggle__switch", true);
    			add_location(span3, file$o, 88, 4, 1979);

    			attr_dev(label, "aria-label", label_aria_label_value = /*labelText*/ ctx[5]
    			? undefined
    			: /*$$props*/ ctx[10]['aria-label'] || 'Toggle');

    			attr_dev(label, "for", /*id*/ ctx[7]);
    			toggle_class(label, "bx--toggle-input__label", true);
    			add_location(label, file$o, 78, 2, 1702);
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--form-item", true);
    			add_location(div, file$o, 46, 0, 1057);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, span0);

    			if (labelText_slot_or_fallback) {
    				labelText_slot_or_fallback.m(span0, null);
    			}

    			append_dev(label, t1);
    			append_dev(label, span3);
    			append_dev(span3, span1);

    			if (labelA_slot_or_fallback) {
    				labelA_slot_or_fallback.m(span1, null);
    			}

    			append_dev(span3, t2);
    			append_dev(span3, span2);

    			if (labelB_slot_or_fallback) {
    				labelB_slot_or_fallback.m(span2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[17], false, false, false),
    					listen_dev(input, "change", /*change_handler_1*/ ctx[21], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[18], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_1*/ ctx[22], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[19], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[20], false, false, false),
    					listen_dev(div, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler*/ ctx[14], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler*/ ctx[15], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*toggled*/ 1) {
    				prop_dev(input, "checked", /*toggled*/ ctx[0]);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (!current || dirty & /*id*/ 128) {
    				attr_dev(input, "id", /*id*/ ctx[7]);
    			}

    			if (!current || dirty & /*name*/ 256) {
    				attr_dev(input, "name", /*name*/ ctx[8]);
    			}

    			if (dirty & /*size*/ 2) {
    				toggle_class(input, "bx--toggle-input--small", /*size*/ ctx[1] === 'sm');
    			}

    			if (labelText_slot) {
    				if (labelText_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						labelText_slot,
    						labelText_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(labelText_slot_template, /*$$scope*/ ctx[11], dirty, get_labelText_slot_changes),
    						get_labelText_slot_context
    					);
    				}
    			} else {
    				if (labelText_slot_or_fallback && labelText_slot_or_fallback.p && (!current || dirty & /*labelText*/ 32)) {
    					labelText_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (dirty & /*hideLabel*/ 64) {
    				toggle_class(span0, "bx--visually-hidden", /*hideLabel*/ ctx[6]);
    			}

    			if (labelA_slot) {
    				if (labelA_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						labelA_slot,
    						labelA_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(labelA_slot_template, /*$$scope*/ ctx[11], dirty, get_labelA_slot_changes),
    						get_labelA_slot_context
    					);
    				}
    			} else {
    				if (labelA_slot_or_fallback && labelA_slot_or_fallback.p && (!current || dirty & /*labelA*/ 8)) {
    					labelA_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (labelB_slot) {
    				if (labelB_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						labelB_slot,
    						labelB_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(labelB_slot_template, /*$$scope*/ ctx[11], dirty, get_labelB_slot_changes),
    						get_labelB_slot_context
    					);
    				}
    			} else {
    				if (labelB_slot_or_fallback && labelB_slot_or_fallback.p && (!current || dirty & /*labelB*/ 16)) {
    					labelB_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (!current || dirty & /*hideLabel*/ 64 && span3_style_value !== (span3_style_value = /*hideLabel*/ ctx[6] && 'margin-top: 0')) {
    				attr_dev(span3, "style", span3_style_value);
    			}

    			if (!current || dirty & /*labelText, $$props*/ 1056 && label_aria_label_value !== (label_aria_label_value = /*labelText*/ ctx[5]
    			? undefined
    			: /*$$props*/ ctx[10]['aria-label'] || 'Toggle')) {
    				attr_dev(label, "aria-label", label_aria_label_value);
    			}

    			if (!current || dirty & /*id*/ 128) {
    				attr_dev(label, "for", /*id*/ ctx[7]);
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9],
    				(!current || dirty & /*$$restProps*/ 512 && div_style_value !== (div_style_value = "" + (/*$$restProps*/ ctx[9]['style'] + "; user-select: none"))) && { style: div_style_value }
    			]));

    			toggle_class(div, "bx--form-item", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labelText_slot_or_fallback, local);
    			transition_in(labelA_slot_or_fallback, local);
    			transition_in(labelB_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labelText_slot_or_fallback, local);
    			transition_out(labelA_slot_or_fallback, local);
    			transition_out(labelB_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (labelText_slot_or_fallback) labelText_slot_or_fallback.d(detaching);
    			if (labelA_slot_or_fallback) labelA_slot_or_fallback.d(detaching);
    			if (labelB_slot_or_fallback) labelB_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"size","toggled","disabled","labelA","labelB","labelText","hideLabel","id","name"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toggle', slots, ['labelText','labelA','labelB']);
    	let { size = "default" } = $$props;
    	let { toggled = false } = $$props;
    	let { disabled = false } = $$props;
    	let { labelA = "Off" } = $$props;
    	let { labelB = "On" } = $$props;
    	let { labelText = "" } = $$props;
    	let { hideLabel = false } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { name = undefined } = $$props;
    	const dispatch = createEventDispatcher();

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const change_handler_1 = () => {
    		$$invalidate(0, toggled = !toggled);
    	};

    	const keyup_handler_1 = e => {
    		if (e.key === ' ' || e.key === 'Enter') {
    			e.preventDefault();
    			$$invalidate(0, toggled = !toggled);
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(1, size = $$new_props.size);
    		if ('toggled' in $$new_props) $$invalidate(0, toggled = $$new_props.toggled);
    		if ('disabled' in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('labelA' in $$new_props) $$invalidate(3, labelA = $$new_props.labelA);
    		if ('labelB' in $$new_props) $$invalidate(4, labelB = $$new_props.labelB);
    		if ('labelText' in $$new_props) $$invalidate(5, labelText = $$new_props.labelText);
    		if ('hideLabel' in $$new_props) $$invalidate(6, hideLabel = $$new_props.hideLabel);
    		if ('id' in $$new_props) $$invalidate(7, id = $$new_props.id);
    		if ('name' in $$new_props) $$invalidate(8, name = $$new_props.name);
    		if ('$$scope' in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		size,
    		toggled,
    		disabled,
    		labelA,
    		labelB,
    		labelText,
    		hideLabel,
    		id,
    		name,
    		createEventDispatcher,
    		dispatch
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(1, size = $$new_props.size);
    		if ('toggled' in $$props) $$invalidate(0, toggled = $$new_props.toggled);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('labelA' in $$props) $$invalidate(3, labelA = $$new_props.labelA);
    		if ('labelB' in $$props) $$invalidate(4, labelB = $$new_props.labelB);
    		if ('labelText' in $$props) $$invalidate(5, labelText = $$new_props.labelText);
    		if ('hideLabel' in $$props) $$invalidate(6, hideLabel = $$new_props.hideLabel);
    		if ('id' in $$props) $$invalidate(7, id = $$new_props.id);
    		if ('name' in $$props) $$invalidate(8, name = $$new_props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*toggled*/ 1) {
    			dispatch("toggle", { toggled });
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		toggled,
    		size,
    		disabled,
    		labelA,
    		labelB,
    		labelText,
    		hideLabel,
    		id,
    		name,
    		$$restProps,
    		$$props,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		change_handler,
    		keyup_handler,
    		focus_handler,
    		blur_handler,
    		change_handler_1,
    		keyup_handler_1
    	];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			size: 1,
    			toggled: 0,
    			disabled: 2,
    			labelA: 3,
    			labelB: 4,
    			labelText: 5,
    			hideLabel: 6,
    			id: 7,
    			name: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get size() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggled() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggled(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelA() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelA(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelB() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelB(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelText() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelText(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideLabel() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideLabel(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Theme/Theme.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const get_default_slot_changes = dirty => ({ theme: dirty & /*theme*/ 1 });
    const get_default_slot_context = ctx => ({ theme: /*theme*/ ctx[0] });

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (98:0) {#if persist}
    function create_if_block_2$1(ctx) {
    	let localstorage;
    	let updating_value;
    	let current;

    	function localstorage_value_binding(value) {
    		/*localstorage_value_binding*/ ctx[9](value);
    	}

    	let localstorage_props = { key: /*persistKey*/ ctx[2] };

    	if (/*theme*/ ctx[0] !== void 0) {
    		localstorage_props.value = /*theme*/ ctx[0];
    	}

    	localstorage = new LocalStorage({
    			props: localstorage_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(localstorage, 'value', localstorage_value_binding));

    	const block = {
    		c: function create() {
    			create_component(localstorage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(localstorage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const localstorage_changes = {};
    			if (dirty & /*persistKey*/ 4) localstorage_changes.key = /*persistKey*/ ctx[2];

    			if (!updating_value && dirty & /*theme*/ 1) {
    				updating_value = true;
    				localstorage_changes.value = /*theme*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			localstorage.$set(localstorage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(localstorage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(localstorage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(localstorage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(98:0) {#if persist}",
    		ctx
    	});

    	return block;
    }

    // (110:30) 
    function create_if_block_1$3(ctx) {
    	let select_1;
    	let updating_selected;
    	let current;
    	const select_1_spread_levels = [/*select*/ ctx[5]];

    	function select_1_selected_binding(value) {
    		/*select_1_selected_binding*/ ctx[11](value);
    	}

    	let select_1_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < select_1_spread_levels.length; i += 1) {
    		select_1_props = assign(select_1_props, select_1_spread_levels[i]);
    	}

    	if (/*theme*/ ctx[0] !== void 0) {
    		select_1_props.selected = /*theme*/ ctx[0];
    	}

    	select_1 = new Select({ props: select_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select_1, 'selected', select_1_selected_binding));

    	const block = {
    		c: function create() {
    			create_component(select_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_1_changes = (dirty & /*select*/ 32)
    			? get_spread_update(select_1_spread_levels, [get_spread_object(/*select*/ ctx[5])])
    			: {};

    			if (dirty & /*$$scope, select*/ 4128) {
    				select_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty & /*theme*/ 1) {
    				updating_selected = true;
    				select_1_changes.selected = /*theme*/ ctx[0];
    				add_flush_callback(() => updating_selected = false);
    			}

    			select_1.$set(select_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(110:30) ",
    		ctx
    	});

    	return block;
    }

    // (102:0) {#if render === "toggle"}
    function create_if_block$d(ctx) {
    	let toggle_1;
    	let current;

    	const toggle_1_spread_levels = [
    		/*toggle*/ ctx[4],
    		{
    			toggled: /*theme*/ ctx[0] === /*toggle*/ ctx[4].themes[1]
    		}
    	];

    	let toggle_1_props = {};

    	for (let i = 0; i < toggle_1_spread_levels.length; i += 1) {
    		toggle_1_props = assign(toggle_1_props, toggle_1_spread_levels[i]);
    	}

    	toggle_1 = new Toggle({ props: toggle_1_props, $$inline: true });
    	toggle_1.$on("toggle", /*toggle_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(toggle_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toggle_1_changes = (dirty & /*toggle, theme*/ 17)
    			? get_spread_update(toggle_1_spread_levels, [
    					dirty & /*toggle*/ 16 && get_spread_object(/*toggle*/ ctx[4]),
    					{
    						toggled: /*theme*/ ctx[0] === /*toggle*/ ctx[4].themes[1]
    					}
    				])
    			: {};

    			toggle_1.$set(toggle_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(102:0) {#if render === \\\"toggle\\\"}",
    		ctx
    	});

    	return block;
    }

    // (112:4) {#each select.themes as theme (theme)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let selectitem;
    	let current;

    	selectitem = new SelectItem({
    			props: {
    				value: /*theme*/ ctx[0],
    				text: /*themes*/ ctx[6][/*theme*/ ctx[0]]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(selectitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(selectitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const selectitem_changes = {};
    			if (dirty & /*select*/ 32) selectitem_changes.value = /*theme*/ ctx[0];
    			if (dirty & /*select*/ 32) selectitem_changes.text = /*themes*/ ctx[6][/*theme*/ ctx[0]];
    			selectitem.$set(selectitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(selectitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(112:4) {#each select.themes as theme (theme)}",
    		ctx
    	});

    	return block;
    }

    // (111:2) <Select {...select} bind:selected="{theme}">
    function create_default_slot$6(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*select*/ ctx[5].themes;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*theme*/ ctx[0];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*select, themes*/ 96) {
    				each_value = /*select*/ ctx[5].themes;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$4, each_1_anchor, get_each_context$4);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(111:2) <Select {...select} bind:selected=\\\"{theme}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let t0;
    	let current_block_type_index;
    	let if_block1;
    	let t1;
    	let current;
    	let if_block0 = /*persist*/ ctx[1] && create_if_block_2$1(ctx);
    	const if_block_creators = [create_if_block$d, create_if_block_1$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*render*/ ctx[3] === "toggle") return 0;
    		if (/*render*/ ctx[3] === "select") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*persist*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*persist*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, theme*/ 4097)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Theme', slots, ['default']);
    	let { theme = "white" } = $$props;
    	let { tokens = {} } = $$props;
    	let { persist = false } = $$props;
    	let { persistKey = "theme" } = $$props;
    	let { render = undefined } = $$props;

    	let { toggle = {
    		themes: ["white", "g100"],
    		labelA: "",
    		labelB: "",
    		labelText: "Dark mode",
    		hideLabel: false
    	} } = $$props;

    	/** @type {Record<CarbonTheme, string>} */
    	const themes = {
    		white: "White",
    		g10: "Gray 10",
    		g80: "Gray 80",
    		g90: "Gray 90",
    		g100: "Gray 100"
    	};

    	/** @type {CarbonTheme} */
    	const themeKeys = Object.keys(themes);

    	let { select = {
    		themes: themeKeys,
    		labelText: "Themes",
    		hideLabel: false
    	} } = $$props;

    	const dispatch = createEventDispatcher();
    	const writable_props = ['theme', 'tokens', 'persist', 'persistKey', 'render', 'toggle', 'select'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Theme> was created with unknown prop '${key}'`);
    	});

    	function localstorage_value_binding(value) {
    		theme = value;
    		$$invalidate(0, theme);
    	}

    	const toggle_handler = ({ detail }) => {
    		$$invalidate(0, theme = detail.toggled ? toggle.themes[1] : toggle.themes[0]);
    	};

    	function select_1_selected_binding(value) {
    		theme = value;
    		$$invalidate(0, theme);
    	}

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('tokens' in $$props) $$invalidate(7, tokens = $$props.tokens);
    		if ('persist' in $$props) $$invalidate(1, persist = $$props.persist);
    		if ('persistKey' in $$props) $$invalidate(2, persistKey = $$props.persistKey);
    		if ('render' in $$props) $$invalidate(3, render = $$props.render);
    		if ('toggle' in $$props) $$invalidate(4, toggle = $$props.toggle);
    		if ('select' in $$props) $$invalidate(5, select = $$props.select);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		theme,
    		tokens,
    		persist,
    		persistKey,
    		render,
    		toggle,
    		themes,
    		themeKeys,
    		select,
    		createEventDispatcher,
    		Toggle,
    		Select,
    		SelectItem,
    		LocalStorage,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('tokens' in $$props) $$invalidate(7, tokens = $$props.tokens);
    		if ('persist' in $$props) $$invalidate(1, persist = $$props.persist);
    		if ('persistKey' in $$props) $$invalidate(2, persistKey = $$props.persistKey);
    		if ('render' in $$props) $$invalidate(3, render = $$props.render);
    		if ('toggle' in $$props) $$invalidate(4, toggle = $$props.toggle);
    		if ('select' in $$props) $$invalidate(5, select = $$props.select);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tokens, theme*/ 129) {
    			if (typeof window !== "undefined") {
    				Object.entries(tokens).forEach(([token, value]) => {
    					document.documentElement.style.setProperty(`--cds-${token}`, value);
    				});

    				if (theme in themes) {
    					document.documentElement.setAttribute("theme", theme);
    					dispatch("update", { theme });
    				} else {
    					console.warn(`[Theme.svelte] invalid theme "${theme}". Value must be one of: ${JSON.stringify(Object.keys(themes))}`);
    				}
    			}
    		}
    	};

    	return [
    		theme,
    		persist,
    		persistKey,
    		render,
    		toggle,
    		select,
    		themes,
    		tokens,
    		slots,
    		localstorage_value_binding,
    		toggle_handler,
    		select_1_selected_binding,
    		$$scope
    	];
    }

    class Theme extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			theme: 0,
    			tokens: 7,
    			persist: 1,
    			persistKey: 2,
    			render: 3,
    			toggle: 4,
    			select: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Theme",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get theme() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tokens() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tokens(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persist() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persist(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistKey() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistKey(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get render() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set render(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<Theme>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<Theme>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Tile/Tile.svelte generated by Svelte v3.49.0 */

    const file$n = "node_modules/carbon-components-svelte/src/Tile/Tile.svelte";

    function create_fragment$o(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let div_levels = [/*$$restProps*/ ctx[1]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--tile", true);
    			toggle_class(div, "bx--tile--light", /*light*/ ctx[0]);
    			add_location(div, file$n, 6, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler*/ ctx[5], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler*/ ctx[6], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]]));
    			toggle_class(div, "bx--tile", true);
    			toggle_class(div, "bx--tile--light", /*light*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	const omit_props_names = ["light"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tile', slots, ['default']);
    	let { light = false } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('light' in $$new_props) $$invalidate(0, light = $$new_props.light);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ light });

    	$$self.$inject_state = $$new_props => {
    		if ('light' in $$props) $$invalidate(0, light = $$new_props.light);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		light,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class Tile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { light: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tile",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get light() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/icons/Menu.svelte generated by Svelte v3.49.0 */

    const file$m = "node_modules/carbon-components-svelte/src/icons/Menu.svelte";

    // (24:2) {#if title}
    function create_if_block$c(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$m, 23, 13, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(24:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$c(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M4 6H28V8H4zM4 24H28V26H4zM4 12H28V14H4zM4 18H28V20H4z");
    			add_location(path, file$m, 24, 2, 579);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$m, 13, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get size() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const shouldRenderHamburgerMenu = writable(false);

    const isSideNavCollapsed = writable(false);

    /* node_modules/carbon-components-svelte/src/UIShell/HamburgerMenu.svelte generated by Svelte v3.49.0 */
    const file$l = "node_modules/carbon-components-svelte/src/UIShell/HamburgerMenu.svelte";

    function create_fragment$m(ctx) {
    	let button;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;

    	var switch_value = /*isOpen*/ ctx[0]
    	? /*iconClose*/ ctx[4]
    	: /*iconMenu*/ ctx[3];

    	function switch_props(ctx) {
    		return { props: { size: 20 }, $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	let button_levels = [
    		{ type: "button" },
    		{ title: /*ariaLabel*/ ctx[2] },
    		{ "aria-label": /*ariaLabel*/ ctx[2] },
    		/*$$restProps*/ ctx[5]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(button, button_data);
    			toggle_class(button, "bx--header__action", true);
    			toggle_class(button, "bx--header__menu-trigger", true);
    			toggle_class(button, "bx--header__menu-toggle", true);
    			add_location(button, file$l, 31, 0, 758);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[7](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*isOpen*/ ctx[0]
    			? /*iconClose*/ ctx[4]
    			: /*iconMenu*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, button, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				{ type: "button" },
    				(!current || dirty & /*ariaLabel*/ 4) && { title: /*ariaLabel*/ ctx[2] },
    				(!current || dirty & /*ariaLabel*/ 4) && { "aria-label": /*ariaLabel*/ ctx[2] },
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]
    			]));

    			toggle_class(button, "bx--header__action", true);
    			toggle_class(button, "bx--header__menu-trigger", true);
    			toggle_class(button, "bx--header__menu-toggle", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (switch_instance) destroy_component(switch_instance);
    			/*button_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	const omit_props_names = ["ariaLabel","isOpen","iconMenu","iconClose","ref"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HamburgerMenu', slots, []);
    	let { ariaLabel = undefined } = $$props;
    	let { isOpen = false } = $$props;
    	let { iconMenu = Menu } = $$props;
    	let { iconClose = Close } = $$props;
    	let { ref = null } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	const click_handler_1 = () => $$invalidate(0, isOpen = !isOpen);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('ariaLabel' in $$new_props) $$invalidate(2, ariaLabel = $$new_props.ariaLabel);
    		if ('isOpen' in $$new_props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('iconMenu' in $$new_props) $$invalidate(3, iconMenu = $$new_props.iconMenu);
    		if ('iconClose' in $$new_props) $$invalidate(4, iconClose = $$new_props.iconClose);
    		if ('ref' in $$new_props) $$invalidate(1, ref = $$new_props.ref);
    	};

    	$$self.$capture_state = () => ({
    		ariaLabel,
    		isOpen,
    		iconMenu,
    		iconClose,
    		ref,
    		Close,
    		Menu
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('ariaLabel' in $$props) $$invalidate(2, ariaLabel = $$new_props.ariaLabel);
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$new_props.isOpen);
    		if ('iconMenu' in $$props) $$invalidate(3, iconMenu = $$new_props.iconMenu);
    		if ('iconClose' in $$props) $$invalidate(4, iconClose = $$new_props.iconClose);
    		if ('ref' in $$props) $$invalidate(1, ref = $$new_props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpen,
    		ref,
    		ariaLabel,
    		iconMenu,
    		iconClose,
    		$$restProps,
    		click_handler,
    		button_binding,
    		click_handler_1
    	];
    }

    class HamburgerMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			ariaLabel: 2,
    			isOpen: 0,
    			iconMenu: 3,
    			iconClose: 4,
    			ref: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HamburgerMenu",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get ariaLabel() {
    		throw new Error("<HamburgerMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabel(value) {
    		throw new Error("<HamburgerMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<HamburgerMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<HamburgerMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconMenu() {
    		throw new Error("<HamburgerMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconMenu(value) {
    		throw new Error("<HamburgerMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClose() {
    		throw new Error("<HamburgerMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClose(value) {
    		throw new Error("<HamburgerMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<HamburgerMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<HamburgerMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/UIShell/Header.svelte generated by Svelte v3.49.0 */
    const file$k = "node_modules/carbon-components-svelte/src/UIShell/Header.svelte";
    const get_platform_slot_changes = dirty => ({});
    const get_platform_slot_context = ctx => ({});
    const get_skip_to_content_slot_changes = dirty => ({});
    const get_skip_to_content_slot_context = ctx => ({});

    // (83:2) {#if ($shouldRenderHamburgerMenu && winWidth < expansionBreakpoint) || persistentHamburgerMenu}
    function create_if_block_1$2(ctx) {
    	let hamburgermenu;
    	let updating_isOpen;
    	let current;

    	function hamburgermenu_isOpen_binding(value) {
    		/*hamburgermenu_isOpen_binding*/ ctx[19](value);
    	}

    	let hamburgermenu_props = {
    		iconClose: /*iconClose*/ ctx[8],
    		iconMenu: /*iconMenu*/ ctx[7]
    	};

    	if (/*isSideNavOpen*/ ctx[0] !== void 0) {
    		hamburgermenu_props.isOpen = /*isSideNavOpen*/ ctx[0];
    	}

    	hamburgermenu = new HamburgerMenu({
    			props: hamburgermenu_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(hamburgermenu, 'isOpen', hamburgermenu_isOpen_binding));

    	const block = {
    		c: function create() {
    			create_component(hamburgermenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hamburgermenu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hamburgermenu_changes = {};
    			if (dirty & /*iconClose*/ 256) hamburgermenu_changes.iconClose = /*iconClose*/ ctx[8];
    			if (dirty & /*iconMenu*/ 128) hamburgermenu_changes.iconMenu = /*iconMenu*/ ctx[7];

    			if (!updating_isOpen && dirty & /*isSideNavOpen*/ 1) {
    				updating_isOpen = true;
    				hamburgermenu_changes.isOpen = /*isSideNavOpen*/ ctx[0];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			hamburgermenu.$set(hamburgermenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburgermenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburgermenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hamburgermenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(83:2) {#if ($shouldRenderHamburgerMenu && winWidth < expansionBreakpoint) || persistentHamburgerMenu}",
    		ctx
    	});

    	return block;
    }

    // (97:4) {#if company}
    function create_if_block$b(ctx) {
    	let span;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*company*/ ctx[3]);
    			t1 = text(" ");
    			toggle_class(span, "bx--header__name--prefix", true);
    			add_location(span, file$k, 97, 6, 2527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*company*/ 8) set_data_dev(t0, /*company*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(97:4) {#if company}",
    		ctx
    	});

    	return block;
    }

    // (100:26) {platformName}
    function fallback_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*platformName*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*platformName*/ 16) set_data_dev(t, /*platformName*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(100:26) {platformName}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let header;
    	let t0;
    	let t1;
    	let a;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[18]);
    	const skip_to_content_slot_template = /*#slots*/ ctx[16]["skip-to-content"];
    	const skip_to_content_slot = create_slot(skip_to_content_slot_template, ctx, /*$$scope*/ ctx[15], get_skip_to_content_slot_context);
    	let if_block0 = (/*$shouldRenderHamburgerMenu*/ ctx[11] && /*winWidth*/ ctx[9] < /*expansionBreakpoint*/ ctx[6] || /*persistentHamburgerMenu*/ ctx[5]) && create_if_block_1$2(ctx);
    	let if_block1 = /*company*/ ctx[3] && create_if_block$b(ctx);
    	const platform_slot_template = /*#slots*/ ctx[16].platform;
    	const platform_slot = create_slot(platform_slot_template, ctx, /*$$scope*/ ctx[15], get_platform_slot_context);
    	const platform_slot_or_fallback = platform_slot || fallback_block$2(ctx);
    	let a_levels = [{ href: /*href*/ ctx[2] }, /*$$restProps*/ ctx[12]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			header = element("header");
    			if (skip_to_content_slot) skip_to_content_slot.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			a = element("a");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (platform_slot_or_fallback) platform_slot_or_fallback.c();
    			t3 = space();
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			toggle_class(a, "bx--header__name", true);
    			add_location(a, file$k, 89, 2, 2386);
    			attr_dev(header, "aria-label", /*ariaLabel*/ ctx[10]);
    			toggle_class(header, "bx--header", true);
    			add_location(header, file$k, 80, 0, 2064);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);

    			if (skip_to_content_slot) {
    				skip_to_content_slot.m(header, null);
    			}

    			append_dev(header, t0);
    			if (if_block0) if_block0.m(header, null);
    			append_dev(header, t1);
    			append_dev(header, a);
    			if (if_block1) if_block1.m(a, null);
    			append_dev(a, t2);

    			if (platform_slot_or_fallback) {
    				platform_slot_or_fallback.m(a, null);
    			}

    			/*a_binding*/ ctx[20](a);
    			append_dev(header, t3);

    			if (default_slot) {
    				default_slot.m(header, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[18]),
    					listen_dev(a, "click", /*click_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (skip_to_content_slot) {
    				if (skip_to_content_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						skip_to_content_slot,
    						skip_to_content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(skip_to_content_slot_template, /*$$scope*/ ctx[15], dirty, get_skip_to_content_slot_changes),
    						get_skip_to_content_slot_context
    					);
    				}
    			}

    			if (/*$shouldRenderHamburgerMenu*/ ctx[11] && /*winWidth*/ ctx[9] < /*expansionBreakpoint*/ ctx[6] || /*persistentHamburgerMenu*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$shouldRenderHamburgerMenu, winWidth, expansionBreakpoint, persistentHamburgerMenu*/ 2656) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(header, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*company*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$b(ctx);
    					if_block1.c();
    					if_block1.m(a, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (platform_slot) {
    				if (platform_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						platform_slot,
    						platform_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(platform_slot_template, /*$$scope*/ ctx[15], dirty, get_platform_slot_changes),
    						get_platform_slot_context
    					);
    				}
    			} else {
    				if (platform_slot_or_fallback && platform_slot_or_fallback.p && (!current || dirty & /*platformName*/ 16)) {
    					platform_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 4) && { href: /*href*/ ctx[2] },
    				dirty & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			toggle_class(a, "bx--header__name", true);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*ariaLabel*/ 1024) {
    				attr_dev(header, "aria-label", /*ariaLabel*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skip_to_content_slot, local);
    			transition_in(if_block0);
    			transition_in(platform_slot_or_fallback, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skip_to_content_slot, local);
    			transition_out(if_block0);
    			transition_out(platform_slot_or_fallback, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (skip_to_content_slot) skip_to_content_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (platform_slot_or_fallback) platform_slot_or_fallback.d(detaching);
    			/*a_binding*/ ctx[20](null);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let ariaLabel;

    	const omit_props_names = [
    		"expandedByDefault","isSideNavOpen","uiShellAriaLabel","href","company","platformName","persistentHamburgerMenu","expansionBreakpoint","ref","iconMenu","iconClose"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $shouldRenderHamburgerMenu;
    	validate_store(shouldRenderHamburgerMenu, 'shouldRenderHamburgerMenu');
    	component_subscribe($$self, shouldRenderHamburgerMenu, $$value => $$invalidate(11, $shouldRenderHamburgerMenu = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, ['skip-to-content','platform','default']);
    	let { expandedByDefault = true } = $$props;
    	let { isSideNavOpen = false } = $$props;
    	let { uiShellAriaLabel = undefined } = $$props;
    	let { href = undefined } = $$props;
    	let { company = undefined } = $$props;
    	let { platformName = "" } = $$props;
    	let { persistentHamburgerMenu = false } = $$props;
    	let { expansionBreakpoint = 1056 } = $$props;
    	let { ref = null } = $$props;
    	let { iconMenu = Menu } = $$props;
    	let { iconClose = Close } = $$props;
    	let winWidth = undefined;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function onwindowresize() {
    		$$invalidate(9, winWidth = window.innerWidth);
    	}

    	function hamburgermenu_isOpen_binding(value) {
    		isSideNavOpen = value;
    		(((($$invalidate(0, isSideNavOpen), $$invalidate(13, expandedByDefault)), $$invalidate(9, winWidth)), $$invalidate(6, expansionBreakpoint)), $$invalidate(5, persistentHamburgerMenu));
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('expandedByDefault' in $$new_props) $$invalidate(13, expandedByDefault = $$new_props.expandedByDefault);
    		if ('isSideNavOpen' in $$new_props) $$invalidate(0, isSideNavOpen = $$new_props.isSideNavOpen);
    		if ('uiShellAriaLabel' in $$new_props) $$invalidate(14, uiShellAriaLabel = $$new_props.uiShellAriaLabel);
    		if ('href' in $$new_props) $$invalidate(2, href = $$new_props.href);
    		if ('company' in $$new_props) $$invalidate(3, company = $$new_props.company);
    		if ('platformName' in $$new_props) $$invalidate(4, platformName = $$new_props.platformName);
    		if ('persistentHamburgerMenu' in $$new_props) $$invalidate(5, persistentHamburgerMenu = $$new_props.persistentHamburgerMenu);
    		if ('expansionBreakpoint' in $$new_props) $$invalidate(6, expansionBreakpoint = $$new_props.expansionBreakpoint);
    		if ('ref' in $$new_props) $$invalidate(1, ref = $$new_props.ref);
    		if ('iconMenu' in $$new_props) $$invalidate(7, iconMenu = $$new_props.iconMenu);
    		if ('iconClose' in $$new_props) $$invalidate(8, iconClose = $$new_props.iconClose);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		expandedByDefault,
    		isSideNavOpen,
    		uiShellAriaLabel,
    		href,
    		company,
    		platformName,
    		persistentHamburgerMenu,
    		expansionBreakpoint,
    		ref,
    		iconMenu,
    		iconClose,
    		Close,
    		Menu,
    		shouldRenderHamburgerMenu,
    		HamburgerMenu,
    		winWidth,
    		ariaLabel,
    		$shouldRenderHamburgerMenu
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), $$new_props));
    		if ('expandedByDefault' in $$props) $$invalidate(13, expandedByDefault = $$new_props.expandedByDefault);
    		if ('isSideNavOpen' in $$props) $$invalidate(0, isSideNavOpen = $$new_props.isSideNavOpen);
    		if ('uiShellAriaLabel' in $$props) $$invalidate(14, uiShellAriaLabel = $$new_props.uiShellAriaLabel);
    		if ('href' in $$props) $$invalidate(2, href = $$new_props.href);
    		if ('company' in $$props) $$invalidate(3, company = $$new_props.company);
    		if ('platformName' in $$props) $$invalidate(4, platformName = $$new_props.platformName);
    		if ('persistentHamburgerMenu' in $$props) $$invalidate(5, persistentHamburgerMenu = $$new_props.persistentHamburgerMenu);
    		if ('expansionBreakpoint' in $$props) $$invalidate(6, expansionBreakpoint = $$new_props.expansionBreakpoint);
    		if ('ref' in $$props) $$invalidate(1, ref = $$new_props.ref);
    		if ('iconMenu' in $$props) $$invalidate(7, iconMenu = $$new_props.iconMenu);
    		if ('iconClose' in $$props) $$invalidate(8, iconClose = $$new_props.iconClose);
    		if ('winWidth' in $$props) $$invalidate(9, winWidth = $$new_props.winWidth);
    		if ('ariaLabel' in $$props) $$invalidate(10, ariaLabel = $$new_props.ariaLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*expandedByDefault, winWidth, expansionBreakpoint, persistentHamburgerMenu*/ 8800) {
    			$$invalidate(0, isSideNavOpen = expandedByDefault && winWidth >= expansionBreakpoint && !persistentHamburgerMenu);
    		}

    		$$invalidate(10, ariaLabel = company
    		? `${company} `
    		: "" + (uiShellAriaLabel || $$props["aria-label"] || platformName));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		isSideNavOpen,
    		ref,
    		href,
    		company,
    		platformName,
    		persistentHamburgerMenu,
    		expansionBreakpoint,
    		iconMenu,
    		iconClose,
    		winWidth,
    		ariaLabel,
    		$shouldRenderHamburgerMenu,
    		$$restProps,
    		expandedByDefault,
    		uiShellAriaLabel,
    		$$scope,
    		slots,
    		click_handler,
    		onwindowresize,
    		hamburgermenu_isOpen_binding,
    		a_binding
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			expandedByDefault: 13,
    			isSideNavOpen: 0,
    			uiShellAriaLabel: 14,
    			href: 2,
    			company: 3,
    			platformName: 4,
    			persistentHamburgerMenu: 5,
    			expansionBreakpoint: 6,
    			ref: 1,
    			iconMenu: 7,
    			iconClose: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get expandedByDefault() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expandedByDefault(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSideNavOpen() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSideNavOpen(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uiShellAriaLabel() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uiShellAriaLabel(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get company() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set company(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get platformName() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set platformName(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHamburgerMenu() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHamburgerMenu(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expansionBreakpoint() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expansionBreakpoint(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconMenu() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconMenu(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClose() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClose(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/UIShell/HeaderUtilities.svelte generated by Svelte v3.49.0 */

    const file$j = "node_modules/carbon-components-svelte/src/UIShell/HeaderUtilities.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			toggle_class(div, "bx--header__global", true);
    			add_location(div, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeaderUtilities', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeaderUtilities> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class HeaderUtilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeaderUtilities",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* node_modules/carbon-components-svelte/src/UIShell/Content.svelte generated by Svelte v3.49.0 */
    const file$i = "node_modules/carbon-components-svelte/src/UIShell/Content.svelte";

    function create_fragment$j(ctx) {
    	let main;
    	let main_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	let main_levels = [
    		{ id: /*id*/ ctx[0] },
    		/*$$restProps*/ ctx[2],
    		{
    			style: main_style_value = "" + ((/*$isSideNavCollapsed*/ ctx[1] && 'margin-left: 0;') + " " + /*$$restProps*/ ctx[2].style + "}")
    		}
    	];

    	let main_data = {};

    	for (let i = 0; i < main_levels.length; i += 1) {
    		main_data = assign(main_data, main_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot) default_slot.c();
    			set_attributes(main, main_data);
    			toggle_class(main, "bx--content", true);
    			add_location(main, file$i, 7, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(main, main_data = get_spread_update(main_levels, [
    				(!current || dirty & /*id*/ 1) && { id: /*id*/ ctx[0] },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2],
    				(!current || dirty & /*$isSideNavCollapsed, $$restProps*/ 6 && main_style_value !== (main_style_value = "" + ((/*$isSideNavCollapsed*/ ctx[1] && 'margin-left: 0;') + " " + /*$$restProps*/ ctx[2].style + "}"))) && { style: main_style_value }
    			]));

    			toggle_class(main, "bx--content", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const omit_props_names = ["id"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $isSideNavCollapsed;
    	validate_store(isSideNavCollapsed, 'isSideNavCollapsed');
    	component_subscribe($$self, isSideNavCollapsed, $$value => $$invalidate(1, $isSideNavCollapsed = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Content', slots, ['default']);
    	let { id = "main-content" } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('id' in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		isSideNavCollapsed,
    		$isSideNavCollapsed
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('id' in $$props) $$invalidate(0, id = $$new_props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, $isSideNavCollapsed, $$restProps, $$scope, slots];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get id() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/UIShell/SkipToContent.svelte generated by Svelte v3.49.0 */

    const file$h = "node_modules/carbon-components-svelte/src/UIShell/SkipToContent.svelte";

    // (16:8) Skip to main content
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Skip to main content");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(16:8) Skip to main content",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ tabindex: /*tabindex*/ ctx[1] },
    		/*$$restProps*/ ctx[2]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(a, a_data);
    			toggle_class(a, "bx--skip-to-content", true);
    			add_location(a, file$h, 8, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*tabindex*/ 2) && { tabindex: /*tabindex*/ ctx[1] },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]
    			]));

    			toggle_class(a, "bx--skip-to-content", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const omit_props_names = ["href","tabindex"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SkipToContent', slots, ['default']);
    	let { href = "#main-content" } = $$props;
    	let { tabindex = "0" } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('href' in $$new_props) $$invalidate(0, href = $$new_props.href);
    		if ('tabindex' in $$new_props) $$invalidate(1, tabindex = $$new_props.tabindex);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ href, tabindex });

    	$$self.$inject_state = $$new_props => {
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('tabindex' in $$props) $$invalidate(1, tabindex = $$new_props.tabindex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, tabindex, $$restProps, $$scope, slots, click_handler];
    }

    class SkipToContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { href: 0, tabindex: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkipToContent",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get href() {
    		throw new Error("<SkipToContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<SkipToContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<SkipToContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<SkipToContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/UIShell/HeaderGlobalAction.svelte generated by Svelte v3.49.0 */

    const file$g = "node_modules/carbon-components-svelte/src/UIShell/HeaderGlobalAction.svelte";

    // (23:8)      
    function fallback_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*icon*/ ctx[2];

    	function switch_props(ctx) {
    		return { props: { size: 20 }, $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*icon*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(23:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);
    	let button_levels = [{ type: "button" }, /*$$restProps*/ ctx[3]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "bx--header__action", true);
    			toggle_class(button, "bx--header__action--active", /*isActive*/ ctx[1]);
    			add_location(button, file$g, 14, 0, 310);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[7](button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*icon*/ 4)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [{ type: "button" }, dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(button, "bx--header__action", true);
    			toggle_class(button, "bx--header__action--active", /*isActive*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*button_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const omit_props_names = ["isActive","icon","ref"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeaderGlobalAction', slots, ['default']);
    	let { isActive = false } = $$props;
    	let { icon = undefined } = $$props;
    	let { ref = null } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('isActive' in $$new_props) $$invalidate(1, isActive = $$new_props.isActive);
    		if ('icon' in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ('ref' in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ isActive, icon, ref });

    	$$self.$inject_state = $$new_props => {
    		if ('isActive' in $$props) $$invalidate(1, isActive = $$new_props.isActive);
    		if ('icon' in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ref,
    		isActive,
    		icon,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		button_binding
    	];
    }

    class HeaderGlobalAction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { isActive: 1, icon: 2, ref: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeaderGlobalAction",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get isActive() {
    		throw new Error("<HeaderGlobalAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<HeaderGlobalAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<HeaderGlobalAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<HeaderGlobalAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<HeaderGlobalAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<HeaderGlobalAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var md5 = createCommonjsModule(function (module, exports) {
    /*

    TypeScript Md5
    ==============

    Based on work by
    * Joseph Myers: http://www.myersdaily.org/joseph/javascript/md5-text.html
    * André Cruz: https://github.com/satazor/SparkMD5
    * Raymond Hill: https://github.com/gorhill/yamd5.js

    Effectively a TypeScrypt re-write of Raymond Hill JS Library

    The MIT License (MIT)

    Copyright (C) 2014 Raymond Hill

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.



                DO WHAT YOU WANT TO PUBLIC LICENSE
                        Version 2, December 2004

     Copyright (C) 2015 André Cruz <amdfcruz@gmail.com>

     Everyone is permitted to copy and distribute verbatim or modified
     copies of this license document, and changing it is allowed as long
     as the name is changed.

                DO WHAT YOU WANT TO PUBLIC LICENSE
       TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

      0. You just DO WHAT YOU WANT TO.


    */
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Md5 = void 0;
    var Md5 = /** @class */ (function () {
        function Md5() {
            this._dataLength = 0;
            this._bufferLength = 0;
            this._state = new Int32Array(4);
            this._buffer = new ArrayBuffer(68);
            this._buffer8 = new Uint8Array(this._buffer, 0, 68);
            this._buffer32 = new Uint32Array(this._buffer, 0, 17);
            this.start();
        }
        Md5.hashStr = function (str, raw) {
            if (raw === void 0) { raw = false; }
            return this.onePassHasher
                .start()
                .appendStr(str)
                .end(raw);
        };
        Md5.hashAsciiStr = function (str, raw) {
            if (raw === void 0) { raw = false; }
            return this.onePassHasher
                .start()
                .appendAsciiStr(str)
                .end(raw);
        };
        Md5._hex = function (x) {
            var hc = Md5.hexChars;
            var ho = Md5.hexOut;
            var n;
            var offset;
            var j;
            var i;
            for (i = 0; i < 4; i += 1) {
                offset = i * 8;
                n = x[i];
                for (j = 0; j < 8; j += 2) {
                    ho[offset + 1 + j] = hc.charAt(n & 0x0F);
                    n >>>= 4;
                    ho[offset + 0 + j] = hc.charAt(n & 0x0F);
                    n >>>= 4;
                }
            }
            return ho.join('');
        };
        Md5._md5cycle = function (x, k) {
            var a = x[0];
            var b = x[1];
            var c = x[2];
            var d = x[3];
            // ff()
            a += (b & c | ~b & d) + k[0] - 680876936 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[1] - 389564586 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[2] + 606105819 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[4] - 176418897 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[7] - 45705983 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[10] - 42063 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[13] - 40341101 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            // gg()
            a += (b & d | c & ~d) + k[1] - 165796510 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[11] + 643717713 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[0] - 373897302 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[5] - 701558691 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[10] + 38016083 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[15] - 660478335 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[4] - 405537848 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[9] + 568446438 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[3] - 187363961 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[2] - 51403784 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            // hh()
            a += (b ^ c ^ d) + k[5] - 378558 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[14] - 35309556 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[7] - 155497632 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[13] + 681279174 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[0] - 358537222 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[3] - 722521979 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[6] + 76029189 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[9] - 640364487 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[12] - 421815835 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[15] + 530742520 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[2] - 995338651 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            // ii()
            a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            x[0] = a + x[0] | 0;
            x[1] = b + x[1] | 0;
            x[2] = c + x[2] | 0;
            x[3] = d + x[3] | 0;
        };
        /**
         * Initialise buffer to be hashed
         */
        Md5.prototype.start = function () {
            this._dataLength = 0;
            this._bufferLength = 0;
            this._state.set(Md5.stateIdentity);
            return this;
        };
        // Char to code point to to array conversion:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
        // #Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
        /**
         * Append a UTF-8 string to the hash buffer
         * @param str String to append
         */
        Md5.prototype.appendStr = function (str) {
            var buf8 = this._buffer8;
            var buf32 = this._buffer32;
            var bufLen = this._bufferLength;
            var code;
            var i;
            for (i = 0; i < str.length; i += 1) {
                code = str.charCodeAt(i);
                if (code < 128) {
                    buf8[bufLen++] = code;
                }
                else if (code < 0x800) {
                    buf8[bufLen++] = (code >>> 6) + 0xC0;
                    buf8[bufLen++] = code & 0x3F | 0x80;
                }
                else if (code < 0xD800 || code > 0xDBFF) {
                    buf8[bufLen++] = (code >>> 12) + 0xE0;
                    buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                    buf8[bufLen++] = (code & 0x3F) | 0x80;
                }
                else {
                    code = ((code - 0xD800) * 0x400) + (str.charCodeAt(++i) - 0xDC00) + 0x10000;
                    if (code > 0x10FFFF) {
                        throw new Error('Unicode standard supports code points up to U+10FFFF');
                    }
                    buf8[bufLen++] = (code >>> 18) + 0xF0;
                    buf8[bufLen++] = (code >>> 12 & 0x3F) | 0x80;
                    buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                    buf8[bufLen++] = (code & 0x3F) | 0x80;
                }
                if (bufLen >= 64) {
                    this._dataLength += 64;
                    Md5._md5cycle(this._state, buf32);
                    bufLen -= 64;
                    buf32[0] = buf32[16];
                }
            }
            this._bufferLength = bufLen;
            return this;
        };
        /**
         * Append an ASCII string to the hash buffer
         * @param str String to append
         */
        Md5.prototype.appendAsciiStr = function (str) {
            var buf8 = this._buffer8;
            var buf32 = this._buffer32;
            var bufLen = this._bufferLength;
            var i;
            var j = 0;
            for (;;) {
                i = Math.min(str.length - j, 64 - bufLen);
                while (i--) {
                    buf8[bufLen++] = str.charCodeAt(j++);
                }
                if (bufLen < 64) {
                    break;
                }
                this._dataLength += 64;
                Md5._md5cycle(this._state, buf32);
                bufLen = 0;
            }
            this._bufferLength = bufLen;
            return this;
        };
        /**
         * Append a byte array to the hash buffer
         * @param input array to append
         */
        Md5.prototype.appendByteArray = function (input) {
            var buf8 = this._buffer8;
            var buf32 = this._buffer32;
            var bufLen = this._bufferLength;
            var i;
            var j = 0;
            for (;;) {
                i = Math.min(input.length - j, 64 - bufLen);
                while (i--) {
                    buf8[bufLen++] = input[j++];
                }
                if (bufLen < 64) {
                    break;
                }
                this._dataLength += 64;
                Md5._md5cycle(this._state, buf32);
                bufLen = 0;
            }
            this._bufferLength = bufLen;
            return this;
        };
        /**
         * Get the state of the hash buffer
         */
        Md5.prototype.getState = function () {
            var s = this._state;
            return {
                buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)),
                buflen: this._bufferLength,
                length: this._dataLength,
                state: [s[0], s[1], s[2], s[3]]
            };
        };
        /**
         * Override the current state of the hash buffer
         * @param state New hash buffer state
         */
        Md5.prototype.setState = function (state) {
            var buf = state.buffer;
            var x = state.state;
            var s = this._state;
            var i;
            this._dataLength = state.length;
            this._bufferLength = state.buflen;
            s[0] = x[0];
            s[1] = x[1];
            s[2] = x[2];
            s[3] = x[3];
            for (i = 0; i < buf.length; i += 1) {
                this._buffer8[i] = buf.charCodeAt(i);
            }
        };
        /**
         * Hash the current state of the hash buffer and return the result
         * @param raw Whether to return the value as an `Int32Array`
         */
        Md5.prototype.end = function (raw) {
            if (raw === void 0) { raw = false; }
            var bufLen = this._bufferLength;
            var buf8 = this._buffer8;
            var buf32 = this._buffer32;
            var i = (bufLen >> 2) + 1;
            this._dataLength += bufLen;
            var dataBitsLen = this._dataLength * 8;
            buf8[bufLen] = 0x80;
            buf8[bufLen + 1] = buf8[bufLen + 2] = buf8[bufLen + 3] = 0;
            buf32.set(Md5.buffer32Identity.subarray(i), i);
            if (bufLen > 55) {
                Md5._md5cycle(this._state, buf32);
                buf32.set(Md5.buffer32Identity);
            }
            // Do the final computation based on the tail and length
            // Beware that the final length may not fit in 32 bits so we take care of that
            if (dataBitsLen <= 0xFFFFFFFF) {
                buf32[14] = dataBitsLen;
            }
            else {
                var matches = dataBitsLen.toString(16).match(/(.*?)(.{0,8})$/);
                if (matches === null) {
                    return;
                }
                var lo = parseInt(matches[2], 16);
                var hi = parseInt(matches[1], 16) || 0;
                buf32[14] = lo;
                buf32[15] = hi;
            }
            Md5._md5cycle(this._state, buf32);
            return raw ? this._state : Md5._hex(this._state);
        };
        // Private Static Variables
        Md5.stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);
        Md5.buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        Md5.hexChars = '0123456789abcdef';
        Md5.hexOut = [];
        // Permanent instance is to use for one-call hashing
        Md5.onePassHasher = new Md5();
        return Md5;
    }());
    exports.Md5 = Md5;
    if (Md5.hashStr('hello') !== '5d41402abc4b2a76b9719d911017c592') {
        throw new Error('Md5 self test failed.');
    }

    });

    /**
     * nid - nomie id
     * A small utility class to generate a unique-ish ID with a set length.
     * Since nomie runs locally, a collision will be unlikedly
     *
     */
    var nid = (a1, a2) => {
        let str = `${new Date().getTime() + Math.random()}`;
        let defaultLen = 32;
        if (!a1) {
            return md5.Md5.hashStr(str).toString().substr(0, defaultLen);
        }
        else {
            if (typeof a1 == "string") {
                let len = typeof a2 == "number" ? a2 : defaultLen;
                str = a1;
                return md5.Md5.hashStr(str).toString().substr(0, len);
            }
            else if (typeof a1 == "number") {
                return md5.Md5.hashStr(str).toString().substr(0, a1);
            }
        }
    };

    /* src/components/widgetcard.svelte generated by Svelte v3.49.0 */

    const file$f = "src/components/widgetcard.svelte";

    function create_fragment$g(ctx) {
    	let svg;
    	let path;
    	let text0;
    	let t0_value = /*widget*/ ctx[0].emoji + "";
    	let t0;
    	let t1;
    	let text1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			text0 = svg_element("text");
    			t0 = text(t0_value);
    			t1 = text(/*cardlabel*/ ctx[3]);
    			text1 = svg_element("text");
    			t2 = text("🗑️");
    			set_style(path, "fill", /*widget*/ ctx[0].color);
    			set_style(path, "stroke", /*bgcolor*/ ctx[4]);
    			attr_dev(path, "d", "M 25,60 \n             a 20,20 1 0,0 0,40 \n             h 50 \n             a 20,20 1 0,0 0,-40 \n             a 10,10 1 0,0 -15,-10 \n             a 15,15 1 0,0 -35,10  \n             z");
    			attr_dev(path, "class", "svelte-1yktf91");
    			add_location(path, file$f, 26, 4, 535);
    			attr_dev(text0, "x", "50%");
    			attr_dev(text0, "y", "85");
    			attr_dev(text0, "dominant-baseline", "middle");
    			attr_dev(text0, "text-anchor", "middle");
    			attr_dev(text0, "class", "label svelte-1yktf91");
    			add_location(text0, file$f, 33, 13, 788);
    			attr_dev(text1, "x", "33%");
    			attr_dev(text1, "y", "57");
    			attr_dev(text1, "class", "trash svelte-1yktf91");
    			add_location(text1, file$f, 34, 13, 970);
    			attr_dev(svg, "viewBox", "0 0 105 105");
    			set_style(svg, "cursor", "pointer");
    			attr_dev(svg, "class", "svelte-1yktf91");
    			add_location(svg, file$f, 25, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			append_dev(svg, text0);
    			append_dev(text0, t0);
    			append_dev(text0, t1);
    			append_dev(svg, text1);
    			append_dev(text1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						text0,
    						"click",
    						stop_propagation(prevent_default(function () {
    							if (is_function(/*editWidget*/ ctx[2])) /*editWidget*/ ctx[2].apply(this, arguments);
    						})),
    						false,
    						true,
    						true
    					),
    					listen_dev(
    						text1,
    						"click",
    						stop_propagation(prevent_default(function () {
    							if (is_function(/*deleteWidget*/ ctx[1])) /*deleteWidget*/ ctx[1].apply(this, arguments);
    						})),
    						false,
    						true,
    						true
    					),
    					listen_dev(
    						svg,
    						"click",
    						function () {
    							if (is_function(/*editWidget*/ ctx[2])) /*editWidget*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*widget*/ 1) {
    				set_style(path, "fill", /*widget*/ ctx[0].color);
    			}

    			if (dirty & /*bgcolor*/ 16) {
    				set_style(path, "stroke", /*bgcolor*/ ctx[4]);
    			}

    			if (dirty & /*widget*/ 1 && t0_value !== (t0_value = /*widget*/ ctx[0].emoji + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*cardlabel*/ 8) set_data_dev(t1, /*cardlabel*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Widgetcard', slots, []);

    	let { widget = {
    		widgetid: "",
    		name: "",
    		emoji: "",
    		days: "",
    		color: "",
    		keywords: []
    	} } = $$props;

    	let { deleteWidget } = $$props;
    	let { editWidget } = $$props;
    	let { theme } = $$props;
    	var cardlabel = widget.name;
    	var bgcolor = "black";

    	if (cardlabel.length > 10) {
    		cardlabel = cardlabel.slice(0, 10) + '...';
    	}

    	if (theme == "g10") {
    		bgcolor = "black";
    	} else {
    		bgcolor = "white";
    	}

    	const writable_props = ['widget', 'deleteWidget', 'editWidget', 'theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Widgetcard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('widget' in $$props) $$invalidate(0, widget = $$props.widget);
    		if ('deleteWidget' in $$props) $$invalidate(1, deleteWidget = $$props.deleteWidget);
    		if ('editWidget' in $$props) $$invalidate(2, editWidget = $$props.editWidget);
    		if ('theme' in $$props) $$invalidate(5, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		widget,
    		deleteWidget,
    		editWidget,
    		theme,
    		cardlabel,
    		bgcolor
    	});

    	$$self.$inject_state = $$props => {
    		if ('widget' in $$props) $$invalidate(0, widget = $$props.widget);
    		if ('deleteWidget' in $$props) $$invalidate(1, deleteWidget = $$props.deleteWidget);
    		if ('editWidget' in $$props) $$invalidate(2, editWidget = $$props.editWidget);
    		if ('theme' in $$props) $$invalidate(5, theme = $$props.theme);
    		if ('cardlabel' in $$props) $$invalidate(3, cardlabel = $$props.cardlabel);
    		if ('bgcolor' in $$props) $$invalidate(4, bgcolor = $$props.bgcolor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [widget, deleteWidget, editWidget, cardlabel, bgcolor, theme];
    }

    class Widgetcard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			widget: 0,
    			deleteWidget: 1,
    			editWidget: 2,
    			theme: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Widgetcard",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*deleteWidget*/ ctx[1] === undefined && !('deleteWidget' in props)) {
    			console.warn("<Widgetcard> was created without expected prop 'deleteWidget'");
    		}

    		if (/*editWidget*/ ctx[2] === undefined && !('editWidget' in props)) {
    			console.warn("<Widgetcard> was created without expected prop 'editWidget'");
    		}

    		if (/*theme*/ ctx[5] === undefined && !('theme' in props)) {
    			console.warn("<Widgetcard> was created without expected prop 'theme'");
    		}
    	}

    	get widget() {
    		throw new Error("<Widgetcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widget(value) {
    		throw new Error("<Widgetcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteWidget() {
    		throw new Error("<Widgetcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteWidget(value) {
    		throw new Error("<Widgetcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editWidget() {
    		throw new Error("<Widgetcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editWidget(value) {
    		throw new Error("<Widgetcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<Widgetcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Widgetcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Add.svelte generated by Svelte v3.49.0 */

    const file$e = "node_modules/carbon-icons-svelte/lib/Add.svelte";

    // (23:2) {#if title}
    function create_if_block$a(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$e, 22, 13, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(23:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$a(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M17 15L17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z");
    			add_location(path, file$e, 23, 2, 573);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$e, 13, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Add', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class Add extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Add",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get size() {
    		throw new Error("<Add>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Add>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Add>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Add>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const widgetTemplates = [
        {
            name: "Kick Starter",
            description: "a very simple widget configuration to be used as a starter",
            emoji: "𓇬",
            id: "",
            color: "#C47ADA",
            days: "90",
            keywords: ["Nomie6", "Wordcloud"]
        }
    ];

    /* src/components/addcard.svelte generated by Svelte v3.49.0 */
    const file$d = "src/components/addcard.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:8) {#each widgetTemplates as template }
    function create_each_block$3(ctx) {
    	let overflowmenuitem;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*template*/ ctx[4]);
    	}

    	overflowmenuitem = new OverflowMenuItem({
    			props: { text: /*template*/ ctx[4].name },
    			$$inline: true
    		});

    	overflowmenuitem.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(overflowmenuitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(overflowmenuitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overflowmenuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overflowmenuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(overflowmenuitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(26:8) {#each widgetTemplates as template }",
    		ctx
    	});

    	return block;
    }

    // (24:4) <OverflowMenu icon={Add} direction={direction}>
    function create_default_slot$5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = widgetTemplates;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*widgetTemplates, dispatch*/ 2) {
    				each_value = widgetTemplates;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(24:4) <OverflowMenu icon={Add} direction={direction}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let h3;
    	let overflowmenu;
    	let current;

    	overflowmenu = new OverflowMenu({
    			props: {
    				icon: Add,
    				direction: /*direction*/ ctx[0],
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			h3 = element("h3");
    			create_component(overflowmenu.$$.fragment);
    			attr_dev(div0, "class", "actions svelte-1li7zav");
    			add_location(div0, file$d, 20, 4, 514);
    			attr_dev(h3, "class", "svelte-1li7zav");
    			add_location(h3, file$d, 22, 4, 551);
    			attr_dev(div1, "class", "fast svelte-1li7zav");
    			set_style(div1, "background-color", "grey");
    			set_style(div1, "color", "white");
    			add_location(div1, file$d, 19, 0, 446);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, h3);
    			mount_component(overflowmenu, h3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const overflowmenu_changes = {};
    			if (dirty & /*direction*/ 1) overflowmenu_changes.direction = /*direction*/ ctx[0];

    			if (dirty & /*$$scope*/ 128) {
    				overflowmenu_changes.$$scope = { dirty, ctx };
    			}

    			overflowmenu.$set(overflowmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overflowmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overflowmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(overflowmenu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Addcard', slots, []);
    	let { amountofcards = 3 } = $$props;
    	let direction = "bottom";
    	const dispatch = createEventDispatcher();
    	const writable_props = ['amountofcards'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Addcard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = template => {
    		dispatch("addbytemplate", { template });
    	};

    	$$self.$$set = $$props => {
    		if ('amountofcards' in $$props) $$invalidate(2, amountofcards = $$props.amountofcards);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		OverflowMenu,
    		OverflowMenuItem,
    		Add,
    		widgetTemplates,
    		amountofcards,
    		direction,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('amountofcards' in $$props) $$invalidate(2, amountofcards = $$props.amountofcards);
    		if ('direction' in $$props) $$invalidate(0, direction = $$props.direction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*amountofcards*/ 4) {
    			if (amountofcards > 2) {
    				$$invalidate(0, direction = "top");
    			} else {
    				$$invalidate(0, direction = "bottom");
    			}
    		}
    	};

    	return [direction, dispatch, amountofcards, click_handler];
    }

    class Addcard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { amountofcards: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Addcard",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get amountofcards() {
    		throw new Error("<Addcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amountofcards(value) {
    		throw new Error("<Addcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/main.svelte generated by Svelte v3.49.0 */
    const file$c = "src/pages/main.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (42:8) <Column>
    function create_default_slot_6$2(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let h5;
    	let t5;
    	let hr;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*pluginemoji*/ ctx[1]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*pluginname*/ ctx[0]);
    			t3 = space();
    			h5 = element("h5");
    			h5.textContent = "Loaded Succesfully";
    			t5 = space();
    			hr = element("hr");
    			set_style(h1, "text-align", "center");
    			add_location(h1, file$c, 42, 10, 829);
    			set_style(h2, "text-align", "center");
    			attr_dev(h2, "class", "svelte-13ppi81");
    			add_location(h2, file$c, 43, 10, 888);
    			set_style(h5, "text-align", "center");
    			add_location(h5, file$c, 44, 10, 946);
    			add_location(hr, file$c, 45, 10, 1010);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pluginemoji*/ 2) set_data_dev(t0, /*pluginemoji*/ ctx[1]);
    			if (dirty & /*pluginname*/ 1) set_data_dev(t2, /*pluginname*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$2.name,
    		type: "slot",
    		source: "(42:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (41:6) <Row>
    function create_default_slot_5$2(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_6$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 262147) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(41:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (62:10) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*widgets*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme, widgets, deletewidget, editwidget*/ 204) {
    				each_value = /*widgets*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(62:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:10) {#if widgets.length < 4}
    function create_if_block$9(ctx) {
    	let tile;
    	let current;

    	tile = new Tile({
    			props: {
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tile_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				tile_changes.$$scope = { dirty, ctx };
    			}

    			tile.$set(tile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(55:10) {#if widgets.length < 4}",
    		ctx
    	});

    	return block;
    }

    // (64:12) {#if widget.widgetid.length > 3}
    function create_if_block_1$1(ctx) {
    	let widgetcard;
    	let current;

    	function func() {
    		return /*func*/ ctx[8](/*widget*/ ctx[15]);
    	}

    	function func_1() {
    		return /*func_1*/ ctx[9](/*widget*/ ctx[15]);
    	}

    	widgetcard = new Widgetcard({
    			props: {
    				theme: /*theme*/ ctx[3],
    				widget: /*widget*/ ctx[15],
    				deleteWidget: func,
    				editWidget: func_1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(widgetcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(widgetcard, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const widgetcard_changes = {};
    			if (dirty & /*theme*/ 8) widgetcard_changes.theme = /*theme*/ ctx[3];
    			if (dirty & /*widgets*/ 4) widgetcard_changes.widget = /*widget*/ ctx[15];
    			if (dirty & /*widgets*/ 4) widgetcard_changes.deleteWidget = func;
    			if (dirty & /*widgets*/ 4) widgetcard_changes.editWidget = func_1;
    			widgetcard.$set(widgetcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(widgetcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(widgetcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(widgetcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(64:12) {#if widget.widgetid.length > 3}",
    		ctx
    	});

    	return block;
    }

    // (63:12) {#each widgets as widget}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*widget*/ ctx[15].widgetid.length > 3 && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*widget*/ ctx[15].widgetid.length > 3) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*widgets*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(63:12) {#each widgets as widget}",
    		ctx
    	});

    	return block;
    }

    // (56:10) <Tile>
    function create_default_slot_4$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No Wordcloud Widgets? Oh dear, please add one to enhance your dashboard.";
    			attr_dev(p, "class", "no-widgets svelte-13ppi81");
    			add_location(p, file$c, 56, 12, 1227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(56:10) <Tile>",
    		ctx
    	});

    	return block;
    }

    // (50:8) <Column>
    function create_default_slot_3$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let addcard;
    	let updating_amountofcards;
    	let current;
    	const if_block_creators = [create_if_block$9, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*widgets*/ ctx[2].length < 4) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function addcard_amountofcards_binding(value) {
    		/*addcard_amountofcards_binding*/ ctx[10](value);
    	}

    	let addcard_props = {};

    	if (/*amountofcards*/ ctx[4] !== void 0) {
    		addcard_props.amountofcards = /*amountofcards*/ ctx[4];
    	}

    	addcard = new Addcard({ props: addcard_props, $$inline: true });
    	binding_callbacks.push(() => bind(addcard, 'amountofcards', addcard_amountofcards_binding));
    	addcard.$on("addnew", /*addnew_handler*/ ctx[11]);
    	addcard.$on("addbytemplate", /*addbytemplate_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t = space();
    			create_component(addcard.$$.fragment);
    			attr_dev(div0, "class", "widgets-list svelte-13ppi81");
    			add_location(div0, file$c, 53, 8, 1136);
    			add_location(div1, file$c, 51, 6, 1113);
    			attr_dev(div2, "class", "container svelte-13ppi81");
    			add_location(div2, file$c, 50, 4, 1079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t);
    			mount_component(addcard, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, t);
    			}

    			const addcard_changes = {};

    			if (!updating_amountofcards && dirty & /*amountofcards*/ 16) {
    				updating_amountofcards = true;
    				addcard_changes.amountofcards = /*amountofcards*/ ctx[4];
    				add_flush_callback(() => updating_amountofcards = false);
    			}

    			addcard.$set(addcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(addcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(addcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			destroy_component(addcard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(50:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (49:6) <Row>
    function create_default_slot_2$3(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};

    			if (dirty & /*$$scope, amountofcards, widgets, theme*/ 262172) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(49:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (40:4) <Grid>
    function create_default_slot_1$4(ctx) {
    	let row0;
    	let t;
    	let row1;
    	let current;

    	row0 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t = space();
    			create_component(row1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(row1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 262147) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope, amountofcards, widgets, theme*/ 262172) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(row1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(40:4) <Grid>",
    		ctx
    	});

    	return block;
    }

    // (39:0) <Content>
    function create_default_slot$4(ctx) {
    	let grid;
    	let current;

    	grid = new Grid({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(grid.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const grid_changes = {};

    			if (dirty & /*$$scope, amountofcards, widgets, theme, pluginname, pluginemoji*/ 262175) {
    				grid_changes.$$scope = { dirty, ctx };
    			}

    			grid.$set(grid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(grid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(39:0) <Content>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const content_changes = {};

    			if (dirty & /*$$scope, amountofcards, widgets, theme, pluginname, pluginemoji*/ 262175) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let { pluginname } = $$props;
    	let { pluginemoji } = $$props;
    	let { widgets = [] } = $$props;
    	let { theme } = $$props;
    	let amountofcards = widgets.length;
    	let open = true;
    	const dispatch = createEventDispatcher();

    	function deletewidget(id) {
    		dispatch("deletewidget", id);
    	}

    	function editwidget(id) {
    		dispatch("editwidget", id);
    	}

    	function exitMain() {
    		dispatch("exitinfo");
    		open = false;
    	}

    	const writable_props = ['pluginname', 'pluginemoji', 'widgets', 'theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	const func = widget => deletewidget(widget.widgetid);
    	const func_1 = widget => editwidget(widget.widgetid);

    	function addcard_amountofcards_binding(value) {
    		amountofcards = value;
    		$$invalidate(4, amountofcards);
    	}

    	const addnew_handler = () => {
    		dispatch("addnew");
    	};

    	const addbytemplate_handler = event => {
    		dispatch("addbytemplate", event);
    	};

    	$$self.$$set = $$props => {
    		if ('pluginname' in $$props) $$invalidate(0, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(1, pluginemoji = $$props.pluginemoji);
    		if ('widgets' in $$props) $$invalidate(2, widgets = $$props.widgets);
    		if ('theme' in $$props) $$invalidate(3, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Button,
    		Content,
    		Grid,
    		Row,
    		Column,
    		Tile,
    		WidgetCard: Widgetcard,
    		AddCard: Addcard,
    		pluginname,
    		pluginemoji,
    		widgets,
    		theme,
    		amountofcards,
    		open,
    		dispatch,
    		deletewidget,
    		editwidget,
    		exitMain
    	});

    	$$self.$inject_state = $$props => {
    		if ('pluginname' in $$props) $$invalidate(0, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(1, pluginemoji = $$props.pluginemoji);
    		if ('widgets' in $$props) $$invalidate(2, widgets = $$props.widgets);
    		if ('theme' in $$props) $$invalidate(3, theme = $$props.theme);
    		if ('amountofcards' in $$props) $$invalidate(4, amountofcards = $$props.amountofcards);
    		if ('open' in $$props) open = $$props.open;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pluginname,
    		pluginemoji,
    		widgets,
    		theme,
    		amountofcards,
    		dispatch,
    		deletewidget,
    		editwidget,
    		func,
    		func_1,
    		addcard_amountofcards_binding,
    		addnew_handler,
    		addbytemplate_handler
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			pluginname: 0,
    			pluginemoji: 1,
    			widgets: 2,
    			theme: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pluginname*/ ctx[0] === undefined && !('pluginname' in props)) {
    			console.warn("<Main> was created without expected prop 'pluginname'");
    		}

    		if (/*pluginemoji*/ ctx[1] === undefined && !('pluginemoji' in props)) {
    			console.warn("<Main> was created without expected prop 'pluginemoji'");
    		}

    		if (/*theme*/ ctx[3] === undefined && !('theme' in props)) {
    			console.warn("<Main> was created without expected prop 'theme'");
    		}
    	}

    	get pluginname() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginname(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pluginemoji() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginemoji(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widgets() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widgets(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/info.svelte generated by Svelte v3.49.0 */
    const file$b = "src/pages/info.svelte";

    // (28:8) <Column>
    function create_default_slot_6$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let h5;
    	let t5;
    	let hr0;
    	let t6;
    	let h40;
    	let t8;
    	let h60;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let hr1;
    	let br0;
    	let t17;
    	let h41;
    	let t19;
    	let h61;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let h62;
    	let t25;
    	let hr2;
    	let br1;
    	let t26;
    	let h42;
    	let t28;
    	let h63;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*pluginemoji*/ ctx[1]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*pluginname*/ ctx[0]);
    			t3 = space();
    			h5 = element("h5");
    			h5.textContent = "General Information";
    			t5 = space();
    			hr0 = element("hr");
    			t6 = space();
    			h40 = element("h4");
    			h40.textContent = "General:";
    			t8 = space();
    			h60 = element("h6");
    			t9 = text("This is a plugin for ");
    			t10 = text(/*parent*/ ctx[2]);
    			t11 = text(". This plugin will enable Wordcloud Widgets on the ");
    			t12 = text(/*parent*/ ctx[2]);
    			t13 = text(" Dashboard. You can configure as many Wordcloud configurations as you want. The configured Widgets will be available to add to your ");
    			t14 = text(/*parent*/ ctx[2]);
    			t15 = text(" dashboard.");
    			t16 = space();
    			hr1 = element("hr");
    			br0 = element("br");
    			t17 = space();
    			h41 = element("h4");
    			h41.textContent = "Licence:";
    			t19 = space();
    			h61 = element("h6");
    			t20 = text("The ");
    			t21 = text(/*parent*/ ctx[2]);
    			t22 = text(" WordcloudPlugin is licenced under the MIT licence");
    			t23 = space();
    			h62 = element("h6");
    			h62.textContent = "Copyright Ronald de Lange.\n                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n                The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n                THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.";
    			t25 = space();
    			hr2 = element("hr");
    			br1 = element("br");
    			t26 = space();
    			h42 = element("h4");
    			h42.textContent = "Support:";
    			t28 = space();
    			h63 = element("h6");
    			h63.textContent = "Please contact me @ ronald_de_lange@hotmail.com";
    			set_style(h1, "text-align", "center");
    			add_location(h1, file$b, 28, 12, 491);
    			set_style(h2, "text-align", "center");
    			attr_dev(h2, "class", "svelte-gjbk59");
    			add_location(h2, file$b, 29, 12, 552);
    			set_style(h5, "text-align", "center");
    			add_location(h5, file$b, 30, 12, 612);
    			add_location(hr0, file$b, 31, 12, 679);
    			add_location(h40, file$b, 32, 12, 696);
    			attr_dev(h60, "class", "svelte-gjbk59");
    			add_location(h60, file$b, 33, 12, 726);
    			add_location(hr1, file$b, 34, 12, 987);
    			add_location(br0, file$b, 34, 16, 991);
    			add_location(h41, file$b, 35, 12, 1008);
    			attr_dev(h61, "class", "svelte-gjbk59");
    			add_location(h61, file$b, 36, 12, 1038);
    			attr_dev(h62, "class", "svelte-gjbk59");
    			add_location(h62, file$b, 37, 12, 1122);
    			add_location(hr2, file$b, 42, 12, 2252);
    			add_location(br1, file$b, 42, 16, 2256);
    			add_location(h42, file$b, 43, 12, 2273);
    			attr_dev(h63, "class", "svelte-gjbk59");
    			add_location(h63, file$b, 44, 12, 2303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, h60, anchor);
    			append_dev(h60, t9);
    			append_dev(h60, t10);
    			append_dev(h60, t11);
    			append_dev(h60, t12);
    			append_dev(h60, t13);
    			append_dev(h60, t14);
    			append_dev(h60, t15);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, h61, anchor);
    			append_dev(h61, t20);
    			append_dev(h61, t21);
    			append_dev(h61, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, h62, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, hr2, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h42, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, h63, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pluginemoji*/ 2) set_data_dev(t0, /*pluginemoji*/ ctx[1]);
    			if (dirty & /*pluginname*/ 1) set_data_dev(t2, /*pluginname*/ ctx[0]);
    			if (dirty & /*parent*/ 4) set_data_dev(t10, /*parent*/ ctx[2]);
    			if (dirty & /*parent*/ 4) set_data_dev(t12, /*parent*/ ctx[2]);
    			if (dirty & /*parent*/ 4) set_data_dev(t14, /*parent*/ ctx[2]);
    			if (dirty & /*parent*/ 4) set_data_dev(t21, /*parent*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(h60);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(h61);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(h62);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(hr2);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h42);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(h63);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(28:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (27:6) <Row>
    function create_default_slot_5$1(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};

    			if (dirty & /*$$scope, parent, pluginname, pluginemoji*/ 71) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(27:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (51:19) <Button on:click={exitInfo} style="float: right;">
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Exit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(51:19) <Button on:click={exitInfo} style=\\\"float: right;\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:8) <Column>
    function create_default_slot_3$2(ctx) {
    	let br0;
    	let t0;
    	let span;
    	let button;
    	let t1;
    	let br1;
    	let current;

    	button = new Button({
    			props: {
    				style: "float: right;",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*exitInfo*/ ctx[3]);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			span = element("span");
    			create_component(button.$$.fragment);
    			t1 = space();
    			br1 = element("br");
    			add_location(br0, file$b, 49, 12, 2432);
    			add_location(span, file$b, 50, 13, 2450);
    			add_location(br1, file$b, 51, 13, 2540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(49:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (48:6) <Row>
    function create_default_slot_2$2(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(48:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (26:4) <Grid>
    function create_default_slot_1$3(ctx) {
    	let row0;
    	let t;
    	let row1;
    	let current;

    	row0 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t = space();
    			create_component(row1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(row1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};

    			if (dirty & /*$$scope, parent, pluginname, pluginemoji*/ 71) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(row1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(26:4) <Grid>",
    		ctx
    	});

    	return block;
    }

    // (25:0) <Content>
    function create_default_slot$3(ctx) {
    	let grid;
    	let current;

    	grid = new Grid({
    			props: {
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(grid.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const grid_changes = {};

    			if (dirty & /*$$scope, parent, pluginname, pluginemoji*/ 71) {
    				grid_changes.$$scope = { dirty, ctx };
    			}

    			grid.$set(grid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(grid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(25:0) <Content>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const content_changes = {};

    			if (dirty & /*$$scope, parent, pluginname, pluginemoji*/ 71) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);
    	let { pluginname } = $$props;
    	let { pluginemoji } = $$props;
    	let { parent } = $$props;
    	let open = true;
    	const dispatch = createEventDispatcher();

    	function exitInfo() {
    		dispatch("exitinfo");
    		open = false;
    	}

    	const writable_props = ['pluginname', 'pluginemoji', 'parent'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('pluginname' in $$props) $$invalidate(0, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(1, pluginemoji = $$props.pluginemoji);
    		if ('parent' in $$props) $$invalidate(2, parent = $$props.parent);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Button,
    		Content,
    		Grid,
    		Row,
    		Column,
    		pluginname,
    		pluginemoji,
    		parent,
    		open,
    		dispatch,
    		exitInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ('pluginname' in $$props) $$invalidate(0, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(1, pluginemoji = $$props.pluginemoji);
    		if ('parent' in $$props) $$invalidate(2, parent = $$props.parent);
    		if ('open' in $$props) open = $$props.open;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pluginname, pluginemoji, parent, exitInfo];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { pluginname: 0, pluginemoji: 1, parent: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pluginname*/ ctx[0] === undefined && !('pluginname' in props)) {
    			console.warn("<Info> was created without expected prop 'pluginname'");
    		}

    		if (/*pluginemoji*/ ctx[1] === undefined && !('pluginemoji' in props)) {
    			console.warn("<Info> was created without expected prop 'pluginemoji'");
    		}

    		if (/*parent*/ ctx[2] === undefined && !('parent' in props)) {
    			console.warn("<Info> was created without expected prop 'parent'");
    		}
    	}

    	get pluginname() {
    		throw new Error("<Info>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginname(value) {
    		throw new Error("<Info>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pluginemoji() {
    		throw new Error("<Info>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginemoji(value) {
    		throw new Error("<Info>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parent() {
    		throw new Error("<Info>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parent(value) {
    		throw new Error("<Info>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/settings.svelte generated by Svelte v3.49.0 */
    const file$a = "src/pages/settings.svelte";

    // (33:8) <Column>
    function create_default_slot_4$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let h5;
    	let t5;
    	let hr;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*pluginemoji*/ ctx[1]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*pluginname*/ ctx[0]);
    			t3 = space();
    			h5 = element("h5");
    			h5.textContent = "Plugin Settings";
    			t5 = space();
    			hr = element("hr");
    			set_style(h1, "text-align", "center");
    			add_location(h1, file$a, 33, 10, 601);
    			set_style(h2, "text-align", "center");
    			attr_dev(h2, "class", "svelte-ytnyfc");
    			add_location(h2, file$a, 34, 10, 660);
    			set_style(h5, "text-align", "center");
    			add_location(h5, file$a, 35, 10, 718);
    			add_location(hr, file$a, 36, 10, 779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pluginemoji*/ 2) set_data_dev(t0, /*pluginemoji*/ ctx[1]);
    			if (dirty & /*pluginname*/ 1) set_data_dev(t2, /*pluginname*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(33:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (32:6) <Row>
    function create_default_slot_3$1(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 67) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(32:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (31:4) <Grid>
    function create_default_slot_2$1(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 67) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(31:4) <Grid>",
    		ctx
    	});

    	return block;
    }

    // (41:4) <Row>
    function create_default_slot_1$2(ctx) {
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h4;

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "There are no specific settings available for this plugin";
    			add_location(br0, file$a, 41, 6, 843);
    			add_location(br1, file$a, 42, 6, 854);
    			add_location(h4, file$a, 43, 6, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h4, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(41:4) <Row>",
    		ctx
    	});

    	return block;
    }

    // (30:0) <Content>
    function create_default_slot$2(ctx) {
    	let grid;
    	let t;
    	let row;
    	let current;

    	grid = new Grid({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(grid.$$.fragment);
    			t = space();
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const grid_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 67) {
    				grid_changes.$$scope = { dirty, ctx };
    			}

    			grid.$set(grid_changes);
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(grid, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(30:0) <Content>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const content_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 67) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	let { pluginname } = $$props;
    	let { pluginemoji } = $$props;
    	let open = true;
    	const dispatch = createEventDispatcher();

    	function exitSettings() {
    		dispatch("exitsettings");
    		open = false;
    	}

    	function saveSettings() {
    		dispatch("savesettings");
    		dispatch("exitsettings");
    		open = false;
    	}

    	const writable_props = ['pluginname', 'pluginemoji'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('pluginname' in $$props) $$invalidate(0, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(1, pluginemoji = $$props.pluginemoji);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Button,
    		Content,
    		Grid,
    		Row,
    		Column,
    		pluginname,
    		pluginemoji,
    		open,
    		dispatch,
    		exitSettings,
    		saveSettings
    	});

    	$$self.$inject_state = $$props => {
    		if ('pluginname' in $$props) $$invalidate(0, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(1, pluginemoji = $$props.pluginemoji);
    		if ('open' in $$props) open = $$props.open;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pluginname, pluginemoji];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { pluginname: 0, pluginemoji: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pluginname*/ ctx[0] === undefined && !('pluginname' in props)) {
    			console.warn("<Settings> was created without expected prop 'pluginname'");
    		}

    		if (/*pluginemoji*/ ctx[1] === undefined && !('pluginemoji' in props)) {
    			console.warn("<Settings> was created without expected prop 'pluginemoji'");
    		}
    	}

    	get pluginname() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginname(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pluginemoji() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginemoji(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /** Dispatch event on click outside of node */
    function clickOutside(node) {
      
      const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
          node.dispatchEvent(
            new CustomEvent('click_outside', node)
          );
        }
      };

    	document.addEventListener('click', handleClick, true);
      
      return {
        destroy() {
          document.removeEventListener('click', handleClick, true);
        }
    	}
    }

    /* src/components/ColorPicker.svelte generated by Svelte v3.49.0 */
    const file$9 = "src/components/ColorPicker.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[29] = i;
    	return child_ctx;
    }

    // (140:0) {#if ddActive}
    function create_if_block$8(ctx) {
    	let div1;
    	let div0;
    	let div1_resize_listener;
    	let mounted;
    	let dispose;
    	let each_value = /*values*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "values-dropdown-grid svelte-aqz7y7");
    			add_location(div0, file$9, 141, 1, 3726);
    			attr_dev(div1, "class", "values-dropdown svelte-aqz7y7");
    			set_style(div1, "background-color", /*themecolor*/ ctx[2]);
    			set_style(div1, "color", /*themefont*/ ctx[3]);
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[22].call(div1));
    			toggle_class(div1, "top", /*top*/ ctx[5]);
    			add_location(div1, file$9, 140, 0, 3537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[22].bind(div1));

    			if (!mounted) {
    				dispose = [
    					action_destroyer(clickOutside.call(null, div1)),
    					listen_dev(div1, "click_outside", /*clickOutsideDropdown*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values, id, value, keyboardGridNav, changeValue*/ 25091) {
    				each_value = /*values*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*themecolor*/ 4) {
    				set_style(div1, "background-color", /*themecolor*/ ctx[2]);
    			}

    			if (dirty & /*themefont*/ 8) {
    				set_style(div1, "color", /*themefont*/ ctx[3]);
    			}

    			if (dirty & /*top*/ 32) {
    				toggle_class(div1, "top", /*top*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			div1_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(140:0) {#if ddActive}",
    		ctx
    	});

    	return block;
    }

    // (144:2) {#each val as innerValue, innerIndex}
    function create_each_block_1(ctx) {
    	let button;
    	let button_id_value;
    	let mounted;
    	let dispose;

    	function keydown_handler(...args) {
    		return /*keydown_handler*/ ctx[20](/*innerIndex*/ ctx[29], ...args);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[21](/*innerValue*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "id", button_id_value = "" + (/*id*/ ctx[1] + "-" + /*index*/ ctx[26] + "-" + /*innerIndex*/ ctx[29]));
    			set_style(button, "background", /*innerValue*/ ctx[27]);
    			attr_dev(button, "class", "color-block svelte-aqz7y7");
    			toggle_class(button, "active", /*innerValue*/ ctx[27] == /*value*/ ctx[0]);
    			add_location(button, file$9, 144, 3, 3834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "keydown", keydown_handler, false, false, false),
    					listen_dev(button, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*id*/ 2 && button_id_value !== (button_id_value = "" + (/*id*/ ctx[1] + "-" + /*index*/ ctx[26] + "-" + /*innerIndex*/ ctx[29]))) {
    				attr_dev(button, "id", button_id_value);
    			}

    			if (dirty & /*values, value*/ 513) {
    				toggle_class(button, "active", /*innerValue*/ ctx[27] == /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(144:2) {#each val as innerValue, innerIndex}",
    		ctx
    	});

    	return block;
    }

    // (143:1) {#each values as val, index}
    function create_each_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*val*/ ctx[24];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id, values, value, keyboardGridNav, changeValue*/ 25091) {
    				each_value_1 = /*val*/ ctx[24];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(143:1) {#each values as val, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div4;
    	let div3;
    	let button;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let button_resize_listener;
    	let t1;
    	let input;
    	let t2;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[16]);
    	let if_block = /*ddActive*/ ctx[6] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			button = element("button");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			set_style(div0, "background", /*value*/ ctx[0]);
    			attr_dev(div0, "class", "color-block svelte-aqz7y7");
    			add_location(div0, file$9, 131, 3, 3246);
    			attr_dev(div1, "class", "caret svelte-aqz7y7");
    			set_style(div1, "margin-right", ".2rem");
    			set_style(div1, "caret-color", /*themefont*/ ctx[3]);
    			toggle_class(div1, "top", /*top*/ ctx[5]);
    			add_location(div1, file$9, 132, 3, 3310);
    			set_style(div2, "display", "flex");
    			set_style(div2, "color", /*themefont*/ ctx[3]);
    			add_location(div2, file$9, 130, 2, 3196);
    			set_style(button, "background-color", /*themecolor*/ ctx[2]);
    			set_style(button, "color", /*themefont*/ ctx[3]);
    			attr_dev(button, "class", "select-color svelte-aqz7y7");
    			add_render_callback(() => /*button_elementresize_handler*/ ctx[17].call(button));
    			toggle_class(button, "fake-focus", /*ddActive*/ ctx[6]);
    			add_location(button, file$9, 129, 1, 3012);
    			set_style(input, "background-color", /*themecolor*/ ctx[2]);
    			set_style(input, "color", /*themefont*/ ctx[3]);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-aqz7y7");
    			add_location(input, file$9, 135, 1, 3425);
    			attr_dev(div3, "class", "color-picker-inner svelte-aqz7y7");
    			add_location(div3, file$9, 128, 0, 2976);
    			attr_dev(div4, "class", "color-picker-holder svelte-aqz7y7");
    			add_location(div4, file$9, 127, 0, 2942);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			button_resize_listener = add_resize_listener(button, /*button_elementresize_handler*/ ctx[17].bind(button));
    			append_dev(div3, t1);
    			append_dev(div3, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div4, t2);
    			if (if_block) if_block.m(div4, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handleKeydown*/ ctx[10], false, false, false),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[16]),
    					listen_dev(button, "click", /*click_handler*/ ctx[18], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[19])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) {
    				set_style(div0, "background", /*value*/ ctx[0]);
    			}

    			if (dirty & /*themefont*/ 8) {
    				set_style(div1, "caret-color", /*themefont*/ ctx[3]);
    			}

    			if (dirty & /*top*/ 32) {
    				toggle_class(div1, "top", /*top*/ ctx[5]);
    			}

    			if (dirty & /*themefont*/ 8) {
    				set_style(div2, "color", /*themefont*/ ctx[3]);
    			}

    			if (dirty & /*themecolor*/ 4) {
    				set_style(button, "background-color", /*themecolor*/ ctx[2]);
    			}

    			if (dirty & /*themefont*/ 8) {
    				set_style(button, "color", /*themefont*/ ctx[3]);
    			}

    			if (dirty & /*ddActive*/ 64) {
    				toggle_class(button, "fake-focus", /*ddActive*/ ctx[6]);
    			}

    			if (dirty & /*themecolor*/ 4) {
    				set_style(input, "background-color", /*themecolor*/ ctx[2]);
    			}

    			if (dirty & /*themefont*/ 8) {
    				set_style(input, "color", /*themefont*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*ddActive*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			button_resize_listener();
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorPicker', slots, []);
    	let { id = nid() } = $$props;
    	let { value = '#5E7ABC' } = $$props;
    	let { theme = "g10" } = $$props;

    	// Our color set
    	let values = [
    		['#DAAFE9', '#C7DBF5', '#AAD5FB', '#FDF0A4', '#F8D6A2'],
    		['#C47ADA', '#90BAEE', '#75BAFA', '#FBE66E', '#F5B969'],
    		['#AE44B7', '#5E7ABC', '#5E7ABC', '#EDBD4A', '#EC9740']
    	];

    	// Keyboard shortcut
    	let trigger = 'Escape';

    	function handleKeydown(e) {
    		if (e.key == trigger) {
    			$$invalidate(6, ddActive = false);
    		}
    	}

    	// Set background
    	let themecolor = "#E9E9E9";

    	let themefont = "#161616";

    	if (theme == "g10") {
    		themecolor = "#E9E9E9";
    		themefont = "#161616";
    	} else {
    		themecolor = "#4A4A4A";
    		themefont = "#F4F4F4";
    	}

    	let windowHeight;
    	let top;
    	let ddActive = false;
    	let ddHeight = 158;

    	// ddHeight is initially undefined so we can't get the correct values from binding; that's why we have a default
    	// todo render offscreen for .1sec to get the height automatically?
    	let inputHeight;

    	async function toggleDropdown(e) {
    		if (e.clientY + inputHeight < ddHeight || windowHeight - ddHeight - inputHeight - e.clientY > 0) {
    			$$invalidate(5, top = false);
    		} else {
    			$$invalidate(5, top = true);
    		}

    		$$invalidate(6, ddActive = !ddActive);
    		await tick();
    	}

    	function clickOutsideDropdown() {
    		$$invalidate(6, ddActive = false);
    	}

    	function changeValue(innerValue) {
    		$$invalidate(0, value = innerValue);
    		$$invalidate(6, ddActive = false);
    	}

    	function keyboardGridNav(e, index) {
    		const focussedElement = document.activeElement.id;
    		let myRow = parseInt(focussedElement.charAt(focussedElement.length - 3));
    		let myIndex = parseInt(focussedElement.charAt(focussedElement.length - 1));
    		let nextRow;
    		let prevRow;
    		let nextIndex;
    		let prevIndex;

    		switch (e.keyCode) {
    			case 37:
    				prevIndex = myIndex - 1;
    				if (prevIndex > -1) {
    					document.getElementById(id + '-' + myRow + '-' + prevIndex).focus();
    				}
    				break;
    			case 38:
    				prevRow = myRow - 1;
    				if (prevRow > -1) {
    					document.getElementById(id + '-' + prevRow + '-' + myIndex).focus();
    				}
    				break;
    			case 39:
    				nextIndex = myIndex + 1;
    				if (nextIndex < values[0].length) {
    					document.getElementById(id + '-' + myRow + '-' + nextIndex).focus();
    				}
    				break;
    			case 40:
    				nextRow = myRow + 1;
    				if (nextRow < values.length) {
    					document.getElementById(id + '-' + nextRow + '-' + myIndex).focus();
    				}
    				break;
    		}
    	}

    	const writable_props = ['id', 'value', 'theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(4, windowHeight = window.innerHeight);
    	}

    	function button_elementresize_handler() {
    		inputHeight = this.clientHeight;
    		$$invalidate(8, inputHeight);
    	}

    	const click_handler = e => toggleDropdown(e);

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const keydown_handler = (innerIndex, e) => keyboardGridNav(e);

    	const click_handler_1 = innerValue => {
    		changeValue(innerValue);
    	};

    	function div1_elementresize_handler() {
    		ddHeight = this.clientHeight;
    		$$invalidate(7, ddHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('theme' in $$props) $$invalidate(15, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		nid,
    		clickOutside,
    		tick,
    		onMount,
    		id,
    		value,
    		theme,
    		values,
    		trigger,
    		handleKeydown,
    		themecolor,
    		themefont,
    		windowHeight,
    		top,
    		ddActive,
    		ddHeight,
    		inputHeight,
    		toggleDropdown,
    		clickOutsideDropdown,
    		changeValue,
    		keyboardGridNav
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('theme' in $$props) $$invalidate(15, theme = $$props.theme);
    		if ('values' in $$props) $$invalidate(9, values = $$props.values);
    		if ('trigger' in $$props) trigger = $$props.trigger;
    		if ('themecolor' in $$props) $$invalidate(2, themecolor = $$props.themecolor);
    		if ('themefont' in $$props) $$invalidate(3, themefont = $$props.themefont);
    		if ('windowHeight' in $$props) $$invalidate(4, windowHeight = $$props.windowHeight);
    		if ('top' in $$props) $$invalidate(5, top = $$props.top);
    		if ('ddActive' in $$props) $$invalidate(6, ddActive = $$props.ddActive);
    		if ('ddHeight' in $$props) $$invalidate(7, ddHeight = $$props.ddHeight);
    		if ('inputHeight' in $$props) $$invalidate(8, inputHeight = $$props.inputHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		id,
    		themecolor,
    		themefont,
    		windowHeight,
    		top,
    		ddActive,
    		ddHeight,
    		inputHeight,
    		values,
    		handleKeydown,
    		toggleDropdown,
    		clickOutsideDropdown,
    		changeValue,
    		keyboardGridNav,
    		theme,
    		onwindowresize,
    		button_elementresize_handler,
    		click_handler,
    		input_input_handler,
    		keydown_handler,
    		click_handler_1,
    		div1_elementresize_handler
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { id: 1, value: 0, theme: 15 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get id() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    function e(e,o,n,i){return new(n||(n=Promise))((function(a,r){function t(e){try{m(i.next(e));}catch(e){r(e);}}function s(e){try{m(i.throw(e));}catch(e){r(e);}}function m(e){var o;e.done?a(e.value):(o=e.value,o instanceof n?o:new n((function(e){e(o);}))).then(t,s);}m((i=i.apply(e,o||[])).next());}))}!function(e,o){void 0===o&&(o={});var n=o.insertAt;if(e&&"undefined"!=typeof document){var i=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css","top"===n&&i.firstChild?i.insertBefore(a,i.firstChild):i.appendChild(a),a.styleSheet?a.styleSheet.cssText=e:a.appendChild(document.createTextNode(e));}}('@keyframes show {\n  0% {\n    opacity: 0;\n    transform: scale3d(0.8, 0.8, 0.8);\n  }\n\n  50% {\n    transform: scale3d(1.05, 1.05, 1.05);\n  }\n\n  100% {\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n@keyframes hide {\n  0% {\n    opacity: 1;\n    transform: scale3d(1, 1, 1);\n  }\n\n  100% {\n    opacity: 0;\n    transform: scale3d(0.8, 0.8, 0.8);\n  }\n}\n\n@keyframes grow {\n  0% {\n    opacity: 0;\n    transform: scale3d(0.8, 0.8, 0.8); \n  }\n\n  100% { \n    opacity: 1;\n    transform: scale3d(1, 1, 1); \n  }\n}\n\n@keyframes shrink {\n  0% { \n    opacity: 1;\n    transform: scale3d(1, 1, 1);\n  }\n\n  100% { \n    opacity: 0;\n    transform: scale3d(0.8, 0.8, 0.8); \n  }\n}\n\n@keyframes fade-in {\n  0% { opacity: 0; }\n  100% { opacity: 1; }\n}\n\n@keyframes fade-out {\n  0% { opacity: 1; }\n  100% { opacity: 0; }\n}\n\n.emoji-picker {\n  --animation-duration: 0.2s;\n  --animation-easing: ease-in-out;\n\n  --emoji-size: 1.8em;\n  --emoji-size-multiplier: 1.5;\n  --emoji-preview-size: 2em;\n  --emoji-per-row: 8;\n  --row-count: 6;\n\n  --content-height: calc((var(--emoji-size) * var(--emoji-size-multiplier)) * var(--row-count) + var(--category-name-size) + var(--category-button-height) + 0.5em);\n\n  --category-name-size: 0.85em;\n\n  --category-button-height: 2em;\n  --category-button-size: 1.1em;\n  --category-border-bottom-size: 4px;\n\n  --focus-indicator-color: #999999;\n\n  --search-height: 2em;\n\n  --blue-color: #4F81E5;\n\n  --border-color: #CCCCCC;\n  --background-color: #FFFFFF;\n  --text-color: #000000;\n  --secondary-text-color: #666666;\n  --hover-color: #E8F4F9;\n  --search-focus-border-color: var(--blue-color);\n  --search-icon-color: #CCCCCC;\n  --overlay-background-color: rgba(0, 0, 0, 0.8);\n  --popup-background-color: #FFFFFF;\n  --category-button-color: #666666;\n  --category-button-active-color: var(--blue-color);\n\n  --dark-border-color: #666666;\n  --dark-background-color: #333333;\n  --dark-text-color: #FFFFFF;\n  --dark-secondary-text-color: #999999;\n  --dark-hover-color: #666666;\n  --dark-search-background-color: #666666;\n  --dark-search-border-color: #999999;\n  --dark-search-placeholder-color: #999999;\n  --dark-search-focus-border-color: #DBE5F9;\n  --dark-popup-background-color: #333333;\n  --dark-category-button-color: #FFFFFF;\n\n  --font: Arial, Helvetica, sans-serif;\n  --font-size: 16px;\n}\n\n.emoji-picker {\n  font-size: var(--font-size);\n  border: 1px solid var(--border-color);\n  border-radius: 5px;\n  background: var(--background-color);\n  width: calc(var(--emoji-per-row) * var(--emoji-size) * var(--emoji-size-multiplier) + 1em + 1.5rem);\n  font-family: var(--font);\n  overflow: hidden;\n  animation: show var(--animation-duration) var(--animation-easing);\n}\n\n.emoji-picker * {\n  font-family: var(--font);\n  box-sizing: content-box;\n}\n\n.emoji-picker__overlay {\n  background: rgba(0, 0, 0, 0.75);\n  z-index: 1000;\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n\n.emoji-picker.hiding {\n  animation: hide var(--animation-duration) var(--animation-easing);\n}\n\n.emoji-picker.dark {\n  background: var(--dark-background-color);\n  color: var(--dark-text-color);\n  border-color: var(--dark-border-color);\n}\n\n.emoji-picker__content {\n  padding: 0.5em;\n  height: var(--content-height);\n  position: relative;\n}\n\n.emoji-picker__preview {\n  height: var(--emoji-preview-size);\n  padding: 0.5em;\n  border-top: 1px solid var(--border-color);\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n}\n\n.emoji-picker.dark .emoji-picker__preview {\n  border-top-color: var(--dark-border-color);\n}\n\n.emoji-picker__preview-emoji {\n  font-size: var(--emoji-preview-size);\n  margin-right: 0.25em;\n  font-family: "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji";\n}\n\n.emoji-picker__preview-emoji img.emoji {\n  height: 1em;\n  width: 1em;\n  margin: 0 .05em 0 .1em;\n  vertical-align: -0.1em;\n}\n\n.emoji-picker__preview-name {\n  color: var(--text-color);\n  font-size: 0.85em;\n  overflow-wrap: break-word;\n  word-break: break-all;\n}\n\n.emoji-picker.dark .emoji-picker__preview-name {\n  color: var(--dark-text-color);\n}\n\n.emoji-picker__container {\n  display: grid;\n  justify-content: center;\n  grid-template-columns: repeat(var(--emoji-per-row), calc(var(--emoji-size) * var(--emoji-size-multiplier)));\n  grid-auto-rows: calc(var(--emoji-size) * var(--emoji-size-multiplier));\n}\n\n.emoji-picker__container.search-results {\n  height: var(--content-height);\n  overflow-y: auto;\n}\n\n.emoji-picker__custom-emoji {\n  width: 1em;\n  height: 1em;\n}\n\n.emoji-picker__emoji {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  overflow: hidden;\n  font-size: var(--emoji-size);\n  width: 1.5em;\n  height: 1.5em;\n  padding: 0;\n  margin: 0;\n  outline: none;\n  font-family: "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji";\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.emoji-picker__emoji img.emoji {\n  height: 1em;\n  width: 1em;\n  margin: 0 .05em 0 .1em;\n  vertical-align: -0.1em;\n}\n\n.emoji-picker__emoji:focus, .emoji-picker__emoji:hover {\n  background: var(--hover-color);\n}\n\n.emoji-picker__emoji:focus {\n  outline: 1px dotted var(--focus-indicator-color);\n}\n\n.emoji-picker.dark .emoji-picker__emoji:focus, .emoji-picker.dark .emoji-picker__emoji:hover {\n  background: var(--dark-hover-color);\n}\n\n.emoji-picker__plugin-container {\n  margin: 0.5em;\n  display: flex;\n  flex-direction: row;\n}\n\n.emoji-picker__search-container {\n  margin: 0.5em;\n  position: relative;\n  height: var(--search-height);\n  display: flex;\n}\n\n.emoji-picker__search {\n  box-sizing: border-box;\n  width: 100%;\n  border-radius: 3px;\n  border: 1px solid var(--border-color);\n  padding-right: 2em;\n  padding: 0.5em 2.25em 0.5em 0.5em;\n  font-size: 0.85em;\n  outline: none;\n}\n\n.emoji-picker.dark .emoji-picker__search {\n  background: var(--dark-search-background-color);\n  color: var(--dark-text-color);\n  border-color: var(--dark-search-border-color);\n}\n\n.emoji-picker.dark .emoji-picker__search::placeholder {\n  color: var(--dark-search-placeholder-color);\n}\n\n.emoji-picker__search:focus {\n  border: 1px solid var(--search-focus-border-color);\n}\n\n.emoji-picker.dark .emoji-picker__search:focus {\n  border-color: var(--dark-search-focus-border-color);\n}\n\n.emoji-picker__search-icon {\n  position: absolute;\n  color: var(--search-icon-color);\n  width: 1em;\n  height: 1em;\n  right: 0.75em;\n  top: calc(50% - 0.5em);\n}\n\n.emoji-picker__search-icon img {\n  width: 1em;\n  height: 1em;\n}\n\n.emoji-picker__search-not-found {\n  color: var(--secondary-text-color);\n  text-align: center;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}\n\n.emoji-picker__search-not-found h2 {\n  color: var(--secondary-text-color);\n}\n\n.emoji-picker.dark .emoji-picker__search-not-found {\n  color: var(--dark-secondary-text-color);\n}\n\n.emoji-picker.dark .emoji-picker__search-not-found h2 {\n  color: var(--dark-secondary-text-color);\n}\n\n.emoji-picker__search-not-found-icon {\n  font-size: 3em;\n}\n\n.emoji-picker__search-not-found-icon img {\n  width: 1em;\n  height: 1em;\n}\n\n.emoji-picker__search-not-found h2 {\n  margin: 0.5em 0;\n  font-size: 1em;\n}\n\n.emoji-picker__variant-overlay {\n  background: var(--overlay-background-color);\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  border-radius: 5px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  animation: fade-in var(--animation-duration) var(--animation-easing);\n}\n\n.emoji-picker__variant-overlay.hiding {\n  animation: fade-out var(--animation-duration) var(--animation-easing);\n}\n\n.emoji-picker__variant-popup {\n  background: var(--popup-background-color);\n  margin: 0.5em;\n  padding: 0.5em;\n  text-align: center;\n  border-radius: 5px;\n  animation: grow var(--animation-duration) var(--animation-easing);\n  user-select: none;\n}\n\n.emoji-picker__variant-overlay.hiding .emoji-picker__variant-popup {\n  animation: shrink var(--animation-duration) var(--animation-easing);\n}\n\n.emoji-picker.dark .emoji-picker__variant-popup {\n  background: var(--dark-popup-background-color);\n}\n\n.emoji-picker__emojis {\n  overflow-y: auto;\n  position: relative;\n  height: calc((var(--emoji-size) * var(--emoji-size-multiplier)) * var(--row-count) + var(--category-name-size));\n}\n\n.emoji-picker__emojis.hiding {\n  animation: fade-out 0.05s var(--animation-easing);\n}\n\n.emoji-picker__emojis h2.emoji-picker__category-name {\n  font-size: 0.85em;\n  color: var(--secondary-text-color);\n  text-transform: uppercase;\n  margin: 0.25em 0;\n  text-align: left;\n}\n\n.emoji-picker.dark h2.emoji-picker__category-name {\n  color: var(--dark-secondary-text-color);\n}\n\n.emoji-picker__category-buttons {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-around;\n  height: var(--category-button-height);\n  margin-bottom: 0.5em;\n}\n\nbutton.emoji-picker__category-button {\n  flex-grow: 1;\n  background: transparent;\n  padding: 0;\n  border: none;\n  cursor: pointer;\n  font-size: var(--category-button-size);\n  vertical-align: middle;\n  color: var(--category-button-color);\n  border-bottom: var(--category-border-bottom-size) solid transparent;\n  outline: none;\n}\n\nbutton.emoji-picker__category-button img {\n  width: var(--category-button-size);\n  height: var(--category-button-size);\n}\n\n.emoji-picker.keyboard button.emoji-picker__category-button:focus {\n  outline: 1px dotted var(--focus-indicator-color);\n}\n\n.emoji-picker.dark button.emoji-picker__category-button.active {\n  color: var(--category-button-active-color);\n}\n\n.emoji-picker.dark button.emoji-picker__category-button {\n  color: var(--dark-category-button-color);\n}\n\nbutton.emoji-picker__category-button.active {\n  color: var(--category-button-active-color);\n  border-bottom: var(--category-border-bottom-size) solid var(--category-button-active-color);\n}\n\n@media (prefers-color-scheme: dark) {\n  .emoji-picker.auto {\n    background: var(--dark-background-color);\n    color: var(--dark-text-color);\n    border-color: var(--dark-border-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__preview {\n    border-top-color: var(--dark-border-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__preview-name {\n    color: var(--dark-text-color);\n  }\n\n  .emoji-picker.auto button.emoji-picker__category-button {\n    color: var(--dark-category-button-color);\n  }\n\n  .emoji-picker.auto button.emoji-picker__category-button.active {\n    color: var(--category-button-active-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__emoji:focus, .emoji-picker.auto .emoji-picker__emoji:hover {\n    background: var(--dark-hover-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__search {\n    background: var(--dark-search-background-color);\n    color: var(--dark-text-color);\n    border-color: var(--dark-search-border-color);\n  }\n \n  .emoji-picker.auto h2.emoji-picker__category-name {\n    color: var(--dark-secondary-text-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__search::placeholder {\n    color: var(--dark-search-placeholder-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__search:focus {\n    border-color: var(--dark-search-focus-border-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__search-not-found {\n    color: var(--dark-secondary-text-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__search-not-found h2 {\n    color: var(--dark-secondary-text-color);\n  }\n\n  .emoji-picker.auto .emoji-picker__variant-popup {\n    background: var(--dark-popup-background-color);\n  }\n}');var o=["input","select","textarea","a[href]","button","[tabindex]","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])'],n=o.join(","),i="undefined"==typeof Element?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector;function a(e,o){o=o||{};var a,t,s,d=[],g=[],u=e.querySelectorAll(n);for(o.includeContainer&&i.call(e,n)&&(u=Array.prototype.slice.apply(u)).unshift(e),a=0;a<u.length;a++)r(t=u[a])&&(0===(s=m(t))?d.push(t):g.push({documentOrder:a,tabIndex:s,node:t}));return g.sort(c).map((function(e){return e.node})).concat(d)}function r(e){return !(!t(e)||function(e){return function(e){return d(e)&&"radio"===e.type}(e)&&!function(e){if(!e.name)return !0;var o=function(e){for(var o=0;o<e.length;o++)if(e[o].checked)return e[o]}(e.ownerDocument.querySelectorAll('input[type="radio"][name="'+e.name+'"]'));return !o||o===e}(e)}(e)||m(e)<0)}function t(e){return !(e.disabled||function(e){return d(e)&&"hidden"===e.type}(e)||function(e){return null===e.offsetParent||"hidden"===getComputedStyle(e).visibility}(e))}a.isTabbable=function(e){if(!e)throw new Error("No node provided");return !1!==i.call(e,n)&&r(e)},a.isFocusable=function(e){if(!e)throw new Error("No node provided");return !1!==i.call(e,s)&&t(e)};var s=o.concat("iframe").join(",");function m(e){var o=parseInt(e.getAttribute("tabindex"),10);return isNaN(o)?function(e){return "true"===e.contentEditable}(e)?0:e.tabIndex:o}function c(e,o){return e.tabIndex===o.tabIndex?e.documentOrder-o.documentOrder:e.tabIndex-o.tabIndex}function d(e){return "INPUT"===e.tagName}var g,u=a,l=function(){for(var e={},o=0;o<arguments.length;o++){var n=arguments[o];for(var i in n)v.call(n,i)&&(e[i]=n[i]);}return e},v=Object.prototype.hasOwnProperty;var y,f=(y=[],{activateTrap:function(e){if(y.length>0){var o=y[y.length-1];o!==e&&o.pause();}var n=y.indexOf(e);-1===n||y.splice(n,1),y.push(e);},deactivateTrap:function(e){var o=y.indexOf(e);-1!==o&&y.splice(o,1),y.length>0&&y[y.length-1].unpause();}});function j(e){return setTimeout(e,0)}var h=function(e,o){var n=document,i="string"==typeof e?n.querySelector(e):e,a=l({returnFocusOnDeactivate:!0,escapeDeactivates:!0},o),r={firstTabbableNode:null,lastTabbableNode:null,nodeFocusedBeforeActivation:null,mostRecentlyFocusedNode:null,active:!1,paused:!1},t={activate:function(e){if(r.active)return;w(),r.active=!0,r.paused=!1,r.nodeFocusedBeforeActivation=n.activeElement;var o=e&&e.onActivate?e.onActivate:a.onActivate;o&&o();return m(),t},deactivate:s,pause:function(){if(r.paused||!r.active)return;r.paused=!0,c();},unpause:function(){if(!r.paused||!r.active)return;r.paused=!1,w(),m();}};return t;function s(e){if(r.active){clearTimeout(g),c(),r.active=!1,r.paused=!1,f.deactivateTrap(t);var o=e&&void 0!==e.onDeactivate?e.onDeactivate:a.onDeactivate;return o&&o(),(e&&void 0!==e.returnFocus?e.returnFocus:a.returnFocusOnDeactivate)&&j((function(){var e;k((e=r.nodeFocusedBeforeActivation,d("setReturnFocus")||e));})),t}}function m(){if(r.active)return f.activateTrap(t),g=j((function(){k(v());})),n.addEventListener("focusin",h,!0),n.addEventListener("mousedown",y,{capture:!0,passive:!1}),n.addEventListener("touchstart",y,{capture:!0,passive:!1}),n.addEventListener("click",b,{capture:!0,passive:!1}),n.addEventListener("keydown",p,{capture:!0,passive:!1}),t}function c(){if(r.active)return n.removeEventListener("focusin",h,!0),n.removeEventListener("mousedown",y,!0),n.removeEventListener("touchstart",y,!0),n.removeEventListener("click",b,!0),n.removeEventListener("keydown",p,!0),t}function d(e){var o=a[e],i=o;if(!o)return null;if("string"==typeof o&&!(i=n.querySelector(o)))throw new Error("`"+e+"` refers to no known node");if("function"==typeof o&&!(i=o()))throw new Error("`"+e+"` did not return a node");return i}function v(){var e;if(!(e=null!==d("initialFocus")?d("initialFocus"):i.contains(n.activeElement)?n.activeElement:r.firstTabbableNode||d("fallbackFocus")))throw new Error("Your focus-trap needs to have at least one focusable element");return e}function y(e){i.contains(e.target)||(a.clickOutsideDeactivates?s({returnFocus:!u.isFocusable(e.target)}):a.allowOutsideClick&&a.allowOutsideClick(e)||e.preventDefault());}function h(e){i.contains(e.target)||e.target instanceof Document||(e.stopImmediatePropagation(),k(r.mostRecentlyFocusedNode||v()));}function p(e){if(!1!==a.escapeDeactivates&&function(e){return "Escape"===e.key||"Esc"===e.key||27===e.keyCode}(e))return e.preventDefault(),void s();(function(e){return "Tab"===e.key||9===e.keyCode})(e)&&function(e){if(w(),e.shiftKey&&e.target===r.firstTabbableNode)return e.preventDefault(),void k(r.lastTabbableNode);if(!e.shiftKey&&e.target===r.lastTabbableNode)e.preventDefault(),k(r.firstTabbableNode);}(e);}function b(e){a.clickOutsideDeactivates||i.contains(e.target)||a.allowOutsideClick&&a.allowOutsideClick(e)||(e.preventDefault(),e.stopImmediatePropagation());}function w(){var e=u(i);r.firstTabbableNode=e[0]||v(),r.lastTabbableNode=e[e.length-1]||v();}function k(e){e!==n.activeElement&&(e&&e.focus?(e.focus(),r.mostRecentlyFocusedNode=e,function(e){return e.tagName&&"input"===e.tagName.toLowerCase()&&"function"==typeof e.select}(e)&&e.select()):k(v()));}};function p(){}p.prototype={on:function(e,o,n){var i=this.e||(this.e={});return (i[e]||(i[e]=[])).push({fn:o,ctx:n}),this},once:function(e,o,n){var i=this;function a(){i.off(e,a),o.apply(n,arguments);}return a._=o,this.on(e,a,n)},emit:function(e){for(var o=[].slice.call(arguments,1),n=((this.e||(this.e={}))[e]||[]).slice(),i=0,a=n.length;i<a;i++)n[i].fn.apply(n[i].ctx,o);return this},off:function(e,o){var n=this.e||(this.e={}),i=n[e],a=[];if(i&&o)for(var r=0,t=i.length;r<t;r++)i[r].fn!==o&&i[r].fn._!==o&&a.push(i[r]);return a.length?n[e]=a:delete n[e],this}};var b=p;function w(e){var o=e.getBoundingClientRect();return {width:o.width,height:o.height,top:o.top,right:o.right,bottom:o.bottom,left:o.left,x:o.left,y:o.top}}function k(e){if("[object Window]"!==e.toString()){var o=e.ownerDocument;return o?o.defaultView:window}return e}function x(e){var o=k(e);return {scrollLeft:o.pageXOffset,scrollTop:o.pageYOffset}}function C(e){return e instanceof k(e).Element||e instanceof Element}function E(e){return e instanceof k(e).HTMLElement||e instanceof HTMLElement}function _(e){return e?(e.nodeName||"").toLowerCase():null}function z(e){return (C(e)?e.ownerDocument:e.document).documentElement}function O(e){return w(z(e)).left+x(e).scrollLeft}function I(e){return k(e).getComputedStyle(e)}function S(e){var o=I(e),n=o.overflow,i=o.overflowX,a=o.overflowY;return /auto|scroll|overlay|hidden/.test(n+a+i)}function P(e,o,n){void 0===n&&(n=!1);var i,a,r=z(o),t=w(e),s={scrollLeft:0,scrollTop:0},m={x:0,y:0};return n||(("body"!==_(o)||S(r))&&(s=(i=o)!==k(i)&&E(i)?{scrollLeft:(a=i).scrollLeft,scrollTop:a.scrollTop}:x(i)),E(o)?((m=w(o)).x+=o.clientLeft,m.y+=o.clientTop):r&&(m.x=O(r))),{x:t.left+s.scrollLeft-m.x,y:t.top+s.scrollTop-m.y,width:t.width,height:t.height}}function M(e){return {x:e.offsetLeft,y:e.offsetTop,width:e.offsetWidth,height:e.offsetHeight}}function A(e){return "html"===_(e)?e:e.assignedSlot||e.parentNode||e.host||z(e)}function L(e){return ["html","body","#document"].indexOf(_(e))>=0?e.ownerDocument.body:E(e)&&S(e)?e:L(A(e))}function T(e,o){void 0===o&&(o=[]);var n=L(e),i="body"===_(n),a=k(n),r=i?[a].concat(a.visualViewport||[],S(n)?n:[]):n,t=o.concat(r);return i?t:t.concat(T(A(r)))}function N(e){return ["table","td","th"].indexOf(_(e))>=0}function F(e){return E(e)&&"fixed"!==I(e).position?e.offsetParent:null}function B(e){for(var o=k(e),n=F(e);n&&N(n);)n=F(n);return n&&"body"===_(n)&&"static"===I(n).position?o:n||o}p.TinyEmitter=b;var D="top",R="bottom",q="right",V="left",H=[D,R,q,V],U=H.reduce((function(e,o){return e.concat([o+"-start",o+"-end"])}),[]),W=[].concat(H,["auto"]).reduce((function(e,o){return e.concat([o,o+"-start",o+"-end"])}),[]),K=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function J(e){var o=new Map,n=new Set,i=[];function a(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var i=o.get(e);i&&a(i);}})),i.push(e);}return e.forEach((function(e){o.set(e.name,e);})),e.forEach((function(e){n.has(e.name)||a(e);})),i}function G(e){return e.split("-")[0]}var X={placement:"bottom",modifiers:[],strategy:"absolute"};function Y(){for(var e=arguments.length,o=new Array(e),n=0;n<e;n++)o[n]=arguments[n];return !o.some((function(e){return !(e&&"function"==typeof e.getBoundingClientRect)}))}function $(e){void 0===e&&(e={});var o=e,n=o.defaultModifiers,i=void 0===n?[]:n,a=o.defaultOptions,r=void 0===a?X:a;return function(e,o,n){void 0===n&&(n=r);var a,t,s={placement:"bottom",orderedModifiers:[],options:Object.assign({},X,{},r),modifiersData:{},elements:{reference:e,popper:o},attributes:{},styles:{}},m=[],c=!1,d={state:s,setOptions:function(n){g(),s.options=Object.assign({},r,{},s.options,{},n),s.scrollParents={reference:C(e)?T(e):e.contextElement?T(e.contextElement):[],popper:T(o)};var a,t,c=function(e){var o=J(e);return K.reduce((function(e,n){return e.concat(o.filter((function(e){return e.phase===n})))}),[])}((a=[].concat(i,s.options.modifiers),t=a.reduce((function(e,o){var n=e[o.name];return e[o.name]=n?Object.assign({},n,{},o,{options:Object.assign({},n.options,{},o.options),data:Object.assign({},n.data,{},o.data)}):o,e}),{}),Object.keys(t).map((function(e){return t[e]}))));return s.orderedModifiers=c.filter((function(e){return e.enabled})),s.orderedModifiers.forEach((function(e){var o=e.name,n=e.options,i=void 0===n?{}:n,a=e.effect;if("function"==typeof a){var r=a({state:s,name:o,instance:d,options:i}),t=function(){};m.push(r||t);}})),d.update()},forceUpdate:function(){if(!c){var e=s.elements,o=e.reference,n=e.popper;if(Y(o,n)){s.rects={reference:P(o,B(n),"fixed"===s.options.strategy),popper:M(n)},s.reset=!1,s.placement=s.options.placement,s.orderedModifiers.forEach((function(e){return s.modifiersData[e.name]=Object.assign({},e.data)}));for(var i=0;i<s.orderedModifiers.length;i++)if(!0!==s.reset){var a=s.orderedModifiers[i],r=a.fn,t=a.options,m=void 0===t?{}:t,g=a.name;"function"==typeof r&&(s=r({state:s,options:m,name:g,instance:d})||s);}else s.reset=!1,i=-1;}}},update:(a=function(){return new Promise((function(e){d.forceUpdate(),e(s);}))},function(){return t||(t=new Promise((function(e){Promise.resolve().then((function(){t=void 0,e(a());}));}))),t}),destroy:function(){g(),c=!0;}};if(!Y(e,o))return d;function g(){m.forEach((function(e){return e()})),m=[];}return d.setOptions(n).then((function(e){!c&&n.onFirstUpdate&&n.onFirstUpdate(e);})),d}}var Z={passive:!0};function Q(e){return e.split("-")[1]}function ee(e){return ["top","bottom"].indexOf(e)>=0?"x":"y"}function oe(e){var o,n=e.reference,i=e.element,a=e.placement,r=a?G(a):null,t=a?Q(a):null,s=n.x+n.width/2-i.width/2,m=n.y+n.height/2-i.height/2;switch(r){case D:o={x:s,y:n.y-i.height};break;case R:o={x:s,y:n.y+n.height};break;case q:o={x:n.x+n.width,y:m};break;case V:o={x:n.x-i.width,y:m};break;default:o={x:n.x,y:n.y};}var c=r?ee(r):null;if(null!=c){var d="y"===c?"height":"width";switch(t){case"start":o[c]=Math.floor(o[c])-Math.floor(n[d]/2-i[d]/2);break;case"end":o[c]=Math.floor(o[c])+Math.ceil(n[d]/2-i[d]/2);}}return o}var ne={top:"auto",right:"auto",bottom:"auto",left:"auto"};function ie(e){var o,n=e.popper,i=e.popperRect,a=e.placement,r=e.offsets,t=e.position,s=e.gpuAcceleration,m=e.adaptive,c=function(e){var o=e.x,n=e.y,i=window.devicePixelRatio||1;return {x:Math.round(o*i)/i||0,y:Math.round(n*i)/i||0}}(r),d=c.x,g=c.y,u=r.hasOwnProperty("x"),l=r.hasOwnProperty("y"),v=V,y=D,f=window;if(m){var j=B(n);j===k(n)&&(j=z(n)),a===D&&(y=R,g-=j.clientHeight-i.height,g*=s?1:-1),a===V&&(v=q,d-=j.clientWidth-i.width,d*=s?1:-1);}var h,p=Object.assign({position:t},m&&ne);return s?Object.assign({},p,((h={})[y]=l?"0":"",h[v]=u?"0":"",h.transform=(f.devicePixelRatio||1)<2?"translate("+d+"px, "+g+"px)":"translate3d("+d+"px, "+g+"px, 0)",h)):Object.assign({},p,((o={})[y]=l?g+"px":"",o[v]=u?d+"px":"",o.transform="",o))}var ae={left:"right",right:"left",bottom:"top",top:"bottom"};function re(e){return e.replace(/left|right|bottom|top/g,(function(e){return ae[e]}))}var te={start:"end",end:"start"};function se(e){return e.replace(/start|end/g,(function(e){return te[e]}))}function me(e){return parseFloat(e)||0}function ce(e){var o=k(e),n=function(e){var o=E(e)?I(e):{};return {top:me(o.borderTopWidth),right:me(o.borderRightWidth),bottom:me(o.borderBottomWidth),left:me(o.borderLeftWidth)}}(e),i="html"===_(e),a=O(e),r=e.clientWidth+n.right,t=e.clientHeight+n.bottom;return i&&o.innerHeight-e.clientHeight>50&&(t=o.innerHeight-n.bottom),{top:i?0:e.clientTop,right:e.clientLeft>n.left?n.right:i?o.innerWidth-r-a:e.offsetWidth-r,bottom:i?o.innerHeight-t:e.offsetHeight-t,left:i?a:e.clientLeft}}function de(e,o){var n=Boolean(o.getRootNode&&o.getRootNode().host);if(e.contains(o))return !0;if(n){var i=o;do{if(i&&e.isSameNode(i))return !0;i=i.parentNode||i.host;}while(i)}return !1}function ge(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function ue(e,o){return "viewport"===o?ge(function(e){var o=k(e),n=o.visualViewport,i=o.innerWidth,a=o.innerHeight;return n&&/iPhone|iPod|iPad/.test(navigator.platform)&&(i=n.width,a=n.height),{width:i,height:a,x:0,y:0}}(e)):E(o)?w(o):ge(function(e){var o=k(e),n=x(e),i=P(z(e),o);return i.height=Math.max(i.height,o.innerHeight),i.width=Math.max(i.width,o.innerWidth),i.x=-n.scrollLeft,i.y=-n.scrollTop,i}(z(e)))}function le(e,o,n){var i="clippingParents"===o?function(e){var o=T(e),n=["absolute","fixed"].indexOf(I(e).position)>=0&&E(e)?B(e):e;return C(n)?o.filter((function(e){return C(e)&&de(e,n)})):[]}(e):[].concat(o),a=[].concat(i,[n]),r=a[0],t=a.reduce((function(o,n){var i=ue(e,n),a=ce(E(n)?n:z(e));return o.top=Math.max(i.top+a.top,o.top),o.right=Math.min(i.right-a.right,o.right),o.bottom=Math.min(i.bottom-a.bottom,o.bottom),o.left=Math.max(i.left+a.left,o.left),o}),ue(e,r));return t.width=t.right-t.left,t.height=t.bottom-t.top,t.x=t.left,t.y=t.top,t}function ve(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},{},e)}function ye(e,o){return o.reduce((function(o,n){return o[n]=e,o}),{})}function fe(e,o){void 0===o&&(o={});var n=o,i=n.placement,a=void 0===i?e.placement:i,r=n.boundary,t=void 0===r?"clippingParents":r,s=n.rootBoundary,m=void 0===s?"viewport":s,c=n.elementContext,d=void 0===c?"popper":c,g=n.altBoundary,u=void 0!==g&&g,l=n.padding,v=void 0===l?0:l,y=ve("number"!=typeof v?v:ye(v,H)),f="popper"===d?"reference":"popper",j=e.elements.reference,h=e.rects.popper,p=e.elements[u?f:d],b=le(C(p)?p:p.contextElement||z(e.elements.popper),t,m),k=w(j),x=oe({reference:k,element:h,strategy:"absolute",placement:a}),E=ge(Object.assign({},h,{},x)),_="popper"===d?E:k,O={top:b.top-_.top+y.top,bottom:_.bottom-b.bottom+y.bottom,left:b.left-_.left+y.left,right:_.right-b.right+y.right},I=e.modifiersData.offset;if("popper"===d&&I){var S=I[a];Object.keys(O).forEach((function(e){var o=[q,R].indexOf(e)>=0?1:-1,n=[D,R].indexOf(e)>=0?"y":"x";O[e]+=S[n]*o;}));}return O}function je(e,o){void 0===o&&(o={});var n=o,i=n.placement,a=n.boundary,r=n.rootBoundary,t=n.padding,s=n.flipVariations,m=n.allowedAutoPlacements,c=void 0===m?W:m,d=Q(i),g=(d?s?U:U.filter((function(e){return Q(e)===d})):H).filter((function(e){return c.indexOf(e)>=0})).reduce((function(o,n){return o[n]=fe(e,{placement:n,boundary:a,rootBoundary:r,padding:t})[G(n)],o}),{});return Object.keys(g).sort((function(e,o){return g[e]-g[o]}))}function he(e,o,n){return Math.max(e,Math.min(o,n))}function pe(e,o,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-o.height-n.y,right:e.right-o.width+n.x,bottom:e.bottom-o.height+n.y,left:e.left-o.width-n.x}}function be(e){return [D,q,R,V].some((function(o){return e[o]>=0}))}var we=$({defaultModifiers:[{name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var o=e.state,n=e.instance,i=e.options,a=i.scroll,r=void 0===a||a,t=i.resize,s=void 0===t||t,m=k(o.elements.popper),c=[].concat(o.scrollParents.reference,o.scrollParents.popper);return r&&c.forEach((function(e){e.addEventListener("scroll",n.update,Z);})),s&&m.addEventListener("resize",n.update,Z),function(){r&&c.forEach((function(e){e.removeEventListener("scroll",n.update,Z);})),s&&m.removeEventListener("resize",n.update,Z);}},data:{}},{name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var o=e.state,n=e.name;o.modifiersData[n]=oe({reference:o.rects.reference,element:o.rects.popper,strategy:"absolute",placement:o.placement});},data:{}},{name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var o=e.state,n=e.options,i=n.gpuAcceleration,a=void 0===i||i,r=n.adaptive,t=void 0===r||r,s={placement:G(o.placement),popper:o.elements.popper,popperRect:o.rects.popper,gpuAcceleration:a};null!=o.modifiersData.popperOffsets&&(o.styles.popper=Object.assign({},o.styles.popper,{},ie(Object.assign({},s,{offsets:o.modifiersData.popperOffsets,position:o.options.strategy,adaptive:t})))),null!=o.modifiersData.arrow&&(o.styles.arrow=Object.assign({},o.styles.arrow,{},ie(Object.assign({},s,{offsets:o.modifiersData.arrow,position:"absolute",adaptive:!1})))),o.attributes.popper=Object.assign({},o.attributes.popper,{"data-popper-placement":o.placement});},data:{}},{name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var o=e.state;Object.keys(o.elements).forEach((function(e){var n=o.styles[e]||{},i=o.attributes[e]||{},a=o.elements[e];E(a)&&_(a)&&(Object.assign(a.style,n),Object.keys(i).forEach((function(e){var o=i[e];!1===o?a.removeAttribute(e):a.setAttribute(e,!0===o?"":o);})));}));},effect:function(e){var o=e.state,n={popper:{position:o.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(o.elements.popper.style,n.popper),o.elements.arrow&&Object.assign(o.elements.arrow.style,n.arrow),function(){Object.keys(o.elements).forEach((function(e){var i=o.elements[e],a=o.attributes[e]||{},r=Object.keys(o.styles.hasOwnProperty(e)?o.styles[e]:n[e]).reduce((function(e,o){return e[o]="",e}),{});E(i)&&_(i)&&(Object.assign(i.style,r),Object.keys(a).forEach((function(e){i.removeAttribute(e);})));}));}},requires:["computeStyles"]},{name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var o=e.state,n=e.options,i=e.name,a=n.offset,r=void 0===a?[0,0]:a,t=W.reduce((function(e,n){return e[n]=function(e,o,n){var i=G(e),a=[V,D].indexOf(i)>=0?-1:1,r="function"==typeof n?n(Object.assign({},o,{placement:e})):n,t=r[0],s=r[1];return t=t||0,s=(s||0)*a,[V,q].indexOf(i)>=0?{x:s,y:t}:{x:t,y:s}}(n,o.rects,r),e}),{}),s=t[o.placement],m=s.x,c=s.y;null!=o.modifiersData.popperOffsets&&(o.modifiersData.popperOffsets.x+=m,o.modifiersData.popperOffsets.y+=c),o.modifiersData[i]=t;}},{name:"flip",enabled:!0,phase:"main",fn:function(e){var o=e.state,n=e.options,i=e.name;if(!o.modifiersData[i]._skip){for(var a=n.mainAxis,r=void 0===a||a,t=n.altAxis,s=void 0===t||t,m=n.fallbackPlacements,c=n.padding,d=n.boundary,g=n.rootBoundary,u=n.altBoundary,l=n.flipVariations,v=void 0===l||l,y=n.allowedAutoPlacements,f=o.options.placement,j=G(f),h=m||(j===f||!v?[re(f)]:function(e){if("auto"===G(e))return [];var o=re(e);return [se(e),o,se(o)]}(f)),p=[f].concat(h).reduce((function(e,n){return e.concat("auto"===G(n)?je(o,{placement:n,boundary:d,rootBoundary:g,padding:c,flipVariations:v,allowedAutoPlacements:y}):n)}),[]),b=o.rects.reference,w=o.rects.popper,k=new Map,x=!0,C=p[0],E=0;E<p.length;E++){var _=p[E],z=G(_),O="start"===Q(_),I=[D,R].indexOf(z)>=0,S=I?"width":"height",P=fe(o,{placement:_,boundary:d,rootBoundary:g,altBoundary:u,padding:c}),M=I?O?q:V:O?R:D;b[S]>w[S]&&(M=re(M));var A=re(M),L=[];if(r&&L.push(P[z]<=0),s&&L.push(P[M]<=0,P[A]<=0),L.every((function(e){return e}))){C=_,x=!1;break}k.set(_,L);}if(x)for(var T=function(e){var o=p.find((function(o){var n=k.get(o);if(n)return n.slice(0,e).every((function(e){return e}))}));if(o)return C=o,"break"},N=v?3:1;N>0;N--){if("break"===T(N))break}o.placement!==C&&(o.modifiersData[i]._skip=!0,o.placement=C,o.reset=!0);}},requiresIfExists:["offset"],data:{_skip:!1}},{name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var o=e.state,n=e.options,i=e.name,a=n.mainAxis,r=void 0===a||a,t=n.altAxis,s=void 0!==t&&t,m=n.boundary,c=n.rootBoundary,d=n.altBoundary,g=n.padding,u=n.tether,l=void 0===u||u,v=n.tetherOffset,y=void 0===v?0:v,f=fe(o,{boundary:m,rootBoundary:c,padding:g,altBoundary:d}),j=G(o.placement),h=Q(o.placement),p=!h,b=ee(j),w="x"===b?"y":"x",k=o.modifiersData.popperOffsets,x=o.rects.reference,C=o.rects.popper,E="function"==typeof y?y(Object.assign({},o.rects,{placement:o.placement})):y,_={x:0,y:0};if(k){if(r){var z="y"===b?D:V,O="y"===b?R:q,I="y"===b?"height":"width",S=k[b],P=k[b]+f[z],A=k[b]-f[O],L=l?-C[I]/2:0,T="start"===h?x[I]:C[I],N="start"===h?-C[I]:-x[I],F=o.elements.arrow,H=l&&F?M(F):{width:0,height:0},U=o.modifiersData["arrow#persistent"]?o.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},W=U[z],K=U[O],J=he(0,x[I],H[I]),X=p?x[I]/2-L-J-W-E:T-J-W-E,Y=p?-x[I]/2+L+J+K+E:N+J+K+E,$=o.elements.arrow&&B(o.elements.arrow),Z=$?"y"===b?$.clientTop||0:$.clientLeft||0:0,oe=o.modifiersData.offset?o.modifiersData.offset[o.placement][b]:0,ne=k[b]+X-oe-Z,ie=k[b]+Y-oe,ae=he(l?Math.min(P,ne):P,S,l?Math.max(A,ie):A);k[b]=ae,_[b]=ae-S;}if(s){var re="x"===b?D:V,te="x"===b?R:q,se=k[w],me=he(se+f[re],se,se-f[te]);k[w]=me,_[w]=me-se;}o.modifiersData[i]=_;}},requiresIfExists:["offset"]},{name:"arrow",enabled:!0,phase:"main",fn:function(e){var o,n=e.state,i=e.name,a=n.elements.arrow,r=n.modifiersData.popperOffsets,t=G(n.placement),s=ee(t),m=[V,q].indexOf(t)>=0?"height":"width";if(a&&r){var c=n.modifiersData[i+"#persistent"].padding,d=M(a),g="y"===s?D:V,u="y"===s?R:q,l=n.rects.reference[m]+n.rects.reference[s]-r[s]-n.rects.popper[m],v=r[s]-n.rects.reference[s],y=B(a),f=y?"y"===s?y.clientHeight||0:y.clientWidth||0:0,j=l/2-v/2,h=c[g],p=f-d[m]-c[u],b=f/2-d[m]/2+j,w=he(h,b,p),k=s;n.modifiersData[i]=((o={})[k]=w,o.centerOffset=w-b,o);}},effect:function(e){var o=e.state,n=e.options,i=e.name,a=n.element,r=void 0===a?"[data-popper-arrow]":a,t=n.padding,s=void 0===t?0:t;null!=r&&("string"!=typeof r||(r=o.elements.popper.querySelector(r)))&&de(o.elements.popper,r)&&(o.elements.arrow=r,o.modifiersData[i+"#persistent"]={padding:ve("number"!=typeof s?s:ye(s,H))});},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]},{name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var o=e.state,n=e.name,i=o.rects.reference,a=o.rects.popper,r=o.modifiersData.preventOverflow,t=fe(o,{elementContext:"reference"}),s=fe(o,{altBoundary:!0}),m=pe(t,i),c=pe(s,a,r),d=be(m),g=be(c);o.modifiersData[n]={referenceClippingOffsets:m,popperEscapeOffsets:c,isReferenceHidden:d,hasPopperEscaped:g},o.attributes.popper=Object.assign({},o.attributes.popper,{"data-popper-reference-hidden":d,"data-popper-escaped":g});}}]}),ke=function(){var e={base:"https://twemoji.maxcdn.com/v/12.1.2/",ext:".png",size:"72x72",className:"emoji",convert:{fromCodePoint:function(e){var o="string"==typeof e?parseInt(e,16):e;if(o<65536)return s(o);return s(55296+((o-=65536)>>10),56320+(1023&o))},toCodePoint:j},onerror:function(){this.parentNode&&this.parentNode.replaceChild(m(this.alt,!1),this);},parse:function(o,n){n&&"function"!=typeof n||(n={callback:n});return ("string"==typeof o?l:u)(o,{callback:n.callback||c,attributes:"function"==typeof n.attributes?n.attributes:y,base:"string"==typeof n.base?n.base:e.base,ext:n.ext||e.ext,size:n.folder||(i=n.size||e.size,"number"==typeof i?i+"x"+i:i),className:n.className||e.className,onerror:n.onerror||e.onerror});var i;},replace:f,test:function(e){n.lastIndex=0;var o=n.test(e);return n.lastIndex=0,o}},o={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"},n=/(?:\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb\udffc]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffd]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d])|(?:\ud83d[\udc68\udc69])(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26a7\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a-\udc6d\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5\udeeb\udeec\udef4-\udefa\udfe0-\udfeb]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd1d\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd71\udd73-\udd76\udd7a-\udda2\udda5-\uddaa\uddae-\uddb4\uddb7\uddba\uddbc-\uddca\uddd0\uddde-\uddff\ude70-\ude73\ude78-\ude7a\ude80-\ude82\ude90-\ude95]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g,i=/\uFE0F/g,a=String.fromCharCode(8205),r=/[&<>'"]/g,t=/^(?:iframe|noframes|noscript|script|select|style|textarea)$/,s=String.fromCharCode;return e;function m(e,o){return document.createTextNode(o?e.replace(i,""):e)}function c(e,o){return "".concat(o.base,o.size,"/",e,o.ext)}function d(e,o){for(var n,i,a=e.childNodes,r=a.length;r--;)3===(i=(n=a[r]).nodeType)?o.push(n):1!==i||"ownerSVGElement"in n||t.test(n.nodeName.toLowerCase())||d(n,o);return o}function g(e){return j(e.indexOf(a)<0?e.replace(i,""):e)}function u(e,o){for(var i,a,r,t,s,c,u,l,v,y,f,j,h,p=d(e,[]),b=p.length;b--;){for(r=!1,t=document.createDocumentFragment(),c=(s=p[b]).nodeValue,l=0;u=n.exec(c);){if((v=u.index)!==l&&t.appendChild(m(c.slice(l,v),!0)),j=g(f=u[0]),l=v+f.length,h=o.callback(j,o),j&&h){for(a in (y=new Image).onerror=o.onerror,y.setAttribute("draggable","false"),i=o.attributes(f,j))i.hasOwnProperty(a)&&0!==a.indexOf("on")&&!y.hasAttribute(a)&&y.setAttribute(a,i[a]);y.className=o.className,y.alt=f,y.src=h,r=!0,t.appendChild(y);}y||t.appendChild(m(f,!1)),y=null;}r&&(l<c.length&&t.appendChild(m(c.slice(l),!0)),s.parentNode.replaceChild(t,s));}return e}function l(e,o){return f(e,(function(e){var n,i,a=e,t=g(e),s=o.callback(t,o);if(t&&s){for(i in a="<img ".concat('class="',o.className,'" ','draggable="false" ','alt="',e,'"',' src="',s,'"'),n=o.attributes(e,t))n.hasOwnProperty(i)&&0!==i.indexOf("on")&&-1===a.indexOf(" "+i+"=")&&(a=a.concat(" ",i,'="',n[i].replace(r,v),'"'));a=a.concat("/>");}return a}))}function v(e){return o[e]}function y(){return null}function f(e,o){return String(e).replace(n,o)}function j(e,o){for(var n=[],i=0,a=0,r=0;r<e.length;)i=e.charCodeAt(r++),a?(n.push((65536+(a-55296<<10)+(i-56320)).toString(16)),a=0):55296<=i&&i<=56319?a=i:n.push(i.toString(16));return n.join(o||"-")}}(),xe={categories:["smileys","people","animals","food","travel","activities","objects","symbols","flags"],emoji:[{emoji:"😀",category:0,name:"grinning face",version:"1.0"},{emoji:"😃",category:0,name:"grinning face with big eyes",version:"1.0"},{emoji:"😄",category:0,name:"grinning face with smiling eyes",version:"1.0"},{emoji:"😁",category:0,name:"beaming face with smiling eyes",version:"1.0"},{emoji:"😆",category:0,name:"grinning squinting face",version:"1.0"},{emoji:"😅",category:0,name:"grinning face with sweat",version:"1.0"},{emoji:"🤣",category:0,name:"rolling on the floor laughing",version:"3.0"},{emoji:"😂",category:0,name:"face with tears of joy",version:"1.0"},{emoji:"🙂",category:0,name:"slightly smiling face",version:"1.0"},{emoji:"🙃",category:0,name:"upside-down face",version:"1.0"},{emoji:"😉",category:0,name:"winking face",version:"1.0"},{emoji:"😊",category:0,name:"smiling face with smiling eyes",version:"1.0"},{emoji:"😇",category:0,name:"smiling face with halo",version:"1.0"},{emoji:"🥰",category:0,name:"smiling face with hearts",version:"11.0"},{emoji:"😍",category:0,name:"smiling face with heart-eyes",version:"1.0"},{emoji:"🤩",category:0,name:"star-struck",version:"5.0"},{emoji:"😘",category:0,name:"face blowing a kiss",version:"1.0"},{emoji:"😗",category:0,name:"kissing face",version:"1.0"},{emoji:"☺️",category:0,name:"smiling face",version:"1.0"},{emoji:"😚",category:0,name:"kissing face with closed eyes",version:"1.0"},{emoji:"😙",category:0,name:"kissing face with smiling eyes",version:"1.0"},{emoji:"🥲",category:0,name:"smiling face with tear",version:"13.0"},{emoji:"😋",category:0,name:"face savoring food",version:"1.0"},{emoji:"😛",category:0,name:"face with tongue",version:"1.0"},{emoji:"😜",category:0,name:"winking face with tongue",version:"1.0"},{emoji:"🤪",category:0,name:"zany face",version:"5.0"},{emoji:"😝",category:0,name:"squinting face with tongue",version:"1.0"},{emoji:"🤑",category:0,name:"money-mouth face",version:"1.0"},{emoji:"🤗",category:0,name:"hugging face",version:"1.0"},{emoji:"🤭",category:0,name:"face with hand over mouth",version:"5.0"},{emoji:"🤫",category:0,name:"shushing face",version:"5.0"},{emoji:"🤔",category:0,name:"thinking face",version:"1.0"},{emoji:"🤐",category:0,name:"zipper-mouth face",version:"1.0"},{emoji:"🤨",category:0,name:"face with raised eyebrow",version:"5.0"},{emoji:"😐",category:0,name:"neutral face",version:"1.0"},{emoji:"😑",category:0,name:"expressionless face",version:"1.0"},{emoji:"😶",category:0,name:"face without mouth",version:"1.0"},{emoji:"😏",category:0,name:"smirking face",version:"1.0"},{emoji:"😒",category:0,name:"unamused face",version:"1.0"},{emoji:"🙄",category:0,name:"face with rolling eyes",version:"1.0"},{emoji:"😬",category:0,name:"grimacing face",version:"1.0"},{emoji:"🤥",category:0,name:"lying face",version:"3.0"},{emoji:"😌",category:0,name:"relieved face",version:"1.0"},{emoji:"😔",category:0,name:"pensive face",version:"1.0"},{emoji:"😪",category:0,name:"sleepy face",version:"1.0"},{emoji:"🤤",category:0,name:"drooling face",version:"3.0"},{emoji:"😴",category:0,name:"sleeping face",version:"1.0"},{emoji:"😷",category:0,name:"face with medical mask",version:"1.0"},{emoji:"🤒",category:0,name:"face with thermometer",version:"1.0"},{emoji:"🤕",category:0,name:"face with head-bandage",version:"1.0"},{emoji:"🤢",category:0,name:"nauseated face",version:"3.0"},{emoji:"🤮",category:0,name:"face vomiting",version:"5.0"},{emoji:"🤧",category:0,name:"sneezing face",version:"3.0"},{emoji:"🥵",category:0,name:"hot face",version:"11.0"},{emoji:"🥶",category:0,name:"cold face",version:"11.0"},{emoji:"🥴",category:0,name:"woozy face",version:"11.0"},{emoji:"😵",category:0,name:"dizzy face",version:"1.0"},{emoji:"🤯",category:0,name:"exploding head",version:"5.0"},{emoji:"🤠",category:0,name:"cowboy hat face",version:"3.0"},{emoji:"🥳",category:0,name:"partying face",version:"11.0"},{emoji:"🥸",category:0,name:"disguised face",version:"13.0"},{emoji:"😎",category:0,name:"smiling face with sunglasses",version:"1.0"},{emoji:"🤓",category:0,name:"nerd face",version:"1.0"},{emoji:"🧐",category:0,name:"face with monocle",version:"5.0"},{emoji:"😕",category:0,name:"confused face",version:"1.0"},{emoji:"😟",category:0,name:"worried face",version:"1.0"},{emoji:"🙁",category:0,name:"slightly frowning face",version:"1.0"},{emoji:"☹️",category:0,name:"frowning face",version:"1.0"},{emoji:"😮",category:0,name:"face with open mouth",version:"1.0"},{emoji:"😯",category:0,name:"hushed face",version:"1.0"},{emoji:"😲",category:0,name:"astonished face",version:"1.0"},{emoji:"😳",category:0,name:"flushed face",version:"1.0"},{emoji:"🥺",category:0,name:"pleading face",version:"11.0"},{emoji:"😦",category:0,name:"frowning face with open mouth",version:"1.0"},{emoji:"😧",category:0,name:"anguished face",version:"1.0"},{emoji:"😨",category:0,name:"fearful face",version:"1.0"},{emoji:"😰",category:0,name:"anxious face with sweat",version:"1.0"},{emoji:"😥",category:0,name:"sad but relieved face",version:"1.0"},{emoji:"😢",category:0,name:"crying face",version:"1.0"},{emoji:"😭",category:0,name:"loudly crying face",version:"1.0"},{emoji:"😱",category:0,name:"face screaming in fear",version:"1.0"},{emoji:"😖",category:0,name:"confounded face",version:"1.0"},{emoji:"😣",category:0,name:"persevering face",version:"1.0"},{emoji:"😞",category:0,name:"disappointed face",version:"1.0"},{emoji:"😓",category:0,name:"downcast face with sweat",version:"1.0"},{emoji:"😩",category:0,name:"weary face",version:"1.0"},{emoji:"😫",category:0,name:"tired face",version:"1.0"},{emoji:"🥱",category:0,name:"yawning face",version:"12.0"},{emoji:"😤",category:0,name:"face with steam from nose",version:"1.0"},{emoji:"😡",category:0,name:"pouting face",version:"1.0"},{emoji:"😠",category:0,name:"angry face",version:"1.0"},{emoji:"🤬",category:0,name:"face with symbols on mouth",version:"5.0"},{emoji:"😈",category:0,name:"smiling face with horns",version:"1.0"},{emoji:"👿",category:0,name:"angry face with horns",version:"1.0"},{emoji:"💀",category:0,name:"skull",version:"1.0"},{emoji:"☠️",category:0,name:"skull and crossbones",version:"1.0"},{emoji:"💩",category:0,name:"pile of poo",version:"1.0"},{emoji:"🤡",category:0,name:"clown face",version:"3.0"},{emoji:"👹",category:0,name:"ogre",version:"1.0"},{emoji:"👺",category:0,name:"goblin",version:"1.0"},{emoji:"👻",category:0,name:"ghost",version:"1.0"},{emoji:"👽",category:0,name:"alien",version:"1.0"},{emoji:"👾",category:0,name:"alien monster",version:"1.0"},{emoji:"🤖",category:0,name:"robot",version:"1.0"},{emoji:"😺",category:0,name:"grinning cat",version:"1.0"},{emoji:"😸",category:0,name:"grinning cat with smiling eyes",version:"1.0"},{emoji:"😹",category:0,name:"cat with tears of joy",version:"1.0"},{emoji:"😻",category:0,name:"smiling cat with heart-eyes",version:"1.0"},{emoji:"😼",category:0,name:"cat with wry smile",version:"1.0"},{emoji:"😽",category:0,name:"kissing cat",version:"1.0"},{emoji:"🙀",category:0,name:"weary cat",version:"1.0"},{emoji:"😿",category:0,name:"crying cat",version:"1.0"},{emoji:"😾",category:0,name:"pouting cat",version:"1.0"},{emoji:"🙈",category:0,name:"see-no-evil monkey",version:"1.0"},{emoji:"🙉",category:0,name:"hear-no-evil monkey",version:"1.0"},{emoji:"🙊",category:0,name:"speak-no-evil monkey",version:"1.0"},{emoji:"💋",category:0,name:"kiss mark",version:"1.0"},{emoji:"💌",category:0,name:"love letter",version:"1.0"},{emoji:"💘",category:0,name:"heart with arrow",version:"1.0"},{emoji:"💝",category:0,name:"heart with ribbon",version:"1.0"},{emoji:"💖",category:0,name:"sparkling heart",version:"1.0"},{emoji:"💗",category:0,name:"growing heart",version:"1.0"},{emoji:"💓",category:0,name:"beating heart",version:"1.0"},{emoji:"💞",category:0,name:"revolving hearts",version:"1.0"},{emoji:"💕",category:0,name:"two hearts",version:"1.0"},{emoji:"💟",category:0,name:"heart decoration",version:"1.0"},{emoji:"❣️",category:0,name:"heart exclamation",version:"1.0"},{emoji:"💔",category:0,name:"broken heart",version:"1.0"},{emoji:"❤️",category:0,name:"red heart",version:"1.0"},{emoji:"🧡",category:0,name:"orange heart",version:"5.0"},{emoji:"💛",category:0,name:"yellow heart",version:"1.0"},{emoji:"💚",category:0,name:"green heart",version:"1.0"},{emoji:"💙",category:0,name:"blue heart",version:"1.0"},{emoji:"💜",category:0,name:"purple heart",version:"1.0"},{emoji:"🤎",category:0,name:"brown heart",version:"12.0"},{emoji:"🖤",category:0,name:"black heart",version:"3.0"},{emoji:"🤍",category:0,name:"white heart",version:"12.0"},{emoji:"💯",category:0,name:"hundred points",version:"1.0"},{emoji:"💢",category:0,name:"anger symbol",version:"1.0"},{emoji:"💥",category:0,name:"collision",version:"1.0"},{emoji:"💫",category:0,name:"dizzy",version:"1.0"},{emoji:"💦",category:0,name:"sweat droplets",version:"1.0"},{emoji:"💨",category:0,name:"dashing away",version:"1.0"},{emoji:"🕳️",category:0,name:"hole",version:"1.0"},{emoji:"💣",category:0,name:"bomb",version:"1.0"},{emoji:"💬",category:0,name:"speech balloon",version:"1.0"},{emoji:"👁️‍🗨️",category:0,name:"eye in speech bubble",version:"2.0"},{emoji:"🗨️",category:0,name:"left speech bubble",version:"2.0"},{emoji:"🗯️",category:0,name:"right anger bubble",version:"1.0"},{emoji:"💭",category:0,name:"thought balloon",version:"1.0"},{emoji:"💤",category:0,name:"zzz",version:"1.0"},{emoji:"👋",category:1,name:"waving hand",variations:["👋🏻","👋🏼","👋🏽","👋🏾","👋🏿"],version:"1.0"},{emoji:"🤚",category:1,name:"raised back of hand",variations:["🤚🏻","🤚🏼","🤚🏽","🤚🏾","🤚🏿"],version:"3.0"},{emoji:"🖐️",category:1,name:"hand with fingers splayed",variations:["🖐🏻","🖐🏼","🖐🏽","🖐🏾","🖐🏿"],version:"1.0"},{emoji:"✋",category:1,name:"raised hand",variations:["✋🏻","✋🏼","✋🏽","✋🏾","✋🏿"],version:"1.0"},{emoji:"🖖",category:1,name:"vulcan salute",variations:["🖖🏻","🖖🏼","🖖🏽","🖖🏾","🖖🏿"],version:"1.0"},{emoji:"👌",category:1,name:"OK hand",variations:["👌🏻","👌🏼","👌🏽","👌🏾","👌🏿"],version:"1.0"},{emoji:"🤌",category:1,name:"pinched fingers",variations:["🤌🏻","🤌🏼","🤌🏽","🤌🏾","🤌🏿"],version:"13.0"},{emoji:"🤏",category:1,name:"pinching hand",variations:["🤏🏻","🤏🏼","🤏🏽","🤏🏾","🤏🏿"],version:"12.0"},{emoji:"✌️",category:1,name:"victory hand",variations:["✌🏻","✌🏼","✌🏽","✌🏾","✌🏿"],version:"1.0"},{emoji:"🤞",category:1,name:"crossed fingers",variations:["🤞🏻","🤞🏼","🤞🏽","🤞🏾","🤞🏿"],version:"3.0"},{emoji:"🤟",category:1,name:"love-you gesture",variations:["🤟🏻","🤟🏼","🤟🏽","🤟🏾","🤟🏿"],version:"5.0"},{emoji:"🤘",category:1,name:"sign of the horns",variations:["🤘🏻","🤘🏼","🤘🏽","🤘🏾","🤘🏿"],version:"1.0"},{emoji:"🤙",category:1,name:"call me hand",variations:["🤙🏻","🤙🏼","🤙🏽","🤙🏾","🤙🏿"],version:"3.0"},{emoji:"👈",category:1,name:"backhand index pointing left",variations:["👈🏻","👈🏼","👈🏽","👈🏾","👈🏿"],version:"1.0"},{emoji:"👉",category:1,name:"backhand index pointing right",variations:["👉🏻","👉🏼","👉🏽","👉🏾","👉🏿"],version:"1.0"},{emoji:"👆",category:1,name:"backhand index pointing up",variations:["👆🏻","👆🏼","👆🏽","👆🏾","👆🏿"],version:"1.0"},{emoji:"🖕",category:1,name:"middle finger",variations:["🖕🏻","🖕🏼","🖕🏽","🖕🏾","🖕🏿"],version:"1.0"},{emoji:"👇",category:1,name:"backhand index pointing down",variations:["👇🏻","👇🏼","👇🏽","👇🏾","👇🏿"],version:"1.0"},{emoji:"☝️",category:1,name:"index pointing up",variations:["☝🏻","☝🏼","☝🏽","☝🏾","☝🏿"],version:"1.0"},{emoji:"👍",category:1,name:"thumbs up",variations:["👍🏻","👍🏼","👍🏽","👍🏾","👍🏿"],version:"1.0"},{emoji:"👎",category:1,name:"thumbs down",variations:["👎🏻","👎🏼","👎🏽","👎🏾","👎🏿"],version:"1.0"},{emoji:"✊",category:1,name:"raised fist",variations:["✊🏻","✊🏼","✊🏽","✊🏾","✊🏿"],version:"1.0"},{emoji:"👊",category:1,name:"oncoming fist",variations:["👊🏻","👊🏼","👊🏽","👊🏾","👊🏿"],version:"1.0"},{emoji:"🤛",category:1,name:"left-facing fist",variations:["🤛🏻","🤛🏼","🤛🏽","🤛🏾","🤛🏿"],version:"3.0"},{emoji:"🤜",category:1,name:"right-facing fist",variations:["🤜🏻","🤜🏼","🤜🏽","🤜🏾","🤜🏿"],version:"3.0"},{emoji:"👏",category:1,name:"clapping hands",variations:["👏🏻","👏🏼","👏🏽","👏🏾","👏🏿"],version:"1.0"},{emoji:"🙌",category:1,name:"raising hands",variations:["🙌🏻","🙌🏼","🙌🏽","🙌🏾","🙌🏿"],version:"1.0"},{emoji:"👐",category:1,name:"open hands",variations:["👐🏻","👐🏼","👐🏽","👐🏾","👐🏿"],version:"1.0"},{emoji:"🤲",category:1,name:"palms up together",variations:["🤲🏻","🤲🏼","🤲🏽","🤲🏾","🤲🏿"],version:"5.0"},{emoji:"🤝",category:1,name:"handshake",version:"3.0"},{emoji:"🙏",category:1,name:"folded hands",variations:["🙏🏻","🙏🏼","🙏🏽","🙏🏾","🙏🏿"],version:"1.0"},{emoji:"✍️",category:1,name:"writing hand",variations:["✍🏻","✍🏼","✍🏽","✍🏾","✍🏿"],version:"1.0"},{emoji:"💅",category:1,name:"nail polish",variations:["💅🏻","💅🏼","💅🏽","💅🏾","💅🏿"],version:"1.0"},{emoji:"🤳",category:1,name:"selfie",variations:["🤳🏻","🤳🏼","🤳🏽","🤳🏾","🤳🏿"],version:"3.0"},{emoji:"💪",category:1,name:"flexed biceps",variations:["💪🏻","💪🏼","💪🏽","💪🏾","💪🏿"],version:"1.0"},{emoji:"🦾",category:1,name:"mechanical arm",version:"12.0"},{emoji:"🦿",category:1,name:"mechanical leg",version:"12.0"},{emoji:"🦵",category:1,name:"leg",variations:["🦵🏻","🦵🏼","🦵🏽","🦵🏾","🦵🏿"],version:"11.0"},{emoji:"🦶",category:1,name:"foot",variations:["🦶🏻","🦶🏼","🦶🏽","🦶🏾","🦶🏿"],version:"11.0"},{emoji:"👂",category:1,name:"ear",variations:["👂🏻","👂🏼","👂🏽","👂🏾","👂🏿"],version:"1.0"},{emoji:"🦻",category:1,name:"ear with hearing aid",variations:["🦻🏻","🦻🏼","🦻🏽","🦻🏾","🦻🏿"],version:"12.0"},{emoji:"👃",category:1,name:"nose",variations:["👃🏻","👃🏼","👃🏽","👃🏾","👃🏿"],version:"1.0"},{emoji:"🧠",category:1,name:"brain",version:"5.0"},{emoji:"🫀",category:1,name:"anatomical heart",version:"13.0"},{emoji:"🫁",category:1,name:"lungs",version:"13.0"},{emoji:"🦷",category:1,name:"tooth",version:"11.0"},{emoji:"🦴",category:1,name:"bone",version:"11.0"},{emoji:"👀",category:1,name:"eyes",version:"1.0"},{emoji:"👁️",category:1,name:"eye",version:"1.0"},{emoji:"👅",category:1,name:"tongue",version:"1.0"},{emoji:"👄",category:1,name:"mouth",version:"1.0"},{emoji:"👶",category:1,name:"baby",variations:["👶🏻","👶🏼","👶🏽","👶🏾","👶🏿"],version:"1.0"},{emoji:"🧒",category:1,name:"child",variations:["🧒🏻","🧒🏼","🧒🏽","🧒🏾","🧒🏿"],version:"5.0"},{emoji:"👦",category:1,name:"boy",variations:["👦🏻","👦🏼","👦🏽","👦🏾","👦🏿"],version:"1.0"},{emoji:"👧",category:1,name:"girl",variations:["👧🏻","👧🏼","👧🏽","👧🏾","👧🏿"],version:"1.0"},{emoji:"🧑",category:1,name:"person",variations:["🧑🏻","🧑🏼","🧑🏽","🧑🏾","🧑🏿"],version:"5.0"},{emoji:"👱",category:1,name:"person with blond hair",variations:["👱🏻","👱🏼","👱🏽","👱🏾","👱🏿"],version:"1.0"},{emoji:"👨",category:1,name:"man",variations:["👨🏻","👨🏼","👨🏽","👨🏾","👨🏿"],version:"1.0"},{emoji:"🧔",category:1,name:"man with beard",variations:["🧔🏻","🧔🏼","🧔🏽","🧔🏾","🧔🏿"],version:"5.0"},{emoji:"👨‍🦰",category:1,name:"man with red hair",variations:["👨🏻‍🦰","👨🏼‍🦰","👨🏽‍🦰","👨🏾‍🦰","👨🏿‍🦰"],version:"11.0"},{emoji:"👨‍🦱",category:1,name:"man with curly hair",variations:["👨🏻‍🦱","👨🏼‍🦱","👨🏽‍🦱","👨🏾‍🦱","👨🏿‍🦱"],version:"11.0"},{emoji:"👨‍🦳",category:1,name:"man with white hair",variations:["👨🏻‍🦳","👨🏼‍🦳","👨🏽‍🦳","👨🏾‍🦳","👨🏿‍🦳"],version:"11.0"},{emoji:"👨‍🦲",category:1,name:"man with no hair",variations:["👨🏻‍🦲","👨🏼‍🦲","👨🏽‍🦲","👨🏾‍🦲","👨🏿‍🦲"],version:"11.0"},{emoji:"👩",category:1,name:"woman",variations:["👩🏻","👩🏼","👩🏽","👩🏾","👩🏿"],version:"1.0"},{emoji:"👩‍🦰",category:1,name:"woman with red hair",variations:["👩🏻‍🦰","👩🏼‍🦰","👩🏽‍🦰","👩🏾‍🦰","👩🏿‍🦰"],version:"11.0"},{emoji:"🧑‍🦰",category:1,name:"person with red hair",variations:["🧑🏻‍🦰","🧑🏼‍🦰","🧑🏽‍🦰","🧑🏾‍🦰","🧑🏿‍🦰"],version:"12.1"},{emoji:"👩‍🦱",category:1,name:"woman with curly hair",variations:["👩🏻‍🦱","👩🏼‍🦱","👩🏽‍🦱","👩🏾‍🦱","👩🏿‍🦱"],version:"11.0"},{emoji:"🧑‍🦱",category:1,name:"person with curly hair",variations:["🧑🏻‍🦱","🧑🏼‍🦱","🧑🏽‍🦱","🧑🏾‍🦱","🧑🏿‍🦱"],version:"12.1"},{emoji:"👩‍🦳",category:1,name:"woman with white hair",variations:["👩🏻‍🦳","👩🏼‍🦳","👩🏽‍🦳","👩🏾‍🦳","👩🏿‍🦳"],version:"11.0"},{emoji:"🧑‍🦳",category:1,name:"person with white hair",variations:["🧑🏻‍🦳","🧑🏼‍🦳","🧑🏽‍🦳","🧑🏾‍🦳","🧑🏿‍🦳"],version:"12.1"},{emoji:"👩‍🦲",category:1,name:"woman with no hair",variations:["👩🏻‍🦲","👩🏼‍🦲","👩🏽‍🦲","👩🏾‍🦲","👩🏿‍🦲"],version:"11.0"},{emoji:"🧑‍🦲",category:1,name:"person with no hair",variations:["🧑🏻‍🦲","🧑🏼‍🦲","🧑🏽‍🦲","🧑🏾‍🦲","🧑🏿‍🦲"],version:"12.1"},{emoji:"👱‍♀️",category:1,name:"woman with blond hair",variations:["👱🏻‍♀️","👱🏼‍♀️","👱🏽‍♀️","👱🏾‍♀️","👱🏿‍♀️"],version:"4.0"},{emoji:"👱‍♂️",category:1,name:"man with blond hair",variations:["👱🏻‍♂️","👱🏼‍♂️","👱🏽‍♂️","👱🏾‍♂️","👱🏿‍♂️"],version:"4.0"},{emoji:"🧓",category:1,name:"older person",variations:["🧓🏻","🧓🏼","🧓🏽","🧓🏾","🧓🏿"],version:"5.0"},{emoji:"👴",category:1,name:"old man",variations:["👴🏻","👴🏼","👴🏽","👴🏾","👴🏿"],version:"1.0"},{emoji:"👵",category:1,name:"old woman",variations:["👵🏻","👵🏼","👵🏽","👵🏾","👵🏿"],version:"1.0"},{emoji:"🙍",category:1,name:"person frowning",variations:["🙍🏻","🙍🏼","🙍🏽","🙍🏾","🙍🏿"],version:"1.0"},{emoji:"🙍‍♂️",category:1,name:"man frowning",variations:["🙍🏻‍♂️","🙍🏼‍♂️","🙍🏽‍♂️","🙍🏾‍♂️","🙍🏿‍♂️"],version:"4.0"},{emoji:"🙍‍♀️",category:1,name:"woman frowning",variations:["🙍🏻‍♀️","🙍🏼‍♀️","🙍🏽‍♀️","🙍🏾‍♀️","🙍🏿‍♀️"],version:"4.0"},{emoji:"🙎",category:1,name:"person pouting",variations:["🙎🏻","🙎🏼","🙎🏽","🙎🏾","🙎🏿"],version:"1.0"},{emoji:"🙎‍♂️",category:1,name:"man pouting",variations:["🙎🏻‍♂️","🙎🏼‍♂️","🙎🏽‍♂️","🙎🏾‍♂️","🙎🏿‍♂️"],version:"4.0"},{emoji:"🙎‍♀️",category:1,name:"woman pouting",variations:["🙎🏻‍♀️","🙎🏼‍♀️","🙎🏽‍♀️","🙎🏾‍♀️","🙎🏿‍♀️"],version:"4.0"},{emoji:"🙅",category:1,name:"person gesturing NO",variations:["🙅🏻","🙅🏼","🙅🏽","🙅🏾","🙅🏿"],version:"1.0"},{emoji:"🙅‍♂️",category:1,name:"man gesturing NO",variations:["🙅🏻‍♂️","🙅🏼‍♂️","🙅🏽‍♂️","🙅🏾‍♂️","🙅🏿‍♂️"],version:"4.0"},{emoji:"🙅‍♀️",category:1,name:"woman gesturing NO",variations:["🙅🏻‍♀️","🙅🏼‍♀️","🙅🏽‍♀️","🙅🏾‍♀️","🙅🏿‍♀️"],version:"4.0"},{emoji:"🙆",category:1,name:"person gesturing OK",variations:["🙆🏻","🙆🏼","🙆🏽","🙆🏾","🙆🏿"],version:"1.0"},{emoji:"🙆‍♂️",category:1,name:"man gesturing OK",variations:["🙆🏻‍♂️","🙆🏼‍♂️","🙆🏽‍♂️","🙆🏾‍♂️","🙆🏿‍♂️"],version:"4.0"},{emoji:"🙆‍♀️",category:1,name:"woman gesturing OK",variations:["🙆🏻‍♀️","🙆🏼‍♀️","🙆🏽‍♀️","🙆🏾‍♀️","🙆🏿‍♀️"],version:"4.0"},{emoji:"💁",category:1,name:"person tipping hand",variations:["💁🏻","💁🏼","💁🏽","💁🏾","💁🏿"],version:"1.0"},{emoji:"💁‍♂️",category:1,name:"man tipping hand",variations:["💁🏻‍♂️","💁🏼‍♂️","💁🏽‍♂️","💁🏾‍♂️","💁🏿‍♂️"],version:"4.0"},{emoji:"💁‍♀️",category:1,name:"woman tipping hand",variations:["💁🏻‍♀️","💁🏼‍♀️","💁🏽‍♀️","💁🏾‍♀️","💁🏿‍♀️"],version:"4.0"},{emoji:"🙋",category:1,name:"person raising hand",variations:["🙋🏻","🙋🏼","🙋🏽","🙋🏾","🙋🏿"],version:"1.0"},{emoji:"🙋‍♂️",category:1,name:"man raising hand",variations:["🙋🏻‍♂️","🙋🏼‍♂️","🙋🏽‍♂️","🙋🏾‍♂️","🙋🏿‍♂️"],version:"4.0"},{emoji:"🙋‍♀️",category:1,name:"woman raising hand",variations:["🙋🏻‍♀️","🙋🏼‍♀️","🙋🏽‍♀️","🙋🏾‍♀️","🙋🏿‍♀️"],version:"4.0"},{emoji:"🧏",category:1,name:"deaf person",variations:["🧏🏻","🧏🏼","🧏🏽","🧏🏾","🧏🏿"],version:"12.0"},{emoji:"🧏‍♂️",category:1,name:"deaf man",variations:["🧏🏻‍♂️","🧏🏼‍♂️","🧏🏽‍♂️","🧏🏾‍♂️","🧏🏿‍♂️"],version:"12.0"},{emoji:"🧏‍♀️",category:1,name:"deaf woman",variations:["🧏🏻‍♀️","🧏🏼‍♀️","🧏🏽‍♀️","🧏🏾‍♀️","🧏🏿‍♀️"],version:"12.0"},{emoji:"🙇",category:1,name:"person bowing",variations:["🙇🏻","🙇🏼","🙇🏽","🙇🏾","🙇🏿"],version:"1.0"},{emoji:"🙇‍♂️",category:1,name:"man bowing",variations:["🙇🏻‍♂️","🙇🏼‍♂️","🙇🏽‍♂️","🙇🏾‍♂️","🙇🏿‍♂️"],version:"4.0"},{emoji:"🙇‍♀️",category:1,name:"woman bowing",variations:["🙇🏻‍♀️","🙇🏼‍♀️","🙇🏽‍♀️","🙇🏾‍♀️","🙇🏿‍♀️"],version:"4.0"},{emoji:"🤦",category:1,name:"person facepalming",variations:["🤦🏻","🤦🏼","🤦🏽","🤦🏾","🤦🏿"],version:"3.0"},{emoji:"🤦‍♂️",category:1,name:"man facepalming",variations:["🤦🏻‍♂️","🤦🏼‍♂️","🤦🏽‍♂️","🤦🏾‍♂️","🤦🏿‍♂️"],version:"4.0"},{emoji:"🤦‍♀️",category:1,name:"woman facepalming",variations:["🤦🏻‍♀️","🤦🏼‍♀️","🤦🏽‍♀️","🤦🏾‍♀️","🤦🏿‍♀️"],version:"4.0"},{emoji:"🤷",category:1,name:"person shrugging",variations:["🤷🏻","🤷🏼","🤷🏽","🤷🏾","🤷🏿"],version:"3.0"},{emoji:"🤷‍♂️",category:1,name:"man shrugging",variations:["🤷🏻‍♂️","🤷🏼‍♂️","🤷🏽‍♂️","🤷🏾‍♂️","🤷🏿‍♂️"],version:"4.0"},{emoji:"🤷‍♀️",category:1,name:"woman shrugging",variations:["🤷🏻‍♀️","🤷🏼‍♀️","🤷🏽‍♀️","🤷🏾‍♀️","🤷🏿‍♀️"],version:"4.0"},{emoji:"🧑‍⚕️",category:1,name:"health worker",variations:["🧑🏻‍⚕️","🧑🏼‍⚕️","🧑🏽‍⚕️","🧑🏾‍⚕️","🧑🏿‍⚕️"],version:"12.1"},{emoji:"👨‍⚕️",category:1,name:"man health worker",variations:["👨🏻‍⚕️","👨🏼‍⚕️","👨🏽‍⚕️","👨🏾‍⚕️","👨🏿‍⚕️"],version:"4.0"},{emoji:"👩‍⚕️",category:1,name:"woman health worker",variations:["👩🏻‍⚕️","👩🏼‍⚕️","👩🏽‍⚕️","👩🏾‍⚕️","👩🏿‍⚕️"],version:"4.0"},{emoji:"🧑‍🎓",category:1,name:"student",variations:["🧑🏻‍🎓","🧑🏼‍🎓","🧑🏽‍🎓","🧑🏾‍🎓","🧑🏿‍🎓"],version:"12.1"},{emoji:"👨‍🎓",category:1,name:"man student",variations:["👨🏻‍🎓","👨🏼‍🎓","👨🏽‍🎓","👨🏾‍🎓","👨🏿‍🎓"],version:"4.0"},{emoji:"👩‍🎓",category:1,name:"woman student",variations:["👩🏻‍🎓","👩🏼‍🎓","👩🏽‍🎓","👩🏾‍🎓","👩🏿‍🎓"],version:"4.0"},{emoji:"🧑‍🏫",category:1,name:"teacher",variations:["🧑🏻‍🏫","🧑🏼‍🏫","🧑🏽‍🏫","🧑🏾‍🏫","🧑🏿‍🏫"],version:"12.1"},{emoji:"👨‍🏫",category:1,name:"man teacher",variations:["👨🏻‍🏫","👨🏼‍🏫","👨🏽‍🏫","👨🏾‍🏫","👨🏿‍🏫"],version:"4.0"},{emoji:"👩‍🏫",category:1,name:"woman teacher",variations:["👩🏻‍🏫","👩🏼‍🏫","👩🏽‍🏫","👩🏾‍🏫","👩🏿‍🏫"],version:"4.0"},{emoji:"🧑‍⚖️",category:1,name:"judge",variations:["🧑🏻‍⚖️","🧑🏼‍⚖️","🧑🏽‍⚖️","🧑🏾‍⚖️","🧑🏿‍⚖️"],version:"12.1"},{emoji:"👨‍⚖️",category:1,name:"man judge",variations:["👨🏻‍⚖️","👨🏼‍⚖️","👨🏽‍⚖️","👨🏾‍⚖️","👨🏿‍⚖️"],version:"4.0"},{emoji:"👩‍⚖️",category:1,name:"woman judge",variations:["👩🏻‍⚖️","👩🏼‍⚖️","👩🏽‍⚖️","👩🏾‍⚖️","👩🏿‍⚖️"],version:"4.0"},{emoji:"🧑‍🌾",category:1,name:"farmer",variations:["🧑🏻‍🌾","🧑🏼‍🌾","🧑🏽‍🌾","🧑🏾‍🌾","🧑🏿‍🌾"],version:"12.1"},{emoji:"👨‍🌾",category:1,name:"man farmer",variations:["👨🏻‍🌾","👨🏼‍🌾","👨🏽‍🌾","👨🏾‍🌾","👨🏿‍🌾"],version:"4.0"},{emoji:"👩‍🌾",category:1,name:"woman farmer",variations:["👩🏻‍🌾","👩🏼‍🌾","👩🏽‍🌾","👩🏾‍🌾","👩🏿‍🌾"],version:"4.0"},{emoji:"🧑‍🍳",category:1,name:"cook",variations:["🧑🏻‍🍳","🧑🏼‍🍳","🧑🏽‍🍳","🧑🏾‍🍳","🧑🏿‍🍳"],version:"12.1"},{emoji:"👨‍🍳",category:1,name:"man cook",variations:["👨🏻‍🍳","👨🏼‍🍳","👨🏽‍🍳","👨🏾‍🍳","👨🏿‍🍳"],version:"4.0"},{emoji:"👩‍🍳",category:1,name:"woman cook",variations:["👩🏻‍🍳","👩🏼‍🍳","👩🏽‍🍳","👩🏾‍🍳","👩🏿‍🍳"],version:"4.0"},{emoji:"🧑‍🔧",category:1,name:"mechanic",variations:["🧑🏻‍🔧","🧑🏼‍🔧","🧑🏽‍🔧","🧑🏾‍🔧","🧑🏿‍🔧"],version:"12.1"},{emoji:"👨‍🔧",category:1,name:"man mechanic",variations:["👨🏻‍🔧","👨🏼‍🔧","👨🏽‍🔧","👨🏾‍🔧","👨🏿‍🔧"],version:"4.0"},{emoji:"👩‍🔧",category:1,name:"woman mechanic",variations:["👩🏻‍🔧","👩🏼‍🔧","👩🏽‍🔧","👩🏾‍🔧","👩🏿‍🔧"],version:"4.0"},{emoji:"🧑‍🏭",category:1,name:"factory worker",variations:["🧑🏻‍🏭","🧑🏼‍🏭","🧑🏽‍🏭","🧑🏾‍🏭","🧑🏿‍🏭"],version:"12.1"},{emoji:"👨‍🏭",category:1,name:"man factory worker",variations:["👨🏻‍🏭","👨🏼‍🏭","👨🏽‍🏭","👨🏾‍🏭","👨🏿‍🏭"],version:"4.0"},{emoji:"👩‍🏭",category:1,name:"woman factory worker",variations:["👩🏻‍🏭","👩🏼‍🏭","👩🏽‍🏭","👩🏾‍🏭","👩🏿‍🏭"],version:"4.0"},{emoji:"🧑‍💼",category:1,name:"office worker",variations:["🧑🏻‍💼","🧑🏼‍💼","🧑🏽‍💼","🧑🏾‍💼","🧑🏿‍💼"],version:"12.1"},{emoji:"👨‍💼",category:1,name:"man office worker",variations:["👨🏻‍💼","👨🏼‍💼","👨🏽‍💼","👨🏾‍💼","👨🏿‍💼"],version:"4.0"},{emoji:"👩‍💼",category:1,name:"woman office worker",variations:["👩🏻‍💼","👩🏼‍💼","👩🏽‍💼","👩🏾‍💼","👩🏿‍💼"],version:"4.0"},{emoji:"🧑‍🔬",category:1,name:"scientist",variations:["🧑🏻‍🔬","🧑🏼‍🔬","🧑🏽‍🔬","🧑🏾‍🔬","🧑🏿‍🔬"],version:"12.1"},{emoji:"👨‍🔬",category:1,name:"man scientist",variations:["👨🏻‍🔬","👨🏼‍🔬","👨🏽‍🔬","👨🏾‍🔬","👨🏿‍🔬"],version:"4.0"},{emoji:"👩‍🔬",category:1,name:"woman scientist",variations:["👩🏻‍🔬","👩🏼‍🔬","👩🏽‍🔬","👩🏾‍🔬","👩🏿‍🔬"],version:"4.0"},{emoji:"🧑‍💻",category:1,name:"technologist",variations:["🧑🏻‍💻","🧑🏼‍💻","🧑🏽‍💻","🧑🏾‍💻","🧑🏿‍💻"],version:"12.1"},{emoji:"👨‍💻",category:1,name:"man technologist",variations:["👨🏻‍💻","👨🏼‍💻","👨🏽‍💻","👨🏾‍💻","👨🏿‍💻"],version:"4.0"},{emoji:"👩‍💻",category:1,name:"woman technologist",variations:["👩🏻‍💻","👩🏼‍💻","👩🏽‍💻","👩🏾‍💻","👩🏿‍💻"],version:"4.0"},{emoji:"🧑‍🎤",category:1,name:"singer",variations:["🧑🏻‍🎤","🧑🏼‍🎤","🧑🏽‍🎤","🧑🏾‍🎤","🧑🏿‍🎤"],version:"12.1"},{emoji:"👨‍🎤",category:1,name:"man singer",variations:["👨🏻‍🎤","👨🏼‍🎤","👨🏽‍🎤","👨🏾‍🎤","👨🏿‍🎤"],version:"4.0"},{emoji:"👩‍🎤",category:1,name:"woman singer",variations:["👩🏻‍🎤","👩🏼‍🎤","👩🏽‍🎤","👩🏾‍🎤","👩🏿‍🎤"],version:"4.0"},{emoji:"🧑‍🎨",category:1,name:"artist",variations:["🧑🏻‍🎨","🧑🏼‍🎨","🧑🏽‍🎨","🧑🏾‍🎨","🧑🏿‍🎨"],version:"12.1"},{emoji:"👨‍🎨",category:1,name:"man artist",variations:["👨🏻‍🎨","👨🏼‍🎨","👨🏽‍🎨","👨🏾‍🎨","👨🏿‍🎨"],version:"4.0"},{emoji:"👩‍🎨",category:1,name:"woman artist",variations:["👩🏻‍🎨","👩🏼‍🎨","👩🏽‍🎨","👩🏾‍🎨","👩🏿‍🎨"],version:"4.0"},{emoji:"🧑‍✈️",category:1,name:"pilot",variations:["🧑🏻‍✈️","🧑🏼‍✈️","🧑🏽‍✈️","🧑🏾‍✈️","🧑🏿‍✈️"],version:"12.1"},{emoji:"👨‍✈️",category:1,name:"man pilot",variations:["👨🏻‍✈️","👨🏼‍✈️","👨🏽‍✈️","👨🏾‍✈️","👨🏿‍✈️"],version:"4.0"},{emoji:"👩‍✈️",category:1,name:"woman pilot",variations:["👩🏻‍✈️","👩🏼‍✈️","👩🏽‍✈️","👩🏾‍✈️","👩🏿‍✈️"],version:"4.0"},{emoji:"🧑‍🚀",category:1,name:"astronaut",variations:["🧑🏻‍🚀","🧑🏼‍🚀","🧑🏽‍🚀","🧑🏾‍🚀","🧑🏿‍🚀"],version:"12.1"},{emoji:"👨‍🚀",category:1,name:"man astronaut",variations:["👨🏻‍🚀","👨🏼‍🚀","👨🏽‍🚀","👨🏾‍🚀","👨🏿‍🚀"],version:"4.0"},{emoji:"👩‍🚀",category:1,name:"woman astronaut",variations:["👩🏻‍🚀","👩🏼‍🚀","👩🏽‍🚀","👩🏾‍🚀","👩🏿‍🚀"],version:"4.0"},{emoji:"🧑‍🚒",category:1,name:"firefighter",variations:["🧑🏻‍🚒","🧑🏼‍🚒","🧑🏽‍🚒","🧑🏾‍🚒","🧑🏿‍🚒"],version:"12.1"},{emoji:"👨‍🚒",category:1,name:"man firefighter",variations:["👨🏻‍🚒","👨🏼‍🚒","👨🏽‍🚒","👨🏾‍🚒","👨🏿‍🚒"],version:"4.0"},{emoji:"👩‍🚒",category:1,name:"woman firefighter",variations:["👩🏻‍🚒","👩🏼‍🚒","👩🏽‍🚒","👩🏾‍🚒","👩🏿‍🚒"],version:"4.0"},{emoji:"👮",category:1,name:"police officer",variations:["👮🏻","👮🏼","👮🏽","👮🏾","👮🏿"],version:"1.0"},{emoji:"👮‍♂️",category:1,name:"man police officer",variations:["👮🏻‍♂️","👮🏼‍♂️","👮🏽‍♂️","👮🏾‍♂️","👮🏿‍♂️"],version:"4.0"},{emoji:"👮‍♀️",category:1,name:"woman police officer",variations:["👮🏻‍♀️","👮🏼‍♀️","👮🏽‍♀️","👮🏾‍♀️","👮🏿‍♀️"],version:"4.0"},{emoji:"🕵️",category:1,name:"detective",variations:["🕵🏻","🕵🏼","🕵🏽","🕵🏾","🕵🏿"],version:"1.0"},{emoji:"🕵️‍♂️",category:1,name:"man detective",variations:["🕵🏻‍♂️","🕵🏼‍♂️","🕵🏽‍♂️","🕵🏾‍♂️","🕵🏿‍♂️"],version:"4.0"},{emoji:"🕵️‍♀️",category:1,name:"woman detective",variations:["🕵🏻‍♀️","🕵🏼‍♀️","🕵🏽‍♀️","🕵🏾‍♀️","🕵🏿‍♀️"],version:"4.0"},{emoji:"💂",category:1,name:"guard",variations:["💂🏻","💂🏼","💂🏽","💂🏾","💂🏿"],version:"1.0"},{emoji:"💂‍♂️",category:1,name:"man guard",variations:["💂🏻‍♂️","💂🏼‍♂️","💂🏽‍♂️","💂🏾‍♂️","💂🏿‍♂️"],version:"4.0"},{emoji:"💂‍♀️",category:1,name:"woman guard",variations:["💂🏻‍♀️","💂🏼‍♀️","💂🏽‍♀️","💂🏾‍♀️","💂🏿‍♀️"],version:"4.0"},{emoji:"🥷",category:1,name:"ninja",variations:["🥷🏻","🥷🏼","🥷🏽","🥷🏾","🥷🏿"],version:"13.0"},{emoji:"👷",category:1,name:"construction worker",variations:["👷🏻","👷🏼","👷🏽","👷🏾","👷🏿"],version:"1.0"},{emoji:"👷‍♂️",category:1,name:"man construction worker",variations:["👷🏻‍♂️","👷🏼‍♂️","👷🏽‍♂️","👷🏾‍♂️","👷🏿‍♂️"],version:"4.0"},{emoji:"👷‍♀️",category:1,name:"woman construction worker",variations:["👷🏻‍♀️","👷🏼‍♀️","👷🏽‍♀️","👷🏾‍♀️","👷🏿‍♀️"],version:"4.0"},{emoji:"🤴",category:1,name:"prince",variations:["🤴🏻","🤴🏼","🤴🏽","🤴🏾","🤴🏿"],version:"3.0"},{emoji:"👸",category:1,name:"princess",variations:["👸🏻","👸🏼","👸🏽","👸🏾","👸🏿"],version:"1.0"},{emoji:"👳",category:1,name:"person wearing turban",variations:["👳🏻","👳🏼","👳🏽","👳🏾","👳🏿"],version:"1.0"},{emoji:"👳‍♂️",category:1,name:"man wearing turban",variations:["👳🏻‍♂️","👳🏼‍♂️","👳🏽‍♂️","👳🏾‍♂️","👳🏿‍♂️"],version:"4.0"},{emoji:"👳‍♀️",category:1,name:"woman wearing turban",variations:["👳🏻‍♀️","👳🏼‍♀️","👳🏽‍♀️","👳🏾‍♀️","👳🏿‍♀️"],version:"4.0"},{emoji:"👲",category:1,name:"person with skullcap",variations:["👲🏻","👲🏼","👲🏽","👲🏾","👲🏿"],version:"1.0"},{emoji:"🧕",category:1,name:"woman with headscarf",variations:["🧕🏻","🧕🏼","🧕🏽","🧕🏾","🧕🏿"],version:"5.0"},{emoji:"🤵",category:1,name:"person in tuxedo",variations:["🤵🏻","🤵🏼","🤵🏽","🤵🏾","🤵🏿"],version:"3.0"},{emoji:"🤵‍♂️",category:1,name:"man in tuxedo",variations:["🤵🏻‍♂️","🤵🏼‍♂️","🤵🏽‍♂️","🤵🏾‍♂️","🤵🏿‍♂️"],version:"13.0"},{emoji:"🤵‍♀️",category:1,name:"woman in tuxedo",variations:["🤵🏻‍♀️","🤵🏼‍♀️","🤵🏽‍♀️","🤵🏾‍♀️","🤵🏿‍♀️"],version:"13.0"},{emoji:"👰",category:1,name:"person with veil",variations:["👰🏻","👰🏼","👰🏽","👰🏾","👰🏿"],version:"1.0"},{emoji:"👰‍♂️",category:1,name:"man with veil",variations:["👰🏻‍♂️","👰🏼‍♂️","👰🏽‍♂️","👰🏾‍♂️","👰🏿‍♂️"],version:"13.0"},{emoji:"👰‍♀️",category:1,name:"woman with veil",variations:["👰🏻‍♀️","👰🏼‍♀️","👰🏽‍♀️","👰🏾‍♀️","👰🏿‍♀️"],version:"13.0"},{emoji:"🤰",category:1,name:"pregnant woman",variations:["🤰🏻","🤰🏼","🤰🏽","🤰🏾","🤰🏿"],version:"3.0"},{emoji:"🤱",category:1,name:"breast-feeding",variations:["🤱🏻","🤱🏼","🤱🏽","🤱🏾","🤱🏿"],version:"5.0"},{emoji:"👩‍🍼",category:1,name:"woman feeding baby",variations:["👩🏻‍🍼","👩🏼‍🍼","👩🏽‍🍼","👩🏾‍🍼","👩🏿‍🍼"],version:"13.0"},{emoji:"👨‍🍼",category:1,name:"man feeding baby",variations:["👨🏻‍🍼","👨🏼‍🍼","👨🏽‍🍼","👨🏾‍🍼","👨🏿‍🍼"],version:"13.0"},{emoji:"🧑‍🍼",category:1,name:"person feeding baby",variations:["🧑🏻‍🍼","🧑🏼‍🍼","🧑🏽‍🍼","🧑🏾‍🍼","🧑🏿‍🍼"],version:"13.0"},{emoji:"👼",category:1,name:"baby angel",variations:["👼🏻","👼🏼","👼🏽","👼🏾","👼🏿"],version:"1.0"},{emoji:"🎅",category:1,name:"Santa Claus",variations:["🎅🏻","🎅🏼","🎅🏽","🎅🏾","🎅🏿"],version:"1.0"},{emoji:"🤶",category:1,name:"Mrs. Claus",variations:["🤶🏻","🤶🏼","🤶🏽","🤶🏾","🤶🏿"],version:"3.0"},{emoji:"🧑‍🎄",category:1,name:"mx claus",variations:["🧑🏻‍🎄","🧑🏼‍🎄","🧑🏽‍🎄","🧑🏾‍🎄","🧑🏿‍🎄"],version:"13.0"},{emoji:"🦸",category:1,name:"superhero",variations:["🦸🏻","🦸🏼","🦸🏽","🦸🏾","🦸🏿"],version:"11.0"},{emoji:"🦸‍♂️",category:1,name:"man superhero",variations:["🦸🏻‍♂️","🦸🏼‍♂️","🦸🏽‍♂️","🦸🏾‍♂️","🦸🏿‍♂️"],version:"11.0"},{emoji:"🦸‍♀️",category:1,name:"woman superhero",variations:["🦸🏻‍♀️","🦸🏼‍♀️","🦸🏽‍♀️","🦸🏾‍♀️","🦸🏿‍♀️"],version:"11.0"},{emoji:"🦹",category:1,name:"supervillain",variations:["🦹🏻","🦹🏼","🦹🏽","🦹🏾","🦹🏿"],version:"11.0"},{emoji:"🦹‍♂️",category:1,name:"man supervillain",variations:["🦹🏻‍♂️","🦹🏼‍♂️","🦹🏽‍♂️","🦹🏾‍♂️","🦹🏿‍♂️"],version:"11.0"},{emoji:"🦹‍♀️",category:1,name:"woman supervillain",variations:["🦹🏻‍♀️","🦹🏼‍♀️","🦹🏽‍♀️","🦹🏾‍♀️","🦹🏿‍♀️"],version:"11.0"},{emoji:"🧙",category:1,name:"mage",variations:["🧙🏻","🧙🏼","🧙🏽","🧙🏾","🧙🏿"],version:"5.0"},{emoji:"🧙‍♂️",category:1,name:"man mage",variations:["🧙🏻‍♂️","🧙🏼‍♂️","🧙🏽‍♂️","🧙🏾‍♂️","🧙🏿‍♂️"],version:"5.0"},{emoji:"🧙‍♀️",category:1,name:"woman mage",variations:["🧙🏻‍♀️","🧙🏼‍♀️","🧙🏽‍♀️","🧙🏾‍♀️","🧙🏿‍♀️"],version:"5.0"},{emoji:"🧚",category:1,name:"fairy",variations:["🧚🏻","🧚🏼","🧚🏽","🧚🏾","🧚🏿"],version:"5.0"},{emoji:"🧚‍♂️",category:1,name:"man fairy",variations:["🧚🏻‍♂️","🧚🏼‍♂️","🧚🏽‍♂️","🧚🏾‍♂️","🧚🏿‍♂️"],version:"5.0"},{emoji:"🧚‍♀️",category:1,name:"woman fairy",variations:["🧚🏻‍♀️","🧚🏼‍♀️","🧚🏽‍♀️","🧚🏾‍♀️","🧚🏿‍♀️"],version:"5.0"},{emoji:"🧛",category:1,name:"vampire",variations:["🧛🏻","🧛🏼","🧛🏽","🧛🏾","🧛🏿"],version:"5.0"},{emoji:"🧛‍♂️",category:1,name:"man vampire",variations:["🧛🏻‍♂️","🧛🏼‍♂️","🧛🏽‍♂️","🧛🏾‍♂️","🧛🏿‍♂️"],version:"5.0"},{emoji:"🧛‍♀️",category:1,name:"woman vampire",variations:["🧛🏻‍♀️","🧛🏼‍♀️","🧛🏽‍♀️","🧛🏾‍♀️","🧛🏿‍♀️"],version:"5.0"},{emoji:"🧜",category:1,name:"merperson",variations:["🧜🏻","🧜🏼","🧜🏽","🧜🏾","🧜🏿"],version:"5.0"},{emoji:"🧜‍♂️",category:1,name:"merman",variations:["🧜🏻‍♂️","🧜🏼‍♂️","🧜🏽‍♂️","🧜🏾‍♂️","🧜🏿‍♂️"],version:"5.0"},{emoji:"🧜‍♀️",category:1,name:"mermaid",variations:["🧜🏻‍♀️","🧜🏼‍♀️","🧜🏽‍♀️","🧜🏾‍♀️","🧜🏿‍♀️"],version:"5.0"},{emoji:"🧝",category:1,name:"elf",variations:["🧝🏻","🧝🏼","🧝🏽","🧝🏾","🧝🏿"],version:"5.0"},{emoji:"🧝‍♂️",category:1,name:"man elf",variations:["🧝🏻‍♂️","🧝🏼‍♂️","🧝🏽‍♂️","🧝🏾‍♂️","🧝🏿‍♂️"],version:"5.0"},{emoji:"🧝‍♀️",category:1,name:"woman elf",variations:["🧝🏻‍♀️","🧝🏼‍♀️","🧝🏽‍♀️","🧝🏾‍♀️","🧝🏿‍♀️"],version:"5.0"},{emoji:"🧞",category:1,name:"genie",version:"5.0"},{emoji:"🧞‍♂️",category:1,name:"man genie",version:"5.0"},{emoji:"🧞‍♀️",category:1,name:"woman genie",version:"5.0"},{emoji:"🧟",category:1,name:"zombie",version:"5.0"},{emoji:"🧟‍♂️",category:1,name:"man zombie",version:"5.0"},{emoji:"🧟‍♀️",category:1,name:"woman zombie",version:"5.0"},{emoji:"💆",category:1,name:"person getting massage",variations:["💆🏻","💆🏼","💆🏽","💆🏾","💆🏿"],version:"1.0"},{emoji:"💆‍♂️",category:1,name:"man getting massage",variations:["💆🏻‍♂️","💆🏼‍♂️","💆🏽‍♂️","💆🏾‍♂️","💆🏿‍♂️"],version:"4.0"},{emoji:"💆‍♀️",category:1,name:"woman getting massage",variations:["💆🏻‍♀️","💆🏼‍♀️","💆🏽‍♀️","💆🏾‍♀️","💆🏿‍♀️"],version:"4.0"},{emoji:"💇",category:1,name:"person getting haircut",variations:["💇🏻","💇🏼","💇🏽","💇🏾","💇🏿"],version:"1.0"},{emoji:"💇‍♂️",category:1,name:"man getting haircut",variations:["💇🏻‍♂️","💇🏼‍♂️","💇🏽‍♂️","💇🏾‍♂️","💇🏿‍♂️"],version:"4.0"},{emoji:"💇‍♀️",category:1,name:"woman getting haircut",variations:["💇🏻‍♀️","💇🏼‍♀️","💇🏽‍♀️","💇🏾‍♀️","💇🏿‍♀️"],version:"4.0"},{emoji:"🚶",category:1,name:"person walking",variations:["🚶🏻","🚶🏼","🚶🏽","🚶🏾","🚶🏿"],version:"1.0"},{emoji:"🚶‍♂️",category:1,name:"man walking",variations:["🚶🏻‍♂️","🚶🏼‍♂️","🚶🏽‍♂️","🚶🏾‍♂️","🚶🏿‍♂️"],version:"4.0"},{emoji:"🚶‍♀️",category:1,name:"woman walking",variations:["🚶🏻‍♀️","🚶🏼‍♀️","🚶🏽‍♀️","🚶🏾‍♀️","🚶🏿‍♀️"],version:"4.0"},{emoji:"🧍",category:1,name:"person standing",variations:["🧍🏻","🧍🏼","🧍🏽","🧍🏾","🧍🏿"],version:"12.0"},{emoji:"🧍‍♂️",category:1,name:"man standing",variations:["🧍🏻‍♂️","🧍🏼‍♂️","🧍🏽‍♂️","🧍🏾‍♂️","🧍🏿‍♂️"],version:"12.0"},{emoji:"🧍‍♀️",category:1,name:"woman standing",variations:["🧍🏻‍♀️","🧍🏼‍♀️","🧍🏽‍♀️","🧍🏾‍♀️","🧍🏿‍♀️"],version:"12.0"},{emoji:"🧎",category:1,name:"person kneeling",variations:["🧎🏻","🧎🏼","🧎🏽","🧎🏾","🧎🏿"],version:"12.0"},{emoji:"🧎‍♂️",category:1,name:"man kneeling",variations:["🧎🏻‍♂️","🧎🏼‍♂️","🧎🏽‍♂️","🧎🏾‍♂️","🧎🏿‍♂️"],version:"12.0"},{emoji:"🧎‍♀️",category:1,name:"woman kneeling",variations:["🧎🏻‍♀️","🧎🏼‍♀️","🧎🏽‍♀️","🧎🏾‍♀️","🧎🏿‍♀️"],version:"12.0"},{emoji:"🧑‍🦯",category:1,name:"person with white cane",variations:["🧑🏻‍🦯","🧑🏼‍🦯","🧑🏽‍🦯","🧑🏾‍🦯","🧑🏿‍🦯"],version:"12.1"},{emoji:"👨‍🦯",category:1,name:"man with white cane",variations:["👨🏻‍🦯","👨🏼‍🦯","👨🏽‍🦯","👨🏾‍🦯","👨🏿‍🦯"],version:"12.0"},{emoji:"👩‍🦯",category:1,name:"woman with white cane",variations:["👩🏻‍🦯","👩🏼‍🦯","👩🏽‍🦯","👩🏾‍🦯","👩🏿‍🦯"],version:"12.0"},{emoji:"🧑‍🦼",category:1,name:"person in motorized wheelchair",variations:["🧑🏻‍🦼","🧑🏼‍🦼","🧑🏽‍🦼","🧑🏾‍🦼","🧑🏿‍🦼"],version:"12.1"},{emoji:"👨‍🦼",category:1,name:"man in motorized wheelchair",variations:["👨🏻‍🦼","👨🏼‍🦼","👨🏽‍🦼","👨🏾‍🦼","👨🏿‍🦼"],version:"12.0"},{emoji:"👩‍🦼",category:1,name:"woman in motorized wheelchair",variations:["👩🏻‍🦼","👩🏼‍🦼","👩🏽‍🦼","👩🏾‍🦼","👩🏿‍🦼"],version:"12.0"},{emoji:"🧑‍🦽",category:1,name:"person in manual wheelchair",variations:["🧑🏻‍🦽","🧑🏼‍🦽","🧑🏽‍🦽","🧑🏾‍🦽","🧑🏿‍🦽"],version:"12.1"},{emoji:"👨‍🦽",category:1,name:"man in manual wheelchair",variations:["👨🏻‍🦽","👨🏼‍🦽","👨🏽‍🦽","👨🏾‍🦽","👨🏿‍🦽"],version:"12.0"},{emoji:"👩‍🦽",category:1,name:"woman in manual wheelchair",variations:["👩🏻‍🦽","👩🏼‍🦽","👩🏽‍🦽","👩🏾‍🦽","👩🏿‍🦽"],version:"12.0"},{emoji:"🏃",category:1,name:"person running",variations:["🏃🏻","🏃🏼","🏃🏽","🏃🏾","🏃🏿"],version:"1.0"},{emoji:"🏃‍♂️",category:1,name:"man running",variations:["🏃🏻‍♂️","🏃🏼‍♂️","🏃🏽‍♂️","🏃🏾‍♂️","🏃🏿‍♂️"],version:"4.0"},{emoji:"🏃‍♀️",category:1,name:"woman running",variations:["🏃🏻‍♀️","🏃🏼‍♀️","🏃🏽‍♀️","🏃🏾‍♀️","🏃🏿‍♀️"],version:"4.0"},{emoji:"💃",category:1,name:"woman dancing",variations:["💃🏻","💃🏼","💃🏽","💃🏾","💃🏿"],version:"1.0"},{emoji:"🕺",category:1,name:"man dancing",variations:["🕺🏻","🕺🏼","🕺🏽","🕺🏾","🕺🏿"],version:"3.0"},{emoji:"🕴️",category:1,name:"person in suit levitating",variations:["🕴🏻","🕴🏼","🕴🏽","🕴🏾","🕴🏿"],version:"1.0"},{emoji:"👯",category:1,name:"people with bunny ears",version:"1.0"},{emoji:"👯‍♂️",category:1,name:"men with bunny ears",version:"4.0"},{emoji:"👯‍♀️",category:1,name:"women with bunny ears",version:"4.0"},{emoji:"🧖",category:1,name:"person in steamy room",variations:["🧖🏻","🧖🏼","🧖🏽","🧖🏾","🧖🏿"],version:"5.0"},{emoji:"🧖‍♂️",category:1,name:"man in steamy room",variations:["🧖🏻‍♂️","🧖🏼‍♂️","🧖🏽‍♂️","🧖🏾‍♂️","🧖🏿‍♂️"],version:"5.0"},{emoji:"🧖‍♀️",category:1,name:"woman in steamy room",variations:["🧖🏻‍♀️","🧖🏼‍♀️","🧖🏽‍♀️","🧖🏾‍♀️","🧖🏿‍♀️"],version:"5.0"},{emoji:"🧗",category:1,name:"person climbing",variations:["🧗🏻","🧗🏼","🧗🏽","🧗🏾","🧗🏿"],version:"5.0"},{emoji:"🧗‍♂️",category:1,name:"man climbing",variations:["🧗🏻‍♂️","🧗🏼‍♂️","🧗🏽‍♂️","🧗🏾‍♂️","🧗🏿‍♂️"],version:"5.0"},{emoji:"🧗‍♀️",category:1,name:"woman climbing",variations:["🧗🏻‍♀️","🧗🏼‍♀️","🧗🏽‍♀️","🧗🏾‍♀️","🧗🏿‍♀️"],version:"5.0"},{emoji:"🤺",category:1,name:"person fencing",version:"3.0"},{emoji:"🏇",category:1,name:"horse racing",variations:["🏇🏻","🏇🏼","🏇🏽","🏇🏾","🏇🏿"],version:"1.0"},{emoji:"⛷️",category:1,name:"skier",version:"1.0"},{emoji:"🏂",category:1,name:"snowboarder",variations:["🏂🏻","🏂🏼","🏂🏽","🏂🏾","🏂🏿"],version:"1.0"},{emoji:"🏌️",category:1,name:"person golfing",variations:["🏌🏻","🏌🏼","🏌🏽","🏌🏾","🏌🏿"],version:"1.0"},{emoji:"🏌️‍♂️",category:1,name:"man golfing",variations:["🏌🏻‍♂️","🏌🏼‍♂️","🏌🏽‍♂️","🏌🏾‍♂️","🏌🏿‍♂️"],version:"4.0"},{emoji:"🏌️‍♀️",category:1,name:"woman golfing",variations:["🏌🏻‍♀️","🏌🏼‍♀️","🏌🏽‍♀️","🏌🏾‍♀️","🏌🏿‍♀️"],version:"4.0"},{emoji:"🏄",category:1,name:"person surfing",variations:["🏄🏻","🏄🏼","🏄🏽","🏄🏾","🏄🏿"],version:"1.0"},{emoji:"🏄‍♂️",category:1,name:"man surfing",variations:["🏄🏻‍♂️","🏄🏼‍♂️","🏄🏽‍♂️","🏄🏾‍♂️","🏄🏿‍♂️"],version:"4.0"},{emoji:"🏄‍♀️",category:1,name:"woman surfing",variations:["🏄🏻‍♀️","🏄🏼‍♀️","🏄🏽‍♀️","🏄🏾‍♀️","🏄🏿‍♀️"],version:"4.0"},{emoji:"🚣",category:1,name:"person rowing boat",variations:["🚣🏻","🚣🏼","🚣🏽","🚣🏾","🚣🏿"],version:"1.0"},{emoji:"🚣‍♂️",category:1,name:"man rowing boat",variations:["🚣🏻‍♂️","🚣🏼‍♂️","🚣🏽‍♂️","🚣🏾‍♂️","🚣🏿‍♂️"],version:"4.0"},{emoji:"🚣‍♀️",category:1,name:"woman rowing boat",variations:["🚣🏻‍♀️","🚣🏼‍♀️","🚣🏽‍♀️","🚣🏾‍♀️","🚣🏿‍♀️"],version:"4.0"},{emoji:"🏊",category:1,name:"person swimming",variations:["🏊🏻","🏊🏼","🏊🏽","🏊🏾","🏊🏿"],version:"1.0"},{emoji:"🏊‍♂️",category:1,name:"man swimming",variations:["🏊🏻‍♂️","🏊🏼‍♂️","🏊🏽‍♂️","🏊🏾‍♂️","🏊🏿‍♂️"],version:"4.0"},{emoji:"🏊‍♀️",category:1,name:"woman swimming",variations:["🏊🏻‍♀️","🏊🏼‍♀️","🏊🏽‍♀️","🏊🏾‍♀️","🏊🏿‍♀️"],version:"4.0"},{emoji:"⛹️",category:1,name:"person bouncing ball",variations:["⛹🏻","⛹🏼","⛹🏽","⛹🏾","⛹🏿"],version:"1.0"},{emoji:"⛹️‍♂️",category:1,name:"man bouncing ball",variations:["⛹🏻‍♂️","⛹🏼‍♂️","⛹🏽‍♂️","⛹🏾‍♂️","⛹🏿‍♂️"],version:"4.0"},{emoji:"⛹️‍♀️",category:1,name:"woman bouncing ball",variations:["⛹🏻‍♀️","⛹🏼‍♀️","⛹🏽‍♀️","⛹🏾‍♀️","⛹🏿‍♀️"],version:"4.0"},{emoji:"🏋️",category:1,name:"person lifting weights",variations:["🏋🏻","🏋🏼","🏋🏽","🏋🏾","🏋🏿"],version:"1.0"},{emoji:"🏋️‍♂️",category:1,name:"man lifting weights",variations:["🏋🏻‍♂️","🏋🏼‍♂️","🏋🏽‍♂️","🏋🏾‍♂️","🏋🏿‍♂️"],version:"4.0"},{emoji:"🏋️‍♀️",category:1,name:"woman lifting weights",variations:["🏋🏻‍♀️","🏋🏼‍♀️","🏋🏽‍♀️","🏋🏾‍♀️","🏋🏿‍♀️"],version:"4.0"},{emoji:"🚴",category:1,name:"person biking",variations:["🚴🏻","🚴🏼","🚴🏽","🚴🏾","🚴🏿"],version:"1.0"},{emoji:"🚴‍♂️",category:1,name:"man biking",variations:["🚴🏻‍♂️","🚴🏼‍♂️","🚴🏽‍♂️","🚴🏾‍♂️","🚴🏿‍♂️"],version:"4.0"},{emoji:"🚴‍♀️",category:1,name:"woman biking",variations:["🚴🏻‍♀️","🚴🏼‍♀️","🚴🏽‍♀️","🚴🏾‍♀️","🚴🏿‍♀️"],version:"4.0"},{emoji:"🚵",category:1,name:"person mountain biking",variations:["🚵🏻","🚵🏼","🚵🏽","🚵🏾","🚵🏿"],version:"1.0"},{emoji:"🚵‍♂️",category:1,name:"man mountain biking",variations:["🚵🏻‍♂️","🚵🏼‍♂️","🚵🏽‍♂️","🚵🏾‍♂️","🚵🏿‍♂️"],version:"4.0"},{emoji:"🚵‍♀️",category:1,name:"woman mountain biking",variations:["🚵🏻‍♀️","🚵🏼‍♀️","🚵🏽‍♀️","🚵🏾‍♀️","🚵🏿‍♀️"],version:"4.0"},{emoji:"🤸",category:1,name:"person cartwheeling",variations:["🤸🏻","🤸🏼","🤸🏽","🤸🏾","🤸🏿"],version:"3.0"},{emoji:"🤸‍♂️",category:1,name:"man cartwheeling",variations:["🤸🏻‍♂️","🤸🏼‍♂️","🤸🏽‍♂️","🤸🏾‍♂️","🤸🏿‍♂️"],version:"4.0"},{emoji:"🤸‍♀️",category:1,name:"woman cartwheeling",variations:["🤸🏻‍♀️","🤸🏼‍♀️","🤸🏽‍♀️","🤸🏾‍♀️","🤸🏿‍♀️"],version:"4.0"},{emoji:"🤼",category:1,name:"people wrestling",version:"3.0"},{emoji:"🤼‍♂️",category:1,name:"men wrestling",version:"4.0"},{emoji:"🤼‍♀️",category:1,name:"women wrestling",version:"4.0"},{emoji:"🤽",category:1,name:"person playing water polo",variations:["🤽🏻","🤽🏼","🤽🏽","🤽🏾","🤽🏿"],version:"3.0"},{emoji:"🤽‍♂️",category:1,name:"man playing water polo",variations:["🤽🏻‍♂️","🤽🏼‍♂️","🤽🏽‍♂️","🤽🏾‍♂️","🤽🏿‍♂️"],version:"4.0"},{emoji:"🤽‍♀️",category:1,name:"woman playing water polo",variations:["🤽🏻‍♀️","🤽🏼‍♀️","🤽🏽‍♀️","🤽🏾‍♀️","🤽🏿‍♀️"],version:"4.0"},{emoji:"🤾",category:1,name:"person playing handball",variations:["🤾🏻","🤾🏼","🤾🏽","🤾🏾","🤾🏿"],version:"3.0"},{emoji:"🤾‍♂️",category:1,name:"man playing handball",variations:["🤾🏻‍♂️","🤾🏼‍♂️","🤾🏽‍♂️","🤾🏾‍♂️","🤾🏿‍♂️"],version:"4.0"},{emoji:"🤾‍♀️",category:1,name:"woman playing handball",variations:["🤾🏻‍♀️","🤾🏼‍♀️","🤾🏽‍♀️","🤾🏾‍♀️","🤾🏿‍♀️"],version:"4.0"},{emoji:"🤹",category:1,name:"person juggling",variations:["🤹🏻","🤹🏼","🤹🏽","🤹🏾","🤹🏿"],version:"3.0"},{emoji:"🤹‍♂️",category:1,name:"man juggling",variations:["🤹🏻‍♂️","🤹🏼‍♂️","🤹🏽‍♂️","🤹🏾‍♂️","🤹🏿‍♂️"],version:"4.0"},{emoji:"🤹‍♀️",category:1,name:"woman juggling",variations:["🤹🏻‍♀️","🤹🏼‍♀️","🤹🏽‍♀️","🤹🏾‍♀️","🤹🏿‍♀️"],version:"4.0"},{emoji:"🧘",category:1,name:"person in lotus position",variations:["🧘🏻","🧘🏼","🧘🏽","🧘🏾","🧘🏿"],version:"5.0"},{emoji:"🧘‍♂️",category:1,name:"man in lotus position",variations:["🧘🏻‍♂️","🧘🏼‍♂️","🧘🏽‍♂️","🧘🏾‍♂️","🧘🏿‍♂️"],version:"5.0"},{emoji:"🧘‍♀️",category:1,name:"woman in lotus position",variations:["🧘🏻‍♀️","🧘🏼‍♀️","🧘🏽‍♀️","🧘🏾‍♀️","🧘🏿‍♀️"],version:"5.0"},{emoji:"🛀",category:1,name:"person taking bath",variations:["🛀🏻","🛀🏼","🛀🏽","🛀🏾","🛀🏿"],version:"1.0"},{emoji:"🛌",category:1,name:"person in bed",variations:["🛌🏻","🛌🏼","🛌🏽","🛌🏾","🛌🏿"],version:"1.0"},{emoji:"🧑‍🤝‍🧑",category:1,name:"people holding hands",variations:["🧑🏻‍🤝‍🧑🏻","🧑🏻‍🤝‍🧑🏼","🧑🏻‍🤝‍🧑🏽","🧑🏻‍🤝‍🧑🏾","🧑🏻‍🤝‍🧑🏿","🧑🏼‍🤝‍🧑🏻","🧑🏼‍🤝‍🧑🏼","🧑🏼‍🤝‍🧑🏽","🧑🏼‍🤝‍🧑🏾","🧑🏼‍🤝‍🧑🏿","🧑🏽‍🤝‍🧑🏻","🧑🏽‍🤝‍🧑🏼","🧑🏽‍🤝‍🧑🏽","🧑🏽‍🤝‍🧑🏾","🧑🏽‍🤝‍🧑🏿","🧑🏾‍🤝‍🧑🏻","🧑🏾‍🤝‍🧑🏼","🧑🏾‍🤝‍🧑🏽","🧑🏾‍🤝‍🧑🏾","🧑🏾‍🤝‍🧑🏿","🧑🏿‍🤝‍🧑🏻","🧑🏿‍🤝‍🧑🏼","🧑🏿‍🤝‍🧑🏽","🧑🏿‍🤝‍🧑🏾","🧑🏿‍🤝‍🧑🏿"],version:"12.0"},{emoji:"👭",category:1,name:"women holding hands",variations:["👭🏻","👩🏻‍🤝‍👩🏼","👩🏻‍🤝‍👩🏽","👩🏻‍🤝‍👩🏾","👩🏻‍🤝‍👩🏿","👩🏼‍🤝‍👩🏻","👭🏼","👩🏼‍🤝‍👩🏽","👩🏼‍🤝‍👩🏾","👩🏼‍🤝‍👩🏿","👩🏽‍🤝‍👩🏻","👩🏽‍🤝‍👩🏼","👭🏽","👩🏽‍🤝‍👩🏾","👩🏽‍🤝‍👩🏿","👩🏾‍🤝‍👩🏻","👩🏾‍🤝‍👩🏼","👩🏾‍🤝‍👩🏽","👭🏾","👩🏾‍🤝‍👩🏿","👩🏿‍🤝‍👩🏻","👩🏿‍🤝‍👩🏼","👩🏿‍🤝‍👩🏽","👩🏿‍🤝‍👩🏾","👭🏿"],version:"1.0"},{emoji:"👫",category:1,name:"woman and man holding hands",variations:["👫🏻","👩🏻‍🤝‍👨🏼","👩🏻‍🤝‍👨🏽","👩🏻‍🤝‍👨🏾","👩🏻‍🤝‍👨🏿","👩🏼‍🤝‍👨🏻","👫🏼","👩🏼‍🤝‍👨🏽","👩🏼‍🤝‍👨🏾","👩🏼‍🤝‍👨🏿","👩🏽‍🤝‍👨🏻","👩🏽‍🤝‍👨🏼","👫🏽","👩🏽‍🤝‍👨🏾","👩🏽‍🤝‍👨🏿","👩🏾‍🤝‍👨🏻","👩🏾‍🤝‍👨🏼","👩🏾‍🤝‍👨🏽","👫🏾","👩🏾‍🤝‍👨🏿","👩🏿‍🤝‍👨🏻","👩🏿‍🤝‍👨🏼","👩🏿‍🤝‍👨🏽","👩🏿‍🤝‍👨🏾","👫🏿"],version:"1.0"},{emoji:"👬",category:1,name:"men holding hands",variations:["👬🏻","👨🏻‍🤝‍👨🏼","👨🏻‍🤝‍👨🏽","👨🏻‍🤝‍👨🏾","👨🏻‍🤝‍👨🏿","👨🏼‍🤝‍👨🏻","👬🏼","👨🏼‍🤝‍👨🏽","👨🏼‍🤝‍👨🏾","👨🏼‍🤝‍👨🏿","👨🏽‍🤝‍👨🏻","👨🏽‍🤝‍👨🏼","👬🏽","👨🏽‍🤝‍👨🏾","👨🏽‍🤝‍👨🏿","👨🏾‍🤝‍👨🏻","👨🏾‍🤝‍👨🏼","👨🏾‍🤝‍👨🏽","👬🏾","👨🏾‍🤝‍👨🏿","👨🏿‍🤝‍👨🏻","👨🏿‍🤝‍👨🏼","👨🏿‍🤝‍👨🏽","👨🏿‍🤝‍👨🏾","👬🏿"],version:"1.0"},{emoji:"💏",category:1,name:"kiss",variations:["👩‍❤️‍💋‍👨","👨‍❤️‍💋‍👨","👩‍❤️‍💋‍👩"],version:"1.0"},{emoji:"💑",category:1,name:"couple with heart",variations:["👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩"],version:"1.0"},{emoji:"👪",category:1,name:"family",version:"1.0"},{emoji:"👨‍👩‍👦",category:1,name:"family: man, woman, boy",version:"2.0"},{emoji:"👨‍👩‍👧",category:1,name:"family: man, woman, girl",version:"2.0"},{emoji:"👨‍👩‍👧‍👦",category:1,name:"family: man, woman, girl, boy",version:"2.0"},{emoji:"👨‍👩‍👦‍👦",category:1,name:"family: man, woman, boy, boy",version:"2.0"},{emoji:"👨‍👩‍👧‍👧",category:1,name:"family: man, woman, girl, girl",version:"2.0"},{emoji:"👨‍👨‍👦",category:1,name:"family: man, man, boy",version:"2.0"},{emoji:"👨‍👨‍👧",category:1,name:"family: man, man, girl",version:"2.0"},{emoji:"👨‍👨‍👧‍👦",category:1,name:"family: man, man, girl, boy",version:"2.0"},{emoji:"👨‍👨‍👦‍👦",category:1,name:"family: man, man, boy, boy",version:"2.0"},{emoji:"👨‍👨‍👧‍👧",category:1,name:"family: man, man, girl, girl",version:"2.0"},{emoji:"👩‍👩‍👦",category:1,name:"family: woman, woman, boy",version:"2.0"},{emoji:"👩‍👩‍👧",category:1,name:"family: woman, woman, girl",version:"2.0"},{emoji:"👩‍👩‍👧‍👦",category:1,name:"family: woman, woman, girl, boy",version:"2.0"},{emoji:"👩‍👩‍👦‍👦",category:1,name:"family: woman, woman, boy, boy",version:"2.0"},{emoji:"👩‍👩‍👧‍👧",category:1,name:"family: woman, woman, girl, girl",version:"2.0"},{emoji:"👨‍👦",category:1,name:"family: man, boy",version:"4.0"},{emoji:"👨‍👦‍👦",category:1,name:"family: man, boy, boy",version:"4.0"},{emoji:"👨‍👧",category:1,name:"family: man, girl",version:"4.0"},{emoji:"👨‍👧‍👦",category:1,name:"family: man, girl, boy",version:"4.0"},{emoji:"👨‍👧‍👧",category:1,name:"family: man, girl, girl",version:"4.0"},{emoji:"👩‍👦",category:1,name:"family: woman, boy",version:"4.0"},{emoji:"👩‍👦‍👦",category:1,name:"family: woman, boy, boy",version:"4.0"},{emoji:"👩‍👧",category:1,name:"family: woman, girl",version:"4.0"},{emoji:"👩‍👧‍👦",category:1,name:"family: woman, girl, boy",version:"4.0"},{emoji:"👩‍👧‍👧",category:1,name:"family: woman, girl, girl",version:"4.0"},{emoji:"🗣️",category:1,name:"speaking head",version:"1.0"},{emoji:"👤",category:1,name:"bust in silhouette",version:"1.0"},{emoji:"👥",category:1,name:"busts in silhouette",version:"1.0"},{emoji:"🫂",category:1,name:"people hugging",version:"13.0"},{emoji:"👣",category:1,name:"footprints",version:"1.0"},{emoji:"🐵",category:2,name:"monkey face",version:"1.0"},{emoji:"🐒",category:2,name:"monkey",version:"1.0"},{emoji:"🦍",category:2,name:"gorilla",version:"3.0"},{emoji:"🦧",category:2,name:"orangutan",version:"12.0"},{emoji:"🐶",category:2,name:"dog face",version:"1.0"},{emoji:"🐕",category:2,name:"dog",version:"1.0"},{emoji:"🦮",category:2,name:"guide dog",version:"12.0"},{emoji:"🐕‍🦺",category:2,name:"service dog",version:"12.0"},{emoji:"🐩",category:2,name:"poodle",version:"1.0"},{emoji:"🐺",category:2,name:"wolf",version:"1.0"},{emoji:"🦊",category:2,name:"fox",version:"3.0"},{emoji:"🦝",category:2,name:"raccoon",version:"11.0"},{emoji:"🐱",category:2,name:"cat face",version:"1.0"},{emoji:"🐈",category:2,name:"cat",version:"1.0"},{emoji:"🐈‍⬛",category:2,name:"black cat",version:"13.0"},{emoji:"🦁",category:2,name:"lion",version:"1.0"},{emoji:"🐯",category:2,name:"tiger face",version:"1.0"},{emoji:"🐅",category:2,name:"tiger",version:"1.0"},{emoji:"🐆",category:2,name:"leopard",version:"1.0"},{emoji:"🐴",category:2,name:"horse face",version:"1.0"},{emoji:"🐎",category:2,name:"horse",version:"1.0"},{emoji:"🦄",category:2,name:"unicorn",version:"1.0"},{emoji:"🦓",category:2,name:"zebra",version:"5.0"},{emoji:"🦌",category:2,name:"deer",version:"3.0"},{emoji:"🦬",category:2,name:"bison",version:"13.0"},{emoji:"🐮",category:2,name:"cow face",version:"1.0"},{emoji:"🐂",category:2,name:"ox",version:"1.0"},{emoji:"🐃",category:2,name:"water buffalo",version:"1.0"},{emoji:"🐄",category:2,name:"cow",version:"1.0"},{emoji:"🐷",category:2,name:"pig face",version:"1.0"},{emoji:"🐖",category:2,name:"pig",version:"1.0"},{emoji:"🐗",category:2,name:"boar",version:"1.0"},{emoji:"🐽",category:2,name:"pig nose",version:"1.0"},{emoji:"🐏",category:2,name:"ram",version:"1.0"},{emoji:"🐑",category:2,name:"ewe",version:"1.0"},{emoji:"🐐",category:2,name:"goat",version:"1.0"},{emoji:"🐪",category:2,name:"camel",version:"1.0"},{emoji:"🐫",category:2,name:"two-hump camel",version:"1.0"},{emoji:"🦙",category:2,name:"llama",version:"11.0"},{emoji:"🦒",category:2,name:"giraffe",version:"5.0"},{emoji:"🐘",category:2,name:"elephant",version:"1.0"},{emoji:"🦣",category:2,name:"mammoth",version:"13.0"},{emoji:"🦏",category:2,name:"rhinoceros",version:"3.0"},{emoji:"🦛",category:2,name:"hippopotamus",version:"11.0"},{emoji:"🐭",category:2,name:"mouse face",version:"1.0"},{emoji:"🐁",category:2,name:"mouse",version:"1.0"},{emoji:"🐀",category:2,name:"rat",version:"1.0"},{emoji:"🐹",category:2,name:"hamster",version:"1.0"},{emoji:"🐰",category:2,name:"rabbit face",version:"1.0"},{emoji:"🐇",category:2,name:"rabbit",version:"1.0"},{emoji:"🐿️",category:2,name:"chipmunk",version:"1.0"},{emoji:"🦫",category:2,name:"beaver",version:"13.0"},{emoji:"🦔",category:2,name:"hedgehog",version:"5.0"},{emoji:"🦇",category:2,name:"bat",version:"3.0"},{emoji:"🐻",category:2,name:"bear",version:"1.0"},{emoji:"🐻‍❄️",category:2,name:"polar bear",version:"13.0"},{emoji:"🐨",category:2,name:"koala",version:"1.0"},{emoji:"🐼",category:2,name:"panda",version:"1.0"},{emoji:"🦥",category:2,name:"sloth",version:"12.0"},{emoji:"🦦",category:2,name:"otter",version:"12.0"},{emoji:"🦨",category:2,name:"skunk",version:"12.0"},{emoji:"🦘",category:2,name:"kangaroo",version:"11.0"},{emoji:"🦡",category:2,name:"badger",version:"11.0"},{emoji:"🐾",category:2,name:"paw prints",version:"1.0"},{emoji:"🦃",category:2,name:"turkey",version:"1.0"},{emoji:"🐔",category:2,name:"chicken",version:"1.0"},{emoji:"🐓",category:2,name:"rooster",version:"1.0"},{emoji:"🐣",category:2,name:"hatching chick",version:"1.0"},{emoji:"🐤",category:2,name:"baby chick",version:"1.0"},{emoji:"🐥",category:2,name:"front-facing baby chick",version:"1.0"},{emoji:"🐦",category:2,name:"bird",version:"1.0"},{emoji:"🐧",category:2,name:"penguin",version:"1.0"},{emoji:"🕊️",category:2,name:"dove",version:"1.0"},{emoji:"🦅",category:2,name:"eagle",version:"3.0"},{emoji:"🦆",category:2,name:"duck",version:"3.0"},{emoji:"🦢",category:2,name:"swan",version:"11.0"},{emoji:"🦉",category:2,name:"owl",version:"3.0"},{emoji:"🦤",category:2,name:"dodo",version:"13.0"},{emoji:"🪶",category:2,name:"feather",version:"13.0"},{emoji:"🦩",category:2,name:"flamingo",version:"12.0"},{emoji:"🦚",category:2,name:"peacock",version:"11.0"},{emoji:"🦜",category:2,name:"parrot",version:"11.0"},{emoji:"🐸",category:2,name:"frog",version:"1.0"},{emoji:"🐊",category:2,name:"crocodile",version:"1.0"},{emoji:"🐢",category:2,name:"turtle",version:"1.0"},{emoji:"🦎",category:2,name:"lizard",version:"3.0"},{emoji:"🐍",category:2,name:"snake",version:"1.0"},{emoji:"🐲",category:2,name:"dragon face",version:"1.0"},{emoji:"🐉",category:2,name:"dragon",version:"1.0"},{emoji:"🦕",category:2,name:"sauropod",version:"5.0"},{emoji:"🦖",category:2,name:"T-Rex",version:"5.0"},{emoji:"🐳",category:2,name:"spouting whale",version:"1.0"},{emoji:"🐋",category:2,name:"whale",version:"1.0"},{emoji:"🐬",category:2,name:"dolphin",version:"1.0"},{emoji:"🦭",category:2,name:"seal",version:"13.0"},{emoji:"🐟",category:2,name:"fish",version:"1.0"},{emoji:"🐠",category:2,name:"tropical fish",version:"1.0"},{emoji:"🐡",category:2,name:"blowfish",version:"1.0"},{emoji:"🦈",category:2,name:"shark",version:"3.0"},{emoji:"🐙",category:2,name:"octopus",version:"1.0"},{emoji:"🐚",category:2,name:"spiral shell",version:"1.0"},{emoji:"🐌",category:2,name:"snail",version:"1.0"},{emoji:"🦋",category:2,name:"butterfly",version:"3.0"},{emoji:"🐛",category:2,name:"bug",version:"1.0"},{emoji:"🐜",category:2,name:"ant",version:"1.0"},{emoji:"🐝",category:2,name:"honeybee",version:"1.0"},{emoji:"🪲",category:2,name:"beetle",version:"13.0"},{emoji:"🐞",category:2,name:"lady beetle",version:"1.0"},{emoji:"🦗",category:2,name:"cricket",version:"5.0"},{emoji:"🪳",category:2,name:"cockroach",version:"13.0"},{emoji:"🕷️",category:2,name:"spider",version:"1.0"},{emoji:"🕸️",category:2,name:"spider web",version:"1.0"},{emoji:"🦂",category:2,name:"scorpion",version:"1.0"},{emoji:"🦟",category:2,name:"mosquito",version:"11.0"},{emoji:"🪰",category:2,name:"fly",version:"13.0"},{emoji:"🪱",category:2,name:"worm",version:"13.0"},{emoji:"🦠",category:2,name:"microbe",version:"11.0"},{emoji:"💐",category:2,name:"bouquet",version:"1.0"},{emoji:"🌸",category:2,name:"cherry blossom",version:"1.0"},{emoji:"💮",category:2,name:"white flower",version:"1.0"},{emoji:"🏵️",category:2,name:"rosette",version:"1.0"},{emoji:"🌹",category:2,name:"rose",version:"1.0"},{emoji:"🥀",category:2,name:"wilted flower",version:"3.0"},{emoji:"🌺",category:2,name:"hibiscus",version:"1.0"},{emoji:"🌻",category:2,name:"sunflower",version:"1.0"},{emoji:"🌼",category:2,name:"blossom",version:"1.0"},{emoji:"🌷",category:2,name:"tulip",version:"1.0"},{emoji:"🌱",category:2,name:"seedling",version:"1.0"},{emoji:"🪴",category:2,name:"potted plant",version:"13.0"},{emoji:"🌲",category:2,name:"evergreen tree",version:"1.0"},{emoji:"🌳",category:2,name:"deciduous tree",version:"1.0"},{emoji:"🌴",category:2,name:"palm tree",version:"1.0"},{emoji:"🌵",category:2,name:"cactus",version:"1.0"},{emoji:"🌾",category:2,name:"sheaf of rice",version:"1.0"},{emoji:"🌿",category:2,name:"herb",version:"1.0"},{emoji:"☘️",category:2,name:"shamrock",version:"1.0"},{emoji:"🍀",category:2,name:"four leaf clover",version:"1.0"},{emoji:"🍁",category:2,name:"maple leaf",version:"1.0"},{emoji:"🍂",category:2,name:"fallen leaf",version:"1.0"},{emoji:"🍃",category:2,name:"leaf fluttering in wind",version:"1.0"},{emoji:"🍇",category:3,name:"grapes",version:"1.0"},{emoji:"🍈",category:3,name:"melon",version:"1.0"},{emoji:"🍉",category:3,name:"watermelon",version:"1.0"},{emoji:"🍊",category:3,name:"tangerine",version:"1.0"},{emoji:"🍋",category:3,name:"lemon",version:"1.0"},{emoji:"🍌",category:3,name:"banana",version:"1.0"},{emoji:"🍍",category:3,name:"pineapple",version:"1.0"},{emoji:"🥭",category:3,name:"mango",version:"11.0"},{emoji:"🍎",category:3,name:"red apple",version:"1.0"},{emoji:"🍏",category:3,name:"green apple",version:"1.0"},{emoji:"🍐",category:3,name:"pear",version:"1.0"},{emoji:"🍑",category:3,name:"peach",version:"1.0"},{emoji:"🍒",category:3,name:"cherries",version:"1.0"},{emoji:"🍓",category:3,name:"strawberry",version:"1.0"},{emoji:"🫐",category:3,name:"blueberries",version:"13.0"},{emoji:"🥝",category:3,name:"kiwi fruit",version:"3.0"},{emoji:"🍅",category:3,name:"tomato",version:"1.0"},{emoji:"🫒",category:3,name:"olive",version:"13.0"},{emoji:"🥥",category:3,name:"coconut",version:"5.0"},{emoji:"🥑",category:3,name:"avocado",version:"3.0"},{emoji:"🍆",category:3,name:"eggplant",version:"1.0"},{emoji:"🥔",category:3,name:"potato",version:"3.0"},{emoji:"🥕",category:3,name:"carrot",version:"3.0"},{emoji:"🌽",category:3,name:"ear of corn",version:"1.0"},{emoji:"🌶️",category:3,name:"hot pepper",version:"1.0"},{emoji:"🫑",category:3,name:"bell pepper",version:"13.0"},{emoji:"🥒",category:3,name:"cucumber",version:"3.0"},{emoji:"🥬",category:3,name:"leafy green",version:"11.0"},{emoji:"🥦",category:3,name:"broccoli",version:"5.0"},{emoji:"🧄",category:3,name:"garlic",version:"12.0"},{emoji:"🧅",category:3,name:"onion",version:"12.0"},{emoji:"🍄",category:3,name:"mushroom",version:"1.0"},{emoji:"🥜",category:3,name:"peanuts",version:"3.0"},{emoji:"🌰",category:3,name:"chestnut",version:"1.0"},{emoji:"🍞",category:3,name:"bread",version:"1.0"},{emoji:"🥐",category:3,name:"croissant",version:"3.0"},{emoji:"🥖",category:3,name:"baguette bread",version:"3.0"},{emoji:"🫓",category:3,name:"flatbread",version:"13.0"},{emoji:"🥨",category:3,name:"pretzel",version:"5.0"},{emoji:"🥯",category:3,name:"bagel",version:"11.0"},{emoji:"🥞",category:3,name:"pancakes",version:"3.0"},{emoji:"🧇",category:3,name:"waffle",version:"12.0"},{emoji:"🧀",category:3,name:"cheese wedge",version:"1.0"},{emoji:"🍖",category:3,name:"meat on bone",version:"1.0"},{emoji:"🍗",category:3,name:"poultry leg",version:"1.0"},{emoji:"🥩",category:3,name:"cut of meat",version:"5.0"},{emoji:"🥓",category:3,name:"bacon",version:"3.0"},{emoji:"🍔",category:3,name:"hamburger",version:"1.0"},{emoji:"🍟",category:3,name:"french fries",version:"1.0"},{emoji:"🍕",category:3,name:"pizza",version:"1.0"},{emoji:"🌭",category:3,name:"hot dog",version:"1.0"},{emoji:"🥪",category:3,name:"sandwich",version:"5.0"},{emoji:"🌮",category:3,name:"taco",version:"1.0"},{emoji:"🌯",category:3,name:"burrito",version:"1.0"},{emoji:"🫔",category:3,name:"tamale",version:"13.0"},{emoji:"🥙",category:3,name:"stuffed flatbread",version:"3.0"},{emoji:"🧆",category:3,name:"falafel",version:"12.0"},{emoji:"🥚",category:3,name:"egg",version:"3.0"},{emoji:"🍳",category:3,name:"cooking",version:"1.0"},{emoji:"🥘",category:3,name:"shallow pan of food",version:"3.0"},{emoji:"🍲",category:3,name:"pot of food",version:"1.0"},{emoji:"🫕",category:3,name:"fondue",version:"13.0"},{emoji:"🥣",category:3,name:"bowl with spoon",version:"5.0"},{emoji:"🥗",category:3,name:"green salad",version:"3.0"},{emoji:"🍿",category:3,name:"popcorn",version:"1.0"},{emoji:"🧈",category:3,name:"butter",version:"12.0"},{emoji:"🧂",category:3,name:"salt",version:"11.0"},{emoji:"🥫",category:3,name:"canned food",version:"5.0"},{emoji:"🍱",category:3,name:"bento box",version:"1.0"},{emoji:"🍘",category:3,name:"rice cracker",version:"1.0"},{emoji:"🍙",category:3,name:"rice ball",version:"1.0"},{emoji:"🍚",category:3,name:"cooked rice",version:"1.0"},{emoji:"🍛",category:3,name:"curry rice",version:"1.0"},{emoji:"🍜",category:3,name:"steaming bowl",version:"1.0"},{emoji:"🍝",category:3,name:"spaghetti",version:"1.0"},{emoji:"🍠",category:3,name:"roasted sweet potato",version:"1.0"},{emoji:"🍢",category:3,name:"oden",version:"1.0"},{emoji:"🍣",category:3,name:"sushi",version:"1.0"},{emoji:"🍤",category:3,name:"fried shrimp",version:"1.0"},{emoji:"🍥",category:3,name:"fish cake with swirl",version:"1.0"},{emoji:"🥮",category:3,name:"moon cake",version:"11.0"},{emoji:"🍡",category:3,name:"dango",version:"1.0"},{emoji:"🥟",category:3,name:"dumpling",version:"5.0"},{emoji:"🥠",category:3,name:"fortune cookie",version:"5.0"},{emoji:"🥡",category:3,name:"takeout box",version:"5.0"},{emoji:"🦀",category:3,name:"crab",version:"1.0"},{emoji:"🦞",category:3,name:"lobster",version:"11.0"},{emoji:"🦐",category:3,name:"shrimp",version:"3.0"},{emoji:"🦑",category:3,name:"squid",version:"3.0"},{emoji:"🦪",category:3,name:"oyster",version:"12.0"},{emoji:"🍦",category:3,name:"soft ice cream",version:"1.0"},{emoji:"🍧",category:3,name:"shaved ice",version:"1.0"},{emoji:"🍨",category:3,name:"ice cream",version:"1.0"},{emoji:"🍩",category:3,name:"doughnut",version:"1.0"},{emoji:"🍪",category:3,name:"cookie",version:"1.0"},{emoji:"🎂",category:3,name:"birthday cake",version:"1.0"},{emoji:"🍰",category:3,name:"shortcake",version:"1.0"},{emoji:"🧁",category:3,name:"cupcake",version:"11.0"},{emoji:"🥧",category:3,name:"pie",version:"5.0"},{emoji:"🍫",category:3,name:"chocolate bar",version:"1.0"},{emoji:"🍬",category:3,name:"candy",version:"1.0"},{emoji:"🍭",category:3,name:"lollipop",version:"1.0"},{emoji:"🍮",category:3,name:"custard",version:"1.0"},{emoji:"🍯",category:3,name:"honey pot",version:"1.0"},{emoji:"🍼",category:3,name:"baby bottle",version:"1.0"},{emoji:"🥛",category:3,name:"glass of milk",version:"3.0"},{emoji:"☕",category:3,name:"hot beverage",version:"1.0"},{emoji:"🫖",category:3,name:"teapot",version:"13.0"},{emoji:"🍵",category:3,name:"teacup without handle",version:"1.0"},{emoji:"🍶",category:3,name:"sake",version:"1.0"},{emoji:"🍾",category:3,name:"bottle with popping cork",version:"1.0"},{emoji:"🍷",category:3,name:"wine glass",version:"1.0"},{emoji:"🍸",category:3,name:"cocktail glass",version:"1.0"},{emoji:"🍹",category:3,name:"tropical drink",version:"1.0"},{emoji:"🍺",category:3,name:"beer mug",version:"1.0"},{emoji:"🍻",category:3,name:"clinking beer mugs",version:"1.0"},{emoji:"🥂",category:3,name:"clinking glasses",version:"3.0"},{emoji:"🥃",category:3,name:"tumbler glass",version:"3.0"},{emoji:"🥤",category:3,name:"cup with straw",version:"5.0"},{emoji:"🧋",category:3,name:"bubble tea",version:"13.0"},{emoji:"🧃",category:3,name:"beverage box",version:"12.0"},{emoji:"🧉",category:3,name:"mate",version:"12.0"},{emoji:"🧊",category:3,name:"ice",version:"12.0"},{emoji:"🥢",category:3,name:"chopsticks",version:"5.0"},{emoji:"🍽️",category:3,name:"fork and knife with plate",version:"1.0"},{emoji:"🍴",category:3,name:"fork and knife",version:"1.0"},{emoji:"🥄",category:3,name:"spoon",version:"3.0"},{emoji:"🔪",category:3,name:"kitchen knife",version:"1.0"},{emoji:"🏺",category:3,name:"amphora",version:"1.0"},{emoji:"🌍",category:4,name:"globe showing Europe-Africa",version:"1.0"},{emoji:"🌎",category:4,name:"globe showing Americas",version:"1.0"},{emoji:"🌏",category:4,name:"globe showing Asia-Australia",version:"1.0"},{emoji:"🌐",category:4,name:"globe with meridians",version:"1.0"},{emoji:"🗺️",category:4,name:"world map",version:"1.0"},{emoji:"🗾",category:4,name:"map of Japan",version:"1.0"},{emoji:"🧭",category:4,name:"compass",version:"11.0"},{emoji:"🏔️",category:4,name:"snow-capped mountain",version:"1.0"},{emoji:"⛰️",category:4,name:"mountain",version:"1.0"},{emoji:"🌋",category:4,name:"volcano",version:"1.0"},{emoji:"🗻",category:4,name:"mount fuji",version:"1.0"},{emoji:"🏕️",category:4,name:"camping",version:"1.0"},{emoji:"🏖️",category:4,name:"beach with umbrella",version:"1.0"},{emoji:"🏜️",category:4,name:"desert",version:"1.0"},{emoji:"🏝️",category:4,name:"desert island",version:"1.0"},{emoji:"🏞️",category:4,name:"national park",version:"1.0"},{emoji:"🏟️",category:4,name:"stadium",version:"1.0"},{emoji:"🏛️",category:4,name:"classical building",version:"1.0"},{emoji:"🏗️",category:4,name:"building construction",version:"1.0"},{emoji:"🧱",category:4,name:"brick",version:"11.0"},{emoji:"🪨",category:4,name:"rock",version:"13.0"},{emoji:"🪵",category:4,name:"wood",version:"13.0"},{emoji:"🛖",category:4,name:"hut",version:"13.0"},{emoji:"🏘️",category:4,name:"houses",version:"1.0"},{emoji:"🏚️",category:4,name:"derelict house",version:"1.0"},{emoji:"🏠",category:4,name:"house",version:"1.0"},{emoji:"🏡",category:4,name:"house with garden",version:"1.0"},{emoji:"🏢",category:4,name:"office building",version:"1.0"},{emoji:"🏣",category:4,name:"Japanese post office",version:"1.0"},{emoji:"🏤",category:4,name:"post office",version:"1.0"},{emoji:"🏥",category:4,name:"hospital",version:"1.0"},{emoji:"🏦",category:4,name:"bank",version:"1.0"},{emoji:"🏨",category:4,name:"hotel",version:"1.0"},{emoji:"🏩",category:4,name:"love hotel",version:"1.0"},{emoji:"🏪",category:4,name:"convenience store",version:"1.0"},{emoji:"🏫",category:4,name:"school",version:"1.0"},{emoji:"🏬",category:4,name:"department store",version:"1.0"},{emoji:"🏭",category:4,name:"factory",version:"1.0"},{emoji:"🏯",category:4,name:"Japanese castle",version:"1.0"},{emoji:"🏰",category:4,name:"castle",version:"1.0"},{emoji:"💒",category:4,name:"wedding",version:"1.0"},{emoji:"🗼",category:4,name:"Tokyo tower",version:"1.0"},{emoji:"🗽",category:4,name:"Statue of Liberty",version:"1.0"},{emoji:"⛪",category:4,name:"church",version:"1.0"},{emoji:"🕌",category:4,name:"mosque",version:"1.0"},{emoji:"🛕",category:4,name:"hindu temple",version:"12.0"},{emoji:"🕍",category:4,name:"synagogue",version:"1.0"},{emoji:"⛩️",category:4,name:"shinto shrine",version:"1.0"},{emoji:"🕋",category:4,name:"kaaba",version:"1.0"},{emoji:"⛲",category:4,name:"fountain",version:"1.0"},{emoji:"⛺",category:4,name:"tent",version:"1.0"},{emoji:"🌁",category:4,name:"foggy",version:"1.0"},{emoji:"🌃",category:4,name:"night with stars",version:"1.0"},{emoji:"🏙️",category:4,name:"cityscape",version:"1.0"},{emoji:"🌄",category:4,name:"sunrise over mountains",version:"1.0"},{emoji:"🌅",category:4,name:"sunrise",version:"1.0"},{emoji:"🌆",category:4,name:"cityscape at dusk",version:"1.0"},{emoji:"🌇",category:4,name:"sunset",version:"1.0"},{emoji:"🌉",category:4,name:"bridge at night",version:"1.0"},{emoji:"♨️",category:4,name:"hot springs",version:"1.0"},{emoji:"🎠",category:4,name:"carousel horse",version:"1.0"},{emoji:"🎡",category:4,name:"ferris wheel",version:"1.0"},{emoji:"🎢",category:4,name:"roller coaster",version:"1.0"},{emoji:"💈",category:4,name:"barber pole",version:"1.0"},{emoji:"🎪",category:4,name:"circus tent",version:"1.0"},{emoji:"🚂",category:4,name:"locomotive",version:"1.0"},{emoji:"🚃",category:4,name:"railway car",version:"1.0"},{emoji:"🚄",category:4,name:"high-speed train",version:"1.0"},{emoji:"🚅",category:4,name:"bullet train",version:"1.0"},{emoji:"🚆",category:4,name:"train",version:"1.0"},{emoji:"🚇",category:4,name:"metro",version:"1.0"},{emoji:"🚈",category:4,name:"light rail",version:"1.0"},{emoji:"🚉",category:4,name:"station",version:"1.0"},{emoji:"🚊",category:4,name:"tram",version:"1.0"},{emoji:"🚝",category:4,name:"monorail",version:"1.0"},{emoji:"🚞",category:4,name:"mountain railway",version:"1.0"},{emoji:"🚋",category:4,name:"tram car",version:"1.0"},{emoji:"🚌",category:4,name:"bus",version:"1.0"},{emoji:"🚍",category:4,name:"oncoming bus",version:"1.0"},{emoji:"🚎",category:4,name:"trolleybus",version:"1.0"},{emoji:"🚐",category:4,name:"minibus",version:"1.0"},{emoji:"🚑",category:4,name:"ambulance",version:"1.0"},{emoji:"🚒",category:4,name:"fire engine",version:"1.0"},{emoji:"🚓",category:4,name:"police car",version:"1.0"},{emoji:"🚔",category:4,name:"oncoming police car",version:"1.0"},{emoji:"🚕",category:4,name:"taxi",version:"1.0"},{emoji:"🚖",category:4,name:"oncoming taxi",version:"1.0"},{emoji:"🚗",category:4,name:"automobile",version:"1.0"},{emoji:"🚘",category:4,name:"oncoming automobile",version:"1.0"},{emoji:"🚙",category:4,name:"sport utility vehicle",version:"1.0"},{emoji:"🛻",category:4,name:"pickup truck",version:"13.0"},{emoji:"🚚",category:4,name:"delivery truck",version:"1.0"},{emoji:"🚛",category:4,name:"articulated lorry",version:"1.0"},{emoji:"🚜",category:4,name:"tractor",version:"1.0"},{emoji:"🏎️",category:4,name:"racing car",version:"1.0"},{emoji:"🏍️",category:4,name:"motorcycle",version:"1.0"},{emoji:"🛵",category:4,name:"motor scooter",version:"3.0"},{emoji:"🦽",category:4,name:"manual wheelchair",version:"12.0"},{emoji:"🦼",category:4,name:"motorized wheelchair",version:"12.0"},{emoji:"🛺",category:4,name:"auto rickshaw",version:"12.0"},{emoji:"🚲",category:4,name:"bicycle",version:"1.0"},{emoji:"🛴",category:4,name:"kick scooter",version:"3.0"},{emoji:"🛹",category:4,name:"skateboard",version:"11.0"},{emoji:"🛼",category:4,name:"roller skate",version:"13.0"},{emoji:"🚏",category:4,name:"bus stop",version:"1.0"},{emoji:"🛣️",category:4,name:"motorway",version:"1.0"},{emoji:"🛤️",category:4,name:"railway track",version:"1.0"},{emoji:"🛢️",category:4,name:"oil drum",version:"1.0"},{emoji:"⛽",category:4,name:"fuel pump",version:"1.0"},{emoji:"🚨",category:4,name:"police car light",version:"1.0"},{emoji:"🚥",category:4,name:"horizontal traffic light",version:"1.0"},{emoji:"🚦",category:4,name:"vertical traffic light",version:"1.0"},{emoji:"🛑",category:4,name:"stop sign",version:"3.0"},{emoji:"🚧",category:4,name:"construction",version:"1.0"},{emoji:"⚓",category:4,name:"anchor",version:"1.0"},{emoji:"⛵",category:4,name:"sailboat",version:"1.0"},{emoji:"🛶",category:4,name:"canoe",version:"3.0"},{emoji:"🚤",category:4,name:"speedboat",version:"1.0"},{emoji:"🛳️",category:4,name:"passenger ship",version:"1.0"},{emoji:"⛴️",category:4,name:"ferry",version:"1.0"},{emoji:"🛥️",category:4,name:"motor boat",version:"1.0"},{emoji:"🚢",category:4,name:"ship",version:"1.0"},{emoji:"✈️",category:4,name:"airplane",version:"1.0"},{emoji:"🛩️",category:4,name:"small airplane",version:"1.0"},{emoji:"🛫",category:4,name:"airplane departure",version:"1.0"},{emoji:"🛬",category:4,name:"airplane arrival",version:"1.0"},{emoji:"🪂",category:4,name:"parachute",version:"12.0"},{emoji:"💺",category:4,name:"seat",version:"1.0"},{emoji:"🚁",category:4,name:"helicopter",version:"1.0"},{emoji:"🚟",category:4,name:"suspension railway",version:"1.0"},{emoji:"🚠",category:4,name:"mountain cableway",version:"1.0"},{emoji:"🚡",category:4,name:"aerial tramway",version:"1.0"},{emoji:"🛰️",category:4,name:"satellite",version:"1.0"},{emoji:"🚀",category:4,name:"rocket",version:"1.0"},{emoji:"🛸",category:4,name:"flying saucer",version:"5.0"},{emoji:"🛎️",category:4,name:"bellhop bell",version:"1.0"},{emoji:"🧳",category:4,name:"luggage",version:"11.0"},{emoji:"⌛",category:4,name:"hourglass done",version:"1.0"},{emoji:"⏳",category:4,name:"hourglass not done",version:"1.0"},{emoji:"⌚",category:4,name:"watch",version:"1.0"},{emoji:"⏰",category:4,name:"alarm clock",version:"1.0"},{emoji:"⏱️",category:4,name:"stopwatch",version:"1.0"},{emoji:"⏲️",category:4,name:"timer clock",version:"1.0"},{emoji:"🕰️",category:4,name:"mantelpiece clock",version:"1.0"},{emoji:"🕛",category:4,name:"twelve o’clock",version:"1.0"},{emoji:"🕧",category:4,name:"twelve-thirty",version:"1.0"},{emoji:"🕐",category:4,name:"one o’clock",version:"1.0"},{emoji:"🕜",category:4,name:"one-thirty",version:"1.0"},{emoji:"🕑",category:4,name:"two o’clock",version:"1.0"},{emoji:"🕝",category:4,name:"two-thirty",version:"1.0"},{emoji:"🕒",category:4,name:"three o’clock",version:"1.0"},{emoji:"🕞",category:4,name:"three-thirty",version:"1.0"},{emoji:"🕓",category:4,name:"four o’clock",version:"1.0"},{emoji:"🕟",category:4,name:"four-thirty",version:"1.0"},{emoji:"🕔",category:4,name:"five o’clock",version:"1.0"},{emoji:"🕠",category:4,name:"five-thirty",version:"1.0"},{emoji:"🕕",category:4,name:"six o’clock",version:"1.0"},{emoji:"🕡",category:4,name:"six-thirty",version:"1.0"},{emoji:"🕖",category:4,name:"seven o’clock",version:"1.0"},{emoji:"🕢",category:4,name:"seven-thirty",version:"1.0"},{emoji:"🕗",category:4,name:"eight o’clock",version:"1.0"},{emoji:"🕣",category:4,name:"eight-thirty",version:"1.0"},{emoji:"🕘",category:4,name:"nine o’clock",version:"1.0"},{emoji:"🕤",category:4,name:"nine-thirty",version:"1.0"},{emoji:"🕙",category:4,name:"ten o’clock",version:"1.0"},{emoji:"🕥",category:4,name:"ten-thirty",version:"1.0"},{emoji:"🕚",category:4,name:"eleven o’clock",version:"1.0"},{emoji:"🕦",category:4,name:"eleven-thirty",version:"1.0"},{emoji:"🌑",category:4,name:"new moon",version:"1.0"},{emoji:"🌒",category:4,name:"waxing crescent moon",version:"1.0"},{emoji:"🌓",category:4,name:"first quarter moon",version:"1.0"},{emoji:"🌔",category:4,name:"waxing gibbous moon",version:"1.0"},{emoji:"🌕",category:4,name:"full moon",version:"1.0"},{emoji:"🌖",category:4,name:"waning gibbous moon",version:"1.0"},{emoji:"🌗",category:4,name:"last quarter moon",version:"1.0"},{emoji:"🌘",category:4,name:"waning crescent moon",version:"1.0"},{emoji:"🌙",category:4,name:"crescent moon",version:"1.0"},{emoji:"🌚",category:4,name:"new moon face",version:"1.0"},{emoji:"🌛",category:4,name:"first quarter moon face",version:"1.0"},{emoji:"🌜",category:4,name:"last quarter moon face",version:"1.0"},{emoji:"🌡️",category:4,name:"thermometer",version:"1.0"},{emoji:"☀️",category:4,name:"sun",version:"1.0"},{emoji:"🌝",category:4,name:"full moon face",version:"1.0"},{emoji:"🌞",category:4,name:"sun with face",version:"1.0"},{emoji:"🪐",category:4,name:"ringed planet",version:"12.0"},{emoji:"⭐",category:4,name:"star",version:"1.0"},{emoji:"🌟",category:4,name:"glowing star",version:"1.0"},{emoji:"🌠",category:4,name:"shooting star",version:"1.0"},{emoji:"🌌",category:4,name:"milky way",version:"1.0"},{emoji:"☁️",category:4,name:"cloud",version:"1.0"},{emoji:"⛅",category:4,name:"sun behind cloud",version:"1.0"},{emoji:"⛈️",category:4,name:"cloud with lightning and rain",version:"1.0"},{emoji:"🌤️",category:4,name:"sun behind small cloud",version:"1.0"},{emoji:"🌥️",category:4,name:"sun behind large cloud",version:"1.0"},{emoji:"🌦️",category:4,name:"sun behind rain cloud",version:"1.0"},{emoji:"🌧️",category:4,name:"cloud with rain",version:"1.0"},{emoji:"🌨️",category:4,name:"cloud with snow",version:"1.0"},{emoji:"🌩️",category:4,name:"cloud with lightning",version:"1.0"},{emoji:"🌪️",category:4,name:"tornado",version:"1.0"},{emoji:"🌫️",category:4,name:"fog",version:"1.0"},{emoji:"🌬️",category:4,name:"wind face",version:"1.0"},{emoji:"🌀",category:4,name:"cyclone",version:"1.0"},{emoji:"🌈",category:4,name:"rainbow",version:"1.0"},{emoji:"🌂",category:4,name:"closed umbrella",version:"1.0"},{emoji:"☂️",category:4,name:"umbrella",version:"1.0"},{emoji:"☔",category:4,name:"umbrella with rain drops",version:"1.0"},{emoji:"⛱️",category:4,name:"umbrella on ground",version:"1.0"},{emoji:"⚡",category:4,name:"high voltage",version:"1.0"},{emoji:"❄️",category:4,name:"snowflake",version:"1.0"},{emoji:"☃️",category:4,name:"snowman",version:"1.0"},{emoji:"⛄",category:4,name:"snowman without snow",version:"1.0"},{emoji:"☄️",category:4,name:"comet",version:"1.0"},{emoji:"🔥",category:4,name:"fire",version:"1.0"},{emoji:"💧",category:4,name:"droplet",version:"1.0"},{emoji:"🌊",category:4,name:"water wave",version:"1.0"},{emoji:"🎃",category:5,name:"jack-o-lantern",version:"1.0"},{emoji:"🎄",category:5,name:"Christmas tree",version:"1.0"},{emoji:"🎆",category:5,name:"fireworks",version:"1.0"},{emoji:"🎇",category:5,name:"sparkler",version:"1.0"},{emoji:"🧨",category:5,name:"firecracker",version:"11.0"},{emoji:"✨",category:5,name:"sparkles",version:"1.0"},{emoji:"🎈",category:5,name:"balloon",version:"1.0"},{emoji:"🎉",category:5,name:"party popper",version:"1.0"},{emoji:"🎊",category:5,name:"confetti ball",version:"1.0"},{emoji:"🎋",category:5,name:"tanabata tree",version:"1.0"},{emoji:"🎍",category:5,name:"pine decoration",version:"1.0"},{emoji:"🎎",category:5,name:"Japanese dolls",version:"1.0"},{emoji:"🎏",category:5,name:"carp streamer",version:"1.0"},{emoji:"🎐",category:5,name:"wind chime",version:"1.0"},{emoji:"🎑",category:5,name:"moon viewing ceremony",version:"1.0"},{emoji:"🧧",category:5,name:"red envelope",version:"11.0"},{emoji:"🎀",category:5,name:"ribbon",version:"1.0"},{emoji:"🎁",category:5,name:"wrapped gift",version:"1.0"},{emoji:"🎗️",category:5,name:"reminder ribbon",version:"1.0"},{emoji:"🎟️",category:5,name:"admission tickets",version:"1.0"},{emoji:"🎫",category:5,name:"ticket",version:"1.0"},{emoji:"🎖️",category:5,name:"military medal",version:"1.0"},{emoji:"🏆",category:5,name:"trophy",version:"1.0"},{emoji:"🏅",category:5,name:"sports medal",version:"1.0"},{emoji:"🥇",category:5,name:"1st place medal",version:"3.0"},{emoji:"🥈",category:5,name:"2nd place medal",version:"3.0"},{emoji:"🥉",category:5,name:"3rd place medal",version:"3.0"},{emoji:"⚽",category:5,name:"soccer ball",version:"1.0"},{emoji:"⚾",category:5,name:"baseball",version:"1.0"},{emoji:"🥎",category:5,name:"softball",version:"11.0"},{emoji:"🏀",category:5,name:"basketball",version:"1.0"},{emoji:"🏐",category:5,name:"volleyball",version:"1.0"},{emoji:"🏈",category:5,name:"american football",version:"1.0"},{emoji:"🏉",category:5,name:"rugby football",version:"1.0"},{emoji:"🎾",category:5,name:"tennis",version:"1.0"},{emoji:"🥏",category:5,name:"flying disc",version:"11.0"},{emoji:"🎳",category:5,name:"bowling",version:"1.0"},{emoji:"🏏",category:5,name:"cricket game",version:"1.0"},{emoji:"🏑",category:5,name:"field hockey",version:"1.0"},{emoji:"🏒",category:5,name:"ice hockey",version:"1.0"},{emoji:"🥍",category:5,name:"lacrosse",version:"11.0"},{emoji:"🏓",category:5,name:"ping pong",version:"1.0"},{emoji:"🏸",category:5,name:"badminton",version:"1.0"},{emoji:"🥊",category:5,name:"boxing glove",version:"3.0"},{emoji:"🥋",category:5,name:"martial arts uniform",version:"3.0"},{emoji:"🥅",category:5,name:"goal net",version:"3.0"},{emoji:"⛳",category:5,name:"flag in hole",version:"1.0"},{emoji:"⛸️",category:5,name:"ice skate",version:"1.0"},{emoji:"🎣",category:5,name:"fishing pole",version:"1.0"},{emoji:"🤿",category:5,name:"diving mask",version:"12.0"},{emoji:"🎽",category:5,name:"running shirt",version:"1.0"},{emoji:"🎿",category:5,name:"skis",version:"1.0"},{emoji:"🛷",category:5,name:"sled",version:"5.0"},{emoji:"🥌",category:5,name:"curling stone",version:"5.0"},{emoji:"🎯",category:5,name:"direct hit",version:"1.0"},{emoji:"🪀",category:5,name:"yo-yo",version:"12.0"},{emoji:"🪁",category:5,name:"kite",version:"12.0"},{emoji:"🎱",category:5,name:"pool 8 ball",version:"1.0"},{emoji:"🔮",category:5,name:"crystal ball",version:"1.0"},{emoji:"🪄",category:5,name:"magic wand",version:"13.0"},{emoji:"🧿",category:5,name:"nazar amulet",version:"11.0"},{emoji:"🎮",category:5,name:"video game",version:"1.0"},{emoji:"🕹️",category:5,name:"joystick",version:"1.0"},{emoji:"🎰",category:5,name:"slot machine",version:"1.0"},{emoji:"🎲",category:5,name:"game die",version:"1.0"},{emoji:"🧩",category:5,name:"puzzle piece",version:"11.0"},{emoji:"🧸",category:5,name:"teddy bear",version:"11.0"},{emoji:"🪅",category:5,name:"piñata",version:"13.0"},{emoji:"🪆",category:5,name:"nesting dolls",version:"13.0"},{emoji:"♠️",category:5,name:"spade suit",version:"1.0"},{emoji:"♥️",category:5,name:"heart suit",version:"1.0"},{emoji:"♦️",category:5,name:"diamond suit",version:"1.0"},{emoji:"♣️",category:5,name:"club suit",version:"1.0"},{emoji:"♟️",category:5,name:"chess pawn",version:"11.0"},{emoji:"🃏",category:5,name:"joker",version:"1.0"},{emoji:"🀄",category:5,name:"mahjong red dragon",version:"1.0"},{emoji:"🎴",category:5,name:"flower playing cards",version:"1.0"},{emoji:"🎭",category:5,name:"performing arts",version:"1.0"},{emoji:"🖼️",category:5,name:"framed picture",version:"1.0"},{emoji:"🎨",category:5,name:"artist palette",version:"1.0"},{emoji:"🧵",category:5,name:"thread",version:"11.0"},{emoji:"🪡",category:5,name:"sewing needle",version:"13.0"},{emoji:"🧶",category:5,name:"yarn",version:"11.0"},{emoji:"🪢",category:5,name:"knot",version:"13.0"},{emoji:"👓",category:6,name:"glasses",version:"1.0"},{emoji:"🕶️",category:6,name:"sunglasses",version:"1.0"},{emoji:"🥽",category:6,name:"goggles",version:"11.0"},{emoji:"🥼",category:6,name:"lab coat",version:"11.0"},{emoji:"🦺",category:6,name:"safety vest",version:"12.0"},{emoji:"👔",category:6,name:"necktie",version:"1.0"},{emoji:"👕",category:6,name:"t-shirt",version:"1.0"},{emoji:"👖",category:6,name:"jeans",version:"1.0"},{emoji:"🧣",category:6,name:"scarf",version:"5.0"},{emoji:"🧤",category:6,name:"gloves",version:"5.0"},{emoji:"🧥",category:6,name:"coat",version:"5.0"},{emoji:"🧦",category:6,name:"socks",version:"5.0"},{emoji:"👗",category:6,name:"dress",version:"1.0"},{emoji:"👘",category:6,name:"kimono",version:"1.0"},{emoji:"🥻",category:6,name:"sari",version:"12.0"},{emoji:"🩱",category:6,name:"one-piece swimsuit",version:"12.0"},{emoji:"🩲",category:6,name:"briefs",version:"12.0"},{emoji:"🩳",category:6,name:"shorts",version:"12.0"},{emoji:"👙",category:6,name:"bikini",version:"1.0"},{emoji:"👚",category:6,name:"woman’s clothes",version:"1.0"},{emoji:"👛",category:6,name:"purse",version:"1.0"},{emoji:"👜",category:6,name:"handbag",version:"1.0"},{emoji:"👝",category:6,name:"clutch bag",version:"1.0"},{emoji:"🛍️",category:6,name:"shopping bags",version:"1.0"},{emoji:"🎒",category:6,name:"backpack",version:"1.0"},{emoji:"🩴",category:6,name:"thong sandal",version:"13.0"},{emoji:"👞",category:6,name:"man’s shoe",version:"1.0"},{emoji:"👟",category:6,name:"running shoe",version:"1.0"},{emoji:"🥾",category:6,name:"hiking boot",version:"11.0"},{emoji:"🥿",category:6,name:"flat shoe",version:"11.0"},{emoji:"👠",category:6,name:"high-heeled shoe",version:"1.0"},{emoji:"👡",category:6,name:"woman’s sandal",version:"1.0"},{emoji:"🩰",category:6,name:"ballet shoes",version:"12.0"},{emoji:"👢",category:6,name:"woman’s boot",version:"1.0"},{emoji:"👑",category:6,name:"crown",version:"1.0"},{emoji:"👒",category:6,name:"woman’s hat",version:"1.0"},{emoji:"🎩",category:6,name:"top hat",version:"1.0"},{emoji:"🎓",category:6,name:"graduation cap",version:"1.0"},{emoji:"🧢",category:6,name:"billed cap",version:"5.0"},{emoji:"🪖",category:6,name:"military helmet",version:"13.0"},{emoji:"⛑️",category:6,name:"rescue worker’s helmet",version:"1.0"},{emoji:"📿",category:6,name:"prayer beads",version:"1.0"},{emoji:"💄",category:6,name:"lipstick",version:"1.0"},{emoji:"💍",category:6,name:"ring",version:"1.0"},{emoji:"💎",category:6,name:"gem stone",version:"1.0"},{emoji:"🔇",category:6,name:"muted speaker",version:"1.0"},{emoji:"🔈",category:6,name:"speaker low volume",version:"1.0"},{emoji:"🔉",category:6,name:"speaker medium volume",version:"1.0"},{emoji:"🔊",category:6,name:"speaker high volume",version:"1.0"},{emoji:"📢",category:6,name:"loudspeaker",version:"1.0"},{emoji:"📣",category:6,name:"megaphone",version:"1.0"},{emoji:"📯",category:6,name:"postal horn",version:"1.0"},{emoji:"🔔",category:6,name:"bell",version:"1.0"},{emoji:"🔕",category:6,name:"bell with slash",version:"1.0"},{emoji:"🎼",category:6,name:"musical score",version:"1.0"},{emoji:"🎵",category:6,name:"musical note",version:"1.0"},{emoji:"🎶",category:6,name:"musical notes",version:"1.0"},{emoji:"🎙️",category:6,name:"studio microphone",version:"1.0"},{emoji:"🎚️",category:6,name:"level slider",version:"1.0"},{emoji:"🎛️",category:6,name:"control knobs",version:"1.0"},{emoji:"🎤",category:6,name:"microphone",version:"1.0"},{emoji:"🎧",category:6,name:"headphone",version:"1.0"},{emoji:"📻",category:6,name:"radio",version:"1.0"},{emoji:"🎷",category:6,name:"saxophone",version:"1.0"},{emoji:"🪗",category:6,name:"accordion",version:"13.0"},{emoji:"🎸",category:6,name:"guitar",version:"1.0"},{emoji:"🎹",category:6,name:"musical keyboard",version:"1.0"},{emoji:"🎺",category:6,name:"trumpet",version:"1.0"},{emoji:"🎻",category:6,name:"violin",version:"1.0"},{emoji:"🪕",category:6,name:"banjo",version:"12.0"},{emoji:"🥁",category:6,name:"drum",version:"3.0"},{emoji:"🪘",category:6,name:"long drum",version:"13.0"},{emoji:"📱",category:6,name:"mobile phone",version:"1.0"},{emoji:"📲",category:6,name:"mobile phone with arrow",version:"1.0"},{emoji:"☎️",category:6,name:"telephone",version:"1.0"},{emoji:"📞",category:6,name:"telephone receiver",version:"1.0"},{emoji:"📟",category:6,name:"pager",version:"1.0"},{emoji:"📠",category:6,name:"fax machine",version:"1.0"},{emoji:"🔋",category:6,name:"battery",version:"1.0"},{emoji:"🔌",category:6,name:"electric plug",version:"1.0"},{emoji:"💻",category:6,name:"laptop",version:"1.0"},{emoji:"🖥️",category:6,name:"desktop computer",version:"1.0"},{emoji:"🖨️",category:6,name:"printer",version:"1.0"},{emoji:"⌨️",category:6,name:"keyboard",version:"1.0"},{emoji:"🖱️",category:6,name:"computer mouse",version:"1.0"},{emoji:"🖲️",category:6,name:"trackball",version:"1.0"},{emoji:"💽",category:6,name:"computer disk",version:"1.0"},{emoji:"💾",category:6,name:"floppy disk",version:"1.0"},{emoji:"💿",category:6,name:"optical disk",version:"1.0"},{emoji:"📀",category:6,name:"dvd",version:"1.0"},{emoji:"🧮",category:6,name:"abacus",version:"11.0"},{emoji:"🎥",category:6,name:"movie camera",version:"1.0"},{emoji:"🎞️",category:6,name:"film frames",version:"1.0"},{emoji:"📽️",category:6,name:"film projector",version:"1.0"},{emoji:"🎬",category:6,name:"clapper board",version:"1.0"},{emoji:"📺",category:6,name:"television",version:"1.0"},{emoji:"📷",category:6,name:"camera",version:"1.0"},{emoji:"📸",category:6,name:"camera with flash",version:"1.0"},{emoji:"📹",category:6,name:"video camera",version:"1.0"},{emoji:"📼",category:6,name:"videocassette",version:"1.0"},{emoji:"🔍",category:6,name:"magnifying glass tilted left",version:"1.0"},{emoji:"🔎",category:6,name:"magnifying glass tilted right",version:"1.0"},{emoji:"🕯️",category:6,name:"candle",version:"1.0"},{emoji:"💡",category:6,name:"light bulb",version:"1.0"},{emoji:"🔦",category:6,name:"flashlight",version:"1.0"},{emoji:"🏮",category:6,name:"red paper lantern",version:"1.0"},{emoji:"🪔",category:6,name:"diya lamp",version:"12.0"},{emoji:"📔",category:6,name:"notebook with decorative cover",version:"1.0"},{emoji:"📕",category:6,name:"closed book",version:"1.0"},{emoji:"📖",category:6,name:"open book",version:"1.0"},{emoji:"📗",category:6,name:"green book",version:"1.0"},{emoji:"📘",category:6,name:"blue book",version:"1.0"},{emoji:"📙",category:6,name:"orange book",version:"1.0"},{emoji:"📚",category:6,name:"books",version:"1.0"},{emoji:"📓",category:6,name:"notebook",version:"1.0"},{emoji:"📒",category:6,name:"ledger",version:"1.0"},{emoji:"📃",category:6,name:"page with curl",version:"1.0"},{emoji:"📜",category:6,name:"scroll",version:"1.0"},{emoji:"📄",category:6,name:"page facing up",version:"1.0"},{emoji:"📰",category:6,name:"newspaper",version:"1.0"},{emoji:"🗞️",category:6,name:"rolled-up newspaper",version:"1.0"},{emoji:"📑",category:6,name:"bookmark tabs",version:"1.0"},{emoji:"🔖",category:6,name:"bookmark",version:"1.0"},{emoji:"🏷️",category:6,name:"label",version:"1.0"},{emoji:"💰",category:6,name:"money bag",version:"1.0"},{emoji:"🪙",category:6,name:"coin",version:"13.0"},{emoji:"💴",category:6,name:"yen banknote",version:"1.0"},{emoji:"💵",category:6,name:"dollar banknote",version:"1.0"},{emoji:"💶",category:6,name:"euro banknote",version:"1.0"},{emoji:"💷",category:6,name:"pound banknote",version:"1.0"},{emoji:"💸",category:6,name:"money with wings",version:"1.0"},{emoji:"💳",category:6,name:"credit card",version:"1.0"},{emoji:"🧾",category:6,name:"receipt",version:"11.0"},{emoji:"💹",category:6,name:"chart increasing with yen",version:"1.0"},{emoji:"✉️",category:6,name:"envelope",version:"1.0"},{emoji:"📧",category:6,name:"e-mail",version:"1.0"},{emoji:"📨",category:6,name:"incoming envelope",version:"1.0"},{emoji:"📩",category:6,name:"envelope with arrow",version:"1.0"},{emoji:"📤",category:6,name:"outbox tray",version:"1.0"},{emoji:"📥",category:6,name:"inbox tray",version:"1.0"},{emoji:"📦",category:6,name:"package",version:"1.0"},{emoji:"📫",category:6,name:"closed mailbox with raised flag",version:"1.0"},{emoji:"📪",category:6,name:"closed mailbox with lowered flag",version:"1.0"},{emoji:"📬",category:6,name:"open mailbox with raised flag",version:"1.0"},{emoji:"📭",category:6,name:"open mailbox with lowered flag",version:"1.0"},{emoji:"📮",category:6,name:"postbox",version:"1.0"},{emoji:"🗳️",category:6,name:"ballot box with ballot",version:"1.0"},{emoji:"✏️",category:6,name:"pencil",version:"1.0"},{emoji:"✒️",category:6,name:"black nib",version:"1.0"},{emoji:"🖋️",category:6,name:"fountain pen",version:"1.0"},{emoji:"🖊️",category:6,name:"pen",version:"1.0"},{emoji:"🖌️",category:6,name:"paintbrush",version:"1.0"},{emoji:"🖍️",category:6,name:"crayon",version:"1.0"},{emoji:"📝",category:6,name:"memo",version:"1.0"},{emoji:"💼",category:6,name:"briefcase",version:"1.0"},{emoji:"📁",category:6,name:"file folder",version:"1.0"},{emoji:"📂",category:6,name:"open file folder",version:"1.0"},{emoji:"🗂️",category:6,name:"card index dividers",version:"1.0"},{emoji:"📅",category:6,name:"calendar",version:"1.0"},{emoji:"📆",category:6,name:"tear-off calendar",version:"1.0"},{emoji:"🗒️",category:6,name:"spiral notepad",version:"1.0"},{emoji:"🗓️",category:6,name:"spiral calendar",version:"1.0"},{emoji:"📇",category:6,name:"card index",version:"1.0"},{emoji:"📈",category:6,name:"chart increasing",version:"1.0"},{emoji:"📉",category:6,name:"chart decreasing",version:"1.0"},{emoji:"📊",category:6,name:"bar chart",version:"1.0"},{emoji:"📋",category:6,name:"clipboard",version:"1.0"},{emoji:"📌",category:6,name:"pushpin",version:"1.0"},{emoji:"📍",category:6,name:"round pushpin",version:"1.0"},{emoji:"📎",category:6,name:"paperclip",version:"1.0"},{emoji:"🖇️",category:6,name:"linked paperclips",version:"1.0"},{emoji:"📏",category:6,name:"straight ruler",version:"1.0"},{emoji:"📐",category:6,name:"triangular ruler",version:"1.0"},{emoji:"✂️",category:6,name:"scissors",version:"1.0"},{emoji:"🗃️",category:6,name:"card file box",version:"1.0"},{emoji:"🗄️",category:6,name:"file cabinet",version:"1.0"},{emoji:"🗑️",category:6,name:"wastebasket",version:"1.0"},{emoji:"🔒",category:6,name:"locked",version:"1.0"},{emoji:"🔓",category:6,name:"unlocked",version:"1.0"},{emoji:"🔏",category:6,name:"locked with pen",version:"1.0"},{emoji:"🔐",category:6,name:"locked with key",version:"1.0"},{emoji:"🔑",category:6,name:"key",version:"1.0"},{emoji:"🗝️",category:6,name:"old key",version:"1.0"},{emoji:"🔨",category:6,name:"hammer",version:"1.0"},{emoji:"🪓",category:6,name:"axe",version:"12.0"},{emoji:"⛏️",category:6,name:"pick",version:"1.0"},{emoji:"⚒️",category:6,name:"hammer and pick",version:"1.0"},{emoji:"🛠️",category:6,name:"hammer and wrench",version:"1.0"},{emoji:"🗡️",category:6,name:"dagger",version:"1.0"},{emoji:"⚔️",category:6,name:"crossed swords",version:"1.0"},{emoji:"🔫",category:6,name:"pistol",version:"1.0"},{emoji:"🪃",category:6,name:"boomerang",version:"13.0"},{emoji:"🏹",category:6,name:"bow and arrow",version:"1.0"},{emoji:"🛡️",category:6,name:"shield",version:"1.0"},{emoji:"🪚",category:6,name:"carpentry saw",version:"13.0"},{emoji:"🔧",category:6,name:"wrench",version:"1.0"},{emoji:"🪛",category:6,name:"screwdriver",version:"13.0"},{emoji:"🔩",category:6,name:"nut and bolt",version:"1.0"},{emoji:"⚙️",category:6,name:"gear",version:"1.0"},{emoji:"🗜️",category:6,name:"clamp",version:"1.0"},{emoji:"⚖️",category:6,name:"balance scale",version:"1.0"},{emoji:"🦯",category:6,name:"white cane",version:"12.0"},{emoji:"🔗",category:6,name:"link",version:"1.0"},{emoji:"⛓️",category:6,name:"chains",version:"1.0"},{emoji:"🪝",category:6,name:"hook",version:"13.0"},{emoji:"🧰",category:6,name:"toolbox",version:"11.0"},{emoji:"🧲",category:6,name:"magnet",version:"11.0"},{emoji:"🪜",category:6,name:"ladder",version:"13.0"},{emoji:"⚗️",category:6,name:"alembic",version:"1.0"},{emoji:"🧪",category:6,name:"test tube",version:"11.0"},{emoji:"🧫",category:6,name:"petri dish",version:"11.0"},{emoji:"🧬",category:6,name:"dna",version:"11.0"},{emoji:"🔬",category:6,name:"microscope",version:"1.0"},{emoji:"🔭",category:6,name:"telescope",version:"1.0"},{emoji:"📡",category:6,name:"satellite antenna",version:"1.0"},{emoji:"💉",category:6,name:"syringe",version:"1.0"},{emoji:"🩸",category:6,name:"drop of blood",version:"12.0"},{emoji:"💊",category:6,name:"pill",version:"1.0"},{emoji:"🩹",category:6,name:"adhesive bandage",version:"12.0"},{emoji:"🩺",category:6,name:"stethoscope",version:"12.0"},{emoji:"🚪",category:6,name:"door",version:"1.0"},{emoji:"🛗",category:6,name:"elevator",version:"13.0"},{emoji:"🪞",category:6,name:"mirror",version:"13.0"},{emoji:"🪟",category:6,name:"window",version:"13.0"},{emoji:"🛏️",category:6,name:"bed",version:"1.0"},{emoji:"🛋️",category:6,name:"couch and lamp",version:"1.0"},{emoji:"🪑",category:6,name:"chair",version:"12.0"},{emoji:"🚽",category:6,name:"toilet",version:"1.0"},{emoji:"🪠",category:6,name:"plunger",version:"13.0"},{emoji:"🚿",category:6,name:"shower",version:"1.0"},{emoji:"🛁",category:6,name:"bathtub",version:"1.0"},{emoji:"🪤",category:6,name:"mouse trap",version:"13.0"},{emoji:"🪒",category:6,name:"razor",version:"12.0"},{emoji:"🧴",category:6,name:"lotion bottle",version:"11.0"},{emoji:"🧷",category:6,name:"safety pin",version:"11.0"},{emoji:"🧹",category:6,name:"broom",version:"11.0"},{emoji:"🧺",category:6,name:"basket",version:"11.0"},{emoji:"🧻",category:6,name:"roll of paper",version:"11.0"},{emoji:"🪣",category:6,name:"bucket",version:"13.0"},{emoji:"🧼",category:6,name:"soap",version:"11.0"},{emoji:"🪥",category:6,name:"toothbrush",version:"13.0"},{emoji:"🧽",category:6,name:"sponge",version:"11.0"},{emoji:"🧯",category:6,name:"fire extinguisher",version:"11.0"},{emoji:"🛒",category:6,name:"shopping cart",version:"3.0"},{emoji:"🚬",category:6,name:"cigarette",version:"1.0"},{emoji:"⚰️",category:6,name:"coffin",version:"1.0"},{emoji:"🪦",category:6,name:"headstone",version:"13.0"},{emoji:"⚱️",category:6,name:"funeral urn",version:"1.0"},{emoji:"🗿",category:6,name:"moai",version:"1.0"},{emoji:"🪧",category:6,name:"placard",version:"13.0"},{emoji:"🏧",category:7,name:"ATM sign",version:"1.0"},{emoji:"🚮",category:7,name:"litter in bin sign",version:"1.0"},{emoji:"🚰",category:7,name:"potable water",version:"1.0"},{emoji:"♿",category:7,name:"wheelchair symbol",version:"1.0"},{emoji:"🚹",category:7,name:"men’s room",version:"1.0"},{emoji:"🚺",category:7,name:"women’s room",version:"1.0"},{emoji:"🚻",category:7,name:"restroom",version:"1.0"},{emoji:"🚼",category:7,name:"baby symbol",version:"1.0"},{emoji:"🚾",category:7,name:"water closet",version:"1.0"},{emoji:"🛂",category:7,name:"passport control",version:"1.0"},{emoji:"🛃",category:7,name:"customs",version:"1.0"},{emoji:"🛄",category:7,name:"baggage claim",version:"1.0"},{emoji:"🛅",category:7,name:"left luggage",version:"1.0"},{emoji:"⚠️",category:7,name:"warning",version:"1.0"},{emoji:"🚸",category:7,name:"children crossing",version:"1.0"},{emoji:"⛔",category:7,name:"no entry",version:"1.0"},{emoji:"🚫",category:7,name:"prohibited",version:"1.0"},{emoji:"🚳",category:7,name:"no bicycles",version:"1.0"},{emoji:"🚭",category:7,name:"no smoking",version:"1.0"},{emoji:"🚯",category:7,name:"no littering",version:"1.0"},{emoji:"🚱",category:7,name:"non-potable water",version:"1.0"},{emoji:"🚷",category:7,name:"no pedestrians",version:"1.0"},{emoji:"📵",category:7,name:"no mobile phones",version:"1.0"},{emoji:"🔞",category:7,name:"no one under eighteen",version:"1.0"},{emoji:"☢️",category:7,name:"radioactive",version:"1.0"},{emoji:"☣️",category:7,name:"biohazard",version:"1.0"},{emoji:"⬆️",category:7,name:"up arrow",version:"1.0"},{emoji:"↗️",category:7,name:"up-right arrow",version:"1.0"},{emoji:"➡️",category:7,name:"right arrow",version:"1.0"},{emoji:"↘️",category:7,name:"down-right arrow",version:"1.0"},{emoji:"⬇️",category:7,name:"down arrow",version:"1.0"},{emoji:"↙️",category:7,name:"down-left arrow",version:"1.0"},{emoji:"⬅️",category:7,name:"left arrow",version:"1.0"},{emoji:"↖️",category:7,name:"up-left arrow",version:"1.0"},{emoji:"↕️",category:7,name:"up-down arrow",version:"1.0"},{emoji:"↔️",category:7,name:"left-right arrow",version:"1.0"},{emoji:"↩️",category:7,name:"right arrow curving left",version:"1.0"},{emoji:"↪️",category:7,name:"left arrow curving right",version:"1.0"},{emoji:"⤴️",category:7,name:"right arrow curving up",version:"1.0"},{emoji:"⤵️",category:7,name:"right arrow curving down",version:"1.0"},{emoji:"🔃",category:7,name:"clockwise vertical arrows",version:"1.0"},{emoji:"🔄",category:7,name:"counterclockwise arrows button",version:"1.0"},{emoji:"🔙",category:7,name:"BACK arrow",version:"1.0"},{emoji:"🔚",category:7,name:"END arrow",version:"1.0"},{emoji:"🔛",category:7,name:"ON! arrow",version:"1.0"},{emoji:"🔜",category:7,name:"SOON arrow",version:"1.0"},{emoji:"🔝",category:7,name:"TOP arrow",version:"1.0"},{emoji:"🛐",category:7,name:"place of worship",version:"1.0"},{emoji:"⚛️",category:7,name:"atom symbol",version:"1.0"},{emoji:"🕉️",category:7,name:"om",version:"1.0"},{emoji:"✡️",category:7,name:"star of David",version:"1.0"},{emoji:"☸️",category:7,name:"wheel of dharma",version:"1.0"},{emoji:"☯️",category:7,name:"yin yang",version:"1.0"},{emoji:"✝️",category:7,name:"latin cross",version:"1.0"},{emoji:"☦️",category:7,name:"orthodox cross",version:"1.0"},{emoji:"☪️",category:7,name:"star and crescent",version:"1.0"},{emoji:"☮️",category:7,name:"peace symbol",version:"1.0"},{emoji:"🕎",category:7,name:"menorah",version:"1.0"},{emoji:"🔯",category:7,name:"dotted six-pointed star",version:"1.0"},{emoji:"♈",category:7,name:"Aries",version:"1.0"},{emoji:"♉",category:7,name:"Taurus",version:"1.0"},{emoji:"♊",category:7,name:"Gemini",version:"1.0"},{emoji:"♋",category:7,name:"Cancer",version:"1.0"},{emoji:"♌",category:7,name:"Leo",version:"1.0"},{emoji:"♍",category:7,name:"Virgo",version:"1.0"},{emoji:"♎",category:7,name:"Libra",version:"1.0"},{emoji:"♏",category:7,name:"Scorpio",version:"1.0"},{emoji:"♐",category:7,name:"Sagittarius",version:"1.0"},{emoji:"♑",category:7,name:"Capricorn",version:"1.0"},{emoji:"♒",category:7,name:"Aquarius",version:"1.0"},{emoji:"♓",category:7,name:"Pisces",version:"1.0"},{emoji:"⛎",category:7,name:"Ophiuchus",version:"1.0"},{emoji:"🔀",category:7,name:"shuffle tracks button",version:"1.0"},{emoji:"🔁",category:7,name:"repeat button",version:"1.0"},{emoji:"🔂",category:7,name:"repeat single button",version:"1.0"},{emoji:"▶️",category:7,name:"play button",version:"1.0"},{emoji:"⏩",category:7,name:"fast-forward button",version:"1.0"},{emoji:"⏭️",category:7,name:"next track button",version:"1.0"},{emoji:"⏯️",category:7,name:"play or pause button",version:"1.0"},{emoji:"◀️",category:7,name:"reverse button",version:"1.0"},{emoji:"⏪",category:7,name:"fast reverse button",version:"1.0"},{emoji:"⏮️",category:7,name:"last track button",version:"1.0"},{emoji:"🔼",category:7,name:"upwards button",version:"1.0"},{emoji:"⏫",category:7,name:"fast up button",version:"1.0"},{emoji:"🔽",category:7,name:"downwards button",version:"1.0"},{emoji:"⏬",category:7,name:"fast down button",version:"1.0"},{emoji:"⏸️",category:7,name:"pause button",version:"1.0"},{emoji:"⏹️",category:7,name:"stop button",version:"1.0"},{emoji:"⏺️",category:7,name:"record button",version:"1.0"},{emoji:"⏏️",category:7,name:"eject button",version:"1.0"},{emoji:"🎦",category:7,name:"cinema",version:"1.0"},{emoji:"🔅",category:7,name:"dim button",version:"1.0"},{emoji:"🔆",category:7,name:"bright button",version:"1.0"},{emoji:"📶",category:7,name:"antenna bars",version:"1.0"},{emoji:"📳",category:7,name:"vibration mode",version:"1.0"},{emoji:"📴",category:7,name:"mobile phone off",version:"1.0"},{emoji:"♀️",category:7,name:"female sign",version:"4.0"},{emoji:"♂️",category:7,name:"male sign",version:"4.0"},{emoji:"⚧️",category:7,name:"transgender symbol",version:"13.0"},{emoji:"✖️",category:7,name:"multiply",version:"1.0"},{emoji:"➕",category:7,name:"plus",version:"1.0"},{emoji:"➖",category:7,name:"minus",version:"1.0"},{emoji:"➗",category:7,name:"divide",version:"1.0"},{emoji:"♾️",category:7,name:"infinity",version:"11.0"},{emoji:"‼️",category:7,name:"double exclamation mark",version:"1.0"},{emoji:"⁉️",category:7,name:"exclamation question mark",version:"1.0"},{emoji:"❓",category:7,name:"question mark",version:"1.0"},{emoji:"❔",category:7,name:"white question mark",version:"1.0"},{emoji:"❕",category:7,name:"white exclamation mark",version:"1.0"},{emoji:"❗",category:7,name:"exclamation mark",version:"1.0"},{emoji:"〰️",category:7,name:"wavy dash",version:"1.0"},{emoji:"💱",category:7,name:"currency exchange",version:"1.0"},{emoji:"💲",category:7,name:"heavy dollar sign",version:"1.0"},{emoji:"⚕️",category:7,name:"medical symbol",version:"4.0"},{emoji:"♻️",category:7,name:"recycling symbol",version:"1.0"},{emoji:"⚜️",category:7,name:"fleur-de-lis",version:"1.0"},{emoji:"🔱",category:7,name:"trident emblem",version:"1.0"},{emoji:"📛",category:7,name:"name badge",version:"1.0"},{emoji:"🔰",category:7,name:"Japanese symbol for beginner",version:"1.0"},{emoji:"⭕",category:7,name:"hollow red circle",version:"1.0"},{emoji:"✅",category:7,name:"check mark button",version:"1.0"},{emoji:"☑️",category:7,name:"check box with check",version:"1.0"},{emoji:"✔️",category:7,name:"check mark",version:"1.0"},{emoji:"❌",category:7,name:"cross mark",version:"1.0"},{emoji:"❎",category:7,name:"cross mark button",version:"1.0"},{emoji:"➰",category:7,name:"curly loop",version:"1.0"},{emoji:"➿",category:7,name:"double curly loop",version:"1.0"},{emoji:"〽️",category:7,name:"part alternation mark",version:"1.0"},{emoji:"✳️",category:7,name:"eight-spoked asterisk",version:"1.0"},{emoji:"✴️",category:7,name:"eight-pointed star",version:"1.0"},{emoji:"❇️",category:7,name:"sparkle",version:"1.0"},{emoji:"©️",category:7,name:"copyright",version:"1.0"},{emoji:"®️",category:7,name:"registered",version:"1.0"},{emoji:"™️",category:7,name:"trade mark",version:"1.0"},{emoji:"#️⃣",category:7,name:"keycap: #",version:"1.0"},{emoji:"*️⃣",category:7,name:"keycap: *",version:"2.0"},{emoji:"0️⃣",category:7,name:"keycap: 0",version:"1.0"},{emoji:"1️⃣",category:7,name:"keycap: 1",version:"1.0"},{emoji:"2️⃣",category:7,name:"keycap: 2",version:"1.0"},{emoji:"3️⃣",category:7,name:"keycap: 3",version:"1.0"},{emoji:"4️⃣",category:7,name:"keycap: 4",version:"1.0"},{emoji:"5️⃣",category:7,name:"keycap: 5",version:"1.0"},{emoji:"6️⃣",category:7,name:"keycap: 6",version:"1.0"},{emoji:"7️⃣",category:7,name:"keycap: 7",version:"1.0"},{emoji:"8️⃣",category:7,name:"keycap: 8",version:"1.0"},{emoji:"9️⃣",category:7,name:"keycap: 9",version:"1.0"},{emoji:"🔟",category:7,name:"keycap: 10",version:"1.0"},{emoji:"🔠",category:7,name:"input latin uppercase",version:"1.0"},{emoji:"🔡",category:7,name:"input latin lowercase",version:"1.0"},{emoji:"🔢",category:7,name:"input numbers",version:"1.0"},{emoji:"🔣",category:7,name:"input symbols",version:"1.0"},{emoji:"🔤",category:7,name:"input latin letters",version:"1.0"},{emoji:"🅰️",category:7,name:"A button (blood type)",version:"1.0"},{emoji:"🆎",category:7,name:"AB button (blood type)",version:"1.0"},{emoji:"🅱️",category:7,name:"B button (blood type)",version:"1.0"},{emoji:"🆑",category:7,name:"CL button",version:"1.0"},{emoji:"🆒",category:7,name:"COOL button",version:"1.0"},{emoji:"🆓",category:7,name:"FREE button",version:"1.0"},{emoji:"ℹ️",category:7,name:"information",version:"1.0"},{emoji:"🆔",category:7,name:"ID button",version:"1.0"},{emoji:"Ⓜ️",category:7,name:"circled M",version:"1.0"},{emoji:"🆕",category:7,name:"NEW button",version:"1.0"},{emoji:"🆖",category:7,name:"NG button",version:"1.0"},{emoji:"🅾️",category:7,name:"O button (blood type)",version:"1.0"},{emoji:"🆗",category:7,name:"OK button",version:"1.0"},{emoji:"🅿️",category:7,name:"P button",version:"1.0"},{emoji:"🆘",category:7,name:"SOS button",version:"1.0"},{emoji:"🆙",category:7,name:"UP! button",version:"1.0"},{emoji:"🆚",category:7,name:"VS button",version:"1.0"},{emoji:"🈁",category:7,name:"Japanese “here” button",version:"1.0"},{emoji:"🈂️",category:7,name:"Japanese “service charge” button",version:"1.0"},{emoji:"🈷️",category:7,name:"Japanese “monthly amount” button",version:"1.0"},{emoji:"🈶",category:7,name:"Japanese “not free of charge” button",version:"1.0"},{emoji:"🈯",category:7,name:"Japanese “reserved” button",version:"1.0"},{emoji:"🉐",category:7,name:"Japanese “bargain” button",version:"1.0"},{emoji:"🈹",category:7,name:"Japanese “discount” button",version:"1.0"},{emoji:"🈚",category:7,name:"Japanese “free of charge” button",version:"1.0"},{emoji:"🈲",category:7,name:"Japanese “prohibited” button",version:"1.0"},{emoji:"🉑",category:7,name:"Japanese “acceptable” button",version:"1.0"},{emoji:"🈸",category:7,name:"Japanese “application” button",version:"1.0"},{emoji:"🈴",category:7,name:"Japanese “passing grade” button",version:"1.0"},{emoji:"🈳",category:7,name:"Japanese “vacancy” button",version:"1.0"},{emoji:"㊗️",category:7,name:"Japanese “congratulations” button",version:"1.0"},{emoji:"㊙️",category:7,name:"Japanese “secret” button",version:"1.0"},{emoji:"🈺",category:7,name:"Japanese “open for business” button",version:"1.0"},{emoji:"🈵",category:7,name:"Japanese “no vacancy” button",version:"1.0"},{emoji:"🔴",category:7,name:"red circle",version:"1.0"},{emoji:"🟠",category:7,name:"orange circle",version:"12.0"},{emoji:"🟡",category:7,name:"yellow circle",version:"12.0"},{emoji:"🟢",category:7,name:"green circle",version:"12.0"},{emoji:"🔵",category:7,name:"blue circle",version:"1.0"},{emoji:"🟣",category:7,name:"purple circle",version:"12.0"},{emoji:"🟤",category:7,name:"brown circle",version:"12.0"},{emoji:"⚫",category:7,name:"black circle",version:"1.0"},{emoji:"⚪",category:7,name:"white circle",version:"1.0"},{emoji:"🟥",category:7,name:"red square",version:"12.0"},{emoji:"🟧",category:7,name:"orange square",version:"12.0"},{emoji:"🟨",category:7,name:"yellow square",version:"12.0"},{emoji:"🟩",category:7,name:"green square",version:"12.0"},{emoji:"🟦",category:7,name:"blue square",version:"12.0"},{emoji:"🟪",category:7,name:"purple square",version:"12.0"},{emoji:"🟫",category:7,name:"brown square",version:"12.0"},{emoji:"⬛",category:7,name:"black large square",version:"1.0"},{emoji:"⬜",category:7,name:"white large square",version:"1.0"},{emoji:"◼️",category:7,name:"black medium square",version:"1.0"},{emoji:"◻️",category:7,name:"white medium square",version:"1.0"},{emoji:"◾",category:7,name:"black medium-small square",version:"1.0"},{emoji:"◽",category:7,name:"white medium-small square",version:"1.0"},{emoji:"▪️",category:7,name:"black small square",version:"1.0"},{emoji:"▫️",category:7,name:"white small square",version:"1.0"},{emoji:"🔶",category:7,name:"large orange diamond",version:"1.0"},{emoji:"🔷",category:7,name:"large blue diamond",version:"1.0"},{emoji:"🔸",category:7,name:"small orange diamond",version:"1.0"},{emoji:"🔹",category:7,name:"small blue diamond",version:"1.0"},{emoji:"🔺",category:7,name:"red triangle pointed up",version:"1.0"},{emoji:"🔻",category:7,name:"red triangle pointed down",version:"1.0"},{emoji:"💠",category:7,name:"diamond with a dot",version:"1.0"},{emoji:"🔘",category:7,name:"radio button",version:"1.0"},{emoji:"🔳",category:7,name:"white square button",version:"1.0"},{emoji:"🔲",category:7,name:"black square button",version:"1.0"},{emoji:"🏁",category:8,name:"chequered flag",version:"1.0"},{emoji:"🚩",category:8,name:"triangular flag",version:"1.0"},{emoji:"🎌",category:8,name:"crossed flags",version:"1.0"},{emoji:"🏴",category:8,name:"black flag",version:"1.0"},{emoji:"🏳️",category:8,name:"white flag",version:"1.0"},{emoji:"🏳️‍🌈",category:8,name:"rainbow flag",version:"4.0"},{emoji:"🏳️‍⚧️",category:8,name:"transgender flag",version:"13.0"},{emoji:"🏴‍☠️",category:8,name:"pirate flag",version:"11.0"},{emoji:"🇦🇨",category:8,name:"flag: Ascension Island",version:"2.0"},{emoji:"🇦🇩",category:8,name:"flag: Andorra",version:"2.0"},{emoji:"🇦🇪",category:8,name:"flag: United Arab Emirates",version:"2.0"},{emoji:"🇦🇫",category:8,name:"flag: Afghanistan",version:"2.0"},{emoji:"🇦🇬",category:8,name:"flag: Antigua & Barbuda",version:"2.0"},{emoji:"🇦🇮",category:8,name:"flag: Anguilla",version:"2.0"},{emoji:"🇦🇱",category:8,name:"flag: Albania",version:"2.0"},{emoji:"🇦🇲",category:8,name:"flag: Armenia",version:"2.0"},{emoji:"🇦🇴",category:8,name:"flag: Angola",version:"2.0"},{emoji:"🇦🇶",category:8,name:"flag: Antarctica",version:"2.0"},{emoji:"🇦🇷",category:8,name:"flag: Argentina",version:"2.0"},{emoji:"🇦🇸",category:8,name:"flag: American Samoa",version:"2.0"},{emoji:"🇦🇹",category:8,name:"flag: Austria",version:"2.0"},{emoji:"🇦🇺",category:8,name:"flag: Australia",version:"2.0"},{emoji:"🇦🇼",category:8,name:"flag: Aruba",version:"2.0"},{emoji:"🇦🇽",category:8,name:"flag: Åland Islands",version:"2.0"},{emoji:"🇦🇿",category:8,name:"flag: Azerbaijan",version:"2.0"},{emoji:"🇧🇦",category:8,name:"flag: Bosnia & Herzegovina",version:"2.0"},{emoji:"🇧🇧",category:8,name:"flag: Barbados",version:"2.0"},{emoji:"🇧🇩",category:8,name:"flag: Bangladesh",version:"2.0"},{emoji:"🇧🇪",category:8,name:"flag: Belgium",version:"2.0"},{emoji:"🇧🇫",category:8,name:"flag: Burkina Faso",version:"2.0"},{emoji:"🇧🇬",category:8,name:"flag: Bulgaria",version:"2.0"},{emoji:"🇧🇭",category:8,name:"flag: Bahrain",version:"2.0"},{emoji:"🇧🇮",category:8,name:"flag: Burundi",version:"2.0"},{emoji:"🇧🇯",category:8,name:"flag: Benin",version:"2.0"},{emoji:"🇧🇱",category:8,name:"flag: St. Barthélemy",version:"2.0"},{emoji:"🇧🇲",category:8,name:"flag: Bermuda",version:"2.0"},{emoji:"🇧🇳",category:8,name:"flag: Brunei",version:"2.0"},{emoji:"🇧🇴",category:8,name:"flag: Bolivia",version:"2.0"},{emoji:"🇧🇶",category:8,name:"flag: Caribbean Netherlands",version:"2.0"},{emoji:"🇧🇷",category:8,name:"flag: Brazil",version:"2.0"},{emoji:"🇧🇸",category:8,name:"flag: Bahamas",version:"2.0"},{emoji:"🇧🇹",category:8,name:"flag: Bhutan",version:"2.0"},{emoji:"🇧🇻",category:8,name:"flag: Bouvet Island",version:"2.0"},{emoji:"🇧🇼",category:8,name:"flag: Botswana",version:"2.0"},{emoji:"🇧🇾",category:8,name:"flag: Belarus",version:"2.0"},{emoji:"🇧🇿",category:8,name:"flag: Belize",version:"2.0"},{emoji:"🇨🇦",category:8,name:"flag: Canada",version:"2.0"},{emoji:"🇨🇨",category:8,name:"flag: Cocos (Keeling) Islands",version:"2.0"},{emoji:"🇨🇩",category:8,name:"flag: Congo - Kinshasa",version:"2.0"},{emoji:"🇨🇫",category:8,name:"flag: Central African Republic",version:"2.0"},{emoji:"🇨🇬",category:8,name:"flag: Congo - Brazzaville",version:"2.0"},{emoji:"🇨🇭",category:8,name:"flag: Switzerland",version:"2.0"},{emoji:"🇨🇮",category:8,name:"flag: Côte d’Ivoire",version:"2.0"},{emoji:"🇨🇰",category:8,name:"flag: Cook Islands",version:"2.0"},{emoji:"🇨🇱",category:8,name:"flag: Chile",version:"2.0"},{emoji:"🇨🇲",category:8,name:"flag: Cameroon",version:"2.0"},{emoji:"🇨🇳",category:8,name:"flag: China",version:"1.0"},{emoji:"🇨🇴",category:8,name:"flag: Colombia",version:"2.0"},{emoji:"🇨🇵",category:8,name:"flag: Clipperton Island",version:"2.0"},{emoji:"🇨🇷",category:8,name:"flag: Costa Rica",version:"2.0"},{emoji:"🇨🇺",category:8,name:"flag: Cuba",version:"2.0"},{emoji:"🇨🇻",category:8,name:"flag: Cape Verde",version:"2.0"},{emoji:"🇨🇼",category:8,name:"flag: Curaçao",version:"2.0"},{emoji:"🇨🇽",category:8,name:"flag: Christmas Island",version:"2.0"},{emoji:"🇨🇾",category:8,name:"flag: Cyprus",version:"2.0"},{emoji:"🇨🇿",category:8,name:"flag: Czechia",version:"2.0"},{emoji:"🇩🇪",category:8,name:"flag: Germany",version:"1.0"},{emoji:"🇩🇬",category:8,name:"flag: Diego Garcia",version:"2.0"},{emoji:"🇩🇯",category:8,name:"flag: Djibouti",version:"2.0"},{emoji:"🇩🇰",category:8,name:"flag: Denmark",version:"2.0"},{emoji:"🇩🇲",category:8,name:"flag: Dominica",version:"2.0"},{emoji:"🇩🇴",category:8,name:"flag: Dominican Republic",version:"2.0"},{emoji:"🇩🇿",category:8,name:"flag: Algeria",version:"2.0"},{emoji:"🇪🇦",category:8,name:"flag: Ceuta & Melilla",version:"2.0"},{emoji:"🇪🇨",category:8,name:"flag: Ecuador",version:"2.0"},{emoji:"🇪🇪",category:8,name:"flag: Estonia",version:"2.0"},{emoji:"🇪🇬",category:8,name:"flag: Egypt",version:"2.0"},{emoji:"🇪🇭",category:8,name:"flag: Western Sahara",version:"2.0"},{emoji:"🇪🇷",category:8,name:"flag: Eritrea",version:"2.0"},{emoji:"🇪🇸",category:8,name:"flag: Spain",version:"1.0"},{emoji:"🇪🇹",category:8,name:"flag: Ethiopia",version:"2.0"},{emoji:"🇪🇺",category:8,name:"flag: European Union",version:"2.0"},{emoji:"🇫🇮",category:8,name:"flag: Finland",version:"2.0"},{emoji:"🇫🇯",category:8,name:"flag: Fiji",version:"2.0"},{emoji:"🇫🇰",category:8,name:"flag: Falkland Islands",version:"2.0"},{emoji:"🇫🇲",category:8,name:"flag: Micronesia",version:"2.0"},{emoji:"🇫🇴",category:8,name:"flag: Faroe Islands",version:"2.0"},{emoji:"🇫🇷",category:8,name:"flag: France",version:"1.0"},{emoji:"🇬🇦",category:8,name:"flag: Gabon",version:"2.0"},{emoji:"🇬🇧",category:8,name:"flag: United Kingdom",version:"1.0"},{emoji:"🇬🇩",category:8,name:"flag: Grenada",version:"2.0"},{emoji:"🇬🇪",category:8,name:"flag: Georgia",version:"2.0"},{emoji:"🇬🇫",category:8,name:"flag: French Guiana",version:"2.0"},{emoji:"🇬🇬",category:8,name:"flag: Guernsey",version:"2.0"},{emoji:"🇬🇭",category:8,name:"flag: Ghana",version:"2.0"},{emoji:"🇬🇮",category:8,name:"flag: Gibraltar",version:"2.0"},{emoji:"🇬🇱",category:8,name:"flag: Greenland",version:"2.0"},{emoji:"🇬🇲",category:8,name:"flag: Gambia",version:"2.0"},{emoji:"🇬🇳",category:8,name:"flag: Guinea",version:"2.0"},{emoji:"🇬🇵",category:8,name:"flag: Guadeloupe",version:"2.0"},{emoji:"🇬🇶",category:8,name:"flag: Equatorial Guinea",version:"2.0"},{emoji:"🇬🇷",category:8,name:"flag: Greece",version:"2.0"},{emoji:"🇬🇸",category:8,name:"flag: South Georgia & South Sandwich Islands",version:"2.0"},{emoji:"🇬🇹",category:8,name:"flag: Guatemala",version:"2.0"},{emoji:"🇬🇺",category:8,name:"flag: Guam",version:"2.0"},{emoji:"🇬🇼",category:8,name:"flag: Guinea-Bissau",version:"2.0"},{emoji:"🇬🇾",category:8,name:"flag: Guyana",version:"2.0"},{emoji:"🇭🇰",category:8,name:"flag: Hong Kong SAR China",version:"2.0"},{emoji:"🇭🇲",category:8,name:"flag: Heard & McDonald Islands",version:"2.0"},{emoji:"🇭🇳",category:8,name:"flag: Honduras",version:"2.0"},{emoji:"🇭🇷",category:8,name:"flag: Croatia",version:"2.0"},{emoji:"🇭🇹",category:8,name:"flag: Haiti",version:"2.0"},{emoji:"🇭🇺",category:8,name:"flag: Hungary",version:"2.0"},{emoji:"🇮🇨",category:8,name:"flag: Canary Islands",version:"2.0"},{emoji:"🇮🇩",category:8,name:"flag: Indonesia",version:"2.0"},{emoji:"🇮🇪",category:8,name:"flag: Ireland",version:"2.0"},{emoji:"🇮🇱",category:8,name:"flag: Israel",version:"2.0"},{emoji:"🇮🇲",category:8,name:"flag: Isle of Man",version:"2.0"},{emoji:"🇮🇳",category:8,name:"flag: India",version:"2.0"},{emoji:"🇮🇴",category:8,name:"flag: British Indian Ocean Territory",version:"2.0"},{emoji:"🇮🇶",category:8,name:"flag: Iraq",version:"2.0"},{emoji:"🇮🇷",category:8,name:"flag: Iran",version:"2.0"},{emoji:"🇮🇸",category:8,name:"flag: Iceland",version:"2.0"},{emoji:"🇮🇹",category:8,name:"flag: Italy",version:"1.0"},{emoji:"🇯🇪",category:8,name:"flag: Jersey",version:"2.0"},{emoji:"🇯🇲",category:8,name:"flag: Jamaica",version:"2.0"},{emoji:"🇯🇴",category:8,name:"flag: Jordan",version:"2.0"},{emoji:"🇯🇵",category:8,name:"flag: Japan",version:"1.0"},{emoji:"🇰🇪",category:8,name:"flag: Kenya",version:"2.0"},{emoji:"🇰🇬",category:8,name:"flag: Kyrgyzstan",version:"2.0"},{emoji:"🇰🇭",category:8,name:"flag: Cambodia",version:"2.0"},{emoji:"🇰🇮",category:8,name:"flag: Kiribati",version:"2.0"},{emoji:"🇰🇲",category:8,name:"flag: Comoros",version:"2.0"},{emoji:"🇰🇳",category:8,name:"flag: St. Kitts & Nevis",version:"2.0"},{emoji:"🇰🇵",category:8,name:"flag: North Korea",version:"2.0"},{emoji:"🇰🇷",category:8,name:"flag: South Korea",version:"1.0"},{emoji:"🇰🇼",category:8,name:"flag: Kuwait",version:"2.0"},{emoji:"🇰🇾",category:8,name:"flag: Cayman Islands",version:"2.0"},{emoji:"🇰🇿",category:8,name:"flag: Kazakhstan",version:"2.0"},{emoji:"🇱🇦",category:8,name:"flag: Laos",version:"2.0"},{emoji:"🇱🇧",category:8,name:"flag: Lebanon",version:"2.0"},{emoji:"🇱🇨",category:8,name:"flag: St. Lucia",version:"2.0"},{emoji:"🇱🇮",category:8,name:"flag: Liechtenstein",version:"2.0"},{emoji:"🇱🇰",category:8,name:"flag: Sri Lanka",version:"2.0"},{emoji:"🇱🇷",category:8,name:"flag: Liberia",version:"2.0"},{emoji:"🇱🇸",category:8,name:"flag: Lesotho",version:"2.0"},{emoji:"🇱🇹",category:8,name:"flag: Lithuania",version:"2.0"},{emoji:"🇱🇺",category:8,name:"flag: Luxembourg",version:"2.0"},{emoji:"🇱🇻",category:8,name:"flag: Latvia",version:"2.0"},{emoji:"🇱🇾",category:8,name:"flag: Libya",version:"2.0"},{emoji:"🇲🇦",category:8,name:"flag: Morocco",version:"2.0"},{emoji:"🇲🇨",category:8,name:"flag: Monaco",version:"2.0"},{emoji:"🇲🇩",category:8,name:"flag: Moldova",version:"2.0"},{emoji:"🇲🇪",category:8,name:"flag: Montenegro",version:"2.0"},{emoji:"🇲🇫",category:8,name:"flag: St. Martin",version:"2.0"},{emoji:"🇲🇬",category:8,name:"flag: Madagascar",version:"2.0"},{emoji:"🇲🇭",category:8,name:"flag: Marshall Islands",version:"2.0"},{emoji:"🇲🇰",category:8,name:"flag: North Macedonia",version:"2.0"},{emoji:"🇲🇱",category:8,name:"flag: Mali",version:"2.0"},{emoji:"🇲🇲",category:8,name:"flag: Myanmar (Burma)",version:"2.0"},{emoji:"🇲🇳",category:8,name:"flag: Mongolia",version:"2.0"},{emoji:"🇲🇴",category:8,name:"flag: Macao SAR China",version:"2.0"},{emoji:"🇲🇵",category:8,name:"flag: Northern Mariana Islands",version:"2.0"},{emoji:"🇲🇶",category:8,name:"flag: Martinique",version:"2.0"},{emoji:"🇲🇷",category:8,name:"flag: Mauritania",version:"2.0"},{emoji:"🇲🇸",category:8,name:"flag: Montserrat",version:"2.0"},{emoji:"🇲🇹",category:8,name:"flag: Malta",version:"2.0"},{emoji:"🇲🇺",category:8,name:"flag: Mauritius",version:"2.0"},{emoji:"🇲🇻",category:8,name:"flag: Maldives",version:"2.0"},{emoji:"🇲🇼",category:8,name:"flag: Malawi",version:"2.0"},{emoji:"🇲🇽",category:8,name:"flag: Mexico",version:"2.0"},{emoji:"🇲🇾",category:8,name:"flag: Malaysia",version:"2.0"},{emoji:"🇲🇿",category:8,name:"flag: Mozambique",version:"2.0"},{emoji:"🇳🇦",category:8,name:"flag: Namibia",version:"2.0"},{emoji:"🇳🇨",category:8,name:"flag: New Caledonia",version:"2.0"},{emoji:"🇳🇪",category:8,name:"flag: Niger",version:"2.0"},{emoji:"🇳🇫",category:8,name:"flag: Norfolk Island",version:"2.0"},{emoji:"🇳🇬",category:8,name:"flag: Nigeria",version:"2.0"},{emoji:"🇳🇮",category:8,name:"flag: Nicaragua",version:"2.0"},{emoji:"🇳🇱",category:8,name:"flag: Netherlands",version:"2.0"},{emoji:"🇳🇴",category:8,name:"flag: Norway",version:"2.0"},{emoji:"🇳🇵",category:8,name:"flag: Nepal",version:"2.0"},{emoji:"🇳🇷",category:8,name:"flag: Nauru",version:"2.0"},{emoji:"🇳🇺",category:8,name:"flag: Niue",version:"2.0"},{emoji:"🇳🇿",category:8,name:"flag: New Zealand",version:"2.0"},{emoji:"🇴🇲",category:8,name:"flag: Oman",version:"2.0"},{emoji:"🇵🇦",category:8,name:"flag: Panama",version:"2.0"},{emoji:"🇵🇪",category:8,name:"flag: Peru",version:"2.0"},{emoji:"🇵🇫",category:8,name:"flag: French Polynesia",version:"2.0"},{emoji:"🇵🇬",category:8,name:"flag: Papua New Guinea",version:"2.0"},{emoji:"🇵🇭",category:8,name:"flag: Philippines",version:"2.0"},{emoji:"🇵🇰",category:8,name:"flag: Pakistan",version:"2.0"},{emoji:"🇵🇱",category:8,name:"flag: Poland",version:"2.0"},{emoji:"🇵🇲",category:8,name:"flag: St. Pierre & Miquelon",version:"2.0"},{emoji:"🇵🇳",category:8,name:"flag: Pitcairn Islands",version:"2.0"},{emoji:"🇵🇷",category:8,name:"flag: Puerto Rico",version:"2.0"},{emoji:"🇵🇸",category:8,name:"flag: Palestinian Territories",version:"2.0"},{emoji:"🇵🇹",category:8,name:"flag: Portugal",version:"2.0"},{emoji:"🇵🇼",category:8,name:"flag: Palau",version:"2.0"},{emoji:"🇵🇾",category:8,name:"flag: Paraguay",version:"2.0"},{emoji:"🇶🇦",category:8,name:"flag: Qatar",version:"2.0"},{emoji:"🇷🇪",category:8,name:"flag: Réunion",version:"2.0"},{emoji:"🇷🇴",category:8,name:"flag: Romania",version:"2.0"},{emoji:"🇷🇸",category:8,name:"flag: Serbia",version:"2.0"},{emoji:"🇷🇺",category:8,name:"flag: Russia",version:"1.0"},{emoji:"🇷🇼",category:8,name:"flag: Rwanda",version:"2.0"},{emoji:"🇸🇦",category:8,name:"flag: Saudi Arabia",version:"2.0"},{emoji:"🇸🇧",category:8,name:"flag: Solomon Islands",version:"2.0"},{emoji:"🇸🇨",category:8,name:"flag: Seychelles",version:"2.0"},{emoji:"🇸🇩",category:8,name:"flag: Sudan",version:"2.0"},{emoji:"🇸🇪",category:8,name:"flag: Sweden",version:"2.0"},{emoji:"🇸🇬",category:8,name:"flag: Singapore",version:"2.0"},{emoji:"🇸🇭",category:8,name:"flag: St. Helena",version:"2.0"},{emoji:"🇸🇮",category:8,name:"flag: Slovenia",version:"2.0"},{emoji:"🇸🇯",category:8,name:"flag: Svalbard & Jan Mayen",version:"2.0"},{emoji:"🇸🇰",category:8,name:"flag: Slovakia",version:"2.0"},{emoji:"🇸🇱",category:8,name:"flag: Sierra Leone",version:"2.0"},{emoji:"🇸🇲",category:8,name:"flag: San Marino",version:"2.0"},{emoji:"🇸🇳",category:8,name:"flag: Senegal",version:"2.0"},{emoji:"🇸🇴",category:8,name:"flag: Somalia",version:"2.0"},{emoji:"🇸🇷",category:8,name:"flag: Suriname",version:"2.0"},{emoji:"🇸🇸",category:8,name:"flag: South Sudan",version:"2.0"},{emoji:"🇸🇹",category:8,name:"flag: São Tomé & Príncipe",version:"2.0"},{emoji:"🇸🇻",category:8,name:"flag: El Salvador",version:"2.0"},{emoji:"🇸🇽",category:8,name:"flag: Sint Maarten",version:"2.0"},{emoji:"🇸🇾",category:8,name:"flag: Syria",version:"2.0"},{emoji:"🇸🇿",category:8,name:"flag: Eswatini",version:"2.0"},{emoji:"🇹🇦",category:8,name:"flag: Tristan da Cunha",version:"2.0"},{emoji:"🇹🇨",category:8,name:"flag: Turks & Caicos Islands",version:"2.0"},{emoji:"🇹🇩",category:8,name:"flag: Chad",version:"2.0"},{emoji:"🇹🇫",category:8,name:"flag: French Southern Territories",version:"2.0"},{emoji:"🇹🇬",category:8,name:"flag: Togo",version:"2.0"},{emoji:"🇹🇭",category:8,name:"flag: Thailand",version:"2.0"},{emoji:"🇹🇯",category:8,name:"flag: Tajikistan",version:"2.0"},{emoji:"🇹🇰",category:8,name:"flag: Tokelau",version:"2.0"},{emoji:"🇹🇱",category:8,name:"flag: Timor-Leste",version:"2.0"},{emoji:"🇹🇲",category:8,name:"flag: Turkmenistan",version:"2.0"},{emoji:"🇹🇳",category:8,name:"flag: Tunisia",version:"2.0"},{emoji:"🇹🇴",category:8,name:"flag: Tonga",version:"2.0"},{emoji:"🇹🇷",category:8,name:"flag: Turkey",version:"2.0"},{emoji:"🇹🇹",category:8,name:"flag: Trinidad & Tobago",version:"2.0"},{emoji:"🇹🇻",category:8,name:"flag: Tuvalu",version:"2.0"},{emoji:"🇹🇼",category:8,name:"flag: Taiwan",version:"2.0"},{emoji:"🇹🇿",category:8,name:"flag: Tanzania",version:"2.0"},{emoji:"🇺🇦",category:8,name:"flag: Ukraine",version:"2.0"},{emoji:"🇺🇬",category:8,name:"flag: Uganda",version:"2.0"},{emoji:"🇺🇲",category:8,name:"flag: U.S. Outlying Islands",version:"2.0"},{emoji:"🇺🇳",category:8,name:"flag: United Nations",version:"4.0"},{emoji:"🇺🇸",category:8,name:"flag: United States",version:"1.0"},{emoji:"🇺🇾",category:8,name:"flag: Uruguay",version:"2.0"},{emoji:"🇺🇿",category:8,name:"flag: Uzbekistan",version:"2.0"},{emoji:"🇻🇦",category:8,name:"flag: Vatican City",version:"2.0"},{emoji:"🇻🇨",category:8,name:"flag: St. Vincent & Grenadines",version:"2.0"},{emoji:"🇻🇪",category:8,name:"flag: Venezuela",version:"2.0"},{emoji:"🇻🇬",category:8,name:"flag: British Virgin Islands",version:"2.0"},{emoji:"🇻🇮",category:8,name:"flag: U.S. Virgin Islands",version:"2.0"},{emoji:"🇻🇳",category:8,name:"flag: Vietnam",version:"2.0"},{emoji:"🇻🇺",category:8,name:"flag: Vanuatu",version:"2.0"},{emoji:"🇼🇫",category:8,name:"flag: Wallis & Futuna",version:"2.0"},{emoji:"🇼🇸",category:8,name:"flag: Samoa",version:"2.0"},{emoji:"🇽🇰",category:8,name:"flag: Kosovo",version:"2.0"},{emoji:"🇾🇪",category:8,name:"flag: Yemen",version:"2.0"},{emoji:"🇾🇹",category:8,name:"flag: Mayotte",version:"2.0"},{emoji:"🇿🇦",category:8,name:"flag: South Africa",version:"2.0"},{emoji:"🇿🇲",category:8,name:"flag: Zambia",version:"2.0"},{emoji:"🇿🇼",category:8,name:"flag: Zimbabwe",version:"2.0"},{emoji:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",category:8,name:"flag: England",version:"5.0"},{emoji:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",category:8,name:"flag: Scotland",version:"5.0"},{emoji:"🏴󠁧󠁢󠁷󠁬󠁳󠁿",category:8,name:"flag: Wales",version:"5.0"}]};
    /*!
     * escape-html
     * Copyright(c) 2012-2013 TJ Holowaychuk
     * Copyright(c) 2015 Andreas Lubbe
     * Copyright(c) 2015 Tiancheng "Timothy" Gu
     * MIT Licensed
     */
    var Ce=/["'&<>]/,Ee=function(e){var o,n=""+e,i=Ce.exec(n);if(!i)return n;var a="",r=0,t=0;for(r=i.index;r<n.length;r++){switch(n.charCodeAt(r)){case 34:o="&quot;";break;case 38:o="&amp;";break;case 39:o="&#39;";break;case 60:o="&lt;";break;case 62:o="&gt;";break;default:continue}t!==r&&(a+=n.substring(t,r)),t=r+1,a+=o;}return t!==r?a+n.substring(t,r):a};const _e="emoji-picker__emoji";function ze(e,o){const n=document.createElement(e);return o&&(n.className=o),n}function Oe(e){for(;e.firstChild;)e.removeChild(e.firstChild);}function Ie(e,o){e.dataset.loaded||(e.dataset.custom?function(e){const o=ze("img","emoji-picker__custom-emoji");e.dataset.emoji&&(o.src=Ee(e.dataset.emoji),e.innerText="",e.appendChild(o));}(e):"twemoji"===o.style&&function(e,o){e.dataset.emoji&&(e.innerHTML=ke.parse(e.dataset.emoji,o.twemojiOptions));}(e,o),e.dataset.loaded="true",e.style.opacity="1");}class Se{constructor(e,o){this.events=e,this.options=o;}render(){const e=ze("div","emoji-picker__preview");return this.emoji=ze("div","emoji-picker__preview-emoji"),e.appendChild(this.emoji),this.name=ze("div","emoji-picker__preview-name"),e.appendChild(this.name),this.events.on("showPreview",(e=>this.showPreview(e))),this.events.on("hidePreview",(()=>this.hidePreview())),e}showPreview(e){let o=e.emoji;e.custom?o=`<img class="emoji-picker__custom-emoji" src="${Ee(e.emoji)}">`:"twemoji"===this.options.style&&(o=ke.parse(e.emoji,this.options.twemojiOptions)),this.emoji.innerHTML=o,this.name.innerHTML=Ee(e.name);}hidePreview(){this.emoji.innerHTML="",this.name.innerHTML="";}}function Pe(e,o){for(var n=0;n<o.length;n++){var i=o[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i);}}function Me(e,o,n){return o in e?Object.defineProperty(e,o,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[o]=n,e}function Ae(e){for(var o=1;o<arguments.length;o++){var n=null!=arguments[o]?arguments[o]:{},i=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(n).filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})))),i.forEach((function(o){Me(e,o,n[o]);}));}return e}function Le(e,o){return function(e){if(Array.isArray(e))return e}(e)||function(e,o){var n=[],i=!0,a=!1,r=void 0;try{for(var t,s=e[Symbol.iterator]();!(i=(t=s.next()).done)&&(n.push(t.value),!o||n.length!==o);i=!0);}catch(e){a=!0,r=e;}finally{try{i||null==s.return||s.return();}finally{if(a)throw r}}return n}(e,o)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var Te=function(){},Ne={},Fe={},Be={mark:Te,measure:Te};try{"undefined"!=typeof window&&(Ne=window),"undefined"!=typeof document&&(Fe=document),"undefined"!=typeof MutationObserver&&MutationObserver,"undefined"!=typeof performance&&(Be=performance);}catch(e){}var De=(Ne.navigator||{}).userAgent,Re=void 0===De?"":De,qe=Ne,Ve=Fe,He=Be,Ue=(qe.document,!!Ve.documentElement&&!!Ve.head&&"function"==typeof Ve.addEventListener&&"function"==typeof Ve.createElement),We=(~Re.indexOf("MSIE")||Re.indexOf("Trident/"),"group"),Ke="primary",Je="secondary",Ge=qe.FontAwesomeConfig||{};if(Ve&&"function"==typeof Ve.querySelector){[["data-family-prefix","familyPrefix"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]].forEach((function(e){var o=Le(e,2),n=o[0],i=o[1],a=function(e){return ""===e||"false"!==e&&("true"===e||e)}(function(e){var o=Ve.querySelector("script["+e+"]");if(o)return o.getAttribute(e)}(n));null!=a&&(Ge[i]=a);}));}var Xe=Ae({},{familyPrefix:"fa",replacementClass:"svg-inline--fa",autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0},Ge);Xe.autoReplaceSvg||(Xe.observeMutations=!1);var Ye=Ae({},Xe);qe.FontAwesomeConfig=Ye;var $e=qe||{};$e.___FONT_AWESOME___||($e.___FONT_AWESOME___={}),$e.___FONT_AWESOME___.styles||($e.___FONT_AWESOME___.styles={}),$e.___FONT_AWESOME___.hooks||($e.___FONT_AWESOME___.hooks={}),$e.___FONT_AWESOME___.shims||($e.___FONT_AWESOME___.shims=[]);var Ze=$e.___FONT_AWESOME___,Qe=[];Ue&&((Ve.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(Ve.readyState)||Ve.addEventListener("DOMContentLoaded",(function e(){Ve.removeEventListener("DOMContentLoaded",e),Qe.map((function(e){return e()}));})));"undefined"!=typeof global&&void 0!==global.process&&global.process.emit,"undefined"==typeof setImmediate?setTimeout:setImmediate;var eo={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function oo(){for(var e=12,o="";e-- >0;)o+="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[62*Math.random()|0];return o}function no(e){return "".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function io(e){return Object.keys(e||{}).reduce((function(o,n){return o+"".concat(n,": ").concat(e[n],";")}),"")}function ao(e){return e.size!==eo.size||e.x!==eo.x||e.y!==eo.y||e.rotate!==eo.rotate||e.flipX||e.flipY}function ro(e){var o=e.transform,n=e.containerWidth,i=e.iconWidth,a={transform:"translate(".concat(n/2," 256)")},r="translate(".concat(32*o.x,", ").concat(32*o.y,") "),t="scale(".concat(o.size/16*(o.flipX?-1:1),", ").concat(o.size/16*(o.flipY?-1:1),") "),s="rotate(".concat(o.rotate," 0 0)");return {outer:a,inner:{transform:"".concat(r," ").concat(t," ").concat(s)},path:{transform:"translate(".concat(i/2*-1," -256)")}}}var to={x:0,y:0,width:"100%",height:"100%"};function so(e){var o=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return e.attributes&&(e.attributes.fill||o)&&(e.attributes.fill="black"),e}function mo(e){var o=e.icons,n=o.main,i=o.mask,a=e.prefix,r=e.iconName,t=e.transform,s=e.symbol,m=e.title,c=e.maskId,d=e.titleId,g=e.extra,u=e.watchable,l=void 0!==u&&u,v=i.found?i:n,y=v.width,f=v.height,j="fa-w-".concat(Math.ceil(y/f*16)),h=[Ye.replacementClass,r?"".concat(Ye.familyPrefix,"-").concat(r):"",j].filter((function(e){return -1===g.classes.indexOf(e)})).concat(g.classes).join(" "),p={children:[],attributes:Ae({},g.attributes,{"data-prefix":a,"data-icon":r,class:h,role:g.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(y," ").concat(f)})};l&&(p.attributes["data-fa-i2svg"]=""),m&&p.children.push({tag:"title",attributes:{id:p.attributes["aria-labelledby"]||"title-".concat(d||oo())},children:[m]});var b=Ae({},p,{prefix:a,iconName:r,main:n,mask:i,maskId:c,transform:t,symbol:s,styles:g.styles}),w=i.found&&n.found?function(e){var o,n=e.children,i=e.attributes,a=e.main,r=e.mask,t=e.maskId,s=e.transform,m=a.width,c=a.icon,d=r.width,g=r.icon,u=ro({transform:s,containerWidth:d,iconWidth:m}),l={tag:"rect",attributes:Ae({},to,{fill:"white"})},v=c.children?{children:c.children.map(so)}:{},y={tag:"g",attributes:Ae({},u.inner),children:[so(Ae({tag:c.tag,attributes:Ae({},c.attributes,u.path)},v))]},f={tag:"g",attributes:Ae({},u.outer),children:[y]},j="mask-".concat(t||oo()),h="clip-".concat(t||oo()),p={tag:"mask",attributes:Ae({},to,{id:j,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[l,f]},b={tag:"defs",children:[{tag:"clipPath",attributes:{id:h},children:(o=g,"g"===o.tag?o.children:[o])},p]};return n.push(b,{tag:"rect",attributes:Ae({fill:"currentColor","clip-path":"url(#".concat(h,")"),mask:"url(#".concat(j,")")},to)}),{children:n,attributes:i}}(b):function(e){var o=e.children,n=e.attributes,i=e.main,a=e.transform,r=io(e.styles);if(r.length>0&&(n.style=r),ao(a)){var t=ro({transform:a,containerWidth:i.width,iconWidth:i.width});o.push({tag:"g",attributes:Ae({},t.outer),children:[{tag:"g",attributes:Ae({},t.inner),children:[{tag:i.icon.tag,children:i.icon.children,attributes:Ae({},i.icon.attributes,t.path)}]}]});}else o.push(i.icon);return {children:o,attributes:n}}(b),k=w.children,x=w.attributes;return b.children=k,b.attributes=x,s?function(e){var o=e.prefix,n=e.iconName,i=e.children,a=e.attributes,r=e.symbol;return [{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:Ae({},a,{id:!0===r?"".concat(o,"-").concat(Ye.familyPrefix,"-").concat(n):r}),children:i}]}]}(b):function(e){var o=e.children,n=e.main,i=e.mask,a=e.attributes,r=e.styles,t=e.transform;if(ao(t)&&n.found&&!i.found){var s={x:n.width/n.height/2,y:.5};a.style=io(Ae({},r,{"transform-origin":"".concat(s.x+t.x/16,"em ").concat(s.y+t.y/16,"em")}));}return [{tag:"svg",attributes:a,children:o}]}(b)}var go=(Ye.measurePerformance&&He&&He.mark&&He.measure,function(e,o,n,i){var a,r,t,s=Object.keys(e),m=s.length,c=void 0!==i?function(e,o){return function(n,i,a,r){return e.call(o,n,i,a,r)}}(o,i):o;for(void 0===n?(a=1,t=e[s[0]]):(a=0,t=n);a<m;a++)t=c(t,e[r=s[a]],r,e);return t});function uo(e,o){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=n.skipHooks,a=void 0!==i&&i,r=Object.keys(o).reduce((function(e,n){var i=o[n];return !!i.icon?e[i.iconName]=i.icon:e[n]=i,e}),{});"function"!=typeof Ze.hooks.addPack||a?Ze.styles[e]=Ae({},Ze.styles[e]||{},r):Ze.hooks.addPack(e,r),"fas"===e&&uo("fa",o);}var lo=Ze.styles,vo=Ze.shims,yo=function(){var e=function(e){return go(lo,(function(o,n,i){return o[i]=go(n,e,{}),o}),{})};e((function(e,o,n){return o[3]&&(e[o[3]]=n),e})),e((function(e,o,n){var i=o[2];return e[n]=n,i.forEach((function(o){e[o]=n;})),e}));var o="far"in lo;go(vo,(function(e,n){var i=n[0],a=n[1],r=n[2];return "far"!==a||o||(a="fas"),e[i]={prefix:a,iconName:r},e}),{});};yo();Ze.styles;function fo(e,o,n){if(e&&e[o]&&e[o][n])return {prefix:o,iconName:n,icon:e[o][n]}}function jo(e){var o=e.tag,n=e.attributes,i=void 0===n?{}:n,a=e.children,r=void 0===a?[]:a;return "string"==typeof e?no(e):"<".concat(o," ").concat(function(e){return Object.keys(e||{}).reduce((function(o,n){return o+"".concat(n,'="').concat(no(e[n]),'" ')}),"").trim()}(i),">").concat(r.map(jo).join(""),"</").concat(o,">")}function ho(e){this.name="MissingIcon",this.message=e||"Icon unavailable",this.stack=(new Error).stack;}ho.prototype=Object.create(Error.prototype),ho.prototype.constructor=ho;var po={fill:"currentColor"},bo={attributeType:"XML",repeatCount:"indefinite",dur:"2s"},wo=(Ae({},po,{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"}),Ae({},bo,{attributeName:"opacity"}));Ae({},po,{cx:"256",cy:"364",r:"28"}),Ae({},bo,{attributeName:"r",values:"28;14;28;28;14;28;"}),Ae({},wo,{values:"1;0;1;1;0;1;"}),Ae({},po,{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),Ae({},wo,{values:"1;0;0;0;0;1;"}),Ae({},po,{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),Ae({},wo,{values:"0;0;1;1;0;0;"}),Ze.styles;function ko(e){var o=e[0],n=e[1],i=Le(e.slice(4),1)[0];return {found:!0,width:o,height:n,icon:Array.isArray(i)?{tag:"g",attributes:{class:"".concat(Ye.familyPrefix,"-").concat(We)},children:[{tag:"path",attributes:{class:"".concat(Ye.familyPrefix,"-").concat(Je),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(Ye.familyPrefix,"-").concat(Ke),fill:"currentColor",d:i[1]}}]}:{tag:"path",attributes:{fill:"currentColor",d:i}}}}Ze.styles;function xo(){Ye.autoAddCss&&!Oo&&(!function(e){if(e&&Ue){var o=Ve.createElement("style");o.setAttribute("type","text/css"),o.innerHTML=e;for(var n=Ve.head.childNodes,i=null,a=n.length-1;a>-1;a--){var r=n[a],t=(r.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(t)>-1&&(i=r);}Ve.head.insertBefore(o,i);}}(function(){var e="fa",o="svg-inline--fa",n=Ye.familyPrefix,i=Ye.replacementClass,a='svg:not(:root).svg-inline--fa {\n  overflow: visible;\n}\n\n.svg-inline--fa {\n  display: inline-block;\n  font-size: inherit;\n  height: 1em;\n  overflow: visible;\n  vertical-align: -0.125em;\n}\n.svg-inline--fa.fa-lg {\n  vertical-align: -0.225em;\n}\n.svg-inline--fa.fa-w-1 {\n  width: 0.0625em;\n}\n.svg-inline--fa.fa-w-2 {\n  width: 0.125em;\n}\n.svg-inline--fa.fa-w-3 {\n  width: 0.1875em;\n}\n.svg-inline--fa.fa-w-4 {\n  width: 0.25em;\n}\n.svg-inline--fa.fa-w-5 {\n  width: 0.3125em;\n}\n.svg-inline--fa.fa-w-6 {\n  width: 0.375em;\n}\n.svg-inline--fa.fa-w-7 {\n  width: 0.4375em;\n}\n.svg-inline--fa.fa-w-8 {\n  width: 0.5em;\n}\n.svg-inline--fa.fa-w-9 {\n  width: 0.5625em;\n}\n.svg-inline--fa.fa-w-10 {\n  width: 0.625em;\n}\n.svg-inline--fa.fa-w-11 {\n  width: 0.6875em;\n}\n.svg-inline--fa.fa-w-12 {\n  width: 0.75em;\n}\n.svg-inline--fa.fa-w-13 {\n  width: 0.8125em;\n}\n.svg-inline--fa.fa-w-14 {\n  width: 0.875em;\n}\n.svg-inline--fa.fa-w-15 {\n  width: 0.9375em;\n}\n.svg-inline--fa.fa-w-16 {\n  width: 1em;\n}\n.svg-inline--fa.fa-w-17 {\n  width: 1.0625em;\n}\n.svg-inline--fa.fa-w-18 {\n  width: 1.125em;\n}\n.svg-inline--fa.fa-w-19 {\n  width: 1.1875em;\n}\n.svg-inline--fa.fa-w-20 {\n  width: 1.25em;\n}\n.svg-inline--fa.fa-pull-left {\n  margin-right: 0.3em;\n  width: auto;\n}\n.svg-inline--fa.fa-pull-right {\n  margin-left: 0.3em;\n  width: auto;\n}\n.svg-inline--fa.fa-border {\n  height: 1.5em;\n}\n.svg-inline--fa.fa-li {\n  width: 2em;\n}\n.svg-inline--fa.fa-fw {\n  width: 1.25em;\n}\n\n.fa-layers svg.svg-inline--fa {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.fa-layers {\n  display: inline-block;\n  height: 1em;\n  position: relative;\n  text-align: center;\n  vertical-align: -0.125em;\n  width: 1em;\n}\n.fa-layers svg.svg-inline--fa {\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter, .fa-layers-text {\n  display: inline-block;\n  position: absolute;\n  text-align: center;\n}\n\n.fa-layers-text {\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter {\n  background-color: #ff253a;\n  border-radius: 1em;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  color: #fff;\n  height: 1.5em;\n  line-height: 1;\n  max-width: 5em;\n  min-width: 1.5em;\n  overflow: hidden;\n  padding: 0.25em;\n  right: 0;\n  text-overflow: ellipsis;\n  top: 0;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-bottom-right {\n  bottom: 0;\n  right: 0;\n  top: auto;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: bottom right;\n          transform-origin: bottom right;\n}\n\n.fa-layers-bottom-left {\n  bottom: 0;\n  left: 0;\n  right: auto;\n  top: auto;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: bottom left;\n          transform-origin: bottom left;\n}\n\n.fa-layers-top-right {\n  right: 0;\n  top: 0;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-top-left {\n  left: 0;\n  right: auto;\n  top: 0;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: top left;\n          transform-origin: top left;\n}\n\n.fa-lg {\n  font-size: 1.3333333333em;\n  line-height: 0.75em;\n  vertical-align: -0.0667em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: 2.5em;\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: -2em;\n  position: absolute;\n  text-align: center;\n  width: 2em;\n  line-height: inherit;\n}\n\n.fa-border {\n  border: solid 0.08em #eee;\n  border-radius: 0.1em;\n  padding: 0.2em 0.25em 0.15em;\n}\n\n.fa-pull-left {\n  float: left;\n}\n\n.fa-pull-right {\n  float: right;\n}\n\n.fa.fa-pull-left,\n.fas.fa-pull-left,\n.far.fa-pull-left,\n.fal.fa-pull-left,\n.fab.fa-pull-left {\n  margin-right: 0.3em;\n}\n.fa.fa-pull-right,\n.fas.fa-pull-right,\n.far.fa-pull-right,\n.fal.fa-pull-right,\n.fab.fa-pull-right {\n  margin-left: 0.3em;\n}\n\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n          animation: fa-spin 2s infinite linear;\n}\n\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n          animation: fa-spin 1s infinite steps(8);\n}\n\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=1)";\n  -webkit-transform: rotate(90deg);\n          transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2)";\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)";\n  -webkit-transform: rotate(270deg);\n          transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)";\n  -webkit-transform: scale(-1, 1);\n          transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";\n  -webkit-transform: scale(1, -1);\n          transform: scale(1, -1);\n}\n\n.fa-flip-both, .fa-flip-horizontal.fa-flip-vertical {\n  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";\n  -webkit-transform: scale(-1, -1);\n          transform: scale(-1, -1);\n}\n\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical,\n:root .fa-flip-both {\n  -webkit-filter: none;\n          filter: none;\n}\n\n.fa-stack {\n  display: inline-block;\n  height: 2em;\n  position: relative;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.svg-inline--fa.fa-stack-1x {\n  height: 1em;\n  width: 1.25em;\n}\n.svg-inline--fa.fa-stack-2x {\n  height: 2em;\n  width: 2.5em;\n}\n\n.fa-inverse {\n  color: #fff;\n}\n\n.sr-only {\n  border: 0;\n  clip: rect(0, 0, 0, 0);\n  height: 1px;\n  margin: -1px;\n  overflow: hidden;\n  padding: 0;\n  position: absolute;\n  width: 1px;\n}\n\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  clip: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  position: static;\n  width: auto;\n}\n\n.svg-inline--fa .fa-primary {\n  fill: var(--fa-primary-color, currentColor);\n  opacity: 1;\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa .fa-secondary {\n  fill: var(--fa-secondary-color, currentColor);\n  opacity: 0.4;\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-primary {\n  opacity: 0.4;\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-secondary {\n  opacity: 1;\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa mask .fa-primary,\n.svg-inline--fa mask .fa-secondary {\n  fill: black;\n}\n\n.fad.fa-inverse {\n  color: #fff;\n}';if(n!==e||i!==o){var r=new RegExp("\\.".concat(e,"\\-"),"g"),t=new RegExp("\\--".concat(e,"\\-"),"g"),s=new RegExp("\\.".concat(o),"g");a=a.replace(r,".".concat(n,"-")).replace(t,"--".concat(n,"-")).replace(s,".".concat(i));}return a}()),Oo=!0);}function Co(e,o){return Object.defineProperty(e,"abstract",{get:o}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map((function(e){return jo(e)}))}}),Object.defineProperty(e,"node",{get:function(){if(Ue){var o=Ve.createElement("div");return o.innerHTML=e.html,o.children}}}),e}function Eo(e){var o=e.prefix,n=void 0===o?"fa":o,i=e.iconName;if(i)return fo(zo.definitions,n,i)||fo(Ze.styles,n,i)}var _o,zo=new(function(){function e(){!function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,e),this.definitions={};}var o,n;return o=e,(n=[{key:"add",value:function(){for(var e=this,o=arguments.length,n=new Array(o),i=0;i<o;i++)n[i]=arguments[i];var a=n.reduce(this._pullDefinitions,{});Object.keys(a).forEach((function(o){e.definitions[o]=Ae({},e.definitions[o]||{},a[o]),uo(o,a[o]),yo();}));}},{key:"reset",value:function(){this.definitions={};}},{key:"_pullDefinitions",value:function(e,o){var n=o.prefix&&o.iconName&&o.icon?{0:o}:o;return Object.keys(n).map((function(o){var i=n[o],a=i.prefix,r=i.iconName,t=i.icon;e[a]||(e[a]={}),e[a][r]=t;})),e}}])&&Pe(o.prototype,n),e}()),Oo=!1,Io=(_o=function(e){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=o.transform,i=void 0===n?eo:n,a=o.symbol,r=void 0!==a&&a,t=o.mask,s=void 0===t?null:t,m=o.maskId,c=void 0===m?null:m,d=o.title,g=void 0===d?null:d,u=o.titleId,l=void 0===u?null:u,v=o.classes,y=void 0===v?[]:v,f=o.attributes,j=void 0===f?{}:f,h=o.styles,p=void 0===h?{}:h;if(e){var b=e.prefix,w=e.iconName,k=e.icon;return Co(Ae({type:"icon"},e),(function(){return xo(),Ye.autoA11y&&(g?j["aria-labelledby"]="".concat(Ye.replacementClass,"-title-").concat(l||oo()):(j["aria-hidden"]="true",j.focusable="false")),mo({icons:{main:ko(k),mask:s?ko(s.icon):{found:!1,width:null,height:null,icon:{}}},prefix:b,iconName:w,transform:Ae({},eo,i),symbol:r,title:g,maskId:c,titleId:l,extra:{attributes:j,styles:p,classes:y}})}))}},function(e){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=(e||{}).icon?e:Eo(e||{}),i=o.mask;return i&&(i=(i||{}).icon?i:Eo(i||{})),_o(n,Ae({},o,{mask:i}))});zo.add({prefix:"far",iconName:"building",icon:[448,512,[],"f1ad","M128 148v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12zm140 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-128 96h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm128 0h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-76 84v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm76 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm180 124v36H0v-36c0-6.6 5.4-12 12-12h19.5V24c0-13.3 10.7-24 24-24h337c13.3 0 24 10.7 24 24v440H436c6.6 0 12 5.4 12 12zM79.5 463H192v-67c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v67h112.5V49L80 48l-.5 415z"]},{prefix:"fas",iconName:"cat",icon:[512,512,[],"f6be","M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"]},{prefix:"fas",iconName:"coffee",icon:[640,512,[],"f0f4","M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z"]},{prefix:"far",iconName:"flag",icon:[512,512,[],"f024","M336.174 80c-49.132 0-93.305-32-161.913-32-31.301 0-58.303 6.482-80.721 15.168a48.04 48.04 0 0 0 2.142-20.727C93.067 19.575 74.167 1.594 51.201.104 23.242-1.71 0 20.431 0 48c0 17.764 9.657 33.262 24 41.562V496c0 8.837 7.163 16 16 16h16c8.837 0 16-7.163 16-16v-83.443C109.869 395.28 143.259 384 199.826 384c49.132 0 93.305 32 161.913 32 58.479 0 101.972-22.617 128.548-39.981C503.846 367.161 512 352.051 512 335.855V95.937c0-34.459-35.264-57.768-66.904-44.117C409.193 67.309 371.641 80 336.174 80zM464 336c-21.783 15.412-60.824 32-102.261 32-59.945 0-102.002-32-161.913-32-43.361 0-96.379 9.403-127.826 24V128c21.784-15.412 60.824-32 102.261-32 59.945 0 102.002 32 161.913 32 43.271 0 96.32-17.366 127.826-32v240z"]},{prefix:"far",iconName:"frown",icon:[496,512,[],"f119","M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-80 128c-40.2 0-78 17.7-103.8 48.6-8.5 10.2-7.1 25.3 3.1 33.8 10.2 8.4 25.3 7.1 33.8-3.1 16.6-19.9 41-31.4 66.9-31.4s50.3 11.4 66.9 31.4c8.1 9.7 23.1 11.9 33.8 3.1 10.2-8.5 11.5-23.6 3.1-33.8C326 321.7 288.2 304 248 304z"]},{prefix:"fas",iconName:"futbol",icon:[512,512,[],"f1e3","M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-48 0l-.003-.282-26.064 22.741-62.679-58.5 16.454-84.355 34.303 3.072c-24.889-34.216-60.004-60.089-100.709-73.141l13.651 31.939L256 139l-74.953-41.525 13.651-31.939c-40.631 13.028-75.78 38.87-100.709 73.141l34.565-3.073 16.192 84.355-62.678 58.5-26.064-22.741-.003.282c0 43.015 13.497 83.952 38.472 117.991l7.704-33.897 85.138 10.447 36.301 77.826-29.902 17.786c40.202 13.122 84.29 13.148 124.572 0l-29.902-17.786 36.301-77.826 85.138-10.447 7.704 33.897C442.503 339.952 456 299.015 456 256zm-248.102 69.571l-29.894-91.312L256 177.732l77.996 56.527-29.622 91.312h-96.476z"]},{prefix:"fas",iconName:"history",icon:[512,512,[],"f1da","M504 255.531c.253 136.64-111.18 248.372-247.82 248.468-59.015.042-113.223-20.53-155.822-54.911-11.077-8.94-11.905-25.541-1.839-35.607l11.267-11.267c8.609-8.609 22.353-9.551 31.891-1.984C173.062 425.135 212.781 440 256 440c101.705 0 184-82.311 184-184 0-101.705-82.311-184-184-184-48.814 0-93.149 18.969-126.068 49.932l50.754 50.754c10.08 10.08 2.941 27.314-11.313 27.314H24c-8.837 0-16-7.163-16-16V38.627c0-14.254 17.234-21.393 27.314-11.314l49.372 49.372C129.209 34.136 189.552 8 256 8c136.81 0 247.747 110.78 248 247.531zm-180.912 78.784l9.823-12.63c8.138-10.463 6.253-25.542-4.21-33.679L288 256.349V152c0-13.255-10.745-24-24-24h-16c-13.255 0-24 10.745-24 24v135.651l65.409 50.874c10.463 8.137 25.541 6.253 33.679-4.21z"]},{prefix:"fas",iconName:"icons",icon:[512,512,[],"f86d","M116.65 219.35a15.68 15.68 0 0 0 22.65 0l96.75-99.83c28.15-29 26.5-77.1-4.91-103.88C203.75-7.7 163-3.5 137.86 22.44L128 32.58l-9.85-10.14C93.05-3.5 52.25-7.7 24.86 15.64c-31.41 26.78-33 74.85-5 103.88zm143.92 100.49h-48l-7.08-14.24a27.39 27.39 0 0 0-25.66-17.78h-71.71a27.39 27.39 0 0 0-25.66 17.78l-7 14.24h-48A27.45 27.45 0 0 0 0 347.3v137.25A27.44 27.44 0 0 0 27.43 512h233.14A27.45 27.45 0 0 0 288 484.55V347.3a27.45 27.45 0 0 0-27.43-27.46zM144 468a52 52 0 1 1 52-52 52 52 0 0 1-52 52zm355.4-115.9h-60.58l22.36-50.75c2.1-6.65-3.93-13.21-12.18-13.21h-75.59c-6.3 0-11.66 3.9-12.5 9.1l-16.8 106.93c-1 6.3 4.88 11.89 12.5 11.89h62.31l-24.2 83c-1.89 6.65 4.2 12.9 12.23 12.9a13.26 13.26 0 0 0 10.92-5.25l92.4-138.91c4.88-6.91-1.16-15.7-10.87-15.7zM478.08.33L329.51 23.17C314.87 25.42 304 38.92 304 54.83V161.6a83.25 83.25 0 0 0-16-1.7c-35.35 0-64 21.48-64 48s28.65 48 64 48c35.2 0 63.73-21.32 64-47.66V99.66l112-17.22v47.18a83.25 83.25 0 0 0-16-1.7c-35.35 0-64 21.48-64 48s28.65 48 64 48c35.2 0 63.73-21.32 64-47.66V32c0-19.48-16-34.42-33.92-31.67z"]},{prefix:"far",iconName:"lightbulb",icon:[352,512,[],"f0eb","M176 80c-52.94 0-96 43.06-96 96 0 8.84 7.16 16 16 16s16-7.16 16-16c0-35.3 28.72-64 64-64 8.84 0 16-7.16 16-16s-7.16-16-16-16zM96.06 459.17c0 3.15.93 6.22 2.68 8.84l24.51 36.84c2.97 4.46 7.97 7.14 13.32 7.14h78.85c5.36 0 10.36-2.68 13.32-7.14l24.51-36.84c1.74-2.62 2.67-5.7 2.68-8.84l.05-43.18H96.02l.04 43.18zM176 0C73.72 0 0 82.97 0 176c0 44.37 16.45 84.85 43.56 115.78 16.64 18.99 42.74 58.8 52.42 92.16v.06h48v-.12c-.01-4.77-.72-9.51-2.15-14.07-5.59-17.81-22.82-64.77-62.17-109.67-20.54-23.43-31.52-53.15-31.61-84.14-.2-73.64 59.67-128 127.95-128 70.58 0 128 57.42 128 128 0 30.97-11.24 60.85-31.65 84.14-39.11 44.61-56.42 91.47-62.1 109.46a47.507 47.507 0 0 0-2.22 14.3v.1h48v-.05c9.68-33.37 35.78-73.18 52.42-92.16C335.55 260.85 352 220.37 352 176 352 78.8 273.2 0 176 0z"]},{prefix:"fas",iconName:"music",icon:[512,512,[],"f001","M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"]},{prefix:"fas",iconName:"search",icon:[512,512,[],"f002","M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"]},{prefix:"far",iconName:"smile",icon:[496,512,[],"f118","M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm4 72.6c-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.7-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8-10.1-8.4-25.3-7.1-33.8 3.1z"]},{prefix:"fas",iconName:"times",icon:[352,512,[],"f00d","M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"]},{prefix:"fas",iconName:"user",icon:[448,512,[],"f007","M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"]});const So=Io({prefix:"far",iconName:"building"}).html[0],Po=Io({prefix:"fas",iconName:"cat"}).html[0],Mo=Io({prefix:"fas",iconName:"coffee"}).html[0],Ao=Io({prefix:"far",iconName:"flag"}).html[0],Lo=Io({prefix:"fas",iconName:"futbol"}).html[0],To=Io({prefix:"far",iconName:"frown"}).html[0],No=Io({prefix:"fas",iconName:"history"}).html[0],Fo=Io({prefix:"fas",iconName:"icons"}).html[0],Bo=Io({prefix:"far",iconName:"lightbulb"}).html[0],Do=Io({prefix:"fas",iconName:"music"}).html[0],Ro=Io({prefix:"fas",iconName:"search"}).html[0],qo=Io({prefix:"far",iconName:"smile"}).html[0],Vo=Io({prefix:"fas",iconName:"times"}).html[0],Ho=Io({prefix:"fas",iconName:"user"}).html[0];function Uo(e){const o=document.createElement("img");return o.src=e,o}function Wo(){const e=localStorage.getItem("emojiPicker.recent");return (e?JSON.parse(e):[]).filter((e=>!!e.emoji))}class Ko{constructor(e,o,n,i,a,r=!0){this.emoji=e,this.showVariants=o,this.showPreview=n,this.events=i,this.options=a,this.lazy=r;}render(){this.emojiButton=ze("button",_e);let e=this.emoji.emoji;return this.emoji.custom?e=this.lazy?qo:`<img class="emoji-picker__custom-emoji" src="${Ee(this.emoji.emoji)}">`:"twemoji"===this.options.style&&(e=this.lazy?qo:ke.parse(this.emoji.emoji,this.options.twemojiOptions)),this.emojiButton.innerHTML=e,this.emojiButton.tabIndex=-1,this.emojiButton.dataset.emoji=this.emoji.emoji,this.emoji.custom&&(this.emojiButton.dataset.custom="true"),this.emojiButton.title=this.emoji.name,this.emojiButton.addEventListener("focus",(()=>this.onEmojiHover())),this.emojiButton.addEventListener("blur",(()=>this.onEmojiLeave())),this.emojiButton.addEventListener("click",(()=>this.onEmojiClick())),this.emojiButton.addEventListener("mouseover",(()=>this.onEmojiHover())),this.emojiButton.addEventListener("mouseout",(()=>this.onEmojiLeave())),"twemoji"===this.options.style&&this.lazy&&(this.emojiButton.style.opacity="0.25"),this.emojiButton}onEmojiClick(){this.emoji.variations&&this.showVariants&&this.options.showVariants||!this.options.showRecents||function(e,o){const n=Wo(),i={emoji:e.emoji,name:e.name,key:e.key||e.name,custom:e.custom};localStorage.setItem("emojiPicker.recent",JSON.stringify([i,...n.filter((e=>!!e.emoji&&e.key!==i.key))].slice(0,o.recentsCount)));}(this.emoji,this.options),this.events.emit("emoji",{emoji:this.emoji,showVariants:this.showVariants,button:this.emojiButton});}onEmojiHover(){this.showPreview&&this.events.emit("showPreview",this.emoji);}onEmojiLeave(){this.showPreview&&this.events.emit("hidePreview");}}class Jo{constructor(e,o,n,i,a=!0){this.showVariants=o,this.events=n,this.options=i,this.lazy=a,this.emojis=e.filter((e=>!e.version||parseFloat(e.version)<=parseFloat(i.emojiVersion)));}render(){const e=ze("div","emoji-picker__container");return this.emojis.forEach((o=>e.appendChild(new Ko(o,this.showVariants,!0,this.events,this.options,this.lazy).render()))),e}}var Go="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var Xo,Yo=(function(e){var o,n;o=Go,n=function(){var e="undefined"==typeof window,o=new Map,n=new Map,i=[];i.total=0;var a=[],r=[];function t(){o.clear(),n.clear(),a=[],r=[];}function s(e){for(var o=-9007199254740991,n=e.length-1;n>=0;--n){var i=e[n];if(null!==i){var a=i.score;a>o&&(o=a);}}return -9007199254740991===o?null:o}function m(e,o){var n=e[o];if(void 0!==n)return n;var i=o;Array.isArray(o)||(i=o.split("."));for(var a=i.length,r=-1;e&&++r<a;)e=e[i[r]];return e}function c(e){return "object"==typeof e}var d=function(){var e=[],o=0,n={};function i(){for(var n=0,i=e[n],a=1;a<o;){var r=a+1;n=a,r<o&&e[r].score<e[a].score&&(n=r),e[n-1>>1]=e[n],a=1+(n<<1);}for(var t=n-1>>1;n>0&&i.score<e[t].score;t=(n=t)-1>>1)e[n]=e[t];e[n]=i;}return n.add=function(n){var i=o;e[o++]=n;for(var a=i-1>>1;i>0&&n.score<e[a].score;a=(i=a)-1>>1)e[i]=e[a];e[i]=n;},n.poll=function(){if(0!==o){var n=e[0];return e[0]=e[--o],i(),n}},n.peek=function(n){if(0!==o)return e[0]},n.replaceTop=function(o){e[0]=o,i();},n},g=d();return function u(l){var v={single:function(e,o,n){return e?(c(e)||(e=v.getPreparedSearch(e)),o?(c(o)||(o=v.getPrepared(o)),((n&&void 0!==n.allowTypo?n.allowTypo:!l||void 0===l.allowTypo||l.allowTypo)?v.algorithm:v.algorithmNoTypo)(e,o,e[0])):null):null},go:function(e,o,n){if(!e)return i;var a=(e=v.prepareSearch(e))[0],r=n&&n.threshold||l&&l.threshold||-9007199254740991,t=n&&n.limit||l&&l.limit||9007199254740991,d=(n&&void 0!==n.allowTypo?n.allowTypo:!l||void 0===l.allowTypo||l.allowTypo)?v.algorithm:v.algorithmNoTypo,u=0,y=0,f=o.length;if(n&&n.keys)for(var j=n.scoreFn||s,h=n.keys,p=h.length,b=f-1;b>=0;--b){for(var w=o[b],k=new Array(p),x=p-1;x>=0;--x)(_=m(w,E=h[x]))?(c(_)||(_=v.getPrepared(_)),k[x]=d(e,_,a)):k[x]=null;k.obj=w;var C=j(k);null!==C&&(C<r||(k.score=C,u<t?(g.add(k),++u):(++y,C>g.peek().score&&g.replaceTop(k))));}else if(n&&n.key){var E=n.key;for(b=f-1;b>=0;--b)(_=m(w=o[b],E))&&(c(_)||(_=v.getPrepared(_)),null!==(z=d(e,_,a))&&(z.score<r||(z={target:z.target,_targetLowerCodes:null,_nextBeginningIndexes:null,score:z.score,indexes:z.indexes,obj:w},u<t?(g.add(z),++u):(++y,z.score>g.peek().score&&g.replaceTop(z)))));}else for(b=f-1;b>=0;--b){var _,z;(_=o[b])&&(c(_)||(_=v.getPrepared(_)),null!==(z=d(e,_,a))&&(z.score<r||(u<t?(g.add(z),++u):(++y,z.score>g.peek().score&&g.replaceTop(z)))));}if(0===u)return i;var O=new Array(u);for(b=u-1;b>=0;--b)O[b]=g.poll();return O.total=u+y,O},goAsync:function(o,n,a){var r=!1,t=new Promise((function(t,g){if(!o)return t(i);var u=(o=v.prepareSearch(o))[0],y=d(),f=n.length-1,j=a&&a.threshold||l&&l.threshold||-9007199254740991,h=a&&a.limit||l&&l.limit||9007199254740991,p=(a&&void 0!==a.allowTypo?a.allowTypo:!l||void 0===l.allowTypo||l.allowTypo)?v.algorithm:v.algorithmNoTypo,b=0,w=0;function k(){if(r)return g("canceled");var d=Date.now();if(a&&a.keys)for(var l=a.scoreFn||s,x=a.keys,C=x.length;f>=0;--f){for(var E=n[f],_=new Array(C),z=C-1;z>=0;--z)(S=m(E,I=x[z]))?(c(S)||(S=v.getPrepared(S)),_[z]=p(o,S,u)):_[z]=null;_.obj=E;var O=l(_);if(null!==O&&!(O<j)&&(_.score=O,b<h?(y.add(_),++b):(++w,O>y.peek().score&&y.replaceTop(_)),f%1e3==0&&Date.now()-d>=10))return void(e?setImmediate(k):setTimeout(k))}else if(a&&a.key){for(var I=a.key;f>=0;--f)if((S=m(E=n[f],I))&&(c(S)||(S=v.getPrepared(S)),null!==(P=p(o,S,u))&&!(P.score<j)&&(P={target:P.target,_targetLowerCodes:null,_nextBeginningIndexes:null,score:P.score,indexes:P.indexes,obj:E},b<h?(y.add(P),++b):(++w,P.score>y.peek().score&&y.replaceTop(P)),f%1e3==0&&Date.now()-d>=10)))return void(e?setImmediate(k):setTimeout(k))}else for(;f>=0;--f){var S,P;if((S=n[f])&&(c(S)||(S=v.getPrepared(S)),null!==(P=p(o,S,u))&&!(P.score<j)&&(b<h?(y.add(P),++b):(++w,P.score>y.peek().score&&y.replaceTop(P)),f%1e3==0&&Date.now()-d>=10)))return void(e?setImmediate(k):setTimeout(k))}if(0===b)return t(i);for(var M=new Array(b),A=b-1;A>=0;--A)M[A]=y.poll();M.total=b+w,t(M);}e?setImmediate(k):k();}));return t.cancel=function(){r=!0;},t},highlight:function(e,o,n){if(null===e)return null;void 0===o&&(o="<b>"),void 0===n&&(n="</b>");for(var i="",a=0,r=!1,t=e.target,s=t.length,m=e.indexes,c=0;c<s;++c){var d=t[c];if(m[a]===c){if(r||(r=!0,i+=o),++a===m.length){i+=d+n+t.substr(c+1);break}}else r&&(r=!1,i+=n);i+=d;}return i},prepare:function(e){if(e)return {target:e,_targetLowerCodes:v.prepareLowerCodes(e),_nextBeginningIndexes:null,score:null,indexes:null,obj:null}},prepareSlow:function(e){if(e)return {target:e,_targetLowerCodes:v.prepareLowerCodes(e),_nextBeginningIndexes:v.prepareNextBeginningIndexes(e),score:null,indexes:null,obj:null}},prepareSearch:function(e){if(e)return v.prepareLowerCodes(e)},getPrepared:function(e){if(e.length>999)return v.prepare(e);var n=o.get(e);return void 0!==n||(n=v.prepare(e),o.set(e,n)),n},getPreparedSearch:function(e){if(e.length>999)return v.prepareSearch(e);var o=n.get(e);return void 0!==o||(o=v.prepareSearch(e),n.set(e,o)),o},algorithm:function(e,o,n){for(var i=o._targetLowerCodes,t=e.length,s=i.length,m=0,c=0,d=0,g=0;;){if(n===i[c]){if(a[g++]=c,++m===t)break;n=e[0===d?m:d===m?m+1:d===m-1?m-1:m];}if(++c>=s)for(;;){if(m<=1)return null;if(0===d){if(n===e[--m])continue;d=m;}else {if(1===d)return null;if((n=e[1+(m=--d)])===e[m])continue}c=a[(g=m)-1]+1;break}}m=0;var u=0,l=!1,y=0,f=o._nextBeginningIndexes;null===f&&(f=o._nextBeginningIndexes=v.prepareNextBeginningIndexes(o.target));var j=c=0===a[0]?0:f[a[0]-1];if(c!==s)for(;;)if(c>=s){if(m<=0){if(++u>t-2)break;if(e[u]===e[u+1])continue;c=j;continue}--m,c=f[r[--y]];}else if(e[0===u?m:u===m?m+1:u===m-1?m-1:m]===i[c]){if(r[y++]=c,++m===t){l=!0;break}++c;}else c=f[c];if(l)var h=r,p=y;else h=a,p=g;for(var b=0,w=-1,k=0;k<t;++k)w!==(c=h[k])-1&&(b-=c),w=c;for(l?0!==u&&(b+=-20):(b*=1e3,0!==d&&(b+=-20)),b-=s-t,o.score=b,o.indexes=new Array(p),k=p-1;k>=0;--k)o.indexes[k]=h[k];return o},algorithmNoTypo:function(e,o,n){for(var i=o._targetLowerCodes,t=e.length,s=i.length,m=0,c=0,d=0;;){if(n===i[c]){if(a[d++]=c,++m===t)break;n=e[m];}if(++c>=s)return null}m=0;var g=!1,u=0,l=o._nextBeginningIndexes;if(null===l&&(l=o._nextBeginningIndexes=v.prepareNextBeginningIndexes(o.target)),(c=0===a[0]?0:l[a[0]-1])!==s)for(;;)if(c>=s){if(m<=0)break;--m,c=l[r[--u]];}else if(e[m]===i[c]){if(r[u++]=c,++m===t){g=!0;break}++c;}else c=l[c];if(g)var y=r,f=u;else y=a,f=d;for(var j=0,h=-1,p=0;p<t;++p)h!==(c=y[p])-1&&(j-=c),h=c;for(g||(j*=1e3),j-=s-t,o.score=j,o.indexes=new Array(f),p=f-1;p>=0;--p)o.indexes[p]=y[p];return o},prepareLowerCodes:function(e){for(var o=e.length,n=[],i=e.toLowerCase(),a=0;a<o;++a)n[a]=i.charCodeAt(a);return n},prepareBeginningIndexes:function(e){for(var o=e.length,n=[],i=0,a=!1,r=!1,t=0;t<o;++t){var s=e.charCodeAt(t),m=s>=65&&s<=90,c=m||s>=97&&s<=122||s>=48&&s<=57,d=m&&!a||!r||!c;a=m,r=c,d&&(n[i++]=t);}return n},prepareNextBeginningIndexes:function(e){for(var o=e.length,n=v.prepareBeginningIndexes(e),i=[],a=n[0],r=0,t=0;t<o;++t)a>t?i[t]=a:(a=n[++r],i[t]=void 0===a?o:a);return i},cleanup:t,new:u};return v}()},e.exports?e.exports=n():o.fuzzysort=n();}(Xo={exports:{}},Xo.exports),Xo.exports);class $o{constructor(e,o){this.message=e,this.iconUrl=o;}render(){const e=ze("div","emoji-picker__search-not-found"),o=ze("div","emoji-picker__search-not-found-icon");this.iconUrl?o.appendChild(Uo(this.iconUrl)):o.innerHTML=To,e.appendChild(o);const n=ze("h2");return n.innerHTML=Ee(this.message),e.appendChild(n),e}}class Zo{constructor(e,o,n,i,a){if(this.events=e,this.i18n=o,this.options=n,this.focusedEmojiIndex=0,this.emojisPerRow=this.options.emojisPerRow||8,this.emojiData=i.filter((e=>e.version&&parseFloat(e.version)<=parseFloat(n.emojiVersion)&&void 0!==e.category&&a.indexOf(e.category)>=0)),this.options.custom){const e=this.options.custom.map((e=>Object.assign(Object.assign({},e),{custom:!0})));this.emojiData=[...this.emojiData,...e];}this.events.on("hideVariantPopup",(()=>{setTimeout((()=>this.setFocusedEmoji(this.focusedEmojiIndex)));}));}render(){return this.searchContainer=ze("div","emoji-picker__search-container"),this.searchField=ze("input","emoji-picker__search"),this.searchField.placeholder=this.i18n.search,this.searchContainer.appendChild(this.searchField),this.searchIcon=ze("span","emoji-picker__search-icon"),this.options.icons&&this.options.icons.search?this.searchIcon.appendChild(Uo(this.options.icons.search)):this.searchIcon.innerHTML=Ro,this.searchIcon.addEventListener("click",(e=>this.onClearSearch(e))),this.searchContainer.appendChild(this.searchIcon),this.searchField.addEventListener("keydown",(e=>this.onKeyDown(e))),this.searchField.addEventListener("keyup",(e=>this.onKeyUp(e))),this.searchContainer}clear(){this.searchField.value="";}focus(){this.searchField.focus();}onClearSearch(e){e.stopPropagation(),this.searchField.value&&(this.searchField.value="",this.resultsContainer=null,this.options.icons&&this.options.icons.search?(Oe(this.searchIcon),this.searchIcon.appendChild(Uo(this.options.icons.search))):this.searchIcon.innerHTML=Ro,this.searchIcon.style.cursor="default",this.events.emit("hideSearchResults"),setTimeout((()=>this.searchField.focus())));}setFocusedEmoji(e){if(this.resultsContainer){const o=this.resultsContainer.querySelectorAll("."+_e);o[this.focusedEmojiIndex].tabIndex=-1,this.focusedEmojiIndex=e;const n=o[this.focusedEmojiIndex];n.tabIndex=0,n.focus();}}handleResultsKeydown(e){if(this.resultsContainer){const o=this.resultsContainer.querySelectorAll("."+_e);"ArrowRight"===e.key?this.setFocusedEmoji(Math.min(this.focusedEmojiIndex+1,o.length-1)):"ArrowLeft"===e.key?this.setFocusedEmoji(Math.max(0,this.focusedEmojiIndex-1)):"ArrowDown"===e.key?(e.preventDefault(),this.focusedEmojiIndex<o.length-this.emojisPerRow&&this.setFocusedEmoji(this.focusedEmojiIndex+this.emojisPerRow)):"ArrowUp"===e.key?(e.preventDefault(),this.focusedEmojiIndex>=this.emojisPerRow&&this.setFocusedEmoji(this.focusedEmojiIndex-this.emojisPerRow)):"Escape"===e.key&&this.onClearSearch(e);}}onKeyDown(e){"Escape"===e.key&&this.searchField.value&&this.onClearSearch(e);}onKeyUp(e){if("Tab"!==e.key&&"Shift"!==e.key)if(this.searchField.value){this.options.icons&&this.options.icons.clearSearch?(Oe(this.searchIcon),this.searchIcon.appendChild(Uo(this.options.icons.clearSearch))):this.searchIcon.innerHTML=Vo,this.searchIcon.style.cursor="pointer";const e=Yo.go(this.searchField.value,this.emojiData,{allowTypo:!0,limit:100,key:"name"}).map((e=>e.obj));this.events.emit("hidePreview"),e.length?(this.resultsContainer=new Jo(e,!0,this.events,this.options,!1).render(),this.resultsContainer&&(this.resultsContainer.querySelector("."+_e).tabIndex=0,this.focusedEmojiIndex=0,this.resultsContainer.addEventListener("keydown",(e=>this.handleResultsKeydown(e))),this.events.emit("showSearchResults",this.resultsContainer))):this.events.emit("showSearchResults",new $o(this.i18n.notFound,this.options.icons&&this.options.icons.notFound).render());}else this.options.icons&&this.options.icons.search?(Oe(this.searchIcon),this.searchIcon.appendChild(Uo(this.options.icons.search))):this.searchIcon.innerHTML=Ro,this.searchIcon.style.cursor="default",this.events.emit("hideSearchResults");}}class Qo{constructor(e,o,n){this.events=e,this.emoji=o,this.options=n,this.focusedEmojiIndex=0;}getEmoji(e){return this.popup.querySelectorAll("."+_e)[e]}setFocusedEmoji(e){this.getEmoji(this.focusedEmojiIndex).tabIndex=-1,this.focusedEmojiIndex=e;const o=this.getEmoji(this.focusedEmojiIndex);o.tabIndex=0,o.focus();}render(){this.popup=ze("div","emoji-picker__variant-popup");const e=ze("div","emoji-picker__variant-overlay");e.addEventListener("click",(e=>{e.stopPropagation(),this.popup.contains(e.target)||this.events.emit("hideVariantPopup");})),this.popup.appendChild(new Ko(this.emoji,!1,!1,this.events,this.options,!1).render()),(this.emoji.variations||[]).forEach(((e,o)=>this.popup.appendChild(new Ko({name:this.emoji.name,emoji:e,key:this.emoji.name+o},!1,!1,this.events,this.options,!1).render())));const o=this.popup.querySelector("."+_e);return this.focusedEmojiIndex=0,o.tabIndex=0,setTimeout((()=>o.focus())),this.popup.addEventListener("keydown",(e=>{"ArrowRight"===e.key?this.setFocusedEmoji(Math.min(this.focusedEmojiIndex+1,this.popup.querySelectorAll("."+_e).length-1)):"ArrowLeft"===e.key?this.setFocusedEmoji(Math.max(this.focusedEmojiIndex-1,0)):"Escape"===e.key&&(e.stopPropagation(),this.events.emit("hideVariantPopup"));})),e.appendChild(this.popup),e}}const en={search:"Search emojis...",categories:{recents:"Recent Emojis",smileys:"Smileys & Emotion",people:"People & Body",animals:"Animals & Nature",food:"Food & Drink",activities:"Activities",travel:"Travel & Places",objects:"Objects",symbols:"Symbols",flags:"Flags",custom:"Custom"},notFound:"No emojis found"},on={recents:No,smileys:qo,people:Ho,animals:Po,food:Mo,activities:Lo,travel:So,objects:Bo,symbols:Do,flags:Ao,custom:Fo};class nn{constructor(e,o,n){this.options=e,this.events=o,this.i18n=n,this.activeButton=0,this.buttons=[];}render(){var e;const o=ze("div","emoji-picker__category-buttons"),n=this.options.categories||(null===(e=this.options.emojiData)||void 0===e?void 0:e.categories)||xe.categories;let i=this.options.showRecents?["recents",...n]:n;return this.options.custom&&(i=[...i,"custom"]),i.forEach((e=>{const n=ze("button","emoji-picker__category-button");this.options.icons&&this.options.icons.categories&&this.options.icons.categories[e]?n.appendChild(Uo(this.options.icons.categories[e])):n.innerHTML=on[e],n.tabIndex=-1,n.title=this.i18n.categories[e],o.appendChild(n),this.buttons.push(n),n.addEventListener("click",(()=>{this.events.emit("categoryClicked",e);}));})),o.addEventListener("keydown",(e=>{switch(e.key){case"ArrowRight":this.events.emit("categoryClicked",i[(this.activeButton+1)%this.buttons.length]);break;case"ArrowLeft":this.events.emit("categoryClicked",i[0===this.activeButton?this.buttons.length-1:this.activeButton-1]);break;case"ArrowUp":case"ArrowDown":e.stopPropagation(),e.preventDefault();}})),o}setActiveButton(e,o=!0){let n=this.buttons[this.activeButton];n.classList.remove("active"),n.tabIndex=-1,this.activeButton=e,n=this.buttons[this.activeButton],n.classList.add("active"),n.tabIndex=0,o&&n.focus();}}const an=["recents","smileys","people","animals","food","activities","travel","objects","symbols","flags","custom"];class rn{constructor(e,o,n,i){var a;this.events=e,this.i18n=o,this.options=n,this.emojiCategories=i,this.currentCategory=0,this.headers=[],this.focusedIndex=0,this.handleKeyDown=e=>{switch(this.emojis.removeEventListener("scroll",this.highlightCategory),e.key){case"ArrowRight":this.focusedEmoji.tabIndex=-1,this.focusedIndex===this.currentEmojiCount-1&&this.currentCategory<this.categories.length-1?(this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(++this.currentCategory),this.setFocusedEmoji(0)):this.focusedIndex<this.currentEmojiCount-1&&this.setFocusedEmoji(this.focusedIndex+1);break;case"ArrowLeft":this.focusedEmoji.tabIndex=-1,0===this.focusedIndex&&this.currentCategory>0?(this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(--this.currentCategory),this.setFocusedEmoji(this.currentEmojiCount-1)):this.setFocusedEmoji(Math.max(0,this.focusedIndex-1));break;case"ArrowDown":e.preventDefault(),this.focusedEmoji.tabIndex=-1,this.focusedIndex+this.emojisPerRow>=this.currentEmojiCount&&this.currentCategory<this.categories.length-1?(this.currentCategory++,this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(this.currentCategory),this.setFocusedEmoji(Math.min(this.focusedIndex%this.emojisPerRow,this.currentEmojiCount-1))):this.currentEmojiCount-this.focusedIndex>this.emojisPerRow&&this.setFocusedEmoji(this.focusedIndex+this.emojisPerRow);break;case"ArrowUp":if(e.preventDefault(),this.focusedEmoji.tabIndex=-1,this.focusedIndex<this.emojisPerRow&&this.currentCategory>0){const e=this.getEmojiCount(this.currentCategory-1);let o=e%this.emojisPerRow;0===o&&(o=this.emojisPerRow);const n=this.focusedIndex,i=n>o-1?e-1:e-o+n;this.currentCategory--,this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(this.currentCategory),this.setFocusedEmoji(i);}else this.setFocusedEmoji(this.focusedIndex>=this.emojisPerRow?this.focusedIndex-this.emojisPerRow:this.focusedIndex);}requestAnimationFrame((()=>this.emojis.addEventListener("scroll",this.highlightCategory)));},this.addCategory=(e,o)=>{const n=ze("h2","emoji-picker__category-name");n.innerHTML=Ee(this.i18n.categories[e]||en.categories[e]),this.emojis.appendChild(n),this.headers.push(n),this.emojis.appendChild(new Jo(o,!0,this.events,this.options,"recents"!==e).render());},this.selectCategory=(e,o=!0)=>{this.emojis.removeEventListener("scroll",this.highlightCategory),this.focusedEmoji&&(this.focusedEmoji.tabIndex=-1);const n=this.categories.indexOf(e);this.currentCategory=n,this.setFocusedEmoji(0,!1),this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(this.currentCategory,o);const i=this.headerOffsets[n];this.emojis.scrollTop=i,requestAnimationFrame((()=>this.emojis.addEventListener("scroll",this.highlightCategory)));},this.highlightCategory=()=>{if(document.activeElement&&document.activeElement.classList.contains("emoji-picker__emoji"))return;let e=this.headerOffsets.findIndex((e=>e>=Math.round(this.emojis.scrollTop)));this.emojis.scrollTop+this.emojis.offsetHeight===this.emojis.scrollHeight&&(e=-1),0===e?e=1:e<0&&(e=this.headerOffsets.length),this.headerOffsets[e]===this.emojis.scrollTop&&e++,this.currentCategory=e-1,this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(this.currentCategory);},this.emojisPerRow=n.emojisPerRow||8,this.categories=(null===(a=n.emojiData)||void 0===a?void 0:a.categories)||n.categories||xe.categories,n.showRecents&&(this.categories=["recents",...this.categories]),n.custom&&(this.categories=[...this.categories,"custom"]),this.categories.sort(((e,o)=>an.indexOf(e)-an.indexOf(o)));}updateRecents(){if(this.options.showRecents){this.emojiCategories.recents=Wo();const e=this.emojis.querySelector(".emoji-picker__container");e&&e.parentNode&&e.parentNode.replaceChild(new Jo(this.emojiCategories.recents,!0,this.events,this.options,!1).render(),e);}}render(){this.container=ze("div","emoji-picker__emoji-area"),this.options.showCategoryButtons&&(this.categoryButtons=new nn(this.options,this.events,this.i18n),this.container.appendChild(this.categoryButtons.render())),this.emojis=ze("div","emoji-picker__emojis"),this.options.showRecents&&(this.emojiCategories.recents=Wo()),this.options.custom&&(this.emojiCategories.custom=this.options.custom.map((e=>Object.assign(Object.assign({},e),{custom:!0})))),this.categories.forEach((e=>this.addCategory(e,this.emojiCategories[e]))),requestAnimationFrame((()=>{setTimeout((()=>{setTimeout((()=>this.emojis.addEventListener("scroll",this.highlightCategory)));}));})),this.emojis.addEventListener("keydown",this.handleKeyDown),this.events.on("categoryClicked",this.selectCategory),this.container.appendChild(this.emojis);return this.container.querySelectorAll("."+_e)[0].tabIndex=0,this.container}reset(){this.headerOffsets=Array.prototype.map.call(this.headers,(e=>e.offsetTop)),this.selectCategory(this.options.initialCategory||"smileys",!1),this.currentCategory=this.categories.indexOf(this.options.initialCategory||"smileys"),this.options.showCategoryButtons&&this.categoryButtons.setActiveButton(this.currentCategory,!1);}get currentCategoryEl(){return this.emojis.querySelectorAll(".emoji-picker__container")[this.currentCategory]}get focusedEmoji(){return this.currentCategoryEl.querySelectorAll("."+_e)[this.focusedIndex]}get currentEmojiCount(){return this.currentCategoryEl.querySelectorAll("."+_e).length}getEmojiCount(e){return this.emojis.querySelectorAll(".emoji-picker__container")[e].querySelectorAll("."+_e).length}setFocusedEmoji(e,o=!0){this.focusedIndex=e,this.focusedEmoji&&(this.focusedEmoji.tabIndex=0,o&&this.focusedEmoji.focus());}}const tn={position:"auto",autoHide:!0,autoFocusSearch:!0,showAnimation:!0,showPreview:!0,showSearch:!0,showRecents:!0,showVariants:!0,showCategoryButtons:!0,recentsCount:50,emojiData:xe,emojiVersion:"12.1",theme:"light",categories:["smileys","people","animals","food","activities","travel","objects","symbols","flags"],style:"native",twemojiOptions:{ext:".svg",folder:"svg"},emojisPerRow:8,rows:6,emojiSize:"1.8em",initialCategory:"smileys"};class sn{constructor(e={}){this.events=new b,this.publicEvents=new b,this.pickerVisible=!1,this.options=Object.assign(Object.assign({},tn),e),this.options.rootElement||(this.options.rootElement=document.body),this.i18n=Object.assign(Object.assign({},en),e.i18n),this.onDocumentClick=this.onDocumentClick.bind(this),this.onDocumentKeydown=this.onDocumentKeydown.bind(this),this.theme=this.options.theme||"light",this.emojiCategories=function(e){const o={};return e.emoji.forEach((n=>{let i=o[e.categories[n.category||0]];i||(i=o[e.categories[n.category||0]]=[]),i.push(n);})),o}(this.options.emojiData||xe),this.buildPicker();}on(e,o){this.publicEvents.on(e,o);}off(e,o){this.publicEvents.off(e,o);}setStyleProperties(){this.options.showAnimation||this.pickerEl.style.setProperty("--animation-duration","0s"),this.options.emojisPerRow&&this.pickerEl.style.setProperty("--emoji-per-row",this.options.emojisPerRow.toString()),this.options.rows&&this.pickerEl.style.setProperty("--row-count",this.options.rows.toString()),this.options.emojiSize&&this.pickerEl.style.setProperty("--emoji-size",this.options.emojiSize),this.options.showCategoryButtons||this.pickerEl.style.setProperty("--category-button-height","0"),this.options.styleProperties&&Object.keys(this.options.styleProperties).forEach((e=>{this.options.styleProperties&&this.pickerEl.style.setProperty(e,this.options.styleProperties[e]);}));}showSearchResults(e){Oe(this.pickerContent),e.classList.add("search-results"),this.pickerContent.appendChild(e);}hideSearchResults(){this.pickerContent.firstChild!==this.emojiArea.container&&(Oe(this.pickerContent),this.pickerContent.appendChild(this.emojiArea.container)),this.emojiArea.reset();}emitEmoji({emoji:o,showVariants:n}){return e(this,void 0,void 0,(function*(){if(o.variations&&n&&this.options.showVariants)this.showVariantPopup(o);else {let e;setTimeout((()=>this.emojiArea.updateRecents())),e=o.custom?this.emitCustomEmoji(o):"twemoji"===this.options.style?yield this.emitTwemoji(o):this.emitNativeEmoji(o),this.publicEvents.emit("emoji",e),this.options.autoHide&&this.hidePicker();}}))}emitNativeEmoji(e){return {emoji:e.emoji,name:e.name}}emitCustomEmoji(e){return {url:e.emoji,name:e.name,custom:!0}}emitTwemoji(e){return new Promise((o=>{ke.parse(e.emoji,Object.assign(Object.assign({},this.options.twemojiOptions),{callback:(n,{base:i,size:a,ext:r})=>{const t=`${i}${a}/${n}${r}`;return o({url:t,emoji:e.emoji,name:e.name}),t}}));}))}buildSearch(){var e;this.options.showSearch&&(this.search=new Zo(this.events,this.i18n,this.options,(null===(e=this.options.emojiData)||void 0===e?void 0:e.emoji)||xe.emoji,(this.options.categories||[]).map((e=>(this.options.emojiData||xe).categories.indexOf(e)))),this.pickerEl.appendChild(this.search.render()));}buildPreview(){this.options.showPreview&&this.pickerEl.appendChild(new Se(this.events,this.options).render());}initPlugins(){if(this.options.plugins){const e=ze("div","emoji-picker__plugin-container");this.options.plugins.forEach((o=>{if(!o.render)throw new Error('Emoji Button plugins must have a "render" function.');e.appendChild(o.render(this));})),this.pickerEl.appendChild(e);}}initFocusTrap(){this.focusTrap=h(this.pickerEl,{clickOutsideDeactivates:!0,initialFocus:this.options.showSearch&&this.options.autoFocusSearch?".emoji-picker__search":'.emoji-picker__emoji[tabindex="0"]'});}buildPicker(){this.pickerEl=ze("div","emoji-picker"),this.pickerEl.classList.add(this.theme),this.setStyleProperties(),this.initFocusTrap(),this.pickerContent=ze("div","emoji-picker__content"),this.initPlugins(),this.buildSearch(),this.pickerEl.appendChild(this.pickerContent),this.emojiArea=new rn(this.events,this.i18n,this.options,this.emojiCategories),this.pickerContent.appendChild(this.emojiArea.render()),this.events.on("showSearchResults",this.showSearchResults.bind(this)),this.events.on("hideSearchResults",this.hideSearchResults.bind(this)),this.events.on("emoji",this.emitEmoji.bind(this)),this.buildPreview(),this.wrapper=ze("div","emoji-picker__wrapper"),this.wrapper.appendChild(this.pickerEl),this.wrapper.style.display="none",this.options.zIndex&&(this.wrapper.style.zIndex=this.options.zIndex+""),this.options.rootElement&&this.options.rootElement.appendChild(this.wrapper),this.observeForLazyLoad();}showVariantPopup(e){const o=new Qo(this.events,e,this.options).render();o&&this.pickerEl.appendChild(o),this.events.on("hideVariantPopup",(()=>{o&&(o.classList.add("hiding"),setTimeout((()=>{o&&this.pickerEl.removeChild(o);}),175)),this.events.off("hideVariantPopup");}));}observeForLazyLoad(){this.observer=new IntersectionObserver(this.handleIntersectionChange.bind(this),{root:this.emojiArea.emojis}),this.emojiArea.emojis.querySelectorAll("."+_e).forEach((e=>{this.shouldLazyLoad(e)&&this.observer.observe(e);}));}handleIntersectionChange(e){Array.prototype.filter.call(e,(e=>e.intersectionRatio>0)).map((e=>e.target)).forEach((e=>{Ie(e,this.options);}));}shouldLazyLoad(e){return "twemoji"===this.options.style||"true"===e.dataset.custom}onDocumentClick(e){this.pickerEl.contains(e.target)||this.hidePicker();}destroyPicker(){this.events.off("emoji"),this.events.off("hideVariantPopup"),this.options.rootElement&&(this.options.rootElement.removeChild(this.wrapper),this.popper&&this.popper.destroy()),this.observer&&this.observer.disconnect(),this.options.plugins&&this.options.plugins.forEach((e=>{e.destroy&&e.destroy();}));}hidePicker(){this.hideInProgress=!0,this.focusTrap.deactivate(),this.pickerVisible=!1,this.overlay&&(document.body.removeChild(this.overlay),this.overlay=void 0),this.emojiArea.emojis.removeEventListener("scroll",this.emojiArea.highlightCategory),this.pickerEl.classList.add("hiding"),setTimeout((()=>{this.wrapper.style.display="none",this.pickerEl.classList.remove("hiding"),this.pickerContent.firstChild!==this.emojiArea.container&&(Oe(this.pickerContent),this.pickerContent.appendChild(this.emojiArea.container)),this.search&&this.search.clear(),this.events.emit("hideVariantPopup"),this.hideInProgress=!1,this.popper&&this.popper.destroy(),this.publicEvents.emit("hidden");}),this.options.showAnimation?170:0),setTimeout((()=>{document.removeEventListener("click",this.onDocumentClick),document.removeEventListener("keydown",this.onDocumentKeydown);}));}showPicker(e){this.hideInProgress?setTimeout((()=>this.showPicker(e)),100):(this.pickerVisible=!0,this.wrapper.style.display="block",this.determineDisplay(e),this.focusTrap.activate(),setTimeout((()=>{this.addEventListeners(),this.setInitialFocus();})),this.emojiArea.reset());}determineDisplay(e){window.matchMedia("screen and (max-width: 450px)").matches?this.showMobileView():"string"==typeof this.options.position?this.setRelativePosition(e):this.setFixedPosition();}setInitialFocus(){this.pickerEl.querySelector(this.options.showSearch&&this.options.autoFocusSearch?".emoji-picker__search":`.${_e}[tabindex="0"]`).focus();}addEventListeners(){document.addEventListener("click",this.onDocumentClick),document.addEventListener("keydown",this.onDocumentKeydown);}setRelativePosition(e){this.popper=we(e,this.wrapper,{placement:this.options.position});}setFixedPosition(){var e;if(null===(e=this.options)||void 0===e?void 0:e.position){this.wrapper.style.position="fixed";const e=this.options.position;Object.keys(e).forEach((o=>{this.wrapper.style[o]=e[o];}));}}showMobileView(){const e=window.getComputedStyle(this.pickerEl),o=document.querySelector("html"),n=o&&o.clientHeight,i=o&&o.clientWidth,a=parseInt(e.height),r=n?n/2-a/2:0,t=parseInt(e.width),s=i?i/2-t/2:0;this.wrapper.style.position="fixed",this.wrapper.style.top=r+"px",this.wrapper.style.left=s+"px",this.wrapper.style.zIndex="5000",this.overlay=ze("div","emoji-picker__overlay"),document.body.appendChild(this.overlay);}togglePicker(e){this.pickerVisible?this.hidePicker():this.showPicker(e);}isPickerVisible(){return this.pickerVisible}onDocumentKeydown(e){"Escape"===e.key?this.hidePicker():"Tab"===e.key?this.pickerEl.classList.add("keyboard"):e.key.match(/^[\w]$/)&&this.search&&this.search.focus();}setTheme(e){e!==this.theme&&(this.pickerEl.classList.remove(this.theme),this.theme=e,this.pickerEl.classList.add(e));}}

    /* node_modules/carbon-icons-svelte/lib/SelectWindow.svelte generated by Svelte v3.49.0 */

    const file$8 = "node_modules/carbon-icons-svelte/lib/SelectWindow.svelte";

    // (23:2) {#if title}
    function create_if_block$7(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$8, 22, 13, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(23:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$7(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M8 26H4a2.0021 2.0021 0 01-2-2V20H4v4H8zM2 12H4V16H2zM26 8H24V4H20V2h4a2.0021 2.0021 0 012 2zM12 2H16V4H12zM4 8H2V4A2.0021 2.0021 0 014 2H8V4H4zM27 32a.9967.9967 0 01-.707-.293l-6.1377-6.1377L16.832 30.5547a1 1 0 01-1.79-.2676l-6-20A1 1 0 0110.2871 9.042l20 6a1 1 0 01.2676 1.79l-4.9854 3.3233L31.707 26.293a.9994.9994 0 010 1.414l-4 4A.9967.9967 0 0127 32zm0-2.4141L29.5859 27 22.431 19.845l5.2458-3.4978L11.4917 11.4917l4.8555 16.1851L19.845 22.431z");
    			add_location(path, file$8, 23, 2, 573);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$8, 13, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectWindow', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class SelectWindow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectWindow",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get size() {
    		throw new Error("<SelectWindow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<SelectWindow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SelectWindow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SelectWindow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Renew.svelte generated by Svelte v3.49.0 */

    const file$7 = "node_modules/carbon-icons-svelte/lib/Renew.svelte";

    // (23:2) {#if title}
    function create_if_block$6(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$7, 22, 13, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(23:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$6(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M12 10H6.78A11 11 0 0127 16h2A13 13 0 006 7.68V4H4v8h8zM20 22h5.22A11 11 0 015 16H3a13 13 0 0023 8.32V28h2V20H20z");
    			add_location(path, file$7, 23, 2, 573);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$7, 13, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Renew', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class Renew extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Renew",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get size() {
    		throw new Error("<Renew>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Renew>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Renew>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Renew>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/emojiPicker.svelte generated by Svelte v3.49.0 */

    function create_fragment$7(ctx) {
    	let button;
    	let current;

    	let button_props = {
    		kind: "ghost",
    		iconDescription: "Change Emoji",
    		icon: Renew
    	};

    	button = new Button({ props: button_props, $$inline: true });
    	/*button_binding*/ ctx[2](button);
    	button.$on("click", /*togglePicker*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*button_binding*/ ctx[2](null);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EmojiPicker', slots, []);
    	const dispatch = createEventDispatcher();
    	const picker = new sn();
    	let trigger;

    	picker.on("emoji", selection => {
    		dispatch("change", selection);
    	});

    	function togglePicker() {
    		picker.togglePicker(trigger);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EmojiPicker> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			trigger = $$value;
    			$$invalidate(0, trigger);
    		});
    	}

    	$$self.$capture_state = () => ({
    		EmojiButton: sn,
    		Button,
    		createEventDispatcher,
    		SelectWindow,
    		Renew,
    		dispatch,
    		picker,
    		trigger,
    		togglePicker
    	});

    	$$self.$inject_state = $$props => {
    		if ('trigger' in $$props) $$invalidate(0, trigger = $$props.trigger);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [trigger, togglePicker, button_binding];
    }

    class EmojiPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmojiPicker",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/main-edit.svelte generated by Svelte v3.49.0 */
    const file$6 = "src/pages/main-edit.svelte";

    // (68:8) <Column>
    function create_default_slot_12(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let h5;
    	let t5;
    	let hr;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(/*pluginemoji*/ ctx[3]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*pluginname*/ ctx[2]);
    			t3 = space();
    			h5 = element("h5");
    			h5.textContent = "Edit Widget";
    			t5 = space();
    			hr = element("hr");
    			set_style(h1, "text-align", "center");
    			add_location(h1, file$6, 68, 10, 1780);
    			set_style(h2, "text-align", "center");
    			attr_dev(h2, "class", "svelte-11f4d6x");
    			add_location(h2, file$6, 69, 10, 1839);
    			set_style(h5, "text-align", "center");
    			add_location(h5, file$6, 70, 10, 1897);
    			add_location(hr, file$6, 71, 10, 1954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pluginemoji*/ 8) set_data_dev(t0, /*pluginemoji*/ ctx[3]);
    			if (dirty & /*pluginname*/ 4) set_data_dev(t2, /*pluginname*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(68:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (67:6) <Row>
    function create_default_slot_11(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 262156) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(67:6) <Row>",
    		ctx
    	});

    	return block;
    }

    // (66:4) <Grid>
    function create_default_slot_10(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 262156) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(66:4) <Grid>",
    		ctx
    	});

    	return block;
    }

    // (81:8) <Tile>
    function create_default_slot_9(ctx) {
    	let p;
    	let t1;
    	let br;
    	let t2;
    	let colorpicker;
    	let updating_theme;
    	let updating_value;
    	let current;

    	function colorpicker_theme_binding(value) {
    		/*colorpicker_theme_binding*/ ctx[12](value);
    	}

    	function colorpicker_value_binding(value) {
    		/*colorpicker_value_binding*/ ctx[13](value);
    	}

    	let colorpicker_props = {};

    	if (/*theme*/ ctx[1] !== void 0) {
    		colorpicker_props.theme = /*theme*/ ctx[1];
    	}

    	if (/*widget*/ ctx[0].color !== void 0) {
    		colorpicker_props.value = /*widget*/ ctx[0].color;
    	}

    	colorpicker = new ColorPicker({ props: colorpicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorpicker, 'theme', colorpicker_theme_binding));
    	binding_callbacks.push(() => bind(colorpicker, 'value', colorpicker_value_binding));

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Color:";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			create_component(colorpicker.$$.fragment);
    			add_location(p, file$6, 81, 8, 2427);
    			add_location(br, file$6, 82, 8, 2449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(colorpicker, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const colorpicker_changes = {};

    			if (!updating_theme && dirty & /*theme*/ 2) {
    				updating_theme = true;
    				colorpicker_changes.theme = /*theme*/ ctx[1];
    				add_flush_callback(() => updating_theme = false);
    			}

    			if (!updating_value && dirty & /*widget*/ 1) {
    				updating_value = true;
    				colorpicker_changes.value = /*widget*/ ctx[0].color;
    				add_flush_callback(() => updating_value = false);
    			}

    			colorpicker.$set(colorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			destroy_component(colorpicker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(81:8) <Tile>",
    		ctx
    	});

    	return block;
    }

    // (87:8) <Tile>
    function create_default_slot_8(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t1;
    	let br;
    	let t2;
    	let h2;
    	let emojipicker;
    	let t3;
    	let t4_value = /*widget*/ ctx[0].emoji + "";
    	let t4;
    	let current;
    	emojipicker = new EmojiPicker({ $$inline: true });
    	emojipicker.$on("change", /*onEmojiChange*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Emoji:";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			h2 = element("h2");
    			create_component(emojipicker.$$.fragment);
    			t3 = space();
    			t4 = text(t4_value);
    			add_location(p, file$6, 89, 8, 2658);
    			add_location(br, file$6, 90, 8, 2680);
    			attr_dev(h2, "class", "svelte-11f4d6x");
    			add_location(h2, file$6, 91, 8, 2693);
    			attr_dev(div0, "class", "column svelte-11f4d6x");
    			set_style(div0, "width", "40%");
    			add_location(div0, file$6, 88, 10, 2611);
    			attr_dev(div1, "class", "row svelte-11f4d6x");
    			add_location(div1, file$6, 87, 6, 2583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div0, t1);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    			append_dev(div0, h2);
    			mount_component(emojipicker, h2, null);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*widget*/ 1) && t4_value !== (t4_value = /*widget*/ ctx[0].emoji + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(emojipicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(emojipicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(emojipicker);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(87:8) <Tile>",
    		ctx
    	});

    	return block;
    }

    // (101:8) <Select hideLabel labelText="Carbon theme" bind:selected={widget.days}>
    function create_default_slot_7(ctx) {
    	let selectitem0;
    	let t0;
    	let selectitem1;
    	let t1;
    	let selectitem2;
    	let t2;
    	let selectitem3;
    	let t3;
    	let selectitem4;
    	let current;

    	selectitem0 = new SelectItem({
    			props: { value: "10", text: "Last 10 Days" },
    			$$inline: true
    		});

    	selectitem1 = new SelectItem({
    			props: { value: "20", text: "Last 20 Days" },
    			$$inline: true
    		});

    	selectitem2 = new SelectItem({
    			props: { value: "30", text: "Last 30 Days" },
    			$$inline: true
    		});

    	selectitem3 = new SelectItem({
    			props: { value: "60", text: "Last 60 Days" },
    			$$inline: true
    		});

    	selectitem4 = new SelectItem({
    			props: { value: "90", text: "Last 90 Days" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectitem0.$$.fragment);
    			t0 = space();
    			create_component(selectitem1.$$.fragment);
    			t1 = space();
    			create_component(selectitem2.$$.fragment);
    			t2 = space();
    			create_component(selectitem3.$$.fragment);
    			t3 = space();
    			create_component(selectitem4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(selectitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(selectitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(selectitem3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(selectitem4, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectitem0.$$.fragment, local);
    			transition_in(selectitem1.$$.fragment, local);
    			transition_in(selectitem2.$$.fragment, local);
    			transition_in(selectitem3.$$.fragment, local);
    			transition_in(selectitem4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectitem0.$$.fragment, local);
    			transition_out(selectitem1.$$.fragment, local);
    			transition_out(selectitem2.$$.fragment, local);
    			transition_out(selectitem3.$$.fragment, local);
    			transition_out(selectitem4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(selectitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(selectitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(selectitem3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(selectitem4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(101:8) <Select hideLabel labelText=\\\"Carbon theme\\\" bind:selected={widget.days}>",
    		ctx
    	});

    	return block;
    }

    // (97:6) <Tile>
    function create_default_slot_6(ctx) {
    	let div;
    	let p;
    	let t1;
    	let br;
    	let t2;
    	let select;
    	let updating_selected;
    	let current;

    	function select_selected_binding(value) {
    		/*select_selected_binding*/ ctx[14](value);
    	}

    	let select_props = {
    		hideLabel: true,
    		labelText: "Carbon theme",
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};

    	if (/*widget*/ ctx[0].days !== void 0) {
    		select_props.selected = /*widget*/ ctx[0].days;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, 'selected', select_selected_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Time Range:";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			create_component(select.$$.fragment);
    			add_location(p, file$6, 98, 8, 2862);
    			add_location(br, file$6, 99, 8, 2889);
    			attr_dev(div, "class", "row svelte-11f4d6x");
    			add_location(div, file$6, 97, 8, 2836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, br);
    			append_dev(div, t2);
    			mount_component(select, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty & /*widget*/ 1) {
    				updating_selected = true;
    				select_changes.selected = /*widget*/ ctx[0].days;
    				add_flush_callback(() => updating_selected = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(select);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(97:6) <Tile>",
    		ctx
    	});

    	return block;
    }

    // (114:21) <Button kind="secondary" on:click={()=>{dispatch("exitedit")}} style="float: left;">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Exit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(114:21) <Button kind=\\\"secondary\\\" on:click={()=>{dispatch(\\\"exitedit\\\")}} style=\\\"float: left;\\\">",
    		ctx
    	});

    	return block;
    }

    // (112:10) <Column>
    function create_default_slot_4(ctx) {
    	let br0;
    	let t0;
    	let span;
    	let button;
    	let t1;
    	let br1;
    	let current;

    	button = new Button({
    			props: {
    				kind: "secondary",
    				style: "float: left;",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[15]);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			span = element("span");
    			create_component(button.$$.fragment);
    			t1 = space();
    			br1 = element("br");
    			add_location(br0, file$6, 112, 14, 3363);
    			add_location(span, file$6, 113, 15, 3383);
    			add_location(br1, file$6, 114, 15, 3509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(112:10) <Column>",
    		ctx
    	});

    	return block;
    }

    // (119:19) <Button disabled={disablebutton} on:click={()=>{updateWidget()}} style="float: right;">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Save");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(119:19) <Button disabled={disablebutton} on:click={()=>{updateWidget()}} style=\\\"float: right;\\\">",
    		ctx
    	});

    	return block;
    }

    // (117:8) <Column>
    function create_default_slot_2(ctx) {
    	let br0;
    	let t0;
    	let span;
    	let button;
    	let t1;
    	let br1;
    	let current;

    	button = new Button({
    			props: {
    				disabled: /*disablebutton*/ ctx[4],
    				style: "float: right;",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[16]);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			span = element("span");
    			create_component(button.$$.fragment);
    			t1 = space();
    			br1 = element("br");
    			add_location(br0, file$6, 117, 12, 3563);
    			add_location(span, file$6, 118, 13, 3581);
    			add_location(br1, file$6, 119, 13, 3708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*disablebutton*/ 16) button_changes.disabled = /*disablebutton*/ ctx[4];

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(117:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (111:8) <Row>
    function create_default_slot_1$1(ctx) {
    	let column0;
    	let t;
    	let column1;
    	let current;

    	column0 = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	column1 = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column0.$$.fragment);
    			t = space();
    			create_component(column1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(column1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column0_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				column0_changes.$$scope = { dirty, ctx };
    			}

    			column0.$set(column0_changes);
    			const column1_changes = {};

    			if (dirty & /*$$scope, disablebutton*/ 262160) {
    				column1_changes.$$scope = { dirty, ctx };
    			}

    			column1.$set(column1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column0.$$.fragment, local);
    			transition_in(column1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column0.$$.fragment, local);
    			transition_out(column1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(column1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(111:8) <Row>",
    		ctx
    	});

    	return block;
    }

    // (65:0) <Content>
    function create_default_slot$1(ctx) {
    	let grid;
    	let t0;
    	let textarea0;
    	let updating_value;
    	let t1;
    	let textarea1;
    	let updating_value_1;
    	let t2;
    	let textarea2;
    	let updating_value_2;
    	let t3;
    	let br0;
    	let t4;
    	let tile0;
    	let t5;
    	let br1;
    	let t6;
    	let tile1;
    	let t7;
    	let br2;
    	let t8;
    	let tile2;
    	let t9;
    	let br3;
    	let t10;
    	let row;
    	let current;

    	grid = new Grid({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function textarea0_value_binding(value) {
    		/*textarea0_value_binding*/ ctx[9](value);
    	}

    	let textarea0_props = {
    		rows: 1,
    		maxCount: 20,
    		labelText: "Name",
    		placeholder: "Enter Name..."
    	};

    	if (/*widget*/ ctx[0].name !== void 0) {
    		textarea0_props.value = /*widget*/ ctx[0].name;
    	}

    	textarea0 = new TextArea({ props: textarea0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea0, 'value', textarea0_value_binding));

    	function textarea1_value_binding(value) {
    		/*textarea1_value_binding*/ ctx[10](value);
    	}

    	let textarea1_props = {
    		rows: 2,
    		maxCount: 200,
    		labelText: "Widget description",
    		placeholder: "Enter a description..."
    	};

    	if (/*widget*/ ctx[0].description !== void 0) {
    		textarea1_props.value = /*widget*/ ctx[0].description;
    	}

    	textarea1 = new TextArea({ props: textarea1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea1, 'value', textarea1_value_binding));

    	function textarea2_value_binding(value) {
    		/*textarea2_value_binding*/ ctx[11](value);
    	}

    	let textarea2_props = {
    		rows: 4,
    		maxCount: 1000,
    		labelText: "Widget keywords",
    		placeholder: "Enter keywords..."
    	};

    	if (/*keywords*/ ctx[5] !== void 0) {
    		textarea2_props.value = /*keywords*/ ctx[5];
    	}

    	textarea2 = new TextArea({ props: textarea2_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea2, 'value', textarea2_value_binding));

    	tile0 = new Tile({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tile1 = new Tile({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tile2 = new Tile({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(grid.$$.fragment);
    			t0 = space();
    			create_component(textarea0.$$.fragment);
    			t1 = space();
    			create_component(textarea1.$$.fragment);
    			t2 = space();
    			create_component(textarea2.$$.fragment);
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			create_component(tile0.$$.fragment);
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			create_component(tile1.$$.fragment);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			create_component(tile2.$$.fragment);
    			t9 = space();
    			br3 = element("br");
    			t10 = space();
    			create_component(row.$$.fragment);
    			add_location(br0, file$6, 79, 8, 2399);
    			add_location(br1, file$6, 85, 8, 2557);
    			add_location(br2, file$6, 95, 8, 2810);
    			add_location(br3, file$6, 109, 8, 3311);
    		},
    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(textarea0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(textarea1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(textarea2, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tile0, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(tile1, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(tile2, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const grid_changes = {};

    			if (dirty & /*$$scope, pluginname, pluginemoji*/ 262156) {
    				grid_changes.$$scope = { dirty, ctx };
    			}

    			grid.$set(grid_changes);
    			const textarea0_changes = {};

    			if (!updating_value && dirty & /*widget*/ 1) {
    				updating_value = true;
    				textarea0_changes.value = /*widget*/ ctx[0].name;
    				add_flush_callback(() => updating_value = false);
    			}

    			textarea0.$set(textarea0_changes);
    			const textarea1_changes = {};

    			if (!updating_value_1 && dirty & /*widget*/ 1) {
    				updating_value_1 = true;
    				textarea1_changes.value = /*widget*/ ctx[0].description;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textarea1.$set(textarea1_changes);
    			const textarea2_changes = {};

    			if (!updating_value_2 && dirty & /*keywords*/ 32) {
    				updating_value_2 = true;
    				textarea2_changes.value = /*keywords*/ ctx[5];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			textarea2.$set(textarea2_changes);
    			const tile0_changes = {};

    			if (dirty & /*$$scope, theme, widget*/ 262147) {
    				tile0_changes.$$scope = { dirty, ctx };
    			}

    			tile0.$set(tile0_changes);
    			const tile1_changes = {};

    			if (dirty & /*$$scope, widget*/ 262145) {
    				tile1_changes.$$scope = { dirty, ctx };
    			}

    			tile1.$set(tile1_changes);
    			const tile2_changes = {};

    			if (dirty & /*$$scope, widget*/ 262145) {
    				tile2_changes.$$scope = { dirty, ctx };
    			}

    			tile2.$set(tile2_changes);
    			const row_changes = {};

    			if (dirty & /*$$scope, disablebutton*/ 262160) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			transition_in(textarea0.$$.fragment, local);
    			transition_in(textarea1.$$.fragment, local);
    			transition_in(textarea2.$$.fragment, local);
    			transition_in(tile0.$$.fragment, local);
    			transition_in(tile1.$$.fragment, local);
    			transition_in(tile2.$$.fragment, local);
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			transition_out(textarea0.$$.fragment, local);
    			transition_out(textarea1.$$.fragment, local);
    			transition_out(textarea2.$$.fragment, local);
    			transition_out(tile0.$$.fragment, local);
    			transition_out(tile1.$$.fragment, local);
    			transition_out(tile2.$$.fragment, local);
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(grid, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(textarea0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(textarea1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(textarea2, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t4);
    			destroy_component(tile0, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t6);
    			destroy_component(tile1, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t8);
    			destroy_component(tile2, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t10);
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(65:0) <Content>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const content_changes = {};

    			if (dirty & /*$$scope, disablebutton, widget, theme, keywords, pluginname, pluginemoji*/ 262207) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main_edit', slots, []);
    	let { pluginname } = $$props;
    	let { pluginemoji } = $$props;
    	let { widget } = $$props;
    	let { theme } = $$props;
    	const dispatch = createEventDispatcher();

    	if (theme == "g90") {
    		document.documentElement.style.setProperty('--date-picker-background', "#4A4A4B");
    		document.documentElement.style.setProperty('--date-picker-foreground', "#f7f7f7");
    		document.documentElement.style.setProperty('--date-input-width', "100px");
    	}

    	if (theme == "g10") {
    		document.documentElement.style.setProperty('--date-picker-background', "#E2E3E2");
    		document.documentElement.style.setProperty('--date-picker-foreground', "#272727");
    		document.documentElement.style.setProperty('--date-input-width', "100px");
    	}

    	var disablebutton = true;
    	var keywords = loadKeywords();

    	function loadKeywords() {
    		let keywordstring = "";

    		for (var keyword of widget.config.wckeywords) {
    			keywordstring = keywordstring + keyword + ",";
    		}

    		keywordstring = keywordstring.slice(0, -1);
    		return keywordstring;
    	}

    	function onEmojiChange(event) {
    		$$invalidate(0, widget.emoji = event.detail.emoji, widget);
    	}

    	function updateWidget() {
    		$$invalidate(0, widget.config.wckeywords = keywords.split(','), widget);
    		dispatch("updatewidget");
    	}

    	const writable_props = ['pluginname', 'pluginemoji', 'widget', 'theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main_edit> was created with unknown prop '${key}'`);
    	});

    	function textarea0_value_binding(value) {
    		if ($$self.$$.not_equal(widget.name, value)) {
    			widget.name = value;
    			$$invalidate(0, widget);
    		}
    	}

    	function textarea1_value_binding(value) {
    		if ($$self.$$.not_equal(widget.description, value)) {
    			widget.description = value;
    			$$invalidate(0, widget);
    		}
    	}

    	function textarea2_value_binding(value) {
    		keywords = value;
    		$$invalidate(5, keywords);
    	}

    	function colorpicker_theme_binding(value) {
    		theme = value;
    		$$invalidate(1, theme);
    	}

    	function colorpicker_value_binding(value) {
    		if ($$self.$$.not_equal(widget.color, value)) {
    			widget.color = value;
    			$$invalidate(0, widget);
    		}
    	}

    	function select_selected_binding(value) {
    		if ($$self.$$.not_equal(widget.days, value)) {
    			widget.days = value;
    			$$invalidate(0, widget);
    		}
    	}

    	const click_handler = () => {
    		dispatch("exitedit");
    	};

    	const click_handler_1 = () => {
    		updateWidget();
    	};

    	$$self.$$set = $$props => {
    		if ('pluginname' in $$props) $$invalidate(2, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(3, pluginemoji = $$props.pluginemoji);
    		if ('widget' in $$props) $$invalidate(0, widget = $$props.widget);
    		if ('theme' in $$props) $$invalidate(1, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ColorPicker,
    		Button,
    		Content,
    		Grid,
    		Row,
    		Column,
    		TextArea,
    		Tile,
    		Select,
    		SelectItem,
    		EmojiPicker,
    		pluginname,
    		pluginemoji,
    		widget,
    		theme,
    		dispatch,
    		disablebutton,
    		keywords,
    		loadKeywords,
    		onEmojiChange,
    		updateWidget
    	});

    	$$self.$inject_state = $$props => {
    		if ('pluginname' in $$props) $$invalidate(2, pluginname = $$props.pluginname);
    		if ('pluginemoji' in $$props) $$invalidate(3, pluginemoji = $$props.pluginemoji);
    		if ('widget' in $$props) $$invalidate(0, widget = $$props.widget);
    		if ('theme' in $$props) $$invalidate(1, theme = $$props.theme);
    		if ('disablebutton' in $$props) $$invalidate(4, disablebutton = $$props.disablebutton);
    		if ('keywords' in $$props) $$invalidate(5, keywords = $$props.keywords);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*widget*/ 1) {
    			if (!widget.name || !widget.description) {
    				$$invalidate(4, disablebutton = true);
    			} else {
    				$$invalidate(4, disablebutton = false);
    			}
    		}
    	};

    	return [
    		widget,
    		theme,
    		pluginname,
    		pluginemoji,
    		disablebutton,
    		keywords,
    		dispatch,
    		onEmojiChange,
    		updateWidget,
    		textarea0_value_binding,
    		textarea1_value_binding,
    		textarea2_value_binding,
    		colorpicker_theme_binding,
    		colorpicker_value_binding,
    		select_selected_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class Main_edit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			pluginname: 2,
    			pluginemoji: 3,
    			widget: 0,
    			theme: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main_edit",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pluginname*/ ctx[2] === undefined && !('pluginname' in props)) {
    			console.warn("<Main_edit> was created without expected prop 'pluginname'");
    		}

    		if (/*pluginemoji*/ ctx[3] === undefined && !('pluginemoji' in props)) {
    			console.warn("<Main_edit> was created without expected prop 'pluginemoji'");
    		}

    		if (/*widget*/ ctx[0] === undefined && !('widget' in props)) {
    			console.warn("<Main_edit> was created without expected prop 'widget'");
    		}

    		if (/*theme*/ ctx[1] === undefined && !('theme' in props)) {
    			console.warn("<Main_edit> was created without expected prop 'theme'");
    		}
    	}

    	get pluginname() {
    		throw new Error("<Main_edit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginname(value) {
    		throw new Error("<Main_edit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pluginemoji() {
    		throw new Error("<Main_edit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginemoji(value) {
    		throw new Error("<Main_edit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widget() {
    		throw new Error("<Main_edit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widget(value) {
    		throw new Error("<Main_edit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<Main_edit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Main_edit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/SettingsAdjust.svelte generated by Svelte v3.49.0 */

    const file$5 = "node_modules/carbon-icons-svelte/lib/SettingsAdjust.svelte";

    // (23:2) {#if title}
    function create_if_block$5(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$5, 22, 13, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(23:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let svg;
    	let path;
    	let if_block = /*title*/ ctx[1] && create_if_block$5(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M30 8h-4.1c-.5-2.3-2.5-4-4.9-4s-4.4 1.7-4.9 4H2v2h14.1c.5 2.3 2.5 4 4.9 4s4.4-1.7 4.9-4H30V8zM21 12c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3S22.7 12 21 12zM2 24h4.1c.5 2.3 2.5 4 4.9 4s4.4-1.7 4.9-4H30v-2H15.9c-.5-2.3-2.5-4-4.9-4s-4.4 1.7-4.9 4H2V24zM11 20c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3S9.3 20 11 20z");
    			add_location(path, file$5, 23, 2, 573);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$5, 13, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(svg, path);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SettingsAdjust', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class SettingsAdjust extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SettingsAdjust",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get size() {
    		throw new Error("<SettingsAdjust>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<SettingsAdjust>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SettingsAdjust>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SettingsAdjust>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Sun.svelte generated by Svelte v3.49.0 */

    const file$4 = "node_modules/carbon-icons-svelte/lib/Sun.svelte";

    // (23:2) {#if title}
    function create_if_block$4(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$4, 22, 13, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(23:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let if_block = /*title*/ ctx[1] && create_if_block$4(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			attr_dev(path0, "d", "M16,12a4,4,0,1,1-4,4,4.0045,4.0045,0,0,1,4-4m0-2a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z");
    			attr_dev(path0, "transform", "translate(0 .005)");
    			add_location(path0, file$4, 23, 2, 573);
    			attr_dev(path1, "d", "M6.854 5.375H8.854V10.333H6.854z");
    			attr_dev(path1, "transform", "rotate(-45 7.86 7.856)");
    			add_location(path1, file$4, 23, 127, 698);
    			attr_dev(path2, "d", "M2 15.005H7V17.005000000000003H2z");
    			add_location(path2, file$4, 23, 212, 783);
    			attr_dev(path3, "d", "M5.375 23.147H10.333V25.147H5.375z");
    			attr_dev(path3, "transform", "rotate(-45 7.86 24.149)");
    			add_location(path3, file$4, 23, 263, 834);
    			attr_dev(path4, "d", "M15 25.005H17V30.005H15z");
    			add_location(path4, file$4, 23, 351, 922);
    			attr_dev(path5, "d", "M23.147 21.668H25.147V26.625999999999998H23.147z");
    			attr_dev(path5, "transform", "rotate(-45 24.152 24.149)");
    			add_location(path5, file$4, 23, 393, 964);
    			attr_dev(path6, "d", "M25 15.005H30V17.005000000000003H25z");
    			add_location(path6, file$4, 23, 497, 1068);
    			attr_dev(path7, "d", "M21.668 6.854H26.625999999999998V8.854H21.668z");
    			attr_dev(path7, "transform", "rotate(-45 24.152 7.856)");
    			add_location(path7, file$4, 23, 551, 1122);
    			attr_dev(path8, "d", "M15 2.005H17V7.005H15z");
    			add_location(path8, file$4, 23, 652, 1223);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$4, 13, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(svg, path0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sun', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class Sun extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sun",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get size() {
    		throw new Error("<Sun>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Sun>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Sun>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Sun>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/Information.svelte generated by Svelte v3.49.0 */

    const file$3 = "node_modules/carbon-icons-svelte/lib/Information.svelte";

    // (23:2) {#if title}
    function create_if_block$3(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[1]);
    			add_location(title_1, file$3, 22, 13, 543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(23:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let if_block = /*title*/ ctx[1] && create_if_block$3(ctx);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 32 32" },
    		{ fill: "currentColor" },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ width: /*size*/ ctx[0] },
    		{ height: /*size*/ ctx[0] },
    		/*attributes*/ ctx[2],
    		/*$$restProps*/ ctx[3]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M17 22L17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22zM16 8a1.5 1.5 0 101.5 1.5A1.5 1.5 0 0016 8z");
    			add_location(path0, file$3, 23, 2, 573);
    			attr_dev(path1, "d", "M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z");
    			add_location(path1, file$3, 23, 130, 701);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$3, 13, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(svg, path0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 32 32" },
    				{ fill: "currentColor" },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				dirty & /*size*/ 1 && { width: /*size*/ ctx[0] },
    				dirty & /*size*/ 1 && { height: /*size*/ ctx[0] },
    				dirty & /*attributes*/ 4 && /*attributes*/ ctx[2],
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let labelled;
    	let attributes;
    	const omit_props_names = ["size","title"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Information', slots, []);
    	let { size = 16 } = $$props;
    	let { title = undefined } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('size' in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$new_props) $$invalidate(1, title = $$new_props.title);
    	};

    	$$self.$capture_state = () => ({ size, title, labelled, attributes });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('size' in $$props) $$invalidate(0, size = $$new_props.size);
    		if ('title' in $$props) $$invalidate(1, title = $$new_props.title);
    		if ('labelled' in $$props) $$invalidate(4, labelled = $$new_props.labelled);
    		if ('attributes' in $$props) $$invalidate(2, attributes = $$new_props.attributes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, labelled = $$props["aria-label"] || $$props["aria-labelledby"] || title);

    		$$invalidate(2, attributes = {
    			"aria-hidden": labelled ? undefined : true,
    			role: labelled ? "img" : undefined,
    			focusable: Number($$props["tabindex"]) === 0 ? true : undefined
    		});
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, title, attributes, $$restProps, labelled];
    }

    class Information extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { size: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Information",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get size() {
    		throw new Error("<Information>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Information>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Information>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Information>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const wordcloudtemplates = [
        { wordcloudname: "persons",
            displayName: "Persons",
            notes: "These are all terms related to persons",
            terms: ["no_people_found"] },
        { wordcloudname: "custom",
            displayName: "Custom Cloud",
            notes: "These are custom keywords",
            terms: ["no_keywords_found"] },
        { wordcloudname: "emotions",
            displayName: "Emotions",
            notes: "These are all terms related to emotions",
            terms: ["abandoned", "acceptance", "adoration", "affection", "Aggravated", "agitated", "agressive", "alert", "amazed", "ambitious", "amused", "anger", "angry", "animosity", "annoyed", "anticipation", "anxiousness", "appreciative", "apprehensive", "ardent", "aroused", "ashamed", "astonished", "attraction", "attraction", "attraction", "awed", "betrayed", "bewildered", "bitter", "bliss", "blue", "boastful", "bored", "breathless", "bubbly", "calamitous", "calm", "camaraderie", "cautious", "cheerful", "cocky", "cold", "collected", "comfortable", "compassionate", "concerned", "confident", "confused", "contempt", "content", "courageous", "cowardly", "crafty", "cranky", "crazy", "cruelty", "crummy", "crushed", "curious", "cynic", "dark", "dejected", "delighted", "delirious", "denial", "depression", "desire", "despair", "determined", "devastated", "disappointed", "discouraged", "disgust", "disheartened", "dismal", "dispirited", "distracted", "distressed", "dopey", "down", "dreadful", "dreary", "eager", "ecstatic", "embarrassed", "emotional detest", "empathic", "emptiness", "enchanted", "enigmatic", "enlightened", "enraged", "enthralled", "enthusiastic", "envy", "euphoric", "excited", "exhausted", "expectation", "exuberance", "fascinated", "fear", "flabbergasted", "fight-or-flight", "foolish", "frazzled", "frustrated", "fulfillment", "furious", "gay", "giddy", "gleeful", "gloomy", "goofy", "grateful", "gratified", "greedy", "Gray", "grief poem", "grouchy", "grudging", "guilty", "happy", "hate", "heartbroken", "homesick", "hopeful", "hopeless", "horrified", "hostile", "humiliated", "humored", "hurt", "hyper ", "hysterical", "indignation", "infatuation", "infuriated", "inner peace", "innocent", "insanity", "insecure", "insecure", "inspired poem", "interest", "intimidated", "invidious", "irate", "irritability", "irritated", "jaded", "jealousy", "joy", "jubilant", "kind", "lazy", "left out", "liberated", "lively", "loathsome", "lonely", "longing", "love", "lovesick", "loyal", "lust", "mad", "mean", "melancholic", "mellow", "mercy", "merry", "mildness", "miserable", "morbid", "mourning", "needed", "needy", "nervous", "obscene", "obsessed", "offended", "optimistic", "outraged", "overwhelmed", "pacified", "pain", "panicky", "paranoia", "passion", "pathetic", "peaceful", "perturbation", "pessimistic", "petrified", "pity", "playful", "pleased", "pleasure", "possessive", "pride", "provoked", "proud", "puzzled", "rage", "regretful", "relief", "remorse", "resentment", "resignation", "resolved", "sadness", "satisfied", "scared", "scorn", "selfish", "sensual", "sensitive", "sexy", "shame", "sheepish", "shocked", "shy", "sincerity", "solemn", "somber", "sorrow", "sorry", "spirited", "stressed", "stress", "strong", "submissive", "superior", "surprised", "sweet", "sympathetic", "temperamental", "tense", "terrified", "threatened", "thrilled", "tired", "tranquil", "troubled", "trust", "tormented", "uncertainty", "uneasiness", "unhappy", "upset", "vengeful", "vicious", "warm", "weary", "worn-out", "worried", "worthless", "wrathful", "yearning", "zesty"],
        },
        { wordcloudname: "emoties",
            displayName: "Emoties",
            notes: "Dit zijn allemaal termen gerelaterd aan emoties",
            terms: ["verlaten", "aanvaarding", "aanbidding", "genegenheid", "verergerd", "geagiteerd", "agressief", "alarm", "verbaasd", "ambitieus", "geamuseerd", "woede", "boos", "vijandigheid", "geërgerd", "anticipatie", "angst", "bezorgd", "bezorgd", "vurig", "opgewekt", "beschaamd", "verbaasd", "aantrekkelijkheid", "aantrekkelijkheid", "attractie", "verbluft", "verraden", "verbijsterd", "bitter", "gelukzaligheid", "blauw", "opschepperig", "verveeld", "ademloos", "bubbels", "calamitisch", "kalm", "kameraadschap", "voorzichtig", "vrolijk", "verwaand", "koud", "verzadigd", "comfortabel", "medelevend", "bezorgd", "zelfverzekerd", "verward", "minachting", "inhoud", "moedig", "laf", "sluw", "chagrijnig", "gek", "wreedheid", "slordig", "verpletterd", "nieuwsgierig", "cynisch", "donker", "neerslachtig", "opgetogen", "opgetogen", "ontkenning", "depressie", "verlangen", "wanhoop", "vastbesloten", "verwoest", "teleurgesteld", "ontmoedigd", "walging", "ontmoedigd", "somber", "ontmoedigd", "afgeleid", "verontrust", "verdrietig", "down", "verschrikkelijk", "somber", "gretig", "extatisch", "beschaamd", "emotionele afkeer", "empathisch", "leegte", "betoverd", "nl igmatic", "verlicht", "woedend", "enthousiast", "jaloezie", "euforisch", "opgewonden", "uitgeput", "verwacht", "uitbundigheid", "gefascineerd", "angst", "verbijsterd", "vechten-of-vluchten", "dwaas", "gefrustreerd", "gefrustreerd", "vervulling", "woedend", "homo", "duizelig", "blij", "somber", "goofy", "dankbaar", "bevredigd", "hebzuchtig", "grijs", "verdrietig gedicht", "chagrijnig", "met tegenzin", "schuldig", "gelukkig", "haat", "hartverscheurend", "heimwee ", "hoopvol", "hopeloos", "geschrokken", "vijandig", "vernederd", "gehumeurd", "gekwetst", "hyper ", "hysterisch", "verontwaardiging", "verliefd", "woedend", "innerlijke vrede", "onschuldig", "krankzinnigheid", "onzeker", "onzeker", "geïnspireerd gedicht", "interesse", "geïntimideerd", "verontwaardigd", "irriterend", "geïrriteerd", "jaded", "jaloezie", "vreugde", "juichend", "vriendelijk", "lui", "weggelaten", "bevrijd", "levendig", "walgelijk", "eenzaam", "verlangen", "liefde", "liefdesziek", "trouw", "lust", "gek", "gemeen", "melancholisch", "mellow", "genadigheid", "mildheid", "ellendig", "morbide", "rouwen", "nodig", "behoeftig", "nerveus", "obsceen", "geobsedeerd", "beledigd", "optimistisch", "o overweldigd", "overweldigd", "pijn", "paniek", "paranoia", "passie", "zielig", "vreedzaam", "verstoring", "", "pessimistisch", "versteend", "jammer", "speels", "verheugd", "genoegen", "bezittig", "trots", "geprovoceerd", "trots", "verbaasd", "woede", "betreurenswaardig", "opluchting", "wroeging ", "wrok", "aftreden", "opgelost", "verdriet", "tevreden", "bang", "minacht", "egoïstisch", "sensueel", "gevoelig", "sexy", "schaamt", "schaapachtig", "geschokt", "verlegen", "oprechtheid", "plechtig", "somber", "verdriet", "sorry", "gestresst", "stress", "sterk", "onderdanig", "superieur", "verrast", "lief", "sympathiek", "temperamenteel", "gespannen", "bedreigd", "bedreigd", "opgewonden", "moe", "rustig", "onrust", "vertrouwen", "gepijnigd", "onzekerheid", "onrust", "ongelukkig", "wraakzuchtig", "wreed", "warm", "moe", "versleten", "bezorgd", "waardeloos", "toornig", "verlangen", "vurig"],
        },
        { wordcloudname: "virtues",
            displayName: "Virtues",
            notes: "These are all terms related to virtues",
            terms: ["Acceptance", "Assertiveness", "Authenticity", "Beauty", "Caring", "Cleanliness", "Commitment", "Compassion", "Confidence", "Consideration", "Contentment", "Cooperation", "Courage", "Creativity", "Detachment", "Determination", "Dignity", "Encouragement", "Enthusiasm", "Ethical", "Excellence", "Fairness", "Faith", "Flexibility", "Forgiveness", "Friendliness", "Generosity", "Gentleness", "Graciousness", "Gratitude", "Harmonious", "Helpfulness", "Honesty", "Honor", "Hope", "Humility", "Idealism", "Integrity", "Imaginative", "Joyfulness", "Justice", "Kindness", "Love", "Loyalty", "Moderation", "Modesty", "Optimistic", "Orderliness", "Passionate", "Patience", "Peace", "Perseverance", "Preparedness", "Purposefulness", "Reliability", "Respect", "Responsibility", "Reverence", "Self-discipline", "Service", "Sincerity", "Tact", "Temperate", "Tenacious", "Thankfulness", "Tolerance", "Trust", "Truthfulness", "Understanding", "Unity", "Visionary", "Wisdom", "Wonder"],
        },
        { wordcloudname: "deugden",
            displayName: "Deugden",
            notes: "Dit zijn allemaal termen gerelaterd aan deugden",
            terms: ["Acceptatie", "Assertiviteit", "Authenticiteit", "Schoonheid", "Zorgzaam", "Reinheid", "Commitment", "Compassie", "Vertrouwen", "Overweging", "Tevredenheid", "Samenwerking", "Moed", "Creativiteit", "Onthechting", "Vastberadenheid", "Waardigheid", "Bemoediging", "Enthousiasme", "Ethiek", "Excellentie", "Eerlijkheid", "Geloof", "Flexibiliteit", "Vergeving", "Vriendelijkheid", "Vrijgevigheid", "Zachtheid", "Genade", "Dankbaarheid", "Harmonie", "Behulpzaamheid", "Eerlijkheid", "Eer", "Hoop", "Nederigheid", "Idealisme", "Integriteit", "Fantasierijk", "Vreugde", "Gerechtigheid", "Vriendelijkheid", "Liefde", "Loyaliteit", "Gematigdheid", "Bescheidenheid", "Optimistisch", "Orderlijkheid", "Gepassioneerd", "Geduld", "vrede", "doorzettingsvermogen", "paraatheid", "doelgerichtheid", "betrouwbaarheid", "respect", "verantwoordelijkheid", "eerbied", "zelfdiscipline", "dienstverlening", "oprechtheid", "tact", "Gematigd", "Vasthoudend", "Dankbaarheid", "Tolerantie", "Vertrouwen", "Waarheid", "Begrip", "Eenheid", "Visionair", "Wijsheid", "Wonder"],
        }
    ];

    /* src/components/wordcloud.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/components/wordcloud.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (143:0) {#if widthrefreshed}
    function create_if_block$2(ctx) {
    	let div;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*wcwords*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[10];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "cloud svelte-1dujz54");
    			attr_dev(ul, "role", "navigation");
    			attr_dev(ul, "aria-label", "Webdev word cloud");
    			add_location(ul, file$2, 144, 4, 3198);
    			add_location(div, file$2, 143, 2, 3188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*wordclicked, wcwords*/ 5) {
    				each_value = /*wcwords*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(143:0) {#if widthrefreshed}",
    		ctx
    	});

    	return block;
    }

    // (146:6) {#each wcwords as wcword, index (index)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let a;
    	let t_value = /*wcword*/ ctx[8].text + "";
    	let t;
    	let a_data_weight_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*wcword*/ ctx[8]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "data-weight", a_data_weight_value = /*wcword*/ ctx[8].size);
    			attr_dev(a, "class", "svelte-1dujz54");
    			add_location(a, file$2, 148, 9, 3403);
    			set_style(li, "cursor", "pointer");
    			attr_dev(li, "class", "svelte-1dujz54");
    			add_location(li, file$2, 146, 6, 3319);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*wcwords*/ 1 && t_value !== (t_value = /*wcword*/ ctx[8].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*wcwords*/ 1 && a_data_weight_value !== (a_data_weight_value = /*wcword*/ ctx[8].size)) {
    				attr_dev(a, "data-weight", a_data_weight_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(146:6) {#each wcwords as wcword, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*widthrefreshed*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*widthrefreshed*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wordcloud', slots, []);

    	let { words = [
    		{ text: "Nomie", count: 100 },
    		{ text: "Test", count: 50 },
    		{ text: "RdL", count: 75 }
    	] } = $$props;

    	let { wctheme = "none" } = $$props;
    	let { plugin } = $$props;
    	let wcwords = [{ text: "Loading", size: 9 }];
    	let widthrefreshed = true;

    	function calculateSize() {
    		var wcwordstemp = [];
    		var fontMin = 1;
    		var fontMax = 9;
    		var max = 1; // Should be computed
    		var min = 0; // Should be computed

    		for (var i in words) {
    			if (i == 0) {
    				max = words[i].count;
    				min = words[i].count;
    			}

    			if (words[i].count > max) {
    				max = words[i].count;
    			}

    			if (words[i].count < min) {
    				min = words[i].count;
    			}
    		}

    		for (var i in words) {
    			var word = words[i];

    			var size = word.count == min
    			? fontMin
    			: word.count / max * (fontMax - fontMin) + fontMin;

    			wcwordstemp.push({ text: word.text, size });
    		}

    		$$invalidate(0, wcwords = wcwordstemp);
    	}

    	function wordclicked(word) {
    		//Interact.alert("Coming Soon","You will soon be able to directly go to the Connection");
    		let item = word.text.toLowerCase();

    		if (wctheme == "persons") {
    			let note2nomie = "@" + item;
    			plugin.openNoteEditor(note2nomie);
    		}
    	}

    	onMount(() => {
    		calculateSize();
    	});

    	const writable_props = ['words', 'wctheme', 'plugin'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wordcloud> was created with unknown prop '${key}'`);
    	});

    	const click_handler = wcword => {
    		wordclicked(wcword);
    	};

    	$$self.$$set = $$props => {
    		if ('words' in $$props) $$invalidate(3, words = $$props.words);
    		if ('wctheme' in $$props) $$invalidate(4, wctheme = $$props.wctheme);
    		if ('plugin' in $$props) $$invalidate(5, plugin = $$props.plugin);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		words,
    		wctheme,
    		plugin,
    		wcwords,
    		widthrefreshed,
    		calculateSize,
    		wordclicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('words' in $$props) $$invalidate(3, words = $$props.words);
    		if ('wctheme' in $$props) $$invalidate(4, wctheme = $$props.wctheme);
    		if ('plugin' in $$props) $$invalidate(5, plugin = $$props.plugin);
    		if ('wcwords' in $$props) $$invalidate(0, wcwords = $$props.wcwords);
    		if ('widthrefreshed' in $$props) $$invalidate(1, widthrefreshed = $$props.widthrefreshed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*words*/ 8) {
    			if (words) {
    				calculateSize();
    				$$invalidate(1, widthrefreshed = false);

    				setTimeout(
    					() => {
    						$$invalidate(1, widthrefreshed = true);
    					},
    					5
    				);
    			}
    		}
    	};

    	return [wcwords, widthrefreshed, wordclicked, words, wctheme, plugin, click_handler];
    }

    class Wordcloud extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { words: 3, wctheme: 4, plugin: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wordcloud",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*plugin*/ ctx[5] === undefined && !('plugin' in props)) {
    			console.warn("<Wordcloud> was created without expected prop 'plugin'");
    		}
    	}

    	get words() {
    		throw new Error("<Wordcloud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set words(value) {
    		throw new Error("<Wordcloud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wctheme() {
    		throw new Error("<Wordcloud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wctheme(value) {
    		throw new Error("<Wordcloud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get plugin() {
    		throw new Error("<Wordcloud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plugin(value) {
    		throw new Error("<Wordcloud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widget.svelte generated by Svelte v3.49.0 */
    const file$1 = "src/components/widget.svelte";

    // (152:0) {#if showwidget}
    function create_if_block$1(ctx) {
    	let div3;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let div1;
    	let div0;
    	let wordcloud;
    	let updating_words;
    	let updating_wctheme;
    	let current;

    	function wordcloud_words_binding(value) {
    		/*wordcloud_words_binding*/ ctx[9](value);
    	}

    	function wordcloud_wctheme_binding(value) {
    		/*wordcloud_wctheme_binding*/ ctx[10](value);
    	}

    	let wordcloud_props = { plugin: /*plugin*/ ctx[0] };

    	if (/*wcwords*/ ctx[2] !== void 0) {
    		wordcloud_props.words = /*wcwords*/ ctx[2];
    	}

    	if (/*wctheme*/ ctx[3] !== void 0) {
    		wordcloud_props.wctheme = /*wctheme*/ ctx[3];
    	}

    	wordcloud = new Wordcloud({ props: wordcloud_props, $$inline: true });
    	binding_callbacks.push(() => bind(wordcloud, 'words', wordcloud_words_binding));
    	binding_callbacks.push(() => bind(wordcloud, 'wctheme', wordcloud_wctheme_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p = element("p");
    			t0 = text(/*wcemoji*/ ctx[5]);
    			t1 = space();
    			t2 = text(/*wclabel*/ ctx[4]);
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(wordcloud.$$.fragment);
    			set_style(p, "margin-left", "3%");
    			set_style(p, "font-weight", "700");
    			add_location(p, file$1, 153, 2, 3753);
    			attr_dev(div0, "class", "content svelte-18q08e4");
    			set_style(div0, "background", /*bgcolor*/ ctx[6]);
    			add_location(div0, file$1, 156, 3, 3940);
    			attr_dev(div1, "class", "inner-wrapper svelte-18q08e4");
    			set_style(div1, "background", /*bgcolor*/ ctx[6]);
    			add_location(div1, file$1, 155, 3, 3880);
    			attr_dev(div2, "class", "outer-wrapper svelte-18q08e4");
    			set_style(div2, "background", /*bgcolor*/ ctx[6]);
    			add_location(div2, file$1, 154, 1, 3820);
    			attr_dev(div3, "class", "extra-outer-wrapper svelte-18q08e4");
    			set_style(div3, "background", /*bgcolor*/ ctx[6]);
    			add_location(div3, file$1, 152, 0, 3688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(wordcloud, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*wcemoji*/ 32) set_data_dev(t0, /*wcemoji*/ ctx[5]);
    			if (!current || dirty & /*wclabel*/ 16) set_data_dev(t2, /*wclabel*/ ctx[4]);
    			const wordcloud_changes = {};
    			if (dirty & /*plugin*/ 1) wordcloud_changes.plugin = /*plugin*/ ctx[0];

    			if (!updating_words && dirty & /*wcwords*/ 4) {
    				updating_words = true;
    				wordcloud_changes.words = /*wcwords*/ ctx[2];
    				add_flush_callback(() => updating_words = false);
    			}

    			if (!updating_wctheme && dirty & /*wctheme*/ 8) {
    				updating_wctheme = true;
    				wordcloud_changes.wctheme = /*wctheme*/ ctx[3];
    				add_flush_callback(() => updating_wctheme = false);
    			}

    			wordcloud.$set(wordcloud_changes);

    			if (!current || dirty & /*bgcolor*/ 64) {
    				set_style(div0, "background", /*bgcolor*/ ctx[6]);
    			}

    			if (!current || dirty & /*bgcolor*/ 64) {
    				set_style(div1, "background", /*bgcolor*/ ctx[6]);
    			}

    			if (!current || dirty & /*bgcolor*/ 64) {
    				set_style(div2, "background", /*bgcolor*/ ctx[6]);
    			}

    			if (!current || dirty & /*bgcolor*/ 64) {
    				set_style(div3, "background", /*bgcolor*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wordcloud.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wordcloud.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(wordcloud);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(152:0) {#if showwidget}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showwidget*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showwidget*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showwidget*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Widget', slots, []);
    	let { Widgets } = $$props;
    	let { WidgetIndex } = $$props;
    	let { plugin } = $$props;
    	var showwidget = false;
    	let wctemplates = [];
    	let wcwords = [{ text: "Loading", count: 20 }];
    	let wctheme = "";
    	let wctimerange = 90;
    	let wckeywords = "no_keywords_found";
    	let wclabel = "";
    	let wcemoji = "";
    	let bgcolor = "white";

    	async function initwidget() {
    		await addPersons();

    		if (plugin.prefs.theme == "light" || plugin.prefs.theme == "auto") {
    			$$invalidate(6, bgcolor = "white");
    		} else {
    			$$invalidate(6, bgcolor = "black");
    		}

    		//insert code
    		let index = WidgetIndex;

    		let Widget = Widgets.find(p => p.widgetid == index);

    		if (Widget) {
    			$$invalidate(3, wctheme = Widget.config.wctheme);
    			wctimerange = Widget.config.wctimerange;
    			$$invalidate(4, wclabel = Widget.name);
    			$$invalidate(5, wcemoji = Widget.emoji);
    		} else {
    			Widget = {
    				"widgetid": "4567",
    				"name": "Placeholder",
    				"emoji": "🙈",
    				"color": "#C47ADA",
    				"config": {
    					"wctheme": "custom",
    					"wctimerange": "90",
    					"wckeywords": ["nomie6", "wordcloud"]
    				}
    			};
    		}

    		if (wctheme == "custom") {
    			wckeywords = Widget.config.wckeywords;
    			await addCustom();
    		}

    		$$invalidate(2, wcwords = await buildWCArray());

    		//end insertcode 
    		$$invalidate(1, showwidget = true);
    	}

    	async function addCustom() {
    		let tempterms = wckeywords;

    		if (tempterms.length == 0) {
    			tempterms = ["no_keywords_found"];
    		}

    		wctemplates[1] = {
    			wordcloudname: "custom",
    			displayName: "Custom Wordcloud",
    			notes: "These are all customized keywords",
    			terms: tempterms
    		};
    	}

    	async function addPersons() {
    		wctemplates = wordcloudtemplates;
    		let tempterms = [];

    		// Search all notes
    		const allNotes = await plugin.searchNotes('', new Date(), 90);

    		// Filter out only notes with elements that have a person
    		const peopleNotes = allNotes.filter(note => {
    			return note.elements.find(e => e.type == 'person');
    		});

    		// Loop over the people notes
    		peopleNotes.forEach(note => {
    			// Loop over the elements of the notes
    			// filter out on people
    			note.elements.filter(e => e.type == 'person').forEach(ele => {
    				if (!tempterms.includes(ele.id)) {
    					tempterms.push(ele.id);
    				}
    			});
    		});

    		if (tempterms.length == 0) {
    			tempterms = ["no_people_found"];
    		}

    		wctemplates[0] = {
    			wordcloudname: "persons",
    			displayName: "Persons",
    			notes: "These are all terms related to persons",
    			terms: tempterms
    		};
    	}

    	async function buildWCArray() {
    		let wcarray = [];
    		const thistheme = wctemplates.find(element => element.wordcloudname == wctheme);

    		for (const wcterm of thistheme.terms) {
    			var counts = await count(wcterm, wctimerange);

    			if (counts > 0) {
    				wcarray.push({ text: wcterm, count: counts });
    			}
    		}

    		return wcarray;
    	}

    	async function count(searchterm, timerange) {
    		let result = 0;
    		let searchstring = searchterm;
    		const notes = await plugin.searchNotes(searchstring, new Date(), parseInt(timerange));

    		if (notes) {
    			let total = notes.length;
    			result = total;
    		} else {
    			result = 0;
    		}

    		return result;
    	}

    	onMount(() => {
    		initwidget();
    	});

    	const writable_props = ['Widgets', 'WidgetIndex', 'plugin'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Widget> was created with unknown prop '${key}'`);
    	});

    	function wordcloud_words_binding(value) {
    		wcwords = value;
    		$$invalidate(2, wcwords);
    	}

    	function wordcloud_wctheme_binding(value) {
    		wctheme = value;
    		$$invalidate(3, wctheme);
    	}

    	$$self.$$set = $$props => {
    		if ('Widgets' in $$props) $$invalidate(7, Widgets = $$props.Widgets);
    		if ('WidgetIndex' in $$props) $$invalidate(8, WidgetIndex = $$props.WidgetIndex);
    		if ('plugin' in $$props) $$invalidate(0, plugin = $$props.plugin);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		wordcloudtemplates,
    		Wordcloud,
    		Widgets,
    		WidgetIndex,
    		plugin,
    		showwidget,
    		wctemplates,
    		wcwords,
    		wctheme,
    		wctimerange,
    		wckeywords,
    		wclabel,
    		wcemoji,
    		bgcolor,
    		initwidget,
    		addCustom,
    		addPersons,
    		buildWCArray,
    		count
    	});

    	$$self.$inject_state = $$props => {
    		if ('Widgets' in $$props) $$invalidate(7, Widgets = $$props.Widgets);
    		if ('WidgetIndex' in $$props) $$invalidate(8, WidgetIndex = $$props.WidgetIndex);
    		if ('plugin' in $$props) $$invalidate(0, plugin = $$props.plugin);
    		if ('showwidget' in $$props) $$invalidate(1, showwidget = $$props.showwidget);
    		if ('wctemplates' in $$props) wctemplates = $$props.wctemplates;
    		if ('wcwords' in $$props) $$invalidate(2, wcwords = $$props.wcwords);
    		if ('wctheme' in $$props) $$invalidate(3, wctheme = $$props.wctheme);
    		if ('wctimerange' in $$props) wctimerange = $$props.wctimerange;
    		if ('wckeywords' in $$props) wckeywords = $$props.wckeywords;
    		if ('wclabel' in $$props) $$invalidate(4, wclabel = $$props.wclabel);
    		if ('wcemoji' in $$props) $$invalidate(5, wcemoji = $$props.wcemoji);
    		if ('bgcolor' in $$props) $$invalidate(6, bgcolor = $$props.bgcolor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		plugin,
    		showwidget,
    		wcwords,
    		wctheme,
    		wclabel,
    		wcemoji,
    		bgcolor,
    		Widgets,
    		WidgetIndex,
    		wordcloud_words_binding,
    		wordcloud_wctheme_binding
    	];
    }

    class Widget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { Widgets: 7, WidgetIndex: 8, plugin: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Widget",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*Widgets*/ ctx[7] === undefined && !('Widgets' in props)) {
    			console.warn("<Widget> was created without expected prop 'Widgets'");
    		}

    		if (/*WidgetIndex*/ ctx[8] === undefined && !('WidgetIndex' in props)) {
    			console.warn("<Widget> was created without expected prop 'WidgetIndex'");
    		}

    		if (/*plugin*/ ctx[0] === undefined && !('plugin' in props)) {
    			console.warn("<Widget> was created without expected prop 'plugin'");
    		}
    	}

    	get Widgets() {
    		throw new Error("<Widget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Widgets(value) {
    		throw new Error("<Widget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get WidgetIndex() {
    		throw new Error("<Widget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set WidgetIndex(value) {
    		throw new Error("<Widget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get plugin() {
    		throw new Error("<Widget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plugin(value) {
    		throw new Error("<Widget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    // (238:19) 
    function create_if_block_9(ctx) {
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let h5;
    	let t5;
    	let hr;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = `${pluginemoji}`;
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = `${pluginname}`;
    			t3 = space();
    			h5 = element("h5");
    			h5.textContent = "This is a plugin for Nomie";
    			t5 = space();
    			hr = element("hr");
    			set_style(h1, "text-align", "center");
    			add_location(h1, file, 238, 8, 7255);
    			set_style(h2, "text-align", "center");
    			add_location(h2, file, 239, 8, 7312);
    			set_style(h5, "text-align", "center");
    			add_location(h5, file, 240, 8, 7368);
    			add_location(hr, file, 241, 8, 7438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(238:19) ",
    		ctx
    	});

    	return block;
    }

    // (209:0) {#if mode == "modal"  || mode =="widget"}
    function create_if_block_1(ctx) {
    	let theme_1;
    	let updating_theme;
    	let t;
    	let if_block_anchor;
    	let current;

    	function theme_1_theme_binding(value) {
    		/*theme_1_theme_binding*/ ctx[21](value);
    	}

    	let theme_1_props = {};

    	if (/*theme*/ ctx[5] !== void 0) {
    		theme_1_props.theme = /*theme*/ ctx[5];
    	}

    	theme_1 = new Theme({ props: theme_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(theme_1, 'theme', theme_1_theme_binding));
    	let if_block = /*inNomie*/ ctx[4] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			create_component(theme_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(theme_1, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const theme_1_changes = {};

    			if (!updating_theme && dirty[0] & /*theme*/ 32) {
    				updating_theme = true;
    				theme_1_changes.theme = /*theme*/ ctx[5];
    				add_flush_callback(() => updating_theme = false);
    			}

    			theme_1.$set(theme_1_changes);

    			if (/*inNomie*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*inNomie*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(theme_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(theme_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(theme_1, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(209:0) {#if mode == \\\"modal\\\"  || mode ==\\\"widget\\\"}",
    		ctx
    	});

    	return block;
    }

    // (211:0) {#if inNomie}
    function create_if_block_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_if_block_8];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*mode*/ ctx[6] == "modal") return 0;
    		if (/*mode*/ ctx[6] == "widget") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(211:0) {#if inNomie}",
    		ctx
    	});

    	return block;
    }

    // (233:27) 
    function create_if_block_8(ctx) {
    	let widget;
    	let updating_Widgets;
    	let updating_WidgetIndex;
    	let current;

    	function widget_Widgets_binding(value) {
    		/*widget_Widgets_binding*/ ctx[26](value);
    	}

    	function widget_WidgetIndex_binding(value) {
    		/*widget_WidgetIndex_binding*/ ctx[27](value);
    	}

    	let widget_props = { plugin: /*plugin*/ ctx[10] };

    	if (/*Widgets*/ ctx[1] !== void 0) {
    		widget_props.Widgets = /*Widgets*/ ctx[1];
    	}

    	if (/*WidgetIndex*/ ctx[0] !== void 0) {
    		widget_props.WidgetIndex = /*WidgetIndex*/ ctx[0];
    	}

    	widget = new Widget({ props: widget_props, $$inline: true });
    	binding_callbacks.push(() => bind(widget, 'Widgets', widget_Widgets_binding));
    	binding_callbacks.push(() => bind(widget, 'WidgetIndex', widget_WidgetIndex_binding));

    	const block = {
    		c: function create() {
    			create_component(widget.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(widget, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const widget_changes = {};

    			if (!updating_Widgets && dirty[0] & /*Widgets*/ 2) {
    				updating_Widgets = true;
    				widget_changes.Widgets = /*Widgets*/ ctx[1];
    				add_flush_callback(() => updating_Widgets = false);
    			}

    			if (!updating_WidgetIndex && dirty[0] & /*WidgetIndex*/ 1) {
    				updating_WidgetIndex = true;
    				widget_changes.WidgetIndex = /*WidgetIndex*/ ctx[0];
    				add_flush_callback(() => updating_WidgetIndex = false);
    			}

    			widget.$set(widget_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(widget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(widget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(widget, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(233:27) ",
    		ctx
    	});

    	return block;
    }

    // (212:0) {#if mode == "modal"}
    function create_if_block_3(ctx) {
    	let header;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	header = new Header({
    			props: {
    				company: /*parent*/ ctx[9],
    				platformName: pluginname,
    				$$slots: {
    					"skip-to-content": [create_skip_to_content_slot],
    					default: [create_default_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	header.$on("click", /*showMain*/ ctx[12]);
    	const if_block_creators = [create_if_block_4, create_if_block_5, create_if_block_6, create_if_block_7];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*view*/ ctx[8] == "main") return 0;
    		if (/*view*/ ctx[8] == "info") return 1;
    		if (/*view*/ ctx[8] == "settings") return 2;
    		if (/*view*/ ctx[8] == "mainedit") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(212:0) {#if mode == \\\"modal\\\"}",
    		ctx
    	});

    	return block;
    }

    // (217:2) <HeaderUtilities>
    function create_default_slot_1(ctx) {
    	let headerglobalaction0;
    	let t0;
    	let headerglobalaction1;
    	let t1;
    	let headerglobalaction2;
    	let current;

    	headerglobalaction0 = new HeaderGlobalAction({
    			props: {
    				"aria-label": "Settings",
    				icon: SettingsAdjust
    			},
    			$$inline: true
    		});

    	headerglobalaction0.$on("click", /*showSettings*/ ctx[14]);

    	headerglobalaction1 = new HeaderGlobalAction({
    			props: { "aria-label": "Theme", icon: Sun },
    			$$inline: true
    		});

    	headerglobalaction1.$on("click", /*toggleTheme*/ ctx[11]);

    	headerglobalaction2 = new HeaderGlobalAction({
    			props: { "aria-label": "Theme", icon: Information },
    			$$inline: true
    		});

    	headerglobalaction2.$on("click", /*showInformation*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(headerglobalaction0.$$.fragment);
    			t0 = space();
    			create_component(headerglobalaction1.$$.fragment);
    			t1 = space();
    			create_component(headerglobalaction2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(headerglobalaction0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(headerglobalaction1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(headerglobalaction2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerglobalaction0.$$.fragment, local);
    			transition_in(headerglobalaction1.$$.fragment, local);
    			transition_in(headerglobalaction2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerglobalaction0.$$.fragment, local);
    			transition_out(headerglobalaction1.$$.fragment, local);
    			transition_out(headerglobalaction2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(headerglobalaction0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(headerglobalaction1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(headerglobalaction2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(217:2) <HeaderUtilities>",
    		ctx
    	});

    	return block;
    }

    // (213:0) <Header company={parent} platformName={pluginname} on:click={showMain}>
    function create_default_slot(ctx) {
    	let headerutilities;
    	let current;

    	headerutilities = new HeaderUtilities({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(headerutilities.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(headerutilities, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerutilities_changes = {};

    			if (dirty[1] & /*$$scope*/ 256) {
    				headerutilities_changes.$$scope = { dirty, ctx };
    			}

    			headerutilities.$set(headerutilities_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerutilities.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerutilities.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(headerutilities, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(213:0) <Header company={parent} platformName={pluginname} on:click={showMain}>",
    		ctx
    	});

    	return block;
    }

    // (214:2) <svelte:fragment slot="skip-to-content">
    function create_skip_to_content_slot(ctx) {
    	let skiptocontent;
    	let current;
    	skiptocontent = new SkipToContent({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(skiptocontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skiptocontent, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skiptocontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skiptocontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skiptocontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_skip_to_content_slot.name,
    		type: "slot",
    		source: "(214:2) <svelte:fragment slot=\\\"skip-to-content\\\">",
    		ctx
    	});

    	return block;
    }

    // (230:29) 
    function create_if_block_7(ctx) {
    	let edit;
    	let updating_widget;
    	let updating_theme;
    	let current;

    	function edit_widget_binding(value) {
    		/*edit_widget_binding*/ ctx[24](value);
    	}

    	function edit_theme_binding(value) {
    		/*edit_theme_binding*/ ctx[25](value);
    	}

    	let edit_props = { pluginname, pluginemoji };

    	if (/*WidgetsEdit*/ ctx[2][/*widget2edit*/ ctx[3]] !== void 0) {
    		edit_props.widget = /*WidgetsEdit*/ ctx[2][/*widget2edit*/ ctx[3]];
    	}

    	if (/*theme*/ ctx[5] !== void 0) {
    		edit_props.theme = /*theme*/ ctx[5];
    	}

    	edit = new Main_edit({ props: edit_props, $$inline: true });
    	binding_callbacks.push(() => bind(edit, 'widget', edit_widget_binding));
    	binding_callbacks.push(() => bind(edit, 'theme', edit_theme_binding));
    	edit.$on("updatewidget", /*updatewidget*/ ctx[19]);
    	edit.$on("exitedit", /*backtolastsave*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(edit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(edit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const edit_changes = {};

    			if (!updating_widget && dirty[0] & /*WidgetsEdit, widget2edit*/ 12) {
    				updating_widget = true;
    				edit_changes.widget = /*WidgetsEdit*/ ctx[2][/*widget2edit*/ ctx[3]];
    				add_flush_callback(() => updating_widget = false);
    			}

    			if (!updating_theme && dirty[0] & /*theme*/ 32) {
    				updating_theme = true;
    				edit_changes.theme = /*theme*/ ctx[5];
    				add_flush_callback(() => updating_theme = false);
    			}

    			edit.$set(edit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(edit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(edit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(edit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(230:29) ",
    		ctx
    	});

    	return block;
    }

    // (228:29) 
    function create_if_block_6(ctx) {
    	let settings;
    	let current;

    	settings = new Settings({
    			props: { pluginname, pluginemoji },
    			$$inline: true
    		});

    	settings.$on("exitsettings", /*showMain*/ ctx[12]);
    	settings.$on("savesettings", /*saveSettings*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(228:29) ",
    		ctx
    	});

    	return block;
    }

    // (226:25) 
    function create_if_block_5(ctx) {
    	let info;
    	let current;

    	info = new Info({
    			props: {
    				parent: /*parent*/ ctx[9],
    				pluginname,
    				pluginemoji
    			},
    			$$inline: true
    		});

    	info.$on("exitinfo", /*showMain*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(info.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(info, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(info, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(226:25) ",
    		ctx
    	});

    	return block;
    }

    // (224:0) {#if view == "main"}
    function create_if_block_4(ctx) {
    	let main;
    	let updating_widgets;
    	let updating_theme;
    	let current;

    	function main_widgets_binding(value) {
    		/*main_widgets_binding*/ ctx[22](value);
    	}

    	function main_theme_binding(value) {
    		/*main_theme_binding*/ ctx[23](value);
    	}

    	let main_props = { pluginname, pluginemoji };

    	if (/*WidgetsEdit*/ ctx[2] !== void 0) {
    		main_props.widgets = /*WidgetsEdit*/ ctx[2];
    	}

    	if (/*theme*/ ctx[5] !== void 0) {
    		main_props.theme = /*theme*/ ctx[5];
    	}

    	main = new Main({ props: main_props, $$inline: true });
    	binding_callbacks.push(() => bind(main, 'widgets', main_widgets_binding));
    	binding_callbacks.push(() => bind(main, 'theme', main_theme_binding));
    	main.$on("addbytemplate", /*addByTemplate*/ ctx[16]);
    	main.$on("deletewidget", /*deletewidget*/ ctx[17]);
    	main.$on("editwidget", /*editMode*/ ctx[18]);

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const main_changes = {};

    			if (!updating_widgets && dirty[0] & /*WidgetsEdit*/ 4) {
    				updating_widgets = true;
    				main_changes.widgets = /*WidgetsEdit*/ ctx[2];
    				add_flush_callback(() => updating_widgets = false);
    			}

    			if (!updating_theme && dirty[0] & /*theme*/ 32) {
    				updating_theme = true;
    				main_changes.theme = /*theme*/ ctx[5];
    				add_flush_callback(() => updating_theme = false);
    			}

    			main.$set(main_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(224:0) {#if view == \\\"main\\\"}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if loading}
    function create_if_block(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Loading....";
    			add_location(p, file, 245, 0, 7485);
    			attr_dev(div, "class", "startup");
    			add_location(div, file, 244, 0, 7463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(244:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let toast;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_9];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mode*/ ctx[6] == "modal" || /*mode*/ ctx[6] == "widget") return 0;
    		if (!/*inNomie*/ ctx[4]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*loading*/ ctx[7] && create_if_block(ctx);
    	toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(toast.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(toast, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*loading*/ ctx[7]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(toast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const pluginname = "Nomie Wordcloud";
    const pluginemoji = "☁️";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let WidgetIndex = "1";
    	const urlParams = new URLSearchParams(window.location.search);

    	if (urlParams.has("widgetindex")) {
    		WidgetIndex = urlParams.get("widgetindex");
    	}

    	var parent = "Nomie";
    	var Widgets = [];
    	var WidgetsEdit = [];
    	let amountofcards = 0;
    	let widget2edit = 0;
    	let isEditMode = false;
    	let lastname = "";
    	let lastdescription = "";
    	let lastcolor = "";
    	let lastemoji = "";
    	let lastkeywords = [];
    	let lastrange = "";

    	const plugin = new NomiePlugin({
    			name: pluginname,
    			emoji: pluginemoji,
    			description: "Nomie WordCloud Widgets Plugin",
    			uses: ["searchNotes"],
    			version: "0.1",
    			addToCaptureMenu: true,
    			addToMoreMenu: true,
    			addToWidgets: true
    		});

    	let inNomie = false;
    	let theme = "g10";
    	let mode = "hidden";
    	let loading = true;
    	let view = "main";

    	// Load init params
    	function loadInitParams() {
    		plugin.onUIOpened(async () => {
    			$$invalidate(6, mode = 'modal');
    		});

    		plugin.onWidget(() => {
    			if (plugin.prefs.theme == "light" || plugin.prefs.theme == "auto") {
    				$$invalidate(5, theme = "white");
    			} else if (plugin.prefs.theme == "dark") {
    				$$invalidate(5, theme = "g100");
    			} else {
    				$$invalidate(5, theme = "g10");
    			}

    			$$invalidate(6, mode = "widget");
    		});

    		plugin.onRegistered(async () => {
    			await plugin.storage.init();

    			$$invalidate(1, Widgets = plugin.storage.getItem('widgets') || [
    				{
    					"widgetid": "1",
    					"name": "Emotions",
    					"emoji": "🥴",
    					"color": "#C47ADA",
    					"config": {
    						"wctheme": "emotions",
    						"wctimerange": "90"
    					}
    				},
    				{
    					"widgetid": "2",
    					"name": "Virtues",
    					"emoji": "✋",
    					"color": "#C47ADA",
    					"config": {
    						"wctheme": "virtues",
    						"wctimerange": "90"
    					}
    				},
    				{
    					"widgetid": "3",
    					"name": "Persons",
    					"emoji": "👨‍👩‍👧‍👦",
    					"color": "#C47ADA",
    					"config": {
    						"wctheme": "persons",
    						"wctimerange": "90"
    					}
    				}
    			]);

    			$$invalidate(2, WidgetsEdit = Widgets);

    			if (Widgets.length == 3) {
    				plugin.storage.setItem('widgets', Widgets);
    			}

    			if (plugin.prefs.theme == "light") {
    				$$invalidate(5, theme = "g10");
    			} else if (plugin.prefs.theme == "dark") {
    				$$invalidate(5, theme = "g90");
    			} else {
    				$$invalidate(5, theme = "g10");
    			}
    		});

    		setTimeout(
    			() => {
    				$$invalidate(4, inNomie = true);
    				$$invalidate(7, loading = false);
    			},
    			700
    		);
    	}

    	// change theme
    	function toggleTheme() {
    		if (theme == "white") {
    			$$invalidate(5, theme = "g10");
    		} else if (theme == "g10") {
    			$$invalidate(5, theme = "g80");
    		} else if (theme == "g80") {
    			$$invalidate(5, theme = "g90");
    		} else if (theme == "g90") {
    			$$invalidate(5, theme = "g100");
    		} else {
    			$$invalidate(5, theme = "white");
    		}
    	}

    	//view main page
    	function showMain() {
    		$$invalidate(8, view = "main");
    		window.scrollTo(0, 0);
    	}

    	//view info page
    	function showInformation() {
    		$$invalidate(8, view = "info");
    		window.scrollTo(0, 0);
    	}

    	//view settings page
    	function showSettings() {
    		$$invalidate(8, view = "settings");
    		window.scrollTo(0, 0);
    	}

    	function saveSettings() {
    		showMain();
    	}

    	const addByTemplate = event => {
    		const widget = {
    			widgetid: nid(),
    			name: event.detail.detail.template.name,
    			description: event.detail.detail.template.description,
    			color: event.detail.detail.template.color,
    			emoji: event.detail.detail.template.emoji,
    			config: {
    				"wctheme": "custom",
    				"wctimerange": event.detail.detail.template.days,
    				"wckeywords": event.detail.detail.template.keywords
    			}
    		};

    		$$invalidate(1, Widgets = Widgets.concat(widget));
    		saveWidgets(Widgets);
    	};

    	const saveWidgets = Widgets => {
    		plugin.storage.setItem('widgets', Widgets);
    		$$invalidate(2, WidgetsEdit = Widgets);
    		amountofcards = Widgets.length;
    	};

    	const deletewidget = async event => {
    		let res = await plugin.confirm('Delete Wordcloud Widget Config?', 'Are you sure you want to delete this Wordcloud Widget configuration?');

    		if (res.value) {
    			const id = event.detail;

    			//find widget by id
    			let index = Widgets.findIndex(widget => widget.widgetid === id);

    			//remove widget
    			Widgets.splice(index, 1);

    			$$invalidate(1, Widgets = [...Widgets]);
    			saveWidgets(Widgets);
    		} //nothing to do;
    	};

    	const editMode = event => {
    		const widgetId = event.detail;

    		//find widgetindex by id
    		const findwidgetindex = element => element.widgetid == widgetId;

    		$$invalidate(3, widget2edit = Widgets.findIndex(findwidgetindex));
    		lastname = Widgets[widget2edit].name;
    		lastdescription = Widgets[widget2edit].description;
    		lastcolor = Widgets[widget2edit].color;
    		lastemoji = Widgets[widget2edit].emoji;
    		lastkeywords = Widgets[widget2edit].config.wckeywords;
    		lastrange = Widgets[widget2edit].config.wctimerange;
    		isEditMode = true;
    		$$invalidate(8, view = "mainedit");
    	};

    	const updatewidget = () => {
    		$$invalidate(1, Widgets = WidgetsEdit);
    		saveWidgets(Widgets);
    		$$invalidate(8, view = "main");
    		isEditMode = false;
    	};

    	const backtolastsave = () => {
    		const lastsave = {
    			"widgetid": Widgets[widget2edit].widgetid,
    			"name": lastname,
    			"description": lastdescription,
    			"color": lastcolor,
    			"emoji": lastemoji,
    			"config": {
    				"wctheme": "custom",
    				"wctimerange": lastrange,
    				"wckeywords": lastkeywords
    			}
    		};

    		$$invalidate(2, WidgetsEdit[widget2edit] = lastsave, WidgetsEdit);
    		$$invalidate(8, view = "main");
    		isEditMode = false;
    	};

    	onMount(async () => {
    		loadInitParams();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function theme_1_theme_binding(value) {
    		theme = value;
    		$$invalidate(5, theme);
    	}

    	function main_widgets_binding(value) {
    		WidgetsEdit = value;
    		$$invalidate(2, WidgetsEdit);
    	}

    	function main_theme_binding(value) {
    		theme = value;
    		$$invalidate(5, theme);
    	}

    	function edit_widget_binding(value) {
    		if ($$self.$$.not_equal(WidgetsEdit[widget2edit], value)) {
    			WidgetsEdit[widget2edit] = value;
    			$$invalidate(2, WidgetsEdit);
    		}
    	}

    	function edit_theme_binding(value) {
    		theme = value;
    		$$invalidate(5, theme);
    	}

    	function widget_Widgets_binding(value) {
    		Widgets = value;
    		$$invalidate(1, Widgets);
    	}

    	function widget_WidgetIndex_binding(value) {
    		WidgetIndex = value;
    		$$invalidate(0, WidgetIndex);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Toast,
    		notifications,
    		Header,
    		HeaderUtilities,
    		HeaderGlobalAction,
    		SkipToContent,
    		Content,
    		Grid,
    		Row,
    		Column,
    		Theme,
    		Button,
    		nid,
    		Main,
    		Info,
    		Settings,
    		Edit: Main_edit,
    		SettingsAdjust,
    		Sun,
    		Information,
    		Widget,
    		WidgetIndex,
    		urlParams,
    		pluginname,
    		pluginemoji,
    		parent,
    		Widgets,
    		WidgetsEdit,
    		amountofcards,
    		widget2edit,
    		isEditMode,
    		lastname,
    		lastdescription,
    		lastcolor,
    		lastemoji,
    		lastkeywords,
    		lastrange,
    		plugin,
    		inNomie,
    		theme,
    		mode,
    		loading,
    		view,
    		loadInitParams,
    		toggleTheme,
    		showMain,
    		showInformation,
    		showSettings,
    		saveSettings,
    		addByTemplate,
    		saveWidgets,
    		deletewidget,
    		editMode,
    		updatewidget,
    		backtolastsave
    	});

    	$$self.$inject_state = $$props => {
    		if ('WidgetIndex' in $$props) $$invalidate(0, WidgetIndex = $$props.WidgetIndex);
    		if ('parent' in $$props) $$invalidate(9, parent = $$props.parent);
    		if ('Widgets' in $$props) $$invalidate(1, Widgets = $$props.Widgets);
    		if ('WidgetsEdit' in $$props) $$invalidate(2, WidgetsEdit = $$props.WidgetsEdit);
    		if ('amountofcards' in $$props) amountofcards = $$props.amountofcards;
    		if ('widget2edit' in $$props) $$invalidate(3, widget2edit = $$props.widget2edit);
    		if ('isEditMode' in $$props) isEditMode = $$props.isEditMode;
    		if ('lastname' in $$props) lastname = $$props.lastname;
    		if ('lastdescription' in $$props) lastdescription = $$props.lastdescription;
    		if ('lastcolor' in $$props) lastcolor = $$props.lastcolor;
    		if ('lastemoji' in $$props) lastemoji = $$props.lastemoji;
    		if ('lastkeywords' in $$props) lastkeywords = $$props.lastkeywords;
    		if ('lastrange' in $$props) lastrange = $$props.lastrange;
    		if ('inNomie' in $$props) $$invalidate(4, inNomie = $$props.inNomie);
    		if ('theme' in $$props) $$invalidate(5, theme = $$props.theme);
    		if ('mode' in $$props) $$invalidate(6, mode = $$props.mode);
    		if ('loading' in $$props) $$invalidate(7, loading = $$props.loading);
    		if ('view' in $$props) $$invalidate(8, view = $$props.view);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		WidgetIndex,
    		Widgets,
    		WidgetsEdit,
    		widget2edit,
    		inNomie,
    		theme,
    		mode,
    		loading,
    		view,
    		parent,
    		plugin,
    		toggleTheme,
    		showMain,
    		showInformation,
    		showSettings,
    		saveSettings,
    		addByTemplate,
    		deletewidget,
    		editMode,
    		updatewidget,
    		backtolastsave,
    		theme_1_theme_binding,
    		main_widgets_binding,
    		main_theme_binding,
    		edit_widget_binding,
    		edit_theme_binding,
    		widget_Widgets_binding,
    		widget_WidgetIndex_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
