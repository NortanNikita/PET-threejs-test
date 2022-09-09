<template>
<div>
  <div ref="canvas-container" class="canvas-container"></div>
</div>
</template>

<script>
import Mutant from '@/webgl/Mutant.js'
import FlappyBird from '@/webgl/FlappyBird3D.js'
import OpenCasesMap from '@/webgl/OpenCasesMap.js'
import PremiumWheel from '@/webgl/PremiumWheel.js'
export default {
  data:() => ({
    game: {},
  }),
  mounted() {
    this.game = new Mutant(this.$refs['canvas-container'])
    this.game._init()
  },
}
</script>
<style>
body {
  margin: 0;
  padding: 0;
}
.canvas-container {
  position: absolute;
  z-index: 0;
  left:0;
  top: 0;
  width: 100vw;
  height: 100vh;
}
</style>