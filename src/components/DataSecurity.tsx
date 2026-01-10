import { useState } from 'react'
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  User,
  Calendar,
  Tag,
  Database,
  FileText,
  Settings,
  Download,
  Upload,
} from 'lucide-react'

type DataLevel = 'public' | 'internal' | 'confidential' | 'secret'
type ScanStatus = 'pending' | 'scanning' | 'completed' | 'failed'

interface SensitiveData {
  id: string
  name: string
  type: string
  level: DataLevel
  location: string
  pattern: string
  sample: string
  count: number
  lastScanned: string
  status: ScanStatus
  description: string
  riskScore: number
}

interface DataRule {
  id: string
  name: string
  type: 'masking' | 'encryption' | 'access_control' | 'audit'
  level: DataLevel[]
  target: string
  description: string
  enabled: boolean
  createdAt: string
}

interface AccessLog {
  id: string
  user: string
  action: string
  resource: string
  level: DataLevel
  timestamp: string
  ip: string
  status: 'success' | 'denied'
}

const DataSecurity = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensitive' | 'rules' | 'logs'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const [sensitiveData, setSensitiveData] = useState<SensitiveData[]>([
    {
      id: '1',
      name: '用户手机号',
      type: '手机号',
      level: 'confidential',
      location: 'user_info.phone',
      pattern: '1[3-9]\\d{9}',
      sample: '138****5678',
      count: 1250000,
      lastScanned: '2024-01-08',
      status: 'completed',
      description: '用户注册手机号码',
      riskScore: 85,
    },
    {
      id: '2',
      name: '身份证号',
      type: '身份证',
      level: 'secret',
      location: 'user_info.id_card',
      pattern: '\\d{17}[\\dXx]',
      sample: '**************1234',
      count: 1250000,
      lastScanned: '2024-01-08',
      status: 'completed',
      description: '用户身份证号码',
      riskScore: 95,
    },
    {
      id: '3',
      name: '银行卡号',
      type: '银行卡',
      level: 'secret',
      location: 'payment.card_number',
      pattern: '\\d{16,19}',
      sample: '************5678',
      count: 850000,
      lastScanned: '2024-01-08',
      status: 'completed',
      description: '支付银行卡号',
      riskScore: 90,
    },
    {
      id: '4',
      name: '邮箱地址',
      type: '邮箱',
      level: 'internal',
      location: 'user_info.email',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      sample: 'u***@example.com',
      count: 1250000,
      lastScanned: '2024-01-07',
      status: 'completed',
      description: '用户邮箱地址',
      riskScore: 60,
    },
    {
      id: '5',
      name: '家庭住址',
      type: '地址',
      level: 'confidential',
      location: 'user_info.address',
      pattern: '.*',
      sample: '北京市朝阳区***',
      count: 1200000,
      lastScanned: '2024-01-07',
      status: 'completed',
      description: '用户详细地址',
      riskScore: 75,
    },
    {
      id: '6',
      name: '工资收入',
      type: '财务信息',
      level: 'confidential',
      location: 'salary.income',
      pattern: '\\d+',
      sample: '*****',
      count: 50000,
      lastScanned: '2024-01-06',
      status: 'completed',
      description: '员工工资收入',
      riskScore: 80,
    },
  ])

  const [dataRules, setDataRules] = useState<DataRule[]>([
    {
      id: '1',
      name: '手机号脱敏规则',
      type: 'masking',
      level: ['confidential', 'secret'],
      target: 'user_info.phone',
      description: '手机号中间4位脱敏',
      enabled: true,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: '身份证加密规则',
      type: 'encryption',
      level: ['secret'],
      target: 'user_info.id_card',
      description: '身份证号AES-256加密存储',
      enabled: true,
      createdAt: '2024-01-01',
    },
    {
      id: '3',
      name: '银行卡访问控制',
      type: 'access_control',
      level: ['secret'],
      target: 'payment.*',
      description: '仅财务部门可访问银行卡信息',
      enabled: true,
      createdAt: '2024-01-02',
    },
    {
      id: '4',
      name: '敏感数据审计',
      type: 'audit',
      level: ['confidential', 'secret'],
      target: '*',
      description: '记录所有敏感数据的访问日志',
      enabled: true,
      createdAt: '2024-01-01',
    },
  ])

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      user: '张三',
      action: '查询',
      resource: 'user_info.phone',
      level: 'confidential',
      timestamp: '2024-01-08 14:30:25',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      user: '李四',
      action: '导出',
      resource: 'user_info.id_card',
      level: 'secret',
      timestamp: '2024-01-08 14:25:10',
      ip: '192.168.1.101',
      status: 'denied',
    },
    {
      id: '3',
      user: '王五',
      action: '修改',
      resource: 'salary.income',
      level: 'confidential',
      timestamp: '2024-01-08 14:20:05',
      ip: '192.168.1.102',
      status: 'success',
    },
    {
      id: '4',
      user: '赵六',
      action: '查询',
      resource: 'payment.card_number',
      level: 'secret',
      timestamp: '2024-01-08 14:15:30',
      ip: '192.168.1.103',
      status: 'success',
    },
  ])

  const getLevelColor = (level: DataLevel) => {
    const colors = {
      public: 'bg-green-100 text-green-700 border-green-200',
      internal: 'bg-blue-100 text-blue-700 border-blue-200',
      confidential: 'bg-orange-100 text-orange-700 border-orange-200',
      secret: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[level]
  }

  const getLevelLabel = (level: DataLevel) => {
    const labels = {
      public: '公开',
      internal: '内部',
      confidential: '机密',
      secret: '绝密',
    }
    return labels[level]
  }

  const getLevelIcon = (level: DataLevel) => {
    if (level === 'public') return <Unlock className="w-4 h-4" />
    if (level === 'secret') return <Lock className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

  const getStatusColor = (status: ScanStatus) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-600',
      scanning: 'bg-blue-100 text-blue-600',
      completed: 'bg-green-100 text-green-600',
      failed: 'bg-red-100 text-red-600',
    }
    return colors[status]
  }

  const getStatusLabel = (status: ScanStatus) => {
    const labels = {
      pending: '待扫描',
      scanning: '扫描中',
      completed: '已完成',
      failed: '失败',
    }
    return labels[status]
  }

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-50'
    if (score >= 70) return 'text-orange-600 bg-orange-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const summary = {
    totalSensitive: sensitiveData.length,
    highRisk: sensitiveData.filter(d => d.riskScore >= 90).length,
    mediumRisk: sensitiveData.filter(d => d.riskScore >= 70 && d.riskScore < 90).length,
    lowRisk: sensitiveData.filter(d => d.riskScore < 70).length,
    rulesEnabled: dataRules.filter(r => r.enabled).length,
    totalRules: dataRules.length,
    todayAccess: accessLogs.length,
    deniedAccess: accessLogs.filter(l => l.status === 'denied').length,
  }

  const filteredData = sensitiveData.filter(data => {
    const matchesSearch = data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || data.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">数据安全管理</h3>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          添加规则
        </button>
      </div>

      {/* Tab切换 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: '概览', icon: Shield },
            { id: 'sensitive', label: '敏感数据', icon: Eye },
            { id: 'rules', label: '安全规则', icon: Settings },
            { id: 'logs', label: '访问日志', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 概览页面 */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 p-1.5 rounded">
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">敏感数据</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalSensitive}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-1.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">高风险</p>
                  <p className="text-lg font-bold text-orange-600">{summary.highRisk}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">生效规则</p>
                  <p className="text-lg font-bold text-blue-600">{summary.rulesEnabled}/{summary.totalRules}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">今日访问</p>
                  <p className="text-lg font-bold text-green-600">{summary.todayAccess}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 风险分布 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">敏感数据风险分布</h4>
            <div className="space-y-2">
              {sensitiveData.map((data) => (
                <div key={data.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{data.name}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getRiskColor(data.riskScore)}`}>
                        {data.riskScore}分
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${data.riskScore}%`,
                          backgroundColor: data.riskScore >= 90 ? '#dc2626' : data.riskScore >= 70 ? '#f97316' : data.riskScore >= 50 ? '#eab308' : '#22c55e',
                        }}
                      />
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getLevelColor(data.level)}`}>
                    {getLevelLabel(data.level)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">快速操作</h4>
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                <Search className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-blue-700">敏感数据扫描</p>
                  <p className="text-[10px] text-blue-500">发现并分类敏感数据</p>
                </div>
              </button>
              <button className="flex items-center gap-2 p-2.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                <Shield className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-700">配置安全策略</p>
                  <p className="text-[10px] text-green-500">设置数据保护规则</p>
                </div>
              </button>
              <button className="flex items-center gap-2 p-2.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <Download className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-medium text-purple-700">导出安全报告</p>
                  <p className="text-[10px] text-purple-500">生成合规报告</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 敏感数据页面 */}
      {activeTab === 'sensitive' && (
        <div className="space-y-3">
          {/* 工具栏 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索敏感数据..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="all">全部级别</option>
                <option value="public">公开</option>
                <option value="internal">内部</option>
                <option value="confidential">机密</option>
                <option value="secret">绝密</option>
              </select>
              <button className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors">
                <Search className="w-3 h-3" />
                扫描
              </button>
            </div>
          </div>

          {/* 数据列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">名称</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">类型</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">级别</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">位置</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">样本</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">数量</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">风险</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">状态</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.map((data) => (
                    <tr key={data.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-slate-800">{data.name}</p>
                          <p className="text-[10px] text-slate-500">{data.description}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-slate-600">{data.type}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getLevelColor(data.level)}`}>
                          <span className="flex items-center gap-1">
                            {getLevelIcon(data.level)}
                            {getLevelLabel(data.level)}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{data.location}</code>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{data.sample}</code>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-slate-600">{data.count.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getRiskColor(data.riskScore)}`}>
                          {data.riskScore}分
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(data.status)}`}>
                          {getStatusLabel(data.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="查看">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 text-slate-600 hover:bg-slate-100 rounded" title="编辑">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 安全规则页面 */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {/* 规则列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">安全规则列表</h4>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                <Plus className="w-3 h-3" />
                新增规则
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {dataRules.map((rule) => (
                <div key={rule.id} className="p-3 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-red-100' : 'bg-slate-100'}`}>
                        {rule.type === 'masking' && <EyeOff className="w-4 h-4 text-slate-600" />}
                        {rule.type === 'encryption' && <Lock className="w-4 h-4 text-slate-600" />}
                        {rule.type === 'access_control' && <Key className="w-4 h-4 text-slate-600" />}
                        {rule.type === 'audit' && <FileText className="w-4 h-4 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-800">{rule.name}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${rule.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                            {rule.enabled ? '已启用' : '已禁用'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{rule.description}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{rule.target}</code>
                          <div className="flex gap-1">
                            {rule.level.map((level) => (
                              <span key={level} className={`px-1.5 py-0.5 rounded text-[10px] border ${getLevelColor(level)}`}>
                                {getLevelLabel(level)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button className="p-1 text-slate-600 hover:bg-slate-100 rounded" title="编辑">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDataRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                        }}
                        className={`p-1 rounded ${rule.enabled ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={rule.enabled ? '禁用' : '启用'}
                      >
                        {rule.enabled ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 访问日志页面 */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {/* 日志统计 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">今日访问</p>
                  <p className="text-lg font-bold text-slate-800">{summary.todayAccess}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">成功</p>
                  <p className="text-lg font-bold text-green-600">{summary.todayAccess - summary.deniedAccess}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 p-1.5 rounded">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">拒绝</p>
                  <p className="text-lg font-bold text-red-600">{summary.deniedAccess}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 日志列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">访问日志</h4>
              <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors">
                <Download className="w-3 h-3" />
                导出
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">用户</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">操作</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">资源</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">级别</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">IP</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">时间</th>
                    <th className="px-3 py-2 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="text-xs text-slate-700">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-slate-600">{log.action}</span>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{log.resource}</code>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getLevelColor(log.level)}`}>
                          {getLevelLabel(log.level)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-slate-600">{log.ip}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-slate-600">{log.timestamp}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${log.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {log.status === 'success' ? '成功' : '拒绝'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSecurity
