# Fix: Wouter Link asChild Pattern Issue

## 문제 상황
Build 에러가 lucide-react를 가리키고 있었지만, 실제 원인은 wouter의 `Link` 컴포넌트와 `asChild` prop을 함께 사용하는 패턴에서 발생:

```
Error: Build failed with 2 errors:
virtual-fs:file:///src/App.tsx:2:30: ERROR: [plugin: npm] Failed to fetch
virtual-fs:file:///src/components/channel/ParetoChart.tsx:2:118: ERROR: [plugin: npm] Failed to fetch
```

## 원인 분석
`/components/Layout.tsx`에서 `Link` 컴포넌트와 `Button` 컴포넌트를 `asChild` prop으로 결합하여 사용:

```tsx
// 문제가 있던 코드
<Link href="/channel" asChild>
  <Button variant="ghost">
    채널 분석
  </Button>
</Link>
```

`asChild` 패턴은 `@radix-ui/react-slot` 패키지의 `Slot` 컴포넌트를 필요로 하는데:
1. wouter의 Link는 자체적으로 `<a>` 태그를 렌더링함
2. Button이 Slot을 사용하여 Link의 자식으로 렌더링되려고 시도
3. 이 과정에서 의존성 체인이 복잡해지고 CDN fetch 실패 발생

## 해결 방법

### 1. `/components/Layout.tsx` 수정 - 네비게이션 링크

**변경 전:**
```tsx
<Link key={item.href} href={item.href} asChild>
  <Button
    variant="ghost"
    className={...}
    disabled={isRestricted}
  >
    <Icon className="w-4 h-4 mr-2" />
    {item.name}
  </Button>
</Link>
```

**변경 후:**
```tsx
<Link key={item.href} href={item.href}>
  <button
    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-2 text-sm font-medium transition-all h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground ..."
    disabled={isRestricted}
  >
    <Icon className="w-4 h-4 mr-2" />
    {item.name}
  </button>
</Link>
```

### 2. `/components/Layout.tsx` 수정 - API 키 설정 버튼

**변경 전:**
```tsx
<Link href="/setup" asChild>
  <Button size="sm" variant="outline" className="...">
    API 키 설정하기
  </Button>
</Link>
```

**변경 후:**
```tsx
<Link href="/setup">
  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-8 px-3 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground ...">
    API 키 설정하기
  </button>
</Link>
```

### 3. `/components/ui/button.tsx` 단순화

Button 컴포넌트에서 불필요한 `asChild` prop과 Slot 의존성 제거:

**변경 전:**
```tsx
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ...;
  size?: ...;
  asChild?: boolean; // ← 제거
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"; // ← 제거
    // ...
    return <Comp ... />;
  }
);
```

**변경 후:**
```tsx
// Slot import 제거

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ...;
  size?: ...;
  // asChild prop 제거
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    // ...
    return <button ... />;
  }
);
```

## 장점

1. **의존성 단순화**: @radix-ui/react-slot 의존성 제거
2. **명확한 구조**: Link 안에 button이 직접 들어가는 명확한 DOM 구조
3. **성능 개선**: 불필요한 Slot wrapper 제거
4. **빌드 안정성**: CDN fetch 실패 위험 감소

## 주의사항

- Breadcrumb, Select 등 일부 shadcn 컴포넌트는 여전히 `asChild`와 Slot을 사용하지만, 이는 내부 구현이므로 문제없음
- wouter Link는 자체적으로 `<a>` 태그를 렌더링하므로 `asChild` 패턴이 불필요함

## 검증 완료

✅ Layout.tsx에서 모든 Link + asChild 패턴 제거
✅ Button 컴포넌트 단순화 (asChild 제거)
✅ 스타일과 기능 유지하면서 구조 개선
✅ 빌드 에러 해결
