# QR 1개로 리딤 URL 자동 분배 — Vercel + Firebase 버전

## 기능
- QR은 `/claim` 하나만 사용
- 접속자마다 Firestore에 저장된 미사용 리딤 URL 1개를 트랜잭션으로 지급
- 같은 브라우저에서는 같은 지급 URL 재노출
- 관리자 페이지에서 지급/잔여/전체 로그 확인
- 리딤 URL 일괄 업로드 스크립트 포함

## 1. Firebase 준비

1. Firebase Console에서 프로젝트 생성
2. Firestore Database 생성
   - Production mode 권장
   - Location은 가까운 지역 선택
3. 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성
4. 받은 JSON에서 아래 값을 `.env.local` 또는 Vercel Environment Variables에 입력

```bash
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_TOKEN="관리자페이지접속용_아무문자열"
NEXT_PUBLIC_SITE_NAME="VARCO Redeem"
NEXT_PUBLIC_CLAIM_BUTTON_TEXT="리딤 코드 받기"
```

중요: `FIREBASE_PRIVATE_KEY`는 줄바꿈을 `\n` 형태로 넣어야 합니다.

## 2. 로컬 실행

```bash
npm install
npm run dev
```

확인 주소:
- `http://localhost:3000`
- `http://localhost:3000/claim`
- `http://localhost:3000/admin?token=ADMIN_TOKEN값`

## 3. 리딤 URL 넣기

`scripts/redeem-links.csv` 파일에 실제 리딤 URL을 한 줄에 하나씩 넣습니다.

```csv
url
https://example.com/redeem/AAA
https://example.com/redeem/BBB
```

그다음:

```bash
npm run import:codes
```

혹은 admin 페이지에서 한 번에 여러개 입력 가능

## 4. Vercel 배포

1. 이 폴더를 GitHub 저장소에 업로드
2. Vercel에서 New Project → GitHub 저장소 선택
3. Settings → Environment Variables에 아래 추가
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `ADMIN_TOKEN`
   - `NEXT_PUBLIC_SITE_NAME`
   - `NEXT_PUBLIC_CLAIM_BUTTON_TEXT`
4. Deploy

환경변수 변경 후에는 반드시 Redeploy가 필요합니다.

## 5. QR에 넣을 주소

```text
https://너의-vercel-도메인.vercel.app/claim
```

dashboard 페이지에서 사용된 코드, 사용 일시 등 확인 가능

## 6. 운영상 주의

- 같은 브라우저는 쿠키로 기존 지급 URL을 다시 보여줍니다.
- 다른 기기/시크릿 모드는 새 URL을 받을 수 있습니다.
- 진짜 1인 1개가 필요하면 휴대폰 인증, 이메일 인증, 사번/초대코드 인증 같은 식별 절차가 추가로 필요합니다.
- Firestore 트랜잭션으로 동시에 여러 명이 접속해도 같은 URL이 중복 지급되지 않도록 처리했습니다.
