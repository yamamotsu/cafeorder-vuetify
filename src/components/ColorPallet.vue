<template>
  <div class="color-pallet">
    <div class="each-color-grid">
      <div class="each-color"
        v-for="(color, key) in colors"
        :key="color.id"
        :style="{backgroundColor:color}"
        @click="$emit('colorSelected', key)">
      </div>
    </div>
  </div>
</template>

<script>
import Colors from '../api/Colors'

export default {
  data: function () {
    return {
      colors: Colors.colortable
    }
  }
}
</script>

<style lang="sass" scoped>

.color-pallet
  max-width: 100%
  padding: 8px
  width: max-content
  background-color: #fcfcfc
  border-radius: 4px
  border: 2px solid rgb(44, 62, 80)
  position: relative


.each-color-grid
  display: grid
  grid-template-columns: 24px 24px 24px 24px
  gap: 3px


.each-color
  display:block
  width: 20px
  height: 20px
  border-radius: 12px
  border: 2px solid


.each-color:hover
  cursor: pointer

</style>
