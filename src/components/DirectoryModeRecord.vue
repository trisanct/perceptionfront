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
  </el-descriptions>
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
        <el-image
        :src="imageurls[index*2]"
        :preview-src-list="imageurls"
        :preview-teleported="true"
        :initial-index="index*2"
        fit="contain" />
      </el-col>
      <el-col :span="8" :offset="1">
        <h3>输出</h3>
        <el-image
        :src="imageurls[index*2+1]"
        :preview-src-list="imageurls"
        :preview-teleported="true"
        :initial-index="index*2+1"
        fit="contain" />
      </el-col>
      <el-divider v-if="index + 1 !== record?.results.length" />
    </el-row>
  </el-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { forEach } from 'lodash';

const a = defineProps({
  record: {
    type: Object,
    default: undefined,
  },
})
const row = a.record?.results.length % 4 === 0 ? a.record?.results.length / 4 : a.record?.results.length / 4 + 1
const imageurls = ref<string[]>([])
forEach(a.record?.results,(result)=>{
  imageurls.value.push(`/static${result?.inUrl}`)
  imageurls.value.push(`/static${result?.outUrl}`)
})
console.log(row)
</script>
