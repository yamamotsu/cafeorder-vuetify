<template>
  <div class="cart-row">
    <div class="cart-row-name">
      {{item.name}}
    </div>
    <div class="cart-row-amount">
      {{item.amount | amountDisplay}}
    </div>
    <div class="cart-row-quantity">
      <div class="cart-row-quantity-arrow">
        <icon
          :iconSize="32"
          :padding="0"
          :borderRadius="0"
          @click="onLeftArrowClicked();"
        >
        keyboard_arrow_left
        </icon>
      </div>
      <div class="cart-row-quantity-value">
        {{quantity}}
      </div>
      <div class="cart-row-quantity-arrow">
        <icon
          :iconSize="32"
          :padding="0"
          :borderRadius="0"
          @click="onRightArrowClicked();"
        >
        keyboard_arrow_right
        </icon>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import Icon from "./Icon"
import ItemManager from "@/api/ItemManager"

export default {
  name: "CartRow",
  props: ["item", "quantity"],
  filters: {
    amountDisplay: function (amount) {
      return "¥" + amount
    },
  },
  methods:{
    onRightArrowClicked: function () {
      const id = ItemManager.getIdFromItem(this.item)
      this.$emit('rightArrowClicked', id)
    },
    onLeftArrowClicked: function () {
      const id = ItemManager.getIdFromItem(this.item)
      this.$emit('leftArrowClicked', id)
    }
  }
}

Vue.component("icon", Icon)
</script>

<style lang="sass" scoped>

.cart-row
  display: flex
  flex-direction: row
  height: 34px
  padding: 5px 0 5px 0

  font-size: 24px
  font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
  color: #2c3e50
  background-color: #fcfcfc

  &-name
    width: 50%
    margin: auto


  &-amount
    width: 25%
    margin: auto


  &-quantity
    width: 25%
    // min-width: 25%
    display: flex
    flex-direction: row
    justify-content: center
    &-value
      margin: auto 0px

    &-arrow
      margin: auto 5px




</style>
