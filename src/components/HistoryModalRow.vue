<template>
  <div class="card">
    <div class="card-main">
      <div class="card-main-timestamp">
        <div class="card-main-timestamp-date">
          {{date.getDate()}}
        </div>
        <div class="card-main-timestamp-time">
          {{date | date2time}}
        </div>
      </div>
      <div class="card-main-name">
        {{label}}
      </div>
      <div class="card-main-quantity">
        {{quantity}}
      </div>
      <div class="card-main-subtotal">
        {{subtotal}}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from "./Icon"

export default ({
  data () {
    return {
      "isShowItems": false
    }
  },
  props: ["record"],
  computed: {
    date() {
      return this.record.timestamp.toDate()
    },
    typeVal(){
      if(this.record.type === "purchase"){
        return 0
      }else if(this.record.type === "set" || this.record.type === "reset"){
        return 1
      }
      return -1
    },
    label() {
      if(this.typeVal == 0){
        return this.record.name
      }else if(this.typeVal == 1){
        return "<チャージ>"
      }
      return ""
    },
    quantity(){
      if(this.typeVal == 0){
        return this.record.quantity
      }else if(this.typeVal == 1){
        return ""
      }
      return ""
    },
    subtotal() {
      if(this.typeVal == 0){
        return this.record.subtotal
      }else if(this.typeVal == 1){
        if (this.record.subtotal > 0){
          return "+"+this.record.subtotal
        }
        return this.record.subtotal
      }
      return ""
    }
  },
  methods:{
  },
  filters: {
    date2time (date) {
      const hours = date.getHours()
      const hoursStr = ("00" + hours).slice(-2)
      const minutes = date.getMinutes()
      const minutesStr = ("00" + minutes).slice(-2)
      return hoursStr + ":" + minutesStr
    }
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


    &-timestamp
      display: flex
      flex-direction: row
      width: 25%
      margin: auto 0

      &-date
        width: 30%

      &-time
        width: 70%



    &-name
      width: 50%
      margin: auto 0


    &-quantity
      width: 10%
      margin: auto 0


    &-subtotal
      width: 15%
      margin: auto 15px auto 0
      text-align: right


    &-expand
      max-width: 10%
      margin: auto



</style>
