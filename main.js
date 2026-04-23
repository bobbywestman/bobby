const MOODS_PORTRAIT = [
    { id: 'austen-p', label: 'AURA',
      thumb: 'images/austen-thumb-portrait.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/website-portrait-web.mp4' },
    { id: 'veil', label: 'her', labelFont: 'Pinyon Script', labelTransform: 'none', labelLetterSpacing: '-0.005em',
      thumb: 'images/veil-thumb-portrait.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/Sequence%2001%20Copy%2002_1_nyx3.mp4',
      labelY: 85 },
    { id: 'blush', label: 'BLUSH',
      thumb: 'images/blush-thumb-portrait.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/Sequence%2002_10_nyx3.mp4',
      labelVertical: true },
];

const MOODS_LANDSCAPE = [
    { id: 'austen-l', label: 'AURA',
      thumb: 'images/austen-thumb-landscape.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/website-landscape-denoise-web.mp4' },
    { id: 'sam', label: 'PR/SM',
      thumb: 'images/sam-thumb-landscape.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/Sequence%2001_14.mp4' },
    { id: 'halo', label: 'HALO', labelY: 75,
      thumb: 'images/halo-thumb-landscape.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/Sequence%2001%20Copy%2001_nyx3.mp4' },
    { id: 'tide', label: 'DRIFT,', labelX: 0.15,
      thumb: 'images/tide-thumb-landscape.jpg',
      src:   'https://pub-79f4a1dfa37041918a443a6acd1dc0fd.r2.dev/Sequence%2002_4_nyx3.mp4' },
];

function currentMoods() { return portrait() ? MOODS_PORTRAIT : MOODS_LANDSCAPE; }

function setLabelText(el, mood) {
    if (mood.labelHTML) { el.innerHTML = mood.labelHTML; }
    else { el.textContent = mood.label; }
}

// ── Stack layout ──────────────────────────────────────────────────────────────
// Back cards are slightly LARGER — they exist in a deeper layer, not shrunk behind.
// Consistent transform string structure so CSS interpolates correctly.
// pos[2].scale is computed dynamically — it fills the full viewport.
// Mid card (pos[1]) is the reference size — fills the available slot.
// Front card (pos[0]) is intentionally smaller, framed by the mid card behind it.
const POSITIONS = [
    { scale: 1.00, y: 0, opacity: 1.00, brightness: 1.00, blur: 0  },  // front — hero (mid-sized)
    { scale: null, y: 0, opacity: 1.00, brightness: 1.00, blur: 28 },  // back  — fullscreen bg (visible)
    { scale: null, y: 0, opacity: 1.00, brightness: 1.00, blur: 28 },  // back2 — fullscreen bg (hidden under back)
];

const NUM_CARDS    = 3;
const DISMISS_DIST = 0.26;  // fraction of card width — dismiss threshold
const REVEAL_DIST  = 0.55;  // fraction of card width — full reveal of bg/mid cards
const DISMISS_VEL  = 0.45;  // px/ms

// ── State ─────────────────────────────────────────────────────────────────────
let cards            = [];
let moodNextPortrait  = 0;
let moodNextLandscape = 0;
let heroReady = false;
let cardSize = { w: 0, h: 0 };
let midSize  = { w: 0, h: 0 };
let lastOrientation = null;  // 'portrait' | 'landscape'

// Threshold at midpoint between 1:1 and 9:16 portrait (ratio ≈ 0.78)
function portrait() { return window.innerWidth / window.innerHeight < (1 + 9 / 16) / 2; }
function moodSrc(mood)   { return mood.src; }
function moodThumb(mood) { return mood.thumb; }

function getMoodNext()  { return portrait() ? moodNextPortrait  : moodNextLandscape; }
function incrMoodNext() { const moods = currentMoods(); if (portrait()) moodNextPortrait = (moodNextPortrait + 1) % moods.length; else moodNextLandscape = (moodNextLandscape + 1) % moods.length; }
function setMoodNext(v) { if (portrait()) moodNextPortrait = v; else moodNextLandscape = v; }

function applyLabelPosition(card) {
    const y        = (card.mood.labelY ?? 50) + '%';
    const vertical = card.mood.labelVertical || false;
    const strike   = card.mood.labelStrike   || false;
    const x    = card.mood.labelLeft ? card.mood.labelLeft
               : card.mood.labelX   ? `calc(50% + ${card.mood.labelX}em)` : '';
    const font = card.mood.labelFont ? `'${card.mood.labelFont}', system-ui, sans-serif` : '';
    [card.label, card.labelShadow].forEach(el => {
        el.style.top           = y;
        el.style.left          = x;
        el.style.fontFamily    = font;
        el.style.textTransform = card.mood.labelTransform || '';
        el.style.writingMode     = vertical ? 'vertical-rl' : '';
        el.style.textOrientation = vertical ? 'upright'     : '';
        el.style.letterSpacing   = vertical ? '-0.2em' : (card.mood.labelLetterSpacing || '');
    });
    card.labelStrike.style.display       = strike ? 'block' : 'none';
    card.labelShadowStrike.style.display = strike ? 'block' : 'none';
}

const TRANSPARENT_PX = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

function showThumb(card, crossfade = false) {
    card.thumb.src = moodThumb(card.mood);
    card.thumb.style.transition = crossfade ? 'opacity 0.4s ease' : 'none';
    card.thumb.style.opacity    = '1';
    card.thumb.onerror = () => { card.thumb.src = TRANSPARENT_PX; };
    const hide = () => {
        card.thumb.style.transition = 'opacity 0.5s ease';
        card.thumb.style.opacity    = '0';
    };
    if (card.video.readyState >= 2) { requestAnimationFrame(hide); return; }
    card.video.addEventListener('canplay', hide, { once: true });
}

// ── Card sizing ───────────────────────────────────────────────────────────────
const CARD_PAD = 16; // px gap between card edge and UI elements

function getUIBounds() {
    const vh       = window.innerHeight;
    const uiTopEl  = document.querySelector('.ui-top');
    const socialEl = document.querySelector('.social');
    const topPx    = (uiTopEl  ? uiTopEl.getBoundingClientRect().bottom  : 0) + CARD_PAD;
    const bottomPx = (socialEl ? vh - socialEl.getBoundingClientRect().top : 0) + CARD_PAD;
    return { topPx, bottomPx };
}

function computeCardSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { topPx, bottomPx } = getUIBounds();
    const availH  = vh - topPx - bottomPx;
    const centerY = topPx + availH / 2;
    document.documentElement.style.setProperty('--card-center-y', centerY + 'px');
    const p = portrait();
    const w = Math.min(vw * 0.86, availH * (p ? 9 / 16 : 16 / 9));
    const h = w * (p ? 16 / 9 : 9 / 16);
    return { w, h, availH };
}

function computeMidSize() {
    const vw = window.innerWidth;
    const pad = 20;
    return { w: (cardSize.w + vw) / 2 - pad * 2, h: cardSize.availH - pad * 2 };
}

function posSize(idx) {
    return idx === 0 ? midSize : cardSize;
}


// Scale needed to make a card visually fill the full viewport from its center position
function bgScale() {
    const vh = window.innerHeight;
    const { topPx, bottomPx } = getUIBounds();
    const availH  = vh - topPx - bottomPx;
    const centerY = topPx + availH / 2;
    const maxDY = Math.max(centerY, vh - centerY);
    const sx = window.innerWidth / cardSize.w;
    const sy = (maxDY * 2)       / cardSize.h;
    return Math.max(sx, sy) * 1.30;
}

function posScale(idx) {
    return idx >= 1 ? bgScale() : POSITIONS[idx].scale;
}

// ── Transforms ───────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

const FEATHER_PX     = 60;
const FEATHER_RADIUS = 16; // corner radius inside the SDF mask

function roundedRectAlphaMask(ctx, width, height, radius, feather) {
    const img  = ctx.createImageData(width, height);
    const data = img.data;
    const cx = width  / 2;
    const cy = height / 2;
    const bx = width  / 2;
    const by = height / 2;

    function smoothstep(a, b, x) {
        const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const px = x - cx;
            const py = y - cy;
            const qx = Math.abs(px) - (bx - radius);
            const qy = Math.abs(py) - (by - radius);
            const dx = Math.max(qx, 0);
            const dy = Math.max(qy, 0);
            const outsideDist = Math.hypot(dx, dy);
            const insideDist  = Math.min(Math.max(qx, qy), 0);
            const sd    = outsideDist + insideDist - radius;
            const alpha = 1 - smoothstep(-feather, 0, sd);
            const i = (y * width + x) * 4;
            data[i] = data[i + 1] = data[i + 2] = 255;
            data[i + 3] = Math.round(alpha * 255);
        }
    }
    ctx.putImageData(img, 0, 0);
}

// Bake a canvas SDF mask and apply it to inner. Only called at rest (applyPos),
// not per-frame during reveal — canvas pixel iteration is too expensive for 60fps.
function setFeather(inner, px, w, h) {
    if (px <= 0) {
        inner.style.maskImage = inner.style.webkitMaskImage = '';
        inner.style.maskSize  = inner.style.webkitMaskSize  = '';
        inner.style.maskRepeat = inner.style.webkitMaskRepeat = '';
        return;
    }
    const canvas  = document.createElement('canvas');
    canvas.width  = Math.round(w);
    canvas.height = Math.round(h);
    roundedRectAlphaMask(canvas.getContext('2d'), canvas.width, canvas.height, FEATHER_RADIUS + px, px);
    const url = canvas.toDataURL();
    inner.style.webkitMaskImage  = `url(${url})`;
    inner.style.maskImage        = `url(${url})`;
    inner.style.webkitMaskSize   = '100% 100%';
    inner.style.maskSize         = '100% 100%';
    inner.style.webkitMaskRepeat = 'no-repeat';
    inner.style.maskRepeat       = 'no-repeat';
}

function filterStr(brightness, blur) {
    const parts = [];
    if (blur > 0)         parts.push(`blur(${blur}px)`);
    if (brightness !== 1) parts.push(`brightness(${brightness})`);
    return parts.join(' ');
}

function cardTransform(scale, y = 0, dx = 0, rot = 0) {
    return `translate(-50%, -50%) translate(${dx}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
}

// Apply a stack position to a card (with optional CSS transition).
// Visual-pixel sizing (width = layout * scale, transform scale = 1) so that
// CSS transitions animate only width/height — keeping scale=1 throughout means
// there is no quadratic visual-size change and object-fit:cover works correctly.
function applyPos(card, idx, animated = true, duration = '0.45s') {
    const pos   = POSITIONS[idx];
    const scale = posScale(idx);
    const size  = posSize(idx);
    const ease  = `${duration} cubic-bezier(0.25,0.46,0.45,0.94)`;
    card.el.style.transition    = animated
        ? `transform ${ease}, width ${ease}, height ${ease}, opacity ${duration} ease`
        : 'none';
    card.el.style.width         = (size.w * scale) + 'px';
    card.el.style.height        = (size.h * scale) + 'px';
    card.el.style.transform     = cardTransform(1, pos.y);
    card.el.style.opacity       = pos.opacity;
    card.el.style.zIndex        = NUM_CARDS - idx;
    card.el.style.pointerEvents = idx === 0 ? 'auto' : 'none';
    card.inner.style.transition = 'none';
    card.inner.style.filter     = pos.brightness !== 1 ? `brightness(${pos.brightness})` : '';
    card.video.style.transition = animated ? `filter 0.45s ease` : 'none';
    card.video.style.filter     = pos.blur > 0 ? `blur(${pos.blur}px)` : '';
    card._heroMaskW = card._heroMaskH = 0;  // invalidate reveal cache
    setFeather(card.inner, idx === 0 ? FEATHER_PX : 0, size.w * scale, size.h * scale);
}

// Interpolate a card between its current stack position and the next-forward one.
// Uses visual-pixel dimensions (layout * scale) with transform scale = 1 so that
// object-fit:cover on the video re-covers the element naturally at every frame —
// no non-uniform pixel stretching, just correct aspect-fill throughout the resize.
function applyReveal(card, fromIdx, t) {
    const from  = POSITIONS[fromIdx];
    const to    = POSITIONS[fromIdx - 1];
    const fromW = posSize(fromIdx).w     * posScale(fromIdx);
    const fromH = posSize(fromIdx).h     * posScale(fromIdx);
    const toW   = posSize(fromIdx - 1).w * posScale(fromIdx - 1);
    const toH   = posSize(fromIdx - 1).h * posScale(fromIdx - 1);
    card.el.style.transition = 'none';
    card.el.style.width      = lerp(fromW, toW, t) + 'px';
    card.el.style.height     = lerp(fromH, toH, t) + 'px';
    card.el.style.transform  = cardTransform(1, lerp(from.y, to.y, t));
    card.el.style.opacity    = lerp(from.opacity,    to.opacity,    t);
    card.inner.style.transition = 'none';
    card.inner.style.filter     = '';
    card.video.style.transition = 'none';
    card.video.style.filter     = `blur(${lerp(from.blur, to.blur, t)}px)`;
    // Apply the exact same hero mask once (cached) — matches applyPos on dismiss
    if (fromIdx === 1) {
        const tw = Math.round(toW), th = Math.round(toH);
        if (card._heroMaskW !== tw || card._heroMaskH !== th) {
            setFeather(card.inner, FEATHER_PX, toW, toH);
            card._heroMaskW = tw;
            card._heroMaskH = th;
        }
    }
}

// ── Label ─────────────────────────────────────────────────────────────────────
function showLabel(card) {
    // Set starting state: slightly blurred and scaled down
    card.label.style.transition       = 'none';
    card.label.style.filter           = 'blur(5px)';
    card.label.style.transform        = 'translate(-50%, -50%) scale(0.89)';
    card.labelShadow.style.transition  = 'none';
    card.labelShadow.style.filter      = 'blur(5px)';
    card.labelShadow.style.transform   = 'translate(-50%, -50%) scale(0.89)';
    card.labelShadow.style.textShadow  = '0 4px 28px rgba(0,0,0,0)';

    // Force reflow so the initial state is committed before the transition starts
    card.label.getBoundingClientRect();

    // Spring delayed so it fires while the text is actually becoming visible
    const fade   = '1.4s cubic-bezier(0.6, 0, 0.8, 1)';
    const spring = '0.8s 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.label.style.transition        = `opacity ${fade}, filter ${fade}, transform ${spring}`;
    card.label.style.filter            = '';
    card.label.style.opacity           = '1';
    card.label.style.transform         = 'translate(-50%, -50%) scale(1)';
    card.labelShadow.style.transition  = `opacity ${fade}, filter ${fade}, transform ${spring}, text-shadow ${fade}`;
    card.labelShadow.style.filter      = '';
    card.labelShadow.style.opacity     = '1';
    card.labelShadow.style.transform   = 'translate(-50%, -50%) scale(1)';
    card.labelShadow.style.textShadow  = '';
}

function hideLabel(card) {
    clearTimeout(card._labelTimer);
    card.label.style.transition       = 'opacity 0.25s ease';
    card.label.style.opacity          = '0';
    card.labelShadow.style.transition = 'opacity 0.25s ease';
    card.labelShadow.style.opacity    = '0';
}

// ── Build ─────────────────────────────────────────────────────────────────────
function buildStack() {
    const container = document.getElementById('stack');
    cardSize = computeCardSize();
    midSize  = computeMidSize();

    const moods = currentMoods();
    const startIdx = getMoodNext();
    setMoodNext((startIdx + NUM_CARDS) % moods.length);
    for (let i = 0; i < NUM_CARDS; i++) {
        const mood = moods[(startIdx + i) % moods.length];

        const el = document.createElement('div');
        el.className   = 'card';
        el.style.width  = cardSize.w + 'px';
        el.style.height = cardSize.h + 'px';

        const video       = document.createElement('video');
        video.muted       = true;
        video.playsInline = true;
        video.autoplay    = true;
        video.loop        = true;
        video.preload     = 'auto';
        video.src         = moodSrc(mood);
        video.play().catch(() => {});

        const thumb = document.createElement('img');
        thumb.className     = 'card-thumb';
        thumb.src           = moodThumb(mood);
        thumb.style.opacity = '1';

        const inner = document.createElement('div');
        inner.className = 'card-inner';
        inner.appendChild(video);
        inner.appendChild(thumb);

        const labelShadow = document.createElement('div');
        labelShadow.className = 'card-label-shadow';
        setLabelText(labelShadow, mood);
        const labelShadowStrike = document.createElement('div');
        labelShadowStrike.className = 'card-label-strike';
        labelShadow.appendChild(labelShadowStrike);
        inner.appendChild(labelShadow);

        const label = document.createElement('div');
        label.className = 'card-label';
        setLabelText(label, mood);
        const labelStrike = document.createElement('div');
        labelStrike.className = 'card-label-strike';
        label.appendChild(labelStrike);
        inner.appendChild(label);

        el.appendChild(inner);

        container.appendChild(el);

        const card = { el, video, inner, label, labelShadow, labelStrike, labelShadowStrike, thumb, mood };
        cards.push(card);
        applyPos(card, i, false);
        applyLabelPosition(card);
        if (i === 0) {
            // Hero: onerror swaps to transparent pixel so black bg still shows
            thumb.onerror = () => { thumb.src = TRANSPARENT_PX; };
        } else {
            showThumb(card);
        }
    }

    // ── Entrance: hero starts at bg position, then animates forward ──────────
    const hero = cards[0];
    const bgs  = bgScale();
    hero.el.style.transition = 'none';
    hero.el.style.width      = (cardSize.w * bgs) + 'px';
    hero.el.style.height     = (cardSize.h * bgs) + 'px';
    hero.el.style.transform  = cardTransform(1, POSITIONS[1].y);
    hero.el.style.opacity    = String(POSITIONS[1].opacity);
    hero.el.style.zIndex     = String(NUM_CARDS);
    hero.inner.style.filter  = '';
    hero.video.style.filter  = `blur(${POSITIONS[1].blur}px)`;
    setFeather(hero.inner, 0, cardSize.w * bgs, cardSize.h * bgs);
    hero.el.getBoundingClientRect(); // force reflow before transition

    const CROSSFADE_MS = 500;
    const startEntrance = () => {
        heroReady = true;
        const ease = '1.1s cubic-bezier(0.3, 0, 0.5, 1)';
        // Crossfade and entrance run simultaneously
        hero.thumb.style.transition = `opacity ${CROSSFADE_MS}ms ease`;
        hero.thumb.style.opacity    = '0';
        hero.el.style.transition    = `transform ${ease}, width ${ease}, height ${ease}, opacity ${ease}`;
        hero.el.style.width         = midSize.w + 'px';
        hero.el.style.height        = midSize.h + 'px';
        hero.el.style.transform     = cardTransform(1, POSITIONS[0].y);
        hero.el.style.opacity       = String(POSITIONS[0].opacity);
        hero.inner.style.transition = 'none';
        hero.inner.style.filter     = '';
        hero.video.style.transition = `filter 1.1s cubic-bezier(0.55, 0, 1, 1)`;
        hero.video.style.filter     = '';
        hero._heroMaskW = hero._heroMaskH = 0;
        setFeather(hero.inner, FEATHER_PX, midSize.w, midSize.h);
        setTimeout(() => showLabel(cards[0]), 715);
    };

    if (hero.video.readyState >= 2) {
        requestAnimationFrame(startEntrance);
    } else {
        hero.video.addEventListener('canplay', startEntrance, { once: true });
    }
}

// ── Dismiss + recycle ─────────────────────────────────────────────────────────
function dismissTop(dragX, dragY) {
    const card  = cards[0];
    const angle = Math.atan2(dragY, dragX || 0.001);
    const fly   = Math.max(window.innerWidth, window.innerHeight) * 1.6;
    const mag   = Math.hypot(dragX, dragY) || 1;
    const rot       = (dragX / (cardSize.w * 0.5)) * 28 * (-dragY / mag);
    const spinBonus = (rot !== 0 ? Math.sign(rot) : Math.sign(dragX)) * 22;

    hideLabel(card);

    card.el.style.zIndex        = '15'; // stay above UI while flying away
    card.el.style.transition    = 'transform 0.55s cubic-bezier(0.4, 0, 1, 1), opacity 0.5s ease-in 0.05s';
    card.el.style.transform     = `translate(-50%, -50%) translate(${Math.cos(angle) * fly}px, ${Math.sin(angle) * fly}px) rotate(${rot + spinBonus}deg) scale(0.95)`;
    card.el.style.opacity       = '0';
    card.el.style.pointerEvents = 'none';

    // Remaining cards move forward
    const nextHero = cards[1];
    const nextBg   = cards[2];
    cards.slice(1).forEach((c, i) => applyPos(c, i, true));

    showLabel(nextHero);

    setTimeout(() => {
        // Recycle: front → back
        cards.push(cards.shift());

        const moods = currentMoods();
        card.mood = moods[getMoodNext()];
        incrMoodNext();
        setLabelText(card.label, card.mood);
        card.label.appendChild(card.labelStrike);
        setLabelText(card.labelShadow, card.mood);
        card.labelShadow.appendChild(card.labelShadowStrike);
        applyLabelPosition(card);
        card.video.style.transition = 'none';
        card.video.style.transform  = '';
        card.video.src = moodSrc(card.mood);
        card.video.load();
        card.video.play().catch(() => {});
        showThumb(card);

        // Place at back (fullscreen bg) silently, then fade in
        const back = POSITIONS[NUM_CARDS - 1];
        const bgs  = bgScale();
        card.el.style.transition    = 'none';
        card.el.style.width         = (cardSize.w * bgs) + 'px';
        card.el.style.height        = (cardSize.h * bgs) + 'px';
        card.el.style.opacity       = '0';
        card.el.style.transform     = cardTransform(1, back.y);
        card.inner.style.filter  = back.brightness !== 1 ? `brightness(${back.brightness})` : '';
        card.video.style.filter  = back.blur > 0 ? `blur(${back.blur}px)` : '';
        card.el.style.zIndex        = '1';
        card.el.style.pointerEvents = 'none';
        card.el.getBoundingClientRect(); // force reflow

        card.el.style.transition = 'opacity 0.35s ease';
        card.el.style.opacity    = String(back.opacity);
    }, 700);
}

function snapBack() {
    cards.forEach((card, i) => applyPos(card, i, true));
    // Override hero transitions to ease-out (decelerate into center)
    const easeOut = '0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    cards[0].el.style.transition    = `transform ${easeOut}, width ${easeOut}, height ${easeOut}, opacity 0.5s ease`;
    cards[0].inner.style.transition = `filter ${easeOut}`;
    cards[0].video.style.transition = `transform ${easeOut}`;
    cards[0].video.style.transform  = '';
    cards[0].label.style.transition       = `opacity ${easeOut}, filter ${easeOut}`;
    cards[0].label.style.opacity          = '1';
    cards[0].label.style.filter           = '';
    cards[0].labelShadow.style.transition = `opacity ${easeOut}, filter ${easeOut}`;
    cards[0].labelShadow.style.opacity    = '1';
    cards[0].labelShadow.style.filter     = '';
}

// ── UI visibility ─────────────────────────────────────────────────────────────
const roleEls        = document.querySelectorAll('.role');
const socialLeftLabel  = document.querySelector('.social-left .social-label');
const socialRightLabel = document.querySelector('.social-right .social-label');
let uiVisible = false;

function showUI() {
    uiVisible = true;
    roleEls[0].style.clipPath       = 'inset(0 0 0 0%)';
    roleEls[0].style.opacity        = '1';
    roleEls[1].style.clipPath       = 'inset(0 0% 0 0)';
    roleEls[1].style.opacity        = '1';
    socialLeftLabel.style.clipPath  = 'inset(0 0 0 0%)';
    socialLeftLabel.style.opacity   = '1';
    socialRightLabel.style.clipPath = 'inset(0 0% 0 0)';
    socialRightLabel.style.opacity  = '1';
}

function hideUI() {
    uiVisible = false;
    roleEls[0].style.clipPath       = 'inset(0 0 0 100%)';
    roleEls[0].style.opacity        = '0';
    roleEls[1].style.clipPath       = 'inset(0 100% 0 0)';
    roleEls[1].style.opacity        = '0';
    socialLeftLabel.style.clipPath  = 'inset(0 0 0 100%)';
    socialLeftLabel.style.opacity   = '0';
    socialRightLabel.style.clipPath = 'inset(0 100% 0 0)';
    socialRightLabel.style.opacity  = '0';
}

// ── Gestures ──────────────────────────────────────────────────────────────────
function initGestures() {
    const stack = document.getElementById('stack');
    let dragging   = false;
    let dragStartX = 0, dragStartY = 0;
    let dragX = 0, dragY = 0;
    let dragSamples = [];
    let wasDrag = false;

    function onMove(e) {
        if (!dragging) return;
        dragX = e.clientX - dragStartX;
        dragY = e.clientY - dragStartY;
        if (Math.hypot(dragX, dragY) > 8) wasDrag = true;
        dragSamples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (dragSamples.length > 8) dragSamples.shift();

        const mag           = Math.hypot(dragX, dragY) || 1;
        const rot           = (dragX / cardSize.w) * 16 * (-dragY / mag);
        // Normalise each axis by the viewport dimension so thresholds scale with aspect ratio.
        // Blend 20% toward the geometric mean so the ellipse isn't at full intensity.
        const vw = window.innerWidth, vh = window.innerHeight;
        const geom = Math.sqrt(vw * vh);
        const refX = geom + (vw - geom) * 0.8;
        const refY = geom + (vh - geom) * 0.8;
        const progress       = Math.min(Math.hypot(dragX / (refX * DISMISS_DIST), dragY / (refY * DISMISS_DIST)), 1);
        const revealProgress = Math.min(Math.hypot(dragX / (refX * REVEAL_DIST),  dragY / (refY * REVEAL_DIST)),  1);

        cards[0].el.style.transition    = 'none';
        cards[0].el.style.transform     =
            `translate(-50%, -50%) translate(${dragX}px, ${dragY}px) rotate(${rot}deg) scale(${1 - progress * 0.2})`;
        cards[0].video.style.transition = 'none';
        cards[0].video.style.transform  = `scale(${1 + progress * 0.95})`;
        cards[0].inner.style.transition = 'none';
        cards[0].inner.style.filter     = '';
        cards[0].video.style.filter     = `blur(${progress * 8}px)`;
        const labelFade    = Math.pow(progress, 1.4);
        const labelOpacity = 1 - labelFade;
        const labelBlur    = labelFade * 14;
        cards[0].label.style.transition       = 'none';
        cards[0].label.style.opacity          = String(labelOpacity);
        cards[0].label.style.filter           = `blur(${labelBlur}px)`;
        cards[0].labelShadow.style.transition = 'none';
        cards[0].labelShadow.style.opacity    = String(labelOpacity);
        cards[0].labelShadow.style.filter     = `blur(${labelBlur}px)`;

        if (cards[1]) applyReveal(cards[1], 1, revealProgress * 0.92);
    }

    function onUp(e) {
        if (!dragging) return;
        dragging = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup',   onUp);
        window.removeEventListener('pointercancel', onCancel);

        const vw = window.innerWidth, vh = window.innerHeight;
        const geom = Math.sqrt(vw * vh);
        const refX = geom + (vw - geom) * 0.8;
        const refY = geom + (vh - geom) * 0.8;
        const dismissNorm = Math.hypot(dragX / (refX * DISMISS_DIST), dragY / (refY * DISMISS_DIST));
        const now    = performance.now();
        const recent = dragSamples.filter(s => now - s.t < 100);
        let vel = 0;
        if (recent.length >= 2) {
            const dt = recent.at(-1).t - recent[0].t;
            if (dt > 0) {
                const dx = recent.at(-1).x - recent[0].x;
                const dy = recent.at(-1).y - recent[0].y;
                vel = Math.sqrt(dx ** 2 + dy ** 2) / dt;
            }
        }

        if (dismissNorm >= 1 || vel > DISMISS_VEL) {
            dismissTop(dragX, dragY);
            if (wasDrag) { suppressClick = true; hideUI(); }
        } else {
            snapBack();
            if (wasDrag) { suppressClick = true; hideUI(); }
        }
    }

    function onCancel() {
        dragging = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup',   onUp);
        window.removeEventListener('pointercancel', onCancel);
        snapBack();
    }

    stack.addEventListener('pointerdown', e => {
        if (!heroReady || dragging) return;

        // Only start drag if within front card bounds
        const rect = cards[0].el.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top  || e.clientY > rect.bottom) return;

        dragging    = true;
        dragStartX  = e.clientX;
        dragStartY  = e.clientY;
        dragX = dragY = 0;
        dragSamples = [];
        wasDrag     = false;
        cards[0].el.style.zIndex = '15'; // lift above UI during drag

        window.addEventListener('pointermove',   onMove);
        window.addEventListener('pointerup',     onUp);
        window.addEventListener('pointercancel', onCancel);
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────
lastOrientation = portrait() ? 'portrait' : 'landscape';
buildStack();
initGestures();

// Tap anywhere to show UI; drag release hides it
// suppressClick prevents the click event that fires after pointerup from overriding hideUI
let suppressClick = false;
let clickDebounceTimer = null;
document.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    if (clickDebounceTimer) return;
    if (uiVisible) hideUI(); else showUI();
    clickDebounceTimer = setTimeout(() => { clickDebounceTimer = null; }, 400);
});

window.addEventListener('resize', () => {
    const orientation = portrait() ? 'portrait' : 'landscape';
    const orientationChanged = orientation !== lastOrientation;
    lastOrientation = orientation;

    cardSize = computeCardSize();
    midSize  = computeMidSize();

    if (orientationChanged) {
        const moods    = currentMoods();
        const startIdx = getMoodNext();
        setMoodNext((startIdx + NUM_CARDS) % moods.length);
        cards.forEach((card, i) => {
            card.mood = moods[(startIdx + i) % moods.length];
            setLabelText(card.label, card.mood);
            card.label.appendChild(card.labelStrike);
            setLabelText(card.labelShadow, card.mood);
            card.labelShadow.appendChild(card.labelShadowStrike);
            applyLabelPosition(card);
            card.video.src = moodSrc(card.mood);
            card.video.load();
            card.video.play().catch(() => {});
            showThumb(card, true);
        });
    }
    cards.forEach((card, i) => applyPos(card, i, false));
});
