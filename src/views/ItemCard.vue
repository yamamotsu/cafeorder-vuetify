<template>
  <v-card @click="onClick" :ripple="!isAdmin">
    <v-card-actions
      class="pa-0"
      :class="{secondary:item.enable, 'grey lighten-2':!item.enable}"
      v-if="isAdmin">
      <v-spacer></v-spacer>
      <v-switch
        inset dense
        hide-details="true"
        class="mr-0 mt-0"
        v-model="item.enable"/>
    </v-card-actions>

    <v-img height="200" :src="item.imageUrl">
      <!-- 非表示のfileインプット -->
      <input type="file" style="display:none" ref="input" accept="image/jpeg, image/jpg, image/png" @change="e => thumbnailImage = e.target.files[0]">

      <div @click="selectImageFile()" v-show="isEdit">
        <v-overlay absolute :value="isEdit">
          <v-icon x-large>mdi-camera</v-icon>
        </v-overlay>
      </div>
    </v-img>

    <div v-if="!isEdit">
      <v-card-title>{{ item.name }}</v-card-title>
      <v-card-subtitle>{{ item.amount }}</v-card-subtitle>
    </div>

    <!-- edit form -->
    <div v-else class="px-2 pt-2">
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
    </div>

    <div v-if="isAdmin">
      <v-divider class="my-0 mx-2"/>
      <v-card-actions>
        <v-spacer/>
        <v-btn icon
          @click="isEdit=!isEdit">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script>
import ItemManager from "@/api/ItemManager"
import UploaderApi from "../api/Uploader"

export default {
  name: "ItemCard",
  data: function() {
    return {
      isEdit:false,
      thumbnailImage: null,
      newItem: {
        name: "",
        amount: "",
        imageUrl: ""
      },
      nameRules: [
        value => !!value || 'Required'
      ]
    }
  },
  props: ["item", "user", "isAdmin"],
  mounted () {
    this.newItem = Object.assign({}, this.item)
  },
  methods: {
    onClick: function() {
      if (this.isAdmin) return
      this.$emit("selected", this.item)
    },
    async finishEditMode () {
      this.item.name = this.newItem.name
      this.item.amount = this.newItem.amount
      if(this.thumbnailImage != null){
        console.log("update thumbnail image:", this.thumbnailImage)
        await UploaderApi.Uploader.uploadImageFile(this.thumbnailImage, "itemImages", null).then(value => {
          this.newItem.imageUrl = value['url']
          this.item.imageUrl = value['url']
        })
      }
      await ItemManager.overwriteItem(this.item)
      this.isEdit = false
      this.thumbnailImage = null
    },
    cancelEditMode() {
      this.newItem = Object.assign({}, this.item)
      this.isEdit = false
      this.thumbnailImage = null
    },
    selectImageFile() {
      this.$refs.input.click()
    },
  },
  computed: {
  }
}

</script>

<style lang="sass" scoped>
.card-spacer
  margin-top: auto

.disabled
  opacity: 0.4

.divider
  width:100%
  height: 0px
  border-top: 0.8px solid #6767674f

.toolbar
  display: flex
  flex-direction: row
  padding: 8px
  // border-top: 0.8px solid #6767674f

.card-thumbnail
  height: 200px
  background-size: cover
  background-position: center
  background-clip:padding-box

  &-overlay
    width: 100%
    height: 100%
    background-color: #5a5a5a
    opacity: 0.6
    display:flex

.select-image-icon
  color: #fff
  margin: auto

.card-thumbnail:hover
  cursor: pointer

@media (max-height: 480px)
  .card-thumbnail
    height: 140px

.item-summary
  padding: 14px 5px
  // margin: 0px 5px
  border-top: 0.8px solid #6767674f

.item-card.mdl-cell h2, h3
  /* font-family: 'Avenir', Arial, Helvetica, sans-serif */
  font-family: 'Nunito', 'M PLUS Rounded 1c', sans-serif
  color: #2c3e50

.item-amount
  font-weight: bold

.item-edit
  input
    max-width: 100%
    -webkit-box-sizing: border-box
    box-sizing: border-box
    border: 1px solid rgba(105, 105, 105, 0.6)
    border-radius: 4px
    background-color: rgba(250, 250, 250, 0.8)
    padding: 8px 10px

h2
  font-size: 28px
  line-height: 32px
  margin: 8px auto
  font-weight: 600


h3, .h3
  font-size: 24px
  margin: 6px auto
  font-weight: 400
  line-height: 26px


</style>
