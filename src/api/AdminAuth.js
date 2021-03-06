import firebase from '../firebase'
import config from '../config'

class AdminAuth {
  constructor () {
    this.user = null
  }

  async loginWithGoogle () {
    if(config.ignoreAuth) {
      console.warn("`config.ignoreAuth` is set to true. DONT SET THIS FOR PRODUCTION VERSION.")
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

  async getUser (forceReflesh=false) {
    if(!forceReflesh && this.user != null) return this.user
    return await this.loginWithGoogle()
  }

  async logout () {
    if(config.ignoreAuth) return
    await firebase.auth().signOut()
    this.user = null
    return null
  }
}

export default {
  Auth: new AdminAuth()
}
