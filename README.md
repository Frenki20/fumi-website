# FUMI — Agency Website

Hand-coded, dependency-free website for **FUMI**, a digital marketing & web development agency.
*Your Vision. Our Digital Touch.*

## Structure

```
Fumi/
├── index.html          English one-page site: Home, Services, Pricing (+ FAQ), Work, About, Contact
├── sq/index.html       Albanian version of the same page
├── 404.html            Branded "page not found" page
├── css/style.css       Design tokens, layout, components, animations, responsive rules
├── js/main.js          Loader, navigation, scroll effects, portfolio, pop-up, contact form, lekë prices,
│                       floating WhatsApp button, and the interface text for both languages
├── assets/             favicon, logos (PNG + WebP in 480/960/1903 px widths), og-image.png
├── robots.txt
└── sitemap.xml
```

## Colours

The palette is cream ("pana") `#F3EADB`, warm black `#1A1414` and bright red `#E5383B`. Every colour is set once, as a variable at the top of `css/style.css` (`:root`), so it can be changed in one place.

## Two languages

The site exists twice: `index.html` (English) and `sq/index.html` (Albanian). Both have the same structure, so **any change to text, prices or contact details must be made in both files.** The `EN`/`SQ` button in the header links between them, and `hreflang` tags tell Google which page is which.

Text created by JavaScript (form errors, "Sending…", etc.) lives in the `STRINGS` object at the top of `js/main.js`, in both languages.

## Prices in lekë

Under each euro price, the site shows an approximate amount in lekë (e.g. `≈ 14,500 ALL`). It's calculated in `js/main.js` from `EUR_TO_ALL` (currently `97`) and rounded to the nearest 500. Update that one number when the exchange rate moves. Each price has a `data-eur="…"` placeholder next to it; keep it in sync if you change a price.

## Still to do

- **Our Work**: the six projects are samples. Replace them with real case studies (in both languages). Each `<article class="project">` has a title, description, category (`web`, `branding` or `social`) and a hidden `.project__details` block shown in the pop-up.
- **Testimonials**: a ready-made section sits in About, hidden. Paste in real quotes and remove the `hidden` attribute (instructions in the HTML comment, both files).
- **FAQ**: an HTML comment under the FAQ lists questions worth adding once you've decided the answers (contract length, payment, ad budget, revisions).

## Contact form

The form sends through [FormSubmit](https://formsubmit.co). There's no account or backend to set up.

1. Put your email in the form's `action` and `data-email` attributes (the find & replace above covers this).
2. Upload the site, open it **from your live domain** (FormSubmit doesn't work from a file opened directly on your computer) and send one test message.
3. FormSubmit emails you an activation link. Click it once and every later message lands in your inbox.
4. Optional: after activating, FormSubmit gives you a random alias. Use it in `action` instead of your email to keep the address hidden from spam bots.

Built in: friendly validation, spam honeypot, loading state, success screen, and a pre-filled email fallback if sending ever fails. Without JavaScript, the form still submits normally.

To use another provider (Formspree, Getform, …), just change the form's `action` URL.

## Hosting

It's a static site, so it runs on any host: Netlify, Vercel, GitHub Pages, Cloudflare Pages or regular shared hosting. Upload the folder as it is. `404.html` uses root-relative paths, so the site should sit at the root of the domain.

To preview locally: `python -m http.server` inside this folder, then open http://localhost:8000.
