<template>
  <el-descriptions class="margin-top" :column="3" :size="'default'" border>
    <el-descriptions-item>
      <template #label>
        <div>检测模式</div>
      </template>
      {{ record?.mode }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div>当前状态</div>
      </template>
      {{ record?.state }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div>提交时间</div>
      </template>
      {{ record?.time }}
    </el-descriptions-item>
  </el-descriptions>
  <!-- <el-row v-for="(r, i) in row" style="margin-bottom: 10px">
      <el-col v-for="(c, j) in 4" :span="5" :offset="j > 0 ? 1 : 0">
        <el-card v-if="i * 4 + j < record?.results.length" :body-style="{ padding: '0px' }">
          <div style="padding: 14px">
            <div>{{ record?.results[i * 4 + j].filename }}</div>
            <div>{{record?.results[i * 4 + j].class}}</div>
            <div class="bottom">
              {{ record?.results[i * 4 + j].score }}
            </div>
          </div>
          <el-image :src="`/static${record?.results[i * 4 + j].outUrl}`" style="display: block;" fit="contain" />
        </el-card>
      </el-col>
    </el-row> -->
  <el-card shadow="never" style="border-top-left-radius: 0px;border-top-right-radius: 0px;">
    <el-row v-if="record?.state === 'Completed'" v-for="(result, index) in record?.results" :key="index" style="margin-bottom: 10px">
      <el-col :span="6">
        <h3>文件名</h3>
        {{ result?.filename }}
        <el-divider />
        <h3>类别</h3>
        {{ result?.class }}
        <el-divider />
        <h3>概率</h3>
        {{ result?.score }}
      </el-col>
      <el-col :span="8" :offset="1">
        <h3>输入</h3>
        <el-image :src="`/static${result?.inUrl}`" fit="contain" />
      </el-col>
      <el-col :span="8" :offset="1">
        <h3>输出</h3>
        <el-image :src="`/static${result?.outUrl}`" fit="contain" />
      </el-col>
      <el-divider v-if="index + 1 !== record?.results.length" />
    </el-row>
  </el-card>
</template>
<script setup lang="ts">
const a = defineProps({
  record: {
    type: Object,
    default: undefined,
  },
})
const row = a.record?.results.length % 4 === 0 ? a.record?.results.length / 4 : a.record?.results.length / 4 + 1
console.log(row)
</script>
