import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { getArbitratorsByNetwork, getTokensByNetwork } from '../../../../util/networks'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { currenciesData } from '../../../common/icons/currencies/currencies_data'
import { TokenItem } from '../token_item'

const Wrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  margin: 0 25px;
  padding: 20px 0 25px 0;
  row-gap: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const Column = styled.div`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    max-width: 165px;
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: normal;
  line-height: 1.2;
  margin: 0 0 12px;
`

const Options = styled(Dropdown)`
  max-width: 100%;
`

interface Props {
  currency: Maybe<string>
  onChangeCurrency: (currency: Maybe<string>) => void
  onChangeArbitrator: (arbitrator: Maybe<string>) => void
  onChangeTemplateId: (templateId: Maybe<string>) => void
}

export const AdvancedFilters = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const arbitrators = getArbitratorsByNetwork(networkId)
  const tokens = getTokensByNetwork(networkId)

  const { currency, onChangeArbitrator, onChangeCurrency, onChangeTemplateId } = props

  const allTokensOptions = [{ address: null, symbol: 'All' }, ...tokens]
  const currencyOptions: Array<DropdownItemProps> = allTokensOptions.map(({ address, symbol }) => {
    const tokenData = currenciesData.find(c => c.token === symbol)
    return {
      content: <TokenItem icon={tokenData ? tokenData.icon : null} text={symbol} />,
      onClick: () => onChangeCurrency(address),
    }
  })

  const questionTypeOptions: Array<DropdownItemProps> = [
    {
      content: 'All',
      onClick: () => onChangeTemplateId(null),
    },
    {
      content: 'Binary',
      onClick: () => onChangeTemplateId('0'),
    },
    {
      content: 'Categorical',
      onClick: () => onChangeTemplateId('2'),
    },
  ]

  const arbitratorOptions: Array<DropdownItemProps> = [{ address: null, name: 'All' }, ...arbitrators].map(
    ({ address, name }) => {
      return {
        content: name,
        onClick: () => onChangeArbitrator(address),
      }
    },
  )

  return (
    <Wrapper>
      <Column>
        <Title>Currency</Title>
        <Options currentItem={allTokensOptions.findIndex(t => t.address === currency)} items={currencyOptions} />
      </Column>
      <Column>
        <Title>Question Type</Title>
        <Options items={questionTypeOptions} />
      </Column>
      <Column>
        <Title>Arbitrator</Title>
        <Options dropdownPosition={DropdownPosition.right} items={arbitratorOptions} />
      </Column>
    </Wrapper>
  )
}
