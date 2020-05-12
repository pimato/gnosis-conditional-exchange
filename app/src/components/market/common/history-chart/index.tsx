import { useQuery } from '@apollo/react-hooks'
import { Block } from 'ethers/providers'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import { HistoryChart } from './chart'

const buildQueryHistory = (blockNumbers: number[]) => {
  const subqueries = blockNumbers.map(
    blockNumber => `
      fixedProductMarketMaker_${blockNumber}: fixedProductMarketMaker(id: $id, block: { number: ${blockNumber} }) {
        outcomeTokenAmounts
      }
    `,
  )

  return gql`
    query GetMarketHistory($id: ID!) {
    ${subqueries.join(',')}
    }
  `
}

type HistoricDataPoint = {
  block: Block
  holdings: string[]
}

type HistoricData = HistoricDataPoint[]

const useHoldingsHistory = (marketMakerAddress: string, blocks: Maybe<Block[]>): Maybe<HistoricData> => {
  // we need a valid query even if it will be skipped, so we use a syntactic valid placeholder
  // when blockNumbers is null
  const query = blocks
    ? buildQueryHistory(blocks.map(block => block.number))
    : gql`
        query NullQuery($id: ID!) {
          fixedProductMarketMaker(id: $id) {
            id
          }
        }
      `

  const queryResult = useQuery<{ [key: string]: { outcomeTokenAmounts: string[] } }>(query, {
    notifyOnNetworkStatusChange: true,
    skip: blocks === null,
    variables: { id: marketMakerAddress },
  })

  if (queryResult.data && blocks) {
    const result: HistoricData = []
    Object.values(queryResult.data).forEach((value, index) => {
      if (value) {
        const block = blocks[index]
        const holdings = value.outcomeTokenAmounts
        result.push({ block, holdings })
      }
    })

    return result
  }
  return null
}

type Props = {
  marketMakerAddress: string
  hidden: boolean
}

export const HistoryChartContainer: React.FC<Props> = ({ hidden, marketMakerAddress }) => {
  const { library } = useWeb3Context()
  const [latestBlockNumber, setLatestBlockNumber] = useState<Maybe<number>>(null)
  const [blocks, setBlocks] = useState<Maybe<Block[]>>(null)
  const holdingsSeries = useHoldingsHistory(marketMakerAddress, blocks)

  useEffect(() => {
    library.getBlockNumber().then(setLatestBlockNumber)
  }, [library])

  useEffect(() => {
    const getBlocks = async (latestBlockNumber: number) => {
      const blocksPerDay = 5760
      const totalDataPoints = 7
      const granularity = 7

      if (latestBlockNumber) {
        const blockNumbers = Array.from(new Array(totalDataPoints), (_, i) => i * granularity).map(
          multiplier => latestBlockNumber - multiplier * blocksPerDay,
        )
        const blocks = await Promise.all(blockNumbers.map(blockNumber => library.getBlock(blockNumber)))

        setBlocks(blocks)
      }
    }

    if (latestBlockNumber) {
      getBlocks(latestBlockNumber)
    }
  }, [latestBlockNumber, library])

  return hidden ? null : <HistoryChart holdingSeries={holdingsSeries} />
}
