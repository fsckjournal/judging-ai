# ESAR · Un lieu, une Skill, un hook

Un atelier Jupyter en français, dans Colab ou Binder, à deux sans prérequis de programmation. Aucun besoin de clé API, modèle payant, GPU ou installation étudiante. Colab demande un compte Google ; Binder s'ouvre sans compte dans une session publique temporaire. Les réponses viennent du chat déjà disponible, pas du notebook.

**ChatGPT / OpenAI, Claude / Anthropic, Gemini / Google : le parcours commun ne choisit pas le fournisseur à la place du binôme.** OpenCode est l’option open source multi-fournisseur, facultative. Aucun Mac, iPhone ou Apple Shortcuts n’est nécessaire. Le [guide de compatibilité](COMPATIBILITE.md) distingue collage, Skill native, hook natif, comptes/coûts et essais effectivement réalisés.

## Ouvrir le bon fichier

- **À distribuer :** `ESAR_Un_lieu_une_Skill_un_hook.ipynb` — notebook propre, sans réponses de démonstration enregistrées.
- **Pour répéter la séance :** `ESAR_Un_lieu_une_Skill_un_hook_EXECUTE.ipynb` — même parcours avec sorties obtenues localement sur les données fictives.
- **Pour lire sans exécuter :** `APERCU_ATELIER.html` — rendu autonome de la version exécutée. Ce n’est pas une application ni un environnement Python.
- **Exemple de ce qu’emporte un binôme :** `EXEMPLE_toolkit.zip`. Il contient une Skill illustrative, les domaines fictifs et une comparaison de modèle explicitement en attente. Ce n’est pas un travail étudiant terminé.
- **Reçu de vérification :** `VALIDATION.json`.
- **Répétition dans un vrai kernel Jupyter :** `VALIDATION_JUPYTER.json`, avec `ESAR_Un_lieu_une_Skill_un_hook_JUPYTER.ipynb`. Les essais supplémentaires utilisent des textes synthétiques, pas un modèle.
- **Compatibilité et limites :** `COMPATIBILITE.md`, également présent dans le ZIP.

Le dossier `portable/` de chaque ZIP conserve du texte ordinaire : instructions, demandes sans/avec, ainsi que la Skill et, dans le ZIP final, les quatre documents fictifs et les six cas en JSON. Les demandes sont réutilisables dans les trois chats ; aucun manifeste Claude n’est requis pour ce parcours. Les premiers ZIP contiennent déjà les instructions et la Skill ; les demandes arrivent après la cellule 12. La comparaison doit rester dans le même modèle et les mêmes conditions, pas changer de fournisseur entre les deux réponses.

La cellule 03 conserve aussi l'affirmation, le passage de source, le standing et la décision avec sa conséquence. La cellule 04 offre cinq champs d'instructions (vides si inutiles), un format et une limite modifiables. Les réponses sont importées en 13 comme fichiers UTF-8 `sans.txt` et `avec.txt`, jamais comme code Python. Colab affiche le bouton d'import ; Binder lit les deux fichiers déposés dans le dossier du notebook par la flèche d'import JupyterLab. Une comparaison vide reste en attente. « Renseignée » vérifie la présence des champs, pas la qualité du raisonnement.

Dans Binder, les ZIP apparaissent comme liens et dans `exports/esar-atelier-…/` : clic droit → Download. Une réexécution de 13 sans nouvel import conserve les réponses déjà lues. Après modification du jugement, relancer 13 puis 14–15. Ne pas relancer 01 en cours de travail : elle crée un nouvel atelier temporaire. La feuille `../FR/FEUILLE_TRAVAIL_S3.md` permet de conserver le raisonnement même si un import bloque.

Dans [Colab](https://colab.research.google.com/), importer le `.ipynb`, enregistrer une copie et connecter un moteur Python 3 / CPU. Rien n’a été publié ou déposé dans un compte Google par la construction de cet atelier.

## Placement dans la séance · estimation de 45 minutes de manipulation

| Moment | Cellules exécutables | Travail du binôme |
|---|---|---|
| Premier succès · 3 min | 01–02 | Ouvrir le moteur, activer/désactiver une interception et voir si l’action a lieu. |
| Avant la pause · 10 min | 03–05 | Décrire son lieu et un défaut réellement observé, écrire des instructions testables, télécharger une première sauvegarde. |
| Après la pause · 12 min | 06–08 | Choisir une condition, lire les choix du hook, observer son déclenchement avant le lecteur. |
| Banc et comparaison · 15 min | 09–13 | Prédire six cas, corriger une exclusion excessive, comparer hook inactif/actif, puis les réponses sans/avec instructions. |
| Emporter · 5 min | 14–15 | Distinguer la configuration éprouvée de celle exportée, enregistrer ses essais et télécharger le toolkit. |

Les 45 minutes concernent la manipulation du notebook ; les discussions et la démonstration native se placent dans le reste de la séance. Si les comptes ou la connexion des étudiants ralentissent, l’enseignant montre les cellules 06–11 sur un poste et les binômes conservent la conception et le jugement. On ne remplace pas leurs observations par les sorties fictives.

### Six cas, sans score de vérité

1. Adresse prévue → passage.
2. Adresse hors liste → arrêt.
3. Hôte qui imite le bon nom → arrêt.
4. Affirmation erronée sur l’hôte admis → passage : la liste ne lit pas le sens.
5. Témoignage pertinent hors liste → arrêt : le choix des sources peut appauvrir l’enquête.
6. Demande WebFetch sans URL → arrêt selon le choix explicite de ce hook.

La réparation autorise le témoignage sans laisser passer l’hôte ressemblant. Le code ne détermine pas si un témoignage, une institution ou une affirmation dit vrai.

## Ce qui fonctionne réellement ici

Le notebook écrit `garde-lieu.py`, puis un mini-runner Python appelle ce fichier dans un sous-processus **avant** chaque lecture fictive. Le compteur du lecteur prouve qu’une lecture bloquée n’a pas eu lieu dans ce programme. Les fichiers du plugin exporté contiennent ce même hook, pas une seconde version décorative.

Le lecteur est volontairement hors ligne, sans requête HTTP. Les demandes d’actions sont explicites et proposées par le notebook, pas produites par une boucle de modèle. Les réponses de modèle sont collectées séparément dans le chat habituel. Le notebook ne contrôle pas ce chat ni les autres cellules Python.

La Skill est enregistrée comme `SKILL.md`. Dans la comparaison de classe, ses instructions sont collées ; aucune découverte native n’est affirmée. Le ZIP fournit ensuite une notice séparée pour charger le dossier dans **Claude Code** avec `--plugin-dir` et observer une véritable invocation et un véritable hook `PreToolUse` sur `WebFetch`. Cette session locale n’est pas une installation permanente. L’enseignant peut assurer cette démonstration ; elle n’est pas une condition d’accès à l’atelier étudiant.

### Différences assumées avec la trousse existante

La trousse `ESAR/_toolkit/juger-ia` a fourni le principe Skill de lieu + filtre d’adresse. Elle est restée inchangée. Ce notebook adopte un périmètre plus étroit et lisible : WebFetch seulement, hôte exact par défaut, sous-domaines optionnels, arrêt d’un WebFetch incomplet. Il n’affirme pas une compatibilité identique avec quatre agents. Le script initial faisait passer certains cas indécidables ; cette différence doit être discutée, pas masquée.

Le mini-runner s’arrête sur toute erreur du sous-processus. Le runtime natif peut traiter un délai dépassé ou certains codes d’échec autrement. Ni l’un ni l’autre ne constitue ici une protection complète contre tous les chemins d’accès au réseau, les redirections ou d’autres outils.

## Vérifications réalisées

- Structure `nbformat` validée.
- **15/15 cellules Python exécutées dans l’ordre**, avec une exécution Python contrôlée et un espace de variables partagé. Ce n’est pas une exécution dans un kernel Jupyter ni une session Google Colab.
- **6/6 cas pédagogiques** avec effet attendu et vérification du compteur de lecture.
- **14 contrôles supplémentaires** : JSON incorrect, forme incorrecte de l’événement, URL absente ou non textuelle, protocole inadmissible, faux suffixe, identifiant avant `@`, hôte exact, casse, sous-domaine par défaut, outil hors périmètre, URL mal formée, option sous-domaines, configuration illisible.
- Comparaison du même appel sans/avec hook ; réparation de la source utile sans ouverture du faux hôte.
- ZIP valide ; intégrité vérifiée contre les empreintes des fichiers ; hook exporté identique au hook exécuté.
- Exports portables vérifiés contre les variables réellement exécutées : instructions sans en-tête YAML, deux demandes avec la même question, Skill identique, quatre documents synthétiques, six cas et guide de compatibilité exact.
- `claude plugin validate` : code de sortie 0. Ce contrôle de structure n’invoque aucun modèle et ne démontre pas le déclenchement natif.
- Comparaison de réponses de modèles laissée **explicitement en attente**, sans données inventées.
- Import de réponses : contenu ressemblant à du Python et triples guillemets conservés comme texte, BOM UTF-8 accepté, fichier manquant et encodage incorrect rejetés. Dix champs requis testés chacun vide puis avec un placeholder ; aucun ne laisse passer la comparaison comme complète.

La révision est aussi exécutée dans un kernel Jupyter isolé : 15 cellules de classe puis cinq cellules de contrôle, import de deux fichiers UTF-8, liens de téléchargement Jupyter et réexport vérifié. `VALIDATION_JUPYTER.json` porte l'empreinte exacte. L'aperçu reprend la palette et la typographie du mur S2 ; son contrôle navigateur est distinct du contrôle Python.

Le prototype publié plus tôt a ses propres essais Colab/Binder dans le rapport de session du site. **Ces anciens essais ne valident pas automatiquement cette révision.** Une synchronisation des fichiers locaux de publication n'est pas une publication GitHub Pages.

## À répéter avant la classe

1. Après publication ou distribution directe de ce fichier, lancer 01–02 dans Colab ou Binder. Les essais locaux ne vérifient ni le compte Colab ni le réseau de l'école pour cette révision.
2. Remplir un lieu d’essai, lancer jusqu’à 05 et confirmer le téléchargement du premier ZIP dans le navigateur.
3. Lancer 06–15, vérifier le téléchargement final, puis quitter/reprendre la copie du notebook. Les fichiers du moteur peuvent disparaître ; les ZIP téléchargés restent les points de récupération.
4. Sur le poste déjà équipé de Claude Code et Python 3, suivre `LIRE_AVANT_CLAUDE_CODE.md` dans le ZIP. Conserver la trace du vrai WebFetch et du hook. **Ce déclenchement natif n’a pas été testé pendant cette construction.**
5. Préparer une copie locale du notebook et de l’aperçu HTML pour ne pas dépendre uniquement du partage Google.

En cas de perte du moteur Colab, relancer le notebook dont les cellules modifiées ont été enregistrées. Si seule l’archive reste, `notre-projet.json`, `comparaison.json` et `SKILL.md` conservent les textes : les recopier dans une nouvelle copie du notebook. Le ZIP ne rétablit pas automatiquement une session Google.

## Reconstruction locale

Depuis le dossier du projet :

```sh
python3 ESAR/S3_2026-09-18/COLAB/build_notebook.py
python3 ESAR/S3_2026-09-18/COLAB/validate_notebook.py
uv run --no-project --with nbclient --with ipykernel --with nbformat python ESAR/S3_2026-09-18/COLAB/validate_kernel.py
```

Les scripts d’auteur utilisent `nbformat` déjà disponible sur le poste de construction ; le validateur appelle également `claude plugin validate`. **Le notebook étudiant n’a pas besoin de ces dépendances.** Le validateur crée un dossier temporaire d’essai et ne touche aucune configuration personnelle d’agent.

Références techniques consultées le 18 septembre 2026 : [Google Colab — FAQ](https://research.google.com/colaboratory/faq.html), [Claude Code — hooks](https://code.claude.com/docs/en/hooks), [Claude Code — plugins](https://code.claude.com/docs/en/plugins).
