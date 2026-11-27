/**
 * Installed before stylesheets on /races. Print media keeps the Tailwind
 * sheet out of the first paint, then promotes it. The Inter sheet stays on
 * print so its swap face cannot move the calendar. The latin face is inlined.
 */
export function racesCriticalUnblockScript(fontHref: string): string {
  const font = JSON.stringify(fontHref)
  return `(function(){var path=location.pathname;if(path.length>1&&path.charAt(path.length-1)==="/")path=path.slice(0,-1);if(path!=="/races")return;var fontHref=${font};function arm(link){if(!link||link.tagName!=="LINK")return;var rel=link.getAttribute("rel")||"";if(rel.indexOf("stylesheet")===-1)return;var href=link.getAttribute("href")||"";if(href.indexOf("/_next/static/css/")===-1)return;if(link.getAttribute("data-races-armed")==="1")return;link.setAttribute("data-races-armed","1");if(fontHref&&href===fontHref){link.media="print";return}function enable(){link.media="all"}link.addEventListener("load",function(){setTimeout(enable,0)});link.media="print";if(link.sheet)setTimeout(enable,0)}var obs=new MutationObserver(function(recs){for(var i=0;i<recs.length;i++){var nodes=recs[i].addedNodes;for(var j=0;j<nodes.length;j++){var n=nodes[j];if(!n||n.nodeType!==1)continue;if(n.tagName==="LINK")arm(n);else if(n.querySelectorAll){var list=n.querySelectorAll("link[rel~=stylesheet]");for(var k=0;k<list.length;k++)arm(list[k])}}}});obs.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener("DOMContentLoaded",function(){obs.disconnect()});var existing=document.getElementsByTagName("link");for(var i=0;i<existing.length;i++)arm(existing[i])})();`
}
