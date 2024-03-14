import { Chart, ChartConfiguration, registerables } from "chart.js";
Chart.register(...registerables);

export function renderBarChart(
    root: HTMLElement,
    canvasId: string,
    labels: string[],
    values: number[],
    xLabel: string,
    yLabel: string,
    bgColors?: string[],
    borderColors?: string[]
) {
    const render = () => {
        const canvas = root.querySelector<HTMLCanvasElement>(canvasId);
        if (!canvas) {
            requestAnimationFrame(render);
            return;
        }
        if ((canvas as any)._chart) {
            ((canvas as any)._chart as Chart).destroy();
        }
        const data = {
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: bgColors ?? [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(255, 159, 64, 0.2)",
                        "rgba(255, 205, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                        "rgba(201, 203, 207, 0.2)",
                    ],
                    borderColor: borderColors ?? [
                        "rgb(255, 99, 132)",
                        "rgb(255, 159, 64)",
                        "rgb(255, 205, 86)",
                        "rgb(75, 192, 192)",
                        "rgb(54, 162, 235)",
                        "rgb(153, 102, 255)",
                        "rgb(201, 203, 207)",
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const config: ChartConfiguration<"bar"> = {
            type: "bar",
            data: data,
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xLabel,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yLabel,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        };

        const chart = new Chart(canvas, config);
        (canvas as any)._chart = chart;
    };
    render();
}
