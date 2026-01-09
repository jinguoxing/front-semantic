import { useState, useMemo } from 'react'
import { Plus, Database, Edit, Trash2, Search, Filter, RefreshCw, Eye, Code2, FileText, GitBranch, Clock, ChevronRight, ChevronDown, Server } from 'lucide-react'

interface Metadata {
  id: string
  name: string
  type: 'table' | 'view' | 'function' | 'procedure'
  source: string
  schema: string
  rowCount: number
  size: string
  lastModified: string
  description: string
  tags: string[]
  status: 'active' | 'deprecated' | 'draft'
}

interface DataSourceNode {
  dbType: string
  sources: string[]
  children: Metadata[]
}

const MetadataManagement = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
  const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [expandedDbTypes, setExpandedDbTypes] = useState<Set<string>>(new Set())
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  const [metadataList, setMetadataList] = useState<Metadata[]>([
    {
      id: '1',
      name: 'user_info',
      type: 'table',
      source: '生产数据库-MySQL',
      schema: 'public',
      rowCount: 1250000,
      size: '2.3 GB',
      lastModified: '2024-01-08 10:30:00',
      description: '用户基础信息表,包含用户基本资料和账户信息',
      tags: ['核心', '用户', 'PII'],
      status: 'active',
    },
    {
      id: '2',
      name: 'order_summary',
      type: 'view',
      source: '数据仓库-Oracle',
      schema: 'analytics',
      rowCount: 0,
      size: '0 MB',
      lastModified: '2024-01-08 09:15:00',
      description: '订单汇总视图,用于报表和BI分析',
      tags: ['分析', '订单'],
      status: 'active',
    },
    {
      id: '3',
      name: 'calculate_price',
      type: 'function',
      source: '分析库-PostgreSQL',
      schema: 'public',
      rowCount: 0,
      size: '0 MB',
      lastModified: '2024-01-07 16:45:00',
      description: '价格计算函数,支持多种定价策略',
      tags: ['计算', '价格'],
      status: 'active',
    },
    {
      id: '4',
      name: 'sync_data_proc',
      type: 'procedure',
      source: '生产数据库-MySQL',
      schema: 'public',
      rowCount: 0,
      size: '0 MB',
      lastModified: '2024-01-06 14:20:00',
      description: '数据同步存储过程',
      tags: ['ETL', '同步'],
      status: 'active',
    },
    {
      id: '5',
      name: 'user_logs',
      type: 'table',
      source: '日志库-MongoDB',
      schema: 'logs',
      rowCount: 5600000,
      size: '8.7 GB',
      lastModified: '2024-01-08 11:00:00',
      description: '用户操作日志表',
      tags: ['日志', '用户行为'],
      status: 'active',
    },
    {
      id: '6',
      name: 'dim_customer',
      type: 'table',
      source: '数据仓库-Oracle',
      schema: 'dim',
      rowCount: 850000,
      size: '1.8 GB',
      lastModified: '2024-01-05 08:30:00',
      description: '客户维度表(即将废弃)',
      tags: ['维度', '客户'],
      status: 'deprecated',
    },
    {
      id: '7',
      name: 'fact_sales',
      type: 'table',
      source: '大数据平台-Hive',
      schema: 'warehouse',
      rowCount: 45000000,
      size: '125.6 GB',
      lastModified: '2024-01-08 12:00:00',
      description: '销售事实表',
      tags: ['事实表', '销售'],
      status: 'active',
    },
    {
      id: '8',
      name: 'new_product_catalog',
      type: 'table',
      source: '生产数据库-MySQL',
      schema: 'catalog',
      rowCount: 0,
      size: '0 MB',
      lastModified: '2024-01-08 13:45:00',
      description: '新产品目录表(开发中)',
      tags: ['目录', '产品'],
      status: 'draft',
    },
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table':
        return <Database className="w-4 h-4" />
      case 'view':
        return <Eye className="w-4 h-4" />
      case 'function':
        return <Code2 className="w-4 h-4" />
      case 'procedure':
        return <GitBranch className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      table: 'bg-blue-100 text-blue-700',
      view: 'bg-green-100 text-green-700',
      function: 'bg-purple-100 text-purple-700',
      procedure: 'bg-orange-100 text-orange-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      table: '表',
      view: '视图',
      function: '函数',
      procedure: '存储过程',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      deprecated: 'bg-red-100 text-red-700',
      draft: 'bg-yellow-100 text-yellow-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '活跃',
      deprecated: '已废弃',
      draft: '草稿',
    }
    return labels[status] || status
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条元数据吗?')) {
      setMetadataList(prev => prev.filter(md => md.id !== id))
    }
  }

  const filteredMetadata = metadataList.filter(md => {
    const matchesSearch = md.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         md.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         md.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || md.type === filterType
    const matchesStatus = filterStatus === 'all' || md.status === filterStatus
    const matchesSource = !selectedSource || md.source === selectedSource
    return matchesSearch && matchesType && matchesStatus && matchesSource
  })

  // 构建数据源树形结构
  const dataSourceTree = useMemo(() => {
    const tree: Record<string, Record<string, Metadata[]>> = {}

    metadataList.forEach(md => {
      // 从 source 字段提取数据库类型（格式：数据源名称-数据库类型）
      const parts = md.source.split('-')
      const dbType = parts.length > 1 ? parts[parts.length - 1] : 'Unknown'
      const sourceName = parts.length > 1 ? parts.slice(0, -1).join('-') : md.source

      if (!tree[dbType]) {
        tree[dbType] = {}
      }
      if (!tree[dbType][sourceName]) {
        tree[dbType][sourceName] = []
      }
      tree[dbType][sourceName].push(md)
    })

    return tree
  }, [metadataList])

  const getDbTypeIcon = (dbType: string) => {
    const icons: Record<string, string> = {
      'MySQL': '🐬',
      'Oracle': '🔴',
      'PostgreSQL': '🐘',
      'MongoDB': '🍃',
      'Hive': '🐝',
      'Unknown': '💾',
    }
    return icons[dbType] || '💾'
  }

  const toggleDbType = (dbType: string) => {
    const newExpanded = new Set(expandedDbTypes)
    if (newExpanded.has(dbType)) {
      newExpanded.delete(dbType)
    } else {
      newExpanded.add(dbType)
    }
    setExpandedDbTypes(newExpanded)
  }

  const toggleSource = (source: string) => {
    const newExpanded = new Set(expandedSources)
    if (newExpanded.has(source)) {
      newExpanded.delete(source)
    } else {
      newExpanded.add(source)
    }
    setExpandedSources(newExpanded)
  }

  const handleSourceClick = (dbType: string, sourceName: string | null) => {
    if (sourceName) {
      setSelectedSourceType(dbType)
      setSelectedSource(sourceName)
    } else {
      setSelectedSourceType(dbType)
      setSelectedSource(null)
    }
  }

  const summary = {
    total: metadataList.length,
    tables: metadataList.filter(md => md.type === 'table').length,
    views: metadataList.filter(md => md.type === 'view').length,
    functions: metadataList.filter(md => md.type === 'function').length,
    procedures: metadataList.filter(md => md.type === 'procedure').length,
    active: metadataList.filter(md => md.status === 'active').length,
    deprecated: metadataList.filter(md => md.status === 'deprecated').length,
    draft: metadataList.filter(md => md.status === 'draft').length,
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">元数据管理</h2>
          <p className="text-slate-500 mt-1">管理和维护数据库元数据信息</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          添加元数据
        </button>
      </div>

      {/* 主内容区域：左侧数据源树 + 右侧元数据列表 */}
      <div className="flex gap-6">
        {/* 左侧数据源树 */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-800">数据源视角</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">按数据库类型和数据源浏览</p>
            </div>

            <div className="p-3 max-h-[600px] overflow-y-auto">
              {selectedSource && (
                <div className="mb-3 pb-3 border-b border-slate-200">
                  <button
                    onClick={() => {
                      setSelectedSourceType(null)
                      setSelectedSource(null)
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    清除筛选
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {Object.entries(dataSourceTree).map(([dbType, sources]) => (
                  <div key={dbType}>
                    {/* 数据库类型层 */}
                    <button
                      onClick={() => toggleDbType(dbType)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDbTypeIcon(dbType)}</span>
                        <span className="font-medium text-sm text-slate-700">{dbType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {Object.values(sources).flat().length}
                        </span>
                        {expandedDbTypes.has(dbType) ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* 数据源名称层 */}
                    {expandedDbTypes.has(dbType) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {Object.entries(sources).map(([sourceName, metadatas]) => {
                          const fullSource = `${sourceName}-${dbType}`
                          const isSelected = selectedSource === fullSource
                          const isExpanded = expandedSources.has(fullSource)

                          return (
                            <div key={sourceName}>
                              <button
                                onClick={() => {
                                  toggleSource(fullSource)
                                  handleSourceClick(dbType, sourceName)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                                  isSelected
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Database className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">{sourceName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-400">{metadatas.length}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                  )}
                                </div>
                              </button>

                              {/* 元数据列表（可选展开） */}
                              {isExpanded && (
                                <div className="ml-5 mt-1 space-y-0.5">
                                  {metadatas.map((md) => (
                                    <div
                                      key={md.id}
                                      className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 rounded cursor-pointer"
                                      onClick={() => {
                                        setSelectedSourceType(dbType)
                                        setSelectedSource(fullSource)
                                      }}
                                    >
                                      {getTypeIcon(md.type)}
                                      <span className="truncate">{md.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 space-y-6">

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总元数据</p>
              <p className="text-3xl font-bold text-slate-800">{summary.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">活跃状态</p>
              <p className="text-3xl font-bold text-green-600">{summary.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已废弃</p>
              <p className="text-3xl font-bold text-red-600">{summary.deprecated}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">草稿</p>
              <p className="text-3xl font-bold text-yellow-600">{summary.draft}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Edit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 类型统计 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">类型分布</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">表</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{summary.tables}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">视图</span>
            </div>
            <span className="text-lg font-bold text-green-600">{summary.views}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">函数</span>
            </div>
            <span className="text-lg font-bold text-purple-600">{summary.functions}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-slate-700">存储过程</span>
            </div>
            <span className="text-lg font-bold text-orange-600">{summary.procedures}</span>
          </div>
        </div>
      </div>

      {/* 元数据列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索元数据..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部类型</option>
              <option value="table">表</option>
              <option value="view">视图</option>
              <option value="function">函数</option>
              <option value="procedure">存储过程</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="deprecated">已废弃</option>
              <option value="draft">草稿</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
            <div className="flex items-center gap-2 border-l pl-3 border-slate-300">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'card' ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100'
                }`}
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 表头 */}
        <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredMetadata.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(filteredMetadata.map(md => md.id)))
                } else {
                  setSelectedItems(new Set())
                }
              }}
              className="w-4 h-4 rounded border-slate-300"
            />
          </div>
          <div className="col-span-2">名称</div>
          <div className="col-span-1">类型</div>
          <div className="col-span-2">数据源</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">行数/大小</div>
          <div className="col-span-2">标签</div>
          <div className="col-span-1">最后修改</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {filteredMetadata.map((metadata) => (
            <div
              key={metadata.id}
              className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.has(metadata.id)}
                  onChange={() => {
                    const newSelected = new Set(selectedItems)
                    if (newSelected.has(metadata.id)) {
                      newSelected.delete(metadata.id)
                    } else {
                      newSelected.add(metadata.id)
                    }
                    setSelectedItems(newSelected)
                  }}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(metadata.type)}
                  <p className="font-medium text-slate-800">{metadata.name}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{metadata.description}</p>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getTypeColor(metadata.type)}`}>
                  {getTypeLabel(metadata.type)}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-700">{metadata.source}</p>
                <p className="text-xs text-slate-500">{metadata.schema}</p>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metadata.status)}`}>
                  {getStatusLabel(metadata.status)}
                </span>
              </div>
              <div className="col-span-1">
                <p className="text-sm text-slate-700">
                  {metadata.rowCount > 0 ? `${(metadata.rowCount / 10000).toFixed(1)}万行` : '-'}
                </p>
                <p className="text-xs text-slate-500">{metadata.size}</p>
              </div>
              <div className="col-span-2">
                <div className="flex flex-wrap gap-1">
                  {metadata.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {metadata.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      +{metadata.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <p className="text-xs text-slate-600">{metadata.lastModified.split(' ')[0]}</p>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <button
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="查看详情"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(metadata.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}

export default MetadataManagement
