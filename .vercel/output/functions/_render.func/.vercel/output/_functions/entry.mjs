import { r as renderers } from './chunks/_@astro-renderers_ByLoCuEw.mjs';
import { c as createExports } from './chunks/entrypoint_DyRUrLRa.mjs';
import { manifest } from './manifest_BunP8OBs.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/analytics.astro.mjs');
const _page2 = () => import('./pages/atlas.astro.mjs');
const _page3 = () => import('./pages/configuration.astro.mjs');
const _page4 = () => import('./pages/events.astro.mjs');
const _page5 = () => import('./pages/gallery.astro.mjs');
const _page6 = () => import('./pages/login.astro.mjs');
const _page7 = () => import('./pages/playback.astro.mjs');
const _page8 = () => import('./pages/register.astro.mjs');
const _page9 = () => import('./pages/reports.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/analytics.astro", _page1],
    ["src/pages/atlas.astro", _page2],
    ["src/pages/configuration.astro", _page3],
    ["src/pages/events.astro", _page4],
    ["src/pages/gallery.astro", _page5],
    ["src/pages/login.astro", _page6],
    ["src/pages/playback.astro", _page7],
    ["src/pages/register.astro", _page8],
    ["src/pages/reports.astro", _page9],
    ["src/pages/index.astro", _page10]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "59a83ad4-18a3-4421-a79b-81b98bfb6a0f",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
