# FUMI — Agency Website

Hand-coded, dependency-free website for **FUMI**, a digital marketing & web development agency.
*Your Vision. Our Digital Touch.*

## Structure

```
Fumi/
├── index.html          English one-page site: Home, Services, Pricing (+ FAQ), Work, About, Contact
├── sq/index.html       Albanian version of the same page
├── privacy.html        Privacy policy (English); sq/privacy.html is the Albanian version
├── 404.html            Branded "page not found" page
├── css/style.css       Design tokens, layout, components, animations, responsive rules
├── css/fonts.css       @font-face rules for the self-hosted fonts
├── js/main.js          Loader, navigation, scroll effects, portfolio, pop-up, contact form, lekë prices,
│                       floating WhatsApp button, and the interface text for both languages
├── assets/             favicon, logos (PNG + WebP in 480/960/1903 px widths), og-image.png,
│                       fonts/ (Syne, Inter, Instrument Serif as WOFF2)
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

These need information only you have. Everything else is already built.

- **Your city**: add it to the title, the About text and the structured data. In the `<script type="application/ld+json">` block of both pages, extend `"address"` with `"addressLocality": "Tirana"` (or your city) and, if you have an office, `"streetAddress"`. Then create a free Google Business Profile with the same name, phone and address.
- **Our Work**: the six projects are labelled as concepts, not client work. When you have real projects, replace them (both languages) and change the tag from `Concept`/`Koncept` back to the year. Each `<article class="project">` has a title, description, category (`web`, `branding` or `social`) and a hidden `.project__details` block shown in the pop-up.
- **Testimonials**: a ready-made section sits in About, hidden. Paste in real quotes and remove the `hidden` attribute (instructions in the HTML comment, both files).
- **Stats**: the four numbers in About describe the agency, not results. Swap in real ones (clients served, years active, posts published) when you have them.
- **FAQ drafts**: four answers (contract length, payment, ad budget, revisions) are written but hidden. They're common agency terms, not your confirmed policy. Edit them to match how you work, then delete `hidden` from each `<details>` line, in both files.
- **À la carte prices**: each one now says `/month` or `one-off`. Posts & Reels is marked one-off and Meta / Google Ads Management is marked monthly. Check those two match how you charge.
- **Email**: a `@fumi.agency` address (e.g. hello@fumi.agency) looks more professional than Gmail. Once it works, find & replace `FuMi.Agency17@gmail.com` and `fumi.agency17@gmail.com` across all HTML files, and re-activate FormSubmit for the new address.
- **Analytics**: a Plausible snippet is ready but commented out at the bottom of `<head>` in both pages. Create the account, then uncomment it.

## Fonts

Syne, Inter and Instrument Serif are self-hosted in `assets/fonts` (Latin and Latin Extended only, which covers English and Albanian), so pages make no requests to Google. The two fonts used above the fold are preloaded in each page's `<head>`.

## Privacy policy

`privacy.html` and `sq/privacy.html` describe what the site collects. They're linked from the footer and under the contact form. They say the site uses no cookies or analytics and keeps enquiries for up to 12 months, so **update both pages if you add analytics, change the form provider or decide on a different retention period.**

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
