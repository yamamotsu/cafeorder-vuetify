import firebase from '../firebase'

class AdminAuth {
  constructor () {
    this.user = null
  }

  async loginWithGoogle () {
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
    await firebase.auth().signOut()
    this.user = null
    return null
  }
}

export default {
  Auth: new AdminAuth()
}
