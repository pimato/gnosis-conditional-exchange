import React, { useState } from 'react'
import styled, { css } from 'styled-components'

import { ButtonCircle } from '../../../../../button'
import { FormLabel, FormRowLink, Textfield, TextfieldCustomPlaceholder } from '../../../../../common'
import { IconAdd, IconRemove } from '../../../../../common/icons'
import {
  OutcomeItemLittleBallOfJoyAndDifferentColors,
  OutcomeItemProbability,
  OutcomeItemProbabilityText,
  OutcomeItemText,
  OutcomeItemTextWrapper,
  OutcomesTBody,
  OutcomesTD,
  OutcomesTH,
  OutcomesTHead,
  OutcomesTR,
  OutcomesTable,
  OutcomesTableWrapper,
} from '../../../../common/common_styled'

const BUTTON_DIMENSIONS = '34px'

const OutcomeGridCSS = css`
  align-items: center;
  column-gap: 16px;
  display: grid;
`

const OutcomeIsUniformGridCSS = css`
  ${OutcomeGridCSS}
  grid-template-columns: 1fr ${BUTTON_DIMENSIONS};
`

const OutcomeIsManualGridCSS = css`
  ${OutcomeGridCSS}
  grid-template-columns: minmax(120px, 1fr) minmax(100px, 146px) ${BUTTON_DIMENSIONS};
`

const TitleWrapper = styled.div<{ uniformProbabilities: boolean }>`
  ${props => props.uniformProbabilities && OutcomeIsUniformGridCSS}
  ${props => !props.uniformProbabilities && OutcomeIsManualGridCSS}
  margin-bottom: 12px;
`

const TitleText = styled.div`
  direction: rtl;
  text-align: right;
  white-space: nowrap;
`

const NewOutcome = styled.div<{ uniformProbabilities: boolean }>`
  ${props => props.uniformProbabilities && OutcomeIsUniformGridCSS}
  ${props => !props.uniformProbabilities && OutcomeIsManualGridCSS}
  margin-bottom: 20px;
`

const CustomButtonCircle = styled(ButtonCircle)`
  &,
  &[disabled] {
    border-color: ${props => props.theme.borders.borderColorLighter};
  }

  height: ${BUTTON_DIMENSIONS};
  width: ${BUTTON_DIMENSIONS};
`

const CustomButtonCircleAddReadyCSS = css`
  background-color: ${props => props.theme.colors.primary};
  border-color: ${props => props.theme.colors.primary};

  path {
    fill: #fff;
  }
`

const CustomButtonCircleAdd = styled(CustomButtonCircle)<{ readyToAdd: boolean }>`
  ${props => props.readyToAdd && CustomButtonCircleAddReadyCSS}
`

const NoteTitle = styled.span`
  color: ${props => props.theme.colors.textColorDark};
`

const Note = styled.div`
  color: ${props => props.theme.colors.textColorLight};
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 20px;
  margin-top: -20px;
  padding: 10px 0 0 0;
`

export interface Outcome {
  name: string
  probability: number
}

interface Props {
  canAddOutcome: boolean
  disabled: boolean
  onChange: (newOutcomes: Outcome[]) => any
  outcomes: Outcome[]
  totalProbabilities: number
}

const Outcomes = (props: Props) => {
  const outcomeMinValue = 0
  const outcomeMaxValue = 100
  const { canAddOutcome, disabled, outcomes } = props
  const [newOutcomeName, setNewOutcomeName] = useState<string>('')
  const [newOutcomeProbability, setNewOutcomeProbability] = useState<number>(outcomeMinValue)
  const [uniformProbabilities, setIsUniform] = useState<boolean>(false)

  const uniform = (outcomes: Outcome[]): Outcome[] => {
    return outcomes.map(o => ({
      ...o,
      probability: 100 / outcomes.length,
    }))
  }

  const addNewOutcome = () => {
    const newOutcome = {
      name: newOutcomeName.trim(),
      probability: newOutcomeProbability,
    }
    const newOutcomes = outcomes.concat(newOutcome)
    props.onChange(uniformProbabilities ? uniform(newOutcomes) : newOutcomes)
    setNewOutcomeName('')
    setNewOutcomeProbability(0)
  }

  const removeOutcome = (index: number) => {
    outcomes.splice(index, 1)
    props.onChange(uniformProbabilities ? uniform(outcomes) : outcomes)
  }

  const handleIsUniformChanged = () => {
    setIsUniform(value => !value)
    props.onChange(!uniformProbabilities ? uniform(outcomes) : outcomes)
  }

  const setMax = () => {
    const sum = outcomes.reduce((acum, b) => acum + b.probability, 0)
    setNewOutcomeProbability(100 - sum)
  }

  const outcomesToRender = props.outcomes.map((outcome: Outcome, index: number) => (
    <OutcomesTR key={index}>
      <OutcomesTD>
        <OutcomeItemTextWrapper>
          <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={index} />
          <OutcomeItemText>{outcome.name}</OutcomeItemText>
        </OutcomeItemTextWrapper>
      </OutcomesTD>
      <OutcomesTD>
        <OutcomeItemProbability>
          <OutcomeItemProbabilityText>{outcome.probability}%</OutcomeItemProbabilityText>
          <CustomButtonCircle
            disabled={disabled}
            onClick={() => {
              removeOutcome(index)
            }}
            title={`Remove outcome ${index + 1}`}
          >
            <IconRemove />
          </CustomButtonCircle>
        </OutcomeItemProbability>
      </OutcomesTD>
    </OutcomesTR>
  ))

  const manualProbabilities = !uniformProbabilities
  const manualProbabilitiesAndThereAreOutcomes = manualProbabilities && outcomes.length > 0
  const manualProbabilitiesAndNoOutcomes = manualProbabilities && outcomes.length === 0
  const maxOutcomesReached = outcomes.length >= 6
  const outcomeValueOutofBounds = newOutcomeProbability <= outcomeMinValue || newOutcomeProbability >= outcomeMaxValue
  const disableButtonAdd = !newOutcomeName || maxOutcomesReached || (!uniformProbabilities && outcomeValueOutofBounds)

  return (
    <>
      <TitleWrapper uniformProbabilities={uniformProbabilities}>
        <FormLabel>Add Outcome</FormLabel>
        {manualProbabilities && <FormLabel>Probability</FormLabel>}
        {manualProbabilitiesAndNoOutcomes && (
          <TitleText>
            <FormRowLink onClick={handleIsUniformChanged} title="Distribute uniformly">
              set uniformly
            </FormRowLink>
          </TitleText>
        )}
        {manualProbabilitiesAndThereAreOutcomes && (
          <TitleText>
            <FormRowLink onClick={setMax}>set max</FormRowLink>
          </TitleText>
        )}
        {uniformProbabilities && (
          <TitleText>
            <FormRowLink onClick={handleIsUniformChanged}>set manual probability</FormRowLink>
          </TitleText>
        )}
      </TitleWrapper>
      <NewOutcome uniformProbabilities={uniformProbabilities}>
        <Textfield
          disabled={!canAddOutcome || maxOutcomesReached}
          onChange={e => setNewOutcomeName(e.target.value)}
          placeholder="Add new outcome"
          type="text"
          value={newOutcomeName}
        />
        {!uniformProbabilities && (
          <TextfieldCustomPlaceholder
            formField={
              <Textfield
                disabled={maxOutcomesReached}
                onChange={e => setNewOutcomeProbability(Number(e.target.value))}
                placeholder="0.00"
                type="number"
                value={newOutcomeProbability ? newOutcomeProbability : ''}
              />
            }
            symbol="%"
          />
        )}
        <CustomButtonCircleAdd
          disabled={disableButtonAdd}
          onClick={addNewOutcome}
          readyToAdd={!disableButtonAdd}
          title="Add new outcome"
        >
          <IconAdd />
        </CustomButtonCircleAdd>
      </NewOutcome>
      <OutcomesTableWrapper>
        <OutcomesTable>
          <OutcomesTHead>
            <OutcomesTR>
              <OutcomesTH style={{ width: '70%' }}>Outcome</OutcomesTH>
              <OutcomesTH>Probability</OutcomesTH>
            </OutcomesTR>
          </OutcomesTHead>
          <OutcomesTBody>{outcomesToRender}</OutcomesTBody>
        </OutcomesTable>
      </OutcomesTableWrapper>
      <Note>
        <NoteTitle>Note:</NoteTitle> There should be <strong>at least 2 outcomes</strong>. The sum of all probabilites{' '}
        <strong>must be 100%</strong>
      </Note>
    </>
  )
}

export { Outcomes }
