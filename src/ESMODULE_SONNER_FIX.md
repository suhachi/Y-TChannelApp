# ESM CDN Dependency Fix - Sonner Toast

## 문제 상황
esm.sh CDN에서 `sonner@2.0.3` 의존성 로드 실패로 빌드 에러 발생:
- `/src/components/ApiKeyGuide.tsx:8:22: ERROR: [plugin: npm] Failed to fetch`
- `/src/components/channel/VideoTable.tsx:7:`: sonner import 실패

## 해결 방법
외부 `sonner` 패키지 대신 프로젝트 내 네이티브 toast 구현체 사용

### 수정된 파일

#### 1. `/src/components/ApiKeyGuide.tsx`
```typescript
// Before
import { toast } from 'sonner@2.0.3';

// After
import { toast } from '../../components/ui/sonner';
```

#### 2. `/src/components/channel/VideoTable.tsx`
```typescript
// Before
import { toast } from 'sonner@2.0.3';

// After
import { toast } from '../../../components/ui/sonner';
```

## 네이티브 Toast 구현체 위치
`/components/ui/sonner.tsx` - 외부 의존성 없이 순수 React로 구현된 toast 시스템
- `toast.success()`, `toast.error()`, `toast.info()` 메서드 제공
- 애니메이션 및 자동 제거 기능 포함
- `Toaster` 컴포넌트는 App.tsx에서 렌더링됨

## 검증 완료
✅ 모든 lucide-react imports 제거 완료 (네이티브 SVG 아이콘 사용)
✅ 모든 sonner imports 네이티브 구현체로 교체 완료
✅ clsx, tailwind-merge 등 기타 CDN 의존성 제거 완료
✅ react-hook-form@7.55.0만 버전 지정 유지 (필수 요구사항)

## 빌드 상태
모든 ESM CDN 의존성 에러 해결 완료. 프로젝트가 정상적으로 빌드 및 실행 가능한 상태입니다.
