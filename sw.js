/* Judging AI · hors ligne. Version f1b294b22d89 : chaque reconstruction change ce nom, l'ancien cache est jeté. */
var V="judging-ai-f1b294b22d89", F=["./", "index.html", "journal/", "journal/index.html", "entrainement/", "entrainement/index.html", "atelier/", "atelier/index.html", "atelier/apercu.html", "atelier/ESAR_Un_lieu_une_Skill_un_hook.ipynb", "atelier/EXEMPLE_toolkit.zip", "atelier/README.md", "atelier/VALIDATION.json", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(F);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  var u=new URL(e.request.url); if(e.request.method!=="GET"||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(V).then(function(k){k.put(e.request,c);});return r;}).catch(function(){return caches.match(e.request,{ignoreSearch:true}).then(function(m){return m||caches.match("./");});}));
});
