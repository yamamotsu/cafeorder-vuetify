<template>
  <v-card
    light
    :loading="loading"
    @click="onClick()" :ripple="!isEditable && !isPrefab">
    <v-card-actions
      class="py-0"
      :class="{secondary:item.enable, 'grey lighten-2':!item.enable}"
      v-if="isEditable">
      <v-switch
        inset dense
        hide-details="true"
        class="mx-0 my-0"
        @change="state => $emit('switched', state)"
        v-model="item.enable"/>
      <v-spacer></v-spacer>
      <v-btn icon
        color="primary" class="ml-1"
        @click="isEditMode=!isEditMode">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </v-card-actions>

    <v-img height="200" :src="isEditMode ? newItem.imageUrl : item.imageUrl">
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey lighten-1"
          ></v-progress-circular>
        </v-row>
      </template>
      <div @click="selectImageFile()" v-show="isEditMode">
        <v-overlay absolute :value="isEditMode">
          <v-icon x-large>mdi-camera</v-icon>
        </v-overlay>
      </div>
    </v-img>

    <!-- Item Summary -->
    <div v-if="!isEditMode && !isPrefab">
      <v-chip-group column class="py-0 px-2">
        <v-chip small outlined :ripple="false"
          v-if="category!=undefined"
          :color="category.color">{{ category.name }}</v-chip>
      </v-chip-group>
      <v-card-title class="grey--text text-h5 px-3 pt-0 pb-0">{{ item.name }}</v-card-title>
      <v-card-text class="primary--text text-h5 px-3 pb-3 pt-3">
        <div class="amount-display">
          <p class="primary--text text-h5">¥</p>
          <h3 class="primary--text text-h4 ma-0 ml-1">{{ item.amount }}</h3>
        </div>
      </v-card-text>
    </div>

    <!-- edit form -->
    <v-form ref="form" v-else class="px-2 pt-0">
      <!-- ヘッダ部分クリックで作動する，非表示のfileインプット -->
      <input
        type="file"
        style="display:none"
        ref="input"
        accept="image/jpeg, image/jpg, image/png"
        @change="e => onSelectImage(e.target.files[0])"/>
      <v-text-field
        class="pt-4"
        dense
        hide-details="auto"
        label="画像URL"
        append-icon="mdi-cloud-upload"
        v-model="newItem.imageUrl"
        :rules="nameRules"
        @click:append="$refs.input.click()"
        />
      <v-divider v-show="isEditMode"/>
      <v-text-field
        class="mt-2"
        dense
        filled
        hide-details="auto"
        label="商品名"
        :rules="nameRules"
        v-model="newItem.name"/>
      <v-text-field
        dense
        filled
        hide-details="auto"
        label="価格"
        :rules="nameRules"
        type="Number"
        :value="newItem.amount"
        @input="val => onAmountInput(val)"/>
      <v-select filled dense
        v-model="newItem.category"
        :items='categoriesList'
        label="カテゴリー"
        >
      </v-select>
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
    </v-form>

    <!-- snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.duration">
      {{ snackbar.text}}
    </v-snackbar>
  </v-card>
</template>

<script>
import ItemManager from "@/api/ItemManager"
import UploaderApi from "../api/Uploader"
import Utils from "../api/Util"

export default {
  name: "ItemCard",
  data () {
    return {
      isEditMode:false,
      thumbnailImage: null,
      loading: false,
      newItem: {
        name: "",
        amount: 100,
        imageUrl: "",
        category: ""
      },
      snackbar: {
        show: false,
        snackbarText: "",
        duration: 1000
      },
      nameRules: [
        value => !!value || 'Required'
      ],
    }
  },
  props: ["item", "user", "isEditable", "isPrefab", "categories"],
  mounted () {
    this.newItem = Object.assign({}, this.item)
    if(this.isPrefab) {
      this.isEditMode = true
    }
  },
  methods: {
    onClick () {
      if (this.isEditable) return
      this.$emit("click", this.item)
    },
    onAmountInput(val) {
      this.newItem.amount = Utils.str2Int(val)
    },
    async finishEditMode () {
      if(!this.$refs.form.validate()){
        this.showSnackBar("不正な入力です")
        return
      }
      if(!this.newItem.imageUrl){
        this.showSnackBar("画像を選択してください")
        return
      }

      this.loading = true
      this.item.name = this.newItem.name
      this.item.amount = this.newItem.amount
      this.item.imageUrl = this.newItem.imageUrl
      this.item.category = this.newItem.category
      if(this.isPrefab){
        await ItemManager.addItem(this.newItem).then(item => {
          console.log("new item:", item)
          this.newItem.id = item.id
          this.item.id = item.id
          // this.$set(this.items, item.id, item)
          this.$emit('created', this.item)
        })
      }
      else{
        await ItemManager.overwriteItem(this.item)
        this.showSnackBar("商品:"+this.item.name+" の情報を変更しました．")
      }

      this.loading = false
      this.isEditMode = false
      this.thumbnailImage = null
    },
    cancelEditMode() {
      this.newItem = Object.assign({}, this.item)
      this.isEditMode = false
      this.thumbnailImage = null
      this.$emit('cancelEdit')
    },
    async onSelectImage(file) {
      if(!file) {
        return
      }
      this.loading = true
      const storageInfo = await UploaderApi.Uploader.uploadImageFile(file, "itemImages", null)
      this.newItem.imageUrl = storageInfo['url']
      console.log(' > URL', this.newItem.imageUrl)
      this.loading = false
      this.thumbnailImage = file
    },
    selectImageFile() {
      this.$refs.input.click()
    },
    showSnackBar(message, duration=2000){
      this.snackbar.text = message
      this.snackbar.duration = duration
      this.snackbar.show = true
    },
  },
  computed: {
    categoriesList() {
      return Object.values(this.categories).sort((a, b) => a.order - b.order).map(
        value => {
          return {
            text: value.name,
            value: value.id
          }
        }
      )
    },
    category() {
      return this.categories[this.item.category]
    }
  }
}

</script>

<style lang="sass" scoped>

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
