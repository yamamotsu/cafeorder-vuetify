<template>
  <div class="header">
    <div class="header-main">
      <div class="header-content header-toolbar header-leftside">
        <slot name="leftside"></slot>
      </div>
      <div class="header-content header-title header-center">
        <h2>LIMU {{today}}</h2>
      </div>
      <div class="header-content header-toolbar header-rightside">
        <slot name="rightside"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment"

export default {
  name: 'Header',
  computed: {
    today: function() {
      return moment(Date.now()).format("M/D")
    }
  }
}
</script>

<style lang="sass" scoped>
.header
  position: relative
  top:0
  left:0
  width: 100vw
  height: 100%
  background-color: #ffcc00
  box-shadow: 0 0.8px 2px 0px #c7bd91
  z-index: 10

  display:flex
  flex-direction: column

  &-main
    display: flex
    flex-direction: row
    justify-content: space-between


  &-toolbar
    display: flex


  &-title
    display: flex
    justify-content: center


  &-leftside
    flex-direction: row
    width: 25%


  &-rightside
    flex-direction: row-reverse
    // margin-right: 12px
    width: 25%


  &-center
    width: 50%


  &-content
    // width: 30%



h2
  margin: auto 40px
  font-size: 36px


h3
  margin: auto 32px
  font-size: 26px
  font-weight: bold


@media (max-width: 840px)
  h2
    font-size: 28px
    margin: auto 20px


  h3
    font-size: 20px
    margin: auto 20px



</style>
