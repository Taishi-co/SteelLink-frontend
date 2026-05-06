export interface RegisteredWarehouse {
  id: number
  name: string
  code: string
  province: string
  city: string
  district: string
  address: string
  operator: string
  capacity: number
  availableCapacity: number
  serviceTypes: string[]
  status: 'active' | 'reviewing' | 'disabled'
}

export interface LogisticsCarrier {
  id: number
  name: string
  routeStart: string
  routeEnd: string
  serviceScope: string
  vehicleType: string
  loadCapacity: number
  pricePerTon: number
  guarantee: string
  status: 'available' | 'assigned' | 'reviewing'
}

export interface InventoryMovement {
  id: string
  warehouseCode: string
  productName: string
  bundleNo: string
  movementType: 'inbound' | 'outbound'
  quantity: number
  orderNo: string
  status: 'pending' | 'processing' | 'completed'
  scheduledAt: string
}

export const registeredWarehouses: RegisteredWarehouse[] = [
  {
    id: 101,
    name: '唐山仓库A区',
    code: 'TS-A-01',
    province: '河北省',
    city: '唐山市',
    district: '丰润区',
    address: '唐山市丰润区工业路88号',
    operator: '唐山华储仓储有限公司',
    capacity: 32000,
    availableCapacity: 12800,
    serviceTypes: ['现货监管', '入库验收', '出库提货'],
    status: 'active',
  },
  {
    id: 102,
    name: '上海宝山监管仓',
    code: 'SH-BS-02',
    province: '上海市',
    city: '上海市',
    district: '宝山区',
    address: '上海市宝山区铁山路288号',
    operator: '华东钢链仓储服务',
    capacity: 26000,
    availableCapacity: 7400,
    serviceTypes: ['仓单监管', '质检复核', '短驳装车'],
    status: 'active',
  },
  {
    id: 103,
    name: '天津港前置仓',
    code: 'TJ-G-03',
    province: '天津市',
    city: '天津市',
    district: '滨海新区',
    address: '天津市滨海新区天津港第五大街',
    operator: '津港仓配有限公司',
    capacity: 18000,
    availableCapacity: 5200,
    serviceTypes: ['港口短驳', '集港预约', '出库装车'],
    status: 'reviewing',
  },
]

export const logisticsCarriers: LogisticsCarrier[] = [
  {
    id: 201,
    name: '唐山物流有限公司',
    routeStart: '唐山丰润',
    routeEnd: '华北/华东',
    serviceScope: '覆盖唐山、天津、廊坊、苏州、上海',
    vehicleType: '13 米平板车',
    loadCapacity: 32,
    pricePerTon: 80,
    guarantee: '平台履约保证金 50 万，支持异常先赔',
    status: 'available',
  },
  {
    id: 202,
    name: '河北货运集团',
    routeStart: '京津冀',
    routeEnd: '全国干线',
    serviceScope: '覆盖京津冀至华东、华南主线路',
    vehicleType: '高栏/平板/半挂',
    loadCapacity: 34,
    pricePerTon: 75,
    guarantee: '承运险覆盖，回单 24 小时内归档',
    status: 'available',
  },
  {
    id: 203,
    name: '全国钢铁配送',
    routeStart: '全国仓库',
    routeEnd: '全国项目地',
    serviceScope: '支持无仓绑定商品的临时找车和多点提货',
    vehicleType: '整车/零担',
    loadCapacity: 30,
    pricePerTon: 85,
    guarantee: '司机实名、轨迹回传、签收凭证留档',
    status: 'available',
  },
]

export const inventoryMovements: InventoryMovement[] = [
  {
    id: 'WMS-IN-20260506001',
    warehouseCode: 'TS-A-01',
    productName: '热轧板卷 SPHC',
    bundleNo: 'HB-2026-0420-0001',
    movementType: 'inbound',
    quantity: 96,
    orderNo: 'RK20260506001',
    status: 'completed',
    scheduledAt: '2026-05-06 10:00',
  },
  {
    id: 'WMS-OUT-20260506002',
    warehouseCode: 'TS-A-01',
    productName: '镀锌卷 DX51D',
    bundleNo: 'DX-2026-0501-0008',
    movementType: 'outbound',
    quantity: 44,
    orderNo: 'DD20260506018',
    status: 'processing',
    scheduledAt: '2026-05-06 14:00',
  },
  {
    id: 'WMS-OUT-20260506003',
    warehouseCode: 'SH-BS-02',
    productName: '螺纹钢 HRB400E',
    bundleNo: 'HRB-2026-0502-0012',
    movementType: 'outbound',
    quantity: 180,
    orderNo: 'DD20260506021',
    status: 'pending',
    scheduledAt: '2026-05-07 09:00',
  },
]
