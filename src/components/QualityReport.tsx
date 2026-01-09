import { useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, Minus, Download, Filter, BarChart2, PieChart } from 'lucide-react'

interface ReportData {
  period: string
  overallScore: number
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  issueCount: number
}

const QualityReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const reportData: ReportData[] = [
    { period: '2024-01', overallScore: 92, completeness: 94, accuracy: 91, consistency: 90, timeliness: 93, issueCount: 15 },
    { period: '2024-02', overallScore: 94, completeness: 95, accuracy: 93, consistency: 92, timeliness: 96, issueCount: 12 },
    { period: '2024-03', overallScore: 91, completeness: 92, accuracy: 90, consistency: 89, timeliness: 93, issueCount: 18 },
    { period: '2024-04', overallScore: 93, completeness: 94, accuracy: 92, consistency: 91, timeliness: 95, issueCount: 14 },
    { period: '2024-05', overallScore: 95, completeness: 96, accuracy: 94, consistency: 93, timeliness: 97, issueCount: 10 },
    { period: '2024-06', overallScore: 96, completeness: 97, accuracy: 95, consistency: 94, timeliness: 98, issueCount: 8 },
  ]

  const currentData = reportData[reportData.length - 1]
  const previousData = reportData[reportData.length - 2]

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'stable'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const issues = [
    { id: 1, type: '完整性', severity: 'high', description: '部分业务对象缺少关键字段定义', affected: 23, date: '2024-06-15' },
    { id: 2, type: '准确性', severity: 'medium', description: '映射规则存在冲突', affected: 12, date: '2024-06-14' },
    { id: 3, type: '一致性', severity: 'low', description: '数据源元数据不一致', affected: 8, date: '2024-06-13' },
    { id: 4, type: '时效性', severity: 'medium', description: '元数据更新延迟', affected: 15, date: '2024-06-12' },
    { id: 5, type: '完整性', severity: 'high', description: '业务规则定义不完整', affected: 18, date: '2024-06-11' },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return '未知'
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">质量报告</h2>
          <p className="text-slate-500 mt-1">查看和分析语义治理数据质量趋势和问题</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="quarter">最近一季</option>
            <option value="year">最近一年</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md">
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      {/* 质量评分卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">总体质量分</h3>
            <Calendar className="w-5 h-5 opacity-75" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{currentData.overallScore}</p>
              <p className="text-sm opacity-75 mt-1">综合评分</p>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
              {getTrendIcon(getTrend(currentData.overallScore, previousData.overallScore))}
              <span className="text-sm font-medium">
                {currentData.overallScore - previousData.overallScore > 0 ? '+' : ''}
                {currentData.overallScore - previousData.overallScore}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">完整性</h3>
            {getTrendIcon(getTrend(currentData.completeness, previousData.completeness))}
          </div>
          <p className="text-3xl font-bold text-slate-800">{currentData.completeness}</p>
          <div className="mt-3 bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${currentData.completeness}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">准确性</h3>
            {getTrendIcon(getTrend(currentData.accuracy, previousData.accuracy))}
          </div>
          <p className="text-3xl font-bold text-slate-800">{currentData.accuracy}</p>
          <div className="mt-3 bg-slate-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${currentData.accuracy}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">一致性</h3>
            {getTrendIcon(getTrend(currentData.consistency, previousData.consistency))}
          </div>
          <p className="text-3xl font-bold text-slate-800">{currentData.consistency}</p>
          <div className="mt-3 bg-slate-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${currentData.consistency}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">时效性</h3>
            {getTrendIcon(getTrend(currentData.timeliness, previousData.timeliness))}
          </div>
          <p className="text-3xl font-bold text-slate-800">{currentData.timeliness}</p>
          <div className="mt-3 bg-slate-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${currentData.timeliness}%` }}
            />
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">质量趋势</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'pie' ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100'
                }`}
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {reportData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{data.period}</span>
                  <span className="font-medium text-slate-800">{data.overallScore}分</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${data.completeness}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">完整性 {data.completeness}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${data.accuracy}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">准确性 {data.accuracy}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${data.consistency}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">一致性 {data.consistency}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${data.timeliness}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">时效性 {data.timeliness}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 问题分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">问题分布</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-slate-700">高严重度</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">2</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-slate-700">中严重度</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">2</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-slate-700">低严重度</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">1</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{currentData.issueCount}</p>
                <p className="text-sm text-slate-500 mt-1">待解决问题</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">92%</p>
                <p className="text-sm text-slate-500 mt-1">解决率</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 问题列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">问题列表</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            查看全部
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">问题类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">严重度</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">影响对象</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">发现日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {issue.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-800">{issue.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                      {getSeverityLabel(issue.severity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {issue.affected} 个对象
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {issue.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default QualityReport
