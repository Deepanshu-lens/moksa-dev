<script lang="ts">
  import { onMount, afterUpdate } from "svelte";

  const dynamicId = `chart-container-${Math.floor(Math.random() * 1000)}`;
  import FusionCharts from "fusioncharts";
  export let data: any;
  export let categoriesdata: any;
  let chart: any;

  function createChart() {
    const dataSource = {
      chart: {
        caption: "",
        subcaption: "",
        yaxisname: "",
        showvalues: "1",
        yaxismaxvalue: "0",
        yaxisminvalue: "0",
        showtooltip: "1",
        theme: "fusion",
        showlegend: "0",
        showyaxisname: "0",
        showLabels: "0",
        showShadow: "1",
        bgAlpha: "100",
        showYAxisValues: "0",
        showBorder: "0",
        numDivLines: "0",
        showCanvasBg: "0",
        showCanvasBase: "0",
        stack100percent: "1",
        labelFontColor: "#000000",
        labelPadding: "15",
        useRoundEdges: "1",
        plotGradientColor: "0",
        canvasbgColor: "#ffffff,#ffffff",
        showHoverEffect: "0",
        plotHoverEffect: "0",
        plotBorderHoverDashed: "0",
        barHoverAlpha: "0",
        plotFillHoverAlpha: "0",
        showsum: "0",
        showValues: "1",
        placeValuesInside: "1",
        valueFontColor: "#000000",
        valueAlpha: "100",
        textOutline: "1",
        valueFontSize: "12",
        showPercentValues: "0",
        showPercentInToolTip: "0",
        formatNumberScale: "0",
        decimals: "0",
        forceDecimals: "0",
        valuePadding: "5",
      },
      categories: categoriesdata,
      dataset: data,
    };

    if (chart) {
      chart.setJSONData(dataSource);
    } else {
      chart = new FusionCharts({
        type: "stackedcolumn3d",
        renderAt: dynamicId,
        width: "100%",
        height: "100%",
        dataFormat: "json",
        dataSource,
      });
      chart.render();
    }
  }

  onMount(() => {
    FusionCharts.ready(createChart);
  });

  afterUpdate(createChart);

  onMount(() => {
    setTimeout(() => {
      const raphaelGroups = document.querySelectorAll(
        '[class*="raphael-group"]',
      );
      const filteredGroups = Array.from(raphaelGroups).filter(
        (group) => group.classList[0].split("-").length - 1 === 2,
      );
      filteredGroups.forEach((group) => {
        const groupElement = group as HTMLElement;
        groupElement.style.display = "none";
        groupElement.style.width = "0";
        groupElement.style.height = "0";
      });
    }, 2000);
  });
</script>

<div id={dynamicId} class="h-full w-full bg-transparent p-0"></div>
