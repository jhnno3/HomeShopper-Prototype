# API 연동 현황 / Integration Status

> 백엔드: `https://43.201.30.153` · prefix `/api/v1`
> 최종 점검: 2026-07-22
> 참고 문서: `FRONTEND_INTEGRATION.md`, `PROTOTYPE_API.md`

프론트 로컬 개발(`localhost:3000`)에서는 백엔드 CORS가 Vercel origin
(`https://home-shopper-pretotype.vercel.app`)만 허용하므로 실제 API 호출을
브라우저에서 검증할 수 없다. 로컬에서는 모든 호출이 CORS로 실패하며, 각 화면은
오류 UI로 정상적으로 폴백된다(검증 완료). 실제 성공 경로 검증은 Vercel 배포
또는 백엔드의 localhost 허용이 필요하다.

---

## ✅ 연동 완료 (Done)

| 엔드포인트 | 위치 | 비고 |
|---|---|---|
| `POST /analyses` | `app/analyze/page.tsx` | 검색창 → 분석. curl로 도달 확인 |
| `GET /reports/{id}` | `app/report/[id]/page.tsx` | 로딩/없음/오류 상태 처리 |
| `POST /reservations` | `components/reserve/ReserveForm.tsx` | 카카오 로그인 후 제출 |
| `POST /reports/{id}/premium-requests` | `components/report/UpgradeCard.tsx` | 동·호수 30자 제한 추가 |
| 카카오 OAuth 시작 | `lib/oauth.ts` | 전체 페이지 리다이렉트 |
| `POST /analytics/events` | `lib/analytics.ts` | fire-and-forget, 204 확인 |
| `GET /admin/premium-requests` | `app/admin/premium-requests/page.tsx` | 관리자 조회(뷰 전용) |
| `GET /admin/reservations` | `app/admin/reservations/page.tsx` | 관리자 조회(뷰 전용) |

API base URL은 `.env.local`의 `NEXT_PUBLIC_API_BASE_URL`로 주입한다.
(`.env.local`은 gitignore 대상 — 커밋되지 않음)

---

## ⚠️ 문제 / 확인 필요 (Problems / To Confirm)

1. **없는 리포트가 `400`을 반환** (문서는 `404`라고 명시)
   `GET /reports/999999` → `400 "리포트를 찾을 수 없습니다"`.
   프론트는 `400`과 `404`를 모두 "없음"으로 처리하도록 대응함.
   → 백엔드에 의도된 동작인지 확인 필요.

2. **숫자가 아닌 리포트 ID는 `500`을 반환**
   `GET /reports/abc` → `500 서버 내부 오류`. "없음"이 아니라 서버 오류.
   실제 ID는 숫자라 영향은 작지만, 입력 검증이 없다는 신호.

3. **실제 리포트 데이터로 성공 경로 검증 불가**
   `GET /reports/1`조차 `400`(없음). 현재 백엔드 DB에 리포트가 없음.
   → 실제 다방 매물로 분석을 1건 생성해야 리포트 화면 렌더를 확인 가능.

4. **CORS가 localhost 미허용** — Vercel origin만 허용.
   로컬에서 실제 API 성공 경로 테스트 불가. 배포 또는 백엔드 허용 필요.

5. **OAuth 복귀는 Vercel 프론트로만** — 백엔드가 로그인 후 리다이렉트 host를
   Vercel URL로 고정. 카카오 로그인은 localhost에서 완료 불가.

6. **TLS 인증서 만료: 2026-07-27** — IP용 단기 인증서, 자동 갱신 없음.
   만료 시 모든 API 호출과 카카오 로그인이 중단됨.

7. **백엔드 IP가 Elastic IP 아님** — EC2 재시작 시 공인 IP 변경.
   변경되면 `NEXT_PUBLIC_API_BASE_URL` + TLS 인증서 + 카카오 Redirect URI 모두 수정 필요.

8. **분석 이벤트 조회(로그) API가 없음**
   `POST /analytics/events`(쓰기)만 존재. "user clicks / user visited" 같은
   이벤트 스트림을 **읽는** GET 엔드포인트는 문서에도 없고, 추정 경로
   (`/admin/analytics`, `/admin/logs`, `/analytics/events`)는 모두 `500`.
   → 관리자 "로그" 화면은 조회 가능한 유일한 사용자 활동 데이터인
   **예약(reservations)** 기준으로 구성함. 실제 클릭/방문 이벤트 로그가
   필요하면 백엔드에 조회 API 신설 요청 필요.

9. **관리자 API는 AGENT 권한 필요 — 응답 데이터 형태 미검증**
   `GET /admin/premium-requests`, `GET /admin/reservations` 모두 비로그인 시
   `401 "로그인이 필요합니다"`. AGENT 계정 세션이 없어 실제 `items` 형태를
   확인하지 못함. 문서상 `{ items: [], total: 0 }` + 개별 항목은
   예약/정밀신청 응답 형태로 추정해 구현함. AGENT 로그인으로 실제 형태 확인 필요.

10. **예약 `reportId` 타입** (경미) — 문서 예시는 숫자(`7`), 프론트는 URL
    파라미터 문자열을 전송. 백엔드 coercion에 의존. 확인 권장.

11. **프로덕션 환경변수 필수** — `.env.local`은 커밋 안 됨.
    Vercel 프로젝트에 `NEXT_PUBLIC_API_BASE_URL=https://43.201.30.153`를
    설정하지 않으면 `localhost:8080`로 폴백되어 전부 실패.

---

## 📋 해야 할 일 (To Do)

- [ ] Vercel 프로젝트 환경변수 `NEXT_PUBLIC_API_BASE_URL` 설정 (**배포 필수**)
- [ ] Vercel 배포 후 전체 플로우 E2E 검증 (분석/리포트/예약/정밀신청)
- [ ] 실제 리포트 ID 확보 후 리포트 화면 성공 렌더 확인
- [ ] AGENT 계정으로 관리자 화면 실제 데이터 형태 확인
- [ ] 백엔드에 문제 1(400 vs 404), 8(로그 조회 API), 10(reportId 타입) 확인
- [ ] TLS 인증서 2026-07-27 이전 갱신
- [ ] (보류) 공유(share) · 대기신청(waitlist) 연동 — 현재 의도적으로 미연동

---

## 🔎 관리자 화면 (Admin)

뷰 전용(조회만, 쓰기/발행 없음). 두 화면 모두 비로그인 시 카카오 로그인 유도.

- `/admin` — 허브, 두 링크 버튼
- `/admin/premium-requests` — `GET /admin/premium-requests`
- `/admin/reservations` — `GET /admin/reservations` ("예약/방문 로그")

> 관리자 "로그"는 문제 8로 인해 분석 이벤트가 아닌 **예약 데이터** 기준.
