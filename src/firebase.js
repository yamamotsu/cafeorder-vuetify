import firebase from 'firebase/app'
import firebaseConfig from './firebase-config'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'
import appConfig from './config'

firebase.initializeApp(firebaseConfig.config)

if(location.hostname === 'localhost'){
  if(appConfig.emulators.firestore.use){
    const host = appConfig.emulators.firestore.host
    const port = appConfig.emulators.firestore.port
    firebase.firestore().useEmulator(host, port)
  }
  if(appConfig.emulators.auth.use){
    const host = appConfig.emulators.auth.host
    const port = appConfig.emulators.auth.port
    firebase.auth().useEmulator("http://"+host+":"+port.toString())
  }
}

export default firebase
