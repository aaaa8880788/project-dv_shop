<template>
  <div class="com-container">
    <div class="com-chart" ref="myChartRef"></div>
  </div>
</template>

<script>
// 网络请求部分
import { getSellerCounterData } from "@/network/getDataRequest";
import { mapState } from "vuex";

export default {
  name: "Seller",
  data() {
    return {
      chartInstance: null, //Echart实例对象
      listData: [], // 图表数据
      currentPage: 1, //当前显示页数
      totalPage: 0, //一共有多少页
      timerId: null, //定时器标识
    };
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.setMyEchart();
      this.screenAdapter();
      this.updataChart();
    },
  },
  methods: {
    // 获取图表数据
    async getData(res) {
      // const { data: res } = await getSellerCounterData();
      // console.log(res);
      if (res.status === 404) {
        this.msg = res.message;
      } else {
        this.listData = JSON.parse(JSON.stringify(res));
        // 对获取的数据进行处理

        // 对数据进行排序
        // this.listData.sort((a, b) => a.value - b.value);

        // 每5个元素显示一页,获取总页数
        this.totalPage = Math.ceil(this.listData.length / 5);

        // 得到数据后更新表格
        this.updataChart();
        // 开启定时器
        this.startInterval();
      }
    },
    // 创建Echart,初始化
    setMyEchart() {
      //通过ref获取到DOM节点
      const myChart = this.$refs.myChartRef;
      // 1.初始化Echarts
      if (myChart) {
        //利用原型调取Echarts的初始化方法
        this.chartInstance = this.$echarts.init(myChart, this.theme);
        // 2.配置option
        const option = {
          title: {
            text: "▎商家销售统计",
            left: "5%",
            top: "5%",
            textStyle: {
              // fontSize: 40,
            },
          },
          grid: {
            left: "3%",
            top: "20%",
            right: "10%",
            bottom: "3%",
            containLabel: true, // 距离是包含坐标轴上的文字
          },
          xAxis: {
            type: "value",
          },
          yAxis: {
            type: "category",
          },
          series: [
            {
              type: "bar",
              // barWidth: 65,
              label: {
                show: true,
                position: "right",
                textStyle: {
                  color: "white",
                },
              },
              itemStyle: {
                // borderRadius: [0, 30, 30, 0],
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    {
                      // 百分之0状态之下的颜色值
                      offset: 0,
                      color: "#5052EE",
                    },
                    {
                      // 百分之100状态之下的颜色值
                      offset: 1,
                      color: "#AB6EE5",
                    },
                  ],
                },
              },
            },
          ],
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "line",
              z: 0,
              lineStyle: {
                type: "solid",
                // width: 66,
                color: "#2D3443",
              },
            },
          },
        };
        //3.将编写好的配置项挂载到Echarts上
        this.chartInstance.setOption(option);
        // 对图表对象进行鼠标事件的监听
        // 鼠标移入停止定时器
        this.chartInstance.on("mouseover", () => {
          clearInterval(this.timerId);
        });
        // 鼠标移除开启定时器
        this.chartInstance.on("mouseout", () => {
          this.startInterval();
        });
      }
    },
    // 更新图表
    updataChart() {
      // 数据处理,因为只要显示5条
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      // 这里对数据进行截取
      const showData = this.listData.slice(start, end);
      // 这里是取出showData中的每个对象,然后分别取出他们的name形成一个数组
      const sellerNames = showData.map((item) => item.name);
      // 这里是取出showData中的每个对象,然后分别取出他们的value形成一个数组
      const sellervalues = showData.map((item) => item.value);

      //{}内写需要图表的各种配置，可以在官方案例中修改完毕后复制过来
      const option = {
        yAxis: {
          data: sellerNames,
        },
        series: [
          {
            data: sellervalues,
          },
        ],
      };
      //将编写好的配置项挂载到Echarts上
      this.chartInstance.setOption(option);
    },
    // 设置一个定时器函数，让图表每个time切换一次
    startInterval() {
      // 防抖一个原理,触发多次的话就会出现本来就有timeId的情况
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        // 更新图表
        this.updataChart();
      }, 3000);
    },
    // 当浏览器的大小发送变化时，会调用的方法，来完成屏幕的适配
    screenAdapter() {
      // console.log(this.$refs.myChartRef.offsetWidth);
      const titleFontSize = (this.$refs.myChartRef.offsetWidth / 100) * 3.6;
      // console.log(titleFontSize);
      // 和分辨率大小相关的配置项
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
              borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize();
    },
  },
  created() {
    this.$socket.registerCallBack("sellerData", this.getData);
  },
  mounted() {
    // 初始化Echarts,这里必须在这里调用不能在created，因为那时候DOM元素获取不到，还初始化个毛线
    this.setMyEchart();
    // 获取数据
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "sellerData",
      chartName: "seller",
      value: "",
    });
    this.screenAdapter();
    // 在获取数据后，表格已经出来，这时候监听浏览器屏幕大小变化，为了分辨率适配,这里用节流处理
    window.addEventListener("resize", this.screenAdapter);
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    // 在组件销毁的时候,取消定时器
    clearInterval(this.timerId);
    this.$socket.unRegisterCallBack("sellerData");
  },
};
</script>

<style lang="less">
</style>