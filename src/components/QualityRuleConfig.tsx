import { useState, useMemo } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Database,
  Hash,
  Clock,
  Shield,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
  Copy,
  Play,
  Settings,
} from 'lucide-react'

// 数据质量六性
type QualityDimension = 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'uniqueness' | 'validity'

type RuleLevel = 'table' | 'field'
type RuleType =
  | 'null_check'           // 空值检查
  | 'range_check'          // 范围检查
  | 'pattern_check'        // 格式检查
  | 'enum_check'           // 枚举检查
  | 'fk_check'             // 外键检查
  | 'duplicate_check'      // 重复检查
  | 'timeliness_check'     // 时效检查
  | 'custom_sql'           // 自定义SQL
  | 'row_count'            // 行数检查
  | 'data_drift'           // 数据漂移
  | 'distribution_check'   // 分布检查
  | 'business_rule'        // 业务规则

interface QualityRule {
  id: string
  name: string
  code: string
  description: string
  level: RuleLevel                              // 表级或字段级
  dimension: QualityDimension                   // 六性维度
  ruleType: RuleType                            // 规则类型
  severity: 'critical' | 'high' | 'medium' | 'low'  // 严重程度
  enabled: boolean
  // 规则参数
  params: RuleParams
  // 目标对象
  targetTable?: string
  targetField?: string
  // 阈值配置
  threshold: {
    min?: number      // 最小值（如：完整性90%）
    max?: number      // 最大值
    operator: 'gte' | 'lte' | 'eq' | 'between'
  }
  // 执行配置
  schedule: {
    type: 'manual' | 'daily' | 'weekly' | 'monthly' | 'realtime'
    time?: string
  }
  // 通知配置
  notification: {
    enabled: boolean
    channels: ('email' | 'sms' | 'webhook')[]
    recipients: string[]
  }
  // 元数据
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface RuleParams {
  // 空值检查
  allowNull?: boolean

  // 范围检查
  minValue?: number
  maxValue?: number

  // 格式检查
  pattern?: string
  patternName?: string

  // 枚举检查
  enumValues?: (string | number)[]

  // 外键检查
  refTable?: string
  refField?: string

  // 重复检查
  uniqueFields?: string[]

  // 时效检查
  maxDelayHours?: number
  dateField?: string

  // 自定义SQL
  sqlTemplate?: string

  // 行数检查
  minRows?: number
  maxRows?: number

  // 数据漂移
  driftThreshold?: number
  baselineValue?: number

  // 分布检查
  distributionType?: 'normal' | 'uniform' | 'custom'
  expectedBins?: { value: string; percentage: number }[]

  // 业务规则
  expression?: string
}

// 六性配置
const qualityDimensions: Record<QualityDimension, { name: string; icon: any; color: string; description: string }> = {
  completeness: {
    name: '完整性',
    icon: CheckCircle,
    color: 'blue',
    description: '数据是否完整，无缺失',
  },
  accuracy: {
    name: '准确性',
    icon: Target,
    color: 'green',
    description: '数据是否准确反映真实情况',
  },
  consistency: {
    name: '一致性',
    icon: Shield,
    color: 'purple',
    description: '数据在不同系统中是否一致',
  },
  timeliness: {
    name: '及时性',
    icon: Clock,
    color: 'orange',
    description: '数据是否及时更新',
  },
  uniqueness: {
    name: '唯一性',
    icon: Hash,
    color: 'pink',
    description: '数据是否存在重复',
  },
  validity: {
    name: '有效性',
    icon: FileText,
    color: 'cyan',
    description: '数据是否符合业务规则',
  },
}

// 规则类型配置
const ruleTypeConfigs: Record<RuleType, { name: string; supportedLevels: RuleLevel[]; dimension?: QualityDimension }> = {
  null_check: { name: '空值检查', supportedLevels: ['field'] },
  range_check: { name: '范围检查', supportedLevels: ['field'] },
  pattern_check: { name: '格式检查', supportedLevels: ['field'] },
  enum_check: { name: '枚举检查', supportedLevels: ['field'] },
  fk_check: { name: '外键检查', supportedLevels: ['field'] },
  duplicate_check: { name: '重复检查', supportedLevels: ['table', 'field'] },
  timeliness_check: { name: '时效检查', supportedLevels: ['table', 'field'] },
  custom_sql: { name: '自定义SQL', supportedLevels: ['table', 'field'] },
  row_count: { name: '行数检查', supportedLevels: ['table'] },
  data_drift: { name: '数据漂移', supportedLevels: ['table'] },
  distribution_check: { name: '分布检查', supportedLevels: ['field'] },
  business_rule: { name: '业务规则', supportedLevels: ['table', 'field'] },
}

const QualityRuleConfig = () => {
  const [rules, setRules] = useState<QualityRule[]>([
    // 表级规则示例
    {
      id: 'r1',
      name: '用户表行数监控',
      code: 'USER_TABLE_ROW_COUNT',
      description: '监控用户表的行数，确保数据正常导入',
      level: 'table',
      dimension: 'completeness',
      ruleType: 'row_count',
      severity: 'high',
      enabled: true,
      params: { minRows: 1000000, maxRows: 20000000 },
      targetTable: 'user_info',
      threshold: { operator: 'between', min: 1000000, max: 20000000 },
      schedule: { type: 'daily', time: '02:00' },
      notification: { enabled: true, channels: ['email'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-08 15:30:00',
      tags: ['用户', '核心表'],
    },
    {
      id: 'r2',
      name: '订单表数据漂移检测',
      code: 'ORDER_DATA_DRIFT',
      description: '检测订单表数据量的异常波动',
      level: 'table',
      dimension: 'accuracy',
      ruleType: 'data_drift',
      severity: 'critical',
      enabled: true,
      params: { driftThreshold: 20, baselineValue: 50000 },
      targetTable: 'order_info',
      threshold: { operator: 'lte', max: 20 },
      schedule: { type: 'daily', time: '08:00' },
      notification: { enabled: true, channels: ['email', 'sms'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-02 09:00:00',
      updatedAt: '2024-01-07 14:20:00',
      tags: ['订单', '核心表'],
    },
    // 字段级规则示例
    {
      id: 'r3',
      name: '用户ID非空检查',
      code: 'USER_ID_NOT_NULL',
      description: '用户ID字段不能为空',
      level: 'field',
      dimension: 'completeness',
      ruleType: 'null_check',
      severity: 'critical',
      enabled: true,
      params: { allowNull: false },
      targetTable: 'user_info',
      targetField: 'user_id',
      threshold: { operator: 'eq', min: 100 },
      schedule: { type: 'realtime' },
      notification: { enabled: true, channels: ['email'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-03 11:00:00',
      updatedAt: '2024-01-06 16:45:00',
      tags: ['用户', '主键'],
    },
    {
      id: 'r4',
      name: '年龄范围检查',
      code: 'AGE_RANGE_CHECK',
      description: '用户年龄必须在0-120岁之间',
      level: 'field',
      dimension: 'validity',
      ruleType: 'range_check',
      severity: 'high',
      enabled: true,
      params: { minValue: 0, maxValue: 120 },
      targetTable: 'user_info',
      targetField: 'user_age',
      threshold: { operator: 'eq', min: 100 },
      schedule: { type: 'daily', time: '03:00' },
      notification: { enabled: true, channels: ['email'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-04 13:00:00',
      updatedAt: '2024-01-05 10:15:00',
      tags: ['用户', '数据验证'],
    },
    {
      id: 'r5',
      name: '手机号格式检查',
      code: 'PHONE_PATTERN_CHECK',
      description: '手机号必须符合中国大陆手机号格式',
      level: 'field',
      dimension: 'validity',
      ruleType: 'pattern_check',
      severity: 'high',
      enabled: true,
      params: { pattern: '^1[3-9]\\d{9}$', patternName: '中国大陆手机号' },
      targetTable: 'user_info',
      targetField: 'phone_number',
      threshold: { operator: 'gte', min: 95 },
      schedule: { type: 'daily', time: '03:00' },
      notification: { enabled: true, channels: ['email'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-05 15:00:00',
      updatedAt: '2024-01-08 09:30:00',
      tags: ['用户', '格式验证'],
    },
    {
      id: 'r6',
      name: '用户性别枚举检查',
      code: 'GENDER_ENUM_CHECK',
      description: '性别字段值必须是：男、女、未知',
      level: 'field',
      dimension: 'validity',
      ruleType: 'enum_check',
      severity: 'medium',
      enabled: true,
      params: { enumValues: ['男', '女', '未知'] },
      targetTable: 'user_info',
      targetField: 'gender',
      threshold: { operator: 'eq', min: 100 },
      schedule: { type: 'daily', time: '03:00' },
      notification: { enabled: false, channels: [], recipients: [] },
      createdBy: 'admin',
      createdAt: '2024-01-06 10:00:00',
      updatedAt: '2024-01-07 11:20:00',
      tags: ['用户', '枚举验证'],
    },
    {
      id: 'r7',
      name: '订单用户外键检查',
      code: 'ORDER_USER_FK_CHECK',
      description: '订单表的user_id必须关联到用户表',
      level: 'field',
      dimension: 'consistency',
      ruleType: 'fk_check',
      severity: 'critical',
      enabled: true,
      params: { refTable: 'user_info', refField: 'user_id' },
      targetTable: 'order_info',
      targetField: 'user_id',
      threshold: { operator: 'eq', min: 100 },
      schedule: { type: 'daily', time: '04:00' },
      notification: { enabled: true, channels: ['email', 'webhook'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-07 14:00:00',
      updatedAt: '2024-01-08 12:00:00',
      tags: ['订单', '外键'],
    },
    {
      id: 'r8',
      name: '订单号唯一性检查',
      code: 'ORDER_ID_UNIQUE',
      description: '订单号必须唯一，不能有重复',
      level: 'field',
      dimension: 'uniqueness',
      ruleType: 'duplicate_check',
      severity: 'critical',
      enabled: true,
      params: { uniqueFields: ['order_id'] },
      targetTable: 'order_info',
      targetField: 'order_id',
      threshold: { operator: 'eq', min: 100 },
      schedule: { type: 'realtime' },
      notification: { enabled: true, channels: ['email', 'sms'], recipients: ['admin@example.com'] },
      createdBy: 'admin',
      createdAt: '2024-01-08 09:00:00',
      updatedAt: '2024-01-08 09:00:00',
      tags: ['订单', '唯一性'],
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | 'table' | 'field'>('all')
  const [filterDimension, setFilterDimension] = useState<QualityDimension | 'all'>('all')
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null)
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  // 统计信息
  const summary = useMemo(() => {
    return {
      total: rules.length,
      enabled: rules.filter(r => r.enabled).length,
      byLevel: {
        table: rules.filter(r => r.level === 'table').length,
        field: rules.filter(r => r.level === 'field').length,
      },
      byDimension: Object.keys(qualityDimensions).reduce((acc, dim) => {
        acc[dim as QualityDimension] = rules.filter(r => r.dimension === dim).length
        return acc
      }, {} as Record<QualityDimension, number>),
      bySeverity: {
        critical: rules.filter(r => r.severity === 'critical').length,
        high: rules.filter(r => r.severity === 'high').length,
        medium: rules.filter(r => r.severity === 'medium').length,
        low: rules.filter(r => r.severity === 'low').length,
      },
    }
  }, [rules])

  // 过滤规则
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === 'all' || rule.level === filterLevel
    const matchesDimension = filterDimension === 'all' || rule.dimension === filterDimension
    return matchesSearch && matchesLevel && matchesDimension
  })

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-gray-100 text-gray-700 border-gray-300',
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  const getSeverityLabel = (severity: string) => {
    const labels = {
      critical: '严重',
      high: '高',
      medium: '中',
      low: '低',
    }
    return labels[severity as keyof typeof labels] || severity
  }

  const getDimensionInfo = (dimension: QualityDimension) => {
    return qualityDimensions[dimension]
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRules(newExpanded)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      setRules(prev => prev.filter(r => r.id !== id))
    }
  }

  const handleToggleEnabled = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, enabled: !r.enabled }
      }
      return r
    }))
  }

  const handleDuplicate = (rule: QualityRule) => {
    const newRule: QualityRule = {
      ...rule,
      id: `r${Date.now()}`,
      name: `${rule.name} (副本)`,
      code: `${rule.code}_COPY`,
      enabled: false,
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    }
    setRules(prev => [...prev, newRule])
  }

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">质量规则配置</h3>
          <p className="text-xs text-slate-500 mt-0.5">配置表级和字段级的数据质量检测规则</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          新增规则
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded">
              <Settings className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">总规则</p>
              <p className="text-lg font-bold text-slate-800">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">已启用</p>
              <p className="text-lg font-bold text-green-600">{summary.enabled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded">
              <Database className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">表级</p>
              <p className="text-lg font-bold text-purple-600">{summary.byLevel.table}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-1.5 rounded">
              <Hash className="w-3.5 h-3.5 text-pink-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">字段级</p>
              <p className="text-lg font-bold text-pink-600">{summary.byLevel.field}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">严重级别</p>
              <p className="text-lg font-bold text-red-600">{summary.bySeverity.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 六性维度统计 */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
        <p className="text-xs font-medium text-slate-700 mb-2">按质量维度统计（六性）</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(qualityDimensions) as [QualityDimension, typeof qualityDimensions[QualityDimension]][]).map(([key, config]) => {
            const Icon = config.icon
            const count = summary.byDimension[key]
            return (
              <div
                key={key}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                  filterDimension === key
                    ? `bg-${config.color}-50 border-${config.color}-300`
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => setFilterDimension(filterDimension === key ? 'all' : key)}
              >
                <Icon className={`w-3.5 h-3.5 text-${config.color}-600`} />
                <span className="text-xs font-medium text-slate-700">{config.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  count > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索规则名称、编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as 'all' | 'table' | 'field')}
              className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部级别</option>
              <option value="table">表级规则</option>
              <option value="field">字段级规则</option>
            </select>
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">
              <Filter className="w-3 h-3" />
              更多筛选
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedRules.size > 0 && (
              <>
                <span className="text-xs text-slate-500">已选 {selectedRules.size} 项</span>
                <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded">
                  <CheckCircle className="w-3 h-3" />
                  批量启用
                </button>
                <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded">
                  <XCircle className="w-3 h-3" />
                  批量禁用
                </button>
              </>
            )}
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">
              导出配置
            </button>
          </div>
        </div>
      </div>

      {/* 规则列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-200">
          {filteredRules.map((rule) => {
            const isExpanded = expandedRules.has(rule.id)
            const dimensionInfo = getDimensionInfo(rule.dimension)
            const DimensionIcon = dimensionInfo.icon

            return (
              <div key={rule.id} className="hover:bg-slate-50 transition-colors">
                {/* 规则卡片头部 */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRules.has(rule.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedRules)
                        if (newSelected.has(rule.id)) {
                          newSelected.delete(rule.id)
                        } else {
                          newSelected.add(rule.id)
                        }
                        setSelectedRules(newSelected)
                      }}
                      className="w-3.5 h-3.5 rounded border-slate-300"
                    />
                    <button
                      onClick={() => toggleExpand(rule.id)}
                      className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* 启用开关 */}
                    <button
                      onClick={() => handleToggleEnabled(rule.id)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${
                          rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* 规则名称和编码 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800">{rule.name}</span>
                      <span className="text-[10px] text-slate-400">({rule.code})</span>
                    </div>

                    {/* 规则级别标签 */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      rule.level === 'table' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {rule.level === 'table' ? '表级' : '字段级'}
                    </span>

                    {/* 质量维度标签 */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] bg-${dimensionInfo.color}-100 text-${dimensionInfo.color}-700`}>
                      {dimensionInfo.name}
                    </span>

                    {/* 严重程度标签 */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getSeverityColor(rule.severity)}`}>
                      {getSeverityLabel(rule.severity)}
                    </span>

                    {/* 规则类型 */}
                    <span className="text-[10px] text-slate-500">
                      {ruleTypeConfigs[rule.ruleType].name}
                    </span>

                    {/* 目标对象 */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      {rule.level === 'table' ? (
                        <>
                          <Database className="w-3 h-3" />
                          {rule.targetTable}
                        </>
                      ) : (
                        <>
                          <Hash className="w-3 h-3" />
                          {rule.targetTable}.{rule.targetField}
                        </>
                      )}
                    </div>

                    <div className="flex-1" />

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-0.5">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="测试规则"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(rule)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="复制规则"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        title="编辑规则"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="删除规则"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 规则描述（始终显示） */}
                  <div className="ml-9 mt-1">
                    <p className="text-xs text-slate-600 line-clamp-1">{rule.description}</p>
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-3 pb-3 ml-9 space-y-2 border-t border-slate-100 pt-2">
                    {/* 阈值配置 */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2 rounded">
                        <p className="text-slate-500 font-medium mb-1">阈值配置</p>
                        {rule.threshold.operator === 'between' && (
                          <p className="text-slate-700">
                            {rule.threshold.min} ~ {rule.threshold.max}
                          </p>
                        )}
                        {rule.threshold.operator === 'gte' && (
                          <p className="text-slate-700">≥ {rule.threshold.min}</p>
                        )}
                        {rule.threshold.operator === 'lte' && (
                          <p className="text-slate-700">≤ {rule.threshold.max}</p>
                        )}
                        {rule.threshold.operator === 'eq' && (
                          <p className="text-slate-700">= {rule.threshold.min}%</p>
                        )}
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <p className="text-slate-500 font-medium mb-1">执行计划</p>
                        <p className="text-slate-700">
                          {rule.schedule.type === 'manual' && '手动执行'}
                          {rule.schedule.type === 'realtime' && '实时检测'}
                          {rule.schedule.type === 'daily' && `每天 ${rule.schedule.time}`}
                          {rule.schedule.type === 'weekly' && '每周执行'}
                          {rule.schedule.type === 'monthly' && '每月执行'}
                        </p>
                      </div>
                    </div>

                    {/* 规则参数 */}
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <p className="text-blue-600 font-medium mb-1">规则参数</p>
                      <div className="grid grid-cols-3 gap-2 text-slate-700">
                        {rule.ruleType === 'null_check' && (
                          <>
                            <p>允许空值: {rule.params.allowNull ? '是' : '否'}</p>
                          </>
                        )}
                        {rule.ruleType === 'range_check' && (
                          <>
                            <p>最小值: {rule.params.minValue}</p>
                            <p>最大值: {rule.params.maxValue}</p>
                          </>
                        )}
                        {rule.ruleType === 'pattern_check' && (
                          <>
                            <p>格式名称: {rule.params.patternName}</p>
                            <p className="col-span-2 font-mono text-[10px]">{rule.params.pattern}</p>
                          </>
                        )}
                        {rule.ruleType === 'enum_check' && (
                          <>
                            <p className="col-span-3">
                              枚举值: {rule.params.enumValues?.join(', ')}
                            </p>
                          </>
                        )}
                        {rule.ruleType === 'fk_check' && (
                          <>
                            <p>引用表: {rule.params.refTable}</p>
                            <p>引用字段: {rule.params.refField}</p>
                          </>
                        )}
                        {rule.ruleType === 'row_count' && (
                          <>
                            <p>最小行数: {rule.params.minRows?.toLocaleString()}</p>
                            <p>最大行数: {rule.params.maxRows?.toLocaleString()}</p>
                          </>
                        )}
                        {rule.ruleType === 'data_drift' && (
                          <>
                            <p>漂移阈值: {rule.params.driftThreshold}%</p>
                            <p>基准值: {rule.params.baselineValue?.toLocaleString()}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 通知配置 */}
                    {rule.notification.enabled && (
                      <div className="bg-orange-50 p-2 rounded text-xs">
                        <p className="text-orange-600 font-medium mb-1">通知配置</p>
                        <div className="flex items-center gap-3 text-slate-700">
                          <p>渠道: {rule.notification.channels.join(', ')}</p>
                          <p>接收人: {rule.notification.recipients.join(', ')}</p>
                        </div>
                      </div>
                    )}

                    {/* 标签和元数据 */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      {rule.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {rule.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span>•</span>
                      <span>更新: {rule.updatedAt.split(' ')[0]}</span>
                      <span>•</span>
                      <span>创建人: {rule.createdBy}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredRules.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无规则配置</p>
              <p className="text-xs mt-1">请调整搜索条件或添加新的规则</p>
            </div>
          )}
        </div>
      </div>

      {/* 创建规则模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* 模态框头部 */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <h3 className="text-base font-bold text-slate-800">新增质量规则</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <p className="text-slate-500 text-center py-8">
                规则创建向导（待实现）
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QualityRuleConfig
