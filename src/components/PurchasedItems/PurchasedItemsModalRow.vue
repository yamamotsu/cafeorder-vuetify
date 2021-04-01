<template>
  <div class="card">
    <div class="card-main">
      <div class="card-main-name">
        {{item.name}}
      </div>
      <div class="card-main-amount">
        {{item.amount}}
      </div>
      <div class="card-main-quantity">
        {{item.quantity}}
      </div>
      <div class="card-main-subtotal">
        {{item.amount * item.quantity}}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from "../Icon"

export default ({
  data () {
    return {
    }
  },
  props: ["item"],
  mounted () {
    // console.log(this.item)
  },
  computed: {
  },
  methods:{
  },
  filters: {
  }
})
Vue.component("icon", Icon)
</script>

<style lang="sass" scoped>
.card
  display: flex
  flex-direction: column

  width: 100%
  height: 100%

  border-bottom: 1px solid rgba(103,103,103,0.31)
  &-main
    display: flex
    flex-direction: row
    width: 100%
    height: 54px

    div
      font-size: 28px
      line-height: 30px


    &-name
      width: 55%
      margin: auto 0


    &-amount
      width: 15%
      margin: auto 0


    &-quantity
      width: 15%
      margin: auto 0


    &-subtotal
      width: 15%
      margin: auto 0

</style>