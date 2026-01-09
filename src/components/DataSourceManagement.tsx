import { useState } from 'react'
import { Plus, Database, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Search, Filter, RefreshCw, TestTube } from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: 'MySQL' | 'Oracle' | 'PostgreSQL' | 'SQLServer' | 'MongoDB' | 'Hive'
  host: string
  port: number
  database: string
  status: 'connected' | 'disconnected' | 'testing'
  lastConnectTime?: string
  tableCount: number
  description: string
}

const DataSourceManagement = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: '生产数据库-MySQL',
      type: 'MySQL',
      host: '192.168.1.100',
      port: 3306,
      database: 'production_db',
      status: 'connected',
      lastConnectTime: '2024-01-08 14:30:00',
      tableCount: 156,
      description: '核心业务生产库',
    },
    {
      id: '2',
      name: '数据仓库-Oracle',
      type: 'Oracle',
      host: '192.168.1.101',
      port: 1521,
      database: 'dw_prod',
      status: 'connected',
      lastConnectTime: '2024-01-08 14:25:00',
      tableCount: 342,
      description: '企业级数据仓库',
    },
    {
      id: '3',
      name: '分析库-PostgreSQL',
      type: 'PostgreSQL',
      host: '192.168.1.102',
      port: 5432,
      database: 'analytics',
      status: 'disconnected',
      tableCount: 89,
      description: '数据分析专用库',
    },
    {
      id: '4',
      name: '日志库-MongoDB',
      type: 'MongoDB',
      host: '192.168.1.103',
      port: 27017,
      database: 'app_logs',
      status: 'connected',
      lastConnectTime: '2024-01-08 14:20:00',
      tableCount: 45,
      description: '应用日志存储',
    },
    {
      id: '5',
      name: '大数据平台-Hive',
      type: 'Hive',
      host: '192.168.1.104',
      port: 10000,
      database: 'bigdata_lake',
      status: 'testing',
      tableCount: 512,
      description: '大数据分析平台',
    },
  ])

  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    name: '',
    type: 'MySQL',
    host: '',
    port: 3306,
    database: '',
    description: '',
  })

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MySQL: 'bg-blue-100 text-blue-700',
      Oracle: 'bg-red-100 text-red-700',
      PostgreSQL: 'bg-indigo-100 text-indigo-700',
      SQLServer: 'bg-yellow-100 text-yellow-700',
      MongoDB: 'bg-green-100 text-green-700',
      Hive: 'bg-orange-100 text-orange-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '已连接'
      case 'disconnected':
        return '未连接'
      case 'testing':
        return '测试中'
      default:
        return '未知'
    }
  }

  const handleTestConnection = async (id: string) => {
    setDataSources(prev => prev.map(ds =>
      ds.id === id ? { ...ds, status: 'testing' } : ds
    ))

    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 2000))

    const success = Math.random() > 0.3
    setDataSources(prev => prev.map(ds =>
      ds.id === id ? {
        ...ds,
        status: success ? 'connected' : 'disconnected',
        lastConnectTime: success ? new Date().toLocaleString('zh-CN') : ds.lastConnectTime
      } : ds
    ))
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个数据源吗?')) {
      setDataSources(prev => prev.filter(ds => ds.id !== id))
    }
  }

  const handleAddSource = () => {
    if (!newSource.name || !newSource.host) {
      alert('请填写数据源名称和主机地址')
      return
    }

    const source: DataSource = {
      id: Date.now().toString(),
      name: newSource.name || '',
      type: newSource.type as any,
      host: newSource.host || '',
      port: newSource.port || 3306,
      database: newSource.database || '',
      status: 'disconnected',
      tableCount: 0,
      description: newSource.description || '',
    }

    setDataSources(prev => [...prev, source])
    setShowAddModal(false)
    setNewSource({
      name: '',
      type: 'MySQL',
      host: '',
      port: 3306,
      database: '',
      description: '',
    })
  }

  const filteredSources = dataSources.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ds.host.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || ds.type === filterType
    return matchesSearch && matchesType
  })

  const summary = {
    total: dataSources.length,
    connected: dataSources.filter(ds => ds.status === 'connected').length,
    disconnected: dataSources.filter(ds => ds.status === 'disconnected').length,
    totalTables: dataSources.reduce((sum, ds) => sum + ds.tableCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据源管理</h2>
          <p className="text-slate-500 mt-1">管理和配置各类数据源连接</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          添加数据源
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总数据源</p>
              <p className="text-3xl font-bold text-slate-800">{summary.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已连接</p>
              <p className="text-3xl font-bold text-green-600">{summary.connected}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">未连接</p>
              <p className="text-3xl font-bold text-red-600">{summary.disconnected}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">数据表总数</p>
              <p className="text-3xl font-bold text-purple-600">{summary.totalTables}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 数据源列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索数据源..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="MySQL">MySQL</option>
              <option value="Oracle">Oracle</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="SQLServer">SQLServer</option>
              <option value="MongoDB">MongoDB</option>
              <option value="Hive">Hive</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            刷新状态
          </button>
        </div>

        {/* 表头 */}
        <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredSources.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(filteredSources.map(ds => ds.id)))
                } else {
                  setSelectedItems(new Set())
                }
              }}
              className="w-4 h-4 rounded border-slate-300"
            />
          </div>
          <div className="col-span-2">数据源名称</div>
          <div className="col-span-1">类型</div>
          <div className="col-span-2">连接信息</div>
          <div className="col-span-1">数据库</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">表数量</div>
          <div className="col-span-2">最后连接时间</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.has(source.id)}
                  onChange={() => {
                    const newSelected = new Set(selectedItems)
                    if (newSelected.has(source.id)) {
                      newSelected.delete(source.id)
                    } else {
                      newSelected.add(source.id)
                    }
                    setSelectedItems(newSelected)
                  }}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </div>
              <div className="col-span-2">
                <p className="font-medium text-slate-800">{source.name}</p>
                <p className="text-xs text-slate-500 mt-1">{source.description}</p>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(source.type)}`}>
                  {source.type}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-700">{source.host}</p>
                <p className="text-xs text-slate-500">端口: {source.port}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm text-slate-700">{source.database}</p>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                {getStatusIcon(source.status)}
                <span className="text-sm text-slate-600">{getStatusText(source.status)}</span>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-medium text-slate-700">{source.tableCount}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600">{source.lastConnectTime || '-'}</p>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection(source.id)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="测试连接"
                >
                  <TestTube className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(source.id)}
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

      {/* 添加数据源模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">添加数据源</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  数据源名称
                </label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入数据源名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  数据库类型
                </label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MySQL">MySQL</option>
                  <option value="Oracle">Oracle</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="SQLServer">SQLServer</option>
                  <option value="MongoDB">MongoDB</option>
                  <option value="Hive">Hive</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    主机地址
                  </label>
                  <input
                    type="text"
                    value={newSource.host}
                    onChange={(e) => setNewSource({ ...newSource, host: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    端口
                  </label>
                  <input
                    type="number"
                    value={newSource.port}
                    onChange={(e) => setNewSource({ ...newSource, port: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3306"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  数据库名称
                </label>
                <input
                  type="text"
                  value={newSource.database}
                  onChange={(e) => setNewSource({ ...newSource, database: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入数据库名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述
                </label>
                <textarea
                  value={newSource.description}
                  onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="输入数据源描述"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddSource}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSourceManagement
