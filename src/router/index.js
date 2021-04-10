import Vue from 'vue'
import Router from 'vue-router'
import UserSelectView from '../views/UserSelectView'
import ItemSelectView from '../views/ItemSelectView'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: ItemSelectView
    },
    {
      path: '/admin',
      name: 'UserSelectView',
      component: UserSelectView,
    },
    {
      path: '/items',
      name: 'ItemSelectView',
      component: ItemSelectView,
    }
  ]
})
