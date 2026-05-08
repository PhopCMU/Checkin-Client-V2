import React from "react";
// Minimal wrapper for Chart.js React usage. Install `react-chartjs-2` + `chart.js` to use.
export default function ChartWrapper({ data, options }: any) {
  // Example when react-chartjs-2 is available:
  // import { Line } from 'react-chartjs-2';
  // return <Line data={data} options={options} />;

  return (
    <div>
      {/* Chart placeholder — replace with react-chartjs-2 component when installed */}
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data?.datasets || data, null, 2)}
      </pre>
    </div>
  );
}
