import { useState } from 'react'
import { Play, RefreshCw, CheckCircle, XCircle, AlertTriangle, Search, Filter, Download, Upload, Activity, Settings, ArrowRight } from 'lucide-react'
import QualityRuleConfig from './QualityRuleConfig'

interface CheckItem {
  id: string
  name: string
  type: 'completeness' | 'accuracy' | 'consistency' | 'timeliness'
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning'
  result?: {
    total: number
    passed: number
    failed: number
    warning: number
    score: number
  }
  duration?: number
}

const QualityCheck = () => {
  const [viewMode, setViewMode] = useState<'check' | 'config'>('check')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    {
      id: '1',
      name: '业务对象完整性检测',
      type: 'completeness',
      status: 'pending',
    },
    {
      id: '2',
      name: '字段映射准确性验证',
      type: 'accuracy',
      status: 'pending',
    },
    {
      id: '3',
      name: '数据一致性校验',
      type: 'consistency',
      status: 'pending',
    },
    {
      id: '4',
      name: '元数据时效性检查',
      type: 'timeliness',
      status: 'pending',
    },
    {
      id: '5',
      name: '业务规则合规性检测',
      type: 'accuracy',
      status: 'pending',
    },
    {
      id: '6',
      name: '数据源连通性测试',
      type: 'consistency',
      status: 'pending',
    },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const runCheck = async () => {
    if (selectedItems.size === 0) return

    setIsRunning(true)

    // 模拟检测过程
    const itemsToCheck = checkItems.filter(item => selectedItems.has(item.id))

    for (let i = 0; i < itemsToCheck.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCheckItems(prev => prev.map(item => {
        if (item.id === itemsToCheck[i].id) {
          const statuses: Array<'passed' | 'failed' | 'warning'> = ['passed', 'failed', 'warning']
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
          const score = randomStatus === 'passed' ? 95 + Math.random() * 5 :
                       randomStatus === 'warning' ? 70 + Math.random() * 20 :
                       40 + Math.random() * 30

          return {
            ...item,
            status: randomStatus,
            result: {
              total: Math.floor(100 + Math.random() * 900),
              passed: Math.floor(80 + Math.random() * 20),
              failed: Math.floor(Math.random() * 10),
              warning: Math.floor(Math.random() * 10),
              score: Math.floor(score),
            },
            duration: Math.floor(500 + Math.random() * 2000),
          }
        }
        return item
      }))
    }

    setIsRunning(false)
  }

  const resetChecks = () => {
    setCheckItems(prev => prev.map(item => ({
      ...item,
      status: 'pending',
      result: undefined,
      duration: undefined,
    })))
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      completeness: '完整性',
      accuracy: '准确性',
      consistency: '一致性',
      timeliness: '时效性',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      completeness: 'bg-blue-100 text-blue-700',
      accuracy: 'bg-green-100 text-green-700',
      consistency: 'bg-purple-100 text-purple-700',
      timeliness: 'bg-orange-100 text-orange-700',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const summary = checkItems.reduce((acc, item) => {
    if (item.result) {
      acc.passed += item.result.passed
      acc.failed += item.result.failed
      acc.warning += item.result.warning
    }
    return acc
  }, { passed: 0, failed: 0, warning: 0 })

  return (
    <div className="space-y-6">
      {/* 页面标题和视图切换 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">质量检测</h2>
          <p className="text-slate-500 mt-1">对语义治理数据进行全面的质量检测和评估</p>
        </div>
        <div className="flex gap-3">
          {/* 视图切换按钮 */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('check')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'check'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              执行检测
            </button>
            <button
              onClick={() => setViewMode('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'config'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              规则配置
            </button>
          </div>
          {viewMode === 'check' && (
            <>
              <button
                onClick={resetChecks}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重置
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
                导入配置
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                导出结果
              </button>
            </>
          )}
        </div>
      </div>

      {/* 规则配置视图 */}
      {viewMode === 'config' && <QualityRuleConfig />}

      {/* 检测执行视图 */}
      {viewMode === 'check' && (
      <>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总检测项</p>
              <p className="text-3xl font-bold text-slate-800">{checkItems.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">通过</p>
              <p className="text-3xl font-bold text-green-600">{summary.passed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">警告</p>
              <p className="text-3xl font-bold text-yellow-600">{summary.warning}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">失败</p>
              <p className="text-3xl font-bold text-red-600">{summary.failed}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 检测项列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索检测项..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">已选择: {selectedItems.size} 项</span>
            <button
              onClick={runCheck}
              disabled={isRunning || selectedItems.size === 0}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <Play className="w-4 h-4" />
              {isRunning ? '检测中...' : '开始检测'}
            </button>
          </div>
        </div>

        {/* 表头 */}
        <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.size === checkItems.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(checkItems.map(item => item.id)))
                } else {
                  setSelectedItems(new Set())
                }
              }}
              className="w-4 h-4 rounded border-slate-300"
            />
          </div>
          <div className="col-span-4">检测项名称</div>
          <div className="col-span-2">检测类型</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">得分</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {checkItems.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  disabled={isRunning}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </div>
              <div className="col-span-4">
                <p className="font-medium text-slate-800">{item.name}</p>
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                  {getTypeLabel(item.type)}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="text-sm text-slate-600">
                  {item.status === 'pending' && '待检测'}
                  {item.status === 'checking' && '检测中'}
                  {item.status === 'passed' && '通过'}
                  {item.status === 'failed' && '失败'}
                  {item.status === 'warning' && '警告'}
                </span>
              </div>
              <div className="col-span-2">
                {item.result ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.result.score >= 90 ? 'bg-green-500' :
                          item.result.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.result.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.result.score}%</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </div>
              <div className="col-span-1">
                {item.status !== 'pending' && item.status !== 'checking' && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    查看详情
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  )
}

export default QualityCheck
