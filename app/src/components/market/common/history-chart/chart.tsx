import { bigNumberify } from 'ethers/utils'
import moment from 'moment'
import React, { useContext } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ThemeContext } from 'styled-components'

import { calcPrice } from '../../../../util/tools'
import { HistoricData } from '../../../../util/types'

type Props = {
  holdingSeries: Maybe<HistoricData>
  outcomes: string[]
}

const timestampToDate = (timestamp: number) => {
  return moment(timestamp * 1000).format('YYYY-MM-DD')
}

const toPercent = (decimal: number, fixed = 0) => {
  return `${(decimal * 100).toFixed(fixed)}%`
}

const renderTooltipContent = (o: any) => {
  const { label, payload } = o

  return (
    <div className="customized-tooltip-content">
      <p className="total">{label}</p>
      <ul className="list">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} style={{ color: '#ffffff' }}>
            {`${entry.name}: (${toPercent(entry.value)})`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const HistoryChart: React.FC<Props> = ({ holdingSeries, outcomes }) => {
  const data =
    holdingSeries &&
    holdingSeries
      .sort((a, b) => a.block.timestamp - b.block.timestamp)
      .map(h => {
        const prices = calcPrice(h.holdings.map(bigNumberify))
        const outcomesPrices: { [outcomeName: string]: number } = {}
        outcomes.forEach((k, i) => (outcomesPrices[k] = prices[i]))

        return { ...outcomesPrices, date: timestampToDate(h.block.timestamp) }
      })

  const themeContext = useContext(ThemeContext)

  return holdingSeries && data ? (
    holdingSeries.length <= 1 ? (
      <div>There is not enough historical data for this market</div>
    ) : (
      <AreaChart
        data={data}
        height={300}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        stackOffset="expand"
        width={500}
      >
        <XAxis dataKey="date" />
        <YAxis tickFormatter={toPercent} />
        <Tooltip content={renderTooltipContent} />

        {outcomes.map((outcomeName, index) => {
          const color = themeContext.outcomes.colors[index]

          return (
            <Area
              dataKey={outcomeName}
              fill={color.darker}
              key={`${index}-${outcomeName}`}
              stackId="1"
              stroke="#8884d8"
              type="monotone"
            />
          )
        })}
      </AreaChart>
    )
  ) : null
}
