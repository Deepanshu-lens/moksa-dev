import{i as Ee}from"./legacy.CS2Xrhg9.js";import{p as Fe,e as s,r,s as l,t as q,b as Te,g as e,j as ae,c as d,m as F,l as Be,a as Xe,f as z,w as B,d as Se,aM as We}from"./effects.BhUQh3a6.js";import{s as X}from"./render.B8Ti1KQa.js";import{e as ye,i as we}from"./each.CE_wtWlh.js";import{a as i,t as c,e as be,b as re}from"./template.gBe-IW8Y.js";import{s as He,c as Ye,i as xe,h as Ze,r as Ne}from"./attributes.Bzn9xiO9.js";import{b as Ue}from"./input.sl8v-pyr.js";import{s as Me,a as le}from"./store.Cu8l1F6D.js";import{p as N}from"./props.B2sXXNEW.js";import{s as Ce}from"./class.DrPxmDwO.js";import{c as Ge}from"./utils.CC9b3hXT.js";import{E as et}from"./ellipsis-vertical.F8AGEHeY.js";import{d as tt}from"./stores.DcGmp1DO.js";import{u as rt}from"./user.DTKNVqgd.js";import{p as at}from"./pb.BjVtZEqq.js";import"./ui.AXpcjr67.js";import{p as lt}from"./person-counter.DqCe8OBX.js";import{a as Le,i as st,t as ot}from"./all-events.CYEczPXl.js";import{E as it}from"./EventAlertModal.B_vn4i1z.js";import{a as nt}from"./userLogs.FmCv2qlm.js";import{L as Ie}from"./loader-circle.GLjY1Qqv.js";import dt from"./NodeSelection.GJgFzr-p.js";import{B as $e}from"./button.KrNygnVt.js";import{R as Oe,T as Re,P as Ve}from"./index.BAWMrix_.js";import{C as vt}from"./checkbox.zkmSZOFD.js";import{L as ve}from"./label.fszyJLBn.js";import{S as je}from"./separator.Ct86z5eC.js";import{C as ct}from"./calendar.5_wRFB8N.js";import{w as ft}from"./index.Syity6yz.js";import{$ as pt,f as mt}from"./create.DJFv7QJ3.js";import{C as ut}from"./calendar-prev-button.CdcO471Q.js";import{t as gt}from"./Toaster.svelte_svelte_type_style_lang.BeLkcojC.js";import{X as _t}from"./x.CDbvqleL.js";import{F as ht}from"./filter.CEuYQ6jG.js";import"./this.CmfLgYlZ.js";import"./Icon.DvIACLrv.js";import"./index.ck8vIaH5.js";import"./updater.1_cAstJq.js";import"./index-client.CAqXSNTC.js";import"./index.Dc6kRK_F.js";import"./focus.B8v0om3D.js";import"./index.Bv5ivVzj.js";import"./userDetails.C512u9q6.js";import"./index.CV3oe3Og.js";import"./create.CF7Sq6TA.js";import"./chevron-down.L3QSLAlw.js";import"./helpers.DnLv66qw.js";import"./node.Bxisulq9.js";import"./create.gm8meUqM.js";import"./focus.DEihphdD.js";import"./chevron-right.CaU_NBzd.js";import"./chevron-left.CRYy3oZx.js";var xt=c('<div class="bg-transparent rounded-md p-2 flex flex-col gap-3 border border-[#e4e4e4] dark:border-[#333] scale-100 w-full"><p class="text-sm font-semibold hover:underline cursor-pointer"> </p> <p class="text-xs text-[#727272] dark:text-slate-300"> </p> <div class="flex items-center justify-between"><img alt="thumbnail"></div> <!></div>');function $t(U,m){Fe(m,!1);let $=N(m,"event",8);Ee();var T=xt(),P=s(T),y=s(P,!0);r(P);var f=l(P,2),p=s(f,!0);q(()=>X(p,new Date($().created).toLocaleString())),r(f);var x=l(f,2),v=s(x);const w=ae(()=>Ye(Ge("inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-black")));r(x);var S=l(x,2);et(S,{class:"absolute top-2 right-2 text-black h-5 w-5"}),r(T),q(()=>{X(y,$().title),Ce(v,e(w),""),He(v,"src","data:image/jpeg;base64,"+$().frameImage)}),i(U,T),Te()}var yt=c('<div><span></span> <p class="text-[#2c2c2c] dark:text-slate-200 font-bold"> </p> <p class="text-[#727272] dark:text-slate-400 text-sm font-medium"> </p></div>');function qe(U,m){Fe(m,!1);const $=Me(),T=()=>le(tt,"$mode",$);let P=N(m,"color",8),y=N(m,"heading",8),f=N(m,"start",24,()=>new Date().toLocaleDateString());N(m,"end",24,()=>new Date().toLocaleDateString()),Ee();var p=yt(),x=s(p);Ce(x,"absolute left-0 top-0 w-1 h-full svelte-unmm94");var v=l(x,2),w=s(v,!0);r(v);var S=l(v,2),C=s(S);r(S),r(p),q(()=>{Ce(p,`${`relative h-[65px] bg-[#F2F2F2] dark:bg-[#333] w-full py-2 px-6 ${T()==="dark"?"pointy-dark":"pointy-right"}`??""} svelte-unmm94`),He(x,"style",`background-color: ${P()??""}`),X(w,y()),X(C,`${f()??""} - 24 Hrs`)}),i(U,p),Te()}var wt=c('<div class="col-span-5 flex h-full w-full"><!> Fetching Events...</div>'),bt=c("<div><!></div>"),Et=c('<div class="w-full flex justify-center items-center h-10 mt-2 text-gray-500"> </div>'),Ft=c('<div class="flex h-full w-full flex-shrink-0 flex-col gap-4 lg:col-span-1"><!> <div class="event-grid-container flex h-full max-h-[calc(100vh-175px)] w-full flex-col gap-2 overflow-y-auto"></div></div>'),Tt=c('<img alt="heatmap" loading="lazy" class="aspect-video flex-shrink-0 scale-100">'),Dt=c('<div class="w-full flex justify-center items-center h-10 mt-2 text-gray-500">No Heatmap available.</div>'),kt=c('<div class="flex h-full w-full flex-shrink-0 flex-col gap-4 lg:col-span-1"><div class="flex h-full w-full flex-shrink-0 flex-col gap-4 lg:col-span-5"><!> <div class="flex h-full max-h-[calc(100vh-14rem)] w-full flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-y-auto"></div></div></div>'),Pt=c('<div class="col-span-5 w-full flex justify-center items-center h-10 mt-2 gap-2"><!> Loading more events...</div>'),St=c('<div class="flex flex-row gap-5 overflow-x-auto lg:grid lg:grid-cols-5 lg:gap-x-8 lg:overflow-x-visible"><!> <!></div> <!>',1),Lt=c('<div class="container mx-auto"><section class="relative h-full w-full py-4"><!></section></div> <!>',1);function jt(U,m){Fe(m,!1);const $=Me(),T=()=>le(st,"$isEventsLoading",$),P=()=>le(Le,"$allEvents",$),y=()=>le(ot,"$totalAllEvent",$),f=()=>le(rt,"$user",$);let p=N(m,"selectedEventTypeFilters",8),x=N(m,"date",8),v=N(m,"time",8),w=F(1);const S=10;let C=F(!1),I=F(null),H=F([]),M=F([]);Le.subscribe(t=>d(H,t)),lt.subscribe(t=>d(M,t));let ce=F(e(H)),fe=F(e(M)),G=F();const pe=async()=>{if(!(T()||e(C)||P().length>=y())){d(C,!0);try{const t=await at.collection("events").getList(e(w)+1,S);Le.update(o=>[...o,...t.items]),d(w,e(w)+1)}catch(t){console.error("Error fetching more events:",t)}finally{d(C,!1)}}},De=t=>{const{scrollTop:o,clientHeight:u,scrollHeight:h}=t.target;o+u>=h-5&&pe()},me=[{type:"person",heading:"Person Detection",color:"#FF4764"},{type:"fire",heading:"Fire Detection",color:"#FF5733"},{type:"face",heading:"Face Detection",color:"#24DA8E"},{type:"alpr",heading:"Vehicle Detection",color:"#8A2BE2"}];function ue(t,o){return o?t.filter(u=>{const h=new Date(u.created),Y=o.year,R=String(o.month).padStart(2,"0"),Z=String(o.day).padStart(2,"0"),ie=`${Y}-${R}-${Z}`;return h.toISOString().split("T")[0]===ie}):t}function ke(t,o){return!o?.startTime||!o?.endTime?t:t.filter(u=>{const h=new Date(u.created).toTimeString().slice(0,5);return h>=o.startTime&&h<=o.endTime})}function ge(t){return e(ce).filter(o=>o.type===t)}function _e(t){nt(`User viewed event ${t?.title}`,f()?.email||"",f()?.id||""),d(I,{...t})}function Pe(){d(I,null)}Be(()=>(e(H),Se(x()),Se(v()),e(M)),()=>{let t=ue(e(H),x()),o=ke(t,v());d(ce,o);let u=ue(e(M),x()),h=ke(u,v());d(fe,h)}),Be(()=>Se(p()),()=>{p().length===0?d(G,me):d(G,me.filter(t=>p().includes(t.type)))}),Xe(),Ee();var J=Lt(),se=z(J),O=s(se),K=s(O);{var Q=t=>{var o=wt(),u=s(o);Ie(u,{class:"animate-spin"}),B(),r(o),i(t,o)},W=t=>{var o=St(),u=z(o),h=s(u);ye(h,1,()=>e(G),we,(b,g)=>{let L=()=>e(g).type,j=()=>e(g).heading,V=()=>e(g).color;var D=Ft(),k=s(D);qe(k,{get heading(){return j()},get color(){return V()}});var a=l(k,2);ye(a,5,()=>ge(L()),we,(_,n)=>{var E=bt(),ne=s(E);$t(ne,{get event(){return e(n)}}),r(E),be("click",E,()=>_e(e(n))),i(_,E)},_=>{var n=Et(),E=s(n);q(()=>X(E,`No ${j().toLowerCase()??""} events available.`)),r(n),i(_,n)}),r(a),r(D),be("scroll",a,De),i(b,D)});var Y=l(h,2);{var R=b=>{var g=kt(),L=s(g),j=s(L);qe(j,{heading:"Heatmap",color:"#FFB347"});var V=l(j,2);ye(V,5,()=>e(fe),we,(D,k)=>{var a=Tt();q(()=>He(a,"src","data:image/jpeg;base64,"+e(k).image)),Ze(a),i(D,a)},D=>{var k=Dt();i(D,k)}),r(V),r(L),r(g),i(b,g)};xe(Y,b=>{(p().length===0||p().includes("heatmap"))&&b(R)})}r(u);var Z=l(u,2);{var ie=b=>{var g=Pt(),L=s(g);Ie(L,{class:"animate-spin"}),B(),r(g),i(b,g)};xe(Z,b=>{e(C)&&b(ie)})}i(t,o)};xe(K,t=>{T()&&e(w)===1?t(Q):t(W,!1)})}r(O),r(se);var oe=l(se,2);{var he=t=>{it(t,{get event(){return e(I)},onClose:Pe})};xe(oe,t=>{e(I)&&t(he)})}i(U,J),Te()}var Bt=c("<!>Filters",1),Ct=c('<div class="flex items-center justify-between w-1/2 gap-2"><!> <!></div>'),Ht=c("<!> ",1),Mt=c("<!> <!>",1),At=c('<div class="flex w-full items-center justify-between my-2"><h1>Events Filter</h1> <!></div> <p>Types</p> <!> <div class="grid grid-cols-2 gap-4 w-full"></div> <p class="mt-3">Date</p> <!> <div class="flex items-center justify-between w-1/2 gap-2"><!> <!></div> <p class="mt-3">Time</p> <!> <div class="flex flex-col gap-2"><div class="flex items-center justify-between"><!> <!></div> <div class="flex items-center gap-3"><div><!> <input type="time" id="startTime" placeholder="00:00" class="rounded-md border-2 text-sm px-2 py-2 leading-tight w-full"></div> <div><!> <input type="time" id="endTime" placeholder="00:00" class="rounded-md border-2 text-sm px-2 py-2 leading-tight w-full"></div></div></div>',1),zt=c("<!> <!>",1),Nt=c('<div class="w-[95%] px-4 ml-8 mt-3 flex justify-between items-center"><div class="w-52"><!></div> <!></div> <section class="right flex-1 flex h-screen w-full justify-between"><div class="w-full h-full px-4"><!></div></section>',1);function Nr(U,m){Fe(m,!1);const $=Me(),T=()=>le(p,"$selectedEventFilters",$),P=[{type:"person",heading:"Person Detection",color:"#FF4764"},{type:"fire",heading:"Fire Detection",color:"#FF5733"},{type:"face",heading:"Face Detection",color:"#24DA8E"},{type:"heatmap",heading:"Heatmap Detection",color:"#FFB347"},{type:"alpr",heading:"Vehicle Detection",color:"#8A2BE2"}];let y=F(""),f=F(""),p=ft([]);const x=new pt("en-US",{dateStyle:"short"});let v=F(void 0),w=F(!1);function S(){e(f)&&e(f)<=e(y)&&(d(f,""),gt.error("End time must be after start time"))}function C(){d(f,""),d(y,""),d(v,void 0),p.set([])}Be(()=>e(v),()=>{e(v)&&d(w,!1)}),Xe(),Ee();var I=Nt(),H=z(I),M=s(H),ce=s(M);dt(ce,{allNodes:!1}),r(M);var fe=l(M,2);Oe(fe,{children:(ue,ke)=>{var ge=zt(),_e=z(ge);Re(_e,{children:(J,se)=>{$e(J,{variant:"outline",class:"flex items-center gap-2",children:(O,K)=>{var Q=Bt(),W=z(Q);ht(W,{size:18}),B(),i(O,Q)},$$slots:{default:!0}})},$$slots:{default:!0}});var Pe=l(_e,2);Ve(Pe,{class:"mt-2 w-80",children:(J,se)=>{var O=At(),K=z(O),Q=l(s(K),2);$e(Q,{variant:"outline",size:"sm",$$events:{click:C},children:(a,_)=>{B();var n=re("Clear all");i(a,n)},$$slots:{default:!0}}),r(K);var W=l(K,4);je(W,{class:"my-2"});var oe=l(W,2);ye(oe,5,()=>P,we,(a,_)=>{var n=Ct(),E=s(n),ne=ae(()=>T().includes(e(_).type));vt(E,{get checked(){return e(ne)},onCheckedChange:ee=>{ee?p.update(A=>[...A,e(_).type]):p.update(A=>A.filter(te=>te!==e(_).type))}});var de=l(E,2);ve(de,{class:"text-sm text-nowrap",children:(ee,A)=>{B();var te=re();q(()=>X(te,e(_).heading)),i(ee,te)},$$slots:{default:!0}}),r(n),i(a,n)}),r(oe);var he=l(oe,4);je(he,{class:"my-2"});var t=l(he,2),o=s(t);ve(o,{class:"text-sm text-nowrap",children:(a,_)=>{B();var n=re("Select a date to filter by:");i(a,n)},$$slots:{default:!0}});var u=l(o,2);Oe(u,{get open(){return e(w)},set open(a){d(w,a)},children:(a,_)=>{var n=Mt(),E=z(n);Re(E,{asChild:!0,children:We,$$slots:{default:(de,ee)=>{const A=ae(()=>ee.builder);var te=ae(()=>Ge("w-[200px] h-8 justify-start text-left font-normal",!e(v)&&"text-muted-foreground")),Je=ae(()=>[e(A)]);$e(de,{variant:"outline",get class(){return e(te)},get builders(){return e(Je)},children:(Ke,Ut)=>{var Ae=Ht(),ze=z(Ae);ct(ze,{class:"mr-2 h-4 w-4"});var Qe=l(ze);q(()=>X(Qe,` ${(e(v)?x.format(e(v).toDate(mt())):"Pick a date")??""}`)),i(Ke,Ae)},$$slots:{default:!0}})}}});var ne=l(E,2);Ve(ne,{class:"w-auto p-0",children:(de,ee)=>{ut(de,{initialFocus:!0,get value(){return e(v)},set value(A){d(v,A)},$$legacy:!0})},$$slots:{default:!0}}),i(a,n)},$$slots:{default:!0},$$legacy:!0}),r(t);var h=l(t,4);je(h,{class:"my-2"});var Y=l(h,2),R=s(Y),Z=s(R);ve(Z,{class:"text-sm text-nowrap",children:(a,_)=>{B();var n=re("Select a time to filter by:");i(a,n)},$$slots:{default:!0}});var ie=l(Z,2);$e(ie,{variant:"outline",size:"icon",class:"size-6 rounded-full",$$events:{click:()=>{d(y,""),d(f,"")}},children:(a,_)=>{_t(a,{size:12})},$$slots:{default:!0}}),r(R);var b=l(R,2),g=s(b),L=s(g);ve(L,{children:(a,_)=>{B();var n=re("Start Time:");i(a,n)},$$slots:{default:!0}});var j=l(L,2);Ne(j),r(g);var V=l(g,2),D=s(V);ve(D,{children:(a,_)=>{B();var n=re("End Time:");i(a,n)},$$slots:{default:!0}});var k=l(D,2);Ne(k),r(V),r(b),r(Y),Ue(j,()=>e(y),a=>d(y,a)),be("input",j,S),Ue(k,()=>e(f),a=>d(f,a)),be("input",k,S),i(J,O)},$$slots:{default:!0}}),i(ue,ge)},$$slots:{default:!0}}),r(H);var G=l(H,2),pe=s(G),De=s(pe),me=ae(()=>({startTime:e(y),endTime:e(f)}));jt(De,{get selectedEventTypeFilters(){return T()},get date(){return e(v)},get time(){return e(me)}}),r(pe),r(G),i(U,I),Te()}export{Nr as default};
