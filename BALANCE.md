# Spark Shop balance

Run `npm run sim`. The bot uses the same core functions as the UI, buys the best
affordable marginal payback, hires managers, repairs manually while active,
collects free supply drops and taps faults. It waits for 100 incremental Reputation
(or 50% of existing Reputation) before resetting, so a reset feels useful.

Two separate experiments avoid confusing active minutes with calendar time:
- Active onboarding: two continuous hours; checks first purchase <=5s, manager
  <=180s, zone <=22.5min, worthwhile prestige <=90min and no >10min action stall.
- Seven calendar days: two 5-minute sessions/day, eight-hour offline cap,
  identical purchase strategy. The ad profile accepts every eligible placement
  offered during a session, respecting readiness, unlocks, caps and 30-second gap.

Measured with achievements, research, daily rewards and events enabled: first
purchase 0s; manager 26s; eras unlock at 601s, 1110s, 1250s and 1347s.
First substantial prestige at 2982s (49.7min); next loops 1225s and 1195s
(about 2.4–2.5 times faster than the opening run).
Early resets with only one Reputation are possible, but discouraged
in the UI. Later loops speed up with Reputation and permanent research.

The seven-day test asserts both profiles reach all five eras and every first-era
unlock plus first prestige is at most 2.5x faster with ads. It reports per-day
impressions, lifetime income, ad-derived income share, stalls and income curves.
Acceleration measures time to comparable milestones, not the ratio of exponential
cash balances at unrelated points in reset cycles. These are deterministic model
checks, not observed human retention or revenue. No paid Pro is included.

Initial ads include the income boost and small daily rewards; lucky boxes require
the second era and skips require a prestige. Supply drops arrive after 10 minutes,
and ad/free collection consumes the same drop. Offline production only includes
managed stations. Research is instant, so no speed-up ad is offered.

Tuning: `src/data/balance.ts` controls payback, growth milestones, goals, prestige
divisor and caps. `rewardedPlacements.ts` controls reward minutes, unlocks, daily
caps and cooldowns. Re-run both experiments after any change. Session schedule,
fault engagement and greedy buying assumptions should be validated in closed tests.
