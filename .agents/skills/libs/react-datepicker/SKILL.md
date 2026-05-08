---
name: react-datepicker
description: Local guidance for date-picker usage (if added to the project).
---

When to use

- Use for date input UI when native inputs are insufficient for UX requirements.

Steps

1. Add `react-datepicker` dependency.
2. Wrap usage in a small UI component under `src/components/ui/DatePicker.tsx` so formatting is consistent (use `date-fns`).

Pitfalls

- Keep timezones in mind; prefer ISO strings across services.

Minimal snippet

```tsx
// src/components/ui/DatePicker.tsx
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MyDatePicker({ value, onChange }) {
  return <DatePicker selected={value} onChange={onChange} />;
}
```

## Update notes
