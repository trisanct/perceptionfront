<template>
  <h1>提交检测</h1>
  <el-card shadow="never">
    <h3 style="margin-top: 0px; margin-bottom: 20px">参数设定</h3>
    <el-form ref="formref" :model="form" :rules="rules" label-width="120px" label-position="left">
      <el-form-item label="检测模式" prop="mode">
        <el-select style="margin-right: 10px" v-model="mode" placeholder="请选择检测模式" :disabled="started || loading" @change="true">
          <el-option label="predict" value="predict" />
          <el-option label="video" value="video" />
          <el-option label="fps" value="fps" />
          <el-option label="directory" value="directory" />
        </el-select>
        选择directory模式可上传多个文件, 选择video或fps模式可上传大于20MB的文件
      </el-form-item>
      <el-form-item style="display: none">
        <el-input v-model="form.guid" />
      </el-form-item>
      <el-form-item label="使用GPU计算">
        <el-switch v-model="form.cuda" />
      </el-form-item>
      <el-form-item label="视频帧率" v-if="mode === 'video'" prop="fps" style="max-width: 500px">
        <el-input v-model.number="form.fps" />
      </el-form-item>
      <el-form-item label="帧率检测次数" v-if="mode === 'fps'" prop="test_interval" style="max-width: 500px">
        <el-input v-model.number="form.test_interval" />
      </el-form-item>
      <el-form-item label="置信度" v-if="mode !== 'fps'" prop="confidence" style="max-width: 500px">
        <el-input v-model="form.confidence" />
      </el-form-item>
    </el-form>
    <el-divider />
    <div class="card-header">
      <h3 style="margin: 0px">上传用于检测的文件</h3>
      <el-upload
        ref="uploadref"
        v-model:file-list="fileList"
        :show-file-list="false"
        :auto-upload="false"
        action="/"
        :multiple="mode === 'directory'"
        :limit="mode === 'directory' ? undefined : 1"
        :on-exceed="handleExceed"
        :on-error="handleError"
        :disabled="loading || mode === ''"
      >
        <el-button style="margin-left: 12px" type="primary" :icon="Plus" :loading="loading" :disabled="mode === ''">
          {{ loading ? loadprogress.toString().slice(0, 5) + '%' : '选择文件' }}
        </el-button>
      </el-upload>
      <el-button style="margin-left: 12px" type="success" :icon="Upload" :loading="loading" @click="submitUpload"> 开始上传 </el-button>
    </div>
    <div v-for="(file, index) in fileList" :key="index">
      <el-card v-if="index < shown" shadow="never" class="keepdis">
        <el-row :gutter="0" style="align-items: center">
          <el-col :span="2">
            <el-button v-if="file.status !== 'success'" type="danger" @click="handleRemove(index)">移除</el-button>
          </el-col>
          <el-col :span="2">
            <el-popover placement="right" width="auto" trigger="hover">
              <el-image
                v-if="modeType(mode) === 'image'"
                :src="previewurls[index]"
                style="width: 400px; height: 300px"
                fit="contain"
                :preview-teleported="true"
                :preview-src-list="previewurls"
                :initial-index="index"
              />
              <video v-if="modeType(mode) === 'video'" :src="previewurls[index]" style="width: 800px; height: 450px" controls></video>
              <template #reference>
                <el-button type="default">查看</el-button>
              </template>
            </el-popover>
          </el-col>
          <el-col :span="6">
            <el-popover placement="top-start" width="auto" trigger="hover">
              {{ file.name }}
              <template #reference>
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ file.name }}</div>
              </template>
            </el-popover>
          </el-col>
          <el-col :span="2">{{ countSize(file.size) }}</el-col>
          <el-col :span="12">
            <el-progress
              class="keepdis"
              style="width: 100%"
              :stroke-width="16"
              :percentage="file.percentage"
              :status="file.percentage === 100 ? 'success' : undefined"
            />
          </el-col>
        </el-row>
      </el-card>
    </div>
    <br />
    <el-button type="success" :icon="Check" :disabled="loading" @click="onSubmit(formref)">提交</el-button>
  </el-card>
</template>

<script lang="ts" setup>
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router';
import { forEach, isUndefined } from 'lodash'
import { Check, Plus, Upload } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, FormInstance, FormRules } from 'element-plus'

let ready = 0 //未上传的文件数量
let adding = 0 //单次添加的文件数量
const mode = ref('')
const fileList = ref<UploadUserFile[]>([])
const shas: string[] = []
//const sliceshas: string[] = []
const shown = ref(0) //显示的文件数量
const loading = ref(false) //是否正在计算文件哈希
const loadprogress = ref(0) //文件哈希计算总进度
const started = ref(false) //至少点击过一次上传
const sha256 = CryptoJS.algo.SHA256.create()
const previewurls = ref<string[]>([]) //上传的文件或视频预览url
const router=useRouter()
const form = reactive({
  //提交的表单数据
  guid: '',
  cuda: false,
  mode: -1,
  fps: 0,
  test_interval: 0,
  confidence: 0,
})
const formref = ref<FormInstance>()
const validateMode = (rule: any, value: number, callback: any) => {
  if (value < 0 || value > 3) {
    callback(new Error('请选择模式'))
  } else {
    callback()
  }
}
const validateConfidence = (rule: any, value: any, callback: any) => {
  const pat: RegExp = /0\.\d*[1-9]/
  if (!pat.test(value)) {
    callback(new Error('请输入正确的置信度'))
  } else {
    callback()
  }
}
const rules = reactive<FormRules>({
  mode: [{ required: true }, { validator: validateMode, trigger: 'blur' }],
  fps: [
    { required: true, message: '请输入视频fps', trigger: 'blur' },
    { type: 'number', message: 'fps必须是一个数' },
  ],
  test_interval: [
    { required: true, message: '请输入test_interval', trigger: 'blur' },
    { type: 'number', message: 'test_interval必须是一个数' },
  ],
  confidence: [
    { required: true, message: '请输入置信度', trigger: 'blur' },
    { validator: validateConfidence, trigger: 'blur' },
  ],
})
watch(fileList, async (a, b) => {
  //添加文件
  if (a.length > b.length) {
    updateLoadProgress(0)
    adding = a.length - b.length
    let i = b.length
    while (i < a.length) {
      if (modeType(mode.value) === 'image' && typeof a[i].size !== 'undefined') {
        if ((a[i].size as number) > 20 * 1048576) {
          fileList.value.splice(i, 1)
          ElMessage.warning('请选择小于20MB的文件')
          break
        }
        if (!a[i].raw?.type.includes('image')) {
          fileList.value.splice(i, 1)
          ElMessage.warning('选择的文件不是图片')
          break
        }
      }
      if (modeType(mode.value) === 'video') {
        if (!a[i].raw?.type.includes('video')) {
          fileList.value.splice(i, 1)
          ElMessage.warning('选择的文件不是视频')
          break
        }
      }
      const fsha = (await getFileSHAProgressive(a[i].raw as File)) as string
      console.log(fsha)
      if (shas.includes(fsha)) {
        fileList.value.splice(i, 1)
        ElMessage.warning('请勿添加相同文件')
      } else {
        shas.push(fsha)
        previewurls.value.push(URL.createObjectURL(a[i].raw!))
        shown.value++
        ready++
        i++
      }
    }
    updateLoadProgress(100)
    adding = 0
  }
})
watch(mode, (newmode, oldmode) => {
  //切换模式
  form.guid = ''
  form.mode = modevalue(mode.value)
  formref.value?.validateField('mode', () => null)
  const oldmodetype = modeType(oldmode)
  const newmodetype = modeType(newmode)
  if (newmode !== 'directory') if (fileList.value.length > 1) shown.value = 1
  if (oldmodetype !== newmodetype) {
    if (newmodetype === 'image') {
      if (fileList.value.length > 0)
        if ((isUndefined(fileList.value[0].size) ? 0 : fileList.value[0].size) > 20 * 1048576 || !fileList.value[0].raw?.type.includes('image'))
          shown.value = 0
    } else {
      if (fileList.value.length > 0) if (!fileList.value[0].raw?.type.includes('video')) shown.value = 0
    }
  }
  fileList.value.splice(shown.value, fileList.value.length - shown.value)
  previewurls.value.splice(shown.value, previewurls.value.length - shown.value)
  if (shas.splice(shown.value, shas.length - shown.value).length !== 0) ElMessage.warning('部分或全部文件因模式切换而移除')
})
const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning('非directory模式不能添加多个文件')
}
const handleRemove = (i: number) => {
  //移除文件
  if (fileList.value[i].status === 'success') {
    ElMessage.warning('无法移除已上传的文件')
    return
  }
  if (fileList.value[i].status === 'ready') ready--
  fileList.value.splice(i, 1)
  shown.value--
  shas.splice(i, 1)
  previewurls.value.splice(i, 1)
}
const handleError: UploadProps['onError'] = (error, file, uploadFiles) => {
  file.percentage = 0
  file.status = 'fail'
}
const submitUpload = () => {
  //点击上传
  if (mode.value === '') {
    ElMessage.warning('请先选择检测模式')
    return
  }
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  if (ready === 0) {
    ElMessage.warning('没有需要上传的文件')
    return
  }
  started.value = true
  if (mode.value === 'predict') {
    uploadFile() //单传
    return
  }
  if (modeType(mode.value) === 'video') {
    uploadSlices() //切传
    return
  }
  if (mode.value === 'directory') {
    uploadFiles() //多传
    return
  }
  ElMessage.error('错误')
}
const onSubmit = async (formEl: FormInstance | undefined) => {
  //点击提交
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      //to be done
      try {
        if (fileList.value.length === 0 || ready !== 0) {
          ElMessage.warning('请在文件上传完成后再提交')
          return
        }
        const res = await axios.post(`/server/Submit`, {
          mode: form.mode,
          guid: form.guid,
          cuda: form.cuda,
          confidence: form.confidence,
          fps: form.fps,
          interval: form.test_interval,
        })
        redirectToHistory(res.data)
        if (res.status !== 200) return Promise.reject('error')
      } catch (e) {
          ElMessage.error(e?.toString())
      }
    } else return
  })
}
const redirectToHistory = (id:any) => {
  router.push(`/History/${id}`)
}
const countSize = (bytes: any) => {
  //显示文件大小
  if (typeof bytes !== 'number') return '0B'
  if (bytes === 0) return '0B'
  let k = 1024,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i]
}
const modeType = (mode: string) => {
  if (mode === 'predict' || mode === 'directory') return 'image'
  if (mode === 'video' || mode === 'fps') return 'video'
  return ''
}
const modevalue = (mode: string) => {
  //转换模式字符串到服务端对应的enum值
  if (mode === 'predict') return 0
  if (mode === 'video') return 1
  if (mode === 'fps') return 2
  if (mode === 'directory') return 3
  return 9
}
const updateLoadProgress = (p: number) => {
  //更新计算文件哈希进度
  loading.value = p === 100 ? false : true
  loadprogress.value = p
}
interface extradata {
  name: string
  value: string
}
const uploadOne = async (i: number, extra: extradata[] = []) => {
  try {
    fileList.value[i].status = 'uploading'
    const fd = new FormData()
    fd.append('file', fileList.value[i].raw as File)
    fd.append('sha', shas[i])
    if (extra.length !== 0) {
      forEach(extra, (e) => {
        fd.append(e.name, e.value)
      })
    }
    const res = await axios.post(`/server/UploadFile/${mode.value}`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (res.status !== 200) return Promise.reject('error')
    fileList.value[i].percentage = 100
    fileList.value[i].status = 'success'
    ready--
    return res.data
  } catch (e) {
    fileList.value[i].percentage = 0
    fileList.value[i].status = 'fail'
    ElMessage.error(e?.toString())
  }
}
const uploadFile = async () => {
  form.guid = await uploadOne(0)
}
const uploadFiles = async () => {
  try {
    if (form.guid === '') {
      const res = await axios.get(`/server/GetGuid`)
      if (res.status !== 200) return Promise.reject('error')
      form.guid = res.data
    }
  } catch (e) {
    ElMessage.error(e?.toString())
  }
  let i = 0
  while (i < fileList.value.length) {
    if (fileList.value[i].status === 'ready') {
      uploadOne(i, [
        { name: 'guid', value: form.guid },
        { name: 'id', value: i.toString() },
      ])
    }
    i++
  }
}
const uploadSlices = async () => {
  try {
    const file = fileList.value[0].raw as File
    if (form.guid === '') {
      const res = await axios.post(`/server/GetGuid`, {
        filename: file.name,
        sha: shas[0],
      })
      if (res.status !== 200) return Promise.reject('error')
      form.guid = res.data
    }
    let i = 0
    const slicesize = 4194304
    const total = file.size
    let start = 0,
      end = 0
    while (start < total) {
      if (start + slicesize < total) end = start + slicesize
      else end = total
      const slice = file.slice(start, end)
      console.log(slice.type)
      let sha = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(await slice.arrayBuffer()))
      while (sha.length < 64) sha = '0' + sha
      const fd = new FormData()
      fd.append('file', slice)
      fd.append('guid', form.guid)
      fd.append('sha', sha)
      fd.append('id', i.toString())
      const res = await axios.post(`/server/UploadSlice/${end === total}`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      start = end
      fileList.value[0].percentage = +((start / total) * 100).toFixed(2)
      i++
    }
    fileList.value[0].percentage = 100
    fileList.value[0].status = 'success'
    ready--
  } catch (e) {
    ElMessage.error(e?.toString())
  }
}
const getFileSHAProgressive = async (file: Blob, update: boolean = true) => {
  const sliceSize = 4194304
  const total = file.size
  let start = 0,
    end = 0
  while (start < total) {
    if (start + sliceSize < total) end = start + sliceSize
    else end = total
    const slice = file.slice(start, end)
    const arraybuffer = await slice.arrayBuffer()
    sha256.update(CryptoJS.lib.WordArray.create(arraybuffer))
    if (update) updateLoadProgress(loadprogress.value + ((end - start) / total / adding) * 100)
    start = end
  }
  let sha: string = sha256.finalize().toString()
  while (sha.length < 64) sha = '0' + sha
  return sha
}
</script>
<style>
.card-header {
  display: flex;
  align-items: center; /*垂直居中*/
  margin-bottom: 20px;
}
.keepdis {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
