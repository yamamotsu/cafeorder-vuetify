<template>
  <modal class="modal" @close="$emit('close')">
    <div class="modal-content">
      <div class="header" :style="{backgroundColor:headerColor}">
        <div class="header-title header-row">
          <h3>Purchases of {{user.name}}</h3>
        </div>
        <div class="header-date header-row">
          <div class="header-date-year">
            <p>{{year}}</p>
          </div>
          <div class="header-date-month">
            <div class="header-date-arrow">
              <icon
              :iconSize="32"
              :padding="0"
              :borderRadius="0"
              @click="onLeftArrowClicked()"
              >
              keyboard_arrow_left
              </icon>
            </div>
            <div class="header-date-month-view">
              <p>{{month | monthStr}}</p>
            </div>
            <div class="header-date-arrow">
              <icon
              :iconSize="32"
              :padding="0"
              :borderRadius="0"
              @click="onRightArrowClicked()"
              >
              keyboard_arrow_right
              </icon>
            </div>
          </div>
        </div>
      </div>
      <div class="main">
        <record-row class="record-row"
          v-for="record in history"
          :key = "record.id"
          :record = "record"
          >
        </record-row>
      </div>
    </div>
  </modal>
</template>

<script>
import Vue from "vue"
import Icon from "../components/Icon"
import Modal from "../components/Modal"
import HistoryManagerApi from "../api/HistoryManager"
import Util from "../api/Util"
import HistoryModalRow from "../components/HistoryModalRow"
import Color from "../api/Colors"
import ItemManager from "@/api/ItemManager"

export default {
  data: function () {
    return {
      "year": 0,
      "month": 1,
      "date": this.getThisMonth(),
      "history": [],
      "items": {}
    }
  },
  props: ['user'],
  mounted: function () {
    this.updateYearMonth()
    this.userHistory()
    ItemManager.getAllItems().then((items) => {this.items = items})
  },
  methods: {
    onRightArrowClicked() {
      if (this.date >= this.getThisMonth())
      {
        return
      }
      this.date.setMonth(this.date.getMonth() + 1)
      this.updateYearMonth()
      this.userHistory()
    },
    onLeftArrowClicked() {
      this.date.setMonth(this.date.getMonth() - 1)
      this.updateYearMonth()
      this.userHistory()
    },
    userHistory() {
      let date_to = new Date(this.date)
      date_to.setMonth(this.date.getMonth()+1)
      HistoryManagerApi.HistoryManager.getUsersMonthHistory(
        this.user,
        this.date,
        date_to
      ).then(
        history => {
          // this.history = history
          this.updateItemHistory(history)
        }
      )
    },
    getThisMonth() {
      let now = new Date(Date.now())
      return new Date(now.getFullYear(), now.getMonth())
    },
    updateYearMonth() {
      this.year = this.date.getFullYear()
      this.month = this.date.getMonth() + 1
    },
    updateItemHistory(history){
      if(!history) return []
      let itemHistory = []
      let items = this.items
      history.forEach(record => {
        if(record.type === "purchase") {
          record.items.forEach(item => {
            var subtotal = 0
            if("subtotal" in item){
              subtotal = item.subtotal
            }else{
              const itemId = ItemManager.getIdFromItem(item)
              // console.log(item, itemId, items[itemId])
              subtotal = items[itemId].amount * item.quantity
            }

            itemHistory.push({
              "timestamp": record.timestamp,
              "type": record.type,
              "name": item.name,
              "quantity": item.quantity,
              "subtotal": subtotal,
            })
          })
        }else if(record.type === "set" || record.type === "reset"){
          console.log("set/reset type", record)
          itemHistory.push({
            "timestamp": record.timestamp,
            "type": record.type,
            "name": "",
            "quantity": 0,
            "subtotal": record.value
          })
        }else{
          console.log("invalid type", record)
        }
      })
      // console.log(itemHistory)
      // this.itemHistory = itemHistory
      this.history = itemHistory
    }
  },
  filters: {
    monthStr (month) {
      return Util.Utils.formatMonth2Str(month)
    },
  },
  computed: {
    headerColor () {
      return Color.colortable[this.user.color]
    }
  }
}

Vue.component("icon", Icon)
Vue.component("modal", Modal)
Vue.component("record-row", HistoryModalRow)
</script>

<style lang="sass" scoped>

p, h3
  font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
  color: #2c3e50

$modal-width: 640px
$modal-padding: 16px

.modal-content
  // padding: 16px
  width: $modal-width + $modal-padding * 2
  // padding: 0 $modal-padding
  max-height: 70vh
  overflow:scroll

.header
  position: fixed
  z-index: 10
  width: 640px
  max-height: 100px
  box-shadow: 0px 1px 2px 0px #cacaca
  padding: 16px
  padding-bottom: 0

  &-row
    width: 100%
    height: 42px

    display: flex
    flex-direction: row

    padding: 4px 0

    p
      font-size: 24px
      line-heigt: 26px
      margin: auto

    h3
      font-size: 32px
      line-heigt: 34px
      margin: auto 0

  &-date
    &-year
      display: flex
      flex-direction: row
      width: 10%
      padding: 0 15px

    &-month
      display: flex
      flex-direction: row

      width: 60%
      margin: auto 0

      &-view
        display: flex
        flex-direction: row

.main
  overflow:scroll
  margin-top: 100px + $modal-padding
  z-index: 1
  padding: 0 16px

  .record-row
    width: 100%
    // min-height: 0px

</style>
