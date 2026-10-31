import { format } from '../core/numbers';
import type { ScreenProps } from './types';
import type { RewardActions } from './Rewards';
import { AdButton } from './Rewards';
import { achievements, loginCycle } from '../data/meta';
import { achievementProgress, claimAchievement, claimLogin, claimMission, dailyMissions, loginReady, missionProgress, missionReady } from '../core/meta';
import { income } from '../core/economy';
export function Goals(props: ScreenProps & { actions: RewardActions }) {
  const { s, t, act } = props;
  return <section class="page"><h2>{t('nav.missions')}</h2>
    <article class="panel"><h3>{t('login')}</h3><p>{t('login.note')}</p><div class="login-days">{loginCycle.map((m, i) => <span class={s.loginStreak === i ? 'current' : ''}>{i + 1}<br/>{m}{t('minutes')}</span>)}</div>
      <button class="full" disabled={!loginReady(s)} onClick={() => act(() => claimLogin(s))}>{t(loginReady(s) ? 'claim' : 'claimed')} · {format(income(s).mul(loginCycle[s.loginStreak] * 60))}</button>
      <AdButton {...props} id="login" context={{ ready: loginReady(s), minutes: loginCycle[s.loginStreak] * 2 }}/>
    </article>
    <article class="panel"><h3>{t('mission')}</h3>{dailyMissions(s).map((m, slot) => <div class="achievement-row"><div><h3>{t(m.key)}</h3><p>{format(Math.min(m.goal, missionProgress(s, slot)))} / {m.goal} · {m.minutes} {t('minutes')}</p><button disabled={!missionReady(s, slot)} onClick={() => act(() => claimMission(s, slot))}>{t(s.missionClaims.includes(slot) ? 'claimed' : 'claim')} · {format(income(s).mul(m.minutes * 60))}</button><AdButton {...props} id="mission" context={{ claim: slot, ready: missionReady(s, slot), minutes: m.minutes * 2 }}/></div><span class="amber">◇</span></div>)}</article>
    <article class="panel"><h3>{t('achievement')} · {s.achievements.length}/50</h3>{achievements.map(a => <div class="achievement-row"><div><h3>{t(a.key)} {a.rank}</h3><p>{format(Math.min(a.goal, achievementProgress(s, a.id)))} / {format(a.goal)} · ✧{a.badges}</p></div><button disabled={s.achievements.includes(a.id) || achievementProgress(s, a.id) < a.goal} onClick={() => act(() => claimAchievement(s, a.id))}>{t(s.achievements.includes(a.id) ? 'claimed' : 'claim')}</button></div>)}</article>
  </section>;
}
