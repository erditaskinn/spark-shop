# Spark Shop closed-testing plan

For personal developer accounts created after **13 November 2023**, Google Play
requires a closed test with **at least 12 testers opted in continuously for the
preceding 14 days** before applying for production access. At least 12 must still
be opted in when applying. Organization accounts are exempt from this particular
new-personal-account gate; they still need appropriate testing and compliance.
Meeting the minimum allows an application for production access, not automatic approval.

Source checked 2026-10-31:
[Google Play personal-account testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).

## Execute

1. Start with internal testing and a signed AAB. Fix startup, consent, purchase,
   save and pre-launch report failures first. Do not distribute a production-key
   build to unregistered ad-test devices for ad-click testing.
2. Recruit 15–20 relevant adult testers so ordinary dropouts do not drop the group
   below 12. Keep the target-audience and privacy declarations accurate.
3. Create a closed track, configure the email list/group in Play Console, upload
   the reviewed build and distribute its actual opt-in link. Have testers join
   with the same Google account they use on Play. Record opt-in dates; retain
   continuous participation for at least 14 full days.
4. Ask testers to actually play. Google asks about engagement, feedback and fixes
   when reviewing production-access applications. It publishes no universal
   requirement that every tester must open the game every day; do not invent one.
   Aim for normal 3–5 minute check-ins, a longer onboarding session if willing,
   a return after several hours and a return on another day.
5. Collect practical feedback, fix defects, release a new version to the same track
   and record retest results. Track actual opt-in continuity in Play Console.
6. After eligibility appears, apply from the dashboard with honest details about
   testers, engagement, reported problems, changes and production readiness. If more
   testing is requested, follow the dashboard's instructions and keep testing.

## Recruitment message (send manually)

“I’m testing Spark Shop: Idle Repair Empire, an Android repair-shop idle game in
English and Turkish. Could you opt in through [CLOSED TEST LINK], keep your opt-in
active for at least 14 continuous days, and try a few short sessions? Please repair
a station, hire a manager, return after an offline gap and tell me where anything
feels confusing or slow. Optional videos and the Pro purchase are never required.
Use only configured test ads/test purchases. Please do not click live ads to help
me. Send feedback to [TEST FEEDBACK CONTACT]. Thank you!”

## Coverage and log

Use an anonymized tester code rather than publishing personal emails in the repo.
Keep invitations, email lists and feedback containing personal data in your own
controlled workspace, not public Git history.

| Date/build | Tester code/device/API | Scenario | Expected/actual | Severity | Fix/build | Retest |
|---|---|---|---|---|---|---|
| [fill] | [fill] | [fill] | [fill] | [fill] | [fill] | [fill] |

Cover fresh tutorial, English/Turkish, small screen and font scaling, no-network
play, consent/refusal/privacy form, voluntary test videos, cancellation, one reward
per completed video, cooldowns, background/lock/resume, 8h cap, backup/import,
missions/login rollover, research, first era/prestige, Pro purchase/restore/refund,
notification opt-in/off and Android 16 back/edge-to-edge. Measure pacing separately
from clock time between sessions. Track crashes/ANRs and save failures, not just
the number of installations. Use feedback to update BALANCE.md and release QA.
