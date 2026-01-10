import { useState, useMemo } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  FileText,
  Tag,
  Link2,
  BookOpen,
  Database,
  Hash,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Filter,
  GitBranch,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react'

// 业务术语接口
interface BusinessTerm {
  id: string
  name: string                 // 术语名称
  code: string                 // 术语编码
  category: string             // 业务分类
  definition: string           // 业务定义
  description: string          // 详细描述
  aliases: string[]            // 别名
  englishName: string          // 英文名称
  status: 'active' | 'draft' | 'deprecated'  // 状态
  version: string              // 版本号
  owner: string                // 负责人
  ownerDept: string            // 负责部门
  relatedTerms: string[]       // 相关术语ID
  relatedTables: string[]      // 关联表ID
  relatedFields: string[]      // 关联字段
  dataStandard: string         // 数据标准
  businessRule: string         // 业务规则
  examples: string[]           // 使用示例
  tags: string[]               // 标签
  createdAt: string
  updatedAt: string
  createdBy: string
}

// 业务分类
const termCategories = [
  { id: 'customer', name: '客户域', icon: Users, color: 'blue' },
  { id: 'product', name: '产品域', icon: Tag, color: 'green' },
  { id: 'order', name: '订单域', icon: FileText, color: 'purple' },
  { id: 'finance', name: '财务域', icon: Database, color: 'orange' },
  { id: 'marketing', name: '营销域', icon: GitBranch, color: 'pink' },
  { id: 'operation', name: '运营域', icon: AlertCircle, color: 'cyan' },
]

const BusinessTermManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTerm, setSelectedTerm] = useState<BusinessTerm | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())

  // 业务术语列表
  const [termsList, setTermsList] = useState<BusinessTerm[]>([
    {
      id: 't1',
      name: '用户',
      code: 'USER',
      category: 'customer',
      definition: '在平台注册并使用服务的个人或组织',
      description: '用户是指在公司平台注册账号，并使用平台提供的商品或服务的个人或企业用户。用户具有唯一标识，可通过多种方式注册。',
      aliases: ['客户', '会员', '注册用户'],
      englishName: 'User',
      status: 'active',
      version: 'v1.0',
      owner: '张三',
      ownerDept: '用户中心部',
      relatedTerms: ['t2', 't3'],
      relatedTables: ['user_info', 'user_profile'],
      relatedFields: ['user_id', 'user_name', 'user_email'],
      dataStandard: '符合GB/T 25069-2010信息安全标准',
      businessRule: '用户必须通过手机号或邮箱验证后才能成为正式用户',
      examples: ['普通用户', 'VIP用户', '企业用户'],
      tags: ['核心', '基础', 'PII'],
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-08 15:30:00',
      createdBy: 'admin',
    },
    {
      id: 't2',
      name: '订单',
      code: 'ORDER',
      category: 'order',
      definition: '用户购买商品或服务的交易记录',
      description: '订单是用户在平台下单购买商品或服务的完整交易记录，包含商品信息、价格、支付方式、配送信息等。',
      aliases: ['采购单', '交易单'],
      englishName: 'Order',
      status: 'active',
      version: 'v1.2',
      owner: '李四',
      ownerDept: '订单中心部',
      relatedTerms: ['t1', 't4'],
      relatedTables: ['order_info', 'order_detail'],
      relatedFields: ['order_id', 'order_amount', 'order_status'],
      dataStandard: '遵循电商交易数据标准',
      businessRule: '订单创建后需要在30分钟内完成支付，否则自动取消',
      examples: ['普通订单', '预售订单', '团购订单'],
      tags: ['核心', '交易'],
      createdAt: '2024-01-02 09:00:00',
      updatedAt: '2024-01-07 14:20:00',
      createdBy: 'admin',
    },
    {
      id: 't3',
      name: '商品',
      code: 'PRODUCT',
      category: 'product',
      definition: '平台销售的所有实物或虚拟物品',
      description: '商品是指在平台上销售的所有实物商品和虚拟服务，每个商品都有唯一的商品编码和详细的信息描述。',
      aliases: ['产品', '货品', 'SKU'],
      englishName: 'Product',
      status: 'active',
      version: 'v2.0',
      owner: '王五',
      ownerDept: '商品中心部',
      relatedTerms: ['t2'],
      relatedTables: ['product_info', 'product_sku'],
      relatedFields: ['product_id', 'product_name', 'product_price'],
      dataStandard: '符合商品编码规则 GB/T 15424',
      businessRule: '商品必须关联到具体的类目和品牌',
      examples: ['手机', '耳机', '电子书'],
      tags: ['核心', '基础'],
      createdAt: '2024-01-03 11:00:00',
      updatedAt: '2024-01-06 16:45:00',
      createdBy: 'admin',
    },
    {
      id: 't4',
      name: '支付',
      code: 'PAYMENT',
      category: 'finance',
      definition: '用户为购买商品或服务而进行的资金转账行为',
      description: '支付是指用户通过银行卡、第三方支付等方式，将资金转入平台账户以完成订单支付的过程。',
      aliases: ['付款', '结算'],
      englishName: 'Payment',
      status: 'active',
      version: 'v1.5',
      owner: '赵六',
      ownerDept: '财务部',
      relatedTerms: ['t2'],
      relatedTables: ['payment_record', 'payment_channel'],
      relatedFields: ['payment_id', 'payment_amount', 'payment_method'],
      dataStandard: '符合PCI DSS支付卡行业数据安全标准',
      businessRule: '支付金额必须与订单金额一致，支持部分支付',
      examples: ['在线支付', '货到付款', '分期付款'],
      tags: ['核心', '财务', '敏感'],
      createdAt: '2024-01-04 13:00:00',
      updatedAt: '2024-01-05 10:15:00',
      createdBy: 'admin',
    },
    {
      id: 't5',
      name: '优惠券',
      code: 'COUPON',
      category: 'marketing',
      definition: '平台发放的用于抵扣订单金额的电子凭证',
      description: '优惠券是平台为促销活动而发放的电子凭证，用户可以在下单时使用优惠券抵扣部分或全部订单金额。',
      aliases: ['折扣券', '代金券'],
      englishName: 'Coupon',
      status: 'active',
      version: 'v1.0',
      owner: '孙七',
      ownerDept: '营销中心部',
      relatedTerms: ['t2'],
      relatedTables: ['coupon_info', 'user_coupon'],
      relatedFields: ['coupon_id', 'coupon_amount', 'coupon_status'],
      dataStandard: '遵循营销数据标准',
      businessRule: '每张优惠券有使用期限和使用条件，过期自动失效',
      examples: ['满减券', '折扣券', '免邮券'],
      tags: ['营销', '活动'],
      createdAt: '2024-01-05 15:00:00',
      updatedAt: '2024-01-08 09:30:00',
      createdBy: 'admin',
    },
    {
      id: 't6',
      name: '会员等级',
      code: 'MEMBER_LEVEL',
      category: 'customer',
      definition: '根据用户消费金额和行为划分的会员级别',
      description: '会员等级是平台根据用户的累计消费金额、购买次数等行为指标划分的等级体系，不同等级享受不同的权益。',
      aliases: ['会员级别', '用户等级'],
      englishName: 'Member Level',
      status: 'active',
      version: 'v1.1',
      owner: '周八',
      ownerDept: '用户运营部',
      relatedTerms: ['t1'],
      relatedTables: ['member_level', 'user_member'],
      relatedFields: ['level_id', 'level_name', 'level_discount'],
      dataStandard: '遵循会员等级标准',
      businessRule: '会员等级每年根据上一年度的消费金额重新评定',
      examples: ['普通会员', '银卡会员', '金卡会员', '钻石会员'],
      tags: ['客户', '运营'],
      createdAt: '2024-01-06 10:00:00',
      updatedAt: '2024-01-07 11:20:00',
      createdBy: 'admin',
    },
    {
      id: 't7',
      name: '物流单号',
      code: 'LOGISTICS_NO',
      category: 'operation',
      definition: '快递公司为包裹分配的唯一追踪编号',
      description: '物流单号是快递或物流公司为每个包裹分配的唯一编号，用于追踪包裹的运输状态和位置。',
      aliases: ['快递单号', '运单号'],
      englishName: 'Logistics Number',
      status: 'active',
      version: 'v1.0',
      owner: '吴九',
      ownerDept: '物流运营部',
      relatedTerms: ['t2'],
      relatedTables: ['logistics_info', 'logistics_track'],
      relatedFields: ['logistics_no', 'logistics_status', 'logistics_company'],
      dataStandard: '遵循物流信息交换标准',
      businessRule: '每个订单关联一个或多个物流单号',
      examples: ['顺丰单号', '中通单号', '京东物流单号'],
      tags: ['物流', '运营'],
      createdAt: '2024-01-07 14:00:00',
      updatedAt: '2024-01-08 12:00:00',
      createdBy: 'admin',
    },
    {
      id: 't8',
      name: '退款',
      code: 'REFUND',
      category: 'finance',
      definition: '订单取消或退货后将资金返还给用户的过程',
      description: '退款是指用户申请退货或订单取消后，平台将已支付的资金按照原路退回的方式返还给用户。',
      aliases: ['退货退款'],
      englishName: 'Refund',
      status: 'draft',
      version: 'v0.9',
      owner: '郑十',
      ownerDept: '财务部',
      relatedTerms: ['t2', 't4'],
      relatedTables: ['refund_record', 'refund_detail'],
      relatedFields: ['refund_id', 'refund_amount', 'refund_status'],
      dataStandard: '符合财务退款标准',
      businessRule: '退款需要在订单完成后的7天内申请',
      examples: ['全额退款', '部分退款'],
      tags: ['财务', '售后'],
      createdAt: '2024-01-08 09:00:00',
      updatedAt: '2024-01-08 09:00:00',
      createdBy: 'admin',
    },
  ])

  // 获取分类图标
  const getCategoryIcon = (categoryId: string) => {
    const category = termCategories.find(c => c.id === categoryId)
    if (!category) return <Tag className="w-4 h-4" />
    const Icon = category.icon
    return <Icon className="w-4 h-4" />
  }

  // 获取分类颜色
  const getCategoryColor = (categoryId: string) => {
    const category = termCategories.find(c => c.id === categoryId)
    if (!category) return 'bg-gray-100 text-gray-700'
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      pink: 'bg-pink-100 text-pink-700',
      cyan: 'bg-cyan-100 text-cyan-700',
    }
    return colors[category.color] || 'bg-gray-100 text-gray-700'
  }

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = termCategories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      deprecated: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // 获取状态标签
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '已发布',
      draft: '草稿',
      deprecated: '已废弃',
    }
    return labels[status] || status
  }

  // 删除术语
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个业务术语吗？')) {
      setTermsList(prev => prev.filter(t => t.id !== id))
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedItems.size === 0) {
      alert('请先选择要删除的术语')
      return
    }
    if (confirm(`确定要删除选中的 ${selectedItems.size} 个业务术语吗？`)) {
      setTermsList(prev => prev.filter(t => !selectedItems.has(t.id)))
      setSelectedItems(new Set())
    }
  }

  // 展开切换
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedTerms)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTerms(newExpanded)
  }

  // 查看详情
  const handleViewDetail = (term: BusinessTerm) => {
    setSelectedTerm(term)
    setShowDetailModal(true)
  }

  // 编辑术语
  const handleEdit = (term: BusinessTerm) => {
    setSelectedTerm(term)
    setShowEditModal(true)
  }

  // 过滤后的术语列表
  const filteredTerms = termsList.filter(term => {
    const matchesSearch = term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.aliases.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || term.category === filterCategory
    const matchesStatus = filterStatus === 'all' || term.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // 统计信息
  const summary = useMemo(() => {
    return {
      total: termsList.length,
      active: termsList.filter(t => t.status === 'active').length,
      draft: termsList.filter(t => t.status === 'draft').length,
      deprecated: termsList.filter(t => t.status === 'deprecated').length,
      byCategory: termCategories.reduce((acc, cat) => {
        acc[cat.id] = termsList.filter(t => t.category === cat.id).length
        return acc
      }, {} as Record<string, number>),
    }
  }, [termsList])

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">业务术语管理</h3>
          <p className="text-xs text-slate-500 mt-0.5">统一管理业务术语定义和标准</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          新增术语
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">总计</p>
              <p className="text-lg font-bold text-slate-800">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">已发布</p>
              <p className="text-lg font-bold text-green-600">{summary.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-1.5 rounded">
              <FileText className="w-3.5 h-3.5 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">草稿</p>
              <p className="text-lg font-bold text-yellow-600">{summary.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">已废弃</p>
              <p className="text-lg font-bold text-red-600">{summary.deprecated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded">
              <Users className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">负责人</p>
              <p className="text-lg font-bold text-slate-800">{new Set(termsList.map(t => t.owner)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 业务分类统计 */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
        <p className="text-xs font-medium text-slate-700 mb-2">按业务域统计</p>
        <div className="flex flex-wrap gap-2">
          {termCategories.map(category => {
            const Icon = category.icon
            const count = summary.byCategory[category.id] || 0
            return (
              <div
                key={category.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                  filterCategory === category.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                } cursor-pointer transition-colors`}
                onClick={() => setFilterCategory(filterCategory === category.id ? 'all' : category.id)}
              >
                <Icon className={`w-3.5 h-3.5 text-${category.color}-600`} />
                <span className="text-xs font-medium text-slate-700">{category.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  count > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* 工具栏 */}
        <div className="p-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索术语名称、编码、定义..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">已发布</option>
              <option value="draft">草稿</option>
              <option value="deprecated">已废弃</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedItems.size > 0 && (
              <>
                <span className="text-xs text-slate-500">已选 {selectedItems.size} 项</span>
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  批量删除
                </button>
              </>
            )}
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors">
              <RefreshCw className="w-3 h-3" />
              刷新
            </button>
          </div>
        </div>

        {/* 术语列表 */}
        <div className="divide-y divide-slate-200">
          {filteredTerms.map((term) => {
            const isExpanded = expandedTerms.has(term.id)
            return (
              <div key={term.id} className="hover:bg-slate-50 transition-colors">
                {/* 术语卡片头部 */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(term.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedItems)
                        if (newSelected.has(term.id)) {
                          newSelected.delete(term.id)
                        } else {
                          newSelected.add(term.id)
                        }
                        setSelectedItems(newSelected)
                      }}
                      className="w-3.5 h-3.5 rounded border-slate-300"
                    />
                    <button
                      onClick={() => toggleExpand(term.id)}
                      className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {getCategoryIcon(term.category)}
                      <span className="text-sm font-bold text-slate-800">{term.name}</span>
                      <span className="text-[10px] text-slate-400">({term.code})</span>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getCategoryColor(term.category)}`}>
                      {getCategoryName(term.category)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusColor(term.status)}`}>
                      {getStatusLabel(term.status)}
                    </span>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1">
                      {term.aliases.slice(0, 2).map((alias, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                        >
                          {alias}
                        </span>
                      ))}
                      {term.aliases.length > 2 && (
                        <span className="text-[10px] text-slate-500">+{term.aliases.length - 2}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 text-[10px] text-slate-500">
                      <Users className="w-3 h-3" />
                      {term.owner}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetail(term)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="查看详情"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(term)}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(term.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 业务定义（始终显示） */}
                  <div className="ml-9 mt-1.5">
                    <p className="text-xs text-slate-600 line-clamp-1">{term.definition}</p>
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-3 pb-3 ml-9 space-y-2">
                    {/* 详细描述 */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 font-medium mb-1">详细描述</p>
                        <p className="text-slate-700">{term.description}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium mb-1">业务规则</p>
                        <p className="text-slate-700">{term.businessRule}</p>
                      </div>
                    </div>

                    {/* 关联信息 */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 font-medium mb-1">相关术语</p>
                        <div className="flex flex-wrap gap-1">
                          {term.relatedTerms.map(rtId => {
                            const relatedTerm = termsList.find(t => t.id === rtId)
                            return relatedTerm ? (
                              <span key={rtId} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">
                                {relatedTerm.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium mb-1">关联表</p>
                        <div className="flex flex-wrap gap-1">
                          {term.relatedTables.map((table, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">
                              {table}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium mb-1">关联字段</p>
                        <div className="flex flex-wrap gap-1">
                          {term.relatedFields.slice(0, 3).map((field, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">
                              {field}
                            </span>
                          ))}
                          {term.relatedFields.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{term.relatedFields.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 使用示例 */}
                    {term.examples.length > 0 && (
                      <div>
                        <p className="text-slate-500 font-medium text-xs mb-1">使用示例</p>
                        <div className="flex flex-wrap gap-1">
                          {term.examples.map((example, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 元数据 */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>版本: {term.version}</span>
                      <span>•</span>
                      <span>英文名: {term.englishName}</span>
                      <span>•</span>
                      <span>负责人: {term.owner} ({term.ownerDept})</span>
                      <span>•</span>
                      <span>更新: {term.updatedAt.split(' ')[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredTerms.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无业务术语</p>
              <p className="text-xs mt-1">请调整搜索条件或添加新的术语</p>
            </div>
          )}
        </div>
      </div>

      {/* 术语详情模态框 */}
      {showDetailModal && selectedTerm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* 模态框头部 */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedTerm.category)}
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedTerm.name}</h3>
                  <p className="text-[10px] text-slate-500">{selectedTerm.code} • {getCategoryName(selectedTerm.category)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedTerm(null)
                }}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">业务编码</p>
                  <p className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{selectedTerm.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">英文名称</p>
                  <p className="text-sm">{selectedTerm.englishName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">当前状态</p>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTerm.status)}`}>
                    {getStatusLabel(selectedTerm.status)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">版本号</p>
                  <p className="text-sm">{selectedTerm.version}</p>
                </div>
              </div>

              {/* 业务定义 */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">业务定义</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{selectedTerm.definition}</p>
              </div>

              {/* 详细描述 */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">详细描述</p>
                <p className="text-sm text-slate-700">{selectedTerm.description}</p>
              </div>

              {/* 别名 */}
              {selectedTerm.aliases.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">别名</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTerm.aliases.map((alias, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 业务规则 */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">业务规则</p>
                <p className="text-sm text-slate-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                  {selectedTerm.businessRule}
                </p>
              </div>

              {/* 数据标准 */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">数据标准</p>
                <p className="text-sm text-slate-700">{selectedTerm.dataStandard}</p>
              </div>

              {/* 使用示例 */}
              {selectedTerm.examples.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">使用示例</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTerm.examples.map((example, idx) => (
                      <div key={idx} className="bg-slate-50 px-2 py-1.5 rounded text-xs text-slate-700">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 关联信息 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">相关术语</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTerm.relatedTerms.map(rtId => {
                      const relatedTerm = termsList.find(t => t.id === rtId)
                      return relatedTerm ? (
                        <span key={rtId} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                          {relatedTerm.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">关联表</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTerm.relatedTables.map((table, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">关联字段</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTerm.relatedFields.map((field, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 责任信息 */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">负责人</p>
                  <p className="text-sm text-slate-700">{selectedTerm.owner}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">负责部门</p>
                  <p className="text-sm text-slate-700">{selectedTerm.ownerDept}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">创建时间</p>
                  <p className="text-sm text-slate-700">{selectedTerm.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">更新时间</p>
                  <p className="text-sm text-slate-700">{selectedTerm.updatedAt}</p>
                </div>
              </div>

              {/* 标签 */}
              {selectedTerm.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">标签</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTerm.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 模态框底部 */}
            <div className="p-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setShowEditModal(true)
                }}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                编辑术语
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedTerm(null)
                }}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded hover:bg-slate-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessTermManagement
