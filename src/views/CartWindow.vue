<template>
  <v-card elevation="2">
    <v-toolbar color="accent" dense flat>
      <v-toolbar-items>
        <v-btn icon @click="closeCart()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar-items>
      <v-toolbar-title> Total {{ cartTotalValue | amountDisplay }} </v-toolbar-title>
      <v-spacer/>
      <v-toolbar-items>
        <v-btn @click="onCheckoutClicked()" text>
          <v-icon left>mdi-cart</v-icon>
          checkout
        </v-btn>
        <v-btn icon @click="isCartOpen = !isCartOpen">
          <v-icon v-show="!isCartOpen">mdi-chevron-up</v-icon>
          <v-icon v-show="isCartOpen">mdi-chevron-down</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-expand-transition>
      <div v-show="isCartOpen">
        <v-simple-table dense>
          <thead>
            <tr>
              <th class="text-center">Name</th>
              <th class="text-center">Value</th>
              <th class="text-center">Quantity</th>
              <th class="text-center">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in cart.items" :key="row.id">
              <td>{{ row.item.name }}</td>
              <td>{{ row.item.amount | amountDisplay }}</td>
              <td>
                <v-btn icon @click="reduceQuantity(row.item.id)">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                {{ row.quantity }}
                <v-btn icon @click="addQuantity(row.item.id)">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </td>
              <td>{{ row.item.amount * row.quantity | amountDisplay }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import Vue from "vue"
import Icon from "../components/Icon"
import CartRow from "../components/CartRow"

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

</style>
