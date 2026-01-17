import { useState } from 'react'
import { CheckSquare, Database, FileText, Brain, Layers, Activity, BarChart3, ChevronLeft, ChevronRight, Menu, X, Code2, Folder, Sparkles, Shield, BookOpen, GitBranch } from 'lucide-react'
import DataSourceManagement from './components/DataSourceManagement'
import MetadataManagement from './components/MetadataManagement'
import BusinessObjectModeling from './components/BusinessObjectModeling'
import SemanticUnderstanding from './components/SemanticUnderstanding'
import SemanticLayer from './components/SemanticLayer'
import SemanticMappingWorkbench from './components/SemanticMappingWorkbench'
import QualityCheck from './components/QualityCheck'
import QualityReport from './components/QualityReport'
import AssetCenter from './components/AssetCenter'
import AskData from './components/AskData'
import DataSecurity from './components/DataSecurity'
import BusinessTermManagement from './components/BusinessTermManagement'

type TabType = 'datasource' | 'metadata' | 'business' | 'semantic' | 'semanticlayer' | 'mapping' | 'check' | 'report' | 'asset' | 'ask' | 'security' | 'terms'

interface MenuItem {
  id: TabType
  label: string
  icon: any
  color: string
  description: string
  group?: string
}

const menuItems: MenuItem[] = [
  // 第一阶段：数据接入
  {
    id: 'datasource',
    label: '数据源管理',
    icon: Database,
    color: 'green',
    description: '接入和管理各类数据源',
    group: '数据接入',
  },
  {
    id: 'metadata',
    label: '元数据管理',
    icon: FileText,
    color: 'orange',
    description: '采集和管理元数据信息',
    group: '数据接入',
  },

  // 第二阶段：语义治理
  {
    id: 'business',
    label: '业务对象建模',
    icon: Layers,
    color: 'cyan',
    description: '设计和定义业务对象',
    group: '语义治理',
  },
  {
    id: 'semantic',
    label: '语义理解',
    icon: Brain,
    color: 'indigo',
    description: 'AI驱动的智能语义分析',
    group: '语义治理',
  },
  {
    id: 'semanticlayer',
    label: '语义层',
    icon: Code2,
    color: 'pink',
    description: 'Measures和Dimensions定义',
    group: '语义治理',
  },
  {
    id: 'mapping',
    label: '映射工作台',
    icon: GitBranch,
    color: 'violet',
    description: '业务对象到物理表的映射配置',
    group: '语义治理',
  },
  {
    id: 'terms',
    label: '业务术语管理',
    icon: BookOpen,
    color: 'amber',
    description: '统一管理业务术语定义和标准',
    group: '语义治理',
  },

  // 第三阶段：质量管理
  {
    id: 'check',
    label: '质量检测',
    icon: Activity,
    color: 'blue',
    description: '执行数据质量检测',
    group: '质量管理',
  },
  {
    id: 'report',
    label: '质量报告',
    icon: BarChart3,
    color: 'purple',
    description: '查看质量分析报告',
    group: '质量管理',
  },

  // 第四阶段：资产中心
  {
    id: 'asset',
    label: '资产中心',
    icon: Folder,
    color: 'emerald',
    description: '管理和发现数据资产',
    group: '资产中心',
  },

  // 第五阶段：智能应用
  {
    id: 'ask',
    label: '智能问数',
    icon: Sparkles,
    color: 'violet',
    description: 'AI驱动的数据查询助手',
    group: '智能应用',
  },

  // 第六阶段：安全管理
  {
    id: 'security',
    label: '数据安全',
    icon: Shield,
    color: 'rose',
    description: '敏感数据保护和权限控制',
    group: '安全管理',
  },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('datasource')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/50',
        inactive: 'text-slate-600 hover:bg-blue-50 hover:text-blue-600',
        icon: 'text-blue-500',
      },
      purple: {
        active: 'bg-purple-500 text-white shadow-lg shadow-purple-500/50',
        inactive: 'text-slate-600 hover:bg-purple-50 hover:text-purple-600',
        icon: 'text-purple-500',
      },
      green: {
        active: 'bg-green-500 text-white shadow-lg shadow-green-500/50',
        inactive: 'text-slate-600 hover:bg-green-50 hover:text-green-600',
        icon: 'text-green-500',
      },
      orange: {
        active: 'bg-orange-500 text-white shadow-lg shadow-orange-500/50',
        inactive: 'text-slate-600 hover:bg-orange-50 hover:text-orange-600',
        icon: 'text-orange-500',
      },
      indigo: {
        active: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50',
        inactive: 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600',
        icon: 'text-indigo-500',
      },
      cyan: {
        active: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50',
        inactive: 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-600',
        icon: 'text-cyan-500',
      },
      pink: {
        active: 'bg-pink-500 text-white shadow-lg shadow-pink-500/50',
        inactive: 'text-slate-600 hover:bg-pink-50 hover:text-pink-600',
        icon: 'text-pink-500',
      },
      emerald: {
        active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50',
        inactive: 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600',
        icon: 'text-emerald-500',
      },
      violet: {
        active: 'bg-violet-500 text-white shadow-lg shadow-violet-500/50',
        inactive: 'text-slate-600 hover:bg-violet-50 hover:text-violet-600',
        icon: 'text-violet-500',
      },
      amber: {
        active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/50',
        inactive: 'text-slate-600 hover:bg-amber-50 hover:text-amber-600',
        icon: 'text-amber-500',
      },
      rose: {
        active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/50',
        inactive: 'text-slate-600 hover:bg-rose-50 hover:text-rose-600',
        icon: 'text-rose-500',
      },
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* 左侧边栏 */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-md border-r border-slate-200 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo区域 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
          <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded flex-shrink-0">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                语义治理
              </h1>
            )}
          </div>
        </div>

        {/* 折叠按钮 */}
        <div className="flex justify-end px-2 py-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* 菜单项 */}
        <nav className="px-2 pb-2 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
          {/* 数据接入组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">数据接入</p>
            </div>
          )}
          {menuItems.filter(item => item.group === '数据接入').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const colorClasses = getColorClasses(item.color, isActive)

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* 语义治理组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">语义治理</p>
            </div>
          )}
          {menuItems.filter(item => item.group === '语义治理').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const colorClasses = getColorClasses(item.color, isActive)

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* 质量管理组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">质量管理</p>
            </div>
          )}
          {menuItems.filter(item => item.group === '质量管理').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const colorClasses = getColorClasses(item.color, isActive)

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* 资产中心组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">资产中心</p>
            </div>
          )}
          {menuItems.filter(item => item.group === '资产中心').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const colorClasses = getColorClasses(item.color, isActive)

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* 智能应用组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">智能应用</p>
            </div>
          )}
          {menuItems.filter(item => item.group === '智能应用').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const colorClasses = getColorClasses(item.color, isActive)

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                  </div>
                )}
              </button>
            )
          })}

          {/* 安全管理组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">安全管理</p>
            </div>
          )}
          {menuItems.filter(item => item.group === '安全管理').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const colorClasses = getColorClasses(item.color, isActive)

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                  </div>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 移动端遮罩 */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 主内容区域 */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
        }`}
      >
        {/* 顶部标题栏 */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
              </div>

              {/* 流程指示器 - 简化版 */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1">
                  {menuItems.map((item, index) => {
                    const currentIndex = menuItems.findIndex(i => i.id === activeTab)
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex

                    return (
                      <div key={item.id} className="flex items-center">
                        {index > 0 && (
                          <div className={`w-4 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                        )}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <span className="ml-1.5 text-xs text-slate-600">
                  {menuItems.findIndex(item => item.id === activeTab) + 1}/{menuItems.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="p-4 space-y-4">
          {/* 各功能模块 */}
          {activeTab === 'check' && <QualityCheck />}
          {activeTab === 'report' && <QualityReport />}
          {activeTab === 'datasource' && <DataSourceManagement />}
          {activeTab === 'metadata' && <MetadataManagement />}
          {activeTab === 'semantic' && <SemanticUnderstanding />}
          {activeTab === 'business' && <BusinessObjectModeling />}
          {activeTab === 'semanticlayer' && <SemanticLayer />}
          {activeTab === 'mapping' && <SemanticMappingWorkbench />}
          {activeTab === 'terms' && <BusinessTermManagement />}
          {activeTab === 'asset' && <AssetCenter />}
          {activeTab === 'ask' && <AskData />}
          {activeTab === 'security' && <DataSecurity />}
        </div>
      </main>
    </div>
  )
}

export default App
