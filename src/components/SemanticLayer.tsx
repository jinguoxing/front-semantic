import { useState, useMemo } from 'react'
import { Plus, Edit, Trash2, Search, Eye, ArrowRight, ArrowLeft, Link2, Database, Network, GitBranch, Filter, CheckCircle, AlertCircle, Clock, ChevronRight, ChevronDown, Box } from 'lucide-react'

// 语义映射关系类型
type MappingType = 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'

interface SemanticMapping {
  id: string
  businessObjectId: string  // 业务对象ID
  businessObjectName: string
  physicalSource: string  // 物理数据源
  physicalTable: string  // 物理表名
  mappingType: MappingType
  fieldMappings: FieldMapping[]
  transformationRules: TransformationRule[]
  status: 'active' | 'draft' | 'deprecated'
  coverage: number  // 映射完整度 0-100
  lastSync: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface FieldMapping {
  id: string
  businessAttribute: string  // 业务属性名
  businessTerm: string  // 业务术语
  physicalField: string  // 物理字段名
  transformation?: string  // 转换逻辑
  dataType: string  // 数据类型
  isRequired: boolean
  status: 'mapped' | 'partial' | 'unmapped'
}

interface TransformationRule {
  id: string
  name: string
  description: string
  formula: string
  inputFields: string[]
  outputField: string
}

// 业务对象类型
type BusinessObjectType = 'entity' | 'event' | 'state' | 'rule' | 'attribute'

const SemanticLayer = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<MappingType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCoverage, setFilterCoverage] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showGraphModal, setShowGraphModal] = useState(false)
  const [selectedMapping, setSelectedMapping] = useState<SemanticMapping | null>(null)
  const [expandedMappings, setExpandedMappings] = useState<Set<string>>(new Set())

  const [semanticMappings, setSemanticMappings] = useState<SemanticMapping[]>([
    {
      id: '1',
      businessObjectId: 'BO001',
      businessObjectName: '客户',
      physicalSource: '生产数据库-MySQL',
      physicalTable: 'customer_info',
      mappingType: 'one_to_one',
      fieldMappings: [
        {
          id: 'fm1',
          businessAttribute: 'customer_id',
          businessTerm: '客户标识符',
          physicalField: 'id',
          dataType: 'bigint',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm2',
          businessAttribute: 'customer_name',
          businessTerm: '客户名称',
          physicalField: 'name',
          dataType: 'varchar',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm3',
          businessAttribute: 'customer_type',
          businessTerm: '客户类型',
          physicalField: 'type',
          dataType: 'varchar',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm4',
          businessAttribute: 'customer_level',
          businessTerm: '会员等级',
          physicalField: 'level',
          dataType: 'varchar',
          isRequired: false,
          status: 'partial',
          transformation: '需要转换：1=普通，2=白银，3=黄金，4=铂金',
        },
      ],
      transformationRules: [
        {
          id: 'tr1',
          name: '客户等级转换',
          description: '将数字等级转换为文字描述',
          formula: 'CASE level WHEN 1 THEN "普通" WHEN 2 THEN "白银" WHEN 3 THEN "黄金" WHEN 4 THEN "铂金" END',
          inputFields: ['level'],
          outputField: 'customer_level_desc',
        },
      ],
      status: 'active',
      coverage: 95,
      lastSync: '2024-01-10 10:00:00',
      createdBy: '张三',
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-10 10:00:00',
    },
    {
      id: '2',
      businessObjectId: 'BO002',
      businessObjectName: '订单',
      physicalSource: '生产数据库-MySQL',
      physicalTable: 'order_master',
      mappingType: 'one_to_one',
      fieldMappings: [
        {
          id: 'fm5',
          businessAttribute: 'order_id',
          businessTerm: '订单编号',
          physicalField: 'id',
          dataType: 'bigint',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm6',
          businessAttribute: 'customer_id',
          businessTerm: '客户标识符',
          physicalField: 'user_id',
          dataType: 'bigint',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm7',
          businessAttribute: 'order_amount',
          businessTerm: '订单总金额',
          physicalField: 'total_amount',
          dataType: 'decimal',
          isRequired: true,
          status: 'mapped',
          transformation: '单位：分转元 (除以100)',
        },
        {
          id: 'fm8',
          businessAttribute: 'order_status',
          businessTerm: '订单状态',
          physicalField: 'status',
          dataType: 'tinyint',
          isRequired: true,
          status: 'mapped',
        },
      ],
      transformationRules: [
        {
          id: 'tr2',
          name: '金额单位转换',
          description: '将分转换为元',
          formula: 'total_amount / 100',
          inputFields: ['total_amount'],
          outputField: 'order_amount',
        },
      ],
      status: 'active',
      coverage: 100,
      lastSync: '2024-01-10 10:05:00',
      createdBy: '李四',
      createdAt: '2024-01-02 09:00:00',
      updatedAt: '2024-01-10 10:05:00',
    },
    {
      id: '3',
      businessObjectId: 'BO003',
      businessObjectName: '订单状态',
      physicalSource: '生产数据库-MySQL',
      physicalTable: 'dict_order_status',
      mappingType: 'one_to_one',
      fieldMappings: [
        {
          id: 'fm9',
          businessAttribute: 'status_code',
          businessTerm: '状态码',
          physicalField: 'code',
          dataType: 'tinyint',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm10',
          businessAttribute: 'status_name',
          businessTerm: '状态名称',
          physicalField: 'name',
          dataType: 'varchar',
          isRequired: true,
          status: 'mapped',
        },
      ],
      transformationRules: [],
      status: 'active',
      coverage: 100,
      lastSync: '2024-01-10 09:00:00',
      createdBy: '王五',
      createdAt: '2024-01-03 10:00:00',
      updatedAt: '2024-01-10 09:00:00',
    },
    {
      id: '4',
      businessObjectId: 'BO004',
      businessObjectName: '收货地址',
      physicalSource: '生产数据库-MySQL',
      physicalTable: 'customer_address',
      mappingType: 'many_to_one',
      fieldMappings: [
        {
          id: 'fm11',
          businessAttribute: 'address_id',
          businessTerm: '地址标识符',
          physicalField: 'id',
          dataType: 'bigint',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm12',
          businessAttribute: 'region',
          businessTerm: '行政区域',
          physicalField: 'region_code',
          dataType: 'varchar',
          isRequired: true,
          status: 'partial',
          transformation: '需要关联行政区划表获取完整名称',
        },
        {
          id: 'fm13',
          businessAttribute: 'detail_address',
          businessTerm: '详细地址',
          physicalField: 'detail_addr',
          dataType: 'varchar',
          isRequired: true,
          status: 'mapped',
        },
        {
          id: 'fm14',
          businessAttribute: 'customer_id',
          businessTerm: '客户标识符',
          physicalField: 'user_id',
          dataType: 'bigint',
          isRequired: true,
          status: 'mapped',
        },
      ],
      transformationRules: [],
      status: 'active',
      coverage: 75,
      lastSync: '2024-01-10 10:00:00',
      createdBy: '张三',
      createdAt: '2024-01-05 14:00:00',
      updatedAt: '2024-01-10 14:00:00',
    },
    {
      id: '5',
      businessObjectId: 'BO005',
      businessObjectName: '订单金额计算规则',
      physicalSource: '数据仓库-Hive',
      physicalTable: 'fact_order_item',
      mappingType: 'many_to_one',
      fieldMappings: [
        {
          id: 'fm15',
          businessAttribute: 'order_id',
          businessTerm: '订单编号',
          physicalField: 'order_id',
          dataType: 'bigint',
          isRequired: true,
          status: 'mapped',
        },
      ],
      transformationRules: [
        {
          id: 'tr3',
          name: '订单金额汇总',
          description: 'SUM(商品金额 - 优惠金额) + 运费',
          formula: 'SUM(item_amount - discount_amount) + shipping_fee',
          inputFields: ['item_amount', 'discount_amount', 'shipping_fee'],
          outputField: 'order_amount',
        },
      ],
      status: 'draft',
      coverage: 40,
      lastSync: '2024-01-10 11:00:00',
      createdBy: '赵六',
      createdAt: '2024-01-04 11:00:00',
      updatedAt: '2024-01-10 11:00:00',
    },
  ])

  const [newMapping, setNewMapping] = useState<Partial<SemanticMapping>>({
    businessObjectId: '',
    businessObjectName: '',
    physicalSource: '',
    physicalTable: '',
    mappingType: 'one_to_one',
    fieldMappings: [],
    transformationRules: [],
    status: 'draft',
    coverage: 0,
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

  const getMappingTypeLabel = (type: MappingType) => {
    const labels: Record<MappingType, string> = {
      one_to_one: '1:1',
      one_to_many: '1:N',
      many_to_one: 'N:1',
      many_to_many: 'M:N',
    }
    return labels[type]
  }

  const getMappingTypeColor = (type: MappingType) => {
    const colors: Record<MappingType, string> = {
      one_to_one: 'bg-blue-100 text-blue-700',
      one_to_many: 'bg-green-100 text-green-700',
      many_to_one: 'bg-orange-100 text-orange-700',
      many_to_many: 'bg-purple-100 text-purple-700',
    }
    return colors[type]
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'bg-green-100 text-green-700'
    if (coverage >= 70) return 'bg-blue-100 text-blue-700'
    if (coverage >= 50) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedMappings)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedMappings(newExpanded)
  }

  const handleView = (mapping: SemanticMapping) => {
    setSelectedMapping(mapping)
    setShowViewModal(true)
  }

  const handleEdit = (id: string) => {
    const mapping = semanticMappings.find(m => m.id === id)
    if (mapping) {
      setSelectedMapping(mapping)
      setNewMapping(mapping)
      setShowAddModal(true)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个语义映射吗？')) {
      setSemanticMappings(prev => prev.filter(m => m.id !== id))
    }
  }

  const handleAddMapping = () => {
    if (!newMapping.businessObjectName || !newMapping.physicalTable) {
      alert('请填写业务对象名称和物理表名')
      return
    }

    const mapping: SemanticMapping = {
      id: Date.now().toString(),
      businessObjectId: newMapping.businessObjectId || '',
      businessObjectName: newMapping.businessObjectName || '',
      physicalSource: newMapping.physicalSource || '',
      physicalTable: newMapping.physicalTable || '',
      mappingType: newMapping.mappingType as MappingType || 'one_to_one',
      fieldMappings: newMapping.fieldMappings || [],
      transformationRules: newMapping.transformationRules || [],
      status: newMapping.status as any || 'draft',
      coverage: newMapping.coverage || 0,
      lastSync: new Date().toLocaleString('zh-CN'),
      createdBy: '当前用户',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    }

    setSemanticMappings(prev => [...prev, mapping])
    setShowAddModal(false)
    resetNewMapping()
  }

  const resetNewMapping = () => {
    setNewMapping({
      businessObjectId: '',
      businessObjectName: '',
      physicalSource: '',
      physicalTable: '',
      mappingType: 'one_to_one',
      fieldMappings: [],
      transformationRules: [],
      status: 'draft',
      coverage: 0,
    })
    setSelectedMapping(null)
  }

  const filteredMappings = semanticMappings.filter(mapping => {
    const matchesSearch = mapping.businessObjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.physicalTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.physicalSource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || mapping.mappingType === filterType
    const matchesStatus = filterStatus === 'all' || mapping.status === filterStatus

    let matchesCoverage = true
    if (filterCoverage === 'high') matchesCoverage = mapping.coverage >= 90
    else if (filterCoverage === 'medium') matchesCoverage = mapping.coverage >= 50 && mapping.coverage < 90
    else if (filterCoverage === 'low') matchesCoverage = mapping.coverage < 50

    return matchesSearch && matchesType && matchesStatus && matchesCoverage
  })

  // 统计信息
  const summary = useMemo(() => {
    return {
      total: semanticMappings.length,
      active: semanticMappings.filter(m => m.status === 'active').length,
      draft: semanticMappings.filter(m => m.status === 'draft').length,
      avgCoverage: Math.round(semanticMappings.reduce((sum, m) => sum + m.coverage, 0) / semanticMappings.length),
      totalFields: semanticMappings.reduce((sum, m) => sum + m.fieldMappings.length, 0),
      totalTransformations: semanticMappings.reduce((sum, m) => sum + m.transformationRules.length, 0),
    }
  }, [semanticMappings])

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">语义映射管理</h3>
          <p className="text-xs text-slate-500 mt-0.5">管理业务对象与物理表之间的语义映射关系</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGraphModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm"
          >
            <Network className="w-3.5 h-3.5" />
            映射图谱
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            创建映射
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded">
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">总映射数</p>
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
              <p className="text-[10px] text-slate-500">活跃</p>
              <p className="text-lg font-bold text-green-600">{summary.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded">
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">平均完整度</p>
              <p className="text-lg font-bold text-purple-600">{summary.avgCoverage}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-1.5 rounded">
              <Database className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">字段映射</p>
              <p className="text-lg font-bold text-orange-600">{summary.totalFields}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-1.5 rounded">
              <Filter className="w-3.5 h-3.5 text-pink-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">转换规则</p>
              <p className="text-lg font-bold text-pink-600">{summary.totalTransformations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 语义映射列表 */}
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MappingType | 'all')}
              className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="one_to_one">1:1</option>
              <option value="one_to_many">1:N</option>
              <option value="many_to_one">N:1</option>
              <option value="many_to_many">M:N</option>
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
            <select
              value={filterCoverage}
              onChange={(e) => setFilterCoverage(e.target.value)}
              className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部完整度</option>
              <option value="high">高 (≥90%)</option>
              <option value="medium">中 (50-90%)</option>
              <option value="low">低 (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* 表头 */}
        <div className="bg-slate-50 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-slate-600 border-b border-slate-200">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredMappings.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(filteredMappings.map(m => m.id)))
                } else {
                  setSelectedItems(new Set())
                }
              }}
              className="w-3.5 h-3.5 rounded border-slate-300"
            />
          </div>
          <div className="col-span-3">业务对象 → 物理表</div>
          <div className="col-span-1">映射类型</div>
          <div className="col-span-2">字段映射</div>
          <div className="col-span-1">完整度</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-2">同步时间</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-200">
          {filteredMappings.map((mapping) => (
            <div key={mapping.id} className="hover:bg-slate-50 transition-colors">
              {/* 主行 */}
              <div className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(mapping.id)}
                    onChange={() => {
                      const newSelected = new Set(selectedItems)
                      if (newSelected.has(mapping.id)) {
                        newSelected.delete(mapping.id)
                      } else {
                        newSelected.add(mapping.id)
                      }
                      setSelectedItems(newSelected)
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300"
                  />
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(mapping.id)}
                      className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      {expandedMappings.has(mapping.id) ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-blue-600">{mapping.businessObjectName}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-medium text-green-600">{mapping.physicalTable}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{mapping.physicalSource}</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getMappingTypeColor(mapping.mappingType)}`}>
                    {getMappingTypeLabel(mapping.mappingType)}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span>字段: {mapping.fieldMappings.length}</span>
                    <span>转换: {mapping.transformationRules.length}</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getCoverageColor(mapping.coverage)}`}>
                    {mapping.coverage}%
                  </span>
                </div>
                <div className="col-span-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(mapping.status)}`}>
                    {getStatusLabel(mapping.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5" />
                    {mapping.lastSync.split(' ')[1]}
                  </div>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <button
                    onClick={() => handleView(mapping)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEdit(mapping.id)}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(mapping.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 展开的字段映射详情 */}
              {expandedMappings.has(mapping.id) && (
                <div className="ml-8 mt-1 mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {/* 字段映射列表 */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">字段映射 ({mapping.fieldMappings.length})</h4>
                    <div className="space-y-1">
                      {mapping.fieldMappings.map((fm) => (
                        <div key={fm.id} className="flex items-center gap-2 text-xs bg-white p-2 rounded">
                          <span className="font-medium text-blue-600">{fm.businessAttribute}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-medium text-green-600">{fm.physicalField}</span>
                          <span className="text-slate-500">({fm.dataType})</span>
                          {fm.transformation && (
                            <span className="text-orange-600 bg-orange-50 px-1 rounded truncate flex-1" title={fm.transformation}>
                              {fm.transformation}
                            </span>
                          )}
                          <span className={`px-1 rounded ${fm.status === 'mapped' ? 'bg-green-100 text-green-700' : fm.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {fm.status === 'mapped' ? '✓' : fm.status === 'partial' ? '~' : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 转换规则 */}
                  {mapping.transformationRules.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">转换规则 ({mapping.transformationRules.length})</h4>
                      <div className="space-y-1">
                        {mapping.transformationRules.map((tr) => (
                          <div key={tr.id} className="text-xs bg-white p-2 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-purple-600">{tr.name}</span>
                              <span className="text-slate-400">:</span>
                              <span className="font-mono text-slate-600 flex-1 truncate">{tr.formula}</span>
                            </div>
                            <p className="text-slate-500">{tr.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 创建/编辑映射模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {selectedMapping ? '编辑语义映射' : '创建语义映射'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">业务对象名称 *</label>
                  <input
                    type="text"
                    value={newMapping.businessObjectName}
                    onChange={(e) => setNewMapping({ ...newMapping, businessObjectName: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="如: 客户、订单"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">物理表名 *</label>
                  <input
                    type="text"
                    value={newMapping.physicalTable}
                    onChange={(e) => setNewMapping({ ...newMapping, physicalTable: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="如: customer_info"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">数据源</label>
                  <input
                    type="text"
                    value={newMapping.physicalSource}
                    onChange={(e) => setNewMapping({ ...newMapping, physicalSource: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="如: 生产数据库-MySQL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">映射类型</label>
                  <select
                    value={newMapping.mappingType}
                    onChange={(e) => setNewMapping({ ...newMapping, mappingType: e.target.value as MappingType })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="one_to_one">1:1 (一对一)</option>
                    <option value="one_to_many">1:N (一对多)</option>
                    <option value="many_to_one">N:1 (多对一)</option>
                    <option value="many_to_many">M:N (多对多)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetNewMapping()
                }}
                className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddMapping}
                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {selectedMapping ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看详情模态框 */}
      {showViewModal && selectedMapping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">映射详情</h3>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedMapping(null)
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
                  <p className="text-[10px] text-slate-500 mb-0.5">业务对象</p>
                  <p className="text-sm font-medium text-blue-600">{selectedMapping.businessObjectName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">物理表</p>
                  <p className="text-sm font-medium text-green-600">{selectedMapping.physicalTable}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">映射类型</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getMappingTypeColor(selectedMapping.mappingType)}`}>
                    {getMappingTypeLabel(selectedMapping.mappingType)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">完整度</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getCoverageColor(selectedMapping.coverage)}`}>
                    {selectedMapping.coverage}%
                  </span>
                </div>
              </div>

              {/* 字段映射详情 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">字段映射 ({selectedMapping.fieldMappings.length})</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">业务属性</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">业务术语</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">物理字段</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">数据类型</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">转换逻辑</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedMapping.fieldMappings.map((fm) => (
                        <tr key={fm.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-blue-600">{fm.businessAttribute}</td>
                          <td className="py-2 px-3 text-slate-600">{fm.businessTerm}</td>
                          <td className="py-2 px-3 font-medium text-green-600">{fm.physicalField}</td>
                          <td className="py-2 px-3 text-slate-600">{fm.dataType}</td>
                          <td className="py-2 px-3 text-slate-600">{fm.transformation || '-'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              fm.status === 'mapped' ? 'bg-green-100 text-green-700' :
                              fm.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {fm.status === 'mapped' ? '已映射' : fm.status === 'partial' ? '部分映射' : '未映射'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 转换规则 */}
              {selectedMapping.transformationRules.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">转换规则 ({selectedMapping.transformationRules.length})</h4>
                  <div className="space-y-2">
                    {selectedMapping.transformationRules.map((tr) => (
                      <div key={tr.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-purple-600">{tr.name}</span>
                          <span className="text-[10px] text-slate-500">{tr.inputFields.join(', ')} → {tr.outputField}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">{tr.description}</p>
                        <code className="text-xs text-slate-800 bg-white px-2 py-1 rounded block">{tr.formula}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 映射图谱模态框 */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">语义映射图谱</h3>
              <button
                onClick={() => setShowGraphModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <span className="text-xl text-slate-400">×</span>
              </button>
            </div>

            <div className="flex gap-8">
              {/* 左侧：业务对象 */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-600 mb-3">业务对象层</h4>
                <div className="space-y-2">
                  {semanticMappings.map((mapping) => (
                    <div key={`bo-${mapping.id}`} className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Box className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-900">{mapping.businessObjectName}</span>
                      </div>
                      <p className="text-[10px] text-slate-600">属性数: {mapping.fieldMappings.length}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 中间：映射关系 */}
              <div className="flex flex-col justify-center">
                {semanticMappings.map((mapping) => (
                  <div key={`arrow-${mapping.id}`} className="flex items-center gap-2 my-4">
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getMappingTypeColor(mapping.mappingType)}`}>
                      {getMappingTypeLabel(mapping.mappingType)}
                    </span>
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                  </div>
                ))}
              </div>

              {/* 右侧：物理表 */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-600 mb-3">物理表层</h4>
                <div className="space-y-2">
                  {semanticMappings.map((mapping) => (
                    <div key={`pt-${mapping.id}`} className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-green-900">{mapping.physicalTable}</span>
                      </div>
                      <p className="text-[10px] text-slate-600">{mapping.physicalSource}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SemanticLayer
