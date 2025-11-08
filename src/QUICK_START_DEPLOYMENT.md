# ⚡ 빠른 배포 가이드 (5분)

**목표**: 카페24 서브도메인으로 5분 안에 배포하기

---

## 🚀 3단계로 배포 완료

### 1️⃣ GitHub에 푸시 (2분)

```bash
# 터미널에서 프로젝트 폴더로 이동
cd your-project-folder

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: YouTube Channel Consultant"

# GitHub에서 새 리포지토리 생성 후 (https://github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/yt-consultant.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Vercel 배포 (2분)

#### 방법 A: Vercel CLI (빠름)
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### 방법 B: Vercel 웹사이트 (쉬움)
1. https://vercel.com/signup 접속
2. "Import Project" 클릭
3. GitHub 연결 후 리포지토리 선택
4. "Deploy" 클릭

**완료!** → `https://your-project.vercel.app` 생성

---

### 3️⃣ 카페24 DNS 설정 (1분 + 전파 대기)

#### A. 카페24 접속
```
https://www.cafe24.com → 로그인
→ "나의 서비스 관리" → "도메인 관리"
→ 도메인 선택 (예: example.com)
→ "DNS 관리" 또는 "부가서비스"
```

#### B. CNAME 레코드 추가
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
레코드 타입: CNAME
호스트명: yt
값: cname.vercel-dns.com
TTL: 3600
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[저장]
```

#### C. Vercel에서 도메인 추가
```
Vercel 대시보드 → 프로젝트 선택
→ Settings → Domains
→ Add Domain: yt.example.com
→ Add
```

**대기**: DNS 전파 (5-60분)

---

## ✅ 배포 확인

### 1. DNS 확인
```bash
nslookup yt.example.com
```

### 2. 접속 테스트
```
https://yt.example.com
```

### 3. 기능 테스트
- [ ] 홈 페이지 로딩
- [ ] API 키 설정
- [ ] 채널 분석
- [ ] 키워드 분석

---

## 🎉 완료!

```
✅ 배포 완료: https://yt.example.com
✅ 자동 SSL 인증서
✅ GitHub 푸시 → 자동 배포
✅ 무료 호스팅
```

---

## 📊 서브도메인 예시

카페24 도메인이 `mysite.com`이라면:

| 서브도메인 | 용도 |
|-----------|------|
| `yt.mysite.com` | YouTube 컨설팅 앱 ⭐ |
| `youtube.mysite.com` | 더 명확한 이름 |
| `analytics.mysite.com` | 분석 도구 느낌 |
| `tools.mysite.com` | 도구 모음 |

---

## ⚠️ 주의사항

### 1. 카페24 DNS 제한
일부 저가 플랜에서는 CNAME 추가가 제한될 수 있습니다.

**해결책**: A 레코드 사용
```
타입: A
호스트: yt
값: 76.76.21.21 (Vercel IP)
```

### 2. DNS 전파 시간
- 빠르면: 5분
- 보통: 1시간
- 최대: 48시간

인내심을 가지고 기다리세요! ☕

### 3. Wouter 라우팅
`vercel.json` 파일이 있어야 `/channel`, `/keyword` 등의 경로가 작동합니다.
→ 이미 생성되어 있음 ✅

---

## 🔧 문제 해결

### DNS가 안 보여요
```bash
# 확인
nslookup yt.example.com

# 안 나오면
1. 카페24 DNS 설정 재확인
2. 호스트명 다시 확인 (yt vs yt.example.com)
3. 24시간 대기
```

### SSL 오류
```
1. Vercel 대시보드 → Domains
2. "Refresh SSL" 클릭
3. 5분 대기
```

### 404 오류
```
vercel.json 파일 확인:
{
  "rewrites": [
    {"source": "/(.*)", "destination": "/index.html"}
  ]
}
```

---

## 🎯 다음 단계

### 배포 후 할 일:

1. **Analytics 추가**
   - Google Analytics
   - Vercel Analytics

2. **SEO 최적화**
   - 메타 태그 추가
   - Open Graph 설정
   - 사이트맵 제출

3. **마케팅**
   - 커뮤니티 공유
   - 블로그 포스팅
   - SNS 홍보

4. **모니터링**
   - Sentry 에러 트래킹
   - 사용자 피드백 수집

---

## 📞 도움이 필요하면?

### Vercel:
- 문서: https://vercel.com/docs
- Discord: https://vercel.com/discord

### 카페24:
- 고객센터: 1544-0594
- 관리자: https://www.cafe24.com

---

## 🎊 배포 성공!

```
   🎉  축하합니다!  🎉

YouTube 채널 컨설턴트 앱이
성공적으로 배포되었습니다!

━━━━━━━━━━━━━━━━━━━━━━━━
🌐 https://yt.example.com
━━━━━━━━━━━━━━━━━━━━━━━━

이제 전 세계 누구나
무료로 사용할 수 있습니다!
```

---

**예상 소요 시간**: 5-70분
- 작업: 5분
- DNS 전파: 5-60분

**비용**: $0 (완전 무료)

배포 시작! 🚀
