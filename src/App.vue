<template>
  <div id="app">
    <AppBar />
    <main>
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script>
import AppBar from './components/AppBar.vue';

export default {
  components: {
    AppBar
  }
};
</script>

<style>
/* Couleur de fond pour l'ensemble de l'application */
#app {
  background-color: #f0f0f0;
  min-height: 100vh;
}

main {
  padding: 20px;
}
</style>
