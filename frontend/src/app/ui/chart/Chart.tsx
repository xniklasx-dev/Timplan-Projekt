"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartJS, Plugin, Element } from "chart.js";
import styles from "../../(app)/statistic/page.module.css";


interface CardCounts {
    easy: number;
    medium: number;
    hard: number;
}
 //Example data
const dailyWeekData: CardCounts[] = [
    { easy: 3, medium: 1, hard: 2 },
    { easy: 7, medium: 0, hard: 1 },
    { easy: 5, medium: 2, hard: 0 },
    { easy: 20, medium: 5, hard: 3 },
    { easy: 6, medium: 1, hard: 0 },
    { easy: 4, medium: 4, hard: 2 },
    { easy: 8, medium: 0, hard: 1 }
];

const dailyMonthData = [
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
 //grouping the daily data
function groupIntoWeeks(data: CardCounts[]): CardCounts[] {
    const weeks: CardCounts[] = [];
    for (let i = 0; i < data.length; i += 7) {
        const slice = data.slice(i, i + 7);
        const sum = { easy: 0, medium: 0, hard: 0 };
        slice.forEach(d => {
            sum.easy += d.easy;
            sum.medium += d.medium;
            sum.hard += d.hard;
        });
        weeks.push(sum);
    }
    return weeks;
}
 //showing the data on bars
const dataLabelsPlugin: Plugin<"bar"> = {
    id: "dataLabels",
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        //
        const css = getComputedStyle(document.documentElement);
        const textColor = css.getPropertyValue("--color-text").trim();

        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = textColor;

        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);

            meta.data.forEach((bar: Element & { x:number, y: number, base?: number}, index: number) => {
                const value = dataset.data[index] as number;
                //no bars for 0
                if (value === 0) return;
                //position
                const x = bar.x;
                const base: number = bar.base ?? 0;

                const y = (bar.y + base) / 2;
                 ctx.fillText(String(value), x, y);
            });
        });
    }
};

const ChartComponent: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<ChartJS | null>(null);
    //current view
    const [view, setView] = useState<"week" | "month" | "year">("week");
    const renderChart = useCallback((view: "week" | "month" | "year") => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        //deleting last chart
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
        //colours css
        const css = getComputedStyle(document.documentElement);
        const bgColor = css.getPropertyValue("--color-background").trim();
        const easyColor = css.getPropertyValue("--color-easy").trim();
        const mediumColor = css.getPropertyValue("--color-medium").trim();
        const hardColor = css.getPropertyValue("--color-hard").trim();

        canvas.style.backgroundColor = bgColor;
        //labels and values
        let labels: string[] = [];
        let values: CardCounts[] = [];

        if (view === "week") {
            labels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
            values = dailyWeekData;
        } else if (view === "month") {
            values = groupIntoWeeks(dailyMonthData);
            labels = values.map((_, i) => `Week ${i + 1}`);
        } else {
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            values = monthlyYearData;
        }
        //get data
        const easyData = values.map(v => v.easy);
        const mediumData = values.map(v => v.medium);
        const hardData = values.map(v => v.hard);
        //y-axis
        const maxSum = values.reduce((max, v) => Math.max(max, v.easy + v.medium + v.hard), 0);
        const stepSize = view === "week" ? 5 : view === "month" ? 10 : 20;
        const yAxisMax = Math.ceil((maxSum + stepSize) / stepSize) * stepSize;
        //create chart
        const chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    { label: "Easy", data: easyData, backgroundColor: easyColor },
                    { label: "Medium", data: mediumData, backgroundColor: mediumColor },
                    { label: "Hard", data: hardData, backgroundColor: hardColor }
                ]
            },
            options: {
                indexAxis: "x",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        //clickable Legend
                        onClick(e, legendItem, legend) {
                            const chart = legend.chart;
                            if (legendItem.datasetIndex === undefined) return;

                            const idx = legendItem.datasetIndex ?? legendItem.index;

                            const visibleCount = chart.data.datasets.filter(
                                (_, i) => chart.getDatasetMeta(i).hidden === false
                            ).length;

                            const clickedIsOnlyVisible =
                                visibleCount === 1 && !chart.getDatasetMeta(idx).hidden;
                            //reduce on one difficulty
                            if (clickedIsOnlyVisible) {
                                chart.data.datasets.forEach((_, i) => chart.setDatasetVisibility(i, true));
                            } else {
                                chart.data.datasets.forEach((_, i) => chart.setDatasetVisibility(i, i === idx));
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
        return () => chartRef.current?.destroy();
    }, [renderChart, view]);

    return (
        <div
            style={{
                background: "var(--color-background)",
                color: "var(--color-text)",
                minHeight: "100vh",
                padding: "20px",
            }}
            >
            {/*switch between views*/}
            <div className={styles.controls}>
                <button className={styles.button} onClick={() => setView("week")}>
                    Week
                </button>
                <button className={styles.button} onClick={() => setView("month")}>
                    Month
                </button>
                <button className={styles.button} onClick={() => setView("year")}>
                    Year
                </button>
            </div>

            <div className={styles.chartFrame}>
                <div className={styles.chartContainer}>
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
};


export default ChartComponent;