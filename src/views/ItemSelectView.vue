<template>
  <div class="item-select-page">
    <v-app-bar dense fixed elevate-on-scroll color="primary">
      <v-btn
        v-if="isAdminMode"
        elevation="0"
        outlined
        color="secondary"
        @click="backToUserPage()">
        <v-icon midium left
          >mdi-arrow-left</v-icon>
          Back
      </v-btn>
      <v-spacer/>
      <v-toolbar-title class="white--text text-h5">{{ headerText }}</v-toolbar-title>
      <v-spacer/>
      <v-btn
        icon
        color="secondary"
        @click="isShowHistory = true">
        <v-icon>mdi-history</v-icon>
      </v-btn>
      <v-switch
        v-if="isAdminMode"
        dense
        :hide-details="true"
        color="secondary"
        v-model="isEditable"
        prepend-icon="mdi-pencil"
        class="mr-4"
        />
      <v-btn
        v-if="isAdminMode"
        icon
        color="secondary"
        @click="isAddItem = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <div class="main-content mt-12">
      <!-- Favorite Items -->
      <div class="favorites-content section"
        v-if="favItems.length > 0">
        <div class="favorites-title section-title">
          <h3>Quickpicker</h3>
        </div>
        <v-container>
          <v-row>
            <v-col
              cols="6" sm="3" md="3" lg="2"
              class="pa-2"
              v-for="card in favItems"
              v-show="card.enable || isEditable"
              :key="card.id">
                <item-card
                  :item="card"
                  :user="user"
                  :isEditable="isEditable"
                  :categories="categories"
                  @click="(item) => addItemToCart(item)"
                  @switched="(enable) => setEnableItem(card, enable)"
                />
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- All Item Cards -->
      <div class="section">
        <h3 class="section-title my-0">All items</h3>
        <v-progress-circular indeterminate v-show="loading"/>
        <v-chip-group multiple
          class="mx-3"
          v-model="categoryFilter">
          <v-spacer/>
          <v-chip filter outlined
            :disabled="isEditable"
            v-for="category in categories" :key="category.id"
            :color="category.color"
            :value="category.id">{{category.name}}</v-chip>
        </v-chip-group>
        <v-container>
          <v-row>
            <v-col
              cols="6" sm="3" md="3" lg="2"
              class="pa-2"
              v-for="card in sortedItems"
              v-show="isVisibleItem(card) || isEditable"
              :key="card.id">
              <item-card
                :item="card"
                :user="user"
                :isEditable="isEditable"
                :categories="categories"
                @click="(item) => addItemToCart(item)"
                @switched="(enable) => setEnableItem(card, enable)"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Item Cart -->
      <cart
        class="cart"
        v-if="isCartEnabled && cart.itemCount > 0"
        :cart="cart"
        :loading="isPurchaseProcessing"
        :showSummary="true"
        @checkout="checkOut()"
        @close="cleanUpCart()"
        >
      </cart>

      <!-- Purchase Completed overlay -->
      <v-overlay :value="isPurchaseCompleted">
        <v-card color="white" class="pa-1 text-center" width="300">
          <v-card-text class="primary--text text-h4 pb-0">支払い完了!</v-card-text>
          <v-card-subtitle class="grey--text light-2 pt-0">{{ getNowString() }}  {{ user.name }}</v-card-subtitle>
          <v-card-text class="pt-3 pb-0">
            <div class="amount-display">
              <h3 class="primary--text text-h3 my-0 mr-1">{{ getCartTotalValue() }}</h3>
              <h4 class="grey--text light-2">円</h4>
            </div>
          </v-card-text>
          <v-card-text class="pt-3 pb-8">
            <div class="amount-display">
              <p class="grey--text light-1">{{ user.balance | billOrDepositMessage }}</p>
              <h5 class="grey--text my-0 mx-1">{{ user.balance | abs }}</h5>
              <p class="grey--text">円</p>
            </div>
          </v-card-text>
          <v-btn
            elevation="0"
            block
            color="accent"
            @click="closePurchasedModal">Close</v-btn>
        </v-card>
      </v-overlay>

      <!-- new item overlay -->
      <v-overlay :value="isAddItem" light>
        <div :style="{width: '300px'}">
          <item-card
            :item="newItem"
            :user="user"
            :isEditable="false"
            :isPrefab="true"
            :categories="categories"
            @created="item => addNewItem(item)"
            @cancelEdit="endAddItem()"
          />
        </div>
      </v-overlay>

      <!-- user history -->
      <v-bottom-sheet inset v-model="isShowHistory">
        <history :user="user"/>
      </v-bottom-sheet>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import ItemManager from "../api/ItemManager"
import UserManagerApi from "../api/UserManager"
import HistoryManagerApi from "../api/HistoryManager"
// import AdminAuth from "@/api/AdminAuth"
import CartWindow from "./CartWindow"
import ItemCard from "./ItemCard"
Vue.component("cart", CartWindow)
Vue.component("item-card", ItemCard)

export default {
  name: "ItemSelectPage",
  data () {
    return {
      items: {},
      favItems: [],
      user: {},
      loading: false,
      isAdminMode: false,
      isCartEnabled: false,
      isAddItem: false,
      isPurchaseCompleted: false,
      isPurchaseProcessing: false,
      isShowHistory: false,
      isEditable: false,
      categories: {},
      categoryFilter: [],
      newItem: {
        id: "",
        name: "",
        category: "3",
        amount: 100,
        stocks: 0,
        imageUrl: "",
        enable:true
      },
      cart: {
        itemCount: 0,
        items: {},
        lastSelectedItemName: ""
      }
    }
  },
  async mounted() {
    if (this.$route.params.isAdminMode){
      this.isAdminMode = this.$route.params.isAdminMode
    }

    this.loading = true
    this.user = await UserManagerApi.UserManager.getCurrentUser()
    console.log("current user:", this.user)
    await this.getAllItems()
    console.log('all items:', this.items)
    const favItems = await UserManagerApi.UserManager.fetchFavoriteItems(this.user, this.items)
    console.log("favItems:", favItems)
    this.favItems = favItems
    this.loading = false
  },
  filters: {
    abs (amount) {
      return Math.abs(amount)
    },
    billOrDepositMessage (amount){
      if (amount >= 0) {
        return "残高:"
      }
      return "支払い額:"
    },
  },
  methods: {
    async getAllItems () {
      this.items = await ItemManager.getAllItems(false)
      this.categories = ItemManager.categories
      // this.categoryFilter = Object.keys(this.categories)
    },
    async addNewItem (item) {
      this.$set(this.items, item.id, item)
      this.endAddItem()
    },
    isVisibleItem(item){
      if(!item.enable) return false
      if(this.categoryFilter.length == 0) return true
      return this.categoryFilter.includes(item.category?.toString())
    },
    setEnableItem (item, enable){
      // console.log(enable)
      const items = ItemManager.setEnableItem(item, enable)
      this.updateItems(items)
    },
    endAddItem () {
      this.newItem = {
        name: "",
        id: "",
        amount: 100,
        category: "3",
        stocks: 0,
        imageUrl: "",
        enable:true
      }
      this.isAddItem = false
    },
    backToUserPage () {
      this.cleanUpCart()
      this.$router.push('/users')
    },
    async checkOut () {
      console.log(this.cart)
      const totalValue = this.getCartTotalValue()

      this.isPurchaseProcessing = true
      // update user's info
      this.user = await UserManagerApi.UserManager.getCurrentUser()
      if(!this.user){
        alert("sorry, this user has been deleted.")
        this.isCartEnabled = false
        this.isPurchaseProcessing = false
        this.$router.push({
          name:"UserSelectView"
        })
      }
      this.user.balance -= totalValue

      await HistoryManagerApi.HistoryManager.addPurchaseHistory(this.user, this.cart)
      await UserManagerApi.UserManager.overwriteCurrentUser(this.user)

      // show completed modal
      this.isCartEnabled = false
      this.isPurchaseProcessing = false
      this.isPurchaseCompleted = true
      setTimeout(this.closePurchasedModal, 3000)
    },
    getCartTotalValue () {
      let sum = 0
      for(const id in this.cart.items){
        const theItem = this.cart.items[id]
        // console.log(theItem)
        sum += theItem.item.amount * theItem.quantity
      }
      return sum
    },
    cleanUpCart () {
      /**
       * カートを空にする．
       * //itemのstock数などを元に戻す
       */

      this.cart.items = {}
      this.cart.lastSelectedItemName = ""
      this.cart.itemCount = 0
    },
    addItemToCart (item) {
      /* 指定したitemをカートに追加する．
       * この時点では購入は確定されていない．
       * ストックは選択するたびに減るが,
       * 実際にストックがオンラインに適用されるのは購入を確定した時．
       */

      console.log('add item to cart:', item)
      // カートにない種類のitemの場合新しく登録
      if(!( item.id in this.cart.items ))
      {
        // console.log("new item added to cart")
        this.$set(this.cart.items, item.id, {
          quantity: 0,
          item: item
        })

        this.$set(this.cart, "itemCount", this.cart.itemCount+1)
      }

      this.$set(
        this.cart.items[item.id],
        "quantity",
        this.cart.items[item.id].quantity + 1)

      // アイテムストック数を減らす処理
      // item.stocks -= 1

      this.$set(
        this.cart, "lastSelectedItemName", item.name
      )
      // this.cart.lastSelectedItemName = item.name

      this.isCartEnabled = true
    },
    closePurchasedModal () {
      if (!this.isPurchaseCompleted) {
        return
      }
      this.cleanUpCart()
      this.isPurchaseCompleted = false
      window.scrollTo({
        top:0,
        behavior: "smooth"
      })
      if (this.isAdminMode) {
        this.backToUserPage()
      }
    },
    updateItems (items) {
      this.items = {}
      this.items = items
    },
    getNowString() {
      const now = new Date(Date.now())
      return now.toLocaleString('ja')
    },
    amountDisplay (amount) {
      if (amount >= 0) {
        return "+¥" + amount
      }
      return "-¥" + -1*amount
    },
  },
  computed: {
    cartTotalValue () {
      return this.getCartTotalValue()
    },
    sortedItems () {
      return  Object.values(this.items).sort((x, y) => {
        if (x.enable != y.enable) {
          return x.enable ? -1 : +1
        }
        return x.name < y.name ? -1 : +1
      })
    },
    headerText () {
      if(Object.keys(this.user) == 0) return ""
      return this.user.name + ": " + this.amountDisplay(this.user.balance)
    }
  }
}

</script>

<style lang="sass" scoped>

.amount-display
  display: block
  p
    line-height: 20px
    font-size: 16px
  h2, h3, h4, h5, p
    display: inline
    margin: auto 0 0 0
    vertical-align: baseline
    //height: 100%
    line-height: 100%

.main-content
  // padding-top: 48px
  width: 100vw
  min-height: 100vh
  padding-bottom: 120px
  background-color: rgb(252,252,252)

.section
  &-title
    padding-top:16px
    h3
      margin:0
      font-size: 32px
      line-height: 34px

.favorites-content
  margin-bottom: 0px
  background-color: #fff8de

.user-select-page
  min-height: 100vh
  height: max-content

.cart
  z-index: 10
  position: fixed
  left: 20px
  bottom: 20px
  width: 520px
  max-width: 90vw

  box-shadow: #2c3e50 0 1px 3.4px

  @media (max-width: 480px)
    left: 0px
    bottom: 0px
    max-width: 100vw
    width: 100vw

    box-shadow: #2c3e50 0 -0.8px 2.8px

</style>
