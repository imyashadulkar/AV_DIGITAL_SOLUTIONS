import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const width = 800; // width of the chart image
const height = 600; // height of the chart image
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

export const createBarChart = async (chartData) => {
    const configuration = {
      type: 'bar',
      data: chartData,
      console.log(chartData),
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: chartData.datasets[0].label,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Count',
            },
          },
        },
      },
    };
  
    try {
      return await chartJSNodeCanvas.renderToBuffer(configuration);
    } catch (error) {
      console.error('Error generating chart:', error);
      throw error;
    }
  };

// export const createPieChart = async (chartData) => {
//   const configuration = {
//     type: "pie",
//     data: {
//       labels: chartData.labels,
//       datasets: [
//         {
//           label: chartData.datasets[0].label,
//           data: chartData.datasets[0].data,
//           backgroundColor: [
//             "rgba(255, 99, 132, 0.6)",
//             "rgba(54, 162, 235, 0.6)",
//             "rgba(255, 206, 86, 0.6)",
//             "rgba(75, 192, 192, 0.6)",
//             "rgba(153, 102, 255, 0.6)",
//             "rgba(255, 159, 64, 0.6)",
//           ],
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//     },
//   };

//   return await chartJSNodeCanvas.renderToBuffer(configuration);
// };
