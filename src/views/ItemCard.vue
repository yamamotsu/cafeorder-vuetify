<template>
  <div class="item-card mdl-cell mdl-cell--2-col" v-if="item.enable||isAdmin"
    :class="{disabled: !item.enable&&isAdmin}">
    <card>
      <div class="card-main" @click="onClick">
        <!-- <div class="card-spacer"></div> -->
        <div class="card-thumbnail"
          :style="{backgroundImage: 'url('+item.imageUrl+')'}">
          <!-- 非表示のinputタグ -->
          <input type="file" style="display:none" ref="input" accept="image/jpeg, image/jpg, image/png" @change="e => thumbnailImage = e.target.files[0]">
          <div v-show="isEdit" class="card-thumbnail-overlay">
            <toolbar-icon
                class="select-image-icon"
                @click="selectImageFile()"
                :iconSize="72"
                :padding="4"
                :borderRadius="4"
                >
                photo_library
              </toolbar-icon>
          </div>
        </div>
        <div class="item-summary">
          <div class="item-edit" v-if="isEdit">
            <input class="input h3" type="text" v-model="newItem.name" placeholder="Name"/>
            <input class="input h3" type="text" v-model="newItem.amount" placeholder="Amount"/>
            <div class="toolbar">
              <toolbar-icon
                @click="resetNewItem()"
                :iconSize="32"
                :padding="4"
                :borderRadius="4"
                >
                cancel
              </toolbar-icon>
              <toolbar-icon
                @click="apply()"
                :iconSize="32"
                :padding="4"
                :borderRadius="4"
                >
                done
              </toolbar-icon>
            </div>
          </div>
          <div v-else>
            <h2>{{item.name}}</h2>
            <h3 class="item-amount">¥{{item.amount}}</h3>
          </div>
          <!-- <h3>Stocks {{item.stocks}}</h3> -->
        </div>
      </div>
      <div class="divider"/>
      <div class="toolbar"
        v-if="isAdmin">
        <toolbar-icon
          class="danger-icon"
          v-if="item.enable"
          @click="$emit('remove', item)"
          :iconSize="32"
          :padding="4"
          :borderRadius="4"
          >
          visibility_off
        </toolbar-icon>
        <toolbar-icon
          class="danger-icon"
          v-if="!item.enable"
          @click="$emit('enable', item)"
          :iconSize="32"
          :padding="4"
          :borderRadius="4"
          >
          visibility
        </toolbar-icon>
        <toolbar-icon
          class="danger-icon"
          @click="isEdit = !isEdit"
          :iconSize="32"
          :padding="4"
          :borderRadius="4"
          >
          edit
        </toolbar-icon>
      </div>
    </card>
  </div>
</template>

<script>
import Vue from "vue"
import Card from "../components/Card"
import Icon from "../components/Icon"

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
      }
    }
  },
  props: ["item", "user", "isAdmin"],
  mounted () {
    this.resetNewItem()
  },
  methods: {
    onClick: function() {
      if (this.isAdmin) return
      this.$emit("selected", this.item)
    },
    async apply () {
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
    resetNewItem() {
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

Vue.component("card", Card)
Vue.component("icon", Icon)
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
