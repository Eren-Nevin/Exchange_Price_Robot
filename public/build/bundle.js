
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    const outroing = new Set();
    let outros;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.2' }, detail), true));
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

    /* src/components/Card.svelte generated by Svelte v3.43.2 */

    const file$5 = "src/components/Card.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-1mj4ff7");
    			add_location(div, file$5, 0, 0, 0);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const subscriber_queue = [];
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    function commonjsRequire (target) {
    	throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    var core = createCommonjsModule(function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory();
    	}
    }(commonjsGlobal, function () {

    	/*globals window, global, require*/

    	/**
    	 * CryptoJS core components.
    	 */
    	var CryptoJS = CryptoJS || (function (Math, undefined$1) {

    	    var crypto;

    	    // Native crypto from window (Browser)
    	    if (typeof window !== 'undefined' && window.crypto) {
    	        crypto = window.crypto;
    	    }

    	    // Native crypto in web worker (Browser)
    	    if (typeof self !== 'undefined' && self.crypto) {
    	        crypto = self.crypto;
    	    }

    	    // Native crypto from worker
    	    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    	        crypto = globalThis.crypto;
    	    }

    	    // Native (experimental IE 11) crypto from window (Browser)
    	    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
    	        crypto = window.msCrypto;
    	    }

    	    // Native crypto from global (NodeJS)
    	    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
    	        crypto = commonjsGlobal.crypto;
    	    }

    	    // Native crypto import via require (NodeJS)
    	    if (!crypto && typeof commonjsRequire === 'function') {
    	        try {
    	            crypto = require$$0;
    	        } catch (err) {}
    	    }

    	    /*
    	     * Cryptographically secure pseudorandom number generator
    	     *
    	     * As Math.random() is cryptographically not safe to use
    	     */
    	    var cryptoSecureRandomInt = function () {
    	        if (crypto) {
    	            // Use getRandomValues method (Browser)
    	            if (typeof crypto.getRandomValues === 'function') {
    	                try {
    	                    return crypto.getRandomValues(new Uint32Array(1))[0];
    	                } catch (err) {}
    	            }

    	            // Use randomBytes method (NodeJS)
    	            if (typeof crypto.randomBytes === 'function') {
    	                try {
    	                    return crypto.randomBytes(4).readInt32LE();
    	                } catch (err) {}
    	            }
    	        }

    	        throw new Error('Native crypto module could not be used to get secure random number.');
    	    };

    	    /*
    	     * Local polyfill of Object.create

    	     */
    	    var create = Object.create || (function () {
    	        function F() {}

    	        return function (obj) {
    	            var subtype;

    	            F.prototype = obj;

    	            subtype = new F();

    	            F.prototype = null;

    	            return subtype;
    	        };
    	    }());

    	    /**
    	     * CryptoJS namespace.
    	     */
    	    var C = {};

    	    /**
    	     * Library namespace.
    	     */
    	    var C_lib = C.lib = {};

    	    /**
    	     * Base object for prototypal inheritance.
    	     */
    	    var Base = C_lib.Base = (function () {


    	        return {
    	            /**
    	             * Creates a new object that inherits from this object.
    	             *
    	             * @param {Object} overrides Properties to copy into the new object.
    	             *
    	             * @return {Object} The new object.
    	             *
    	             * @static
    	             *
    	             * @example
    	             *
    	             *     var MyType = CryptoJS.lib.Base.extend({
    	             *         field: 'value',
    	             *
    	             *         method: function () {
    	             *         }
    	             *     });
    	             */
    	            extend: function (overrides) {
    	                // Spawn
    	                var subtype = create(this);

    	                // Augment
    	                if (overrides) {
    	                    subtype.mixIn(overrides);
    	                }

    	                // Create default initializer
    	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
    	                    subtype.init = function () {
    	                        subtype.$super.init.apply(this, arguments);
    	                    };
    	                }

    	                // Initializer's prototype is the subtype object
    	                subtype.init.prototype = subtype;

    	                // Reference supertype
    	                subtype.$super = this;

    	                return subtype;
    	            },

    	            /**
    	             * Extends this object and runs the init method.
    	             * Arguments to create() will be passed to init().
    	             *
    	             * @return {Object} The new object.
    	             *
    	             * @static
    	             *
    	             * @example
    	             *
    	             *     var instance = MyType.create();
    	             */
    	            create: function () {
    	                var instance = this.extend();
    	                instance.init.apply(instance, arguments);

    	                return instance;
    	            },

    	            /**
    	             * Initializes a newly created object.
    	             * Override this method to add some logic when your objects are created.
    	             *
    	             * @example
    	             *
    	             *     var MyType = CryptoJS.lib.Base.extend({
    	             *         init: function () {
    	             *             // ...
    	             *         }
    	             *     });
    	             */
    	            init: function () {
    	            },

    	            /**
    	             * Copies properties into this object.
    	             *
    	             * @param {Object} properties The properties to mix in.
    	             *
    	             * @example
    	             *
    	             *     MyType.mixIn({
    	             *         field: 'value'
    	             *     });
    	             */
    	            mixIn: function (properties) {
    	                for (var propertyName in properties) {
    	                    if (properties.hasOwnProperty(propertyName)) {
    	                        this[propertyName] = properties[propertyName];
    	                    }
    	                }

    	                // IE won't copy toString using the loop above
    	                if (properties.hasOwnProperty('toString')) {
    	                    this.toString = properties.toString;
    	                }
    	            },

    	            /**
    	             * Creates a copy of this object.
    	             *
    	             * @return {Object} The clone.
    	             *
    	             * @example
    	             *
    	             *     var clone = instance.clone();
    	             */
    	            clone: function () {
    	                return this.init.prototype.extend(this);
    	            }
    	        };
    	    }());

    	    /**
    	     * An array of 32-bit words.
    	     *
    	     * @property {Array} words The array of 32-bit words.
    	     * @property {number} sigBytes The number of significant bytes in this word array.
    	     */
    	    var WordArray = C_lib.WordArray = Base.extend({
    	        /**
    	         * Initializes a newly created word array.
    	         *
    	         * @param {Array} words (Optional) An array of 32-bit words.
    	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.lib.WordArray.create();
    	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
    	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
    	         */
    	        init: function (words, sigBytes) {
    	            words = this.words = words || [];

    	            if (sigBytes != undefined$1) {
    	                this.sigBytes = sigBytes;
    	            } else {
    	                this.sigBytes = words.length * 4;
    	            }
    	        },

    	        /**
    	         * Converts this word array to a string.
    	         *
    	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
    	         *
    	         * @return {string} The stringified word array.
    	         *
    	         * @example
    	         *
    	         *     var string = wordArray + '';
    	         *     var string = wordArray.toString();
    	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
    	         */
    	        toString: function (encoder) {
    	            return (encoder || Hex).stringify(this);
    	        },

    	        /**
    	         * Concatenates a word array to this word array.
    	         *
    	         * @param {WordArray} wordArray The word array to append.
    	         *
    	         * @return {WordArray} This word array.
    	         *
    	         * @example
    	         *
    	         *     wordArray1.concat(wordArray2);
    	         */
    	        concat: function (wordArray) {
    	            // Shortcuts
    	            var thisWords = this.words;
    	            var thatWords = wordArray.words;
    	            var thisSigBytes = this.sigBytes;
    	            var thatSigBytes = wordArray.sigBytes;

    	            // Clamp excess bits
    	            this.clamp();

    	            // Concat
    	            if (thisSigBytes % 4) {
    	                // Copy one byte at a time
    	                for (var i = 0; i < thatSigBytes; i++) {
    	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
    	                }
    	            } else {
    	                // Copy one word at a time
    	                for (var j = 0; j < thatSigBytes; j += 4) {
    	                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
    	                }
    	            }
    	            this.sigBytes += thatSigBytes;

    	            // Chainable
    	            return this;
    	        },

    	        /**
    	         * Removes insignificant bits.
    	         *
    	         * @example
    	         *
    	         *     wordArray.clamp();
    	         */
    	        clamp: function () {
    	            // Shortcuts
    	            var words = this.words;
    	            var sigBytes = this.sigBytes;

    	            // Clamp
    	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    	            words.length = Math.ceil(sigBytes / 4);
    	        },

    	        /**
    	         * Creates a copy of this word array.
    	         *
    	         * @return {WordArray} The clone.
    	         *
    	         * @example
    	         *
    	         *     var clone = wordArray.clone();
    	         */
    	        clone: function () {
    	            var clone = Base.clone.call(this);
    	            clone.words = this.words.slice(0);

    	            return clone;
    	        },

    	        /**
    	         * Creates a word array filled with random bytes.
    	         *
    	         * @param {number} nBytes The number of random bytes to generate.
    	         *
    	         * @return {WordArray} The random word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
    	         */
    	        random: function (nBytes) {
    	            var words = [];

    	            for (var i = 0; i < nBytes; i += 4) {
    	                words.push(cryptoSecureRandomInt());
    	            }

    	            return new WordArray.init(words, nBytes);
    	        }
    	    });

    	    /**
    	     * Encoder namespace.
    	     */
    	    var C_enc = C.enc = {};

    	    /**
    	     * Hex encoding strategy.
    	     */
    	    var Hex = C_enc.Hex = {
    	        /**
    	         * Converts a word array to a hex string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The hex string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;

    	            // Convert
    	            var hexChars = [];
    	            for (var i = 0; i < sigBytes; i++) {
    	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                hexChars.push((bite >>> 4).toString(16));
    	                hexChars.push((bite & 0x0f).toString(16));
    	            }

    	            return hexChars.join('');
    	        },

    	        /**
    	         * Converts a hex string to a word array.
    	         *
    	         * @param {string} hexStr The hex string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
    	         */
    	        parse: function (hexStr) {
    	            // Shortcut
    	            var hexStrLength = hexStr.length;

    	            // Convert
    	            var words = [];
    	            for (var i = 0; i < hexStrLength; i += 2) {
    	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    	            }

    	            return new WordArray.init(words, hexStrLength / 2);
    	        }
    	    };

    	    /**
    	     * Latin1 encoding strategy.
    	     */
    	    var Latin1 = C_enc.Latin1 = {
    	        /**
    	         * Converts a word array to a Latin1 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The Latin1 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;

    	            // Convert
    	            var latin1Chars = [];
    	            for (var i = 0; i < sigBytes; i++) {
    	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                latin1Chars.push(String.fromCharCode(bite));
    	            }

    	            return latin1Chars.join('');
    	        },

    	        /**
    	         * Converts a Latin1 string to a word array.
    	         *
    	         * @param {string} latin1Str The Latin1 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
    	         */
    	        parse: function (latin1Str) {
    	            // Shortcut
    	            var latin1StrLength = latin1Str.length;

    	            // Convert
    	            var words = [];
    	            for (var i = 0; i < latin1StrLength; i++) {
    	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    	            }

    	            return new WordArray.init(words, latin1StrLength);
    	        }
    	    };

    	    /**
    	     * UTF-8 encoding strategy.
    	     */
    	    var Utf8 = C_enc.Utf8 = {
    	        /**
    	         * Converts a word array to a UTF-8 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The UTF-8 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            try {
    	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
    	            } catch (e) {
    	                throw new Error('Malformed UTF-8 data');
    	            }
    	        },

    	        /**
    	         * Converts a UTF-8 string to a word array.
    	         *
    	         * @param {string} utf8Str The UTF-8 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
    	         */
    	        parse: function (utf8Str) {
    	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    	        }
    	    };

    	    /**
    	     * Abstract buffered block algorithm template.
    	     *
    	     * The property blockSize must be implemented in a concrete subtype.
    	     *
    	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
    	     */
    	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    	        /**
    	         * Resets this block algorithm's data buffer to its initial state.
    	         *
    	         * @example
    	         *
    	         *     bufferedBlockAlgorithm.reset();
    	         */
    	        reset: function () {
    	            // Initial values
    	            this._data = new WordArray.init();
    	            this._nDataBytes = 0;
    	        },

    	        /**
    	         * Adds new data to this block algorithm's buffer.
    	         *
    	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
    	         *
    	         * @example
    	         *
    	         *     bufferedBlockAlgorithm._append('data');
    	         *     bufferedBlockAlgorithm._append(wordArray);
    	         */
    	        _append: function (data) {
    	            // Convert string to WordArray, else assume WordArray already
    	            if (typeof data == 'string') {
    	                data = Utf8.parse(data);
    	            }

    	            // Append
    	            this._data.concat(data);
    	            this._nDataBytes += data.sigBytes;
    	        },

    	        /**
    	         * Processes available data blocks.
    	         *
    	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
    	         *
    	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
    	         *
    	         * @return {WordArray} The processed data.
    	         *
    	         * @example
    	         *
    	         *     var processedData = bufferedBlockAlgorithm._process();
    	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
    	         */
    	        _process: function (doFlush) {
    	            var processedWords;

    	            // Shortcuts
    	            var data = this._data;
    	            var dataWords = data.words;
    	            var dataSigBytes = data.sigBytes;
    	            var blockSize = this.blockSize;
    	            var blockSizeBytes = blockSize * 4;

    	            // Count blocks ready
    	            var nBlocksReady = dataSigBytes / blockSizeBytes;
    	            if (doFlush) {
    	                // Round up to include partial blocks
    	                nBlocksReady = Math.ceil(nBlocksReady);
    	            } else {
    	                // Round down to include only full blocks,
    	                // less the number of blocks that must remain in the buffer
    	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    	            }

    	            // Count words ready
    	            var nWordsReady = nBlocksReady * blockSize;

    	            // Count bytes ready
    	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

    	            // Process blocks
    	            if (nWordsReady) {
    	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
    	                    // Perform concrete-algorithm logic
    	                    this._doProcessBlock(dataWords, offset);
    	                }

    	                // Remove processed words
    	                processedWords = dataWords.splice(0, nWordsReady);
    	                data.sigBytes -= nBytesReady;
    	            }

    	            // Return processed words
    	            return new WordArray.init(processedWords, nBytesReady);
    	        },

    	        /**
    	         * Creates a copy of this object.
    	         *
    	         * @return {Object} The clone.
    	         *
    	         * @example
    	         *
    	         *     var clone = bufferedBlockAlgorithm.clone();
    	         */
    	        clone: function () {
    	            var clone = Base.clone.call(this);
    	            clone._data = this._data.clone();

    	            return clone;
    	        },

    	        _minBufferSize: 0
    	    });

    	    /**
    	     * Abstract hasher template.
    	     *
    	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
    	     */
    	    C_lib.Hasher = BufferedBlockAlgorithm.extend({
    	        /**
    	         * Configuration options.
    	         */
    	        cfg: Base.extend(),

    	        /**
    	         * Initializes a newly created hasher.
    	         *
    	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
    	         *
    	         * @example
    	         *
    	         *     var hasher = CryptoJS.algo.SHA256.create();
    	         */
    	        init: function (cfg) {
    	            // Apply config defaults
    	            this.cfg = this.cfg.extend(cfg);

    	            // Set initial values
    	            this.reset();
    	        },

    	        /**
    	         * Resets this hasher to its initial state.
    	         *
    	         * @example
    	         *
    	         *     hasher.reset();
    	         */
    	        reset: function () {
    	            // Reset data buffer
    	            BufferedBlockAlgorithm.reset.call(this);

    	            // Perform concrete-hasher logic
    	            this._doReset();
    	        },

    	        /**
    	         * Updates this hasher with a message.
    	         *
    	         * @param {WordArray|string} messageUpdate The message to append.
    	         *
    	         * @return {Hasher} This hasher.
    	         *
    	         * @example
    	         *
    	         *     hasher.update('message');
    	         *     hasher.update(wordArray);
    	         */
    	        update: function (messageUpdate) {
    	            // Append
    	            this._append(messageUpdate);

    	            // Update the hash
    	            this._process();

    	            // Chainable
    	            return this;
    	        },

    	        /**
    	         * Finalizes the hash computation.
    	         * Note that the finalize operation is effectively a destructive, read-once operation.
    	         *
    	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    	         *
    	         * @return {WordArray} The hash.
    	         *
    	         * @example
    	         *
    	         *     var hash = hasher.finalize();
    	         *     var hash = hasher.finalize('message');
    	         *     var hash = hasher.finalize(wordArray);
    	         */
    	        finalize: function (messageUpdate) {
    	            // Final message update
    	            if (messageUpdate) {
    	                this._append(messageUpdate);
    	            }

    	            // Perform concrete-hasher logic
    	            var hash = this._doFinalize();

    	            return hash;
    	        },

    	        blockSize: 512/32,

    	        /**
    	         * Creates a shortcut function to a hasher's object interface.
    	         *
    	         * @param {Hasher} hasher The hasher to create a helper for.
    	         *
    	         * @return {Function} The shortcut function.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
    	         */
    	        _createHelper: function (hasher) {
    	            return function (message, cfg) {
    	                return new hasher.init(cfg).finalize(message);
    	            };
    	        },

    	        /**
    	         * Creates a shortcut function to the HMAC's object interface.
    	         *
    	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
    	         *
    	         * @return {Function} The shortcut function.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
    	         */
    	        _createHmacHelper: function (hasher) {
    	            return function (message, key) {
    	                return new C_algo.HMAC.init(hasher, key).finalize(message);
    	            };
    	        }
    	    });

    	    /**
    	     * Algorithm namespace.
    	     */
    	    var C_algo = C.algo = {};

    	    return C;
    	}(Math));


    	return CryptoJS;

    }));
    });

    createCommonjsModule(function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory(core);
    	}
    }(commonjsGlobal, function (CryptoJS) {

    	(function (Math) {
    	    // Shortcuts
    	    var C = CryptoJS;
    	    var C_lib = C.lib;
    	    var WordArray = C_lib.WordArray;
    	    var Hasher = C_lib.Hasher;
    	    var C_algo = C.algo;

    	    // Constants table
    	    var T = [];

    	    // Compute constants
    	    (function () {
    	        for (var i = 0; i < 64; i++) {
    	            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    	        }
    	    }());

    	    /**
    	     * MD5 hash algorithm.
    	     */
    	    var MD5 = C_algo.MD5 = Hasher.extend({
    	        _doReset: function () {
    	            this._hash = new WordArray.init([
    	                0x67452301, 0xefcdab89,
    	                0x98badcfe, 0x10325476
    	            ]);
    	        },

    	        _doProcessBlock: function (M, offset) {
    	            // Swap endian
    	            for (var i = 0; i < 16; i++) {
    	                // Shortcuts
    	                var offset_i = offset + i;
    	                var M_offset_i = M[offset_i];

    	                M[offset_i] = (
    	                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
    	                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    	                );
    	            }

    	            // Shortcuts
    	            var H = this._hash.words;

    	            var M_offset_0  = M[offset + 0];
    	            var M_offset_1  = M[offset + 1];
    	            var M_offset_2  = M[offset + 2];
    	            var M_offset_3  = M[offset + 3];
    	            var M_offset_4  = M[offset + 4];
    	            var M_offset_5  = M[offset + 5];
    	            var M_offset_6  = M[offset + 6];
    	            var M_offset_7  = M[offset + 7];
    	            var M_offset_8  = M[offset + 8];
    	            var M_offset_9  = M[offset + 9];
    	            var M_offset_10 = M[offset + 10];
    	            var M_offset_11 = M[offset + 11];
    	            var M_offset_12 = M[offset + 12];
    	            var M_offset_13 = M[offset + 13];
    	            var M_offset_14 = M[offset + 14];
    	            var M_offset_15 = M[offset + 15];

    	            // Working varialbes
    	            var a = H[0];
    	            var b = H[1];
    	            var c = H[2];
    	            var d = H[3];

    	            // Computation
    	            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
    	            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
    	            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
    	            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
    	            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
    	            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
    	            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
    	            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
    	            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
    	            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
    	            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
    	            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
    	            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
    	            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
    	            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
    	            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

    	            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
    	            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
    	            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
    	            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
    	            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
    	            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
    	            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
    	            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
    	            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
    	            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
    	            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
    	            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
    	            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
    	            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
    	            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
    	            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

    	            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
    	            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
    	            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
    	            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
    	            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
    	            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
    	            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
    	            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
    	            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
    	            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
    	            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
    	            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
    	            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
    	            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
    	            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
    	            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

    	            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
    	            d = II(d, a, b, c, M_offset_7,  10, T[49]);
    	            c = II(c, d, a, b, M_offset_14, 15, T[50]);
    	            b = II(b, c, d, a, M_offset_5,  21, T[51]);
    	            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
    	            d = II(d, a, b, c, M_offset_3,  10, T[53]);
    	            c = II(c, d, a, b, M_offset_10, 15, T[54]);
    	            b = II(b, c, d, a, M_offset_1,  21, T[55]);
    	            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
    	            d = II(d, a, b, c, M_offset_15, 10, T[57]);
    	            c = II(c, d, a, b, M_offset_6,  15, T[58]);
    	            b = II(b, c, d, a, M_offset_13, 21, T[59]);
    	            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
    	            d = II(d, a, b, c, M_offset_11, 10, T[61]);
    	            c = II(c, d, a, b, M_offset_2,  15, T[62]);
    	            b = II(b, c, d, a, M_offset_9,  21, T[63]);

    	            // Intermediate hash value
    	            H[0] = (H[0] + a) | 0;
    	            H[1] = (H[1] + b) | 0;
    	            H[2] = (H[2] + c) | 0;
    	            H[3] = (H[3] + d) | 0;
    	        },

    	        _doFinalize: function () {
    	            // Shortcuts
    	            var data = this._data;
    	            var dataWords = data.words;

    	            var nBitsTotal = this._nDataBytes * 8;
    	            var nBitsLeft = data.sigBytes * 8;

    	            // Add padding
    	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

    	            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
    	            var nBitsTotalL = nBitsTotal;
    	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
    	                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
    	                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
    	            );
    	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
    	                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
    	                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
    	            );

    	            data.sigBytes = (dataWords.length + 1) * 4;

    	            // Hash final blocks
    	            this._process();

    	            // Shortcuts
    	            var hash = this._hash;
    	            var H = hash.words;

    	            // Swap endian
    	            for (var i = 0; i < 4; i++) {
    	                // Shortcut
    	                var H_i = H[i];

    	                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
    	                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
    	            }

    	            // Return final computed hash
    	            return hash;
    	        },

    	        clone: function () {
    	            var clone = Hasher.clone.call(this);
    	            clone._hash = this._hash.clone();

    	            return clone;
    	        }
    	    });

    	    function FF(a, b, c, d, x, s, t) {
    	        var n = a + ((b & c) | (~b & d)) + x + t;
    	        return ((n << s) | (n >>> (32 - s))) + b;
    	    }

    	    function GG(a, b, c, d, x, s, t) {
    	        var n = a + ((b & d) | (c & ~d)) + x + t;
    	        return ((n << s) | (n >>> (32 - s))) + b;
    	    }

    	    function HH(a, b, c, d, x, s, t) {
    	        var n = a + (b ^ c ^ d) + x + t;
    	        return ((n << s) | (n >>> (32 - s))) + b;
    	    }

    	    function II(a, b, c, d, x, s, t) {
    	        var n = a + (c ^ (b | ~d)) + x + t;
    	        return ((n << s) | (n >>> (32 - s))) + b;
    	    }

    	    /**
    	     * Shortcut function to the hasher's object interface.
    	     *
    	     * @param {WordArray|string} message The message to hash.
    	     *
    	     * @return {WordArray} The hash.
    	     *
    	     * @static
    	     *
    	     * @example
    	     *
    	     *     var hash = CryptoJS.MD5('message');
    	     *     var hash = CryptoJS.MD5(wordArray);
    	     */
    	    C.MD5 = Hasher._createHelper(MD5);

    	    /**
    	     * Shortcut function to the HMAC's object interface.
    	     *
    	     * @param {WordArray|string} message The message to hash.
    	     * @param {WordArray|string} key The secret key.
    	     *
    	     * @return {WordArray} The HMAC.
    	     *
    	     * @static
    	     *
    	     * @example
    	     *
    	     *     var hmac = CryptoJS.HmacMD5(message, key);
    	     */
    	    C.HmacMD5 = Hasher._createHmacHelper(MD5);
    	}(Math));


    	return CryptoJS.MD5;

    }));
    });

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    let getRandomValues;
    const rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    const byteToHex = [];

    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).slice(1));
    }

    function unsafeStringify(arr, offset = 0) {
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
    }

    const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
    var native = {
      randomUUID
    };

    function v4(options, buf, offset) {
      if (native.randomUUID && !buf && !options) {
        return native.randomUUID();
      }

      options = options || {};
      const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return unsafeStringify(rnds);
    }

    class AppState {
      dollar_model;
      currency_model;
      bot_model;

      constructor(dollar_model, currency_model, bot_model) {
        this.dollar_model = dollar_model;
        this.currency_model = currency_model;
        this.bot_model = bot_model;
      }
    }

    class CurrencyRate {
      uid;
      name;
      rate;
      has_manual_rate;
      manual_rate;
      adjustment;

      constructor(name, rate, has_manual_rate, manual_rate, adjustment) {
        this.uid = v4();
        this.name = name;
        this.rate = rate;
        this.has_manual_rate = has_manual_rate;
        this.manual_rate = manual_rate;
        this.adjustment = adjustment;
      }
    }

    class DollarPrice {
      price;
      timestamp;

      constructor(price, timestamp) {
        this.uid = v4();
        this.price = price;
        this.timestamp = timestamp;
      }
    }

    class BotInterval {
      unit;
      value;

      constructor(unit, value) {
        this.unit = unit;
        this.value = value;
      }
    }

    const CurrencyStore = writable({
      selected_currencies: ["EUR", "TRY"],
      currency_rates: [
        new CurrencyRate("EUR", "1.05", false, 1, 500),
        new CurrencyRate("TRY", "19.01", true, 19.5, -200),
      ],
    });

    const DollarStore = writable({
      current_price: new DollarPrice(48285, 1679161352),
      historic_prices: [
        new DollarPrice(47895, 1679218971),
        new DollarPrice(48890, 1679118971),
      ],
    });

    const BotStore = writable({
      disabled: false,
      onTime: true,
      onChange: false,

      interval: new BotInterval("H", 2),
    });

    async function getStateFromServer() {
      let app_server_address = "http://localhost:7777";
      let raw_res = await fetch(
        `${app_server_address}/api/get_state`
        // {mode: 'no-cors'}
      );

      if (!raw_res.ok) {
        console.log(raw_res.statusText);
        console.log(raw_res.status);
      }
      return await raw_res.json();
    }

    function dollarStoreDataAdapter(dollar_model) {
      let rec_historic_prices = [];

      // TODO: Fix date ordering
      for (let historic_price of dollar_model.historic_prices) {
        rec_historic_prices = [
          new DollarPrice(historic_price.price, historic_price.timestamp),
          ...rec_historic_prices,
        ];
      }

      let new_dollar_state = {
        current_price: new DollarPrice(
          dollar_model.current_price.price,
          dollar_model.current_price.timestamp
        ),
        historic_prices: rec_historic_prices,
      };

      return new_dollar_state;
    }

    function botStoreDataAdapter(bot_model) {
      let interval = new BotInterval(
        bot_model.interval.unit,
        bot_model.interval.value
      );

      let new_bot_model = {
        disabled: bot_model.disabled,
        onChange: bot_model.onChange,
        onTime: bot_model.onTime,

        interval: interval,
      };

      return new_bot_model;
    }

    function currencyStoreDataAdapter(currency_model) {
        let received_currency_rates = [];



      for (let raw_model of currency_model.currency_rates) {
        let new_currency = new CurrencyRate(
          raw_model.name,
          raw_model.rate,
          raw_model.has_manual_rate,
          raw_model.manual_rate,
          raw_model.adjustment
        );
        received_currency_rates = [new_currency, ...received_currency_rates];
      }
        let new_currency_state = {
          selected_currencies: currency_model.selected_currencies,
          currency_rates: received_currency_rates,
        };
      return new_currency_state;
    }

    async function reloadStateFromServer() {
      let raw_state = await getStateFromServer();
      console.log(raw_state);

      let new_dollar_state = dollarStoreDataAdapter(raw_state.dollar_model);
      let new_bot_state = botStoreDataAdapter(raw_state.bot_model);
      let new_currency_state = currencyStoreDataAdapter(raw_state.currency_model);

      DollarStore.update((currentState) => {
        return new_dollar_state;
      });

      BotStore.update((currentState) => {
        return new_bot_state;
      });

      CurrencyStore.update((currentState) => {
        return new_currency_state;
      });

      return raw_state;
    }

    let app_state = new AppState(null, null, null);

    function startUpdatingAppState() {
      DollarStore.subscribe((dollar_model) => {
        app_state.dollar_model = dollar_model;
      });
      CurrencyStore.subscribe((currency_model) => {
        app_state.currency_model = { 
            selected_currencies: currency_model.selected_currencies,
            currency_rates: [...currency_model.currency_rates] };
      });
      BotStore.subscribe((bot_model) => {
        app_state.bot_model = bot_model;
      });
    }

    async function sendStateToServer() {
      let app_state_json = JSON.stringify(app_state);
      let app_server_address = "http://localhost:7777";
      let raw_res = await fetch(`${app_server_address}/api/send_state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: app_state_json,
      });

      console.log(raw_res);
    }

    // dollar_model: DollarModel
    // currency_model: CurrencyModel
    // bot_model: BotModel

    // def __init__(self) -> None:
    //     self.dollar_model = DollarModel(
    //         current_price=DollarPrice(44000, 1679313387),
    //         historic_prices=[DollarPrice(44135, 1678313387)]
    //     )

    //     self.currency_model = CurrencyModel([CurrencyRate('TRY', 19.01, False, 0, 500), ]
    //                                         )

    //     self.bot_model = BotModel(disabled=False, onTime=True, onChange=False,
    //                               interval=BotInterval(unit='Hour', value=1))

    /* src/components/Button.svelte generated by Svelte v3.43.2 */

    const file$4 = "src/components/Button.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", /*type*/ ctx[1]);
    			button.disabled = /*disabled*/ ctx[2];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*style*/ ctx[0]) + " svelte-1g7fhy3"));
    			add_location(button, file$4, 6, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
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

    			if (!current || dirty & /*type*/ 2) {
    				attr_dev(button, "type", /*type*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*style*/ ctx[0]) + " svelte-1g7fhy3"))) {
    				attr_dev(button, "class", button_class_value);
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
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { style = 'primary' } = $$props;
    	let { type = 'button' } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['style', 'type', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ style, type, disabled });

    	$$self.$inject_state = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, type, disabled, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { style: 0, type: 1, disabled: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/BotPanel.svelte generated by Svelte v3.43.2 */

    const { console: console_1$3 } = globals;
    const file$3 = "src/components/BotPanel.svelte";

    // (40:4) {#if !$BotStore.disabled}
    function create_if_block$1(ctx) {
    	let ul;
    	let li0;
    	let input0;
    	let input0_checked_value;
    	let t0;
    	let label0;
    	let t2;
    	let li1;
    	let input1;
    	let input1_checked_value;
    	let t3;
    	let label1;
    	let t5;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*$BotStore*/ ctx[0].onTime && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");
    			label0.textContent = "Send On Time";
    			t2 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t3 = space();
    			label1 = element("label");
    			label1.textContent = "Send On Change";
    			t5 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "by-time");
    			attr_dev(input0, "name", "by-time");
    			input0.value = "1";
    			input0.checked = input0_checked_value = /*$BotStore*/ ctx[0].onTime;
    			attr_dev(input0, "class", "svelte-d0y09i");
    			add_location(input0, file$3, 42, 6, 1098);
    			attr_dev(label0, "for", "num1");
    			attr_dev(label0, "class", "svelte-d0y09i");
    			add_location(label0, file$3, 50, 6, 1274);
    			attr_dev(li0, "class", "svelte-d0y09i");
    			add_location(li0, file$3, 41, 4, 1087);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "by-change");
    			attr_dev(input1, "name", "by-change");
    			input1.value = "2";
    			input1.checked = input1_checked_value = /*$BotStore*/ ctx[0].onChange;
    			attr_dev(input1, "class", "svelte-d0y09i");
    			add_location(input1, file$3, 53, 6, 1338);
    			attr_dev(label1, "for", "num2");
    			attr_dev(label1, "class", "svelte-d0y09i");
    			add_location(label1, file$3, 61, 6, 1520);
    			attr_dev(li1, "class", "svelte-d0y09i");
    			add_location(li1, file$3, 52, 4, 1327);
    			attr_dev(ul, "class", "rating svelte-d0y09i");
    			add_location(ul, file$3, 40, 2, 1063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			append_dev(li0, t0);
    			append_dev(li0, label0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			append_dev(li1, t3);
    			append_dev(li1, label1);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*onTriggerChange*/ ctx[1], false, false, false),
    					listen_dev(input1, "change", /*onTriggerChange*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$BotStore*/ 1 && input0_checked_value !== (input0_checked_value = /*$BotStore*/ ctx[0].onTime)) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (dirty & /*$BotStore*/ 1 && input1_checked_value !== (input1_checked_value = /*$BotStore*/ ctx[0].onChange)) {
    				prop_dev(input1, "checked", input1_checked_value);
    			}

    			if (/*$BotStore*/ ctx[0].onTime) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t5);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:4) {#if !$BotStore.disabled}",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#if $BotStore.onTime}
    function create_if_block_1$1(ctx) {
    	let div;
    	let p;
    	let t1;
    	let input;
    	let t2;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Every";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Minutes";
    			option1 = element("option");
    			option1.textContent = "Hours";
    			option2 = element("option");
    			option2.textContent = "Days";
    			attr_dev(p, "class", "svelte-d0y09i");
    			add_location(p, file$3, 66, 6, 1643);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "1");
    			attr_dev(input, "class", "svelte-d0y09i");
    			add_location(input, file$3, 67, 6, 1662);
    			option0.__value = "Week";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-d0y09i");
    			add_location(option0, file$3, 78, 8, 1910);
    			option1.__value = "Hour";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-d0y09i");
    			add_location(option1, file$3, 79, 8, 1956);
    			option2.__value = "Day";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-d0y09i");
    			add_location(option2, file$3, 80, 8, 2000);
    			attr_dev(select, "name", "interval-unit");
    			attr_dev(select, "id", "interval-unit");
    			attr_dev(select, "class", "svelte-d0y09i");
    			if (/*$BotStore*/ ctx[0].interval.unit === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$3, 73, 6, 1785);
    			set_style(div, "display", "flex");
    			attr_dev(div, "class", "svelte-d0y09i");
    			add_location(div, file$3, 65, 4, 1608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*$BotStore*/ ctx[0].interval.value);
    			append_dev(div, t2);
    			append_dev(div, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*$BotStore*/ ctx[0].interval.unit);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$BotStore*/ 1 && to_number(input.value) !== /*$BotStore*/ ctx[0].interval.value) {
    				set_input_value(input, /*$BotStore*/ ctx[0].interval.value);
    			}

    			if (dirty & /*$BotStore*/ 1) {
    				select_option(select, /*$BotStore*/ ctx[0].interval.unit);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(65:2) {#if $BotStore.onTime}",
    		ctx
    	});

    	return block;
    }

    // (34:0) <Card>
    function create_default_slot$2(ctx) {
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let t2_value = (/*$BotStore*/ ctx[0].disabled ? 'Disabled' : 'Running') + "";
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let button0;
    	let t5_value = (/*$BotStore*/ ctx[0].disabled ? "Enable" : "Disable") + "";
    	let t5;
    	let t6;
    	let button1;
    	let t7;
    	let button1_disabled_value;
    	let mounted;
    	let dispose;
    	let if_block = !/*$BotStore*/ ctx[0].disabled && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Status:";
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			div1 = element("div");
    			button0 = element("button");
    			t5 = text(t5_value);
    			t6 = space();
    			button1 = element("button");
    			t7 = text("Send Now");
    			attr_dev(p0, "class", "svelte-d0y09i");
    			add_location(p0, file$3, 35, 8, 943);
    			attr_dev(p1, "class", "svelte-d0y09i");
    			add_location(p1, file$3, 36, 8, 967);
    			set_style(div0, "display", "flex");
    			attr_dev(div0, "class", "svelte-d0y09i");
    			add_location(div0, file$3, 34, 4, 906);
    			attr_dev(button0, "class", "svelte-d0y09i");
    			add_location(button0, file$3, 87, 4, 2112);
    			button1.disabled = button1_disabled_value = /*$BotStore*/ ctx[0].disabled;
    			attr_dev(button1, "class", "svelte-d0y09i");
    			add_location(button1, file$3, 92, 4, 2237);
    			set_style(div1, "display", "flex");
    			attr_dev(div1, "class", "svelte-d0y09i");
    			add_location(div1, file$3, 86, 2, 2080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(button0, t5);
    			append_dev(div1, t6);
    			append_dev(div1, button1);
    			append_dev(button1, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*onBotDisableButtonClicked*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*onBotSendNowButtonClicked*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$BotStore*/ 1 && t2_value !== (t2_value = (/*$BotStore*/ ctx[0].disabled ? 'Disabled' : 'Running') + "")) set_data_dev(t2, t2_value);

    			if (!/*$BotStore*/ ctx[0].disabled) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(t4.parentNode, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$BotStore*/ 1 && t5_value !== (t5_value = (/*$BotStore*/ ctx[0].disabled ? "Enable" : "Disable") + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$BotStore*/ 1 && button1_disabled_value !== (button1_disabled_value = /*$BotStore*/ ctx[0].disabled)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(34:0) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, $BotStore*/ 65) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
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
    	let $BotStore;
    	validate_store(BotStore, 'BotStore');
    	component_subscribe($$self, BotStore, $$value => $$invalidate(0, $BotStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BotPanel', slots, []);

    	const onTriggerChange = e => {
    		console.log(e.currentTarget.value);
    		let selected = +e.currentTarget.value;

    		BotStore.update(currentState => {
    			let new_state = JSON.parse(JSON.stringify(currentState));

    			if (selected === 1) {
    				new_state.onTime = true;
    				new_state.onChange = false;
    			} else {
    				new_state.onTime = false;
    				new_state.onChange = true;
    			}

    			return new_state;
    		});
    	};

    	const onBotDisableButtonClicked = () => {
    		set_store_value(BotStore, $BotStore.disabled = !$BotStore.disabled, $BotStore);
    	};

    	const onBotSendNowButtonClicked = async () => {
    		console.log("Sending Bot Now!");
    	}; /* await reloadStateFromServer() */

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<BotPanel> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$BotStore.interval.value = to_number(this.value);
    		BotStore.set($BotStore);
    	}

    	function select_change_handler() {
    		$BotStore.interval.unit = select_value(this);
    		BotStore.set($BotStore);
    	}

    	$$self.$capture_state = () => ({
    		Card,
    		BotStore,
    		getStateFromServer,
    		reloadStateFromServer,
    		sendStateToServer,
    		Button,
    		onTriggerChange,
    		onBotDisableButtonClicked,
    		onBotSendNowButtonClicked,
    		$BotStore
    	});

    	return [
    		$BotStore,
    		onTriggerChange,
    		onBotDisableButtonClicked,
    		onBotSendNowButtonClicked,
    		input_input_handler,
    		select_change_handler
    	];
    }

    class BotPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BotPanel",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/DollarPanel.svelte generated by Svelte v3.43.2 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/components/DollarPanel.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (77:6) <Button type="submit">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add");
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(77:6) <Button type=\\\"submit\\\">",
    		ctx
    	});

    	return block;
    }

    // (97:2) {#each $DollarStore.historic_prices as dollar (dollar.uid)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let p0;
    	let t0_value = /*dollar*/ ctx[11].price + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*convertTimestampToDate*/ ctx[4](/*dollar*/ ctx[11].timestamp) + "";
    	let t2;
    	let t3;
    	let t4_value = /*convertTimestampToTime*/ ctx[5](/*dollar*/ ctx[11].timestamp) + "";
    	let t4;
    	let t5;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = text(" -\n        ");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(p0, "class", "svelte-15yrd8l");
    			add_location(p0, file$2, 98, 6, 2562);
    			attr_dev(p1, "class", "svelte-15yrd8l");
    			add_location(p1, file$2, 99, 6, 2590);
    			set_style(div, "display", "flex");
    			set_style(div, "justify-content", "space-between");
    			attr_dev(div, "class", "svelte-15yrd8l");
    			add_location(div, file$2, 97, 4, 2494);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(div, t5);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$DollarStore*/ 4 && t0_value !== (t0_value = /*dollar*/ ctx[11].price + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$DollarStore*/ 4 && t2_value !== (t2_value = /*convertTimestampToDate*/ ctx[4](/*dollar*/ ctx[11].timestamp) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$DollarStore*/ 4 && t4_value !== (t4_value = /*convertTimestampToTime*/ ctx[5](/*dollar*/ ctx[11].timestamp) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(97:2) {#each $DollarStore.historic_prices as dollar (dollar.uid)}",
    		ctx
    	});

    	return block;
    }

    // (70:0) <Card>
    function create_default_slot$1(ctx) {
    	let form;
    	let div0;
    	let p0;
    	let t1;
    	let input0;
    	let t2;
    	let p1;
    	let t4;
    	let input1;
    	let t5;
    	let button;
    	let t6;
    	let hr0;
    	let t7;
    	let div1;
    	let p2;
    	let t8;
    	let t9_value = /*$DollarStore*/ ctx[2].current_price.price + "";
    	let t9;
    	let t10;
    	let p3;
    	let t11_value = /*convertTimestampToDate*/ ctx[4](/*$DollarStore*/ ctx[2].current_price.timestamp) + "";
    	let t11;
    	let t12;
    	let t13_value = /*convertTimestampToTime*/ ctx[5](/*$DollarStore*/ ctx[2].current_price.timestamp) + "";
    	let t13;
    	let t14;
    	let hr1;
    	let t15;
    	let p4;
    	let t17;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				type: "submit",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*$DollarStore*/ ctx[2].historic_prices;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dollar*/ ctx[11].uid;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Enter";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "$";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			create_component(button.$$.fragment);
    			t6 = space();
    			hr0 = element("hr");
    			t7 = space();
    			div1 = element("div");
    			p2 = element("p");
    			t8 = text("Current Price:\n      ");
    			t9 = text(t9_value);
    			t10 = space();
    			p3 = element("p");
    			t11 = text(t11_value);
    			t12 = text(" -\n      ");
    			t13 = text(t13_value);
    			t14 = space();
    			hr1 = element("hr");
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "Logs:";
    			t17 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p0, "class", "svelte-15yrd8l");
    			add_location(p0, file$2, 72, 6, 1828);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "class", "svelte-15yrd8l");
    			add_location(input0, file$2, 73, 6, 1847);
    			attr_dev(p1, "class", "svelte-15yrd8l");
    			add_location(p1, file$2, 74, 6, 1910);
    			attr_dev(input1, "type", "datetime-local");
    			attr_dev(input1, "class", "svelte-15yrd8l");
    			add_location(input1, file$2, 75, 6, 1925);
    			set_style(div0, "display", "flex");
    			attr_dev(div0, "class", "svelte-15yrd8l");
    			add_location(div0, file$2, 71, 4, 1793);
    			attr_dev(form, "class", "svelte-15yrd8l");
    			add_location(form, file$2, 70, 2, 1729);
    			attr_dev(hr0, "class", "solid svelte-15yrd8l");
    			add_location(hr0, file$2, 80, 2, 2058);
    			attr_dev(p2, "class", "svelte-15yrd8l");
    			add_location(p2, file$2, 83, 4, 2147);
    			attr_dev(p3, "class", "svelte-15yrd8l");
    			add_location(p3, file$2, 87, 4, 2226);
    			set_style(div1, "display", "flex");
    			set_style(div1, "justify-content", "space-between");
    			attr_dev(div1, "class", "svelte-15yrd8l");
    			add_location(div1, file$2, 82, 2, 2082);
    			attr_dev(hr1, "class", "solid svelte-15yrd8l");
    			add_location(hr1, file$2, 93, 2, 2391);
    			attr_dev(p4, "class", "svelte-15yrd8l");
    			add_location(p4, file$2, 95, 2, 2415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*manual_rate*/ ctx[0]);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(div0, t4);
    			append_dev(div0, input1);
    			set_input_value(input1, /*user_selected_timedate*/ ctx[1]);
    			append_dev(div0, t5);
    			mount_component(button, div0, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(div1, t10);
    			append_dev(div1, p3);
    			append_dev(p3, t11);
    			append_dev(p3, t12);
    			append_dev(p3, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t17, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*handleSubmit*/ ctx[3](/*manual_rate*/ ctx[0]))) /*handleSubmit*/ ctx[3](/*manual_rate*/ ctx[0]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*manual_rate*/ 1 && to_number(input0.value) !== /*manual_rate*/ ctx[0]) {
    				set_input_value(input0, /*manual_rate*/ ctx[0]);
    			}

    			if (dirty & /*user_selected_timedate*/ 2) {
    				set_input_value(input1, /*user_selected_timedate*/ ctx[1]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			if ((!current || dirty & /*$DollarStore*/ 4) && t9_value !== (t9_value = /*$DollarStore*/ ctx[2].current_price.price + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*$DollarStore*/ 4) && t11_value !== (t11_value = /*convertTimestampToDate*/ ctx[4](/*$DollarStore*/ ctx[2].current_price.timestamp) + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty & /*$DollarStore*/ 4) && t13_value !== (t13_value = /*convertTimestampToTime*/ ctx[5](/*$DollarStore*/ ctx[2].current_price.timestamp) + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*convertTimestampToTime, $DollarStore, convertTimestampToDate*/ 52) {
    				each_value = /*$DollarStore*/ ctx[2].historic_prices;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    			}
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
    			if (detaching) detach_dev(form);
    			destroy_component(button);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(70:0) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, $DollarStore, manual_rate, user_selected_timedate*/ 16391) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
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
    	let $DollarStore;
    	validate_store(DollarStore, 'DollarStore');
    	component_subscribe($$self, DollarStore, $$value => $$invalidate(2, $DollarStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DollarPanel', slots, []);
    	let timePickerOptions = { bgColor: "#9b2c2c", hasButtons: true };
    	let manual_rate = "";

    	// TODO: initialize this to have a default value
    	let user_selected_timedate;

    	const handleChange = symbol => {
    		console.log(symbol);
    	};

    	const handleSubmit = new_price => {
    		console.log(new_price);

    		DollarStore.update(currentState => {
    			let new_historic_price = new DollarPrice(+currentState.current_price.price, currentState.current_price.timestamp);
    			let new_historic_prices = [new_historic_price, ...currentState.historic_prices];
    			console.log(user_selected_timedate);

    			let new_dollar_price = new DollarPrice(new_price,
    			/* Math.floor(new Date() / 1000) */
    				user_selected_timedate instanceof String
    				? Math.floor(Date.parse(user_selected_timedate) / 1000)
    				: Math.floor(new Date() / 1000));

    			let new_state = {
    				current_price: new_dollar_price,
    				historic_prices: new_historic_prices
    			};

    			return new_state;
    		});
    	};

    	const newDollarPriceTimeChanged = e => {
    		console.log(e.detail);
    	};

    	// TODO: Do we need to use locale?
    	const convertTimestampToDate = timestamp => {
    		let pointInTime = new Date(timestamp * 1000);
    		return pointInTime.toLocaleDateString();
    	};

    	const convertTimestampToTime = timestamp => {
    		let pointInTime = new Date(timestamp * 1000).toLocaleTimeString();
    		return pointInTime;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<DollarPanel> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		manual_rate = to_number(this.value);
    		$$invalidate(0, manual_rate);
    	}

    	function input1_input_handler() {
    		user_selected_timedate = this.value;
    		$$invalidate(1, user_selected_timedate);
    	}

    	$$self.$capture_state = () => ({
    		uuidv4: v4,
    		DollarStore,
    		DollarPrice,
    		Button,
    		Card,
    		timePickerOptions,
    		manual_rate,
    		user_selected_timedate,
    		handleChange,
    		handleSubmit,
    		newDollarPriceTimeChanged,
    		convertTimestampToDate,
    		convertTimestampToTime,
    		$DollarStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('timePickerOptions' in $$props) timePickerOptions = $$props.timePickerOptions;
    		if ('manual_rate' in $$props) $$invalidate(0, manual_rate = $$props.manual_rate);
    		if ('user_selected_timedate' in $$props) $$invalidate(1, user_selected_timedate = $$props.user_selected_timedate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		manual_rate,
    		user_selected_timedate,
    		$DollarStore,
    		handleSubmit,
    		convertTimestampToDate,
    		convertTimestampToTime,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class DollarPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DollarPanel",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/components/SymbolList.svelte generated by Svelte v3.43.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/components/SymbolList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (54:8) {#if !$CurrencyStore.selected_currencies.includes(currencyRate.name)}
    function create_if_block_2(ctx) {
    	let option;
    	let t_value = /*currencyRate*/ ctx[13].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*currencyRate*/ ctx[13].name;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-1kvb8vw");
    			add_location(option, file$1, 54, 10, 1401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CurrencyStore*/ 2 && t_value !== (t_value = /*currencyRate*/ ctx[13].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$CurrencyStore*/ 2 && option_value_value !== (option_value_value = /*currencyRate*/ ctx[13].name)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(54:8) {#if !$CurrencyStore.selected_currencies.includes(currencyRate.name)}",
    		ctx
    	});

    	return block;
    }

    // (53:6) {#each $CurrencyStore.currency_rates as currencyRate, i (currencyRate.uid)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let show_if = !/*$CurrencyStore*/ ctx[1].selected_currencies.includes(/*currencyRate*/ ctx[13].name);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$CurrencyStore*/ 2) show_if = !/*$CurrencyStore*/ ctx[1].selected_currencies.includes(/*currencyRate*/ ctx[13].name);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(53:6) {#each $CurrencyStore.currency_rates as currencyRate, i (currencyRate.uid)}",
    		ctx
    	});

    	return block;
    }

    // (78:6) {#if $CurrencyStore.selected_currencies.includes(currencyRate.name)}
    function create_if_block(ctx) {
    	let div0;
    	let p0;
    	let t0_value = /*i*/ ctx[15] + 1 + "";
    	let t0;
    	let t1;
    	let div1;
    	let input0;
    	let t2;
    	let div2;
    	let p1;
    	let t3_value = /*currencyRate*/ ctx[13].name + "";
    	let t3;
    	let t4;
    	let div3;
    	let t5;
    	let div4;
    	let input1;
    	let t6;
    	let mounted;
    	let dispose;

    	function input0_change_handler() {
    		/*input0_change_handler*/ ctx[7].call(input0, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*currencyRate*/ ctx[13].has_manual_rate) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function change_handler() {
    		return /*change_handler*/ ctx[10](/*currencyRate*/ ctx[13]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[11].call(input1, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			if_block.c();
    			t5 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t6 = space();
    			attr_dev(p0, "class", "svelte-1kvb8vw");
    			add_location(p0, file$1, 79, 10, 2278);
    			attr_dev(div0, "class", "table-cell svelte-1kvb8vw");
    			add_location(div0, file$1, 78, 8, 2243);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-1kvb8vw");
    			add_location(input0, file$1, 85, 10, 2376);
    			attr_dev(div1, "class", "table-cell svelte-1kvb8vw");
    			add_location(div1, file$1, 84, 8, 2341);
    			attr_dev(p1, "class", "svelte-1kvb8vw");
    			add_location(p1, file$1, 88, 10, 2504);
    			attr_dev(div2, "class", "table-cell svelte-1kvb8vw");
    			add_location(div2, file$1, 87, 8, 2469);
    			attr_dev(div3, "class", "table-cell svelte-1kvb8vw");
    			add_location(div3, file$1, 92, 8, 2578);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "50");
    			attr_dev(input1, "class", "svelte-1kvb8vw");
    			add_location(input1, file$1, 108, 10, 3028);
    			attr_dev(div4, "class", "table-cell svelte-1kvb8vw");
    			add_location(div4, file$1, 107, 8, 2993);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input0);
    			input0.checked = /*currencyRate*/ ctx[13].has_manual_rate;
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p1);
    			append_dev(p1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			if_block.m(div3, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, input1);
    			set_input_value(input1, /*currencyRate*/ ctx[13].adjustment);
    			append_dev(div4, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", input0_change_handler),
    					listen_dev(input1, "change", change_handler, false, false, false),
    					listen_dev(input1, "input", input1_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$CurrencyStore*/ 2 && t0_value !== (t0_value = /*i*/ ctx[15] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$CurrencyStore*/ 2) {
    				input0.checked = /*currencyRate*/ ctx[13].has_manual_rate;
    			}

    			if (dirty & /*$CurrencyStore*/ 2 && t3_value !== (t3_value = /*currencyRate*/ ctx[13].name + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			}

    			if (dirty & /*$CurrencyStore*/ 2 && to_number(input1.value) !== /*currencyRate*/ ctx[13].adjustment) {
    				set_input_value(input1, /*currencyRate*/ ctx[13].adjustment);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:6) {#if $CurrencyStore.selected_currencies.includes(currencyRate.name)}",
    		ctx
    	});

    	return block;
    }

    // (102:10) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t_value = /*currencyRate*/ ctx[13].rate + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1kvb8vw");
    			add_location(p, file$1, 102, 12, 2899);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CurrencyStore*/ 2 && t_value !== (t_value = /*currencyRate*/ ctx[13].rate + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(102:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:10) {#if currencyRate.has_manual_rate}
    function create_if_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function chage_handler() {
    		return /*chage_handler*/ ctx[8](/*currencyRate*/ ctx[13]);
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[9].call(input, /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "0.001");
    			attr_dev(input, "class", "svelte-1kvb8vw");
    			add_location(input, file$1, 94, 12, 2660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*currencyRate*/ ctx[13].manual_rate);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "chage", chage_handler, false, false, false),
    					listen_dev(input, "input", input_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$CurrencyStore*/ 2 && to_number(input.value) !== /*currencyRate*/ ctx[13].manual_rate) {
    				set_input_value(input, /*currencyRate*/ ctx[13].manual_rate);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(94:10) {#if currencyRate.has_manual_rate}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#each $CurrencyStore.currency_rates as currencyRate, i (currencyRate.uid)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let show_if = /*$CurrencyStore*/ ctx[1].selected_currencies.includes(/*currencyRate*/ ctx[13].name);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$CurrencyStore*/ 2) show_if = /*$CurrencyStore*/ ctx[1].selected_currencies.includes(/*currencyRate*/ ctx[13].name);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(77:4) {#each $CurrencyStore.currency_rates as currencyRate, i (currencyRate.uid)}",
    		ctx
    	});

    	return block;
    }

    // (43:0) <Card>
    function create_default_slot(ctx) {
    	let div0;
    	let select;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let select_disabled_value;
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let div6;
    	let div1;
    	let t6;
    	let div2;
    	let t8;
    	let div3;
    	let t10;
    	let div4;
    	let t12;
    	let div5;
    	let t14;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$CurrencyStore*/ ctx[1].currency_rates;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*currencyRate*/ ctx[13].uid;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*$CurrencyStore*/ ctx[1].currency_rates;
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*currencyRate*/ ctx[13].uid;
    	validate_each_keys(ctx, each_value, get_each_context, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Add";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Reset";
    			t4 = space();
    			div6 = element("div");
    			div1 = element("div");
    			div1.textContent = "Row";
    			t6 = space();
    			div2 = element("div");
    			div2.textContent = "Manual";
    			t8 = space();
    			div3 = element("div");
    			div3.textContent = "Currency";
    			t10 = space();
    			div4 = element("div");
    			div4.textContent = "Rate";
    			t12 = space();
    			div5 = element("div");
    			div5.textContent = "Adjust";
    			t14 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			select.disabled = select_disabled_value = /*$CurrencyStore*/ ctx[1].selected_currencies.length === /*$CurrencyStore*/ ctx[1].currency_rates.length;
    			attr_dev(select, "class", "add-remove-currency select-currency svelte-1kvb8vw");
    			attr_dev(select, "name", "select-currency");
    			attr_dev(select, "id", "select-currency");
    			if (/*selected_currency*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$1, 44, 4, 966);
    			attr_dev(button0, "class", "svelte-1kvb8vw");
    			add_location(button0, file$1, 58, 4, 1510);
    			attr_dev(button1, "class", "svelte-1kvb8vw");
    			add_location(button1, file$1, 59, 4, 1583);
    			set_style(div0, "display", "flex");
    			attr_dev(div0, "class", "svelte-1kvb8vw");
    			add_location(div0, file$1, 43, 2, 933);
    			attr_dev(div1, "class", "table-cell heading-title svelte-1kvb8vw");
    			add_location(div1, file$1, 71, 4, 1812);
    			attr_dev(div2, "class", "table-cell heading-title svelte-1kvb8vw");
    			add_location(div2, file$1, 72, 4, 1864);
    			attr_dev(div3, "class", "table-cell heading-title svelte-1kvb8vw");
    			add_location(div3, file$1, 73, 4, 1919);
    			attr_dev(div4, "class", "table-cell heading-title svelte-1kvb8vw");
    			add_location(div4, file$1, 74, 4, 1976);
    			attr_dev(div5, "class", "table-cell heading-title svelte-1kvb8vw");
    			add_location(div5, file$1, 75, 4, 2029);
    			set_style(div6, "display", "grid");
    			set_style(div6, "grid-template-columns", "repeat(5, auto)");
    			set_style(div6, "max-width", "480px");
    			attr_dev(div6, "class", "svelte-1kvb8vw");
    			add_location(div6, file$1, 65, 2, 1688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*selected_currency*/ ctx[0]);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div6, t6);
    			append_dev(div6, div2);
    			append_dev(div6, t8);
    			append_dev(div6, div3);
    			append_dev(div6, t10);
    			append_dev(div6, div4);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div6, t14);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*handleAddCurrency*/ ctx[3](/*selected_currency*/ ctx[0]))) /*handleAddCurrency*/ ctx[3](/*selected_currency*/ ctx[0]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$CurrencyStore*/ 2) {
    				each_value_1 = /*$CurrencyStore*/ ctx[1].currency_rates;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, select, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*$CurrencyStore*/ 2 && select_disabled_value !== (select_disabled_value = /*$CurrencyStore*/ ctx[1].selected_currencies.length === /*$CurrencyStore*/ ctx[1].currency_rates.length)) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (dirty & /*selected_currency, $CurrencyStore*/ 3) {
    				select_option(select, /*selected_currency*/ ctx[0]);
    			}

    			if (dirty & /*$CurrencyStore, handleChange*/ 6) {
    				each_value = /*$CurrencyStore*/ ctx[1].currency_rates;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div6, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(43:0) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, $CurrencyStore, selected_currency*/ 131075) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
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
    	let $CurrencyStore;
    	validate_store(CurrencyStore, 'CurrencyStore');
    	component_subscribe($$self, CurrencyStore, $$value => $$invalidate(1, $CurrencyStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SymbolList', slots, []);
    	let selected_currency;

    	const handleInput = symbol => {
    		console.log(symbol);
    	};

    	const handleChange = currencyRate => {
    		console.log(currencyRate);
    	};

    	const handleAddCurrency = selected_currency => {
    		console.log("ssFF");

    		CurrencyStore.update(currentState => {
    			let newState = currentState;
    			newState.selected_currencies = [selected_currency, ...newState.selected_currencies];
    			return newState;
    		});
    	};

    	const handleResetCurrencies = () => {
    		console.log("FFF");

    		CurrencyStore.update(currentState => {
    			let newState = currentState;
    			newState.selected_currencies = [];
    			return newState;
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<SymbolList> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected_currency = select_value(this);
    		$$invalidate(0, selected_currency);
    	}

    	const click_handler = () => {
    		handleResetCurrencies();
    	};

    	function input0_change_handler(each_value, i) {
    		each_value[i].has_manual_rate = this.checked;
    		CurrencyStore.set($CurrencyStore);
    	}

    	const chage_handler = currencyRate => handleChange(currencyRate);

    	function input_input_handler(each_value, i) {
    		each_value[i].manual_rate = to_number(this.value);
    		CurrencyStore.set($CurrencyStore);
    	}

    	const change_handler = currencyRate => handleChange(currencyRate);

    	function input1_input_handler(each_value, i) {
    		each_value[i].adjustment = to_number(this.value);
    		CurrencyStore.set($CurrencyStore);
    	}

    	$$self.$capture_state = () => ({
    		CurrencyStore,
    		fade,
    		scale,
    		Card,
    		Button,
    		selected_currency,
    		handleInput,
    		handleChange,
    		handleAddCurrency,
    		handleResetCurrencies,
    		$CurrencyStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected_currency' in $$props) $$invalidate(0, selected_currency = $$props.selected_currency);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected_currency,
    		$CurrencyStore,
    		handleChange,
    		handleAddCurrency,
    		handleResetCurrencies,
    		select_change_handler,
    		click_handler,
    		input0_change_handler,
    		chage_handler,
    		input_input_handler,
    		change_handler,
    		input1_input_handler
    	];
    }

    class SymbolList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SymbolList",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let p;
    	let t1;
    	let button;
    	let t3;
    	let botpanel;
    	let t4;
    	let dollarpanel;
    	let t5;
    	let symbollist;
    	let current;
    	let mounted;
    	let dispose;
    	botpanel = new BotPanel({ $$inline: true });
    	dollarpanel = new DollarPanel({ $$inline: true });
    	symbollist = new SymbolList({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			p = element("p");
    			p.textContent = "Exchange Admin Panel";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Save";
    			t3 = space();
    			create_component(botpanel.$$.fragment);
    			t4 = space();
    			create_component(dollarpanel.$$.fragment);
    			t5 = space();
    			create_component(symbollist.$$.fragment);
    			attr_dev(p, "class", "svelte-1r27g2b");
    			add_location(p, file, 24, 6, 558);
    			attr_dev(button, "class", "svelte-1r27g2b");
    			add_location(button, file, 25, 4, 591);
    			set_style(div, "display", "flex");
    			set_style(div, "justify-content", "space-between");
    			add_location(div, file, 23, 2, 492);
    			attr_dev(main, "class", "container");
    			add_location(main, file, 22, 0, 465);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(main, t3);
    			mount_component(botpanel, main, null);
    			append_dev(main, t4);
    			mount_component(dollarpanel, main, null);
    			append_dev(main, t5);
    			mount_component(symbollist, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(botpanel.$$.fragment, local);
    			transition_in(dollarpanel.$$.fragment, local);
    			transition_in(symbollist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(botpanel.$$.fragment, local);
    			transition_out(dollarpanel.$$.fragment, local);
    			transition_out(symbollist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(botpanel);
    			destroy_component(dollarpanel);
    			destroy_component(symbollist);
    			mounted = false;
    			dispose();
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	startUpdatingAppState();

    	onMount(async () => {
    		console.log("Loaded!");
    		await reloadStateFromServer();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = async () => {
    		await sendStateToServer();
    	};

    	$$self.$capture_state = () => ({
    		BotPanel,
    		DollarPanel,
    		SymbolList,
    		reloadStateFromServer,
    		sendStateToServer,
    		startUpdatingAppState,
    		onMount
    	});

    	return [click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
