# 🎬 Animation Classes - Visual Reference

A quick visual reference of all available animation classes organized by category.

## 📋 Table of Contents

- [Basic Animations](#basic-animations)
- [Stagger Animations](#stagger-animations)
- [Interactive Effects](#interactive-effects)
- [Special Effects](#special-effects)
- [Utility Classes](#utility-classes)

---

## Basic Animations

### Fade

```
CLASS                      DURATION    USE CASE
animate-fade-in           500ms       Page/section load
animate-fade-out          300ms       Element removal
```

### Slide (Entrance)

```
CLASS                           DURATION    USE CASE
animate-slide-in-from-left     400ms       Sidebar/panel open from left
animate-slide-in-from-right    400ms       Sidebar/panel open from right
animate-slide-in-from-top      400ms       Dropdown menu appears
animate-slide-in-from-bottom   400ms       Modal/sheet appears
```

### Slide (Exit)

```
CLASS                       DURATION    USE CASE
animate-slide-out-to-left   300ms       Menu/panel closes to left
animate-slide-out-to-right  300ms       Menu/panel closes to right
```

### Scale

```
CLASS                 DURATION    USE CASE
animate-scale-in     300ms       Item/dialog appears
animate-scale-out    200ms       Item/dialog disappears
```

### Bounce & Elastic

```
CLASS                  DURATION    USE CASE
animate-bounce-in      500ms       Alert/notification appears
```

### Infinite Animations

```
CLASS                  DURATION    USE CASE
animate-pulse-soft     2s          Loading state indicator
animate-shimmer        2s          Loading skeleton
animate-spin-slow      3s          Loading spinner
animate-float          6s          Floating/emphasis effect
animate-glow           2s          Focus/highlight effect
```

### Other

```
CLASS                  DURATION    USE CASE
animate-flip           600ms       Card flip effect
animate-wiggle         500ms       Attention-seeking
```

---

## Stagger Animations

Group elements to cascade with delays:

```
<div className="animate-fade-in-stagger">
  <div>Item 1 (100ms delay)</div>
  <div>Item 2 (200ms delay)</div>
  <div>Item 3 (300ms delay)</div>
</div>
```

```
<div className="animate-slide-up-stagger">
  <div>Item 1 (0ms delay)</div>
  <div>Item 2 (100ms delay)</div>
  <div>Item 3 (200ms delay)</div>
</div>
```

### Grid Items

```
<div className="grid grid-cols-3 gap-4 grid-item-stagger">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

Automatically staggers up to 6 items, then uses 600ms delay

### List Items

```
<tbody className="list-item-stagger">
  <tr>Row 1</tr>
  <tr>Row 2</tr>
  <tr>Row 3</tr>
</tbody>
```

Automatically staggers up to 8 items, then uses 800ms delay

---

## Interactive Effects

### Hover Animations

| Class            | Effect             | Tips                        |
| ---------------- | ------------------ | --------------------------- |
| `card-hover`     | Lifts 4px + shadow | Use on Card components      |
| `button-hover`   | Lifts 2px + shadow | Use on Button components    |
| `hover-scale`    | Scales to 105%     | Use on interactive elements |
| `hover-scale-sm` | Scales to 102%     | Subtle scale effect         |

### Focus Animations

| Class         | Effect              | Tips                    |
| ------------- | ------------------- | ----------------------- |
| `input-focus` | Glow + border color | Use on Input components |

### Event Animations

| Class            | Trigger | Effect      |
| ---------------- | ------- | ----------- |
| `dialog-overlay` | Mount   | Fade in     |
| `dialog-content` | Mount   | Scale in    |
| `toast-enter`    | Show    | Slide up    |
| `toast-exit`     | Hide    | Slide right |
| `dropdown-enter` | Open    | Slide down  |

---

## Special Effects

### Loading

```
<!-- Skeleton loader -->
<div className="skeleton-loading h-10 rounded w-full" />

<!-- Shimmer effect -->
<div className="animate-shimmer h-8 rounded bg-muted" />
```

### Status Indicators

```
<!-- Success -->
<div className="success-check">✓ Success!</div>

<!-- Error -->
<div className="error-shake">⚠ Error!</div>

<!-- Loading spinner -->
<div className="animate-spin-slow">⟳</div>
```

### Text Effects

```
<!-- Text reveal -->
<p className="text-reveal">Text clips in from left</p>

<!-- Floating text -->
<div className="animate-float">Floating</div>

<!-- Pulsing text -->
<span className="animate-pulse-soft">Pulsing</span>
```

### Visual Effects

```
<!-- Glow effect -->
<div className="animate-glow">Glowing element</div>

<!-- Gradient animation -->
<div className="gradient-animation">Gradient shifts</div>

<!-- Rotate animation -->
<div className="rotate-animation">Spinning</div>

<!-- Underline animation -->
<a className="underline-animation">Hover me</a>
```

---

## Utility Classes

### Delay Classes

Add to any animation to delay start:

```
delay-100        (100ms)
delay-200        (200ms)
delay-300        (300ms)
delay-400        (400ms)
delay-500        (500ms)
delay-600        (600ms)
delay-700        (700ms)
delay-800        (800ms)
delay-1000       (1000ms)
```

**Example:**

```tsx
<div className="animate-fade-in delay-300">Appears after 300ms</div>
<div className="animate-fade-in delay-600">Appears after 600ms</div>
```

### Duration Classes

Override animation duration:

```
duration-300     (300ms animation)
duration-500     (500ms animation)
duration-700     (700ms animation)
duration-1000    (1000ms animation)
```

**Example:**

```tsx
<div className="animate-fade-in duration-1000">Slower fade</div>
```

### Fill Mode Classes

Control animation completion:

```
fill-forwards    (Stays in end state)
fill-backwards   (Starts from begin state)
```

---

## Real-World Examples

### Page Layout

```tsx
return (
  <div className="space-y-6 animate-fade-in">
    {/* Header */}
    <div className="animate-slide-in-from-top">
      <h1>Dashboard</h1>
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-3 gap-4 grid-item-stagger">
      <Card className="card-hover">Card 1</Card>
      <Card className="card-hover">Card 2</Card>
      <Card className="card-hover">Card 3</Card>
    </div>

    {/* Data table */}
    <table>
      <tbody className="list-item-stagger">
        {items.map((item) => (
          <tr key={item.id} className="table-row-enter">
            {item}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

### Form Page

```tsx
return (
  <div className="animate-fade-in space-y-6">
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
```

### Card Grid

```tsx
return (
  <div className="grid grid-cols-3 gap-4 grid-item-stagger">
    {items.map((item) => (
      <Card key={item.id} className="card-hover">
        <CardContent>
          <h3 className="font-semibold">{item.title}</h3>
          <p>{item.description}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);
```

### List with Animations

```tsx
return (
  <div className="list-item-stagger space-y-2">
    {students.map((student, idx) => (
      <div
        key={student.id}
        className="table-row-enter p-4 border rounded hover:bg-muted"
      >
        <h4>{student.name}</h4>
        <p className="text-sm text-muted-foreground">{student.email}</p>
      </div>
    ))}
  </div>
);
```

---

## Cheat Sheet

### Fastest Way to Animate

```tsx
// Page load fade
<div className="animate-fade-in">Content</div>

// Card with hover
<Card className="card-hover">Content</Card>

// Button with hover
<Button className="button-hover">Click</Button>

// Staggered list
<div className="list-item-stagger">
  {items.map(i => <div key={i.id}>{i}</div>)}
</div>

// Staggered grid
<div className="grid gap-4 grid-item-stagger">
  {items.map(i => <Card key={i.id}>{i}</Card>)}
</div>
```

---

## Browser Support Matrix

| Animation   | Chrome | Firefox | Safari | Mobile |
| ----------- | ------ | ------- | ------ | ------ |
| Fade/Scale  | ✅     | ✅      | ✅     | ✅     |
| Slide       | ✅     | ✅      | ✅     | ✅     |
| Bounce      | ✅     | ✅      | ✅     | ✅     |
| Float       | ✅     | ✅      | ✅     | ✅     |
| Shimmer     | ✅     | ✅      | ✅     | ✅     |
| All Effects | ✅     | ✅      | ✅     | ✅     |

---

## Performance Notes

✅ **GPU Accelerated**: Uses `transform` and `opacity`
✅ **Mobile Optimized**: Tested on iOS and Android
✅ **Accessible**: Respects `prefers-reduced-motion`
⚠️ **Tip**: Avoid animating `width` or `height`
⚠️ **Tip**: Limit concurrent animations on mobile
⚠️ **Tip**: Test on real devices, not just browsers

---

## Quick Copy-Paste Snippets

### Basic Page Animation

```tsx
<div className="space-y-6 animate-fade-in">{/* Your content */}</div>
```

### Cards with Hover

```tsx
<div className="grid grid-cols-3 gap-4 grid-item-stagger">
  {items.map((item) => (
    <Card key={item.id} className="card-hover">
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Animated Table

```tsx
<table>
  <tbody className="list-item-stagger">
    {items.map((item) => (
      <tr key={item.id} className="table-row-enter">
        {/* Row cells */}
      </tr>
    ))}
  </tbody>
</table>
```

### Button with Animation

```tsx
<Button className="button-hover">Click Me</Button>
```

### Loading State

```tsx
{
  isLoading ? (
    <div className="animate-shimmer h-10 rounded" />
  ) : (
    <div className="animate-fade-in">{content}</div>
  );
}
```

---

Last Updated: February 22, 2026
For detailed guides, see: ANIMATION_GUIDE.md
