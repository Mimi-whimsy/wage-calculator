# Wage Calculator

A simple, personal wage calculator for your phone's browser. Enter your
hourly wage and either your work hours or your clock-in/clock-out times, and
it calculates your pay for the day — including Weekday/Weekend overtime
rates. No account, no server, no database. Everything runs in your browser.

## Features

- **Hourly Wage** — type your hourly rate once; it's remembered on this
  device (saved with `localStorage`) so you don't have to re-enter it.
- **Manual Time** — enter Hours and Minutes directly.
- **Work Schedule** — enter a Clock In and Clock Out time and the work
  time is calculated automatically. Overnight shifts (e.g. 22:00 → 06:00)
  are handled correctly.
- **Weekday / Weekend pay rates**
  - Weekday: first 8 hours × 1.00, hours beyond 8 × 1.25
  - Weekend: first 8 hours × 1.35, hours beyond 8 × 1.60
- **Result card** — shows total salary plus a Regular/Overtime breakdown.
- **Copy Result** — copies the final salary amount to your clipboard.
- **Clear** — resets your inputs (with a confirmation prompt). Your Hourly
  Wage is never cleared.
- **Installable (PWA)** — add it to your iPhone Home Screen and use it like
  a native app, including basic offline support.

## How to use

1. Open `index.html` in a browser (or visit the GitHub Pages link once
   published — see below).
2. Set your **Hourly Wage** once — it will be remembered.
3. Either:
   - Enter **Hours / Minutes** under Manual Time and tap **Calculate**, or
   - Enter **Clock In / Clock Out** under Work Schedule and tap **Calculate**.
4. Pick **Weekday** or **Weekend** for whichever card you're using.
5. Read your salary in the **Result** card.
6. Tap **Copy Result** to copy the amount, or **Clear** to start over.

## Project files

```
wage-calculator/
├── index.html      → page structure (all the cards/sections)
├── style.css       → all visual styling (dusty rose theme)
├── script.js       → all app logic (calculation, storage, buttons)
├── manifest.json   → PWA metadata (name, colors, icons)
├── sw.js           → service worker (offline support)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

If you want to change something later:
- **Change colors / spacing / fonts** → edit `style.css`
- **Change the pay calculation, or any button behavior** → edit `script.js`
  (the `calculateSalary()` function is the one place that does the pay math)
- **Change text, labels, or add a new field to the page** → edit `index.html`
- **Change the app icon** → replace the PNG files in `icons/`

## Publishing with GitHub Pages

1. Create a new repository on GitHub (e.g. `wage-calculator`).
2. Upload all the files in this folder to the **root** of that repository
   (not inside a subfolder) — `index.html` should be directly in the
   repository root.
3. On GitHub, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch`,
   choose the `main` branch and the `/ (root)` folder, then save.
5. After a minute or two, GitHub will give you a URL like:
   `https://your-username.github.io/wage-calculator/`
6. Open that link — your app is now live for anyone with the link.

## Adding it to your iPhone Home Screen

1. Open the GitHub Pages link in **Safari** on your iPhone.
2. Tap the **Share** button (square with an arrow pointing up).
3. Tap **Add to Home Screen**.
4. Tap **Add**.

You'll now have a Wage Calculator icon on your Home Screen that opens full
screen, just like a regular app.

## Notes

- All data stays on your device — nothing is sent anywhere.
- This app doesn't require Node.js, npm, or any build step. It's plain
  HTML/CSS/JavaScript that runs directly in the browser.
