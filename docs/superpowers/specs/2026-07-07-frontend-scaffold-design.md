# HomeShopper 프리토타입 — 프론트엔드 레이아웃 스캐폴드 설계

## 배경

원본 명세서(`홈쇼퍼_프리토타이핑_개발명세서.pdf`)는 서류 선검증 → 동행 임장 사전예약 스모크 테스트를
위한 전체 제품(랜딩, 분석 파이프라인, 리포트, 인증, 예약, 어드민, 애널리틱스)을 정의한다.

이번 작업의 범위는 그 전체 중 **프론트엔드 레이아웃만**이다. 백엔드(공공 API 연동, 규칙 엔진,
Supabase, Kakao/Naver OAuth, GA4)는 다른 팀원이 이후에 별도로 개발한다. 이 문서는 그 접합부를
깨끗하게 남겨두는 것을 목표로 한다 — 프론트엔드가 지금 당장 동작하는 데모여야 하고, 백엔드가
붙을 때 컴포넌트 코드를 건드리지 않아도 되어야 한다.

## 목표

- 명세서 3장의 모든 페이지를 정적 레이아웃 + 더미 데이터로 구현
- 실제 네트워크 호출·DB·인증 없음 — 폼 제출, 스텝 전환, 애니메이션 등 클라이언트 상태만으로 동작
- 데이터 경계(리포트, 제출, 예약, 프리미엄 요청)를 TypeScript 타입으로 명시해 이후 백엔드 연결 지점을 표시
- GA4 이벤트 훅을 no-op/console.log 함수로 미리 배치 (측정 ID 없이도 컴포넌트에 이벤트 호출부가 이미 존재)

## 범위 밖 (다른 담당자가 이후 작업)

- 공공 API(국토부 실거래가, 건축물대장, 국가공간정보포털) 연동 및 규칙 엔진
- Supabase 프로젝트, DB 스키마 실제 연결
- Kakao/Naver OAuth
- 실제 GA4 측정 ID 연결
- `/admin` 실제 데이터 처리 로직

## 기술 스택

Next.js 14 (App Router) · TypeScript · Tailwind CSS · lucide-react · `motion`(Framer Motion 후속,
`/analyze` 진행 애니메이션·페이지 전환 등에 사용). 인증/DB 라이브러리는 설치하지 않음.

## 페이지 구성

| 라우트 | 내용 |
|---|---|
| `/` | 히어로(링크/주소 입력 토글) · How it works 3스텝 · 블러 샘플 리포트 · 신뢰 섹션 · FAQ · 임장 배너 |
| `/analyze` | Step1(링크/주소) → Step2(거래유형/보증금) → 진행 애니메이션(체크리스트 스타일) → 리포트로 이동 |
| `/report/[id]` | 매물 요약, 사실 확인 표, 룰 기반 우려 항목(더미), 업그레이드 카드, 임장 CTA, 면책 고지, 공유 버튼 |
| `/report/[id]/premium` | 베이직 전체 + 등기부 섹션(더미), 하단 임장 CTA |
| `/reserve` | 이름/전화번호/희망지역/희망시기 폼, 완료 화면(예약 순번 + 카카오 채널 버튼 모형) |
| `/admin` | 프리미엄 요청 큐 테이블(더미 데이터), JSON 입력 폼(제출 시 로컬 상태만 갱신) |

각 페이지는 명세서의 실제 카피 톤을 반영한 더미 콘텐츠로 채워 데모 가능한 상태로 만든다.

## 데이터 계약

`lib/types.ts` — 명세서 5장 기반 타입 정의:

```ts
type Submission = { id, createdAt, sourceUrl?, addressNorm, region, dealType, deposit?, reportId }
type Report = { id, submissionId, tier: 'basic' | 'premium', facts, concerns, apiStatus, shareCount, viewedAt? }
type PremiumRequest = { id, reportId, userId, provider: 'kakao' | 'naver', status, requestedAt, sentAt? }
type Reservation = { id, createdAt, reportId?, userId?, name, phone, region, visitTiming, src }
```

`lib/mock-data.ts` — 각 타입의 샘플 픽스처. 최소 3가지 리포트 상태 포함:
정상 케이스, 일부 API 실패 케이스(§4.4), 고위험 우려 항목 케이스.

컴포넌트는 이 타입을 props로 받는다. 백엔드 연결 시 목업 fixture 호출을 실제 fetch/DB 조회로
교체하기만 하면 되고, 컴포넌트 내부는 변경할 필요가 없다.

## 애널리틱스 훅

`lib/analytics.ts`에 `trackEvent(name, payload)` 함수를 두고 지금은 `console.log`만 수행한다.
명세서 5장의 이벤트 이름(`analyze_start`, `analyze_complete`, `report_view`, `premium_cta_click`,
`login_complete`, `premium_sent`, `premium_view`, `visit_cta_click`, `reserve_phone_complete`)을
각 페이지의 해당 인터랙션 지점에 호출부로 미리 배치한다. 이후 GA4 측정 ID가 생기면 이 함수 내부만
`gtag()` 호출로 교체한다.

## 인증/제출 흐름의 프론트엔드 표현

- 카카오/네이버 로그인 버튼은 클릭 시 로컬 상태만 전환(예: 이름 입력 모달 → "로그인 완료" 표시)하는
  자리표시자로 구현. 실제 OAuth 리다이렉트 없음.
- `/analyze` 제출은 mock-data의 고정 리포트로 라우팅(예: `/report/demo-1`)하는 것으로 시뮬레이션.
- `/reserve` 제출은 로컬 상태에 저장 후 완료 화면 표시, 실제 저장소 없음.

## 개발 순서

1. Next.js 프로젝트 초기화 + Tailwind/lucide-react 설정
2. `lib/types.ts`, `lib/mock-data.ts`, `lib/analytics.ts` 작성
3. 랜딩(`/`) 레이아웃
4. `/analyze` 2스텝 폼 + 진행 애니메이션
5. `/report/[id]` 베이직 리포트
6. `/report/[id]/premium` 정밀 리포트
7. `/reserve` 폼 + 완료 화면
8. `/admin` 큐 뷰

## 테스트 관점

프론트엔드 전용 스캐폴드이므로 단위 테스트보다 시각적 확인이 우선이다. 각 페이지를 브라우저에서
직접 열어 폼 전환, 반응형 레이아웃, 더미 데이터 렌더링을 확인한다.
