# SteelLink Frontend

B2B 钢材交易平台前端应用，采用 pnpm workspace monorepo 架构。

## 项目结构

```
SteelLink-frontend/
├── apps/
│   ├── buyer-app/          # 买家端应用
│   │   └── src/
│   │       ├── pages/      # 首页、商品列表、商品详情、购物车、登录
│   │       ├── stores/     # Zustand 状态管理
│   │       └── services/   # API 服务层
│   └── seller-app/         # 卖家端应用
│       └── src/
│           └── pages/      # 数据概览、商品管理、订单管理、店铺设置
├── packages/
│   └── shared/             # 共享代码（类型、工具函数）
├── docs/                   # 治理文档
└── harness/                # 工作流脚本
```

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vite + React 18 + TypeScript |
| UI | Ant Design + Tailwind CSS |
| 状态管理 | Zustand |
| 数据请求 | TanStack Query + Axios |
| 路由 | React Router v6 |
| 表单 | React Hook Form + Zod |
| 包管理 | pnpm workspace |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 买家端 (http://localhost:5173)
pnpm dev

# 卖家端 (http://localhost:5174)
pnpm dev:seller
```

### 构建

```bash
# 构建所有应用
pnpm build

# 单独构建
pnpm build:buyer
pnpm build:seller
```

### 代码检查

```bash
pnpm lint
pnpm typecheck
```

## Docker 部署

```bash
# 构建镜像
docker build -t steellink-frontend .

# 运行容器
docker run -p 80:80 steellink-frontend

# 或使用 docker-compose
docker-compose up -d
```

访问地址：
- 买家端：http://localhost/
- 卖家端：http://localhost/seller/

## 用户角色

- **买家**：管理员、采购岗、审核岗
- **卖家**：管理员、销售岗
- **平台运营**
- **第三方**：银行、物流、仓储

## 功能模块

### 买家端
- 首页：Banner、品类导航、热门商品
- 商品列表：筛选、搜索、分页
- 商品详情：规格参数、加入购物车
- 购物车：数量调整、结算
- 登录/注册：密码登录、短信登录、企业注册

### 卖家端
- 数据概览：订单统计、销售额、客户数
- 商品管理：发布、编辑、上下架
- 订单管理：查看、发货
- 店铺设置：信息编辑、认证资料

## 文档

- [AI 协作入口](./docs/ai/entrypoint.md)
- [项目地图](./docs/ai/project-map.md)
- [工程规范](./docs/ai/engineering-rules.md)
- [Git 工作流](./docs/ai/git-workflow.md)

## License

MIT
