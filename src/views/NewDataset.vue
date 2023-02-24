<template>
  <h1>新建数据集并训练</h1>
  <div>{{ fileList.length }}</div>
  <div>{{ imageList.length }}</div>
  <div>{{ annotationList.length }}</div>
  <el-card shadow="never">
    <h3 style="margin-top: 0px; margin-bottom: 20px">参数设定</h3>
    <el-form ref="formref" :model="form" :rules="rules" label-width="120px" label-position="left">
      <el-form-item style="display: none">
        <el-input v-model="form.guid" />
      </el-form-item>
      <el-form-item label="名称" style="max-width: 500px">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="使用GPU训练">
        <el-switch v-model="form.cuda" />
      </el-form-item>
      <el-form-item label="迭代轮数" style="max-width: 500px">
        <el-input v-model.number="form.epoch"/>
      </el-form-item>
    </el-form>
    <el-divider />
    <div class="card-header">
      <el-upload
        ref="uploadref"
        v-model:file-list="fileList"
        :show-file-list="false"
        :auto-upload="false"
        action="/"
        multiple
        :on-error="handleError"
      >
        <el-button style="margin-left: 12px" type="primary" :icon="Plus" :loading="loading">
          {{ loading ? loadprogress.toString().slice(0, 5) + '%' : '选择文件' }}
        </el-button>
      </el-upload>
      <el-button style="margin-left: 12px" type="success" :icon="Upload" :loading="loading" @click="submitUpload"> 开始上传 </el-button>
      <el-button type="info" :icon="QuestionFilled">查看说明</el-button>
    </div>
    <div style="display: flex;">
      <el-card style="width:200px;text-align: center;">
        <template #header>
          <div v-if="imageList.length===0">尚未选择图片文件</div>
          <div v-else>共计{{ imageList.length }}张图片文件</div>
        </template>
        <el-progress type="circle" :percentage="0" />
      </el-card>

      <el-card style="width:200px;text-align: center;">
        <template #header>
          <div v-if="annotationList.length===0">尚未选择标注文件</div>
          <div v-else>共计{{ annotationList.length }}张标注文件</div>
        </template>
        <el-progress type="circle" :percentage="0" />
      </el-card>

      <el-card style="width:200px;text-align: center;">
        <template #header>
          <div v-if="classfile === undefined">尚未选择classes.txt</div>
          <div v-else>{{ classfile.name }}</div>
        </template>
        <el-progress type="circle" :percentage="0" />
      </el-card>
    </div>
    <br />
    <el-button type="success" :icon="Check" :disabled="loading" @click="onSubmit(formref)">提交</el-button>
  </el-card>
</template>
<script setup lang="ts">
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { forEach, isUndefined } from 'lodash'
import { Check, Plus, Upload, Close, View, QuestionFilled } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, FormInstance, FormRules } from 'element-plus'

let ready = 0 //未上传的文件数量
let adding = 0 //单次添加的文件数量
const slicesize = 4194304
const mode = ref('')
const dataset = ref('')
const fileList = ref<UploadUserFile[]>([])
const imageList = ref<UploadUserFile[]>([])
const annotationList = ref<UploadUserFile[]>([])
const classfile=ref<UploadUserFile>()
const shas: string[] = []
//const sliceshas: string[] = []
const shown = ref(0) //显示的文件数量
const loading = ref(false) //是否正在计算文件哈希
const loadprogress = ref(0) //文件哈希计算总进度
const started = ref(false) //至少点击过一次上传
const previewurls = ref<string[]>([]) //上传的文件或视频预览url
const router = useRouter()
const form = reactive({
  //提交的表单数据
  guid: '',
  cuda: false,
  name: '',
  epoch:100
})
const formref = ref<FormInstance>()
const rules = reactive<FormRules>({
  
})
watch(fileList, async (a, b) => {
  //添加文件
  if (a.length > b.length) {
    adding = a.length - b.length
    let i = b.length
    while (i < a.length) {
        if ((a[i].size as number) > 20 * 1048576) {
          fileList.value.splice(i, 1)
          ElMessage.warning('请选择小于20MB的文件')
          continue
        }
        if(a[i].raw?.type.includes('image')){
          imageList.value.push(a[i])
        }
        else if(a[i].raw?.type.includes('xml')){
          annotationList.value.push(a[i])
        }
        else if(a[i].raw?.type.includes('text/plain')){
          if(a[i].name==='classes.txt'){
            if(classfile.value===undefined) classfile.value=a[i]
            else{
              const index=fileList.value.findIndex(f=>f.name=='classes.txt')
              classfile.value=a[i]
              fileList.value.splice(index,1)
            }
          }
          else{
            ElMessage.warning('只能选择名为classes.txt的文本文件')
            continue
          }
        }
        else {
          fileList.value.splice(i, 1)
          ElMessage.warning('选择的文件格式错误')
          continue
        }
      i++
    }
    adding = 0
  }
})
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
  if(imageList.value.length!==annotationList.value.length){
    ElMessage.warning('图片和标注的数量不一致')
    return
  }
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
          guid: form.guid,
          cuda: form.cuda,
          name: form.name
        })
        if (res.status !== 200) return Promise.reject('error')
        redirectToHistory(res.data)
      } catch (e: any) {
        ElMessage.error(e?.toString())
      }
    } else return
  })
}
const redirectToHistory = (id: any) => {
  router.push(`/Record/${id}`)
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
    ready--
    return res.data
  } catch (e: any) {
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
  } catch (e: any) {
    ElMessage.error(e?.toString())
  }
  let i = 0
  while (i < fileList.value.length) {
    if (fileList.value[i].status === 'ready') {
      uploadOne(i, [{ name: 'guid', value: form.guid }])
    }
    i++
  }
}
let suploaded = 0
const uploadSlices = async () => {
  try {
    let i = 0,
      start = 0
    const file = fileList.value[0].raw as File
    if (form.guid === '') {
      const res = await axios.post(`/server/GetGuid`, {
        filename: file.name,
        sha: shas[0],
      })
      if (res.status !== 200) return Promise.reject('error')
      console.log(res.data)
      form.guid = res.data.guid
      if (res.data.existed === true) {
        fileList.value[0].percentage = 100
        ElMessage.success('服务器已有相同文件秒传成功')
        return
      }
      i = res.data.start
      start = i * slicesize
    }
    const total = file.size
    let end = 0
    //fileList.value[0].percentage = +((start / total) * 100).toFixed(2)
    while (start < total) {
      if (start + slicesize < total) end = start + slicesize
      else end = total
      const slice = file.slice(start, end)
      //let sha = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(await slice.arrayBuffer()))
      //while (sha.length < 64) sha = '0' + sha
      const fd = new FormData()
      fd.append('file', slice)
      fd.append('guid', form.guid)
      fd.append('id', i.toString())
      axios
        .post(`/server/UploadSlice/${end === total}`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          suploaded += slicesize
          if (suploaded > (fileList.value[0].size as number)) fileList.value[0].percentage = 100
          else fileList.value[0].percentage = +((suploaded / (fileList.value[0].size as number)) * 100).toFixed(2)
        })
      start = end
      //fileList.value[0].percentage = +((start / total) * 100).toFixed(2)
      i++
    }
    //fileList.value[0].percentage = 100
    ready--
  } catch (e: any) {
    ElMessage.error(e?.toString())
  }
}
const getFileSHAProgressive = async (file: Blob, update: boolean = true) => {
  const sha256 = CryptoJS.algo.SHA256.create()
  const total = file.size
  let start = 0,
    end = 0
  while (start < total) {
    if (start + slicesize < total) end = start + slicesize
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
<style scoped>
.card-header {
  display: flex;
  align-items: center; /*垂直居中*/
  margin-bottom: 20px;
}
.keepdis {
  margin-top: 5px;
  margin-bottom: 5px;
  text-align: center;
}
</style>
