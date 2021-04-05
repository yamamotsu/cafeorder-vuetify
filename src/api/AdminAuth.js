import firebase from '../firebase'
import config from '../config'

class AdminAuth {
  constructor () {
    this.user = null
  }

  async loginWithGoogle () {
    if(config.ignoreAdmin) {
      console.warn("`config.ignoreAdmin` is set to true. DONT SET THIS FOR PRODUCTION VERSION.")
      return
    }
    // ログイン済みの場合そのままuserを返す
    if (firebase.auth().currentUser) {
      this.user = firebase.auth().currentUser
      return this.user
    }
    const result = await firebase.auth().getRedirectResult()
    if (result.credential) {
      this.user = result.user
      return this.user
    } else {
      console.log('redirecting to sign-in page')
      return firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider())
    }
  }

  async logout () {
    if(config.ignoreAdmin) return
    await firebase.auth().signOut()
    this.user = null
    return null
  }
}

export default {
  Auth: new AdminAuth()
}
