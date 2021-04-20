const chart = require('./src/components/PluginFlow/data.json')

const data = {
  chart,
  conf: {},
  rule: {}
}

const { cells = [] } = chart

cells.forEach(cell => {
  const { shape, id } = cell
  if (shape === "flow-chart-plugin-rect") {
    // console.log(cell)
    data.conf[id] = cell.data
  }
})

// TODO: 校验 data 没有被配置的情况

console.log(data)