import { bigNumberify } from 'ethers/utils'
import moment from 'moment'
import React, { useContext } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styled, { ThemeContext, css } from 'styled-components'

import { calcPrice } from '../../../../util/tools'
import { HistoricData, Period } from '../../../../util/types'
import { ButtonSelectable } from '../../../button'
import { InlineLoading } from '../../../loading'

const commonWrapperCSS = css`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin-top: 10px;
  padding-top: 20px;
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  width: auto;
`

const NoData = styled.div`
  ${commonWrapperCSS}
  align-items: center;
  color: ${props => props.theme.colors.textColorDarker};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  height: 340px;
  justify-content: center;
  letter-spacing: 0.4px;
  line-height: 1.3;
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

const CustomInlineLoading = styled(InlineLoading)`
  ${commonWrapperCSS}
  height: 340px;
`

const ChartWrapper = styled.div`
  ${commonWrapperCSS}
`

const TitleWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 0 20px;
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

const Title = styled.h3`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.3;
  margin: 0;
`

const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  .buttonSelectableMargin {
    margin-left: 5px;

    &:first-child {
      margin-left: 0;
    }
  }
`

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

  return !data ? (
    <CustomInlineLoading message="Loading Trade History" />
  ) : holdingSeries && data ? (
    holdingSeries.length <= 1 ? (
      <NoData>There is not enough historical data for this market</NoData>
    ) : (
      <ChartWrapper>
        <TitleWrapper>
          <Title>Trade History</Title>
          <ButtonsWrapper>
            {options.map((item, index) => {
              return (
                <ButtonSelectable
                  active={value === item}
                  className="buttonSelectableMargin"
                  key={index}
                  onClick={() => onChange(item as Period)}
                >
                  {item}
                </ButtonSelectable>
              )
            })}
          </ButtonsWrapper>
        </TitleWrapper>
        <ResponsiveContainer height={300} width="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} stackOffset="expand">
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
        </ResponsiveContainer>
      </ChartWrapper>
    )
  ) : null
}
