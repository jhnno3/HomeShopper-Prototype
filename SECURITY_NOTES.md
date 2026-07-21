# 실패 지점 · 하이재킹 가능 지점 점검 / Failure & Hijack Points

> 목적: "이렇게 하면 실패할 수 있다"를 발견할 때마다 여기 기록한다. 코드 리뷰나
> 새 기능 추가 시 체크리스트로 재사용한다. 발견 즉시 고친 것도 재발 방지를
> 위해 남겨둔다("고쳤으니 삭제"하지 않는다).
> 최종 갱신: 2026-07-22

---

## ✅ 발견 후 수정 완료 (Found & Fixed)

### 1. API 응답에 필드가 없으면 URL에 문자 그대로 "undefined"가 새겨짐

**증상**: `POST /reservations`가 `201`로 성공했지만 응답에 `queueNumber`가
없으면(백엔드 버그, 필드명 변경 등), 다음 코드가:

```js
router.replace(`/reserve?done=1&queue=${response.queueNumber}&region=...`)
```

`response.queueNumber`가 `undefined`일 때 템플릿 리터럴이 문자열
`"undefined"`를 그대로 URL에 박아넣는다. 화면은 존재하지 않는 매개변수가
아니라 **진짜 값처럼 보이는 "예약 순번 #undefined"**를 표시한다 — 사용자
예약은 실제로 성공했는데 화면은 고장난 것처럼 보인다.

**교훈**: `?? fallback` 같은 방어 코드는 매개변수가 **아예 없을 때만** 걸린다.
값이 있지만 잘못된 경우(빈 문자열, `"undefined"`, `"null"` 등)는 걸러내지
못한다. 응답 필드를 그대로 URL에 꽂기 전에 반드시 존재 여부를 확인해야 한다.

**수정**: 값이 있을 때만 쿼리 파라미터를 추가하도록 변경.
`components/reserve/ReserveForm.tsx`, `components/report/UpgradeCard.tsx`.

**재발 방지 패턴**: API 응답 필드를 URL/쿼리에 넣을 때는 항상
`value != null ? \`&key=${value}\` : ''` 형태로 조건부로 추가한다.

---

### 2. 라우트 파라미터를 이스케이프 없이 API 경로에 그대로 삽입 → 다른 엔드포인트로 요청이 새어나감

**증상**: `app/report/[id]/page.tsx`가

```js
apiFetch<ApiReport>(`/reports/${id}`)
```

형태로 `id`를 그대로 경로에 넣고 있었다. Next.js는 동적 라우트 파라미터를
이미 URL-디코딩해서 넘겨주므로, 다음과 같은 링크를 방문하면:

```text
/report/7%2F..%2F..%2Fadmin%2Fpremium-requests
```

`id`가 `"7/../../admin/premium-requests"`가 되고, 이스케이프 없이 경로에
꽂히면 `URL` 정규화 규칙에 의해 실제 요청 경로가

```text
/api/v1/admin/premium-requests
```

로 **완전히 다른 엔드포인트로 붕괴**한다. 직접 재현해서 확인함:

```js
new URL(`${base}/reports/${malicious}`).pathname
// -> "/api/v1/admin/premium-requests"
```

모든 요청이 `credentials: 'include'`를 쓰기 때문에, 이 요청은 **피해자
본인의 세션 쿠키**로 전송된다 — 즉 악의적인 링크 하나로 피해자의 브라우저가
피해자 자신의 권한으로 의도하지 않은 엔드포인트를 호출하게 만들 수 있는
경로 주입(path injection) 문제였다.

**수정**: `encodeURIComponent(id)` / `encodeURIComponent(reportId)`로 감싸서
경로 구분자가 하나의 불투명한 세그먼트로만 취급되게 함.
`app/report/[id]/page.tsx`, `components/report/UpgradeCard.tsx`.

**재발 방지 패턴**: URL 경로 템플릿에 라우트 파라미터나 사용자 제어 문자열을
넣을 때는 예외 없이 `encodeURIComponent`를 적용한다. "숫자만 올 것"이라는
가정에 의존하지 않는다 — 프론트가 그 가정을 강제하지 않으면 값은 임의
문자열일 수 있다.

---

## 🛡️ 의도적으로 안전하게 설계된 부분 (Verified Safe — don't "fix" these)

아래는 겉보기에 취약해 보일 수 있지만, 확인 결과 안전한 설계다. 나중에
누군가 "이거 위험한데?"라고 생각하지 않도록 이유를 남긴다.

- **`oauth=success`를 URL에서 그냥 읽어서 신뢰하는 것처럼 보임.**
  실제로는 `sessionStorage`에 저장된 값이 있어야만 제출이 진행된다.
  `sessionStorage`는 동일 출처(origin) + 동일 브라우저 세션에서만 쓰기 가능
  하므로, 공격자가 피해자 몰래 `?oauth=success` 링크를 보내도 `takePending()`이
  `null`을 반환해 "입력한 정보를 찾을 수 없어요" 오류만 뜬다. 실제 API
  호출(`POST /reservations` 등)로 이어지지 않는다.

- **`POST /reservations`, `POST /analytics/events`가 로그인 없이도 호출
  가능한 공개 엔드포인트라 CSRF(사이트 간 요청 위조)에 취약해 보임.**
  `Content-Type: application/json`을 쓰는 요청은 "simple request"가 아니라서
  브라우저가 먼저 CORS preflight(`OPTIONS`)를 보내고, 백엔드가 허용한
  origin(`https://home-shopper-pretotype.vercel.app`)이 아니면 브라우저가
  요청 자체를 막는다. 순수 HTML `<form>` 태그로 시도하는 고전적 CSRF는
  `Content-Type`을 JSON으로 지정할 수 없어 이 보호를 우회하지 못한다.

- **`/report/[id]`가 존재하지 않는 리포트로 접근해도 `UpgradeCard`(정밀
  리포트 신청)가 렌더링되지 않을까 봐 걱정될 수 있음.**
  리포트 조회 상태가 `ready`일 때만 `UpgradeCard`가 렌더링되므로, 존재하지
  않는 `reportId`로는 애초에 신청 버튼 자체가 뜨지 않는다.

- **카카오 로그인 복귀 경로(`redirect` 파라미터) 위조 가능성.**
  프론트는 항상 `window.location.pathname + window.location.search`(현재
  페이지 자기 자신)만 넘긴다. 백엔드가 상대 경로만 허용하고 절대
  URL·프로토콜 상대 URL을 거부하도록 검증하는 것으로 문서화되어 있음
  (`FRONTEND_INTEGRATION.md`). 이 검증은 백엔드 책임이며, 프론트는 값을
  조작할 수 있는 입력을 넘기지 않는다.

---

## ⚠️ 아직 열려 있는 위험 / 확인 필요 (Open Risks)

### 배포·설정 관련 (가장 치명적 — 배포 전 확인 필수)

1. **`NEXT_PUBLIC_API_BASE_URL`을 Vercel에 설정하지 않으면 전체 기능 마비.**
   코드 기본값은 `http://localhost:8080`이다. 프로덕션에 이 환경변수를
   설정하지 않으면 실제 방문자의 브라우저가 자기 자신의 로컬호스트로 요청을
   보내게 되어, 검색·리포트·예약·정밀신청·로그인 **전부** 조용히 실패한다.
   해킹은 아니지만 배포 시 가장 먼저 확인해야 할 항목.

2. **TLS 인증서 만료: 2026-07-27.** IP용 단기 인증서, 자동 갱신 없음.
   만료 즉시 모든 API 호출과 카카오 로그인이 전면 중단된다.

3. **백엔드 IP가 Elastic IP가 아님.** EC2 재시작 시 IP가 바뀌면
   `NEXT_PUBLIC_API_BASE_URL`, TLS 인증서, 카카오 Redirect URI를 모두 함께
   갱신해야 한다. 하나라도 놓치면 로그인/API가 끊긴다.

4. **로컬 개발(`localhost:3000`)에서 CORS가 막혀 있음.** 실제 API 성공
   경로는 로컬에서 검증 불가 — Vercel 배포본에서만 실제 확인 가능
   (`API_INTEGRATION_STATUS.md` 참고).

### 코드 설계상 유의점

5. **클라이언트 검증은 참고용일 뿐, 보안 경계가 아니다.** 다방 링크
   호스트 제한(`classifyListingInput`), 전화번호 9~11자리, 동·호수 30자
   제한 등은 전부 프론트에서만 걸려 있다. 개발자 도구로 우회한 원본 요청이
   백엔드에 그대로 도달할 수 있으므로, 같은 검증이 백엔드에도 반드시
   있어야 한다(문서상 있는 것으로 보이나, 프론트가 이를 보장하지는 않음).

6. **`sessionStorage`에 개인정보가 잠깐 평문으로 남는다.** 예약자
   이름·전화번호·희망지역, 정밀신청 동·호수가 카카오 로그인 왕복 동안
   `sessionStorage`에 저장된다. 탭을 닫으면 사라지고 동일 출처에서만 읽을 수
   있어 위험도는 낮지만, 사용자가 로그인 도중 이탈하면 그 데이터가 탭이
   열려 있는 동안은 남아 있다.

7. **분석 이벤트(`trackEvent`)가 세션 쿠키를 포함해 전송된다.**
   `credentials: 'include'`로 보내므로, 백엔드가 익명 이벤트를 로그인 세션과
   연결할 수 있다는 의미다. 의도된 것으로 보이나(사용자별 퍼널 분석),
   개인정보 처리 관점에서 인지하고 있어야 한다.

8. **관리자 목록 응답 형태가 실제로 검증되지 않음.** `AGENT` 로그인 세션이
   없어 `/admin/premium-requests`, `/admin/reservations`가 실제로 어떤 JSON
   모양을 반환하는지 확인 못 했다. 문서 추정치로 구현되어 있어, 실제 필드명이
   다르면 관리자 화면이 빈 값 또는 오류로 보일 수 있다.

---

## 🔁 앞으로 코드 추가할 때 다시 확인할 체크리스트

- [ ] API 응답 필드를 URL에 넣기 전에 `!= null` 확인했는가?
- [ ] 사용자/라우트 제어 문자열을 경로 템플릿에 넣을 때 `encodeURIComponent`를
      썼는가?
- [ ] 새 POST/PATCH 엔드포인트가 JSON `Content-Type`을 강제하는가(CSRF
      preflight 보호를 계속 받으려면 필수)?
- [ ] `credentials: 'include'`를 쓰는 새 호출이 정말 쿠키가 필요한가, 아니면
      불필요하게 세션을 노출하는가?
- [ ] 새로 추가한 화면이 백엔드가 검증한다고 "가정"하는 값을 프론트에서도
      실제로 검증하는가, 아니면 표시만 하고 넘기는가?
