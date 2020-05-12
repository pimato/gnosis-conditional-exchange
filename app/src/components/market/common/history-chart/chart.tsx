import React, { useContext } from 'react'
import { HistoricData } from '../../../../util/types'
import { calcPrice } from '../../../../util/tools'
import { bigNumberify } from 'ethers/utils'
import { AreaChart, XAxis, YAxis, Area } from 'recharts'
import { ThemeContext } from 'styled-components'
import moment from 'moment'

type Props = {
  holdingSeries: Maybe<HistoricData>
}

const timestampToDate = (timestamp: number) => {
  return moment(timestamp * 1000).format('YYYY-MM-DD')
}

const toPercent = (decimal: number, fixed = 0) => {
  return `${(decimal * 100).toFixed(fixed)}%`
}

export const HistoryChart: React.FC<Props> = ({ holdingSeries }) => {
  const data =
    holdingSeries &&
    holdingSeries
      .sort((a, b) => a.block.timestamp - b.block.timestamp)
      .map(h => {
        const prices = calcPrice(h.holdings.map(bigNumberify))
        return { ...prices, date: timestampToDate(h.block.timestamp) }
      })

  const themeContext = useContext(ThemeContext)

  return holdingSeries && data ? (
    holdingSeries.length <= 1 ? (
      <div>There's not enough historical data for this market</div>
    ) : (
      <AreaChart
        width={500}
        height={300}
        data={data}
        stackOffset="expand"
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis dataKey="date" />
        <YAxis tickFormatter={toPercent} />
        {data.map(({ date }, index) => {
          const color = themeContext.outcomes.colors[index]

          return (
            color && (
              <Area
                type="monotone"
                dataKey={index}
                key={`${index}-${date}`}
                stackId="1"
                stroke="#8884d8"
                fill={color.darker}
              />
            )
          )
        })}
      </AreaChart>
    )
  ) : null
}
