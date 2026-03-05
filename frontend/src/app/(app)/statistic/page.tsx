
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import type { Chart as ChartJS, Plugin } from 'chart.js';

// Datentyp für die Anzahl der Karten pro Schwierigkeitsgrad
interface CardCounts { easy: number; medium: number; hard: number; }

// Beispiel-Daten
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

// Aggregiert Tagesdaten in Wochenblöcke (je 7 Tage)
function groupIntoWeeks(data: CardCounts[]) {
    const weeks: CardCounts[] = [];
    for (let i = 0; i < data.length; i += 7) {
        const slice = data.slice(i, i + 7);
        const weekSum: CardCounts = { easy: 0, medium: 0, hard: 0 };

        // Summiert die Werte der Woche
        slice.forEach(d => {
            weekSum.easy += d.easy;
            weekSum.medium += d.medium;
            weekSum.hard += d.hard;
        });

        weeks.push(weekSum);
    }
    return weeks;
}

// Plugin zum Anzeigen der Werte direkt auf den Balken
const dataLabelsPlugin: Plugin<'bar'> = {
    id: 'dataLabels',
    afterDatasetsDraw: function (chart: any) {
        const ctx = chart.ctx;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Farben aus CSS-Variablen lesen
        const rootStyle = getComputedStyle(document.documentElement);
        const textColor = rootStyle.getPropertyValue('--color-text').trim() || '#fff';

        chart.data.datasets.forEach((dataset: any, i: number) => {
            const meta = chart.getDatasetMeta(i);

            meta.data.forEach((bar: any, index: number) => {
                const value = dataset.data[index];

                // Keine Labels für 0-Werte
                if (value === 0) return;

                // Position des Textes in der Mitte des Balkens
                const x = bar.x;
                const y = (bar.y + (bar.base || 0)) / 2;

                ctx.fillStyle = textColor;
                ctx.fillText(String(value), x, y);
            });
        });
    }
};

const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<ChartJS | null>(null);

    // Aktuelle Ansicht (Woche / Monat / Jahr)
    const [view, setView] = useState<'week' | 'month' | 'year'>('week');

    // Chart neu rendern, wenn sich die Ansicht ändert
    const renderChart = useCallback((view: 'week' | 'month' | 'year') => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Vorherigen Chart entfernen, um Memory-Leaks zu vermeiden
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        // Farben aus CSS-Variablen lesen
        const root = getComputedStyle(document.documentElement);
        const bgColor = root.getPropertyValue('--color-background').trim() || '#0A0A0A';
        const easyColor = root.getPropertyValue('--color-easy').trim() || '#4ADE80';
        const mediumColor = root.getPropertyValue('--color-medium').trim() || '#FDBA74';
        const hardColor = root.getPropertyValue('--color-hard').trim() || '#F87171';

        // Hintergrundfarbe des Canvas setzen
        if (canvasRef.current) {
            canvasRef.current.style.backgroundColor = bgColor;
        }

        // Labels und Werte abhängig von der Ansicht
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

        // Daten extrahieren
        const easyData = values.map(v => v.easy);
        const mediumData = values.map(v => v.medium);
        const hardData = values.map(v => v.hard);

        // Dynamische Y-Achsen-Skalierung
        const maxSum = values.reduce((max, v) => Math.max(max, v.easy + v.medium + v.hard), 0);
        const stepSize = view === 'week' ? 5 : view === 'month' ? 10 : 20;
        const yAxisMax = Math.ceil((maxSum + stepSize) / stepSize) * stepSize;

        // Chart erzeugen
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

                        // Klick auf Legende → nur ein Dataset anzeigen
                        onClick: function (e: any, legendItem: any, legend: any) {
                            const chart = legend.chart;
                            const idx = legendItem.datasetIndex ?? legendItem.index;

                            const visibleCount = chart.data.datasets.filter((_: any, i: number) =>
                                chart.getDatasetMeta(i).hidden === false
                            ).length;

                            const clickedIsOnlyVisible =
                                visibleCount === 1 && !chart.getDatasetMeta(idx).hidden;

                            if (clickedIsOnlyVisible) {
                                // Wenn nur ein Dataset sichtbar ist → alle wieder anzeigen
                                for (let i = 0; i < chart.data.datasets.length; i++) {
                                    chart.setDatasetVisibility(i, true);
                                }
                            } else {
                                // Nur das angeklickte Dataset anzeigen
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

    // Chart neu rendern, wenn sich die Ansicht ändert
    useEffect(() => {
        renderChart(view);
        return () => chartRef.current?.destroy();
    }, [renderChart, view]);

    return (
        <div>
            <h1>Statistics</h1>

            {/* Buttons zum Umschalten der Ansicht */}
            <div className="controls">
                <button onClick={() => setView('week')}>Week</button>
                <button onClick={() => setView('month')}>Month</button>
                <button onClick={() => setView('year')}>Year</button>
            </div>

            {/* Chart-Container */}
            <div className="chart-frame">
                <div className="chart-container">
                    <canvas id="statsChart" ref={canvasRef} />
                </div>
            </div>
        </div>
    );
};

export default App;
