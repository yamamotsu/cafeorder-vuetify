<template>
  <v-card elevation="2">
    <v-system-bar height="32" color="accent" class="white--text">
      <p class="my-0 ml-3 text-h6">Cart Items</p>
      <v-spacer/>
        <v-btn icon @click="isCartOpen = !isCartOpen"
          tile
          elevation="0">
          <v-icon v-show="!isCartOpen" color="white">mdi-chevron-up</v-icon>
          <v-icon v-show="isCartOpen" color="white">mdi-chevron-down</v-icon>
          <!-- detail -->
        </v-btn>
        <v-btn icon @click="closeCart()"
          tile
          elevation="0"
          >
          <v-icon color="white">mdi-close</v-icon>
          <!-- close -->
        </v-btn>
    </v-system-bar>

    <v-toolbar color="white" dense flat>
      <v-toolbar-title class="ml-4">{{cartTotalQuantity | itemCountDisplay}}</v-toolbar-title>
      <v-spacer/>
      <v-toolbar-title class="mr-4">{{ cartTotalValue | amountDisplay }} </v-toolbar-title>
      <v-btn @click="onCheckoutClicked()"
        elevation="0"
        color="primary"
        :loading="loading"
        >
        <v-icon left>mdi-cart</v-icon>
        checkout
      </v-btn>
    </v-toolbar>

    <!-- expand view -->
    <v-expand-transition>
      <div v-show="isCartOpen" class="px-2">
        <v-divider class="mx-0 mb-1 mt-0"/>
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

export default {
  name: "CartWindow",
  props: ["cart", "showSummary", "loading"],
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
      let sum = 0
      for(var itemName in this.cart.items){
        var theItem = this.cart.items[itemName]
        sum += theItem.quantity
      }
      return sum
    }
  },
  filters: {
    amountDisplay: function (amount) {
      return "¥" + amount
    },
    itemCountDisplay: function(itemCount) {
      if(itemCount <= 0)
      {
        return ""
      }
      else if(itemCount == 1)
      {
        return "合計" + itemCount + " 商品"
      }
      else {
        return "合計" + itemCount + " 商品"
      }
    }
  }
}

</script>

<style lang="sass" scoped>
</style>
