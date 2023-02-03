<template>
	<div class="two-cards">

		<el-card class="box-card">
			<el-form :model="form">
				<el-form-item label="检测模式">
					<el-select style="margin-right:10px" v-model="form.mode" placeholder="请选择检测模式" :disabled="started" @change="onSelectChange">
						<el-option label="predict" value="predict" />
						<el-option label="video" value="video" />
						<el-option label="fps" value="fps" />
						<el-option label="directory" value="directory" />
					</el-select>
					选择directory模式可上传多个文件, 选择video或fps模式可上传大于20MB的文件
				</el-form-item>
				<el-form-item style="display:none">
					<el-input v-model="form.guid" />
				</el-form-item>
				<el-form-item label="video_fps" v-if="form.mode==='video'">
					<el-input v-model="form.video_fps" />
				</el-form-item>
				<el-form-item label="test_interval" v-if="form.mode==='fps'">
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
								:show-file-list=false
								:auto-upload=false
								action="/"
								:multiple="form.mode==='directory'"
								:limit="form.mode==='directory'?undefined:1"
								:on-exceed="handleExceed"
								:on-error="handleError"
								:disabled="loading"
								>
						<!-- <template #trigger> -->
							<el-button style="margin-left:12px" type="primary" :icon="Plus" :loading="loading">
								{{loading?loadprogress.toString().slice(0,5)+'%':'选择文件'}}
							</el-button>
						<!-- </template> -->
					</el-upload>
					<el-button style="margin-left:12px" type="success" :icon="Upload" :loading="loading" @click="submitUpload">
									开始上传
					</el-button>
				</div>
			</template>
			<div v-for="(file,index) in fileList" :key="index">
				<el-card v-if="index<shown" shadow="hover" class="fileblock">
					{{file.name}} &nbsp; {{countSize(file.size)}} &nbsp;&nbsp;
					<el-button type="danger"  @click="handleRemove(index)" >移除</el-button>
					<el-progress :percentage="file.percentage" :status="file.percentage===100?'success':undefined" />
				</el-card>
			</div>
			<br/>
			<el-button type="success" :icon="Check" @click="onSubmit">提交</el-button>
		</el-card>
  </div>
</template>
  
<script lang="ts" setup>
	//imports
  import { reactive, ref, watch } from 'vue'
	import axios from 'axios'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { UploadProps, UploadUserFile } from 'element-plus'
	import { forEach, isUndefined, slice } from 'lodash'
	import { Check, Plus, Upload } from '@element-plus/icons-vue'
	import CryptoJS from 'crypto-js'
	//vars
	
	let ready=0
	//refs
  const fileList = ref<UploadUserFile[]>([])
	const shown = ref(0)
	const shas: string[] = ([])
	const loading = ref(false)
	const loadprogress = ref(0)
	const started = ref(false)
	//const slices:Blob[] = []
	let adding = 0
	watch(fileList,async (a,b) => {
		if(a.length>b.length) {
			loading.value=true
			loadprogress.value=0
			adding=a.length-b.length
			let i=b.length
			while(i<a.length) {
				if(form.mode!=='video'&&form.mode!=='fps'&&typeof a[i].size!=='undefined') {
					if(a[i].size as number>20*1048576) {
						fileList.value.splice(i,1)
						ElMessage.warning('请选择小于20MB的文件')
						break
					}
				}
				const fsha = (await getFileSHA(a[i].raw as File)) as string
				console.log(fsha)
				if(shas.includes(fsha)) {
					fileList.value.splice(i,1)
					ElMessage.warning('请勿添加相同文件')
				}
				else {
					shas.push(fsha)
					shown.value++
					ready++
					i++
				}
			}
			loading.value=false
			loadprogress.value=100
			adding=0;
		}
	})
  const form = reactive({
		guid:'',
  	mode: '',
  	video_fps: '',
  	test_interval: '',
		param1:'',
		param2:'',
		param3:''
  })
	//events
	const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
		ElMessage.warning('非directory模式不能添加多个文件')
	}

	const handleRemove = (i:number) => {
		if(fileList.value[i].status==='success')	{
			ElMessage.warning('无法移除已上传的文件')
			return
		}
		if(fileList.value[i].status==='ready')ready--
		fileList.value.splice(i,1)
		shown.value--
		shas.splice(i,1)
		//if(shown.value===0)slices.splice(0,slices.length)
	}
	
	const handleError: UploadProps['onError'] = (error, file, uploadFiles) => {
		file.percentage=0;
		file.status='fail'
	}

	const submitUpload = () => {
		console.log('点击了上传按钮')
		if(form.mode===''){
			ElMessage.warning('请先选择检测模式')
			return;
		}
		if(fileList.value.length==0){
			ElMessage.warning('请先选择要上传的文件')
			return;
		}
		if(form.mode==='predict') {                  //单传
			uploadFile()
			return
		}
		if(form.mode==='video'||form.mode==='fps') { //切传
			uploadSlices()
			return
		}
		if(form.mode==='directory') {                //多传
			uploadFiles()
			return
		}
		ElMessage.error('出错啦')
	}
	
  const onSelectChange = () => {
		form.guid=''                     //改变模式清空guid
		if(form.mode!=='directory') {
			if(fileList.value.length>1) {  //从dir模式切换至其他模式，移除多余文件
				ElMessage.warning(`${fileList.value[0].name}之后的文件因切换至非diretory模式被自动移除`)
				fileList.value.splice(1,fileList.value.length-1)
				shas.splice(1,fileList.value.length-1)
				shown.value=1
			}
		}
		if(form.mode!=='video'&&form.mode!=='fps') {
			if(fileList.value.length>0) {
				if((isUndefined(fileList.value[0].size)?0:fileList.value[0].size)>20*1048576) {
					ElMessage.warning(`文件${fileList.value[0].name}因超出20MB被自动移除`)
					fileList.value.splice(1,fileList.value.length-1)
					shas.splice(1,fileList.value.length-1)
					shown.value=0
				}
			}
		}
  }
	
  const onSubmit = () => {  //to be done
    console.log('submit!')
  }

	//functions
	const countSize = (bytes:any) => {
			if (typeof bytes !== 'number') return "0B";
      if (bytes === 0) return "0B";
      let k = 1024,
        sizes = ["B", "KB", "MB", "GB", "TB"],
        i = Math.floor(Math.log(bytes) / Math.log(k))
      return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i]
  }
	interface extradata {
		name:string,
		value:string
	}
	const uploadOne = async (i:number, extra:extradata[] = []) => {
		try {
			fileList.value[i].status='uploading'
			const fd=new FormData()
			fd.append('file',fileList.value[i].raw as File)
			fd.append('sha',shas[i])
			if(extra.length!==0)	{
				forEach(extra,(e)=>{
					fd.append(e.name,e.value)
				})
			}
			const res=(await axios.post(`/server/UploadFile/${form.mode}`,fd,{
				headers:{
					'Content-Type':'multipart/form-data'
				},
			}))
			if(res.status!==200) return Promise.reject('error')
			fileList.value[i].percentage=100
			fileList.value[i].status='success'
			ready--;
			console.log(res.data)
			return res.data
		} catch(e) {
			fileList.value[i].percentage=0
			fileList.value[i].status='fail'
			ready--;
			ElMessage.error(e?.toString())
		}
	}

	const uploadFile = async () => {
		if(fileList.value[0].status==="ready") {
			started.value=true
			form.guid=await uploadOne(0)
		}
	}

	const uploadFiles = async () => {
		if(ready===0)return;
		try{
			started.value=true
			if(form.guid==='') {
				const res=(await axios.get('/server/GetGuid'))
				if(res.status!==200) return Promise.reject('error')
				form.guid=res.data
			}
		}
		catch(e){
			ElMessage.error(e?.toString())
		}
		let i=0
		while(i<fileList.value.length) {
			if(fileList.value[i].status==='ready') {
				console.log('即将进入uploadone')
				uploadOne(i,[{name:'guid',value:form.guid}])
			}
			i++
		}
	}
	
	const uploadSlices = async () => {    //to be done
		//const
		if(ready===0)return;
		try{
			if(form.guid==='') {
				const res=(await axios.get('/server/GetGuid'))
				if(res.status!==200) return Promise.reject('error')
				form.guid=res.data
			}
		}
		catch(e){
			ElMessage.error(e?.toString())
		}
		const slicesize=4194304;
		const total=isUndefined(fileList.value[0].size)?0:fileList.value[0].size
		let cur=0;
		while(cur<total) {
			//
		}
	}  

	const getFileSHA = (file:File) => {
		if(file.size>20*1024*1024) return getFileSHAProgressive(file)
		return new Promise(resolve=>{
			const filereader=new FileReader()
			filereader.readAsArrayBuffer(file)
			filereader.onload = (e) =>{
				const buffer=e.target?.result
				const wordarray=CryptoJS.lib.WordArray.create(buffer) 
				const SHA=CryptoJS.SHA256(wordarray).toString()
				resolve(SHA)
			}
		})
	}

	const getFileSHAProgressive = (file:File) => {
		return new Promise(resolve => {
			const chunkSize = 1024 * 1024 * 4
			const chunks = Math.ceil(file.size / chunkSize)
			let currentChunk = 0
			const hasher_sha1 = CryptoJS.algo.SHA256.create()
			const fr=new FileReader()
			fr.onload =  (e) => {
				const CryptoJS_data = CryptoJS.lib.WordArray.create(e.target?.result)
				hasher_sha1.update(CryptoJS_data)
				currentChunk ++
				if (currentChunk < chunks) {
					loadprogress.value += 1/chunks/adding*100
					loadNext()
				} else {
					resolve(hasher_sha1.finalize().toString())
				}
			}
			function loadNext() {
				var start = currentChunk * chunkSize,
					end = start + chunkSize >= file.size ? file.size : start + chunkSize
				//slices.push(file.slice(start, end))
				fr.readAsArrayBuffer(file.slice(start, end))
			}
			loadNext()
		})
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
.two-cards{
	margin-left: 5%;
	margin-right: 5%
}
.fileblock {
	margin-top:5px;
}
</style>