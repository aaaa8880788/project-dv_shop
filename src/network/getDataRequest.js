import { request } from "./request";

// 1.商品销售统计部分

// 请求商家销售统计数据
export function getSellerCounterData() {
  return request({
    url: '/seller',
    method: 'get'
  })
}

// 2.商品销量趋势部分
// 请求销量趋势数据
export function getTrendData() {
  return request({
    url: '/trend',
    method: 'get'
  })
}

// 3.地图部分
// 请求地图数据
export function getMapData() {
  return request({
    url: '/china',
    method: 'get'
  })
}

// 请求地图legend数据
export function getLegendData() {
  return request({
    url: '/map',
    method: 'get'
  })
}

// 请求地图省份数据
export function getProvinceData(URL) {
  return request({
    url: URL,
    method: 'get'
  })
}

// 4.地区销售排行部分
// 请求地区销量数据
export function getRankData() {
  return request({
    url: '/rank',
    method: 'get'
  })
}

// 5.热销商品占比部分
export function getHotData() {
  return request({
    url: '/hotproduct',
    method: 'get'
  })
}

// 6.库存和销量分析部分
export function getStockData() {
  return request({
    url: 'stock',
    method: 'get'
  })
}