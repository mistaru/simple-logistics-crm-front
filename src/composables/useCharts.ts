
import { ru } from 'date-fns/locale';
import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartType  } from 'chart.js';
import 'chartjs-adapter-date-fns';
import type { Ref, ComputedRef } from 'vue';

export interface Graph {
    graph: Ref<Chart | null>;
    canvas: Ref<HTMLCanvasElement | null>;
    options: ComputedRef<ChartConfiguration<ChartType>>;
    draw: () => void;
}
  
export interface ChartArgs {
    graph: Ref<Chart | null>;
    canvas: Ref<HTMLCanvasElement | null>;
    min?: ComputedRef<string>
    max?: ComputedRef<string>
    data: Ref<unknown[]>
    text: ComputedRef<string> | string
    labels?: Ref<string[]> | ComputedRef<string[]>
 }

async function draw(this: Graph) {
  if (this.canvas.value) { 
    this.graph.value = new Chart(this.canvas.value, this.options.value) as Chart;
  }
};

export function useLineChart({ 
  graph,
  canvas,
  min, 
  max,
  data, 
  text,
}:ChartArgs) {
  return   {
    graph,
    canvas,
    draw,
    options: computed(() => ({
      type: 'line',
      borderColor: '#76FF03',
      backgroundColor: '#76FF03',
      data: {
        datasets: [{
          label: '',
          data: data.value,
          fill: false,
          borderColor: '#558B2F',
          backgroundColor: '#76FF03',
        }],
      },
      options: {
        parsing: {
          xAxisKey: 'date',
          yAxisKey: 'count',
        },
        scales: {
          x: {
            grid: {
              color: '#00897B',
            },
            ticks: {
              color: '#00897B',
            },
            type: 'time', 
            min: min?.value ?? null, 
            max: max?.value ?? null,
            adapters: {
              date: {
                locale: ru,
              },
            },
            time: {
              unit: 'day', 
            },
          },
          y: {
            grid: {
              color: '#00897B',
            },
            ticks: {
              color: '#00897B',
            },
          },
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            display: false,
            labels: {
              display: false,
              boxWidth: 20,
              usePointStyle: true,
              pointStyle: 'rect', 
            },
          },
          title: {
            display: true,
            text: typeof text === 'string' ? text : text.value,
          },
        },
      },
    })),
  };
}

export function useDoughnutChart({ 
  graph,
  canvas,
  data, 
  labels = computed(() => []),
  text,
}: ChartArgs) {
  return    {
    graph,
    canvas,
    draw,
    options: computed(() => ({
      type: 'doughnut',
      data: {
        labels: labels.value,
        datasets: [{
          label: 'Заявки',
          data: data.value,
          backgroundColor: COLORS,
          borderColor: '#263238',
          hoverOffset: 10,
        }],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: typeof text === 'string' ? text : text.value,
          },
        },
      },
    })),
  };
}
// {
//   graph: processTimeGraph,
//   canvas: processTimeCanvas,
//   draw,
//   options: computed(() => ({
//     type: 'line',
//     borderColor: '#76FF03',
//     backgroundColor: '#76FF03',
//     data: {
//       datasets: [{
//         label: '',
//         data: processTimeArr.value,
//         fill: false,
//         borderColor: '#558B2F',
//         backgroundColor: '#76FF03',
//         tension: 0.1,
//       }],
//     },
//     options: {
//       parsing: {
//         xAxisKey: 'date',
//         yAxisKey: 'min',
//       },
//       scales: {
//         x: {

//           grid: {
//             color: '#00897B',
//           },
//           ticks: {
//             color: '#00897B',
//           },
//           type: 'time', 
//           min: '2024-08-07',
//           max: '2024-12-07',
//           adapters: {
//             date: {
//               locale: ru,
//             },
//           },
//           time: {
//             unit: 'month', 
//           },
//         },
//         y: {
//           title: {
//             text: 'сек.',
//             display: true,
//           },
//           grid: {
//             color: '#00897B',
//           },
//           ticks: {
//             color: '#00897B',
//           },
//         },
//       },
//       responsive: true,
//       plugins: {
//         legend: {
//           position: 'top',
//           display: false,
//           labels: {
//             display: false,
//             boxWidth: 20,
//             usePointStyle: true,
//             pointStyle: 'rect', // Выбор формы: 'circle', 'rect', 'triangle', и др.
//           },
//         },
//         title: {
//           display: true,
//           text: 'Время обработки Заявки',
//         },
//       },
//     },

//   })),
// },