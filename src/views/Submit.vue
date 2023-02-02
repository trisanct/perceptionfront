<template>
	<div class="two-cards">

		<el-card class="box-card">
			<el-form :model="form">
				<el-form-item label="检测模式">
					<el-select style="margin-right:10px" v-model="form.mode" placeholder="请选择检测模式" @change="onSelectChange">
						<el-option label="predict" value="predict" />
						<el-option label="video" value="video" />
						<el-option label="fps" value="fps" />
						<el-option label="dir_predict" value="dir_predict" />
					</el-select>
					仅当选择dir_predict模式时可上传多个文件
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
				<el-form-item>
					<el-button type="success" :icon="Check" @click="onSubmit">提交</el-button>
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
								:multiple="form.mode==='dir_predict'"
								:limit="form.mode==='dir_predict'?undefined:1"
								:on-exceed="handleExceed"
								:on-error="handleError"
								>
						<!-- <template #trigger> -->
							<el-button style="margin-left:12px" type="primary" :icon="Plus">选择文件</el-button>
						<!-- </template> -->
					</el-upload>
					<el-button style="margin-left:12px" type="success" :icon="Upload" @click="submitUpload">
									开始上传
						</el-button>
				</div>
			</template>
			<el-button type="primary" @click="makesuccess">
				强行完成
			</el-button>
			<el-button type="primary" @click="makehalf">
				强行一半
			</el-button>
			<el-button type="primary" @click="onclicksha1">
				计算SHA1
			</el-button>
			<div v-for="(file,index) in fileList" :key="index">
				<el-card shadow="hover" class="fileblock">
					{{file.name}} {{isUndefined(file.size)?0:countSize(file.size)}}
					<input type="button" value="移除" @click="handleRemove(index)" />
					<el-progress :percentage="file.percentage" :status="file.percentage===100?'success':undefined" />
				</el-card>
			</div>
		</el-card>
  </div>
</template>
  
<script lang="ts" setup>
	//imports
  import { reactive, ref, watch } from 'vue'
	import axios from 'axios'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { UploadProps, UploadUserFile } from 'element-plus'
	import { forEach, isUndefined } from 'lodash'
	import { Check, Plus, Upload } from '@element-plus/icons-vue'
	import CryptoJS from 'crypto-js'
	//vars
	
	let md5:string =''
	let ready=0
	//refs
  const fileList = ref<UploadUserFile[]>([])
	const shas= ref<string[]>([])
	watch(fileList,async (a,b)=>{
		if(a.length>b.length) {
			console.log('new',a)
			console.log('old',b)
			console.log('now',fileList.value)
			console.log('now',shas.value)
			const f=a[a.length-1]
			const fsha = (await getFileSHA(f.raw as File)) as string
			if(shas.value.includes(fsha)) {
				fileList.value.pop()
				ElMessage.warning('请勿添加相同文件')
			}
			else {
				shas.value.push(fsha)
				ready++
			}
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
		ElMessage.warning('非dir_predict模式只能上传单个文件')
	}

	const handleRemove = (i:number) => {
		if(fileList.value[i].status==='success')	{
			ElMessage.warning('无法移除已上传的文件')
			return
		}
		if(fileList.value[i].status==='ready')ready--
		fileList.value.splice(i,1)
		shas.value.splice(i,1)
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
		if(form.mode==='predict'){                  //单传
			//uploadSmall()
			uploadFile()
			return
		}
		if(form.mode==='video'||form.mode==='fps'){ //切传
			uploadSlices()
			return
		}
		if(form.mode==='dir_predict'){              //多传
			//uploadSmalls()
			uploadFiles()
			return
		}
		ElMessage.error('出错啦')
	}

	const makesuccess = () => {
		forEach(fileList.value,(f)=>{
			f.status='success',
			f.percentage=100
		})
	}

	const makehalf = () => {
		forEach(fileList.value,(f)=>{
			f.status='uploading',
			f.percentage=50
		})
	}

	const onclicksha1 = async () => {
		console.log('点击sha1')
		const sha=(await getFileSHA(fileList.value[0].raw as File)) as string
		console.log(sha)
	}
	
  const onSelectChange = () => {
		form.guid=''                   //改变模式清空guid
		if(form.mode!=='dir_predict')
			if(fileList.value.length>1)  //从dir模式切换至其他模式，移除多余文件
				fileList.value.splice(1,fileList.value.length-1)
		
  }
	
  const onSubmit = () => {  //to be done
    console.log('submit!')
  }

	//functions
	const countSize= (bytes:number) => {
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
			fd.append('sha',shas.value[i])
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
			form.guid=await uploadOne(0)
		}
	}

	const uploadFiles = async () => {
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
		let i=0
		while(i<fileList.value.length) {
			if(fileList.value[i].status==='ready') {
				console.log('即将进入uploadone')
				uploadOne(i,[{name:'guid',value:form.guid}])
			}
			i++
		}
	}

	// const uploadOnce = async (indexes:number[]) => {
	// 	try {
	// 		const fd=new FormData()
	// 		forEach(indexes,(i)=>{
	// 			fd.append('file',fileList.value[i].raw as File)
	// 			fd.append('index',i.toString())
	// 		})
	// 		const res=(await axios.post(`/server/UploadFiles/${form.mode}`,fd,{
	// 			headers:{
	// 				'Content-Type':'multipart/form-data'
	// 			},
	// 		}))//.then((res)=>{
	// 		if(res.status!==200) return Promise.reject('error')
	// 		console.log(res.data)
	// 		forEach(res.data,(i)=>{
	// 				console.log(fileList.value[i])
	// 				fileList.value[i].status="success"
	// 				fileList.value[i].percentage=100
	// 		})
	// 	} catch(e) {
	// 		console.log('error',e)
	// 	}
	// }

	// const uploadSmalls = async () => {
	// 	form.guid=(await axios.get('/server/GetGUID/dir_predict')).data
	// 	forEach(fileList.value,(file,i)=>{
			
	// 	})
	// 	let i=0,cursize=0,maxsize=20*1024*1024,/*uploaded=0,*/count=fileList.value.length;
	// 	while(i<count) {
	// 		const fd=new FormData()
	// 		while(i<count&&cursize+((isUndefined(fileList.value[i].size)?0:fileList.value[i].size) as number)<maxsize) {
	// 			if(fileList.value[i].status==="ready") {
	// 				fd.append('file',fileList.value[i].raw as File)
	// 				//uploaded++;
	// 				cursize+=fileList.value[i].size as number
	// 			}
	// 			i++
	// 		}
	// 		uploadOnce(fd)
	// 		cursize=0
	// 	}
	// }
	
	const uploadSlices = () => {}  //to be done

	const getFileSHA = (file:File) => {
		return new Promise(resolve=>{
			const filereader=new FileReader()
			filereader.readAsArrayBuffer(file)
			filereader.onload = (e) =>{
				const buffer=e.target?.result as ArrayBuffer
				// @ts-ignore
				const wordarray=CryptoJS.lib.WordArray.create(buffer) 
				const SHA=CryptoJS.SHA256(wordarray).toString()
				resolve(SHA)
			}
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