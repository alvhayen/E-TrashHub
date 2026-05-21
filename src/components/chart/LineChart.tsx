import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  title?: string;
  fill?: boolean;
}

export default function LineChart({ data, labels, color = '#10B981', height = 300, title, fill = true }: LineChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Dataset',
        data,
        fill: fill ? 'start' : false,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, `${color}40`); 
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        },
        borderColor: color,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#153D32',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, color: '#f1f5f9' },
        border: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 'bold' as const }, color: '#64748b' }
      }
    }
  };

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
