import Vue from 'vue'
import Router from 'vue-router'
import UserSelectPage from '@/components/UserSelectPage'
import ItemSelectPage from '@/components/ItemSelectPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/users'
    },
    {
      path: '/users',
      name: 'UserSelectPage',
      component: UserSelectPage,
    },
    {
      path: '/items',
      name: 'ItemSelectPage',
      component: ItemSelectPage,
    },
    {
      path: '/users/admin',
      name: 'UserSelectPage',
      component: UserSelectPage,
      props: {isEditable: true}
    }
  ]
})
