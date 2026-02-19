# Commonly Used CSS in Your Project

## Color Palette
- Primary Blue: #2563EB
- Dark Blue: #1D4ED8
- Light Gray: #F8FAFC
- White: #FFFFFF
- Border Gray: #E5E7EB
- Text Dark: #111827
- Text Medium: #4B5563
- Text Light: #6B7280

## Common Spacing Values
- Padding: 32px, 40px, 48px, 24px, 16px, 12px
- Margin: 24px, 32px, 40px, 12px, 8px
- Gap (between items): 24px, 32px, 16px, 12px

## Border & Radius
- Border Color: #E5E7EB
- Border Width: 1px or 2px
- Border Radius: 12px (cards), 8px (inputs), 10px (scrollbar)

## Common Font Sizes
- H2: 18px (weight 800)
- H3: 16px (weight 700)
- H4/H5: 15px or 14px (weight 800 or 700)
- Body Text: 14px or 15px
- Small Text: 12px or 13px
- Label Text: 12px

## Font Weights Used
- Light: 400
- Regular: 500
- Medium: 600
- Bold: 700
- Extra Bold: 800
- Black: 900

## Font Family
- 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

## Flexbox Patterns
- Display: flex
- Direction: flex-direction: column or row
- Alignment: align-items: center, justify-content: space-between
- Gaps: gap: 24px or gap: 16px

## Box Shadow Values
- Light Shadow: 0 1px 2px rgba(0,0,0,0.02)
- Medium Shadow: 0 2px 4px rgba(0,0,0,0.03)
- Inset Shadow (focus): inset 0 0 6px rgba(37, 99, 235, 0.3)

## Transitions
- transition: border-color 0.2s
- transition: background-color 0.2s
- transition: all 0.2s
- transition: all 0.3s ease

## Form Elements
- Input Padding: 12px 16px
- Input Height: ~40px
- Focus Border Color: #2563EB
- Placeholder Color: #9CA3AF

## Card Styling
- Background: #FFFFFF
- Border: 1px solid #E5E7EB
- Radius: 12px
- Padding: 24px
- Shadow: 0 1px 2px rgba(0,0,0,0.02)

## Button Styling
- Background (Default): #2563EB
- Background (Hover): #1D4ED8
- Padding: 16px
- Border Radius: 12px
- Font Weight: 700
- Cursor: pointer

## Responsive Breakpoints
- Large Laptops: 1200px
- Tablets: 1024px
- Tablets (smaller): 768px
- Mobile: 425px

## Scrollbar Styling
- Width: 10px
- Track Color: #E5E7EB
- Thumb Color: Gradient #2563EB → #1D4ED8
- Border Radius: 10px
- Hover: Darkens with glow effect

## Common Utility Classes
- display: flex - Flexbox layout
- overflow: hidden - Hide overflow
- overflow-y: scroll - Vertical scrolling
- position: sticky or fixed - Positioning
- z-index: 40 - Layering
- text-transform: uppercase - Text conversion

---

## Quick CSS Snippets

### Card Template
```css
.card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
```

### Input Template
```css
.input {
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #2563EB;
  background-color: #FFFFFF;
}
```

### Button Template
```css
.button {
  background-color: #2563EB;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #1D4ED8;
}
```

### Flexbox Container
```css
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}
```

### Page Layout
```css
.pageContainer {
  display: flex;
  min-height: 100vh;
  background-color: #F8FAFC;
  font-family: 'Inter', sans-serif;
  color: #111827;
}
```

### Volume Bar Scrollbar
```css
.scrollable::-webkit-scrollbar {
  width: 10px;
}

.scrollable::-webkit-scrollbar-track {
  background-color: #E5E7EB;
  border-radius: 10px;
  margin: 8px 0;
}

.scrollable::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #2563EB, #1D4ED8);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 2px solid #E5E7EB;
  box-shadow: inset 0 0 6px rgba(37, 99, 235, 0.3);
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1D4ED8, #1E40AF);
  border-color: #2563EB;
  box-shadow: inset 0 0 8px rgba(37, 99, 235, 0.5), 0 0 4px rgba(37, 99, 235, 0.4);
}
```
