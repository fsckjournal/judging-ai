/* Judging AI · commun à toutes les pages : le dossier du binôme (export, import), la version en pied de page.
   Le dossier vit dans ce navigateur (localStorage "judging-ai-dossier") ; le fichier exporté est la seule copie hors du navigateur.
   Format du fichier : "juger-ia-dossier/1" (PLAN_S4, « The dossier file »). */
var JA = (function () {
  "use strict";
  var VERSION = "s4-2026-09-24.1";
  var FORMAT = "juger-ia-dossier/1";
  var KEY = "judging-ai-dossier", AVANT = "judging-ai-dossier-avant-import", S3KEY = "judging-ai-s3-work", LANGKEY = "judging-ai-journal-lang";
  var APPS = ["Claude", "ChatGPT", "Gemini", "autre"], MODES = ["chargée", "collée"], CONDS = ["A", "B", "C", "D"];

  var T = {
    fr: {
      dossier: "le dossier du binôme", exJson: "EXPORTER LE DOSSIER", exMd: "version lisible (.md)", imp: "importer un dossier…", retour: "revenir à l'état d'avant l'import",
      pied: "Tout reste dans ce navigateur. Le fichier exporté est votre copie : il se réimporte sur n'importe quelle page de l'app.",
      version: "version", illisible: "Fichier illisible : ce n'est pas du JSON. Rien n'a été changé.",
      inconnu: "Format inconnu ({f}) : ce fichier n'est pas un dossier Juger l'IA. Rien n'a été changé.",
      journal: "Ce fichier est une sauvegarde du journal : importez-le dans le journal, onglet garder. Rien n'a été changé ici.",
      remplacer: "Remplacer le dossier de ce navigateur par celui du fichier ?", actuel: "Ici", fichier: "Dans le fichier",
      copie: "Une copie de l'état actuel est gardée dans ce navigateur ; vous pourrez y revenir.",
      annuler: "Annuler", ok: "Remplacer", retourQ: "Revenir au dossier tel qu'il était avant le dernier import ?", retourOk: "Revenir",
      n: { versions: ["version", "versions"], essais: ["essai", "essais"], reponses: ["réponse", "réponses"] }, sansLieu: "lieu non indiqué", exporteLe: "exporté le",
      crit: {
        titre: "le dossier · 40 %",
        intro: "Un fichier par binôme, rendu le 9 octobre (S6), défendu au viva. Ce qui est regardé :",
        items: [
          ["versions", "Les versions, chacune avec ce que vous avez changé et pourquoi (quel essai l'a montré)."],
          ["essais", "Les essais, chacun avec ses conditions : app, modèle, date, web, chargée ou collée, la même question."],
          ["bilan", "Ce que chaque version a fait gagner, et ce qu'elle a fait perdre."],
          ["decision", "Une décision que vous pouvez défendre."]
        ]
      },
      md: { titre: "Dossier", binome: "Binôme", lieu: "Lieu", question: "Question", versions: "Versions", change: "Ce que nous avons changé", pourquoi: "Pourquoi (quel essai)", figee: "figée le",
        brouillon: "Brouillon en cours", essais: "Essais", essai: "Essai", cond: "Conditions", app: "App", modele: "Modèle", date: "Date", web: "Web", mode: "Skill", oui: "oui", non: "non",
        sans: "Sans la Skill", avec: "Avec la Skill", etayees: "étayées", contredites: "contredites", non_resolues: "non résolues", utilisables: "utilisables",
        gagne: "Ce qui a été gagné", perdu: "Ce qui a été perdu", decision: "Décision", lire: "Exercice 1 · Saint-Georges", s3: "Séance 3 (fiches)",
        condition: "Condition", source: "Skill", reponse: "Réponse", score: "Score", quatre: "Les quatre conditions" },
      banc: {
        conds: { A: "sans Skill", B: "Skill générique", C: "Skill du prof", D: "Skill du binôme" },
        cases: ["d'où vient chaque affirmation", "un passage précis", "les désaccords séparés", "dit ce qui manque", "aucune référence inventée", "répond"],
        c5: [["1", "1 · elle existe et dit ce qu'on lui fait dire"], ["0", "0 · elle n'existe pas, ou ne dit pas cela"], ["n", "non ouverte · ni 0 ni 1"]], nonOuverte: "non ouverte",
        notePar: "noté par le binôme", signer: "Laquelle signeriez-vous dans votre dossier ?", pourquoi: "pourquoi"
      }
    },
    en: {
      dossier: "the pair's dossier", exJson: "EXPORT THE DOSSIER", exMd: "readable version (.md)", imp: "import a dossier…", retour: "go back to the state before the import",
      pied: "Everything stays in this browser. The exported file is your copy: it re-imports on any page of the app.",
      version: "version", illisible: "Unreadable file: this is not JSON. Nothing was changed.",
      inconnu: "Unknown format ({f}): this file is not a Judging AI dossier. Nothing was changed.",
      journal: "This file is a journal backup: import it in the journal, keep tab. Nothing was changed here.",
      remplacer: "Replace the dossier in this browser with the one in the file?", actuel: "Here", fichier: "In the file",
      copie: "A copy of the current state is kept in this browser; you can go back to it.",
      annuler: "Cancel", ok: "Replace", retourQ: "Go back to the dossier as it was before the last import?", retourOk: "Go back",
      n: { versions: ["version", "versions"], essais: ["run", "runs"], reponses: ["answer", "answers"] }, sansLieu: "no place given", exporteLe: "exported on",
      crit: {
        titre: "the dossier · 40 %",
        intro: "One file per pair, handed in on 9 October (S6), defended at the viva. What is looked at:",
        items: [
          ["versions", "The versions, each with what you changed and why (which run showed it)."],
          ["essais", "The runs, each with its conditions: app, model, date, web, loaded or pasted, the same question."],
          ["bilan", "What each version gained, and what it lost."],
          ["decision", "A decision you can defend."]
        ]
      },
      md: { titre: "Dossier", binome: "Pair", lieu: "Place", question: "Question", versions: "Versions", change: "What we changed", pourquoi: "Why (which run)", figee: "frozen on",
        brouillon: "Current draft", essais: "Runs", essai: "Run", cond: "Conditions", app: "App", modele: "Model", date: "Date", web: "Web", mode: "Skill", oui: "yes", non: "no",
        sans: "Without the Skill", avec: "With the Skill", etayees: "supported", contredites: "contradicted", non_resolues: "unresolved", utilisables: "usable",
        gagne: "What was gained", perdu: "What was lost", decision: "Decision", lire: "Exercise 1 · Saint-Georges", s3: "Session 3 (worksheets)",
        condition: "Condition", source: "Skill", reponse: "Answer", score: "Score", quatre: "The four conditions" },
      banc: {
        conds: { A: "no Skill", B: "generic Skill", C: "the teacher's Skill", D: "the pair's Skill" },
        cases: ["where each claim comes from", "a precise passage", "disagreements kept apart", "says what is missing", "no invented reference", "answers"],
        c5: [["1", "1 · it exists and says what it is made to say"], ["0", "0 · it does not exist, or does not say that"], ["n", "not opened · neither 0 nor 1"]], nonOuverte: "not opened",
        notePar: "scored by the pair", signer: "Which one would you sign in your dossier?", pourquoi: "why"
      }
    }
  };
  function lang() { try { return localStorage.getItem(LANGKEY) === "en" ? "en" : "fr"; } catch (e) { return "fr"; } }
  function t(k) { return T[lang()][k]; }
  function nb(n, k) { var w = t("n")[k]; return n + " " + (n === 1 ? w[0] : w[1]); }

  function h(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) for (var k in a) { var v = a[k]; if (k === "on") for (var ev in v) e.addEventListener(ev, v[ev]); else if (k === "text") e.textContent = v; else if (v === true) e.setAttribute(k, ""); else if (v !== false && v != null) e.setAttribute(k, v); }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  /* ---------- l'heure de Beyrouth ---------- */
  function beyrouth(d) {
    d = d || new Date();
    var p = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Beirut", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    var local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    var off = Math.round((local - Math.floor(d.getTime() / 1000) * 1000) / 60000), s = off < 0 ? "-" : "+", a = Math.abs(off);
    return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":" + p.minute + ":" + p.second + s + String(Math.floor(a / 60)).padStart(2, "0") + ":" + String(a % 60).padStart(2, "0");
  }
  function jour() { return beyrouth().slice(0, 10); }

  /* ---------- le dossier ---------- */
  function S(v) { return typeof v === "string" ? v : ""; }
  function N(v) { v = Number(v); return isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function vide() { return { format: FORMAT, binome: { noms: [], lieu: "", question: "" }, skill: { versions: [], brouillon: "" }, essais: [], lire: {}, signer: { condition: "", pourquoi: "" } }; }
  /* case 5 (index 4) a un troisième état, null : « non ouverte », ni 0 ni 1 ; elle sort alors du total */
  function cases(v) { v = Array.isArray(v) ? v : []; return [0, 1, 2, 3, 4, 5].map(function (i) { return i === 4 && v[i] === null ? null : v[i] === true; }); }
  function score(e) { return e.cases.filter(Boolean).length; }
  function sur(e) { return e.cases.filter(function (x) { return x !== null; }).length; }
  function propre(d) {
    var o = vide(); if (!d || typeof d !== "object") return o;
    var b = d.binome || {};
    o.binome = { noms: (Array.isArray(b.noms) ? b.noms : []).map(S).filter(Boolean), lieu: S(b.lieu), question: S(b.question) };
    var sk = d.skill || {};
    o.skill.brouillon = S(sk.brouillon);
    o.skill.versions = (Array.isArray(sk.versions) ? sk.versions : []).map(function (v, i) {
      v = v || {}; return { n: typeof v.n === "number" ? v.n : i, nom: S(v.nom), description: S(v.description), corps: S(v.corps), change: S(v.change), pourquoi: S(v.pourquoi), figee_le: S(v.figee_le) };
    });
    o.essais = (Array.isArray(d.essais) ? d.essais : []).map(function (x) {
      x = x || {}; return { version: N(x.version), app: APPS.indexOf(x.app) >= 0 ? x.app : "autre", modele: S(x.modele), date: S(x.date), web: x.web === true, mode: MODES.indexOf(x.mode) >= 0 ? x.mode : "collée",
        question: S(x.question), sans: S(x.sans), avec: S(x.avec), etayees: N(x.etayees), contredites: N(x.contredites), non_resolues: N(x.non_resolues), utilisables: N(x.utilisables),
        gagne: S(x.gagne), perdu: S(x.perdu), decision: S(x.decision),
        condition: CONDS.indexOf(x.condition) >= 0 ? x.condition : "", skill_source: S(x.skill_source), reponse: S(x.reponse), cases: cases(x.cases), note_par: S(x.note_par) };
    });
    var l = d.lire && typeof d.lire === "object" ? d.lire : {};
    Object.keys(l).forEach(function (k) { var x = l[k] || {}; o.lire[k] = { affirmation: S(x.affirmation), reponse: S(x.reponse) }; });
    var sg = d.signer || {};
    o.signer = { condition: CONDS.indexOf(sg.condition) >= 0 ? sg.condition : "", pourquoi: S(sg.pourquoi) };
    return o;
  }
  var persistant = true;
  function charger() { try { var r = localStorage.getItem(KEY); return r ? propre(JSON.parse(r)) : vide(); } catch (e) { persistant = false; return vide(); } }
  function enregistrer(d) { try { localStorage.setItem(KEY, JSON.stringify(propre(d))); return true; } catch (e) { persistant = false; return false; } }
  function s3Lire() { try { var r = JSON.parse(localStorage.getItem(S3KEY) || "null"); var f = r && r.fields && typeof r.fields === "object" ? r.fields : null; if (!f) return null; var o = {}, any = false; Object.keys(f).forEach(function (k) { if (typeof f[k] === "string") { o[k] = f[k]; if (f[k]) any = true; } }); return any ? o : null; } catch (e) { return null; } }
  function complet() { var d = charger(), s3 = s3Lire(); if (s3) d.s3 = s3; d.exporte_le = beyrouth(); return d; }
  function slug(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40); }
  function nomFichier(d, ext) { return "dossier-" + (slug(d.binome.lieu) || "sans-lieu") + "-" + d.exporte_le.slice(0, 10) + "." + ext; }

  /* le dernier essai de chaque condition : { A: index ou -1, … } */
  function quatre(d) { var o = {}; CONDS.forEach(function (c) { o[c] = -1; }); d.essais.forEach(function (e, i) { if (e.condition) o[e.condition] = i; }); return o; }
  function condLabel(c) { return c ? c + " · " + t("banc").conds[c] : "—"; }

  function fence(s) { s = s || ""; var f = "```"; while (s.indexOf(f) >= 0) f += "`"; return f + "\n" + s + "\n" + f; }
  function markdown(d) {
    var m = t("md"), L = ["# " + m.titre + " · " + (d.binome.lieu || t("sansLieu")), ""];
    L.push(m.binome + " : " + (d.binome.noms.join(", ") || "—"), "", m.lieu + " : " + (d.binome.lieu || "—"), "", m.question + " : " + (d.binome.question || "—"), "", t("exporteLe") + " " + d.exporte_le + " · " + FORMAT + " · " + VERSION, "");
    L.push("## " + m.versions, "");
    if (!d.skill.versions.length) L.push("—", "");
    d.skill.versions.forEach(function (v) {
      L.push("### v" + v.n + " · " + (v.nom || "—") + " · " + m.figee + " " + v.figee_le, "", "**" + m.change + "** : " + (v.change || "—"), "", "**" + m.pourquoi + "** : " + (v.pourquoi || "—"), "", fence(skillMd(v.nom, v.description, v.corps)), "");
    });
    if (d.skill.brouillon) L.push("### " + m.brouillon, "", fence(d.skill.brouillon), "");
    L.push("## " + m.essais, "");
    if (!d.essais.length) L.push("—", "");
    var bc = t("banc");
    d.essais.forEach(function (e, i) {
      L.push("### " + m.essai + " " + (i + 1) + (e.condition ? " · " + condLabel(e.condition) : "") + (!e.condition || e.condition === "D" ? " · v" + e.version : ""), "",
        "| " + [m.app, m.modele, m.date, m.web, m.mode].join(" | ") + " |", "|---|---|---|---|---|",
        "| " + [e.app, e.modele || "—", e.date || "—", e.web ? m.oui : m.non, e.mode].map(function (c) { return String(c).replace(/\|/g, "\\|"); }).join(" | ") + " |", "");
      if (e.condition) {
        L.push("**" + m.condition + "** : " + condLabel(e.condition), "");
        if (e.skill_source) L.push("**" + m.source + "** : " + e.skill_source, "");
        L.push("**" + m.question + "**", "", fence(e.question), "", "**" + m.reponse + "**", "", fence(e.reponse), "");
        e.cases.forEach(function (x, k) { L.push("- [" + (x === null ? "-" : x ? "x" : " ") + "] " + (k + 1) + " · " + bc.cases[k] + (x === null ? " · " + bc.nonOuverte : "")); });
        L.push("", "**" + m.score + "** : " + score(e) + " / " + sur(e) + " · " + bc.notePar + " : " + (e.note_par || "—"), "");
      } else L.push("**" + m.question + "**", "", fence(e.question), "", "**" + m.sans + "**", "", fence(e.sans), "", "**" + m.avec + "**", "", fence(e.avec), "");
      L.push(
        m.etayees + " " + e.etayees + " · " + m.contredites + " " + e.contredites + " · " + m.non_resolues + " " + e.non_resolues + " · " + m.utilisables + " " + e.utilisables, "",
        "**" + m.gagne + "** : " + (e.gagne || "—"), "", "**" + m.perdu + "** : " + (e.perdu || "—"), "", "**" + m.decision + "** : " + (e.decision || "—"), "");
    });
    var q4 = quatre(d);
    if (CONDS.some(function (c) { return q4[c] >= 0; }) || d.signer.condition) {
      L.push("## " + m.quatre, "", "| " + [m.condition, m.essai, m.score, bc.notePar].join(" | ") + " |", "|---|---|---|---|");
      CONDS.forEach(function (c) { var i = q4[c], e = d.essais[i]; L.push("| " + [condLabel(c), e ? String(i + 1) : "—", e ? score(e) + " / " + sur(e) : "—", e ? e.note_par || "—" : "—"].map(function (x) { return String(x).replace(/\|/g, "\\|"); }).join(" | ") + " |"); });
      L.push("", "**" + bc.signer + "** " + condLabel(d.signer.condition), "", "**" + bc.pourquoi + "** : " + (d.signer.pourquoi || "—"), "");
    }
    var lk = Object.keys(d.lire);
    if (lk.length) { L.push("## " + m.lire, ""); lk.forEach(function (k) { L.push("### " + (d.lire[k].affirmation || k), "", d.lire[k].reponse || "—", ""); }); }
    if (d.s3) { L.push("## " + m.s3, ""); Object.keys(d.s3).forEach(function (k) { if (d.s3[k]) L.push("**" + k + "** : " + d.s3[k].replace(/\n/g, "  \n"), ""); }); }
    return L.join("\n");
  }

  /* ---------- SKILL.md ---------- */
  function yamlStr(s) { return '"' + String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ") + '"'; }
  function skillMd(nom, description, corps) { return "---\nname: " + nom + "\ndescription: " + yamlStr(description) + "\n---\n\n" + String(corps || "").replace(/^\n+/, ""); }
  function lireSkill(txt) {
    var m = String(txt || "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { nom: "", description: "", corps: String(txt || "") };
    var o = { nom: "", description: "", corps: m[2].replace(/^\r?\n/, "") };
    m[1].split(/\r?\n/).forEach(function (l) {
      var x = l.match(/^(name|description):\s*(.*)$/); if (!x) return;
      var v = x[2].trim();
      if (/^".*"$/.test(v)) { try { v = JSON.parse(v); } catch (e) { v = v.slice(1, -1); } } else if (/^'.*'$/.test(v)) v = v.slice(1, -1).replace(/''/g, "'");
      if (x[1] === "name") o.nom = v; else o.description = v;
    });
    return o;
  }

  /* ---------- les critères du 40 % ---------- */
  function bilan(d) {
    var vs = d.skill.versions, es = d.essais;
    return {
      versions: [vs.filter(function (v) { return v.change.trim() && v.pourquoi.trim(); }).length, vs.length],
      essais: [es.filter(function (e) { return e.modele.trim() && e.date && e.question.trim() && (e.condition ? e.reponse.trim() : e.sans.trim() && e.avec.trim()); }).length, es.length],
      bilan: [es.filter(function (e) { return e.gagne.trim() && e.perdu.trim(); }).length, es.length],
      decision: [es.filter(function (e) { return e.decision.trim(); }).length, es.length]
    };
  }
  function criteres(d) {
    var c = t("crit"), b = bilan(d || charger()), box = h("div", { class: "ja-crit" });
    box.appendChild(h("p", { class: "ja-s", text: c.intro }));
    c.items.forEach(function (it, i) {
      var v = b[it[0]];
      box.appendChild(h("div", { class: "ja-li" }, [h("span", { class: "ja-n", text: String(i + 1) }), h("span", null, [h("span", { text: it[1] }), h("span", { class: "ja-compte", text: " " + v[0] + " / " + v[1] })])]));
    });
    return box;
  }

  /* ---------- fichiers ---------- */
  function telecharger(texte, nom, type) {
    var u = URL.createObjectURL(texte instanceof Blob ? texte : new Blob([texte], { type: type + ";charset=utf-8" })), a = h("a", { href: u, download: nom });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 2000);
  }
  function exporterJson() { var d = complet(); telecharger(JSON.stringify(d, null, 2), nomFichier(d, "json"), "application/json"); }
  function exporterMd() { var d = complet(); telecharger(markdown(d), nomFichier(d, "md"), "text/markdown"); }

  var dlg;
  function dialogue(corps, okTxt, cb) {
    if (!dlg) {
      dlg = h("dialog", { class: "ja-dlg" });
      dlg.addEventListener("click", function (e) { var r = dlg.getBoundingClientRect(); if (e.target === dlg && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dlg.close(""); });
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = "";
    var f = h("form", { method: "dialog" }, corps.concat([h("div", { class: "ja-row", style: "justify-content:flex-end" }, [
      h("button", { class: "ja-txt", value: "n", text: t("annuler") }), h("button", { class: "ja-act", value: "y", text: okTxt })])]));
    dlg.appendChild(f); dlg.returnValue = "";
    dlg.onclose = function () { if (dlg.returnValue === "y") cb(); };
    dlg.showModal();
  }
  function message(s) { dialogue([h("p", { text: s })], "OK", function () {}); var b = dlg.querySelector('button[value="n"]'); if (b) b.remove(); }
  function resume(d) { return (d.binome.lieu || t("sansLieu")) + " · " + nb(d.skill.versions.length, "versions") + " · " + nb(d.essais.length, "essais") + " · " + nb(Object.keys(d.lire).filter(function (k) { return d.lire[k].reponse.trim(); }).length, "reponses"); }
  function importer(texte) {
    var x;
    try { x = JSON.parse(texte); } catch (e) { message(t("illisible")); return; }
    if (!x || typeof x !== "object" || x.format !== FORMAT) {
      if (x && typeof x === "object" && (Array.isArray(x.lignes) || Array.isArray(x.enquetes))) { message(t("journal")); return; }
      message(t("inconnu").replace("{f}", x && typeof x === "object" && typeof x.format === "string" ? "« " + x.format + " »" : lang() === "fr" ? "aucun champ « format »" : "no “format” field"));
      return;
    }
    var neuf = propre(x), ici = charger();
    dialogue([h("p", { text: t("remplacer") }), h("p", { class: "ja-s", text: t("actuel") + " : " + resume(ici) }), h("p", { class: "ja-s", text: t("fichier") + " : " + resume(neuf) + (x.exporte_le ? " · " + t("exporteLe") + " " + String(x.exporte_le) : "") }), h("p", { class: "ja-s", text: t("copie") })], t("ok"), function () {
      try {
        localStorage.setItem(AVANT, JSON.stringify({ le: beyrouth(), dossier: ici, s3: localStorage.getItem(S3KEY) }));
        localStorage.setItem(KEY, JSON.stringify(neuf));
        if (x.s3 && typeof x.s3 === "object") {
          var cur = {}; try { cur = JSON.parse(localStorage.getItem(S3KEY) || "{}") || {}; } catch (e) {}
          var f = {}; Object.keys(x.s3).forEach(function (k) { if (typeof x.s3[k] === "string") f[k] = x.s3[k]; });
          localStorage.setItem(S3KEY, JSON.stringify({ fields: f, unlocked: !!cur.unlocked }));
        }
      } catch (e) { message(t("illisible")); return; }
      location.reload();
    });
  }
  function revenir() {
    var a; try { a = JSON.parse(localStorage.getItem(AVANT) || "null"); } catch (e) {}
    if (!a) return;
    dialogue([h("p", { text: t("retourQ") }), h("p", { class: "ja-s", text: a.le + " · " + resume(propre(a.dossier)) })], t("retourOk"), function () {
      localStorage.setItem(KEY, JSON.stringify(propre(a.dossier)));
      if (a.s3) localStorage.setItem(S3KEY, a.s3); else localStorage.removeItem(S3KEY);
      localStorage.removeItem(AVANT); location.reload();
    });
  }

  /* ---------- le pied de page ---------- */
  var CSS = ".ja-pied{max-width:760px;margin:2.4em auto 0;padding:1.2em max(18px,env(safe-area-inset-right,0px)) calc(28px + env(safe-area-inset-bottom,0px)) max(18px,env(safe-area-inset-left,0px));border-top:1px solid var(--trait);display:flex;flex-direction:column;gap:.7em;font-family:var(--sans)}" +
    ".ja-k{font:500 13px/1.3 var(--mono);letter-spacing:.08em;color:var(--sourd);margin:0}.ja-s{font:400 14px/1.45 var(--sans);color:var(--sourd);margin:0}" +
    ".ja-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.ja-act{background:var(--orange);color:var(--sur-orange);border:0;border-radius:0;font:700 15px/1 var(--serif);letter-spacing:.12em;padding:0 1.1em;min-height:48px}" +
    ".ja-txt{background:none;border:0;border-bottom:2px solid var(--orange);border-radius:0;color:var(--encre);font:500 15px/1.3 var(--sans);padding:0 0 4px;min-height:44px}" +
    ".ja-v{font:400 12px/1.4 var(--mono);color:var(--sourd);margin:0}" +
    ".ja-dlg{background:var(--fond);color:var(--encre);border:0;border-top:2px solid var(--orange);border-radius:0;max-width:520px;width:calc(100% - 36px);padding:1.2em;font:400 16px/1.45 var(--sans)}.ja-dlg::backdrop{background:rgba(0,0,0,.6)}.ja-dlg p{margin:0 0 .8em}" +
    ".ja-crit{display:flex;flex-direction:column;gap:.55em}.ja-li{display:grid;grid-template-columns:1.6em 1fr;gap:.6em;font:400 16px/1.45 var(--sans)}.ja-n{color:var(--orange);font:400 22px/1.1 var(--serif)}.ja-compte{font:500 13px/1 var(--mono);color:var(--orange);white-space:nowrap}" +
    "@media print{.ja-pied{display:none}}";
  var parent = null, fileIn;
  function pied(conteneur) {
    if (conteneur) parent = conteneur;
    if (!document.getElementById("ja-css")) { var st = h("style", { id: "ja-css" }); st.textContent = CSS; document.head.appendChild(st); }
    if (!fileIn) {
      fileIn = h("input", { type: "file", accept: ".json,application/json", hidden: true, id: "ja-fichier" });
      fileIn.addEventListener("change", function () { var f = fileIn.files && fileIn.files[0]; fileIn.value = ""; if (!f) return; var r = new FileReader(); r.onload = function () { importer(String(r.result)); }; r.readAsText(f); });
      document.body.appendChild(fileIn);
      var lb = document.getElementById("lang"); if (lb) lb.addEventListener("click", function () { setTimeout(function () { pied(); }, 0); });
    }
    var old = document.getElementById("ja-pied"); if (old) old.remove();
    var avant = false; try { avant = !!localStorage.getItem(AVANT); } catch (e) {}
    var f = h("footer", { class: "ja-pied", id: "ja-pied" }, [
      h("p", { class: "ja-k", text: t("dossier") }),
      h("p", { class: "ja-s", text: t("pied") }),
      h("div", { class: "ja-row" }, [
        h("button", { type: "button", class: "ja-act", id: "ja-export", text: t("exJson"), on: { click: exporterJson } }),
        h("button", { type: "button", class: "ja-txt", id: "ja-export-md", text: t("exMd"), on: { click: exporterMd } }),
        h("button", { type: "button", class: "ja-txt", id: "ja-import", text: t("imp"), on: { click: function () { fileIn.click(); } } })
      ].concat(avant ? [h("button", { type: "button", class: "ja-txt", id: "ja-retour", text: t("retour"), on: { click: revenir } })] : [])),
      h("p", { class: "ja-v", text: "judging ai · " + t("version") + " " + VERSION })
    ]);
    (parent || document.body).appendChild(f);
    return f;
  }

  /* ---------- zip sans compression (STORE) ---------- */
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(fichiers) { /* fichiers : [{nom, texte}] ; un nom finissant par « / » est un dossier */
    var enc = new TextEncoder(), d = new Date(), parts = [], central = [], off = 0;
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    fichiers.forEach(function (f) {
      var nom = enc.encode(f.nom), data = enc.encode(f.texte || ""), crc = crc32(data), dir = /\/$/.test(f.nom);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nom.length, true); lh.setUint16(28, 0, true);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nom.length, true);
      ch.setUint32(38, dir ? 0x10 : 0, true); ch.setUint32(42, off, true);
      parts.push(new Uint8Array(lh.buffer), nom, data); central.push(new Uint8Array(ch.buffer), nom);
      off += 30 + nom.length + data.length;
    });
    var taille = central.reduce(function (s, x) { return s + x.length; }, 0), fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, fichiers.length, true); fin.setUint16(10, fichiers.length, true); fin.setUint32(12, taille, true); fin.setUint32(16, off, true);
    return new Blob(parts.concat(central, [new Uint8Array(fin.buffer)]), { type: "application/zip" });
  }

  return { VERSION: VERSION, FORMAT: FORMAT, APPS: APPS, CONDS: CONDS, banc: function () { return t("banc"); }, condLabel: condLabel, score: score, sur: sur, quatre: quatre, h: h, lang: lang, beyrouth: beyrouth, jour: jour, charger: charger, enregistrer: enregistrer, persistant: function () { return persistant; },
    pied: pied, criteres: criteres, skillMd: skillMd, lireSkill: lireSkill, zip: zip, telecharger: telecharger, dialogue: dialogue, slug: slug };
})();
