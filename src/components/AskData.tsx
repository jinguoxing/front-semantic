import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Sparkles,
  BarChart3,
  FileText,
  Table,
  TrendingUp,
  PieChart,
  Download,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Code2,
  Image as ImageIcon,
  FileSpreadsheet,
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react'

type MessageType = 'user' | 'assistant' | 'system'

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  title: string
  data: any[]
  config?: Record<string, any>
}

interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  chart?: ChartData
  table?: any[]
  sql?: string
  document?: {
    title: string
    content: string
    format: 'markdown' | 'html'
  }
  feedback?: 'positive' | 'negative' | null
  loading?: boolean
}

const AskData = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '你好！我是智能数据助手。我可以帮你查询数据、生成报表、分析趋势。请问有什么可以帮助你的？',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOutputFormat, setSelectedOutputFormat] = useState<'auto' | 'chart' | 'table' | 'document'>('auto')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateMockResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase()

    // 根据查询内容智能判断输出格式
    let outputFormat = selectedOutputFormat
    if (outputFormat === 'auto') {
      if (lowerQuery.includes('图表') || lowerQuery.includes('可视化') || lowerQuery.includes('趋势')) {
        outputFormat = 'chart'
      } else if (lowerQuery.includes('表') || lowerQuery.includes('数据') || lowerQuery.includes('记录')) {
        outputFormat = 'table'
      } else if (lowerQuery.includes('报告') || lowerQuery.includes('文档') || lowerQuery.includes('总结')) {
        outputFormat = 'document'
      } else {
        // 默认根据查询类型随机选择
        outputFormat = ['chart', 'table', 'document'][Math.floor(Math.random() * 3)] as any
      }
    }

    const baseResponse: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    // 生成图表响应
    if (outputFormat === 'chart') {
      baseResponse.content = `根据查询"${query}"，我为你生成了以下数据可视化图表：`
      baseResponse.chart = {
        type: ['bar', 'line', 'pie', 'area'][Math.floor(Math.random() * 4)] as any,
        title: `${query}分析图表`,
        data: [
          { name: '一月', value: Math.floor(Math.random() * 1000) + 500 },
          { name: '二月', value: Math.floor(Math.random() * 1000) + 500 },
          { name: '三月', value: Math.floor(Math.random() * 1000) + 500 },
          { name: '四月', value: Math.floor(Math.random() * 1000) + 500 },
          { name: '五月', value: Math.floor(Math.random() * 1000) + 500 },
          { name: '六月', value: Math.floor(Math.random() * 1000) + 500 },
        ],
      }
    }
    // 生成表格响应
    else if (outputFormat === 'table') {
      baseResponse.content = `根据查询"${query}"，我为你找到了以下数据：`
      baseResponse.table = [
        { id: 1, name: '产品A', category: '电子', sales: Math.floor(Math.random() * 10000), growth: `${(Math.random() * 20).toFixed(1)}%` },
        { id: 2, name: '产品B', category: '家居', sales: Math.floor(Math.random() * 10000), growth: `${(Math.random() * 20).toFixed(1)}%` },
        { id: 3, name: '产品C', category: '服装', sales: Math.floor(Math.random() * 10000), growth: `${(Math.random() * 20).toFixed(1)}%` },
        { id: 4, name: '产品D', category: '食品', sales: Math.floor(Math.random() * 10000), growth: `${(Math.random() * 20).toFixed(1)}%` },
        { id: 5, name: '产品E', category: '电子', sales: Math.floor(Math.random() * 10000), growth: `${(Math.random() * 20).toFixed(1)}%` },
      ]
      baseResponse.sql = `SELECT id, name, category, sales, growth \nFROM products \nWHERE sales > 1000 \nORDER BY sales DESC \nLIMIT 10`
    }
    // 生成文档响应
    else {
      baseResponse.content = `根据查询"${query}"，我为你生成了以下分析报告：`
      baseResponse.document = {
        title: `${query}分析报告`,
        content: `# ${query}分析报告

## 概述
本报告基于最新的业务数据，对${query}进行了全面分析。

## 关键发现

### 1. 数据趋势
- 整体呈现上升趋势，增长幅度达到15.3%
- 核心指标表现优异，超出预期目标
- 同比增长达到历年最高水平

### 2. 主要亮点
- **用户增长**：新增用户25万，活跃度提升20%
- **收入增长**：月收入达到500万，环比增长18%
- **市场份额**：在目标市场占比提升至32%

### 3. 数据详情
| 指标 | 数值 | 同比变化 |
|------|------|----------|
| 总收入 | 5,000万 | +15.3% |
| 用户数 | 125万 | +25.0% |
| 订单量 | 50万 | +18.2% |
| 转化率 | 3.2% | +0.5pp |

## 建议
1. 继续加大在核心业务上的投入
2. 优化用户获取渠道，提高ROI
3. 加强数据分析能力，驱动业务决策

## 结论
${query}整体表现良好，建议继续保持当前策略，并关注新兴市场机会。

---
*报告生成时间：${new Date().toLocaleString('zh-CN')}*`,
        format: 'markdown',
      }
    }

    return baseResponse
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // 添加加载消息
    const loadingMessage: Message = {
      id: Date.now().toString() + '_loading',
      type: 'assistant',
      content: '正在分析数据...',
      timestamp: new Date(),
      loading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 移除加载消息并添加实际响应
    const response = generateMockResponse(inputValue)
    setMessages((prev) => prev.filter((m) => !m.loading).concat(response))
    setIsLoading(false)
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    )
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleExport = (message: Message) => {
    if (message.chart) {
      alert('导出图表为图片')
    } else if (message.table) {
      alert('导出表格为Excel')
    } else if (message.document) {
      alert('导出文档为PDF')
    }
  }

  const quickQueries = [
    '显示最近三个月的销售趋势',
    '列出销售前10的产品',
    '生成月度业绩分析报告',
    '分析用户增长情况',
    '对比各部门的数据表现',
  ]

  const renderChart = (chart: ChartData) => {
    const max = Math.max(...chart.data.map((d) => d.value))
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">{chart.title}</h4>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {chart.type === 'bar' && '柱状图'}
              {chart.type === 'line' && '折线图'}
              {chart.type === 'pie' && '饼图'}
              {chart.type === 'area' && '面积图'}
              {chart.type === 'scatter' && '散点图'}
            </span>
          </div>
        </div>

        {chart.type === 'pie' ? (
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {chart.data.map((d, i) => {
                  const percentage = (d.value / chart.data.reduce((sum, item) => sum + item.value, 0)) * 100
                  const circumference = 2 * Math.PI * 40
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                  const offset = -chart.data.slice(0, i).reduce((sum, item) => {
                    return sum + (item.value / chart.data.reduce((s, item) => s + item.value, 0)) * circumference
                  }, 0)

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={colors[i % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={offset}
                    />
                  )
                })}
              </svg>
            </div>
            <div className="space-y-2">
              {chart.data.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span className="text-sm text-slate-600">
                    {d.name}: {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-2 h-48">
            {chart.data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-slate-500 font-medium">{d.value}</div>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${(d.value / max) * 100}%`,
                    backgroundColor: colors[i % colors.length],
                  }}
                />
                <div className="text-xs text-slate-600 truncate w-full text-center">{d.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderTable = (table: any[], sql?: string) => {
    if (!table || table.length === 0) return null

    const columns = Object.keys(table[0])

    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
        {sql && (
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">生成的SQL</span>
              <button
                onClick={() => handleCopy(sql)}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="text-sm text-slate-600 overflow-x-auto">{sql}</pre>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {table.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-sm text-slate-600">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderDocument = (document: { title: string; content: string; format: string }) => {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800 text-lg">{document.title}</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(document.content)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="复制内容"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleExport({ document } as any)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="导出PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="prose prose-slate max-w-none">
          <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{document.content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">智能问数</h2>
          <p className="text-slate-500 mt-1">AI驱动的数据查询与分析助手</p>
        </div>
      </div>

      {/* 功能介绍卡片 */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">AI智能数据助手</h3>
            <p className="text-indigo-100 text-sm mb-4">
              用自然语言查询数据，自动生成图表、表格和分析报告
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">智能图表生成</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-sm">数据表格展示</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm">分析报告生成</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : message.type === 'system'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-white border border-slate-200 text-slate-800'
                } p-4 ${message.type === 'assistant' ? 'shadow-sm' : ''}`}
              >
                {message.loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{message.content}</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm">{message.content}</div>

                    {/* 图表展示 */}
                    {message.chart && renderChart(message.chart)}

                    {/* 表格展示 */}
                    {message.table && renderTable(message.table, message.sql)}

                    {/* 文档展示 */}
                    {message.document && renderDocument(message.document)}

                    {/* 操作按钮 */}
                    {message.type === 'assistant' && !message.loading && (
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(message.id, 'positive')}
                            className={`p-1.5 rounded transition-colors ${
                              message.feedback === 'positive'
                                ? 'bg-green-100 text-green-600'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 'negative')}
                            className={`p-1.5 rounded transition-colors ${
                              message.feedback === 'negative'
                                ? 'bg-red-100 text-red-600'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setInputValue(messages.find((m) => m.id === message.id)?.content || '')
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="重新生成"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>

                        {(message.chart || message.table || message.document) && (
                          <button
                            onClick={() => handleExport(message)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            导出
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 快捷查询 */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600 mb-3">快捷查询：</p>
            <div className="flex flex-wrap gap-2">
              {quickQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(query)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm text-slate-600">输出格式：</label>
            <select
              value={selectedOutputFormat}
              onChange={(e) => setSelectedOutputFormat(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="auto">自动选择</option>
              <option value="chart">图表</option>
              <option value="table">表格</option>
              <option value="document">文档</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入你的问题，例如：显示最近三个月的销售趋势..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  发送中
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  发送
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 mb-2">使用提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 支持自然语言查询，如"显示销售趋势"、"列出Top10产品"</li>
              <li>• 可以指定输出格式：图表、表格或分析报告</li>
              <li>• 支持多轮对话，可以追问相关问题</li>
              <li>• 点击反馈按钮帮助我们改进回答质量</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AskData
