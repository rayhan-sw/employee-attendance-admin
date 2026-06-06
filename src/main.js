// Application entrypoint: register global UI assets, router, and root component.
import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import './assets/main.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
