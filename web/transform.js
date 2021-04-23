const chart = require('./src/components/PluginFlow/data.json')

const PLUGIN_FLOW = "flow-chart-plugin-rect"
const CONDITION_FLOW = "flow-chart-condition-rect"

// Get the cell associated with a conditional component based on its ID and port location
const getNextCell = (id = "", position = "") => {
  const cell = cells.find(item => item.id === id)
  if (!cell) {
    return
  }

  if (!cell.ports) {
    return undefined
  }

  const port = cell.ports.items.find(item => item.group === position)
  if (!port) {
    return undefined
  }

  const targetCellId = cells.find(cell => cell.source?.port === port.id && cell.source?.cell === id)?.target.cell
  const targetCell = cells.find(cell => cell.id === targetCellId)
  return targetCell
}

const getLeafList = (id = "") => {
  let ids = []

  const fn = (id) => {
    const cell = getNextCell(id, "right")
    if (!cell) {
      return
    }
    ids = ids.concat(cell.id);
    fn(cell.id)
  }

  fn(id)
  return [id].concat(ids)
}

const data = {
  chart,
  conf: {},
  rule: {
    root: ""
  }
}

const { cells = [] } = chart

cells.forEach(cell => {
  const { shape, id } = cell
  if (shape === PLUGIN_FLOW) {
    if (cell.data) {
      data.conf[id] = cell.data
    } else {
      console.error(id, "No data found")
    }
    data.rule[id] = []
  }
})

const edgeCells = cells.filter(cell => cell.shape === 'edge')
const conditionCells = cells.filter(cell => cell.shape === 'CONDITION_FLOW')

const startCell = cells.find(cell => cell.shape === 'flow-chart-start-rect')
if (!startCell) {
  console.error("Can't find the Start Node")
  return
}

const endCell = cells.find(cell => cell.shape === 'flow-chart-end-rect')
if (!startCell) {
  console.error("Can't find the End Node")
  return
}

const rootCell = cells.find(cell => cell.shape === 'edge' && cell.source.cell === startCell.id)
if (!rootCell) {
  console.error("Can't find the Root Node")
  return
}
data.rule.root = rootCell.target.cell

// Get the ID associated with each node, the relationship between nodes is in edgeCells.
edgeCells.forEach(edge => {
  const sourceId = edge.source.cell
  const targetId = edge.target.cell

  const sourceCell = cells.find(item => item.id === sourceId)
  const targetCell = cells.find(item => item.id === targetId)

  data.rule[sourceId] = []

  getLeafList(targetId).forEach(id => {
    const cell = cells.find(item => item.id === id)
    if (cell.shape === CONDITION_FLOW) {
      const nextCell = getNextCell(cell.id, "bottom");
      if (!nextCell) {
        return
      }
      data.rule[sourceId].push([cell.data, nextCell.id])
    }

    if (cell.shape === PLUGIN_FLOW) {
      data.rule[sourceId].push(['', cell.id])
    }
  })
})

// NOTE: Omit empty array, or API will throw error.
Object.entries(data.rule).forEach(([key, value]) => {
  if (value.length === 0) {
    delete data.rule[key]
  }

  if (key === 'root') {
    return
  }
  const cell = cells.find(item => item.id === key)
  if (cell?.shape !== PLUGIN_FLOW) {
    delete data.rule[key]
  }
})

console.log(data.rule)
