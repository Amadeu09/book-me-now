# React Native Frontend Skills (Production Standard)

This document defines the **mandatory frontend standards** for any React Native UI generation.
The agent must follow these rules **in every prompt and code generation**.

---

## 1. General Principles

* Always produce **production-ready code**.
* Use **functional components only**.
* Use **clean architecture and modular structure**.
* Avoid inline styles unless absolutely necessary.
* Prioritize **readability, scalability, and maintainability**.
* Match the provided design **pixel-accurately** when UI references are given.

---

## 2. Project Structure

Every screen must follow this structure:

```
/src
  /screens
    /ScreenName
      ScreenName.tsx
      ScreenName.styles.ts
      components/
  /components
  /constants
  /theme
```

Rules:

* Extract reusable UI into `/components`
* Each screen should be under **300 lines**
* Split complex UI into subcomponents

---

## 3. Styling Rules

Use:

* `StyleSheet.create`
* Centralized theme

### Theme structure

```
/theme
  colors.ts
  spacing.ts
  typography.ts
  shadows.ts
  radius.ts
```

### Design Standards

Spacing scale:

* 4, 8, 12, 16, 20, 24, 32

Border radius:

* Cards: 12–16
* Buttons: 10–12

Shadows:
iOS:

```
shadowColor: '#000',
shadowOpacity: 0.05,
shadowRadius: 6,
shadowOffset: { width: 0, height: 2 }
```

Android:

```
elevation: 2
```

Background:

```
Screen: #F8F9FB
Card: #FFFFFF
Border: #E5E7EB
Text secondary: #6B7280
```

---

## 4. Layout & Responsiveness

Always support:

* Mobile (default)
* Tablet/Desktop

Use:

```
const { width } = useWindowDimensions();
const isTablet = width >= 768;
```

Rules:

* Center content with maxWidth (600–900) on tablet
* Increase spacing on larger screens
* Never hardcode fixed widths unless required by design

---

## 5. Component Standards

Each component must:

* Receive props (no hardcoded data inside)
* Be reusable
* Have clear naming:

  * `UserCard`
  * `ScheduleItem`
  * `StatusBadge`

Avoid:

* Anonymous components
* Nested large JSX blocks

---

## 6. Lists

Use:

* `FlatList` for any repeated items

Rules:

* Always include `keyExtractor`
* Extract item into separate component
* Avoid rendering arrays directly in JSX

---

## 7. Status & Badge System

Standard status colors:

Available / Active → Green

```
backgroundColor: '#DCFCE7'
color: '#16A34A'
```

Warning / Break → Yellow

```
backgroundColor: '#FEF3C7'
color: '#D97706'
```

Error / Inactive → Red

```
backgroundColor: '#FEE2E2'
color: '#DC2626'
```

Badges:

* Padding horizontal: 8–12
* Border radius: 999 (pill)

---

## 8. Floating Actions

FAB rules:

* Size: 56
* Border radius: 28
* Position: bottom-right
* Shadow + elevation
* Use absolute positioning

---

## 9. Tabs / Segmented Controls

Active state:

* Primary color text
* Bottom border indicator
* Smooth visual hierarchy

Inactive:

* Neutral gray text

---

## 10. Icons & Avatars

Icons:

* Use vector icons (react-native-vector-icons or expo)

Avatars:

* Circular
* Sizes:

  * Small: 32
  * Medium: 40
  * Large: 56

Status dot:

* Absolute positioned bottom-right

---

## 11. Interaction Rules

* Always add `onPress` placeholders
* Never leave interactive elements without handlers
* Avoid console logs in production output

---

## 12. Data Handling

For UI-only generation:

* Use `mockData` constants
* Keep data outside components

Example:

```
const employees = [
  { id: '1', name: 'Ana', status: 'available' }
];
```

---

## 13. Performance

Avoid:

* Inline functions inside render
* Inline styles in lists
* Large nested layouts

Use:

* `memo` when needed
* Extract subcomponents

---

## 14. Code Quality Checklist

Before finishing any generation, ensure:

* Uses SafeAreaView
* Uses StyleSheet
* Responsive layout implemented
* Components modularized
* FlatList for lists
* No inline styles
* No hardcoded layout widths (unless design requires)
* Clean, readable, professional formatting

---

## 15. Visual Fidelity Rule

If design images are provided:

The implementation must:

* Match spacing exactly
* Match hierarchy exactly
* Match font weights and sizes visually
* Match colors precisely
* Replicate shadows, borders, and radius

**Pixel accuracy is mandatory.**

---

## 16. Default Screen Template

Every screen should start with:

```
SafeAreaView
  Container (padding 16)
    Content (maxWidth for tablet)
```

---

## 17. Forbidden Practices

Do NOT:

* Use inline styles extensively
* Mix logic and layout excessively
* Hardcode random colors
* Generate placeholder UI that does not match the design
* Produce demo-level or prototype code

---

## 18. Output Standard

All generated UI must be:

* Clean
* Professional
* Scalable
* Pixel-accurate
* Ready for production
* Consistent with this document
