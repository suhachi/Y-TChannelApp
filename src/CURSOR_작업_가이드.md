# 🤖 Cursor AI 작업 가이드 - YouTube 채널 분석 서비스

> Cursor IDE에서 이 프로젝트를 수정/개선할 때 사용하는 완벽 가이드입니다.  
> AI에게 정확한 지시를 내려 원하는 결과를 얻으세요!

---

## 📋 목차

1. [프로젝트 구조 이해](#1-프로젝트-구조-이해)
2. [Cursor 기본 사용법](#2-cursor-기본-사용법)
3. [프롬프트 작성 원칙](#3-프롬프트-작성-원칙)
4. [기능별 수정 가이드](#4-기능별-수정-가이드)
5. [자주 사용하는 프롬프트 템플릿](#5-자주-사용하는-프롬프트-템플릿)
6. [주의사항 및 제약조건](#6-주의사항-및-제약조건)
7. [문제 해결](#7-문제-해결)

---

## 1. 프로젝트 구조 이해

### 1-1. 핵심 개념

**이 프로젝트는:**
- YouTube Data API v3를 사용하는 채널 분석 도구
- React + TypeScript + Tailwind CSS 기반
- API 키 기반 인증 (로그인 시스템 없음)
- 베이직(무료) / 프로(유료) 티어 구분
- 완전히 프론트엔드만으로 동작 (백엔드 없음)

**중요한 설계 원칙:**
1. **CDN 의존성 제로**: 모든 외부 라이브러리는 번들에 포함
2. **자체 라우터 사용**: `/src/lib/simple-router.tsx` (wouter 대체)
3. **순수 CSS 차트**: recharts 제거, CSS 기반 차트 구현
4. **로컬 스토리지 기반**: API 키와 사용자 데이터는 브라우저에 저장

### 1-2. 폴더 구조

```
프로젝트 루트/
│
├── App.tsx                          # ⚠️ 메인 앱 (수정 금지 - src/App.tsx 사용)
├── src/
│   ├── App.tsx                      # ✅ 실제 메인 앱 파일
│   ├── main.tsx                     # 앱 진입점
│   ├── routes.tsx                   # 라우트 경로 상수
│   │
│   ├── components/                  # 🎨 UI 컴포넌트
│   │   ├── alerts/                  # 알림, 에러 처리
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── channel/                 # 채널 분석 관련
│   │   │   ├── KpiCards.tsx         # KPI 지표 카드
│   │   │   ├── ParetoChart.tsx      # 파레토 차트
│   │   │   ├── UploadHeatmap.tsx    # 업로드 히트맵
│   │   │   └── VideoTable.tsx       # 영상 목록 테이블
│   │   ├── guards/                  # 접근 제어
│   │   │   ├── KeyGuard.tsx         # API 키 필요 페이지
│   │   │   └── ProGuard.tsx         # Pro 티어 필요 페이지
│   │   ├── ApiKeyGuide.tsx          # API 키 발급 안내
│   │   ├── NetworkBanner.tsx        # 네트워크 상태 배너
│   │   └── icons.tsx                # SVG 아이콘 모음
│   │
│   ├── hooks/                       # 🪝 커스텀 훅
│   │   ├── useHistory.ts            # 검색 히스토리 관리
│   │   ├── useHotkeys.ts            # 키보드 단축키
│   │   ├── useTelemetry.ts          # 페이지뷰 추적
│   │   └── useTheme.ts              # 다크모드 (현재 미사용)
│   │
│   ├── lib/                         # 🛠️ 유틸리티
│   │   ├── simple-router.tsx        # ⭐ 자체 라우터 (wouter 대체)
│   │   ├── secure-storage.ts        # 암호화된 로컬 스토리지
│   │   ├── aggregate.ts             # 데이터 집계 함수
│   │   ├── export.ts                # CSV/JSON 내보내기
│   │   ├── identify-channel.ts      # 채널 ID 추출
│   │   ├── rising-score.ts          # 라이징 스타 점수 계산
│   │   ├── blue-ocean.ts            # 블루오션 분석
│   │   ├── history.ts               # 히스토리 관리
│   │   └── telemetry.ts             # 텔레메트리
│   │
│   └── prompts/                     # 📝 AI 프롬프트
│       └── index.ts                 # AI 요약 프롬프트
│
├── components/                      # 🎯 페이지 컴포넌트
│   ├── Home.tsx                     # 홈 (랜딩 페이지)
│   ├── Layout.tsx                   # 레이아웃 (헤더, 사이드바)
│   ├── ApiKeySetup.tsx              # API 키 설정
│   ├── ChannelAnalysis.tsx          # 채널 분석 메인
│   ├── ChannelDetail.tsx            # 채널 상세 (분석 결과)
│   ├── KeywordAnalysis.tsx          # 키워드 분석
│   ├── VideoDetail.tsx              # 영상 상세 분석
│   └── OpportunityFinder.tsx        # 기회 발견 (Pro)
│
├── components/ui/                   # 🧱 Shadcn UI 컴포넌트
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── table.tsx
│   └── ...                          # ⚠️ 기존 Shadcn 컴포넌트 수정 금지
│
├── hooks/                           # 🔧 전역 훅
│   ├── useApiKey.ts                 # API 키 관리
│   └── useUserTier.ts               # 사용자 티어 관리
│
├── services/                        # 🌐 외부 서비스
│   ├── youtube-api.ts               # YouTube API 호출
│   └── ai.ts                        # AI 요약 (로컬)
│
├── types/                           # 📐 TypeScript 타입
│   └── index.ts
│
└── styles/
    └── globals.css                  # 🎨 글로벌 스타일 (Tailwind 설정)
```

### 1-3. 주요 파일별 역할

| 파일 | 역할 | 수정 가능 여부 |
|------|------|----------------|
| `src/App.tsx` | 메인 앱, 라우팅 설정 | ✅ 가능 |
| `src/lib/simple-router.tsx` | 자체 라우터 | ⚠️ 신중하게 |
| `components/Layout.tsx` | 헤더, 네비게이션 | ✅ 가능 |
| `services/youtube-api.ts` | YouTube API 로직 | ✅ 가능 |
| `components/ui/*` | Shadcn UI | ❌ 수정 금지 |
| `styles/globals.css` | 디자인 토큰 | ✅ 가능 |

---

## 2. Cursor 기본 사용법

### 2-1. Cursor 주요 기능

**1. Cmd/Ctrl + K: AI 편집**
- 선택한 코드를 AI가 수정
- 사용법: 코드 선택 → Cmd+K → 원하는 수정사항 입력

**2. Cmd/Ctrl + L: AI 채팅**
- 프로젝트 전체에 대해 질문하거나 지시
- 사용법: Cmd+L → 채팅창에 질문/지시사항 입력

**3. Tab: AI 자동완성**
- 코드 작성 중 AI가 다음 코드 제안
- 사용법: 코드 입력 중 Tab 눌러서 수락

**4. Cmd/Ctrl + I: 인라인 편집**
- 커서 위치에서 바로 AI에게 요청
- 사용법: 커서 위치 → Cmd+I → 원하는 내용 입력

### 2-2. 프로젝트 컨텍스트 이해시키기

**Cursor에게 프로젝트를 이해시키려면:**

```
Cmd+L 눌러서 채팅창에 입력:

이 프로젝트는 YouTube 채널 분석 서비스입니다.
주요 특징:
1. React + TypeScript + Tailwind CSS
2. YouTube Data API v3 사용
3. API 키 기반 인증 (로그인 없음)
4. 자체 hash-based 라우터 사용 (/src/lib/simple-router.tsx)
5. 외부 CDN 의존성 없음
6. 베이직/프로 티어 구분

프로젝트 구조를 파악해주세요.
```

---

## 3. 프롬프트 작성 원칙

### 3-1. 좋은 프롬프트 vs 나쁜 프롬프트

#### ❌ 나쁜 프롬프트 예시

```
버튼 색깔 바꿔줘
```

**문제점:**
- 어떤 버튼인지 불명확
- 어떤 색깔로 바꿀지 명시 안 됨
- 어떤 상황에서 바꿀지 불명확

#### ✅ 좋은 프롬프트 예시

```
components/Layout.tsx 파일의 헤더에 있는 "채널 분석" 버튼의 
배경색을 YouTube 레드(#FF0000)로 변경해주세요.
호버 시에는 조금 더 어두운 #CC0000으로 변경되도록 해주세요.
Tailwind CSS 클래스를 사용해주세요.
```

**장점:**
- 파일 경로 명시
- 정확한 색상 코드 제공
- 호버 상태까지 고려
- 사용할 기술(Tailwind) 명시

### 3-2. 프롬프트 작성 체크리스트

모든 프롬프트에 포함할 것:

- [ ] **파일 경로**: 어떤 파일을 수정할지
- [ ] **구체적 위치**: 파일 내 어느 부분인지
- [ ] **원하는 결과**: 정확히 무엇을 원하는지
- [ ] **제약조건**: 지켜야 할 규칙이 있는지
- [ ] **기술 스택**: 사용할 라이브러리/방법

### 3-3. 프롬프트 템플릿

```
[파일 경로] 파일에서
[위치 설명]의
[기능/UI 요소]를
[원하는 결과]로 수정해주세요.

조건:
- [조건 1]
- [조건 2]

예시:
- [구체적 예시]
```

---

## 4. 기능별 수정 가이드

### 4-1. UI/디자인 수정

#### 색상 변경

**프롬프트 예시:**

```
styles/globals.css 파일을 열어주세요.

현재 YouTube 레드 액센트(#FF0000)를 
블루 계열(#0066FF)로 변경하고 싶습니다.

다음 CSS 변수들을 수정해주세요:
- --youtube-red → --primary-blue
- 관련된 모든 색상 변수를 블루 계열로 조정

그리고 프로젝트 전체에서 YouTube 레드를 사용하는 
Tailwind 클래스(bg-[#FF0000] 등)를 찾아서 
새로운 색상으로 변경해주세요.
```

#### 레이아웃 변경

**프롬프트 예시:**

```
components/Layout.tsx 파일을 수정해주세요.

현재 왼쪽 사이드바 레이아웃을 상단 네비게이션 바로 변경하고 싶습니다.

요구사항:
1. 사이드바 제거
2. 상단에 수평 네비게이션 바 추가
3. 로고는 왼쪽에 배치
4. 메뉴 항목들은 중앙에 가로로 배치
5. API 키 설정 버튼은 오른쪽에 배치
6. 모바일에서는 햄버거 메뉴로 전환

참고:
- Tailwind CSS 사용
- 반응형 디자인 적용
- 기존 라우팅 로직은 유지
```

### 4-2. 기능 추가

#### 새로운 분석 기능 추가

**프롬프트 예시:**

```
채널의 댓글 분석 기능을 추가하고 싶습니다.

1. services/youtube-api.ts에 댓글 가져오기 함수 추가
   - 함수명: getVideoComments(videoId: string, apiKey: string)
   - YouTube Data API v3의 commentThreads.list 엔드포인트 사용
   - 최대 100개 댓글 가져오기

2. components/VideoDetail.tsx에 댓글 섹션 추가
   - 댓글 목록 표시
   - 좋아요 순 정렬
   - 페이지네이션 (10개씩)

3. 타입 정의
   - types/index.ts에 Comment 인터페이스 추가

제약사항:
- 기존 코드 스타일 유지
- 에러 처리 포함
- 로딩 상태 표시
- Tailwind CSS 사용
```

#### 내보내기 기능 개선

**프롬프트 예시:**

```
src/lib/export.ts 파일을 개선해주세요.

현재 CSV, JSON 내보내기를 지원하는데,
Excel(.xlsx) 형식도 추가하고 싶습니다.

방법:
1. xlsx 라이브러리 사용 (import { ... } from 'xlsx')
2. exportToExcel 함수 추가
3. 여러 시트 지원 (채널 정보, 영상 목록 등)
4. 셀 스타일링 적용 (헤더는 굵게, 숫자는 천단위 구분)

그리고 components/ChannelDetail.tsx에서
"Excel 내보내기" 버튼 추가해주세요.
```

### 4-3. 버그 수정

**프롬프트 예시:**

```
components/ChannelAnalysis.tsx 파일에서
채널 URL을 입력하지 않고 "분석 시작" 버튼을 눌렀을 때
에러가 발생합니다.

문제:
- 입력 검증이 없음
- 빈 값으로 API 호출 시도

수정 요청:
1. 폼 제출 시 입력값 검증 추가
2. 빈 값이면 toast로 "채널 URL을 입력해주세요" 메시지 표시
3. 제출 버튼 비활성화 상태 추가 (입력값 없으면 disabled)
4. URL 형식 검증 (youtube.com 또는 youtu.be 포함 여부)

참고:
- toast는 이미 import되어 있음 (from 'sonner')
- 기존 에러 처리 패턴 유지
```

### 4-4. 성능 최적화

**프롬프트 예시:**

```
components/channel/VideoTable.tsx 파일을
최적화하고 싶습니다.

문제:
- 영상이 100개 이상일 때 렌더링이 느림
- 스크롤 시 버벅임

해결 방법:
1. React.memo로 컴포넌트 메모이제이션
2. 가상 스크롤 구현 (react-window 라이브러리 사용)
3. useMemo로 정렬/필터링 결과 캐싱

제약사항:
- 기존 UI/UX 유지
- 테이블 정렬 기능 유지
- 모바일 반응형 유지
```

---

## 5. 자주 사용하는 프롬프트 템플릿

### 5-1. 컴포넌트 생성

```
새로운 컴포넌트를 만들어주세요.

파일 경로: src/components/[카테고리]/[ComponentName].tsx

기능:
- [기능 설명]

Props:
- [prop명]: [타입] - [설명]

UI:
- [UI 설명]

스타일:
- Tailwind CSS 사용
- 다크 네이비 배경(#1e293b)에 어울리는 디자인
- YouTube 레드(#FF0000) 액센트

참고할 비슷한 컴포넌트:
- [기존 컴포넌트 경로]
```

### 5-2. API 함수 추가

```
services/youtube-api.ts 파일에 새로운 API 함수를 추가해주세요.

함수명: [functionName]

파라미터:
- [param1]: [type] - [설명]
- apiKey: string

리턴 타입: Promise<[ReturnType]>

API 엔드포인트:
- [YouTube API 엔드포인트]

에러 처리:
- API 키 오류
- 네트워크 오류
- 할당량 초과 오류

기존 함수들의 에러 처리 패턴을 따라주세요.
```

### 5-3. 스타일 수정

```
[컴포넌트 경로] 파일의 스타일을 수정해주세요.

변경 사항:
1. [요소 설명]
   - 현재: [현재 스타일]
   - 변경: [원하는 스타일]

2. [요소 설명]
   - 현재: [현재 스타일]
   - 변경: [원하는 스타일]

조건:
- Tailwind CSS 클래스만 사용
- 반응형 고려 (sm:, md:, lg: 브레이크포인트)
- 다크모드 대응 (필요시)
- 기존 레이아웃 구조 유지
```

### 5-4. 타입 정의

```
types/index.ts 파일에 새로운 타입을 추가해주세요.

타입명: [TypeName]

필드:
- [field1]: [type] - [설명]
- [field2]: [type] - [설명]

이 타입은 [사용 목적]에 사용됩니다.

기존 타입과의 관계:
- [관련 타입]을 확장/참조
```

### 5-5. 리팩토링

```
[파일 경로] 파일을 리팩토링해주세요.

목표:
- 코드 가독성 향상
- 중복 코드 제거
- 타입 안정성 강화

리팩토링 방향:
1. [큰 함수]를 여러 작은 함수로 분리
2. 반복되는 로직을 유틸 함수로 추출
3. any 타입을 구체적 타입으로 변경
4. 매직 넘버/스트링을 상수로 분리

제약사항:
- 기능 동작은 정확히 동일하게 유지
- 기존 import/export 구조 유지
- 테스트 가능하도록 순수 함수로 작성
```

---

## 6. 주의사항 및 제약조건

### 6-1. 절대 수정하면 안 되는 것들

#### ❌ 금지 사항

1. **Shadcn UI 컴포넌트 직접 수정**
   ```
   components/ui/*.tsx 파일들은 수정하지 마세요.
   ```
   - 이유: Shadcn UI는 표준 컴포넌트로 일관성 유지 필요
   - 대신: 래퍼 컴포넌트를 만들어서 커스터마이징

2. **라우터 코어 로직 변경**
   ```
   src/lib/simple-router.tsx의 핵심 로직은 건드리지 마세요.
   ```
   - 이유: 자체 구현 라우터로 변경 시 전체 앱이 망가질 수 있음
   - 대신: 라우트 추가는 src/App.tsx에서만

3. **외부 CDN 의존성 추가**
   ```
   esm.sh, cdn.jsdelivr.net 등 CDN에서 라이브러리 로드 금지
   ```
   - 이유: 배포 환경에서 CDN fetch 에러 발생
   - 대신: npm install로 패키지 설치 후 import

4. **전역 CSS 변수 함부로 삭제**
   ```
   styles/globals.css의 CSS 변수는 신중하게 수정
   ```
   - 이유: 전체 디자인 시스템에 영향
   - 대신: 새로운 변수 추가는 OK, 기존 변수 삭제는 NG

### 6-2. 프로젝트별 규칙

#### ✅ 반드시 지켜야 할 규칙

1. **TypeScript 타입 안정성**
   ```typescript
   // ❌ 나쁜 예
   const data: any = fetchData();
   
   // ✅ 좋은 예
   const data: ChannelData = fetchData();
   ```

2. **에러 처리 패턴**
   ```typescript
   // 모든 API 호출은 try-catch로 감싸기
   try {
     const result = await youtubeApi.getChannel(channelId, apiKey);
     // 성공 처리
   } catch (error) {
     console.error('채널 정보 가져오기 실패:', error);
     toast.error('채널 정보를 가져올 수 없습니다.');
   }
   ```

3. **Tailwind CSS 사용**
   ```tsx
   // ❌ 인라인 스타일 사용 금지
   <div style={{ backgroundColor: '#1e293b' }}>
   
   // ✅ Tailwind 클래스 사용
   <div className="bg-slate-800">
   ```

4. **컴포넌트 파일 명명 규칙**
   ```
   PascalCase.tsx  ✅ (예: ChannelAnalysis.tsx)
   camelCase.tsx   ❌ (예: channelAnalysis.tsx)
   kebab-case.tsx  ❌ (예: channel-analysis.tsx)
   ```

5. **Import 순서**
   ```typescript
   // 1. React 관련
   import { useState, useEffect } from 'react';
   
   // 2. 외부 라이브러리
   import { toast } from 'sonner';
   
   // 3. 내부 컴포넌트
   import { Button } from './components/ui/button';
   
   // 4. 유틸/서비스
   import { youtubeApi } from './services/youtube-api';
   
   // 5. 타입
   import type { Channel } from './types';
   ```

### 6-3. Cursor에게 규칙 알려주기

**프로젝트 시작 시 Cursor에게 이렇게 말하세요:**

```
이 프로젝트의 코딩 규칙을 알려드립니다:

1. TypeScript를 사용하며 any 타입 사용을 최소화합니다
2. 모든 스타일은 Tailwind CSS로 작성합니다
3. 컴포넌트 파일명은 PascalCase를 사용합니다
4. API 호출은 반드시 try-catch로 감쌉니다
5. components/ui/* 파일은 수정하지 않습니다
6. 외부 CDN 의존성을 추가하지 않습니다
7. src/lib/simple-router.tsx는 신중하게 다룹니다

코드 작성 시 이 규칙들을 따라주세요.
```

---

## 7. 실전 시나리오별 프롬프트

### 7-1. 새로운 페이지 추가

**시나리오:** "트렌드 분석" 페이지 추가

```
새로운 "트렌드 분석" 페이지를 추가하겠습니다.

1단계: 컴포넌트 생성
components/TrendAnalysis.tsx 파일을 생성해주세요.

기능:
- 최근 인기 키워드 Top 10 표시
- 카테고리별 트렌드 차트
- 시간대별 업로드 추천

UI:
- 카드 레이아웃 (components/ChannelDetail.tsx 참고)
- 반응형 그리드 (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- 다크 네이비 배경, YouTube 레드 액센트

2단계: 라우트 추가
src/App.tsx에 라우트를 추가해주세요.
- 경로: /trend
- KeyGuard로 보호 (API 키 필요)

3단계: 네비게이션 추가
components/Layout.tsx의 사이드바에 메뉴 항목 추가
- 아이콘: TrendingUp (lucide-react)
- 순서: "키워드 분석"과 "기회 발견" 사이

4단계: 타입 정의
types/index.ts에 필요한 타입 추가
```

### 7-2. API 통합

**시나리오:** 채널의 재생목록 정보 가져오기

```
YouTube 채널의 재생목록 정보를 가져오는 기능을 추가하겠습니다.

1단계: API 함수 추가 (services/youtube-api.ts)

함수명: getChannelPlaylists

파라미터:
- channelId: string
- apiKey: string
- maxResults: number = 50

API 엔드포인트:
- https://www.googleapis.com/youtube/v3/playlists
- part: snippet,contentDetails
- 채널 ID로 필터링

리턴 타입: Promise<Playlist[]>

에러 처리:
- API 키 오류 → "API 키를 확인해주세요"
- 채널 없음 → "재생목록을 찾을 수 없습니다"
- 할당량 초과 → "API 할당량이 초과되었습니다"

2단계: 타입 정의 (types/index.ts)

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  publishedAt: string;
}

3단계: UI에 통합 (components/ChannelDetail.tsx)

재생목록 섹션 추가:
- 제목: "재생목록"
- 그리드 레이아웃으로 재생목록 카드 표시
- 각 카드: 썸네일, 제목, 영상 개수
- 클릭 시 YouTube에서 열기

4단계: 로딩/에러 상태 처리
- 로딩 중: Skeleton 컴포넌트 표시
- 에러: EmptyState 컴포넌트로 안내
```

### 7-3. 데이터 시각화 추가

**시나리오:** 채널 성장 추이 그래프

```
채널의 구독자 증가 추이를 보여주는 그래프를 추가하겠습니다.

주의: recharts 같은 외부 차트 라이브러리는 사용하지 마세요.
순수 CSS와 HTML로 구현해주세요.

1단계: 컴포넌트 생성
src/components/channel/GrowthChart.tsx 생성

Props:
- data: Array<{ date: string; subscribers: number }>

구현 방법:
- CSS Grid로 차트 영역 구성
- div 높이로 막대 그래프 표현
- Tailwind CSS 사용

기능:
- 호버 시 정확한 수치 툴팁 표시
- 최대/최소값 하이라이트
- 반응형 (모바일에서는 가로 스크롤)

2단계: 데이터 집계 함수
src/lib/aggregate.ts에 추가

함수명: aggregateSubscriberGrowth
- 영상 업로드 시점 기준으로 구독자 증가 추정
- 일별 데이터 반환

3단계: 통합
components/ChannelDetail.tsx에 그래프 섹션 추가
- "채널 성장 추이" 타이틀
- 기간 선택 (7일, 30일, 90일)
```

### 7-4. 사용성 개선

**시나리오:** 키보드 단축키 추가

```
키보드 단축키를 추가해서 사용성을 개선하겠습니다.

1단계: 단축키 훅 수정
src/hooks/useHotkeys.ts 파일을 확인하고 단축키 추가

추가할 단축키:
- Ctrl/Cmd + K: 채널 검색 포커스
- Ctrl/Cmd + /: 단축키 도움말 모달 열기
- Ctrl/Cmd + E: CSV 내보내기
- Esc: 모달 닫기

2단계: 도움말 모달 생성
src/components/HotkeyGuide.tsx 생성

UI:
- Dialog 컴포넌트 사용 (components/ui/dialog.tsx)
- 단축키 목록 테이블
- 키보드 키 스타일링 (<kbd> 태그)

3단계: 레이아웃에 통합
components/Layout.tsx에서:
- 헤더에 "?" 아이콘 버튼 추가
- 클릭 시 도움말 모달 열기
- useHotkeys 훅으로 Cmd+/ 처리

4단계: 접근성
- 모든 인터랙티브 요소에 aria-label 추가
- 키보드 포커스 표시 (ring-2 ring-red-500)
```

### 7-5. 모바일 최적화

**시나리오:** 테이블을 모바일에서 카드로 전환

```
components/channel/VideoTable.tsx를 모바일 친화적으로 개선하겠습니다.

현재 문제:
- 테이블이 모바일에서 가로 스크롤 발생
- 작은 화면에서 가독성 떨어짐

해결 방법:
반응형 디자인 적용:
- 데스크톱(lg:): 테이블 형태 유지
- 모바일(< lg): 카드 레이아웃으로 전환

구현:
1. 테이블 부분을 <div className="hidden lg:block">으로 감싸기

2. 모바일용 카드 레이아웃 추가
<div className="lg:hidden space-y-4">
  {videos.map(video => (
    <Card>
      {/* 비디오 정보 카드 */}
    </Card>
  ))}
</div>

3. 카드 내용:
- 썸네일 (상단)
- 제목
- 조회수, 좋아요, 댓글 (아이콘 + 숫자)
- 업로드 날짜
- 상세보기 버튼

4. 터치 제스처:
- 스와이프로 다음/이전 영상
- 길게 누르면 옵션 메뉴

제약:
- 기존 정렬/필터링 기능 유지
- 접근성 유지 (aria-labels)
```

---

## 8. 문제 해결 시나리오

### 8-1. Cursor가 잘못 이해했을 때

**상황:** Cursor가 엉뚱한 파일을 수정함

**해결 프롬프트:**

```
잠깐, 제가 요청한 것과 다릅니다.

제가 원한 것:
- [정확한 요구사항]

당신이 수정한 것:
- [Cursor가 한 작업]

다시 해주세요:
1. [정확한 파일 경로] 파일만 수정
2. [정확한 위치]의 [정확한 코드]만 변경
3. 다른 파일은 건드리지 마세요

예시를 보여드리겠습니다:
[원하는 코드 예시]
```

### 8-2. 컴파일 에러 발생

**상황:** Cursor가 생성한 코드에서 타입 에러

**해결 프롬프트:**

```
타입 에러가 발생했습니다:

에러 메시지:
[에러 메시지 복사]

에러 위치:
[파일명]:[라인]

원인 분석:
[에러 원인 설명]

수정 요청:
1. types/index.ts에서 해당 타입 확인
2. 누락된 필드 추가
3. 옵셔널(?)이 필요한지 확인
4. import 문 확인

TypeScript strict 모드를 고려해서 수정해주세요.
```

### 8-3. 스타일이 깨짐

**상황:** 레이아웃이 망가짐

**해결 프롬프트:**

```
레이아웃이 깨졌습니다.

문제:
- [어떤 부분이 깨졌는지]

원래 모습:
- [원래 어떻게 보여야 하는지]

확인 사항:
1. Tailwind 클래스 충돌 여부
2. flex/grid 레이아웃 설정
3. 반응형 브레이크포인트
4. z-index 문제

[기존에 잘 작동하던 컴포넌트 이름]을 참고해서
동일한 레이아웃 패턴을 적용해주세요.
```

### 8-4. 성능 문제

**상황:** 앱이 느려짐

**해결 프롬프트:**

```
[컴포넌트명]에서 성능 문제가 발생합니다.

증상:
- [느려지는 상황]
- [몇 초 걸리는지]

의심되는 원인:
- 불필요한 리렌더링
- 무거운 연산
- 큰 리스트 렌더링

최적화 요청:
1. React DevTools Profiler로 확인할 포인트
2. 적용할 최적화 기법:
   - React.memo
   - useMemo
   - useCallback
   - 가상 스크롤
3. 변경 전/후 성능 측정 방법

단, 기능은 정확히 동일하게 유지해주세요.
```

---

## 9. 고급 활용법

### 9-1. 컨텍스트 파일 지정

**대규모 수정 시 관련 파일들을 명시:**

```
다음 파일들을 참고해서 작업해주세요:

@src/App.tsx
@components/Layout.tsx
@src/lib/simple-router.tsx

이 세 파일의 라우팅 구조를 파악한 후,
새로운 "/settings" 라우트를 추가해주세요.

일관된 패턴을 유지하면서 작업해주세요.
```

### 9-2. 다단계 작업 지시

**복잡한 작업을 단계별로:**

```
여러 단계로 작업을 진행하겠습니다.
각 단계를 완료한 후 다음 단계로 넘어가주세요.

=== 1단계: 타입 정의 ===
types/index.ts에 Settings 인터페이스 추가
- theme: 'light' | 'dark'
- language: 'ko' | 'en'
- notifications: boolean

완료되면 "1단계 완료"라고 말해주세요.

=== 2단계: 스토리지 함수 ===
(1단계 완료 후 진행)

=== 3단계: UI 컴포넌트 ===
(2단계 완료 후 진행)
```

### 9-3. 코드 리뷰 요청

```
방금 수정한 코드를 리뷰해주세요:

확인 사항:
1. TypeScript 타입 안정성
2. 에러 처리 누락 여부
3. 접근성 (a11y)
4. 성능 이슈 가능성
5. 보안 문제

개선 사항이 있다면 제안해주세요.
```

### 9-4. 테스트 케이스 작성 요청

```
[함수명] 함수에 대한 테스트 케이스를 작성해주세요.

프레임워크: Jest
위치: [파일명].test.ts

테스트 항목:
1. 정상 케이스
2. 에러 케이스 (빈 값, null, undefined)
3. 경계값 테스트
4. 비동기 처리

예상 커버리지: 80% 이상
```

---

## 10. 프로젝트별 체크리스트

### 10-1. 새 기능 추가 체크리스트

새로운 기능을 추가할 때 확인:

- [ ] **타입 정의** (types/index.ts)
- [ ] **API 함수** (services/*.ts) - 필요시
- [ ] **비즈니스 로직** (src/lib/*.ts)
- [ ] **컴포넌트** (components/*.tsx 또는 src/components/*.tsx)
- [ ] **라우팅** (src/App.tsx) - 새 페이지일 경우
- [ ] **네비게이션** (components/Layout.tsx) - 메뉴 항목 추가
- [ ] **에러 처리** (try-catch, EmptyState)
- [ ] **로딩 상태** (Skeleton, Spinner)
- [ ] **반응형 디자인** (sm:, md:, lg:)
- [ ] **접근성** (aria-labels, keyboard navigation)
- [ ] **타입 안정성 확인** (no `any`, strict null checks)

### 10-2. 코드 작성 후 체크리스트

코드를 작성한 후:

- [ ] **컴파일 에러 없음** (TypeScript)
- [ ] **import 정리됨** (사용하지 않는 import 제거)
- [ ] **console.log 제거됨** (디버깅용 코드 정리)
- [ ] **주석 작성됨** (복잡한 로직에만)
- [ ] **네이밍 일관성** (camelCase, PascalCase)
- [ ] **파일 크기 적절** (500줄 이하 권장)
- [ ] **재사용성 고려** (공통 로직은 유틸 함수로)
- [ ] **보안 고려** (API 키 노출 방지, XSS 방어)

### 10-3. 배포 전 체크리스트

배포하기 전:

- [ ] **빌드 성공** (`npm run build`)
- [ ] **타입 체크 통과** (`tsc --noEmit`)
- [ ] **로컬 테스트 완료** (주요 기능 동작 확인)
- [ ] **API 키 하드코딩 제거** (환경변수 사용)
- [ ] **외부 CDN 의존성 없음** (esm.sh, cdn.jsdelivr.net)
- [ ] **브라우저 콘솔 에러 없음**
- [ ] **모바일 반응형 확인**
- [ ] **주요 브라우저 테스트** (Chrome, Safari, Firefox)

---

## 11. 추가 리소스

### 11-1. 참고 문서

**프로젝트 내부 문서:**
- `/README.md` - 프로젝트 개요
- `/배포_완벽_가이드.md` - 배포 가이드
- `/QUICK_REFERENCE.md` - 빠른 참조

**외부 문서:**
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [React Docs](https://react.dev)

### 11-2. 유용한 Cursor 단축키

| 단축키 | 기능 |
|--------|------|
| `Cmd/Ctrl + K` | AI 편집 |
| `Cmd/Ctrl + L` | AI 채팅 |
| `Cmd/Ctrl + I` | 인라인 편집 |
| `Cmd/Ctrl + Shift + P` | 명령 팔레트 |
| `Cmd/Ctrl + P` | 파일 찾기 |
| `Cmd/Ctrl + F` | 파일 내 검색 |
| `Cmd/Ctrl + Shift + F` | 전체 검색 |

---

## 12. 마무리

### 좋은 Cursor 사용 습관

1. **구체적으로 요청하기**
   - 파일 경로 명시
   - 원하는 결과 상세 설명
   - 제약조건 명확히

2. **한 번에 하나씩**
   - 복잡한 작업은 단계별로
   - 각 단계 확인 후 다음 진행

3. **컨텍스트 제공**
   - 관련 파일 지정 (@파일명)
   - 기존 패턴 참고하도록 안내

4. **피드백 제공**
   - 잘못된 결과는 명확히 지적
   - 좋은 결과는 학습하도록 확인

5. **문서 업데이트**
   - 새로운 패턴 발견 시 이 문서에 추가
   - 팀과 공유

---

## 📞 도움이 필요하면

Cursor가 막히면:

1. **프롬프트 재작성**: 더 구체적으로
2. **예시 제공**: 원하는 코드 예시 보여주기
3. **파일 지정**: @파일명으로 컨텍스트 제공
4. **단계별 분리**: 복잡한 작업을 작은 단위로

**이 가이드를 활용해서 효율적으로 개발하세요! 🚀**
