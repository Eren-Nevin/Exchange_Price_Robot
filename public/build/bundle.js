
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

    class CurrencySymbol {
      id;
      name;
      rate;

      constructor(id, name, rate) {
        this.id = id;
        this.name = name;
        this.rate = rate;
      }
    }

    const CurrencyStore = writable([
      {
        id: 1,
        symbol: new CurrencySymbol("5", "EUR", "1.05"),
        has_manual_rate : false,
        manual_rate: 1.06,
        addition: 500,
      },
      {
        id: 2,
        symbol: new CurrencySymbol("3", "TL", "0.05"),
        has_manual_rate : true,
        manual_rate: 0.04,
        addition: 0,
      },
    ]);

    // export const RateCalibratesStore = writable([
    //   {
    //     id: 1,
    //     amount: "+500",
    //   },
    // ]);

    const DollarStore = writable({
      current_price: 48285,
      current_time: 1679161352,
      logs: [
        {
          id: "some_uuid",
          price: 47895,
          time: 1679218971,
        },
        {
          id: "some_uuid_2",
          price: 48890,
          time: 1679118971,
        },
      ],
    });

    const BotStore = writable({
        disabled: false,
        onTime: true,
        onChange: false,

        intervalSettings : {
            intervalValue: 5,
            intervalDuration: 'Day'
        }
    });

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

    const { console: console_1$2 } = globals;
    const file$3 = "src/components/BotPanel.svelte";

    // (38:4) {#if !$BotStore.disabled}
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
    	let if_block = /*$BotStore*/ ctx[0].onTime && create_if_block_1(ctx);

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
    			attr_dev(input0, "class", "svelte-kgbl39");
    			add_location(input0, file$3, 40, 6, 985);
    			attr_dev(label0, "for", "num1");
    			attr_dev(label0, "class", "svelte-kgbl39");
    			add_location(label0, file$3, 48, 6, 1161);
    			attr_dev(li0, "class", "svelte-kgbl39");
    			add_location(li0, file$3, 39, 4, 974);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "by-change");
    			attr_dev(input1, "name", "by-change");
    			input1.value = "2";
    			input1.checked = input1_checked_value = /*$BotStore*/ ctx[0].onChange;
    			attr_dev(input1, "class", "svelte-kgbl39");
    			add_location(input1, file$3, 51, 6, 1225);
    			attr_dev(label1, "for", "num2");
    			attr_dev(label1, "class", "svelte-kgbl39");
    			add_location(label1, file$3, 59, 6, 1407);
    			attr_dev(li1, "class", "svelte-kgbl39");
    			add_location(li1, file$3, 50, 4, 1214);
    			attr_dev(ul, "class", "rating svelte-kgbl39");
    			add_location(ul, file$3, 38, 2, 950);
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
    					if_block = create_if_block_1(ctx);
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
    		source: "(38:4) {#if !$BotStore.disabled}",
    		ctx
    	});

    	return block;
    }

    // (63:2) {#if $BotStore.onTime}
    function create_if_block_1(ctx) {
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
    			attr_dev(p, "class", "svelte-kgbl39");
    			add_location(p, file$3, 64, 6, 1530);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "1");
    			attr_dev(input, "class", "svelte-kgbl39");
    			add_location(input, file$3, 65, 6, 1549);
    			option0.__value = "Week";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-kgbl39");
    			add_location(option0, file$3, 76, 8, 1823);
    			option1.__value = "Hour";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-kgbl39");
    			add_location(option1, file$3, 77, 8, 1869);
    			option2.__value = "Day";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-kgbl39");
    			add_location(option2, file$3, 78, 8, 1913);
    			attr_dev(select, "name", "language");
    			attr_dev(select, "id", "language");
    			attr_dev(select, "class", "svelte-kgbl39");
    			if (/*$BotStore*/ ctx[0].intervalSettings.intervalDuration === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$3, 71, 6, 1688);
    			set_style(div, "display", "flex");
    			attr_dev(div, "class", "svelte-kgbl39");
    			add_location(div, file$3, 63, 4, 1495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*$BotStore*/ ctx[0].intervalSettings.intervalValue);
    			append_dev(div, t2);
    			append_dev(div, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*$BotStore*/ ctx[0].intervalSettings.intervalDuration);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$BotStore*/ 1 && to_number(input.value) !== /*$BotStore*/ ctx[0].intervalSettings.intervalValue) {
    				set_input_value(input, /*$BotStore*/ ctx[0].intervalSettings.intervalValue);
    			}

    			if (dirty & /*$BotStore*/ 1) {
    				select_option(select, /*$BotStore*/ ctx[0].intervalSettings.intervalDuration);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(63:2) {#if $BotStore.onTime}",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Card>
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
    			attr_dev(p0, "class", "svelte-kgbl39");
    			add_location(p0, file$3, 33, 8, 830);
    			attr_dev(p1, "class", "svelte-kgbl39");
    			add_location(p1, file$3, 34, 8, 854);
    			set_style(div0, "display", "flex");
    			attr_dev(div0, "class", "svelte-kgbl39");
    			add_location(div0, file$3, 32, 4, 793);
    			attr_dev(button0, "class", "svelte-kgbl39");
    			add_location(button0, file$3, 85, 4, 2025);
    			button1.disabled = button1_disabled_value = /*$BotStore*/ ctx[0].disabled;
    			attr_dev(button1, "class", "svelte-kgbl39");
    			add_location(button1, file$3, 90, 4, 2150);
    			set_style(div1, "display", "flex");
    			attr_dev(div1, "class", "svelte-kgbl39");
    			add_location(div1, file$3, 84, 2, 1993);
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
    		source: "(32:0) <Card>",
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

    	const onBotSendNowButtonClicked = () => {
    		console.log("Sending Bot Now!");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<BotPanel> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$BotStore.intervalSettings.intervalValue = to_number(this.value);
    		BotStore.set($BotStore);
    	}

    	function select_change_handler() {
    		$BotStore.intervalSettings.intervalDuration = select_value(this);
    		BotStore.set($BotStore);
    	}

    	$$self.$capture_state = () => ({
    		Card,
    		BotStore,
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

    /* src/components/DollarPanel.svelte generated by Svelte v3.43.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/components/DollarPanel.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (52:6) <Button type="submit">
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
    		source: "(52:6) <Button type=\\\"submit\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:2) {#each $DollarStore.logs as dollar (dollar.id)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let p0;
    	let t0_value = /*dollar*/ ctx[7].price + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*convertTimestampToDate*/ ctx[3](/*dollar*/ ctx[7].time) + "";
    	let t2;
    	let t3;
    	let t4_value = /*convertTimestampToTime*/ ctx[4](/*dollar*/ ctx[7].time) + "";
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
    			attr_dev(p0, "class", "svelte-1e4gchx");
    			add_location(p0, file$2, 73, 6, 1849);
    			attr_dev(p1, "class", "svelte-1e4gchx");
    			add_location(p1, file$2, 74, 6, 1877);
    			set_style(div, "display", "flex");
    			set_style(div, "justify-content", "space-between");
    			attr_dev(div, "class", "svelte-1e4gchx");
    			add_location(div, file$2, 72, 4, 1781);
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
    			if (dirty & /*$DollarStore*/ 2 && t0_value !== (t0_value = /*dollar*/ ctx[7].price + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$DollarStore*/ 2 && t2_value !== (t2_value = /*convertTimestampToDate*/ ctx[3](/*dollar*/ ctx[7].time) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$DollarStore*/ 2 && t4_value !== (t4_value = /*convertTimestampToTime*/ ctx[4](/*dollar*/ ctx[7].time) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(72:2) {#each $DollarStore.logs as dollar (dollar.id)}",
    		ctx
    	});

    	return block;
    }

    // (47:0) <Card>
    function create_default_slot$1(ctx) {
    	let form;
    	let div0;
    	let p0;
    	let t1;
    	let input;
    	let t2;
    	let button;
    	let t3;
    	let hr0;
    	let t4;
    	let div1;
    	let p1;
    	let t5;
    	let t6_value = /*$DollarStore*/ ctx[1].current_price + "";
    	let t6;
    	let t7;
    	let p2;
    	let t8_value = /*convertTimestampToDate*/ ctx[3](/*$DollarStore*/ ctx[1].current_time) + "";
    	let t8;
    	let t9;
    	let t10_value = /*convertTimestampToTime*/ ctx[4](/*$DollarStore*/ ctx[1].current_time) + "";
    	let t10;
    	let t11;
    	let hr1;
    	let t12;
    	let p3;
    	let t14;
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

    	let each_value = /*$DollarStore*/ ctx[1].logs;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dollar*/ ctx[7].id;
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
    			p0.textContent = "Enter $";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			create_component(button.$$.fragment);
    			t3 = space();
    			hr0 = element("hr");
    			t4 = space();
    			div1 = element("div");
    			p1 = element("p");
    			t5 = text("Current Price:\n      ");
    			t6 = text(t6_value);
    			t7 = space();
    			p2 = element("p");
    			t8 = text(t8_value);
    			t9 = text(" -\n      ");
    			t10 = text(t10_value);
    			t11 = space();
    			hr1 = element("hr");
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "Logs:";
    			t14 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(p0, "class", "svelte-1e4gchx");
    			add_location(p0, file$2, 49, 6, 1236);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "50");
    			attr_dev(input, "class", "svelte-1e4gchx");
    			add_location(input, file$2, 50, 6, 1257);
    			set_style(div0, "display", "flex");
    			attr_dev(div0, "class", "svelte-1e4gchx");
    			add_location(div0, file$2, 48, 4, 1201);
    			attr_dev(form, "class", "svelte-1e4gchx");
    			add_location(form, file$2, 47, 2, 1137);
    			attr_dev(hr0, "class", "solid svelte-1e4gchx");
    			add_location(hr0, file$2, 55, 2, 1389);
    			attr_dev(p1, "class", "svelte-1e4gchx");
    			add_location(p1, file$2, 58, 4, 1476);
    			attr_dev(p2, "class", "svelte-1e4gchx");
    			add_location(p2, file$2, 62, 4, 1549);
    			set_style(div1, "display", "flex");
    			set_style(div1, "justify-content", "space-between");
    			attr_dev(div1, "class", "svelte-1e4gchx");
    			add_location(div1, file$2, 57, 2, 1411);
    			attr_dev(hr1, "class", "solid svelte-1e4gchx");
    			add_location(hr1, file$2, 68, 2, 1692);
    			attr_dev(p3, "class", "svelte-1e4gchx");
    			add_location(p3, file$2, 70, 2, 1714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			set_input_value(input, /*manual_rate*/ ctx[0]);
    			append_dev(div0, t2);
    			mount_component(button, div0, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(p2, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t14, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*handleSubmit*/ ctx[2](/*manual_rate*/ ctx[0]))) /*handleSubmit*/ ctx[2](/*manual_rate*/ ctx[0]).apply(this, arguments);
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

    			if (dirty & /*manual_rate*/ 1 && to_number(input.value) !== /*manual_rate*/ ctx[0]) {
    				set_input_value(input, /*manual_rate*/ ctx[0]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			if ((!current || dirty & /*$DollarStore*/ 2) && t6_value !== (t6_value = /*$DollarStore*/ ctx[1].current_price + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*$DollarStore*/ 2) && t8_value !== (t8_value = /*convertTimestampToDate*/ ctx[3](/*$DollarStore*/ ctx[1].current_time) + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*$DollarStore*/ 2) && t10_value !== (t10_value = /*convertTimestampToTime*/ ctx[4](/*$DollarStore*/ ctx[1].current_time) + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*convertTimestampToTime, $DollarStore, convertTimestampToDate*/ 26) {
    				each_value = /*$DollarStore*/ ctx[1].logs;
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
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t14);

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
    		source: "(47:0) <Card>",
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

    			if (dirty & /*$$scope, $DollarStore, manual_rate*/ 1027) {
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
    	component_subscribe($$self, DollarStore, $$value => $$invalidate(1, $DollarStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DollarPanel', slots, []);
    	let manual_rate = "";

    	const handleChange = symbol => {
    		console.log(symbol);
    	};

    	const handleSubmit = new_price => {
    		console.log(new_price);

    		DollarStore.update(currentState => {
    			let new_log = {
    				id: v4(),
    				price: +currentState.current_price,
    				time: currentState.current_time
    			};

    			let new_logs = [new_log, ...currentState.logs];

    			let new_state = {
    				current_price: new_price,
    				current_time: Math.floor(Date.now() / 1000),
    				logs: new_logs
    			};

    			return new_state;
    		});
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<DollarPanel> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		manual_rate = to_number(this.value);
    		$$invalidate(0, manual_rate);
    	}

    	$$self.$capture_state = () => ({
    		uuidv4: v4,
    		DollarStore,
    		Button,
    		Card,
    		manual_rate,
    		handleChange,
    		handleSubmit,
    		convertTimestampToDate,
    		convertTimestampToTime,
    		$DollarStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('manual_rate' in $$props) $$invalidate(0, manual_rate = $$props.manual_rate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		manual_rate,
    		$DollarStore,
    		handleSubmit,
    		convertTimestampToDate,
    		convertTimestampToTime,
    		input_input_handler
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

    const { console: console_1 } = globals;
    const file$1 = "src/components/SymbolList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (51:8) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t_value = /*symbol*/ ctx[8].symbol.rate + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-2owd60");
    			add_location(p, file$1, 51, 10, 1373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CurrencyStore*/ 1 && t_value !== (t_value = /*symbol*/ ctx[8].symbol.rate + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(51:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#if symbol.has_manual_rate}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function chage_handler() {
    		return /*chage_handler*/ ctx[3](/*symbol*/ ctx[8]);
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[4].call(input, /*each_value*/ ctx[9], /*symbol_index*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "0.001");
    			attr_dev(input, "class", "svelte-2owd60");
    			add_location(input, file$1, 43, 10, 1162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*symbol*/ ctx[8].manual_rate);

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

    			if (dirty & /*$CurrencyStore*/ 1 && to_number(input.value) !== /*symbol*/ ctx[8].manual_rate) {
    				set_input_value(input, /*symbol*/ ctx[8].manual_rate);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(43:8) {#if symbol.has_manual_rate}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#each $CurrencyStore as symbol (symbol.id)}
    function create_each_block(key_1, ctx) {
    	let div0;
    	let p0;
    	let t0_value = /*symbol*/ ctx[8].id + "";
    	let t0;
    	let t1;
    	let div1;
    	let input0;
    	let t2;
    	let div2;
    	let p1;
    	let t3_value = /*symbol*/ ctx[8].symbol.name + "";
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
    		/*input0_change_handler*/ ctx[2].call(input0, /*each_value*/ ctx[9], /*symbol_index*/ ctx[10]);
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*symbol*/ ctx[8].has_manual_rate) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function change_handler() {
    		return /*change_handler*/ ctx[5](/*symbol*/ ctx[8]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[6].call(input1, /*each_value*/ ctx[9], /*symbol_index*/ ctx[10]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
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
    			attr_dev(p0, "class", "svelte-2owd60");
    			add_location(p0, file$1, 28, 8, 815);
    			attr_dev(div0, "class", "table-cell svelte-2owd60");
    			add_location(div0, file$1, 27, 6, 782);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-2owd60");
    			add_location(input0, file$1, 34, 8, 907);
    			attr_dev(div1, "class", "table-cell svelte-2owd60");
    			add_location(div1, file$1, 33, 6, 874);
    			attr_dev(p1, "class", "svelte-2owd60");
    			add_location(p1, file$1, 37, 8, 1023);
    			attr_dev(div2, "class", "table-cell svelte-2owd60");
    			add_location(div2, file$1, 36, 6, 990);
    			attr_dev(div3, "class", "table-cell svelte-2owd60");
    			add_location(div3, file$1, 41, 6, 1090);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "50");
    			attr_dev(input1, "class", "svelte-2owd60");
    			add_location(input1, file$1, 57, 8, 1491);
    			attr_dev(div4, "class", "table-cell svelte-2owd60");
    			add_location(div4, file$1, 56, 6, 1458);
    			this.first = div0;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input0);
    			input0.checked = /*symbol*/ ctx[8].has_manual_rate;
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
    			set_input_value(input1, /*symbol*/ ctx[8].addition);
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
    			if (dirty & /*$CurrencyStore*/ 1 && t0_value !== (t0_value = /*symbol*/ ctx[8].id + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$CurrencyStore*/ 1) {
    				input0.checked = /*symbol*/ ctx[8].has_manual_rate;
    			}

    			if (dirty & /*$CurrencyStore*/ 1 && t3_value !== (t3_value = /*symbol*/ ctx[8].symbol.name + "")) set_data_dev(t3, t3_value);

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

    			if (dirty & /*$CurrencyStore*/ 1 && to_number(input1.value) !== /*symbol*/ ctx[8].addition) {
    				set_input_value(input1, /*symbol*/ ctx[8].addition);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:4) {#each $CurrencyStore as symbol (symbol.id)}",
    		ctx
    	});

    	return block;
    }

    // (15:0) <Card>
    function create_default_slot(ctx) {
    	let div5;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$CurrencyStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*symbol*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = "Row";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Manual";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Currency";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Rate";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "Adjust";
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "table-cell heading-title svelte-2owd60");
    			add_location(div0, file$1, 21, 4, 459);
    			attr_dev(div1, "class", "table-cell heading-title svelte-2owd60");
    			add_location(div1, file$1, 22, 4, 511);
    			attr_dev(div2, "class", "table-cell heading-title svelte-2owd60");
    			add_location(div2, file$1, 23, 4, 566);
    			attr_dev(div3, "class", "table-cell heading-title svelte-2owd60");
    			add_location(div3, file$1, 24, 4, 623);
    			attr_dev(div4, "class", "table-cell heading-title svelte-2owd60");
    			add_location(div4, file$1, 25, 4, 676);
    			set_style(div5, "display", "grid");
    			set_style(div5, "grid-template-columns", "repeat(5, auto)");
    			set_style(div5, "max-width", "480px");
    			attr_dev(div5, "class", "svelte-2owd60");
    			add_location(div5, file$1, 15, 2, 335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div5, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$CurrencyStore, handleChange*/ 3) {
    				each_value = /*$CurrencyStore*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div5, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:0) <Card>",
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

    			if (dirty & /*$$scope, $CurrencyStore*/ 2049) {
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
    	component_subscribe($$self, CurrencyStore, $$value => $$invalidate(0, $CurrencyStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SymbolList', slots, []);

    	const handleInput = symbol => {
    		console.log(symbol);
    	};

    	const handleChange = symbol => {
    		console.log(symbol);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<SymbolList> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler(each_value, symbol_index) {
    		each_value[symbol_index].has_manual_rate = this.checked;
    		CurrencyStore.set($CurrencyStore);
    	}

    	const chage_handler = symbol => handleChange(symbol);

    	function input_input_handler(each_value, symbol_index) {
    		each_value[symbol_index].manual_rate = to_number(this.value);
    		CurrencyStore.set($CurrencyStore);
    	}

    	const change_handler = symbol => handleChange(symbol);

    	function input1_input_handler(each_value, symbol_index) {
    		each_value[symbol_index].addition = to_number(this.value);
    		CurrencyStore.set($CurrencyStore);
    	}

    	$$self.$capture_state = () => ({
    		CurrencyStore,
    		fade,
    		scale,
    		Card,
    		Button,
    		handleInput,
    		handleChange,
    		$CurrencyStore
    	});

    	return [
    		$CurrencyStore,
    		handleChange,
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
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let botpanel;
    	let t0;
    	let dollarpanel;
    	let t1;
    	let symbollist;
    	let current;
    	botpanel = new BotPanel({ $$inline: true });
    	dollarpanel = new DollarPanel({ $$inline: true });
    	symbollist = new SymbolList({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(botpanel.$$.fragment);
    			t0 = space();
    			create_component(dollarpanel.$$.fragment);
    			t1 = space();
    			create_component(symbollist.$$.fragment);
    			attr_dev(main, "class", "container");
    			add_location(main, file, 8, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(botpanel, main, null);
    			append_dev(main, t0);
    			mount_component(dollarpanel, main, null);
    			append_dev(main, t1);
    			mount_component(symbollist, main, null);
    			current = true;
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ BotPanel, DollarPanel, SymbolList });
    	return [];
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
