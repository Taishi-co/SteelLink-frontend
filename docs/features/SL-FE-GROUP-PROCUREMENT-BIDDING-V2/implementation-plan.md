# Implementation Plan

## Feature 信息

- Feature ID: `SL-FE-GROUP-PROCUREMENT-BIDDING-V2`
- 开发负责人: Codex

## 变更范围

- 代码文件:
  - `apps/buyer-app/src/pages/Procurement*`
  - `apps/buyer-app/src/pages/GroupProcurementModule/*`
  - `apps/buyer-app/src/services/marketService.ts`
  - `apps/seller-app/src/pages/GroupProcurement/*`
  - `apps/seller-app/src/services/marketService.ts`
- 文档文件:
  - `docs/features/SL-FE-GROUP-PROCUREMENT-BIDDING-V2/*`
- 配置文件:
  - 无
- 脚本文件:
  - 无

## 实施步骤

1. 扩展前端 market service 类型和请求封装，接入项目、报名、报价、中标摘要数据。
2. 改造买家端集采大厅和详情页为项目视图，保留商城内申请集采入口。
3. 改造卖家端集采页为竞价工作台，支持项目列表、报名、报价和结果展示。

## 验证计划

- `./harness/verify.sh`
- 如涉及配套应用仓，补充对应 lint/build/测试命令
- 需要的人工验证:
  - 买家端查看项目大厅/详情
  - 商品详情提交申请
  - 卖家端报名和报价

## 风险与回滚关注点

- 前端需要同时兼容旧集采活动字段和新项目字段，映射处理不当会导致渲染空白。
- 卖家端报价表单与后端状态耦合强，必须兜底展示真实错误消息。
- 回滚时恢复旧活动型页面即可，商城申请入口不应受影响。
