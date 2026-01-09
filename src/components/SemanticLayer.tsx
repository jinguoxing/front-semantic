import { useState } from 'react'
import { Plus, Edit, Trash2, Play, Code2, Database, Filter, TrendingUp, Calendar, Copy, Check } from 'lucide-react'

interface Measure {
  id: string
  name: string
  type: 'count' | 'countDistinct' | 'sum' | 'avg' | 'min' | 'max' | 'number'
  sql: string
  description: string
  format?: string
}

interface Dimension {
  id: string
  name: string
  type: 'string' | 'number' | 'time' | 'boolean' | 'geo'
  sql: string
  description: string
  primaryKey?: boolean
  format?: string
}

interface Segment {
  id: string
  name: string
  sql: string
  description: string
}

interface Cube {
  id: string
  name: string
  sql: string
  title: string
  description: string
  measures: Measure[]
  dimensions: Dimension[]
  segments: Segment[]
  joins: Array<{
    name: string
    sql: string
    relationship: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'
  }>
}

const SemanticLayer = () => {
  const [selectedCube, setSelectedCube] = useState<Cube | null>(null)
  const [showAddCube, setShowAddCube] = useState(false)
  const [showQueryBuilder, setShowQueryBuilder] = useState(false)
  const [queryResult, setQueryResult] = useState<any>(null)

  const [cubes, setCubes] = useState<Cube[]>([
    {
      id: '1',
      name: 'Orders',
      sql: 'public.orders',
      title: '订单',
      description: '订单业务对象,包含订单的完整信息',
      measures: [
        {
          id: 'm1',
          name: 'count',
          type: 'count',
          sql: '*',
          description: '订单总数',
        },
        {
          id: 'm2',
          name: 'total_amount',
          type: 'sum',
          sql: 'amount',
          description: '订单总金额',
          format: 'currency',
        },
        {
          id: 'm3',
          name: 'average_order_value',
          type: 'avg',
          sql: 'amount',
          description: '平均订单价值',
          format: 'currency',
        },
        {
          id: 'm4',
          name: 'completed_count',
          type: 'count',
          sql: '*',
          description: '已完成订单数',
        },
      ],
      dimensions: [
        {
          id: 'd1',
          name: 'id',
          type: 'number',
          sql: 'id',
          description: '订单ID',
          primaryKey: true,
        },
        {
          id: 'd2',
          name: 'created_at',
          type: 'time',
          sql: 'created_at',
          description: '创建时间',
        },
        {
          id: 'd3',
          name: 'status',
          type: 'string',
          sql: 'status',
          description: '订单状态',
        },
        {
          id: 'd4',
          name: 'user_id',
          type: 'number',
          sql: 'user_id',
          description: '用户ID',
        },
      ],
      segments: [
        {
          id: 's1',
          name: 'completed',
          sql: `${status} = 'completed'`,
          description: '已完成订单',
        },
        {
          id: 's2',
          name: 'pending',
          sql: `${status} = 'pending'`,
          description: '待处理订单',
        },
      ],
      joins: [
        {
          name: 'users',
          sql: '${TABLE}.user_id = users.id',
          relationship: 'many_to_one',
        },
      ],
    },
    {
      id: '2',
      name: 'Users',
      sql: 'public.users',
      title: '用户',
      description: '用户业务对象,包含用户的基本信息',
      measures: [
        {
          id: 'm5',
          name: 'count',
          type: 'count',
          sql: '*',
          description: '用户总数',
        },
        {
          id: 'm6',
          name: 'total_revenue',
          type: 'sum',
          sql: 'revenue',
          description: '用户总收入',
          format: 'currency',
        },
      ],
      dimensions: [
        {
          id: 'd5',
          name: 'id',
          type: 'number',
          sql: 'id',
          description: '用户ID',
          primaryKey: true,
        },
        {
          id: 'd6',
          name: 'name',
          type: 'string',
          sql: 'name',
          description: '用户姓名',
        },
        {
          id: 'd7',
          name: 'city',
          type: 'string',
          sql: 'city',
          description: '所在城市',
        },
        {
          id: 'd8',
          name: 'age',
          type: 'number',
          sql: 'age',
          description: '年龄',
        },
      ],
      segments: [],
      joins: [],
    },
  ])

  const [query, setQuery] = useState({
    measures: [] as string[],
    dimensions: [] as string[],
    segments: [] as string[],
    timeDimensions: [] as Array<{ dimension: string; granularity: string }>,
    filters: [] as Array<{ dimension: string; operator: string; values: string[] }>,
    order: {} as Record<string, 'asc' | 'desc'>,
    limit: 100,
  })

  const handleAddMeasure = (measureName: string) => {
    if (!query.measures.includes(measureName)) {
      setQuery({ ...query, measures: [...query.measures, measureName] })
    }
  }

  const handleAddDimension = (dimensionName: string) => {
    if (!query.dimensions.includes(dimensionName)) {
      setQuery({ ...query, dimensions: [...query.dimensions, dimensionName] })
    }
  }

  const handleRemoveMeasure = (measureName: string) => {
    setQuery({ ...query, measures: query.measures.filter(m => m !== measureName) })
  }

  const handleRemoveDimension = (dimensionName: string) => {
    setQuery({ ...query, dimensions: query.dimensions.filter(d => d !== dimensionName) })
  }

  const generateSQL = () => {
    if (!selectedCube || query.measures.length === 0) return ''

    const measureExpressions = query.measures.map(measure => {
      const measureDef = selectedCube.measures.find(m => m.name === measure)
      if (!measureDef) return measure

      switch (measureDef.type) {
        case 'count':
          return `COUNT(*) as ${measure}`
        case 'countDistinct':
          return `COUNT(DISTINCT ${measureDef.sql}) as ${measure}`
        case 'sum':
          return `SUM(${measureDef.sql}) as ${measure}`
        case 'avg':
          return `AVG(${measureDef.sql}) as ${measure}`
        case 'min':
          return `MIN(${measureDef.sql}) as ${measure}`
        case 'max':
          return `MAX(${measureDef.sql}) as ${measure}`
        default:
          return `${measureDef.sql} as ${measure}`
      }
    })

    const dimensionExpressions = query.dimensions.map(dim => dim)

    const groupBy = query.dimensions.length > 0 ? `GROUP BY ${query.dimensions.join(', ')}` : ''

    let sql = `SELECT\n`
    sql += `  ${[...dimensionExpressions, ...measureExpressions].join(',\n  ')}\n`
    sql += `FROM ${selectedCube.sql}\n`

    if (query.segments.length > 0) {
      const segmentFilters = query.segments.map(segment => {
        const segmentDef = selectedCube.segments.find(s => s.name === segment)
        return segmentDef ? segmentDef.sql : ''
      }).join(' AND ')
      sql += `WHERE ${segmentFilters}\n`
    }

    if (groupBy) {
      sql += `${groupBy}\n`
    }

    return sql
  }

  const handleExecuteQuery = () => {
    const sql = generateSQL()
    if (!sql) return

    // 模拟查询结果
    setQueryResult({
      sql,
      data: [
        { status: 'completed', count: 1250, total_amount: 125000, average_order_value: 100 },
        { status: 'pending', count: 340, total_amount: 34000, average_order_value: 100 },
        { status: 'cancelled', count: 120, total_amount: 12000, average_order_value: 100 },
      ],
      executionTime: '45ms',
    })
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">语义层 (Semantic Layer)</h2>
          <p className="text-slate-500 mt-1">定义度量(Measures)和维度(Dimensions),构建统一的数据语义</p>
        </div>
        <button
          onClick={() => setShowAddCube(true)}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          创建 Cube
        </button>
      </div>

      {/* 概念说明卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-blue-900">Cubes (立方体)</h3>
          </div>
          <p className="text-sm text-blue-800">
            数据实体定义,类似于数据库表,包含度量和维度
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-green-900">Measures (度量)</h3>
          </div>
          <p className="text-sm text-green-800">
            可量化的数值指标,如总和、平均值、计数等聚合计算
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-purple-900">Dimensions (维度)</h3>
          </div>
          <p className="text-sm text-purple-800">
            定性属性,用于分组和筛选数据,如时间、类别、地区等
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧: Cubes 列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Cubes ({cubes.length})</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {cubes.map((cube) => (
                <div
                  key={cube.id}
                  onClick={() => setSelectedCube(cube)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                    selectedCube?.id === cube.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{cube.title}</h4>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {cube.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{cube.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      {cube.measures.length} 度量
                    </span>
                    <span className="flex items-center gap-1">
                      <Filter className="w-3 h-3 text-purple-500" />
                      {cube.dimensions.length} 维度
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间: Cube 详情 */}
        <div className="lg:col-span-1">
          {selectedCube ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedCube.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedCube.sql}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Measures */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Measures ({selectedCube.measures.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCube.measures.map((measure) => (
                      <div
                        key={measure.id}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                        onClick={() => handleAddMeasure(`${selectedCube.name}.${measure.name}`)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-800 text-sm">{measure.name}</span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                            {measure.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{measure.description}</p>
                        <code className="text-xs text-slate-500 mt-1 block">{measure.sql}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-800 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-500" />
                      Dimensions ({selectedCube.dimensions.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCube.dimensions.map((dimension) => (
                      <div
                        key={dimension.id}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => handleAddDimension(`${selectedCube.name}.${dimension.name}`)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-800 text-sm">{dimension.name}</span>
                          <div className="flex items-center gap-2">
                            {dimension.primaryKey && (
                              <span className="text-xs text-blue-600">PK</span>
                            )}
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                              {dimension.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{dimension.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Segments */}
                {selectedCube.segments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Segments ({selectedCube.segments.length})</h4>
                    <div className="space-y-2">
                      {selectedCube.segments.map((segment) => (
                        <div
                          key={segment.id}
                          className="p-3 bg-slate-50 rounded-lg"
                        >
                          <span className="font-medium text-slate-800 text-sm">{segment.name}</span>
                          <p className="text-xs text-slate-600 mt-1">{segment.description}</p>
                          <code className="text-xs text-slate-500 mt-1 block">{segment.sql}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">请选择一个 Cube 查看详情</p>
            </div>
          )}
        </div>

        {/* 右侧: 查询构建器 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">查询构建器</h3>
              <button
                onClick={() => setShowQueryBuilder(!showQueryBuilder)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {showQueryBuilder ? '收起' : '展开'}
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 已选择的 Measures */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  已选 Measures ({query.measures.length})
                </h4>
                <div className="space-y-2">
                  {query.measures.map((measure) => (
                    <div
                      key={measure}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-800">{measure}</span>
                      <button
                        onClick={() => handleRemoveMeasure(measure)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {query.measures.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      点击左侧度量添加
                    </p>
                  )}
                </div>
              </div>

              {/* 已选择的 Dimensions */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  已选 Dimensions ({query.dimensions.length})
                </h4>
                <div className="space-y-2">
                  {query.dimensions.map((dimension) => (
                    <div
                      key={dimension}
                      className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-800">{dimension}</span>
                      <button
                        onClick={() => handleRemoveDimension(dimension)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {query.dimensions.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      点击左侧维度添加
                    </p>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQueryBuilder(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  查看 SQL
                </button>
                <button
                  onClick={handleExecuteQuery}
                  disabled={query.measures.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4" />
                  执行查询
                </button>
              </div>
            </div>
          </div>

          {/* SQL 预览 */}
          {showQueryBuilder && generateSQL() && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  生成的 SQL
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateSQL())
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
              </div>
              <div className="p-4">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {generateSQL()}
                </pre>
              </div>
            </div>
          )}

          {/* 查询结果 */}
          {queryResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  查询结果
                </h3>
                <p className="text-xs text-slate-500 mt-1">执行时间: {queryResult.executionTime}</p>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {Object.keys(queryResult.data[0] || {}).map((key) => (
                        <th key={key} className="text-left py-2 px-3 font-medium text-slate-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.data.map((row: any, index: number) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="py-2 px-3 text-slate-600">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SemanticLayer
