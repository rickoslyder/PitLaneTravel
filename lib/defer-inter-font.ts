/**
 * Next injects the Inter sheet as a render-blocking link. On a phone that
 * sheet's latin woff2 is requested at High priority in the same moment as the
 * hero image. Hold the sheet at `media=print` until window load, which waits
 * for the eager hero image, then apply it. The size-adjusted fallback face is
 * inlined separately so the swap does not move text.
 *
 * Only the home page and a race detail page do this. Other routes keep the
 * sheet blocking so a late font swap does not add layout shift.
 */
export function shouldDeferInterFont(
  pathname: string | null,
  fontHref: string
): boolean {
  if (!fontHref || !pathname) return false
  if (pathname === "/") return true
  if (!pathname.startsWith("/races/")) return false
  const rest = pathname.slice("/races/".length)
  if (!rest || rest.startsWith("compare") || rest.startsWith("map")) {
    return false
  }
  return true
}

export function deferInterFontScript(href: string): string {
  const literal = JSON.stringify(href)
  return `(function(){var href=${literal};function arm(link){if(!link||link.tagName!=="LINK")return;if((link.getAttribute("rel")||"").indexOf("stylesheet")===-1)return;if((link.getAttribute("href")||"")!==href)return;if(link.getAttribute("data-inter-font")==="1")return;link.setAttribute("data-inter-font","1");link.media="print";function enable(){link.media="all"}if(document.readyState==="complete"){setTimeout(enable,0);return}window.addEventListener("load",function(){setTimeout(enable,0)})}var obs=new MutationObserver(function(recs){for(var i=0;i<recs.length;i++){var nodes=recs[i].addedNodes;for(var j=0;j<nodes.length;j++){var n=nodes[j];if(!n||n.nodeType!==1)continue;if(n.tagName==="LINK")arm(n);else if(n.querySelectorAll){var list=n.querySelectorAll("link[rel~=stylesheet]");for(var k=0;k<list.length;k++)arm(list[k])}}}});obs.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener("load",function(){obs.disconnect()});var existing=document.getElementsByTagName("link");for(var i=0;i<existing.length;i++)arm(existing[i])})();`
}
