# MinimalTab — Next Feature Plan

## Goal
Make MinimalTab feel like a premium, dense productivity OS by adding personalization and smart utilities that complement the existing Hero, Search, Quick Access, and Notes — without cluttering the minimal surface.

## What we learned
Current build has: Hero (greeting, clock, quote), Universal Search with engine prefixes, Quick Access links with drag-drop + keyboard, Notes with todos/pinning, Command Palette, Focus Mode, Settings, animated light/dark toggle, and a wave background. User wants: **Personalization**, **Smart utilities**, and a **theme-aware wave background**. Vibe: **dense and powerful**, premium product.

## Proposed features

### 1. Theme-aware animated wave background
- Replace the current static-ish wave with a layered SVG/Canvas motion background whose palette shifts between a calm light gradient and a deep dark gradient.
- Tie palette to the existing `dark` localStorage flag so it reacts instantly to the animated toggle.
- Keep it subtle: low-opacity, slow motion, no performance hit.

### 2. Wallpaper / background picker (Personalization)
- Add a small set of premium abstract gradients + solid color options in Settings.
- Persist choice to localStorage.
- Allow "None" to fall back to the wave background.
- Premium direction: 4–5 curated options, not an unlimited gallery.

### 3. Live weather widget (Smart utility)
- Add a compact weather pill in the header or Hero area.
- Use browser geolocation + a free weather API (Open-Meteo, no key required).
- Show current temp, condition icon, and a 3-hour mini trend.
- Cache location/forecast in localStorage for 30 minutes.

### 4. Bookmarks import / top-sites panel (Smart utility)
- Let users paste/import browser bookmarks as Quick Access items (parse a Netscape HTML export or simple JSON).
- Alternatively, surface a "Top Sites" section derived from recently clicked Quick Access links (stored locally).
- This makes Quick Access more useful without manual link management.

### 5. Dense dashboard layout refinements
- Tighten spacing and use a tighter type scale so the two-column desktop layout feels information-rich like Linear/Notion.
- Make Notes panel resizable/collapsible on desktop.
- Add a small "Daily focus" line under the Hero greeting (editable, persists).

### 6. Premium micro-interactions
- Staggered entrance animation for Quick Access cards.
- Subtle hover lift and glow on cards.
- Command palette search highlighting.

## Files to touch
- `src/components/minimaltab/WaveBackground.tsx` — theme-aware motion waves
- `src/components/minimaltab/Settings.tsx` — wallpaper picker + daily focus input
- `src/components/minimaltab/Hero.tsx` — daily focus line, weather integration point
- `src/components/minimaltab/WeatherWidget.tsx` — new component
- `src/components/minimaltab/QuickAccess.tsx` — top-sites / import flow
- `src/routes/index.tsx` — layout density, wallpaper layer
- `src/lib/minimaltab/storage.ts` or new `src/lib/minimaltab/weather.ts` — weather cache logic
- `src/styles.css` — focus states, animation tokens

## Out of scope (kept for later)
- AI assistant, Pomodoro timer, calendar, notifications, auth/sync. These were removed earlier and would bloat the current minimal surface.

## Deliverables
1. Theme-aware wave background live.
2. Wallpaper picker in Settings with 4–5 premium presets.
3. Weather widget showing local temp + condition.
4. Quick Access import / top-sites helper.
5. Denser, more responsive two-column layout with daily focus line.

## Questions for you
1. Should the weather widget request browser geolocation automatically, or start with a manual city search?
2. For bookmarks import, do you want a file upload (Netscape HTML export) or a simple paste-JSON flow?
3. Should wallpapers include a pure dark/light solid option, or only gradients?
