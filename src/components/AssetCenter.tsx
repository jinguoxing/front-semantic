import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Star,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Folder,
  Tag,
  TrendingUp,
  Database,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Clock,
  ArrowLeft,
  Brain,
} from 'lucide-react'

type ViewMode = 'card' | 'list'

interface Asset {
  id: string
  name: string
  description: string
  type: 'table' | 'report' | 'dashboard' | 'dataset' | 'document' | 'image' | 'video' | 'model'
  category: string
  tags: string[]
  owner: string
  createdAt: string
  updatedAt: string
  size: string
  views: number
  likes: number
  rating: number
  status: 'published' | 'draft' | 'archived'
  thumbnail?: string
  source?: string
  rows?: number
  columns?: number
}

const AssetCenter = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: '用户分析仪表板',
      description: '综合展示用户行为数据分析的可视化仪表板',
      type: 'dashboard',
      category: '数据可视化',
      tags: ['用户分析', 'BI', '可视化'],
      owner: '张三',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-08',
      size: '2.3 MB',
      views: 1250,
      likes: 89,
      rating: 4.8,
      status: 'published',
      source: '用户行为数据库',
    },
    {
      id: '2',
      name: '销售数据表',
      description: '包含2024年全年的销售交易数据',
      type: 'table',
      category: '数据表',
      tags: ['销售', '交易', '核心数据'],
      owner: '李四',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-07',
      size: '1.2 GB',
      views: 3420,
      likes: 156,
      rating: 4.9,
      status: 'published',
      rows: 5000000,
      columns: 25,
    },
    {
      id: '3',
      name: '客户流失预测模型',
      description: '基于机器学习的客户流失预测模型',
      type: 'model',
      category: 'AI模型',
      tags: ['机器学习', '预测', '客户流失'],
      owner: '王五',
      createdAt: '2023-12-15',
      updatedAt: '2024-01-06',
      size: '156 MB',
      views: 890,
      likes: 67,
      rating: 4.7,
      status: 'published',
    },
    {
      id: '4',
      name: '季度销售报告',
      description: '2024年Q1季度销售业绩分析报告',
      type: 'report',
      category: '报告文档',
      tags: ['销售', '季度报告', '分析'],
      owner: '赵六',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08',
      size: '5.6 MB',
      views: 567,
      likes: 34,
      rating: 4.5,
      status: 'published',
    },
    {
      id: '5',
      name: '产品目录数据集',
      description: '完整的电商产品目录信息',
      type: 'dataset',
      category: '数据集',
      tags: ['产品', '电商', '目录'],
      owner: '钱七',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-05',
      size: '890 MB',
      views: 2100,
      likes: 98,
      rating: 4.6,
      status: 'published',
      rows: 850000,
    },
    {
      id: '6',
      name: '营销活动效果分析',
      description: '营销活动ROI和转化率分析看板',
      type: 'dashboard',
      category: '数据可视化',
      tags: ['营销', 'ROI', '效果分析'],
      owner: '孙八',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-08',
      size: '1.8 MB',
      views: 1780,
      likes: 112,
      rating: 4.8,
      status: 'published',
    },
    {
      id: '7',
      name: '用户画像数据模型',
      description: '基于用户行为和属性的用户画像建模',
      type: 'model',
      category: 'AI模型',
      tags: ['用户画像', '建模', '分群'],
      owner: '周九',
      createdAt: '2023-12-20',
      updatedAt: '2024-01-04',
      size: '234 MB',
      views: 1456,
      likes: 87,
      rating: 4.7,
      status: 'published',
    },
    {
      id: '8',
      name: '库存管理数据表',
      description: '实时库存管理和预警数据表',
      type: 'table',
      category: '数据表',
      tags: ['库存', '管理', '实时'],
      owner: '吴十',
      createdAt: '2024-01-06',
      updatedAt: '2024-01-08',
      size: '450 MB',
      views: 980,
      likes: 45,
      rating: 4.4,
      status: 'published',
      rows: 120000,
      columns: 18,
    },
  ])

  const categories = ['all', ...Array.from(new Set(assets.map(a => a.category)))]

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      table: Database,
      report: FileText,
      dashboard: TrendingUp,
      dataset: Archive,
      model: Brain,
      document: FileText,
      image: Image,
      video: Video,
    }
    return icons[type] || FileText
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      table: 'bg-blue-100 text-blue-700',
      report: 'bg-green-100 text-green-700',
      dashboard: 'bg-purple-100 text-purple-700',
      dataset: 'bg-orange-100 text-orange-700',
      model: 'bg-pink-100 text-pink-700',
      document: 'bg-cyan-100 text-cyan-700',
      image: 'bg-indigo-100 text-indigo-700',
      video: 'bg-red-100 text-red-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      table: '数据表',
      report: '报告',
      dashboard: '仪表板',
      dataset: '数据集',
      model: '模型',
      document: '文档',
      image: '图片',
      video: '视频',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      published: '已发布',
      draft: '草稿',
      archived: '已归档',
    }
    return labels[status] || status
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setShowDetailModal(true)
  }

  const summary = {
    total: assets.length,
    published: assets.filter(a => a.status === 'published').length,
    draft: assets.filter(a => a.status === 'draft').length,
    totalViews: assets.reduce((sum, a) => sum + a.views, 0),
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">资产中心</h2>
          <p className="text-slate-500 mt-1">管理和发现数据资产</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          上传资产
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总资产数</p>
              <p className="text-3xl font-bold text-slate-800">{summary.total}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Folder className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已发布</p>
              <p className="text-3xl font-bold text-green-600">{summary.published}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-slate-500 mb-1">总浏览量</p>
              <p className="text-3xl font-bold text-purple-600">{summary.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索资产..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? '全部分类' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'card' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 资产展示 */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => {
            const TypeIcon = getTypeIcon(asset.type)
            return (
              <div
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
              >
                {/* 缩略图区域 */}
                <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative">
                  <TypeIcon className="w-16 h-16 text-indigo-300 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(asset.type)}`}>
                      {getTypeLabel(asset.type)}
                    </span>
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 truncate">{asset.name}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2 h-10">{asset.description}</p>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {asset.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 元数据 */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{asset.owner}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{asset.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{asset.rating}</span>
                    </div>
                  </div>

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{asset.size}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                      {getStatusLabel(asset.status)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* 表头 */}
          <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 border-b border-slate-200">
            <div className="col-span-3">资产名称</div>
            <div className="col-span-2">类型</div>
            <div className="col-span-2">所有者</div>
            <div className="col-span-2">统计</div>
            <div className="col-span-2">更新时间</div>
            <div className="col-span-1">操作</div>
          </div>

          {/* 列表内容 */}
          <div className="divide-y divide-slate-200">
            {filteredAssets.map((asset) => {
              const TypeIcon = getTypeIcon(asset.type)
              return (
                <div
                  key={asset.id}
                  onClick={() => handleAssetClick(asset)}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 truncate">{asset.name}</p>
                        <p className="text-xs text-slate-500 truncate">{asset.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(asset.type)}`}>
                      {getTypeLabel(asset.type)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{asset.category}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">{asset.owner}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{asset.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{asset.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>{asset.likes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{asset.updatedAt}</span>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAssetClick(asset)
                      }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 资产详情弹窗 */}
      {showDetailModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAsset.name}</h3>
                    <p className="text-indigo-100 text-sm mt-1">{selectedAsset.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20`}>
                    {getTypeLabel(selectedAsset.type)}
                  </span>
                </div>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左侧信息 */}
                <div className="space-y-6">
                  {/* 基本信息 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      基本信息
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">资产ID</span>
                        <span className="text-sm text-slate-800 font-medium">{selectedAsset.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">分类</span>
                        <span className="text-sm text-slate-800 font-medium">{selectedAsset.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">状态</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                          {getStatusLabel(selectedAsset.status)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">大小</span>
                        <span className="text-sm text-slate-800 font-medium">{selectedAsset.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* 数据信息（如果是数据表或数据集） */}
                  {(selectedAsset.type === 'table' || selectedAsset.type === 'dataset') && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        数据信息
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">行数</span>
                          <span className="text-sm text-slate-800 font-medium">
                            {selectedAsset.rows ? selectedAsset.rows.toLocaleString() : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">列数</span>
                          <span className="text-sm text-slate-800 font-medium">{selectedAsset.columns || '-'}</span>
                        </div>
                        {selectedAsset.source && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500">数据源</span>
                            <span className="text-sm text-slate-800 font-medium">{selectedAsset.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 标签 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-indigo-600" />
                      标签
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧信息 */}
                <div className="space-y-6">
                  {/* 所有者信息 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      所有者信息
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{selectedAsset.owner}</p>
                        <p className="text-sm text-slate-500">资产所有者</p>
                      </div>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      统计信息
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{selectedAsset.views}</p>
                        <p className="text-xs text-slate-500 mt-1">浏览量</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedAsset.likes}</p>
                        <p className="text-xs text-slate-500 mt-1">点赞数</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{selectedAsset.rating}</p>
                        <p className="text-xs text-slate-500 mt-1">评分</p>
                      </div>
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      时间信息
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">创建时间</span>
                        <span className="text-sm text-slate-800 font-medium">{selectedAsset.createdAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">更新时间</span>
                        <span className="text-sm text-slate-800 font-medium">{selectedAsset.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  关闭
                </button>
                <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  使用资产
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetCenter
