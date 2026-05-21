import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: number[];
  labels: string[];
  colors?: string | string[];
  height?: number;
  title?: string;
}

export default function BarChart({ data, labels, colors = '#10B981', height = 300, title }: BarChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Dataset',
        data,
        backgroundColor: colors,
        borderRadius: 4,
        borderSkipped: false,
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
      <Bar data={chartData} options={options} />
    </div>
  );
}
