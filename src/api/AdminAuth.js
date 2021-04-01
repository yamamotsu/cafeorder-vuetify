import firebase from '../firebase'

class AdminAuth {
  constructor () {
    this.user = null
  }

  async loginWithGoogle () {
    // ログイン済みの場合そのままuserを返す
    if (firebase.auth().currentUser) {
      this.user = firebase.auth().currentUser;
      return this.user
    }
    const result = await firebase.auth().getRedirectResult()
    if (result.credential) {
      this.user = result.user
      return this.user
    } else {
      return firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider())
    }
    // await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function (result) {
    //   // This gives you a Google Access Token. You can use it to access the Google API.
    //   // var token = result.credential.accessToken;
    //   // The signed-in user info.
    //   this.user = result.user;
    //   return this.user;
    // });
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
