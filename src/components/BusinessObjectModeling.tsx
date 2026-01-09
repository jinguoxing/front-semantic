import { useState } from 'react'
import { Plus, Edit, Trash2, Search, Filter, Eye, Code2, GitBranch, Database, Tag, Link2, Layers, ChevronDown, ChevronUp } from 'lucide-react'

interface Field {
  id: string
  name: string
  dataType: string
  length?: number
  nullable: boolean
  primaryKey: boolean
  foreignKey: boolean
  referenceTable?: string
  description: string
  businessTerm?: string
}

interface BusinessObject {
  id: string
  name: string
  code: string
  category: string
  description: string
  status: 'draft' | 'active' | 'deprecated'
  version: string
  fields: Field[]
  mappings: {
    source: string
    table: string
    lastSync: string
  }[]
  tags: string[]
  createdAt: string
  updatedAt: string
  creator: string
}

const BusinessObjectModeling = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedObject, setSelectedObject] = useState<BusinessObject | null>(null)
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set())

  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([
    {
      id: '1',
      name: '用户对象',
      code: 'USER',
      category: '基础数据',
      description: '系统用户的核心业务对象,包含用户基本信息、账户信息、权限信息等',
      status: 'active',
      version: 'v1.2.0',
      fields: [
        {
          id: 'f1',
          name: 'user_id',
          dataType: 'bigint',
          length: 20,
          nullable: false,
          primaryKey: true,
          foreignKey: false,
          description: '用户唯一标识',
          businessTerm: '用户标识符',
        },
        {
          id: 'f2',
          name: 'user_name',
          dataType: 'varchar',
          length: 100,
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          description: '用户姓名',
          businessTerm: '用户姓名',
        },
        {
          id: 'f3',
          name: 'email',
          dataType: 'varchar',
          length: 255,
          nullable: true,
          primaryKey: false,
          foreignKey: false,
          description: '用户邮箱',
          businessTerm: '电子邮箱',
        },
        {
          id: 'f4',
          name: 'dept_id',
          dataType: 'bigint',
          nullable: true,
          primaryKey: false,
          foreignKey: true,
          referenceTable: 'department',
          description: '所属部门ID',
          businessTerm: '部门标识符',
        },
      ],
      mappings: [
        { source: '生产数据库-MySQL', table: 'user_info', lastSync: '2024-01-08 14:30:00' },
        { source: '数据仓库-Oracle', table: 'dim_user', lastSync: '2024-01-08 14:00:00' },
      ],
      tags: ['核心', '基础数据', 'PII'],
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-08 14:30:00',
      creator: '张三',
    },
    {
      id: '2',
      name: '订单对象',
      code: 'ORDER',
      category: '业务数据',
      description: '订单业务对象,包含订单基本信息、商品信息、支付信息等',
      status: 'active',
      version: 'v2.0.1',
      fields: [
        {
          id: 'f5',
          name: 'order_id',
          dataType: 'bigint',
          length: 20,
          nullable: false,
          primaryKey: true,
          foreignKey: false,
          description: '订单唯一标识',
          businessTerm: '订单编号',
        },
        {
          id: 'f6',
          name: 'user_id',
          dataType: 'bigint',
          nullable: false,
          primaryKey: false,
          foreignKey: true,
          referenceTable: 'user_info',
          description: '用户ID',
          businessTerm: '用户标识符',
        },
        {
          id: 'f7',
          name: 'order_amount',
          dataType: 'decimal',
          length: 10,
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          description: '订单金额',
          businessTerm: '订单总金额',
        },
        {
          id: 'f8',
          name: 'order_status',
          dataType: 'tinyint',
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          description: '订单状态',
          businessTerm: '订单状态码',
        },
      ],
      mappings: [
        { source: '生产数据库-MySQL', table: 'order_master', lastSync: '2024-01-08 14:25:00' },
        { source: '大数据平台-Hive', table: 'fact_orders', lastSync: '2024-01-08 14:10:00' },
      ],
      tags: ['核心', '业务数据', '交易'],
      createdAt: '2024-01-02 09:00:00',
      updatedAt: '2024-01-08 14:25:00',
      creator: '李四',
    },
    {
      id: '3',
      name: '产品对象',
      code: 'PRODUCT',
      category: '基础数据',
      description: '产品信息业务对象',
      status: 'draft',
      version: 'v0.1.0',
      fields: [
        {
          id: 'f9',
          name: 'product_id',
          dataType: 'bigint',
          length: 20,
          nullable: false,
          primaryKey: true,
          foreignKey: false,
          description: '产品ID',
          businessTerm: '产品标识符',
        },
        {
          id: 'f10',
          name: 'product_name',
          dataType: 'varchar',
          length: 200,
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          description: '产品名称',
          businessTerm: '产品名称',
        },
      ],
      mappings: [],
      tags: ['产品', '基础数据'],
      createdAt: '2024-01-07 16:00:00',
      updatedAt: '2024-01-07 16:00:00',
      creator: '王五',
    },
  ])

  const [newObject, setNewObject] = useState<Partial<BusinessObject>>({
    name: '',
    code: '',
    category: '基础数据',
    description: '',
    status: 'draft',
    version: 'v1.0.0',
    fields: [],
    tags: [],
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      deprecated: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '活跃',
      draft: '草稿',
      deprecated: '已废弃',
    }
    return labels[status] || status
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '基础数据': 'bg-blue-100 text-blue-700',
      '业务数据': 'bg-green-100 text-green-700',
      '参考数据': 'bg-purple-100 text-purple-700',
      '元数据': 'bg-orange-100 text-orange-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedObjects)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedObjects(newExpanded)
  }

  const handleView = (obj: BusinessObject) => {
    setSelectedObject(obj)
    setShowViewModal(true)
  }

  const handleEdit = (id: string) => {
    const obj = businessObjects.find(o => o.id === id)
    if (obj) {
      setSelectedObject(obj)
      setNewObject(obj)
      setShowAddModal(true)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个业务对象吗?')) {
      setBusinessObjects(prev => prev.filter(obj => obj.id !== id))
    }
  }

  const handleAddObject = () => {
    if (!newObject.name || !newObject.code) {
      alert('请填写业务对象名称和编码')
      return
    }

    const obj: BusinessObject = {
      id: Date.now().toString(),
      name: newObject.name || '',
      code: newObject.code || '',
      category: newObject.category || '基础数据',
      description: newObject.description || '',
      status: newObject.status as any || 'draft',
      version: newObject.version || 'v1.0.0',
      fields: newObject.fields || [],
      mappings: [],
      tags: newObject.tags || [],
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
      creator: '当前用户',
    }

    setBusinessObjects(prev => [...prev, obj])
    setShowAddModal(false)
    setNewObject({
      name: '',
      code: '',
      category: '基础数据',
      description: '',
      status: 'draft',
      version: 'v1.0.0',
      fields: [],
      tags: [],
    })
  }

  const filteredObjects = businessObjects.filter(obj => {
    const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || obj.category === filterCategory
    const matchesStatus = filterStatus === 'all' || obj.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const summary = {
    total: businessObjects.length,
    active: businessObjects.filter(obj => obj.status === 'active').length,
    draft: businessObjects.filter(obj => obj.status === 'draft').length,
    deprecated: businessObjects.filter(obj => obj.status === 'deprecated').length,
    totalFields: businessObjects.reduce((sum, obj) => sum + obj.fields.length, 0),
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">业务对象建模</h2>
          <p className="text-slate-500 mt-1">设计和管理业务对象模型及字段定义</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          创建业务对象
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总对象数</p>
              <p className="text-3xl font-bold text-slate-800">{summary.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Layers className="w-6 h-6 text-blue-600" />
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
              <Tag className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-slate-500 mb-1">总字段数</p>
              <p className="text-3xl font-bold text-purple-600">{summary.totalFields}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 业务对象列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索业务对象..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部分类</option>
              <option value="基础数据">基础数据</option>
              <option value="业务数据">业务数据</option>
              <option value="参考数据">参考数据</option>
              <option value="元数据">元数据</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="draft">草稿</option>
              <option value="deprecated">已废弃</option>
            </select>
          </div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {filteredObjects.map((obj) => (
            <div key={obj.id} className="hover:bg-slate-50 transition-colors">
              {/* 对象头部 */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(obj.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedItems)
                        if (newSelected.has(obj.id)) {
                          newSelected.delete(obj.id)
                        } else {
                          newSelected.add(obj.id)
                        }
                        setSelectedItems(newSelected)
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <button
                      onClick={() => toggleExpand(obj.id)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      {expandedObjects.has(obj.id) ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{obj.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(obj.category)}`}>
                          {obj.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(obj.status)}`}>
                          {getStatusLabel(obj.status)}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {obj.code}
                        </span>
                        <span className="text-xs text-slate-500">
                          v{obj.version}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{obj.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>字段数: {obj.fields.length}</span>
                        <span>映射数: {obj.mappings.length}</span>
                        <span>创建者: {obj.creator}</span>
                        <span>更新时间: {obj.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(obj)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(obj.id)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(obj.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 展开的字段列表 */}
                {expandedObjects.has(obj.id) && (
                  <div className="mt-4 pl-10 border-l-2 border-slate-200">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-800">字段列表</h4>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          + 添加字段
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-2 px-3 font-medium text-slate-600">字段名</th>
                              <th className="text-left py-2 px-3 font-medium text-slate-600">数据类型</th>
                              <th className="text-left py-2 px-3 font-medium text-slate-600">主键</th>
                              <th className="text-left py-2 px-3 font-medium text-slate-600">外键</th>
                              <th className="text-left py-2 px-3 font-medium text-slate-600">可空</th>
                              <th className="text-left py-2 px-3 font-medium text-slate-600">业务术语</th>
                              <th className="text-left py-2 px-3 font-medium text-slate-600">描述</th>
                            </tr>
                          </thead>
                          <tbody>
                            {obj.fields.map((field) => (
                              <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-100">
                                <td className="py-2 px-3 font-medium text-slate-800">{field.name}</td>
                                <td className="py-2 px-3 text-slate-600">
                                  {field.dataType}
                                  {field.length && `(${field.length})`}
                                </td>
                                <td className="py-2 px-3">
                                  {field.primaryKey && (
                                    <span className="text-blue-600">✓</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {field.foreignKey && (
                                    <span className="text-green-600">→ {field.referenceTable}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {field.nullable ? (
                                    <span className="text-yellow-600">✓</span>
                                  ) : (
                                    <span className="text-red-600">✗</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-slate-600">{field.businessTerm || '-'}</td>
                                <td className="py-2 px-3 text-slate-600">{field.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 标签 */}
                      {obj.tags.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <div className="flex flex-wrap gap-1">
                            {obj.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 映射关系 */}
                      {obj.mappings.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-slate-400" />
                          <div className="flex flex-wrap gap-2 text-xs">
                            {obj.mappings.map((mapping, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded"
                              >
                                {mapping.source}.{mapping.table}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加/编辑业务对象模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {selectedObject ? '编辑业务对象' : '创建业务对象'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    对象名称 *
                  </label>
                  <input
                    type="text"
                    value={newObject.name}
                    onChange={(e) => setNewObject({ ...newObject, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入对象名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    对象编码 *
                  </label>
                  <input
                    type="text"
                    value={newObject.code}
                    onChange={(e) => setNewObject({ ...newObject, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如: USER, ORDER"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    分类
                  </label>
                  <select
                    value={newObject.category}
                    onChange={(e) => setNewObject({ ...newObject, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="基础数据">基础数据</option>
                    <option value="业务数据">业务数据</option>
                    <option value="参考数据">参考数据</option>
                    <option value="元数据">元数据</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    状态
                  </label>
                  <select
                    value={newObject.status}
                    onChange={(e) => setNewObject({ ...newObject, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">草稿</option>
                    <option value="active">活跃</option>
                    <option value="deprecated">已废弃</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述
                </label>
                <textarea
                  value={newObject.description}
                  onChange={(e) => setNewObject({ ...newObject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="输入业务对象描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  版本
                </label>
                <input
                  type="text"
                  value={newObject.version}
                  onChange={(e) => setNewObject({ ...newObject, version: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="v1.0.0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedObject(null)
                  setNewObject({
                    name: '',
                    code: '',
                    category: '基础数据',
                    description: '',
                    status: 'draft',
                    version: 'v1.0.0',
                    fields: [],
                    tags: [],
                  })
                }}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddObject}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {selectedObject ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看详情模态框 */}
      {showViewModal && selectedObject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{selectedObject.name}</h3>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedObject(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-slate-400">×</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">对象编码</p>
                  <p className="font-medium text-slate-800">{selectedObject.code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">版本</p>
                  <p className="font-medium text-slate-800">{selectedObject.version}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">分类</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedObject.category)}`}>
                    {selectedObject.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">状态</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedObject.status)}`}>
                    {getStatusLabel(selectedObject.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">描述</p>
                <p className="text-slate-800">{selectedObject.description}</p>
              </div>

              {/* 字段列表 */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">字段定义 ({selectedObject.fields.length})</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">字段名</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">数据类型</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">主键</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">外键</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">可空</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">业务术语</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">描述</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedObject.fields.map((field) => (
                        <tr key={field.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-800">{field.name}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {field.dataType}
                            {field.length && `(${field.length})`}
                          </td>
                          <td className="py-3 px-4">
                            {field.primaryKey && <span className="text-blue-600 font-medium">PK</span>}
                          </td>
                          <td className="py-3 px-4">
                            {field.foreignKey && (
                              <span className="text-green-600 font-medium">FK → {field.referenceTable}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {field.nullable ? (
                              <span className="text-yellow-600">可空</span>
                            ) : (
                              <span className="text-red-600">必填</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{field.businessTerm || '-'}</td>
                          <td className="py-3 px-4 text-slate-600">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 映射关系 */}
              {selectedObject.mappings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">数据映射 ({selectedObject.mappings.length})</h4>
                  <div className="space-y-2">
                    {selectedObject.mappings.map((mapping, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Database className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-800">{mapping.source}</p>
                            <p className="text-sm text-slate-500">{mapping.table}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">最后同步</p>
                          <p className="text-sm font-medium text-slate-700">{mapping.lastSync}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签 */}
              {selectedObject.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedObject.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 元数据 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-sm text-slate-500 mb-1">创建者</p>
                  <p className="font-medium text-slate-800">{selectedObject.creator}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">创建时间</p>
                  <p className="font-medium text-slate-800">{selectedObject.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">更新时间</p>
                  <p className="font-medium text-slate-800">{selectedObject.updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessObjectModeling
