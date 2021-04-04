<template>
  <v-card>
    <v-toolbar flat max-height="80vh">
      <v-toolbar-title class="primary--text">{{user.name}}'s history</v-toolbar-title>
      <v-spacer/>
      <v-btn icon @click="onLeftArrowClicked()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      {{ year }} {{ month | monthStr }}
      <v-btn icon @click="onRightArrowClicked()" :disabled="year == now.getFullYear() && month-1 == now.getMonth()">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-toolbar>

    <v-progress-linear indeterminate v-show="loading"/>
    <v-simple-table fixed-header height="80vh">
      <thead>
        <tr>
          <th class="text-center">Date</th>
          <th class="text-center">Time</th>
          <th class="text-center">Name</th>
          <!-- <th class="text-center">Value</th> -->
          <th class="text-center">Quantity</th>
          <th class="text-center">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in history" :key="record.id">
          <td>{{ record.timestamp.getDate() }}</td>
          <td>{{ record.timestamp | date2time }}</td>
          <td>{{ record | recordName }}</td>
          <!-- <td>{{ record.amount }}</td> -->
          <td>{{ record.quantity }}</td>
          <td>{{ record.subtotal }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-card>
</template>

<script>
import HistoryManagerApi from "../api/HistoryManager"
import Util from "../api/Util"
import ItemManager from "@/api/ItemManager"

export default {
  data: function () {
    return {
      year: 0,
      month: 1,
      date: this.getThisMonth(),
      now: this.getThisMonth(),
      history: [],
      items: {},
      loading: false,
    }
  },
  props: ['user'],
  async mounted () {
    this.loading = true
    this.updateYearMonth()
    this.items = await ItemManager.getAllItems()
    await this.userHistory()
    this.loading = false
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
    async userHistory() {
      this.loading = true
      let date_to = new Date(this.date)
      date_to.setMonth(this.date.getMonth()+1)
      await HistoryManagerApi.HistoryManager.getUsersMonthHistory(
        this.user,
        this.date,
        date_to
      ).then(
        history => {
          // this.history = history
          this.updateItemHistory(history)
        }
      )
      this.loading = false
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
      if(!history){
        this.history = []
        return
      }
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
              "timestamp": record.timestamp.toDate(),
              "type": record.type,
              "name": item.name,
              "quantity": item.quantity,
              "subtotal": subtotal,
            })
          })
        }else if(record.type === "set" || record.type === "reset"){
          console.log("set/reset type", record)
          itemHistory.push({
            "timestamp": record.timestamp.toDate(),
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
    date2time (date) {
      const hours = date.getHours()
      const hoursStr = ("00" + hours).slice(-2)
      const minutes = date.getMinutes()
      const minutesStr = ("00" + minutes).slice(-2)
      return hoursStr + ":" + minutesStr
    },
    recordName (record){
      if(record.type === "purchase"){
        return record.name
      }
      if(record.subtotal < 0){
        return "<< 送金 >>"
      }
      return "<< チャージ >>"
    }
  },
  computed: {
  }
}

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
