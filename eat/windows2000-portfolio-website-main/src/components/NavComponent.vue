<template>
  <a2k-panel>
    <div style="min-width: 100%; align-items: center; display: flex">
      <!-- <a2k-button class="button-inline-icon">
        <a2k-icon icon="windows-icon" />
        <span>Start</span>
      </a2k-button> -->
      <button>
        <a2k-icon icon="windows-icon"></a2k-icon>
        Start
      </button>
      <div class="time-display">
        <div style="padding: 5px">{{ currentTime }}</div>
      </div>
    </div>
  </a2k-panel>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref(new Date().toLocaleTimeString())

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString()
}

onMounted(() => {
  const interval = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.button-inline-icon {
  display: inline-block;
  align-items: center;
  justify-content: center;
  padding: 2.5px;
}

.button-inline-icon a2k-icon {
  display: inline-block;
  margin-right: 8px;
}

.time-display {
  float: right;
  max-width: fit-content;
  margin-left: auto;
  margin-right: 2.5px;
  margin-bottom: 2.5px;
  box-shadow: 0 0 3px black;
}

button {
  display: flex;
  align-items: center;
  gap: var(--taskbar-content-gap);
  font-family: var(--font-primary);
  letter-spacing: var(--font-primary-letter-spacing);
  height: 100%;
  font-weight: var(--font-weight-heavy);
  font-size: var(--font-size-100);
  line-height: var(--font-size-100);
  background-color: var(--color-gray-600);
  cursor: var(--cursor-pointer);
  border: var(--button-border);
  border-left: 1px dotted var(--color-white);
  border-top: 1px dotted var(--color-white);
  box-shadow: var(--button-shadow);
  outline-color: var(--outline-color-focus);
  outline-offset: var(--outline-offset-focus);
  padding: 5px;
}

button:active {
  border-bottom: 2px solid transparent;
  border-right: 0;
  border-left: 1px dotted var(--color-black);
  border-top: 1px dotted var(--color-black);
  box-shadow: var(--button-shadow-active);
  transform: translate(2px, 2px);
}
</style>
