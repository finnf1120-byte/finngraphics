# Finn Graphics — Portfolio Site

A self-contained website: plain HTML, CSS, and JS, with a real admin login for editing content, hosted for free on Netlify.

**Important — this now needs Git-connected hosting, not drag-and-drop.** The admin panel below only works if this site is deployed via a GitHub repo connected to Netlify (rather than dragging the folder into Netlify's manual deploy screen). See "Hosting it live" further down for exact steps.

**Previewing locally:** because content now loads via `fetch()` from the `data/*.json` files, double-clicking `index.html` to open it directly in a browser won't load the content (browsers block that kind of file-to-file request for security). To preview locally, run a tiny local server from this folder, e.g. `npx serve` or `python3 -m http.server`, then open the address it gives you. Easiest of all: just push to GitHub and preview it live on Netlify.

---

## The admin panel (add/edit/delete everything)

Once set up (steps below), go to **yoursite.com/admin/**, log in, and you can add, edit, or delete:

- **Projects** — title, sport, category, client/personal status, the whole photo slideshow with captions, and the description
- **Shop products** — title, category, price, image, description, and the Gumroad link
- **Work With Me tiers** — title, tagline, summary, the "Includes" list, and the image
- **Reviews** — quote, author, and role
- **Client logos** — name and logo image

Every change is saved as a real commit to your site's GitHub repo, and Netlify automatically republishes the live site within a minute or so of saving.

**What this doesn't cover:** the hero headline, About bio, and contact email are still plain text inside `index.html` — editing those still means opening the file directly and changing the words (see "Editing page text" below). Only the list-style content above goes through the admin panel.

### One-time setup (you'll do this yourself in Netlify's dashboard)

I've built and wired up everything the code needs — but the login itself has to be created by you, in Netlify's dashboard, because that's where the actual password gets stored securely. Here's exactly what to do, once this site is deployed via a GitHub repo connected to Netlify:

1. In your Netlify site dashboard, go to **Site configuration → Identity**, and click **Enable Identity**.
2. Under **Registration preferences**, set it to **Invite only** (so nobody else can sign themselves up).
3. Under **Services → Git Gateway**, click **Enable Git Gateway**. This is what lets the admin panel actually save changes back to your repo.
4. Go to the **Identity** tab (top of the dashboard, not the settings page) → **Invite users** → enter your own email address.
5. Check your email, click the invite link, and set your password to `Albion11` when prompted.

   **One important note:** Netlify Identity logs people in by **email address**, not a separate username — there's no way to make the literal word "finnadmin" the login name. Two ways to still get what you asked for:
   - Simplest: just log in with your real email + `Albion11` — nobody but you ever sees that email, since it's just your admin login.
   - Or: after accepting the invite, go to the Identity widget's profile/settings and set your **display name** to "finnadmin" — it'll show that name in the admin UI, but you'll still type your email to log in.
6. From then on, go to **yoursite.com/admin/**, log in with that email + `Albion11`, and start editing. There's also an **Admin Login** link in the site's footer that takes you straight there.

## Setting up the Gumroad checkout

The Shop's "Buy now" buttons open Gumroad's checkout as an overlay right on your site (rather than sending people away to a new tab), using Gumroad's own embed script — already wired into `shop.html`.

1. Upload your file (template, pack, or poster) to Gumroad and set a price there.
2. Copy that product's Gumroad page URL.
3. In the admin panel (or directly in `data/shop.json`), paste it into that product's **Gumroad product link** field.

Leave that field as `#` and the card shows a "Checkout link coming soon" button instead of a broken link, so nothing looks off while a product isn't ready yet.

## Adding your about photo

Put a photo at `images/about/portrait.jpg` (any image format works — just update the `src` reference in `index.html` if you use a different filename, in the `.about-portrait` section). This one photo isn't part of the admin panel — it's a manual file swap.

## Editing page text

Hero headline, subhead, About bio, and contact email/socials are all plain text inside `index.html` — search for the section you want (marked with comment headers like `<!-- HERO -->`) and edit the words directly. This is the one part of the site the admin panel doesn't reach.

## Slideshow project popups

Each project has an `images` list instead of a single photo, so you can include process shots, alternate angles, or related work alongside the main shot — add more photos to a project right in the admin panel. Clicking a project card opens all of them as a slideshow with arrow and dot navigation (also works with keyboard left/right arrows). The first image in the list is always the card's cover photo.

## Motion on the site

Sections and cards gently fade and rise into place as you scroll past them, and the homepage has a slow ambient background drift instead of a flat one. The hero has a scattered photo wall (pulled from your first few projects) with a hover zoom, project/shop/service images zoom slightly on hover, nav links get an underline sweep, and testimonials scroll past continuously on the Reviews page. All of this respects the "reduce motion" accessibility setting on the visitor's device/browser.

## The contact form

Wired up for **Netlify Forms** — detected automatically once hosted on Netlify, no setup needed. Submissions show up in your Netlify dashboard, and you can turn on email notifications there too.

## Hosting it live (Git-connected, required for the admin panel)

1. Create a new **GitHub** repo and push everything in this folder to it.
2. In Netlify: **Add new site → Import an existing project**, connect your GitHub account, and pick that repo.
3. Leave the build command empty and the publish directory as `/` (this site has no build step).
4. Deploy — you'll get a live `*.netlify.app` link immediately, and a custom domain can be added later under Site settings → Domain management.
5. Then follow the **admin panel setup** steps above (Identity → Git Gateway → invite yourself).

**If you'd rather not deal with Git/GitHub at all:** you can still host this via Netlify's drag-and-drop "Deploy manually" option, or GitHub Pages, Vercel, etc. — but the `/admin` login won't work in that case, since it specifically needs Git Gateway. In that setup you'd go back to editing the `data/*.json` files by hand (same format as before, just JSON instead of JS — see any file in `/data` for the pattern) and re-uploading the folder after each change.

## About the Wix question

Wix doesn't support importing a fully custom-coded site like this one. If you later want it inside Wix specifically, the content and layout here can be recreated using Wix's own editor — this version is meant for hosting on its own (Netlify, GitHub Pages, etc.), which also means it stays fully responsive and interactive, unlike embedding custom code into Wix.
