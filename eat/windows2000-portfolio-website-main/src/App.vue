<template>
  <div id="app-container">
    <component :is="componentToLoad" class="load-effect" style="animation-delay: 0.2s"></component>
    <NavComponent id="NavComponent" class="load-effect" style="animation-delay: 0.2s" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { markRaw } from 'vue'
import MobileComponent from './components/MobileComponent.vue'
import DesktopComponent from './components/DesktopComponent.vue'
import NavComponent from './components/NavComponent.vue'
let DesktopComponentRaw = markRaw(DesktopComponent)

const isMobile = window.innerWidth <= 768

const componentToLoad = ref(isMobile ? MobileComponent : DesktopComponentRaw)
</script>

<style>
html,
body,
#template,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  cursor: var(--cursor-default);
  overflow: hidden;
  height: 100%;
}
#app-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
#NavComponent {
  margin-top: auto;
  margin-bottom: 0;
  width: 100%;
  height: 40px;
  overflow: hidden;
}

@keyframes expand {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000px;
    opacity: 1;
  }
}

.load-effect {
  overflow: hidden;
  animation: expand 1.5s ease-out forwards;
  opacity: 0;
}

#app-container > * {
  opacity: 0;
}
</style>
