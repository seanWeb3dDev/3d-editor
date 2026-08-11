<template>
  <router-view />
</template>

<script setup>
window.oncontextmenu = () => {
  return false;
};
</script>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

html {
  touch-action: none;
}
</style>