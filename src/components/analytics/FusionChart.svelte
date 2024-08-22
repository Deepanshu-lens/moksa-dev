<script lang="ts">
  import { onMount } from "svelte";
  const dynamicId = `chart-container-${Math.floor(Math.random() * 1000)}`;

  export let data;
  export let categoriesdata;
  const dataSource = {
    chart: {
      "caption": "",
      "subcaption": "",
      "yaxisname": "",
      "showvalues": "0",
      "yaxismaxvalue": "0",
      "yaxisminvalue": "0",
      "showtooltip": "0",
      "theme": "fusion",
      "showlegend": "0",
      "showyaxisname": "0",
      "showLabels": "1",
      "showShadow": "0",
      "bgAlpha": "100",
      "showYAxisValues": "0",
      "showBorder": "0",
      "numDivLines": "0",
      "showCanvasBg": "0",
      "showCanvasBase": "0",
      "stack100percent": "1",
      "labelFontColor": "#000000",
      "labelPadding": "15",
      "useRoundEdges": "1",
      "showsum": "1",
      "valueFontColor": "#000000",
      "valueAlpha": "60",
      "textOutline": "1",
      "valueFontSize": "12",
      "plotGradientColor": "0",
      "canvasbgColor": "#ffffff,#ffffff",
      "showHoverEffect": "0",
      "plotHoverEffect": "0",
      "plotBorderHoverDashed":"0",
      "barHoverAlpha": "0",
      "plotFillHoverAlpha": "0",
    },

    categories: categoriesdata,
    dataset: data,
  };

  FusionCharts.ready(function () {
    var myChart = new FusionCharts({
      type: "stackedcolumn3d",
      renderAt: dynamicId,
      width: "100%",
      height: "100%",
      dataFormat: "json",
      dataSource,
    }).render();
  });
  onMount(() => {
    setTimeout(() => {
      const raphaelGroups = document.querySelectorAll(
        '[class*="raphael-group"]'
      );
      const filteredGroups = Array.from(raphaelGroups).filter(
        (group) => group.classList[0].split("-").length - 1 === 2
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