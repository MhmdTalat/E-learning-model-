# Animation Effects Implementation Guide

## Overview

Your E-learning platform now has a comprehensive animation system that makes interactions smoother and more engaging. Animations are available through:

1. **Tailwind CSS animations** - Pre-built in tailwind.config.ts
2. **Custom CSS animations** - Defined in animations.css
3. **Custom hooks** - React hooks for managing animations programmatically

## Quick Start

### Using with HTML/JSX

```tsx
// Fade in animation
<div className="animate-fade-in">Content</div>

// Slide in with stagger
<div className="animate-slide-up-stagger">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Card with hover effect
<Card className="card-hover">Content</Card>

// Button with hover
<Button className="button-hover">Click Me</Button>
```

## Available Animations

### Basic Animations

| Animation    | Class                          | Duration | Use Case           |
| ------------ | ------------------------------ | -------- | ------------------ |
| Fade in      | `animate-fade-in`              | 500ms    | Page/section load  |
| Fade out     | `animate-fade-out`             | 300ms    | Element removal    |
| Slide left   | `animate-slide-in-from-left`   | 400ms    | Sidebar open       |
| Slide right  | `animate-slide-in-from-right`  | 400ms    | Panel open         |
| Slide top    | `animate-slide-in-from-top`    | 400ms    | Dropdown open      |
| Slide bottom | `animate-slide-in-from-bottom` | 400ms    | Modal appear       |
| Scale in     | `animate-scale-in`             | 300ms    | Item appear        |
| Scale out    | `animate-scale-out`            | 200ms    | Item remove        |
| Bounce       | `animate-bounce-in`            | 500ms    | Alert/notification |
| Pulse        | `animate-pulse-soft`           | 2s       | Loading state      |
| Float        | `animate-float`                | 6s       | Floating effect    |
| Glow         | `animate-glow`                 | 2s       | Highlight/focus    |
| Shimmer      | `animate-shimmer`              | 2s       | Loading skeleton   |
| Spin slow    | `animate-spin-slow`            | 3s       | Loading indicator  |

### Stagger Animations

| Class                      | Purpose             | Max Items |
| -------------------------- | ------------------- | --------- |
| `animate-fade-in-stagger`  | Fade in with delay  | Unlimited |
| `animate-slide-up-stagger` | Slide up with delay | Unlimited |
| `grid-item-stagger`        | Grid items cascade  | 6+        |
| `list-item-stagger`        | List items cascade  | 8+        |

### Interaction Effects

| Class            | Effect                     |
| ---------------- | -------------------------- |
| `card-hover`     | Card lifts on hover        |
| `button-hover`   | Button lifts and shadows   |
| `hover-scale`    | Element scales 5% on hover |
| `hover-scale-sm` | Element scales 2% on hover |
| `input-focus`    | Input glows on focus       |

### Special Effects

| Class              | Effect                   |
| ------------------ | ------------------------ |
| `dialog-overlay`   | Fade in background       |
| `dialog-content`   | Scale in modal           |
| `toast-enter`      | Slide in from bottom     |
| `toast-exit`       | Slide out right          |
| `dropdown-enter`   | Slide in from top        |
| `error-shake`      | Error shake animation    |
| `success-check`    | Success checkmark bounce |
| `skeleton-loading` | Shimmer loading effect   |
| `text-reveal`      | Text clip reveal         |

## React Hooks for Animation

### useAnimation

```tsx
import { useAnimation } from "@/hooks/useAnimation";

function MyComponent() {
  const animationClass = useAnimation(true, "fade-in");

  return <div className={animationClass}>Content</div>;
}
```

**Parameters:**

- `trigger` (boolean) - Condition to start animation
- `animationType` (AnimationType) - Type of animation
- **Returns:** Animation class string

### useStaggerAnimation

```tsx
const listClass = useStaggerAnimation(items, true);

return (
  <div className={listClass}>
    {items.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
);
```

**Parameters:**

- `items` (any[]) - Array of items to animate
- `trigger` (boolean) - Start condition
- **Returns:** Stagger animation class

### usePageAnimation

```tsx
import { usePageAnimation } from "@/hooks/useAnimation";

function Page() {
  const pageClass = usePageAnimation();

  return <div className={pageClass}>Page content</div>;
}
```

**Returns:** Page container animation class

### useScrollAnimation

```tsx
import { useScrollAnimation } from "@/hooks/useAnimation";

function ScrollElement() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <div ref={ref} className={isVisible ? "animate-fade-in" : ""}>
      This animates when scrolled into view
    </div>
  );
}
```

**Returns:** [ref, isVisible]

### useEventAnimation

```tsx
const [handlers, isAnimating] = useEventAnimation("hover");

return (
  <button {...handlers} className={isAnimating ? "scale-110" : ""}>
    Hover me
  </button>
);
```

## Delay Classes

For staggered timing:

```tsx
<div className="delay-100">First</div>   {/* 100ms delay */}
<div className="delay-200">Second</div>  {/* 200ms delay */}
<div className="delay-300">Third</div>   {/* 300ms delay */}
```

Available delays: 100ms, 200ms, 300ms, 400ms, 500ms, 600ms, 700ms, 800ms, 1000ms

## Duration Classes

For custom timing:

```tsx
<div className="animate-fade-in duration-700">Slower fade</div>
```

Available durations: 300ms, 500ms, 700ms, 1000ms

## Page Examples

### Dashboard Page Animation

```tsx
import { usePageAnimation } from "@/hooks/useAnimation";

function Dashboard() {
  const pageClass = usePageAnimation();

  return (
    <div className={`${pageClass} space-y-6`}>
      {/* Header with slide animation */}
      <div className="animate-slide-in-from-top">
        <h1>Dashboard</h1>
      </div>

      {/* Cards with stagger effect */}
      <div className="grid grid-cols-3 gap-4 grid-item-stagger">
        <Card className="card-hover">Card 1</Card>
        <Card className="card-hover">Card 2</Card>
        <Card className="card-hover">Card 3</Card>
      </div>

      {/* Table with row animations */}
      <Table>
        <TableBody className="list-item-stagger">
          {items.map((item) => (
            <TableRow key={item.id} className="table-row-enter">
              {/* row content */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Form Page Animation

```tsx
function FormPage() {
  const pageClass = usePageAnimation();

  return (
    <div className={pageClass}>
      <div className="animate-slide-in-from-bottom delay-100">
        <Input className="input-focus" placeholder="Name" />
      </div>
      <div className="animate-slide-in-from-bottom delay-200">
        <Input className="input-focus" placeholder="Email" />
      </div>
      <div className="animate-slide-in-from-bottom delay-300">
        <Button className="button-hover">Submit</Button>
      </div>
    </div>
  );
}
```

### List with Stagger Animation

```tsx
function StudentsList({ students }) {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div ref={ref} className={`${isVisible ? "list-item-stagger" : ""}`}>
      {students.map((student) => (
        <div key={student.id} className="table-row-enter">
          <StudentCard student={student} />
        </div>
      ))}
    </div>
  );
}
```

## Applying Animations to Your Pages

### Step 1: Import Hook (Optional)

```tsx
import { usePageAnimation } from "@/hooks/useAnimation";
```

### Step 2: Add Animations to Container

```tsx
const pageClass = usePageAnimation();

return <div className={`${pageClass} space-y-6`}>{/* Content */}</div>;
```

### Step 3: Add Interactive Animations

```tsx
// Cards
<Card className="card-hover">Content</Card>

// Buttons
<Button className="button-hover">Click</Button>

// Lists
<div className="list-item-stagger">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// Grids
<div className="grid gap-4 grid-item-stagger">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

## Performance Tips

1. **Use CSS animations** for always-visible elements
2. **Use scroll animations** for below-fold content
3. **Limit stagger items** to reasonable numbers (~10-15)
4. **Test on mobile** - some devices may struggle with too many animations
5. **Respect user preferences** - animations auto-disable if `prefers-reduced-motion`

## Customization

### Add Custom Animation

1. Add to `tailwind.config.ts` in keyframes:

```typescript
keyframes: {
  "my-animation": {
    from: { /* start state */ },
    to: { /* end state */ },
  },
},
animation: {
  "my-animation": "my-animation 0.5s ease-out",
},
```

2. Use in component:

```tsx
<div className="animate-my-animation">Content</div>
```

### Add Custom CSS Animation

1. Edit `animations.css`:

```css
@keyframes my-effect {
  from {
    /* start */
  }
  to {
    /* end */
  }
}

.my-effect {
  animation: my-effect 0.5s ease-out;
}
```

2. Use in component:

```tsx
<div className="my-effect">Content</div>
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with `-webkit-` prefixes auto-added by Tailwind)
- IE 11: Not supported

## Mobile Considerations

- Animations work on mobile but may impact performance
- Use `prefers-reduced-motion` media query (auto-included)
- Test on real devices, not just browsers
- Consider reducing animation count on mobile-heavy pages

## Common Patterns

### Loading State

```tsx
{
  isLoading ? (
    <div className="animate-shimmer h-10 rounded bg-muted" />
  ) : (
    <div className="animate-fade-in">{content}</div>
  );
}
```

### Success Message

```tsx
<div className="success-check">✓ Operation successful!</div>
```

### Error Toast

```tsx
<div className="error-shake bg-destructive text-white p-4 rounded">
  Something went wrong!
</div>
```

### Button Loading

```tsx
<Button disabled={isLoading}>
  {isLoading && <div className="animate-spin-slow mr-2" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

## Troubleshooting

**Animation not showing?**

- Check if element is visible (display, opacity)
- Verify class name is correct
- Check console for CSS errors
- Ensure animations.css is imported

**Animation too fast/slow?**

- Adjust duration class (duration-300, duration-500, etc.)
- Or modify in tailwind.config.ts

**Animation janky?**

- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width` or `height`
- Reduce number of concurrent animations

**Not working on mobile?**

- Check if `prefers-reduced-motion` is enabled
- Test on actual device
- Check for performance issues

## Resources

- Tailwind CSS Animations: https://tailwindcss.com/docs/animation
- CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/animation
- Animation Best Practices: https://web.dev/animations-guide/
