import Vue from 'vue'
import Router from 'vue-router'
import UserSelectView from '../views/UserSelectView'
import ItemSelectPage from '../views/ItemSelectPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/users'
    },
    {
      path: '/users',
      name: 'UserSelectView',
      component: UserSelectView,
    },
    {
      path: '/items',
      name: 'ItemSelectPage',
      component: ItemSelectPage,
    }
  ]
})
