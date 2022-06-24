<template>
  <div class="toast">
    <span>{{ msg }}</span>
  </div>
</template>

<script>
export default {
  name: "Toast",
  props: ["msg"],
};
</script>

<style lang="less">
.toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 25px;
  font-size: 14px;
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  z-index: 999;
}
</style>
