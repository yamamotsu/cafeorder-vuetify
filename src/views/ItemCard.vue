<template>
  <v-card
    light
    :loading="loading"
    @click="onClick" :ripple="!isEditable && !isPrefab">
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
      <div @click="selectImageFile()" v-show="isEditMode">
        <v-overlay absolute :value="isEditMode">
          <v-icon x-large>mdi-camera</v-icon>
        </v-overlay>
      </div>
    </v-img>

    <!-- Item Summary -->
    <div v-if="!isEditMode">
      <v-card-title class="grey--text text-h5 px-3 pt-3 pb-0">{{ item.name }}</v-card-title>
      <!-- <v-card-subtitle>a</v-card-subtitle> -->
      <v-card-text class="primary--text text-h5 px-3 pb-3">
        <div class="amount-display">
          <p class="primary--text text-h5">¥</p>
          <h3 class="primary--text text-h4 ma-0 ml-1">{{ item.amount }}</h3>
        </div>
      </v-card-text>
    </div>

    <!-- edit form -->
    <v-form ref="form" v-else class="px-2 pt-2">
      <!-- 非表示のfileインプット -->
      <input
        type="file"
        style="display:none"
        ref="input"
        accept="image/jpeg, image/jpg, image/png"
        @change="e => onSelectImage(e)"/>

      <v-text-field
        dense
        filled
        hide-details="auto"
        label="Item Name"
        :rules="nameRules"
        v-model="newItem.name"/>
      <v-text-field
        class="mt-2"
        dense
        filled
        hide-details="auto"
        label="Value"
        :rules="nameRules"
        type="Number"
        v-model="newItem.amount"/>
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

export default {
  name: "ItemCard",
  data: function() {
    return {
      isEditMode:false,
      thumbnailImage: null,
      loading: false,
      newItem: {
        name: "",
        amount: "",
        imageUrl: ""
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
  props: ["item", "user", "isEditable", "isPrefab", "count"],
  mounted () {
    this.newItem = Object.assign({}, this.item)
    if(this.isPrefab) {
      this.isEditMode = true
    }
  },
  methods: {
    onClick: function() {
      if (this.isEditable) return
      this.$emit("selected", this.item)
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
      if(this.thumbnailImage != null){
        console.log("update thumbnail image:", this.thumbnailImage)
        await UploaderApi.Uploader.uploadImageFile(this.thumbnailImage, "itemImages", null).then(value => {
          this.newItem.imageUrl = value['url']
          this.item.imageUrl = value['url']
        })
      }
      if(this.isPrefab){
        await ItemManager.addItem(this.newItem).then(item => {
          console.log("new item:", item)
          this.newItem.id = item.id
          this.item.id = item.id
          // this.$set(this.items, item.id, item)
          this.$emit('created', this.item)
        })
        this.showSnackBar("商品:"+this.item.name+" の追加が完了しました．")
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
    onSelectImage(e) {
      const file = e.target.files[0]
      console.log('selected local image:', file)
      const localURL = window.URL.createObjectURL(file)
      console.log(' > URL', localURL)
      this.newItem.imageUrl = localURL
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
