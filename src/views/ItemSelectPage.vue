<template>
  <div class="item-select-page">
    <v-app-bar dense color="primary">
      <v-btn
        text
        color="secondary"
        @click="backToUserPage()">
        <v-icon midium left
          color="secondary">mdi-arrow-left</v-icon>
          Back
      </v-btn>
      <v-spacer/>
      <v-toolbar-title>{{user.name}}: {{user.balance | amountDisplay}}</v-toolbar-title>
      <v-spacer/>
      <v-btn icon>
        <v-icon midium
          color="secondary"
          @click="isEditable = !isEditable">mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon midium
          color="secondary"
          @click="isAddItem = true">mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <div class="main-content">
      <!-- Favorite Items -->
      <div class="favorites-content section"
        v-if="favItems.length > 0">
        <div class="favorites-title section-title">
          <h3>Quickpicker</h3>
        </div>
        <v-container>
          <v-row>
            <v-col
              cols="12"
              sm="3"
              md="3"
              lg="2"
              class="pa-2"
              v-for="card in favItems"
              v-show="card.enable || isEditable"
              :key="card.id">
              <item-card
                :item="card"
                :user="user"
                :isEditable="isEditable"
                @selected = "(item) => addItemToCart(item)"
                @switched="(enable) => setEnableItem(card, enable)"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- All Item Cards -->
      <div class="section">
        <div class="section-title">
          <h3>All items</h3>
        </div>
        <v-container>
          <v-row>
            <v-col
              cols="12"
              sm="3"
              md="3"
              lg="2"
              class="pa-2"
              v-for="card in items"
              v-show="card.enable || isEditable"
              :key="card.id">
              <item-card
                :item="card"
                :user="user"
                :isEditable="isEditable"
                @selected="(item) => addItemToCart(item)"
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
        :showSummary="true"
        @checkout="checkOut()"
        @close="cleanUpCart()"
        >
      </cart>

      <!-- Purchase Completed overlay -->
      <v-overlay :value="isPurchaseCompleted">
        <v-card color="white" class="pa-1 text-center" width="300">
          <v-card-text class="primary--text text-h4 pb-0">支払い完了!</v-card-text>
          <v-card-subtitle class="grey--text light-2 pt-0">{{ getNowString() }}</v-card-subtitle>
          <v-card-text class="pt-3 pb-0">
            <div class="amount-display">
              <h3 class="primary--text text-h3 my-0 mr-1">{{ getCartTotalValue() }}</h3>
              <h4 class="grey--text light-2">円</h4>
            </div>
          </v-card-text>
          <v-card-text class="pt-3 pb-8">
            <div class="amount-display">
              <p class="grey--text light-1">{{ billOrDepositMessage(user.balance) }}</p>
              <h5 class="grey--text my-0 mx-1">{{ user.balance | absAmountDisplay }}</h5>
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
            @created="item => addNewItem(item)"
            @cancelEdit="endAddItem()"
          />
        </div>
      </v-overlay>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import ItemManager from "@/api/ItemManager"
import UserManagerApi from "@/api/UserManager"
import HistoryManagerApi from "@/api/HistoryManager"
import AdminAuth from "@/api/AdminAuth"
import Modal from "../components/Modal"
import CartWindow from "./CartWindow"
import ItemCard from "./ItemCard"

export default {
  name: "ItemSelectPage",
  data: function() {
    return {
      items: {},
      favItems: [],
      isCartEnabled: false,
      user: this.$route.params.user,
      isAddItem: false,
      isPurchaseCompleted: false,
      isEditable: false,
      newItem: {
        id: "",
        name: "",
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
    console.log(this.user)
    if(!this.$route.params.user) {
        this.$router.push({name: "UserSelectPage"})
    }
    this.adminuser = await AdminAuth.Auth.loginWithGoogle()
    let self = this
    await this.getAllItems().then(async function(){
      console.log('items:', self.items)
      await UserManagerApi.UserManager.fetchFavoriteItems(
        self.user,
        self.items
      ).then(favItems => {
        console.log("favItems:", favItems)
        self.favItems = favItems
      })
    })
  },
  filters: {
    amountDisplay: function(amount) {
      if (amount >= 0) {
        return "+¥" + amount
      }
      return "-¥" + -1*amount
    },
    absAmountDisplay: function(amount) {
      if (amount >= 0) {
        return amount
      }
      return -1*amount
    }
  },
  methods: {
    getAllItems: async function () {
      await ItemManager.getAllItems(false).then((items) => {this.items = items})
    },
    addNewItem: async function (item) {
      this.$set(this.items, item.id, item)
      this.endAddItem()
    },
    setEnableItem (item, enable){
      // console.log(enable)
      const items = ItemManager.setEnableItem(item, enable)
      this.updateItems(items)
    },
    endAddItem: function () {
      this.newItem = {
        name: "",
        id: "",
        amount: 100,
        stocks: 0,
        imageUrl: "",
        enable:true
      }
      this.isAddItem = false
    },
    backToUserPage: function () {
      this.cleanUpCart()
      this.$router.push('/users')
    },
    // setUploadImage: async function (file) {
    //   this.uploadFile = file
    // },
    billOrDepositMessage: function(amount){
      if (amount >= 0) {
        return "残高:"
      }
      return "支払い額:"
    },
    checkOut: function () {
      console.log(this.cart)
      var totalValue = this.getCartTotalValue()

      // update user's info
      UserManagerApi.UserManager.getAllUsers().then((users) => {
        this.user = users[this.user.id]
        if(!this.user){
          alert("sorry, this user has been deleted.")
          this.$router.push({
            name:"UserSelectView"
          })
        }
        this.user.balance -= totalValue

        // append history and get history id
        HistoryManagerApi.HistoryManager.addPurchaseHistory(this.user, this.cart).then(() => {
          UserManagerApi.UserManager.overwriteUser(this.user)
          // show completed modal
          this.isCartEnabled = false
          this.isPurchaseCompleted = true
          setTimeout(this.closePurchasedModal, 5000)
        })
      })
    },
    getCartTotalValue: function() {
      var sum = 0
      for(var id in this.cart.items){
        var theItem = this.cart.items[id]
        // console.log(theItem)
        sum += theItem.item.amount * theItem.quantity
      }
      return sum
    },
    cleanUpCart: function () {
      /**
       * カートを空にする．
       * //itemのstock数などを元に戻す
       */

      this.cart.items = {}
      this.cart.lastSelectedItemName = ""
      this.cart.itemCount = 0
    },
    addItemToCart: function (item) {
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
    closePurchasedModal: function () {
      this.isPurchaseCompleted = false
      window.scrollTo({
        top:0,
        behavior: "smooth"
      })
      this.$router.push({
        name:"UserSelectView"
      })
    },
    updateItems: function(items) {
      this.items = {}
      this.items = items
    },
    getNowString() {
      const now = new Date(Date.now())
      return now.toLocaleString('ja')
    }
  },
  computed: {
    cartTotalValue: function () {
      return this.getCartTotalValue()
    },
  }
}

Vue.component("modal", Modal)
Vue.component("cart", CartWindow)
Vue.component("item-card", ItemCard)
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
  margin-bottom: 28px
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
