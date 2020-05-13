import { bigNumberify } from 'ethers/utils'
import moment from 'moment'
import React, { useContext } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ThemeContext } from 'styled-components'

import { calcPrice } from '../../../../util/tools'
import { HistoricData, Period } from '../../../../util/types'
import { Select } from '../../../common'

type Props = {
  holdingSeries: Maybe<HistoricData>
  onChange: (s: Period) => void
  options: string[]
  outcomes: string[]
  value: Period
}

const timestampToDate = (timestamp: number, value: string) => {
  const ts = moment(timestamp * 1000)
  return value === '1D' ? ts.format('HH:MM') : ts.format('YYYY-MM-DD')
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
        {payload.reverse().map((entry: any, index: number) => (
          <li key={`item-${index}`}>{`${entry.name}: (${toPercent(entry.value)})`}</li>
        ))}
      </ul>
    </div>
  )
}

export const HistoryChart: React.FC<Props> = ({ holdingSeries, onChange, options, outcomes, value }) => {
  const data =
    holdingSeries &&
    holdingSeries
      .filter(h => !!h.block)
      .sort((a, b) => a.block.timestamp - b.block.timestamp)
      .map(h => {
        const prices = calcPrice(h.holdings.map(bigNumberify))
        const outcomesPrices: { [outcomeName: string]: number } = {}
        outcomes.forEach((k, i) => (outcomesPrices[k] = prices[i]))

        return { ...outcomesPrices, date: timestampToDate(h.block.timestamp, value) }
      })

  const themeContext = useContext(ThemeContext)

  return holdingSeries && data ? (
    holdingSeries.length <= 1 ? (
      <div>There is not enough historical data for this market</div>
    ) : (
      <>
        <Select name="select-period-chart" onChange={e => onChange(e.target.value as Period)} value={value}>
          {options.map(value => {
            return (
              <option key={value} value={value}>
                {value}
              </option>
            )
          })}
        </Select>
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

          {outcomes
            .map((outcomeName, index) => {
              const color = themeContext.outcomes.colors[index]

              return (
                <Area
                  dataKey={outcomeName}
                  fill={color.medium}
                  key={`${index}-${outcomeName}`}
                  stackId="1"
                  stroke="#8884d8"
                  type="monotone"
                />
              )
            })
            .reverse()}
        </AreaChart>
      </>
    )
  ) : null
}
