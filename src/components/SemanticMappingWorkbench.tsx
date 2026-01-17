import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  GitBranch,
  Box,
  Hash,
  Sparkles,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronDown,
  ChevronRight,
  Link2,
  Zap,
  Shield,
  Copy,
  Download,
  Upload,
  MoreHorizontal,
  Target,
  Layers,
} from 'lucide-react'

// 映射状态
type MappingStatus = 'draft' | 'review' | 'effective'
type GateStatus = 'passed' | 'failed'
type AttributeType = 'key' | 'required' | 'core' | 'extended' | 'sensitive'

// 业务对象属性
interface BusinessAttribute {
  id: string
  name: string
  code: string
  type: AttributeType
  dataType: string
  isRequired: boolean
  isPrimaryKey: boolean
  mappingStatus: 'unmapped' | 'mapped' | 'conflict' | 'review'
  businessTerm: string
  description: string
}

// 来源表字段
interface SourceField {
  id: string
  name: string
  tableName: string
  dataType: string
  isPrimaryKey: boolean
  isNullable: boolean
  sensitivityLevel?: 'high' | 'medium' | 'low'
  semanticType?: string
  confidence?: number  // AI 置信度
  occupiedBy?: string  // 被哪个属性占用
}

// 映射关系
interface AttributeMapping {
  id: string
  attributeId: string
  fieldId: string
  status: 'confirmed' | 'review' | 'conflict'
  mappingType: 'direct' | 'derived' | 'conditional'
  transformation?: string
  confidence?: number
  conflictReason?: string
}

// 来源表角色
type TableRole = 'main' | 'extension' | 'dimension' | 'event'

interface SourceTable {
  id: string
  name: string
  role: TableRole
  rowCount: number
  updateTime: string
  gateStatus: GateStatus
  sensitiveFieldCount: number
}

const SemanticMappingWorkbench = () => {
  // 视图状态
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas')
  const [mappingStatus, setMappingStatus] = useState<MappingStatus>('draft')
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [selectedTables, setSelectedTables] = useState<SourceTable[]>([])
  const [selectedAttribute, setSelectedAttribute] = useState<BusinessAttribute | null>(null)
  const [selectedField, setSelectedField] = useState<SourceField | null>(null)
  const [showMappingDetail, setShowMappingDetail] = useState(false)
  const [showAIResults, setShowAIResults] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [showAddTableModal, setShowAddTableModal] = useState(false)
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set())
  const [activeTableId, setActiveTableId] = useState<string | null>(null)

  // 模拟业务对象数据
  const businessObjects = [
    {
      id: 'BO001',
      name: '新生儿',
      code: 'Newborn',
      type: 'entity',
      requiredProgress: 3,
      totalProgress: 4,
      requiredCount: 4,
      totalCount: 5,
      gatePassed: false,
      conflictCount: 0,
      status: 'draft' as MappingStatus,
    },
    {
      id: 'BO002',
      name: '就诊记录',
      code: 'MedicalVisit',
      type: 'event',
      requiredProgress: 2,
      totalProgress: 3,
      requiredCount: 3,
      totalCount: 5,
      gatePassed: true,
      conflictCount: 1,
      status: 'review' as MappingStatus,
    },
  ]

  // 模拟业务属性
  const [attributes] = useState<BusinessAttribute[]>([
    {
      id: 'attr1',
      name: '身份证号',
      code: 'id_card',
      type: 'key',
      dataType: 'String',
      isRequired: true,
      isPrimaryKey: true,
      mappingStatus: 'mapped',
      businessTerm: '身份证明文件号码',
      description: '新生儿法定监护人的身份证号码',
    },
    {
      id: 'attr2',
      name: '姓名',
      code: 'name',
      type: 'required',
      dataType: 'String',
      isRequired: true,
      isPrimaryKey: false,
      mappingStatus: 'mapped',
      businessTerm: '新生儿姓名',
      description: '新生儿的法定姓名',
    },
    {
      id: 'attr3',
      name: '性别',
      code: 'gender',
      type: 'required',
      dataType: 'Enum',
      isRequired: true,
      isPrimaryKey: false,
      mappingStatus: 'mapped',
      businessTerm: '生理性别',
      description: '新生儿的生理性别，男/女/未知',
    },
    {
      id: 'attr4',
      name: '出生日期',
      code: 'birth_date',
      type: 'required',
      dataType: 'DateTime',
      isRequired: true,
      isPrimaryKey: false,
      mappingStatus: 'mapped',
      businessTerm: '出生时间',
      description: '新生儿出生的日期和时间',
    },
    {
      id: 'attr5',
      name: '出生体重',
      code: 'birth_weight',
      type: 'core',
      dataType: 'Decimal',
      isRequired: false,
      isPrimaryKey: false,
      mappingStatus: 'unmapped',
      businessTerm: '出生时体重',
      description: '新生儿出生时的体重，单位：克',
    },
    {
      id: 'attr6',
      name: '母亲姓名',
      code: 'mother_name',
      type: 'core',
      dataType: 'String',
      isRequired: false,
      isPrimaryKey: false,
      mappingStatus: 'unmapped',
      businessTerm: '生母姓名',
      description: '新生儿的生母姓名',
    },
    {
      id: 'attr7',
      name: '联系电话',
      code: 'contact_phone',
      type: 'sensitive',
      dataType: 'String',
      isRequired: false,
      isPrimaryKey: false,
      mappingStatus: 'review',
      businessTerm: '联系电话',
      description: '监护人联系电话（PII敏感信息）',
    },
  ])

  // 模拟来源表
  const [sourceTables] = useState<SourceTable[]>([
    {
      id: 'table1',
      name: 't_pop_base_info_2024',
      role: 'main',
      rowCount: 125000,
      updateTime: '2024-01-15 08:00',
      gateStatus: 'passed',
      sensitiveFieldCount: 3,
    },
    {
      id: 'table2',
      name: 't_pop_extension',
      role: 'extension',
      rowCount: 125000,
      updateTime: '2024-01-15 08:00',
      gateStatus: 'passed',
      sensitiveFieldCount: 2,
    },
  ])

  // 模拟来源字段
  const [sourceFields] = useState<SourceField[]>([
    {
      id: 'field1',
      name: 'id_card_num',
      tableName: 't_pop_base_info_2024',
      dataType: 'varchar(18)',
      isPrimaryKey: true,
      isNullable: false,
      sensitivityLevel: 'high',
      semanticType: '身份证号',
      confidence: 0.98,
      occupiedBy: 'attr1',
    },
    {
      id: 'field2',
      name: 'name',
      tableName: 't_pop_base_info_2024',
      dataType: 'varchar(50)',
      isPrimaryKey: false,
      isNullable: false,
      sensitivityLevel: 'medium',
      semanticType: '姓名',
      confidence: 0.95,
      occupiedBy: 'attr2',
    },
    {
      id: 'field3',
      name: 'gender',
      tableName: 't_pop_base_info_2024',
      dataType: 'varchar(1)',
      isPrimaryKey: false,
      isNullable: true,
      sensitivityLevel: 'low',
      semanticType: '性别',
      confidence: 0.92,
      occupiedBy: 'attr3',
    },
    {
      id: 'field4',
      name: 'birth_date',
      tableName: 't_pop_base_info_2024',
      dataType: 'datetime',
      isPrimaryKey: false,
      isNullable: true,
      sensitivityLevel: 'low',
      semanticType: '出生日期',
      confidence: 0.99,
      occupiedBy: 'attr4',
    },
    {
      id: 'field5',
      name: 'phone',
      tableName: 't_pop_extension',
      dataType: 'varchar(20)',
      isPrimaryKey: false,
      isNullable: true,
      sensitivityLevel: 'high',
      semanticType: '联系电话',
      confidence: 0.85,
      occupiedBy: 'attr7',
    },
    {
      id: 'field6',
      name: 'weight',
      tableName: 't_pop_extension',
      dataType: 'decimal(8,2)',
      isPrimaryKey: false,
      isNullable: true,
      sensitivityLevel: 'low',
      confidence: 0.75,
    },
  ])

  // AI 映射建议
  const aiMappingSuggestions = [
    {
      id: 'ai1',
      attributeId: 'attr5',
      fieldName: 'weight',
      confidence: 0.89,
      evidence: ['字段名匹配', '数据类型兼容', '采样值符合预期'],
      status: 'pending',
    },
    {
      id: 'ai2',
      attributeId: 'attr6',
      fieldName: 'mother_name',
      confidence: 0.92,
      evidence: ['字段名匹配', '业务语义相符'],
      status: 'pending',
    },
  ]

  // 当前激活表的字段
  const activeTableFields = useMemo(() => {
    return sourceFields.filter(f => f.tableName === (activeTableId ?
      sourceTables.find(t => t.id === activeTableId)?.name :
      sourceTables[0]?.name
    ))
  }, [activeTableId, sourceFields, sourceTables])

  // Gate 状态
  const gateStatus = useMemo(() => {
    const requiredMapped = attributes.filter(a => a.isRequired && a.mappingStatus === 'mapped').length
    const requiredTotal = attributes.filter(a => a.isRequired).length
    const totalMapped = attributes.filter(a => a.mappingStatus === 'mapped').length
    const total = attributes.length
    const conflicts = attributes.filter(a => a.mappingStatus === 'conflict').length

    return {
      requiredPassed: requiredMapped === requiredTotal,
      requiredProgress: `${requiredMapped}/${requiredTotal}`,
      totalProgress: `${totalMapped}/${total}`,
      conflictCount: conflicts,
      passed: requiredMapped === requiredTotal && conflicts === 0,
    }
  }, [attributes])

  // 获取属性类型配置
  const getAttributeTypeConfig = (type: AttributeType) => {
    const configs = {
      key: { label: '主键', color: 'blue', icon: Hash },
      required: { label: '必填', color: 'red', icon: CheckCircle },
      core: { label: '核心', color: 'green', icon: Target },
      extended: { label: '扩展', color: 'gray', icon: Layers },
      sensitive: { label: '敏感', color: 'orange', icon: Shield },
    }
    return configs[type]
  }

  // 获取表角色配置
  const getTableRoleConfig = (role: TableRole) => {
    const configs = {
      main: { label: '主表', color: 'purple' },
      extension: { label: '扩展', color: 'blue' },
      dimension: { label: '维度', color: 'green' },
      event: { label: '事件', color: 'orange' },
    }
    return configs[role]
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 01_HeaderBar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧：面包屑和返回 */}
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-slate-100 rounded">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="text-sm text-slate-500">
              <span className="hover:text-blue-600 cursor-pointer">数据语义治理</span>
              <span className="mx-1">/</span>
              <span className="hover:text-blue-600 cursor-pointer">业务对象映射</span>
            </div>
          </div>

          {/* 中间：标题和上下文 */}
          <div className="flex-1 text-center">
            <h2 className="text-lg font-bold text-slate-800">语义映射工作台</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm text-slate-600">新生儿 (Newborn)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                {selectedTables[0]?.name || 't_pop_base_info_2024'}
              </span>
            </div>
          </div>

          {/* 右侧：状态和操作 */}
          <div className="flex items-center gap-3">
            {/* 状态标签 */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                mappingStatus === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                mappingStatus === 'review' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {mappingStatus === 'draft' ? '草稿 Draft' :
                 mappingStatus === 'review' ? '待评审 Review' :
                 '已生效 Effective'}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                gateStatus.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                Gate {gateStatus.passed ? '通过' : `未通过 (${gateStatus.requiredProgress})`}
              </span>
            </div>

            {/* 进度组件 */}
            <div className="flex items-center gap-3 text-xs">
              <div className="text-center">
                <p className="text-slate-500">必填映射</p>
                <p className={`font-bold ${gateStatus.requiredPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {gateStatus.requiredProgress}
                </p>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center">
                <p className="text-slate-500">全量映射</p>
                <p className="font-bold text-blue-600">{gateStatus.totalProgress}</p>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIResults(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 自动映射
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded hover:bg-slate-50">
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
              <button className="p-1.5 hover:bg-slate-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 02_Left_ObjectListPanel */}
        <div className="w-56 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-200">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索对象..."
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button className="w-full flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded">
              <Filter className="w-3 h-3" />
              筛选
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {businessObjects.map(obj => {
              const isSelected = selectedObject?.id === obj.id
              return (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObject(obj)}
                  className={`w-full p-2 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-purple-50 border border-purple-300' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-medium text-slate-800">{obj.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span>{obj.requiredProgress}</span>
                    <span>/</span>
                    <span>{obj.totalProgress}</span>
                    {!obj.gatePassed && (
                      <span className="text-red-500">• Gate未通过</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 03_Canvas_Area */}
        <div className="flex-1 flex flex-col">
          {viewMode === 'canvas' ? (
            <div className="flex-1 flex">
              {/* 03-1_ObjectAttrColumn */}
              <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-3 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">新生儿 (Newborn)</h3>
                    <span className="text-[10px] text-slate-500">必填 4/5</span>
                  </div>
                  <div className="relative mb-2">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索属性..."
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button className="flex-1 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-100 rounded">
                      必填
                    </button>
                    <button className="flex-1 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-100 rounded">
                      未映射
                    </button>
                    <button className="flex-1 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-100 rounded">
                      有冲突
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {attributes.map(attr => {
                    const typeConfig = getAttributeTypeConfig(attr.type)
                    const TypeIcon = typeConfig.icon
                    return (
                      <div
                        key={attr.id}
                        onClick={() => setSelectedAttribute(attr)}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${
                          selectedAttribute?.id === attr.id
                            ? 'bg-purple-50 border-purple-300'
                            : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center bg-${typeConfig.color}-100`}>
                            <TypeIcon className={`w-3 h-3 text-${typeConfig.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-slate-800 truncate">{attr.name}</span>
                              {attr.isRequired && (
                                <span className="text-[8px] text-red-500">*</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span>{attr.dataType}</span>
                              {attr.mappingStatus === 'mapped' && (
                                <span className="px-1 py-0.5 bg-green-100 text-green-600 rounded">已映射</span>
                              )}
                              {attr.mappingStatus === 'unmapped' && (
                                <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded">未映射</span>
                              )}
                              {attr.mappingStatus === 'review' && (
                                <span className="px-1 py-0.5 bg-yellow-100 text-yellow-600 rounded">待Review</span>
                              )}
                            </div>
                          </div>
                          {/* 连接点 */}
                          <div className="w-3 h-3 rounded-full border-2 border-purple-400 bg-white hover:bg-purple-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 03-2_MappingCanvas */}
              <div className="flex-1 bg-slate-100 relative">
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between bg-white rounded-lg shadow-sm px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <span className="text-xs text-slate-600">- 100% +</span>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded">
                      <GitBranch className="w-3 h-3" />
                      自动布局
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span>Ctrl+S 保存</span>
                    <span>•</span>
                    <span>Del 删除</span>
                  </div>
                </div>

                {/* 映射连线 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {attributes.filter(a => a.mappingStatus === 'mapped').map(attr => (
                    <div
                      key={attr.id}
                      className="w-32 h-0.5 bg-green-400 relative"
                    >
                      <div
                        className="absolute top-1/2 left-1/2 w-4 h-4 bg-white border-2 border-green-400 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto hover:bg-green-50"
                        onClick={() => {
                          setSelectedAttribute(attr)
                          setShowMappingDetail(true)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 03-3_SourceFieldColumn */}
              <div className="w-72 bg-white border-l border-slate-200 flex flex-col">
                <div className="p-3 border-b border-slate-200">
                  {/* 多表切换器 */}
                  <div className="flex gap-1 mb-2">
                    {sourceTables.map(table => {
                      const roleConfig = getTableRoleConfig(table.role)
                      return (
                        <button
                          key={table.id}
                          onClick={() => setActiveTableId(table.id)}
                          className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                            activeTableId === table.id
                              ? `bg-${roleConfig.color}-50 border-${roleConfig.color}-300`
                              : 'hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          {table.name}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setShowAddTableModal(true)}
                      className="px-2 py-1.5 text-xs text-purple-600 hover:bg-purple-50 border border-dashed border-purple-300 rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 表摘要 */}
                  {activeTableId && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{activeTableFields.length} 字段</span>
                      <span>•</span>
                      <span>更新: 2024-01-15</span>
                    </div>
                  )}

                  <div className="relative mt-2">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索字段..."
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {activeTableFields.map(field => {
                    return (
                      <div
                        key={field.id}
                        onClick={() => setSelectedField(field)}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${
                          selectedField?.id === field.id
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {field.isPrimaryKey && (
                            <Hash className="w-3 h-3 text-purple-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-slate-800 truncate">{field.name}</span>
                              {field.sensitivityLevel === 'high' && (
                                <Shield className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span>{field.dataType}</span>
                              {field.confidence && (
                                <span className="text-purple-600">{Math.round(field.confidence * 100)}%</span>
                              )}
                              {field.occupiedBy && (
                                <span className="px-1 py-0.5 bg-green-100 text-green-600 rounded">
                                  已占用
                                </span>
                              )}
                            </div>
                          </div>
                          {/* 连接点 */}
                          <div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-white hover:bg-blue-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            // 列表视图
            <div className="flex-1 bg-white p-4">
              <p className="text-center text-slate-400">列表视图待实现</p>
            </div>
          )}

          {/* 08_Bottom_ActionBar */}
          <div className="bg-white border-t border-slate-200 px-4 py-3 sticky bottom-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-slate-500">
                  <span>未保存变更:</span>
                  <span className="font-medium text-slate-800">3</span>
                </div>
                {!gateStatus.passed && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>Gate 未通过: {gateStatus.requiredProgress}</span>
                  </div>
                )}
                {gateStatus.conflictCount > 0 && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Zap className="w-4 h-4" />
                    <span>冲突: {gateStatus.conflictCount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                  保存草稿
                </button>
                <button
                  disabled={!gateStatus.passed}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    gateStatus.passed
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  提交评审
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 04_AIResultPanel (Drawer) */}
      {showAIResults && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">AI 自动映射</h3>
              <button
                onClick={() => setShowAIResults(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab 切换 */}
            <div className="flex border-b border-slate-200">
              <button className="flex-1 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600">
                高置信可接受 (2)
              </button>
              <button className="flex-1 py-2 text-xs text-slate-500 hover:text-slate-700">
                需复核 (0)
              </button>
              <button className="flex-1 py-2 text-xs text-slate-500 hover:text-slate-700">
                冲突 (0)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {aiMappingSuggestions.map(suggestion => {
                const attr = attributes.find(a => a.id === suggestion.attributeId)
                return (
                  <div key={suggestion.id} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{attr?.name}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-blue-600">{suggestion.fieldName}</span>
                      </div>
                      <span className="text-xs font-medium text-purple-600">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-[10px] text-slate-500 mb-1">证据:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.evidence.map((e, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                        接受
                      </button>
                      <button className="flex-1 px-2 py-1 text-xs border border-slate-300 text-slate-600 rounded hover:bg-slate-50">
                        驳回
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 border-t border-slate-200">
              <button className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                批量接受高置信建议
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 05_MappingDetailDrawer */}
      {showMappingDetail && selectedAttribute && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">映射详情</h3>
              <button
                onClick={() => setShowMappingDetail(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 映射概览 */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-800">{selectedAttribute.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-blue-600">id_card_num</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                    已确认
                  </span>
                  {selectedAttribute.isRequired && (
                    <span className="text-[10px] text-red-500">影响 Gate</span>
                  )}
                </div>
              </div>

              {/* 映射类型 */}
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">映射类型</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input type="radio" name="mappingType" defaultChecked />
                    <span className="text-xs text-slate-700">直接映射 1:1</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input type="radio" name="mappingType" />
                    <span className="text-xs text-slate-700">派生映射（拼接/计算）</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input type="radio" name="mappingType" />
                    <span className="text-xs text-slate-700">条件映射（CASE WHEN）</span>
                  </label>
                </div>
              </div>

              {/* 转换规则 */}
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">转换规则</p>
                <textarea
                  className="w-full p-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  rows={3}
                  placeholder="输入转换逻辑..."
                />
              </div>

              {/* AI 证据 */}
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">AI 证据</p>
                <div className="bg-purple-50 p-2 rounded text-xs text-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span>置信度:</span>
                    <span className="font-medium text-purple-600">98%</span>
                  </div>
                  <p>基于字段名相似度、数据类型匹配和采样值分析</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 space-y-2">
              <button className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                保存修改
              </button>
              <button className="w-full px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                删除映射
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SemanticMappingWorkbench
