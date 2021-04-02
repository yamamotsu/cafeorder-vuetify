<template>
    <v-card
      class="user-card pa-2"
      :colorName="user.color">
      <!-- action buttons -->
      <v-card-actions
        class="px-0 pt-0 pb-1"
        v-if="isEditable">
        <v-spacer></v-spacer>
        <v-switch
          inset dense
          hide-details="true"
          class="mr-0 mt-0"
          :prepend-icon="visibleIconName"
          v-model="user.enable"/>
      </v-card-actions>

      <!-- edit form -->
      <div
        v-if="isEdit">
        <v-text-field
          dense
          filled
          hide-details="auto"
          label="User Name"
          :rules="nameRules"
          v-model="newUser.name"/>
        <v-text-field
          class="mt-2"
          dense
          filled
          hide-details="auto"
          label="Balance"
          :rules="nameRules"
          type="Number"
          v-model="newUser.balance"/>
        <v-chip-group column>
          <v-spacer/>
          <v-chip @click="newUser.balance += 5000">+5000</v-chip>
          <v-chip @click="newUser.balance += 1000">+1000</v-chip>
        </v-chip-group>
        <v-toolbar flat dense>
          <v-spacer/>
          <v-toolbar-items>
            <v-btn icon @click="cancelEditMode()">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
            <v-btn icon @click="finishEditMode()">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </div>

      <!-- summary -->
      <div
        v-else
        @click="onClick">
        <v-card-title v-text="user.name"/>
        <v-card-subtitle>{{user.balance | amountDisplay}}</v-card-subtitle>
      </div>

      <!-- action buttons -->
      <!-- <v-divider/> -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn icon small @click="isEdit = !isEdit">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-palette</v-icon>
        </v-btn>
        <v-btn icon @click="isShowHistory = true">
          <v-icon>mdi-history</v-icon>
        </v-btn>
      </v-card-actions>

      <!-- history -->
      <history-modal :user="user" v-model="isShowHistory"/>
    </v-card>
</template>

<script>
import Vue from "vue"
import Colors from "../api/Colors"
import ColorPallet from "../components/ColorPallet"
import HistoryManagerApi from "../api/HistoryManager"
import UserManagerApi from "../api/UserManager"
import HistoryView from "./HistoryModal"

export default {
  name: "UserCard",
  data: function() {
    return {
      isColorSelectMode: false,
      isAmountEditMode: false,
      isEdit: false,
      newUser: {},
      showDangerZone: false,
      isShowHistory: false,
      nameRules: [
        value => !!value || 'Required'
      ]
    }
  },
  props: ["user", "isEditable"],
  computed: {
    colorValue: function() {
      return Colors.colortable[this.user.color]
    },
    visibleIconName () {
      if (this.user.enable) {
        return 'mdi-eye'
      }else{
        return 'mdi-eye-off'
      }
    }
  },
  mounted () {
    this.newUser =  Object.assign({}, this.user)
  },
  filters: {
    amountDisplay: function(amount) {
      if (amount >= 0) {
        return "+¥" + amount
      }
      return "-¥" + -1*amount
    }
  },
  methods: {
    onClick () {
      // console.log("this user:"+this.user.name)
      this.$emit("onClicked", this.user)
    },
    getColorValue (colorName) {
      return Colors.colortable[colorName]
    },
    onColorSelected (color) {
      // console.log(color)
      this.user.color = color
      // this.$emit("onUserDataChanged", this.user)
      this.updateUserDB(this.user)
    },
    onUndoButtonClicked () {
      var isUndo = confirm("Would you UNDO your last operation?")
      if (!isUndo) {
        return
      }

      HistoryManagerApi.HistoryManager.revertUserHistory(this.user).then(
        () => {
          this.updateUserDB(this.user)
        }
      )
    },
    showHistory () {
      this.isShowHistory = true
    },
    clearInputValue () {
      // this.newUser.balance = 0
      this.addSetBalanceHistory(0)

      this.user.balance = 0
      this.updateUserDB(this.user)
    },
    finishEditMode () {
      if (this.user.balance != this.newUser.balance) {
        this.addSetBalanceHistory(this.newUser.balance)
      }
      // this.user = Object.assign({}, this.newUser)
      this.user.name = this.newUser.name
      this.user.balance = this.newUser.balance
      this.updateUserDB(this.user)
      this.isEdit = false
    },
    cancelEditMode () {
      this.newUser = Object.assign({}, this.user)
      this.isEdit = false
    },
    updateUserDB (newUser) {
      UserManagerApi.UserManager.overwriteUser(newUser)
    },
    addSetBalanceHistory (newBalance) {
      HistoryManagerApi.HistoryManager.addSetValueHistory(this.user, newBalance)
    }
  }
}

Vue.component("color-pallet", ColorPallet)
Vue.component("history-modal", HistoryView)
</script>

<style lang="sass" scoped>


</style>
