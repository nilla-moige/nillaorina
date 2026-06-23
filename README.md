# Nilla Orina — personal site

A single-page portfolio for Nilla Orina (Computer Science × Cognitive Science, Penn B.A. 2026, magna cum laude) with a research focus and a photography gallery.

```
index.html    structure & copy
styles.css    all styling + the theme
main.js       butterfly animation, scroll reveals, gallery + lightbox
images/       drop your photographs here
```

## Run it locally

Just open `index.html` in a browser. Or serve it (nicer, avoids any file:// quirks):

```bash
cd nilla-orina-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Add your photographs

1. Put image files in the `images/` folder (e.g. `images/golden-hour.jpg`).
2. Open `main.js` and edit the `PHOTOS` array near the top. For each photo set `src`:

```js
var PHOTOS = [
  { src: "images/golden-hour.jpg", caption: "Golden hour, Schuylkill", size: "wide" },
  { src: "images/portrait.jpg",    caption: "Studio portrait",        size: "" },
  // ...
];
```

- `caption`: shown beneath the frame and in the lightbox.
- `size`: `"wide"` for a double-width frame, or `""` for the default portrait. Mix them for a varied grid.
- Leave `src: ""` to keep the gradient placeholder for that slot.

Add or remove items freely; the grid and lightbox adjust automatically. Landscape photos look best at ~1600px on the long edge.

## Edit the words

All copy lives directly in `index.html` — find the section (`<!-- ABOUT -->`, `<!-- RESEARCH -->`, etc.) and edit the text.

## Make it yours (colors / fonts)

Open `styles.css` — everything theme-related is in the `:root` block at the top:

```css
--warm: #e8a4be;   /* dusty rose — primary accent */
--cool: #c992b0;   /* mauve */
--cool-2: #f0c8dc; /* soft blush */
```

