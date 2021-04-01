<template>
  <div class="item-select-page">
    <header class="header">
      <items-header>
        <template v-slot:leftside>
          <div class="header-toolbar">
            <div class="header-toolbar-button header-toolbar-back">
              <icon
                class="header-toolbar-button-icon"
                @click="backToUserPage()"
                :iconSize="30"
                :padding="0"
                :borderRadius="4"
                >
                keyboard_arrow_left
              </icon>
            </div>
            <div class="header-toolbar-user">
              <h3 class="header-toolbar-user-name">
                {{user.name}}
              </h3>
              <h3 class="header-toolbar-user-balance">
                {{user.balance | amountDisplay}}
              </h3>
            </div>
          </div>
        </template>
        <template v-slot:rightside>
          <div class="header-toolbar header-right">
            <div class="header-toolbar-button">
              <icon
                class="header-toolbar-button-icon header-toolbar-button-edit"
                @click="isEditable=!isEditable"
                :iconSize="30"
                :padding="2"
                :borderRadius="4"
                >
                create
              </icon>
            </div>
            <div class="header-toolbar-button">
              <icon
                class="header-toolbar-button-icon"
                @click="isAddItem=true"
                :iconSize="30"
                :padding="0"
                :borderRadius="4"
                >
                add
              </icon>
            </div>
          </div>
        </template>
      </items-header>
    </header>

    <div class="main-content">
      <!-- Favorite Items -->
      <div class="favorites-content section"
        v-if="favItems.length > 0">
        <div class="favorites-title section-title">
          <h3>Quickpicker</h3>
        </div>
        <div class="mdl-grid">
          <item-card
            v-for="card in favItems"
            :key="card.id"
            :item="card"
            :user="user"
            :isAdmin="isEditable"
            @selected = "(item) => addItemToCart(item)"
            @remove = "(item) => unableItem(item)"
            @enable = "(item) => enableItem(item)"
          ></item-card>
        </div>
      </div>

      <!-- All Item Cards -->
      <div class="section">
        <div class="section-title">
          <h3>All items</h3>
        </div>
        <div class="all-content mdl-grid">
          <item-card
            v-for="card in items"
            :key="card.id"
            :item="card"
            :user="user"
            :isAdmin="isEditable"
            @selected = "(item) => addItemToCart(item)"
            @remove = "(item) => unableItem(item)"
            @enable = "(item) => enableItem(item)"
          ></item-card>
        </div>
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

      <!-- Purchase Completed modal -->
      <modal class="purchase-completed-modal" v-if="isPurchaseCompleted" @close="closePurchasedModal">
        <div class="purchase-completed-modal-content">
          <div class="purchase-completed-modal-header">
            <h3>Purchase complete</h3>
          </div>
          <div class="purchase-completed-modal-main">
            <div class="purchase-completed-modal-item-summary">
              <p class="figure">{{getCartTotalValue() | absAmountDisplay}}</p>
            </div>
            <div class="purchase-completed-modal-user-summary">
              <p>{{user.balance| billOrDepositMessage}}</p>
              <p class="figure">{{user.balance| absAmountDisplay}}</p>
            </div>
          </div>
          <div class="purchase-completed-modal-footer">
            <button class="purchase-completed-modal-button"
              @click="closePurchasedModal">Close</button>
          </div>
        </div>
      </modal>

      <modal class="additem-modal" v-if="isAddItem" @close="isAddItem = false">
        <div class="additem-modal-content">
          <h3>Add Item</h3>
          <hr>
          <div class="additem-field">
            <div class="additem-field-name">
              <p>Item name:</p>
              <input class="h3" type="text" v-model="newItem.name">
            </div>
            <div class="additem-field-name">
              <p>Thumbnail:</p>
              <input type="file" @change="(e) => {setUploadImage(e.target.files[0])}"/>
            </div>
            <div class="additem-field-amount">
              <p>Item amount:</p>
              <input class="h3" type="number" v-model="newItem.amount">
            </div>
          </div>
          <div class="additem-buttons">
            <div class="additem-buttons-content">
              <toolbar-icon
                class="button-ellipse cancel"
                @click="endAddItem"
                :iconSize="32"
                :padding="4"
                :borderRadius="4"
                >
                cancel
              </toolbar-icon>
              <toolbar-icon
                class="button-ellipse check"
                @click="addNewItem"
                :iconSize="32"
                :padding="4"
                :borderRadius="4"
                >
                done
              </toolbar-icon>
            </div>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import ItemManager from "@/api/ItemManager"
import UserManagerApi from "@/api/UserManager"
import HistoryManagerApi from "@/api/HistoryManager"
import ItemCard from "./ItemCard"
import AdminAuth from "@/api/AdminAuth"
import UploaderApi from "../api/Uploader"
import Header from "../components/Header"
import Modal from "../components/Modal"
import CartWindow from "./CartWindow"
import Icon from"../components/Icon"

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
      uploadFile: Object(),
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
    billOrDepositMessage: function(amount){
      if (amount >= 0) {
        return "Your current deposit:"
      }
      return "Your bill of this month:"
    },
    absAmountDisplay: function(amount) {
      if (amount >= 0) {
        return "¥" + amount
      }
      return "¥" + -1*amount
    }
  },
  methods: {
    getAllItems: async function () {
      await ItemManager.getAllItems(false).then((items) => {this.items = items})
    },
    addNewItem: async function () {
      await UploaderApi.Uploader.uploadImageFile(this.uploadFile, "itemImages", null).then(value => {
        this.newItem.imageUrl = value['url']
      })
      await ItemManager.addItem(this.newItem).then(item => {
        console.log("new item:", item)
        this.$set(this.items, item.id, item)
      })
        // this.$set(this.items, this.newItem.name, this.newItem)
      this.endAddItem()
    },
    unableItem: function(item) {
      const items = ItemManager.unableItem(item)
      this.updateItems(items)
      // this.$delete(this.items, item.name)
    },
    enableItem: function(item) {
      const items = ItemManager.enableItem(item)
      this.updateItems(items)
    },
    endAddItem: function () {
      this.uploadFile = null
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
    setUploadImage: async function (file) {
      this.uploadFile = file
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
            name:"UserSelectPage"
          })
        }
        this.user.balance -= totalValue

        // append history and get history id
        HistoryManagerApi.HistoryManager.addPurchaseHistory(this.user, this.cart).then(() => {
          UserManagerApi.UserManager.overwriteUser(this.user)
          // show completed modal
          this.isCartEnabled = false
          this.isPurchaseCompleted = true
          setTimeout(this.closePurchasedModal, 3000)
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
        name:"UserSelectPage"
      })
    },
    updateItems: function(items) {
      this.items = {}
      this.items = items
    }
  },
  computed: {
    cartTotalValue: function () {
      return this.getCartTotalValue()
    }
  }
}

Vue.component("item-card", ItemCard)
Vue.component("items-header", Header)
Vue.component("modal", Modal)
Vue.component("cart", CartWindow)
Vue.component("icon", Icon)
</script>

<style lang="sass" scoped>

.header
  height: 54px

  &-toolbar
    display: flex
    flex-direction: row
    margin: auto 4px auto 10px

    &-button
      margin: auto 2px

      &-icon
        border: 2px solid

    &-user
      display: flex
      flex-direction: row
      flex-wrap:wrap
      height: 100%
      margin: auto 0

  &-right
    margin-right: 16px

  h3
    margin: auto 7px auto 7px
    font-size: 20px
    font-weight: 600
    line-height: 22px

.backbutton::before
  content: ""
  position: absolute
  top: 50%
  left: 5px
  margin-top: -10px
  border: 10px solid transparent
  border-right: 10px solid #303030
  z-index: 1

.backbutton::after
  content: ""
  position: absolute
  top: 50%
  left: 14px
  margin-top: -6px
  border: 6px solid transparent
  border-right: 6px solid #ffcc00
  z-index: 2

.backbutton
  margin-left: 32px

.mdl-button
  position: fixed
  right: 10%
  bottom: 10%
  z-index: 10

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
  bottom: 16px
  width: 70vw

  box-shadow: #2c3e50 0 1px 3.4px

  @media (max-width: 480px)
    left: 0px
    bottom: 0px
    width: 100vw

    box-shadow: #2c3e50 0 -0.8px 2.8px

.purchase-completed-modal
  padding: 0

  &-content
    min-width: 340px
    background-color: #fcfcfc
    h3, p, button
      font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif

  &-header
    h3
      margin: auto
      font-size: 28px
      line-height: 32px

    display: flex
    box-sizing: border-box
    color: #2c3e50

    // height: 60px
    padding: 16px 20px

  &-main
    padding: 16px 30px
    display: flex
    flex-direction: column

  &-item-summary, &-user-summary
    display: flex
    flex-direction: row
    // height: 60px
    justify-content:space-between


  &-item-summary
    p.figure
      font-size: 42px
      line-height: 46px
      margin: 0px auto 20px auto



  &-user-summary
    p
      margin: auto 0px
      font-size: 20px
      line-height: 26px

    p.figure
      font-size: 24px

  &-footer
    padding: 8px 16px

  &-button
    font-size: 24px
    letter-spacing: 2px

    width: 100%
    height: 40px
    border: none
    color: #fff
    background-color: #13ec1c
    border-radius: 1px

.additem-modal
  display: flex
  flex-direction: column
  h3
    font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
    font-size: 24px
    margin: 6px auto
    font-weight: 400

  p
    font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
    font-size: 18px
    line-height: 20px
    margin: 0
    margin-right: 10px

  &-content
    padding: 10px 20px

  .additem-field
    .additem-field-name
      align-content: right
      display: flex
      flex-direction: row
      margin: 20px 0

    &-amount
      display: flex
      flex-direction: row
      margin: 20px 0

    &-stocks
      display: flex
      flex-direction: row
      margin: 20px 0

    input
      max-width: 100%
      -webkit-box-sizing: border-box
      box-sizing: border-box
      border: 1px solid rgba(105, 105, 105, 0.6)
      border-radius: 4px
      background-color: rgba(250, 250, 250, 0.8)
      padding: 6px 10px

    .h3
      font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
      font-size: 22px
      line-height: 24px
      margin: 8px auto
      font-weight: 400

  .additem-buttons
      display: flex
      flex-direction: row-reverse

      &-content
        display: flex
        flex-direction: row
        border-radius: 14px
        border: none
        width: max-content
        padding: 4px 8px
        background-color: rgba(250, 250, 250, 1)


      .button-ellipse
        margin: 0 2px

        &.cancel
          color: #ff3f81

        &.check
          color: #7af721

  .additem-field-button
    width: 100px
    height: 30px
</style>
