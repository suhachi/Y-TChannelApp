# 🚀 카페24 서브도메인 배포 가이드

**대상**: YouTube 채널 컨설턴트 웹 앱  
**도메인**: 카페24 보유 도메인의 서브도메인 활용  
**배포 플랫폼**: Vercel (권장) 또는 Netlify

---

## 📋 배포 시나리오

### 예시:
```
기본 도메인: example.com (카페24)
서브도메인: yt.example.com (YouTube 컨설팅 앱)
```

또는
```
기본 도메인: mycompany.co.kr (카페24)
서브도메인: youtube.mycompany.co.kr
            또는
            ytconsult.mycompany.co.kr
            또는
            analytics.mycompany.co.kr
```

---

## 🎯 배포 방법 (3단계)

### 1️⃣ **Vercel에 앱 배포**
### 2️⃣ **카페24에서 서브도메인 설정**
### 3️⃣ **Vercel에서 도메인 연결**

---

## 📦 Step 1: Vercel에 배포

### 1-1. GitHub 리포지토리 준비

현재 프로젝트를 GitHub에 푸시합니다:

```bash
# Git 초기화 (아직 안 했다면)
git init

# .gitignore 생성
cat > .gitignore << EOF
node_modules
dist
.env
.env.local
.vercel
EOF

# 커밋
git add .
git commit -m "Initial commit: YouTube Channel Consultant App"

# GitHub 리포지토리 생성 후
git remote add origin https://github.com/YOUR_USERNAME/yt-consultant.git
git branch -M main
git push -u origin main
```

---

### 1-2. Vercel 배포

#### 방법 A: Vercel CLI (빠름)

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 B: Vercel 웹사이트 (추천)

1. **https://vercel.com** 접속
2. **"Import Project"** 클릭
3. **GitHub 연결** 후 리포지토리 선택
4. **프로젝트 설정**:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
5. **Deploy** 클릭

**결과**: `https://your-project.vercel.app` 생성됨

---

### 1-3. Vercel 프로젝트 설정 확인

`vercel.json` 파일을 프로젝트 루트에 생성:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**이유**: React Router(Wouter) SPA를 위한 리라이트 설정

---

## 🌐 Step 2: 카페24에서 서브도메인 설정

### 2-1. 카페24 관리자 페이지 접속

1. **https://www.cafe24.com** 로그인
2. **"나의 서비스 관리"** → **"도메인 관리"** 클릭
3. 사용할 도메인 선택 (예: `example.com`)

---

### 2-2. DNS 레코드 추가

#### 옵션 A: CNAME 레코드 (권장)

카페24 DNS 관리 페이지에서:

| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| CNAME | `yt` | `cname.vercel-dns.com` | 3600 |

**결과**: `yt.example.com` → Vercel 앱

#### 옵션 B: A 레코드

| 타입 | 호스트 | 값 | TTL |
|------|--------|-----|-----|
| A | `yt` | `76.76.21.21` | 3600 |

**Vercel IP 주소**:
- `76.76.21.21`

**주의**: Vercel은 CNAME 방식 권장 (IP 변경 가능성)

---

### 2-3. 카페24 DNS 설정 화면 예시

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
도메인: example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
레코드 타입: CNAME
호스트명: yt
값/내용: cname.vercel-dns.com
TTL: 3600 (1시간)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[저장] 버튼 클릭
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 2-4. DNS 전파 대기

**소요 시간**: 5분 ~ 48시간 (보통 1시간 이내)

**확인 방법**:
```bash
# DNS 조회 (Mac/Linux)
nslookup yt.example.com

# 또는
dig yt.example.com

# Windows
nslookup yt.example.com
```

**정상 응답 예시**:
```
yt.example.com
canonical name = cname.vercel-dns.com
```

---

## ⚙️ Step 3: Vercel에서 커스텀 도메인 연결

### 3-1. Vercel 대시보드 접속

1. **https://vercel.com/dashboard** 로그인
2. 배포한 프로젝트 선택
3. **"Settings"** 탭 클릭
4. **"Domains"** 메뉴 선택

---

### 3-2. 도메인 추가

1. **"Add Domain"** 클릭
2. 서브도메인 입력:
   ```
   yt.example.com
   ```
3. **"Add"** 버튼 클릭

---

### 3-3. DNS 확인

Vercel이 DNS 레코드를 자동으로 확인합니다:

```
✅ DNS Configuration
   CNAME: yt.example.com → cname.vercel-dns.com
   
✅ SSL Certificate
   Issuing SSL certificate...
   (1-2분 소요)
   
✅ Domain Ready
   https://yt.example.com is live!
```

---

### 3-4. SSL 인증서 자동 발급

Vercel이 **Let's Encrypt SSL 인증서**를 자동으로 발급합니다.

**결과**:
- ✅ `http://yt.example.com` → `https://yt.example.com` (자동 리다이렉트)
- ✅ 무료 SSL 인증서
- ✅ 자동 갱신

---

## 🎉 배포 완료!

### 최종 확인:

```bash
# 1. DNS 확인
nslookup yt.example.com

# 2. 접속 테스트
curl -I https://yt.example.com

# 3. SSL 확인
curl -vI https://yt.example.com 2>&1 | grep -i ssl
```

### 접속:
```
https://yt.example.com
```

**예상 시간**:
- Vercel 배포: 5분
- DNS 설정: 2분
- DNS 전파: 5-60분
- **총 소요**: 15-70분

---

## 🔧 문제 해결

### ❌ 문제 1: DNS가 전파되지 않음

**증상**:
```
nslookup yt.example.com
Server can't find yt.example.com: NXDOMAIN
```

**해결**:
1. 카페24 DNS 설정 재확인
2. 호스트명 정확히 입력했는지 확인 (`yt` vs `yt.example.com`)
3. 24-48시간 대기
4. 카페24 고객센터 문의

---

### ❌ 문제 2: SSL 인증서 오류

**증상**:
```
NET::ERR_CERT_COMMON_NAME_INVALID
```

**해결**:
1. Vercel 대시보드에서 도메인 재발급
2. DNS 전파 완료 대기
3. Vercel의 "Refresh SSL" 버튼 클릭

---

### ❌ 문제 3: 404 오류 (SPA 라우팅)

**증상**:
- 홈(`/`)은 작동
- `/channel`, `/keyword` 등은 404

**해결**:
`vercel.json` 파일 확인:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### ❌ 문제 4: 카페24 DNS에서 CNAME 추가 불가

**증상**:
카페24 일부 플랜에서 CNAME 레코드 제한

**해결**:
A 레코드 사용:

```bash
# Vercel IP 확인
nslookup cname.vercel-dns.com

# 결과 IP를 A 레코드로 추가
```

또는 **Vercel의 네임서버 사용** (카페24에서 네임서버 변경):

```
Vercel 네임서버:
ns1.vercel-dns.com
ns2.vercel-dns.com
```

---

## 📊 배포 후 설정

### 1. Analytics 추가

`index.html`에 Google Analytics 추가:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

### 2. 환경 변수 설정 (필요 시)

Vercel 대시보드 → Settings → Environment Variables:

```
KEY                  VALUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VITE_APP_NAME       YouTube Consultant
VITE_DOMAIN         yt.example.com
```

---

### 3. 자동 배포 설정

GitHub에 푸시할 때마다 자동 배포:

```bash
# main 브랜치에 푸시
git push origin main

# Vercel이 자동으로 배포
# → 1-2분 후 https://yt.example.com 업데이트
```

---

## 🌟 권장 서브도메인 이름

### 짧고 기억하기 쉬운:
- `yt.example.com` ⭐ (추천)
- `youtube.example.com`
- `ytc.example.com`

### 기능 중심:
- `analytics.example.com`
- `consultant.example.com`
- `channel.example.com`

### 한글 서브도메인 (가능하지만 비추천):
- `유튜브.example.com` (Punycode: `xn--9m1b55r.example.com`)

---

## 💰 비용 분석

### 카페24 도메인 비용:
```
기본 도메인 (.com): 약 15,000원/년 (이미 보유)
서브도메인 추가: 무료 ✅
```

### Vercel 호스팅:
```
무료 플랜:
✅ 100GB 대역폭/월
✅ 무제한 사이트
✅ 자동 SSL
✅ 글로벌 CDN
✅ 자동 배포

Pro 플랜 ($20/월):
✅ 1TB 대역폭
✅ 팀 협업
✅ Advanced Analytics
```

**결론**: 완전 무료 운영 가능! 🎉

---

## 🔒 보안 설정

### 1. HTTPS 강제

`vercel.json`에 추가:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

---

### 2. CSP (Content Security Policy)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.googleapis.com"
        }
      ]
    }
  ]
}
```

---

### 3. Rate Limiting

Vercel Pro 플랜에서 사용 가능:

```javascript
// middleware.ts (추후 추가 시)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## 📱 모니터링

### 1. Vercel Analytics

Vercel 대시보드에서 실시간 확인:
- 방문자 수
- 페이지 뷰
- 로딩 속도
- 오류율

---

### 2. Sentry 에러 트래킹

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## 🚀 배포 체크리스트

### 배포 전:
- [ ] GitHub 리포지토리 생성
- [ ] `.gitignore` 설정
- [ ] `vercel.json` 생성
- [ ] 빌드 테스트 (`npm run build`)
- [ ] 로컬 프리뷰 (`npm run preview`)

### DNS 설정:
- [ ] 카페24 로그인
- [ ] DNS 관리 페이지 접속
- [ ] CNAME 레코드 추가
- [ ] TTL 설정 (3600초)
- [ ] 저장 확인

### Vercel 배포:
- [ ] Vercel 계정 생성/로그인
- [ ] 프로젝트 임포트
- [ ] 빌드 설정 확인
- [ ] 배포 완료 확인
- [ ] 커스텀 도메인 추가
- [ ] SSL 인증서 확인

### 배포 후:
- [ ] `https://yt.example.com` 접속 확인
- [ ] 모든 페이지 라우팅 테스트
- [ ] API 키 설정 테스트
- [ ] 채널 분석 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] SSL 인증서 확인

---

## 📝 예상 타임라인

### Day 1:
```
09:00 - GitHub 리포지토리 생성
09:30 - Vercel 배포
10:00 - 카페24 DNS 설정
10:30 - 점심 & DNS 전파 대기 ☕
14:00 - Vercel 도메인 연결
14:30 - SSL 인증서 확인
15:00 - 최종 테스트
15:30 - 배포 완료! 🎉
```

---

## 🎯 다음 단계

### 배포 후 마케팅:

1. **SEO 최적화**
   ```html
   <!-- index.html -->
   <title>YouTube 채널 컨설턴트 | 데이터 기반 성장 전략</title>
   <meta name="description" content="YouTube Data API v3와 AI 인사이트로 채널을 성장시키세요">
   <meta name="keywords" content="유튜브,채널분석,키워드분석,YouTube">
   ```

2. **Open Graph 태그**
   ```html
   <meta property="og:title" content="YouTube 채널 컨설턴트">
   <meta property="og:description" content="AI 기반 채널 성장 분석">
   <meta property="og:image" content="https://yt.example.com/og-image.png">
   <meta property="og:url" content="https://yt.example.com">
   ```

3. **Google Search Console 등록**
   - https://search.google.com/search-console
   - `yt.example.com` 등록
   - 사이트맵 제출

4. **커뮤니티 공유**
   - 카카오톡 오픈채팅방
   - 유튜브 커뮤니티
   - 블로그 포스팅

---

## 📞 지원

### Vercel 지원:
- 문서: https://vercel.com/docs
- 커뮤니티: https://github.com/vercel/vercel/discussions

### 카페24 지원:
- 고객센터: 1544-0594
- 관리자: https://www.cafe24.com

---

## ✅ 최종 요약

```
카페24 도메인 (example.com)
    ↓ 서브도메인 설정
yt.example.com
    ↓ CNAME → cname.vercel-dns.com
Vercel 호스팅
    ↓ 자동 배포
GitHub 푸시
    ↓
자동 업데이트

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
결과:
✅ https://yt.example.com (무료 SSL)
✅ 자동 배포
✅ 글로벌 CDN
✅ 무료 호스팅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**마지막 업데이트**: 2025-11-05  
**작성자**: AI Assistant  
**배포 준비**: ✅ 완료

배포 시작하시겠습니까? 🚀
