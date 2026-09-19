# Ô Bánh Mì — Documentation du site (OBANH MI 2)

Dernière mise à jour : 19 septembre 2026

## Stack

- HTML / CSS / JS vanilla (pas de framework, pas de build)
- GSAP 3.12.5 + ScrollTrigger (CDN cdnjs) — animations et scroll-scrub
- Polices : Bebas Neue (titres) + Inter (texte), Google Fonts
- Hébergement double :
  - **Netlify** (déploiement manuel CLI) — https://golden-pegasus-3b2340.netlify.app
  - **Vercel** (déploiement auto sur chaque `git push`) — https://o-banh-mi-2.vercel.app
- Dépôt GitHub : [Senorsean/o-banh-mi-2](https://github.com/Senorsean/o-banh-mi-2) — **public** (nécessaire pour que Vercel accepte les déploiements sur le plan Hobby gratuit)

Ce projet est un **repartir à neuf** du site précédent (dossier `BANH-MI`), avec une refonte graphique complète — jamais toucher à l'ancien dossier `BANH-MI`, seul `OBANH MI 2` est actif.

---

## Structure des fichiers

```
OBANH MI 2/
├── index.html                # Page principale, une seule page (sections ancrées)
├── css/style.css             # Tous les styles
├── js/main.js                # GSAP, ScrollTrigger, curseur, marquee, canvas scroll-scrub
├── banh-frames-v3/           # 135 frames JPG (frame_0068 → frame_0202) pour l'animation bánh-mì
├── hero-video.mp4 / hero-video-poster.jpg   # Vidéo de fond du hero (bowl bánh mì)
├── BANHMI_video.mp4          # Vidéo source des frames banh-frames-v3
├── logo-*.png / logo-*.webp  # Logos (clair/sombre, carré/horizontal)
├── *.png (menu)               # Photos des plats (bánh mì, bowls, bao, bo bun, bowls, boissons, desserts)
├── banh-mi-bowl.png, bowl-crousty.png, tapioca-mangue.png, tiramisu.png  # Photos menu (bowls/bubble tea)
├── proprietaires.webp, vitrine.webp, photo-reel-instagram.jpeg
└── PROJET.md                  # Cet historique
```

---

## Charte graphique

Direction : **épurée, noir et blanc**, inspirée du site [Junk Burgers](https://www.junkburgers.com/) — angles nets (pas de `border-radius` sauf cercles), pas d'ombres, badges en contour (pas de fond plein), typographie Bebas Neue en display.

```css
--red:    #141110   /* devenu quasi-noir, gardé pour compat CSS */
--gold:   #4A453D
--cream:  #F9F2E3
--dark:   #F8F3E7
--surface:#FFFFFF
--text:   #17140F
--muted:  #5C544A
--line:   rgba(20,17,12,.12)
```

---

## Sections de la page

1. **Loader** — logo carré zoom-in + tagline, sortie en slide-up
2. **Nav** — logo horizontal, liens centrés, CTA "Commander", burger mobile (nav en `position:fixed`, z-index 900)
3. **Hero** — plein écran, vidéo de fond (`hero-video.mp4`) en `<video autoplay muted loop playsinline>`, titre 4 lignes, parallax GSAP
4. **Ticker** — bandeau défilant
5. **À propos** — bento grid (`.bento`, grille 12 colonnes) + compteurs animés
6. **Bánh mì éclaté** (`#banh-explode`) — section signature : canvas plein viewport, pin ScrollTrigger, scroll-scrub sur 135 frames (sandwich qui s'ouvre en descendant), légendes ingrédients synchronisées — voir détail ci-dessous
7. **Menu** — tabs (Bánh mì / Bowls & Bao / Entrées / Desserts), cards photo + prix + badge (Signature/Populaire)
8. **Formules** — 3 cartes prix
9. **Galerie** — photos devanture/produits
10. **Instagram** — embed + CTA
11. **Avis** — marquee double rangée (RAF, sans CSS animation) + reviews Facebook
12. **Localisation** — iframe Google Maps + horaires
13. **Footer**

---

## La section "Bánh mì éclaté" — détail technique

C'est la pièce la plus travaillée du site, reconstruite plusieurs fois avant la version actuelle.

**Historique des approches essayées** (dans l'ordre, sessions cumulées) :
1. GSAP multi-layer (assets séparés par ingrédient) — version d'origine
2. Canvas + 72 frames générées
3. Vidéo scroll-scrub (`video.currentTime` lié au scroll) — bug "bande fine" (collision CSS `clip-path` mort)
4. Image statique + légendes (détourage IA `rembg`)
5. Crossfade scroll entre image fermée/ouverte — ghosting
6. Canvas + 26 frames (`banh-frames-v2`, range 172-197)
7. GIF ping-pong looping (`banh-composition.gif`, ffmpeg palettegen/paletteuse) — testé puis **abandonné**, retour au canvas sur demande explicite
8. **Version actuelle** : canvas plein viewport, pin `ScrollTrigger`, **contain-fit** (jamais de crop), séquence de **135 frames** extraites de `BANHMI_video.mp4` (`banh-frames-v3/`, frames 68 à 202), lecture dans le sens normal (scroll bas = ouverture)

**Légendes (captions)** — 5 items synchronisés au scroll (`data-band="0"` à `"4"`) :
`Baguette artisanale · Coriandre fraîche · Concombre · Carottes marinées · Bœuf citronnelle, Poulet ou Tofu · 100% Halal`
(le doublon "Baguette artisanale" en fin de liste a été supprimé ; le 1er item a été renommé de "Baguette croustillante" → "Baguette artisanale")

La légende "Bœuf citronnelle, Poulet ou Tofu · 100% Halal" est coupée en **3 lignes** sur mobile ET tablette via des `<br class="bxc-break">` (masqués en desktop via `.bxc-break{display:none}`, réactivés `display:block` dans les media queries mobile et tablette).

**Le bug du nav fixe** : la nav est en `position:fixed;top:0;z-index:900`. Le `ScrollTrigger.create` du pin utilisait `start:'top top'`, ce qui plaçait le haut du canvas exactement sous la nav — celle-ci recouvrait alors le haut du sandwich en permanence (peu importe les réglages `dy`/`boxH` du canvas). **Fix** : `start` calculé dynamiquement avec un offset égal à la hauteur réelle de la nav (`navEl.getBoundingClientRect().height`), au lieu d'un `'top top'` fixe.

**Trois tailles responsive distinctes dans `drawFrame()` (js/main.js)** — `isMobile = w<=768`, `isTablet = !isMobile && w<=1024`, sinon desktop :

| | Desktop (>1024px) | Tablette iPad (769-1024px) | Smartphone (≤768px) |
|---|---|---|---|
| boxW | 0.56×largeur | 0.72×largeur | 0.78×largeur |
| boxH | 0.8×hauteur | 0.98×hauteur | 0.72×hauteur |
| position | ancré droite, centré vertical | ancré droite (`dx=cw-dw`), centré vertical | ancré droite (marge quasi nulle), `dy=4%` (proche du haut) |
| légendes | à gauche, centrées verticalement | centrées verticalement, `font-size:1.1rem` | collées en bas de la box (`bottom:20px`) |
| `.bxc-pin` height | `100vh` | `55vh/55svh` (le défaut 100vh crée un vide énorme entre "Voir le menu" et le sandwich) | `40vh/40svh` (768px), `34vh/34svh` (480px) |

---

## Animations GSAP (extraits clés)

### Loader
```js
loaderTL
  .to(llogo,    { opacity:1, scale:1, duration:.8 })
  .to(ltagline, { opacity:1, y:0, duration:.6 })
  .to(llogo,    { scale:1.06 })
  .to(llogo,    { scale:2.4, opacity:0 })
  .to(loader,   { yPercent:-100 });
```

### Bánh mì éclaté (scroll-scrub canvas, extrait simplifié)
```js
const navOffset = () => {
  const navEl = document.querySelector('nav');
  return navEl ? Math.round(navEl.getBoundingClientRect().height) : 0;
};

ScrollTrigger.create({
  trigger: '#bxc-pin',
  start: () => 'top ' + navOffset() + 'px',   // évite que la nav fixe recouvre le haut du canvas
  end: () => '+=' + Math.round(pin.getBoundingClientRect().height * (window.innerWidth <= 768 ? 0.7 : 2.2)),
  pin: true,
  scrub: window.innerWidth <= 768 ? .15 : .4,
  onUpdate: self => {
    const n = Math.round(FRAME_START + self.progress * (FRAME_TOTAL - 1));
    drawFrame(n); // contain-fit, tailles/positions différentes selon desktop/tablette/mobile
    setBand(self.progress);
  }
});
```

### Marquee avis (RAF, boucle sans saut)
```js
function makeMarquee(track, pxPerFrame, startX) {
  let x = startX;
  function tick() {
    x += pxPerFrame;
    const h = track.scrollWidth / 2;
    if (pxPerFrame < 0 && x <= -h) x += h;
    if (pxPerFrame > 0 && x >= 0)  x -= h;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

---

## Responsive : les trois versions

Le site est pensé pour **trois paliers** distincts (breakpoints CSS `@media`) :

- **PC / desktop** : au-delà de 1024px
- **Tablette (iPad)** : de 769px à 1024px (`@media(max-width:1024px)`)
- **Smartphone (iPhone & Android)** : jusqu'à 768px, avec un palier supplémentaire pour petits écrans à 480px et 560px

Chaque section a ses propres réglages par palier (grille bento, canvas bánh-mì éclaté, navigation, footer, localisation…). Voir le détail dans "La section Bánh mì éclaté" ci-dessus pour le cas le plus complexe.

---

## Bugs résolus (cumulé, toutes sessions)

- **Trou noir dans le PNG coriandre** — pixel/alpha corrompus ; réparé par analyse de composantes connexes + inpainting.
- **Fond gris studio derrière le bánh-mì éclaté** — détourage IA (`rembg`) + nettoyage manuel de l'alpha.
- **Vidéo scroll-scrub "bande fine"** — règle CSS morte `#banh-video{clip-path:inset(44% 0%)}` héritée d'une ancienne implémentation, collision d'id. Résolu en renommant les ids.
- **Crossfade "ghosting"** — remplacé par switch net puis par la séquence canvas.
- **Haut du sandwich coupé au scroll (mobile)** — rendu en `cover-fit` au lieu de `contain-fit` ; corrigé.
- **Grand espace blanc sous la section au scroll (mobile)** — distance de pin ScrollTrigger mal calculée + `pin-spacer` coloré en fond de secours.
- **Scroll "au ralenti" sur mobile** — distance de pin trop longue ; réduite, `scrub` plus direct.
- **Nav fixe recouvrant le haut du canvas bánh-mì éclaté** — `ScrollTrigger start:'top top'` plaçait le pin sous la nav fixe (`z-index:900`) ; corrigé avec un offset dynamique = hauteur de la nav.
- **Grand vide entre "Voir le menu" et le sandwich (mobile puis iPad)** — `.bxc-pin` en `100vh`/hauteur trop grande alors que l'image occupe une petite portion de la box ; hauteur du pin réduite par palier + box image agrandie.
- **Sandwich décalé/mal positionné en responsive** — logique `drawFrame()` scindée en 3 branches (mobile/tablette/desktop) avec box et ancrage propres à chaque palier, au lieu d'une seule logique desktop appliquée partout.
- **Bento grid cassé sur iPad (photo qui traverse les cartes "163"/"100")** — le breakpoint `@media(max-width:1024px)` changeait `grid-column` des cellules bento sans reset `grid-row`, laissant la grande photo (`b1`, `grid-row:1/3` hérité du desktop) déborder sur les rangées suivantes. Corrigé en ajoutant `grid-row:auto` à toutes les cellules dans ce breakpoint.
- **4 photos menu manquantes en ligne (Bánh Mì Bowl, Bowl Crousty, Tapioca Mangue, Tiramisu Nutella)** — fichiers présents en local mais jamais `git add`/committés (`git status` les montrait en `??` untracked) donc jamais déployés → 404 sur Netlify/Vercel. Corrigé par commit + push.
- *"Citronelle" orthographié avec 1 seul N** — corrigé en "citronnelle" (2 N) dans la légende bánh-mì éclaté et vérifié sur les 3 autres occurrences du site (déjà correctes).
- **Netlify "Powered by Netlify" persistant malgré badge désactivé** — root-cause probable : cache navigateur, le déploiement suivant ne contenait plus la chaîne dans le HTML (vérifié par fetch). Non totalement confirmé résolu par l'utilisateur (site basculé sur Vercel entre-temps).
- **Vercel `create_git_project` → 403 Forbidden** — GitHub non autorisé côté Vercel pour ce repo ; corrigé en important le repo manuellement via le dashboard Vercel (Add New → Project → Import Git Repository).
- **Vercel deployments bloqués (`BLOCKED`)** — plan Hobby gratuit bloque les déploiements dont l'auteur git n'est pas reconnu comme membre de l'équipe, sur un repo **privé**. Root-cause confirmée via `get_deployment` (`errorLink` pointant vers la doc "account-configuration") puis via le message d'erreur Vercel collé par l'utilisateur, révélant un email placeholder (`ton-email-github@example.com`) copié-collé tel quel dans `git config user.email` depuis une commande d'exemple. Corrigé en (1) réparant l'identité git locale, (2) passant le repo GitHub en **public** (solution retenue, gratuite, pas de secret dans une vitrine statique).
- **`git push` impossible depuis l'environnement Claude (device_bash)** — pas d'accès réseau/DNS général depuis ce shell éphémère (`ssh-keyscan`/`git push` échouent en "Temporary failure in name resolution" / "Host key verification failed"). Toute commande `git push` doit être donnée à l'utilisateur pour exécution dans son propre Terminal Mac.

---

## Déploiement (workflow)

Aucun outil ne peut pousser à la place de l'utilisateur (pas d'accès réseau git/ssh depuis l'environnement Claude) — toujours exécuté en Terminal Mac par Samuel :

```bash
cd "/Users/samuellucas/Documents/Claude/Projects/OBANH MI 2"
git add -A
git commit -m "message"
git push
```

- **Vercel** se redéploie automatiquement à chaque `git push` (repo public, plus de blocage deployment protection).
- **Netlify** nécessite en plus, si on veut aussi mettre à jour ce site :
```bash
TMPDIR=~/tmp netlify deploy --prod --dir .
```
(`TMPDIR=~/tmp` contourne un bug de permissions macOS sur le dossier temporaire système par défaut du CLI Netlify.)

---

## Infos restaurant

- **Nom** : Ô Bánh Mì
- **Adresse** : Montgeron (91230)
- **Spécialités** : Bánh mì artisanaux, Bowls, Bao burger, Bo bun, Bubble tea, viandes 100% Halal
