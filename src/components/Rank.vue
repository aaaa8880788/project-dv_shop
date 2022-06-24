<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script>
// 导入网络请求部分
import { getRankData } from "@/network/getDataRequest";
import { mapState } from "vuex";
export default {
  name: "Rank",
  data() {
    return {
      chartInstance: null, //Echart实例对象
      allData: null, //图表数据
      startValue: 0, // 区域缩放的起点值
      endValue: 9, // 区域缩放的终点值
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
      this.updataChart();
    },
  },
  methods: {
    // 初始化图表
    initChart() {
      const rankDom = this.$refs.rank_ref;
      if (rankDom) {
        this.chartInstance = this.$echarts.init(rankDom, this.theme);
        const initOption = {
          title: {
            text: "▎ 地区销售排行",
            left: "5%",
            top: "5%",
          },
          tooltip: {},
          grid: {
            top: "30%",
            left: "5%",
            right: "5%",
            bottom: "5%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              type: "bar",
              label: {
                show: true,
                position: "top",
                color: "white",
              },
            },
          ],
        };
        this.chartInstance.setOption(initOption);
        // 添加监听，鼠标移入停止定时器
        this.chartInstance.on("mouseover", () => {
          clearInterval(this.timerId);
        });
        // 添加监听鼠标移除启动定时器
        this.chartInstance.on("mouseout", () => {
          this.startInterval();
        });
      }
    },
    async getData(res) {
      // const { data: res } = await getRankData();
      this.allData = JSON.parse(JSON.stringify(res));
      if (this.allData) {
        // 对allData里面的每一个元素进行排序，从大到小
        this.allData.sort((a, b) => {
          return b.value - a.value;
        });
        // console.log(this.allData);
        this.updataChart();
        // 启动定时器
        this.startInterval();
      }
    },
    updataChart() {
      const colorArr = [
        ["#0BA82C", "#4FF778"],
        ["#2E72BF", "#23E5E5"],
        ["#5052EE", "#AB6EE5"],
      ];
      // 处理图表需要的数据
      // 所有省份所形成的数组
      const provinceArr = this.allData.map((item) => {
        return item.name;
      });
      // 所有省份对应的销售金额
      const valueArr = this.allData.map((item) => {
        return item.value;
      });
      const dataOption = {
        xAxis: {
          data: provinceArr,
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color(arg) {
                let targetColorArr = null;
                if (arg.value > 300) {
                  targetColorArr = colorArr[0];
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1];
                } else {
                  targetColorArr = colorArr[2];
                }
                return {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      // 百分之0状态之下的颜色值
                      offset: 0,
                      color: targetColorArr[0],
                    },
                    {
                      // 百分之100状态之下的颜色值
                      offset: 1,
                      color: targetColorArr[1],
                    },
                  ],
                };
              },
            },
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [titleFontSize, titleFontSize, 0, 0],
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    // 设置定时器
    startInterval() {
      this.timerId && clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.startValue++;
        this.endValue++;
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updataChart();
      }, 2000);
    },
  },
  created() {
    this.$socket.registerCallBack("rankData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "rankData",
      chartName: "rank",
      value: "",
    });
    this.screenAdapter();
    window.addEventListener("resize", this.screenAdapter);
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timerId);
    this.$socket.unregisterCallBack("rankData");
  },
};
</script>

