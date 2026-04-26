# Frontend Project Map

## 项目定位

当前仓库是 SteelLink 主服务前端应用仓，同时沉淀 AI 入口文档、feature 设计模板、权限矩阵和标准化 `harness/` 工作流。
业务代码位于 `apps/buyer-app`、`apps/seller-app` 与 `packages/shared`，治理产物位于 `docs/` 与 `harness/`。

## 目录地图

```text
SteelLink-frontend/
├── AGENTS.md           # 多 agent 统一入口
├── CLAUDE.md           # Claude 的轻量入口
├── apps/
│   ├── buyer-app/      # 买家端 React/Vite 应用
│   └── seller-app/     # 卖家端 React/Vite 应用
├── packages/
│   └── shared/         # 前端共享类型与工具
├── docs/
│   ├── ai/             # AI 上手、工程规则、Git、Review、Release 规则
│   ├── domain/         # 领域约束，如角色权限矩阵
│   └── features/       # feature 规格、测试、实施、上线检查
├── package.json        # pnpm workspace 根配置
└── harness/            # bootstrap / verify / review / release / deploy 统一入口
```

## 关键模块

- `AGENTS.md`：所有 agent 的统一工作协议
- `docs/ai/*.md`：仓库规则、边界和标准流程
- `docs/features/<feature-id>/`：设计产物与上线检查的主落点
- `apps/buyer-app/src/pages/` 与 `apps/seller-app/src/pages/`：买家端、卖家端页面
- `apps/*/src/services/`：前端 API 封装
- `packages/shared/src/`：跨应用共享类型与工具
- `docs/domain/role-permission-matrix.md`：权限相关需求的治理约束
- `harness/*.sh`：本仓唯一认可的命令入口

## 高风险改动区域

- `AGENTS.md` 与 `docs/ai/*`：一旦写错，会误导后续所有 agent
- `harness/verify.sh`、`harness/review.sh`、`harness/release.sh`：决定流程是否可执行
- `harness/resolve-feature-dir.sh`：影响 CI 或脚本能否定位正确 feature 文档
- `docs/domain/role-permission-matrix.md`：权限治理的共识基线
- `apps/*/src/services/`：接口契约变化会影响真实交易流程
- `apps/*/src/pages/`：页面流程变化需要同步 feature 文档与测试用例

## 变更前检查

在以下场景必须先补文档再开发：

- 新增或修改治理流程、AI 入口文档、feature 模板
- 修改权限矩阵或权限核对要求
- 调整 `harness/` 脚本的行为
- 修改页面、路由、接口封装或共享类型

## 设计产物放置约定

- 需求说明：`docs/features/<feature-id>/spec.md`
- 测试用例：`docs/features/<feature-id>/test-cases.md`
- 实施计划：`docs/features/<feature-id>/implementation-plan.md`
- 上线检查：`docs/features/<feature-id>/release-checklist.md`
