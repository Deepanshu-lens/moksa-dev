import 'cookie';
import 'kleur/colors';
import './chunks/astro-designed-error-pages_CnwVU_1O.mjs';
import 'es-module-lexer';
import { f as decodeKey } from './chunks/astro/server_ByR5OE_x.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_r8q7gFSn.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/deepanshukhorwal/Documents/lens/lens%20app/moksa_2.0/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"analytics.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/analytics","isIndex":false,"type":"page","pattern":"^\\/analytics$","segments":[[{"content":"analytics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/analytics.astro","pathname":"/analytics","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"atlas.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/atlas","isIndex":false,"type":"page","pattern":"^\\/atlas$","segments":[[{"content":"atlas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/atlas.astro","pathname":"/atlas","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"configuration.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/configuration","isIndex":false,"type":"page","pattern":"^\\/configuration$","segments":[[{"content":"configuration","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/configuration.astro","pathname":"/configuration","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"events.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/events","isIndex":false,"type":"page","pattern":"^\\/events$","segments":[[{"content":"events","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/events.astro","pathname":"/events","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"gallery.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/gallery","isIndex":false,"type":"page","pattern":"^\\/gallery$","segments":[[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gallery.astro","pathname":"/gallery","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"login.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"playback.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/playback","isIndex":false,"type":"page","pattern":"^\\/playback$","segments":[[{"content":"playback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/playback.astro","pathname":"/playback","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"register.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/register","isIndex":false,"type":"page","pattern":"^\\/register$","segments":[[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/register.astro","pathname":"/register","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"reports.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/reports","isIndex":false,"type":"page","pattern":"^\\/reports$","segments":[[{"content":"reports","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/reports.astro","pathname":"/reports","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}}],"base":"/","trailingSlash":"never","compressHTML":true,"assetsPrefix":"./","componentMetadata":[["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/login.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/register.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/analytics.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/atlas.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/configuration.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/events.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/gallery.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/playback.astro",{"propagation":"none","containsHead":true}],["/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/reports.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000@astro-page:src/pages/analytics@_@astro":"pages/analytics.astro.mjs","\u0000@astro-page:src/pages/atlas@_@astro":"pages/atlas.astro.mjs","\u0000@astro-page:src/pages/configuration@_@astro":"pages/configuration.astro.mjs","\u0000@astro-page:src/pages/events@_@astro":"pages/events.astro.mjs","\u0000@astro-page:src/pages/gallery@_@astro":"pages/gallery.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/playback@_@astro":"pages/playback.astro.mjs","\u0000@astro-page:src/pages/register@_@astro":"pages/register.astro.mjs","\u0000@astro-page:src/pages/reports@_@astro":"pages/reports.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-renderers":"renderers.mjs","/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_C79Z8NSi.mjs","mode-watcher":"_astro/_astro-entry_mode-watcher.D1865vRs.js","@/managers/analytics-manager.svelte":"_astro/analytics-manager.lYicin9y.js","@/managers/camera.svelte":"_astro/camera.C06FeyBM.js","@/managers/atlas.svelte":"_astro/atlas.CS3nXDnx.js","@/managers/atlas-events.svelte":"_astro/atlas-events.B-Qlw5uW.js","@/managers/person-count.svelte":"_astro/person-count.1ySFbvWQ.js","@/managers/all-events.svelte":"_astro/all-events.qfZqha9p.js","@/managers/gallery.svelte":"_astro/gallery.CKDoTiMU.js","@/components/forms/LoginForm.svelte":"_astro/LoginForm.iODb5jO9.js","@/components/forms/RegisterForm.svelte":"_astro/RegisterForm.D483Cag2.js","@/managers/events.svelte":"_astro/events.BkHqIJj2.js","@/managers/User.svelte":"_astro/User.CLppQqo1.js","/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/components/bars/PageBarItems.svelte":"_astro/PageBarItems.ofatzEyv.js","@/managers/node.svelte":"_astro/node.BMXLgHkM.js","@/managers/moksa-token.svelte":"_astro/moksa-token.D8cYCfAk.js","@astrojs/svelte/client-v5.js":"_astro/client-v5.SjX_3iOQ.js","@/components/ui/theme-button/theme-switch.svelte":"_astro/theme-switch.Dw-SgTcf.js","@/components/all-events/layout.svelte":"_astro/layout.DbkwMh_A.js","@/components/ui/sonner":"_astro/sonner.Bc9eQ2U3.js","@/components/playback/layout.svelte":"_astro/layout.DUiG4TEp.js","@/components/atlas/layout.svelte":"_astro/layout.CnZnJSvQ.js","@/managers/configuration-page.svelte":"_astro/configuration-page.CuxXCamm.js","@/components/bars/MobileNavbar.svelte":"_astro/MobileNavbar.BmIARHqp.js","@/managers/gallery-page.svelte":"_astro/gallery-page.75LlCH6i.js","@/managers/reports.svelte":"_astro/reports.TBWs8YpB.js","@/components/live/layout.svelte":"_astro/layout.CTScMlj9.js","@/components/analytics/layout.svelte":"_astro/layout.ByzKjclz.js","@/components/node/NodeSelection.svelte":"_astro/NodeSelection.CkEq8IRk.js","@/components/avatar/Avatar.svelte":"_astro/Avatar.VzKefEQn.js","@/components/node/crud/NodeActionButton.svelte":"_astro/NodeActionButton.D2zWEW4p.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["./_astro/login.DzxMY6tq.css","./favicon.png","./_astro/Avatar.VzKefEQn.js","./_astro/EventAlertModal.C9rJGOme.js","./_astro/Icon.C1EnY7QC.js","./_astro/Icon.DyX5DrYz.js","./_astro/LoginForm.iODb5jO9.js","./_astro/MobileNavbar.BmIARHqp.js","./_astro/NodeActionButton.9tfyov67.js","./_astro/NodeActionButton.D2zWEW4p.js","./_astro/NodeSelection.CkEq8IRk.js","./_astro/PageBarItems.ofatzEyv.js","./_astro/PageBarMobile2.CVhr3QiP.js","./_astro/RegisterForm.D483Cag2.js","./_astro/Toaster.BWY6fThA.css","./_astro/Toaster.svelte_svelte_type_style_lang.BVmv9t-o.js","./_astro/User.CLppQqo1.js","./_astro/_astro-entry_mode-watcher.D1865vRs.js","./_astro/all-events.Uuy87CUU.js","./_astro/all-events.qfZqha9p.js","./_astro/analytics-data.BXLobr_W.js","./_astro/analytics-manager.lYicin9y.js","./_astro/atlas-events.B-Qlw5uW.js","./_astro/atlas.CS3nXDnx.js","./_astro/attributes.CKLvY0ho.js","./_astro/authLogs.Cvxf9YN5.js","./_astro/axios.CLW4OKJy.js","./_astro/calendar-days.CKZMduLF.js","./_astro/calendar.Bz5M1WId.js","./_astro/calendar.DIfu9PpN.js","./_astro/camera.C06FeyBM.js","./_astro/camera.tm09y8tp.js","./_astro/chart.CVocvx9p.js","./_astro/checkbox.DxhquMvg.js","./_astro/chevron-down.C5AO3RM7.js","./_astro/chevron-left.ctxHc6Mm.js","./_astro/chevron-right.Csxe3OAU.js","./_astro/chevrons-up-down.DW_VRiZh.js","./_astro/class.aRYY48yX.js","./_astro/client-v5.SjX_3iOQ.js","./_astro/configuration-page.CuxXCamm.js","./_astro/create-form.BXf5V72d.js","./_astro/create.B2ks2bsr.js","./_astro/create.Br8GO9uY.js","./_astro/create.CgS1Srs1.js","./_astro/dialog-description.DLfF4S9z.js","./_astro/dialog-footer.Cr4M3bkH.js","./_astro/dropdown-menu-item.DflNz7ce.js","./_astro/dropdown-menu-separator.C5JxznFF.js","./_astro/each.Btj6gPjv.js","./_astro/effects.D69rIdB6.js","./_astro/ellipsis-vertical.Bh-7lUB1.js","./_astro/embla-carousel-autoplay.esm.DRLiV0AB.js","./_astro/events.BkHqIJj2.js","./_astro/events.CinjsTHa.js","./_astro/filter.BTh5yLeE.js","./_astro/focus.CV-Hft-j.js","./_astro/focus.DEihphdD.js","./_astro/gallery-page.75LlCH6i.js","./_astro/gallery.CKDoTiMU.js","./_astro/gallery.D9X5bGz5.js","./_astro/helpers.QZtJwOSr.js","./_astro/html.BWhCu3F8.js","./_astro/html2canvas.esm.DtDHJ18r.js","./_astro/index-client.Bg2DNXcU.js","./_astro/index.B4oxMXhh.js","./_astro/index.BZbAky8g.js","./_astro/index.BtpTrfQ5.js","./_astro/index.CKPdc56M.js","./_astro/index.Dc6kRK_F.js","./_astro/index.DgIroXGH.js","./_astro/index.PDEF5wc2.js","./_astro/index._VY2qkCQ.js","./_astro/index.eroqfLhH.js","./_astro/input.skk1M_av.js","./_astro/input.wlVNyH1y.js","./_astro/jszip.min.H6nIsZ3p.js","./_astro/label.DcabNQdc.js","./_astro/layout.ByzKjclz.js","./_astro/layout.CTScMlj9.js","./_astro/layout.CnZnJSvQ.js","./_astro/layout.DUiG4TEp.js","./_astro/layout.DbkwMh_A.js","./_astro/legacy.B9Y3TeRD.js","./_astro/live-events.C0Ws_CpH.js","./_astro/loader-circle.dV9H1ZtV.js","./_astro/mode.BjICRj5f.js","./_astro/moksa-token.D8cYCfAk.js","./_astro/node.BMRk-V2q.js","./_astro/node.BMXLgHkM.js","./_astro/p5.min.aYYzOgOr.js","./_astro/panels.0CsNYxja.js","./_astro/pb.BjVtZEqq.js","./_astro/person-count.1ySFbvWQ.js","./_astro/person-counter.CRVaaxRT.js","./_astro/play.CZaxehXE.js","./_astro/plus.DL-TSNX_.js","./_astro/props.B5ES_xWj.js","./_astro/props.G6l1d_aD.js","./_astro/radio.CqnHYhyu.js","./_astro/register-mobile-dialog.DbePOZqx.js","./_astro/render.DCBExBlY.js","./_astro/reports.TBWs8YpB.js","./_astro/scan-face.n_gyppG2.js","./_astro/search.BPlr8GVe.js","./_astro/select-label.3zFltAXe.js","./_astro/select-label.Z5kSJYWV.js","./_astro/separator.EEVbfzsI.js","./_astro/slider.BPWwH5VY.js","./_astro/sonner.Bc9eQ2U3.js","./_astro/square-pen.ToUTzmZV.js","./_astro/store.LwFfO3GU.js","./_astro/stores.BjKpnT96.js","./_astro/svelte-component.Co8mLa1v.js","./_astro/switch.DqDyBIMU.js","./_astro/table-row.DWG7SB3f.js","./_astro/template.BAXcjkkR.js","./_astro/theme-switch.Dw-SgTcf.js","./_astro/this.Dn7i68im.js","./_astro/trash-2.DomddqeB.js","./_astro/trash.DrZVpgFg.js","./_astro/triangle-alert.5aaA9_q3.js","./_astro/ui.BlnsDfWm.js","./_astro/updater.DZYzlJzt.js","./_astro/user.DTKNVqgd.js","./_astro/userDetails.C512u9q6.js","./_astro/userLogs.FmCv2qlm.js","./_astro/utils.7i5Ab_63.js","./_astro/video-zoom.DE0ZrLL0.js","./_astro/x.rUR2l-6P.js","./images/01.svg","./images/Cielo_LENS.svg","./images/Cielo_dark.svg","./images/Cielo_logo.svg","./images/Graph01.png","./images/Graph02.png","./images/Graph03.png","./images/Graph04.png","./images/Graph05.png","./images/Graph06.png","./images/Graph07.png","./images/Graph08.png","./images/Graph8.png","./images/Graph9.png","./images/GraphReports.png","./images/Group.png","./images/LensLogoDark.svg","./images/LensLogoLight.svg","./images/Lens_1.svg","./images/Lens_2.svg","./images/Tech5_LENS.svg","./images/Tech5_dark.png","./images/VehicleOverviewLine.png","./images/VehicleOverviewPie.png","./images/acces_dark.png","./images/access.png","./images/addNodeDark.png","./images/addNodeLight.jpg","./images/camera_1.png","./images/card1.png","./images/card2.png","./images/card3.png","./images/card4.png","./images/cross.png","./images/error.png","./images/event_graph.png","./images/green.svg","./images/helpcenter.png","./images/image_select.png","./images/lens2_1.svg","./images/lensViewLogo.svg","./images/lens_white.svg","./images/lightNodeVector.jpg","./images/line.svg","./images/line1.svg","./images/line2.svg","./images/line3.svg","./images/loginBG.jpg","./images/loginBGDark.jpg","./images/moksa-black.png","./images/moksa.png","./images/parking.png","./images/parking_light.png","./images/persons_icon.png","./images/pie_graph.png","./images/storage1.png","./images/storage2.png","./images/storage3.png","./images/storage4.png","./images/thumbnail_Cielo View.png","./images/tick.png","./images/view_logo.svg","./images/white.svg","./images/working.png","./notification-sounds/level-up.mp3","./notification-sounds/notification-alert.mp3","./notification-sounds/public-beep-sound.mp3","./notification-sounds/short-beep-tone.mp3","./fonts/lato/Lato-Black.ttf","./fonts/lato/Lato-BlackItalic.ttf","./fonts/lato/Lato-Bold.ttf","./fonts/lato/Lato-BoldItalic.ttf","./fonts/lato/Lato-Italic.ttf","./fonts/lato/Lato-Light.ttf","./fonts/lato/Lato-LightItalic.ttf","./fonts/lato/Lato-Regular.ttf","./fonts/lato/Lato-Thin.ttf","./fonts/lato/Lato-ThinItalic.ttf","./analytics.html","./atlas.html","./configuration.html","./events.html","./gallery.html","./login.html","./playback.html","./register.html","./reports.html","./index.html"],"buildFormat":"file","checkOrigin":false,"serverIslandNameMap":[],"key":"ckf7uVqLGP12mmGTxXNuSZH8o8ghJk81Or2fs76A7Rs=","experimentalEnvGetSecretEnabled":false});

export { manifest };
