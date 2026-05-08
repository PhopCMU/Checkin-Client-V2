---
name: chartjs
description: Guidance for charting; create wrappers when using Chart.js or React wrappers.
---

When to use

- For visualizing numeric/time-series data in dashboards or reports.

Steps

- Prefer a small wrapper component in `src/components/` that accepts normalized data.

Pitfalls

- Keep bundle size in mind; use tree-shaking and lazy-load heavy chart components.

Minimal snippet

```tsx
// src/components/ChartWrapper.tsx
import { Line } from "react-chartjs-2";
export default function ChartWrapper({ data, options }) {
  return <Line data={data} options={options} />;
}
```

## Update notes
