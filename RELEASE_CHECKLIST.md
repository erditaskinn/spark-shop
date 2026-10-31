# Spark Shop: Idle Repair Empire — release checklist

Spark Shop is the short app name. Do not upload the test build as a production release.

## Identity and production services

1. Confirm `com.sparkshop.idle` or change the application ID consistently in
   Capacitor config, Android namespace/applicationId, Java package/path and strings.
   The package cannot change after first Play upload. The official title is
   **Spark Shop: Idle Repair Empire**, exactly 30 characters.
2. Create a Play Console app, choose Game, default language and a general audience
   13+ that matches your actual marketing. Never select an audience merely to avoid
   Families obligations. Complete developer identity/payment verification.
3. Create the Android app and rewarded unit in AdMob. Configure UMP GDPR/European
   and applicable US state messages, provider partners, privacy policy and test
   devices in AdMob Privacy & messaging. Complete app-ads.txt and app readiness review.
4. Put the real **app** ID in environment/Gradle property `ADMOB_APP_ID` (uses `~`),
   and rewarded **unit** ID in `REWARDED_UNIT_ID` or `VITE_REWARDED_UNIT_ID` (uses `/`).
   `.env.local` and local environment variables are ignored. These IDs are public
   configuration, but do not commit production values here. `VITE_ADMOB_TEST_DEVICES`
   accepts comma-separated test-device hashes. Never click live ads during testing.
5. Configure non-consumable product `spark_shop_pro` in Play Console. In RevenueCat,
   connect the Play app using its secure dashboard, map product to entitlement `pro`
   and the default offering. Set its price in Play Console. Put only the public
   Android SDK key in `VITE_REVENUECAT_ANDROID_KEY`; never place service-account JSON
   or private backend keys in Vite variables. Test billing through a Play internal
   test track and licensed testers, including cancellation, pending payment,
   refund/revocation, reinstall and restore.
6. Host the completed [privacy policy](PRIVACY_POLICY.md) at a public HTTPS URL;
   fill publisher/contact/retention information. Set `VITE_PRIVACY_POLICY_URL`.

## Signing and reproducible build

7. Install JDK 21, SDK Platform 36 and Build Tools 36.0.0, set `JAVA_HOME` and SDK
   location, accept SDK licenses. Run `npm ci` using the committed lockfile.
8. Generate your own upload key in a private, backed-up directory:

   ```sh
   keytool -genkeypair -v -keystore /secure/spark-shop-upload.jks -alias spark-shop-upload -keyalg RSA -keysize 2048 -validity 10000
   ```

   Enter passwords interactively. Copy `android/key.properties.example` to ignored
   `android/key.properties`; fill local keystore path, alias and passwords. Keep the
   keystore and credentials out of Git and share neither in screenshots nor logs.
9. Set **both** production flags `VITE_ADMOB_PRODUCTION=true` and `SPARK_PRODUCTION=true`.
   The first selects production web ad units; the second validates native app ID
   and signing configuration. `./scripts/android-build.ps1 -Production` sets both.
   A default build deliberately uses Google's official test IDs. Set release
   `versionCode` higher for every Play upload and set a matching `versionName`.
10. Run `npm run typecheck`, `npm test`, `npm run sim`, `npm run lint`,
    `npm run build`, `npx cap sync android`, then `android/gradlew bundleRelease`
    from inside `android` (Windows: `gradlew.bat bundleRelease`).
    Output: `android/app/build/outputs/bundle/release/app-release.aab`.
    Verify signing with `jarsigner -verify -verbose -certs app-release.aab`.
    An unsigned AAB is useful build evidence but cannot be submitted.
11. Use Play App Signing and keep the upload key backed up. Inspect the merged
    manifest: minSdk 24, compile/target 36, portrait orientation, AD_ID and required
    SDK permissions. No exact-alarm permission is needed. Recheck resolved Google
    Mobile Ads and Play Billing support deadlines before each release.

## Release QA and Play setup

12. Test a physical device with official test units: fresh install, consent in
    EEA/non-EEA/US test geography, refusal, privacy options, under-age flags, offline
    launch, no fill, show failure, dismiss-before-reward, Rewarded duplicate events,
    background/resume and audio restoration. Never award from the show Promise.
13. Test all placements with independent cooldowns, daily caps and global 30s gap.
    Welcome-back collect must work without an ad. Verify Pro hides prompts on the
    main screen, restores and applies benefits, while all free gameplay remains.
14. Check Android 16 back gestures, system bars/edge-to-edge, font scaling, screen
    reader navigation, reduce motion, 44px targets, small phones and tablets.
    Android 16 may override orientation restrictions on large displays; verify the
    centered responsive layout. Check WebView errors, ANRs, battery and long offline
    saves. Verify the bundle supports applicable 16 KB page-size requirements using
    Play's bundle analysis and a 16 KB emulator/device; do not assume SDKs guarantee it.
15. Use the [store listing](STORE_LISTING.md), provide a 512×512 icon, 1024×500
    feature graphic and eight actual gameplay screenshots. Capture final assets;
    the briefs are not finished store images. Check fictional names for conflicts.
16. Fill [Play Console answers](PLAY_CONSOLE_ANSWERS.md), IARC rating, app access,
    ads declaration, Data safety and privacy URL from the actual final SDK setup.
    No login is required; premium purchase is optional. Review the merged manifest
    and all mediated/analytics SDKs before certifying any Data safety statement.
17. Run internal testing, then the [closed-test plan](CLOSED_TESTING.md) if required.
    Upload the signed AAB, fix pre-launch report findings, review countries/pricing,
    apply for production access if applicable, then use a staged rollout.
18. Monitor crashes, ANRs, ad fill/consent, opt-in rate, earned rewards and retention.
    The default local event log is not a production dashboard. Connect the analytics
    stub only after updating consent and privacy disclosures for the chosen provider.

Official requirements checked 2026-10-31:
[target API](https://support.google.com/googleplay/android-developer/answer/11926878),
[personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465),
[Mobile Ads disclosures](https://developers.google.com/admob/android/privacy/play-data-disclosure),
[16 KB guidance](https://developer.android.com/guide/practices/page-sizes).
