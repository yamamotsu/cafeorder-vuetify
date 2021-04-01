import firebase from '../firebase';
import HistoryManagerApi from './HistoryManager';
import ItemManager from './ItemManager';


class UserManagerApi {
  constructor() {
    this.database = firebase.firestore();
    this.usersCollection = this.database.collection('users');
    this.userFavItems = {};
  }

  async getAllUsers() {
    this.users = {};
    await this.usersCollection.orderBy("name", "asc").get().then(
      (snapshots) => {
        snapshots.forEach((user) => {
          // this.users.push(user.data())
          this.users[user.id] = user.data();
          this.users[user.id]["id"] = user.id;
        });
      }
    );
    return this.users;
  }

  exists(user)
  {
    return this.users[user.id] != null;
  }

  async addUser(user) {
    if (this.exists(user))
    {
      console.log("ERR: the user is already exists.");
      console.log("  user: " + user.name);
      return this.users;
    }
    await this.usersCollection.add(user).then((ref) => {
      this.users[ref.id] = user;
      this.users[ref.id].id = ref.id;
      this.usersCollection.doc(ref.id).set(this.users[ref.id]);
    });
    return this.users;
  }

  async overwriteUser(user) {
    var userDoc = this.usersCollection.doc(user.id);
    await userDoc.set(user);

    this.users[user.id] = user;
    return this.users;
  }

  removeUser(user) {
    this.usersCollection.doc(user.id).delete();
    delete this.users[user.id];
    return this.users;
  }

  unableUser(user) {
    user.enable = false;
    this.usersCollection.doc(user.id).set(user);
    delete this.users[user.id];
    return this.users;
  }

  async fetchFavoriteItems(user, all_items, n_purchased=5) {
    let now = new Date(Date.now());
    let tommorow = new Date(now).setDate(now.getDate()+1);
    if(user.id in this.userFavItems){
      if(this.userFavItems[user.id].timestamp < tommorow){
        console.log("favitems already exists on local");
        return this.userFavItems[user.id].value;
      }else{
        console.log("old favitems found on local. fetching from db..");
      }
    }else{
      console.log("favitems not found on local");
    }

    let date_now = new Date(now.getFullYear(), now.getMonth());
    let date_from = new Date(date_now);
    let date_to = new Date(date_now);
    // 3ヶ月前から今月まで
    date_from.setMonth(date_now.getMonth()-2);
    date_to.setMonth(date_now.getMonth()+1);

    let self = this;
    let items_dict = {};
    let favitems_dict = {};
    return await HistoryManagerApi.HistoryManager.getUsersMonthHistory(
      user,
      date_from,
      date_to
    ).then(history => {
      if (!history){
        return []
      }
      history.forEach(record => {
        if(record.type==="purchase"){
          record.items.forEach(item => {
            const id = ItemManager.getIdFromItem(item);
            if(id in items_dict){
              items_dict[id].quantity += item.quantity;
            }else{
              items_dict[id] = item;
            }
          });
        }else{
          // console.log("record type is not purchase");
        }
      });
      // all_itemsのうちよく購入されているものをfavitems_dictに登録
      Object.keys(items_dict).forEach(id => {
        if(items_dict[id].quantity < n_purchased){
          return;
        }
        favitems_dict[id] = all_items[id];
      });
      // favitems_dictをリスト化・購入数の降順で並べ替え
      let favitems_list = Object.values(favitems_dict).sort(function(a,b){
        if(a.quantity > b.quantity) return -1;
        if(a.quantity < b.quantity) return 1;
        return 0;
      });
      favitems_list = favitems_list.slice(0, 5);
      self.userFavItems[user.id] = {
        "user": user.id,
        "value": favitems_list,
        "timestamp": new Date(Date.now())
      };
      return favitems_list;
    });
  }
}

export default {
  UserManager: new UserManagerApi()
}
