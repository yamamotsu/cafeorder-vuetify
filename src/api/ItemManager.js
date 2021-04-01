import firebase from '../firebase'

class ItemManagerApi {
  constructor() {
    this.database = firebase.firestore();
    this.itemsCollection = this.database.collection('items');
    this.lastUpdateTime = null;
  }

  async getAllItems(forceReload=false) {
    console.log("last update time:", this.lastUpdateTime);
    // 強制リロードモードでなく，かつ一度ロードしたことがあれば，
    // 最低一日に一度DBと同期
    if (!forceReload && this.lastUpdateTime != null){
      let date = new Date(this.lastUpdateTime);
      date.setDate(date.getDate()+1); //1日後
      if(Date.now() < date){
        console.log("return local items");
        return this.items;
      }
    }
    console.log("force/initial update mode or daily update.");
    this.items = {};
    await this.itemsCollection.get().then(
      (snapshots) => {
        snapshots.forEach((item) => {
          const data = item.data();
          const id = item.id;
          this.items[id] = data;
          this.items[id].id = id;
        }
        );
        this.lastUpdateTime = new Date(Date.now());
      }
    );
    return this.items;
  }

  async addItem(item) {
    // this.itemsCollection.doc(item.name).set(item);
    return await this.itemsCollection.add(item).then((ref) => {
      this.items[ref.id] = item;
      this.items[ref.id].id = ref.id;
      this.itemsCollection.doc(ref.id).update('id', ref.id);
      return this.items[ref.id];
    });
  }

  getIdFromItem(item) {
    if('id' in item){
      return item.id;
    }
    else {
      const index = Object.values(this.items).findIndex(i => (i.name === item.name || i.id === item.name));

      if (index == -1){
        console.error("item:"+item.name+" was not found.");
        return -1;
      }
      return Object.keys(this.items)[index];
    }
  }

  deleteItem(item) {
    this.itemsCollection.doc(item.id).delete();
    delete this.items[item.id];
    return this.items;
  }

  unableItem(item) {
    this.items[item.id].enable = false;
    this.itemsCollection.doc(item.id).update('enable', false);
    // delete this.items[item.id];
    return this.items;
  }
  enableItem(item) {
    this.items[item.id].enable = true;
    this.itemsCollection.doc(item.id).update('enable', true);
    // this.items[item.id] = item;
    return this.items;
  }

  overwriteItem(item) {
    this.itemsCollection.doc(item.id).set(item);
    this.items[item.id] = item;
    return this.items;
  }
}

const ItemManager = new ItemManagerApi()
export default ItemManager
