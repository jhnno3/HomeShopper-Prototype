// Classifies the raw search-box input into the shape the analysis API
// accepts — currently only a 다방 listing link — or rejects it with a
// user-facing message. Shared by the landing hero and the analyze page so
// both entrances enforce the same contract (PROTOTYPE_API.md §2).
//
// Address input (`inputMode: "address"`) is intentionally disabled for now:
// it requires collecting 거래유형/보증금 alongside the address, which the UI
// doesn't do yet. Re-add an `{ kind: 'address' }` branch when that lands.

export type ListingInput =
  | { kind: 'link'; source: string }
  | { kind: 'invalid'; message: string };

/** Hosts the backend's link resolver accepts (dabangapp.com and subdomains). */
function isDabangHost(host: string) {
  return host === 'dabangapp.com' || host.endsWith('.dabangapp.com');
}

/**
 * Something the user clearly meant as a web link, even without a protocol —
 * "www.dabangapp.com/…" should be accepted, "zigbang.com/…" rejected as an
 * unsupported site rather than as a malformed link.
 */
const BARE_DOMAIN = /^[\w-]+(\.[\w-]+)+(\/|\?|$)/;

export function classifyListingInput(raw: string): ListingInput {
  const source = raw.trim();

  if (!source) {
    return { kind: 'invalid', message: '다방 매물 링크를 입력해주세요.' };
  }

  const looksLikeUrl = /^https?:\/\//i.test(source) || BARE_DOMAIN.test(source);

  if (!looksLikeUrl) {
    return {
      kind: 'invalid',
      message: '지금은 다방(dabangapp.com) 매물 링크만 분석할 수 있어요. 링크를 붙여넣어 주세요.',
    };
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(source) ? source : `https://${source}`);
  } catch {
    return {
      kind: 'invalid',
      message: '링크 형식이 올바르지 않아요. 다방 매물 링크를 다시 확인해주세요.',
    };
  }

  if (!isDabangHost(url.hostname)) {
    return {
      kind: 'invalid',
      message: '지금은 다방(dabangapp.com) 매물 링크만 분석할 수 있어요.',
    };
  }

  // Normalized (protocol always present) so the API receives a fetchable URL.
  return { kind: 'link', source: url.toString() };
}
