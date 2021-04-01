<template>
  <div class="mdl-cell mdl-cell--2-col" v-if="user.enable||isEditable">
    <card class="user-card" :colorName="user.color">
      <div class="user-summary-content">
        <div class="user-summary" v-if="!isEdit" @click="onClick">
          <h2>{{user.name}}</h2>
          <h3>{{user.balance|amountDisplay}}</h3>
          <h4 v-if="user.bill != null">Your current bill:{{user.bill}}</h4>
        </div>
        <div class="user-edit-form" v-if="isEdit">
          <input class="input h3" type="text" v-model="newUser.name" placeholder="Name">
          <input class="input h3" type="text" v-model="newUser.balance" placeholder="Balance">
          <div class="user-edit-form-buttons">
            <button class="user-edit-form-buttons-charge" @click="onChargeButtonClicked(100)">+100</button>
            <button class="user-edit-form-buttons-charge" @click="onChargeButtonClicked(1000)">+1,000</button>
          </div>
          <div class="user-edit-form-buttons">
            <div class="user-edit-form-buttons-content">
              <toolbar-icon
                class="button-ellipse cancel"
                @click="switchEditMode()"
                :iconSize="32"
                :padding="4"
                :borderRadius="4"
                >
                cancel
              </toolbar-icon>
              <toolbar-icon
                class="button-ellipse check"
                @click="finishEditMode()"
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
      <div class="toolbar">
        <div class="toolbar-row">
          <toolbar-icon
          :iconSize="32"
          :padding="4"
          :borderRadius="4"
          @click="isColorSelectMode = !isColorSelectMode"
          >palette</toolbar-icon>
          <toolbar-icon
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            @click="switchEditMode()">
            create
          </toolbar-icon>
          <toolbar-icon
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            @click="onUndoButtonClicked()">
            undo
          </toolbar-icon>
          <toolbar-icon
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            @click="showHistory()">
            history
          </toolbar-icon>
          <toolbar-icon
            v-if="isEditable && !showDangerZone"
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            @click="showDangerZone = true">
            expand_more
          </toolbar-icon>
          <toolbar-icon
            v-if="isEditable && showDangerZone"
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            @click="showDangerZone = false">
            expand_less
          </toolbar-icon>
        </div>
        <div class="toolbar-row" v-if="showDangerZone">
          <toolbar-icon
            v-if="isEditable"
            class="danger-icon"
            @click="clearInputValue()"
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            >
            refresh
          </toolbar-icon>
          <toolbar-icon
            v-if="isEditable"
            class="danger-icon"
            @click="$emit('remove', user)"
            :iconSize="32"
            :padding="4"
            :borderRadius="4"
            >
            delete
          </toolbar-icon>
        </div>
      </div>
      <transition name="pallet">
        <div class="pallet-container" v-if="isColorSelectMode">
          <color-pallet class="color-pallet" @colorSelected="(color) => onColorSelected(color)"></color-pallet>
        </div>
      </transition>
    </card>

    <history-modal
      v-if="isShowHistory"
      :user=user
      @close="isShowHistory = false">
    </history-modal>
  </div>
</template>

<script>
import Vue from "vue"
import Colors from "../api/Colors"
import Card from "./Card"
import Icon from "./Icon"
import ColorPallet from "./ColorPallet"
import Modal from "./Modal"
import HistoryManagerApi from "../api/HistoryManager"
import UserManagerApi from "../api/UserManager"
import HistoryModal from "./HistoryModal"

export default {
  name: "UserCard",
  data: function() {
    return {
      isColorSelectMode: false,
      isAmountEditMode: false,
      isEdit: false,
      newUser: {},
      showDangerZone: false,
      isShowHistory: false
    }
  },
  props: ["user", "isEditable"],
  computed: {
    colorValue: function() {
      return Colors.colortable[this.user.color]
    }
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
    onClick: function(event) {
      // console.log("this user:"+this.user.name)
      this.$emit("onClicked", this.user)
    },
    getColorValue: function(colorName) {
      return Colors.colortable[colorName]
    },
    onColorSelected: function(color) {
      // console.log(color)
      this.user.color = color
      // this.$emit("onUserDataChanged", this.user)
      this.updateUserDB(this.user)
    },
    onUndoButtonClicked: function() {
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
    onChargeButtonClicked(value) {
      this.newUser.balance += value
    },
    showHistory: function () {
      this.isShowHistory = true
    },
    clearInputValue: function() {
      // this.newUser.balance = 0
      this.addSetBalanceHistory(0)

      this.user.balance = 0
      this.updateUserDB(this.user)
    },
    switchEditMode: function() {
      if(this.isEdit)
      {
        this.newUser = {}
        this.isEdit = false
      }
      else
      {
        this.newUser = Object.assign({}, this.user)
        this.isEdit = true
      }
    },
    finishEditMode: function() {
      if (this.user.balance != this.newUser.balance) {
        this.addSetBalanceHistory(this.newUser.balance)
      }
      this.user.name = this.newUser.name
      this.user.balance = this.newUser.balance
      this.updateUserDB(this.user)
      this.newUser = {}
      this.isEdit = false
    },
    updateUserDB: function(newUser) {
      UserManagerApi.UserManager.overwriteUser(newUser)
    },
    addSetBalanceHistory: function(newBalance) {
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
