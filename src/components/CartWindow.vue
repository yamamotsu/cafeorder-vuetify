<template>
  <div class="cart">
    <div class="cart-header"
      @click="isCartOpen = !isCartOpen">
      <div class="cart-header-icon">
        <icon
          :iconSize="36"
          :padding="0"
          :borderRadius="0">
          shopping_cart
        </icon>
      </div>
      <div class="cart-header-item-count">
        {{cartTotalQuantity | itemCountDisplay}} added
      </div>
      <div class="cart-header-openbutton">
        <icon
          class="cart-header-openbutton-icon"
          v-if="!isCartOpen"
          :iconSize="36"
          :padding="0"
          :borderRadius="4">
          keyboard_arrow_up
        </icon>
        <icon
          class="cart-header-openbutton-icon"
          v-if="isCartOpen"
          :iconSize="36"
          :padding="0"
          :borderRadius="4">
          keyboard_arrow_down
        </icon>
      </div>
      <div class="cart-header-closebutton"
        @click="closeCart()">
        <icon class="cart-header-closebutton-icon"
          :iconSize="36"
          :padding="0"
          :borderRadius="4">
          close
        </icon>
      </div>
    </div>

    <div class="cart-content">
      <div v-if="isCartOpen">
        <cart-row
          v-for="row in cart.items"
          :key="row.id"
          :item="row.item"
          :quantity="row.quantity"
          @leftArrowClicked="(itemId) => {reduceQuantity(itemId)}"
          @rightArrowClicked="(itemId) => {addQuantity(itemId)}"
        >
        </cart-row>
      </div>

      <div class="cart-content-total"
        v-if="isCartOpen || showSummary">
        <div class="cart-content-total-label">
          Total
        </div>
        <div class="cart-content-total-value">
          {{cartTotalValue | amountDisplay}}
        </div>
        <div class="cart-content-check"
          @click="onCheckoutClicked()"
          >
          <div class="cart-content-check-button">
            <icon class="cart-content-check-button-icon"
              :iconSize="32"
              :padding="4"
              :borderRadius="0">
              shopping_cart
            </icon>
            <div class="cart-content-check-button-text">
              Buy
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import Icon from "./Icon"
import CartRow from "./CartRow"

export default {
  name: "CartWindow",
  props: ["cart", "showSummary"],
  data: function () {
    return {
      isCartOpen: false
    }
  },
  methods: {
    reduceQuantity: function(itemId) {
      var theItem = this.cart.items[itemId]
      if(theItem.quantity <= 0)
      {
        return
      }

      this.$set(theItem, "quantity", theItem.quantity - 1)
      this.$set(theItem.item, "stocks", theItem.item.stocks + 1)

      // カート内のこのitemの数が0個になった場合このitemをカートから消去
      if(theItem.quantity == 0)
      {
        this.$delete(this.cart.items, itemId)
        this.$set(this.cart, "itemCount", this.cart.itemCount - 1)
      }
    },
    addQuantity: function(itemId) {
      var theItem = this.cart.items[itemId]
      this.$set(theItem, "quantity", theItem.quantity + 1)
    },
    getCartTotalValue: function() {
      var sum = 0
      for(var itemName in this.cart.items){
        var theItem = this.cart.items[itemName]
        // console.log(theItem)
        sum += theItem.item.amount * theItem.quantity
      }
      return sum
    },
    getCartTotalQuantity: function() {
      var sum = 0
      for(var itemName in this.cart.items){
        var theItem = this.cart.items[itemName]
        sum += theItem.quantity
      }
      return sum
    },
    onCheckoutClicked: function () {
      this.$emit("checkout")
      this.isCartOpen = false
    },
    closeCart: function () {
      this.$emit("close")
    },
  },
  computed: {
    lastSelectedItem: function () {
      return this.cart.items[this.cart.lastSelectedItemName]
    },
    cartTotalValue: function () {
      return this.getCartTotalValue()
    },
    cartTotalQuantity: function () {
      return this.getCartTotalQuantity()
    }
  },
  filters: {
    amountDisplay: function (amount) {
      return "¥" + amount
    },
    itemCountDisplay: function(itemCount) {
      if(itemCount <= 0)
      {
        return "no items selected"
      }
      else if(itemCount == 1)
      {
        return itemCount + " item"
      }
      else {
        return itemCount + " items"
      }
    }
  }
}

Vue.component("icon", Icon)
Vue.component("cart-row", CartRow)
</script>

<style lang="sass" scoped>

.cart
  // width: 100%
  display: block
  // border: solid 1px #2c3e50
  border-radius: 2px
  font-size: 24px
  font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
  color: #2c3e50

.cart-header
  display: flex
  flex-direction: row
  justify-content: space-between
  // width: 60%
  height: 42px
  padding: 5px 0 5px 0
  background-color: #2c3e50
  color: #fff
  // box-shadow: #2c3e50 0 1px 2px
  // margin-left: 10%

  &-icon
    margin: auto 10px auto 5%

  &-item-count
    display: inline-block
    // width: auto
    margin: auto auto auto 10px

  &-openbutton
    // width: 40px
    margin: auto 5% auto 0

    &-icon
      border: 2px solid

  &-closebutton
    $buttonSize: 48px
    $borderRadius: 4px
    top: 2px
    right: -1 * $buttonSize
    width: $buttonSize + $borderRadius
    height: $buttonSize
    border-radius: $borderRadius
    background-color: #fe3f81
    position: absolute
    z-index: -1

    display: flex

    &-icon
      margin: auto

.cart-content
  font-size: 24px
  &-total
    display: flex
    flex-direction: row
    height: 42px
    padding: 5px 0 5px 0
    background-color: #f6f6f6

    &-label
      width: 50%
      margin: auto 0 auto 0
      font-weight: 600

    &-value
      width: 25%
      margin: auto 0 auto 0
      font-weight: 600

  &-check
    display: block
    min-width: 18%
    max-width: 25%
    // height: 40px
    // margin-top: auto
    // margin-bottom: auto
    padding: 1.2px 15px 1.2px 15px

    &-button
      height: 100%
      display: flex
      flex-direction: row

      border-radius: 4px
      background-color: #ff3f81
      color: #ffffff

      &-icon
        display:block
        margin: auto 3px auto 10px
        // margin-right: 5px
        // margin-left: 10px
        width: 36px


      &-text
        display:block
        font-size: 22px
        margin: auto 16px auto 3px


      &-checked


      @media (max-width: 380px)
        &-icon
          // width: 28px
          // margin: auto auto auto 6px
          // margin: auto
          display: none


        &-text
          // font-size: 20px
          // margin-left: 0.8px
          // margin-right: 10px
          margin: auto






.check-line1
  fill:blue
  transform: rotate(75deg)

</style>
