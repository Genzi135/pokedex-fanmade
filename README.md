# Interactive 3D Fandex

A premium, modern, and highly interactive Fandex web application built using **Next.js 15 (App Router)** and **React 19**. It leverages **Framer Motion 11** for animations, **Zustand 4** for client-side state caching, and **Tailwind CSS v3** for a beautiful dark-mode supported glassmorphic UI.

---

## 🌟 Key Features

1. **3D Tilt & Holographic Cards**: Fanimon card tiles react dynamically to pointer movements with high-performance 3D rotation and shifting holographic sheen.
2. **Capture Sphere Transition**: Clicking a card morphs it into a high-tech Capture Sphere that centers, glows, shakes (capture simulation), and splits open with a screen-bright flash to reveal the detail overlay.
3. **Tabbed Detail View**:
   - **Overview**: flavor text (cleaned of special control characters), dimensions, and dynamically calculated dual-type weakness/resistance/immunity charts.
   - **Base Stats**: Animated stats bars matching the Fanimon type color, accompanied by a custom polygon-based SVG Radar Chart.
   - **Progressive Moves Analyzer**: Lazy-loads moves in batches of 20, using Zustand caching and virtual lists (`@tanstack/react-virtual`) to scroll through hundreds of moves without lag.
   - **Interactive Evolution Chains**: Renders horizontal recursive trees (handling complex branching like Eevee) with arrows and detailed triggers.
   - **Abilities**: Progressive detail fetching for genetic passive abilities.
   - **Biology**: Scientific metadata like capture rates, egg groups, habitats, and shapes.
4. **Interactive Sounds**: Playback of high-definition creature cries with automatic fallback endpoints.
5. **Fluid Search & Filtering**: Multi-select options (Generation, Type, and Sort Orders) updating the browser search parameters natively.
6. **Dark Mode & Accessibility**: Seamless class-based dark mode (`next-themes`) and robust keyboard accessibility (Arrow key navigation, Escape to close) and Focus Trapping (`focus-trap-react`).

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router) & React 19
- **Styling**: Tailwind CSS v3 & Autoprefixer
- **State Management**: Zustand 4 (with Persist Middleware)
- **Animations**: Framer Motion 11 (honors `prefers-reduced-motion`)
- **Virtualization**: `@tanstack/react-virtual` v3
- **Icons**: Lucide React
- **Focus Capture**: `focus-trap-react`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm (or pnpm / yarn)

### Installation

1. Clone or navigate to the repository directory.
2. Install the package dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Compile and bundle the project:
```bash
npm run build
```

Start the compiled production server:
```bash
npm run start
```

### TypeScript Validation

To run type-checks without emitting files:
```bash
npm run type-check
```
