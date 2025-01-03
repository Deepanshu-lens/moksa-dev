import{i as fe}from"./legacy.CS2Xrhg9.js";import{p as ve,b as pe,e as s,f as ue,s as t,r as a,t as _}from"./effects.BhUQh3a6.js";import{s as x}from"./render.B8Ti1KQa.js";import{i as w}from"./attributes.Bzn9xiO9.js";import{e as we,a as m,t as ge,c as be,b as v}from"./template.gBe-IW8Y.js";import{a as _e}from"./create.DJFv7QJ3.js";import{s as xe,a as G}from"./store.Cu8l1F6D.js";import{u as ye,z as H,C as he,p}from"./pb.BjVtZEqq.js";import{I as y}from"./input.BKj2mia6.js";import{t as c}from"./Toaster.svelte_svelte_type_style_lang.BeLkcojC.js";import{v as Pe}from"./index.DY4kEioI.js";import{I as h}from"./Icon.BHk6ogbY.js";import{B as $e}from"./button.KrNygnVt.js";import{a as Se}from"./authLogs.Cvxf9YN5.js";import{c as Ce}from"./create-form.Dfv7Pl4p.js";import"./index.Syity6yz.js";import"./index-client.CAqXSNTC.js";import"./input.sl8v-pyr.js";import"./props.B2sXXNEW.js";import"./utils.CC9b3hXT.js";import"./html.CGpePhbg.js";import"./this.CmfLgYlZ.js";import"./userDetails.C512u9q6.js";var Ae=ge('<form class="space-y-4 w-full"><div class="grid w-full max-w-sm items-center gap-1.5"><div class="relative"><!> <!></div> <div class="text-rose-500 text-xs"><!></div></div> <div class="grid w-full max-w-sm items-center gap-1.5"><div class="relative"><!> <!></div> <div class="text-rose-500 text-xs"><!></div></div> <div class="grid w-full max-w-sm items-center pb-4"><div class="relative"><!> <!></div> <div class="text-rose-500 text-xs"><!></div></div> <div class="grid w-full max-w-sm items-center pb-4"><div class="relative"><!> <!></div> <div class="text-rose-500 text-xs"><!></div></div> <div class="flex flex-col items-center justify-between mb-10 sm:mb-0"><!> <button class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80] /[.7] mt-4">Already have an account? <span class="ml-1 text-primary font-semibold">Log In</span></button></div></form>');function Xe(J,K){ve(K,!1);const F=xe(),d=()=>G(T,"$errors",F),E=()=>G(X,"$isSubmitting",F),O=ye.pick({name:!0,email:!0}).extend({password:H.string().min(8,{message:"Password must be at least 8 characters long."}),confirmPassword:H.string().min(8,{message:"Confirm Password must be at least 8 characters long"})}).refine(e=>e.password===e.confirmPassword,{message:"Passwords must match",path:["confirmPassword"]}),{form:Q,errors:T,reset:W,isSubmitting:X}=Ce({initialValues:{name:"",email:"",password:"",confirmPassword:""},extend:Pe({schema:O}),onSubmit:async e=>{if(await Y(e.name,e.email,e.password)){await Se("User Registered",e.email),c.success(`${e.name.split(" ")[0]}, welcome to Moksa AI.`),W(),window.api?window.api.navigate("/login"):window.location.href="/login";return}},onError:e=>{console.log("Form validation failed:",e)}});async function Y(e,r,o){let n,l,u,i;const f=new he("https://vms.lenscorp.cloud");if(window.api){try{l=await f.collection("session").create({owned:!0}),l?(console.log("this ran"),u=await p.collection("session").create(l)):u=await p.collection("session").create({owned:!0})}catch(b){console.error("Error creating session:-",b),c.error("Something went wrong. Please try again.");return}try{n=await f.collection("users").create({name:e,email:r,password:o,passwordConfirm:o,session:l.id}),n?i=await p.collection("users").create({...n,password:o,passwordConfirm:o,email:r}):i=await p.collection("users").create({name:e,email:r,password:o,passwordConfirm:o,session:u.id})}catch{c.error("Registration failed. Please try again.");return}if(i)return i;if(n)return n;c.error("Registration failed. Please try again.");return}else{try{l=await p.collection("session").create({owned:!0}),console.log("session",l)}catch{c.error("Something went wrong. Please try again.");return}try{n=await p.collection("users").create({name:e,email:r,password:o,passwordConfirm:o,session:l.id})}catch{c.error("Registration failed. Please try again.");return}if(n)return n;c.error("Registration failed. Please try again.");return}}fe();var g=Ae(),P=s(g),$=s(P),B=s($);h(B,{icon:"material-symbols:user-attributes",class:"w-22 h-22 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"});var Z=t(B,2);y(Z,{type:"text",name:"name",placeholder:"Full Name",class:"pl-10 w-full border border-gray-300 rounded-md"}),a($);var D=t($,2),ee=s(D);{var re=e=>{var r=v();_(()=>x(r,d().name)),m(e,r)};w(ee,e=>{d().name&&e(re)})}a(D),a(P);var S=t(P,2),C=s(S),L=s(C);h(L,{icon:"material-symbols:mail-rounded",class:"w-22 h-22 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"});var se=t(L,2);y(se,{type:"email",name:"email",placeholder:"Email Address",class:"pl-10 w-full border border-gray-300 rounded-md"}),a(C);var U=t(C,2),ae=s(U);{var te=e=>{var r=v();_(()=>x(r,d().email)),m(e,r)};w(ae,e=>{d().email&&e(te)})}a(U),a(S);var A=t(S,2),I=s(A),j=s(I);h(j,{icon:"material-symbols:password",class:"w-22 h-22 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"});var oe=t(j,2);y(oe,{type:"password",name:"password",placeholder:"Password",class:"pl-10 w-full border border-gray-300 rounded-md"}),a(I);var z=t(I,2),ie=s(z);{var ne=e=>{var r=v();_(()=>x(r,d().password)),m(e,r)};w(ie,e=>{d().password&&e(ne)})}a(z),a(A);var R=t(A,2),k=s(R),M=s(k);h(M,{icon:"material-symbols:password",class:"w-22 h-22 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"});var le=t(M,2);y(le,{type:"password",name:"confirmPassword",placeholder:"Confirm Password",class:"pl-10 w-full border border-gray-300 rounded-md"}),a(k);var N=t(k,2),de=s(N);{var me=e=>{var r=v();_(()=>x(r,d().confirmPassword)),m(e,r)};w(de,e=>{d().confirmPassword&&e(me)})}a(N),a(R);var V=t(R,2),q=s(V);$e(q,{get disabled(){return E()},class:"disabled:cursor-not-allowed bg-[#015A62] hover:bg-[#015A62]/[.4] text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline",type:"submit",children:(e,r)=>{var o=be(),n=ue(o);{var l=i=>{var f=v("Submitting ...");m(i,f)},u=i=>{var f=v("Sign Up");m(i,f)};w(n,i=>{E()?i(l):i(u,!1)})}m(e,o)},$$slots:{default:!0}});var ce=t(q,2);a(V),a(g),_e(g,e=>Q?.(e)),we("click",ce,()=>{window.api?window.api.navigate("/login"):window.location.href="/login"}),m(J,g),pe()}export{Xe as default};
