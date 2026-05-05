# MedBook UI/UX Guide

## 🎨 Design Philosophy

The MedBook interface follows a **modern, healthcare-first design** approach that prioritizes:
- **Trust & Professionalism**: Blue and teal color palette conveys healthcare expertise
- **Accessibility**: Clear hierarchy, readable fonts, sufficient color contrast
- **User-Focused**: Minimal friction, clear call-to-actions, intuitive navigation
- **Responsive**: Works seamlessly on all devices (mobile, tablet, desktop)

## 🎯 Core Design Elements

### Color System
```
Primary:    #1E5FFF (Healthcare Blue) - CTAs, main actions, focus states
Secondary:  #00B4D8 (Wellness Teal)   - Secondary actions, accents
Accent:     #FF6B35 (Energy Orange)   - Important alerts, highlights
Background: #FAFAFA (Clean White)     - Primary surface
Foreground: #1A1A1A (Dark Gray)       - Text
Muted:      #E8E8E8 (Light Gray)      - Secondary UI
```

### Typography
- **Headings**: Geist Sans, Bold/Semibold
  - H1: 48-60px (homepage hero)
  - H2: 32-40px (section headers)
  - H3: 20-24px (subsections)
- **Body**: Geist Sans, Regular/Medium
  - Large: 18px (intro text)
  - Normal: 16px (body text)
  - Small: 14px (secondary, meta)

### Spacing & Layout
- Uses 4px/8px/16px spacing grid
- Card padding: 24px-32px (p-6 to p-8)
- Gap between items: 16px-24px (gap-4 to gap-6)
- Max width: 1536px (max-w-6xl)

### Component Styling

#### Buttons
```tsx
// Primary (Main CTA)
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

// Secondary (Alternative)
<Button variant="outline">
  Secondary Action
</Button>

// Destructive (Delete/Logout)
<Button className="text-destructive hover:bg-destructive/10">
  Delete
</Button>
```

#### Cards
```tsx
<Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
  <CardContent className="p-8">
    {content}
  </CardContent>
</Card>
```

#### Forms
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium text-foreground">
      Label
    </label>
    <Input 
      className="bg-muted/50 border-muted focus:border-primary"
      placeholder="Placeholder text"
    />
  </div>
</div>
```

### Icons
- Use lucide-react icons
- Size: 18-24px for inline, 64px+ for hero
- Color: Matches text or uses primary/secondary
- Always has accessible name/label

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default (0-768px)
- **Tablet**: md: (768px+)
- **Desktop**: lg: (1024px+), xl: (1280px+)

### Patterns
```tsx
// Two-column on desktop, one on mobile
<div className="grid md:grid-cols-2 gap-6">

// Hidden on mobile, visible on desktop
<div className="hidden md:flex">

// Responsive font sizes
<h1 className="text-4xl md:text-5xl">

// Mobile-first padding
<div className="px-4 md:px-8 py-8 md:py-12">
```

## 🎭 Page-Specific Patterns

### Authentication Pages (Login/Register)
1. **Full-height centered layout**
2. **Gradient background** (from-background to primary/5)
3. **Icon badge** at top (LogIn/UserPlus)
4. **Centered card** with shadow
5. **Form fields** with muted backgrounds
6. **Primary button** (bg-primary text-primary-foreground)
7. **Divider** with "or" text
8. **Secondary button** (variant="outline")

### Dashboard/List Pages
1. **Gradient background** (from-background to secondary/5)
2. **Top header** with greeting + subtitle
3. **Quick action cards** with icon badges
4. **List sections** with cards
5. **Empty states** with icons and CTAs
6. **Loading states** with text feedback

### Detail Pages
1. **Sticky navbar** with backdrop blur
2. **Hero section** with key info
3. **Tabbed content** or sectioned layout
4. **Related items** in sidebar or footer
5. **Action buttons** at bottom or floating

## 🎬 Interactions & Animations

### Transitions
```css
transition-all duration-200
transition-colors duration-150
transition-shadow
transition-opacity
```

### Hover States
```tsx
// Cards
hover:shadow-lg

// Buttons
hover:bg-primary/90

// Links
hover:text-primary hover:underline
```

### Focus States
```css
focus:outline-none focus:ring-2 focus:ring-primary/50
```

## ♿ Accessibility

### ARIA Labels
```tsx
<button aria-label="Close menu">
<nav aria-label="Main navigation">
<section aria-label="Features">
```

### Semantic HTML
```tsx
<main>  {/* Main content */}
<header> {/* Top navigation */}
<nav>    {/* Navigation menu */}
<section> {/* Content sections */}
<footer> {/* Footer */}
<article> {/* Self-contained content */}
```

### Color Contrast
- All text has minimum 4.5:1 contrast ratio
- Icons paired with text labels
- Don't rely on color alone

### Keyboard Navigation
- All interactive elements are focusable (tabindex)
- Logical tab order
- Enter/Space to activate buttons
- Escape to close modals

## 🔧 Common Patterns

### Loading State
```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-12">
    <p className="text-foreground/60">Loading...</p>
  </div>
) : (
  {content}
)}
```

### Empty State
```tsx
<div className="text-center p-12">
  <Icon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
  <p className="text-foreground/60 mb-6">No items found</p>
  <Button>Take Action</Button>
</div>
```

### Error Message
```tsx
{error && (
  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
    {error}
  </div>
)}
```

### Success Toast
```tsx
toast({
  title: "Success",
  description: "Action completed successfully",
  variant: "default"
})
```

## 📐 Grid System

### Common Layouts
```tsx
// Two columns on desktop, one on mobile
<div className="grid md:grid-cols-2 gap-6">

// Three columns on desktop, two on tablet, one on mobile
<div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">

// Flexible grid (auto-fit)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Sidebar layout
<div className="grid md:grid-cols-3 gap-8">
  <aside className="md:col-span-1"> {/* Sidebar */}
  <main className="md:col-span-2"> {/* Content */}
</div>
```

## 🎨 Text Hierarchy

### Using Text Classes
```tsx
// Main heading
<h1 className="text-4xl md:text-5xl font-bold text-foreground">

// Subheading
<h2 className="text-2xl md:text-3xl font-semibold text-foreground">

// Body text
<p className="text-base text-foreground">

// Secondary text (metadata, hints)
<p className="text-sm text-foreground/60">

// Muted text (disabled, secondary info)
<p className="text-foreground/40">
```

## 🚀 Best Practices

1. **Mobile First**: Design for mobile, enhance for desktop
2. **Performance**: Use CSS Grid/Flexbox, avoid heavy images
3. **Consistency**: Follow established patterns across pages
4. **Accessibility**: Always include labels and alt text
5. **User Feedback**: Show loading, error, and success states
6. **Simplicity**: Remove unnecessary elements
7. **Whitespace**: Use space to create hierarchy
8. **Testing**: Test on multiple devices and browsers

## 📚 Component Library

All components are from shadcn/ui:
- Button
- Card (CardContent, CardHeader, CardTitle, CardDescription)
- Input
- Textarea
- Select
- Checkbox
- RadioGroup
- Tabs
- Dialog
- Dropdown
- Toast

See the components folder for available UI elements.

---

Last Updated: 2024
Part of MedBook Healthcare Platform
