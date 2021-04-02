import firebase from 'firebase/app'
import firebaseConfig from './firebase-config'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

console.log(firebase)
firebase.initializeApp(firebaseConfig.config)

if(location.hostname === 'localhost'){
  firebase.firestore().useEmulator("localhost", 8080)
  // firebase.auth().useEmulator("http://localhost:9099")
}

export default firebase
