// src/app/shared/utils/video-utils.ts
export function pickBestYoutubeVideo(m: any) {
  const all = (m?.videos?.results ?? []).filter(
    (v: any) => v.site === 'YouTube' && v.key
  );

  if (!all.length) return null;

  const typeRank = (t?: string) => {
    const order = [
      'Trailer',
      'Teaser',
      'Clip',
      'Featurette',
      'Behind the Scenes',
      'Bloopers'
    ];
    const i = order.indexOf(t || '');
    return i === -1 ? 999 : i;
  };
  const langRank = (v: any) =>
    v?.iso_639_1 === 'es' ? 0 : v?.iso_639_1 === 'en' ? 1 : 2;

  const sorted = [...all].sort(
    (a, b) =>
      typeRank(a.type) - typeRank(b.type) ||
      Number(b.official === true) - Number(a.official === true) ||
      (b.size ?? 0) - (a.size ?? 0) ||
      (Date.parse(b.published_at || '0') -
        Date.parse(a.published_at || '0')) ||
      langRank(a) - langRank(b)
  );

  return sorted[0] || null;
}
