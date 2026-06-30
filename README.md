# Nilla Orina — personal site

A single-page portfolio for Nilla Orina 
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

## Edit the words

All copy lives directly in `index.html` — find the section (`<!-- ABOUT -->`, `<!-- RESEARCH -->`, etc.) and edit the text.

## Make it yours (colors / fonts)

Open `styles.css` — everything theme-related is in the `:root` block at the top:

```css
--warm: #e8a4be;   /* dusty rose — primary accent */
--cool: #c992b0;   /* mauve */
--cool-2: #f0c8dc; /* soft blush */
```

