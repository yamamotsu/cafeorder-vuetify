<template>
  <div class="icon_content"
    :style="iconStyle"
    @click="$emit('click')"
    >
    <i class="material-icons" :style="fontSize">
      <slot></slot>
    </i>
  </div>
</template>
<script>

// const padding_size = 6

export default {
  data: function () {
    return {
      fontSize: {
        fontSize: (this.iconSize - this.padding * 2) + "px"
      },
      iconStyle: {
        width: (this.iconSize - this.padding * 2) + "px",
        height: (this.iconSize - this.padding * 2) + "px",
        padding: this.padding + "px",
        borderRadius: this.borderRadius + "px"
      }
    }
  },
  props: ["iconSize", "padding", "borderRadius"],
  computed: {
  }
}
</script>
<style lang="sass" scoped>
.icon_content:hover
  cursor:pointer
</style>
