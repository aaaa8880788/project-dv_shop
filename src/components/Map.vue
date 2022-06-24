<template>
  <div class="com-container" @dblclick="reverMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
// 网络请求部分
import {
  getMapData,
  getLegendData,
  getProvinceData,
} from "@/network/getDataRequest";

import { getProvinceMapInfo } from "@/common/map_utils";
import { mapState } from "vuex";
export default {
  name: "Map",
  data() {
    return {
      chartInstance: null, //Echart实例对象
      mapData: null, //地图数据
      allData: null, //legend数据
      mapData: {}, //所获取的省份矢量数据，缓存
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
    // 初始化地图
    initChart() {
      // 获取图表盒子的DOM元素
      const mapDom = this.$refs.map_ref;
      if (mapDom) {
        this.chartInstance = this.$echarts.init(mapDom, this.theme);
        // 地图注册
        this.$echarts.registerMap("china", this.mapData);
        const initOption = {
          title: {
            text: "▎ 商家分布",
            left: 20,
            top: 20,
          },
          geo: {
            type: "map",
            map: "china",
            top: "5%",
            bottom: "5%",
            label: {
              show: true,
              color: "white",
            },
            //允许拖动及缩放
            roam: true,
            itemStyle: {
              areaColor: "#2E72BF",
              borderColor: "#333",
            },
          },
          legend: {
            left: "5%",
            bottom: "5%",
            orient: "vertical", //竖着排列
          },
        };
        this.chartInstance.setOption(initOption);
        // 屏幕适配
        this.screenAdapter();

        // 定义点击监听事件，当点击地图某个省份后显示省份地图
        this.chartInstance.on("click", async (arg) => {
          // console.log(arg);
          // arg.name 得到所点击的省份，这个省份他是中文，所以这里要把他转化成英文
          const provinceInfo = getProvinceMapInfo(arg.name);
          // console.log(provinceInfo);
          // 这里需要获取这个省份的地图矢量数据
          // 判断当前所点击的这个省份的地图数据在mapData是否存在
          if (!this.mapData[provinceInfo.key]) {
            const res = await getProvinceData(provinceInfo.path);
            // console.log(res);
            this.mapData[provinceInfo.key] = res.data;
            this.$echarts.registerMap(provinceInfo.key, res.data);
          }
          const changeOption = {
            geo: {
              map: provinceInfo.key,
            },
          };
          this.chartInstance.setOption(changeOption);
        });
      }
    },
    // 获取图表数据
    async getListMapData(res) {
      // console.log(res);
      // 网络请求部分
      // const res = await getMapData();
      this.mapData = JSON.parse(JSON.stringify(res));
      // console.log(this.mapData);
      // 获取数据后注册地图组件
      this.initChart();
      // 初始化图表后获取legend数据
    },
    async getListLegendData(ret) {
      // console.log(ret);
      // const ret = await getLegendData();
      this.allData = JSON.parse(JSON.stringify(ret));
      // console.log(this.allData);
      // 更新图表
      this.updataChart();
    },
    // 更新地图
    updataChart() {
      if (this.chartInstance) {
        // 处理数据
        // 图例数据
        const legendArr = this.allData.map((item) => item.name);

        const seriesArr = this.allData.map((item) => {
          // return的这个对象就代表的是一个类别下的所有散点数据
          // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
          return {
            type: "effectScatter",
            name: item.name,
            data: item.children,
            //指明散点使用的坐标系统 geo的坐标系统
            coordinateSystem: "geo",
            rippleEffect: {
              scale: 10,
              // 使涟漪效果变成空心
              brushType: "stroke",
            },
          };
        });

        const dataOption = {
          legend: {
            data: legendArr,
          },
          series: seriesArr,
        };
        this.chartInstance.setOption(dataOption);
      }
    },
    // 屏幕适配,屏幕尺寸变化时触发的函数
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    // 回到中国地图
    reverMap() {
      const revertOption = {
        geo: {
          map: "china",
        },
      };
      this.chartInstance.setOption(revertOption);
    },
  },
  created() {
    this.$socket.registerCallBack("mapData", this.getListMapData);
    this.$socket.registerCallBack("legendData", this.getListLegendData);
  },
  mounted() {
    // 获取图表数据,因为地图要获取数据后才能注册,所以在获取数据后初始化图表
    // this.getListMapData();
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "china",
      value: "",
    });
    // this.getListLegendData();
    this.$socket.send({
      action: "getData",
      socketType: "legendData",
      chartName: "map",
      value: "",
    });
    // 屏幕尺寸变化监听
    window.addEventListener("resize", this.screenAdapter);
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unregisterCallBack("mapData");
    this.$socket.unregisterCallBack("legendData");
  },
};
</script>

<style lang="less" scoped>
</style>