import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
  height?: number;
}

export default function DonutChart({ 
  data, 
  labels, 
  colors = ['#10B981', '#F59E0B', '#0EA5E9', '#153D32', '#64748B'], 
  height = 300 
}: DonutChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 'bold' as const },
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: '#153D32',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
      },
    }
  };

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
