# Decisions

- Confirm or change `com.sparkshop.idle` BEFORE the first Play upload; package identity is permanent afterwards.
- Repository was empty and not initialized; initialize Git locally and commit each green milestone.
- Use Capacitor 8.5+ and AdMob 8.2+ per the plugin compatibility documentation.
- Use RevenueCat Capacitor SDK for verified Play entitlements; the billing exception in the request permits this dependency.
- Research is instant; research speed-up placement is explicitly disabled because no timers exist.
- General audience 13+; use a neutral age band choice before native ads so under-age consent flags can be applied.
- No external art, fonts, or audio; build board illustrations with SVG/CSS and synthesize sounds.
- M6 TypeScript, 24 tests, browser regression and Android sync passed; the long first native build continues while M7 release documents are prepared. Device verification is recorded separately after installation.
- Native AAB/APK builds succeeded. User supplied an Android 11 phone and chose their age band; official AdMob test rewarded video loaded, showed and granted exactly once on the physical device.
- Limit Gradle to two workers and compile Kotlin in process for this 4 GB development machine. Test builds remain unsigned for release and debug-signed for device installation.
- Recommend prestige at 100 new Reputation; the full-content bot reaches this at about 50 active minutes and subsequent loops are 2.4–2.5x faster.
- Income-minute rewards use the current base production rate including permanent/event modifiers; the temporary video multiplier affects production rather than recursively multiplying video payouts. Exact cash rewards are displayed before opt-in. Boost labels include research duration and remaining stack capacity.
- Final APK was updated on the physical phone without clearing game data. Browser fixtures verified prestige reset and a second-cycle era unlock. API 36 AAB and APK build successfully; AAB is unsigned and uses test ads until publisher configuration is supplied.
