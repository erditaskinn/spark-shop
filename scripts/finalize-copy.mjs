import { readFileSync, writeFileSync } from 'node:fs';
for (const lang of ['en', 'tr']) {
  const path = `src/i18n/${lang}.json`, data = JSON.parse(readFileSync(path, 'utf8'));
  data['prestige.worth'] = lang === 'en' ? 'A strong fresh start. 100 new Reputation adds +200% to your permanent income bonus.' : 'Sağlam bir yeni başlangıç. 100 yeni İtibar, kalıcı kazanç bonusuna +%200 ekler.';
  data['prestige.wait'] = lang === 'en' ? 'Build your name a little longer. Wait for at least 100 new Reputation for a stronger reset.' : 'Adını biraz daha duyur. Daha güçlü bir başlangıç için en az 100 yeni İtibar bekle.';
  data['achievement.5'] = lang === 'en' ? 'Fresh-start craftsperson' : 'Yeni başlangıç ustası';
  data['ad.boostDuration'] = lang === 'en' ? 'Video: +{duration} ×2 income' : 'Video: +{duration} ×2 kazanç';
  for (let i = 0; i < 30; i++) data[`manager.${i}`] = `${data[`station.${i}`]} ${lang === 'en' ? 'manager' : 'ustası'}`;
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}
