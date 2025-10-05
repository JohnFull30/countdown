# 🎉 Gender Reveal Countdown App

> A minimal React app for creating custom gender reveal countdowns — built with React, MUI, and Capacitor (for mobile builds).

---

## 🚀 Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/JohnFull30/countdown.git
   cd countdown
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run locally**

   ```bash
   npm start
   ```

   The app will open at:
   **[http://localhost:3000](http://localhost:3000)**

---

## 🧩 App Overview

| File                 | Description                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `App.js`             | Routes between the setup page and countdown screen. Uses `ProtectedRoute` to prevent refresh errors. |
| `CountdownSetup.js`  | Main setup page for users to select duration, gender, and optional custom GIF URL.                   |
| `GenderCountdown.js` | Handles countdown logic, background GIFs, and final reveal animation.                                |
| `ProtectedRoute.js`  | Redirects users back to setup if they try to access `/countdown` directly.                           |
| `countdown.css`      | Styles for both pages, including layout, buttons, and responsive positioning.                        |
| `index.js`           | Wraps the app in a `HashRouter` for GitHub Pages compatibility.                                      |
| `reportWebVitals.js` | (Optional) Performance logging for React metrics.                                                    |
| `scripts/*.sh`       | Bash scripts for Git branching, deployment, and cleanup. (See below 👇)                              |

---

## 🌱 Git Branch Workflow

You’re using a **branch-based workflow** with automation scripts:

| Script             | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `choose-script.sh` | Menu-driven script to deploy, create, or delete branches interactively. |
| `branchscript.sh`  | Creates and switches to a new feature branch from `main`.               |
| `deletescript.sh`  | Deletes local + remote branches safely.                                 |
| `deploy.sh`        | Commits and deploys to `gh-pages` via `npm run deploy`.                 |

**Example usage:**

```bash
./choose-script.sh
```

Then select:

* **Option 1:** Deploy Project
* **Option 2:** Create New Branch
* **Option 3:** Delete Branch

---

## 💻 Development Commands

| Command          | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `npm start`      | Run app locally                                           |
| `npm test`       | Run Jest test suite                                       |
| `npm run build`  | Create production build                                   |
| `npm run deploy` | Push production build to GitHub Pages (`gh-pages` branch) |

---

## 📱 Mobile Build (Capacitor)

You can also run the app as a mobile build:

```bash
npx cap add ios
npx cap open ios
```

For Android:

```bash
npx cap add android
npx cap open android
```

---

## 🧠 If You Forget Everything (Amnesia Mode)

1. Open VS Code and make sure you’re in the correct folder:

   ```
   cd countdown
   ```
2. Run:

   ```
   ./choose-script.sh
   ```

   → Option 2 to make a branch (e.g. `fix-ui`)
   → Option 1 to deploy after testing
3. Test changes locally (`npm start`)
4. Commit with a witty message (you know the drill 😎)
5. Run `./choose-script.sh` again → deploy when ready

---

## 🧱 Design Philosophy

* **Minimal UI** — clean, Apple/Turo-inspired.
* **Responsive** — works perfectly on mobile and desktop.
* **No external dependencies for reveal GIFs** — supports local `.mp4` video backgrounds (Option B).
* **User flow:**

  1. Set timer and gender
  2. Start countdown
  3. Reveal “It’s a Boy/Girl” with background animation

---

## 🧠 Supabase Integration (Optional)

If you plan to extend the app with Supabase (for saving user data, managing premium tiers, etc.):

1. Install the Supabase CLI

   ```bash
   npm install supabase --save-dev
   ```
2. Initialize your project

   ```bash
   npx supabase init
   ```
3. Connect your project with your Supabase dashboard and environment variables in `.env.local`.

See [Supabase CLI Docs](https://supabase.com/docs/reference/cli/about) for full reference.

---

## 🧩 Future Additions

* 🎆 Fireworks toggle (already queued for premium mode)
* 🌈 Custom video uploads
* 🔒 Stripe paywall integration
* 📲 Shareable reveal links
* 🧠 LocalStorage for saving setups

---

## 🪄 Credits

Built by **John Fuller**
Assisted by **Chip (ChatGPT)** — your friendly code co-pilot.

---

## 🧰 License

MIT License © 2025 John Fuller
