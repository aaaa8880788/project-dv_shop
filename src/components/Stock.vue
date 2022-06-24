<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
// 网络请求部分
import { getStockData } from "@/network/getDataRequest";
import { mapState } from "vuex";
export default {
  name: "Stock",
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0, // 当前显示的数据
      timerId: null, // 定时器的标识
    };
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.initChart();
      this.screenAdapter();
      this.updateChart();
    },
  },
  methods: {
    // 初始化图表
    initChart() {
      const stockDom = this.$refs.stock_ref;
      if (stockDom) {
        this.chartInstance = this.$echarts.init(stockDom, this.theme);
        const initOption = {
          title: {
            text: "▎库存和销量分析",
            left: 20,
            top: 20,
          },
        };
        this.chartInstance.setOption(initOption);
        this.chartInstance.on("mouseover", () => {
          clearInterval(this.timerId);
        });
        this.chartInstance.on("mouseout", () => {
          this.startInterval();
        });
      }
    },
    // 获取图表数据
    async getData(res) {
      // const { data: res } = await getStockData();
      // console.log(res);
      this.allData = JSON.parse(JSON.stringify(res));
      this.updateChart();
      this.startInterval();
    },
    // 更新图表
    updateChart() {
      // 各个图表的坐标
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      // 各个图表的颜色
      const colorArr = [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#5052EE", "#AB6EE5"],
        ["#23E5E5", "#2E72BF"],
      ];
      // 数据处理
      // 一次只展示5条数据
      const start = this.currentIndex * 5;
      const end = (this.currentIndex + 1) * 5;
      const showData = this.allData.slice(start, end);
      const seriesArr = showData.map((item, index) => {
        return {
          type: "pie",
          // radius: [110, 100],
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
          labelLine: {
            show: false, //隐藏显示线
          },
          data: [
            // 销量
            {
              name: item.name + "\n\n" + item.sales,
              value: item.sales,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: colorArr[index][0],
                    },
                    {
                      offset: 1,
                      color: colorArr[index][1],
                    },
                  ],
                },
              },
              label: {
                position: "center",
                color: colorArr[index][0],
              },
              // 内部的提示框 c数值 d百分比
              tooltip: {
                formatter: `${item.name} <br/>销量：{c} <br/>占比：{d}%`,
              },
            },
            // 库存
            {
              value: item.stock,
              itemStyle: {
                color: "#bbbbbb",
              },
              // 内部的提示框
              tooltip: {
                formatter: `${item.name} <br/>库存：{c} <br>占比：{d}%`,
              },
            },
          ],
        };
      });
      const dataOption = {
        series: seriesArr,
        tooltip: {
          // 这里为item 可以为内部的数据开启 单独的 tooltip
          trigger: "item",
        },
      };
      this.chartInstance.setOption(dataOption);
    },
    // 屏幕适配
    screenAdapter() {
      const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6;
      const innerRadius = titleFontSize * 2.8;
      const outterRadius = innerRadius * 1.125;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            type: "pie",
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.2,
            },
          },
          {
            type: "pie",
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: "pie",
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
          {
            type: "pie",
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2,
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    // 定时器函数
    startInterval() {
      this.timerId && clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > 1) {
          this.currentIndex = 0;
        }
        this.updateChart();
      }, 3000);
    },
  },
  created() {
    this.$socket.registerCallBack("stockData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "stockData",
      chartName: "stock",
      value: "",
    });
    this.screenAdapter();
    window.addEventListener("resize", this.screenAdapter);
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timerId);
    this.$socket.unRegisterCallBack("stockData");
  },
};
</script>
