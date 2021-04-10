# cafeorder-vuetify

## Installation

```shell
yarn install
```

### Install firebase tools

```shell
yarn global add firebase-tools
```

## Run local server for development

### Start Firebase local emulator

```shell
sh start_emulator.sh
```

### Compiles and hot-reloads for development

```shell
yarn serve
```

## Setup production environment

At first you must login to your firebase environment

```shell
firebase login
```

### Create and setup firebase project

#### visit [Firebase Console](https://console.firebase.google.com/?hl=ja) and create new firebase project

After creating new project, set up Firestore and Authentication services

1. Move to Authentication console and enable Google sign-in method
1. Add first user for admin and copy user uid
1. Move to Firestore console and create `roles` collection
    1. paste the user uid to first document id
    1. add `role` field which has `"admin"` value

#### attach the firebase project to local project

```shell
firebase use <your project id>
```

#### create web app on the project

```shell
firebase apps:create
<select Web App for following options>
```

#### get settings and add to `firebase-config.js`

```shell
firebase apps:sdkconfig
-------
✔ Downloading configuration data of your Firebase WEB app
// Copy and paste this into your JavaScript code to initialize the Firebase SDK.
// You will also need to load the Firebase SDK.
// See https://firebase.google.com/docs/web/setup for more details.

firebase.initializeApp({
  "projectId": "cafeorder",
  "appId": "your_app_id",
  "storageBucket": "cafeorder.appspot.com",
  "apiKey": "YourAppId",
  "authDomain": "yourapp.firebaseapp.com",
  "messagingSenderId": "000000000"
})
```

Then copy the config value which is inside of `firebase.initiallizeApp({...})`,
and overwrite corresponding lines on `src/firebase-config.js` with the copied sentence.

```js
// '/src/firebase-config.js'
const firebaseConfig = {
  "projectId": "cafeorder",
  "appId": "your_app_id",
  "storageBucket": "cafeorder.appspot.com",
  "apiKey": "YourAppId",
  "authDomain": "yourapp.firebaseapp.com",
  "messagingSenderId": "000000000"
}
export default { config: firebaseConfig }
```

### Compiles and minifies for production

```shell
yarn build
```

### Deploy

```shell
firebase deploy
```

### Lints and fixes files

```shell
yarn lint
```

## TODO

- 商品在庫表示
- 全体のトランザクション履歴表示
- SPA
- Card color theme
- Multi language support
