# Une trousse, plusieurs applications

État de cette construction : 18 septembre 2026. Le parcours commun est **Colab ou Binder + le chat déjà disponible** : ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), ou un autre chat capable de recevoir du texte. Aucun Mac, iPhone, Apple Shortcuts, abonnement supplémentaire, clé API ou agent local n'est requis. Colab demande une connexion Google ; Binder n'exige pas de compte mais sa session publique est temporaire. Les limites du chat restent celles du fournisseur.

## Ce que tout le monde emporte

Dans le ZIP, `portable/` contient :

- `instructions.txt` : texte ordinaire, sans configuration d'application.
- `demande-sans.txt` et `demande-avec.txt` : les deux demandes de la comparaison.
- `skill/lieu-v0/SKILL.md` : la même instruction, emballée comme Agent SKILL.md ; sa présence dans le ZIP ne la charge dans aucun client.
- `documents-fictifs.json` et `cas-hook.json` : données et six cas du banc hors ligne, explicitement fictifs. Ce ne sont pas les sources de votre lieu.

`notre-projet.json`, `comparaison.json` et `essais-hook.json` conservent le projet, les réponses réelles à remplir et les traces du programme. `COMPATIBILITE.md` accompagne aussi l'archive.

Pour l'essai commun, ouvrir deux conversations neuves dans **la même application et le même modèle affiché**, avec les mêmes documents et le même accès web. Copier les deux demandes ; conserver les réponses complètes et les conditions. Ne pas comparer « sans » dans ChatGPT à « avec » dans Claude : cela changerait deux choses à la fois. L'ordre peut varier entre binômes. Coller des instructions ne constitue pas une installation native de SKILL.md ; un accord verbal du modèle ne prouve pas qu'un hook s'est exécuté.

## Les quatre voies, sans prétendre qu'elles sont identiques

| Voie | Parcours commun | SKILL.md native : chemin documenté pour un projet d'essai | Hook natif : mécanisme distinct | Accès et coût | Vérification de CET export |
|---|---|---|---|---|---|
| **OpenAI : ChatGPT / Codex** | Coller les demandes dans deux chats accessibles. Aucun hook n'est installé par ce collage. | Codex : copier le dossier `lieu-v0` dans `.agents/skills/`. | Codex documente `PreToolUse` ; les noms d'outils et entrées doivent être adaptés. Les outils hébergés comme WebSearch ne suivent pas cette interception locale. | Codex : connexion ChatGPT ou clé API, selon accès ; les appels API ont leur propre facturation. | Texte portable exporté et vérifié. Aucun adaptateur hook Codex fourni ; aucune découverte de ce SKILL.md ni interception native démontrée. |
| **Anthropic : Claude / Claude Code** | Même comparaison par collage dans Claude. | Claude Code : `.claude/skills/lieu-v0/`, ou le plugin séparé `atelier-lieu` de ce ZIP. | Plugin fourni : `PreToolUse` ciblant `WebFetch`, Python 3. Ne contrôle pas tous les accès réseau. | Accès Claude Code authentifié, selon abonnement/compte API autorisé ; ne pas supposer qu'un compte chat gratuit suffit. | `claude plugin validate` contrôle la structure. Aucun déclenchement natif démontré par ce contrôle ; suivre la notice optionnelle. |
| **Google : Gemini / Antigravity CLI** | Même comparaison par collage dans Gemini. | Antigravity CLI : `.agents/skills/lieu-v0/` dans le projet. | `PreToolUse`, configuration de projet `.agents/hooks.json` ; adapter aussi le format de l’événement et de la réponse, pas seulement le nom du hook. | Authentification et accès Antigravity selon le compte et le mode ; vérifier les conditions actuelles. Aucune clé API requise par le parcours Colab + chat. | Texte portable exporté et vérifié. Aucun adaptateur Antigravity fourni ; découverte et événement natif non testés. |
| **OpenCode : option open source multi-fournisseur** | Instructions réutilisables dans un client déjà configuré ; ce n'est pas un compte de chat fourni avec le ZIP. | `.opencode/skills/lieu-v0/` ou `.agents/skills/lieu-v0/`. | Plugins JavaScript/TypeScript, événements `tool.execute.before` / `tool.execute.after`. Le hook Python Claude n'est pas un plugin OpenCode. | Fournisseur choisi et authentification autorisée, ou modèle local configuré ; logiciel open source ne veut pas dire inférence distante gratuite. | Documentation consultée ; aucun adaptateur OpenCode fourni, aucun SKILL.md chargé ni interception native testée. |

Ces chemins sont des indications pour un **nouveau dossier d'essai**, pas une invitation à écraser une configuration personnelle. Ne pas copier le manifeste Claude dans les autres clients. La compatibilité documentaire n'est pas une validation de la version installée, du compte, de la découverte de SKILL.md ou de son effet sur la réponse.

**Correction du 18 septembre :** le client Google visé ici est Antigravity CLI, successeur de Gemini CLI pour les comptes individuels. Google a fixé cette transition au 18 juin 2026 ; certaines voies professionnelles/API de Gemini CLI subsistent. Les anciennes indications `BeforeTool` / `.gemini/settings.json` ne sont donc pas le parcours recommandé pour cette classe. Le fichier d’instructions reste portable, mais une migration de hooks exige un adaptateur testé. [Annonce Google](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/) · [Migration et chemins des Skills](https://www.antigravity.google/docs/cli/gcli-migration/) · [Hooks Antigravity](https://antigravity.google/docs/hooks).

Le chemin `${CLAUDE_PLUGIN_ROOT}` appartient uniquement au plugin Claude facultatif. Le remplacer par un chemin relatif ne rendrait pas ce plugin universel : événements, entrées, sorties et répertoire d’exécution restent à adapter et à tester. Le dossier `portable/` est le parcours commun sans ce manifeste.

### Pourquoi OpenCode ici ?

OpenCode propose un même client avec plusieurs fournisseurs et des modèles locaux : il permet de séparer le choix du client du choix du modèle. Le projet se présente comme open source et affiche une large communauté sur son site ; ce constat ne prouve pas sa fiabilité pédagogique. Il reste une extension facultative, **pas une quatrième installation demandée à la classe**. [Projet](https://opencode.ai/) · [Fournisseurs](https://opencode.ai/docs/providers/).

## Avant de dire « le hook fonctionne dans ce client »

Garder la version du client, le fichier chargé, la configuration, l'événement et l'entrée reçus, le code/résultat du hook, puis la trace de l'action effectivement empêchée ou exécutée. Tester au moins passage, arrêt, hôte ressemblant, entrée absente et panne du hook. Refaire ces essais après adaptation : noms d'outils, formats, erreurs et délais ne sont pas universels. Les six cas du notebook vérifient son mini-runner, pas les clients ci-dessus.

Le banc ne contacte aucun site. Autoriser un nom d'hôte ne vérifie ni le contenu d'une page ni les redirections possibles d'un vrai outil web. Les documents utiles hors liste doivent pouvoir être examinés : le filtre n'est pas un classement des sources dignes de confiance.

## Sources techniques ouvertes pour cette révision

- OpenAI : [Skills et chemins de découverte](https://learn.chatgpt.com/docs/build-skills), [hooks et couverture des outils](https://learn.chatgpt.com/docs/hooks), [authentification](https://learn.chatgpt.com/docs/auth).
- Anthropic : [Skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), [authentification](https://code.claude.com/docs/en/authentication).
- Google : [Migration et Skills Antigravity](https://www.antigravity.google/docs/cli/gcli-migration/), [hooks Antigravity](https://antigravity.google/docs/hooks), [installation et authentification](https://antigravity.google/docs/cli/install).
- OpenCode : [Skills](https://opencode.ai/docs/skills/), [plugins](https://opencode.ai/docs/plugins/), [fournisseurs](https://opencode.ai/docs/providers/).

Contrôles locaux limités de cette révision : `codex --version` a affiché `0.154.0`, `gemini --version` a affiché `0.46.0`. Un exécutable OpenCode est présent, mais `opencode --version` a terminé avec le code 137, sans version ; il n'est donc pas présenté comme opérationnel. Aucun compte, réglage, plugin ou client n'a été installé ou modifié par ces contrôles. Aucun appel à un modèle n'a été effectué.
