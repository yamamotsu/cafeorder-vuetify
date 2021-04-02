<template>
  <div class="user-select-page">
    <v-app-bar dense color="primary">
      <v-spacer/>
      <v-toolbar-title>LIMU</v-toolbar-title>
      <v-spacer/>
      <v-btn icon>
        <v-icon midium
          color="secondary"
          @click="isEditable = !isEditable">mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon midium
          color="secondary"
          @click="showMonthlyPurchasedItems()">mdi-history</v-icon>
      </v-btn>
    </v-app-bar>
    <div class="main-content">
      <v-container>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="3"
            lg="2"
            class="pa-2"
            v-for="user in enableUsers"
            :key="user.id"
            >
            <user-card
              :user="user"
              :isEditable="isEditable"
              @onUserDataChanged="(user) => overwriteUser(user)"
              @remove="(user) => removeUser(user)"
              @onClicked="(user) => goItemSelectPage(user)"
            />
          </v-col>
        </v-row>
      </v-container>

      <!-- Colored FAB button with ripple -->
      <button
        class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored"
        @click="isAddUser = true"
      >
        <i class="material-icons">add</i>
      </button>

      <items-history v-if="showItemsHistory"
        @close="showItemsHistory=false">
      </items-history>

      <modal class="adduser-modal" v-if="isAddUser" @close="endAddUser()">
        <div class="adduser-modal-content">
          <h3>Add User</h3>
          <hr>
          <div class="adduser-field">
            <div class="adduser-field-name">
              <!-- <p>Your name:</p> -->
              <input type="text" placeholder="User name" v-model="newUser.name">
            </div>
            <div class="adduser-buttons">
              <div class="adduser-buttons-content">
                <toolbar-icon
                  class="button-ellipse cancel"
                  @click="endAddUser()"
                  :iconSize="32"
                  :padding="4"
                  :borderRadius="4"
                  >
                  cancel
                </toolbar-icon>
                <toolbar-icon
                  class="button-ellipse check"
                  @click="addNewUser()"
                  :iconSize="32"
                  :padding="4"
                  :borderRadius="4"
                  >
                  done
                </toolbar-icon>
              </div>
            </div>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import UserCard from "./UserCard"
import UserManagerApi from "@/api/UserManager"
import AdminAuth from "@/api/AdminAuth"
import Header from "../components/Header"
import Modal from "../components/Modal"
import Icon from "../components/Icon"
import firebase from "../firebase"
import PurchasedItemsModal from "./PurchasedItemsModal"

export default {
  name: "UserSelectPage",
  data: function() {
    return {
      users: {},
      isAddUser: false,
      showItemsHistory: false,
      newUser: {
        name: "",
        balance: 0,
        color: "white",
        enable: true
      },
      infoData: {
        "title": "",
        "enable": false,
        "url": "",
        "hasDetail": false
      },
      isShowInfo: false,
      isEditable: false,
    }
  },
  async mounted() {
    this.adminuser = await AdminAuth.Auth.loginWithGoogle()
    this.getAllUsers()
    this.getNewsInfo()
  },
  methods: {
    getAllUsers: function () {
      UserManagerApi.UserManager.getAllUsers().then(
        (users) => {
          this.users = users
          console.log('all users:', this.users)
        }
      )
    },
    getNewsInfo: function () {
      const firestore = firebase.firestore()
      firestore.collection("system").doc("news").get().then(snapshot => {
        this.infoData = snapshot.data()
        if (!("enable" in this.infoData)) {return}
        if (this.infoData["enable"] == false) {return}

        const infoDate = this.infoData.timestamp.toDate()
        let date5ago = new Date(Date.now())
        date5ago.setDate(date5ago.getDate() - 5)
        if(infoDate >= date5ago){
          this.isShowInfo = true
        }else{
          this.isShowInfo = false
        }
      })
    },
    onInfoBarClicked: function () {
      if (!this.infoData.hasDetail) {return}

      window.open(this.infoData.url, "_blank")
    },
    addNewUser: function () {
      UserManagerApi.UserManager.addUser(this.newUser).then(
        (users) => {
          this.updateUsers(users)
        }
      )
      this.endAddUser()
    },
    endAddUser: function () {
      this.newUser = {
        name: "",
        balance: 0,
        color: "white",
        enable: true
      }
      this.isAddUser = false
    },
    removeUser: function (user) {
      var users = UserManagerApi.UserManager.unableUser(user)
      this.updateUsers(users)
      // this.users.remove(user)
    },
    onEditMode: function (user) {
      this.newUser = user
      this.isAddUser = true
    },
    updateUsers: function (users) {
      this.users = {}
      this.users = users
    },
    goItemSelectPage: function (user) {
      window.scrollTo({
        top:0,
        behavior: "smooth"
      })
      this.$router.push({
        name: "ItemSelectPage",
        params: {"user": user}
      })
    },
    showMonthlyPurchasedItems(){
      this.showItemsHistory=true
    }
  },
  computed: {
    enableUsers() {
      if(this.isEditable) {
        return this.users
      }
      const users = this.users
      return Object.keys(users)
                  .filter((id) => users[id].enable)
                  .reduce((result, id) => {
                    result[id] = users[id]
                    return result
                  }, {})
    }
  }
}

Vue.component("user-card", UserCard)
Vue.component("users-header", Header)
Vue.component("modal", Modal)
Vue.component("toolbar-icon", Icon)
Vue.component("items-history", PurchasedItemsModal)
</script>

<style lang="sass" scoped>

.header
  height: 54px

  &-infobar
    background-color: #fcfcfc
    height: 48px
    display: flex
    flex-direction: row
    background-color: #ff4081

    &-icon-content
      display: flex
      width: 6%
      color: #fcfcfc
      z-index: 1
      box-shadow: 0px 0 7px 0px #00000052

    &-icon
      margin: auto

    &-messagebox
      margin: 0
      width: 100%
      max-width: 100%
      background-color: #f3f3f3
      display: flex
      padding: 0 10px

    &-message
      font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
      font-size: 20px
      line-height: 22px
      margin: auto 0
      max-width: 100%
      overflow: hidden

  &-toolbar
    display: flex
    flex-direction: row
    margin: auto 10px auto 10px

    &-button
      margin: auto 2px

      &-icon
        border: 2px solid

.mdl-button
  position: fixed
  right: 10%
  bottom: 10%
  z-index: 10

.main-content
  // padding-top: 54px
  width: 100vw
  min-height: 100vh
  background-color: rgb(252,252,252)

.user-select-page
  min-height: 100vh
  height: max-content

.adduser-modal
  display: flex
  flex-direction: column

  h3
    font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
    font-size: 28px
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

  .adduser-field
    .adduser-field-name
      align-content: right
      display: flex
      flex-direction: row
      margin: 20px 0

    .adduser-field-balance
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
      padding: 8px 10px

      font-size: 26px
      line-height: 28px
      margin: 8px auto
      font-weight: 400

    .adduser-buttons
      margin-top: 6px
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

  .adduser-button
    width: 100px
    height: 30px
</style>
