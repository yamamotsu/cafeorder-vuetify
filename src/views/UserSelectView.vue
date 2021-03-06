<template>
  <div class="user-select-page">
    <v-app-bar dense elevate-on-scroll fixed color="primary">
      <v-btn icon>
        <v-icon midium
          color="secondary"
          @click="showItemsHistory=true">mdi-history</v-icon>
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

      <!-- new user card -->
      <v-overlay :value="isAddUser" light>
        <div :style="{width: '250px'}">
          <user-card
            :user="newUser"
            :isPrefab="true"
            @created="user => addNewUser(user)"
            @cancelEdit="endAddUser()"
            />
        </div>
      </v-overlay>
    </div>
  </div>
</template>

<script>
import config from "../config"
import Vue from "vue"
import UserManagerApi from "@/api/UserManager"
import AdminAuth from "@/api/AdminAuth"
import UserCard from "./UserCard"
import ItemHistoryView from "./ItemHistoryView"
Vue.component("user-card", UserCard)
Vue.component("items-history", ItemHistoryView)

export default {
  data () {
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
      isEditable: false,
      title: config.appTitle
    }
  },
  async mounted() {
    this.loading = true
    this.adminuser = await AdminAuth.Auth.loginWithGoogle()
    console.log('admin user:', this.adminuser)
    this.getAllUsers()

    this.loading = false
  },
  methods: {
    async getAllUsers (forceReflesh=false) {
      this.users = await UserManagerApi.UserManager.getAllUsers(forceReflesh)
      console.log("all users:", this.users)
    },
    addNewUser (user) {
      console.log('adding user:', user)
      // this.$set(this.users, user.id, user)
      this.getAllUsers(true)
      this.endAddUser()
    },
    endAddUser () {
      this.newUser = {
        name: "",
        balance: 0,
        color: "FFFFFF",
        enable: true
      }
      this.isAddUser = false
    },
    removeUser (user) {
      const users = UserManagerApi.UserManager.unableUser(user)
      this.updateUsers(users)
    },
    updateUsers (users) {
      this.users = {}
      this.users = users
    },
    goItemSelectPage (user) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
      UserManagerApi.UserManager.setCurrentUser(user.id)
      this.$router.push({
        name: "ItemSelectView",
        params: {"isAdminMode": true}
      })
    },
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
