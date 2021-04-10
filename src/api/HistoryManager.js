import firebase from '../firebase'
// import UserManagerApi from './UserManager'

class HistoryManagerApi {
  constructor() {
    this.firestore = firebase.firestore()
    this.historyCollection = this.firestore.collection('transactions')
  }

  async addPurchaseHistory(user, cart) {
    var time = this.getTimeStamp()
    var data = {
      timestamp: time,
      user: user.id,
      type: "purchase",
      value: -this.getTotalValue(cart.items)
    }

    var id = ""
    // append history
    await this.historyCollection.add(data).then((ref) => {
      // add items data to history
      var itemsCollection = ref.collection("items")
      for (var itemId in cart.items) {
        var theItem = cart.items[itemId]
        var itemData = {
          id: itemId,
          name: theItem.item.name,
          amount: theItem.item.amount,
          quantity: theItem.quantity,
          subtotal: theItem.item.amount * theItem.quantity
        }
        itemsCollection.add(itemData)
      }
      id = ref.id
    })
    return id
  }

  async addSetValueHistory(user, value) {
    var time = this.getTimeStamp()
    var diff = value - user.balance
    var data = {
      timestamp: time,
      user: user.id,
      type: "set",
      value: diff
    }

    await this.historyCollection.add(data)
  }

  async getUsersHisoryDocs(user, limit=1) {
    let userHistoryRef = this.historyCollection.where("user", "==", user.id).orderBy("timestamp", "desc")
    return await userHistoryRef.limit(limit).get().then(snapshot => {
      let docs = []
      snapshot.forEach(doc => {
        if (doc.get("type") === "revert" || doc.get("reverted") == true) {
          return
        }
        docs.push(doc)
      })
      return docs
    })
  }

  async getUsersMonthHistory(user=null, date_from=null, date_to=null) {
    // month, dayは 0から始まる (1月 → 0)
    // let date_from = new Date(year, month - 1, 0, 0, 0, 0, 0)

    // let date_to = new Date(date_from)
    // date_to.setMonth(date_to.getMonth() + 1)
    let historyRef
    if(user != null){
      historyRef = this.historyCollection.where("user", "==", user.id).orderBy("timestamp", "desc")
    }else{
      historyRef = this.historyCollection.orderBy("timestamp", "desc")
    }

    if(date_from != null){
      // console.log("date from:", date_from)
      let timestamp_from = new firebase.firestore.Timestamp.fromDate(date_from)
      historyRef = historyRef.where("timestamp", ">=", timestamp_from)
    }
    if(date_to != null){
      // console.log("date tom:", date_to)
      let timestamp_to = new firebase.firestore.Timestamp.fromDate(date_to)
      historyRef = historyRef.where("timestamp", "<", timestamp_to)
    }

    const self = this
    return await historyRef.get().then(async function(snapshot) {
      if (snapshot.empty) {
        return null
      }

      // console.log("number of histories:", snapshot.size)
      let history = []
      // _Doc2data→dataのhistory追加を同期で行うために関数定義
      async function doc2data(doc){
        await self._Doc2Data(doc).then(data => {
          history.push(data)
        })
      }

      let promisses = []
      snapshot.forEach(doc => {
        // console.log(doc)
        if (doc.get("type") === "revert" || doc.get("reverted") == true) {
          // console.log("revert or reverted.")
          return
        }
        promisses.push(doc2data(doc))
      })
      return await Promise.all(promisses).then(function() {
        // console.log("history:", history)
        return history
      })
    })
  }

  async revertUserHistory(user) {
    await this.getUsersHisoryDocs(user, 20).then(docs => {
      if (docs.length == 0) {
        console.log("no history")
        return
      }

      let historyId = ""
      let data = {}
      let doc = docs[0]
      historyId = doc.id
      data = doc.data()

      doc.ref.update({ "reverted": true })

      // ユーザーの残高をrevert
      user.balance -= data["value"]

      var revertData = {}
      revertData["timestamp"] = this.getTimeStamp()
      revertData["type"] = "revert"
      revertData["value"] = -data["value"]
      revertData["user"] = user.id
      revertData["from"] = historyId

      return this.historyCollection.add(revertData)
    })
  }

  async getById(id) {
    var historyDoc = this.historyCollection.doc(id)
    var data = {}
    await historyDoc.get().then((snapshot) => {
      data = snapshot.data()

      if (data["type"] === "purchase") {
        data["items"] = {}
        historyDoc.collection("items").get().then((snapshots) => {
          snapshots.forEach((item) => {
            data.items[item.id] = item.data()
          })
        })
      }
    })

    return data
  }

  async _Doc2Data(doc) {
    let data = doc.data()
    if (data["type"] === "purchase") {
      let items = []
      // data.items = []
      return await doc.ref.collection("items").get().then((snapshots) => {
        snapshots.forEach((item) => {
          items.push(item.data())
        })
        // console.log("doc items:", items)
        data.items = items
        return data
      })
    }
    return data
  }

  getTimeStamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }

  getTotalValue(items) {
    var sum = 0
    for (var itemId in items) {
      var theItem = items[itemId]
      sum += theItem.item.amount * theItem.quantity
    }
    return sum
  }
}

export default {
  HistoryManager: new HistoryManagerApi()
}
