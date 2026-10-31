# Spark Shop: Idle Repair Empire — suggested Play Console answers

Short app name: **Spark Shop**. These are preparation notes, not submitted forms.
The publisher must review the actual final build, SDK versions, enabled mediation,
consent settings, territories and provider dashboards before certifying answers.

| Field | Suggested answer / evidence |
|---|---|
| App/game | Game; simulation / idle workshop management |
| Contains ads | **Yes**, optional rewarded video through AdMob |
| App access | All free gameplay works without login. Pro is optional. No credentials needed. |
| In-app purchases | Yes, one non-consumable `spark_shop_pro` if configured for release |
| Target audience | 13–15, 16–17 and 18+ only if these match actual intended audience; not designed for children |
| Privacy policy | Completed public HTTPS URL, also configured in the app Settings |
| Account creation | No game account; Google Play and billing providers manage store purchase identity |
| Advertising ID | Yes, AD_ID permission merged; used by advertising SDK, not a game identifier |
| News / health / finance | No |

## Data safety starting point

The bundled application has local progress and local analytics. That does **not**
mean the final application collects no data: advertising and billing SDKs send
provider data. Follow the SDK disclosures and your configuration.

| Data type | Handling to review / disclose |
|---|---|
| Device or other IDs | Advertising ID, app set ID and SDK/app customer identifiers; advertising, measurement, fraud prevention, app functionality and purchase validation as applicable |
| Approximate location | Google Mobile Ads may infer it from IP address; game does not request GPS |
| App interactions | Ad views, clicks and related SDK interaction signals; local game event log alone is not transmitted |
| Diagnostics / crash and performance data | Ads and billing SDK diagnostics according to their disclosures; no Firebase crash service is connected |
| Purchase history | Play/RevenueCat transactions and entitlement/restore information for the optional Pro product |
| Age band | Stored locally; under-age flags are passed to ad/consent SDKs. No birthday requested. Review provider classification of flags. |
| Game progress | On-device save and backup; manual text export only; no cloud upload implementation |
| Payment-card details | Not received by the game; store handles payment processing |

For each category review whether it is collected and/or shared, required versus
optional, ephemeral versus retained, and the purposes offered by Play Console.
SDK service-provider exemptions for “sharing” can depend on agreements and usage;
do not simply mark every provider transfer as either shared or exempt. Optional
ad viewing does not necessarily make all SDK initialization/diagnostic data
optional. Confirm encrypted-in-transit practices in current provider documentation.

Deletion: local progress can be reset or removed by clearing app data/uninstalling;
purchase-provider records follow provider retention. Supply a publisher contact and
deletion request process. No game-account deletion flow applies to a game without
account creation, but privacy rights and provider deletion requests still apply.

## Content rating (IARC)

Answer from actual content: electronics repair / economic simulation; no violence,
gore, sexual content, strong language, alcohol/drugs, user-generated content,
chat, user-to-user communication or location sharing. No cash-out, wagering or
real-money gambling. Lucky boxes cost only an optional ad and give disclosed
in-game rewards; accurately answer any questionnaire item about randomized
rewards. Digital purchases and advertising are present. IARC assigns the final
rating; “general audience 13+” is a target, not a guaranteed rating result.

## Permissions justification

- INTERNET / ACCESS_NETWORK_STATE: ad consent, rewarded video and purchase validation.
- AD_ID and AdServices advertising identifiers/attribution/topics: Google Mobile
  Ads infrastructure; review regional consent and Google SDK disclosure.
- POST_NOTIFICATIONS: optional local reminders, requested only after the user opts in.
- VIBRATE: optional repair feedback.
- RECEIVE_BOOT_COMPLETED / WAKE_LOCK: notification/work scheduling SDK infrastructure.
- BILLING: optional Pro purchase and restoration through Play/RevenueCat.
- FOREGROUND_SERVICE / WorkManager service may merge from SDK dependencies;
  the game starts no foreground gameplay service. Review final service declarations
  and any Play Console questions against actual SDK behavior and remove unnecessary
  features only with tested dependency configuration.
- SCHEDULE_EXACT_ALARM is explicitly removed; reminders use inexact scheduling.
- No camera, microphone, contacts, media library, storage or precise-location permission.

References, checked 2026-10-31:
[Google Mobile Ads disclosures](https://developers.google.com/admob/android/privacy/play-data-disclosure),
[AdMob consent integration](https://github.com/capacitor-community/admob/blob/main/docs/consent.md),
[RevenueCat integration](https://www.revenuecat.com/docs/getting-started/installation/capacitor).
