# Spark Shop assets

The user-provided Spark Shop reference is the source of the current visual direction.

- `public/art/shop-reference.png`: user's supplied interface image, copied into the
  project. `DeviceArt.tsx` displays only the three device-art regions using CSS
  background viewports. Text, prices, controls and progress bars are real UI.
- `public/art/device-atlas.png`: original generated 6-column, 5-row atlas with all
  30 station devices, ordered by station ID. Built-in imagegen, using the user's
  image as a style reference. Used for later devices and era illustrations.
- `public/art/repair-board.png`: original generated 3:1 circuit-board illustration.
  No text or baked-in active fault; actual Fault Hunt targets are interactive DOM.
- `public/art/grain.svg` and `traces.svg`: original code-native texture and copper
  traces; local assets, no external font or image requests.
- `src/ui/Icon.tsx`: shared original SVG icons, chip logo, coins and medal.
- Android launcher / native splash: original chip vector, matching green and gold.
- Typography: local serif/system font fallbacks. No downloaded font files.
- Audio: WebAudio oscillators. Haptics: existing platform plugin.
- Motion: CSS progress, button feedback, fault pulse and floating rewards, respecting
  reduce-motion preferences and settings.
- Raster generations and exact prompts: `artifacts/art-prompts.md`.
- QA captures: `artifacts/reference-*.png` and `phone-workshop.png`, ignored by Git.
  These are review captures, not final store screenshots.

No external stock photography, real device logos or recorded music was added.
Fictional device names are unchanged. Perform publisher naming/asset clearance
before release. Final store raster icon, feature graphic and marketing screenshots
still need export/review as described in STORE_LISTING.md.
