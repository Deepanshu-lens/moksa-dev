var Un=Array.isArray,jn=Array.from,Bn=Object.defineProperty,Et=Object.getOwnPropertyDescriptor,en=Object.getOwnPropertyDescriptors,Vn=Object.prototype,Gn=Array.prototype,rn=Object.getPrototypeOf;function Kn(t){return typeof t=="function"}const $n=()=>{};function Zn(t){return t()}function xt(t){for(var n=0;n<t.length;n++)t[n]()}const y=2,At=4,B=8,ft=16,m=32,J=64,rt=128,k=256,$=512,d=1024,A=2048,P=4096,q=8192,F=16384,sn=32768,It=65536,an=1<<17,ln=1<<19,St=1<<20,wt=Symbol("$state"),Wn=Symbol("legacy props"),Xn=Symbol(""),un=typeof requestIdleCallback>"u"?t=>setTimeout(t,1):requestIdleCallback;let Z=!1,W=!1,st=[],at=[];function Ot(){Z=!1;const t=st.slice();st=[],xt(t)}function Rt(){W=!1;const t=at.slice();at=[],xt(t)}function zn(t){Z||(Z=!0,queueMicrotask(Ot)),st.push(t)}function Jn(t){W||(W=!0,un(Rt)),at.push(t)}function on(){Z&&Ot(),W&&Rt()}function Nt(t){console.warn("https://svelte.dev/e/hydration_mismatch")}const Qn=1,te=2,ne=4,ee=8,re=16,se=1,ae=2,le=4,ue=8,oe=16,ie=1,fe=2,_e=4,ce=1,ve=2,fn="[",_n="[!",cn="]",kt={},pe=Symbol(),de="http://www.w3.org/2000/svg";function Ct(t){return t===this.v}function vn(t,n){return t!=t?n==n:t!==n||t!==null&&typeof t=="object"||typeof t=="function"}function he(t,n){return t!==n}function Dt(t){return!vn(t,this.v)}function pn(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function dn(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function hn(t){throw new Error("https://svelte.dev/e/effect_orphan")}function yn(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function ye(){throw new Error("https://svelte.dev/e/hydration_failed")}function Ee(t){throw new Error("https://svelte.dev/e/lifecycle_legacy_only")}function we(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function Te(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function me(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function En(){throw new Error("https://svelte.dev/e/state_unsafe_local_read")}function wn(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let Q=!1;function ge(){Q=!0}function bt(t,n){var e={f:0,v:t,reactions:null,equals:Ct,version:0};return e}function Tn(t,n=!1){const e=bt(t);return n||(e.equals=Dt),Q&&i!==null&&i.l!==null&&(i.l.s??=[]).push(e),e}function xe(t,n=!1){return mn(Tn(t,n))}function mn(t){return o!==null&&o.f&y&&(T===null?Sn([t]):T.push(t)),t}function Ae(t,n){return _t(t,et(()=>dt(t))),n}function _t(t,n){return o!==null&&pt()&&o.f&(y|ft)&&(T===null||!T.includes(t))&&wn(),lt(t,n)}function lt(t,n){return t.equals(n)||(t.v=n,t.version=Ht(),qt(t,A),pt()&&u!==null&&u.f&d&&!(u.f&m)&&(c!==null&&c.includes(t)?(w(u,A),nt(u)):x===null?On([t]):x.push(t))),n}function qt(t,n){var e=t.reactions;if(e!==null)for(var r=pt(),s=e.length,a=0;a<s;a++){var l=e[a],f=l.f;f&A||!r&&l===u||(w(l,n),f&(d|k)&&(f&y?qt(l,P):nt(l)))}}function gn(t){var n=y|A;u===null?n|=k:u.f|=St;var e=o!==null&&o.f&y?o:null;const r={children:null,ctx:i,deps:null,equals:Ct,f:n,fn:t,reactions:null,v:null,version:0,parent:e??u};return e!==null&&(e.children??=[]).push(r),r}function Ie(t){const n=gn(t);return n.equals=Dt,n}function Pt(t){var n=t.children;if(n!==null){t.children=null;for(var e=0;e<n.length;e+=1){var r=n[e];r.f&y?ct(r):N(r)}}}function xn(t){for(var n=t.parent;n!==null;){if(!(n.f&y))return n;n=n.parent}return null}function Ft(t){var n,e=u;z(xn(t));try{Pt(t),n=Ut(t)}finally{z(e)}return n}function Lt(t){var n=Ft(t),e=(O||t.f&k)&&t.deps!==null?P:d;w(t,e),t.equals(n)||(t.v=n,t.version=Ht())}function ct(t){Pt(t),U(t,0),w(t,F),t.v=t.children=t.deps=t.ctx=t.reactions=null}function Se(){throw new Error("https://svelte.dev/e/invalid_default_snippet")}function An(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}const Mt=0,In=1;let G=!1,K=Mt,Y=!1,H=null,D=!1,vt=!1;function Tt(t){D=t}function mt(t){vt=t}let S=[],b=0;let o=null;function X(t){o=t}let u=null;function z(t){u=t}let T=null;function Sn(t){T=t}let c=null,h=0,x=null;function On(t){x=t}let Yt=1,O=!1,I=null,i=null;function Ht(){return++Yt}function pt(){return!Q||i!==null&&i.l===null}function L(t){var n=t.f;if(n&A)return!0;if(n&P){var e=t.deps,r=(n&k)!==0;if(e!==null){var s;if(n&$){for(s=0;s<e.length;s++)(e[s].reactions??=[]).push(t);t.f^=$}for(s=0;s<e.length;s++){var a=e[s];if(L(a)&&Lt(a),r&&u!==null&&!O&&!a?.reactions?.includes(t)&&(a.reactions??=[]).push(t),a.version>t.version)return!0}}(!r||u!==null&&!O)&&w(t,d)}return!1}function Rn(t,n){for(var e=n;e!==null;){if(e.f&rt)try{e.fn(t);return}catch{e.f^=rt}e=e.parent}throw G=!1,t}function Nn(t){return(t.f&F)===0&&(t.parent===null||(t.parent.f&rt)===0)}function tt(t,n,e,r){if(G){if(e===null&&(G=!1),Nn(n))throw t;return}e!==null&&(G=!0);{Rn(t,n);return}}function Ut(t){var n=c,e=h,r=x,s=o,a=O,l=T,f=i,v=t.f;c=null,h=0,x=null,o=v&(m|J)?null:t,O=!D&&(v&k)!==0,T=null,i=t.ctx;try{var g=(0,t.fn)(),p=t.deps;if(c!==null){var _;if(U(t,h),p!==null&&h>0)for(p.length=h+c.length,_=0;_<c.length;_++)p[h+_]=c[_];else t.deps=p=c;if(!O)for(_=h;_<p.length;_++)(p[_].reactions??=[]).push(t)}else p!==null&&h<p.length&&(U(t,h),p.length=h);return g}finally{c=n,h=e,x=r,o=s,O=a,T=l,i=f}}function kn(t,n){let e=n.reactions;if(e!==null){var r=e.indexOf(t);if(r!==-1){var s=e.length-1;s===0?e=n.reactions=null:(e[r]=e[s],e.pop())}}e===null&&n.f&y&&(c===null||!c.includes(n))&&(w(n,P),n.f&(k|$)||(n.f^=$),U(n,0))}function U(t,n){var e=t.deps;if(e!==null)for(var r=n;r<e.length;r++)kn(t,e[r])}function V(t){var n=t.f;if(!(n&F)){w(t,d);var e=u,r=i;u=t;try{n&ft?Mn(t):Jt(t),zt(t),Xt(t);var s=Ut(t);t.teardown=typeof s=="function"?s:null,t.version=Yt}catch(a){tt(a,t,e,r||t.ctx)}finally{u=e}}}function jt(){if(b>1e3){b=0;try{yn()}catch(t){if(H!==null)tt(t,H,null);else throw t}}b++}function Bt(t){var n=t.length;if(n!==0){jt();var e=D;D=!0;try{for(var r=0;r<n;r++){var s=t[r];s.f&d||(s.f^=d);var a=[];Vt(s,a),Cn(a)}}finally{D=e}}}function Cn(t){var n=t.length;if(n!==0)for(var e=0;e<n;e++){var r=t[e];if(!(r.f&(F|q)))try{L(r)&&(V(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null?Qt(r):r.fn=null))}catch(s){tt(s,r,null,r.ctx)}}}function Dn(){if(Y=!1,b>1001)return;const t=S;S=[],Bt(t),Y||(b=0,H=null)}function nt(t){K===Mt&&(Y||(Y=!0,queueMicrotask(Dn))),H=t;for(var n=t;n.parent!==null;){n=n.parent;var e=n.f;if(e&(J|m)){if(!(e&d))return;n.f^=d}}S.push(n)}function Vt(t,n){var e=t.first,r=[];t:for(;e!==null;){var s=e.f,a=(s&m)!==0,l=a&&(s&d)!==0,f=e.next;if(!l&&!(s&q))if(s&B){if(a)e.f^=d;else try{L(e)&&V(e)}catch(_){tt(_,e,null,e.ctx)}var v=e.first;if(v!==null){e=v;continue}}else s&At&&r.push(e);if(f===null){let _=e.parent;for(;_!==null;){if(t===_)break t;var g=_.next;if(g!==null){e=g;continue t}_=_.parent}}e=f}for(var p=0;p<r.length;p++)v=r[p],n.push(v),Vt(v,n)}function Gt(t){var n=K,e=S;try{jt();const s=[];K=In,S=s,Y=!1,Bt(e);var r=t?.();return on(),(S.length>0||s.length>0)&&Gt(),b=0,H=null,r}finally{K=n,S=e}}async function Oe(){await Promise.resolve(),Gt()}function dt(t){var n=t.f,e=(n&y)!==0;if(e&&n&F){var r=Ft(t);return ct(t),r}if(I!==null&&I.add(t),o!==null){T!==null&&T.includes(t)&&En();var s=o.deps;c===null&&s!==null&&s[h]===t?h++:c===null?c=[t]:c.push(t),x!==null&&u!==null&&u.f&d&&!(u.f&m)&&x.includes(t)&&(w(u,A),nt(u))}else if(e&&t.deps===null)for(var a=t,l=a.parent,f=a;l!==null;)if(l.f&y){var v=l;f=v,l=v.parent}else{var g=l;g.deriveds?.includes(f)||(g.deriveds??=[]).push(f);break}return e&&(a=t,L(a)&&Lt(a)),t.v}function bn(t){var n=I;I=new Set;var e=I,r;try{if(et(t),n!==null)for(r of I)n.add(r)}finally{I=n}return e}function Re(t){var n=bn(()=>et(t));for(var e of n)if(e.f&an)for(const r of e.deps||[])r.f&y||lt(r,r.v);else lt(e,e.v)}function et(t){const n=o;try{return o=null,t()}finally{o=n}}const qn=~(A|P|d);function w(t,n){t.f=t.f&qn|n}function Ne(t){return ht().get(t)}function ke(t,n){return ht().set(t,n),n}function Ce(t){return ht().has(t)}function ht(t){return i===null&&An(),i.c??=new Map(Pn(i)||void 0)}function Pn(t){let n=t.p;for(;n!==null;){const e=n.c;if(e!==null)return e;n=n.p}return null}function De(t,n=1){var e=dt(t),r=n===1?e++:e--;return _t(t,e),r}function be(t,n){var e={};for(var r in t)n.includes(r)||(e[r]=t[r]);return e}function qe(t,n=!1,e){i={p:i,c:null,e:null,m:!1,s:t,x:null,l:null},Q&&!n&&(i.l={s:null,u:null,r1:[],r2:bt(!1)})}function Pe(t){const n=i;if(n!==null){t!==void 0&&(n.x=t);const l=n.e;if(l!==null){var e=u,r=o;n.e=null;try{for(var s=0;s<l.length;s++){var a=l[s];z(a.effect),X(a.reaction),Wt(a.fn)}}finally{z(e),X(r)}}i=n.p,n.m=!0}return t||{}}function Fe(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(wt in t)ut(t);else if(!Array.isArray(t))for(let n in t){const e=t[n];typeof e=="object"&&e&&wt in e&&ut(e)}}}function ut(t,n=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!n.has(t)){n.add(t),t instanceof Date&&t.getTime();for(let r in t)try{ut(t[r],n)}catch{}const e=rn(t);if(e!==Object.prototype&&e!==Array.prototype&&e!==Map.prototype&&e!==Set.prototype&&e!==Date.prototype){const r=en(e);for(let s in r){const a=r[s].get;if(a)try{a.call(t)}catch{}}}}}let R=!1;function Le(t){R=t}let E;function j(t){if(t===null)throw Nt(),kt;return E=t}function Me(){return j(C(E))}function Ye(t){if(R){if(C(E)!==null)throw Nt(),kt;E=t}}function He(t=1){if(R){for(var n=t,e=E;n--;)e=C(e);E=e}}function Ue(){for(var t=0,n=E;;){if(n.nodeType===8){var e=n.data;if(e===cn){if(t===0)return n;t-=1}else(e===fn||e===_n)&&(t+=1)}var r=C(n);n.remove(),n=r}}var gt,Kt,$t;function je(){if(gt===void 0){gt=window;var t=Element.prototype,n=Node.prototype;Kt=Et(n,"firstChild").get,$t=Et(n,"nextSibling").get,t.__click=void 0,t.__className="",t.__attributes=null,t.__styles=null,t.__e=void 0,Text.prototype.__t=void 0}}function ot(t=""){return document.createTextNode(t)}function it(t){return Kt.call(t)}function C(t){return $t.call(t)}function Be(t,n){if(!R)return it(t);var e=it(E);if(e===null)e=E.appendChild(ot());else if(n&&e.nodeType!==3){var r=ot();return e?.before(r),j(r),r}return j(e),e}function Ve(t,n){if(!R){var e=it(t);return e instanceof Comment&&e.data===""?C(e):e}return E}function Ge(t,n=1,e=!1){let r=R?E:t;for(var s;n--;)s=r,r=C(r);if(!R)return r;var a=r?.nodeType;if(e&&a!==3){var l=ot();return r===null?s?.after(l):r.before(l),j(l),l}return j(r),r}function Ke(t){t.textContent=""}function Zt(t){u===null&&o===null&&hn(),o!==null&&o.f&k&&dn(),vt&&pn()}function Fn(t,n){var e=n.last;e===null?n.last=n.first=t:(e.next=t,t.prev=e,n.last=t)}function M(t,n,e,r=!0){var s=(t&J)!==0,a=u,l={ctx:i,deps:null,deriveds:null,nodes_start:null,nodes_end:null,f:t|A,first:null,fn:n,last:null,next:null,parent:s?null:a,prev:null,teardown:null,transitions:null,version:0};if(e){var f=D;try{Tt(!0),V(l),l.f|=sn}catch(p){throw N(l),p}finally{Tt(f)}}else n!==null&&nt(l);var v=e&&l.deps===null&&l.first===null&&l.nodes_start===null&&l.teardown===null&&(l.f&St)===0;if(!v&&!s&&r&&(a!==null&&Fn(l,a),o!==null&&o.f&y)){var g=o;(g.children??=[]).push(l)}return l}function $e(t){const n=M(B,null,!1);return w(n,d),n.teardown=t,n}function Ze(t){Zt();var n=u!==null&&(u.f&m)!==0&&i!==null&&!i.m;if(n){var e=i;(e.e??=[]).push({fn:t,effect:u,reaction:o})}else{var r=Wt(t);return r}}function We(t){return Zt(),yt(t)}function Xe(t){const n=M(J,t,!0);return(e={})=>new Promise(r=>{e.outro?Yn(n,()=>{N(n),r(void 0)}):(N(n),r(void 0))})}function Wt(t){return M(At,t,!1)}function ze(t,n){var e=i,r={effect:null,ran:!1};e.l.r1.push(r),r.effect=yt(()=>{t(),!r.ran&&(r.ran=!0,_t(e.l.r2,!0),et(n))})}function Je(){var t=i;yt(()=>{if(dt(t.l.r2)){for(var n of t.l.r1){var e=n.effect;e.f&d&&w(e,P),L(e)&&V(e),n.ran=!1}t.l.r2.v=!1}})}function yt(t){return M(B,t,!0)}function Qe(t){return Ln(t)}function Ln(t,n=0){return M(B|ft|n,t,!0)}function tr(t,n=!0){return M(B|m,t,!0,n)}function Xt(t){var n=t.teardown;if(n!==null){const e=vt,r=o;mt(!0),X(null);try{n.call(null)}finally{mt(e),X(r)}}}function zt(t){var n=t.deriveds;if(n!==null){t.deriveds=null;for(var e=0;e<n.length;e+=1)ct(n[e])}}function Jt(t,n=!1){var e=t.first;for(t.first=t.last=null;e!==null;){var r=e.next;N(e,n),e=r}}function Mn(t){for(var n=t.first;n!==null;){var e=n.next;n.f&m||N(n),n=e}}function N(t,n=!0){var e=!1;if((n||t.f&ln)&&t.nodes_start!==null){for(var r=t.nodes_start,s=t.nodes_end;r!==null;){var a=r===s?null:C(r);r.remove(),r=a}e=!0}Jt(t,n&&!e),zt(t),U(t,0),w(t,F);var l=t.transitions;if(l!==null)for(const v of l)v.stop();Xt(t);var f=t.parent;f!==null&&f.first!==null&&Qt(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Qt(t){var n=t.parent,e=t.prev,r=t.next;e!==null&&(e.next=r),r!==null&&(r.prev=e),n!==null&&(n.first===t&&(n.first=r),n.last===t&&(n.last=e))}function Yn(t,n){var e=[];tn(t,e,!0),Hn(e,()=>{N(t),n&&n()})}function Hn(t,n){var e=t.length;if(e>0){var r=()=>--e||n();for(var s of t)s.out(r)}else n()}function tn(t,n,e){if(!(t.f&q)){if(t.f^=q,t.transitions!==null)for(const l of t.transitions)(l.is_global||e)&&n.push(l);for(var r=t.first;r!==null;){var s=r.next,a=(r.f&It)!==0||(r.f&m)!==0;tn(r,n,a?e:!1),r=s}}}function nr(t){nn(t,!0)}function nn(t,n){if(t.f&q){L(t)&&V(t),t.f^=q;for(var e=t.first;e!==null;){var r=e.next,s=(e.f&It)!==0||(e.f&m)!==0;nn(e,s?n:!1),e=r}if(t.transitions!==null)for(const a of t.transitions)(a.is_global||n)&&a.in()}}export{o as $,yt as A,zn as B,Oe as C,N as D,It as E,C as F,Nt as G,kt as H,j as I,it as J,ot as K,ne as L,Un as M,jn as N,_n as O,Ue as P,Le as Q,q as R,nr as S,u as T,Qn as U,lt as V,te as W,tn as X,Ke as Y,Hn as Z,cn as _,Je as a,he as a$,ee as a0,Tn as a1,bt as a2,re as a3,$n as a4,i as a5,An as a6,Q as a7,Ze as a8,Ee as a9,gn as aA,oe as aB,I as aC,xt as aD,vn as aE,Xn as aF,en as aG,Jn as aH,X as aI,We as aJ,Zn as aK,ge as aL,Se as aM,ke as aN,Ne as aO,Bn as aP,ln as aQ,ce as aR,ve as aS,Ce as aT,ft as aU,sn as aV,ie as aW,fe as aX,_e as aY,Re as aZ,be as a_,je as aa,fn as ab,ye as ac,Xe as ad,Wt as ae,de as af,wt as ag,De as ah,Vn as ai,Gn as aj,Te as ak,pe as al,me as am,rn as an,we as ao,an as ap,le as aq,Dt as ar,Kn as as,Wn as at,m as au,J as av,z as aw,se as ax,ae as ay,ue as az,Pe as b,_t as c,Fe as d,$e as e,Ve as f,dt as g,Et as h,Be as i,Ie as j,R as k,ze as l,xe as m,Me as n,Ln as o,qe as p,tr as q,Ye as r,Ge as s,Qe as t,E as u,Yn as v,He as w,Ae as x,pt as y,et as z};
