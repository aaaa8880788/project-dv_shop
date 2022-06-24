<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" :style="comStyle" @click="toLeft"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" :style="comStyle" @click="toRight"
      >&#xe6ed;</span
    >
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
// 网络请求部分
import { getHotData } from "@/network/getDataRequest";
import { mapState } from "vuex";
import { getThemeValue } from "@/common/theme_utils";
export default {
  name: "Hot",
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0, //当前所展示的一级分类数据
      titleFontSize: 0,
    };
  },
  computed: {
    // 字体大小样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
    // 右下角显示的文字：该图表所属类
    catName() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.currentIndex].name;
      }
    },
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
      const hotDom = this.$refs.hot_ref;
      if (hotDom) {
        this.chartInstance = this.$echarts.init(hotDom, this.theme);
        const initOption = {
          title: {
            text: "▎ 热销商品的占比",
            left: 20,
            top: 20,
          },
          legend: {
            top: "15%",
            icon: "circle",
          },
          series: [
            {
              type: "pie",
              label: {
                show: true,
                formatter: `{b}{d}%`,
              },
              /* emphasis: {
                label: {
                  show: true,
                },
                labelLine: {
                  show: false,
                },
              }, */
            },
          ],
          tooltip: {
            formatter(arg) {
              // console.log(arg);
              const thirdCategory = arg.data.children;
              // console.log(thirdCategory);
              // 计算出所有三级分类的数值总和
              let total = 0;
              thirdCategory.forEach((item) => {
                total += item.value;
              });
              let retStr = "";
              thirdCategory.forEach((item) => {
                retStr += `${item.name}:${Math.round(
                  (item.value / total) * 100
                )}% <br/>`;
              });
              return retStr;
            },
          },
        };
        this.chartInstance.setOption(initOption);
      }
    },
    // 获取数据
    async getData(res) {
      // const { data: res } = await getHotData();
      this.allData = JSON.parse(JSON.stringify(res));
      // console.log(this.allData);
      this.updataChart();
    },
    // 更新图表
    updataChart() {
      // 处理数据
      const legendData = this.allData[this.currentIndex].children.map(
        (item) => {
          return item.name;
        }
      );

      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
            // 加入children的原因是为了在tooltip中的formatter的回调函数中，来拿到这个二级分类下的三级分类数据
          };
        }
      );
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    // 屏幕适配
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          // 图例的间隔
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2,
          },
        },
        series: [
          {
            // 图例的间隔
            radius: this.titleFontSize * 4.5,
            center: ["50%", "60%"],
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    // 点击左翻页
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = 2;
      }
      // 更新图表
      this.updataChart();
    },
    // 点击右翻页
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > 2) {
        this.currentIndex = 0;
      }
      // 更新图表
      this.updataChart();
    },
  },
  created() {
    this.$socket.registerCallBack("hotData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "hotData",
      chartName: "hotproduct",
      value: "",
    });
    this.screenAdapter();
    window.addEventListener("resize", this.screenAdapter);
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("hotData");
  },
};
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  cursor: pointer;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  cursor: pointer;
}
.cat-name {
  position: absolute;
  left: 80%;
  color: white;
  bottom: 7%;
}
</style>