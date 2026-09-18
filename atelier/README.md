# ESAR · Un lieu, une Skill, un hook

Un atelier Jupyter en français, conçu pour travailler à deux sans prérequis de programmation. Le parcours central n’utilise ni clé API, ni modèle payant, ni GPU, ni installation sur le poste étudiant. Deux environnements ouvrent le même notebook : Google Colab avec un compte Google, ou Binder sans compte. Les essais de réponses se font dans l’application de chat déjà disponible.

## Ouvrir le bon fichier

- **À distribuer :** `ESAR_Un_lieu_une_Skill_un_hook.ipynb` — notebook propre, sans réponses de démonstration enregistrées.
- **Pour répéter la séance :** `ESAR_Un_lieu_une_Skill_un_hook_EXECUTE.ipynb` — même parcours avec sorties obtenues localement sur les données fictives.
- **Pour lire sans exécuter :** `APERCU_ATELIER.html` — rendu autonome de la version exécutée. Ce n’est pas une application ni un environnement Python.
- **Exemple de ce qu’emporte un binôme :** `EXEMPLE_toolkit.zip`. Il contient une Skill illustrative, les domaines fictifs et une comparaison de modèle explicitement en attente. Ce n’est pas un travail étudiant terminé.
- **Reçu de vérification :** `VALIDATION.json`.

Depuis la page du cours, le bouton Colab ouvre directement le notebook publié : vérifier le compte affiché, choisir **Copier sur Drive**, puis connecter un moteur Python 3 / CPU. Le bouton Binder ouvre le même notebook dans un environnement Jupyter open source sans demander de compte. Cette session publique est temporaire : ne rien y déposer de sensible et télécharger les deux ZIP avant de fermer. Le premier démarrage peut prendre quelques minutes. Hors Colab, chaque cellule de sauvegarde place aussi une copie du ZIP dans les fichiers Jupyter et affiche un lien de téléchargement. Rien n’a été publié ou déposé dans un compte Google par la construction de cet atelier.

## Placement dans la séance · 45 minutes de manipulation

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
- **15/15 cellules Python exécutées dans l’ordre** lors de la validation locale contrôlée, avec un espace de variables partagé.
- Le 18 septembre, le notebook publié a aussi été ouvert depuis son URL Colab et exécuté intégralement sur un moteur Python 3 Google Compute Engine : comptes d’exécution 1 à 15, six cas conformes et archive finale vérifiée avec neuf fichiers identifiés.
- Le même jour, le bouton Binder a ouvert le notebook publié sans connexion dans JupyterLab avec un noyau Python 3. **Exécuter toutes les cellules** a atteint l’archive finale vérifiée ; les deux sauvegardes ont été rendues comme liens et comme fichiers Jupyter. Un premier lancement a échoué dans l’infrastructure publique (`fsnotify watcher: too many open files`) avant qu’un lancement ultérieur réussisse : Binder enlève le compte obligatoire, pas la dépendance à un service disponible.
- **6/6 cas pédagogiques** avec effet attendu et vérification du compteur de lecture.
- **14 contrôles supplémentaires** : JSON incorrect, forme incorrecte de l’événement, URL absente ou non textuelle, protocole inadmissible, faux suffixe, identifiant avant `@`, hôte exact, casse, sous-domaine par défaut, outil hors périmètre, URL mal formée, option sous-domaines, configuration illisible.
- Comparaison du même appel sans/avec hook ; réparation de la source utile sans ouverture du faux hôte.
- ZIP valide ; intégrité vérifiée contre les empreintes des fichiers ; hook exporté identique au hook exécuté.
- `claude plugin validate` : code de sortie 0. Ce contrôle de structure n’invoque aucun modèle et ne démontre pas le déclenchement natif.
- Comparaison de réponses de modèles laissée **explicitement en attente**, sans données inventées.

L’aperçu HTML et son intégration publique ont été inspectés dans un navigateur aux formats ordinateur et mobile. L’ouverture du notebook publié dans Colab et l’exécution complète ont également été confirmées. Les deux appels `google.colab.files.download` ont été atteints ; le navigateur intégré n’a toutefois exposé ni événement de téléchargement récupérable ni fichier local, donc la conservation effective des deux ZIP reste à confirmer dans un navigateur étudiant ordinaire.

## À répéter avant la classe

1. Depuis la page du cours, vérifier le compte Google affiché puis choisir **Copier sur Drive**. L’ouverture et l’exécution ont été testées ; la persistance de cette copie ne l’a pas été.
2. Remplir un lieu d’essai, lancer jusqu’à 05 et confirmer que le premier ZIP apparaît réellement dans les téléchargements d’un navigateur étudiant ordinaire.
3. Lancer 06–15, confirmer de la même manière le ZIP final, puis quitter et reprendre la copie du notebook. Les fichiers du moteur peuvent disparaître ; les ZIP téléchargés restent les points de récupération.
4. Sur le poste déjà équipé de Claude Code et Python 3, suivre `LIRE_AVANT_CLAUDE_CODE.md` dans le ZIP. Conserver la trace du vrai WebFetch et du hook. **Ce déclenchement natif n’a pas été testé pendant cette construction.**
5. Préparer une copie locale du notebook et de l’aperçu HTML pour ne pas dépendre uniquement du partage Google.
6. Ouvrir Binder une fois avant la classe pour amorcer son image ; conserver Colab et l’aperçu comme replis si le service public tarde ou refuse un lancement.

En cas de perte du moteur Colab, relancer le notebook dont les cellules modifiées ont été enregistrées. Si seule l’archive reste, `notre-projet.json`, `comparaison.json` et `SKILL.md` conservent les textes : les recopier dans une nouvelle copie du notebook. Le ZIP ne rétablit pas automatiquement une session Google.

## Reconstruction locale

Depuis le dossier du projet :

```sh
python3 ESAR/S3_2026-09-18/COLAB/build_notebook.py
python3 ESAR/S3_2026-09-18/COLAB/validate_notebook.py
```

Les scripts d’auteur utilisent `nbformat` déjà disponible sur le poste de construction ; le validateur appelle également `claude plugin validate`. **Le notebook étudiant n’a pas besoin de ces dépendances.** Le validateur crée un dossier temporaire d’essai et ne touche aucune configuration personnelle d’agent.

Références techniques consultées le 18 septembre 2026 : [Google Colab — FAQ](https://research.google.com/colaboratory/faq.html), [Project Jupyter — Binder](https://jupyter.org/binder), [Binder — usage guidelines](https://mybinder.readthedocs.io/en/latest/about/user-guidelines.html), [Claude Code — hooks](https://code.claude.com/docs/en/hooks), [Claude Code — plugins](https://code.claude.com/docs/en/plugins).
