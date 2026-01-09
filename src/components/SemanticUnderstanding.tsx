import { useState } from 'react'
import { Brain, Lightbulb, Link2, Tag, Search, Sparkles, Clock, CheckCircle, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react'

interface SemanticAnalysis {
  id: string
  tableName: string
  columnName: string
  dataType: string
  businessTerm: string
  definition: string
  synonyms: string[]
  relatedTerms: string[]
  confidence: number
  status: 'analyzed' | 'pending' | 'review'
  tags: string[]
  lastAnalyzed: string
}

const SemanticUnderstanding = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analyzingItem, setAnalyzingItem] = useState<SemanticAnalysis | null>(null)

  const [semanticData, setSemanticData] = useState<SemanticAnalysis[]>([
    {
      id: '1',
      tableName: 'user_info',
      columnName: 'user_id',
      dataType: 'bigint',
      businessTerm: '用户标识符',
      definition: '系统内唯一标识用户的数字编码,用于关联用户相关所有数据',
      synonyms: ['用户ID', 'UID', '用户编号', 'User ID'],
      relatedTerms: ['customer_id', 'account_id', 'member_id'],
      confidence: 98,
      status: 'analyzed',
      tags: ['主键', '核心字段', 'PII'],
      lastAnalyzed: '2024-01-08 14:30:00',
    },
    {
      id: '2',
      tableName: 'user_info',
      columnName: 'user_name',
      dataType: 'varchar',
      businessTerm: '用户姓名',
      definition: '用户的真实姓名,用于身份识别和业务办理',
      synonyms: ['姓名', '用户名', '真实姓名', 'Name'],
      relatedTerms: ['first_name', 'last_name', 'full_name'],
      confidence: 95,
      status: 'analyzed',
      tags: ['个人信息', 'PII'],
      lastAnalyzed: '2024-01-08 14:30:00',
    },
    {
      id: '3',
      tableName: 'order_summary',
      columnName: 'order_amount',
      dataType: 'decimal',
      businessTerm: '订单金额',
      definition: '订单的总金额,包含商品价格、运费、税费等所有费用',
      synonyms: ['订单总金额', '交易金额', '应付金额', 'Total Amount'],
      relatedTerms: ['subtotal', 'shipping_fee', 'tax_amount', 'discount_amount'],
      confidence: 92,
      status: 'analyzed',
      tags: ['金额', '财务', '核心指标'],
      lastAnalyzed: '2024-01-08 14:25:00',
    },
    {
      id: '4',
      tableName: 'order_summary',
      columnName: 'payment_status',
      dataType: 'tinyint',
      businessTerm: '支付状态',
      definition: '标识订单支付状态的编码:0-未支付,1-已支付,2-支付中,3-已退款',
      synonyms: ['付款状态', '支付标识', 'Payment Status'],
      relatedTerms: ['order_status', 'transaction_status', 'settlement_status'],
      confidence: 88,
      status: 'review',
      tags: ['状态码', '枚举值'],
      lastAnalyzed: '2024-01-08 14:20:00',
    },
    {
      id: '5',
      tableName: 'user_logs',
      columnName: 'action_type',
      dataType: 'varchar',
      businessTerm: '操作类型',
      definition: '用户在系统中的操作行为类型,如登录、查询、修改等',
      synonyms: ['行为类型', '操作动作', 'Action Type'],
      relatedTerms: ['event_type', 'activity_type', 'operation'],
      confidence: 0,
      status: 'pending',
      tags: ['日志', '行为分析'],
      lastAnalyzed: '-',
    },
    {
      id: '6',
      tableName: 'fact_sales',
      columnName: 'sales_quantity',
      dataType: 'bigint',
      businessTerm: '销售数量',
      definition: '销售商品的数量总和,用于计算销售业绩和库存分析',
      synonyms: ['销量', '销售数量', 'Sales Quantity'],
      relatedTerms: ['order_quantity', 'shipped_quantity', 'returned_quantity'],
      confidence: 96,
      status: 'analyzed',
      tags: ['指标', '销售', '数量'],
      lastAnalyzed: '2024-01-08 14:15:00',
    },
  ])

  const handleAnalyze = async (item: SemanticAnalysis) => {
    setAnalyzingItem(item)
    setShowAnalysisModal(true)

    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    const updatedData = semanticData.map(data => {
      if (data.id === item.id) {
        return {
          ...data,
          businessTerm: 'AI分析生成的业务术语',
          definition: '通过AI分析元数据特征、字段名称、数据类型等信息生成的语义定义',
          synonyms: ['同义词1', '同义词2', '同义词3'],
          relatedTerms: ['相关术语1', '相关术语2'],
          confidence: Math.floor(Math.random() * 20) + 80,
          status: 'analyzed' as const,
          lastAnalyzed: new Date().toLocaleString('zh-CN'),
        }
      }
      return data
    })

    setSemanticData(updatedData)
    setAnalyzingItem(null)
  }

  const handleBatchAnalyze = async () => {
    if (selectedItems.size === 0) return

    const itemsToAnalyze = semanticData.filter(item => selectedItems.has(item.id))

    for (const item of itemsToAnalyze) {
      await handleAnalyze(item)
    }

    setShowAnalysisModal(false)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      analyzed: 'bg-green-100 text-green-700',
      pending: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      analyzed: '已分析',
      pending: '待分析',
      review: '需审核',
    }
    return labels[status] || status
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredData = semanticData.filter(item => {
    const matchesSearch = item.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.columnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.businessTerm.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const summary = {
    total: semanticData.length,
    analyzed: semanticData.filter(item => item.status === 'analyzed').length,
    pending: semanticData.filter(item => item.status === 'pending').length,
    review: semanticData.filter(item => item.status === 'review').length,
    avgConfidence: Math.round(
      semanticData
        .filter(item => item.confidence > 0)
        .reduce((sum, item) => sum + item.confidence, 0) /
      semanticData.filter(item => item.confidence > 0).length
    ),
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">语义理解</h2>
          <p className="text-slate-500 mt-1">基于AI的元数据语义分析和理解</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <BookOpen className="w-4 h-4" />
            业务术语库
          </button>
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            AI智能分析
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总字段数</p>
              <p className="text-3xl font-bold text-slate-800">{summary.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已分析</p>
              <p className="text-3xl font-bold text-green-600">{summary.analyzed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">待分析</p>
              <p className="text-3xl font-bold text-gray-600">{summary.pending}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">需审核</p>
              <p className="text-3xl font-bold text-yellow-600">{summary.review}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">平均置信度</p>
              <p className={`text-3xl font-bold ${getConfidenceColor(summary.avgConfidence)}`}>
                {summary.avgConfidence}%
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 语义分析列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索字段、业务术语..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部状态</option>
              <option value="analyzed">已分析</option>
              <option value="pending">待分析</option>
              <option value="review">需审核</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">已选择: {selectedItems.size} 项</span>
            {selectedItems.size > 0 && (
              <button
                onClick={handleBatchAnalyze}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                批量分析
              </button>
            )}
          </div>
        </div>

        {/* 表头 */}
        <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredData.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(filteredData.map(item => item.id)))
                } else {
                  setSelectedItems(new Set())
                }
              }}
              className="w-4 h-4 rounded border-slate-300"
            />
          </div>
          <div className="col-span-2">字段信息</div>
          <div className="col-span-3">语义理解</div>
          <div className="col-span-2">关联关系</div>
          <div className="col-span-1">置信度</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">标签</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 grid grid-cols-12 gap-4 items-start hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-1 pt-2">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => {
                    const newSelected = new Set(selectedItems)
                    if (newSelected.has(item.id)) {
                      newSelected.delete(item.id)
                    } else {
                      newSelected.add(item.id)
                    }
                    setSelectedItems(newSelected)
                  }}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </div>
              <div className="col-span-2">
                <p className="font-medium text-slate-800">{item.tableName}.{item.columnName}</p>
                <p className="text-xs text-slate-500 mt-1">{item.dataType}</p>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <p className="font-medium text-slate-700">{item.businessTerm}</p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{item.definition}</p>
              </div>
              <div className="col-span-2 space-y-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">同义词:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.synonyms.slice(0, 2).map((synonym, index) => (
                      <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {synonym}
                      </span>
                    ))}
                    {item.synonyms.length > 2 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        +{item.synonyms.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">相关术语:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.relatedTerms.slice(0, 2).map((term, index) => (
                      <span key={index} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                        {term}
                      </span>
                    ))}
                    {item.relatedTerms.length > 2 && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                        +{item.relatedTerms.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.confidence >= 90 ? 'bg-green-500' :
                        item.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${getConfidenceColor(item.confidence)}`}>
                    {item.confidence > 0 ? `${item.confidence}%` : '-'}
                  </span>
                </div>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="col-span-1">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                {item.status === 'pending' ? (
                  <button
                    onClick={() => handleAnalyze(item)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    分析
                  </button>
                ) : (
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    查看详情
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI分析模态框 */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">AI智能语义分析</h3>
                <p className="text-sm text-slate-500">基于大语言模型的元数据语义理解</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <p className="font-medium text-slate-800">分析范围</p>
                </div>
                <p className="text-sm text-slate-600">
                  {selectedItems.size > 0
                    ? `已选择 ${selectedItems.size} 个字段进行AI分析`
                    : '请先选择要分析的字段'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-800">AI分析能力:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-slate-700">业务术语识别</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-slate-700">语义定义生成</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Link2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-700">关联关系挖掘</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Tag className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-slate-700">智能标签推荐</span>
                  </div>
                </div>
              </div>

              {analyzingItem && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                    <p className="font-medium text-slate-800">正在分析...</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {analyzingItem.tableName}.{analyzingItem.columnName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAnalysisModal(false)
                  setAnalyzingItem(null)
                }}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchAnalyze}
                disabled={selectedItems.size === 0 || analyzingItem !== null}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {analyzingItem ? '分析中...' : '开始分析'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SemanticUnderstanding
