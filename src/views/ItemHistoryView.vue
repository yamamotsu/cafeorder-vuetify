<template>
  <v-bottom-sheet inset :value="value" @input="v => $emit('input', v)">
    <v-card>
      <v-toolbar flat max-height="80vh" class="mx-3">
        <v-toolbar-title class="primary--text">History</v-toolbar-title>
        <!-- <v-spacer/> -->
        <v-btn icon @click="onLeftArrowClicked()">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        {{ year }} {{ month | monthStr }}
        <v-btn icon @click="onRightArrowClicked()" :disabled="year == now.getFullYear() && month-1 == now.getMonth()">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-spacer/>
        <v-toolbar-title class="primary--text">合計売り上げ: {{totalValue}}円</v-toolbar-title>
      </v-toolbar>

      <v-data-table
        class="mx-3"
        :loading="loading"
        :headers="headers"
        :items="items"
        :items-per-page="100"
        sort-by="quantity"
        :sort-desc="true"
        fixed-header
        height="80vh">
      </v-data-table>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import HistoryManagerApi from "../api/HistoryManager"
import ItemManager from "../api/ItemManager"
import UserManager from "../api/UserManager"
import Utils from "../api/Util"

export default {
  data () {
    return {
      year: 0,
      month: 1,
      date: this.getThisMonth(),
      now: this.getThisMonth(),
      loading: false,
      items: [],
      all_items: [],
      headers: [
        { text:"Name", value:"name" },
        { text:"Value", value:"amount" },
        { text:"Quantity", value:"quantity" },
        { text:"Subtotal", value:"subtotal" },
      ]
    }
  },
  props: ['value'],
  async mounted () {
    this.loading = true
    this.all_items = await ItemManager.getAllItems(true)
    this.updateYearMonth()
    await this.updateList()
    this.loading = false
  },
  computed: {
    totalValue() {
      let total = 0
      this.items.forEach(item => {
        total += item.amount * item.quantity
      })
      return total
    }
  },
  methods: {
    onRightArrowClicked () {
      if (this.date >= this.getThisMonth()) {
        return
      }
      this.date.setMonth(this.date.getMonth() + 1)
      this.updateYearMonth()
      this.items = []
      this.updateList()
    },
    onLeftArrowClicked () {
      this.date.setMonth(this.date.getMonth() - 1)
      this.updateYearMonth()
      this.items = []
      this.updateList()
    },
    async updateList () {
      // 購入アイテムリストを再取得し，表示を更新
      // まずアイテム名をキーにとる辞書(Object)として格納していき
      // 購入数の降順で並べ替え，リスト化してクラスメンバ変数`items`に格納
      this.loading = true
      let items_dict = {}
      let date_to = new Date(this.date)
      const all_items = this.all_items
      const users = await UserManager.UserManager.getAllUsers()
      console.log('users', users)
      date_to.setMonth(this.date.getMonth()+1)
      await HistoryManagerApi.HistoryManager.getUsersMonthHistory(
        null, // user=null: 全員の履歴を取得
        this.date,
        date_to
      ).then(history => {
        history?.forEach(record => {
          if(record.type==="purchase"){
            const theUser = users[record.user]
            if (record.user in users && ('debugUser' in theUser) && theUser.debugUser == true) {
              console.log(" > ignored debug user:", record.user, " ", theUser.name)
              return
            }

            record.items.forEach(item => {
              const id = ItemManager.getIdFromItem(item)
              if(id in items_dict){
                items_dict[id].quantity += item.quantity
              }else{
                items_dict[id] = item
                if(!('amount' in item) && id in all_items){
                  items_dict[id].amount = all_items[id].amount
                }
              }
            })

            Object.keys(items_dict).forEach(id => {
              items_dict[id].subtotal = items_dict[id].quantity * items_dict[id].amount
            })
          }else{
            // console.log("record type is not purchase")
          }
        })

        // アイテムを購入数順に降順ソート
        const itemArray = Object.values(items_dict)
        itemArray.sort(function(a,b){
          if(a.quantity > b.quantity) return -1
          if(a.quantity < b.quantity) return 1
          return 0
        })
        this.items = itemArray
      })
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
  },
  filters: {
    monthStr(month) {
      return Utils.formatMonth2Str(month)
    }
  }
}

</script>

<style lang="sass" scoped>

</style>
