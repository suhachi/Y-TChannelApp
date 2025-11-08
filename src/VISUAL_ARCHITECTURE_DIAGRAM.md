# 📊 YouTube 채널 컨설턴트 - 시각화 아키텍처 다이어그램

## 🎯 전체 시스템 구조도

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          사용자 (브라우저)                                 │
│                                                                           │
│  📱 UI Components (React + Tailwind + shadcn/ui)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Layout                                                            │  │
│  │  ├─ Header (로고, API 상태, Pro 토글)                               │  │
│  │  ├─ Navigation (4개 탭)                                            │  │
│  │  ├─ Main Content → Router                                          │  │
│  │  └─ Footer                                                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  🎭 Pages (6개)                                                          │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐         │
│  │  Home   │  Setup  │ Channel │ Keyword │  Video  │Opportunity│         │
│  │    /    │ /setup  │/channel │/keyword │ /video  │/opportunity│        │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘         │
│       ▲          ▲         ▲         ▲         ▲         ▲              │
│       │          │         │         │         │         │              │
└───────┼──────────┼─────────┼─────────┼─────────┼─────────┼──────────────┘
        │          │         │         │         │         │
        │          │    ┌────┴────┐    │         │    ┌────┴────┐
        │          │    │KeyGuard │    │         │    │ProGuard │
        │          │    └────┬────┘    │         │    └────┬────┘
        │          │         │         │         │         │
┌───────┴──────────┴─────────┴─────────┴─────────┴─────────┴──────────────┐
│                      🎣 State Management (Hooks)                          │
│  ┌────────────────────────┐  ┌────────────────────────┐                 │
│  │   useApiKey            │  │   useUserTier          │                 │
│  │  - apiKey: string      │  │  - tier: UserTier      │                 │
│  │  - status: Status      │  │  - isPro: boolean      │                 │
│  │  - testKey()           │  │  - upgradeToPro()      │                 │
│  │  - clearKey()          │  │  - downgradeToBasic()  │                 │
│  └────────────────────────┘  └────────────────────────┘                 │
│           │                            │                                  │
└───────────┼────────────────────────────┼──────────────────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      💾 Storage Layer (localStorage)                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  storage.ts                                                         │ │
│  │  ├─ saveApiKey(key) → 🔐 encrypt → localStorage['youtube_api_key'] │ │
│  │  ├─ getApiKey() → decrypt → key                                    │ │
│  │  ├─ setUserTier(tier) → localStorage['user_tier']                  │ │
│  │  ├─ getUserTier() → 'basic' | 'pro'                                │ │
│  │  └─ Cache Management (TTL: 1시간)                                   │ │
│  │     ├─ cache_search_channel_{query}                                │ │
│  │     ├─ cache_search_video_{query}                                  │ │
│  │     ├─ cache_channel_{channelId}                                   │ │
│  │     └─ cache_video_{videoId}                                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
            ▲
            │
┌───────────┴─────────────────────────────────────────────────────────────┐
│                    🔧 Service Layer (API Clients)                        │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │  YouTubeAPI                 │  │  AIService                      │  │
│  │  ├─ testKey()               │  │  ├─ generateCompetitionStrategy │  │
│  │  ├─ searchChannels()        │  │  ├─ generateGrowthPhases        │  │
│  │  ├─ searchVideos()          │  │  ├─ generateDiagnosis           │  │
│  │  ├─ getChannels()           │  │  ├─ generateVideoSummary        │  │
│  │  ├─ getVideos()             │  │  ├─ generateKeywordStrategy     │  │
│  │  └─ getChannelUploads()     │  │  └─ generateBlueOceanPlan       │  │
│  └──────────┬──────────────────┘  └──────────┬──────────────────────┘  │
│             │                                 │                          │
└─────────────┼─────────────────────────────────┼──────────────────────────┘
              │                                 │
              ▼                                 ▼
┌─────────────────────────────┐  ┌─────────────────────────────────────┐
│  YouTube Data API v3        │  │  AI Processing (Template)           │
│  ┌────────────────────────┐ │  │  ┌────────────────────────────────┐ │
│  │ Endpoints:             │ │  │  │ 데이터 기반 리포트 생성         │ │
│  │ • search.list          │ │  │  │ - 채널 분석 → 전략 제안        │ │
│  │ • channels.list        │ │  │  │ - 영상 분석 → 요약 생성        │ │
│  │ • videos.list          │ │  │  │ - 키워드 → 시장 분석           │ │
│  │ • playlistItems.list   │ │  │  │ - Markdown 형식 출력           │ │
│  │                        │ │  │  └────────────────────────────────┘ │
│  │ 쿼터: 10,000 units/day │ │  │  (프로덕션: OpenAI/Claude 통합)   │
│  └────────────────────────┘ │  └─────────────────────────────────────┘
└─────────────────────────────┘

```

---

## 🗺️ 페이지 라우팅 플로우

```
                    ┌─────────────────┐
                    │   브라우저 시작    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Home (/)      │
                    │  - Hero Section │
                    │  - Search Bar   │
                    │  - 기능 카드 3개 │
                    └────┬───┬───┬────┘
                         │   │   │
         ┌───────────────┼───┼───┼───────────────┐
         │               │   │   │               │
         ▼               ▼   ▼   ▼               ▼
┌─────────────┐  ┌────────────────────┐  ┌─────────────┐
│ API 설정     │  │   분석 페이지        │  │  공략 채널   │
│ /setup      │  │                    │  │ /opportunity│
│             │  │ ┌────────────────┐ │  │  (Pro 전용) │
│ - 키 입력    │  │ │ /channel       │ │  │             │
│ - 검증       │  │ │ (KeyGuard)     │ │  │ - 라이징    │
│ - 저장       │  │ │ - 채널 검색     │ │  │ - 블루오션  │
└─────────────┘  │ │ - 상세 분석     │ │  └─────────────┘
                 │ │ - KPI + 차트    │ │
                 │ │ - AI 리포트     │ │
                 │ └────┬───────────┘ │
                 │      │             │
                 │ ┌────▼───────────┐ │
                 │ │ /keyword       │ │
                 │ │ (KeyGuard)     │ │
                 │ │ - 키워드 검색   │ │
                 │ │ - 영상 수집     │ │
                 │ │ - 채널 점유율   │ │
                 │ │ - AI 전략      │ │
                 │ └────┬───────────┘ │
                 │      │             │
                 │ ┌────▼───────────┐ │
                 │ │ /video         │ │
                 │ │ (KeyGuard)     │ │
                 │ │ - 영상 상세     │ │
                 │ │ - AI 요약      │ │
                 │ └────────────────┘ │
                 └────────────────────┘
```

---

## 🔐 보안 레이어 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     Layer 1: UI Layer                        │
│  모든 페이지 컴포넌트 (Home, Setup, Channel, etc.)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layer 2: Guard Layer                       │
│  ┌────────────────────┐        ┌───────────────────────┐    │
│  │  KeyGuard          │        │  ProGuard             │    │
│  │  - hasValidKey?    │   +    │  - isPro?             │    │
│  │  ✅ → 통과          │        │  ✅ → 통과             │    │
│  │  ❌ → API 설정 유도 │        │  ❌ → 업그레이드 유도  │    │
│  └────────────────────┘        └───────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Layer 3: State Layer                         │
│  useApiKey() ← localStorage (암호화)                         │
│  useUserTier() ← localStorage                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Layer 4: Encryption Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  secure-storage.ts                                     │ │
│  │  ├─ encryptData(key) → AES-GCM 암호화                  │ │
│  │  │   └─ SubtleCrypto API (Browser)                    │ │
│  │  └─ decryptData(encrypted) → 원본 키 복원              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Layer 5: Storage Layer                        │
│  localStorage (브라우저)                                     │
│  ├─ youtube_api_key: "encrypted_string"                     │
│  ├─ user_tier: "basic" | "pro"                              │
│  └─ cache_*: { data, expiry }                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 데이터 플로우 (채널 분석 예시)

```
사용자 입력: "Google"
        │
        ▼
┌───────────────────────────────────────┐
│  ChannelAnalysis 컴포넌트              │
│  handleSearch()                       │
│  → setQuery("Google")                 │
│  → searchChannels("Google")           │
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  YouTubeAPI.searchChannels("Google")  │
│  1. 캐시 확인 (cache_search_channel_Google) │
│     ├─ 있음 → 즉시 반환 ⚡              │
│     └─ 없음 → API 호출                 │
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────┐
│  YouTube Data API v3                                  │
│  1. search.list (type=channel, q="Google", max=50)   │
│     → 채널 ID 목록                                     │
│  2. channels.list (id=..., part=snippet,statistics)  │
│     → 채널 상세 정보                                   │
└───────────┬───────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  데이터 변환                            │
│  API 응답 → ChannelCore[] 타입         │
│  ├─ channelId                         │
│  ├─ title                             │
│  ├─ thumbnails                        │
│  └─ stats (subscribers, views, etc.)  │
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  캐시 저장                              │
│  storage.setCache(                    │
│    "cache_search_channel_Google",     │
│    channels,                          │
│    3600000  // 1시간                   │
│  )                                    │
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  상태 업데이트                          │
│  setSearchResults(channels)           │
│  setShowResults(true)                 │
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  UI 렌더링                             │
│  채널 카드 50개 표시                    │
│  ├─ 썸네일                             │
│  ├─ 채널명                             │
│  └─ 구독자 수                          │
└───────────────────────────────────────┘
            │
            │ 사용자가 채널 클릭
            ▼
┌───────────────────────────────────────┐
│  analyzeChannel(channelId)            │
│  1. getChannels([channelId])          │
│  2. getChannelUploads(channelId, 100) │
│  3. getVideos(videoIds)               │
│  4. 메트릭 계산                         │
│     ├─ shortsRatio                    │
│     ├─ avgDuration                    │
│     ├─ titleLenAvg                    │
│     └─ topParetoShare                 │
│  5. setDashboard({ core, videos, metrics }) │
│  6. generateAIReports(dashboard)      │
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────┐
│  AI 리포트 생성 (병렬)                                  │
│  Promise.all([                                        │
│    generateCompetitionStrategy(dashboard),            │
│    generateGrowthPhases(dashboard),                   │
│    generateDiagnosis(dashboard)                       │
│  ])                                                   │
│  → setAiReport({ competition, growth, diagnosis })    │
└───────────┬───────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  최종 UI 렌더링                         │
│  ├─ KPI 카드 (4개)                     │
│  ├─ 파레토 차트                         │
│  ├─ 업로드 히트맵                       │
│  ├─ 영상 테이블 (100개)                │
│  └─ AI 리포트 (3개 탭)                 │
└───────────────────────────────────────┘
```

---

## 🎭 컴포넌트 상속/포함 관계

```
App
└─ ErrorBoundary
   └─ Layout
      ├─ Header
      │  ├─ Logo (→ Home)
      │  ├─ Badge (API Status)
      │  └─ Button (Pro Toggle)
      │
      ├─ Navigation
      │  └─ Button[] (4개 탭)
      │
      ├─ Banner (API 경고)
      │  └─ Button (→ Setup)
      │
      ├─ Router (Wouter)
      │  │
      │  ├─ Route: /
      │  │  └─ Home
      │  │     ├─ Input (검색)
      │  │     ├─ Button (분석 시작)
      │  │     ├─ Card[] (기능 3개)
      │  │     └─ Card[] (편의 기능 4개)
      │  │
      │  ├─ Route: /setup
      │  │  └─ ApiKeySetup
      │  │     ├─ Input (API 키)
      │  │     ├─ Button (테스트)
      │  │     ├─ Badge (상태)
      │  │     └─ Card (가이드)
      │  │
      │  ├─ Route: /channel
      │  │  └─ KeyGuard
      │  │     └─ ChannelAnalysis
      │  │        ├─ Input (검색)
      │  │        ├─ Card[] (검색 결과 ≤50)
      │  │        └─ Dashboard
      │  │           ├─ Button[] (내보내기)
      │  │           ├─ KpiCards
      │  │           │  └─ Card[] (4개)
      │  │           └─ Tabs
      │  │              ├─ Tab: 개요
      │  │              │  ├─ ParetoChart (Recharts)
      │  │              │  └─ UploadHeatmap (Custom)
      │  │              ├─ Tab: 영상 목록
      │  │              │  └─ VideoTable
      │  │              │     ├─ Input[] (필터)
      │  │              │     └─ Table (100개)
      │  │              └─ Tab[]: AI 리포트 (3개)
      │  │                 └─ Card
      │  │                    ├─ pre (Markdown)
      │  │                    └─ Button (복사)
      │  │
      │  ├─ Route: /keyword
      │  │  └─ KeyGuard
      │  │     └─ KeywordAnalysis
      │  │        ├─ Input (키워드)
      │  │        ├─ Button[] (내보내기)
      │  │        ├─ Card[] (KPI 4개)
      │  │        ├─ Card (상위 채널 5개)
      │  │        ├─ Card (상위 영상 20개)
      │  │        └─ Card (AI 전략)
      │  │
      │  ├─ Route: /video
      │  │  └─ KeyGuard
      │  │     └─ VideoDetail
      │  │        ├─ Card (영상 정보)
      │  │        ├─ Card[] (통계 3개)
      │  │        ├─ Badge[] (태그)
      │  │        ├─ Card (AI 요약)
      │  │        └─ Button (내보내기)
      │  │
      │  └─ Route: /opportunity
      │     └─ KeyGuard
      │        └─ ProGuard
      │           └─ OpportunityFinder
      │              ├─ Tabs (모드 전환)
      │              ├─ Input (검색)
      │              ├─ Card[] (라이징 스타 ≤10)
      │              │  └─ Progress (점수 표시)
      │              └─ Card[] (블루오션)
      │                 ├─ Badge (BLUE/RED)
      │                 └─ Card (AI 전략)
      │
      └─ Footer
         └─ p[] (정보 3개)

Toaster (전역)
└─ Toast[] (알림)
```

---

## 🧩 모듈 의존성 그래프

```
                     types/index.ts
                          ▲
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │                 │                 │
lib/storage.ts    services/youtube-api.ts  services/ai.ts
        ▲                 ▲                 ▲
        │                 │                 │
        │        ┌────────┼────────┐        │
        │        │        │        │        │
hooks/useApiKey.ts  hooks/useUserTier.ts   │
        ▲                 ▲                 │
        │                 │                 │
        ├─────────────────┤                 │
        │                 │                 │
src/components/guards/    │                 │
├─ KeyGuard.tsx ──────────┘                 │
└─ ProGuard.tsx ────────────────────────────┘
        ▲
        │
        │
components/
├─ Home.tsx
├─ ApiKeySetup.tsx
├─ ChannelAnalysis.tsx ──────┐
├─ KeywordAnalysis.tsx        │
├─ VideoDetail.tsx            │
└─ OpportunityFinder.tsx      │
        ▲                     │
        │                     │
        │                     ▼
        │          src/components/channel/
        │          ├─ KpiCards.tsx
        │          ├─ ParetoChart.tsx
        │          ├─ UploadHeatmap.tsx
        │          └─ VideoTable.tsx
        │                     ▲
        │                     │
        └─────────────────────┤
                              │
                    src/lib/
                    ├─ aggregate.ts
                    ├─ export.ts
                    ├─ rising-score.ts
                    └─ blue-ocean.ts
```

---

## 🔄 상태 변경 플로우

### 1. API 키 설정 플로우

```
사용자 → Input (키 입력)
   │
   ▼
ApiKeySetup.tsx
   │ setKeyInput("AIza...")
   │
   ▼
Button (테스트) 클릭
   │
   ▼
useApiKey.testKey("AIza...")
   │
   ▼
YouTubeAPI.testKey()
   │
   ├─ 성공 ✅
   │  └─> storage.saveApiKey(encrypt(key))
   │     └─> localStorage['youtube_api_key'] = encrypted
   │        └─> setApiKey(key)
   │           └─> setStatus('valid')
   │              └─> hasValidKey = true
   │                 └─> Layout 리렌더링
   │                    ├─> 배너 사라짐
   │                    └─> API 상태 "연결됨" 표시
   │
   └─ 실패 ❌
      └─> setStatus('invalid')
         └─> setError('유효하지 않은 키')
            └─> UI에 에러 메시지 표시
```

### 2. Pro 업그레이드 플로우

```
사용자 → Button (Pro 체험하기) 클릭
   │
   ▼
useUserTier.upgradeToPro()
   │
   ├─> storage.setUserTier('pro')
   │   └─> localStorage['user_tier'] = 'pro'
   │
   └─> setTier('pro')
       └─> isPro = true
          └─> Layout 리렌더링
          │   ├─> "PRO" 배지 표시
          │   ├─> 버튼 → "Basic으로 전환"
          │   └─> Navigation
          │       └─> "공략 채널 찾기" 탭 활성화
          │
          └─> ProGuard 리렌더링
              └─> OpportunityFinder 접근 가능
```

---

## 📦 빌드 및 배포 구조

```
프로젝트 소스
   │
   ▼
┌─────────────────────────────────────┐
│  Vite 빌드 (npm run build)           │
│  ├─ TypeScript → JavaScript 컴파일   │
│  ├─ React JSX → JS 변환              │
│  ├─ Tailwind CSS → 최적화된 CSS      │
│  ├─ Code Splitting (자동)            │
│  └─ Tree Shaking (사용 안 하는 코드 제거) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  dist/ 폴더 (정적 파일)               │
│  ├─ index.html                      │
│  ├─ assets/                         │
│  │  ├─ index-[hash].js  (~500KB)   │
│  │  ├─ index-[hash].css (~100KB)   │
│  │  └─ vendor-[hash].js (~200KB)   │
│  └─ favicon.ico                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  배포 (Vercel / Netlify / AWS)      │
│  ├─ CDN으로 전역 배포                │
│  ├─ HTTPS 자동 설정                  │
│  ├─ Gzip 압축                       │
│  └─ 캐싱 헤더 설정                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  사용자 브라우저                      │
│  ├─ index.html 로드                 │
│  ├─ JS/CSS 다운로드 (캐시됨)         │
│  └─ React 앱 마운트                  │
└─────────────────────────────────────┘
```

---

## 🎯 요약

### 아키텍처 특징

✅ **6개 레이어** (UI → Routing → Guard → State → Service → Storage)  
✅ **6개 페이지** (Home, Setup, Channel, Keyword, Video, Opportunity)  
✅ **2개 가드** (KeyGuard, ProGuard)  
✅ **2개 서비스** (YouTubeAPI, AIService)  
✅ **2개 전역 훅** (useApiKey, useUserTier)  
✅ **60+ 컴포넌트** (페이지 + shadcn/ui + 하위)  

### 데이터 플로우

📥 **입력**: 사용자 검색/클릭  
⚙️ **처리**: Hook → Service → API  
💾 **저장**: Cache (1시간) + localStorage (영구)  
📤 **출력**: UI 업데이트 (React 리렌더링)  

### 보안

🔐 **암호화**: AES-GCM (API 키)  
🛡️ **접근 제어**: KeyGuard + ProGuard  
✅ **검증**: API 키 실시간 테스트  

---

**이 다이어그램으로 프로젝트의 전체 구조를 한눈에 파악할 수 있습니다!** 🎉
