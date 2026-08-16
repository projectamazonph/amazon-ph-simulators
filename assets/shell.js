/* ============================================================
   PROJECT AMAZON PH ACADEMY - SHARED SHELL JS
   - Highlights current tool in nav + rail (PR #7)
   - Injects topbar + footer if not present
   - Applies unified skin (tokens + skin.css) to tool pages
   - Wraps tool body in .pha-skin-wrap
   - Auto-injects responsive.css (mobile-first layer)
   - Inserts hamburger button + scrim; wires open/close
   - PR #7: injects slim icon nav rail on tool pages
   ============================================================ */
(function(){'use strict';
var TOOLS=[
{id:'ad-console',name:'AdConsole Pro',tag:'Ad Operations',file:'ad-console.html'},
{id:'keyword-lab',name:'Keyword Lab',tag:'Keyword Research',file:'keyword-lab.html'},
{id:'search-triage',name:'Search Term Triage',tag:'Triage',file:'search-triage.html'},
{id:'bulk-file',name:'Bulk File Simulator',tag:'Bulk Ops',file:'bulk-file.html'},
{id:'listing',name:'BuyBox Dojo',tag:'Listing + PPC',file:'listing.html'},
{id:'pacing-deck',name:'Pacing Deck',tag:'Budget + Pacing',file:'pacing-deck.html'}
];
function currentToolId(){var e=document.body.getAttribute('data-pha-tool');if(e)return e;var p=window.location.pathname.split('/').pop()||'index.html';var m=TOOLS.find(function(t){return t.file===p;});return m?m.id:'hub';}
function injectSkin(){if(document.querySelector('link[data-pha-tokens]'))return;var h=document.head;var t=document.createElement('link');t.rel='stylesheet';t.href='assets/tokens.css';t.setAttribute('data-pha-tokens','1');h.appendChild(t);var s=document.createElement('link');s.rel='stylesheet';s.href='assets/skin.css';s.setAttribute('data-pha-skin','1');h.appendChild(s);}
function injectResponsive(){if(document.querySelector('link[data-pha-responsive]'))return;var h=document.head;var r=document.createElement('link');r.rel='stylesheet';r.href='assets/responsive.css';r.setAttribute('data-pha-responsive','1');h.appendChild(r);}
function markActive(currentId){var links=document.querySelectorAll('.pha-nav a[data-pha-tool]');for(var i=0;i<links.length;i++){if(links[i].getAttribute('data-pha-tool')===currentId){links[i].classList.add('is-current');links[i].setAttribute('aria-current','page');}}
/* PR #7: also mark rail item */
var railItems=document.querySelectorAll('.pha-rail-item[data-pha-tool]');for(var j=0;j<railItems.length;j++){if(railItems[j].getAttribute('data-pha-tool')===currentId){railItems[j].classList.add('is-current');railItems[j].setAttribute('aria-current','page');}}}
function buildNav(currentId){var nav=document.querySelector('.pha-nav');if(!nav)return;if(nav.children.length>0){nav.dataset.phaBuilt='1';return;}nav.dataset.phaBuilt='1';var toShow=TOOLS.filter(function(t){return t.id!==currentId;});toShow.forEach(function(t){var a=document.createElement('a');a.href=t.file;a.setAttribute('data-pha-tool',t.id);a.textContent=t.name;nav.appendChild(a);});}
function syncBurgerLabel(btn,isOpen){btn.setAttribute('aria-label',isOpen?'Close tools menu':'Open tools menu');}
function ensureBurger(){if(document.querySelector('.pha-burger'))return null;var topbar=document.querySelector('.pha-topbar');if(!topbar)return null;topbar.classList.add('pha-has-burger');var btn=document.createElement('button');btn.className='pha-burger';btn.type='button';btn.setAttribute('aria-controls','pha-primary-nav');btn.setAttribute('aria-expanded','false');syncBurgerLabel(btn,false);btn.innerHTML='<svg class="bars" viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg><svg class="x" viewBox="0 0 24 24" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';topbar.appendChild(btn);var nav=topbar.querySelector('.pha-nav');if(nav&&!nav.id)nav.id='pha-primary-nav';var scrim=document.querySelector('.pha-nav-scrim');if(!scrim){scrim=document.createElement('div');scrim.className='pha-nav-scrim';scrim.setAttribute('aria-hidden','true');document.body.appendChild(scrim);}
var isOpen=false;
function open(){if(isOpen)return;isOpen=true;btn.setAttribute('aria-expanded','true');syncBurgerLabel(btn,true);if(nav)nav.classList.add('is-open');scrim.classList.add('is-on');document.body.classList.add('pha-burger-active');}
function close(){if(!isOpen)return;isOpen=false;btn.setAttribute('aria-expanded','false');syncBurgerLabel(btn,false);if(nav)nav.classList.remove('is-open');scrim.classList.remove('is-on');document.body.classList.remove('pha-burger-active');}
function toggle(){isOpen?close():open();}
btn.addEventListener('click',function(e){e.preventDefault();toggle();});
scrim.addEventListener('click',function(){close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen){close();btn.focus();}});
if(nav){nav.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a)close();});}
var mq=window.matchMedia('(min-width: 768px)');var onChange=function(){if(mq.matches)close();};if(mq.addEventListener)mq.addEventListener('change',onChange);else if(mq.addListener)mq.addListener(onChange);
return btn;}
/* PR #7: nav rail injector — slim icon column on tool pages */
function ensureRail(currentId){if(currentToolId()==='hub')return;var wrap=document.querySelector('main.pha-skin-wrap');if(!wrap)return;if(document.querySelector('.pha-nav-rail'))return;var rail=document.createElement('nav');rail.className='pha-nav-rail';rail.setAttribute('aria-label','Tool switcher');TOOLS.forEach(function(t){var a=document.createElement('a');a.className='pha-rail-item';a.href=t.file;a.setAttribute('data-pha-tool',t.id);a.setAttribute('title',t.name);a.setAttribute('aria-label','Switch to '+t.name);var initials=t.id.split('-').map(function(s){return s.charAt(0).toUpperCase();}).join('').slice(0,2);a.textContent=initials;rail.appendChild(a);});wrap.insertBefore(rail,wrap.firstChild);}
function annotateOverflow(){var wraps=document.querySelectorAll('.table-scroll-wrap');for(var i=0;i<wraps.length;i++){(function(wrap){var check=function(){if(wrap.scrollWidth>wrap.clientWidth+2)wrap.classList.add('has-overflow');else wrap.classList.remove('has-overflow');};check();if(window.ResizeObserver){new ResizeObserver(check).observe(wrap);}else{window.addEventListener('resize',check);}})(wraps[i]);}}
function ensureChrome(){if(!document.querySelector('.pha-topbar')){var toolId=currentToolId();var tool=TOOLS.find(function(t){return t.id===toolId;});var isHub=toolId==='hub'||!tool;var toolName=isHub?'SimGrid':tool.name;var toolTag=isHub?'Control Hub':tool.tag;var bar=document.createElement('div');bar.className='pha-topbar';bar.setAttribute('role','banner');bar.innerHTML='<a class="pha-back" href="index.html" aria-label="'+(isHub?'Home':'Back to Academy Hub')+'"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 3 L5 8 L10 13" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+(isHub?'Home':'Hub')+'</span></a><a class="pha-brand" href="index.html" aria-label="Project Amazon PH Academy home"><div class="pha-brand-mark" aria-hidden="true">PH</div><div class="pha-brand-text"><b>Project Amazon PH</b><span>Academy · SimGrid</span></div></a><div class="pha-divider" aria-hidden="true"></div><div class="pha-tool-name"><b>'+toolName+'</b><span class="pha-tag">'+toolTag+'</span></div><nav class="pha-nav" aria-label="Tool navigation"></nav><div class="pha-status" role="status" aria-label="Academy status: online"><span class="dot" aria-hidden="true"></span><span>Academy · online</span></div>';document.body.insertBefore(bar,document.body.firstChild);}
if(!document.querySelector('.pha-footer')){var f=document.createElement('footer');f.className='pha-footer';f.innerHTML='<div><b>PROJECT AMAZON PH</b> &nbsp;·&nbsp; Academy SimGrid</div><div class="pha-foot-links"><a href="index.html">Hub</a>'+TOOLS.map(function(t){return '<a href="'+t.file+'">'+t.name+'</a>';}).join('')+'</div><div class="pha-foot-meta">v1.0 · '+(document.body.getAttribute('data-pha-tool')?'Tool module':'Control Hub')+'</div>';document.body.appendChild(f);}}
function applySkin(){if(currentToolId()==='hub')return;document.body.classList.add('pha-skin');}
function wrapContent(){if(currentToolId()==='hub')return;if(document.querySelector('.pha-skin-wrap'))return;var topbar=document.querySelector('.pha-topbar');var footer=document.querySelector('.pha-footer');var before=topbar?topbar.nextSibling:null;var after=footer||null;var wrap=document.createElement('div');wrap.className='pha-skin-wrap';var node=before;var moved=[];while(node&&node!==after){moved.push(node);node=node.nextSibling;}if(moved.length===0){while(document.body.firstChild)wrap.appendChild(document.body.firstChild);document.body.appendChild(wrap);}else{moved.forEach(function(n){wrap.appendChild(n);});if(topbar)topbar.parentNode.insertBefore(wrap,topbar.nextSibling);else document.body.insertBefore(wrap,document.body.firstChild);}}
function init(){injectSkin();injectResponsive();ensureChrome();applySkin();wrapContent();buildNav(currentToolId());markActive(currentToolId());ensureBurger();ensureRail(currentToolId());annotateOverflow();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
