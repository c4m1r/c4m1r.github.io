import { createApp, reactive } from 'vue'
import App from './App.vue'
const globalState = reactive({ isVisible: false })

createApp(App).provide('globalState', globalState).mount('#app')
