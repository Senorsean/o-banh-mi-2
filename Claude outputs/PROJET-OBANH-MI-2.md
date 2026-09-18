# Ô Bánh Mì — Documentation du site (OBANH MI 2)

Dernière mise à jour : 17 septembre 2026

## Stack

- HTML / CSS / JS vanilla (pas de framework, pas de build)
- GSAP 3.12.5 + ScrollTrigger (CDN cdnjs) — animations et scroll-scrub
- Polices : Bebas Neue (titres) + Inter (texte), Google Fonts
- Hébergement : Netlify
- Dépôt GitHub : [Senorsean/o-banh-mi-2](https://github.com/Senorsean/o-banh-mi-2)
- URL live : https://golden-pegasus-3b2340.netlify.app

Ce projet est un **repartir à neuf** du site précédent (dossier `BANH-MI`), avec une refonte graphique complète — jamais toucher à l'ancien dossier `BANH-MI`, seul `OBANH MI 2` est actif.

---

## Structure des fichiers

```
OBANH MI 2/
├── index.html                # Page principale, une seule page (sections ancrées)
├── css/style.css             # Tous les styles
├── js/main.js                # GSAP, ScrollTrigger, curseur, marquee, canvas scroll-scrub
├── banh-frames-v2/           # 26 frames JPG (172→197) pour l'animation bánh-mì
├── banh-closed.png           # Bánh-mì assemblé, fond détouré (état "fermé")
├── banh-static.png           # Bánh-mì éclaté, fond détouré (état "ouvert")
├── hero-video.mp4 / hero-video-poster.jpg   # Vidéo de fond du hero
├── logo-*.png / logo-*.webp  # Logos (clair/sombre, carré/horizontal)
├── *.png (menu)               # Photos des plats (bánh mì, bao, bo bun, bowls, boissons, desserts)
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
2. **Nav** — logo horizontal, liens centrés, CTA "Commander", burger mobile
3. **Hero** — plein écran, vidéo de fond (`hero-video.mp4`) en `<video autoplay muted loop playsinline>`, titre 4 lignes, parallax GSAP
4. **Ticker** — bandeau défilant
5. **À propos** — bento grid + compteurs animés
6. **Bánh mì éclaté** (`#banh-explode`) — section signature : canvas plein viewport, pin ScrollTrigger, scroll-scrub sur 26 frames vidéo (sandwich qui s'ouvre en descendant, se referme en remontant), légendes ingrédients synchronisées
7. **Menu** — tabs (Bánh mì / Bowls & Bao / Entrées / Desserts), cards photo + prix + badge (Signature/Populaire)
8. **Formules** — 3 cartes prix
9. **Galerie** — photos devanture/produits
10. **Instagram** — embed + CTA
11. **Avis** — marquee double rangée (RAF, sans CSS animation) + reviews Facebook
12. **Localisation** — iframe Google Maps + horaires
13. **Footer**

---

## La section "Bánh mì éclaté" — détail technique

C'est la pièce la plus travaillée du site, reconstruite plusieurs fois avant la version actuelle :

**Historique des approches essayées** (dans l'ordre) :
1. GSAP multi-layer (assets séparés par ingrédient) — version d'origine
2. Canvas + 72 frames générées
3. Vidéo scroll-scrub (`video.currentTime` lié au scroll) — bug persistant "bande fine" jamais résolu (cause réelle : collision d'id CSS avec une règle `clip-path` morte, découverte tardivement)
4. Image statique + légendes (fond détouré via IA — `rembg`)
5. Crossfade scroll entre image fermée/ouverte — problème de "ghosting" (2 photos non alignées superposées)
6. **Version actuelle** : canvas plein viewport, pin `ScrollTrigger`, **contain-fit** (jamais de crop), séquence de 26 frames extraites de la vidéo source (`ffmpeg`, frames 172 à 197 — la seule portion du clip montrant un vrai mouvement d'ouverture/fermeture cohérent), jouée à l'envers pour que scroll bas = ouverture, scroll haut = fermeture.

**Réglages responsive** (mobile vs desktop) :
- Distance de pin (`end`) et `scrub` différents par largeur d'écran pour éviter un scroll trop long ou trop lent au toucher
- Hauteur du canvas ajustée en `vh`/`svh` mobile
- `pin-spacer` coloré à `var(--surface)` pour éviter tout "trou blanc" résiduel

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

### Bánh mì éclaté (scroll-scrub canvas)
```js
ScrollTrigger.create({
  trigger: '#bxc-pin',
  start: 'top top',
  end: () => '+=' + Math.round(pin.getBoundingClientRect().height * (mobile ? 0.7 : 2.2)),
  pin: true,
  scrub: mobile ? .15 : .4,
  onUpdate: self => {
    const n = Math.round(FRAME_END - self.progress * (FRAME_TOTAL - 1));
    drawFrame(n); // contain-fit, jamais de crop
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

## Bugs résolus (session OBANH MI 2)

- **Trou noir dans le PNG coriandre** — pixel/alpha corrompus dans l'asset source ; réparé par analyse de composantes connexes + inpainting sur les frames déjà générées.
- **Fond gris studio derrière le bánh-mì éclaté** — détourage IA (`rembg`) + nettoyage manuel de l'alpha (halo résiduel).
- **Vidéo scroll-scrub qui n'affichait qu'une bande fine** — cause réelle : règle CSS morte `#banh-video{clip-path:inset(44% 0%)}` héritée d'une ancienne implémentation, qui collisionnait avec le nouvel id réutilisé. Jamais reproduite après renommage des ids.
- **Crossfade "ghosting"** — deux photos non alignées superposées en transparence pendant la transition ; remplacé par un switch net (pas de fondu progressif) puis par la séquence canvas.
- **Haut du sandwich coupé au scroll (mobile)** — le rendu était en `cover-fit` (recadre pour remplir la boîte) ; passé en `contain-fit` (jamais de crop, quel que soit le ratio de la boîte).
- **Grand espace blanc sous la section au scroll (mobile)** — la distance de pin ScrollTrigger était calculée sur `window.innerHeight` au lieu de la vraie hauteur du bloc pin ; corrigé + `pin-spacer` coloré en fond de secours.
- **Scroll "au ralenti" sur mobile** — distance de pin trop longue pour 26 frames ; réduite, `scrub` moins lissé (suit le doigt plus directement).

---

## Déploiement (workflow)

Aucun outil ne peut pousser à la place de l'utilisateur (pas d'accès réseau git/ssh depuis l'environnement Claude) — toujours exécuté en Terminal Mac par Samuel :

```bash
cd "/Users/samuellucas/Documents/Claude/Projects/OBANH MI 2"
git add -A
git commit -m "message"
git push
TMPDIR=~/tmp netlify deploy --prod --dir .
```

(`TMPDIR=~/tmp` contourne un bug de permissions macOS sur le dossier temporaire système par défaut du CLI Netlify.)

---

## Infos restaurant

- **Nom** : Ô Bánh Mì
- **Adresse** : Montgeron (91230)
- **Spécialités** : Bánh mì artisanaux, Bowls, Bao burger, Bo bun, Bubble tea, viandes 100% Halal
