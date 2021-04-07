# cafeorder-vuetify

## Installation

```shell
yarn install
```

### Install firebase cli

```shell
yarn global add @firebase/cli
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

### Create firebase project

```shell
firebase projects:create <new project name>
```

### Compiles and minifies for production

```shell
yarn build
```

### Lints and fixes files

```shell
yarn lint
```
