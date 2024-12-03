import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import SDrawer from './components/sdrawer/index.js'
import SForm from './components/sform/index'
import { ElDialog as eleModal, ElDrawer as eleDrawer } from 'element-plus'
import 'element-plus/dist/index.css'

const store = createPinia()
const app = createApp(App)

app.component('SForm', SForm)

app.use(SDrawer as any, {
  eleDrawer,
  eleModal,
  router,
  store,
})

app.use(store) //use pinia
app.use(router) //use router
app.mount('#app')
