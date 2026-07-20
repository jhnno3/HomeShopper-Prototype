// Classifies the raw search-box input into the two shapes the analysis API
// accepts — a 다방 listing link or a street address — or rejects it with a
// user-facing message. Shared by the landing hero and the analyze page so
// both entrances enforce the same contract (PROTOTYPE_API.md §2).

export type ListingInput =
  | { kind: 'link'; source: string }
  | { kind: 'address'; source: string }
  | { kind: 'invalid'; message: string };

/** Hosts the backend's link resolver accepts (dabangapp.com and subdomains). */
function isDabangHost(host: string) {
  return host === 'dabangapp.com' || host.endsWith('.dabangapp.com');
}

/**
 * Something the user clearly meant as a web link, even without a protocol —
 * "www.zigbang.com/…" or "naver.com/…" must be rejected as an unsupported
 * link, not silently analyzed as an address.
 */
const BARE_DOMAIN = /^[\w-]+(\.[\w-]+)+(\/|\?|$)/;

export function classifyListingInput(raw: string): ListingInput {
  const source = raw.trim();

  if (!source) {
    return { kind: 'invalid', message: '매물 링크나 주소를 입력해주세요.' };
  }

  const looksLikeUrl = /^https?:\/\//i.test(source) || BARE_DOMAIN.test(source);

  if (looksLikeUrl) {
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
        message: '지금은 다방(dabangapp.com) 매물 링크만 분석할 수 있어요. 다른 매물은 주소로 입력해주세요.',
      };
    }
    // Normalized (protocol always present) so the API receives a fetchable URL.
    return { kind: 'link', source: url.toString() };
  }

  // Anything that isn't a link is treated as an address; only obvious junk is
  // rejected — the backend does the real address resolution.
  if (source.length < 5) {
    return {
      kind: 'invalid',
      message: '주소를 조금 더 자세히 입력해주세요. 예: 서울 마포구 연남동 123-4',
    };
  }

  return { kind: 'address', source };
}
