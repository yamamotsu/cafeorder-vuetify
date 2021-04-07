<template>
  <div class="user-select-page">
    <v-app-bar dense elevate-on-scroll fixed color="primary">
      <v-btn icon>
        <v-icon midium
          color="secondary"
          @click="showMonthlyPurchasedItems()">mdi-history</v-icon>
      </v-btn>
      <v-spacer/>
      <v-toolbar-title class="white--text text-h5">{{title}}</v-toolbar-title>
      <v-spacer/>
      <v-switch
        dense
        :hide-details="true"
        color="secondary"
        v-model="isEditable"
        prepend-icon="mdi-account-edit"
        class="mr-4"
        />
      <v-btn
        icon
        color="secondary"
        @click="isAddUser = true">
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- user cards -->
    <div class="main-content mt-12">
      <v-container>
        <v-progress-circular indeterminate
          class="my-12"
          v-show="loading"/>
        <v-row>
          <v-col
            cols="6"
            sm="3"
            md="3"
            lg="2"
            class="pa-2"
            v-for="user in sortedUsers"
            v-show="user.enable || isEditable"
            :key="user.id"
            >
            <user-card
              :user="user"
              :isEditable="isEditable"
              @onUserDataChanged="(user) => overwriteUser(user)"
              @remove="(user) => removeUser(user)"
              @click="(user) => goItemSelectPage(user)"
            />
          </v-col>
        </v-row>
      </v-container>

      <items-history v-model="showItemsHistory">
      </items-history>

      <v-overlay :value="isAddUser" light>
        <div :style="{width: '250px'}">
          <user-card
            :user="newUser"
            :isPrefab="true"
            @created="user => addNewUser(user)"
            @cancelEdit="endAddUser()"/>
        </div>
      </v-overlay>
    </div>
  </div>
</template>

<script>
import config from "../config"
import Vue from "vue"
import UserCard from "./UserCard"
import UserManagerApi from "@/api/UserManager"
import AdminAuth from "@/api/AdminAuth"
import firebase from "../firebase"
import ItemHistoryView from "./ItemHistoryView"

export default {
  name: "UserSelectPage",
  data: function() {
    return {
      users: {},
      isAddUser: false,
      showItemsHistory: false,
      loading: false,
      newUser: {
        name: "",
        balance: 0,
        color: "FFFFFF",
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
      title: config.appTitle
    }
  },
  async mounted() {
    this.loading = true
    this.adminuser = await AdminAuth.Auth.loginWithGoogle()
    console.log('admin user:', this.adminuser)
    this.getAllUsers()
    this.getNewsInfo()

    this.loading = false
  },
  methods: {
    async getAllUsers () {
      this.users = await UserManagerApi.UserManager.getAllUsers()
      console.log("all users:", this.users)
    },
    getNewsInfo: function () {
      const firestore = firebase.firestore()
      firestore.collection("system").doc("news").get().then(snapshot => {
        this.infoData = snapshot.data()
        if (!this.infoData) { return }
        if (!("enable" in this.infoData)) { return }
        if (this.infoData["enable"] == false) { return }

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
    addNewUser: function (user) {
      console.log('adding user:', user)
      // this.$set(this.users, user.id, user)
      this.getAllUsers()
      this.endAddUser()
    },
    endAddUser: function () {
      this.newUser = {
        name: "",
        balance: 0,
        color: "FFFFFF",
        enable: true
      }
      this.isAddUser = false
    },
    removeUser: function (user) {
      var users = UserManagerApi.UserManager.unableUser(user)
      this.updateUsers(users)
      // this.users.remove(user)
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
    sortedUsers () {
      return Object.values(this.users).sort((x, y) => {
        if (x.enable != y.enable) {
          return x.enable ? -1 : +1
        }
        return x.name < y.name ? -1 : +1
      })
    }
  }
}

Vue.component("user-card", UserCard)
Vue.component("items-history", ItemHistoryView)
</script>

<style lang="sass" scoped>

.main-content
  width: 100vw
  min-height: 100vh
  background-color: rgb(252,252,252)

.user-select-page
  min-height: 100vh
  height: max-content

</style>
