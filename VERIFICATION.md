# Spark Shop verification

Development environment: Windows, Node 24, JDK 21 (portable, checksum-verified),
Android SDK 36. No production ad credentials or upload key are present.

## Automated evidence

- Strict typecheck passes; 25 unit/simulation tests pass.
- Lint checks source size (<300 lines) and debugging hygiene; TypeScript enforces
  semantic checks. Vite production browser build passes.
- Core tests cover geometric buying, automation, Decimal values, malformed saves,
  migration, backup recovery, offline/clock limits, research, prestige, faults,
  daily claims, reward caps/gaps and duplicate prevention.
- Native-ad adapter tests verify consent → initialization → load order; the show
  Promise/dismissal do not grant a reward; duplicate Rewarded events grant once;
  failed loading retries and remains unready.
- `artifacts/browser-check.json`: headless real-browser 360×800 check of repair,
  all eight enabled mock placements, prestige reset and opening a second-cycle era
  (using explicit economy fixtures), demo Pro, navigation, Turkish and overflow.
- `npm run sim`: two-hour active calibration and seven-day, two-check-in profiles.
  Full content is enabled, including achievements/research/events. See BALANCE.md.
- Android sync, `bundleRelease` and `assembleDebug` pass. First build took 24m58s
  on a 4 GB machine; cached rebuild took 2m37s. Build helpers limit workers to two.
- APK installed and launched on the user's connected Android 11 phone. UMP
  completed, the official Google rewarded test unit loaded and showed, and the
  actual native Rewarded callback granted exactly one boost. A delayed recheck
  found no duplicate. Evidence: `artifacts/device-ad-check.json`.
- Physical Back navigation from Research returns to the workshop through the
  Capacitor App event. Evidence: `artifacts/device-navigation.json`. Actual WebView
  screen capture was visually inspected; final toast feedback now auto-dismisses.
- Production dependency audit reports zero advisories. Four moderate development
  dependency advisories remain in Capacitor CLI tooling, not the shipped runtime.
- AAB is unsigned with test IDs; it is build evidence, not a Play upload artifact.
- Final APK updated on the connected phone with `adb install -r` and relaunched;
  existing game data was retained. AAB contents were hash-compared against every
  final production web asset and match exactly. Development fixture code is absent
  from production output. The AAB contains zero native `.so` libraries and zero
  signing certificates; publisher signing and API 36 device validation remain.

## Practical limits

- Simulation is an assumed greedy strategy, not human pacing, retention or revenue.
- Tick runs at 10 Hz, independent of rendering; inactive stations only update
  scalar checks. Decimal allocations happen on payouts/economy calculations, not
  every rendered frame. No DOM or native SDK calls exist inside core logic.
- CSS progress animates between tick snapshots. A sustained 60fps claim requires
  profiling low-end physical devices; it is not inferred from a desktop build.
- Production signing, live IDs, privacy hosting, Play/RevenueCat product setup,
  real billing/restore/refund, production consent messages, Android 16 and 16 KB
  compatibility need final publisher/device validation before upload.
- Browser integration helpers are local development tools, not packaged app code.
