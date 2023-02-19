<script setup lang="ts">
</script>

<template>
  <h1>欢迎使用病虫害检测系统</h1>
</template>

<script>
//代码存档
// const getFileSHAProgressive = (file: File) => {
//   return new Promise((resolve) => {
//     const sliceSize = 1024 * 1024 * 4
//     const slicecount = Math.ceil(file.size / sliceSize)
//     let current = 0
//     const sha256 = CryptoJS.algo.SHA256.create()
//     const fr = new FileReader()
//     fr.onload = (e) => {
//       const words = CryptoJS.lib.WordArray.create(e.target?.result)
//       sha256.update(words)
//       current++
//       if (current < slicecount) {
//         loadprogress.value = loadprogress.value + (1 / slicecount / adding) * 100
//         loadNext()
//       } else {
//         resolve(sha256.finalize().toString())
//       }
//     }
//     function loadNext() {
//       var start = current * sliceSize,
//         end = start + sliceSize >= file.size ? file.size : start + sliceSize
//       fr.readAsArrayBuffer(file.slice(start, end))
//     }
//     loadNext()
//   })
// }
</script>