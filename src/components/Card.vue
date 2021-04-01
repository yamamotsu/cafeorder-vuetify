<template>
  <transition name="card" appear>
    <div class="card-cell">
      <div class="card mdl-card mdl-shadow--2dp" :style="cardStyle"
      @click="(e) => $emit('click', e)">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
import Colors from "../api/Colors"

export default {
  name: "Card",
  computed: {
    bgColor: function() {
      return Colors.colortable[this.colorName]
    },
    cardStyle: function () {
      var bgStyle = {}
      if(this.color)
      {
        bgStyle.backgroundColor= this.color
      }
      else if(this.colorName)
      {
        var color = Colors.colortable[this.colorName]
        bgStyle.backgroundColor = color
      }
      if(this.bgImageUrl)
      {
        bgStyle.backgroundImage = 'url(' + this.bgImageUrl + ')'
      }
      return bgStyle
    }
  },
  props: ["colorName", "bgImageUrl", "color"]
}
</script>

<style lang="sass" scoped>
.card
  min-height: 200px
  width: 100%
  border-radius: 8px

  // display: flex
  // flex-direction: column
  // overflow: hidden

  transition: all 0.5s ease
  padding: 16px

  background-size: cover
  background-position: center
  background-clip: padding-box


.card.mdl-card h2, h3
  // font-family: "Avenir", Arial, Helvetica, sans-serif
  color: #2c3e50


h2
  font-size: 36px
  line-height: 40px
  margin: 8px auto
  font-weight: bold


h3
  font-size: 28px
  margin: 6px auto
  font-weight: 400


.card-enter-active,
.card-leave-active
  transition: all 0.8s ease


.card-enter,
.card-leave-to
  transform: translateY(20px)
  opacity: 0

</style>
