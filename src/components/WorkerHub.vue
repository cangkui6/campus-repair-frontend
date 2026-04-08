<template>
  <div class="app-shell">
    <aside class="sidebar card"><div><div class="eyebrow">Campus Repair Console</div><h2>{{ roleLabel(authState.user?.role) }}</h2><p class="subtle">{{ authState.user?.realName }} · {{ authState.user?.username }}</p></div><nav class="nav-list"><button v-for="item in tabs" :key="item.key" class="nav-item" :class="{ active: activeTab===item.key }" @click="activeTab=item.key"><span>{{ item.icon }}</span>{{ item.label }}</button></nav><button class="btn btn-ghost" @click="logout">退出登录</button></aside>
    <main class="content-grid">
      <section class="hero card"><div><div class="eyebrow">Worker Hub</div><h1>维修人员闭环工作台</h1><p class="subtle">覆盖我的任务、抢单大厅、历史处理记录与个人负载绩效视图。</p></div></section>
      <section v-if="activeTab==='tasks'" class="card panel stack-lg"><div class="section-head"><div><div class="eyebrow">Worker</div><h3>我的任务</h3></div><button class="btn btn-ghost" @click="loadWorker">刷新</button></div><div v-if="tasks.length" class="kanban-grid"><article v-for="item in tasks" :key="item.ticketId" class="ticket-card"><div class="ticket-card__head"><strong>{{ item.ticketNo }}</strong><StatusPill :label="item.status"/></div><p>{{ item.locationText||'待管理员补充位置' }}</p><small>{{ item.faultDesc||'待解析' }}</small><div class="cluster"><button v-if="item.status==='已派单'" class="btn btn-primary" @click="acceptTask(item.ticketId)">接单</button><button v-if="item.status==='已派单'" class="btn btn-ghost" @click="rejectTask(item.ticketId)">拒单</button><button v-if="item.status==='处理中'" class="btn btn-ghost" @click="completeTask(item.ticketId)">完工</button></div></article></div><EmptyState v-else title="当前暂无任务" text="管理员派单后任务会出现在这里。"/></section>
      <section v-if="activeTab==='grab'" class="card panel stack-lg"><div class="section-head"><div><div class="eyebrow">Worker</div><h3>待分配工单池 / 抢单</h3></div><button class="btn btn-ghost" @click="loadAvailableTasks">刷新</button></div><div v-if="availableTasks.length" class="kanban-grid"><article v-for="item in availableTasks" :key="item.ticketId" class="ticket-card"><div class="ticket-card__head"><strong>{{ item.ticketNo }}</strong><StatusPill :label="item.status"/></div><p>{{ item.locationText||'待解析' }}</p><small>{{ item.faultDesc||'待解析' }}</small><button class="btn btn-primary" @click="grabTask(item.ticketId)">抢单</button></article></div><EmptyState v-else title="暂无可抢工单" text="待分配池为空时，这里会自动显示为空。"/></section>
      <section v-if="activeTab==='history'" class="card panel stack-lg"><div class="section-head"><div><div class="eyebrow">Worker</div><h3>我的历史处理记录</h3></div><button class="btn btn-ghost" @click="loadHistory">刷新</button></div><div v-if="history.length" class="table-wrap"><table><thead><tr><th>工单号</th><th>位置</th><th>故障</th><th>状态</th><th>提交</th><th>完成</th></tr></thead><tbody><tr v-for="item in history" :key="item.ticketId"><td>{{ item.ticketNo }}</td><td>{{ item.locationText||'-' }}</td><td>{{ item.faultDesc||'-' }}</td><td><StatusPill :label="item.status"/></td><td>{{ formatTime(item.submittedAt) }}</td><td>{{ formatTime(item.completedAt) }}</td></tr></tbody></table></div><EmptyState v-else title="暂无历史处理记录" text="完工后的记录会出现在这里。"/></section>
      <section v-if="activeTab==='profile'" class="card panel stack-lg"><div class="section-head"><div><div class="eyebrow">Worker</div><h3>负载 / 绩效自视图</h3></div><button class="btn btn-ghost" @click="loadProfile">刷新</button></div><div v-if="profile" class="profile-grid"><div><span>姓名</span><strong>{{ profile.workerName }}</strong></div><div><span>技能标签</span><strong>{{ profile.skillTags }}</strong></div><div><span>服务区域</span><strong>{{ profile.serviceArea }}</strong></div><div><span>当前负载</span><strong>{{ profile.currentLoad }}</strong></div><div><span>接单率</span><strong>{{ formatPercent(profile.acceptRate) }}</strong></div><div><span>平均完工</span><strong>{{ profile.avgCompleteHours }}h</strong></div><div><span>历史完工量</span><strong>{{ profile.completedTicketCount }}</strong></div><div><span>改派次数</span><strong>{{ profile.reassignCount }}</strong></div><div><span>处理中任务</span><strong>{{ profile.processingCount }}</strong></div><div><span>历史记录数</span><strong>{{ profile.historyCount }}</strong></div></div><EmptyState v-else title="暂无画像信息" text="当前维修人员画像尚未生成。"/></section>
      <section class="card panel stack-lg"><p v-if="feedback.global" class="feedback feedback-success">{{ feedback.global }}</p><p v-if="feedback.error" class="feedback feedback-error">{{ feedback.error }}</p></section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http,{ unwrap } from '../api'
import { authState, clearAuth } from '../store/auth'
import { formatTime, roleLabel } from '../utils'
import StatusPill from './StatusPill.vue'
import EmptyState from './EmptyState.vue'
const router=useRouter(),activeTab=ref('tasks'),tasks=ref([]),availableTasks=ref([]),history=ref([]),profile=ref(null),feedback=reactive({global:'',error:''})
const tabs=[{key:'tasks',label:'我的任务',icon:'◉'},{key:'grab',label:'抢单大厅',icon:'⬢'},{key:'history',label:'历史记录',icon:'⌛'},{key:'profile',label:'我的绩效',icon:'✺'}]
const reset=()=>{feedback.global='';feedback.error=''},logout=()=>{clearAuth();router.push('/login')},formatPercent=(v)=>v==null?'-':`${Math.round(Number(v)*100)}%`
async function safeRun(task,msg=''){reset();try{await task();if(msg)feedback.global=msg}catch(err){feedback.error=err.message||'操作失败'}}
async function loadWorker(){tasks.value=unwrap(await http.get('/worker/tasks?page=1&size=20')).records||[]}
async function loadAvailableTasks(){availableTasks.value=unwrap(await http.get('/worker/available-tasks?page=1&size=20')).records||[]}
async function loadHistory(){history.value=unwrap(await http.get('/worker/history?page=1&size=20')).records||[]}
async function loadProfile(){profile.value=unwrap(await http.get('/worker/profile'))}
async function acceptTask(id){await safeRun(async()=>{await http.post(`/tickets/${id}/accept`);await loadWorker();await loadProfile()},'已接单，工单进入处理中')}
async function rejectTask(id){const reason=window.prompt('请输入拒单原因','当前技能不匹配或时间冲突');if(reason===null)return;await safeRun(async()=>{await http.post(`/worker/tasks/${id}/reject`,{reason});await loadWorker();await loadAvailableTasks();await loadProfile()},'已拒单，工单退回待分配池')}
async function grabTask(id){await safeRun(async()=>{await http.post(`/worker/tasks/${id}/grab`);await loadWorker();await loadAvailableTasks();await loadProfile()},'抢单成功')}
async function completeTask(id){const repairResult=window.prompt('请输入维修结果','已完成维修，设备恢复运行');if(!repairResult)return;await safeRun(async()=>{await http.post(`/tickets/${id}/complete`,{repairResult});await loadWorker();await loadHistory();await loadProfile()},'维修结果已提交')}
onMounted(async()=>{await loadWorker();await loadAvailableTasks();await loadHistory();await loadProfile()})
</script>
