<template>
  <div class="com-container">
    <!-- 可选栏目部分 -->
    <div class="title" :style="titleStyle">
      <div @click="showChoice = !showChoice">
        <span>▎ {{ showTitle }}</span>
        <i :style="titleStyle" class="iconfont title-icon">&#xe6ed;</i>
      </div>
      <div class="select-con" v-show="showChoice" :style="titleChildStyle">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handleSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
// 网络请求部分
// import { getTrendData } from "@/network/getDataRequest";

import { mapState } from "vuex";
import { getThemeValue } from "@/common/theme_utils";

export default {
  name: "Trend",
  data() {
    return {
      chartInstance: null, //Echart实例对象
      listData: null, // 图表数据
      showChoice: false, // 是否显示可选项
      choiceType: "map", // 显示的数据类型
      titleFontSize: 0, //字体图标大小
    };
  },
  computed: {
    // 点击过后需要显示的数组
    selectTypes() {
      if (!this.listData) {
        return [];
      } else {
        return this.listData.type.filter(
          (item) => item.key !== this.choiceType
        );
      }
    },
    // 标题展示的内容
    showTitle() {
      if (!this.listData) {
        return "";
      } else {
        return this.listData[this.choiceType].title;
      }
    },
    // 标题的样式
    titleStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
    // 标题可选项样式
    titleChildStyle() {
      return {
        marginLeft: this.titleFontSize + "px",
      };
    },
    // 取出state中的theme属性,然后监听它
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      // console.log("主题切换了");
      this.chartInstance.dispose(); // 销毁当前的图表
      this.initChart(); // 重新以最新的主题名称初始化图表对象
      this.screenAdapter(); // 完成屏幕的适配
      this.updataChart(); // 更新图表的展示
    },
  },
  methods: {
    // 初始化图表
    initChart() {
      const trendDom = this.$refs.trend_ref;
      this.chartInstance = this.$echarts.init(trendDom, this.theme);
      const initOption = {
        grid: {
          left: "3%",
          top: "35%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          left: "center",
          top: "18%",
          icon: "circle",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
      };
      this.chartInstance.setOption(initOption);
    },
    // 获取图表数据
    async getListData(res) {
      // const { data: res } = await getTrendData();
      // console.log(res);
      this.listData = res;
      // console.log(this.listData);
      // 更新图表
      this.updataChart();
    },
    updataChart() {
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      // 处理数据
      // 类目轴数据
      const timeArr = this.listData.common.month;
      // y轴的数据
      const valueArr = this.listData[this.choiceType].data;
      // series下的数据
      const series = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: "line",
          data: item.data,
          stack: this.choiceType,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: colorArr1[index],
                },
                {
                  offset: 1,
                  color: colorArr2[index],
                },
              ],
            },
          },
        };
      });
      // 图例的数据
      const legendArr = valueArr.map((item) => {
        return item.name;
      });
      const dataOption = {
        xAxis: {
          data: timeArr,
        },
        legend: {
          data: legendArr,
        },
        series: series,
      };
      this.chartInstance.setOption(dataOption);
    },
    // 屏幕适配,屏幕尺寸变化时触发的函数
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 1.3,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    // 点击标题子选项触发
    handleSelect(currentType) {
      this.choiceType = currentType;
      this.updataChart();
      this.showChoice = false;
    },
  },
  created() {
    // 在组件创建完成之后，进行回调函数的注册
    this.$socket.registerCallBack("trendData", this.getListData);
  },
  mounted() {
    // 初始化图表
    this.initChart();
    // 获取图表数据
    // this.getListData();
    // 发送数据给服务器，我现在要数据
    this.$socket.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("trendData");
  },
};
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  z-index: 10;
  color: white;
  left: 20px;
  top: 20px;
  cursor: pointer;
  .title-icon {
    margin-left: 10px;
  }
}
</style>
