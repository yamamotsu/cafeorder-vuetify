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
      <history-modal v-if="isShowHistory" :user="user" @close="isShowHistory = false"/>
    </v-card>
</template>

<script>
import Vue from "vue"
import Colors from "../api/Colors"
import Card from "../components/Card"
import Icon from "../components/Icon"
import ColorPallet from "../components/ColorPallet"
import Modal from "../components/Modal"
import HistoryManagerApi from "../api/HistoryManager"
import UserManagerApi from "../api/UserManager"
import HistoryModal from "./HistoryModal.vue"

export default {
  components: { HistoryModal },
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

Vue.component("card", Card)
Vue.component("color-pallet", ColorPallet)
Vue.component("toolbar-icon", Icon)
Vue.component("modal", Modal)
Vue.component("history-modal", HistoryModal)
</script>

<style lang="sass" scoped>
.card-spacer
  margin-top: auto


.user-summary-content
  padding: 18px 0
  margin: 0px 10px
  border-bottom: 0.8px solid #6767674f


.user-summary:hover
  cursor: pointer


h2, .h2, h3, .h3, h4
  font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
  color: #2c3e50


h2, .h2
  font-size: 32px
  line-height: 34px
  margin: 22px auto
  font-weight: 400


h3, .h3
  font-size: 26px
  line-height: 28px
  margin: 8px auto
  font-weight: 400


h4
  font-size: 18px
  line-height: 20px
  margin: 8px auto
  font-weight: 400


.user-edit-form
  display: flex
  flex-direction: column
  align-content: center
  input
    max-width: 100%
    -webkit-box-sizing: border-box
    box-sizing: border-box
    border: 1px solid rgba(105, 105, 105, 0.6)
    border-radius: 4px
    background-color: rgba(250, 250, 250, 0.8)
    padding: 8px 10px


  &-buttons
    margin: 4px 0px
    display: flex
    flex-direction: row-reverse

    &-content
      display:flex
      flex-direction: row
      border-radius: 14px
      border: none
      width: max-content
      padding: 4px 8px
      background-color: #dadada5e


    &-charge
      border: none
      background-color: #ff3f81
      border-radius: 8px
      font-family: "Nunito", sans-serif
      color: rgba(250, 250, 250, 0.8)
      font-size: 17px
      padding: 8px 10px
      margin: 0px 3px


    .button-ellipse
      margin: 0 2px

      &.reset
        color: inherit


      &.cancel
        color: #ff3f81


      &.check
        color: #7af721

@media (max-width: 840px)
  h2, .h2
    font-size: 28px
    line-height: 30px


  h3, .h3
    font-size: 22px
    line-height: 24px



.amount-edit-buttons
  padding: 10px


.button
  margin: 3px
  width: auto
  height: 32px
  padding: 0 14px
  background-color: rgb(255, 64, 129)
  border-radius: 4px
  border-width: 0
  color: white
  font-size: 14px

  outline:none


.button:hover
  cursor: pointer
  background-color: rgba(243, 25, 98, 0.64)


.button:active
  border-width: 0


.mdl-button
  padding: 0 10px
  /* border: 2px solid */
  background-color: rgba(243, 25, 98, 0.64)
  border-radius: 4px
  color: white


.toolbar
  display: flex
  flex-direction: column
  padding: 8px

  &-row
    display: flex
    flex-direction: row



.pallet-container
  padding: 0 8px 8px 8px


.color-pallet
  /* position: absolute */
  /* margin: 0 auto */


.color-pallet::before
  content: ''
  position: absolute
  top: -22px
  left: 5px
  border: 10px solid transparent
  border-bottom: 10px solid rgb(44, 62, 80)


.danger-icon
  color: #2c3e4f82

</style>
