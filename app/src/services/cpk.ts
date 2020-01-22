import { ethers, Wallet } from 'ethers'
import CPK from 'contract-proxy-kit'

import { getLogger } from '../util/logger'
import { ERC20Service, MarketMakerService } from './index'
import { BigNumber } from 'ethers/utils'
import { TransactionReceipt } from 'ethers/providers'

const logger = getLogger('Services::CPKService')

interface CPKBuyOutcomesParams {
  provider: any
  cost: BigNumber
  amount: BigNumber
  outcomeIndex: number
  marketMaker: MarketMakerService
}

class CPKService {
  static buyOutcomes = async ({
    provider,
    cost,
    amount,
    outcomeIndex,
    marketMaker,
  }: CPKBuyOutcomesParams): Promise<TransactionReceipt> => {
    try {
      const signer: Wallet = provider.getSigner()
      const account = await signer.getAddress()

      const collateralAddress = await marketMaker.getCollateralToken()
      const marketMakerAddress = marketMaker.address

      const cpk = await CPK.create({ ethers, signer })
      const cpkAddress = cpk.address

      // Approve amount of collateral to the CPK
      const collateralService = new ERC20Service(provider, account, collateralAddress)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(
        account,
        cpkAddress,
        cost,
      )

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpkAddress)
      }

      logger.log(`CPK address: ${cpkAddress}`)

      const outcomeTokensToBuy = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      logger.log(`Min outcome tokens to buy: ${outcomeTokensToBuy}`)

      const transactions = [
        // Step 2: Transfer an amount (cost) from the user to the CPK
        {
          operation: CPK.CALL,
          to: collateralAddress,
          value: 0,
          data: ERC20Service.encodeTransferFrom(account, cpkAddress, cost),
        },
        // Step 3: Buy outcome tokens with the CPK
        {
          operation: CPK.CALL,
          to: marketMakerAddress,
          value: 0,
          data: MarketMakerService.encodeBuy(amount, outcomeIndex, outcomeTokensToBuy),
        },
      ]

      // Check  if the allowance of the CPK to the market maker is enough.
      const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
        cpkAddress,
        marketMakerAddress,
        cost,
      )

      if (!hasCPKEnoughAlowance) {
        // Step 1:  Approve unlimited amount to be transferred to the market maker)
        transactions.unshift({
          operation: CPK.CALL,
          to: collateralAddress,
          value: 0,
          data: ERC20Service.encodeApproveUnlimited(marketMakerAddress),
        })
      }

      const txObject = await cpk.execTransactions(transactions, { gasLimit: 1000000 })

      logger.log(`Transaction hash: ${txObject.hash}`)
      return provider.waitForTransaction(txObject.hash)
    } catch (err) {
      logger.error(`There was an error buying '${amount.toString()}' of shares`, err.message)
      throw err
    }
  }
}

export { CPKService }
