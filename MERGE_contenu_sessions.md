# À reporter après la fusion de la branche contenu-sessions

Deux lignes, dans des fichiers tenus par l'autre session ; rien n'a été modifié ici.

1. `index.html`, ligne 103 (liens « les autres pages »), à ajouter après le lien `s3/` :

```js
h("a",{class:"ja-lien",href:"s1/",text:"S1 · 4 septembre"}),h("a",{class:"ja-lien",href:"s2/",text:"S2 · 11 septembre"}),h("a",{class:"ja-lien",href:"s4/",text:"S4 · 25 septembre"}),
```

2. `sw.js`, ligne 2, dans la liste `F`, après `"s3/index.html",` (et changer `V` pour que le cache se renouvelle) :

```js
"s1/", "s1/index.html", "s2/", "s2/index.html", "s4/", "s4/index.html",
```

Le dossier `_captures/` sert à la vérification ; il n'a pas besoin d'être publié.
