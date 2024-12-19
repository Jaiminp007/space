// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three')) {
            return 'three';  // Bundle Three.js in its own chunk
          }
        },
      },
    },
  },
}
