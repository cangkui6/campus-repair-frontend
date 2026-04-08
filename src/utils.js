export const statusToneMap = {
  '待受理': 'pending',
  '待人工确认': 'warning',
  '已解析': 'parsed',
  '待分配': 'queued',
  '已派单': 'assigned',
  '处理中': 'working',
  '已完成': 'done',
  '已评价': 'reviewed',
  '已关闭': 'closed',
  '可派单': 'done',
  '暂停接单': 'warning',
  PENDING_MANUAL_REVIEW: 'warning',
  MANUAL_CONFIRMED: 'parsed',
  SUCCESS: 'done',
  FAILED_NEED_MANUAL_REVIEW: 'warning'
}

export function formatTime(value) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

export function roleLabel(role) {
  return {
    ADMIN: '管理员',
    WORKER: '维修人员',
    REPORTER: '报修用户'
  }[role] || role
}
