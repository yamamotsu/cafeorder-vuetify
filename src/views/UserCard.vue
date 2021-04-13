<template>
    <v-card
      light
      class="user-card pa-0"
      :loading="loading"
      :style="{backgroundColor: user.color}"
      >
      <!-- action buttons -->
      <v-card-actions
        class="py-0"
        v-show="isEditable"
        :class="{secondary:user.enable, 'grey lighten-2':!user.enable}"
        >
        <v-switch
          inset dense
          hide-details="true"
          class="mx-0 my-0"
          v-model="user.enable"
          @change="updateUserDB(user)"/>
      </v-card-actions>

      <!-- edit form -->
      <v-form
        ref="form"
        class="pa-2"
        v-if="isEdit">
        <v-text-field
          dense
          filled
          hide-details="auto"
          label="名前"
          :rules="nameRules"
          v-model="newUser.name"/>
        <v-text-field
          class="mt-2"
          dense
          filled
          hide-details="auto"
          label="残高"
          :rules="amountRules"
          type="Number"
          :value="newUser.balance"
          @input="val => onBalanceInput(val)"
          />
        <v-chip-group column>
          <v-spacer/>
          <v-chip
            color="red lighten-1 white--text"
            @click="newUser.balance = parseInt(newUser.balance) + 5000">
            +5000
          </v-chip>
          <v-chip
            color="orange lighten-1 white--text"
            @click="newUser.balance = parseInt(newUser.balance) + 1000">
            +1000
          </v-chip>
        </v-chip-group>

        <v-toolbar flat dense color="transparent">
          <v-spacer/>
          <v-toolbar-items>
            <v-btn icon @click="cancelEditMode()"
              color="grey">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
            <v-btn icon @click="finishEditMode()"
              color="red accent-3">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </v-form>

      <!-- summary -->
      <div
        class="summary py-8 px-0"
        v-else
        v-ripple
        @click="$emit('click', user)">
        <v-card-text class="text-center text-h4 px-0 py-0"
          :style="{'color':getVisibleColor(colorTheme.name)}"
          v-text="user.name"/>
        <v-card-text class="primary--text text-h5 px-0 pt-3 pb-0">
          <div class="amount-display">
            <p class="text-h5"
              :style="{color:getVisibleColor(colorTheme.balance)}">
              {{ balanceSign }}
            </p>
            <h5 class="text-h5 ma-0 ml-0"
              :style="{color:getVisibleColor(colorTheme.balance)}">
              {{ user.balance | abs }}
            </h5>
          </div>
        </v-card-text>
      </div>

      <!-- action buttons -->
      <v-divider class="my-0 mx-2"/>
      <v-card-actions v-show="!isPrefab" @click="e => {e.preventDefault()}">
        <v-spacer/>
        <v-btn icon small
          :color="getVisibleColor(colorTheme.tooltip)"
          @click="isEdit = !isEdit">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
        <v-btn icon small
          :color="getVisibleColor(colorTheme.tooltip)"
          @click="isColorSelectMode = !isColorSelectMode">
          <v-icon>mdi-palette</v-icon>
        </v-btn>
        <v-btn icon small
          :color="getVisibleColor(colorTheme.tooltip)"
          @click="onUndoButtonClicked()">
          <v-icon>mdi-undo</v-icon>
        </v-btn>
        <v-btn icon small
          :color="getVisibleColor(colorTheme.tooltip)"
          @click="isShowHistory = true">
          <v-icon>mdi-history</v-icon>
        </v-btn>
        <v-spacer/>
      </v-card-actions>

      <!-- color picker -->
      <v-expand-transition>
        <v-color-picker
          :swatches="colorTable"
          hide-canvas
          hide-sliders
          hide-inputs
          hide-mode-switch
          show-swatches
          class="grey lighten-4"
          elevation="0"
          v-show="isColorSelectMode"
          :value="user.color"
          @input="color => onColorSelected(color)"
        />
      </v-expand-transition>

      <!-- history -->
      <v-bottom-sheet inset v-model="isShowHistory">
        <history :user="user"/>
      </v-bottom-sheet>

      <!-- snackbar -->
      <v-snackbar v-model="snackbar.show" :timeout="snackbar.duration">
        {{ snackbar.text}}
      </v-snackbar>
    </v-card>
</template>

<script>
import Vue from "vue"
import ColorUtil from "../api/Colors"
import colors from 'vuetify/lib/util/colors'
import HistoryManagerApi from "../api/HistoryManager"
import UserManagerApi from "../api/UserManager"
import HistoryView from "./UserHistoryView"
import Utils from "../api/Util"

Vue.component("history", HistoryView)

export default {
  name: "UserCard",
  data () {
    return {
      isColorSelectMode: false,
      isEdit: false,
      loading: false,
      snackbar: {
        show: false,
        snackbarText: "",
        duration: 1000
      },
      newUser: {},
      colorTheme: {
        name: this.$vuetify.theme.themes.light.primary,
        balance: colors.grey.darken1,
        tooltip: colors.grey.darken1,
      },
      isShowHistory: false,
      nameRules: [
        value => !!value || 'Required'
      ],
      amountRules: [
        value => typeof(value) != Number || '数値を入力してください',
      ],
      colorTable: [
        ["#FD7665", "#9BFD89", "#6F74FD", "#5a5a5a"],
        ["#FAB472", "#95FAD2", "#D17EFA", "#9a9a9a"],
        ["#FDDB68", "#8BDAFD", "#FD729F", "#ffffff"]
      ]
    }
  },
  props: ["user", "isEditable", "isPrefab"],
  computed: {
    balanceSign () {
      return this.user.balance >= 0 ? '+¥' : '-¥'
    },
  },
  mounted () {
    this.newUser =  Object.assign({}, this.user)
    if(this.isPrefab){
      this.isEdit = true
    }
  },
  filters: {
    abs (val) {
      return Math.abs(val)
    }
  },
  methods: {
    onColorSelected (color) {
      if(this.isPrefab) return
      if(this.user.color === color) return

      console.log('color selected:', color)
      this.user.color = color
      this.updateUserDB(this.user)
      this.isColorSelectMode = false
    },
    async onUndoButtonClicked () {
      const isUndo = confirm("Would you UNDO your last operation?")
      if (!isUndo) {
        return
      }

      await HistoryManagerApi.HistoryManager.revertUserHistory(this.user)
      await this.updateUserDB(this.user)
      this.showSnackBar("Undo completed")
    },
    onBalanceInput(val) {
      this.newUser.balance = Utils.str2Int(val)
    },
    showSnackBar(message, duration=2000){
      this.snackbar.text = message
      this.snackbar.duration = duration
      this.snackbar.show = true
    },
    async finishEditMode () {
      if(!this.$refs.form.validate()){
        this.showSnackBar("不正な入力です")
        return
      }

      this.loading = true
      if (!this.isPrefab && this.user.balance != this.newUser.balance) {
        await this.addSetBalanceHistory(this.newUser.balance, this.user.balance)
      }
      // this.user = Object.assign({}, this.newUser)
      this.user.name = this.newUser.name
      this.user.balance = this.newUser.balance

      if(this.isPrefab){
        console.log("adding new user:", this.newUser)
        const user = await UserManagerApi.UserManager.addUser(this.newUser)
        this.newUser.id = user.id
        this.user.id = user.id
        if(this.newUser.balance != 0){
          await this.addSetBalanceHistory(this.newUser.balance, 0)
        }
        this.$emit('created', this.user)
      }
      else{
        await this.updateUserDB(this.user)
        this.showSnackBar("ユーザー:"+this.user.name+"の情報を変更しました")
      }

      this.loading = false
      this.isEdit = false
    },
    cancelEditMode () {
      this.newUser = Object.assign({}, this.user)
      this.$emit('cancelEdit')
      this.isEdit = false
    },
    async updateUserDB (newUser) {
      await UserManagerApi.UserManager.overwriteUser(newUser)
    },
    async addSetBalanceHistory (newBalance, currentBalance=0) {
      const diff = newBalance - currentBalance
      await HistoryManagerApi.HistoryManager.addSetValueHistory(this.user, diff)
    },
    getVisibleColor(color, color2="#FFFFFF"){
      const diff1 = ColorUtil.getColorDiff(this.user.color, color)
      const diff2 = ColorUtil.getColorDiff(this.user.color, color2)
      return diff1 > diff2 ? color : color2
    }
  }
}

</script>

<style lang="sass" scoped>
.summary
  cursor: pointer

.amount-display
  display: block
  p
    line-height: 20px
    font-size: 18px
  h2, h3, h4, h5, p
    display: inline
    margin: auto 0 0 0
    vertical-align: baseline

</style>
