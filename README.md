# Spark Shop: Idle Repair Empire

**Spark Shop** is a portrait Android idle repair game, playable in a desktop
browser. Five eras, thirty repair stations and managers, forty research ranks,
fifty achievements, twenty daily mission templates, three rotating weekend
events, a seven-day login cycle, Fault Hunt, offline production and prestige.
English and Turkish follow device locale with an English fallback.

## Run

Node 22.21+ (Node 24 used here):

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run sim
npm run lint
npm run build
```

Open the local URL printed by Vite. The browser uses a three-second mock video
and a clearly marked demo Pro purchase, with no charge. Repair manually until you
can hire managers; use More → Goals for daily rewards and achievement Badges.
Research and Reputation survive resets. Only managed stations earn offline.
Era goals use earnings within the current run; opening an era doubles all income.

## Android

Requires JDK 21, Android SDK 36, platform/build tools, accepted SDK licenses and
internet access for Gradle. Windows helper: `./scripts/android-build.ps1`.

```sh
npm run build
npx cap sync android
cd android
./gradlew bundleRelease assembleDebug
```

Windows uses `gradlew.bat`. Set `JAVA_HOME` and `ANDROID_HOME` appropriately.
An ignored `android/local.properties` can contain `sdk.dir=C:/.../Android/Sdk`.
The initial build downloads substantial native dependencies. Test configuration
produces an unsigned release AAB and a debug-signed APK; only your signed,
production-configured AAB belongs in Play Console. See [release checklist](RELEASE_CHECKLIST.md).

The package placeholder `com.sparkshop.idle` must be confirmed before the first
upload. Configure `ADMOB_APP_ID`, `REWARDED_UNIT_ID` / `VITE_REWARDED_UNIT_ID`,
`VITE_REVENUECAT_ANDROID_KEY`, `VITE_PRIVACY_POLICY_URL`, your upload keystore and
contact information. Release configuration is described in the checklist.
There are no real advertising IDs or signing secrets in source control.

## Design and verification

- `src/core`: deterministic logic, Decimal money, versioned saves and recovery.
- `src/data`: typed content, balance, meta goals and optional reward placements.
- `src/ui`: Preact screens; 10 Hz core stepping independent of browser paint.
- `src/platform`: AdMob/UMP, Play billing through RevenueCat, mocks, Preferences,
  haptics, synthesized audio, local analytics, opt-in local notifications.
- Cloud save and Firebase analytics are explicit stubs, not connected services.
- [Balance assumptions and measured pacing](BALANCE.md).
- [Verification evidence and outstanding device checks](VERIFICATION.md).
- `scripts/browser-check.mjs`: local headless Brave regression, requires dev
  server at port 5173. Uses a dedicated temporary test profile, never personal tabs.
- `scripts/device-check.mjs`: inspect this debug app's WebView over authorized ADB;
  `--watch-ad` tests the opt-in income boost with Google's test unit.

Saves autosave every ten seconds and on pause, with previous-save backup.
Export/import via Settings. Pro entitlements are never trusted from imported
save text. Clock rollback and offline accumulation are clamped locally; this is
not server-authoritative anti-cheat. Research completes instantly, so the research
speed-up placement is intentionally inactive. No gameplay requires an ad or purchase.

Top tuning knobs: payback, producer growth, era goals, prestige divisor and
reward minutes/caps. Edit `src/data/balance.ts`, `content.ts` and
`rewardedPlacements.ts`, then run both simulation profiles.
