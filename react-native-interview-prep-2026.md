# React Native Interview Prep 2026

> **Last Updated:** January 2026 | **React Native:** 0.76+ | **Expo SDK:** 53+ | **New Architecture:** Fabric & TurboModules

---

## Table of Contents

1. [Core Concepts](#1-core-concepts-50-questions)
2. [State Management](#2-state-management-20-questions)
3. [Navigation & Routing](#3-navigation--routing-15-questions)
4. [Performance & Optimization](#4-performance--optimization-25-questions)
5. [Animations & Gestures](#5-animations--gestures-15-questions)
6. [Native Modules & Bridges](#6-native-modules--bridges-20-questions)
7. [Testing & CI/CD](#7-testing--cicd-15-questions)
8. [Deployment & Stores](#8-deployment--stores-10-questions)
9. [Architecture & Best Practices](#9-architecture--best-practices-20-questions)
10. [Hot Topics 2026](#10-hot-topics-2026-15-questions)
11. [Coding Challenges](#coding-challenges-10-tasks)
12. [Resources & Cheat Sheets](#resources--cheat-sheets)

---

## 1. Core Concepts (50 Questions)

### Fundamentals

**Q1. 🟢 What is React Native and how does it differ from React?**

React Native is a framework for building native mobile applications using JavaScript and React. Unlike React (for web), React Native renders to native UI components instead of DOM elements. In 2026, RN 0.76+ uses the New Architecture by default, providing near-native performance through Fabric renderer and TurboModules.

**Q2. 🟢 Explain the Virtual DOM concept in React Native context.**

React Native doesn't use a Virtual DOM like React web. Instead, it uses a shadow tree that maps to native views. With Fabric (New Architecture), this shadow tree is created in C++ and can be accessed synchronously from both JavaScript and native threads, eliminating the async bridge bottleneck.

**Q3. 🟢 What is the difference between `props` and `state`?**

Props are immutable data passed from parent to child components, while state is mutable data managed within a component. In 2026, prefer using `useState` for local state and external stores (Zustand/Jotai) for shared state.

```tsx
// Props - passed from parent
const Button = ({ title, onPress }: ButtonProps) => (
  <Pressable onPress={onPress}><Text>{title}</Text></Pressable>
);

// State - managed internally
const [count, setCount] = useState(0);
```

**Q4. 🟢 How does Flexbox work in React Native?**

React Native uses Flexbox for layout with `flexDirection: 'column'` as default (unlike web's row). All dimensions are unitless and represent density-independent pixels. The Yoga layout engine handles cross-platform consistency.

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16, // gap support added in RN 0.71+
  },
});
```

**Q5. 🟢 What are the core components in React Native?**

Core components include `View` (container), `Text` (text display), `Image` (images), `ScrollView` (scrollable container), `TextInput` (input fields), `Pressable` (touch handling - preferred over TouchableOpacity in 2026), and `FlatList`/`FlashList` (virtualized lists).

**Q6. 🟢 Explain the purpose of `StyleSheet.create()`.**

`StyleSheet.create()` validates styles at compile time, enables style ID optimization, and provides better debugging. In 2026, consider using Tamagui or NativeWind v4 for more powerful styling with design tokens.

```tsx
// Traditional
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

// NativeWind v4 (2026)
<View className="flex-1 bg-white dark:bg-slate-900" />
```

**Q7. 🟡 What is the difference between `ScrollView` and `FlatList`?**

`ScrollView` renders all children at once (suitable for small lists <100 items), while `FlatList` virtualizes rendering for performance. In 2026, use `FlashList` from Shopify for 10x better performance than FlatList with automatic cell recycling.

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

**Q8. 🟡 How do you handle platform-specific code?**

Use `Platform.OS`, `Platform.select()`, or platform-specific file extensions (`.ios.tsx`, `.android.tsx`). In 2026, Expo's platform-specific modules and React Native for Web handle this elegantly.

```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  }),
});
```

**Q9. 🟡 Explain the `useEffect` cleanup pattern in React Native.**

Cleanup functions prevent memory leaks by canceling subscriptions, timers, and async operations when components unmount. Critical for navigation scenarios where screens may unmount while fetches are pending.

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal })
    .then(setData)
    .catch(e => {
      if (e.name !== 'AbortError') console.error(e);
    });

  return () => controller.abort();
}, []);
```

**Q10. 🟡 What is the purpose of `useMemo` and `useCallback`?**

`useMemo` memoizes computed values, `useCallback` memoizes functions. Use them to prevent unnecessary re-renders when passing to child components or expensive computations. In 2026, React Compiler (React Forget) auto-memoizes in many cases.

```tsx
// useMemo - expensive computation
const sortedItems = useMemo(() =>
  items.sort((a, b) => a.price - b.price),
  [items]
);

// useCallback - stable function reference
const handlePress = useCallback((id: string) => {
  navigation.navigate('Details', { id });
}, [navigation]);
```

**Q11. 🟡 How does `useRef` work and when should you use it?**

`useRef` creates a mutable reference that persists across renders without causing re-renders. Use for DOM/native refs, storing previous values, or mutable values that don't need reactivity.

```tsx
const inputRef = useRef<TextInput>(null);
const intervalRef = useRef<NodeJS.Timeout>();

const focusInput = () => inputRef.current?.focus();

useEffect(() => {
  intervalRef.current = setInterval(tick, 1000);
  return () => clearInterval(intervalRef.current);
}, []);
```

**Q12. 🟡 Explain the difference between controlled and uncontrolled components.**

Controlled components have their state managed by React (value + onChange), while uncontrolled components manage their own state internally. In React Native, prefer controlled `TextInput` for form validation and data flow predictability.

```tsx
// Controlled
const [text, setText] = useState('');
<TextInput value={text} onChangeText={setText} />

// Uncontrolled (rare in RN)
const inputRef = useRef<TextInput>(null);
const getValue = () => inputRef.current?.value;
```

**Q13. 🟡 What are React Native's threading models?**

RN operates on three threads: JS thread (business logic), Main/UI thread (native rendering), and Shadow thread (layout calculations). With New Architecture, JSI enables synchronous communication, and worklets can run JS directly on UI thread.

**Q14. 🟡 How do you handle keyboard events and avoidance?**

Use `KeyboardAvoidingView` with platform-specific behavior, or `react-native-keyboard-controller` (2026 recommended) for more control. Expo SDK 53+ includes improved keyboard handling APIs.

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
>
  <TextInput placeholder="Type here..." />
</KeyboardAvoidingView>
```

**Q15. 🔴 Explain the Fiber Architecture in React Native.**

Fiber is React's completely rewritten reconciliation algorithm, introduced in React 16 and forming the foundation of modern React Native architecture. Unlike the old stack reconciler, which processed rendering synchronously and couldn't be interrupted, Fiber represents an incremental architecture that allows breaking work into small units (fibers).

**Key Fiber Concepts:**
1. **Work Units**: Each component is represented by a fiber node containing information about the component, its props, state, and connections to other nodes.
2. **Double Buffering**: Fiber maintains two trees — current (displayed) and workInProgress (being built), allowing atomic switching between them.
3. **Update Priorities**: Updates are classified by urgency (Immediate, UserBlocking, Normal, Low, Idle), allowing React to process important updates first.
4. **Interruptibility**: Rendering can be paused to handle higher-priority tasks (e.g., user input), then resumed.

In RN 0.76+, Fiber is tightly integrated with Fabric, the new renderer. When Fiber determines changes in the virtual tree, it passes commands to Fabric for synchronous updates to the native C++ shadow tree, providing faster and more predictable UI rendering.

**Q16. 🔴 What is Concurrent Rendering in React Native?**

Concurrent Rendering allows React to prepare multiple UI versions simultaneously without blocking the main thread. Enabled via `<Suspense>` and `startTransition`. In RN 0.76+, it's production-ready with Fabric.

```tsx
import { Suspense, startTransition } from 'react';

const [query, setQuery] = useState('');

const handleSearch = (text: string) => {
  startTransition(() => {
    setQuery(text); // Low priority update
  });
};

<Suspense fallback={<LoadingSpinner />}>
  <SearchResults query={query} />
</Suspense>
```

**Q17. 🔴 How does Suspense work in React Native 2026?**

Suspense enables declarative loading states for async operations. Components can "suspend" while waiting for data, showing fallback UI. Works with React Query, Relay, and custom data fetching with `use()` hook.

```tsx
import { Suspense, use } from 'react';

function UserProfile({ userPromise }) {
  const user = use(userPromise); // Suspends until resolved
  return <Text>{user.name}</Text>;
}

<Suspense fallback={<Skeleton />}>
  <UserProfile userPromise={fetchUser(id)} />
</Suspense>
```

**Q18. 🔴 Explain the component lifecycle with Hooks.**

Modern React Native uses hooks instead of lifecycle methods. `useEffect` with empty deps = componentDidMount, with deps = componentDidUpdate, cleanup = componentWillUnmount. `useLayoutEffect` runs synchronously after DOM mutations.

```tsx
useEffect(() => {
  // Mount logic
  return () => {
    // Unmount cleanup
  };
}, []);

useLayoutEffect(() => {
  // Sync layout measurements before paint
}, []);
```

**Q19. 🟢 What is the purpose of `key` prop in lists?**

Keys help React identify which items changed, added, or removed. Use stable, unique identifiers (database IDs), never array indices for dynamic lists. Poor keys cause performance issues and bugs with component state.

```tsx
// ✅ Good - stable unique ID
{items.map(item => <Item key={item.id} data={item} />)}

// ❌ Bad - index as key for dynamic lists
{items.map((item, index) => <Item key={index} data={item} />)}
```

**Q20. 🟡 How do you implement error boundaries in React Native?**

Error boundaries catch JavaScript errors in component trees. Use class components with `getDerivedStateFromError` and `componentDidCatch`, or `react-error-boundary` library for hooks-based approach.

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View>
      <Text>Something went wrong: {error.message}</Text>
      <Button title="Try again" onPress={resetErrorBoundary} />
    </View>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### Advanced Core Concepts

**Q21. 🔴 What is the New Architecture in React Native 0.76+?**

The New Architecture is a fundamental reimagining of React Native's internals, developed by Meta since 2018 and becoming standard in RN 0.76+. It solves the main problem of the old architecture — the asynchronous bridge between JavaScript and native code, which created delays and limited performance.

**Four Pillars of New Architecture:**

1. **JSI (JavaScript Interface)**: A lightweight C++ API allowing JavaScript to directly call native functions without JSON serialization. This is the foundation of the entire architecture, enabling synchronous calls and shared memory.

2. **Fabric**: The new renderer managing UI. The shadow tree is now created in C++ and accessible synchronously from both threads. Supports rendering priorities and concurrent React 18+ features.

3. **TurboModules**: Next-generation native modules with lazy initialization — a module loads only on first use. Type safety is ensured through Codegen.

4. **Codegen**: A tool generating native interfaces (Swift/Kotlin/C++) from TypeScript specifications at build time, eliminating runtime type mismatch errors.

**Practical Benefits:**
- App startup time reduced by 30-50%
- Synchronous communication eliminates "jank" during complex interactions
- Reanimated worklets can execute JS code directly on the UI thread
- Ability to use C++ for cross-platform business logic

**Q22. 🔴 Explain JSI (JavaScript Interface).**

JSI (JavaScript Interface) is a revolutionary component of the New Architecture, representing a thin C++ abstraction layer over the JavaScript engine. Unlike the old bridge, JSI allows JavaScript code to directly interact with native objects without serialization overhead.

**Key JSI Capabilities:**

1. **Direct Synchronous Calls**: JavaScript can call native functions synchronously, without delays from async bridge transmission. This is critical for animations and gesture handling.

2. **Shared Memory**: Data can be passed by reference, not copied. For example, a TypedArray from JavaScript can directly point to a native memory buffer.

3. **Host Objects**: C++ objects accessible from JavaScript with lazy property evaluation. They don't require pre-serializing all data.

4. **Engine Independence**: JSI abstracts the specific JS engine (Hermes, JavaScriptCore, V8), allowing React Native to work with any of them.

**How JSI Works:**
- Native code registers Host Objects in the JavaScript runtime
- JavaScript accesses these objects as regular JS objects
- When accessing a property/method, corresponding C++ code is called synchronously
- Result is returned directly, without going through the bridge

```cpp
// JSI Host Object example
class MyModule : public jsi::HostObject {
  jsi::Value get(jsi::Runtime& rt, const jsi::PropNameID& name) override {
    if (name.utf8(rt) == "multiply") {
      return jsi::Function::createFromHostFunction(
        rt,
        name,
        2, // number of arguments
        [](jsi::Runtime& rt, const jsi::Value& thisVal,
           const jsi::Value* args, size_t count) -> jsi::Value {
          double a = args[0].asNumber();
          double b = args[1].asNumber();
          return jsi::Value(a * b);
        });
    }
    return jsi::Value::undefined();
  }
};

// Usage from JavaScript
const result = MyModule.multiply(5, 3); // Synchronous call!
```

**Q23. 🔴 What is Fabric renderer?**

Fabric is React Native's completely rewritten rendering system, created to work with JSI and React's concurrent features. It replaces the old Paper renderer and solves its fundamental limitations.

**Problems with the Old Renderer (Paper):**
- Asynchronous bridge communication created delays
- Shadow tree was managed by a separate Shadow thread, complicating synchronization
- Couldn't interrupt or prioritize rendering
- Difficulties measuring elements for animations

**How Fabric Works:**

1. **C++ Shadow Tree**: The shadow tree is now created and managed in C++, accessible synchronously from both JavaScript and native threads. This eliminates the need for async communication for layout operations.

2. **Immutable Tree Diffing**: Fabric creates immutable versions of the tree and efficiently computes differences between them, determining the minimal set of native operations.

3. **Priority Rendering**: Priority support allows urgent updates (user input) to interrupt less important ones (background data loading).

4. **Synchronous Measurements**: JavaScript can synchronously get element sizes and positions, which is critical for animations and Reanimated worklets.

5. **Renderer Interop**: Fabric can work alongside the old Paper renderer, ensuring smooth migration.

**Q24. 🔴 How does Codegen work?**

Codegen is an automatic code generation system that creates type-safe native interfaces from TypeScript/Flow specifications. It's a key component of the New Architecture, providing a "contract" between JavaScript and native code.

**Why Codegen is Needed:**
- In the old architecture, types were only checked at runtime, leading to hard-to-catch bugs
- Codegen moves type checking to compile time
- Generated code is optimized without runtime checks
- Ensures correspondence between JS interface and native implementation

**The Process:**

1. **Writing Specification**: Developer describes the module interface in TypeScript using special types from react-native.

2. **Parsing**: Codegen analyzes the TypeScript AST and extracts information about types, methods, and their signatures.

3. **Generation**: Based on the spec, files are created for each platform:
   - C++ headers with abstract classes
   - ObjC++/Swift interfaces for iOS
   - Java/Kotlin interfaces for Android

4. **Binding**: Developer implements the generated interfaces in native code, and the compiler checks type correspondence.

**Supported Types:**
- Primitives: `number`, `string`, `boolean`
- Nullable: `?string`, `string | null`
- Objects and arrays with typing
- Promises for async operations
- Callbacks

```tsx
// NativeMyModule.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  getConstants(): { version: string };
}

export default TurboModuleRegistry.getEnforcing<Spec>('MyModule');
```

**Q25. 🟡 What is Hermes and its benefits in 2026?**

Hermes is Meta's JavaScript engine optimized for React Native. In 2026, Hermes 1.0 includes bytecode precompilation, improved garbage collection, and optional JIT compilation for 30-50% faster startup and reduced memory usage.

**Q26. 🟡 Explain the difference between Hermes AOT and JIT modes.**

AOT (Ahead-of-Time) compiles JS to bytecode at build time for faster startup. JIT (Just-in-Time) compiles hot code paths at runtime for better peak performance. Hermes 1.0 supports both, with AOT default for production.

**Q27. 🟡 How do you create a custom hook?**

Custom hooks extract reusable stateful logic. Prefix with `use`, can use other hooks, and return values/functions needed by components. Essential for code organization in 2026 apps.

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 300);
```

**Q28. 🟡 What is the Context API and when should you use it?**

Context provides a way to pass data through the component tree without prop drilling. Use for global data (theme, auth, locale), but avoid for frequently changing data—use Zustand/Jotai instead for better performance.

```tsx
const ThemeContext = createContext<Theme>('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);
```

**Q29. 🔴 Explain React's reconciliation algorithm.**

Reconciliation is the process by which React determines which parts of the UI need to be updated when state changes. Since a full comparison of two trees has O(n³) complexity, React uses heuristics that reduce it to O(n).

**Two Key Heuristics:**

1. **Elements of different types produce different trees**: If the root element changed type (e.g., from `<div>` to `<span>` or from `<ComponentA>` to `<ComponentB>`), React completely destroys the old subtree and builds a new one from scratch.

2. **Keys indicate stable elements**: When rendering lists, keys help React understand which element is which, even if the order changed. Without keys, React matches elements by index.

**The Reconciliation Process:**

1. **Comparing Root Elements**: React starts at the root and determines the update type.

2. **DOM Elements of Same Type**: React preserves the node and only updates changed attributes, then recursively processes children.

3. **Components of Same Type**: React updates the instance's props, calls render() and recursively reconciles the result.

4. **Processing Children**: When traversing a list of children, React compares elements pairwise. Keys are critical — they allow React to efficiently reorder elements instead of recreating them.

**Fiber and Reconciliation:**
With Fiber architecture, reconciliation became incremental — work is broken into units (fibers) that can be paused and resumed. This allows React to prioritize urgent updates (animations, input) over less important ones (background data loading).

**Q30. 🔴 What are render props and when to use them in 2026?**

Render props pass a function as prop to share code between components. Less common in 2026 due to hooks, but still useful for libraries like React Query's render prop pattern or animation libraries.

```tsx
// Render prop pattern
<DataFetcher url="/api/users">
  {({ data, loading, error }) =>
    loading ? <Spinner /> : <UserList users={data} />
  }
</DataFetcher>

// Modern equivalent with hooks
const { data, loading, error } = useDataFetcher('/api/users');
```

**Q31. 🟡 How do you handle deep linking in React Native?**

Deep linking maps URLs to screens. Use Expo Router's file-based routing or React Navigation's linking config. Configure URL schemes in app.json/config and handle incoming links.

```tsx
// Expo Router - automatic file-based deep links
// app/user/[id].tsx → myapp://user/123

// React Navigation config
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      User: 'user/:id',
      Settings: 'settings',
    },
  },
};
```

**Q32. 🟢 What is the difference between `memo` and `useMemo`?**

`React.memo` is an HOC that memoizes component rendering based on prop changes. `useMemo` memoizes values within a component. Use `memo` for expensive child components, `useMemo` for expensive computations.

```tsx
// memo - memoize component
const ExpensiveList = memo(({ items }) => (
  <FlashList data={items} renderItem={renderItem} />
));

// useMemo - memoize value
const filteredItems = useMemo(() =>
  items.filter(i => i.active),
  [items]
);
```

**Q33. 🟡 Explain `useImperativeHandle` hook.**

`useImperativeHandle` customizes the instance value exposed to parent when using `ref`. Useful for exposing specific methods from child components while keeping internal implementation private.

```tsx
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => inputRef.current?.clear(),
    getValue: () => inputRef.current?.value,
  }));

  return <TextInput ref={inputRef} {...props} />;
});
```

**Q34. 🔴 What is `useSyncExternalStore` and when to use it?**

`useSyncExternalStore` safely subscribes to external stores with concurrent rendering support. Used internally by state management libraries (Zustand, Redux) for React 18+ compatibility.

```tsx
const useOnlineStatus = () => {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine, // Client
    () => true // Server
  );
};
```

**Q35. 🟢 How do you handle images in React Native?**

Use `Image` component with `source` prop for local/remote images. In 2026, use `expo-image` for better caching, blur hash placeholders, and format optimization.

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  style={{ width: 200, height: 200 }}
/>
```

**Q36. 🟡 Explain the SafeAreaView and its alternatives in 2026.**

`SafeAreaView` handles device notches/home indicators. In 2026, use `react-native-safe-area-context` for more control, or Tamagui/NativeWind's built-in safe area utilities.

```tsx
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Provider approach
<SafeAreaView edges={['top', 'bottom']}>
  <Content />
</SafeAreaView>

// Hook approach for granular control
const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top }}>
```

**Q37. 🟡 What are portals and how do they work in React Native?**

Portals render children outside the parent hierarchy. In RN, use `@gorhom/portal` or modal components. Useful for tooltips, modals, and overlays that need to escape parent clipping.

```tsx
import { Portal, PortalProvider } from '@gorhom/portal';

<PortalProvider>
  <App />
  <Portal name="modal">
    <Modal />
  </Portal>
</PortalProvider>
```

**Q38. 🔴 How does React Native handle accessibility?**

Use accessibility props: `accessible`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`. In 2026, follow WCAG 2.2 guidelines and test with TalkBack/VoiceOver.

```tsx
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Add item to cart"
  accessibilityHint="Double tap to add this product to your shopping cart"
  accessibilityState={{ disabled: !inStock }}
  onPress={addToCart}
>
  <Text>Add to Cart</Text>
</Pressable>
```

**Q39. 🟢 What is the difference between `Pressable` and `TouchableOpacity`?**

`Pressable` is the modern API (RN 0.63+) with more flexibility—supports pressed states, hover (web), and custom feedback. `TouchableOpacity` is legacy. Always prefer `Pressable` in 2026.

```tsx
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed
  ]}
  android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
>
  {({ pressed }) => (
    <Text style={pressed ? styles.textPressed : styles.text}>
      Press Me
    </Text>
  )}
</Pressable>
```

**Q40. 🟡 How do you handle app state (foreground/background)?**

Use `AppState` API to detect app state changes. Critical for pausing animations, saving data, or refreshing content when returning to foreground.

```tsx
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', state => {
    if (state === 'active') {
      refreshData();
    } else if (state === 'background') {
      saveProgress();
    }
  });

  return () => subscription.remove();
}, []);
```

**Q41. 🟡 Explain the Dimensions API and responsive design.**

`Dimensions` provides screen/window dimensions. In 2026, prefer `useWindowDimensions` hook for reactive updates, or use responsive libraries like Tamagui's media queries.

```tsx
import { useWindowDimensions } from 'react-native';

const { width, height } = useWindowDimensions();
const isTablet = width >= 768;

// Tamagui media queries
<View
  width={300}
  $gtSm={{ width: 500 }}
  $gtMd={{ width: 700 }}
/>
```

**Q42. 🔴 What is the `useTransition` hook?**

`useTransition` marks state updates as non-urgent, allowing React to keep UI responsive during expensive updates. Part of Concurrent React, fully supported in RN 0.76+.

```tsx
const [isPending, startTransition] = useTransition();

const handleSearch = (query: string) => {
  setInputValue(query); // Urgent
  startTransition(() => {
    setSearchResults(filterResults(query)); // Non-urgent
  });
};

{isPending && <LoadingIndicator />}
```

**Q43. 🔴 Explain `useDeferredValue` hook.**

`useDeferredValue` returns a deferred version of a value that may lag behind. Useful for expensive renders that shouldn't block user input. Works with Suspense for loading states.

```tsx
const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;

<View style={{ opacity: isStale ? 0.5 : 1 }}>
  <SearchResults query={deferredQuery} />
</View>
```

**Q44. 🟡 How do you implement internationalization (i18n)?**

Use `i18next` with `react-i18next`, or Expo's `expo-localization`. Support RTL layouts, plural forms, and date/number formatting based on locale.

```tsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

<Text>{t('greeting', { name: 'John' })}</Text>
<Button title={t('buttons.submit')} />

// Switch language
i18n.changeLanguage('es');
```

**Q45. 🟢 What are fragments and when to use them?**

Fragments group children without adding extra DOM/native nodes. Use `<>...</>` shorthand or `<Fragment key={id}>` when mapping with keys.

```tsx
// Shorthand
<>
  <Header />
  <Content />
  <Footer />
</>

// With key (for lists)
{items.map(item => (
  <Fragment key={item.id}>
    <ItemTitle title={item.title} />
    <ItemBody body={item.body} />
  </Fragment>
))}
```

**Q46. 🟡 How do you handle network requests in React Native?**

Use `fetch` API (built-in) or `axios`. In 2026, combine with TanStack Query for caching, retries, and background refetching. Handle offline scenarios gracefully.

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  staleTime: 5 * 60 * 1000,
  retry: 3,
});
```

**Q47. 🔴 What is the React Compiler (React Forget)?**

React Compiler automatically memoizes components and hooks, reducing manual `useMemo`/`useCallback` usage. In beta for RN 0.76+, enabled via Babel plugin. Dramatically simplifies optimization.

```tsx
// Before - manual memoization
const sortedItems = useMemo(() => items.sort(sortFn), [items]);
const handleClick = useCallback(() => onClick(id), [onClick, id]);

// After - React Compiler handles it automatically
const sortedItems = items.sort(sortFn);
const handleClick = () => onClick(id);
```

**Q48. 🔴 Explain the server components model in React Native.**

Server Components render on the server, sending serialized UI to the client. In RN 2026, experimental support via Expo Router's server functions. Reduces bundle size and enables database queries from components.

**Q49. 🟡 How do you handle forms in React Native?**

Use `react-hook-form` with Zod validation for type-safe forms. Handle keyboard, validation states, and accessible error messages properly.

```tsx
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <TextInput value={value} onChangeText={onChange} />
  )}
/>
```

**Q50. 🔴 What's new in React 19 for React Native?**

React 19 brings `use()` hook for promises/context, Actions for form handling, `useOptimistic` for optimistic updates, document metadata support, and improved error handling. Full support in RN 0.76+.

```tsx
// use() hook
const data = use(fetchPromise);

// useOptimistic
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (state, newItem) => [...state, newItem]
);

// useFormStatus
const { pending } = useFormStatus();
```

---

## 2. State Management (20 Questions)

**Q1. 🟢 What are the main state management options in React Native 2026?**

Primary options: **Zustand 5** (simple, minimal boilerplate), **Jotai 3** (atomic state), **Redux Toolkit 2.0** (enterprise features), **TanStack Query** (server state), and **Legend State** (observable-based). Choose based on app complexity and team preference.

**Q2. 🟢 How does Zustand work and why is it popular in 2026?**

Zustand is a minimal state management library using hooks. No providers needed, supports middleware, and has excellent TypeScript support. Zustand 5 adds improved persistence and computed selectors.

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  clearCart: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: 'cart-storage' }
  )
);
```

**Q3. 🟡 Compare Zustand 5 vs Redux Toolkit 2.0.**

| Feature | Zustand 5 | Redux Toolkit 2.0 |
|---------|-----------|-------------------|
| Boilerplate | Minimal | More structured |
| DevTools | Basic | Excellent |
| Middleware | Simple | Powerful (RTK Query) |
| Learning Curve | Low | Medium |
| Best For | Small-medium apps | Enterprise, large teams |

**Q4. 🟡 What is Jotai and when should you use it?**

Jotai uses atomic state model—small pieces of state that can be composed. Excellent for derived state and fine-grained updates. Use when you need React's mental model extended to global state.

```tsx
import { atom, useAtom, useAtomValue } from 'jotai';

const countAtom = atom(0);
const doubleCountAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);

  return (
    <View>
      <Text>Count: {count}, Double: {doubleCount}</Text>
      <Button onPress={() => setCount(c => c + 1)} title="+" />
    </View>
  );
}
```

**Q5. 🟡 How do you handle server state with TanStack Query?**

TanStack Query (React Query) manages server state—caching, background refetching, optimistic updates, and offline support. Separate from UI state management.

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch
const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 60000,
});

// Mutate with optimistic update
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: addTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    return { previous };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

**Q6. 🔴 Explain offline-first architecture with WatermelonDB.**

WatermelonDB is a reactive SQLite database for RN. Sync with remote servers, handle conflicts, and work offline. Lazy-loads data for performance with large datasets.

```tsx
import { Database } from '@nozbe/watermelondb';
import { synchronize } from '@nozbe/watermelondb/sync';

// Model
class Post extends Model {
  static table = 'posts';
  @text('title') title;
  @text('body') body;
}

// Sync
await synchronize({
  database,
  pullChanges: async ({ lastPulledAt }) => {
    const response = await api.pull(lastPulledAt);
    return { changes: response.changes, timestamp: response.timestamp };
  },
  pushChanges: async ({ changes }) => {
    await api.push(changes);
  },
});
```

**Q7. 🟡 How do you persist state in React Native?**

Use MMKV (fastest), AsyncStorage (simple), or database solutions. Zustand/Jotai have built-in persist middleware. Consider encryption for sensitive data.

```tsx
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'app-storage' });

// Zustand with MMKV
const useStore = create(
  persist(
    (set) => ({ /* state */ }),
    {
      name: 'app-store',
      storage: {
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      },
    }
  )
);
```

**Q8. 🔴 What is Legend State and its benefits?**

Legend State is an observable-based state library with automatic persistence, fine-grained reactivity, and sync capabilities. Excellent performance with large state trees.

```tsx
import { observable } from '@legendapp/state';
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import { observer } from '@legendapp/state/react';

enableReactTracking({ auto: true });

const state$ = observable({
  user: { name: 'John', settings: { theme: 'dark' } },
  items: [],
});

const UserName = observer(function UserName() {
  return <Text>{state$.user.name.get()}</Text>;
});

// Only re-renders when name changes, not other state
```

**Q9. 🟢 When should you use local state vs global state?**

Use local state (`useState`) for UI-only state (form inputs, toggles). Use global state for shared data (user auth, theme, cart). Server state should use TanStack Query. Don't over-globalize.

**Q10. 🟡 How do you handle authentication state?**

Store auth tokens securely (expo-secure-store/Keychain), manage auth state globally, handle token refresh automatically. Use React Query for user data.

```tsx
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { token, user } = await api.login(credentials);
    await SecureStore.setItemAsync('auth_token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      const user = await api.getUser(token);
      set({ token, user, isAuthenticated: true });
    }
  },
}));
```

**Q11. 🔴 Explain state machines with XState in React Native.**

XState models complex state logic as finite state machines. Excellent for flows like onboarding, checkout, or multi-step forms where states and transitions are well-defined.

```tsx
import { createMachine } from 'xstate';
import { useMachine } from '@xstate/react';

const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  states: {
    idle: { on: { LOGIN: 'loading' } },
    loading: {
      invoke: {
        src: 'loginService',
        onDone: 'authenticated',
        onError: 'error',
      },
    },
    authenticated: { on: { LOGOUT: 'idle' } },
    error: { on: { RETRY: 'loading' } },
  },
});

const [state, send] = useMachine(authMachine);
```

**Q12. 🟡 How do you handle derived/computed state?**

Use selectors in Zustand, derived atoms in Jotai, or `useMemo` for local computations. Avoid storing computed values—derive them from source of truth.

```tsx
// Zustand selector
const useFilteredTodos = () => useStore(
  (state) => state.todos.filter(t => !t.completed),
  shallow
);

// Jotai derived atom
const filteredTodosAtom = atom((get) =>
  get(todosAtom).filter(t => !t.completed)
);
```

**Q13. 🔴 What are the best practices for state normalization?**

Normalize nested data into flat structures with IDs. Reduces duplication, simplifies updates, and improves performance. Use libraries like `normalizr` or structure manually.

```tsx
// Normalized state
{
  users: {
    byId: { '1': { id: '1', name: 'John' } },
    allIds: ['1'],
  },
  posts: {
    byId: { 'p1': { id: 'p1', authorId: '1', title: 'Hello' } },
    allIds: ['p1'],
  },
}

// Selector to denormalize
const selectPostWithAuthor = (postId) => (state) => ({
  ...state.posts.byId[postId],
  author: state.users.byId[state.posts.byId[postId].authorId],
});
```

**Q14. 🟡 How do you implement optimistic updates?**

Update UI immediately, then sync with server. Rollback on failure. TanStack Query and Zustand both support this pattern well.

```tsx
const addTodo = useMutation({
  mutationFn: api.addTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['todos']);

    // Snapshot current state
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], old => [...old, newTodo]);

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
});
```

**Q15. 🟢 What is the difference between Redux Toolkit Query and TanStack Query?**

RTK Query is built into Redux Toolkit—best when already using Redux. TanStack Query is standalone, more flexible, and has better DevTools. TanStack Query dominates in 2026 for new projects.

**Q16. 🔴 How do you handle real-time data with state management?**

Combine WebSocket/subscription listeners with state stores. Use TanStack Query's subscription support or custom Zustand actions for real-time updates.

```tsx
// WebSocket with Zustand
const useStore = create((set) => ({
  messages: [],
  connect: () => {
    const ws = new WebSocket('wss://api.example.com');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      set((state) => ({
        messages: [...state.messages, message]
      }));
    };
    return ws;
  },
}));

// TanStack Query subscription
useQuery({
  queryKey: ['messages'],
  queryFn: fetchMessages,
  refetchInterval: 1000, // Polling
  // Or use WebSocket in queryFn
});
```

**Q17. 🟡 How do you test state management code?**

Test stores in isolation, mock external dependencies, verify state transitions. Use React Testing Library for component integration tests.

```tsx
// Testing Zustand store
import { useStore } from './store';

describe('CartStore', () => {
  beforeEach(() => {
    useStore.setState({ items: [] });
  });

  it('adds item to cart', () => {
    const { addItem } = useStore.getState();
    addItem({ id: '1', name: 'Item', price: 10 });

    expect(useStore.getState().items).toHaveLength(1);
  });
});
```

**Q18. 🔴 What is Convex and how does it compare to traditional state management?**

Convex is a backend-as-a-service with built-in real-time sync. Replaces server state management entirely—automatic caching, optimistic updates, and offline support without manual configuration.

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function TodoList() {
  const todos = useQuery(api.todos.list); // Auto-synced
  const addTodo = useMutation(api.todos.add);

  return (
    <View>
      {todos?.map(todo => <TodoItem key={todo._id} todo={todo} />)}
      <Button onPress={() => addTodo({ text: 'New' })} />
    </View>
  );
}
```

**Q19. 🟡 How do you handle form state in complex forms?**

Use `react-hook-form` for form state—isolates re-renders, handles validation, and supports complex nested structures. Don't use global state for form data.

**Q20. 🔴 Explain the selector pattern for performance optimization.**

Selectors extract specific state slices, preventing unnecessary re-renders. Use shallow comparison for object/array selections. Memoize expensive derived computations.

```tsx
import { shallow } from 'zustand/shallow';

// Bad - re-renders on any state change
const state = useStore();

// Good - only re-renders when these values change
const { items, total } = useStore(
  (state) => ({ items: state.items, total: state.total }),
  shallow
);

// Best - atomic selections
const items = useStore((state) => state.items);
const total = useStore((state) => state.total);
```

---

## 3. Navigation & Routing (15 Questions)

**Q1. 🟢 What are the main navigation solutions in React Native 2026?**

**Expo Router v4** (file-based, recommended for Expo), **React Navigation 7** (flexible, widely used), and native solutions (react-native-navigation). Expo Router is default choice for new projects in 2026.

**Q2. 🟢 How does Expo Router work?**

Expo Router uses file-system based routing like Next.js. Files in `app/` directory become routes. Supports layouts, dynamic routes, and deep linking automatically.

```
app/
├── _layout.tsx      # Root layout
├── index.tsx        # / route
├── about.tsx        # /about route
├── user/
│   ├── _layout.tsx  # User layout
│   ├── [id].tsx     # /user/:id dynamic route
│   └── settings.tsx # /user/settings route
└── (tabs)/          # Tab group
    ├── _layout.tsx
    ├── home.tsx
    └── profile.tsx
```

**Q3. 🟡 How do you implement tab navigation with Expo Router?**

Use route groups with `(tabs)` folder and a layout file configuring the tab bar.

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

**Q4. 🟡 Explain React Navigation 7's new features.**

React Navigation 7 brings static configuration, improved TypeScript, preloading screens, native-feeling transitions, and better web support. Static config replaces dynamic for type safety.

```tsx
// Static configuration (RN Nav 7)
const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: { title: 'Home' },
    },
    Details: {
      screen: DetailsScreen,
      linking: { path: 'details/:id' },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
```

**Q5. 🟡 How do you implement authentication flow in navigation?**

Use conditional rendering based on auth state. Expo Router uses route groups, React Navigation uses conditional navigators.

```tsx
// Expo Router - app/_layout.tsx
import { useAuth } from '../hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Stack>
      {isAuthenticated ? (
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
```

**Q6. 🔴 How do you configure deep linking?**

Define URL scheme in app.json, configure linking in navigation. Handle incoming links and map to screens.

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "web": { "bundler": "metro" }
  }
}
```

```tsx
// Expo Router - automatic from file structure
// app/product/[id].tsx → myapp://product/123

// React Navigation manual config
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Product: 'product/:id',
      User: {
        path: 'user/:id',
        parse: { id: (id) => parseInt(id, 10) },
      },
    },
  },
};
```

**Q7. 🟡 Explain nested navigators and their use cases.**

Nest navigators for complex flows—tabs containing stacks, drawer with tabs. Each navigator manages its own history.

```tsx
// Tab navigator with stack in each tab
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeList" component={HomeList} />
      <Stack.Screen name="Details" component={Details} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
```

**Q8. 🟡 How do you pass parameters between screens?**

Use route params for navigation data. Access via `useLocalSearchParams` (Expo Router) or `route.params` (React Navigation).

```tsx
// Expo Router
import { useLocalSearchParams, router } from 'expo-router';

// Navigate with params
router.push({ pathname: '/user/[id]', params: { id: '123' } });

// Access params
const { id } = useLocalSearchParams<{ id: string }>();

// React Navigation
navigation.navigate('User', { id: '123' });
const { id } = route.params;
```

**Q9. 🔴 How do you handle navigation state persistence?**

Save navigation state to storage, restore on app launch. Useful for resuming user's position after app restart.

```tsx
import { getStateFromPath, getPathFromState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'NAVIGATION_STATE';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    AsyncStorage.getItem(PERSISTENCE_KEY).then((state) => {
      if (state) setInitialState(JSON.parse(state));
      setIsReady(true);
    });
  }, []);

  if (!isReady) return <LoadingScreen />;

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) =>
        AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
      }
    >
      {/* ... */}
    </NavigationContainer>
  );
}
```

**Q10. 🟢 What are modal screens and how do you implement them?**

Modals present over current content. Use `presentation: 'modal'` option or dedicated modal stack group.

```tsx
// Expo Router
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen
    name="modal"
    options={{ presentation: 'modal' }}
  />
</Stack>

// React Navigation
<Stack.Navigator>
  <Stack.Group>
    <Stack.Screen name="Home" component={Home} />
  </Stack.Group>
  <Stack.Group screenOptions={{ presentation: 'modal' }}>
    <Stack.Screen name="CreatePost" component={CreatePost} />
  </Stack.Group>
</Stack.Navigator>
```

**Q11. 🟡 How do you implement custom transitions?**

Use `animation` config for built-in transitions or `customTransitionSpec` for custom animations. Reanimated enables complex transitions.

```tsx
<Stack.Screen
  name="Details"
  options={{
    animation: 'slide_from_right',
    // Or custom
    transitionSpec: {
      open: { animation: 'spring', config: { stiffness: 1000 } },
      close: { animation: 'timing', config: { duration: 200 } },
    },
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [{
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        }],
      },
    }),
  }}
/>
```

**Q12. 🔴 How do you handle navigation events?**

Listen to focus, blur, state changes. Use for analytics, data fetching, or cleanup.

```tsx
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Focus effect
useFocusEffect(
  useCallback(() => {
    fetchData();
    return () => cleanup();
  }, [])
);

// Navigation listener
const navigation = useNavigation();
useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      showDiscardAlert();
    }
  });
  return unsubscribe;
}, []);
```

**Q13. 🟡 What is the difference between `push`, `navigate`, and `replace`?**

`navigate` goes to screen (or focuses if exists in stack), `push` always adds new screen to stack, `replace` swaps current screen without animation.

```tsx
// Navigate - won't duplicate if already in stack
navigation.navigate('Details', { id: 1 });

// Push - always adds to stack
navigation.push('Details', { id: 1 });
navigation.push('Details', { id: 2 }); // Now have 2 Detail screens

// Replace - swap current screen
navigation.replace('Success'); // Auth flow completion
```

**Q14. 🔴 How do you implement bottom sheet navigation?**

Use `@gorhom/bottom-sheet` with navigation. Can contain navigators or be presented as modal sheets.

```tsx
import BottomSheet from '@gorhom/bottom-sheet';

function SheetNavigator() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['25%', '50%', '90%']}
      enablePanDownToClose
    >
      <Stack.Navigator>
        <Stack.Screen name="SheetHome" component={SheetHome} />
        <Stack.Screen name="SheetDetails" component={SheetDetails} />
      </Stack.Navigator>
    </BottomSheet>
  );
}
```

**Q15. 🔴 How do you optimize navigation performance?**

Use `react-native-screens` (enabled by default), lazy load screens, preload critical routes, minimize re-renders in header components.

```tsx
// Lazy loading
const HeavyScreen = React.lazy(() => import('./HeavyScreen'));

<Stack.Screen
  name="Heavy"
  component={HeavyScreen}
  options={{ lazy: true }}
/>

// Preloading (React Navigation 7)
navigation.preload('Details', { id: 123 });

// Freeze inactive screens
import { enableFreeze } from 'react-native-screens';
enableFreeze(true);
```

---

## 4. Performance & Optimization (25 Questions)

**Q1. 🟢 What are the main performance concerns in React Native?**

JS thread blocking (long computations), excessive re-renders, large bundle size, memory leaks, list performance, and bridge overhead (pre-New Architecture). Measure with Flipper/React DevTools.

**Q2. 🟢 How does the New Architecture improve performance?**

Eliminates async bridge bottleneck via JSI, enables synchronous native calls, reduces serialization overhead by 10x, allows concurrent rendering, and provides direct memory sharing between JS and native.

**Q3. 🟡 Explain FlashList and why it's superior to FlatList.**

FlashList from Shopify recycles cells like native lists, uses predictable memory, and renders 10x faster than FlatList. Requires `estimatedItemSize` for optimization.

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={80}
  // Performance options
  drawDistance={250}
  overrideItemLayout={(layout, item) => {
    layout.size = item.isHeader ? 50 : 80;
  }}
/>
```

**Q4. 🟡 How do you prevent unnecessary re-renders?**

Use `React.memo`, `useMemo`, `useCallback`, selector patterns in state management, and avoid inline functions/objects in props. React Compiler automates much of this in 2026.

```tsx
// Memoize component
const ListItem = memo(({ item, onPress }) => (
  <Pressable onPress={() => onPress(item.id)}>
    <Text>{item.title}</Text>
  </Pressable>
));

// Stable callback
const handlePress = useCallback((id: string) => {
  selectItem(id);
}, [selectItem]);

// Avoid inline objects
const style = useMemo(() => ({ padding: 10 }), []);
```

**Q5. 🔴 Explain Hermes bytecode and its performance benefits.**

Hermes compiles JavaScript to bytecode at build time (AOT), reducing app startup by 30-50% and memory usage by 20-30%. Bytecode loads directly without parsing, enabling instant execution.

**Q6. 🟡 How do you optimize images in React Native?**

Use appropriate formats (WebP), resize server-side, implement lazy loading, use blur placeholders, cache aggressively. `expo-image` handles these automatically.

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  cachePolicy="memory-disk"
  recyclingKey={item.id}
  transition={200}
/>
```

**Q7. 🔴 What are worklets in Reanimated and how do they improve performance?**

Worklets are JS functions that run on the UI thread, avoiding JS-to-native bridge communication. Enable 60fps animations by executing directly where needed.

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const offset = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));

// Run on UI thread
const gesture = Gesture.Pan().onUpdate((e) => {
  offset.value = e.translationX; // UI thread, no bridge!
});
```

**Q8. 🟡 How do you profile React Native app performance?**

Use Flipper (React DevTools, performance profiler), Xcode Instruments, Android Studio Profiler, React Native's built-in Performance Monitor, and production monitoring (Sentry, Datadog).

```bash
# Enable performance monitor
# Shake device → "Show Perf Monitor"

# Flipper React DevTools
# See component renders, props, state

# Systrace for detailed analysis
npx react-native profile-hermes
```

**Q9. 🔴 Explain the InteractionManager and when to use it.**

`InteractionManager` schedules tasks after animations/interactions complete, preventing jank. Use for expensive operations that can wait.

```tsx
import { InteractionManager } from 'react-native';

useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    // Expensive operation - runs after navigation animation
    processLargeDataset();
  });

  return () => task.cancel();
}, []);
```

**Q10. 🟡 How do you optimize bundle size?**

Use Hermes, enable Proguard/R8 (Android), tree-shaking, dynamic imports, analyze bundle with `react-native-bundle-visualizer`, and minimize dependencies.

```js
// metro.config.js - tree shaking
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
  },
};

// Dynamic import
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

**Q11. 🔴 What causes memory leaks and how do you prevent them?**

Common causes: uncleaned subscriptions, retained closures, circular references, cached data growth. Prevent with proper cleanup, weak references, and memory profiling.

```tsx
// Cleanup subscriptions
useEffect(() => {
  const subscription = eventEmitter.addListener('event', handler);
  return () => subscription.remove();
}, []);

// Abort fetch requests
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, []);

// Clear timers
useEffect(() => {
  const timer = setTimeout(fn, 1000);
  return () => clearTimeout(timer);
}, []);
```

**Q12. 🟡 How do you optimize navigation transitions?**

Use native stack (`@react-navigation/native-stack`), enable `react-native-screens`, preload screens, avoid heavy computation during transitions.

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

enableScreens(true);

const Stack = createNativeStackNavigator();

// Defer heavy work
useFocusEffect(
  useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      loadData();
    });
  }, [])
);
```

**Q13. 🔴 Explain the `getItemLayout` optimization for lists.**

`getItemLayout` skips measurement for fixed-size items, enabling instant scroll-to-index and improving performance. Required for `scrollToIndex` without errors.

```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  // Now this works instantly
  initialScrollIndex={50}
/>
```

**Q14. 🟡 How do you handle large forms without performance issues?**

Use `react-hook-form` (isolates re-renders), uncontrolled inputs where possible, virtualize long forms, debounce validation.

```tsx
import { useForm, Controller } from 'react-hook-form';

const { control, handleSubmit } = useForm({
  mode: 'onBlur', // Validate on blur, not every keystroke
});

// Each field re-renders independently
<Controller
  control={control}
  name="email"
  render={({ field }) => <TextInput {...field} />}
/>
```

**Q15. 🔴 What is the JavaScript thread and how do you keep it responsive?**

The JS thread runs React code, business logic, and API calls. Keep responsive by avoiding sync heavy computations, using `requestAnimationFrame` for batching, and moving work to native or worklets.

```tsx
// Bad - blocks JS thread
const result = heavyComputation(data); // Freezes UI

// Good - chunk work
function processInChunks(items, chunkSize = 100) {
  return new Promise((resolve) => {
    let index = 0;
    const results = [];

    function processChunk() {
      const chunk = items.slice(index, index + chunkSize);
      results.push(...chunk.map(process));
      index += chunkSize;

      if (index < items.length) {
        requestAnimationFrame(processChunk);
      } else {
        resolve(results);
      }
    }

    processChunk();
  });
}
```

**Q16. 🟡 How do you optimize text rendering?**

Avoid dynamic fontSize changes, use `allowFontScaling={false}` when appropriate, minimize Text component nesting, cache font measurements.

```tsx
// Cache text styles
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

// Avoid inline styles
<Text style={styles.title}>{title}</Text>
```

**Q17. 🔴 Explain the Shadow Tree and Yoga layout engine.**

Shadow Tree is a C++ representation of the UI hierarchy used for layout calculations. Yoga is the cross-platform flexbox implementation. With Fabric, shadow tree creation is synchronous and more efficient.

**Q18. 🟡 How do you implement efficient infinite scroll?**

Use FlashList with `onEndReached`, debounce API calls, show loading indicators, implement pull-to-refresh.

```tsx
const [data, setData] = useState([]);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  if (loading) return;
  setLoading(true);
  const newData = await fetchPage(page);
  setData(prev => [...prev, ...newData]);
  setPage(prev => prev + 1);
  setLoading(false);
};

<FlashList
  data={data}
  renderItem={renderItem}
  estimatedItemSize={100}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <Spinner /> : null}
/>
```

**Q19. 🔴 What are the performance implications of the bridge vs JSI?**

Bridge: async, JSON serialization (slow), batched calls. JSI: sync, direct memory access (fast), no serialization. JSI is 10x faster for frequent native calls.

| Metric | Bridge | JSI |
|--------|--------|-----|
| Call latency | ~5ms | ~0.1ms |
| Serialization | Required | None |
| Threading | Async only | Sync possible |
| Memory | Copies data | Shares memory |

**Q20. 🟡 How do you optimize app startup time?**

Use Hermes, minimize initial bundle, lazy load features, optimize splash screen, defer non-critical initialization, preload critical data.

```tsx
// Defer non-critical init
useEffect(() => {
  InteractionManager.runAfterInteractions(() => {
    initAnalytics();
    prefetchImages();
    setupPushNotifications();
  });
}, []);

// Lazy load features
const Settings = React.lazy(() => import('./Settings'));
```

**Q21. 🔴 Explain React Native's batching behavior.**

React batches state updates within event handlers and lifecycle methods. React 18+ auto-batches all updates (including promises, timeouts). Reduces re-renders automatically.

```tsx
// Pre-React 18 - multiple renders
setTimeout(() => {
  setCount(1);  // Render
  setFlag(true); // Render
}, 1000);

// React 18+ - single render
setTimeout(() => {
  setCount(1);  // Batched
  setFlag(true); // Batched
}, 1000); // Single render
```

**Q22. 🟡 How do you prevent layout thrashing?**

Batch DOM reads/writes, use `onLayout` callbacks wisely, avoid measuring in render, use Reanimated's `measure` for animations.

```tsx
// Bad - causes layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height * 2;    // Write
});

// Good - batch reads then writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2;
});
```

**Q23. 🔴 What is the recommended approach for heavy computations?**

Move to native modules, use Web Workers (via `react-native-workers`), chunk processing, or use JSI-based libraries like `vision-camera` frame processors.

```tsx
// Vision Camera frame processor (UI thread)
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const result = detectObjects(frame);
  runOnJS(setDetections)(result);
}, []);
```

**Q24. 🟡 How do you optimize Redux/state management performance?**

Use selectors with `reselect`, normalize state, avoid storing derived data, use `shallowEqual` comparisons, split reducers for independent updates.

```tsx
import { createSelector } from '@reduxjs/toolkit';

// Memoized selector
const selectVisibleTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => todos.filter(t => t.status === filter)
);

// Component
const todos = useSelector(selectVisibleTodos, shallowEqual);
```

**Q25. 🔴 How do you measure and monitor production performance?**

Use Sentry Performance, Datadog RUM, Firebase Performance, or custom metrics. Track app start, screen load, API latency, and JS errors.

```tsx
import * as Sentry from '@sentry/react-native';

// Wrap app
Sentry.init({
  dsn: 'YOUR_DSN',
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1,
});

// Custom transaction
const transaction = Sentry.startTransaction({ name: 'checkout' });
const span = transaction.startChild({ op: 'payment' });
await processPayment();
span.finish();
transaction.finish();
```

---

## 5. Animations & Gestures (15 Questions)

**Q1. 🟢 What are the animation options in React Native 2026?**

**Reanimated 3.5+** (recommended - worklet-based, 60fps), **Moti** (declarative wrapper), built-in `Animated` API (limited), and **Lottie** for complex vector animations. Reanimated dominates for interactive animations.

**Q2. 🟢 Explain shared values in Reanimated.**

Shared values are reactive primitives that exist on both JS and UI threads. Changes trigger animations without bridge communication, enabling 60fps performance.

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

const offset = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));

const handlePress = () => {
  offset.value = withSpring(100);
};

<Animated.View style={animatedStyle} />
```

**Q3. 🟡 How do you create a spring animation?**

Use `withSpring` for natural physics-based animations. Configure stiffness, damping, and mass for different feels.

```tsx
import { withSpring, WithSpringConfig } from 'react-native-reanimated';

const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  overshootClamping: false,
};

const handlePress = () => {
  scale.value = withSpring(1.2, springConfig);
};
```

**Q4. 🟡 Explain gesture handling with Gesture Handler 3.**

React Native Gesture Handler provides native-driven gesture recognition. Compose gestures, handle simultaneous touches, and integrate with Reanimated.

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const translateX = useSharedValue(0);
const translateY = useSharedValue(0);

const pan = Gesture.Pan()
  .onUpdate((event) => {
    translateX.value = event.translationX;
    translateY.value = event.translationY;
  })
  .onEnd(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value },
  ],
}));

<GestureDetector gesture={pan}>
  <Animated.View style={animatedStyle} />
</GestureDetector>
```

**Q5. 🟡 How do you implement a draggable bottom sheet?**

Use `@gorhom/bottom-sheet` or build custom with Gesture Handler and Reanimated. Handle snap points, velocity, and overscroll.

```tsx
import BottomSheet from '@gorhom/bottom-sheet';

const bottomSheetRef = useRef<BottomSheet>(null);
const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

<BottomSheet
  ref={bottomSheetRef}
  snapPoints={snapPoints}
  enablePanDownToClose
  backdropComponent={renderBackdrop}
  handleIndicatorStyle={{ backgroundColor: '#ccc' }}
>
  <BottomSheetScrollView>
    <Content />
  </BottomSheetScrollView>
</BottomSheet>
```

**Q6. 🔴 What are layout animations in Reanimated 3.5?**

Layout animations automatically animate components when they enter, exit, or change position. Use `entering`, `exiting`, and `layout` props.

```tsx
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from 'react-native-reanimated';

<Animated.View
  entering={FadeIn.duration(300).springify()}
  exiting={FadeOut.duration(200)}
  layout={LinearTransition.springify()}
>
  <Text>Animated content</Text>
</Animated.View>

// List item animations
{items.map((item) => (
  <Animated.View
    key={item.id}
    entering={SlideInRight.delay(index * 100)}
    exiting={SlideOutLeft}
    layout={Layout.springify()}
  >
    <ItemCard item={item} />
  </Animated.View>
))}
```

**Q7. 🟡 How do you implement skeleton loading animations?**

Use Reanimated for shimmer effect or libraries like `moti` for simple skeleton placeholders.

```tsx
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

function SkeletonCard() {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ loop: true, type: 'timing', duration: 1000 }}
      style={styles.skeleton}
    />
  );
}

// Moti Skeleton
<Skeleton colorMode="light" width={200} height={20} />
```

**Q8. 🔴 Explain worklets and the `'worklet'` directive.**

Worklets are functions executed on the UI thread. The `'worklet'` directive tells Reanimated to compile the function for UI thread execution.

```tsx
const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const gesture = Gesture.Pan().onUpdate((e) => {
  // This runs on UI thread
  offset.value = clamp(e.translationX, -100, 100);
});
```

**Q9. 🟡 How do you compose multiple gestures?**

Use `Gesture.Simultaneous`, `Gesture.Exclusive`, or `Gesture.Race` to combine gestures.

```tsx
const pan = Gesture.Pan().onUpdate(/* ... */);
const pinch = Gesture.Pinch().onUpdate(/* ... */);
const rotation = Gesture.Rotation().onUpdate(/* ... */);

// All gestures work simultaneously
const composed = Gesture.Simultaneous(pan, pinch, rotation);

// First recognized gesture wins
const exclusive = Gesture.Exclusive(doubleTap, singleTap);

<GestureDetector gesture={composed}>
  <Animated.View style={animatedStyle} />
</GestureDetector>
```

**Q10. 🔴 How do you implement shared element transitions?**

Use `react-native-shared-element` or Reanimated's shared transitions (experimental in 3.5).

```tsx
import { SharedElement } from 'react-navigation-shared-element';

// Source screen
<SharedElement id={`item.${item.id}.photo`}>
  <Image source={item.photo} style={styles.thumbnail} />
</SharedElement>

// Destination screen
<SharedElement id={`item.${item.id}.photo`}>
  <Image source={item.photo} style={styles.fullImage} />
</SharedElement>

// Navigator config
const Stack = createSharedElementStackNavigator();
```

**Q11. 🟡 How do you use `useAnimatedScrollHandler`?**

`useAnimatedScrollHandler` tracks scroll position on UI thread for smooth scroll-linked animations.

```tsx
const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});

const headerStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: -scrollY.value * 0.5 }],
  opacity: interpolate(scrollY.value, [0, 100], [1, 0]),
}));

<Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
  <Animated.View style={headerStyle}>
    <Header />
  </Animated.View>
  <Content />
</Animated.ScrollView>
```

**Q12. 🔴 Explain `runOnJS` and `runOnUI` functions.**

`runOnJS` calls JS thread functions from worklets. `runOnUI` schedules worklet execution from JS thread. Essential for thread communication.

```tsx
const handleComplete = () => {
  // This runs on JS thread
  navigation.goBack();
};

const gesture = Gesture.Pan().onEnd(() => {
  'worklet';
  if (shouldDismiss.value) {
    runOnJS(handleComplete)(); // Call JS from UI thread
  }
});

// From JS to UI
runOnUI(() => {
  'worklet';
  offset.value = withSpring(100);
})();
```

**Q13. 🟡 How do you implement a swipe-to-delete gesture?**

Combine Pan gesture with animated translation and threshold detection.

```tsx
const translateX = useSharedValue(0);
const THRESHOLD = -100;

const pan = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = Math.min(0, e.translationX);
  })
  .onEnd(() => {
    if (translateX.value < THRESHOLD) {
      translateX.value = withTiming(-SCREEN_WIDTH);
      runOnJS(onDelete)();
    } else {
      translateX.value = withSpring(0);
    }
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

**Q14. 🔴 What are derived values in Reanimated?**

`useDerivedValue` computes values from other shared values, recalculating when dependencies change. Runs on UI thread.

```tsx
const progress = useSharedValue(0);

const opacity = useDerivedValue(() => {
  return interpolate(progress.value, [0, 1], [0.5, 1]);
});

const scale = useDerivedValue(() => {
  return interpolate(progress.value, [0, 1], [0.8, 1]);
});

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ scale: scale.value }],
}));
```

**Q15. 🔴 How do you use Lottie for complex animations?**

Lottie renders After Effects animations. Use `lottie-react-native` for vector animations that would be impractical to code.

```tsx
import LottieView from 'lottie-react-native';

const animationRef = useRef<LottieView>(null);

<LottieView
  ref={animationRef}
  source={require('./animation.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
  onAnimationFinish={() => console.log('Done')}
/>

// Control programmatically
animationRef.current?.play();
animationRef.current?.pause();
animationRef.current?.reset();
```

---

## 6. Native Modules & Bridges (20 Questions)

**Q1. 🟢 What are native modules in React Native?**

Native modules are a bridge between your JavaScript application code and native platform capabilities (iOS/Android). They allow using functionality not available through standard React Native APIs.

**When Native Modules Are Needed:**
- Accessing device-specific APIs: Bluetooth, NFC, sensors, biometrics
- Integration with third-party native SDKs: payment systems, analytics, maps
- Performance-critical computations: image processing, cryptography, ML
- Working with system features: background tasks, push notifications, file system

**Types of Native Modules:**
1. **Legacy Native Modules**: Use async bridge with JSON serialization. Deprecated approach, but supported for backward compatibility.
2. **TurboModules (New Architecture)**: Use JSI for synchronous calls, lazy initialization, type-safe through Codegen.
3. **Fabric Native Components**: For creating custom native UI components (maps, video players, custom views).

In 2026, TurboModules are recommended for new projects as they provide better performance and type safety. Many popular libraries (Reanimated, MMKV, Vision Camera) already use JSI directly.

**Q2. 🟡 What is the difference between TurboModules and legacy native modules?**

TurboModules are lazy-loaded via JSI (synchronous, type-safe), while legacy modules use the async bridge with JSON serialization. TurboModules are 10x faster and are the standard in RN 0.76+.

**Q3. 🔴 How do you create a TurboModule?**

Define a TypeScript spec, run Codegen, implement native code conforming to generated interfaces.

```tsx
// specs/NativeCalculator.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  addAsync(a: number, b: number): Promise<number>;
  getConstants(): { pi: number };
}

export default TurboModuleRegistry.getEnforcing<Spec>('Calculator');
```

```swift
// iOS - Calculator.mm
@implementation Calculator

RCT_EXPORT_MODULE()

- (NSNumber *)multiply:(double)a b:(double)b {
  return @(a * b);
}

- (void)addAsync:(double)a b:(double)b
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  resolve(@(a + b));
}

- (NSDictionary *)getConstants {
  return @{@"pi": @(M_PI)};
}

@end
```

**Q4. 🔴 Explain JSI (JavaScript Interface).**

JSI is a C++ API enabling direct communication between JavaScript and native code. Eliminates JSON serialization, allows synchronous calls, and enables shared memory access.

**Q5. 🟡 What is Codegen and how does it work?**

Codegen generates native interfaces from TypeScript/Flow specifications at build time. Ensures type safety between JS and native, reducing runtime errors.

```bash
# Run Codegen
cd ios && RCT_NEW_ARCH_ENABLED=1 pod install

# Or via Gradle
cd android && ./gradlew generateCodegenArtifactsFromSchema
```

**Q6. 🔴 How do you implement a native view component?**

Create a native ViewManager that extends `RCTViewManager` (iOS) or `SimpleViewManager` (Android), then bridge it to React Native.

```tsx
// JavaScript usage
import { requireNativeComponent } from 'react-native';

const NativeMapView = requireNativeComponent('MapView');

<NativeMapView
  style={{ flex: 1 }}
  region={{ lat: 37.78, lng: -122.41, zoom: 12 }}
  onRegionChange={handleChange}
/>
```

```swift
// iOS ViewManager
@objc(MapViewManager)
class MapViewManager: RCTViewManager {
  override func view() -> UIView! {
    return MKMapView()
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```

**Q7. 🟡 What is the Fabric renderer?**

Fabric is the new rendering system in React Native that manages creation, updating, and deletion of native views. Unlike the old renderer (Paper), Fabric is completely rewritten to work with JSI.

**Key Differences from Paper:**

| Aspect | Paper (old) | Fabric (new) |
|--------|-------------|--------------|
| Shadow tree | JavaScript/Java | C++ |
| Communication | Async bridge | JSI (synchronous) |
| Measurements | Asynchronous | Synchronous |
| Concurrency | Not supported | Full support |
| Priorities | No | Yes |

**How Fabric Improves Development:**
- **Synchronous measurements**: Reanimated and Gesture Handler can instantly get element sizes for animations
- **Concurrent rendering**: React 18+ transitions work natively
- **Responsive UI**: User input is processed with high priority
- **Simplified architecture**: One C++ engine instead of three separate threads

Fabric works together with TurboModules — both components use JSI and are part of the New Architecture in RN 0.76+.

**Q8. 🔴 How do you handle threading in native modules?**

Specify queue for method execution. UI operations on main thread, heavy computation on background threads.

```swift
// iOS - Specify method queue
@objc(Calculator)
class Calculator: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false // Run setup on background thread
  }

  @objc
  func methodQueue() -> DispatchQueue {
    return DispatchQueue(label: "com.app.calculator")
  }
}
```

```kotlin
// Android - Background execution
@ReactMethod
fun heavyOperation(promise: Promise) {
    Thread {
        val result = performHeavyWork()
        promise.resolve(result)
    }.start()
}
```

**Q9. 🟡 How do you send events from native to JavaScript?**

Use `RCTEventEmitter` (iOS) or `RCTDeviceEventEmitter` (Android) to emit events that JS can subscribe to.

```swift
// iOS
@objc(LocationModule)
class LocationModule: RCTEventEmitter {
  override func supportedEvents() -> [String]! {
    return ["onLocationUpdate"]
  }

  func sendLocation(_ location: CLLocation) {
    sendEvent(withName: "onLocationUpdate", body: [
      "latitude": location.coordinate.latitude,
      "longitude": location.coordinate.longitude
    ])
  }
}
```

```tsx
// JavaScript
import { NativeEventEmitter, NativeModules } from 'react-native';

const { LocationModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(LocationModule);

useEffect(() => {
  const subscription = eventEmitter.addListener('onLocationUpdate', (location) => {
    console.log(location.latitude, location.longitude);
  });
  return () => subscription.remove();
}, []);
```

**Q10. 🔴 What is bridgeless mode in RN 0.76+?**

Bridgeless mode is a React Native operating mode where the classic asynchronous bridge is completely removed. All communication between JavaScript and native code happens through JSI.

**What Changes in Bridgeless Mode:**
- **No JSON serialization**: Data is passed directly through JSI host objects
- **Synchronous calls**: Native methods can be called synchronously from JS
- **Shared memory**: JavaScript and native code can work with the same data buffers
- **Improved startup**: Modules are initialized lazily on first use

**Practical Implications:**
1. **Performance**: Native method calls are 10-100x faster
2. **Animations**: Reanimated worklets get data instantly
3. **Interop Layer**: Old native modules are automatically wrapped for compatibility
4. **Simplified debugging**: Fewer async operations — easier to track bugs

**Migration:**
In RN 0.76+, bridgeless mode is enabled by default. Most popular libraries are already compatible. For legacy modules, the Interop Layer allows them to function without code changes.

**Q11. 🟡 How do you integrate third-party native SDKs?**

Integrating third-party SDKs is a common task in RN app development. The process depends on whether a ready RN wrapper exists and the SDK complexity.

**Step 1: Check for Existing Solutions**
- Search npm for ready RN libraries for the needed SDK
- Check compatibility with New Architecture (TurboModules/Fabric)
- Evaluate repository support activity

**Step 2: If No Ready Wrapper — Create Your Own**

**iOS (CocoaPods):**
```ruby
# ios/Podfile
pod 'ThirdPartySDK', '~> 2.0'
```

**Android (Gradle):**
```groovy
// android/app/build.gradle
implementation 'com.thirdparty:sdk:2.0.0'
```

**Step 3: Create Native Module Wrapper**
1. Create TurboModule specification (TypeScript)
2. Implement native code calling SDK methods
3. Handle SDK callbacks/listeners and convert to JS events

**Recommendations:**
- Minimize API surface — expose only necessary methods
- Use Promises for async operations
- Handle SDK errors and convert to understandable JS exceptions
- For SDK UI components, create Fabric Native Components

```swift
// Native wrapper
@objc(StripeModule)
class StripeModule: NSObject {
  @objc
  func initializePayments(_ publishableKey: String) {
    StripeAPI.defaultPublishableKey = publishableKey
  }

  @objc
  func createPaymentSheet(_ clientSecret: String,
                          resolver: @escaping RCTPromiseResolveBlock,
                          rejecter: @escaping RCTPromiseRejectBlock) {
    // Implementation
  }
}
```

**Q12. 🔴 Explain C++ TurboModules.**

C++ TurboModules are native modules implemented in C++ that work on both platforms without code duplication. They use JSI directly and provide maximum performance.

**Advantages of C++ TurboModules:**
- **One code — two platforms**: Business logic is written once in C++
- **Maximum performance**: No overhead from calls between languages
- **Direct JSI access**: Can create complex host objects and work with memory directly
- **Reuse existing C++ libraries**: SQLite, OpenCV, ML models

**When to Use:**
- Cryptographic operations (hashing, encryption)
- Image and video processing
- Machine Learning inference
- Working with large data volumes
- Integrating existing C++ SDKs

**Examples of Libraries Using C++ TurboModules:**
- **react-native-mmkv**: Ultra-fast key-value storage
- **react-native-reanimated**: Worklets execute in C++
- **vision-camera**: Frame processors for real-time video processing

**Architecture:**
```
JavaScript ←→ JSI ←→ C++ TurboModule ←→ Platform APIs
                          ↓
              Shared code for iOS and Android
```

Developing C++ TurboModules requires knowledge of C++, CMake, and build specifics for each platform, but the results justify the effort for performance-critical tasks.

```cpp
// MathModule.h
#pragma once
#include <ReactCommon/TurboModule.h>

class MathModule : public facebook::react::TurboModule {
public:
  double multiply(double a, double b);
};
```

**Q13. 🟡 What are host objects in JSI?**

Host Objects are a JSI mechanism that allows creating C++ objects accessible from JavaScript as regular JS objects. This is a fundamental building block for TurboModules and high-performance native libraries.

**How Host Objects Work:**
- Host Object inherits from `jsi::HostObject` in C++
- When accessing a property/method from JS, corresponding C++ code is called
- Properties are evaluated lazily — no need to serialize everything upfront
- Can contain native resources (file descriptors, sockets, memory)

**Advantages Over the Old Bridge:**
1. **Lazy evaluation**: Data is requested only when needed
2. **Synchronous**: Can return values instantly
3. **Memory management**: Host Object can own native resources and release them on destruction
4. **Type safety**: Methods can check argument types

**Usage Example:**
```javascript
// JS sees host object as a regular object
const storage = nativeStorage; // Host Object
storage.set('key', 'value'); // Synchronous C++ call
const value = storage.get('key'); // Instant result
```

Host Objects are actively used in react-native-mmkv, Reanimated (shared values), Vision Camera (frame objects), and other high-performance libraries.

**Q14. 🔴 How do you debug native modules?**

Use Xcode (iOS) / Android Studio debuggers, add native logging, use Flipper plugins, and test with unit tests before integration.

```swift
// iOS logging
import os.log

let logger = Logger(subsystem: "com.app", category: "nativemodule")
logger.debug("Processing value: \(value)")
```

```kotlin
// Android logging
import android.util.Log

Log.d("NativeModule", "Processing value: $value")
```

**Q15. 🟡 What is the ViewManager pattern?**

ViewManager is a native class responsible for creating and managing custom UI components in React Native. If TurboModules provide functionality (methods), ViewManager provides visual elements.

**Main ViewManager Responsibilities:**
1. **Creating View**: The `createViewInstance()` method returns a native view instance
2. **Handling props**: Methods annotated with `@ReactProp` handle property updates from React
3. **Commands**: Imperative methods called via `ref.current.methodName()`
4. **Exporting constants**: Static values accessible from JavaScript

**Example Structure (iOS):**
```swift
@objc(CustomMapViewManager)
class CustomMapViewManager: RCTViewManager {
  override func view() -> UIView! {
    return CustomMapView()
  }

  @objc func setRegion(_ view: CustomMapView, region: NSDictionary) {
    // Handle prop change
  }

  @objc func animateToRegion(_ reactTag: NSNumber, region: NSDictionary) {
    // Imperative command
  }
}
```

**Fabric Native Components:**
In the New Architecture, ViewManager evolved into Fabric Native Components. They use Codegen to generate interfaces and provide synchronous measurements and updates through JSI.

**Q16. 🔴 How do you implement native module callbacks?**

Use Promises for single results or Callbacks for multiple emissions. Promises are cleaner with async/await.

```swift
// Promise-based
@objc
func fetchData(_ url: String,
               resolver: @escaping RCTPromiseResolveBlock,
               rejecter: @escaping RCTPromiseRejectBlock) {
  Task {
    do {
      let data = try await fetch(url)
      resolver(data)
    } catch {
      rejecter("FETCH_ERROR", error.localizedDescription, error)
    }
  }
}
```

**Q17. 🟡 What are constants and how do you expose them?**

Constants are static values exported to JS at module initialization. Use `constantsToExport` (iOS) or `getConstants` (TurboModules).

```tsx
// TurboModule spec
export interface Spec extends TurboModule {
  getConstants(): {
    API_VERSION: string;
    MAX_FILE_SIZE: number;
    SUPPORTED_FORMATS: string[];
  };
}

// Usage
import NativeModule from './NativeModule';
const { API_VERSION } = NativeModule.getConstants();
```

**Q18. 🔴 How do you handle errors in native modules?**

Reject promises with error codes and messages. Use typed error classes for consistent handling.

```swift
@objc
func processFile(_ path: String,
                 resolver: @escaping RCTPromiseResolveBlock,
                 rejecter: @escaping RCTPromiseRejectBlock) {
  guard FileManager.default.fileExists(atPath: path) else {
    rejecter("FILE_NOT_FOUND", "File does not exist at path", nil)
    return
  }

  do {
    let result = try process(path)
    resolver(result)
  } catch {
    rejecter("PROCESSING_ERROR", error.localizedDescription, error)
  }
}
```

**Q19. 🔴 What is the Interop Layer in New Architecture?**

The Interop Layer allows legacy native modules to work with New Architecture without rewrites. Automatically wraps old modules as TurboModules.

**Q20. 🟡 How do you unit test native modules?**

Write platform-specific unit tests (XCTest/JUnit) for native logic, mock RN bridge interfaces, test JS integration with Jest.

```swift
// iOS XCTest
class CalculatorTests: XCTestCase {
  var calculator: Calculator!

  override func setUp() {
    calculator = Calculator()
  }

  func testMultiply() {
    let result = calculator.multiply(3, b: 4)
    XCTAssertEqual(result, 12)
  }
}
```

---

## 7. Testing & CI/CD (15 Questions)

**Q1. 🟢 What are the testing layers in React Native?**

**Unit tests** (Jest - logic/hooks), **Component tests** (React Native Testing Library - UI), **Integration tests** (MSW - API mocking), **E2E tests** (Detox/Maestro - full app). Use testing pyramid approach.

**Q2. 🟢 How do you set up Jest for React Native?**

Jest comes configured with React Native. Extend with `@testing-library/react-native` for component testing.

```js
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Q3. 🟡 How do you test React Native components?**

Use React Native Testing Library with queries like `getByText`, `getByRole`. Test user interactions and accessibility.

```tsx
import { render, fireEvent, screen } from '@testing-library/react-native';

describe('Counter', () => {
  it('increments count on press', () => {
    render(<Counter />);

    expect(screen.getByText('Count: 0')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Increment' }));

    expect(screen.getByText('Count: 1')).toBeTruthy();
  });
});
```

**Q4. 🟡 How do you test custom hooks?**

Use `renderHook` from `@testing-library/react-hooks` or `@testing-library/react-native`.

```tsx
import { renderHook, act } from '@testing-library/react-native';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

**Q5. 🟡 What is MSW and how do you use it for API mocking?**

MSW (Mock Service Worker) intercepts network requests for testing. More realistic than mocking fetch directly.

```tsx
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches users', async () => {
  render(<UserList />);
  expect(await screen.findByText('John')).toBeTruthy();
});
```

**Q6. 🔴 How do you set up Detox for E2E testing?**

Detox runs on simulators/emulators with gray-box testing capabilities. Requires native build configuration.

```bash
# Install
npm install detox --save-dev
detox init

# Build
detox build --configuration ios.sim.release

# Test
detox test --configuration ios.sim.release
```

```tsx
// e2e/login.test.js
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('user@test.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Welcome'))).toBeVisible();
  });
});
```

**Q7. 🟡 What is Maestro and how does it compare to Detox?**

Maestro is a newer E2E testing framework with YAML-based tests. Simpler setup than Detox, good for smaller teams.

```yaml
# flows/login.yaml
appId: com.myapp
---
- launchApp
- tapOn: "Email"
- inputText: "user@test.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Welcome"
```

**Q8. 🟡 How do you set up EAS Build for CI/CD?**

EAS Build handles cloud builds for Expo apps. Configure in `eas.json`, trigger from CI.

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

```yaml
# .github/workflows/build.yml
name: Build
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --platform all --non-interactive
```

**Q9. 🔴 How do you implement snapshot testing?**

Snapshot tests capture component output and compare against saved snapshots. Use sparingly—focused tests are better.

```tsx
import renderer from 'react-test-renderer';

test('Button renders correctly', () => {
  const tree = renderer.create(
    <Button title="Press me" onPress={() => {}} />
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
```

**Q10. 🟡 How do you test navigation?**

Mock navigation prop or wrap components in `NavigationContainer` for testing.

```tsx
import { NavigationContainer } from '@react-navigation/native';

const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

test('navigates to details on press', () => {
  const navigate = jest.fn();
  render(<HomeScreen navigation={{ navigate }} />);

  fireEvent.press(screen.getByText('View Details'));

  expect(navigate).toHaveBeenCalledWith('Details', { id: '123' });
});
```

**Q11. 🔴 How do you test async operations?**

Use `waitFor`, `findBy` queries, or `act` for async state updates.

```tsx
test('loads data on mount', async () => {
  render(<DataList />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByTestId('loading')).toBeNull();
  });

  // Or use findBy (waits automatically)
  expect(await screen.findByText('Data loaded')).toBeTruthy();
});
```

**Q12. 🟡 How do you measure test coverage?**

Configure Jest with `--coverage` flag. Set thresholds and integrate with CI.

```json
// package.json
{
  "jest": {
    "collectCoverage": true,
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

```bash
npm test -- --coverage
```

**Q13. 🔴 How do you test Reanimated animations?**

Mock Reanimated in tests or use `jest-reanimated` for worklet testing.

```tsx
// jest-setup.js
require('react-native-reanimated').setUpTests();

// Component test
test('animates on press', async () => {
  const { getByTestId } = render(<AnimatedButton />);

  fireEvent.press(getByTestId('button'));

  // Animation runs on UI thread, verify final state
  await waitFor(() => {
    expect(getByTestId('button')).toHaveAnimatedStyle({
      transform: [{ scale: 1.2 }],
    });
  });
});
```

**Q14. 🟡 What is the testing pyramid approach for RN?**

The testing pyramid is a strategy for distributing tests by type, optimizing the balance between execution speed, maintenance cost, and code confidence.

**Pyramid Structure for React Native:**

```
        /\
       /  \        E2E (Detox/Maestro) — 10%
      /----\       Slow, brittle, but verify real UX
     /      \
    /--------\     Integration — 20%
   /          \    Components + API + navigation
  /------------\   Medium speed, medium confidence
 /              \
/----------------\  Unit tests — 70%
                   Fast, isolated, verify logic
```

**Test Type Characteristics:**

| Type | Speed | Confidence | Maintenance Cost |
|------|-------|------------|------------------|
| Unit | Very fast | Low | Low |
| Integration | Medium | Medium | Medium |
| E2E | Slow | High | High |

**Practical Recommendations:**
- **Unit**: All pure functions, hooks, reducers, utilities
- **Integration**: Screen components with mocked API, navigation flows
- **E2E**: Critical user paths (login, checkout, core features)

**Anti-patterns:**
- Ice cream cone (many E2E, few unit tests) — slow CI, brittle tests
- 100% coverage without meaningful tests — false sense of security

**Q15. 🔴 How do you implement visual regression testing?**

Use tools like Percy, Chromatic, or screenshot comparison in Detox.

```tsx
// Detox visual test
it('matches screenshot', async () => {
  await device.launchApp();
  await element(by.id('home-screen')).takeScreenshot('home');

  // Compare with baseline
  expect(screenshot).toMatchImageSnapshot();
});
```

---

## 8. Deployment & Stores (10 Questions)

**Q1. 🟢 What is EAS Submit and how does it work?**

EAS Submit automates app store submissions. Handles signing, screenshots, metadata, and submits to App Store Connect/Google Play Console.

```bash
# Submit to stores
eas submit --platform ios
eas submit --platform android

# Auto-submit after build
eas build --platform all --auto-submit
```

**Q2. 🟡 How do you handle app signing?**

EAS manages signing automatically. For manual: iOS requires certificates/provisioning profiles, Android needs keystore. Store credentials securely.

```json
// eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "credentialsSource": "remote" // EAS manages
      },
      "ios": {
        "credentialsSource": "remote"
      }
    }
  }
}
```

**Q3. 🟡 What are OTA updates and how do you implement them?**

OTA (Over-The-Air) updates push JS bundle changes without app store review. Use EAS Update (Expo) or `expo-updates`.

```bash
# Publish update
eas update --branch production --message "Bug fix"

# Check for updates in app
import * as Updates from 'expo-updates';

const checkForUpdates = async () => {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  }
};
```

**Q4. 🔴 What are the CodePush alternatives in 2026?**

**EAS Update** (Expo - recommended), **Shorebird** (Flutter-style patches), **Microsoft CodePush** (deprecated, maintenance mode). EAS Update is the standard for Expo apps.

**Q5. 🟡 How do you configure app versioning?**

Manage version (user-facing) and buildNumber/versionCode (store-facing) separately. Automate in CI.

```json
// app.json
{
  "expo": {
    "version": "2.1.0",
    "ios": {
      "buildNumber": "45"
    },
    "android": {
      "versionCode": 45
    }
  }
}
```

```bash
# Auto-increment in CI
eas build --platform all --auto-increment
```

**Q6. 🔴 What are App Clips (iOS) and Instant Apps (Android)?**

Lightweight app experiences accessible without full install. App Clips via App Clip target, Instant Apps via feature modules.

```json
// app.json - App Clip config
{
  "expo": {
    "ios": {
      "appClips": [{
        "name": "OrderClip",
        "bundleIdentifier": "com.app.clip"
      }]
    }
  }
}
```

**Q7. 🟡 How do you handle environment configurations?**

Use `eas.json` build profiles and environment variables. Don't commit secrets.

```json
// eas.json
{
  "build": {
    "development": {
      "env": {
        "API_URL": "https://dev.api.com"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://api.com"
      }
    }
  }
}
```

```tsx
// Access in app
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

**Q8. 🔴 What is Apple Vision Pro support in React Native?**

React Native supports visionOS via `react-native-visionos`. Build spatial apps with existing RN knowledge. Experimental in 2026.

**Q9. 🟡 How do you handle app store rejection?**

Common causes: missing privacy policy, unclear permissions, incomplete metadata. Review guidelines, test on real devices, use TestFlight/internal testing.

**Q10. 🟡 How do you set up beta testing?**

Use TestFlight (iOS) and Play Console internal/closed testing (Android). EAS can automate distribution.

```bash
# Build for testing
eas build --profile preview --platform all

# Distribute
eas submit --platform ios --latest # Goes to TestFlight
```

---

## 9. Architecture & Best Practices (20 Questions)

**Q1. 🟢 What is the recommended project structure for RN 2026?**

Feature-based structure with shared components, hooks, and utilities. Expo Router enforces `app/` for routes.

```
src/
├── app/                    # Expo Router routes
│   ├── (tabs)/
│   ├── (auth)/
│   └── _layout.tsx
├── features/               # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── store.ts
│   └── products/
├── shared/                 # Shared code
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── services/               # API, storage, etc.
└── config/                 # App configuration
```

**Q2. 🟡 Explain feature slices architecture.**

Each feature is self-contained with its own components, state, and API. Reduces coupling, improves maintainability.

```
features/
├── cart/
│   ├── components/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── hooks/
│   │   └── useCart.ts
│   ├── api.ts
│   ├── store.ts
│   ├── types.ts
│   └── index.ts           # Public exports
```

**Q3. 🟡 How do you handle TypeScript in RN 2026?**

TypeScript 5.6+ with strict mode. Use path aliases, proper generic constraints, and avoid `any`.

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"]
    }
  }
}
```

**Q4. 🔴 What is domain-driven design (DDD) in RN?**

Organize code around business domains, not technical layers. Each domain has its own models, services, and UI.

```
domains/
├── order/
│   ├── models/
│   │   └── Order.ts
│   ├── services/
│   │   └── OrderService.ts
│   ├── repositories/
│   │   └── OrderRepository.ts
│   └── ui/
│       └── components/
├── inventory/
└── customer/
```

**Q5. 🟡 How do you implement dependency injection in RN?**

Use React Context or libraries like `tsyringe`. Helps with testing and modularity.

```tsx
import { container, injectable, inject } from 'tsyringe';

@injectable()
class AuthService {
  constructor(@inject('ApiClient') private api: ApiClient) {}

  async login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }
}

// Register
container.register('ApiClient', { useClass: HttpClient });

// Resolve
const authService = container.resolve(AuthService);
```

**Q6. 🟡 What are the error handling best practices?**

Use error boundaries, centralized error tracking (Sentry), type-safe error unions, and user-friendly messages.

```tsx
// Type-safe errors
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User, ApiError>> {
  try {
    const user = await api.get(`/users/${id}`);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: mapApiError(error) };
  }
}

// Usage
const result = await fetchUser(id);
if (result.success) {
  setUser(result.data);
} else {
  showError(result.error.message);
}
```

**Q7. 🔴 How do you set up a monorepo for RN?**

Use Turborepo or Nx with Yarn/pnpm workspaces. Share code between mobile, web, and backend.

```
packages/
├── app-mobile/          # React Native app
├── app-web/             # Next.js web app
├── ui/                  # Shared components (Tamagui)
├── api-client/          # Shared API client
└── shared/              # Shared utilities
```

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

**Q8. 🟡 What is the repository pattern?**

Abstracts data access behind interfaces. Swap implementations for testing or different data sources.

```tsx
interface UserRepository {
  getById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

class ApiUserRepository implements UserRepository {
  async getById(id: string) {
    return api.get(`/users/${id}`);
  }
  async save(user: User) {
    return api.put(`/users/${user.id}`, user);
  }
}

class MockUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async getById(id: string) {
    return this.users.get(id)!;
  }
  async save(user: User) {
    this.users.set(user.id, user);
  }
}
```

**Q9. 🟡 How do you implement clean API layers?**

Separate API calls from UI, use typed responses, handle errors consistently.

```tsx
// api/users.ts
import { api } from './client';
import type { User, UpdateUserDto } from '@/types';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  update: (id: string, data: UpdateUserDto) =>
    api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Usage with React Query
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: usersApi.getAll,
});
```

**Q10. 🔴 What are the module resolution strategies in RN?**

Metro bundler uses Node resolution. Configure aliases in `metro.config.js` and `tsconfig.json`.

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@features': path.resolve(__dirname, 'src/features'),
};

module.exports = config;
```

**Q11. 🟡 How do you manage environment variables?**

Use `expo-constants` with `app.config.js`, `.env` files with `react-native-dotenv`, or EAS build secrets.

```js
// app.config.js
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,
      sentryDsn: process.env.SENTRY_DSN,
    },
  },
};
```

```tsx
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

**Q12. 🔴 What is the presenter pattern in RN?**

Separates business logic from UI. Presenter handles data transformation, UI just renders.

```tsx
// useProductPresenter.ts
export function useProductPresenter(productId: string) {
  const { data: product, isLoading } = useProduct(productId);

  return {
    isLoading,
    title: product?.name ?? '',
    formattedPrice: product ? formatCurrency(product.price) : '',
    isOnSale: product?.salePrice < product?.price,
    stockStatus: getStockStatus(product?.inventory),
    canAddToCart: product?.inventory > 0,
  };
}

// ProductScreen.tsx
function ProductScreen({ productId }) {
  const presenter = useProductPresenter(productId);

  if (presenter.isLoading) return <Skeleton />;

  return (
    <View>
      <Text>{presenter.title}</Text>
      <Text>{presenter.formattedPrice}</Text>
      <Button disabled={!presenter.canAddToCart} />
    </View>
  );
}
```

**Q13. 🟡 How do you handle feature flags?**

Use services like LaunchDarkly, Statsig, or build custom solutions. Enable gradual rollouts.

```tsx
import { useFeatureFlag } from '@/services/featureFlags';

function CheckoutButton() {
  const newCheckoutEnabled = useFeatureFlag('new_checkout_flow');

  if (newCheckoutEnabled) {
    return <NewCheckoutButton />;
  }
  return <LegacyCheckoutButton />;
}
```

**Q14. 🔴 What is the MVVM pattern in React Native?**

Model-View-ViewModel separates data (Model), UI (View), and presentation logic (ViewModel/hooks).

```tsx
// ViewModel - useLoginViewModel.ts
export function useLoginViewModel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending } = useLoginMutation();

  const isValid = email.includes('@') && password.length >= 8;

  const handleLogin = () => {
    if (isValid) login({ email, password });
  };

  return {
    email, setEmail,
    password, setPassword,
    isValid,
    isLoading: isPending,
    handleLogin,
  };
}

// View - LoginScreen.tsx
function LoginScreen() {
  const vm = useLoginViewModel();

  return (
    <View>
      <TextInput value={vm.email} onChangeText={vm.setEmail} />
      <TextInput value={vm.password} onChangeText={vm.setPassword} />
      <Button
        onPress={vm.handleLogin}
        disabled={!vm.isValid || vm.isLoading}
      />
    </View>
  );
}
```

**Q15. 🟡 How do you implement logging and debugging?**

Use structured logging, environment-based log levels, and production error tracking.

```tsx
// logger.ts
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = __DEV__ ? 'debug' : 'error';

export const logger = {
  debug: (...args) => {
    if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => console.info('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (message, error) => {
    console.error('[ERROR]', message, error);
    if (!__DEV__) {
      Sentry.captureException(error);
    }
  },
};
```

**Q16. 🔴 What is the composition pattern for components?**

Build complex components from smaller, focused ones. Use children, render props, or compound components.

```tsx
// Compound component pattern
function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

Card.Header = ({ children }) => (
  <View style={styles.header}>{children}</View>
);

Card.Body = ({ children }) => (
  <View style={styles.body}>{children}</View>
);

Card.Footer = ({ children }) => (
  <View style={styles.footer}>{children}</View>
);

// Usage
<Card>
  <Card.Header><Title>Product</Title></Card.Header>
  <Card.Body><Description /></Card.Body>
  <Card.Footer><Price /></Card.Footer>
</Card>
```

**Q17. 🟡 How do you handle code sharing between platforms?**

Use platform extensions (`.ios.ts`, `.android.ts`, `.web.ts`), Platform.select(), or cross-platform libraries like Tamagui.

```tsx
// Button.tsx - shared logic
// Button.ios.tsx - iOS specific
// Button.android.tsx - Android specific

// Or in single file
const PlatformButton = Platform.select({
  ios: IOSButton,
  android: AndroidButton,
  default: DefaultButton,
});
```

**Q18. 🔴 What are the security best practices?**

Secure storage for tokens, certificate pinning, input validation, avoid hardcoded secrets, use HTTPS, implement proper auth flows.

```tsx
// Secure storage
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('auth_token', token);

// Certificate pinning
import { fetch } from 'react-native-ssl-pinning';

await fetch(url, {
  sslPinning: {
    certs: ['cert1', 'cert2'],
  },
});
```

**Q19. 🟡 How do you implement proper TypeScript generics?**

Use generics for reusable, type-safe utilities and components.

```tsx
// Generic API hook
function useQuery<TData, TError = Error>(
  key: string[],
  fetcher: () => Promise<TData>
): QueryResult<TData, TError> {
  // Implementation
}

// Generic list component
interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ data, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <View>
      {data.map((item, index) => (
        <View key={keyExtractor(item)}>{renderItem(item, index)}</View>
      ))}
    </View>
  );
}
```

**Q20. 🔴 What is the Facade pattern for native modules?**

Abstract complex native APIs behind simple JavaScript interfaces. Hides platform differences.

```tsx
// mediaFacade.ts
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const mediaFacade = {
  async pickImage(): Promise<MediaAsset | null> {
    const permission = await this.requestPermission();
    if (!permission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return null;

    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
    };
  },

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  },
};
```

---

## 10. Hot Topics 2026 (15 Questions)

**Q1. 🟡 What is React Native for Web 0.40+ in 2026?**

React Native for Web is a library that allows running React Native apps in the browser, rendering RN components to DOM elements. In 2026, it's a mature solution for creating truly cross-platform applications.

**How It Works:**
- `View` → `<div>`
- `Text` → `<span>` with proper styles
- `Image` → `<img>` with lazy loading
- StyleSheet → CSS-in-JS or CSS variables

**Advantages in 2026:**
- **Near 100% API parity** with mobile platforms
- **New Architecture support**: Fabric-compatible components work on web
- **SEO optimization**: SSR with Next.js or Expo Router
- **Accessibility**: Automatic addition of ARIA attributes

**Integration with Expo:**
```javascript
// app.config.js
export default {
  expo: {
    web: {
      bundler: 'metro', // Unified bundler for all platforms
      output: 'single', // SPA or 'server' for SSR
    },
  },
};
```

**Limitations:**
- Some native modules require web alternatives
- Reanimated animations work through CSS transitions
- Gestures via Gesture Handler require pointer events

```tsx
// Works on iOS, Android, and Web
<View style={{ padding: 20 }}>
  <Text accessibilityRole="heading">Hello World</Text>
  <Pressable onPress={() => alert('Pressed')}>
    <Text>Click me</Text>
  </Pressable>
</View>
```

**Q2. 🔴 What is Tauri integration with React Native?**

Tauri is a framework for creating desktop applications that uses the system WebView instead of embedding Chromium (like Electron). This makes applications significantly lighter and faster.

**Tauri + React Native for Web:**
This combination allows using a single RN codebase for iOS, Android, Web, and Desktop (macOS, Windows, Linux).

**Comparison with Electron:**

| Metric | Tauri | Electron |
|--------|-------|----------|
| App size | ~3-10 MB | ~150+ MB |
| RAM | ~30-50 MB | ~150+ MB |
| Cold start | Instant | 2-5 seconds |
| Backend | Rust | Node.js |
| WebView | System | Chromium |

**Architecture:**
```
React Native App
       ↓
React Native for Web
       ↓
Tauri WebView (system)
       ↓
Rust Backend (optional)
```

**Limitations:**
- Behavior may differ between WebViews of different OSes
- No access to some Web APIs (depends on WebView)
- Requires Rust knowledge for native extensions

**Alternatives:** React Native for Windows/macOS from Microsoft — native rendering without WebView, but a separate codebase.

**Q3. 🟡 How do you implement on-device ML in RN 2026?**

Use TensorFlow.js Lite, react-native-fast-tflite, or Vision Camera frame processors for real-time ML.

```tsx
import { useTensorflowModel } from 'react-native-fast-tflite';

const model = useTensorflowModel(require('./model.tflite'));

const predict = async (input: Float32Array) => {
  const output = await model.run([input]);
  return output[0];
};
```

**Q4. 🔴 What is Vision Camera 4+ and its capabilities?**

Vision Camera 4 offers 60fps camera with frame processors (ML on camera feed), HDR, multi-camera, and near-native performance.

```tsx
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { detectFaces } from 'vision-camera-face-detector';

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const faces = detectFaces(frame);
  console.log(`Detected ${faces.length} faces`);
}, []);

<Camera
  style={StyleSheet.absoluteFill}
  device={device}
  isActive={true}
  frameProcessor={frameProcessor}
/>
```

**Q5. 🟡 How does App Tracking Transparency 2.0 affect RN apps?**

iOS requires explicit permission for tracking. Implement ATT prompt before analytics/ads initialization.

```tsx
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const requestTracking = async () => {
  const { status } = await requestTrackingPermissionsAsync();

  if (status === 'granted') {
    initializeAnalytics();
  } else {
    initializePrivacyFriendlyAnalytics();
  }
};
```

**Q6. 🟡 What is Expo SDK 53+ offering?**

Expo SDK 53 includes improved New Architecture support, enhanced router, better web support, React Native 0.76+, and improved native module authoring.

**Q7. 🔴 How do you implement edge computing with RN?**

Use Cloudflare Workers, Vercel Edge, or Supabase Edge Functions. Combine with Expo Router API routes for full-stack apps.

```tsx
// app/api/analyze+api.ts (Expo Router)
export async function POST(request: Request) {
  const { image } = await request.json();

  // Process at edge
  const result = await analyzeImage(image);

  return Response.json({ result });
}
```

**Q8. 🟡 What is NativeWind v4 and its improvements?**

NativeWind v4 brings Tailwind CSS 4 to React Native with improved dark mode, custom fonts, CSS variables, and better performance.

```tsx
import { styled } from 'nativewind';

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);

<StyledView className="flex-1 bg-white dark:bg-slate-900 p-4">
  <StyledText className="text-xl font-bold text-gray-900 dark:text-white">
    Hello World
  </StyledText>
</StyledView>
```

**Q9. 🔴 How do you implement voice interfaces in RN?**

Use `expo-speech` for TTS, `@react-native-voice/voice` for STT, and integrate with LLMs for conversational AI.

```tsx
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

const startListening = async () => {
  await Voice.start('en-US');
};

Voice.onSpeechResults = (e) => {
  const transcript = e.value?.[0];
  processVoiceCommand(transcript);
};

const speak = (text: string) => {
  Speech.speak(text, { language: 'en' });
};
```

**Q10. 🟡 What is Supabase integration for RN?**

Supabase provides Postgres, Auth, Storage, and Edge Functions. Full-featured backend for RN apps with real-time subscriptions.

```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Real-time
supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => addMessage(payload.new))
  .subscribe();
```

**Q11. 🔴 What is the React Compiler's impact on RN development?**

React Compiler (formerly known as React Forget) is a compiler that automatically optimizes React code by adding memoization where needed. This is a revolutionary change in React Native development.

**What React Compiler Does:**
- Automatically wraps components in `memo()`
- Adds `useMemo` for expensive computations
- Creates `useCallback` for callbacks passed to props
- Analyzes dependencies and adds correct deps arrays

**Before and After:**
```jsx
// Before — manual optimization
const MemoizedList = memo(({ items, onSelect }) => {
  const sorted = useMemo(() => items.sort(compare), [items]);
  const handleSelect = useCallback((id) => onSelect(id), [onSelect]);
  return <FlashList data={sorted} onPress={handleSelect} />;
});

// After — compiler handles it automatically
const List = ({ items, onSelect }) => {
  const sorted = items.sort(compare);
  const handleSelect = (id) => onSelect(id);
  return <FlashList data={sorted} onPress={handleSelect} />;
};
// Compiler generates optimized code at build time
```

**Impact on Development:**
1. **Less cognitive load**: No need to think about memoization
2. **Fewer bugs**: No forgotten dependencies in `useCallback`
3. **Cleaner code**: Removes boilerplate wrappers
4. **Same performance**: Compiler is no worse than manual optimization

**Status in 2026:** React Compiler is in beta for RN 0.76+, enabled via Babel plugin. Recommended for new projects.

**Q12. 🟡 How do you implement biometric authentication?**

Use `expo-local-authentication` for Face ID/Touch ID/fingerprint auth.

```tsx
import * as LocalAuthentication from 'expo-local-authentication';

const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return { success: false, error: 'Biometrics not available' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to continue',
    fallbackLabel: 'Use passcode',
  });

  return result;
};
```

**Q13. 🔴 What is Convex for React Native?**

Convex is a backend-as-a-service with built-in real-time sync, TypeScript-first, and automatic offline support. Replaces REST + React Query.

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function Chat() {
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  return (
    <View>
      <FlashList
        data={messages}
        renderItem={({ item }) => <Message {...item} />}
      />
      <Input onSubmit={(text) => sendMessage({ text })} />
    </View>
  );
}
```

**Q14. 🟡 How do you implement push notifications in 2026?**

Use `expo-notifications` with FCM (Android) and APNs (iOS). Handle foreground, background, and quit states.

```tsx
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const schedulePushNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reminder',
      body: 'Check your tasks!',
    },
    trigger: { seconds: 60 },
  });
};
```

**Q15. 🔴 What's the future roadmap for React Native in 2026?**

React Native in 2026 continues to evolve, focusing on performance, cross-platform capability, and developer experience.

**Completed Initiatives:**
- ✅ New Architecture by default (RN 0.76+)
- ✅ Hermes as the primary JS engine
- ✅ Bridgeless mode
- ✅ React 18+ integration with Concurrent Features

**Active Directions in 2026:**

1. **React Compiler (Forget)**
   - Automatic memoization
   - Transition from beta to stable
   - Deep integration with Metro

2. **Improved Cross-Platform**
   - React Native for Web — API parity
   - visionOS (Apple Vision Pro) — experimental support
   - Improved desktop integration

3. **Developer Tools**
   - New React Native DevTools (replacing Flipper)
   - Improved performance profiling
   - VS Code integration

4. **Styling and UI**
   - Native CSS variables support
   - Improved theming and dark mode
   - Tamagui/NativeWind as recommended solutions

5. **Server Components**
   - Experimental support via Expo Router
   - Server Functions for full-stack development

**Development Philosophy:** Meta continues investing in RN, focusing on "write once, run anywhere" while maintaining native performance.

---

## Coding Challenges (10 Tasks)

### Challenge 1: Custom useDebounce Hook 🟢

**Task:** Implement a `useDebounce` hook that delays value updates.

```tsx
// Solution
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchApi(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <TextInput value={query} onChangeText={setQuery} />;
}
```

### Challenge 2: Infinite Scroll List 🟡

**Task:** Implement infinite scroll with FlashList and loading states.

```tsx
// Solution
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
  });

  const items = data?.pages.flatMap(page => page.items) ?? [];

  return (
    <FlashList
      data={items}
      renderItem={({ item }) => <ItemCard item={item} />}
      estimatedItemSize={80}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

### Challenge 3: Authentication Flow with Context 🟡

**Task:** Implement a complete auth context with login, logout, and session persistence.

```tsx
// Solution
import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const userData = await api.getUser(token);
        setUser(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    await SecureStore.setItemAsync('auth_token', token);
    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Challenge 4: Animated Pull-to-Refresh 🔴

**Task:** Build a custom pull-to-refresh with Reanimated.

```tsx
// Solution
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function PullToRefresh({ onRefresh, children }) {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const THRESHOLD = 80;

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (!isRefreshing.value && e.translationY > 0) {
        translateY.value = Math.min(e.translationY * 0.5, THRESHOLD + 20);
      }
    })
    .onEnd(() => {
      if (translateY.value >= THRESHOLD) {
        isRefreshing.value = true;
        translateY.value = withSpring(THRESHOLD);
        runOnJS(handleRefresh)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const handleRefresh = async () => {
    await onRefresh();
    isRefreshing.value = false;
    translateY.value = withSpring(0);
  };

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: translateY.value / THRESHOLD,
    transform: [
      { translateY: translateY.value - 40 },
      { rotate: `${(translateY.value / THRESHOLD) * 360}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          <RefreshIcon />
        </Animated.View>
        <Animated.View style={contentStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}
```

### Challenge 5: Form with Validation 🟡

**Task:** Create a registration form with react-hook-form and Zod validation.

```tsx
// Solution
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function RegistrationForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Submit:', data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Password"
              secureTextEntry
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Confirm Password"
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            )}
          </View>
        )}
      />

      <Pressable onPress={handleSubmit(onSubmit)} style={styles.button}>
        <Text>Register</Text>
      </Pressable>
    </View>
  );
}
```

### Challenge 6: Optimistic Todo List 🔴

**Task:** Implement a todo list with optimistic updates using TanStack Query.

```tsx
// Solution
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function TodoList() {
  const queryClient = useQueryClient();

  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: api.getTodos,
  });

  const addTodoMutation = useMutation({
    mutationFn: api.addTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueryData(['todos']);

      const optimisticTodo = {
        id: `temp-${Date.now()}`,
        ...newTodo,
        completed: false,
      };

      queryClient.setQueryData(['todos'], (old: Todo[]) => [...old, optimisticTodo]);

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      api.updateTodo(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old: Todo[]) =>
        old.map(todo => todo.id === id ? { ...todo, completed } : todo)
      );

      return { previousTodos };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
  });

  return (
    <View>
      <AddTodoInput onAdd={(text) => addTodoMutation.mutate({ text })} />
      <FlashList
        data={todos}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={(completed) =>
              toggleTodoMutation.mutate({ id: item.id, completed })
            }
          />
        )}
        estimatedItemSize={60}
      />
    </View>
  );
}
```

### Challenge 7: Gesture-Based Card Stack 🔴

**Task:** Create a Tinder-like swipeable card stack.

```tsx
// Solution
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function CardStack({ cards, onSwipe }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.container}>
      {cards.slice(currentIndex, currentIndex + 3).map((card, i) => (
        <SwipeableCard
          key={card.id}
          card={card}
          index={i}
          onSwipe={(direction) => {
            onSwipe(card, direction);
            setCurrentIndex(prev => prev + 1);
          }}
        />
      ))}
    </View>
  );
}

function SwipeableCard({ card, index, onSwipe }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const THRESHOLD = 120;

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (Math.abs(translateX.value) > THRESHOLD) {
        const direction = translateX.value > 0 ? 'right' : 'left';
        translateX.value = withSpring(translateX.value > 0 ? 500 : -500);
        runOnJS(onSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-200, 200], [-15, 15])}deg` },
      { scale: index === 0 ? 1 : 0.95 - index * 0.05 },
    ],
    zIndex: 10 - index,
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, THRESHOLD], [0, 1]),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-THRESHOLD, 0], [1, 0]),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={{ uri: card.image }} style={styles.cardImage} />
        <Animated.View style={[styles.stamp, styles.like, likeStyle]}>
          <Text style={styles.stampText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.nope, nopeStyle]}>
          <Text style={styles.stampText}>NOPE</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Challenge 8: Skeleton Loading Component 🟡

**Task:** Create a reusable skeleton loader with shimmer animation.

```tsx
// Solution
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

function Skeleton({ width, height, borderRadius = 4 }) {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerPosition.value,
          [-1, 1],
          [-width, width]
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius, overflow: 'hidden' },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Usage
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}
```

### Challenge 9: Deep Link Handler 🟡

**Task:** Implement deep link handling with Expo Router.

```tsx
// Solution
// app/_layout.tsx
import { useEffect } from 'react';
import { useRouter, useSegments, Slot } from 'expo-router';
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);

      // Handle specific deep links
      if (path?.startsWith('product/')) {
        const productId = path.split('/')[1];
        router.push(`/product/${productId}`);
      } else if (path === 'settings') {
        router.push('/settings');
      } else if (path?.startsWith('invite/')) {
        const code = queryParams?.code;
        router.push({ pathname: '/invite', params: { code } });
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [router]);

  return <Slot />;
}

// app.json config
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "myapp" }, { "scheme": "https", "host": "myapp.com" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Challenge 10: Performance-Optimized Image Gallery 🔴

**Task:** Build a performant image gallery with lazy loading and gestures.

```tsx
// Solution
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function ImageGallery({ images }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={images}
        numColumns={3}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => setSelectedIndex(index)}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={item.id}
              placeholder={item.blurhash}
            />
          </Pressable>
        )}
        estimatedItemSize={120}
      />

      {selectedIndex !== null && (
        <FullScreenViewer
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </View>
  );
}

function FullScreenViewer({ images, initialIndex, onClose }) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(e.scale, 3));
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withSpring(1);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      } else if (Math.abs(e.translationY) > 100) {
        runOnJS(onClose)();
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <CloseIcon />
      </Pressable>

      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.fullImage, animatedStyle]}>
          <Image
            source={{ uri: images[initialIndex].fullsize }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## Resources & Cheat Sheets

### Official Documentation

- [React Native 0.76 Docs](https://reactnative.dev/docs/getting-started)
- [Expo SDK 53 Docs](https://docs.expo.dev/)
- [React Navigation 7](https://reactnavigation.org/docs/getting-started)
- [Reanimated 3.5](https://docs.swmansion.com/react-native-reanimated/)
- [Expo Router v4](https://docs.expo.dev/router/introduction/)

### Essential Libraries 2026

| Category | Library | Purpose |
|----------|---------|---------|
| State | Zustand 5 | Simple global state |
| Server State | TanStack Query 5 | Data fetching/caching |
| Navigation | Expo Router v4 | File-based routing |
| Animation | Reanimated 3.5 | 60fps animations |
| Gestures | Gesture Handler 3 | Native gestures |
| Lists | FlashList 2 | Performant lists |
| Styling | Tamagui / NativeWind v4 | Design systems |
| Forms | react-hook-form + Zod | Type-safe forms |
| Testing | Jest 30 + Detox 20 | Unit + E2E |
| Images | expo-image | Optimized images |

### Performance Checklist

- [ ] Hermes enabled
- [ ] New Architecture enabled
- [ ] FlashList for long lists
- [ ] Memoized callbacks/values
- [ ] Lazy loaded screens
- [ ] Optimized images (WebP, caching)
- [ ] Worklets for animations
- [ ] No console.logs in production
- [ ] Profiled with Flipper

### TypeScript Cheat Sheet

```tsx
// Component Props
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// Generic Component
interface ListProps<T> {
  data: T[];
  renderItem: (item: T) => ReactNode;
}

// Navigation Types
type RootStackParamList = {
  Home: undefined;
  Details: { id: string };
  Profile: { userId: string; edit?: boolean };
};

// Store Types
interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
}
```

### Must-Read Blog Posts 2026

- [Callstack: New Architecture Deep Dive](https://callstack.com)
- [Expo 2026 Roadmap](https://blog.expo.dev)
- [Shopify: FlashList Best Practices](https://shopify.engineering)
- [Software Mansion: Reanimated 3.5 Guide](https://blog.swmansion.com)

### GitHub Repositories

- [react-native-best-practices-2026](https://github.com/example/rn-best-practices)
- [expo-starter-template](https://github.com/expo/expo)
- [react-native-benchmarks](https://github.com/example/rn-benchmarks)

---

## Quick Reference Cards

### Hooks Priority

```
useState       → Local UI state
useReducer     → Complex local state
useRef         → Mutable refs, no re-render
useMemo        → Expensive computations
useCallback    → Stable function refs
useEffect      → Side effects
useLayoutEffect → Sync layout effects
useContext     → Context consumption
```

### Animation Decision Tree

```
Simple transition? → Animated API / Moti
Complex gesture? → Reanimated + Gesture Handler
Vector animation? → Lottie
Layout animation? → Reanimated entering/exiting
Scroll-linked? → useAnimatedScrollHandler
```

### State Management Decision Tree

```
Local UI only? → useState
Complex local? → useReducer
Shared across app? → Zustand
Server data? → TanStack Query
Offline-first? → WatermelonDB + Zustand
Real-time? → Convex / Supabase
```

---

*Last updated: January 2026. Covers React Native 0.76+, Expo SDK 53+, and the React Native ecosystem.*
