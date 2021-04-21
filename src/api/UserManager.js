import firebase from '../firebase'
import AdminAuth from './AdminAuth'

class UserManagerApi {
  constructor() {
    this.database = firebase.firestore()
    this.usersCollection = this.database.collection('users')
    this.authUsersCollection = this.database.collection('authUsers')
    this.userFavItems = {}
    this.users = null
    this.authUsers = null
    this.currentUser = null
  }

  async getAllUsers(forceReflesh=false) {
    if(forceReflesh == false && this.users != null) return this.users

    this.users = {}
    await this.usersCollection.orderBy("name", "asc").get().then(
      (snapshots) => {
        snapshots.forEach((user) => {
          this.users[user.id] = user.data()
          this.users[user.id]["id"] = user.id
        })
      }
    )
    return this.users
  }

  async getAllAuthUsers(forceReflesh=false){
    if(forceReflesh == false && this.authUsers != null) return this.authUsers

    this.authUsers = {}
    await this.authUsersCollection.get().then(
      snapshots => {
        snapshots.forEach(authUser => {
          this.authUsers[authUser.id] = authUser.data()
        })
      }
    )
    return this.authUsers
  }

  async getUserFromAuthUID(authUID) {
    const snapshot = await this.authUsersCollection.doc(authUID).get()
    if(!snapshot.exists) {
      console.error("`UserID` was not found which has authUID:", authUID)
      return null
    }
    const userId = snapshot.data().user
    console.log('authuser:', authUID, ' userId:', userId)
    const userSnapshot = await this.usersCollection.doc(userId).get()
    if(!userSnapshot.exists) {
      console.error("User was not found of user-id:", userId)
      return null
    }
    let user = userSnapshot.data()
    user.id = userSnapshot.id

    return user
  }

  async getAuthUser(forceReflesh=false) {
    if(forceReflesh == false && this.currentUser != null) return this.currentUser

    const auth = await AdminAuth.Auth.getUser()
    // console.log('auth:', auth)
    this.currentUser = await this.getUserFromAuthUID(auth.uid)
    return this.currentUser
  }

  setCurrentUser(userId) {
    this.currentUser = this.users[userId]
  }
  async getCurrentUser() {
    if(this.currentUser) return this.currentUser
    return await this.getAuthUser()
  }

  exists(user)
  {
    return this.users[user.id] != null
  }

  async addUser(user) {
    if (this.exists(user))
    {
      console.warn("the user is already exists.")
      console.warn(" > user: " + user.name)
      return user
    }
    // create new document on the db and get the reference
    const newRef = this.usersCollection.doc()
    const id = newRef.id
    let newUser = user
    newUser.id = id
    await newRef.set(newUser)
    this.users[id] = newUser
    return newUser
  }

  async overwriteCurrentUser(data) {
    await this.usersCollection.doc(this.currentUser.id).set(data)
    this.currentUser = data
    if(this.users) {
      this.users[this.currentUser.id] = data
    }
    return this.currentUser
  }

  async overwriteUser(user) {
    const userDoc = this.usersCollection.doc(user.id)
    await userDoc.set(user)

    this.users[user.id] = user
    return this.users
  }

  removeUser(user) {
    this.usersCollection.doc(user.id).delete()
    delete this.users[user.id]
    return this.users
  }

  unableUser(user) {
    user.enable = false
    this.usersCollection.doc(user.id).set(user)
    delete this.users[user.id]
    return this.users
  }

  async setFavItem(itemId, value){
    if (this.currentUser.favorites == undefined) {
      this.currentUser.favorites = {}
    }
    this.currentUser.favorites[itemId] = value
    await this.usersCollection.doc(this.currentUser.id).update(this.currentUser)
    return this.currentUser
  }
}

export default {
  UserManager: new UserManagerApi()
}
