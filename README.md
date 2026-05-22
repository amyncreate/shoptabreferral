# 🛍️ ShopTab Referral Hub

A premium, fully animated static resource center for ShopTab affiliates.
Works on **AwardSpace, InfinityFree, ByetHost, Netlify, GitHub Pages** — any static host.

---

## 🚀 Quick Start

### 1. Add your resource files

Drop your files into the matching folders:

```
resources/
├── images/       ← .jpg, .jpeg, .png, .webp, .gif, .svg
├── videos/       ← .mp4, .webm, .mov
├── apks/         ← .apk, .xapk
└── documents/    ← .pdf, .docx, .txt, .xlsx, .pptx, .zip
```

### 2. Update the manifest

Open `resources/manifest.json` and list each file:

```json
{
  "images": [
    {
      "name": "My Flyer",
      "file": "my-flyer.jpg",
      "size": "245 KB",
      "date": "2025-01-15"
    }
  ],
  "videos": [ ... ],
  "apks": [ ... ],
  "documents": [ ... ]
}
```

**Fields:**
| Field  | Required | Description                             |
|--------|----------|-----------------------------------------|
| `name` | ✅       | Display name shown on the card          |
| `file` | ✅       | Exact filename including extension      |
| `size` | Optional | Human-readable size e.g. `"2.4 MB"`    |
| `date` | Optional | ISO date string e.g. `"2025-01-20"`    |

### 3. Upload to your host

Upload the entire project folder as-is. Your hosting root should contain:

```
index.html
manifest.webmanifest
sw.js
assets/
resources/
```

---

## 📁 File Structure

```
referral-hub/
├── index.html                  ← Main page
├── manifest.webmanifest        ← PWA manifest
├── sw.js                       ← Service worker (offline support)
│
├── assets/
│   ├── css/
│   │   └── main.css            ← All styles (glassmorphism design system)
│   ├── js/
│   │   └── app.js              ← Resource scanner + UI engine
│   └── icons/
│       ├── icon-192.png        ← PWA icon (add your own)
│       └── icon-512.png        ← PWA icon (add your own)
│
└── resources/
    ├── manifest.json           ← ⭐ EDIT THIS to add/remove resources
    ├── images/
    ├── videos/
    ├── apks/
    └── documents/
```

---

## ✨ Features

### 🎨 Design
- Glassmorphism cards with animated hover effects
- Animated gradient background orbs
- Floating hero decorations
- Smooth typing animation
- Dark / light mode toggle (saved to localStorage)
- Custom scrollbar

### 🔍 Smart Filtering
- Filter by: All / Images / Videos / APKs / Documents
- Real-time search (searches by name, filename, and type)
- Animated counter badges on filter pills

### 📦 Resource Cards
- Image cards with live preview + zoom on hover
- Video cards with hover-to-play preview
- APK cards with floating icon
- Document cards with type-specific icons (PDF, Word, Excel…)
- File type badge on each card
- File size display
- Individual download button per card

### ⬇ Download System
- "Download All" button (top nav + hero CTA)
- Sequential download with progress modal
- Per-file status (queued → downloading → done)
- Cancel button
- Toast notifications for all actions

### 📱 PWA & Mobile
- Installable as a home screen app
- Service worker for offline caching
- Fully mobile responsive (fluid grid, touch-friendly)
- Offline banner if connection drops

### ♿ Accessibility
- Semantic HTML5 landmarks
- ARIA labels and roles
- Live regions for dynamic content
- Keyboard navigable

---

## 🌐 Hosting Guides

### AwardSpace / InfinityFree / ByetHost
1. Log into your hosting control panel
2. Open File Manager → navigate to `public_html` (or `htdocs`)
3. Upload all files maintaining the folder structure
4. Visit your domain — done!

> ⚠️ **Note**: Free hosts sometimes block `.apk` downloads.
> If APKs don't download, check your host's MIME type settings
> or rename files to `.zip` and update the manifest.

### Netlify (recommended — fastest)
1. Drag & drop the project folder onto [netlify.com/drop](https://app.netlify.com/drop)
2. Live in 30 seconds, with HTTPS.

### GitHub Pages
1. Push to a GitHub repo
2. Go to Settings → Pages → Source: `main` branch `/root`
3. Your site is live at `https://username.github.io/repo-name/`

---

## 🛠 Customization

### Change the brand name
Search and replace `ShopTab` in `index.html` with your brand name.

### Change accent colors
In `assets/css/main.css`, edit the CSS variables at the top:
```css
:root {
  --accent-1: #6c63ff;  /* Purple — primary */
  --accent-2: #f72585;  /* Pink — videos */
  --accent-3: #4cc9f0;  /* Cyan — images */
  --accent-4: #43e97b;  /* Green — APKs */
  --accent-5: #f9a825;  /* Amber — documents */
}
```

### Change typing phrases
In `assets/js/app.js`, find `setupTypingAnimation()` and edit the `phrases` array.

### Add PWA icons
Replace `assets/icons/icon-192.png` and `assets/icons/icon-512.png` with your own icons.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Cards don't appear | Check `resources/manifest.json` for JSON syntax errors |
| Images show broken | Verify filenames match exactly (case-sensitive on Linux hosts) |
| Downloads blocked | Some hosts block certain MIME types — check host settings |
| PWA won't install | Requires HTTPS — use Netlify or GitHub Pages for free SSL |
| Fonts not loading | Check internet connection; fonts load from Google Fonts CDN |

---

## 📄 License

Free for personal and commercial use for ShopTab affiliates.

---

*Built with ❤️ — Referral Hub v1.0*
