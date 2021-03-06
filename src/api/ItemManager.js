import firebase from '../firebase'

class ItemManagerApi {
  constructor() {
    this.database = firebase.firestore()
    this.itemsCollection = this.database.collection('items')
    this.categoriesCollection = this.database.collection('categories')
    this.lastUpdateTime = null
    this.categories = {}
  }

  async getAllItems(forceReload=false) {
    console.log("last update time:", this.lastUpdateTime)
    // 強制リロードモードでなく，かつ一度ロードしたことがあれば，
    // 最低一日に一度DBと同期
    if (!forceReload && this.lastUpdateTime != null){
      let date = new Date(this.lastUpdateTime)
      date.setDate(date.getDate()+1); //1日後
      if(Date.now() < date){
        console.log("return local items")
        return this.items
      }
    }
    console.log("force/initial update mode or daily update.")
    this.items = {}
    await this.itemsCollection.get().then(
      (snapshots) => {
        snapshots.forEach((item) => {
          const data = item.data()
          const id = item.id
          this.items[id] = data
          this.items[id].id = id
        }
        )
        this.lastUpdateTime = new Date(Date.now())
      }
    )
    await this.getAllCategories()
    return this.items
  }

  async getAllCategories() {
    await this.categoriesCollection.get().then(
      snapshots => {
        snapshots.forEach(cat => {
          const data = cat.data()
          const id = cat.id
          this.categories[id] = data
        })
      }
    )
    console.log('all categories:', Object.keys(this.categories))
    return this.categories
  }

  async addItem(item) {
    // create new document on the db and get the reference
    const newRef = this.itemsCollection.doc()
    const id = newRef.id
    let newItem = item
    newItem.id = id
    await newRef.set(newItem)
    this.items[id] = newItem
    return newItem
  }

  getIdFromItem(item) {
    if('id' in item){
      return item.id
    }
    else {
      const index = Object.values(this.items).findIndex(i => (i.name === item.name || i.id === item.name))

      if (index == -1){
        console.error("item:"+item.name+" was not found.")
        return -1
      }
      return Object.keys(this.items)[index]
    }
  }

  deleteItem(item) {
    this.itemsCollection.doc(item.id).delete()
    delete this.items[item.id]
    return this.items
  }

  setEnableItem(item, state){
    this.items[item.id].enable = state
    this.itemsCollection.doc(item.id).update('enable', state)
    return this.items
  }

  overwriteItem(item) {
    this.itemsCollection.doc(item.id).set(item)
    this.items[item.id] = item
    return this.items
  }
}

const ItemManager = new ItemManagerApi()
export default ItemManager
