
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import type { Chart as ChartJS, Plugin } from 'chart.js';

//unterteilen der Säulen in schwierigkeit
interface CardCounts { easy: number; medium: number; hard: number; }

const dailyWeekData: CardCounts[] = [
    { easy: 3, medium: 1, hard: 2 },
    { easy: 7, medium: 0, hard: 1 },
    { easy: 5, medium: 2, hard: 0 },
    { easy: 20, medium: 5, hard: 3 },
    { easy: 6, medium: 1, hard: 0 },
    { easy: 4, medium: 4, hard: 2 },
    { easy: 8, medium: 0, hard: 1 }
];
const dailyMonthData: CardCounts[] = [
    
    ...dailyWeekData,
    ...dailyWeekData,
    ...dailyWeekData,
    ...dailyWeekData
];
const monthlyYearData: CardCounts[] = [
    { easy: 40, medium: 60, hard: 20 },
    { easy: 30, medium: 50, hard: 15 },
    { easy: 70, medium: 50, hard: 20 },
    { easy: 60, medium: 40, hard: 10 },
    { easy: 80, medium: 40, hard: 10 },
    { easy: 20, medium: 60, hard: 10 },
    { easy: 10, medium: 40, hard: 30 },
    { easy: 75, medium: 60, hard: 15 },
    { easy: 80, medium: 70, hard: 20 },
    { easy: 90, medium: 50, hard: 20 },
    { easy: 100, medium: 60, hard: 20 },
    { easy: 120, medium: 70, hard: 10 }
];

function groupIntoWeeks(data: CardCounts[]) {
    const weeks: CardCounts[] = [];
    for (let i = 0; i < data.length; i += 7) {
        const slice = data.slice(i, i + 7);
        const weekSum: CardCounts = { easy: 0, medium: 0, hard: 0 };
        slice.forEach(d => {
            weekSum.easy += d.easy;
            weekSum.medium += d.medium;
            weekSum.hard += d.hard;
        });
        weeks.push(weekSum);
    }
    return weeks;
}

const dataLabelsPlugin: Plugin<'bar'> = {
    id: 'dataLabels',
    afterDatasetsDraw: function (chart: any) {
        const ctx = chart.ctx;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
      
        ctx.textBaseline = 'middle';

   
        const rootStyle = getComputedStyle(document.documentElement);
        const textColor = rootStyle.getPropertyValue('--color-text').trim() || '#fff';
        const surfaceColor = rootStyle.getPropertyValue('--color-surface').trim() || '#171717';

        chart.data.datasets.forEach(function (dataset: any, i: number) {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach(function (bar: any, index: number) {
                const value = dataset.data[index];
                if (value === 0) {
                    
                    return;
                }
                const x = bar.x;

                const yTop = bar.y;
                const yBase = bar.base || 0;
                const y = (yTop + yBase) / 2;
                const barHeight = Math.abs(yBase - yTop);
               
                ctx.fillStyle = textColor;
                ctx.fillText(String(value), x, y);
            });
        });
    }
};

const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<ChartJS | null>(null);
    const [view, setView] = useState<'week' | 'month' | 'year'>('week');

    const renderChart = useCallback((view: 'week' | 'month' | 'year') => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
            console.error('Canvas context not available');
            return;
        }


        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        //Darstellung
        const root = getComputedStyle(document.documentElement);
        const bgColor = root.getPropertyValue('--color-background').trim() || '#0A0A0A';
        const easyColor = root.getPropertyValue('--color-easy').trim() || '#4ADE80';
        const mediumColor = root.getPropertyValue('--color-medium').trim() || '#FDBA74';
        const hardColor = root.getPropertyValue('--color-hard').trim() || '#F87171';

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.backgroundColor = bgColor;
        }

        let labels: string[] = [];
        let values: CardCounts[] = [];

        if (view === 'week') {
            labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
            values = dailyWeekData;
        } else if (view === 'month') {
            values = groupIntoWeeks(dailyMonthData);
            labels = values.map((_, i) => `Woche ${i + 1}`);
        } else {
            labels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
            values = monthlyYearData;
        }

        const easyData = values.map(v => v.easy);
        const mediumData = values.map(v => v.medium);
        const hardData = values.map(v => v.hard);

        const maxSum = values.reduce((max, v) => {
            const sum = v.easy + v.medium + v.hard;
            return Math.max(max, sum);
        }, 0);
        const stepSize = view === 'week' ? 5 : view === 'month' ? 10 : 20;
        const yAxisMax = Math.max(stepSize, Math.ceil((maxSum + stepSize) / stepSize) * stepSize);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Easy', data: easyData, backgroundColor: easyColor },
                    { label: 'Medium', data: mediumData, backgroundColor: mediumColor },
                    { label: 'Hard', data: hardData, backgroundColor: hardColor }
                ]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        onClick: function (e: any, legendItem: any, legend: any) {
                            const chart = legend.chart;
                            const idx = legendItem.datasetIndex ?? legendItem.index;
                            
                            // Check if only the clicked dataset is currently visible
                            const visibleCount = chart.data.datasets.filter((_, i) => chart.getDatasetMeta(i).hidden === false).length;
                            const clickedIsOnlyVisible = visibleCount === 1 && !chart.getDatasetMeta(idx).hidden;
                            
                            if (clickedIsOnlyVisible) {
                                // Show all datasets again
                                for (let i = 0; i < chart.data.datasets.length; i++) {
                                    chart.setDatasetVisibility(i, true);
                                }
                            } else {
                                // Show only the clicked dataset
                                for (let i = 0; i < chart.data.datasets.length; i++) {
                                    chart.setDatasetVisibility(i, i === idx);
                                }
                            }
                            chart.update();
                        }
                    },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, max: yAxisMax, ticks: { stepSize } }
                }
            },
            plugins: [dataLabelsPlugin]
        });

        chartRef.current = chart;
    }, []);

    useEffect(() => {
        renderChart(view);
        return () => {
            chartRef.current?.destroy();
        };
    }, [renderChart, view]);

    const handleClick = (newView: 'week' | 'month' | 'year') => {
        setView(newView);
    };

    return (
        <div>
            <h1>Statistics</h1>
            <div className="controls">
                <button onClick={() => handleClick('week')}>Week</button>
                <button onClick={() => handleClick('month')}>Month</button>
                <button onClick={() => handleClick('year')}>Year</button>
            </div>
            <div className="chart-frame">
                <div className="chart-container">
                    <canvas id="statsChart" ref={canvasRef} />
                </div>
            </div>
        </div>
    );
};

export default App;