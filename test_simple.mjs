// Judging AI · S4 checks, v3 (home and skill/ on the « Juger l'IA » design system V3: one band per screen, StepSquares, export/import on the dossier screen only). Usage: node s4.mjs [base-url]   (default: serves ~/Projects/judging-ai on :8811)
// Every page at 390 and 1280 px (no console errors, no horizontal scroll, footer version), the Skill flow
// (write, freeze v0 and v1, diff, zip checked with unzip), one bench run, lire/ answers, dossier export →
// import in a fresh browser profile → identical, fixes of 23 Sept, the four conditions A–D with the six boxes
// and the sign choice (export → fresh-profile import → identical), offline reload. Read-only on the app.
// Writes s4_results.json and s4/ (downloads, screenshots). Exit code 1 if anything fails.
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const EXE = path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const APP = HERE; // the worktree (simple-s4)
const BASE = process.argv[2] || 'http://localhost:8816/';
const OUT = process.env.OUT || path.join(os.tmpdir(), 'judging-ai-test_simple'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const PAGES = ['', 's3/', 'journal/', 'atelier/', 'entrainement/', 'skill/', 'lire/'];
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const LAPTOP = { viewport: { width: 1280, height: 800 } };
const VERSION = fs.readFileSync(path.join(APP, 'commun.js'), 'utf8').match(/VERSION = "([^"]+)"/)[1];

const log = [];
const L = (ok, step, detail = '') => { log.push({ ok, step, detail }); console.log(ok ? 'OK  ' : 'FAIL', step, detail ? '· ' + String(detail).slice(0, 300) : ''); };
let server;
if (/localhost|127\.0\.0\.1/.test(BASE)) {
  server = spawn('python3', ['-m', 'http.server', new URL(BASE).port || '80', '--bind', '127.0.0.1'], { cwd: APP, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
}
const browser = await chromium.launch({ executablePath: EXE });

function watch(p) {
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  p.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()); });
  return errs;
}
const overflow = p => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1 ? document.documentElement.scrollWidth : 0);
async function download(p, loc, name) {
  const [d] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), loc.click()]);
  const f = path.join(OUT, name || d.suggestedFilename()); await d.saveAs(f); return { f, name: d.suggestedFilename() };
}
const dossier = p => p.evaluate(() => JSON.parse(localStorage.getItem('judging-ai-dossier') || 'null'));
const beirutDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

// ---------------- A · every page, both widths ----------------
for (const [vname, vp] of [['390', PHONE], ['1280', LAPTOP]]) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ ...vp, serviceWorkers: 'block' });
    const p = await ctx.newPage(); const errs = watch(p);
    await p.goto(BASE + pg, { waitUntil: 'networkidle' });
    const ov = await overflow(p);
    const foot = await p.evaluate(() => document.getElementById('ja-pied')?.innerText || '');
    const exp = await p.locator('#ja-export').isVisible().catch(() => false) || await p.locator('#ja-export').count() > 0;
    await p.screenshot({ path: path.join(OUT, `page_${vname}_${pg.replace(/\W/g, '') || 'home'}.png`), fullPage: vname === '390' });
    L(errs.length === 0, `page /${pg} @${vname}: no console errors`, errs.join(' | '));
    L(ov === 0, `page /${pg} @${vname}: no horizontal scroll`, ov ? 'scrollWidth ' + ov : '');
    if (pg === '') {
      const v = await p.evaluate(() => document.getElementById('ja-version')?.innerText || '');
      L(!foot && !exp && v.includes(VERSION), `page / @${vname}: no dossier footer (export and import live on skill/#dossier), version ${VERSION} at the bottom`, v);
    } else if (pg === 'skill/') {
      L(!foot && !exp, `page /skill/ @${vname}: no dossier footer on the question screen`, foot.slice(0, 80));
      await p.evaluate(() => { location.hash = 'dossier'; }); await p.waitForTimeout(150);
      const o = await p.evaluate(() => document.getElementById('ja-outils')?.innerText || '');
      L(o.includes(VERSION) && await p.locator('#ja-export').isVisible() && await p.locator('#ja-import').isVisible() && await overflow(p) === 0, `page /skill/#dossier @${vname}: export, import and version ${VERSION} on the dossier screen`, o.replace(/\s+/g, ' ').slice(0, 120));
    } else {
      // 25 Sept: « Only on the dossier screen » (Cowork Q&A 23 Sept) — the older pages lose the dossier footer; the version is shown on skill/#dossier (checked above), the page still runs this version's commun.js
      const st = await p.evaluate(() => ({ fichier: document.querySelectorAll('#ja-fichier, #ja-import, #ja-export-md').length, v: window.JA && JA.VERSION }));
      L(!foot && !exp && st.fichier === 0 && st.v === VERSION, `page /${pg} @${vname}: no dossier footer, no export or import (they live on skill/#dossier); runs commun.js ${VERSION}`, JSON.stringify(st));
    }
    if (pg === 'lire/' && vname === '1280') {
      const lay = await p.evaluate(() => { const a = document.getElementById('affirmations'), s = document.getElementById('sources'); const cs = e => getComputedStyle(e).overflowY;
        return { a: cs(a), s: cs(s), sScroll: s.scrollHeight > s.clientHeight, side: a.getBoundingClientRect().right <= s.getBoundingClientRect().left + 1, bodyFits: document.documentElement.scrollHeight <= innerHeight + 1, passages: document.querySelectorAll('.passage').length, sticky: getComputedStyle(document.getElementById('collant')).display }; });
      L(lay.a === 'auto' && lay.s === 'auto' && lay.sScroll && lay.side && lay.bodyFits && lay.sticky === 'none', 'lire/ @1280: claims left, passages right, independent scroll, page itself does not scroll', JSON.stringify(lay));
      await p.locator('#sources').evaluate(e => e.scrollTop = 900);
      const st = await p.evaluate(() => [document.getElementById('affirmations').scrollTop, document.getElementById('sources').scrollTop]);
      L(st[0] === 0 && st[1] > 0, 'lire/ @1280: scrolling the passages leaves the claims in place', JSON.stringify(st));
      const hidden = await p.evaluate(() => [...document.querySelectorAll('details:not([open]), [role=tab]')].length);
      L(hidden === 0, 'lire/ @1280: nothing behind tabs or closed drawers', String(hidden));
    }
    if (pg === 'lire/' && vname === '390') {
      await p.evaluate(() => window.scrollTo(0, document.getElementById('sources').offsetTop + 400)); await p.waitForTimeout(300);
      const s = await p.evaluate(() => { const c = document.getElementById('collant'); return { pos: getComputedStyle(c).position, top: Math.round(c.getBoundingClientRect().top), txt: c.innerText.slice(0, 80) }; });
      L(s.pos === 'sticky' && s.top === 0 && s.txt.length > 10, 'lire/ @390: stacked, the claim stays at the top while reading passages', JSON.stringify(s));
    }
    if (pg === '') {
      const home = await p.evaluate(() => ({ links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')), txt: document.body.innerText }));
      L(home.links.includes('skill/') && home.links.includes('skill/#question') && /S4|25 sept/i.test(home.txt) && /borner & autorité/i.test(home.txt) && !/Saint-Georges/i.test(home.txt), 'home S4: « borner & autorité » (the syllabus title), links skill/#question, no Saint-Georges', home.links.join(' '));
    }
    if (pg === 's3/') {
      const s3 = await p.evaluate(() => [...document.querySelectorAll('.module-number')].map(e => e.textContent));
      L(s3.length === 9 && s3.every(x => /^Exercice [IVX]+ \/ IX$/.test(x)) && !/MODULE/.test(await p.evaluate(() => document.body.innerText)), 's3: "Exercice" everywhere, no "MODULE"', s3.slice(0, 2).join(' | '));
    }
    await ctx.close();
  }
}

// ---------------- B · Skill flow (v3: one screen per step, reached by its address) ----------------
const view = async (p, v) => { await p.evaluate(v => { location.hash = v; }, v); await p.waitForTimeout(120); };
const ctxA = await browser.newContext({ ...LAPTOP, serviceWorkers: 'block', acceptDownloads: true });
const pa = await ctxA.newPage(); const errA = watch(pa);
await pa.goto(BASE + 'skill/', { waitUntil: 'networkidle' });
await pa.evaluate(() => localStorage.clear()); await pa.reload({ waitUntil: 'networkidle' });
L(await pa.locator('#b-question').isVisible() && await pa.locator('#etapes a[data-v="question"][aria-current="true"]').count() === 1, 'skill v3: opens on the question, the step strip marks it', '');
await pa.fill('#b-noms', 'Nour Haddad, Karim Salem'); await pa.fill('#b-lieu', 'Beit Beirut');
const Q = 'Qui a conçu Beit Beirut, et en quelle année ? Donne tes sources.';
await pa.fill('#b-question', Q);
await view(pa, 'ecrire');
const tpl0 = await pa.inputValue('#s-corps'), ph0 = await pa.getAttribute('#s-corps', 'placeholder');
L(tpl0 === '' && /Ici, le SKILL\.md entier/.test(ph0) && await pa.inputValue('#s-nom') === 'notre-batiment-v0', 'skill S4: editor starts empty, with the paste instruction, name notre-batiment-v0', ph0);
await pa.fill('#s-corps', '---\nname: colle-test\ndescription: "Collée depuis le modèle."\n---\n\n# Corps collé\n\n1. Une instruction.\n');
L(await pa.inputValue('#s-nom') === 'colle-test' && await pa.inputValue('#s-desc') === 'Collée depuis le modèle.' && !/^---/.test(await pa.inputValue('#s-corps')) && /Corps collé/.test(await pa.inputValue('#s-corps')), 'skill: a whole pasted SKILL.md fills name, description and body (fix of 24 Sept)', await pa.inputValue('#s-nom'));
const tpl = '# Skill v0 · Beit Beirut\n\n## Instructions\n\n1.\n\n2.\n\n3.\n';
await pa.fill('#s-nom', 'beit-beirut');
await pa.fill('#s-desc', 'x'.repeat(230));
const tooLong = await pa.evaluate(() => [document.getElementById('c-desc').className, document.getElementById('c-desc').textContent]);
L(/trop/.test(tooLong[0]) && /230 \/ 200/.test(tooLong[1]), 'skill: live description counter flags more than 200 characters', tooLong[1]);
await pa.fill('#s-desc', "À utiliser pour toute question sur Beit Beirut (Sodeco, Beyrouth) : qui l'a conçu, quand, sur quelle source.");
const okLen = await pa.evaluate(() => [document.getElementById('c-desc').className, document.getElementById('c-desc').textContent]);
L(!/trop/.test(okLen[0]), 'skill: counter back within the limit', okLen[1]);
const body0 = tpl.replace('1.\n', "1. Sépare l'attribution rapportée de la conclusion sur l'auteur du bâtiment.\n");
await pa.fill('#s-corps', body0);
L(await pa.locator('#v-change').count() === 0 && await pa.locator('#v-pourquoi').count() === 0, 'fix 2: v0 asks for no « ce qui a changé / pourquoi »', '');
await pa.click('#figer'); await pa.waitForTimeout(200);
L((await dossier(pa)).skill.versions.length === 1, 'fix 2: v0 freezes in one tap, with no note', '');
const body1 = body0.replace('2.\n', '2. Pour chaque date, nomme la page de la source, ou écris « sans source ».\n');
await pa.fill('#s-corps', body1);
await pa.click('#figer'); await pa.waitForTimeout(200);
L((await dossier(pa)).skill.versions.length === 1 && /Manque : ce qui a changé/.test(await pa.evaluate(() => document.getElementById('toast').textContent)), 'fix 2: from v1, « ce qui a changé / pourquoi » is still required', '');
await pa.fill('#v-change', 'Instruction 2 ajoutée : une page par date.'); await pa.fill('#v-pourquoi', "Essai 1 : l'année 1924 est venue sans page.");
await pa.click('#figer'); await pa.waitForTimeout(200);
let D = await dossier(pa);
L(D.skill.versions.length === 2 && D.skill.versions[0].n === 0 && D.skill.versions[1].n === 1 && D.skill.versions[0].change === '' && D.skill.versions[1].change && D.skill.versions[1].pourquoi && D.skill.versions.every(v => /\+0[23]:00$/.test(v.figee_le)), 'skill: v0 frozen bare, v1 with what changed and why, both at a Beirut time', D.skill.versions.map(v => 'v' + v.n + ' ' + v.figee_le).join(', '));
L(/^---\nname: beit-beirut\ndescription: "/.test(D.skill.brouillon), 'skill: brouillon holds the generated frontmatter', D.skill.brouillon.slice(0, 50));
await view(pa, 'versions');
await pa.selectOption('#cmp-a', '0'); await pa.selectOption('#cmp-b', '1');
const diff = await pa.evaluate(() => ({ plus: [...document.querySelectorAll('#diff .plus')].map(e => e.textContent), moins: [...document.querySelectorAll('#diff .moins')].map(e => e.textContent) }));
L(diff.plus.some(x => /une page par date|nomme la page/.test(x)) && diff.moins.some(x => /^2\.$/.test(x)), 'skill: side-by-side diff v0 → v1 shows the changed line', JSON.stringify(diff).slice(0, 200));
await pa.screenshot({ path: path.join(OUT, 'skill_diff_1280.png'), fullPage: false });
await view(pa, 'charger');
await pa.selectOption('#ex-quoi', '1');
const z = await download(pa, pa.locator('#ex-zip'));
L(z.name === 'beit-beirut.zip', 'skill: zip is named after the Skill', z.name);
let zl = ''; try { zl = execFileSync('unzip', ['-l', z.f], { encoding: 'utf8' }); } catch (e) { zl = 'ERR ' + e.message; }
const entries = zl.split('\n').map(l => l.trim().split(/\s+/).slice(3).join(' ')).filter(n => n && !/^(Name|----|files?)$/.test(n) && !/^-+$/.test(n)).filter(n => /beit/.test(n));
L(entries.length === 2 && entries.includes('beit-beirut/') && entries.includes('beit-beirut/SKILL.md'), 'skill: unzip -l shows one folder with SKILL.md', entries.join(', '));
let zt = ''; try { zt = execFileSync('unzip', ['-t', z.f], { encoding: 'utf8' }); } catch (e) { zt = 'ERR ' + e.message; }
L(/No errors detected/.test(zt), 'skill: unzip -t, CRC-32 correct', zt.split('\n').slice(-2).join(' '));
const md = execFileSync('unzip', ['-p', z.f, 'beit-beirut/SKILL.md'], { encoding: 'utf8' });
const fm = JSON.parse(execFileSync('python3', ['-c', 'import sys,yaml,json,re;s=sys.stdin.read();m=re.match(r"^---\\n(.*?)\\n---\\n",s,re.S);print(json.dumps(yaml.safe_load(m.group(1)) if m else None))'], { input: md, encoding: 'utf8' }));
L(fm && fm.name === 'beit-beirut' && typeof fm.description === 'string' && fm.description.length > 0 && fm.description.length <= 200 && Object.keys(fm).length === 2 && md.includes('nomme la page de la source'), 'skill: SKILL.md frontmatter parses as YAML (name = folder, description ≤ 200) and holds v1', JSON.stringify(fm));
const single = await download(pa, pa.locator('#ex-md'));
L(single.name === 'SKILL.md' && fs.readFileSync(single.f, 'utf8') === md, 'skill: SKILL.md alone is identical to the one in the zip', single.name);
const help = await pa.evaluate(() => document.getElementById('exporter').innerText);
L(/Customize > Skills/.test(help) && /exécution de code/.test(help) && /ChatGPT/.test(help) && /premier message/.test(help), 'skill: help panel for Claude, ChatGPT and pasting');

// ---------------- C · one bench run (v3: a D run on its own screen; the review fields fold under the run) ----------------
await view(pa, 'd');
L(/Beit Beirut/.test(await pa.locator('.question-lue').innerText()), 'bench: the pair\'s question is shown on the condition screen', '');
await pa.selectOption('#e-version', '1'); await pa.selectOption('#e-app', 'Claude');
await pa.fill('#e-modele', 'Claude Sonnet 4.5');
await pa.locator('#e-web').getByRole('button', { name: 'non' }).click();
await pa.locator('#e-mode').getByRole('button', { name: 'chargée' }).click();
await pa.fill('#e-reponse', 'Attribution rapportée : Youssef Aftimos — sans source. Date : 1924 — sans source.');
await pa.click('#enreg'); await pa.waitForTimeout(200);
await pa.locator('#essai-0 details.repli summary').click();
for (const [k, v] of [['etayees', '0'], ['contredites', '1'], ['non_resolues', '2'], ['utilisables', '1']]) await pa.fill(`#${k}-0`, v);
await pa.fill('#g-0', 'La réponse dit quand elle n\'a pas de source.'); await pa.fill('#p-0', 'Le nom de l\'architecte du musée actuel a disparu.');
await pa.fill('#d-0', 'Garder l\'instruction 2 ; réviser la 1 pour ne pas faire perdre la piste du musée.');
D = await dossier(pa);
const E = D.essais[0] || {};
L(D.essais.length === 1 && E.condition === 'D' && E.version === 1 && E.app === 'Claude' && E.modele === 'Claude Sonnet 4.5' && E.date === beirutDay() && E.web === false && E.mode === 'chargée' && E.question === Q && E.contredites === 1 && E.non_resolues === 2 && E.utilisables === 1 && E.decision, 'bench: one run recorded with every field of the plan', JSON.stringify(E).slice(0, 220));
L(await pa.locator('#etapes a[data-v="d"].vu').count() === 1, 'bench v3: the strip shows D as run, not yet scored', '');
await view(pa, 'dossier');
L(await pa.locator('#essais details.essai').count() === 1, 'bench: the run is listed', '');
await view(pa, 'question');
await pa.fill('#b-question', Q + ' Réponds en anglais.');
L(await pa.locator('#q-diff').isVisible(), 'bench: warning when the question differs from the previous run', '');
await pa.fill('#b-question', Q);
L(!(await pa.locator('#q-diff').isVisible()), 'bench: no warning when the question is the same', '');
await view(pa, 'dossier');
const crit = await pa.evaluate(() => document.getElementById('dossier').innerText);
L(/9 octobre/.test(crit) && /présentation orale/.test(crit) && /2 \/ 2/.test(crit) && /1 \/ 1/.test(crit), 'skill: the 40 % criteria are shown with live counts', crit.replace(/\s+/g, ' ').slice(0, 160));
// the Skill page at 390 with content: still no horizontal scroll, on every screen
const ctxP = await browser.newContext({ ...PHONE, serviceWorkers: 'block' }); const pp = await ctxP.newPage(); const errP = watch(pp);
await pp.goto(BASE + 'skill/'); await pp.evaluate(s => localStorage.setItem('judging-ai-dossier', s), JSON.stringify(D)); await pp.reload({ waitUntil: 'networkidle' });
let ovP = 0;
for (const v of ['question', 'a', 'c', 'd', 'trois', 'ecrire', 'versions', 'charger', 'dossier']) { await view(pp, v); if (v === 'versions') { await pp.selectOption('#cmp-a', '0'); await pp.selectOption('#cmp-b', '1'); } ovP = Math.max(ovP, await overflow(pp)); }
L(ovP === 0 && errP.length === 0, 'skill @390, every screen, with two versions, a diff and a run: no horizontal scroll, no errors', errP.join(' | '));
await view(pp, 'versions'); await pp.screenshot({ path: path.join(OUT, 'skill_filled_390.png'), fullPage: true }); await ctxP.close();

// ---------------- D · lire/ answers persist ----------------
await pa.goto(BASE + 'lire/', { waitUntil: 'networkidle' });
const answers = { sg1: 'P1 dit « en association avec » ; A1 dit que la firme a conçu. On ne peut pas écrire « conçu par Tabet » seul.', sg2: 'A4, lettre du 27 mai 1931, citée par Arbid.', sg3: 'W1 seulement ; ouverture ≠ construction.', sg4: 'A5 : plans signés 1946-47, cités par Arbid.' };
for (const [k, v] of Object.entries(answers)) await pa.fill('#r-' + k, v);
await pa.locator('#a-sg2 .renvois a').first().click(); await pa.waitForTimeout(700);
L(await pa.locator('#p-ar3.eclaire').count() === 1, 'lire/: a passage link highlights the passage on the right', '');
await pa.reload({ waitUntil: 'networkidle' });
const kept = await pa.evaluate(ids => ids.map(k => document.getElementById('r-' + k).value), Object.keys(answers));
L(kept.every((v, i) => v === Object.values(answers)[i]), 'lire/: answers persist after reload', kept.map(v => v.slice(0, 12)).join(' | '));
D = await dossier(pa);
L(Object.keys(D.lire).length === 4 && D.lire.sg1.affirmation.includes('Antoine Tabet'), 'lire/: answers saved into the dossier with their claim', Object.keys(D.lire).join(','));
const srcTxt = await pa.evaluate(() => document.getElementById('sources').textContent);
L(!/Perret had no input/.test(await pa.evaluate(() => document.body.innerText)) && /cité par un autre/.test(srcTxt) && /ouvert directement/.test(srcTxt), 'lire/: Perret claim dropped; each passage says opened directly or quoted by another');
const longest = await pa.evaluate(() => Math.max(...[...document.querySelectorAll('blockquote')].map(b => b.textContent.length)));
L(longest < 800, 'lire/: passages kept short (longest quotation under 800 characters)', String(longest));

// ---------------- E · dossier export → fresh profile import → identical ----------------
await pa.evaluate(() => localStorage.setItem('judging-ai-s3-work', JSON.stringify({ fields: { pair: 'Nour & Karim', place: 'Beit Beirut', sg_why: 'Le passage permet de dire…' }, unlocked: true })));
await pa.goto(BASE + 'skill/#dossier', { waitUntil: 'networkidle' }); // export lives on skill/#dossier only (25 Sept)
const ex1 = await download(pa, pa.locator('#ja-export'));
const exMd = await download(pa, pa.locator('#ja-export-md'));
const J1 = JSON.parse(fs.readFileSync(ex1.f, 'utf8'));
L(ex1.name === `dossier-beit-beirut-${beirutDay()}.json` && exMd.name === `dossier-beit-beirut-${beirutDay()}.md`, 'dossier: filenames dated in Beirut time', ex1.name + ' · ' + exMd.name);
L(J1.format === 'juger-ia-dossier/1' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+0[23]:00$/.test(J1.exporte_le) && J1.s3 && J1.s3.place === 'Beit Beirut' && J1.skill.versions.length === 2 && J1.essais.length === 1 && J1.binome.noms.length === 2, 'dossier: JSON juger-ia-dossier/1, Beirut time, s3 pulled from judging-ai-s3-work', J1.exporte_le);
const mdTxt = fs.readFileSync(exMd.f, 'utf8');
L(/# Dossier · Beit Beirut/.test(mdTxt) && /### v1/.test(mdTxt) && /Claude Sonnet 4.5/.test(mdTxt) && /en association avec/.test(mdTxt) && /Nour & Karim/.test(mdTxt), 'dossier: readable .md carries versions, run, lire/ answers and s3', mdTxt.length + ' chars');
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'ja-fresh-'));
const fresh = await chromium.launchPersistentContext(prof, { executablePath: EXE, ...PHONE, serviceWorkers: 'block', acceptDownloads: true });
const pf = fresh.pages()[0] || await fresh.newPage(); const errF = watch(pf);
await pf.goto(BASE + 'skill/#dossier', { waitUntil: 'networkidle' }); // import lives on skill/#dossier only (25 Sept)
L(await pf.evaluate(() => localStorage.length) === 0, 'fresh profile: empty storage', '');
fs.writeFileSync(path.join(OUT, 'inconnu.json'), JSON.stringify({ format: 'autre-chose/2', a: 1 }));
await pf.setInputFiles('#ja-fichier', path.join(OUT, 'inconnu.json')); await pf.waitForTimeout(300);
const refuse = await pf.evaluate(() => document.querySelector('.ja-dlg[open]')?.innerText || '');
L(/Format inconnu/.test(refuse) && /Rien n'a été changé/.test(refuse) && await pf.evaluate(() => localStorage.getItem('judging-ai-dossier')) === null, 'import: unknown format refused with a message, nothing changed', refuse.replace(/\s+/g, ' ').slice(0, 100));
await pf.mouse.click(5, 5); await pf.waitForTimeout(200);
L(await pf.locator('.ja-dlg[open]').count() === 0, 'import: the message closes from outside', '');
await pf.setInputFiles('#ja-fichier', ex1.f); await pf.waitForTimeout(300);
const ask = await pf.evaluate(() => document.querySelector('.ja-dlg[open]')?.innerText || '');
L(/Remplacer/.test(ask) && /2 versions · 1 essai/.test(ask), 'import: asks before replacing, says what the file holds', ask.replace(/\s+/g, ' ').slice(0, 160));
await Promise.all([pf.waitForNavigation({ waitUntil: 'networkidle' }), pf.locator('.ja-dlg button[value=y]').click()]);
await pf.goto(BASE + 'lire/', { waitUntil: 'networkidle' });
const back = await pf.evaluate(ids => ids.map(k => document.getElementById('r-' + k).value), Object.keys(answers));
L(back.every((v, i) => v === Object.values(answers)[i]), 'import: lire/ answers back on screen after import', '');
L(await pf.evaluate(() => !!localStorage.getItem('judging-ai-dossier-avant-import')), 'import: a copy of the previous state was kept', '');
await pf.goto(BASE + 'skill/#dossier', { waitUntil: 'networkidle' });
const ex2 = await download(pf, pf.locator('#ja-export'), 'reexport.json');
const J2 = JSON.parse(fs.readFileSync(ex2.f, 'utf8'));
const strip = j => { const c = JSON.parse(JSON.stringify(j)); delete c.exporte_le; return JSON.stringify(c); };
L(strip(J1) === strip(J2), 'dossier: export → import in a fresh profile → re-export is identical (except exporte_le)', strip(J1).length + ' / ' + strip(J2).length + ' chars');
await pf.goto(BASE + 's3/', { waitUntil: 'networkidle' });
await pf.locator('#tab-work').click();
L(await pf.evaluate(() => { const e = document.getElementById('sg_why'); return e && e.value; }) === 'Le passage permet de dire…', 'import: s3 fields restored into the S3 page', '');
L(errF.length === 0, 'fresh profile: no console errors', errF.join(' | '));
await fresh.close(); fs.rmSync(prof, { recursive: true, force: true });
L(errA.length === 0, 'Skill, bench, lire, export flow: no console errors', errA.join(' | '));
await ctxA.close();

// ---------------- F · journal fixes ----------------
const ctxJ = await browser.newContext({ ...PHONE, serviceWorkers: 'block' }); const pj = await ctxJ.newPage(); const errJ = watch(pj);
await pj.goto(BASE + 'journal/#journal', { waitUntil: 'networkidle' });
await pj.getByRole('button', { name: /Nouvelle ligne/ }).click();
await pj.locator('details[open] .row button', { hasText: 'Supprimer' }).click(); await pj.waitForTimeout(200);
const opened = await pj.locator('#dlg[open]').count();
await pj.mouse.click(8, 8); await pj.waitForTimeout(200);
L(opened === 1 && await pj.locator('#dlg[open]').count() === 0 && (await pj.evaluate(() => JSON.parse(localStorage.getItem('judging-ai-journal')).lignes.length)) === 1, 'journal: delete dialog closes from outside, nothing deleted', '');
fs.writeFileSync(path.join(OUT, 'journal1.json'), JSON.stringify({ schema: 1, lieu: { nom: '' }, lignes: [{ id: 'z1', affirmation: 'x' }], enquetes: [{ id: 'e1', titre: 'Beit Beirut', tours: [] }] }));
await pj.goto(BASE + 'journal/#garder', { waitUntil: 'networkidle' });
await pj.setInputFiles('#fileIn', path.join(OUT, 'journal1.json')); await pj.waitForTimeout(400);
const toast = await pj.evaluate(() => document.getElementById('toast').innerText);
L(/1 ligne, 1 enquête$/.test(toast.trim()), 'journal: "1 enquête", singular', toast);
L(errJ.length === 0, 'journal: no console errors', errJ.join(' | '));
await ctxJ.close();

// ---------------- H · four conditions A–D, six boxes, the sign choice (v3: one screen per condition, then « les trois ») ----------------
const CASES = ["d'où vient chaque affirmation", "un passage précis", "les désaccords séparés", "dit ce qui manque", "aucune référence inventée", "répond"];
const OLD = JSON.parse(JSON.stringify(J1)); delete OLD.signer; OLD.essais.forEach(e => { for (const k of ['condition', 'skill_source', 'reponse', 'cases', 'note_par']) delete e[k]; });
const ctxH = await browser.newContext({ ...LAPTOP, serviceWorkers: 'block', acceptDownloads: true });
const ph = await ctxH.newPage(); const errH = watch(ph);
await ph.goto(BASE + 'skill/', { waitUntil: 'networkidle' });
await ph.evaluate(s => { localStorage.clear(); localStorage.setItem('judging-ai-dossier', s); }, JSON.stringify(OLD)); await ph.reload({ waitUntil: 'networkidle' });
await view(ph, 'dossier');
L(await ph.locator('#essais details.essai').count() === 1 && (await dossier(ph)) && errH.length === 0, 'four: a dossier from before (no condition, boxes or signer fields) still opens, its run listed', '');
const has = async () => ph.evaluate(() => ['e-source', 'e-reponse', 'e-version'].map(id => document.getElementById(id) ? 1 : 0).join(''));
const seen = {};
const ANS = { A: 'Beit Beirut a été conçu par Youssef Aftimos en 1924.', C: 'Barakat (1924, rapporté par Arbid, p. 12) ; aucune source pour Aftimos.', D: 'Attribution rapportée : Youssef Bey Aftimos (Arbid, p. 12). Date : 1924, sans page — je déduis.' };
L(await ph.locator('#etapes a[data-v="b"]').count() === 0, 'S4: B (generic) is not in the step strip', '');
await view(ph, 'b');
L(await ph.locator('#b-question').isVisible() && await ph.locator('#banc').count() === 0, 'S4: #b is not a screen any more (falls back to the question)', '');
for (const c of ['A', 'C', 'D']) {
  await view(ph, c.toLowerCase());
  seen[c] = await has();
  if (c === 'C') { L(await ph.locator('#e-mode button[data-v="collée"][aria-pressed=true]').count() === 1, 'S4: a new C run defaults to « collée »', ''); await ph.fill('#e-source', 'juger-ia/prof-lieu, reçue le 25/09'); }
  if (c === 'D') await ph.selectOption('#e-version', '1');
  await ph.fill('#e-reponse', ANS[c]);
  await ph.click('#enreg'); await ph.waitForTimeout(150);
}
L(seen.A === '010' && seen.C === '110' && seen.D === '011', 'four: the form asks the Skill name/source only for C, one answer field, the version only for D', JSON.stringify(seen));
let DH = await dossier(ph);
L(DH.essais.length === 4 && DH.essais.slice(1).map(e => e.condition).join('') === 'ACD' && DH.essais[2].skill_source.startsWith('juger-ia/prof') && DH.essais[3].version === 1 && DH.essais.slice(1).every((e, i) => e.reponse === ANS['ACD'[i]] && e.question === Q) && DH.essais[0].condition === '',
  'four: runs A, C, D recorded with condition, source, answer, same question; the old run has no condition', DH.essais.map(e => e.condition || '—').join(' '));
await view(ph, 'a');
const casesTxt = await ph.evaluate(() => document.getElementById('banc').textContent);
await view(ph, 'trois');
const labTxt = await ph.evaluate(() => document.getElementById('quatre').textContent);
L(CASES.every(c => casesTxt.includes(c)) && /A · sans SKILL.md/.test(labTxt) && !/SKILL.md générique/.test(labTxt) && /C · SKILL.md/.test(labTxt) && /D · SKILL.md du binôme/.test(labTxt), 'four: labels A, C, D, no B, and the six boxes verbatim in French', '');
const TICK = { A: [0, 5], C: [0, 1, 2, 3, 5], D: [0, 1, 2, 3, 4, 5] }, BY = { A: 'Lina & Omar', C: 'Sara & Jad', D: 'Sara & Jad' };
const tick = async (i, k) => { if (k === 4) await ph.locator(`#c-${i}-4 button[data-v="1"]`).click(); else await ph.locator(`#c-${i}-${k}`).check(); };
const runScore = [];
for (const [i, c] of [[1, 'A'], [2, 'C'], [3, 'D']]) {
  await view(ph, c.toLowerCase());
  for (const k of TICK[c]) await tick(i, k);
  if (c === 'C') { await ph.locator('#c-2-4 button[data-v="n"]').click();
    await ph.locator('#cit-2 button[data-v="non"]').click(); await ph.fill('#cp-2', "Ligne 2 : la page citée n'existe pas."); }
  await ph.fill(`#n-${i}`, BY[c]);
  runScore.push(await ph.evaluate(i => document.querySelector(`#essai-${i} .ja-score`).textContent + ' · ' + document.querySelector(`#essai-${i} .score-ligne .ja-etat`).textContent, i));
}
await view(ph, 'a'); await ph.locator('#c-1-5').uncheck(); await ph.locator('#c-1-5').check();
DH = await dossier(ph);
const bx = e => e.cases.map(x => x === null ? 'n' : x === '' ? '_' : x ? 1 : 0).join('');
L(DH.essais.slice(1).map(bx).join(' ') === '1000_1 1111n1 111111' && DH.essais.slice(1).every((e, i) => e.note_par === BY['ACD'[i]]), 'four: boxes (case 5 « non ouverte » = null on C) and "noté par le binôme" saved on each run', DH.essais.slice(1).map(bx).join(' '));
L(DH.essais[2].citer === 'non' && /n'existe pas/.test(DH.essais[2].citer_pourquoi) && DH.essais[1].citer === '', 'S4: the grader\'s « la citeriez-vous telle quelle ? » and its why are saved on the run', JSON.stringify([DH.essais[2].citer, DH.essais[2].citer_pourquoi]));
L(runScore.join('|') === '2/5 · noté par le binôme : Lina & Omar|5/5 · noté par le binôme : Sara & Jad|6/6 · noté par le binôme : Sara & Jad', 'four: score computed live on each run, over the boxes set (case 5 untouched or « non ouverte » leaves the total)', runScore.join(' | '));
L(await ph.locator('#etapes a[data-v="a"].note').count() === 1 && await ph.locator('#etapes a[data-v="d"].note').count() === 1, 'four v3: the strip shows scored conditions', '');
await view(ph, 'trois');
const grid = async p => p.evaluate(() => [...document.querySelectorAll('#quatre-grille > div')].map(d => d.dataset.c + ':' + (d.querySelector('.ja-score')?.textContent || '-')).join(' '));
L(await grid(ph) === 'A:2/5 C:5/5 D:6/6' && await ph.locator('#quatre .alerte').count() === 0, 'four: « les trois » shows A, C, D side by side with their scores, no B', await grid(ph));
const side = await ph.evaluate(() => { const r = [...document.querySelectorAll('#quatre-grille > div')].map(d => d.getBoundingClientRect()); return r.length === 3 && r.every(x => Math.abs(x.top - r[0].top) < 2) && r[0].right <= r[1].left; });
L(side, 'four @1280: the three columns sit on one row', '');
await ph.locator('#quatre-grille > div[data-c="C"]').click();
await ph.fill('#signer-pourquoi', 'C cite ses passages et dit quand il déduit ; D aussi, mais nous l\'avons écrite : un autre binôme l\'a notée 6, nous gardons C comme témoin.');
DH = await dossier(ph);
L(DH.signer.condition === 'C' && /témoin/.test(DH.signer.pourquoi) && await ph.locator('#quatre-grille > div[data-c="C"].signe[aria-pressed=true]').count() === 1, 'four: clicking C chooses it; saved, and C carries the rose frame', JSON.stringify(DH.signer).slice(0, 80));
const lt = await ph.evaluate(() => { const g = [...document.querySelectorAll('#quatre-grille > div')], rgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')', css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  return { frame: getComputedStyle(g[1]).boxShadow, rose: rgb(css('--rose')), tags: g.map(d => d.querySelector('.ja-signee')?.textContent || '').join('|'), best: g.map(d => d.querySelector('.ja-score.meilleur') ? d.dataset.c : '').join(''), bestColour: getComputedStyle(document.querySelector('.ja-score.meilleur b')).color, accent: rgb(css('--accent')) }; });
L(lt.frame.includes(lt.rose) && /4px/.test(lt.frame) && lt.tags === '|signée|' && lt.best === 'D' && lt.bestColour === lt.accent, 'LesTrois: 4px rose frame (his third colour) and « signée » on the signed one only; the best score (D, 6/6) in the accent', JSON.stringify(lt));
await ph.locator('#quatre-grille > div[data-c="D"]').focus(); await ph.keyboard.press('Enter');
L((await dossier(ph)).signer.condition === 'D' && await ph.locator('#quatre-grille > div[aria-pressed=true]').count() === 1 && await ph.locator('#quatre-grille > div[data-c="D"][aria-pressed=true]').count() === 1, 'four v3: a block can be chosen from the keyboard; only one is chosen', '');
await ph.locator('#quatre-grille > div[data-c="C"]').click();
await ph.reload({ waitUntil: 'networkidle' });
const DK = await dossier(ph);
const kept4 = [DK.essais.slice(1).map(bx).join(' '), await ph.evaluate(() => document.querySelector('#quatre-grille [aria-pressed=true]')?.dataset.c), await ph.evaluate(() => document.getElementById('signer-pourquoi').value.length > 0)];
L(kept4[0] === '1000_1 1111n1 111111' && kept4[1] === 'C' && kept4[2], 'four: boxes and sign choice persist after reload', JSON.stringify(kept4));
L(await overflow(ph) === 0, 'four @1280: no horizontal scroll', '');
await ph.locator('#quatre').screenshot({ path: path.join(OUT, 'four_1280.png') });
await view(ph, 'a');
L(await ph.locator('#ja-export').count() === 0 && await ph.locator('#ja-fichier').count() === 0, 'S4 V3: no export or import on a bench screen', '');
await view(ph, 'dossier');
const ex3 = await download(ph, ph.locator('#ja-export'));
const ex3md = await download(ph, ph.locator('#ja-export-md'), 'four.md');
const J3 = JSON.parse(fs.readFileSync(ex3.f, 'utf8'));
L(J3.format === 'juger-ia-dossier/1' && J3.essais.slice(1).map(e => e.condition + e.cases.filter(Boolean).length).join('') === 'A2C5D6' && J3.signer.condition === 'C' && J3.essais[2].note_par === 'Sara & Jad' && J3.essais[2].cases[4] === null && J3.essais[2].citer === 'non', 'four: JSON export carries conditions, boxes (null kept), scorer, citer and sign choice', J3.essais.map(e => e.condition).join(','));
const md4 = fs.readFileSync(ex3md.f, 'utf8');
L(/### Essai 3 · C · SKILL.md/.test(md4) && md4.includes('- [x] 1 · ' + CASES[0]) && md4.includes('- [-] 5 · ' + CASES[4] + ' · non ouverte') && /\*\*Score\*\* : 5 \/ 5 · noté par le binôme : Sara & Jad/.test(md4) && /## Les conditions/.test(md4) && /\| A · sans SKILL.md \| 2 \| 2 \/ 5 \| Lina & Omar \|/.test(md4) && !/SKILL.md générique/.test(md4) && /\*\*À citer telle quelle \?\*\* non · Ligne 2/.test(md4) && /\*\*Laquelle signer dans le dossier \?\*\* C · SKILL.md/.test(md4) && md4.includes('juger-ia/prof-lieu'),
  'four: readable .md carries each run\'s boxes, score, « citeriez-vous », the conditions table (no empty B) and the sign choice', md4.length + ' chars');
L(errH.length === 0, 'four @1280: no console errors', errH.join(' | '));
await ctxH.close();
// fresh profile at 390: import → identical, same screen
const prof4 = fs.mkdtempSync(path.join(os.tmpdir(), 'ja-four-'));
const f4 = await chromium.launchPersistentContext(prof4, { executablePath: EXE, ...PHONE, serviceWorkers: 'block', acceptDownloads: true });
const p4 = f4.pages()[0] || await f4.newPage(); const err4 = watch(p4);
await p4.goto(BASE + 'skill/#trois', { waitUntil: 'networkidle' });
L(await p4.evaluate(() => localStorage.getItem('judging-ai-dossier')) === null && await p4.locator('#quatre-grille .ja-score').count() === 0 && await p4.locator('#quatre-grille > div.pas-vu').count() === 3 && await p4.locator('#quatre-grille > div[data-c="B"]').count() === 0, 'four fresh profile @390: empty, no scores, A C D dashed, B absent until tried', '');
await view(p4, 'dossier');
await p4.setInputFiles('#ja-fichier', ex3.f); await p4.waitForTimeout(300);
L(/4 essais/.test(await p4.evaluate(() => document.querySelector('.ja-dlg[open]')?.innerText || '')), 'four import: the dialog counts 4 runs', '');
await Promise.all([p4.waitForNavigation({ waitUntil: 'networkidle' }), p4.locator('.ja-dlg button[value=y]').click()]);
await view(p4, 'trois');
const D4 = await p4.evaluate(() => JSON.parse(localStorage.getItem('judging-ai-dossier')));
const back4 = [D4.essais.slice(1).map(bx).join(' '), await p4.evaluate(() => document.querySelector('#quatre-grille [aria-pressed=true]')?.dataset.c), D4.essais[2].note_par];
L(await grid(p4) === 'A:2/5 C:5/5 D:6/6' && back4[0] === '1000_1 1111n1 111111' && back4[1] === 'C' && back4[2] === 'Sara & Jad', 'four import: boxes, scores, scorer and sign choice back on screen', JSON.stringify(back4));
await view(p4, 'dossier');
const ex4 = await download(p4, p4.locator('#ja-export'), 'four_reexport.json');
L(strip(J3) === strip(JSON.parse(fs.readFileSync(ex4.f, 'utf8'))), 'four: export → import in a fresh profile → re-export is identical (except exporte_le)', strip(J3).length + ' chars');
let ov4 = 0; for (const v of ['a', 'c', 'd', 'trois']) { await view(p4, v); ov4 = Math.max(ov4, await overflow(p4)); }
L(ov4 === 0, 'four @390: each condition screen and « les trois »: no horizontal scroll', '');
await p4.screenshot({ path: path.join(OUT, 'four_390.png'), fullPage: true });
await p4.click('#lang');
const en = await p4.evaluate(() => document.getElementById('quatre').textContent);
await view(p4, 'a');
const enA = await p4.evaluate(() => document.getElementById('banc').textContent);
L(/Which one to sign in the dossier\?/.test(en) && /C · SKILL.md/.test(en) && /disagreements kept apart/.test(enA), 'four: English labels when the language is switched', '');
L(err4.length === 0, 'four @390: no console errors', err4.join(' | '));
await f4.close(); fs.rmSync(prof4, { recursive: true, force: true });

// ---------------- I · a fresh pair: A, B, C with no frozen version, then v0, then D ----------------
const ctxI = await browser.newContext({ ...PHONE, serviceWorkers: 'block' }); const pi = await ctxI.newPage(); const errI = watch(pi);
await pi.goto(BASE + 'skill/', { waitUntil: 'networkidle' }); await pi.evaluate(() => localStorage.clear()); await pi.reload({ waitUntil: 'networkidle' });
await pi.fill('#b-noms', 'Rita Khoury, Elie Nassar'); await pi.fill('#b-lieu', 'Maison Fayad'); await pi.fill('#b-question', 'Qui a construit la maison Fayad, et quand ?');
const pdvShown = async () => pi.locator('#pas-de-v').isVisible();
await view(pi, 'd');
L(await pdvShown() && await pi.locator('#enreg').isVisible() && await pi.locator('#pas-de-v a[href="#ecrire"]').count() === 1 && await pi.locator('#etapes a[data-v="ecrire"]').count() === 0, 'fresh pair (simple-s4): D screen open with no frozen version, notice shown with its link to SKILL.md, SKILL.md not in the strip', '');
await view(pi, 'a');
await pi.fill('#e-modele', 'ChatGPT 5');
for (const c of ['A', 'C']) {
  await view(pi, c.toLowerCase());
  if (c !== 'A') await pi.fill('#e-source', 'Skill du prof, reçue le 25/09');
  await pi.fill('#e-reponse', 'Réponse ' + c + ' : la maison Fayad, 1880 — sans source.');
  L(!(await pdvShown()) && !(await pi.locator('#e-version').isVisible()) && await pi.inputValue('#e-modele') === 'ChatGPT 5', `fresh pair: ${c} needs no version (no notice, no version selector), the model carried over`, '');
  await pi.click('#enreg'); await pi.waitForTimeout(150);
}
let DI = await dossier(pi);
L(DI.skill.versions.length === 0 && DI.essais.map(e => e.condition).join('') === 'AC', 'fresh pair: A, C recorded with no frozen version', DI.essais.map(e => e.condition + ':v' + e.version).join(' '));
await view(pi, 'd');
await pi.fill('#e-reponse', 'Réponse D.');
L(await pdvShown(), 'fresh pair: D shows the notice while no version is frozen', '');
await pi.click('#enreg'); await pi.waitForTimeout(150);
const tI = await pi.evaluate(() => document.getElementById('toast').textContent);
L((await dossier(pi)).essais.length === 2 && /D'abord, une version figée/.test(tI), 'fresh pair: D is refused until a version is frozen', tI);
await view(pi, 'ecrire');
await pi.click('#figer'); await pi.waitForTimeout(200);
await view(pi, 'd');
L(await pi.locator('#etapes a[data-v="d"][aria-current=true]').count() === 1 && !(await pdvShown()) && await pi.locator('#e-version').isVisible() && await pi.inputValue('#e-reponse') === 'Réponse D.', 'fresh pair: after freezing v0, D keeps its answer and shows the version selector', '');
await pi.click('#enreg'); await pi.waitForTimeout(150);
DI = await dossier(pi);
const dRun = DI.essais[2] || {};
await view(pi, 'dossier');
L(DI.essais.length === 3 && dRun.condition === 'D' && dRun.version === 0 && DI.skill.versions[0].n === 0 && await pi.locator('#essais details.essai summary').first().innerText().then(x => /D · SKILL.md du binôme · v0/.test(x)), 'fresh pair: D recorded, linked to v0', 'D:v' + dRun.version);
await view(pi, 'trois');
L(await pi.evaluate(() => [...document.querySelectorAll('#quatre-grille > div')].map(d => d.dataset.c + (d.querySelector('.ja-score') ? '+' : '-')).join('')) === 'A+C+D+', 'fresh pair: the three conditions are filled in the summary', '');
L(await overflow(pi) === 0 && errI.length === 0, 'fresh pair @390: no horizontal scroll, no console errors', errI.join(' | '));
await ctxI.close();

// ---------------- J · fixes of 24 Sept evening (cold usage test USAGE_COLD_v3_2026-09-24.md) ----------------
{
const WALL = "En cinq lignes au plus : Issam Fares Institute, campus de l'AUB, Beyrouth. Quelles sont sa hauteur, sa surface de plancher et son nombre de niveaux ?";
const ctxJ2 = await browser.newContext({ ...PHONE, serviceWorkers: 'block', acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
const pj2 = await ctxJ2.newPage(); const errJ2 = watch(pj2);
const clip = () => pj2.evaluate(() => navigator.clipboard.readText());
await pj2.goto(BASE, { waitUntil: 'networkidle' }); await pj2.evaluate(() => localStorage.clear()); await pj2.reload({ waitUntil: 'networkidle' });
const h0 = await pj2.evaluate(() => ({ first: document.getElementById('app').firstElementChild.id, tabs: [...document.querySelectorAll('nav.vues button')].map(b => b.textContent), pressed: document.querySelectorAll('#q-seul [aria-pressed=true]').length, q: document.getElementById('accueil-question')?.textContent }));
L(h0.first === 'qui' && h0.pressed === 0, 'fix 1: the home page first asks « seul / en binôme », nothing chosen yet', JSON.stringify(h0).slice(0, 120));
L(h0.tabs.join(' | ') === "Séance 4 · aujourd'hui | Le cours · calendrier, carte, notes" && !h0.tabs.some(x => /S4/.test(x)), 'fix 1: the two tabs say what they open, never « S4 »', h0.tabs.join(' | '));
L(h0.q === WALL, "fix 1: the home page's question is the wall's, word for word", h0.q);
await pj2.click('#q-seul button[data-v="binome"]'); await pj2.fill('#q-nom1', 'Nour Haddad'); await pj2.fill('#q-nom2', 'Karim Salem');
await pj2.reload({ waitUntil: 'networkidle' });
const h1 = await pj2.evaluate(() => [document.querySelector('#q-seul [aria-pressed=true]')?.dataset.v, document.getElementById('q-nom1').value, document.getElementById('q-nom2').value, JSON.stringify(JSON.parse(localStorage.getItem('judging-ai-dossier')).binome)]);
L(h1[0] === 'binome' && h1[1] === 'Nour Haddad' && h1[2] === 'Karim Salem' && /"seul":false,"noms":\["Nour Haddad","Karim Salem"\]/.test(h1[3]), 'fix 1: « en binôme » and the two names are saved in the dossier and back after reload', h1[3]);
await pj2.goto(BASE + 'skill/#question', { waitUntil: 'networkidle' });
L(await pj2.inputValue('#b-noms') === 'Nour Haddad, Karim Salem', 'fix 1: skill/#question shows the same names (one source: the dossier)', await pj2.inputValue('#b-noms'));
L(await pj2.inputValue('#b-question') === WALL && await pj2.getAttribute('#b-question', 'placeholder') === WALL, 'the question field opens on the room\'s question (Issam Fares Institute), placeholder the same', await pj2.getAttribute('#b-question', 'placeholder'));
const strip = await pj2.evaluate(() => { const n = document.getElementById('etapes'); return { sc: n.scrollWidth > n.clientWidth, out: [...n.querySelectorAll('a')].filter(a => { const r = a.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth || r.width === 0; }).map(a => a.dataset.v), squares: [...n.querySelectorAll('.q a')].map(a => a.dataset.v).join(','), rows: new Set([...n.querySelectorAll('.q a')].map(a => Math.round(a.getBoundingClientRect().top))).size, name: n.querySelector('.nom')?.textContent, right: n.querySelector('.ailleurs')?.textContent }; });
L(!strip.sc && strip.out.length === 0 && strip.squares === 'question,a,c,d,trois' && strip.rows === 1 && strip.name === 'la question' && strip.right === 'le dossier', 'fix 9 (V3 StepSquares, simple-s4): @390 five squares on one row, only the current step named, « le dossier » at right, nothing off screen', JSON.stringify(strip));
const Qj = 'En cinq lignes au plus : Immeuble de l\'Électricité du Liban, rue du Fleuve, Beyrouth. Quelles sont sa hauteur, sa surface de plancher et son nombre de niveaux ?';
await pj2.fill('#b-question', Qj);
let quiAll = [];
for (const v of ['question', 'a', 'c', 'd', 'trois', 'ecrire', 'versions', 'charger', 'dossier']) { await view(pj2, v); quiAll.push(await pj2.evaluate(() => document.getElementById('qui').textContent)); }
L(quiAll.every(x => x === 'Nour Haddad · Karim Salem'), 'fix 10: the names are in the header of every skill/ screen', quiAll[0]);
const ansA = 'Hauteur : 60 m [AM Journal](https://example.org/edl?p=2). Voir https://example.com/edl.';
await view(pj2, 'a');
await pj2.click('#copier-q'); await pj2.waitForTimeout(150);
L(await clip() === Qj, 'fix 4: « copier la question » on A copies the question', '');
await pj2.fill('#e-modele', 'Claude Opus'); await pj2.fill('#e-reponse', ansA); await pj2.click('#enreg'); await pj2.waitForTimeout(150);
const rb = await pj2.evaluate(() => { const b = document.querySelector('.reponse-bloc'); return { txt: b.textContent, links: [...b.querySelectorAll('a')].map(a => a.getAttribute('href') + '|' + a.target) }; });
L(rb.txt === ansA && rb.links.join(' ') === 'https://example.org/edl?p=2|_blank https://example.com/edl|_blank', 'fix 5: URLs in the pasted answer open in a new tab, the raw text unchanged', rb.links.join(' '));
L(await pj2.locator('#c-0-4 button[aria-pressed=true]').count() === 0 && await pj2.evaluate(() => document.querySelector('#essai-0 .ja-score').textContent) === '0/5', 'fix 3: box 5 starts ungraded (nothing pressed), score over the boxes set', await pj2.evaluate(() => document.querySelector('#essai-0 .ja-score').textContent));
await pj2.locator('#c-0-4 button[data-v="0"]').click();
L((await dossier(pj2)).essais[0].cases[4] === false && await pj2.evaluate(() => document.querySelector('#essai-0 .ja-score').textContent) === '0/6', 'fix 3: « 0 » on box 5 is a graded 0, the total becomes 6', '');
await pj2.locator('#c-0-4 button[data-v="n"]').click();
L((await dossier(pj2)).essais[0].cases[4] === null, 'fix 3: « non ouverte » still stored as null', '');
L((await dossier(pj2)).essais[0].mode === '', 'fix 6: an A run records no « chargée / collée »', JSON.stringify((await dossier(pj2)).essais[0].mode));
for (const c of ['c', 'd']) { await view(pj2, c); L(await pj2.locator('#copier-q').isVisible(), `fix 4: « copier la question » on ${c.toUpperCase()}`, ''); }
const pdv = await pj2.locator('#pas-de-v').innerText();
L(!/\bB\b/.test(pdv) && /D'abord, une version figée/.test(pdv), 'fix 8: the D notice no longer mentions A, B et C', pdv);
await view(pj2, 'ecrire');
await pj2.fill('#s-corps', '---\nname: edl-dims\ndescription: "' + 'd'.repeat(228) + '"\n---\n\n1. Cite la page.\n');
await pj2.click('#figer'); await pj2.waitForTimeout(200);
await view(pj2, 'd');
L(await pj2.locator('#copier-v').innerText() === 'copier v0', 'fix 4: D offers « copier v0 »', '');
await pj2.click('#copier-v'); await pj2.waitForTimeout(150);
const cv = await clip();
L(/^---\nname: edl-dims\ndescription: "d{228}"\n---\n\n1\. Cite la page\.\n$/.test(cv), 'fix 4: « copier v0 » copies the frozen SKILL.md', cv.slice(0, 40));
await view(pj2, 'trois');
L(await pj2.locator('#signer-aide').innerText() === 'Une touche sur la réponse à signer.', 'fix 7: « les trois » says to tap the answer they would sign', '');
await view(pj2, 'charger');
const dl = await pj2.locator('#desc-long').isVisible() && await pj2.locator('#desc-long').innerText();
L(dl && /228 caractères/.test(dl) && /200 au plus/.test(dl), 'fix 12: « charger » says the description is over 200 before the zip', dl || '');
await pj2.goto(BASE + 'skill/#dossier', { waitUntil: 'networkidle' }); // export lives on skill/#dossier only (25 Sept)
const mdJ = fs.readFileSync((await download(pj2, pj2.locator('#ja-export-md'), 'fixes.md')).f, 'utf8');
L(/\| Claude \| Claude Opus \| \d{4}-\d\d-\d\d \| non \| — \|/.test(mdJ) && mdJ.includes('- [-] 5 · aucune référence inventée · non ouverte') && /Binôme : Nour Haddad, Karim Salem/.test(mdJ), 'fix 6: the .md export shows « — » for the A run\'s Skill', '');
await pj2.goto(BASE, { waitUntil: 'networkidle' });
await pj2.click('#q-seul button[data-v="seul"]');
const solo = await dossier(pj2);
L(solo.binome.seul === true && solo.binome.noms.join() === 'Nour Haddad' && await pj2.locator('#q-nom2').count() === 0, 'fix 1: « seul » keeps one name field and one name', solo.binome.noms.join());
await pj2.click('#lang');
L((await pj2.evaluate(() => [...document.querySelectorAll('nav.vues button')].map(b => b.textContent).join(' | '))) === 'Session 4 · today | The course · calendar, card, grades' && await pj2.locator('#q-seul button[data-v="binome"]').innerText() === 'as a pair', 'fix 1: the home page in English', '');
await pj2.click('#lang');
L(await overflow(pj2) === 0 && errJ2.length === 0, 'fixes @390: no horizontal scroll, no console errors', errJ2.join(' | '));
await ctxJ2.close();
}

// ---------------- K · the design system V3 on home and skill/ (rules, B from « les trois », captures) ----------------
{
const CAP = path.join(HERE, 'captures_v3', 'ds_2026-09-24'); fs.mkdirSync(CAP, { recursive: true });
const rules = p => p.evaluate(() => {
  const all = [...document.querySelectorAll('body *')].filter(e => e.getClientRects().length);
  const bandes = document.querySelectorAll('.ja-bande'), b = bandes[0];
  const h1 = document.querySelectorAll('h1');
  const round = all.filter(e => getComputedStyle(e).borderTopLeftRadius !== '0px').map(e => e.tagName + '.' + e.className);
  const okShadow = e => e.matches('.ja-trois>div.signe, .ja-vues button[aria-pressed=true], .ja-version.courante .n, .ja-case input:checked, .ja-btn:hover');
  const shadow = all.filter(e => getComputedStyle(e).boxShadow !== 'none' && !okShadow(e)).map(e => e.tagName + '.' + e.className);
  const fam = e => getComputedStyle(e).fontFamily;
  const faces = all.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(INPUT|TEXTAREA)$/.test(e.tagName)).filter(e => !/^("Instrument Sans"|"Source Serif 4")/.test(fam(e))).map(e => e.tagName + ':' + fam(e));
  const serif = all.filter(e => /^"Source Serif 4"/.test(fam(e)) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => e.className || e.tagName);
  const machine = [...document.querySelectorAll('.ja-question, .ja-rep, .ja-trois p.m, #e-reponse, #s-corps, #accueil-question')].filter(e => !/^"Instrument Sans"/.test(fam(e))).map(e => e.className || e.id);
  const voice = [...document.querySelectorAll('#b-noms, #b-lieu, #signer-pourquoi, #q-nom1, #q-nom2, .ja-mot .qui')].filter(e => !/^"Source Serif 4"/.test(fam(e)) || getComputedStyle(e).fontStyle !== 'italic').map(e => e.id || e.className);
  return { bandes: bandes.length, tete: !!(b && b.querySelector('.ja-tete')), pas: !!(b && b.querySelector('.ja-pas, .ja-vues')), h1: h1.length, h1InBand: !!(b && h1[0] && b.contains(h1[0])), bleed: b ? Math.round(b.getBoundingClientRect().width) === document.documentElement.clientWidth : false, round, shadow, faces: faces.slice(0, 5), serif: [...new Set(serif)].slice(0, 12), machine, voice };
});
const ok = r => r.bandes === 1 && r.tete && r.pas && r.h1 === 1 && r.h1InBand && r.bleed && !r.round.length && !r.shadow.length && !r.faces.length && !r.machine.length && !r.voice.length;
const B4 = JSON.parse(JSON.stringify(J3)); B4.binome.seul = false; B4.essais.push({ ...J3.essais[1], condition: 'B', skill_source: 'generique-v1', reponse: 'B : réponse générique, sans page.', cases: [true, false, false, false, '', true], note_par: 'Lina & Omar' });
for (const [vname, vp] of [['390', PHONE], ['1280', LAPTOP]]) {
  const ctx = await browser.newContext({ ...vp, serviceWorkers: 'block' }); const p = await ctx.newPage(); const errs = watch(p);
  const J3b = JSON.parse(JSON.stringify(J3)); J3b.binome.seul = false;
  await p.goto(BASE + 'skill/', { waitUntil: 'networkidle' }); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('judging-ai-dossier', s); }, JSON.stringify(J3b));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  const hm = await p.evaluate(() => { const n = document.getElementById('app').firstElementChild; return { nuit: n.classList.contains('ja-nuit'), carre: !!n.querySelector('#paire.ja-carre'), choix: !!n.querySelector('#q-seul.ja-choix'), noms: [...n.querySelectorAll('input')].map(i => getComputedStyle(i).fontFamily.split(',')[0] + ' ' + getComputedStyle(i).fontStyle).join('|'), bg: getComputedStyle(n).backgroundColor, tabs: !!document.querySelector('.ja-bande nav.ja-vues') }; });
  L(hm.nuit && hm.carre && hm.choix && hm.noms === '"Source Serif 4" italic|"Source Serif 4" italic' && hm.bg === 'rgb(17, 18, 19)' && hm.tabs, `V3 home @${vname}: first screen black, « seul / en binôme » a SegmentedChoice above the names in the pair's voice, the square; the two views a Tab in the band`, JSON.stringify(hm));
  const pair0 = await p.evaluate(() => document.documentElement.dataset.paire);
  await p.click('#paire');
  const pair1 = await p.evaluate(() => [document.documentElement.dataset.paire, localStorage.getItem('judging-ai-paire'), document.getElementById('paire').getAttribute('aria-label')]);
  L(pair0 === 'vermillon' && pair1[0] === 'outremer' && pair1[1] === 'outremer' && /outremer/.test(pair1[2]), `V3 home @${vname}: the square changes the pair (kept in the browser)`, JSON.stringify([pair0, pair1]));
  await p.click('#paire'); await p.click('#paire'); await p.click('#paire');
  let r = await rules(p);
  L(ok(r), `V3 rules home @${vname}: one full-bleed band (header, tab, one heading), no rounded corners, no shadows, Archivo and Source Serif 4 only, voice for the names`, JSON.stringify(r).slice(0, 300));
  await p.screenshot({ path: path.join(CAP, `home_${vname}.png`), fullPage: true });
  for (const v of ['question', 'a', 'c', 'd', 'trois', 'ecrire', 'versions', 'charger', 'dossier']) {
    await p.goto(BASE + 'skill/#' + v, { waitUntil: 'networkidle' }); await p.waitForTimeout(150);
    r = await rules(p);
    L(ok(r) && await overflow(p) === 0, `V3 rules skill/#${v} @${vname}: one full-bleed band with header, steps and the one heading; no rounded corners, no shadows but the system's own; answers and the question in Archivo, the pair's words in Source Serif 4 italic`, JSON.stringify(r).slice(0, 300));
    if (['question', 'a', 'd', 'trois', 'dossier'].includes(v)) await p.screenshot({ path: path.join(CAP, `${v}_${vname}.png`), fullPage: true });
  }
  // B only from « les trois », only for a dossier that has a B run
  await p.goto(BASE + 'skill/#trois', { waitUntil: 'networkidle' });
  L(await p.locator('#ouvrir-b').count() === 0 && await p.locator('#quatre-grille > div[data-c="B"]').count() === 0, `V3 B @${vname}: no B column and no way to B without a B run`, '');
  await p.evaluate(s => localStorage.setItem('judging-ai-dossier', s), JSON.stringify(B4)); await p.reload({ waitUntil: 'networkidle' });
  const bcol = await p.evaluate(() => [...document.querySelectorAll('#quatre-grille > div')].map(d => d.dataset.c + ':' + (d.querySelector('.ja-score')?.textContent || '-')).join(' '));
  const bw = await p.evaluate(() => { const g = [...document.querySelectorAll('#quatre-grille > div')].map(d => d.getBoundingClientRect().width); return g[3] < g[0] || innerWidth < 701; });
  await p.click('#ouvrir-b'); await p.waitForTimeout(150);
  const bs = await p.evaluate(() => ({ c: document.getElementById('banc')?.dataset.c, rep: document.querySelector('.reponse-bloc')?.textContent, refaire: !!document.getElementById('refaire'), squares: [...document.querySelectorAll('#etapes .q a')].map(a => a.dataset.v).join(','), name: document.querySelector('#etapes .nom')?.textContent }));
  L(bcol === 'A:2/5 C:5/5 D:6/6 B:2/5' && bw && bs.c === 'B' && /générique/.test(bs.rep) && !bs.refaire && bs.squares === 'question,a,c,d,trois' && bs.name === 'B · SKILL.md générique', `V3 B @${vname}: an old B run joins « les trois » as a fourth, narrower column and opens from there (no new B run, no B square)`, JSON.stringify([bcol, bs]));
  L(errs.length === 0, `V3 @${vname}: no console errors`, errs.join(' | '));
  await ctx.close();
}

// ---------------- L · the home's course view (#cours) on the session view's design (25 Sept) ----------------
const hexRgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')';
const courseView = p => p.evaluate(() => {
  const cs = (e, ps) => getComputedStyle(e, ps || null), root = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const app = document.getElementById('app'), band = document.querySelector('.ja-bande'), sub = band && band.querySelector('.ja-mot i'), sq = [...document.querySelectorAll('.ja-bande .ja-tete .ja-paire')];
  const marks = [...document.querySelectorAll('.ja-cours *')].filter(e => ['::before', '::after'].some(ps => cs(e, ps).content !== 'none' && cs(e, ps).backgroundColor !== 'rgba(0, 0, 0, 0)'));
  return {
    first: app.firstElementChild.className, nuit: document.querySelectorAll('.ja-nuit').length, bandes: document.querySelectorAll('.ja-bande').length,
    tabs: !!(band && band.querySelector('nav.ja-vues')), h1: document.querySelectorAll('h1').length, h1InBand: !!(band && band.querySelector('h1')), h1Txt: band && band.querySelector('h1')?.textContent,
    titles: [...new Set([...document.querySelectorAll('.ja-cours h3')].map(e => cs(e).fontSize + '/' + cs(e).fontWeight))],
    nos: [...new Set([...document.querySelectorAll('.ja-cours .semaine .no, .ja-cours .semestre .no, .ja-cours .travaux .no')].map(e => cs(e).fontSize + '/' + cs(e).fontWeight))],
    lettres: [...new Set([...document.querySelectorAll('.ja-cours .carte .no')].map(e => cs(e).fontSize + '/' + cs(e).fontWeight))],
    details: [...new Set([...document.querySelectorAll('.ja-cours p.texte, .ja-cours .def')].map(e => cs(e).fontSize))],
    titleX: [...new Set([...document.querySelectorAll('.ja-cours h3')].map(e => Math.round(e.getBoundingClientRect().left)))],
    ink: [...new Set([...document.querySelectorAll('.ja-cours .ja-plan > div:not(.passe) p.texte, .ja-cours .carte .def')].map(e => cs(e).color))], body: cs(document.body).color,
    carte: [...document.querySelectorAll('.ja-cours .carte .ja-plan > div > div')].map(e => e.textContent),
    suite: Math.round(document.querySelector('.ja-cours .ja-suite a').getBoundingClientRect().height),
    bandTop: band ? Math.round(band.getBoundingClientRect().top) : null,
    lists: [...document.querySelectorAll('.ja-cours .ja-plan')].map(e => cs(e).borderTopWidth + '/' + cs(e).borderBottomWidth + (cs(e).borderTopColor === cs(document.body).color ? '' : ' not ink')),
    between: [...new Set([...document.querySelectorAll('.ja-cours .ja-plan > div + div')].map(e => cs(e).borderTopWidth))],
    rows: document.querySelectorAll('.ja-cours .ja-plan > div').length,
    marks: marks.map(e => e.textContent + '@' + e.closest('section').className + ':' + ['::before', '::after'].map(ps => cs(e, ps).backgroundColor).find(c => c !== 'rgba(0, 0, 0, 0)')),
    accent: root('--accent'), bande: root('--bande'),
    dots: [...document.querySelectorAll('.ja-cours .no')].filter(e => e.textContent.trim() === '·').length,
    sub: sub ? { txt: sub.textContent, whole: sub.scrollWidth <= sub.clientWidth + 1 && sub.getBoundingClientRect().right <= innerWidth, ellipsis: cs(sub).textOverflow === 'ellipsis' } : null,
    paire: sq.map(b => ({ id: b.id, w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), bg: cs(b).backgroundColor, after: cs(b, '::after').backgroundColor })),
  };
});
const COURS = { fr: { h1: "Juger l'IA : preuves et autorité", sub: 'ESAR · 4 septembre → 9 octobre' }, en: { h1: 'Judging AI: Evidence and Authority', sub: 'ESAR · 4 September → 9 October' } };
for (const [vname, vp] of [['390', PHONE], ['1280', LAPTOP]]) {
  for (const lg of ['fr', 'en']) {
    const ctx = await browser.newContext({ ...vp, serviceWorkers: 'block' }); const p = await ctx.newPage(); const errs = watch(p);
    await p.goto(BASE + '#cours', { waitUntil: 'networkidle' });
    if (lg === 'en') { await p.click('#lang'); await p.waitForTimeout(100); }
    await p.evaluate(() => document.fonts.ready);
    const c = await courseView(p), tag = `course view @${vname} ${lg}`;
    L(c.first.split(' ')[0] === 'ja-nuit' && c.nuit === 1 && Math.abs(c.bandTop) <= 2 && c.bandes === 1 && c.tabs && c.h1 === 1 && c.h1InBand && c.h1Txt === COURS[lg].h1, `${tag}: opens scrolled to the band, the black first screen above it (as at 3a9ee34); one band with the header and the tabs, one h1 in it`, JSON.stringify([c.first, c.nuit, c.bandTop, c.bandes, c.h1, c.h1Txt]));
    L(c.titleX.length === 1 && c.titleX[0] === (vname === '390' ? 104 : 176) && c.ink.length === 1 && c.ink[0] === c.body && c.suite >= 44, `${tag}: one title column in all four lists (x=${vname === '390' ? 104 : 176}), the detail in ink, the card link a 44px target`, JSON.stringify([c.titleX, c.ink, c.body, c.suite]));
    L(c.carte.length === 4 && /^(Observation · un constat : quelqu'un l'a vu, mesuré ou compté, et dit quand\.|Observation · an observation: someone saw, measured or counted it, and says when\.)$/.test(c.carte[0]) && c.carte.every(x => / · /.test(x)), `${tag}: the card keeps its wording, « Observation · directement vu… » on one line`, JSON.stringify(c.carte));
    L(c.rows === 16 && c.titles.join() === '24px/500' && c.nos.join() === '28px/600' && c.lettres.join() === (vname === '390' ? '48px/600' : '64px/600') && c.details.join() === '17px', `${tag}: rows on the session view's .ja-plan: titles 24px/500, numbers 28px/600, O·R·I·X letters ${vname === '390' ? 48 : 64}px, details 17px`, JSON.stringify([c.rows, c.titles, c.nos, c.lettres, c.details]));
    L(c.lists.length === 5 && c.lists.every(x => x === '2px/2px') && c.between.join() === '1px', `${tag}: each of the five lists (simple-s4: + SKILL.md, the dossier, the other pages) opens and closes on a 2px ink rule, 1px between rows`, JSON.stringify([c.lists, c.between]));
    L(c.marks.length === 1 && c.marks[0] === 'S4@semestre:' + hexRgb(c.accent) && c.dots === 1, `${tag}: the accent square marks the current session once, in « le semestre »; the empty weight keeps its « · » (as at 3a9ee34)`, JSON.stringify([c.marks, c.dots]));
    L(c.sub && c.sub.txt === COURS[lg].sub && c.sub.whole && (vname !== '390' || !c.sub.ellipsis), `${tag}: the header subtitle is whole${vname === '390' ? ', no ellipsis (it wraps under the word)' : ''}`, JSON.stringify(c.sub));
    L(c.paire.length === 1 && c.paire[0].id === '' && c.paire[0].w === 22 && c.paire[0].h === 14 && c.paire[0].bg === hexRgb(c.accent) && c.paire[0].after === hexRgb(c.bande), `${tag}: the pair's square in the band header, drawn as in skill/ (22×14, accent and band); #paire stays the first screen's`, JSON.stringify(c.paire));
    const r = await rules(p);
    L(ok(r), `V3 rules ${tag}: one full-bleed band, no rounded corners, no shadows but the system's own, Archivo only`, JSON.stringify(r).slice(0, 300));
    L(await overflow(p) === 0 && errs.length === 0, `${tag}: no horizontal scroll, no console errors`, errs.join(' | '));
    await ctx.close();
  }
}
{ // dark mode, and the behaviour kept: the square, the two tabs, the square of the session view's header
  const ctx = await browser.newContext({ ...PHONE, serviceWorkers: 'block', colorScheme: 'dark' }); const p = await ctx.newPage(); const errs = watch(p);
  await p.goto(BASE + '#cours', { waitUntil: 'networkidle' });
  const dk = await p.evaluate(() => ({ body: getComputedStyle(document.body).backgroundColor, band: getComputedStyle(document.querySelector('.ja-bande')).backgroundColor, ink: getComputedStyle(document.body).color, rule: getComputedStyle(document.querySelector('.ja-cours .ja-plan')).borderTopColor }));
  L(dk.body === 'rgb(24, 25, 27)' && dk.band === 'rgb(42, 45, 48)' && dk.ink === 'rgb(217, 219, 216)' && dk.rule === dk.ink, 'course view @390 dark: the system\'s dark values (#18191B, band #2A2D30, ink rules)', JSON.stringify(dk));
  await p.locator('.ja-tete .ja-paire').click();
  const p1 = await p.evaluate(() => document.documentElement.dataset.paire);
  await p.locator('nav.vues button').first().click(); await p.waitForTimeout(150);
  const sv = await p.evaluate(() => ({ first: document.getElementById('app').firstElementChild.id, carre: !!document.querySelector('#qui #paire.ja-carre'), top: Math.round(document.getElementById('bande').getBoundingClientRect().top), tete: document.querySelectorAll('.ja-tete .ja-paire:not(#paire)').length, hash: location.hash }));
  await p.locator('.ja-tete .ja-paire').click();
  const p2 = await p.evaluate(() => [document.documentElement.dataset.paire, localStorage.getItem('judging-ai-paire'), document.querySelector('.ja-tete .ja-paire').getAttribute('aria-label')]);
  await p.click('#qui #paire');
  const p3 = await p.evaluate(() => [document.documentElement.dataset.paire, document.getElementById('paire').getAttribute('aria-label'), document.querySelector('.ja-tete .ja-paire').getAttribute('aria-label')]);
  await p.locator('nav.vues button').nth(1).click(); await p.waitForTimeout(150);
  const back = await p.evaluate(() => [document.querySelectorAll('.ja-nuit').length, location.hash, document.getElementById('app').firstElementChild.id, Math.round(document.getElementById('bande').getBoundingClientRect().top)]);
  L(p1 === 'outremer' && sv.first === 'qui' && sv.carre && Math.abs(sv.top) <= 2 && sv.tete === 1 && sv.hash === '' && p2[0] === 'violet' && p2[1] === 'violet' && /violet/.test(p2[2]) && p3[0] === 'petrole' && /pétrole/.test(p3[1]) && p3[2] === p3[1] && back[0] === 1 && back[1] === '#cours' && back[2] === 'qui' && Math.abs(back[3]) <= 2, 'home: the header square in the course view changes the pair; the session tab lands on the band; its header square changes the pair too, and takes the name of the first screen\'s square when that one is tapped; the course tab lands on the band again, the first screen above it', JSON.stringify([p1, sv, p2, p3, back]));
  L(errs.length === 0, 'course view @390 dark and tabs: no console errors', errs.join(' | '));
  await ctx.close();
}
{ // skill/ « les trois » with no question: the band's heading is the step's own name, not « — »
  const ctx = await browser.newContext({ ...PHONE, serviceWorkers: 'block' }); const p = await ctx.newPage();
  await p.goto(BASE + 'skill/#trois', { waitUntil: 'networkidle' }); await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle' });
  const fr = await p.evaluate(() => [...document.querySelectorAll('.ja-bande h1')].map(e => e.textContent));
  await p.click('#lang'); await p.waitForTimeout(100);
  const en = await p.evaluate(() => [...document.querySelectorAll('.ja-bande h1')].map(e => e.textContent));
  L(fr.join() === 'Les trois' && en.join() === 'The three', 'skill/#trois with no question: the band heading is « Les trois » / « The three », not « — »', JSON.stringify([fr, en]));
  await ctx.close();
}
}

// ---------------- G · offline reload ----------------
const ctxO = await browser.newContext({ ...PHONE });
const po = await ctxO.newPage();
await po.goto(BASE, { waitUntil: 'networkidle' });
await po.evaluate(async () => { await navigator.serviceWorker.ready; }); await po.waitForTimeout(1500);
await po.reload({ waitUntil: 'networkidle' });
const ctrl = await po.evaluate(() => !!navigator.serviceWorker.controller);
const cache = await po.evaluate(async () => (await caches.keys()).join(','));
L(ctrl && cache === 'judging-ai-' + (await po.evaluate(() => JA.VERSION)), 'offline: service worker controls the page, one cache named after the version', cache);
await ctxO.setOffline(true);
for (const pg of PAGES) {
  try {
    await po.goto(BASE + (pg === 'skill/' ? 'skill/#dossier' : pg), { waitUntil: 'load', timeout: 15000 });
    // older pages show no version since 25 Sept (no dossier footer): their cached commun.js must carry this version
    // text length measured on the document (textContent): atelier/ shows ~110 visible characters (band + session selector), it passed 200 only through the old footer
    const r = await po.evaluate(() => [document.title, document.body.textContent.replace(/\s+/g, ' ').length, (document.getElementById('ja-outils') || document.getElementById('ja-version'))?.innerText || (window.JA && JA.VERSION) || '']);
    L(r[1] > 200 && r[2].includes(VERSION), `offline: /${pg} reloads from the cache`, r[0] + ' · ' + r[1] + ' chars');
  } catch (e) { L(false, `offline: /${pg} reloads from the cache`, e.message.split('\n')[0]); }
}
await ctxO.close();

// ---------------- simple-s4 · today's path only, at 390 and 1280 ----------------
for (const [vname, vp] of [['390', PHONE], ['1280', LAPTOP]]) {
  const ctx = await browser.newContext({ ...vp, serviceWorkers: 'block', acceptDownloads: true });
  const p = await ctx.newPage(); const errs = watch(p); let ov = 0;
  await p.goto(BASE, { waitUntil: 'networkidle' });
  const home = await p.evaluate(() => ({ rows: [...document.querySelectorAll('.ja-plan > div h2')].map(e => e.textContent), links: [...document.querySelectorAll('.ja-ecran a')].map(a => a.getAttribute('href')) }));
  L(home.rows.join('|') === 'La question|Le banc' && home.links.join() === 'skill/#question,skill/', `simple @${vname}: today's view has the question and bench rows only, two links`, JSON.stringify(home));
  ov = Math.max(ov, await overflow(p));
  await p.goto(BASE + '#cours', { waitUntil: 'networkidle' }); await p.reload({ waitUntil: 'networkidle' }); // a hash change alone does not re-render the home
  const cours = await p.evaluate(() => [...document.querySelectorAll('.ja-cours a')].map(a => a.getAttribute('href')));
  L(['skill/#ecrire', 'skill/#dossier', 'journal/', 's1/', 's2/', 's3/', 's4/', 'entrainement/', 'atelier/'].every(x => cours.includes(x)), `simple @${vname}: Le cours carries SKILL.md, the dossier and the other pages`, cours.join(' '));
  ov = Math.max(ov, await overflow(p));
  await p.goto(BASE + 'skill/', { waitUntil: 'networkidle' });
  const nav = await p.evaluate(() => [...document.querySelectorAll('#etapes a')].map(a => a.dataset.v).join(','));
  L(nav === 'question,a,c,d,trois,dossier', `simple @${vname}: the strip is the question, A, C, D, les trois, le dossier (no B, SKILL.md, versions, charger)`, nav);
  L(await p.locator('#plus[href="#ecrire"]').count() === 1, `simple @${vname}: one small « plus » link below the screen`, '');
  await p.fill('#b-noms', 'Lea Aoun, Sami Karam'); await p.fill('#b-lieu', 'Villa Linda Sursock');
  await p.click('#q-lieu');
  L(/Villa Linda Sursock/.test(await p.inputValue('#b-question')), `simple @${vname}: the place's question button fills the question`, '');
  await p.click('#q-salle');
  await p.click('text=Commencer : A, sans SKILL.md →');
  const run = async (c, rep) => { await p.fill('#e-modele', 'Claude Sonnet 4.5'); await p.fill('#e-reponse', rep); if (c === 'C') await p.fill('#e-source', 'modele-salle'); await p.click('#enreg'); await p.waitForTimeout(150); };
  await run('A', 'Réponse A.'); ov = Math.max(ov, await overflow(p));
  await p.click('a.ja-btn[href="#c"]'); await run('C', 'Réponse C.');
  await p.click('a.ja-btn[href="#d"]');
  // D needs a frozen version: through the notice's link, then back
  await p.click('#pas-de-v a'); await p.fill('#s-corps', '---\nname: villa-linda\ndescription: Une phrase courte.\n---\nChaque chiffre avec sa source.'); await p.click('#figer'); await p.waitForTimeout(150);
  await view(p, 'd'); await run('D', 'Réponse D.'); ov = Math.max(ov, await overflow(p));
  await p.click('a.ja-btn[href="#trois"]');
  await p.click('#quatre-grille [data-c="D"]'); await p.fill('#signer-pourquoi', 'La seule avec une source par chiffre.');
  ov = Math.max(ov, await overflow(p));
  await p.click('#vers-dossier'); await p.waitForTimeout(150);
  const onD = await p.locator('#ja-export').isVisible() && await p.locator('#ja-import').count() > 0 && await p.locator('#etapes a[data-v="dossier"][aria-current="true"]').count() === 1;
  const raz = await p.evaluate(() => [...document.querySelectorAll('button')].some(b => /remise à zéro/i.test(b.textContent)));
  L(onD && raz, `simple @${vname}: les trois → le dossier: export, import and remise à zéro on screen, « le dossier » current in the strip`, '');
  ov = Math.max(ov, await overflow(p));
  const ex = await download(p, p.locator('#ja-export'), `simple_${vname}.json`); const J = JSON.parse(fs.readFileSync(ex.f, 'utf8'));
  L(J.format === 'juger-ia-dossier/1' && J.essais.map(e => e.condition).join('') === 'ACD' && J.signer.condition === 'D' && J.skill.versions.length === 1 && J.binome.noms.length === 2, `simple @${vname}: export holds A, C, D, the signed D and v0 (format juger-ia-dossier/1)`, J.essais.map(e => e.condition).join('') + ' ' + J.signer.condition);
  L(errs.length === 0, `simple @${vname}: whole path with no console errors`, errs.join(' | '));
  L(ov === 0, `simple @${vname}: whole path with no horizontal scroll`, String(ov));
  await p.screenshot({ path: path.join(OUT, `simple_dossier_${vname}.png`), fullPage: true });
  await ctx.close();
}


await browser.close(); if (server) server.kill();
const fails = log.filter(x => !x.ok);
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, version: VERSION, when: new Date().toISOString(), pass: log.length - fails.length, fail: fails.length, log }, null, 1));
console.log(`\n${log.length - fails.length} passed, ${fails.length} failed · ${BASE} · version ${VERSION}`);
process.exit(fails.length ? 1 : 0);
