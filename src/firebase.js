import * as _firebase from 'firebase/app'
// let firebase = require('firebase/app')
import firebaseConfig from './firebase-config'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

const firebase = _firebase.default
console.log(firebase)
firebase.initializeApp(firebaseConfig.config)
// if(location.hostname === 'localhost'){
//   firebase.firestore().useEmulator("localhost", 8080);
// }

export default firebase
