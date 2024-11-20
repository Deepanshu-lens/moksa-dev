<script>
    import { onMount, onDestroy } from 'svelte';
    import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
    import ChartDataLabels from 'chartjs-plugin-datalabels';
  
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend, ChartDataLabels);
  
    export let critical = 0;
    export let nonCritical = 0;
  
    let canvas;
    let chart;
  
    const createChart = () => {
      if (chart) {
        chart.destroy();
      }
      chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [critical, nonCritical],
            backgroundColor: ['#99A2FB', '#FB99B0'],
            // borderRadius: 10, 
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%', 
          plugins: {
            tooltip: {
                enabled :false
            },
            datalabels: {
                color: '#000',
                backgroundColor: '#fff', 
                borderRadius: 999, 
                padding: 6,
                borderColor: 'black',
                borderWidth: 1.5,
                font: {
                  weight: 'bold',
                  size: 10
                },
                formatter: (value, context) => {
                  return value;
                }
            }
          }
        }
      });
    };
  
    onMount(() => {
      createChart();
    });
  
    $: if (canvas) {
      createChart();
    }
  
    onDestroy(() => {
      if (chart) {

      }
    });
  </script>
  
  <style>
    canvas {
      width: 100%;
      height: 100%;
    }
  </style>
  
  <canvas bind:this={canvas}></canvas>
  