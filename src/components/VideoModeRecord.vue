<template>
  <el-descriptions size="large" :column="3" border>
    <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">数据集</div>
      </template>
      {{ record?.dataset }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">检测模式</div>
      </template>
      {{ record?.mode }}
    </el-descriptions-item>
    <!-- <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">当前状态</div>
      </template>
      {{ record?.state }}
    </el-descriptions-item> -->
    <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">提交时间</div>
      </template>
      {{ record?.time }}
    </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div style="font-size:18px">文件名</div>
        </template>
        {{ record?.filename }}
      </el-descriptions-item>
      <!-- <el-descriptions-item>
        <template #label>
          <div style="font-size:18px">类别</div>
        </template>
        {{ record?.class }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div style="font-size:18px">概率</div>
        </template>
        {{ record?.score }}
      </el-descriptions-item> -->
  </el-descriptions>
  <video v-if="record?.state === 'Completed'" :src="`/static${record?.inUrl}`"></video>
</template>
<script setup lang="ts">
defineProps({
  record: {
    type: Object,
    default: undefined,
  },
})
</script>
