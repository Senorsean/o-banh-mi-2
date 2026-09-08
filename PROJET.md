# Ô Bánh Mì — Documentation Projet

## Stack
- HTML / CSS / JS vanilla
- GSAP 3 + ScrollTrigger (animations)
- Netlify (hébergement)
- GitHub : [Senorsean/BANH-MI](https://github.com/Senorsean/BANH-MI)
- URL live : https://o-banh-mi-site.netlify.app

---

## Structure des fichiers

```
BANH-MI/
├── index.html              # Page principale
├── css/style.css           # Styles globaux
├── js/main.js              # Scripts (curseur, GSAP, marquee RAF)
├── logo-horizontal.png     # Logo rectangle (nav)
├── logo-carre.png          # Logo carré (loader + favicon)
├── hero.jpeg               # Image hero
├── banh-mi.png             # Photo menu
├── banh-mi-bowl.png
├── bao-burger.png
├── bo-bun.png
├── bowl-crousty.png
├── bubble-tea.png
├── bubble-tea-lait.png
├── tapioca-mangue.png
├── tiramisu.png
├── proprietaires.webp      # Photo propriétaires
├── vitrine.webp            # Photo devanture
└── photo-reel-instagram.jpeg
```

---

## Architecture CSS — variables

```css
--red:    #E8142A
--gold:   #C9932A
--cream:  #F9F2E3
--dark:   #0A0604
--surface:#110A05
--text:   #EDE3D0
--muted:  #7A6858
```

---

## Sections de la page

1. **Loader** — logo carré zoom-in + tagline "Asian food & Bubble tea", slide-up exit
2. **Nav** — logo horizontal gauche, liens centrés (absolute), bouton Commander droite
3. **Hero** — plein écran, titre 4 lignes, image parallax, scroll cue
4. **Ticker** — bandeau défilant produits/infos
5. **À propos (Histoire)** — bento grid, stats animés (counters)
6. **Menu** — tabs (Bánh mì / Bowls / Bao / Boissons / Desserts), cards avec images
7. **Formules** — 3 cartes prix (Découverte / Complète / Premium)
8. **Avis Google** — marquee double rangée RAF, cards reviews
9. **Instagram** — embed + CTA
10. **Localisation** — iframe Google Maps + horaires
11. **Footer**

---

## Animations GSAP

### Loader
```js
loaderTL
  .to(llogo,    { opacity:1, scale:1, duration:.8 })
  .to(ltagline, { opacity:1, y:0, duration:.6 })
  .to(llogo,    { scale:1.06 → scale:1 })         // pulse
  .to(llogo,    { scale:2.4, opacity:0 })          // burst exit
  .to(loader,   { yPercent:-100 })                 // slide up
```

### Hero entrance (startSite)
```js
tl
  .to('#h-eye span',            { y:'0%' })
  .to('.hero-title .line span', { y:'0%', stagger:.12 })
  .to('#h-sub p',               { y:'0%' })
  .to('#h-act',                 { opacity:1 })
  .to('#h-scroll',              { opacity:1 })
```

### Marquee reviews (RAF loop — sans CSS animation)
```js
function makeMarquee(track, pxPerFrame, startX) {
  let x = startX;
  let running = true;
  function tick() {
    x += pxPerFrame;
    const h = track.scrollWidth / 2;
    if (pxPerFrame < 0 && x <= -h) x += h;  // loop sans saut
    if (pxPerFrame > 0 && x >= 0)  x -= h;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
// Rangée 1 → gauche (-0.6px/frame), Rangée 2 → droite (+0.5px/frame)
```

---

## Bugs résolus

### Hero title tronqué (overflow 100vh)
- **Cause** : `height:100vh` + `align-items:flex-end` + 4 lignes à 14rem = débordement vers le haut
- **Fix** : `min-height:100vh; height:auto; padding-top:140px` + font `clamp(4rem,12vw,11rem)`

### "DANS VOTRE" doublé / stroke trop épais
- **Cause** : grain SVG fixe à `z-index:9998` — `feTurbulence` filter polluait les compositor layers, créant des artefacts sur le texte transparent stroked
- **Fix** : grain désactivé (`display:none`), stroke ramené à `2px`

### Rebords clignotants (marquee cards)
- **Cause** : `border-radius` + fond semi-transparent + RAF transform → repaint GPU edges
- **Fix** :
  ```css
  .review-card {
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    will-change: transform;
  }
  ```
- `isolation: isolate` sur `#avis` pour isoler le stacking context

### Images cassées sur Netlify
- **Cause** : fichiers renommés (sans espaces/accents) non trackés dans git (`??` untracked)
- **Fix** : `git add hero.jpeg logo-*.png *.webp ...` + commit + push

### Git index.lock bloqué
- **Cause** : process `com.apple` (Spotlight) lock le fichier git index
- **Fix** : `lsof .git/index.lock` → `kill PID` → `rm .git/index.lock`

### Deploy Netlify CLI — EACCES mkdtemp
- **Cause** : CLI écrit dans `/var/folders/zz/...` — dossier sandbox macOS inaccessible
- **Fix** : `TMPDIR=$HOME/tmp npx netlify-cli deploy --prod --dir .`

---

## Déploiement (workflow)

```bash
# 1. Modifier fichiers
# 2. Commit + push
git add . && git commit -m "message" && git push

# 3. Deploy Netlify
cd ~/Documents/Claude/Projects/BANH-MI
TMPDIR=$HOME/tmp npx netlify-cli deploy --prod --dir .
```

---

## Infos restaurant

- **Nom** : Ô Bánh Mì
- **Adresse** : Montgeron (91230)
- **Note Google** : 4,9 ★
- **UberEats** : https://www.ubereats.com/fr/store/o-banh-mi/YKgD78Y4Ts-eA2ILAwVZOg
- **Spécialités** : Bánh mì artisanaux, Bowls, Bao burger, Bo bun, Bubble tea, Viandes Halal
