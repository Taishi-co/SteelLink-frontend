export interface ProductListItem {
  id: number
  name: string
  price: number
  unit: string
  specs: string
  stock: number
  category: string
}

export const productCategories = [
  '全部',
  '热轧板卷',
  '冷轧板卷',
  '中厚板',
  '型材',
  '管材',
  '建材',
]

export const mallCategories = [
  { id: 1, name: '热轧板卷', icon: '🔥' },
  { id: 2, name: '冷轧板卷', icon: '❄️' },
  { id: 3, name: '中厚板', icon: '📋' },
  { id: 4, name: '型材', icon: '🏗' },
  { id: 5, name: '管材', icon: '🧱' },
  { id: 6, name: '建材', icon: '🏢' },
]

export const mockProducts: ProductListItem[] = [
  { id: 1, name: 'Q235B 热轧板卷 3.0*1500*C', price: 3850, unit: '元/吨', specs: '宝钢', stock: 500, category: '热轧板卷' },
  { id: 2, name: 'SPCC 冷轧板卷 1.0*1250*C', price: 4200, unit: '元/吨', specs: '鞍钢', stock: 300, category: '冷轧板卷' },
  { id: 3, name: 'Q345B 中厚板 20*2000*8000', price: 3950, unit: '元/吨', specs: '首钢', stock: 200, category: '中厚板' },
  { id: 4, name: 'Q235B 工字钢 25#', price: 4100, unit: '元/吨', specs: '马钢', stock: 150, category: '型材' },
  { id: 5, name: 'Q235B 角钢 50*50*5', price: 3800, unit: '元/吨', specs: '莱钢', stock: 400, category: '型材' },
  { id: 6, name: 'Q235B 槽钢 10#', price: 3900, unit: '元/吨', specs: '日照', stock: 250, category: '型材' },
  { id: 7, name: 'Q195 焊管 48*3.0', price: 4150, unit: '元/吨', specs: '友发', stock: 600, category: '管材' },
  { id: 8, name: 'HRB400E 螺纹钢 Φ20', price: 3750, unit: '元/吨', specs: '沙钢', stock: 800, category: '建材' },
  { id: 9, name: 'Q235B 热轧板卷 4.75*1500*C', price: 3920, unit: '元/吨', specs: '本钢', stock: 420, category: '热轧板卷' },
  { id: 10, name: 'DC01 冷轧卷 1.2*1250*C', price: 4280, unit: '元/吨', specs: '河钢', stock: 180, category: '冷轧板卷' },
  { id: 11, name: 'Q355B H型钢 300*300', price: 4380, unit: '元/吨', specs: '津西', stock: 160, category: '型材' },
  { id: 12, name: 'Q235B 镀锌管 114*4.0', price: 4520, unit: '元/吨', specs: '正大', stock: 260, category: '管材' },
]

export const featuredProducts = mockProducts.slice(0, 4)
