<template>
  <h1>检测记录详情 #{{$route.params.id}}</h1>
  <el-image src="/input/1.png"></el-image>
  <el-row>
    <el-col
      v-for="(o, index) in 4"
      :key="o"
      :span="5"
      :offset="index > 0 ? 1 : 0"
    >
      <el-card :body-style="{ padding: '0px' }">
        <img
          src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
          class="image"
        />
        <div style="padding: 14px">
          <span>Corn Leaf Blight</span>
          <div class="bottom">
            0.61
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
onMounted(() => {
  
})
</script>
<style scoped>
.time {
  font-size: 12px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image {
  width: 100%;
  display: block;
}</style>