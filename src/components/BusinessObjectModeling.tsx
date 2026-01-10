import { useState, useMemo } from 'react'
import { Plus, Edit, Trash2, Search, Eye, Layers, Database, Tag, Link2, ChevronDown, ChevronUp, GitBranch, Box, Zap, FileText, Settings, ArrowRight, Network } from 'lucide-react'

// 5类业务对象类型
type ObjectType = 'entity' | 'event' | 'state' | 'rule' | 'attribute'

interface BusinessObject {
  id: string
  name: string
  code: string
  type: ObjectType  // 5类对象之一
  domain: string  // 业务域
  grain: string  // 数据粒度
  description: string
  status: 'draft' | 'active' | 'deprecated'
  version: string
  attributes: BusinessAttribute[]
  relationships: Relationship[]
  mappings: PhysicalMapping[]
  tags: string[]
  createdAt: string
  updatedAt: string
  creator: string
}

interface BusinessAttribute {
  id: string
  name: string
  code: string
  dataType: string
  description: string
  businessTerm: string
  isRequired: boolean
  isIdentifier: boolean
  defaultValue?: string
}

interface Relationship {
  id: string
  fromObjectId: string
  toObjectId: string
  type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'
  description: string
}

interface PhysicalMapping {
  id: string
  source: string
  table: string
  mappingType: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'
  fieldMappings: {
    businessAttribute: string
    physicalField: string
    transformation?: string
  }[]
  lastSync: string
}

const BusinessObjectModeling = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<ObjectType | 'all'>('all')
  const [filterDomain, setFilterDomain] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRelationModal, setShowRelationModal] = useState(false)
  const [selectedObject, setSelectedObject] = useState<BusinessObject | null>(null)

  const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>([
    {
      id: '1',
      name: '客户',
      code: 'CUSTOMER',
      type: 'entity',
      domain: '客户域',
      grain: '单个自然人或法人',
      description: '客户主体对象，包含客户的基本信息、联系方式、等级信息等',
      status: 'active',
      version: 'v1.0.0',
      attributes: [
        { id: 'a1', name: '客户ID', code: 'customer_id', dataType: 'bigint', description: '客户唯一标识', businessTerm: '客户标识符', isRequired: true, isIdentifier: true },
        { id: 'a2', name: '客户名称', code: 'customer_name', dataType: 'varchar', description: '客户姓名或企业名称', businessTerm: '客户名称', isRequired: true, isIdentifier: false },
        { id: 'a3', name: '客户类型', code: 'customer_type', dataType: 'varchar', description: '个人/企业', businessTerm: '客户类型', isRequired: true, isIdentifier: false },
        { id: 'a4', name: '客户等级', code: 'customer_level', dataType: 'varchar', description: 'VIP等级', businessTerm: '会员等级', isRequired: false, isIdentifier: false },
      ],
      relationships: [
        { id: 'r1', fromObjectId: '1', toObjectId: '2', type: 'one_to_many', description: '一个客户可以有多个订单' },
      ],
      mappings: [
        {
          id: 'm1',
          source: '生产数据库-MySQL',
          table: 'customer_info',
          mappingType: 'one_to_one',
          fieldMappings: [
            { businessAttribute: 'customer_id', physicalField: 'id' },
            { businessAttribute: 'customer_name', physicalField: 'name' },
            { businessAttribute: 'customer_type', physicalField: 'type' },
          ],
          lastSync: '2024-01-10 10:00:00',
        },
      ],
      tags: ['核心', '主体对象'],
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-10 10:00:00',
      creator: '张三',
    },
    {
      id: '2',
      name: '订单',
      code: 'ORDER',
      type: 'event',
      domain: '交易域',
      grain: '单个订单',
      description: '订单行为对象，记录订单的创建、支付、发货等行为',
      status: 'active',
      version: 'v1.2.0',
      attributes: [
        { id: 'a5', name: '订单ID', code: 'order_id', dataType: 'bigint', description: '订单唯一标识', businessTerm: '订单编号', isRequired: true, isIdentifier: true },
        { id: 'a6', name: '客户ID', code: 'customer_id', dataType: 'bigint', description: '下单客户', businessTerm: '客户标识符', isRequired: true, isIdentifier: false },
        { id: 'a7', name: '订单金额', code: 'order_amount', dataType: 'decimal', description: '订单总金额（元）', businessTerm: '订单总金额', isRequired: true, isIdentifier: false },
        { id: 'a8', name: '订单状态', code: 'order_status', dataType: 'tinyint', description: '订单状态码', businessTerm: '订单状态', isRequired: true, isIdentifier: false },
      ],
      relationships: [
        { id: 'r2', fromObjectId: '2', toObjectId: '3', type: 'many_to_one', description: '订单属于某个状态' },
      ],
      mappings: [
        {
          id: 'm2',
          source: '生产数据库-MySQL',
          table: 'order_master',
          mappingType: 'one_to_one',
          fieldMappings: [
            { businessAttribute: 'order_id', physicalField: 'id' },
            { businessAttribute: 'customer_id', physicalField: 'user_id' },
            { businessAttribute: 'order_amount', physicalField: 'total_amount' },
          ],
          lastSync: '2024-01-10 10:05:00',
        },
      ],
      tags: ['核心', '行为对象'],
      createdAt: '2024-01-02 09:00:00',
      updatedAt: '2024-01-10 10:05:00',
      creator: '李四',
    },
    {
      id: '3',
      name: '订单状态',
      code: 'ORDER_STATUS',
      type: 'state',
      domain: '交易域',
      grain: '单个状态枚举值',
      description: '订单状态枚举对象，定义订单的各种状态',
      status: 'active',
      version: 'v1.0.0',
      attributes: [
        { id: 'a9', name: '状态码', code: 'status_code', dataType: 'tinyint', description: '状态数字编码', businessTerm: '状态码', isRequired: true, isIdentifier: true },
        { id: 'a10', name: '状态名称', code: 'status_name', dataType: 'varchar', description: '状态中文描述', businessTerm: '状态名称', isRequired: true, isIdentifier: false },
      ],
      relationships: [],
      mappings: [
        {
          id: 'm3',
          source: '生产数据库-MySQL',
          table: 'dict_order_status',
          mappingType: 'one_to_one',
          fieldMappings: [
            { businessAttribute: 'status_code', physicalField: 'code' },
            { businessAttribute: 'status_name', physicalField: 'name' },
          ],
          lastSync: '2024-01-10 09:00:00',
        },
      ],
      tags: ['参考数据', '状态对象'],
      createdAt: '2024-01-03 10:00:00',
      updatedAt: '2024-01-10 09:00:00',
      creator: '王五',
    },
    {
      id: '4',
      name: '订单金额计算规则',
      code: 'ORDER_AMOUNT_RULE',
      type: 'rule',
      domain: '交易域',
      grain: '单条计算规则',
      description: '订单金额计算规则：订单金额 = 商品金额 - 优惠金额 + 运费',
      status: 'active',
      version: 'v1.1.0',
      attributes: [
        { id: 'a11', name: '规则ID', code: 'rule_id', dataType: 'varchar', description: '规则唯一标识', businessTerm: '规则标识符', isRequired: true, isIdentifier: true },
        { id: 'a12', name: '计算公式', code: 'formula', dataType: 'text', description: '计算逻辑表达式', businessTerm: '计算公式', isRequired: true, isIdentifier: false },
      ],
      relationships: [],
      mappings: [],
      tags: ['规则对象', '计算逻辑'],
      createdAt: '2024-01-04 11:00:00',
      updatedAt: '2024-01-10 11:00:00',
      creator: '赵六',
    },
    {
      id: '5',
      name: '收货地址',
      code: 'DELIVERY_ADDRESS',
      type: 'attribute',
      domain: '客户域',
      grain: '单个地址',
      description: '收货地址属性对象，属于客户的扩展属性',
      status: 'active',
      version: 'v1.0.0',
      attributes: [
        { id: 'a13', name: '地址ID', code: 'address_id', dataType: 'bigint', description: '地址唯一标识', businessTerm: '地址标识符', isRequired: true, isIdentifier: true },
        { id: 'a14', name: '省市区', code: 'region', dataType: 'varchar', description: '省市区代码', businessTerm: '行政区域', isRequired: true, isIdentifier: false },
        { id: 'a15', name: '详细地址', code: 'detail_address', dataType: 'varchar', description: '街道门牌号', businessTerm: '详细地址', isRequired: true, isIdentifier: false },
      ],
      relationships: [
        { id: 'r3', fromObjectId: '5', toObjectId: '1', type: 'many_to_one', description: '地址属于客户' },
      ],
      mappings: [
        {
          id: 'm4',
          source: '生产数据库-MySQL',
          table: 'customer_address',
          mappingType: 'one_to_one',
          fieldMappings: [
            { businessAttribute: 'address_id', physicalField: 'id' },
            { businessAttribute: 'region', physicalField: 'region_code' },
          ],
          lastSync: '2024-01-10 10:00:00',
        },
      ],
      tags: ['属性对象', '扩展属性'],
      createdAt: '2024-01-05 14:00:00',
      updatedAt: '2024-01-10 14:00:00',
      creator: '张三',
    },
  ])

  const [newObject, setNewObject] = useState<Partial<BusinessObject>>({
    name: '',
    code: '',
    type: 'entity',
    domain: '',
    grain: '',
    description: '',
    status: 'draft',
    version: 'v1.0.0',
    attributes: [],
    relationships: [],
    mappings: [],
    tags: [],
  })

  // 对象类型配置
  const objectTypeConfig = {
    entity: { label: '主体', icon: Box, color: 'blue', description: '核心业务资源' },
    event: { label: '行为', icon: Zap, color: 'green', description: '业务动作/事件' },
    state: { label: '状态', icon: FileText, color: 'purple', description: '状态/枚举值' },
    rule: { label: '规则', icon: Settings, color: 'orange', description: '计算规则/逻辑' },
    attribute: { label: '属性', icon: Tag, color: 'pink', description: '扩展属性' },
  }

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

  const getObjectTypeColor = (type: ObjectType) => {
    const colors: Record<ObjectType, string> = {
      entity: 'bg-blue-100 text-blue-700',
      event: 'bg-green-100 text-green-700',
      state: 'bg-purple-100 text-purple-700',
      rule: 'bg-orange-100 text-orange-700',
      attribute: 'bg-pink-100 text-pink-700',
    }
    return colors[type]
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
    if (confirm('确定要删除这个业务对象吗？')) {
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
      type: newObject.type as ObjectType || 'entity',
      domain: newObject.domain || '',
      grain: newObject.grain || '',
      description: newObject.description || '',
      status: newObject.status as any || 'draft',
      version: newObject.version || 'v1.0.0',
      attributes: newObject.attributes || [],
      relationships: newObject.relationships || [],
      mappings: newObject.mappings || [],
      tags: newObject.tags || [],
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
      creator: '当前用户',
    }

    setBusinessObjects(prev => [...prev, obj])
    setShowAddModal(false)
    resetNewObject()
  }

  const resetNewObject = () => {
    setNewObject({
      name: '',
      code: '',
      type: 'entity',
      domain: '',
      grain: '',
      description: '',
      status: 'draft',
      version: 'v1.0.0',
      attributes: [],
      relationships: [],
      mappings: [],
      tags: [],
    })
    setSelectedObject(null)
  }

  const filteredObjects = businessObjects.filter(obj => {
    const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || obj.type === filterType
    const matchesDomain = filterDomain === 'all' || obj.domain === filterDomain
    const matchesStatus = filterStatus === 'all' || obj.status === filterStatus
    return matchesSearch && matchesType && matchesDomain && matchesStatus
  })

  // 统计信息
  const summary = useMemo(() => {
    return {
      total: businessObjects.length,
      entity: businessObjects.filter(obj => obj.type === 'entity').length,
      event: businessObjects.filter(obj => obj.type === 'event').length,
      state: businessObjects.filter(obj => obj.type === 'state').length,
      rule: businessObjects.filter(obj => obj.type === 'rule').length,
      attribute: businessObjects.filter(obj => obj.type === 'attribute').length,
      active: businessObjects.filter(obj => obj.status === 'active').length,
      totalRelations: businessObjects.reduce((sum, obj) => sum + obj.relationships.length, 0),
    }
  }, [businessObjects])

  // 获取唯一域名列表
  const domains = useMemo(() => {
    return Array.from(new Set(businessObjects.map(obj => obj.domain)))
  }, [businessObjects])

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">业务对象建模</h3>
          <p className="text-xs text-slate-500 mt-0.5">基于5类对象的业务建模和语义映射管理</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRelationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm"
          >
            <Network className="w-3.5 h-3.5" />
            关系图谱
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            创建对象
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">总对象数</p>
              <p className="text-lg font-bold text-slate-800">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded">
              <Box className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">主体对象</p>
              <p className="text-lg font-bold text-green-600">{summary.entity}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded">
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">关系数</p>
              <p className="text-lg font-bold text-purple-600">{summary.totalRelations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">活跃</p>
              <p className="text-lg font-bold text-emerald-600">{summary.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5类对象类型概览 */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.keys(objectTypeConfig) as ObjectType[]).map((type) => {
          const config = objectTypeConfig[type]
          const Icon = config.icon
          const count = businessObjects.filter(obj => obj.type === type).length
          return (
            <div
              key={type}
              className={`bg-white rounded-lg p-2.5 shadow-sm border border-slate-200 cursor-pointer hover:border-${config.color}-300 transition-all ${
                filterType === type ? `ring-2 ring-${config.color}-500` : ''
              }`}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
            >
              <div className="flex items-center gap-1.5">
                <div className={`bg-${config.color}-100 p-1 rounded`}>
                  <Icon className={`w-3 h-3 text-${config.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 truncate">{config.label}</p>
                  <p className="text-sm font-bold text-slate-800">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 业务对象列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部域</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="draft">草稿</option>
              <option value="deprecated">已废弃</option>
            </select>
          </div>
        </div>

        {/* 表头 */}
        <div className="bg-slate-50 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredObjects.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(filteredObjects.map(obj => obj.id)))
                } else {
                  setSelectedItems(new Set())
                }
              }}
              className="w-3.5 h-3.5 rounded border-slate-300"
            />
          </div>
          <div className="col-span-2">对象名称</div>
          <div className="col-span-1">类型</div>
          <div className="col-span-2">业务域</div>
          <div className="col-span-2">数据粒度</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-2">属性/关系</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {filteredObjects.map((obj) => {
            const TypeConfig = objectTypeConfig[obj.type]
            const TypeIcon = TypeConfig.icon
            return (
              <div
                key={obj.id}
                className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-1">
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
                    className="w-3.5 h-3.5 rounded border-slate-300"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{obj.name}</p>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">{obj.code}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{obj.description}</p>
                </div>
                <div className="col-span-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 w-fit ${getObjectTypeColor(obj.type)}`}>
                    <TypeIcon className="w-2.5 h-2.5" />
                    {TypeConfig.label}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-700">{obj.domain}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-600 truncate">{obj.grain}</p>
                </div>
                <div className="col-span-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(obj.status)}`}>
                    {getStatusLabel(obj.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>属性: {obj.attributes.length}</span>
                    <span>关系: {obj.relationships.length}</span>
                    <span>映射: {obj.mappings.length}</span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <button
                    onClick={() => handleView(obj)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdit(obj.id)}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(obj.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 创建/编辑业务对象模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {selectedObject ? '编辑业务对象' : '创建业务对象'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">对象名称 *</label>
                  <input
                    type="text"
                    value={newObject.name}
                    onChange={(e) => setNewObject({ ...newObject, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="如: 客户、订单"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">对象编码 *</label>
                  <input
                    type="text"
                    value={newObject.code}
                    onChange={(e) => setNewObject({ ...newObject, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="如: CUSTOMER, ORDER"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">对象类型 *</label>
                  <select
                    value={newObject.type}
                    onChange={(e) => setNewObject({ ...newObject, type: e.target.value as ObjectType })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(objectTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label} - {config.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">业务域</label>
                  <input
                    type="text"
                    value={newObject.domain}
                    onChange={(e) => setNewObject({ ...newObject, domain: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="如: 客户域、交易域"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">数据粒度 *</label>
                <input
                  type="text"
                  value={newObject.grain}
                  onChange={(e) => setNewObject({ ...newObject, grain: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="一行数据代表什么？如: 单个客户、单笔订单"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={newObject.description}
                  onChange={(e) => setNewObject({ ...newObject, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  placeholder="业务对象的详细描述"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetNewObject()
                }}
                className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddObject}
                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{selectedObject.name}</h3>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedObject(null)
                }}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <span className="text-xl text-slate-400">×</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">对象编码</p>
                  <p className="text-sm font-medium text-slate-800">{selectedObject.code}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">类型</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getObjectTypeColor(selectedObject.type)}`}>
                    {objectTypeConfig[selectedObject.type].label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">业务域</p>
                  <p className="text-sm font-medium text-slate-800">{selectedObject.domain}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">状态</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(selectedObject.status)}`}>
                    {getStatusLabel(selectedObject.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">数据粒度</p>
                <p className="text-sm text-slate-800">{selectedObject.grain}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">描述</p>
                <p className="text-sm text-slate-800">{selectedObject.description}</p>
              </div>

              {/* 业务属性列表 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">业务属性 ({selectedObject.attributes.length})</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">属性名</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">编码</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">数据类型</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">业务术语</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">描述</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedObject.attributes.map((attr) => (
                        <tr key={attr.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{attr.name}</td>
                          <td className="py-2 px-3 text-slate-600">{attr.code}</td>
                          <td className="py-2 px-3 text-slate-600">{attr.dataType}</td>
                          <td className="py-2 px-3 text-slate-600">{attr.businessTerm}</td>
                          <td className="py-2 px-3 text-slate-600">{attr.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 对象关系 */}
              {selectedObject.relationships.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">对象关系 ({selectedObject.relationships.length})</h4>
                  <div className="space-y-2">
                    {selectedObject.relationships.map((rel) => {
                      const toObj = businessObjects.find(o => o.id === rel.toObjectId)
                      return (
                        <div key={rel.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          <span className="font-medium text-slate-800">{selectedObject.name}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-800">{toObj?.name}</span>
                          <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border">{rel.type}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 物理映射 */}
              {selectedObject.mappings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">物理映射 ({selectedObject.mappings.length})</h4>
                  <div className="space-y-2">
                    {selectedObject.mappings.map((mapping) => (
                      <div key={mapping.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-800">{mapping.source}</span>
                          <span className="text-slate-400">.</span>
                          <span className="text-sm text-slate-600">{mapping.table}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{mapping.lastSync}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签 */}
              {selectedObject.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedObject.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 关系图谱模态框 */}
      {showRelationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">业务对象关系图谱</h3>
              <button
                onClick={() => setShowRelationModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <span className="text-xl text-slate-400">×</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {businessObjects.map((obj) => {
                const TypeConfig = objectTypeConfig[obj.type]
                const TypeIcon = TypeConfig.icon
                return (
                  <div
                    key={obj.id}
                    className={`bg-gradient-to-br from-${TypeConfig.color}-50 to-${TypeConfig.color}-100 border border-${TypeConfig.color}-200 rounded-lg p-3`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`bg-${TypeConfig.color}-500 p-1.5 rounded`}>
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{obj.name}</p>
                        <p className="text-[10px] text-slate-500">{TypeConfig.label}</p>
                      </div>
                    </div>

                    {obj.relationships.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {obj.relationships.map((rel) => {
                          const toObj = businessObjects.find(o => o.id === rel.toObjectId)
                          return (
                            <div key={rel.id} className="flex items-center gap-1 text-[10px]">
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{toObj?.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessObjectModeling
