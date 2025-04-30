import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { NutritionInfo } from '../types';
import './NutritionPieChart.css';

interface NutritionPieChartProps {
  nutrition: NutritionInfo;
}

const NutritionPieChart: React.FC<NutritionPieChartProps> = ({ nutrition }) => {
  // Default values for samosa (per piece)
  const defaultValues = {
    protein: 4.5,
    carbs: 28,
    fat: 16
  };

  // Get value with fallback to default
  const getValue = (key: keyof typeof defaultValues): number => {
    return nutrition[key] || defaultValues[key];
  };

  // Calculate macronutrient values and percentages
  const macronutrients = [
    { name: 'Protein', value: getValue('protein'), color: '#4A90E2' },
    { name: 'Fat', value: getValue('fat'), color: '#F5A623' },
    { name: 'Carbs', value: getValue('carbs'), color: '#50C878' }
  ];

  const total = macronutrients.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = macronutrients.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const item = dataWithPercentages[index];

    return (
      <g>
        <circle cx={x - 8} cy={y - 8} r={4} fill={item.color} />
        <text x={x} y={y} fill="#374151" fontSize={13} fontWeight={500}>
          {item.name}
        </text>
        <text x={x} y={y + 16} fill="#6B7280" fontSize={12}>
          {item.value.toFixed(1)}g ({item.percentage}%)
        </text>
      </g>
    );
  };

  return (
    <div className="nutrition-chart">
      <h3>Macronutrient Distribution</h3>
      <div style={{ width: '100%', height: 300, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  strokeWidth={0}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NutritionPieChart; 