import{i as it}from"./legacy.BEeXhY1S.js";import{C as dt,aO as At,aN as Mt,p as ot,l as N,c as Pt,g as C,a as bt,f as oe,b as at,m as xt,i as xe,r as De,t as Se,d as x,ae as Fe,j as Jt}from"./effects.cxkQmux7.js";import{c as ae,a as G,t as We,e as Re}from"./template.BwN7TRoD.js";import{s as ue,b as Ke}from"./this.BmA335U8.js";import{w as J,t as gt,n as St,m as ie,s as Ze,y as Qt,q as ce,c as f,j as be,d as O,F as Ft,k as j,S as vt,z as Zt,B as $e,C as pe,x as Rt,u as Me,r as He,l as $t,g as mt,h as wt,o as Ut,a as Be,b as en}from"./create.BfRhC9QK.js";import{l as Ce,p as g,s as tn}from"./props.DbzmGua_.js";import{i as Te,a as Ne}from"./attributes.92vqw3Y3.js";import{b as Kt,u as nn,s as Xe,e as rn,a as sn,r as zt,g as Vt,c as Ht,t as et}from"./updater.B0mDEZrk.js";import{s as pt,a as st}from"./store.c-pxfM0-.js";import{f as on,c as an}from"./utils.DvemnH4t.js";import{w as q,d as rt}from"./index.BUf4ql09.js";import{c as un,d as Bt,u as Nt,h as Y,r as Ve,a as ln,b as cn,e as dn,f as Xt,g as fn}from"./helpers.BekmFVoz.js";import{h as gn}from"./focus.D50lsZzo.js";import{c as mn}from"./create.BgVLX6SM.js";const vn={ltr:[...vt,j.ARROW_RIGHT],rtl:[...vt,j.ARROW_LEFT]},bn={ltr:[j.ARROW_LEFT],rtl:[j.ARROW_RIGHT]},Wt=["menu","trigger"],pn={arrowSize:8,positioning:{placement:"bottom"},preventScroll:!0,closeOnEscape:!0,closeOnOutsideClick:!0,portal:void 0,loop:!1,dir:"ltr",defaultOpen:!1,typeahead:!0,closeOnItemClick:!0,onOutsideClick:void 0};function hn(s){const{name:e,selector:l}=$t(s.selector),{preventScroll:d,arrowSize:h,positioning:_,closeOnEscape:o,closeOnOutsideClick:a,portal:M,forceVisible:F,typeahead:R,loop:L,closeFocus:U,disableFocusFirstItem:Q,closeOnItemClick:ne,onOutsideClick:Z}=s.rootOptions,k=s.rootOpen,K=s.rootActiveTrigger,w=s.nextFocusable,B=s.prevFocusable,P=J.writable(!1),V=J(q(0)),re=J(q(null)),H=J(q("right")),de=J(q(null)),ut=J(rt([H,re],([t,r])=>n=>t===r?.side&&yn(n,r?.area))),{typed:qe,handleTypeaheadSearch:$}=un(),fe=gt({...St(Wt),...s.ids}),Je=Bt({open:k,forceVisible:F,activeTrigger:K}),ht=ie(e(),{stores:[Je,M,fe.menu,fe.trigger],returned:([t,r,n,i])=>({role:"menu",hidden:t?void 0:!0,style:Ze({display:t?void 0:"none"}),id:n,"aria-labelledby":i,"data-state":t?"open":"closed","data-portal":Qt(r),tabindex:-1}),action:t=>{let r=$e;const n=ce([Je,K,_,a,M,o],([u,T,D,A,v,b])=>{r(),!(!u||!T)&&dt().then(()=>{r(),nt(t,l),r=Nt(t,{anchorElement:T,open:k,options:{floating:D,modal:{closeOnInteractOutside:A,shouldCloseOnInteractOutside:m=>(Z.get()?.(m),!(m.defaultPrevented||f(T)&&T.contains(m.target))),onClose:()=>{k.set(!1),T.focus()},open:u},portal:Kt(t,v),escapeKeydown:b?void 0:null}}).destroy})}),i=be(O(t,"keydown",u=>{const T=u.target,D=u.currentTarget;if(!f(T)||!f(D)||!(T.closest('[role="menu"]')===D))return;if(Ft.includes(u.key)&&Lt(u,L.get()??!1),u.key===j.TAB){u.preventDefault(),k.set(!1),Gt(u,w,B);return}const v=u.key.length===1;!(u.ctrlKey||u.altKey||u.metaKey)&&v&&R.get()===!0&&$(u.key,Pe(D))}));return{destroy(){n(),i(),r()}}}}),yt=ie(e("trigger"),{stores:[k,fe.menu,fe.trigger],returned:([t,r,n])=>({"aria-controls":r,"aria-expanded":t,"data-state":t?"open":"closed",id:n,tabindex:0}),action:t=>(ft(t),K.update(n=>n||t),{destroy:be(O(t,"click",n=>{const i=k.get(),u=n.currentTarget;f(u)&&(ge(u),i||n.preventDefault())}),O(t,"keydown",n=>{const i=n.currentTarget;if(!f(i)||!(vt.includes(n.key)||n.key===j.ARROW_DOWN))return;n.preventDefault(),ge(i);const u=i.getAttribute("aria-controls");if(!u)return;const T=document.getElementById(u);if(!T)return;const D=Pe(T);D.length&&Y(D[0])}))})}),we=ie(e("arrow"),{stores:h,returned:t=>({"data-arrow":!0,style:Ze({position:"absolute",width:`var(--arrow-size, ${t}px)`,height:`var(--arrow-size, ${t}px)`})})}),Et=ie(e("overlay"),{stores:[Je],returned:([t])=>({hidden:t?void 0:!0,tabindex:-1,style:Ze({display:t?void 0:"none"}),"aria-hidden":"true","data-state":_n(t)}),action:t=>{let r=$e;o.get()&&(r=Zt(t,{handler:()=>{k.set(!1);const u=K.get();u&&u.focus()}}).destroy);const n=ce([M],([i])=>{if(i===null)return $e;const u=Kt(t,i);return u===null?$e:nn(t,u).destroy});return{destroy(){r(),n()}}}}),lt=ie(e("item"),{returned:()=>({role:"menuitem",tabindex:-1,"data-orientation":"vertical"}),action:t=>(nt(t,l),ft(t),{destroy:be(O(t,"pointerdown",n=>{const i=n.currentTarget;if(f(i)&&pe(i)){n.preventDefault();return}}),O(t,"click",n=>{const i=n.currentTarget;if(f(i)){if(pe(i)){n.preventDefault();return}if(n.defaultPrevented){Y(i);return}ne.get()&&Xe(1).then(()=>{k.set(!1)})}}),O(t,"keydown",n=>{ve(n)}),O(t,"pointermove",n=>{Oe(n)}),O(t,"pointerleave",n=>{Ae(n)}),O(t,"focusin",n=>{X(n)}),O(t,"focusout",n=>{ye(n)}))})}),Ot=ie(e("group"),{returned:()=>t=>({role:"group","aria-labelledby":t})}),_t=ie(e("group-label"),{returned:()=>t=>({id:t})}),kt={defaultChecked:!1,disabled:!1},he=t=>{const r={...kt,...t},n=r.checked??q(r.defaultChecked??null),i=mt(n,r.onCheckedChange),u=q(r.disabled),T=ie(e("checkbox-item"),{stores:[i,u],returned:([v,b])=>({role:"menuitemcheckbox",tabindex:-1,"data-orientation":"vertical","aria-checked":le(v)?"mixed":v?"true":"false","data-disabled":wt(b),"data-state":se(v)}),action:v=>(nt(v,l),ft(v),{destroy:be(O(v,"pointerdown",m=>{const y=m.currentTarget;if(f(y)&&pe(y)){m.preventDefault();return}}),O(v,"click",m=>{const y=m.currentTarget;if(f(y)){if(pe(y)){m.preventDefault();return}if(m.defaultPrevented){Y(y);return}i.update(ke=>le(ke)?!0:!ke),ne.get()&&dt().then(()=>{k.set(!1)})}}),O(v,"keydown",m=>{ve(m)}),O(v,"pointermove",m=>{const y=m.currentTarget;if(f(y)){if(pe(y)){me(m);return}Oe(m,y)}}),O(v,"pointerleave",m=>{Ae(m)}),O(v,"focusin",m=>{X(m)}),O(v,"focusout",m=>{ye(m)}))})}),D=rt(i,v=>v===!0),A=rt(i,v=>v==="indeterminate");return{elements:{checkboxItem:T},states:{checked:i},helpers:{isChecked:D,isIndeterminate:A},options:{disabled:u}}},Ie=(t={})=>{const r=t.value??q(t.defaultValue??null),n=mt(r,t.onValueChange),i=ie(e("radio-group"),{returned:()=>({role:"group"})}),u={disabled:!1},T=ie(e("radio-item"),{stores:[n],returned:([A])=>v=>{const{value:b,disabled:m}={...u,...v},y=A===b;return{disabled:m,role:"menuitemradio","data-state":y?"checked":"unchecked","aria-checked":y,"data-disabled":wt(m),"data-value":b,"data-orientation":"vertical",tabindex:-1}},action:A=>(nt(A,l),{destroy:be(O(A,"pointerdown",b=>{const m=b.currentTarget;if(!f(m))return;const y=A.dataset.value;if(A.dataset.disabled||y===void 0){b.preventDefault();return}}),O(A,"click",b=>{const m=b.currentTarget;if(!f(m))return;const y=A.dataset.value;if(A.dataset.disabled||y===void 0){b.preventDefault();return}if(b.defaultPrevented){if(!f(m))return;Y(m);return}n.set(y),ne.get()&&dt().then(()=>{k.set(!1)})}),O(A,"keydown",b=>{ve(b)}),O(A,"pointermove",b=>{const m=b.currentTarget;if(!f(m))return;const y=A.dataset.value;if(A.dataset.disabled||y===void 0){me(b);return}Oe(b,m)}),O(A,"pointerleave",b=>{Ae(b)}),O(A,"focusin",b=>{X(b)}),O(A,"focusout",b=>{ye(b)}))})}),D=rt(n,A=>v=>A===v);return{elements:{radioGroup:i,radioItem:T},states:{value:n},helpers:{isChecked:D}}},{elements:{root:Qe}}=mn({orientation:"horizontal"}),Tt={...pn,disabled:!1,positioning:{placement:"right-start",gutter:8}},Ct=t=>{const r={...Tt,...t},n=r.open??q(!1),i=mt(n,r?.onOpenChange),u=gt(Ut(r,"ids")),{positioning:T,arrowSize:D,disabled:A}=u,v=J(q(null)),b=J(q(null)),m=J(q(0)),y=gt({...St(Wt),...r.ids});Rt(()=>{const p=document.getElementById(y.trigger.get());p&&v.set(p)});const ke=Bt({open:i,forceVisible:F,activeTrigger:v}),jt=ie(e("submenu"),{stores:[ke,y.menu,y.trigger],returned:([p,z,te])=>({role:"menu",hidden:p?void 0:!0,style:Ze({display:p?void 0:"none"}),id:z,"aria-labelledby":te,"data-state":p?"open":"closed","data-id":z,tabindex:-1}),action:p=>{let z=$e;const te=ce([ke,T],([c,I])=>{if(z(),!c)return;const S=v.get();S&&dt().then(()=>{z();const W=Le(S);z=Nt(p,{anchorElement:S,open:i,options:{floating:I,portal:f(W)?W:void 0,modal:null,focusTrap:null,escapeKeydown:null}}).destroy})}),E=be(O(p,"keydown",c=>{if(c.key===j.ESCAPE)return;const I=c.target,S=c.currentTarget;if(!f(I)||!f(S)||!(I.closest('[role="menu"]')===S))return;if(Ft.includes(c.key)){c.stopImmediatePropagation(),Lt(c,L.get()??!1);return}const Ue=bn.ltr.includes(c.key),ze=c.ctrlKey||c.altKey||c.metaKey,ct=c.key.length===1;if(Ue){const Dt=v.get();c.preventDefault(),i.update(()=>(Dt&&Y(Dt),!1));return}if(c.key===j.TAB){c.preventDefault(),k.set(!1),Gt(c,w,B);return}!ze&&ct&&R.get()===!0&&$(c.key,Pe(S))}),O(p,"pointermove",c=>{ee(c)}),O(p,"focusout",c=>{const I=v.get();if(P.get()){const S=c.target,W=document.getElementById(y.menu.get());if(!f(W)||!f(S))return;!W.contains(S)&&S!==I&&i.set(!1)}else{const S=c.currentTarget,W=c.relatedTarget;if(!f(W)||!f(S))return;!S.contains(W)&&W!==I&&i.set(!1)}}));return{destroy(){te(),z(),E()}}}}),Yt=ie(e("subtrigger"),{stores:[i,A,y.menu,y.trigger],returned:([p,z,te,E])=>({role:"menuitem",id:E,tabindex:-1,"aria-controls":te,"aria-expanded":p,"data-state":p?"open":"closed","data-disabled":wt(z),"aria-haspopop":"menu"}),action:p=>{nt(p,l),ft(p),v.update(E=>E||p);const z=()=>{It(b),window.clearTimeout(m.get()),re.set(null)},te=be(O(p,"click",E=>{if(E.defaultPrevented)return;const c=E.currentTarget;!f(c)||pe(c)||(Y(c),i.get()||i.update(I=>I||(v.set(c),!I)))}),O(p,"keydown",E=>{const c=qe.get(),I=E.currentTarget;if(!(!f(I)||pe(I)||c.length>0&&E.key===j.SPACE)&&vn.ltr.includes(E.key)){if(!i.get()){I.click(),E.preventDefault();return}const W=I.getAttribute("aria-controls");if(!W)return;const Ue=document.getElementById(W);if(!f(Ue))return;const ze=Pe(Ue)[0];Y(ze)}}),O(p,"pointermove",E=>{if(!tt(E)||(Ge(E),E.defaultPrevented))return;const c=E.currentTarget;if(!f(c))return;On(y.menu.get())||Y(c);const I=b.get();!i.get()&&!I&&!pe(c)&&b.set(window.setTimeout(()=>{i.update(()=>(v.set(c),!0)),It(b)},100))}),O(p,"pointerleave",E=>{if(!tt(E))return;It(b);const c=document.getElementById(y.menu.get()),I=c?.getBoundingClientRect();if(I){const S=c?.dataset.side,W=S==="right",Ue=W?-5:5,ze=I[W?"left":"right"],ct=I[W?"right":"left"];re.set({area:[{x:E.clientX+Ue,y:E.clientY},{x:ze,y:I.top},{x:ct,y:I.top},{x:ct,y:I.bottom},{x:ze,y:I.bottom}],side:S}),window.clearTimeout(m.get()),m.set(window.setTimeout(()=>{re.set(null)},300))}else{if(Ee(E),E.defaultPrevented)return;re.set(null)}}),O(p,"focusout",E=>{const c=E.currentTarget;if(!f(c))return;Ve(c);const I=E.relatedTarget;if(!f(I))return;const S=c.getAttribute("aria-controls");if(!S)return;const W=document.getElementById(S);W&&!W.contains(I)&&i.set(!1)}),O(p,"focusin",E=>{X(E)}));return{destroy(){z(),te()}}}}),qt=ie(e("subarrow"),{stores:D,returned:p=>({"data-arrow":!0,style:Ze({position:"absolute",width:`var(--arrow-size, ${p}px)`,height:`var(--arrow-size, ${p}px)`})})});return ce([k],([p])=>{p||(v.set(null),i.set(!1))}),ce([re],([p])=>{!He||p||window.clearTimeout(m.get())}),ce([i],([p])=>{if(He&&(p&&P.get()&&Xe(1).then(()=>{const z=document.getElementById(y.menu.get());if(!z)return;const te=Pe(z);te.length&&Y(te[0])}),!p)){const z=de.get(),te=document.getElementById(y.trigger.get());if(z&&Xe(1).then(()=>{const E=document.getElementById(y.menu.get());E&&E.contains(z)&&Ve(z)}),!te||document.activeElement===te)return;Ve(te)}}),{ids:y,elements:{subTrigger:Yt,subMenu:jt,subArrow:qt},states:{subOpen:i},options:u}};Rt(()=>{const t=document.getElementById(fe.trigger.get());f(t)&&k.get()&&K.set(t);const r=[],n=()=>P.set(!1),i=()=>{P.set(!0),r.push(be(Me(document,"pointerdown",n,{capture:!0,once:!0}),Me(document,"pointermove",n,{capture:!0,once:!0})))},u=T=>{if(T.key===j.ESCAPE&&o.get()){k.set(!1);return}};return r.push(Me(document,"keydown",i,{capture:!0})),r.push(Me(document,"keydown",u)),()=>{r.forEach(T=>T())}}),ce([k,de],([t,r])=>{!t&&r&&Ve(r)}),ce([k],([t])=>{if(He&&!t){const r=K.get();if(!r)return;const n=U.get();!t&&r&&gn({prop:n,defaultEl:r})}}),ce([k,d],([t,r])=>{if(!He)return;const n=[];return t&&r&&n.push(rn()),Xe(1).then(()=>{const i=document.getElementById(fe.menu.get());if(i&&t&&P.get()){if(Q.get()){Y(i);return}const u=Pe(i);if(!u.length)return;Y(u[0])}}),()=>{n.forEach(i=>i())}}),ce(k,t=>{if(!He)return;const r=()=>P.set(!1),n=i=>{if(P.set(!0),i.key===j.ESCAPE&&t&&o.get()){k.set(!1);return}};return be(Me(document,"pointerdown",r,{capture:!0,once:!0}),Me(document,"pointermove",r,{capture:!0,once:!0}),Me(document,"keydown",n,{capture:!0}))});function ge(t){k.update(r=>{const n=!r;return n&&(w.set(ln(t)),B.set(cn(t)),K.set(t)),n})}function X(t){const r=t.currentTarget;if(!f(r))return;const n=de.get();n&&Ve(n),dn(r),de.set(r)}function ye(t){const r=t.currentTarget;f(r)&&Ve(r)}function Ge(t){_e(t)&&t.preventDefault()}function me(t){if(_e(t))return;const r=t.target;if(!f(r))return;const n=Le(r);n&&Y(n)}function Ee(t){_e(t)&&t.preventDefault()}function ee(t){if(!tt(t))return;const r=t.target,n=t.currentTarget;if(!f(n)||!f(r))return;const i=V.get(),u=i!==t.clientX;if(n.contains(r)&&u){const T=t.clientX>i?"right":"left";H.set(T),V.set(t.clientX)}}function Oe(t,r=null){if(!tt(t)||(Ge(t),t.defaultPrevented))return;if(r){Y(r);return}const n=t.currentTarget;f(n)&&Y(n)}function Ae(t){tt(t)&&me(t)}function ve(t){if(qe.get().length>0&&t.key===j.SPACE){t.preventDefault();return}if(vt.includes(t.key)){t.preventDefault();const i=t.currentTarget;if(!f(i))return;i.click()}}function le(t){return t==="indeterminate"}function se(t){return le(t)?"indeterminate":t?"checked":"unchecked"}function _e(t){return ut.get()(t)}function Le(t){const r=t.closest('[role="menu"]');return f(r)?r:null}return{elements:{trigger:yt,menu:ht,overlay:Et,item:lt,group:Ot,groupLabel:_t,arrow:we,separator:Qe},builders:{createCheckboxItem:he,createSubmenu:Ct,createMenuRadioGroup:Ie},states:{open:k},helpers:{handleTypeaheadSearch:$},ids:fe,options:s.rootOptions}}function Gt(s,e,l){if(s.shiftKey){const d=l.get();d&&(s.preventDefault(),Xe(1).then(()=>d.focus()),l.set(null))}else{const d=e.get();d&&(s.preventDefault(),Xe(1).then(()=>d.focus()),e.set(null))}}function Pe(s){return Array.from(s.querySelectorAll(`[data-melt-menu-id="${s.id}"]`)).filter(e=>f(e))}function ft(s){!s||!pe(s)||(s.setAttribute("data-disabled",""),s.setAttribute("aria-disabled","true"))}function It(s){if(!He)return;const e=s.get();e&&(window.clearTimeout(e),s.set(null))}function tt(s){return s.pointerType==="mouse"}function nt(s,e){if(!s)return;const l=s.closest(`${e()}, ${e("submenu")}`);f(l)&&s.setAttribute("data-melt-menu-id",l.id)}function Lt(s,e){s.preventDefault();const l=document.activeElement,d=s.currentTarget;if(!f(l)||!f(d))return;const h=Pe(d);if(!h.length)return;const _=h.filter(M=>!(M.hasAttribute("data-disabled")||M.getAttribute("disabled")==="true")),o=_.indexOf(l);let a;switch(s.key){case j.ARROW_DOWN:e?a=o<_.length-1?o+1:0:a=o<_.length-1?o+1:o;break;case j.ARROW_UP:e?a=o>0?o-1:_.length-1:a=o<0?_.length-1:o>0?o-1:0;break;case j.HOME:a=0;break;case j.END:a=_.length-1;break;default:return}Y(_[a])}function yn(s,e){if(!e)return!1;const l={x:s.clientX,y:s.clientY};return En(l,e)}function En(s,e){const{x:l,y:d}=s;let h=!1;for(let _=0,o=e.length-1;_<e.length;o=_++){const a=e[_].x,M=e[_].y,F=e[o].x,R=e[o].y;M>d!=R>d&&l<(F-a)*(d-M)/(R-M)+a&&(h=!h)}return h}function On(s){const e=document.activeElement;if(!f(e))return!1;const l=e.closest(`[data-id="${s}"]`);return f(l)}function _n(s){return s?"open":"closed"}const kn={arrowSize:8,positioning:{placement:"bottom"},preventScroll:!0,closeOnEscape:!0,closeOnOutsideClick:!0,portal:void 0,loop:!1,dir:"ltr",defaultOpen:!1,forceVisible:!1,typeahead:!0,closeFocus:void 0,disableFocusFirstItem:!1,closeOnItemClick:!0,onOutsideClick:void 0};function Tn(s){const e={...kn,...s},l=gt(Ut(e,"ids")),d=e.open??q(e.defaultOpen),h=mt(d,e?.onOpenChange),_=J(q(null)),o=J(q(null)),a=J(q(null)),{elements:M,builders:F,ids:R,states:L,options:U}=hn({rootOptions:l,rootOpen:h,rootActiveTrigger:J(_),nextFocusable:J(o),prevFocusable:J(a),selector:"dropdown-menu",removeScroll:!0,ids:e.ids});return{ids:R,elements:M,states:L,builders:F,options:U}}function je(){return{NAME:"menu",SUB_NAME:"menu-submenu",RADIO_GROUP_NAME:"menu-radiogroup",CHECKBOX_ITEM_NAME:"menu-checkboxitem",RADIO_ITEM_NAME:"menu-radioitem",GROUP_NAME:"menu-group",PARTS:["arrow","checkbox-indicator","checkbox-item","content","group","item","label","radio-group","radio-item","radio-indicator","separator","sub-content","sub-trigger","trigger"]}}function Ye(){const{NAME:s}=je();return At(s)}function Cn(s){const{NAME:e,PARTS:l}=je(),d=sn("menu",l),h={...Tn({...zt(s),forceVisible:!0}),getAttrs:d};return Mt(e,h),{...h,updateOption:Vt(h.options)}}function $n(s){const{CHECKBOX_ITEM_NAME:e}=je(),{builders:{createCheckboxItem:l},getAttrs:d}=Ye(),h=l(zt(s));return Mt(e,h.states.checked),{...h,updateOption:Vt(h.options),getAttrs:d}}function er(){const{CHECKBOX_ITEM_NAME:s}=je();return At(s)}function wn(){const{GROUP_NAME:s}=je(),{elements:{group:e},getAttrs:l}=Ye(),d=Xt();return Mt(s,d),{group:e,id:d,getAttrs:l}}function tr(){const{GROUP_NAME:s}=je(),e=At(s)??Xt(),{elements:{groupLabel:l},getAttrs:d}=Ye();return{groupLabel:l,id:e,getAttrs:d}}function In(s){const l={...{side:"bottom",align:"center"},...s},{options:{positioning:d}}=Ye();fn(d)(l)}var An=We("<div><!></div>");function Mn(s,e){const l=Ce(e,["children","$$slots","$$events","$$legacy"]),d=Ce(l,["asChild","el"]);ot(e,!1);const h=pt(),_=()=>st(F,"$group",h),o=xt();let a=g(e,"asChild",8,!1),M=g(e,"el",28,()=>{});const{group:F,id:R,getAttrs:L}=wn(),U=L("group");N(()=>_(),()=>{Pt(o,_()(R))}),N(()=>C(o),()=>{Object.assign(C(o),U)}),bt(),it();var Q=ae(),ne=oe(Q);{var Z=K=>{var w=ae(),B=oe(w);ue(B,e,"default",{get builder(){return C(o)}},null),G(K,w)},k=K=>{var w=An();let B;var P=xe(w);ue(P,e,"default",{get builder(){return C(o)}},null),De(w),Ke(w,V=>M(V),()=>M()),Be(w,V=>C(o).action?.(V)),Se(()=>B=Ne(w,B,{...C(o),...d})),G(K,w)};Te(ne,K=>{a()?K(Z):K(k,!1)})}G(s,Q),at()}function Pn(s,e){ot(e,!1);const l=pt(),d=()=>st(P,"$idValues",l);let h=g(e,"closeOnOutsideClick",24,()=>{}),_=g(e,"closeOnEscape",24,()=>{}),o=g(e,"portal",24,()=>{}),a=g(e,"open",28,()=>{}),M=g(e,"onOpenChange",24,()=>{}),F=g(e,"preventScroll",24,()=>{}),R=g(e,"loop",24,()=>{}),L=g(e,"dir",24,()=>{}),U=g(e,"typeahead",24,()=>{}),Q=g(e,"closeFocus",24,()=>{}),ne=g(e,"disableFocusFirstItem",24,()=>{}),Z=g(e,"closeOnItemClick",24,()=>{}),k=g(e,"onOutsideClick",24,()=>{});const{states:{open:K},updateOption:w,ids:B}=Cn({closeOnOutsideClick:h(),closeOnEscape:_(),portal:o(),forceVisible:!0,defaultOpen:a(),preventScroll:F(),loop:R(),dir:L(),typeahead:U(),closeFocus:Q(),disableFocusFirstItem:ne(),closeOnItemClick:Z(),onOutsideClick:k(),onOpenChange:({next:H})=>(a()!==H&&(M()?.(H),a(H)),H)}),P=rt([B.menu,B.trigger],([H,de])=>({menu:H,trigger:de}));N(()=>x(a()),()=>{a()!==void 0&&K.set(a())}),N(()=>x(h()),()=>{w("closeOnOutsideClick",h())}),N(()=>x(_()),()=>{w("closeOnEscape",_())}),N(()=>x(o()),()=>{w("portal",o())}),N(()=>x(F()),()=>{w("preventScroll",F())}),N(()=>x(R()),()=>{w("loop",R())}),N(()=>x(L()),()=>{w("dir",L())}),N(()=>x(Q()),()=>{w("closeFocus",Q())}),N(()=>x(ne()),()=>{w("disableFocusFirstItem",ne())}),N(()=>x(U()),()=>{w("typeahead",U())}),N(()=>x(Z()),()=>{w("closeOnItemClick",Z())}),N(()=>x(k()),()=>{w("onOutsideClick",k())}),bt(),it();var V=ae(),re=oe(V);ue(re,e,"default",{get ids(){return d()}},null),G(s,V),at()}var xn=We("<div><!></div>"),Dn=We("<div><!></div>"),Sn=We("<div><!></div>"),Fn=We("<div><!></div>"),Rn=We("<div><!></div>");function Kn(s,e){const l=Ce(e,["children","$$slots","$$events","$$legacy"]),d=Ce(l,["transition","transitionConfig","inTransition","inTransitionConfig","outTransition","outTransitionConfig","asChild","id","side","align","sideOffset","alignOffset","collisionPadding","avoidCollisions","collisionBoundary","sameWidth","fitViewport","strategy","overlap","el"]);ot(e,!1);const h=pt(),_=()=>st(fe,"$menu",h),o=()=>st(Je,"$open",h),a=xt();let M=g(e,"transition",24,()=>{}),F=g(e,"transitionConfig",24,()=>{}),R=g(e,"inTransition",24,()=>{}),L=g(e,"inTransitionConfig",24,()=>{}),U=g(e,"outTransition",24,()=>{}),Q=g(e,"outTransitionConfig",24,()=>{}),ne=g(e,"asChild",8,!1),Z=g(e,"id",24,()=>{}),k=g(e,"side",8,"bottom"),K=g(e,"align",8,"center"),w=g(e,"sideOffset",8,0),B=g(e,"alignOffset",8,0),P=g(e,"collisionPadding",8,8),V=g(e,"avoidCollisions",8,!0),re=g(e,"collisionBoundary",24,()=>{}),H=g(e,"sameWidth",8,!1),de=g(e,"fitViewport",8,!1),ut=g(e,"strategy",8,"absolute"),qe=g(e,"overlap",8,!1),$=g(e,"el",28,()=>{});const{elements:{menu:fe},states:{open:Je},ids:ht,getAttrs:yt}=Ye(),we=Ht(),Et=yt("content");N(()=>x(Z()),()=>{Z()&&ht.menu.set(Z())}),N(()=>_(),()=>{Pt(a,_())}),N(()=>C(a),()=>{Object.assign(C(a),Et)}),N(()=>(o(),x(k()),x(K()),x(w()),x(B()),x(P()),x(V()),x(re()),x(H()),x(de()),x(ut()),x(qe())),()=>{o()&&In({side:k(),align:K(),sideOffset:w(),alignOffset:B(),collisionPadding:P(),avoidCollisions:V(),collisionBoundary:re(),sameWidth:H(),fitViewport:de(),strategy:ut(),overlap:qe()})}),bt(),it();var lt=ae(),Ot=oe(lt);{var _t=he=>{var Ie=ae(),Qe=oe(Ie);ue(Qe,e,"default",{get builder(){return C(a)}},null),G(he,Ie)},kt=he=>{var Ie=ae(),Qe=oe(Ie);{var Tt=ge=>{var X=xn();let ye;var Ge=xe(X);ue(Ge,e,"default",{get builder(){return C(a)}},null),De(X),Ke(X,me=>$(me),()=>$()),Be(X,me=>C(a).action?.(me)),Fe(()=>Re("m-keydown",X,we)),Se(()=>ye=Ne(X,ye,{...C(a),...d})),et(3,X,M,F),G(ge,X)},Ct=ge=>{var X=ae(),ye=oe(X);{var Ge=Ee=>{var ee=Dn();let Oe;var Ae=xe(ee);ue(Ae,e,"default",{get builder(){return C(a)}},null),De(ee),Ke(ee,ve=>$(ve),()=>$()),Be(ee,ve=>C(a).action?.(ve)),Fe(()=>Re("m-keydown",ee,we)),Se(()=>Oe=Ne(ee,Oe,{...C(a),...d})),et(1,ee,R,L),et(2,ee,U,Q),G(Ee,ee)},me=Ee=>{var ee=ae(),Oe=oe(ee);{var Ae=le=>{var se=Sn();let _e;var Le=xe(se);ue(Le,e,"default",{get builder(){return C(a)}},null),De(se),Ke(se,t=>$(t),()=>$()),Be(se,t=>C(a).action?.(t)),Fe(()=>Re("m-keydown",se,we)),Se(()=>_e=Ne(se,_e,{...C(a),...d})),et(1,se,R,L),G(le,se)},ve=le=>{var se=ae(),_e=oe(se);{var Le=r=>{var n=Fn();let i;var u=xe(n);ue(u,e,"default",{get builder(){return C(a)}},null),De(n),Ke(n,T=>$(T),()=>$()),Be(n,T=>C(a).action?.(T)),Fe(()=>Re("m-keydown",n,we)),Se(()=>i=Ne(n,i,{...C(a),...d})),et(2,n,U,Q),G(r,n)},t=r=>{var n=ae(),i=oe(n);{var u=T=>{var D=Rn();let A;var v=xe(D);ue(v,e,"default",{get builder(){return C(a)}},null),De(D),Ke(D,b=>$(b),()=>$()),Be(D,b=>C(a).action?.(b)),Fe(()=>Re("m-keydown",D,we)),Se(()=>A=Ne(D,A,{...C(a),...d})),G(T,D)};Te(i,T=>{o()&&T(u)},!0)}G(r,n)};Te(_e,r=>{U()&&o()?r(Le):r(t,!1)},!0)}G(le,se)};Te(Oe,le=>{R()&&o()?le(Ae):le(ve,!1)},!0)}G(Ee,ee)};Te(ye,Ee=>{R()&&U()&&o()?Ee(Ge):Ee(me,!1)},!0)}G(ge,X)};Te(Qe,ge=>{M()&&o()?ge(Tt):ge(Ct,!1)},!0)}G(he,Ie)};Te(Ot,he=>{ne()&&o()?he(_t):he(kt,!1)})}G(s,lt),at()}var Bn=We("<button><!></button>");function Nn(s,e){const l=Ce(e,["children","$$slots","$$events","$$legacy"]),d=Ce(l,["asChild","id","el"]);ot(e,!1);const h=pt(),_=()=>st(R,"$trigger",h),o=xt();let a=g(e,"asChild",8,!1),M=g(e,"id",24,()=>{}),F=g(e,"el",28,()=>{});const{elements:{trigger:R},ids:L,getAttrs:U}=Ye(),Q=Ht(),ne=U("trigger");N(()=>x(M()),()=>{M()&&L.trigger.set(M())}),N(()=>_(),()=>{Pt(o,_())}),N(()=>C(o),()=>{Object.assign(C(o),ne)}),bt(),it();var Z=ae(),k=oe(Z);{var K=B=>{var P=ae(),V=oe(P);ue(V,e,"default",{get builder(){return C(o)}},null),G(B,P)},w=B=>{var P=Bn();let V;var re=xe(P);ue(re,e,"default",{get builder(){return C(o)}},null),De(P),Ke(P,H=>F(H),()=>F()),Be(P,H=>C(o).action?.(H)),Fe(()=>Re("m-keydown",P,Q)),Fe(()=>Re("m-pointerdown",P,Q)),Se(()=>V=Ne(P,V,{...C(o),type:"button",...d})),G(B,P)};Te(k,B=>{a()?B(K):B(w,!1)})}G(s,Z),at()}function nr(s,e){const l=Ce(e,["children","$$slots","$$events","$$legacy"]),d=Ce(l,["class","sideOffset","transition","transitionConfig"]);ot(e,!1);let h=g(e,"class",24,()=>{}),_=g(e,"sideOffset",8,4),o=g(e,"transition",8,on),a=g(e,"transitionConfig",24,()=>{});it();var M=Jt(()=>an("bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border p-1 shadow-md focus:outline-none",h()));Kn(s,tn({get transition(){return o()},get transitionConfig(){return a()},get sideOffset(){return _()},get class(){return C(M)}},()=>d,{$$events:{keydown(F){en.call(this,e,F)}},children:(F,R)=>{var L=ae(),U=oe(L);ue(U,e,"default",{},null),G(F,L)},$$slots:{default:!0}})),at()}const rr=Pn,sr=Nn,ir=Mn;export{nr as D,ir as G,rr as R,sr as T,tr as a,er as b,Ye as g,$n as s};
