# Next.js Frontend Skills (B2C Client Portal)

This document defines the **mandatory frontend standards** for any UI generation inside the `client-portal` (Next.js) project. The agent must follow these rules in every prompt and code generation.

---

## 1. Context & Objectives

* **Product:** BookMeNow B2C Client Portal
* **Goal:** A booking platform where end-users can search for local businesses, view services, and book appointments.
* **Key Directives:**
  * **Frictionless UX:** Guest booking without forced registration.
  * **Premium Design:** "WOW" effect, engaging, fast, and visually stunning.
  * **SEO-Optimized:** leveraging Server Components where possible for search engine indexing.

---

## 2. Technology Stack

* **Core:** Next.js (App Router), React, TypeScript.
* **Styling:** TailwindCSS (latest).
* **Animations/Interactions:** Framer Motion (for smooth transitions), `clsx` / `tailwind-merge` for class management.
* **Component Library Strategy:** Build fundamental UI components from scratch or leverage headless accessible primitives (e.g., Radix UI via shadcn/ui style approach) but highly customized to match the premium aesthetic.

---

## 3. Project Structure & Architecture

A strict folder hierarchy separates generic UI from domain logic:

```text
/app
  /(home)                 # Route group for the main search/marketplace
    page.tsx
  /business/[slug]        # Detail page for a specific business
    page.tsx
/components
  /ui                     # Generic, highly reusable design system elements (buttons, inputs, badges)
  /layout                 # Structural wrappers (container, section, navbar, footer)
  /business               # Cards, grids, and header components specific to displaying business info
  /services               # Lists, items, and pricing components
  /booking                # The core reservation widget (date/time picker, worker selector, guest form)
/lib
  utils.ts                # Tailwind merge, date formatting, constants
  data.ts                 # Local mocks (until backend integration)
/styles
  globals.css             # Tailwind imports, base CSS variables
```

**Architectural Rules:**
* Each component MUST reside in its own file.
* Keep components small, modular, and focused (Single Responsibility Principle).
* Extract hardcoded business logic into custom hooks or utility functions.
* Strictly type everything with TypeScript (`interfaces` and `types`).

---

## 4. Visual Design & Aesthetic (CRÍTICO)

The design must feel ultra-premium, modern, and comparable to top apps (e.g., Airbnb, Stripe, Vercel).

* **Glassmorphism:** Use translucent backgrounds (`bg-white/10 backdrop-blur-md`) for overlays or sticky headers.
* **Border Radii:** Use generous rounding (`rounded-2xl`, `rounded-3xl` for cards, `rounded-xl` for buttons).
* **Shadows:** Soft, diffused shadows (`shadow-lg shadow-black/5`) rather than harsh solid drops.
* **Color Palette (Dynamic/Dark Mode example):**
  * `Bg:` `#0B0B0F` (Dark) or `#F8F9FB` (Light)
  * `Surface:` `#111118` (Dark) or `#FFFFFF` (Light)
  * `Accent:` Sleek Purple (`#7C3AED`) or Bright Orange (`#F97316`)
  * `Text:` `#E5E7EB` (Dark) or `#1F2937` (Light)

---

## 5. Page Specifications

### 5.1 Home Page (Marketplace)
* **Hero Section:** Large, engaging typography. A floating, glassmorphism-styled Search Bar (filters: location, category).
* **Business Grid (`BusinessGrid`, `BusinessCard`):**
  * Image cover, name, sector, location, and star rating.
  * Optionally, a small overlaid profile avatar.
  * **Interactions:** Hover states must scale (`hover:scale-[1.02]`), lift, and slightly increase shadow (`transition-all duration-300`).

### 5.2 Business Detail Page (`/business/[slug]`)
* **Header:** A massive cover image with a bottom gradient overlay fading into the background color. Overlaid business info.
* **Layout Structure:**
  * **Left Column (2/3 width on desktop):** Service list categorized cleanly (`ServiceList`, `ServiceItem`). Clear prices and duration.
  * **Right Column (1/3 width):** A sticky sidebar (`BookingWidget`) that follows the user on desktop.

---

## 6. The Booking Flow (Guest Experience)

The widget must implement a seamless, progressive state-machine flow:

1. **Select Service:** Client clicks "+ Seleccionar" on a service.
2. **Select Worker:** Quick horizontal scroll of circular avatars (or skip if any).
3. **Select Slot (`TimeSlotPicker`):** Calendar/Grid of available times.
4. **Checkout (`BookingForm`):** 3 simple large, accessible inputs (Complete Name, Email, Phone).
5. **Confirmation:** A large, vibrant primary button to confirm. Immediate visual success feedback.

---

## 7. UX Guidelines

* **Immediate Feedback:** Buttons must have clear active/loading/disabled styling (`framer-motion` tap scales usually work well).
* **Accessibility:** Use `aria-labels` and focus rings (`focus:ring-2 focus:ring-accent outline-none`).
* **Responsiveness:** Mobile-first design, expanding into multi-column layouts on `md` and `lg` breakpoints natively.

---

## 8. Code Quality & Output Standards

Before outputting code, ensure:
* **No monolithic components:** Break huge render functions into sub-components.
* **Clean formatting:** Prettier-styled code.
* **No inline styles:** Always use Tailwind classes unless dynamically calculating transforms/opacity.
* **No placeholder generic look:** Inject actual high-quality Unsplash image URLs for mocks instead of gray boxes.

*This is a real product. Think as a Senior Next.js Engineer and Product Designer. Care for every pixel.*
