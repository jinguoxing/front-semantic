import { useState } from 'react'
import { CheckSquare, Database, FileText, Brain, Layers, Activity, BarChart3, ChevronLeft, ChevronRight, Menu, X, Code2 } from 'lucide-react'
import DataSourceManagement from './components/DataSourceManagement'
import MetadataManagement from './components/MetadataManagement'
import BusinessObjectModeling from './components/BusinessObjectModeling'
import SemanticUnderstanding from './components/SemanticUnderstanding'
import SemanticLayer from './components/SemanticLayer'
import QualityCheck from './components/QualityCheck'
import QualityReport from './components/QualityReport'

type TabType = 'datasource' | 'metadata' | 'business' | 'semantic' | 'semanticlayer' | 'check' | 'report'

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
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* 左侧边栏 */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-slate-200 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo区域 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                语义治理平台
              </h1>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors hidden lg:block"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* 菜单项 */}
        <nav className="p-3 space-y-4 overflow-y-auto h-[calc(100vh-73px)]">
          {/* 数据接入组 */}
          {!sidebarCollapsed && (
            <div className="px-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">数据接入</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {!isActive && (
                      <p className="text-xs text-slate-500 truncate group-hover:text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </button>
            )
          })}

          {/* 语义治理组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">语义治理</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {!isActive && (
                      <p className="text-xs text-slate-500 truncate group-hover:text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </button>
            )
          })}

          {/* 质量管理组 */}
          {!sidebarCollapsed && (
            <div className="px-2 pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">质量管理</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.inactive
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : colorClasses.icon}`} />
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {!isActive && (
                      <p className="text-xs text-slate-500 truncate group-hover:text-slate-600">
                        {item.description}
                      </p>
                    )}
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
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* 顶部标题栏 */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-slate-500 mt-1">
                  {menuItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>

              {/* 流程指示器 */}
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="flex items-center gap-1">
                  {menuItems.map((item, index) => {
                    const currentIndex = menuItems.findIndex(i => i.id === activeTab)
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex

                    return (
                      <div key={item.id} className="flex items-center">
                        {index > 0 && (
                          <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                        )}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
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
                <span className="ml-2 text-sm text-slate-600">
                  {menuItems.findIndex(item => item.id === activeTab) + 1} / {menuItems.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 流程引导卡片 */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">语义治理实施流程</h3>
                <p className="text-blue-100 text-sm mb-4">
                  按照以下步骤进行语义治理,确保数据质量和一致性
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                      <p className="font-semibold">数据接入</p>
                    </div>
                    <p className="text-xs text-blue-100">配置数据源并采集元数据</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                      <p className="font-semibold">语义治理</p>
                    </div>
                    <p className="text-xs text-purple-100">建模业务对象并进行AI语义分析</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                      <p className="font-semibold">质量管理</p>
                    </div>
                    <p className="text-xs text-indigo-100">执行质量检测并生成报告</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 各功能模块 */}
          {activeTab === 'check' && <QualityCheck />}
          {activeTab === 'report' && <QualityReport />}
          {activeTab === 'datasource' && <DataSourceManagement />}
          {activeTab === 'metadata' && <MetadataManagement />}
          {activeTab === 'semantic' && <SemanticUnderstanding />}
          {activeTab === 'business' && <BusinessObjectModeling />}
          {activeTab === 'semanticlayer' && <SemanticLayer />}
        </div>
      </main>
    </div>
  )
}

export default App
