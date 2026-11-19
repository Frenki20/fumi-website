# FUMI — Agency Website

Hand-coded, dependency-free website for **FUMI**, a digital marketing & web development agency.
*Your Vision. Our Digital Touch.*

## Structure

```
Fumi/
├── index.html          One-page site: Home, Services, Work, About, Process, Contact
├── 404.html            Branded "page not found" page
├── css/style.css       Design tokens, layout, components, animations, responsive rules
├── js/main.js          Loader, navigation, scroll effects, portfolio, pop-up, contact form
├── assets/             favicon.svg, apple-touch-icon.png, logo.png, og-image.png
├── robots.txt
└── sitemap.xml
```

## Colours

The palette is cream ("pana") `#F3EADB`, warm black `#1A1414` and bright red `#E5383B`. Every colour is set once, as a variable at the top of `css/style.css` (`:root`), so it can be changed in one place.

## Before going live — replace these placeholders

Use your editor's **Find & Replace across all files**:

| Placeholder | Replace with | Where |
|---|---|---|
| `hello@fumi.agency` | Your real email | index.html (links, form, structured data) |
| `000000000000` | WhatsApp number, international format, digits only (e.g. `355691234567`) | index.html |
| `fumi.agency/` (Instagram URLs) and `@fumi.agency` | Your Instagram handle | index.html |
| `https://www.fumi.agency/` | Your real domain | index.html, robots.txt, sitemap.xml |

The **Our Work** section contains six sample projects. Replace them with real case studies: each `<article class="project">` has a title, description, category (`web`, `branding` or `social`) and a hidden `.project__details` block shown in the pop-up.

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
