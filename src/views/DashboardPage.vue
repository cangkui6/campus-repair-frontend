<template>
  <ReporterHub v-if="authState.user?.role==='REPORTER'" />
  <WorkerHub v-else-if="authState.user?.role==='WORKER'" />
  <AdminHub v-else />
</template>

<script setup>
import { authState } from '../store/auth'
import ReporterHub from '../components/ReporterHub.vue'
import WorkerHub from '../components/WorkerHub.vue'
import AdminHub from '../components/AdminHub.vue'
</script>
