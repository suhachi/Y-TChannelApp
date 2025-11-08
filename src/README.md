# 📺 YouTube 채널 컨설턴트

> **YouTube Data API v3와 AI 인사이트로 채널을 성장시키는 무료 웹 애플리케이션**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)

---

## 🎯 개요

3분 만에 YouTube 채널을 완벽하게 분석하고 AI 기반 성장 전략을 받으세요.

```
데이터 수집 → AI 분석 → 실행 전략
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
복잡한 채널 분석을 3분 안에!
```

**✨ 특징**:
- 🆓 **완전 무료** (로그인/결제 불필요)
- 🔒 **안전한 API 키 보관** (AES-GCM 256-bit 암호화)
- 📊 **직관적인 데이터 시각화** (파레토, 히트맵, 차트)
- 🤖 **AI 기반 전략 제안**
- 📥 **CSV/JSON 내보내기**
- 🌐 **완전 반응형** (모바일/태블릿/데스크톱)

---

## 📖 문서

- **[📖 사용 설명서](USER_GUIDE.md)** - 완전판 가이드 (모든 기능 상세 설명)
- **[⚡ 빠른 참조](QUICK_REFERENCE.md)** - 30초 만에 핵심 파악
- **[🚀 배포 가이드](CAFE24_SUBDOMAIN_DEPLOYMENT_GUIDE.md)** - 카페24 서브도메인 배포
- **[🏗️ 아키텍처](PROJECT_ARCHITECTURE_REPORT.md)** - 기술 문서

---

## 🎯 프로젝트 목표

> **"데이터 → 전략 → 실행"이 한 화면에서 완성되는 YouTube 채널 분석 도구**

### 주요 기능

#### 🆓 베이직 기능 (무료)
- ✅ **채널 분석**: KPI 대시보드, 파레토 분포, 업로드 패턴 히트맵
- ✅ **키워드 분석**: 시장 트렌드, 경쟁 분석, 포맷 믹스
- ✅ **AI 인사이트**: 경쟁 전략, 성장 단계, 채널 진단
- ✅ **데이터 내보내기**: CSV/JSON 형식
- ✅ **보안 API 키 관리**: WebCrypto 암호화 저장

#### 💎 Pro 기능 (멤버십)
- ✅ **라이징 스타 채널 찾기**: 급성장 채널 자동 발굴
- ✅ **블루오션 토픽 분석**: 경쟁이 적은 키워드 발견
- ✅ **고급 리포트**: 프린트 가능한 전문가급 분석 리포트

## 🏗️ 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: Wouter (경량 라우팅)
- **Styling**: Tailwind CSS v4 + ShadCN/UI
- **Charts**: Recharts
- **API**: YouTube Data API v3
- **Security**: WebCrypto API (AES-GCM + PBKDF2)
- **Storage**: LocalStorage + IndexedDB (캐시)

## 🚀 빠른 시작 (사용자용)

### 1️⃣ 앱 접속
```
https://your-app-url.com
```

### 2️⃣ API 키 발급 (3분)
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. **YouTube Data API v3** 활성화
4. API 키 생성 및 복사

### 3️⃣ 앱에서 설정 (30초)
1. "API 설정" 탭 클릭
2. API 키 붙여넣기
3. "테스트" → "저장"

### 4️⃣ 분석 시작! (1분)
```
채널 이름 입력 → "분석 시작" → 완료! 📊
```

**자세한 사용법**: [📖 사용 설명서](USER_GUIDE.md)

---

## 💻 개발자용 시작하기

### 설치

```bash
npm install
# 또는
pnpm install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

### 빌드

```bash
npm run build
# 또는
pnpm build
```

### 프리뷰

```bash
npm run preview
# 또는
pnpm preview
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── channel/        # 채널 분석 컴포넌트
│   │   ├── KpiCards.tsx
│   │   ├── ParetoChart.tsx
│   │   ├── UploadHeatmap.tsx
│   │   └── VideoTable.tsx
│   ├── guards/         # 권한 가드
│   │   ├── KeyGuard.tsx
│   │   └── ProGuard.tsx
│   ├── alerts/         # 오류/빈 상태
│   │   ├── ErrorBoundary.tsx
│   │   └── EmptyState.tsx
│   ├── ui/            # ShadCN 컴포넌트
│   └── Layout.tsx     # 전역 레이아웃
│
├── hooks/             # Custom Hooks
│   ├── useApiKey.ts
│   ├── useUserTier.ts
│   ├── useTheme.ts
│   ├── useHotkeys.ts
│   ├── useHistory.ts
│   └── useTelemetry.ts
│
├── lib/               # 유틸리티 라이브러리
│   ├── aggregate.ts       # 집계 엔진 (KPIs, Pareto, Heatmap)
│   ├── identify-channel.ts # 채널 식별
│   ├── rising-score.ts    # 라이징 스타 점수 계산
│   ├── blue-ocean.ts      # 블루오션 분석
│   ├── export.ts          # CSV/JSON 내보내기
│   ├── history.ts         # 체크포인트 관리
│   ├── storage.ts         # 스토리지 wrapper
│   ├── secure-storage.ts  # WebCrypto 암호화
│   └── telemetry.ts       # 이벤트 로깅
│
├── services/          # API 서비스
│   ├── youtube-api.ts  # YouTube API 래퍼
│   └── ai.ts          # AI 인사이트 생성
│
├── prompts/          # AI 프롬프트 템플릿
│   └── index.ts
│
├── types/            # TypeScript 타입 정의
│   └── index.ts
│
├── styles/           # 글로벌 스타일
│   └── globals.css
│
├── routes.tsx        # 라우트 정의
├── App.tsx          # 앱 엔트리
└── main.tsx         # React 엔트리
```

## 🔐 보안

### API 키 보호
- **암호화**: AES-GCM 256비트
- **키 유도**: PBKDF2 (100,000 iterations)
- **저장소**: LocalStorage (암호화된 상태)
- **브라우저 지문**: 디바이스별 고유 암호화 키

### 권장 사항
- API 키에 도메인 제한 설정
- 쿼터 모니터링
- 정기적 키 회전

## 📊 기능 상세

### 채널 분석
1. **KPI 카드 (5종)**
   - 총 영상 수 / 최근 28일 활동
   - 평균 조회수 / 총 조회수
   - 평균 좋아요 / 총 좋아요
   - 평균 댓글 / 총 댓글
   - 참여율 / Shorts 비율

2. **파레토 차트**
   - 상위 N% 영상의 조회수 분포
   - 누적 비율 선 그래프
   - 80/20 법칙 시각화

3. **업로드 히트맵**
   - 요일 × 시간대별 업로드 패턴
   - 최적 업로드 시간 식별

4. **영상 테이블**
   - 정렬: 조회수/좋아요/댓글/업로드일/길이
   - 필터: Shorts/롱폼/검색어
   - 내보내기: CSV/JSON

### 키워드 분석
- 시장 경쟁도 분석
- 포맷 믹스 (Shorts vs 롱폼)
- 상위 채널 점유율
- AI 전략 제안 (제목 템플릿, 썸네일 콘셉트)

### Pro 기능

#### 라이징 스타 (Rising Star)
**점수 계산 공식**:
```
RS Score = (Growth Rate × 0.40) + (Efficiency × 0.35) + (Activity × 0.25)

- Growth Rate: 최근 업로드 속도
- Efficiency: 조회수/구독자 비율
- Activity: 최근 활동성 (업로드 신선도)
```

#### 블루오션 분석
**판정 기준** (3지표):
1. **분포 지표**: Median/Mean > 0.7 (분산형)
2. **집중도**: 상위 3채널 점유율 < 50% (파편화)
3. **활동성**: 평균 업로드 간격 > 14일 (저경쟁)

**Verdict**: 2개 이상 충족 시 🔵 BLUE OCEAN

## 🎯 사용 시나리오

### 1. 신규 채널 런칭
```
키워드 분석 → 블루오션 발굴 → AI 전략 리포트 → 콘텐츠 캘린더 생성
```

### 2. 경쟁사 벤치마킹
```
채널 분석 → 파레토 차트로 히트작 파악 → 업로드 패턴 복제 → 차별화 전략 수립
```

### 3. 성장 정체 진단
```
AI 진단 리포트 → 성장 단계 분석 → 단기/장기 액션 플랜
```

## 🔧 개발 가이드

### 컴포넌트 추가
```tsx
// src/components/MyComponent.tsx
import { Card } from './ui/card';

export function MyComponent() {
  return <Card>...</Card>;
}
```

### API 호출 (텔레메트리 포함)
```tsx
import { useApiTelemetry } from '../hooks/useTelemetry';

const { trackApiCall } = useApiTelemetry();

const data = await trackApiCall('searchVideos', () => 
  api.searchVideos(query)
);
```

### 히스토리 저장
```tsx
import { useHistory } from '../hooks/useHistory';

const { save } = useHistory();

save('channel', '채널명', analysisData, '100개 영상 분석');
```

## 📈 성능 최적화

- ✅ **API 캐싱**: TTL 6시간 (channels), 24시간 (videos)
- ✅ **배치 처리**: 50개씩 묶어 요청
- ✅ **지수 백오프**: 429 오류 시 자동 재시도
- ✅ **가상 스크롤**: 대용량 테이블 렌더링
- ✅ **Code Splitting**: 라우트별 lazy loading (추가 권장)

## 🐛 트러블슈팅

### API 쿼터 초과
**증상**: "QUOTA_EXCEEDED" 오류

**해결**:
1. 캐시 TTL 연장 (6시간 → 24시간)
2. 검색 범위 축소 (50개 → 20개)
3. 다음 날 재시도

### API 키 무효
**증상**: "INVALID_API_KEY" 오류

**해결**:
1. Google Cloud Console에서 키 상태 확인
2. YouTube Data API v3 활성화 확인
3. 키 재발급 후 재설정

### 데이터 수집 실패
**증상**: 빈 결과

**해결**:
1. 채널 ID 정확성 확인
2. 비공개 영상은 수집 불가
3. 네트워크 연결 확인

## 📝 라이선스

MIT License

---

## 📞 지원

### 문제 해결
- **[FAQ](USER_GUIDE.md#-자주-묻는-질문-faq)** - 자주 묻는 질문
- **[문제 해결](USER_GUIDE.md#-문제-해결)** - 일반적인 오류 해결법

### 피드백
- 버그 리포트: GitHub Issues
- 기능 제안: GitHub Discussions
- 문의: 프로젝트 관리자

---

## 🎓 학습 자료

### 초보자
1. [빠른 시작 가이드](USER_GUIDE.md#-빠른-시작-가이드-5분)
2. [기능별 가이드](USER_GUIDE.md#-기능별-상세-가이드)
3. [FAQ](USER_GUIDE.md#-자주-묻는-질문-faq)

### 고급 사용자
1. [고급 활용 팁](USER_GUIDE.md#-고급-활용-팁)
2. [데이터 내보내기](USER_GUIDE.md#-데이터-내보내기-활용)
3. [학습 로드맵](USER_GUIDE.md#-학습-로드맵)

### 개발자
1. [프로젝트 구조](#-프로젝트-구조)
2. [개발 가이드](#-개발-가이드)
3. [아키텍처 문서](PROJECT_ARCHITECTURE_REPORT.md)

---

## 🌟 핵심 기능 미리보기

### 채널 분석
```
📊 KPI 대시보드
• 구독자 / 조회수 / 참여율
• 최근 28일 활동 분석
• 평균 vs 총계 비교

📈 파레토 차트
• 상위 20% 영상의 조회수 기여도
• 히트작 패턴 분석

🔥 업로드 히트맵
• 요일 × 시간대별 패턴
• 최적 업로드 시간 발견
```

### 키워드 분석
```
🔍 시장 분석
• 키워드 검색 결과
• 경쟁 채널 비교
• 시장 점유율

🎯 AI 전략
• 진입 방법 제안
• 콘텐츠 아이디어
• 차별화 포인트
```

### Pro 기능
```
⭐ 라이징 스타 찾기
• 급성장 채널 발굴
• 성공 패턴 분석
• 벤치마킹 대상

🌊 블루오션 토픽
• 틈새 시장 발견
• 경쟁도 vs 수요 분석
• 진입 전략 제안
```

---

## 💰 비용

```
사용자: $0 (완전 무료)
운영자: $0 (Vercel 무료 티어)
━━━━━━━━━━━━━━━━━━━━━━━━
총 비용: $0/월 🎉
```

**필요한 것**:
- YouTube Data API v3 키 (무료, 일일 10,000 유닛)
- 웹 브라우저

---

## 🔐 보안 및 프라이버시

### 안전성
✅ API 키 AES-GCM 256-bit 암호화  
✅ 브라우저 로컬 저장 (서버 전송 없음)  
✅ 디바이스 지문 기반 보호  
✅ 공개 데이터만 사용  
✅ 개인정보 수집 없음  

### 투명성
- 로그인 불필요
- 사용자 추적 없음
- 오픈 소스 (MIT 라이선스)

---

## 📊 사용 통계

```
일일 사용 가능 분석:
• 채널 분석: 30-50회
• 키워드 분석: 40-60회
• 영상 분석: 무제한

지원 플랫폼:
• 데스크톱 (Chrome, Firefox, Safari, Edge)
• 모바일 (iOS, Android)
• 태블릿
```

---

## 🛣️ 로드맵

### ✅ 완료 (v1.0)
- [x] 채널 분석
- [x] 키워드 분석
- [x] AI 인사이트
- [x] 데이터 내보내기
- [x] 라이징 스타 (Pro)
- [x] 블루오션 (Pro)
- [x] API 키 암호화
- [x] 반응형 디자인

### 🔜 예정 (v1.1)
- [ ] 실제 GPT API 통합
- [ ] 검색 기록 저장
- [ ] 채널 비교 기능
- [ ] 다크/라이트 테마

### 💡 고려 중 (v2.0)
- [ ] Supabase 로그인
- [ ] Pro 플랜 결제 (Stripe)
- [ ] 팀 협업 기능
- [ ] 모바일 앱

---

## 🤝 기여하기

기여를 환영합니다!

### 방법
1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 코드 스타일
- TypeScript 사용
- ESLint 규칙 준수
- 컴포넌트 단위 테스트 작성 (권장)

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

---

## 🙏 크레디트

### 기술 스택
- **YouTube Data API v3**: Google
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

### 영감
YouTube 크리에이터들의 성장을 돕기 위해 만들어졌습니다.

---

## 🌟 Showcase

이 프로젝트가 도움이 되었다면 ⭐️를 눌러주세요!

---

**Made with ❤️ for Content Creators**

*이 도구는 YouTube 공개 데이터만 사용하며, YouTube Analytics API는 사용하지 않습니다.*  
*모든 분석은 공개적으로 접근 가능한 정보를 기반으로 합니다.*
