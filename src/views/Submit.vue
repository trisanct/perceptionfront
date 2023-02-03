<template>
  <div class="two-cards">
    <el-card class="box-card">
      <el-form :model="form">
        <el-form-item label="检测模式">
          <el-select
            style="margin-right: 10px"
            v-model="mode"
            placeholder="请选择检测模式"
            :disabled="started"
            @change="true"
          >
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
        <el-form-item label="video_fps" v-if="form.mode === 'video'">
          <el-input v-model="form.video_fps" />
        </el-form-item>
        <el-form-item label="test_interval" v-if="form.mode === 'fps'">
          <el-input v-model="form.test_interval" />
        </el-form-item>
        <el-form-item label="参数1">
          <el-input v-model="form.param1" />
        </el-form-item>
        <el-form-item label="参数2">
          <el-input v-model="form.param2" />
        </el-form-item>
        <el-form-item label="参数3">
          <el-input v-model="form.param3" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h3>上传用于检测的文件</h3>
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
            <el-button
              style="margin-left: 12px"
              type="primary"
              :icon="Plus"
              :loading="loading"
              :disabled="mode === ''"
            >
              {{ loading ? loadprogress.toString().slice(0, 5) + "%" : "选择文件" }}
            </el-button>
          </el-upload>
          <el-button
            style="margin-left: 12px"
            type="success"
            :icon="Upload"
            :loading="loading"
            @click="submitUpload"
          >
            开始上传
          </el-button>
        </div>
      </template>
      <div v-for="(file, index) in fileList" :key="index">
        <el-card v-if="index < shown" shadow="hover" class="fileblock">
          {{ file.name }} &nbsp; {{ countSize(file.size) }} &nbsp;&nbsp;
          <el-button type="danger" @click="handleRemove(index)">移除</el-button>
          <el-progress
            :percentage="file.percentage"
            :status="file.percentage === 100 ? 'success' : undefined"
          />
        </el-card>
      </div>
      <br />
      <el-button type="success" :icon="Check" @click="onSubmit">提交</el-button>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import axios from "axios"
import { ElMessage, ElMessageBox } from "element-plus"
import type { UploadProps, UploadUserFile } from "element-plus"
import { forEach, isUndefined } from "lodash"
import { Check, Plus, Upload } from "@element-plus/icons-vue"
import CryptoJS from "crypto-js"

let ready = 0
let adding = 0
let loadaborted = false //to be done 计算文件哈希时切换模式
const fileList = ref<UploadUserFile[]>([])
const shown = ref(0)
const mode = ref("")
const shas: string[] = []
const loading = ref(false)
const loadprogress = ref(0)
const started = ref(false)
const sha256 = CryptoJS.algo.SHA256.create()
const form = reactive({
  guid: "",
  mode: "",
  video_fps: "",
  test_interval: "",
  param1: "",
  param2: "",
  param3: "",
})
watch(fileList, async (a, b) => {
  if (a.length > b.length) {
    updateLoadProgress(0)
    adding = a.length - b.length
    let i = b.length
    while (i < a.length) {
      if (modeType(mode.value) === "image" && typeof a[i].size !== "undefined") {
        if ((a[i].size as number) > 20 * 1048576) {
          fileList.value.splice(i, 1)
          ElMessage.warning("请选择小于20MB的文件")
          break
        }
        if (!a[i].raw?.type.includes("image")) {
          fileList.value.splice(i, 1)
          ElMessage.warning("选择的文件不是图片")
          break
        }
      }
      if (modeType(mode.value) === "video") {
        if (!a[i].raw?.type.includes("video")) {
          fileList.value.splice(i, 1)
          ElMessage.warning("选择的文件不是视频")
          break
        }
      }
      const fsha = (await getFileSHAProgressive(a[i].raw as File)) as string
      console.log(fsha)
      if (shas.includes(fsha)) {
        fileList.value.splice(i, 1)
        ElMessage.warning("请勿添加相同文件")
      } else {
        shas.push(fsha)
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
  form.guid = ""
  form.mode = mode.value
  const oldmodetype = modeType(oldmode)
  const newmodetype = modeType(newmode)
  let flag = false
  if (newmode !== "directory") if (fileList.value.length > 1) shown.value = 1
  if (oldmodetype !== newmodetype) {
    if (newmodetype === "image") {
      if (fileList.value.length > 0)
        if (
          (isUndefined(fileList.value[0].size) ? 0 : fileList.value[0].size) > 20 * 1048576 ||
          !fileList.value[0].raw?.type.includes("image")
        )
          shown.value = 0
    } else {
      if (fileList.value.length > 0)
        if (!fileList.value[0].raw?.type.includes("video")) shown.value = 0
    }
  }
  fileList.value.splice(shown.value, fileList.value.length - shown.value)
  if (shas.splice(shown.value, shas.length - shown.value).length !== 0)
    ElMessage.warning(`部分或全部文件因模式切换而移除`)
})

const handleExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
  ElMessage.warning("非directory模式不能添加多个文件")
}

const handleRemove = (i: number) => {
  if (fileList.value[i].status === "success") {
    ElMessage.warning("无法移除已上传的文件")
    return
  }
  if (fileList.value[i].status === "ready") ready--
  fileList.value.splice(i, 1)
  shown.value--
  shas.splice(i, 1)
}

const handleError: UploadProps["onError"] = (error, file, uploadFiles) => {
  file.percentage = 0
  file.status = "fail"
}

const submitUpload = () => {
  console.log("点击了上传按钮")
  if (mode.value === "") {
    ElMessage.warning("请先选择检测模式")
    return
  }
  if (fileList.value.length == 0) {
    ElMessage.warning("请先选择要上传的文件")
    return
  }
  if (mode.value === "predict") {
    //单传
    uploadFile()
    return
  }
  if (modeType(mode.value) === "video") {
    //切传
    uploadSlices()
    return
  }
  if (mode.value === "directory") {
    //多传
    uploadFiles()
    return
  }
  ElMessage.error("出错啦")
}

const onSubmit = () => {
  //to be done
  console.log("submit!")
}

const countSize = (bytes: any) => {
  if (typeof bytes !== "number") return "0B"
  if (bytes === 0) return "0B"
  let k = 1024,
    sizes = ["B", "KB", "MB", "GB", "TB"],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i]
}

const modeType = (mode: string) => {
  if (mode === "predict" || mode === "directory") return "image"
  if (mode === "video" || mode === "fps") return "video"
  return ""
}

const updateLoadProgress = (p: number) => {
  loading.value = p === 100 ? false : true
  loadprogress.value = p
}

interface extradata {
  name: string
  value: string
}
const uploadOne = async (i: number, extra: extradata[] = []) => {
  try {
    fileList.value[i].status = "uploading"
    const fd = new FormData()
    fd.append("file", fileList.value[i].raw as File)
    fd.append("sha", shas[i])
    if (extra.length !== 0) {
      forEach(extra, (e) => {
        fd.append(e.name, e.value)
      })
    }
    const res = await axios.post(`/server/UploadFile/${form.mode}`, fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    if (res.status !== 200) return Promise.reject("error")
    fileList.value[i].percentage = 100
    fileList.value[i].status = "success"
    ready--
    console.log(res.data)
    return res.data
  } catch (e) {
    fileList.value[i].percentage = 0
    fileList.value[i].status = "fail"
    ready--
    ElMessage.error(e?.toString())
  }
}

const uploadFile = async () => {
  if (fileList.value[0].status === "ready") {
    started.value = true
    form.guid = await uploadOne(0)
  }
}

const uploadFiles = async () => {
  if (ready === 0) return
  try {
    started.value = true
    if (form.guid === "") {
      const res = await axios.get("/server/GetGuid")
      if (res.status !== 200) return Promise.reject("error")
      form.guid = res.data
    }
  } catch (e) {
    ElMessage.error(e?.toString())
  }
  let i = 0
  while (i < fileList.value.length) {
    if (fileList.value[i].status === "ready") {
      console.log("即将进入uploadone")
      uploadOne(i, [{ name: "guid", value: form.guid }])
    }
    i++
  }
}

const uploadSlices = async () => {
  //to be done
  //const
  if (ready === 0) return
  try {
    if (form.guid === "") {
      const res = await axios.get("/server/GetGuid")
      if (res.status !== 200) return Promise.reject("error")
      form.guid = res.data
    }
  } catch (e) {
    ElMessage.error(e?.toString())
  }
  let i = 0
  const file = fileList.value[0].raw as File
  const slicesize = 4194304
  const total = isUndefined(fileList.value[0].size) ? 0 : fileList.value[0].size
  let start = 0,
    end = 0
  while (start < total) {
    if (start + slicesize < total) end = start + slicesize
    else end = total
    const slice = file.slice(start, end)
    const sha = getFileSHAProgressive(slice,false)
    
    start = end
  }
}

const getFileSHAProgressive = async (file: Blob, update: boolean = true) => {
  const sliceSize = 1024 * 1024 * 4
  const total = file.size
  let current = 0,
    start = 0,
    end = 0
  while (start < total) {
    if (start + sliceSize < total) end = start + sliceSize
    else end = total
    const slice = file.slice(start, end)
    const arraybuffer = await slice.arrayBuffer()
    sha256.update(CryptoJS.lib.WordArray.create(arraybuffer))
    if(update)updateLoadProgress(loadprogress.value + ((end - start) / total / adding) * 100)
    start = end
  }
  return sha256.finalize().toString()
}
</script>
<style>
.card-header {
  display: flex;
  align-items: center;
}
.box-card {
  margin-top: 10px;
}
.two-cards {
  margin-left: 5%;
  margin-right: 5%;
}
.fileblock {
  margin-top: 5px;
}
</style>
