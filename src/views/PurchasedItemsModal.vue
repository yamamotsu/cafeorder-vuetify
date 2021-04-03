<template>
  <v-bottom-sheet inset :value="value" @input="v => $emit('input', v)">
    <v-card>
    <v-toolbar flat max-height="80vh">
      <v-toolbar-title class="primary--text">history</v-toolbar-title>
      <v-spacer/>
      <v-btn icon @click="onLeftArrowClicked()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      {{ year }} {{ month | monthStr }}
      <v-btn icon @click="onRightArrowClicked()" :disabled="year == now.getFullYear() && month-1 == now.getMonth()">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>

    </v-toolbar>

    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="100"
      fixed-header
      height="80vh">
    </v-data-table>
    <!-- <v-simple-table fixed-header height="80vh">
      <thead>
        <tr>
          <th class="text-center">Date</th>
          <th class="text-center">Time</th>
          <th class="text-center">Name</th>
          <th class="text-center">Quantity</th>
          <th class="text-center">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in history" :key="record.id">
          <td>{{ record.timestamp.getDate() }}</td>
          <td>{{ record.timestamp | date2time }}</td>
          <td>{{ record | recordName }}</td>
          <td>{{ record.quantity }}</td>
          <td>{{ record.subtotal }}</td>
        </tr>
      </tbody>
    </v-simple-table> -->
    </v-card>
  </v-bottom-sheet>
  <!-- <modal class="modal" @close="$emit('close');">
    <div class="modal-content">
      <div class="header">
        <div class="header-top">
          <div class="header-title header-row">
            <h3>月別売上品目リスト</h3>
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
                  @click="onLeftArrowClicked();"
                >keyboard_arrow_left</icon>
              </div>
              <div class="header-date-month-view">
                <p>{{month | monthStr}}</p>
              </div>
              <div class="header-date-arrow">
                <icon
                  :iconSize="32"
                  :padding="0"
                  :borderRadius="0"
                  @click="onRightArrowClicked();"
                >keyboard_arrow_right</icon>
              </div>
            </div>
            <p class="header-total">
              合計: {{totalValue}} 円
            </p>
          </div>
        </div>
        <div class="header-legend header-row">
            <div class="listitem-name">名称</div>
            <div class="listitem-amount">単価(円)</div>
            <div class="listitem-quantity">個数</div>
            <div class="listitem-subtotal">小計(円)</div>
        </div>
      </div>
      <div class="main">
        <ul class="list">
          <li
            class="listitem"
            v-for="item in items"
            :key="item.id"
            >
            <div class="listitem-name">{{item.name}}</div>
            <div class="listitem-amount">{{item.amount}}</div>
            <div class="listitem-quantity">{{item.quantity}}</div>
            <div class="listitem-subtotal">{{item.amount * item.quantity}}</div>
          </li>
        </ul>
        <list-item class="list-item" v-for="item in items" :key="item.id" :item="item"></list-item> 
      </div>

    </div>
  </modal> -->
</template>

<script>
import Vue from "vue"
import Icon from "../components/Icon"
import Modal from "../components/Modal"
import HistoryManagerApi from "../api/HistoryManager"
import ItemManager from "../api/ItemManager"
import Util from "../api/Util"
import ListRow from "../components/PurchasedItems/PurchasedItemsModalRow"

export default {
  data: function() {
    return {
      year: 0,
      month: 1,
      date: this.getThisMonth(),
      now: this.getThisMonth(),
      items: [],
      all_items: [],
      headers: [
        { text:"Name", value:"name" },
        { text:"Value", value:"amount" },
        { text:"Quantity", value:"quantity" },
        { text:"Subtotal", value:"subtotal" },
      ]
    };
  },
  props: ['value'],
  mounted: function() {
    ItemManager.getAllItems(true).then( all_items => {
      this.all_items = all_items;
      this.updateYearMonth();
      this.updateList();
    });
  },
  computed: {
    totalValue() {
      let total = 0;
      this.items.forEach(item => {
        total += item.amount * item.quantity;
      });
      return total;
    }
  },
  methods: {
    onRightArrowClicked() {
      if (this.date >= this.getThisMonth()) {
        return;
      }
      this.date.setMonth(this.date.getMonth() + 1);
      this.updateYearMonth();
      this.updateList();
    },
    onLeftArrowClicked() {
      this.date.setMonth(this.date.getMonth() - 1);
      this.updateYearMonth();
      this.updateList();
    },
    updateList() {
      // 購入アイテムリストを再取得し，表示を更新
      // まずアイテム名をキーにとる辞書(Object)として格納していき
      // 購入数の降順で並べ替え，リスト化してクラスメンバ変数`items`に格納
      let items_dict = {};
      let date_to = new Date(this.date);
      const all_items = this.all_items;
      date_to.setMonth(this.date.getMonth()+1);
      HistoryManagerApi.HistoryManager.getUsersMonthHistory(
        null, // user=null: 全員の履歴を取得
        this.date,
        date_to
      ).then(history => {
        history.forEach(record => {
          if(record.type==="purchase"){
            record.items.forEach(item => {
              const id = ItemManager.getIdFromItem(item);
              if(id in items_dict){
                items_dict[id].quantity += item.quantity;
              }else{
                items_dict[id] = item;
                if(!('amount' in item) && id in all_items){
                  items_dict[id].amount = all_items[id].amount;
                }
                // if(!('subtotal' in item)){
                //   items_dict[id].subtotal = items_dict[id].amount * items_dict[id].quantity
                // }
              }
            });

            Object.keys(items_dict).forEach(id => {
              items_dict[id].subtotal = items_dict[id].quantity * items_dict[id].amount
            })
          }else{
            // console.log("record type is not purchase");
          }
        });

        // アイテムを購入数順に降順ソート
        const itemArray = Object.values(items_dict);
        itemArray.sort(function(a,b){
          if(a.quantity > b.quantity) return -1;
          if(a.quantity < b.quantity) return 1;
          return 0;
        })
        this.items = itemArray;
      });
    },
    getThisMonth() {
      let now = new Date(Date.now());
      return new Date(now.getFullYear(), now.getMonth());
    },
    updateYearMonth() {
      this.year = this.date.getFullYear();
      this.month = this.date.getMonth() + 1;
    },
  },
  filters: {
    monthStr(month) {
      return Util.Utils.formatMonth2Str(month);
    }
  }
};

Vue.component("icon", Icon);
Vue.component("modal", Modal);
Vue.component("list-item", ListRow);
</script>

<style lang="sass" scoped>
p, h3
  font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
  color: #2c3e50

$modal-width: 640px
$modal-padding: 16px
$header-row-height: 32px
$modal-height: 80vh

.modal-content
  width: $modal-width + $modal-padding * 2
  max-height: $modal-height
  overflow: scroll

.list
  margin: 0
  padding: 0

.listitem
  display: flex
  flex-direction: row
  width: 100%
  height: 48px
  border-bottom: 1px solid rgba(103,103,103,0.31)

  div
    font-size: 26px
    line-height: 28px

  &-name
    width: 55%
    margin: auto 0

  &-amount
    width: 15%
    margin: auto 0

  &-quantity
    width: 15%
    margin: auto 0

  &-subtotal
    width: 15%
    margin: auto 0

.header
  position: fixed
  z-index: 10
  width: $modal-width + $modal-padding * 2
  // max-height: 120px
  box-shadow: 0px 1px 2px 0px #cacaca

  &-top
    background-color: #fc0
    padding: $modal-padding
    padding-bottom: 0

  &-row
    width: $modal-width
    height: $header-row-height
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

  &-month-total
    width: 30%

  &-legend
    font-size: 22px
    line-height: 24px
    font-weight: 600
    padding: 4px 16px
    background-color: #f6f6f6

.main
  overflow: scroll
  margin-top: 136px
  z-index: 1
  padding: 0 16px

  .list-item
    width: 100%

</style>
