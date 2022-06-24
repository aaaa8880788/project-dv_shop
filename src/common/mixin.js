// 公共代码
import Toast from "@/components/common/Toast";

export const showToast = {
  components: {
    Toast
  },
  data() {
    return {
      // Toast模态框消息
      msg: "",
      // 是否显示Toast
      isShowToast: false,
    }
  },
  methods: {
    toastMixin(timer = 2000) {
      this.isShowToast = true;
      setTimeout(() => {
        this.isShowToast = false;
      }, timer);
    },
  },
}