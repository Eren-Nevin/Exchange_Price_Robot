var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function r(e){e.forEach(t)}function s(e){return"function"==typeof e}function l(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function c(t,n,r){t.$$.on_destroy.push(function(t,...n){if(null==t)return e;const r=t.subscribe(...n);return r.unsubscribe?()=>r.unsubscribe():r}(n,r))}function a(e,t,n,r){if(e){const s=i(e,t,n,r);return e[0](s)}}function i(e,t,n,r){return e[1]&&r?function(e,t){for(const n in t)e[n]=t[n];return e}(n.ctx.slice(),e[1](r(t))):n.ctx}function o(e,t,n,r){if(e[2]&&r){const s=e[2](r(n));if(void 0===t.dirty)return s;if("object"==typeof s){const e=[],n=Math.max(t.dirty.length,s.length);for(let r=0;r<n;r+=1)e[r]=t.dirty[r]|s[r];return e}return t.dirty|s}return t.dirty}function u(e,t,n,r,s,l){if(s){const c=i(t,n,r,l);e.p(c,s)}}function d(e){if(e.ctx.length>32){const t=[],n=e.ctx.length/32;for(let e=0;e<n;e++)t[e]=-1;return t}return-1}function p(e){return null==e?"":e}function f(e,t){e.appendChild(t)}function m(e,t,n){e.insertBefore(t,n||null)}function v(e){e.parentNode.removeChild(e)}function h(e){return document.createElement(e)}function y(e){return document.createTextNode(e)}function g(){return y(" ")}function _(){return y("")}function b(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function $(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function w(e){return""===e?null:+e}function x(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function C(e,t){e.value=null==t?"":t}function k(e,t,n,r){e.style.setProperty(t,n,r?"important":"")}function j(e,t){for(let n=0;n<e.options.length;n+=1){const r=e.options[n];if(r.__value===t)return void(r.selected=!0)}e.selectedIndex=-1}function S(e){const t=e.querySelector(":checked")||e.options[0];return t&&t.__value}let E;function T(e){E=e}function D(e){(function(){if(!E)throw new Error("Function called outside component initialization");return E})().$$.on_mount.push(e)}const M=[],N=[],A=[],O=[],U=Promise.resolve();let I=!1;function L(e){A.push(e)}let R=!1;const P=new Set;function J(){if(!R){R=!0;do{for(let e=0;e<M.length;e+=1){const t=M[e];T(t),z(t.$$)}for(T(null),M.length=0;N.length;)N.pop()();for(let e=0;e<A.length;e+=1){const t=A[e];P.has(t)||(P.add(t),t())}A.length=0}while(M.length);for(;O.length;)O.pop()();I=!1,R=!1,P.clear()}}function z(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(L)}}const H=new Set;function V(e,t){e&&e.i&&(H.delete(e),e.i(t))}function q(e,t,n,r){if(e&&e.o){if(H.has(e))return;H.add(e),undefined.c.push((()=>{H.delete(e),r&&(n&&e.d(1),r())})),e.o(t)}}function B(e,t){e.d(1),t.delete(e.key)}function F(e,t,n,r,s,l,c,a,i,o,u,d){let p=e.length,f=l.length,m=p;const v={};for(;m--;)v[e[m].key]=m;const h=[],y=new Map,g=new Map;for(m=f;m--;){const e=d(s,l,m),a=n(e);let i=c.get(a);i?r&&i.p(e,t):(i=o(a,e),i.c()),y.set(a,h[m]=i),a in v&&g.set(a,Math.abs(m-v[a]))}const _=new Set,b=new Set;function $(e){V(e,1),e.m(a,u),c.set(e.key,e),u=e.first,f--}for(;p&&f;){const t=h[f-1],n=e[p-1],r=t.key,s=n.key;t===n?(u=t.first,p--,f--):y.has(s)?!c.has(r)||_.has(r)?$(t):b.has(s)?p--:g.get(r)>g.get(s)?(b.add(r),$(t)):(_.add(s),p--):(i(n,c),p--)}for(;p--;){const t=e[p];y.has(t.key)||i(t,c)}for(;f;)$(h[f-1]);return h}function G(e){e&&e.c()}function K(e,n,l,c){const{fragment:a,on_mount:i,on_destroy:o,after_update:u}=e.$$;a&&a.m(n,l),c||L((()=>{const n=i.map(t).filter(s);o?o.push(...n):r(n),e.$$.on_mount=[]})),u.forEach(L)}function Q(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function W(e,t){-1===e.$$.dirty[0]&&(M.push(e),I||(I=!0,U.then(J)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function X(t,s,l,c,a,i,o,u=[-1]){const d=E;T(t);const p=t.$$={fragment:null,ctx:null,props:i,update:e,not_equal:a,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(s.context||(d?d.$$.context:[])),callbacks:n(),dirty:u,skip_bound:!1,root:s.target||d.$$.root};o&&o(p.root);let f=!1;if(p.ctx=l?l(t,s.props||{},((e,n,...r)=>{const s=r.length?r[0]:n;return p.ctx&&a(p.ctx[e],p.ctx[e]=s)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](s),f&&W(t,e)),n})):[],p.update(),f=!0,r(p.before_update),p.fragment=!!c&&c(p.ctx),s.target){if(s.hydrate){const e=function(e){return Array.from(e.childNodes)}(s.target);p.fragment&&p.fragment.l(e),e.forEach(v)}else p.fragment&&p.fragment.c();s.intro&&V(t.$$.fragment),K(t,s.target,s.anchor,s.customElement),J()}T(d)}class Y{$destroy(){Q(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function Z(e){let t,n;const r=e[1].default,s=a(r,e,e[0],null);return{c(){t=h("div"),s&&s.c(),$(t,"class","card svelte-1mj4ff7")},m(e,r){m(e,t,r),s&&s.m(t,null),n=!0},p(e,[t]){s&&s.p&&(!n||1&t)&&u(s,r,e,e[0],n?o(r,e[0],t,null):d(e[0]),null)},i(e){n||(V(s,e),n=!0)},o(e){q(s,e),n=!1},d(e){e&&v(t),s&&s.d(e)}}}function ee(e,t,n){let{$$slots:r={},$$scope:s}=t;return e.$$set=e=>{"$$scope"in e&&n(0,s=e.$$scope)},[s,r]}class te extends Y{constructor(e){super(),X(this,e,ee,Z,l,{})}}const ne=[];function re(t,n=e){let r;const s=new Set;function c(e){if(l(t,e)&&(t=e,r)){const e=!ne.length;for(const e of s)e[1](),ne.push(e,t);if(e){for(let e=0;e<ne.length;e+=2)ne[e][0](ne[e+1]);ne.length=0}}}return{set:c,update:function(e){c(e(t))},subscribe:function(l,a=e){const i=[l,a];return s.add(i),1===s.size&&(r=n(c)||e),l(t),()=>{s.delete(i),0===s.size&&(r(),r=null)}}}}let se;const le=new Uint8Array(16);function ce(){if(!se&&(se="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!se))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return se(le)}const ae=[];for(let e=0;e<256;++e)ae.push((e+256).toString(16).slice(1));var ie={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};function oe(e,t,n){if(ie.randomUUID&&!t&&!e)return ie.randomUUID();const r=(e=e||{}).random||(e.rng||ce)();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,t){n=n||0;for(let e=0;e<16;++e)t[n+e]=r[e];return t}return function(e,t=0){return(ae[e[t+0]]+ae[e[t+1]]+ae[e[t+2]]+ae[e[t+3]]+"-"+ae[e[t+4]]+ae[e[t+5]]+"-"+ae[e[t+6]]+ae[e[t+7]]+"-"+ae[e[t+8]]+ae[e[t+9]]+"-"+ae[e[t+10]]+ae[e[t+11]]+ae[e[t+12]]+ae[e[t+13]]+ae[e[t+14]]+ae[e[t+15]]).toLowerCase()}(r)}class ue{dollar_model;currency_model;bot_model;constructor(e,t,n){this.dollar_model=e,this.currency_model=t,this.bot_model=n}}class de{uid;currencyCode;alias_name;rate;has_manual_rate;manual_rate;adjustment;constructor(e,t,n,r,s,l){this.uid=oe(),this.currencyCode=e,this.alias_name=t,this.rate=n,this.has_manual_rate=r,this.manual_rate=s,this.adjustment=l}}class pe{selected_currencies;currency_rates;constructor(e=[],t=[]){this.selected_currencies=e,this.currency_rates=t}}class fe{price;timestamp;constructor(e,t){this.uid=oe(),this.price=e,this.timestamp=t}}class me{current_price;historic_prices;constructor(e=new fe(4e4,1679647122),t=[]){this.current_price=e,this.historic_prices=t}}class ve{unit;value;constructor(e,t){this.unit=e,this.value=t}}class he{disabled;onTime;onChange;interval;constructor(e=!1,t=!1,n=!0,r=new ve("Min",2)){this.disabled=e,this.onTime=t,this.onChange=n,this.interval=r}}const ye=re(new pe),ge=re(new me),_e=re(new he);let be,$e,we,xe=new ue(null,null,null);async function Ce(){console.log("Getting app state from server");let e=await async function(){let e=await fetch("http://localhost:7777/api/get_state");return e.ok||(console.log(e.statusText),console.log(e.status)),await e.json()}(),t=function(e){let t=[];for(let n of e.historic_prices)t=[new fe(n.price,n.timestamp),...t];return t.sort(((e,t)=>t.timestamp-e.timestamp)),new me(new fe(e.current_price.price,e.current_price.timestamp),t)}(e.dollar_model),n=function(e){let t=new ve(e.interval.unit,e.interval.value);return new he(e.disabled,e.onTime,e.onChange,t)}(e.bot_model),r=function(e){let t=[];for(let n of e.currency_rates)t=[new de(n.currencyCode,n.alias_name,n.rate,n.has_manual_rate,n.manual_rate,n.adjustment),...t];return t=[...t.sort(((e,t)=>e.currencyCode.localeCompare(t.currencyCode)))],new pe(e.selected_currencies,t)}(e.currency_model),s=new ue(t,r,n);return console.log(s),s}async function ke(){console.log("Reloading rates from server");let e=(await Ce()).currency_model.currency_rates;ye.update((t=>{let n=JSON.parse(JSON.stringify(t));for(let r of t.currency_rates)if(e.map((e=>e.currencyCode)).includes(r.currencyCode)){let t=e.filter((e=>e.currencyCode==r.currencyCode))[0];n.currency_rates.find((e=>e.currencyCode==t.currencyCode)).rate=t.rate}return n}))}async function je(){console.log("Sending state to server");let e=JSON.stringify(xe);await fetch("http://localhost:7777/api/send_state",{method:"POST",headers:{"Content-Type":"application/json"},body:e})}function Se(e){let t,n,s,l,c,a,i,o,u,d,p,y,w,x,C,k,j=e[0].onTime&&Ee(e);return{c(){t=h("ul"),n=h("li"),s=h("input"),c=g(),a=h("label"),a.textContent="Send On Time",i=g(),o=h("li"),u=h("input"),p=g(),y=h("label"),y.textContent="Send On Change",w=g(),j&&j.c(),x=_(),$(s,"type","radio"),$(s,"id","by-time"),$(s,"name","by-time"),s.value="1",s.checked=l=e[0].onTime,$(s,"class","svelte-9hueie"),$(a,"for","num1"),$(a,"class","svelte-9hueie"),$(n,"class","svelte-9hueie"),$(u,"type","radio"),$(u,"id","by-change"),$(u,"name","by-change"),u.value="2",u.checked=d=e[0].onChange,$(u,"class","svelte-9hueie"),$(y,"for","num2"),$(y,"class","svelte-9hueie"),$(o,"class","svelte-9hueie"),$(t,"class","rating svelte-9hueie")},m(r,l){m(r,t,l),f(t,n),f(n,s),f(n,c),f(n,a),f(t,i),f(t,o),f(o,u),f(o,p),f(o,y),m(r,w,l),j&&j.m(r,l),m(r,x,l),C||(k=[b(s,"change",e[1]),b(u,"change",e[1])],C=!0)},p(e,t){1&t&&l!==(l=e[0].onTime)&&(s.checked=l),1&t&&d!==(d=e[0].onChange)&&(u.checked=d),e[0].onTime?j?j.p(e,t):(j=Ee(e),j.c(),j.m(x.parentNode,x)):j&&(j.d(1),j=null)},d(e){e&&v(t),e&&v(w),j&&j.d(e),e&&v(x),C=!1,r(k)}}}function Ee(e){let t,n,s,l,c,a,i,o,u,d,p;return{c(){t=h("div"),n=h("p"),n.textContent="Every",s=g(),l=h("input"),c=g(),a=h("select"),i=h("option"),i.textContent="Minutes",o=h("option"),o.textContent="Hours",u=h("option"),u.textContent="Days",$(n,"class","svelte-9hueie"),$(l,"type","number"),$(l,"min","0"),$(l,"step","1"),$(l,"class","svelte-9hueie"),i.__value="Min",i.value=i.__value,$(i,"class","svelte-9hueie"),o.__value="Hour",o.value=o.__value,$(o,"class","svelte-9hueie"),u.__value="Day",u.value=u.__value,$(u,"class","svelte-9hueie"),$(a,"name","interval-unit"),$(a,"id","interval-unit"),$(a,"class","svelte-9hueie"),void 0===e[0].interval.unit&&L((()=>e[5].call(a))),k(t,"display","flex"),$(t,"class","svelte-9hueie")},m(r,v){m(r,t,v),f(t,n),f(t,s),f(t,l),C(l,e[0].interval.value),f(t,c),f(t,a),f(a,i),f(a,o),f(a,u),j(a,e[0].interval.unit),d||(p=[b(l,"change",e[2]),b(l,"input",e[4]),b(a,"change",e[5]),b(a,"change",e[2])],d=!0)},p(e,t){1&t&&w(l.value)!==e[0].interval.value&&C(l,e[0].interval.value),1&t&&j(a,e[0].interval.unit)},d(e){e&&v(t),d=!1,r(p)}}}function Te(e){let t,n,r,s,l,c,a,i,o,u,d,p,_=e[0].disabled?"Disabled":"Running",w=e[0].disabled?"Enable":"Disable",C=!e[0].disabled&&Se(e);return{c(){t=h("div"),n=h("p"),n.textContent="Status:",r=g(),s=h("p"),l=y(_),c=g(),C&&C.c(),a=g(),i=h("div"),o=h("button"),u=y(w),$(n,"class","svelte-9hueie"),$(s,"class","svelte-9hueie"),k(t,"display","flex"),$(t,"class","svelte-9hueie"),$(o,"class","svelte-9hueie"),k(i,"display","flex"),$(i,"class","svelte-9hueie")},m(v,h){m(v,t,h),f(t,n),f(t,r),f(t,s),f(s,l),m(v,c,h),C&&C.m(v,h),m(v,a,h),m(v,i,h),f(i,o),f(o,u),d||(p=b(o,"click",e[3]),d=!0)},p(e,t){1&t&&_!==(_=e[0].disabled?"Disabled":"Running")&&x(l,_),e[0].disabled?C&&(C.d(1),C=null):C?C.p(e,t):(C=Se(e),C.c(),C.m(a.parentNode,a)),1&t&&w!==(w=e[0].disabled?"Enable":"Disable")&&x(u,w)},d(e){e&&v(t),e&&v(c),C&&C.d(e),e&&v(a),e&&v(i),d=!1,p()}}}function De(e){let t,n;return t=new te({props:{$$slots:{default:[Te]},$$scope:{ctx:e}}}),{c(){G(t.$$.fragment)},m(e,r){K(t,e,r),n=!0},p(e,[n]){const r={};65&n&&(r.$$scope={dirty:n,ctx:e}),t.$set(r)},i(e){n||(V(t.$$.fragment,e),n=!0)},o(e){q(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function Me(e,t,n){let r;c(e,_e,(e=>n(0,r=e)));return D((async()=>{console.log("MOUNTED BOT PANEL"),console.log(r.onTime),console.log(r.onChange)})),[r,async e=>{let t=+e.currentTarget.value;_e.update((e=>{let n=JSON.parse(JSON.stringify(e));return 1===t?(n.onTime=!0,n.onChange=!1):(n.onTime=!1,n.onChange=!0),n})),await je()},async()=>{await je()},async()=>{var e,t;e=_e,r.disabled=!r.disabled,t=r,e.set(t),await je()},function(){r.interval.value=w(this.value),_e.set(r)},function(){r.interval.unit=S(this),_e.set(r)}]}class Ne extends Y{constructor(e){super(),X(this,e,Me,De,l,{})}}function Ae(e){let t,n,r;const s=e[4].default,l=a(s,e,e[3],null);return{c(){t=h("button"),l&&l.c(),$(t,"type",e[1]),t.disabled=e[2],$(t,"class",n=p(e[0])+" svelte-1g7fhy3")},m(e,n){m(e,t,n),l&&l.m(t,null),r=!0},p(e,[c]){l&&l.p&&(!r||8&c)&&u(l,s,e,e[3],r?o(s,e[3],c,null):d(e[3]),null),(!r||2&c)&&$(t,"type",e[1]),(!r||4&c)&&(t.disabled=e[2]),(!r||1&c&&n!==(n=p(e[0])+" svelte-1g7fhy3"))&&$(t,"class",n)},i(e){r||(V(l,e),r=!0)},o(e){q(l,e),r=!1},d(e){e&&v(t),l&&l.d(e)}}}function Oe(e,t,n){let{$$slots:r={},$$scope:s}=t,{style:l="primary"}=t,{type:c="button"}=t,{disabled:a=!1}=t;return e.$$set=e=>{"style"in e&&n(0,l=e.style),"type"in e&&n(1,c=e.type),"disabled"in e&&n(2,a=e.disabled),"$$scope"in e&&n(3,s=e.$$scope)},[l,c,a,s,r]}class Ue extends Y{constructor(e){super(),X(this,e,Oe,Ae,l,{style:0,type:1,disabled:2})}}function Ie(e,t,n){const r=e.slice();return r[8]=t[n],r}function Le(e){let t;return{c(){t=y("Add")},m(e,n){m(e,t,n)},d(e){e&&v(t)}}}function Re(e,t){let n,r,s,l,c,a,i,o,u,d=t[8].price+"",p=t[4](t[8].timestamp)+"",_=t[5](t[8].timestamp)+"";return{key:e,first:null,c(){n=h("div"),r=h("p"),s=y(d),l=g(),c=h("p"),a=y(p),i=y(" -\n        "),o=y(_),u=g(),$(r,"class","svelte-15yrd8l"),$(c,"class","svelte-15yrd8l"),k(n,"display","flex"),k(n,"justify-content","space-between"),$(n,"class","svelte-15yrd8l"),this.first=n},m(e,t){m(e,n,t),f(n,r),f(r,s),f(n,l),f(n,c),f(c,a),f(c,i),f(c,o),f(n,u)},p(e,n){t=e,4&n&&d!==(d=t[8].price+"")&&x(s,d),4&n&&p!==(p=t[4](t[8].timestamp)+"")&&x(a,p),4&n&&_!==(_=t[5](t[8].timestamp)+"")&&x(o,_)},d(e){e&&v(n)}}}function Pe(e){let t,n,l,c,a,i,o,u,d,p,j,S,E,T,D,M,N,A,O,U,I,L,R,P,J,z,H,W,X,Y,Z,ee,te=e[2].current_price.price+"",ne=e[4](e[2].current_price.timestamp)+"",re=e[5](e[2].current_price.timestamp)+"",se=[],le=new Map;j=new Ue({props:{type:"submit",$$slots:{default:[Le]},$$scope:{ctx:e}}});let ce=e[2].historic_prices;const ae=e=>e[8].uid;for(let t=0;t<ce.length;t+=1){let n=Ie(e,ce,t),r=ae(n);le.set(r,se[t]=Re(r,n))}return{c(){t=h("form"),n=h("div"),l=h("p"),l.textContent="Enter",c=g(),a=h("input"),i=g(),o=h("p"),o.textContent="$",u=g(),d=h("input"),p=g(),G(j.$$.fragment),S=g(),E=h("hr"),T=g(),D=h("div"),M=h("p"),N=y("Current Price:\n      "),A=y(te),O=g(),U=h("p"),I=y(ne),L=y(" -\n      "),R=y(re),P=g(),J=h("hr"),z=g(),H=h("p"),H.textContent="Logs:",W=g();for(let e=0;e<se.length;e+=1)se[e].c();X=_(),$(l,"class","svelte-15yrd8l"),$(a,"type","number"),$(a,"min","0"),$(a,"class","svelte-15yrd8l"),$(o,"class","svelte-15yrd8l"),$(d,"type","datetime-local"),$(d,"class","svelte-15yrd8l"),k(n,"display","flex"),$(n,"class","svelte-15yrd8l"),$(t,"class","svelte-15yrd8l"),$(E,"class","solid svelte-15yrd8l"),$(M,"class","svelte-15yrd8l"),$(U,"class","svelte-15yrd8l"),k(D,"display","flex"),k(D,"justify-content","space-between"),$(D,"class","svelte-15yrd8l"),$(J,"class","solid svelte-15yrd8l"),$(H,"class","svelte-15yrd8l")},m(r,v){m(r,t,v),f(t,n),f(n,l),f(n,c),f(n,a),C(a,e[0]),f(n,i),f(n,o),f(n,u),f(n,d),C(d,e[1]),f(n,p),K(j,n,null),m(r,S,v),m(r,E,v),m(r,T,v),m(r,D,v),f(D,M),f(M,N),f(M,A),f(D,O),f(D,U),f(U,I),f(U,L),f(U,R),m(r,P,v),m(r,J,v),m(r,z,v),m(r,H,v),m(r,W,v);for(let e=0;e<se.length;e+=1)se[e].m(r,v);var h;m(r,X,v),Y=!0,Z||(ee=[b(a,"input",e[6]),b(d,"input",e[7]),b(t,"submit",(h=function(){s(e[3](e[0]))&&e[3](e[0]).apply(this,arguments)},function(e){return e.preventDefault(),h.call(this,e)}))],Z=!0)},p(t,n){e=t,1&n&&w(a.value)!==e[0]&&C(a,e[0]),2&n&&C(d,e[1]);const r={};2048&n&&(r.$$scope={dirty:n,ctx:e}),j.$set(r),(!Y||4&n)&&te!==(te=e[2].current_price.price+"")&&x(A,te),(!Y||4&n)&&ne!==(ne=e[4](e[2].current_price.timestamp)+"")&&x(I,ne),(!Y||4&n)&&re!==(re=e[5](e[2].current_price.timestamp)+"")&&x(R,re),52&n&&(ce=e[2].historic_prices,se=F(se,n,ae,1,e,ce,le,X.parentNode,B,Re,X,Ie))},i(e){Y||(V(j.$$.fragment,e),Y=!0)},o(e){q(j.$$.fragment,e),Y=!1},d(e){e&&v(t),Q(j),e&&v(S),e&&v(E),e&&v(T),e&&v(D),e&&v(P),e&&v(J),e&&v(z),e&&v(H),e&&v(W);for(let t=0;t<se.length;t+=1)se[t].d(e);e&&v(X),Z=!1,r(ee)}}}function Je(e){let t,n;return t=new te({props:{$$slots:{default:[Pe]},$$scope:{ctx:e}}}),{c(){G(t.$$.fragment)},m(e,r){K(t,e,r),n=!0},p(e,[n]){const r={};2055&n&&(r.$$scope={dirty:n,ctx:e}),t.$set(r)},i(e){n||(V(t.$$.fragment,e),n=!0)},o(e){q(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function ze(e,t,n){let r;c(e,ge,(e=>n(2,r=e)));let s,l="";return[l,s,r,async e=>{console.log(e),ge.update((t=>{let n=[new fe(+t.current_price.price,t.current_price.timestamp),...t.historic_prices];return console.log(s),{current_price:new fe(e,s instanceof String?Math.floor(Date.parse(s)/1e3):Math.floor(new Date/1e3)),historic_prices:n}})),await je()},e=>new Date(1e3*e).toLocaleDateString(),e=>new Date(1e3*e).toLocaleTimeString(),function(){l=w(this.value),n(0,l)},function(){s=this.value,n(1,s)}]}class He extends Y{constructor(e){super(),X(this,e,ze,Je,l,{})}}function Ve(e,t,n){const r=e.slice();return r[25]=t[n],r[26]=t,r[27]=n,r}function qe(e,t,n){const r=e.slice();return r[25]=t[n],r[27]=n,r}function Be(t){let n,r,s;return{c(){n=h("button"),n.textContent="Delete",$(n,"class","svelte-1kvb8vw")},m(e,l){m(e,n,l),r||(s=b(n,"click",t[15]),r=!0)},p:e,d(e){e&&v(n),r=!1,s()}}}function Fe(e){let t,n,r,s=e[25].currencyCode+"";return{c(){t=h("option"),n=y(s),t.__value=r=e[25].currencyCode,t.value=t.__value,$(t,"class","svelte-1kvb8vw")},m(e,r){m(e,t,r),f(t,n)},p(e,l){16&l&&s!==(s=e[25].currencyCode+"")&&x(n,s),16&l&&r!==(r=e[25].currencyCode)&&(t.__value=r,t.value=t.__value)},d(e){e&&v(t)}}}function Ge(e,t){let n,r,s=!t[4].selected_currencies.includes(t[25].name),l=s&&Fe(t);return{key:e,first:null,c(){n=_(),l&&l.c(),r=_(),this.first=n},m(e,t){m(e,n,t),l&&l.m(e,t),m(e,r,t)},p(e,n){t=e,16&n&&(s=!t[4].selected_currencies.includes(t[25].name)),s?l?l.p(t,n):(l=Fe(t),l.c(),l.m(r.parentNode,r)):l&&(l.d(1),l=null)},d(e){e&&v(n),l&&l.d(e),e&&v(r)}}}function Ke(e){let t,n,r=e[25].rate+"";return{c(){t=h("p"),n=y(r),$(t,"class","svelte-1kvb8vw")},m(e,r){m(e,t,r),f(t,n)},p(e,t){1&t&&r!==(r=e[25].rate+"")&&x(n,r)},d(e){e&&v(t)}}}function Qe(e){let t,n,s;function l(){e[19].call(t,e[26],e[27])}return{c(){t=h("input"),$(t,"type","number"),$(t,"min","0"),$(t,"step","0.0001"),$(t,"class","svelte-1kvb8vw")},m(r,c){m(r,t,c),C(t,e[25].manual_rate),n||(s=[b(t,"change",e[8]),b(t,"input",l)],n=!0)},p(n,r){e=n,1&r&&w(t.value)!==e[25].manual_rate&&C(t,e[25].manual_rate)},d(e){e&&v(t),n=!1,r(s)}}}function We(e,t){let n,s,l,c,a,i,o,u,d,p,_,k,j,S,E,T,D,M,N,A,O,U,I=t[27]+1+"",L=t[25].currencyCode+"",R=t[25].alias_name+"";function P(){t[18].call(i,t[26],t[27])}function J(e,t){return e[25].has_manual_rate?Qe:Ke}let z=J(t),H=z(t);function V(){t[20].call(N,t[26],t[27])}return{key:e,first:null,c(){n=h("div"),s=h("p"),l=y(I),c=g(),a=h("div"),i=h("input"),o=g(),u=h("div"),d=h("p"),p=y(L),_=g(),k=h("div"),j=h("p"),S=y(R),E=g(),T=h("div"),H.c(),D=g(),M=h("div"),N=h("input"),A=g(),$(s,"class","svelte-1kvb8vw"),$(n,"class","table-cell svelte-1kvb8vw"),$(i,"type","checkbox"),$(i,"class","svelte-1kvb8vw"),$(a,"class","table-cell svelte-1kvb8vw"),$(d,"class","svelte-1kvb8vw"),$(u,"class","table-cell svelte-1kvb8vw"),$(j,"class","svelte-1kvb8vw"),$(k,"class","table-cell svelte-1kvb8vw"),$(T,"class","table-cell svelte-1kvb8vw"),$(N,"type","number"),$(N,"step","50"),$(N,"class","svelte-1kvb8vw"),$(M,"class","table-cell svelte-1kvb8vw"),this.first=n},m(e,r){m(e,n,r),f(n,s),f(s,l),m(e,c,r),m(e,a,r),f(a,i),i.checked=t[25].has_manual_rate,m(e,o,r),m(e,u,r),f(u,d),f(d,p),m(e,_,r),m(e,k,r),f(k,j),f(j,S),m(e,E,r),m(e,T,r),H.m(T,null),m(e,D,r),m(e,M,r),f(M,N),C(N,t[25].adjustment),f(M,A),O||(U=[b(i,"change",P),b(N,"change",t[8]),b(N,"input",V)],O=!0)},p(e,n){t=e,1&n&&I!==(I=t[27]+1+"")&&x(l,I),1&n&&(i.checked=t[25].has_manual_rate),1&n&&L!==(L=t[25].currencyCode+"")&&x(p,L),1&n&&R!==(R=t[25].alias_name+"")&&x(S,R),z===(z=J(t))&&H?H.p(t,n):(H.d(1),H=z(t),H&&(H.c(),H.m(T,null))),1&n&&w(N.value)!==t[25].adjustment&&C(N,t[25].adjustment)},d(e){e&&v(n),e&&v(c),e&&v(a),e&&v(o),e&&v(u),e&&v(_),e&&v(k),e&&v(E),e&&v(T),H.d(),e&&v(D),e&&v(M),O=!1,r(U)}}}function Xe(e){let t,n,l,c,a,i,o,u,d,p,_,w,S,E,T,D,M,N,A,O,U,I,R,P,J,z,H,V,q,G,K,Q,W,X,Y,Z,ee,te,ne=e[2]?"Add":"Edit",re=[],se=new Map,le=[],ce=new Map,ae=!e[2]&&Be(e),ie=e[4].currency_rates;const oe=e=>e[25].uid;for(let t=0;t<ie.length;t+=1){let n=qe(e,ie,t),r=oe(n);se.set(r,re[t]=Ge(r,n))}let ue=e[0];const de=e=>e[25].uid;for(let t=0;t<ue.length;t+=1){let n=Ve(e,ue,t),r=de(n);ce.set(r,le[t]=We(r,n))}return{c(){t=h("div"),n=h("p"),n.textContent="New / Edit Currency",l=g(),c=h("input"),a=g(),i=h("input"),o=g(),u=h("button"),d=y(ne),p=g(),ae&&ae.c(),_=g(),w=h("div"),S=h("p"),S.textContent="Select Currency",E=g(),T=h("select");for(let e=0;e<re.length;e+=1)re[e].c();M=g(),N=h("button"),A=y("Select"),U=g(),I=h("button"),I.textContent="Reset",R=g(),P=h("div"),J=h("div"),J.textContent="Row",z=g(),H=h("div"),H.textContent="Manual",V=g(),q=h("div"),q.textContent="Code",G=g(),K=h("div"),K.textContent="Name",Q=g(),W=h("div"),W.textContent="Rate",X=g(),Y=h("div"),Y.textContent="Adjustment",Z=g();for(let e=0;e<le.length;e+=1)le[e].c();k(n,"margin-right","16px"),$(n,"class","svelte-1kvb8vw"),k(c,"width","56px"),k(c,"margin-right","16px"),$(c,"type","text"),$(c,"class","svelte-1kvb8vw"),k(i,"width","96px"),k(i,"margin-right","16px"),$(i,"type","text"),$(i,"class","svelte-1kvb8vw"),$(u,"class","svelte-1kvb8vw"),k(t,"display","flex"),k(t,"margin-bottom","16px"),$(t,"class","svelte-1kvb8vw"),k(S,"margin-right","16px"),$(S,"class","svelte-1kvb8vw"),T.disabled=D=e[4].selected_currencies.length===e[4].currency_rates.length,$(T,"class","add-remove-currency select-currency svelte-1kvb8vw"),$(T,"name","select-currency"),$(T,"id","select-currency"),void 0===e[1]&&L((()=>e[16].call(T))),N.disabled=O=0===e[1].length,$(N,"class","svelte-1kvb8vw"),$(I,"class","svelte-1kvb8vw"),k(w,"display","flex"),k(w,"margin-bottom","16px"),$(w,"class","svelte-1kvb8vw"),$(J,"class","table-cell heading-title svelte-1kvb8vw"),$(H,"class","table-cell heading-title svelte-1kvb8vw"),$(q,"class","table-cell heading-title svelte-1kvb8vw"),$(K,"class","table-cell heading-title svelte-1kvb8vw"),$(W,"class","table-cell heading-title svelte-1kvb8vw"),$(Y,"class","table-cell heading-title svelte-1kvb8vw"),k(P,"display","grid"),k(P,"grid-template-columns","repeat(6, auto)"),k(P,"max-width","480px"),$(P,"class","svelte-1kvb8vw")},m(r,v){m(r,t,v),f(t,n),f(t,l),f(t,c),C(c,e[3].currencyCode),f(t,a),f(t,i),C(i,e[3].alias_name),f(t,o),f(t,u),f(u,d),f(t,p),ae&&ae.m(t,null),m(r,_,v),m(r,w,v),f(w,S),f(w,E),f(w,T);for(let e=0;e<re.length;e+=1)re[e].m(T,null);j(T,e[1]),f(w,M),f(w,N),f(N,A),f(w,U),f(w,I),m(r,R,v),m(r,P,v),f(P,J),f(P,z),f(P,H),f(P,V),f(P,q),f(P,G),f(P,K),f(P,Q),f(P,W),f(P,X),f(P,Y),f(P,Z);for(let e=0;e<le.length;e+=1)le[e].m(P,null);ee||(te=[b(c,"change",e[11]),b(c,"input",e[12]),b(i,"chage",Ze),b(i,"input",e[13]),b(u,"click",e[14]),b(T,"change",e[16]),b(N,"click",(function(){s(e[9](e[1]))&&e[9](e[1]).apply(this,arguments)})),b(I,"click",e[17])],ee=!0)},p(n,r){e=n,8&r&&c.value!==e[3].currencyCode&&C(c,e[3].currencyCode),8&r&&i.value!==e[3].alias_name&&C(i,e[3].alias_name),4&r&&ne!==(ne=e[2]?"Add":"Edit")&&x(d,ne),e[2]?ae&&(ae.d(1),ae=null):ae?ae.p(e,r):(ae=Be(e),ae.c(),ae.m(t,null)),16&r&&(ie=e[4].currency_rates,re=F(re,r,oe,1,e,ie,se,T,B,Ge,null,qe)),16&r&&D!==(D=e[4].selected_currencies.length===e[4].currency_rates.length)&&(T.disabled=D),18&r&&j(T,e[1]),18&r&&O!==(O=0===e[1].length)&&(N.disabled=O),257&r&&(ue=e[0],le=F(le,r,de,1,e,ue,ce,P,B,We,null,Ve))},d(e){e&&v(t),ae&&ae.d(),e&&v(_),e&&v(w);for(let e=0;e<re.length;e+=1)re[e].d();e&&v(R),e&&v(P);for(let e=0;e<le.length;e+=1)le[e].d();ee=!1,r(te)}}}function Ye(e){let t,n;return t=new te({props:{$$slots:{default:[Xe]},$$scope:{ctx:e}}}),{c(){G(t.$$.fragment)},m(e,r){K(t,e,r),n=!0},p(e,[n]){const r={};536870943&n&&(r.$$scope={dirty:n,ctx:e}),t.$set(r)},i(e){n||(V(t.$$.fragment,e),n=!0)},o(e){q(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}const Ze=()=>{};function et(e,t,n){let r,s,l,a,i,o;c(e,ye,(e=>n(4,i=e)));const u=e=>{var t;t=l.currencyCode,o.map((e=>e.currencyCode)).includes(t)?n(2,s=!1):n(2,s=!0)},d=async()=>{console.log(`Deleting ${l}`),ye.update((e=>{let t=e,n=t.currency_rates.filter((e=>e.currencyCode!=l.currencyCode));return n=n.filter((e=>e)),t.currency_rates=[...n],f(),t})),await je()},p=async()=>{console.log(`Adding or Editing ${l}`),ye.update((e=>{let t=e;if(e.currency_rates.map((e=>e.currencyCode)).includes(l.currencyCode)){console.log("Editing");let e=[...t.currency_rates],n=e.findIndex((e=>e.currencyCode==l.currencyCode));e[n].alias_name=l.alias_name,t.currency_rates=[...e]}else console.log("Adding"),t.currency_rates=[new de(l.currencyCode,l.alias_name,l.rate,l.has_manual_rate,l.manual_rate,l.adjustment),...t.currency_rates],t.selected_currencies=[l.currencyCode,...t.selected_currencies];return f(),t})),await je()},f=()=>{n(3,l={currencyCode:"",alias_name:"",rate:1,has_manual_rate:!0,manual_rate:1,adjustment:0}),n(2,s=!0)},m=async()=>{ye.update((e=>{let t=e;return t.selected_currencies=[],t})),await je()};D((()=>{ye.subscribe((e=>{o=e.currency_rates,(e=>{let t=[];for(let n of e.selected_currencies){let r=e.currency_rates.filter((e=>e.currencyCode===n))[0];r&&t.push(r)}console.log("Updating selected currencies"),n(0,a=t)})(e)}))}));return n(1,r=""),n(2,s=!0),n(3,l={currencyCode:"",alias_name:"",rate:1,has_manual_rate:!0,manual_rate:1,adjustment:0}),n(0,a=[]),[a,r,s,l,i,u,d,p,async()=>{console.log("Handing adjustment"),await je()},async e=>{e.length>0&&(console.log(`Selecting ${e}`),ye.update((t=>{let n=t;return n.selected_currencies=[e,...n.selected_currencies],n.selected_currencies.sort(),n})),await je(),await je(),n(1,r=""))},m,e=>{u()},function(){l.currencyCode=this.value,n(3,l)},function(){l.alias_name=this.value,n(3,l)},()=>{p()},()=>{d()},function(){r=S(this),n(1,r)},()=>{m()},function(e,t){e[t].has_manual_rate=this.checked,n(0,a)},function(e,t){e[t].manual_rate=w(this.value),n(0,a)},function(e,t){e[t].adjustment=w(this.value),n(0,a)}]}class tt extends Y{constructor(e){super(),X(this,e,et,Ye,l,{})}}function nt(t){let n,r,s,l,c,a,i,o,u;return l=new tt({}),a=new He({}),o=new Ne({}),{c(){n=h("main"),r=h("div"),r.innerHTML='<p class="svelte-13hemjz">Exchange Admin Panel</p> \n    <div style="display: flex;"></div>',s=g(),G(l.$$.fragment),c=g(),G(a.$$.fragment),i=g(),G(o.$$.fragment),k(r,"display","flex"),k(r,"justify-content","space-between"),$(n,"class","container")},m(e,t){m(e,n,t),f(n,r),f(n,s),K(l,n,null),f(n,c),K(a,n,null),f(n,i),K(o,n,null),u=!0},p:e,i(e){u||(V(l.$$.fragment,e),V(a.$$.fragment,e),V(o.$$.fragment,e),u=!0)},o(e){q(l.$$.fragment,e),q(a.$$.fragment,e),q(o.$$.fragment,e),u=!1},d(e){e&&v(n),Q(l),Q(a),Q(o)}}}function rt(e){return D((async()=>{console.log("Loaded!"),be=ge.subscribe((e=>{xe.dollar_model=e})),$e=ye.subscribe((e=>{xe.currency_model={selected_currencies:e.selected_currencies,currency_rates:[...e.currency_rates]}})),we=_e.subscribe((e=>{xe.bot_model=e}));const e=setInterval(ke,6e4);return await async function(){let e=await Ce();console.log(e),ge.update((t=>e.dollar_model)),_e.update((t=>e.bot_model)),ye.update((t=>e.currency_model))}(),()=>{be(),$e(),we(),clearInterval(e)}})),[]}return new class extends Y{constructor(e){super(),X(this,e,rt,nt,l,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
