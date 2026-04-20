# Frontend Project Map

## 项目定位

当前仓库是 SteelLink 前端的治理与协作骨架，负责沉淀 AI 入口文档、feature 设计模板、权限矩阵和标准化 `harness/` 工作流。
它不是完整业务前端代码仓；如果需要修改页面、路由或服务代码，应在配套前端应用仓中执行同样的治理流程。

## 目录地图

```text
SteelLink-frontend/
├── AGENTS.md           # 多 agent 统一入口
├── CLAUDE.md           # Claude 的轻量入口
├── docs/
│   ├── ai/             # AI 上手、工程规则、Git、Review、Release 规则
│   ├── domain/         # 领域约束，如角色权限矩阵
│   └── features/       # feature 规格、测试、实施、上线检查
└── harness/            # bootstrap / verify / review / release / deploy 统一入口
```

## 关键模块

- `AGENTS.md`：所有 agent 的统一工作协议
- `docs/ai/*.md`：仓库规则、边界和标准流程
- `docs/features/<feature-id>/`：设计产物与上线检查的主落点
- `docs/domain/role-permission-matrix.md`：权限相关需求的治理约束
- `harness/*.sh`：本仓唯一认可的命令入口

## 高风险改动区域

- `AGENTS.md` 与 `docs/ai/*`：一旦写错，会误导后续所有 agent
- `harness/verify.sh`、`harness/review.sh`、`harness/release.sh`：决定流程是否可执行
- `harness/resolve-feature-dir.sh`：影响 CI 或脚本能否定位正确 feature 文档
- `docs/domain/role-permission-matrix.md`：权限治理的共识基线
- 任何引用配套前端应用仓路径的文档：必须明确标注其为外部依赖

## 变更前检查

在以下场景必须先补文档再开发：

- 新增或修改治理流程、AI 入口文档、feature 模板
- 修改权限矩阵或权限核对要求
- 调整 `harness/` 脚本的行为
- 要求本仓与配套前端应用仓联动变更

## 设计产物放置约定

- 需求说明：`docs/features/<feature-id>/spec.md`
- 测试用例：`docs/features/<feature-id>/test-cases.md`
- 实施计划：`docs/features/<feature-id>/implementation-plan.md`
- 上线检查：`docs/features/<feature-id>/release-checklist.md`
