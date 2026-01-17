下面按你这张「语义映射工作台」**直接输出 v2 Figma Frame 结构（组件级）**。目标是：在保留现有画布形态的同时，补齐企业级治理必需的 **多表上下文、映射语义抽屉、AI映射结果面板、冲突处理、Gate/Score 分离、评审/版本闭环**。

---

# 0. v2 页面定位与边界

* 页面名称：**语义映射工作台 v2（Object ↔ Table/Field Mapping Canvas）**
* 输入：业务对象（L1）+ 已选来源表集合（L3）+ 对象属性集合（L2）
* 输出：映射资产（Draft/Review/Effective）+ 版本 diff + 审计日志

---

# 1. Figma Frame Tree（v2）

```
SemanticMappingWorkbench_v2
  ├─ 01_HeaderBar
  ├─ 02_Left_ObjectListPanel
  ├─ 03_Canvas_Area
  │   ├─ 03-1_ObjectAttrColumn
  │   ├─ 03-2_MappingCanvas
  │   └─ 03-3_SourceFieldColumn
  ├─ 04_TopRight_AIResultPanel (Drawer)
  ├─ 05_Right_MappingDetailDrawer
  ├─ 06_Modal_ConflictResolver
  ├─ 07_Modal_AddSourceTable
  ├─ 08_Bottom_ActionBar (Sticky)
  └─ 09_Empty_Error_States
```

---

# 2. 01_HeaderBar（顶部栏 v2）

## Frame：01_HeaderBar

**左侧**

* Breadcrumb：数据语义治理 > 业务对象映射
* Back（返回对象对齐/对象详情）

**中间**

* Page Title：语义映射工作台
* Context Line：`新生儿 (Newborn)  →  t_pop_base_info_2024`（可点击打开“表选择器”）

**右侧（核心改造）**

* **状态标签**（三段式）：`草稿 Draft / 待评审 Review / 已生效 Effective`
* **Gate Badge**：`Gate 未通过（2）` / `Gate 通过`（可点击弹出 Gate 明细 Popover）
* **进度组件**（双进度）：

  * 必填映射：`3/4`（Gate）
  * 全量映射：`4/5`（Score）
* Button Group：

  * `AI 自动映射`（打开 04_AIResultPanel）
  * `保存`（保存草稿）
  * `版本历史`（打开版本面板/跳转）
  * `导出 JSON`（可选）

---

# 3. 02_Left_ObjectListPanel（左侧对象列表 v2）

## Frame：02_Left_ObjectListPanel

保留你现有“业务对象列表”，新增两项：

**每个对象行展示：**

* 对象名 + 类型 icon
* 进度：必填映射进度 / 全量映射进度（小双条）
* 状态：Draft/Review/Effective
* 风险角标：冲突数 / Gate 未通过数

**顶部工具：**

* 搜索对象
* Filter：只看未完成 / 只看 Gate 未通过 / 只看有冲突

---

# 4. 03_Canvas_Area（三栏画布区 v2）

## 总体布局

三栏保持不变（这是你现有页面的优势），但增强：

* 中间画布加入“缩放/对齐/自动布局”
* 右侧字段列支持“多表切换器”

---

## 4.1 03-1_ObjectAttrColumn（对象属性列 v2）

### Frame：03-1_ObjectAttrColumn

**顶部卡片**

* 对象名（Newborn）+ 技术名 + 标签（必填数/总数）
* Search：搜索属性
* Filter：必填 / 未映射 / 有冲突 / 敏感

**属性列表（可分组折叠）**

* 分组：

  * 主键 Key（若有）
  * 必填 Required（强制 Gate）
  * 核心 Core
  * 扩展 Extended
  * 敏感 Sensitive（PII）
* 每个属性 item 展示：

  * 属性名
  * 类型（String/DateTime/Enum/Decimal）
  * 必填 * 标记
  * 映射状态 badge：未映射 / 已映射 / 冲突 / 待Review
  * 右侧小圆点端口（用于连线）
  * “更多”菜单（…）：设为必填/设为敏感/删除映射/查看证据

**交互**

* 点击属性：中间画布高亮相关连线与字段
* 拖拽属性端口到右侧字段端口创建映射
* 支持多选属性 → 批量操作（删除映射/加入待办/标记待Review）

---

## 4.2 03-2_MappingCanvas（中间连线画布 v2）

### Frame：03-2_MappingCanvas

**顶部工具条（Canvas Toolbar）**

* Zoom（- / 100% / +）
* Auto Layout（自动整理线）
* Align（左对齐/右对齐）
* Toggle：显示映射标签（显示字段名/显示规则/显示置信度）
* 快捷键提示：Ctrl+S 保存，Del 删除映射

**画布内容**

* 映射连线（line）

  * 线颜色：状态不同（已确认/待Review/冲突）
  * 线中点为“映射节点”（你现有的小齿轮点位保留）
* 映射节点点击 → 打开 05_MappingDetailDrawer 并定位该映射

**画布提示层**

* 缺口提示：必填属性未映射时在属性附近显示红色提示 pill（可点）
* 冲突提示：冲突映射线自动抖动/红色标识（可点进入冲突处理）

---

## 4.3 03-3_SourceFieldColumn（来源字段列 v2）

### Frame：03-3_SourceFieldColumn

**顶部区域（关键新增：多表上下文）**

* Table Switcher（下拉/标签组）：

  * 主表（t_pop_base_info_2024）
  * 扩展表（…）
  * 维表（…）
  * 事件表（…）
* `添加来源表`按钮（打开 07_Modal_AddSourceTable）
* 表摘要：行数/更新时间/Gate 状态/敏感字段数

**字段列表**

* Search：搜索物理字段
* Filter：仅显示未映射字段 / 主键候选 / 时间字段 / 状态字段 / 敏感字段
* 每个字段 item 展示：

  * 字段名 + 类型
  * AI 语义/规则判定 badge（可选显示）
  * 置信度（若来自 AI）
  * 敏感等级（若已识别）
  * 右侧端口（用于连线）
  * 状态：已被占用（显示被哪个属性占用，点击跳转）

---

# 5. 04_TopRight_AIResultPanel（AI 自动映射结果面板 v2）

## Frame：04_TopRight_AIResultPanel (Drawer)

由右上角“AI 自动映射”打开，三段式队列：

* Tab A：高置信可接受（阈值≥0.90）
* Tab B：需复核（0.70–0.90 或存在软冲突）
* Tab C：冲突（硬冲突/一对多/类型不兼容）

每条建议卡片包含：

* 属性 → 字段候选（可多选）
* 置信度
* 证据摘要（命名/类型/采样/规则命中）
* 操作：

  * 接受（生成映射：状态=待Review 或 已确认取决于策略）
  * 替换（选择其它候选）
  * 驳回（加入黑名单规则/本对象不再推荐）

顶部批量操作：

* `批量接受高置信`
* `仅保留最佳候选`
* `导出建议`

---

# 6. 05_Right_MappingDetailDrawer（映射详情抽屉 v2）

## Frame：05_Right_MappingDetailDrawer

**触发：**

* 点击连线中点节点
* 点击属性的“已映射”badge
* 点击字段的“占用信息”

**抽屉结构：**

1. 映射概览

* 属性：身份证号（必填）
* 字段：id_card_num（varchar(18)）
* 映射状态：待Review/已确认/冲突
* 影响提示：此映射影响 Gate（必填）/敏感等级/下游规则

2. 映射类型（radio）

* 直接映射 1:1（默认）
* 派生映射（P1）：拼接/截取/计算
* 条件映射（P1）：CASE WHEN

3. 约束与校验

* 非空阈值、唯一性阈值
* 格式正则/字典校验
* 值域/枚举校验

4. 证据（可展开）

* AI 证据（置信度、来源）
* 规则证据（命中规则、权重）
* 采样值对比（脱敏展示）

5. 操作区

* 标记为已确认（需要权限/或评审后生效）
* 标记待Review
* 删除映射
* 标记冲突原因（类型不符/一对多/敏感冲突）

---

# 7. 06_Modal_ConflictResolver（冲突解决弹窗 v2）

## Frame：06_Modal_ConflictResolver

触发条件：

* 一个属性映射多个字段（不允许的场景）
* 一个字段被多个互斥属性占用
* 类型不兼容且强绑定

弹窗内容：

* 冲突摘要（原因、影响）
* 冲突项列表（属性/字段）
* 解决策略（radio）：

  * 保留 A，移除 B
  * 合并为派生映射（P1）
  * 拆分属性（新增属性）
  * 标记为允许一对多（需高级权限/规则）
* 确认按钮：`应用解决方案`

---

# 8. 07_Modal_AddSourceTable（添加来源表 v2）

## Frame：07_Modal_AddSourceTable

* 搜索表（支持系统/库/表）
* 表列表展示 Gate 状态、关键字段、敏感字段数
* 选择表角色：主表/扩展/维/事件
* 选择后：`加入并切换` / `加入不切换`

---

# 9. 08_Bottom_ActionBar（底部治理闭环 v2）

## Frame：08_Bottom_ActionBar (Sticky)

左侧状态提示：

* 未保存变更：3
* Gate 未通过：2（可点开）
* 冲突：1（可点开）

右侧按钮（受 Gate 控制）：

* `保存草稿`（永远可用）
* `提交评审`（满足最小闭环：主表已选 + 必填映射完成）
* `确认生效`（Gate 全通过 + 冲突=0 + 评审通过后可用）
* `回滚到上版本`（可选入口）

---

# 10. 09_Empty_Error_States（必备状态页）

1. 空态：未选对象 → 引导从左侧选择对象
2. 空态：未选来源表 → 引导“添加来源表”
3. Gate 未通过态：缺必填映射/缺主键/缺生命周期 → 顶部与底部同时提示并可定位
4. 只读态：对象已生效且无编辑权限 → 禁用编辑，允许导出/查看版本
5. 保存失败/冲突提交失败 → Toast + 失败详情列表

---

# 11. 与你现有 v1 页面相比，v2 的“明确改动点清单”（便于评审）

* 顶部新增：**Draft/Review/Effective 状态 + Gate Badge + 双进度（必填/全量）**
* 右侧字段列新增：**多表切换器 + 添加来源表**
* 新增：**AI 映射结果面板（高置信/复核/冲突）**
* 新增：**映射详情抽屉（映射类型/约束/证据/操作）**
* 新增：**冲突解决弹窗**
* 新增：**底部治理闭环操作条（保存/评审/生效/回滚）**

---

如果你下一步希望我把这份 v2 Frame 进一步细化为“设计可画的组件规格”（每个组件的字段、交互、校验文案、空态文案），我建议从三块开始：

1. 映射详情抽屉（最关键）
2. AI 映射结果面板（批量效率）
3. 多表切换器 + 表角色（落地真实场景）
