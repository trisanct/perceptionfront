<template>
<el-descriptions class="margin-top" :column="3" :size="'default'" border>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">检测模式</div>
      </template>
      {{ record?.mode }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">当前状态</div>
      </template>
      {{ record?.state }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">提交时间</div>
      </template>
      {{ record?.time }}
    </el-descriptions-item>
  </el-descriptions>
  <el-row v-for="(r, i) in row" style="margin-bottom: 10px">
      <el-col v-for="(c, j) in 4" :span="5" :offset="j > 0 ? 1 : 0">
        <el-card v-if="i * 4 + j < record?.results.length" :body-style="{ padding: '0px' }">
          <img :src="record?.results[i * 4 + j].url" class="image" fit="contain" />
          <div style="padding: 14px">
            <div>{{ record?.results[i * 4 + j].filename }}</div>
            <div>{{ i }} {{ j }}</div>
            <div class="bottom">
              {{ record?.results[i * 4 + j].rate }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
</template>
<script setup lang="ts">
import {inject} from 'vue'
const a=defineProps({
  record: {
    type: Object,
    default: undefined,
  },
})
const row=a.record?.results.length/4+1
</script>