# Design System Components

This document outlines the usage rules for components in the OneChat design system.

## Colors

### Usage Rules
- **Primary**: Use for main actions, navigation items, and primary buttons
- **Secondary**: Use for likes, hearts, and accent elements
- **Background**: Use for page backgrounds and container backgrounds
- **Surface**: Use for cards, modals, and elevated surfaces
- **Text**: Use for all text content (primary for main text, secondary for supporting text, muted for disabled/placeholder text)
- **Error**: Use for error states, validation messages, and destructive actions
- **Success**: Use for success states and positive feedback

### Import Pattern
```javascript
import { colors } from '@/src/design-system/colors';
```

## Typography

### Usage Rules
- **Headings**: Use for page titles, section headers, and important labels
  - `h1`: Main page titles
  - `h2`: Section headers
  - `h3`: Subsection headers
  - `h4`: Card titles
- **Body**: Use for all body text
  - `large`: Main content text
  - `medium`: Supporting text, descriptions
  - `small`: Captions, metadata, timestamps

### Import Pattern
```javascript
import { typography } from '@/src/design-system/typography';
```

## Spacing

### Usage Rules
- Use spacing scale for consistent margins and paddings
- Prefer component-specific spacing tokens when available
- Maintain consistent spacing between related elements

### Import Pattern
```javascript
import { spacing } from '@/src/design-system/spacing';
```

## Border Radius

### Standards
- **Small**: `0.375rem` (6px) - For small elements like badges
- **Medium**: `0.5rem` (8px) - For buttons, inputs, cards
- **Large**: `0.75rem` (12px) - For large cards, modals
- **Full**: `9999px` - For circular elements (avatars, pills)

## Button Variants

### Primary Button
- Background: `colors.primary.DEFAULT` (black)
- Text: `colors.text.inverse` (white)
- Border radius: `0.5rem` (8px)
- Padding: `spacing.component.button`
- Use for main actions (submit, confirm)

### Secondary Button
- Background: `colors.surface.DEFAULT` (white)
- Text: `colors.text.primary` (black)
- Border: `1px solid colors.border.DEFAULT`
- Border radius: `0.5rem` (8px)
- Padding: `spacing.component.button`
- Use for secondary actions (cancel, back)

### Disabled Button
- Background: `colors.background.dark`
- Text: `colors.text.muted`
- Cursor: `not-allowed`
- Opacity: `0.6`

## Input Field Styles

### Default State
- Background: `colors.surface.DEFAULT` (white)
- Border: `1px solid colors.border.DEFAULT`
- Border radius: `0.5rem` (8px)
- Padding: `spacing.component.input`
- Text: `colors.text.primary`

### Focus State
- Border: `2px solid colors.primary.DEFAULT` (black)
- Outline: `none`
- Box shadow: `0 0 0 3px rgba(0, 0, 0, 0.1)`

### Error State
- Border: `2px solid colors.error.DEFAULT`
- Text: `colors.error.DEFAULT` for error message

### Disabled State
- Background: `colors.background.dark`
- Text: `colors.text.muted`
- Cursor: `not-allowed`

## Implementation Rules

1. **Never hardcode colors or fonts** - Always use design system tokens
2. **Use Tailwind classes** - Map design system tokens to Tailwind config
3. **Maintain consistency** - Follow spacing and typography scales
4. **Accessibility first** - Ensure sufficient contrast ratios
5. **Responsive design** - Use responsive variants for mobile/desktop

