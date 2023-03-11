<template>
  <h1>新建数据集并训练</h1>
  <div>总文件数{{ fileList.length }}</div>
  <div>图片数{{ imageList.length }}</div>
  <div>标注数{{ annotationList.length }}</div>
  <div>行数{{ rowcount }}</div>
  <el-card shadow="never">
    <h3 style="margin-top: 0px; margin-bottom: 20px">参数设定</h3>
    <el-form ref="formref" :model="form" :rules="rules" label-width="120px" label-position="left">
      <el-form-item style="display: none">
        <el-input v-model="form.guid" />
      </el-form-item>
      <el-form-item label="名称" prop="name" style="max-width: 500px">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="数据增强" prop="augmentation">
        <el-switch v-model="form.augmentation" />
      </el-form-item>
      <el-form-item label="迭代轮数" prop="epoch" style="max-width: 500px">
        <el-input v-model.number="form.epoch" />
      </el-form-item>
    </el-form>
    <el-divider />
    <div class="card-header">
      <el-upload ref="uploadref" v-model:file-list="fileList" :show-file-list="false" :auto-upload="false" action="/" multiple>
        <el-button style="margin-left: 12px" type="primary" :icon="Plus">选择文件</el-button>
      </el-upload>
      <el-button style="margin-left: 12px" type="success" :icon="Upload" @click="submitUpload"> 开始上传 </el-button>
      <el-button style="margin-left: 12px" type="info" :icon="QuestionFilled" @click="showinstruction = true">查看说明</el-button>
      <el-dialog v-model="showinstruction" width="50%">
        <template #header><h3>需要上传的文件及要求</h3></template>
        <ul>
          <li>数据集中的图片，文件名任意，扩展名任意</li>
          <li>图片的标注文件，文件名需要与对应图片相同，扩展名为xml，格式参考下面样例</li>
          <li>名为classes.txt的病虫害类别文件，用换行分隔</li>
          <a href="/static/sample.xml" target="view_window">标注文件样例</a>
        </ul>
        <template #footer>
          <el-button type="success" @click="showinstruction = false"> 我知道了 </el-button>
        </template>
      </el-dialog>

      <el-button style="margin-left: 12px" type="info" :icon="View" @click="showimages = true">查看已选择的图片</el-button>
      <el-dialog v-model="showimages" style="height: 700px; width: 80%">
        <template #header>查看图片</template>
        <div style="height: 600px; overflow-y: auto">
          <el-row v-for="i in rowcount">
            <el-col v-for="j in 4" :span="6">
              <el-image
                v-if="(i - 1) * 4 + j - 1 < previewurls.length"
                :src="previewurls[(i - 1) * 4 + j - 1]"
                style="height: 200px"
                loading="lazy"
                fit="contain"
                :preview-src-list="previewurls"
                :preview-teleported="true"
                :initial-index="(i - 1) * 4 + j - 1"
              ></el-image>
            </el-col>
          </el-row>
        </div>
        <template #footer> </template>
      </el-dialog>
    </div>
    <div style="display: flex">
      <el-card shadow="never" style="width: 280px; text-align: center">
        <template #header> 已选择{{ imageList.length }}个图片文件 {{ countSize(sumsize) }}</template>
        <el-progress type="circle" :percentage="imagepercentage" :status="imagestatus" />
      </el-card>

      <el-card shadow="never" style="width: 280px; text-align: center; margin-left: 12px">
        <template #header> 已选择{{ annotationList.length }}个标注文件 </template>
        <el-progress type="circle" :percentage="annotationpercentage" :status="annotationstatus" />
      </el-card>

      <el-card shadow="never" style="width: 280px; text-align: center; margin-left: 12px">
        <template #header>
          <div v-if="classfile.length === 0">尚未选择classes.txt</div>
          <div v-else>已选择classes.txt</div>
        </template>
        <el-progress type="circle" :percentage="classspercentage" />
      </el-card>
    </div>
    <br />
    <el-button type="success" :icon="Check" @click="onSubmit(formref)">提交</el-button>
  </el-card>
</template>
<script setup lang="ts">
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { reactive, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { assign, forEach, isUndefined, reverse } from 'lodash'
import { Check, Plus, Upload, Close, View, QuestionFilled } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, FormInstance, FormRules } from 'element-plus'

const roundcount = 500
const showinstruction = ref(false)
const showimages = ref(false)
const sumsize = ref(0)
const uploadedimagecount = ref(0)
const uploadedannotationcount = ref(0)
const fileList = ref<UploadUserFile[]>([])
const imageList = ref<File[]>([])
const rowcount = ref(0)
const annotationList = ref<File[]>([])
const classfile = ref<File[]>([])
const previewurls = ref<string[]>([]) //上传的文件或视频预览url
const router = useRouter()
const form = reactive({
  //提交的表单数据
  guid: '',
  augmentation: false,
  name: '',
  epoch: '',
})
const imagepercentage = computed(() => (imageList.value.length === 0 ? 0 : +((uploadedimagecount.value / imageList.value.length) * 100).toFixed(2)))
const imagestatus = computed(() => (imageList.value.length !== 0 && uploadedimagecount.value === imageList.value.length ? 'success' : undefined))
const annotationpercentage = computed(() =>
  annotationList.value.length === 0 ? 0 : +((uploadedannotationcount.value / annotationList.value.length) * 100).toFixed(2)
)
const annotationstatus = computed(() =>
  annotationList.value.length !== 0 && uploadedannotationcount.value === annotationList.value.length ? 'success' : undefined
)
const classspercentage = ref(0)
const formref = ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  augmentation: [{ required: true, message: '', trigger: 'blur' }],
  cuda: [{ required: true, message: '', trigger: 'blur' }],
  epoch: [
    { required: true, message: '请输入迭代轮数', trigger: 'blur' },
    { type: 'number', message: '迭代轮数必须是一个数' },
  ],
})
watch(fileList, async (a, b) => {
  //添加文件
  reverse(fileList.value)
  while (fileList.value.length > 0) {
    let currentfile = fileList.value.pop()
    if ((currentfile?.size as number) > 20 * 1048576) {
      ElMessage.warning('请选择小于20MB的文件')
      continue
    }
    if (currentfile?.raw?.type.includes('image')) {
      sumsize.value += currentfile?.size as number
      imageList.value.push(currentfile.raw)
      previewurls.value.push(URL.createObjectURL(currentfile?.raw!))
    } else if (currentfile?.raw?.type.includes('xml')) {
      annotationList.value.push(currentfile.raw)
    } else if (currentfile?.raw?.type.includes('text/plain')) {
      if (currentfile?.name === 'classes.txt') {
        classfile.value.pop()
        classfile.value.push(currentfile.raw)
      } else {
        ElMessage.warning('只能选择名为classes.txt的文本文件')
        continue
      }
    } else {
      ElMessage.warning('选择的文件格式错误')
      continue
    }
  }
  rowcount.value = Math.ceil(imageList.value.length / 4)
})
const submitUpload = async () => {
  //点击上传
  if (imageList.value.length === 0 || classfile.value === undefined) {
    ElMessage.warning('请先按要求选择要上传的文件')
    return
  }
  if (imageList.value.length !== annotationList.value.length) {
    ElMessage.warning('图片和标注的数量不一致')
    return
  }
  try {
    if (form.guid === '') {
      const res = await axios.get(`/server/GetGuid`)
      if (res.status !== 200) throw new Error(res.status + res.statusText)
      //console.log(res.data)
      form.guid = res.data
    }
    //发送img
    const rounds = Math.ceil(imageList.value.length / roundcount)
    //console.log(rounds)
    for (let i = 0; i < rounds; i++) {
      let start = i * roundcount
      let end = start + roundcount
      if (end > imageList.value.length) end = imageList.value.length
      //console.log(start, end)
      const roundimages = imageList.value.slice(start, end - 1)
      roundimages.forEach((image) => {
        uploadOneThen(image)?.then(() => {
          uploadedimagecount.value++
        })
      })
      await uploadOne(imageList.value[end - 1])
      uploadedimagecount.value++
    }
    //发送xml
    {
      const rounds = Math.ceil(annotationList.value.length / roundcount)
      for (let i = 0; i < rounds; i++) {
        let start = i * roundcount
        let end = start + roundcount
        if (end > annotationList.value.length) end = annotationList.value.length
        //console.log(start, end)
        const roundannotation = annotationList.value.slice(start, end)
        const fd = new FormData()
        roundannotation.forEach((annotation) => {
          fd.append('file', annotation)
        })
        fd.append('guid', form.guid)
        const res = await axios.post(`/server/UploadDatasetXMLFiles`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        if (res.status !== 200) return Promise.reject('error')
        uploadedannotationcount.value = end
      }
    }
    //发送classes.txt
    {
      console.log(form.guid)
      console.log(classfile.value)
      await uploadOne(classfile.value[0])
      classspercentage.value=100
    }
  } catch (e: any) {
    ElMessage.error(e?.toString())
  }
}
const onSubmit = async (formEl: FormInstance | undefined) => {
  //点击提交
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      //to be done
      try {
        const res = await axios.post(`/server/SubmitDataset`, {
          guid: form.guid,
          name: form.name,
          augmentation: form.augmentation,
          epoch:form.epoch
        })
        if (res.status !== 200) return Promise.reject('error')
        ElMessage.success('提交成功')
        redirectToDataset(res.data)
      } catch (e: any) {
        ElMessage.error(e?.toString())
      }
    } else return
  })
}
const redirectToDataset = (id: any) => {
  router.push(`/Dataset/${id}`)
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
interface extradata {
  name: string
  value: string
}
const uploadOneThen = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('guid', form.guid)
  return axios
    .post(`/server/UploadDatasetFile`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => {
      if (res.status !== 200) return Promise.reject(res.status + res.statusText)
      //uploadedimagecount.value++
    })
}
const uploadOne = async (file: File) => {
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('guid', form.guid)
    const res = await axios.post(`/server/UploadDatasetFile`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return new Promise((resolve, reject) => {
      if (res.status === 200) {
        resolve(res.data)
      } else {
        reject(res.status + res.statusText)
      }
    })
  } catch (e: any) {
    ElMessage.error(e.message)
    console.log(e)
  }
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
