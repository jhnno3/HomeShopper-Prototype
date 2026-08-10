import { describe, it, expect } from 'vitest';
import { classifyListingInput } from '@/lib/listing-input';

describe('classifyListingInput', () => {
  it('rejects empty input', () => {
    expect(classifyListingInput('   ')).toEqual({
      kind: 'invalid',
      message: '다방 매물 링크를 입력해주세요.',
    });
  });

  it('rejects input that is not URL-shaped', () => {
    const result = classifyListingInput('서울특별시 강남구 테헤란로 123');
    expect(result).toEqual({
      kind: 'invalid',
      message: '지금은 다방(dabangapp.com) 매물 링크만 분석할 수 있어요. 링크를 붙여넣어 주세요.',
    });
  });

  it('rejects a non-다방 host', () => {
    expect(classifyListingInput('https://zigbang.com/items/1')).toEqual({
      kind: 'invalid',
      message: '지금은 다방(dabangapp.com) 매물 링크만 분석할 수 있어요.',
    });
  });

  it('accepts a 다방 link and returns it normalized', () => {
    expect(classifyListingInput('https://www.dabangapp.com/room/123')).toEqual({
      kind: 'link',
      source: 'https://www.dabangapp.com/room/123',
    });
  });

  it('accepts a protocol-less 다방 link by adding https', () => {
    const result = classifyListingInput('www.dabangapp.com/room/123');
    expect(result.kind).toBe('link');
    expect(result.kind === 'link' && result.source).toBe('https://www.dabangapp.com/room/123');
  });

  it('accepts the apex domain', () => {
    expect(classifyListingInput('https://dabangapp.com/room/9').kind).toBe('link');
  });

  it('trims surrounding whitespace before classifying', () => {
    expect(classifyListingInput('  https://dabangapp.com/room/9  ').kind).toBe('link');
  });
});
