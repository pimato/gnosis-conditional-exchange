import React, { InputHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: any
  hasError?: boolean
  hasSuccess?: boolean
  focusOutline?: boolean
}

export const TextfieldCSS = css<{ hasError?: boolean; hasSuccess?: boolean }>`
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => props.theme.textfield.borderColor};
  border-style: ${props => props.theme.textfield.borderStyle};
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  color: ${props =>
    (props.hasError && props.theme.colors.error) ||
    (props.hasSuccess && props.theme.textfield.color) ||
    props.theme.textfield.color};
  font-size: ${props => props.theme.textfield.fontSize};
  font-weight: ${props => props.theme.textfield.fontWeight};
  line-height: 1.2;
  height: ${props => props.theme.textfield.height};
  outline: ${props => props.theme.textfield.outline};
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  transition: border-color 0.15s ease-in-out;
  width: 100%;

  &:active,
  &:focus {
    border-color: ${props => props.theme.textfield.borderColorActive};
  }

  &::placeholder {
    color: ${props => props.theme.textfield.placeholderColor};
    font-size: ${props => props.theme.textfield.placeholderFontSize};
    font-size: ${props => props.theme.textfield.placeholderFontWeight};
  }

  &:read-only,
  [readonly] {
    cursor: not-allowed;
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`

const FormInput = styled.input<{ hasError?: boolean; hasSuccess?: boolean }>`
  ${TextfieldCSS}
`

export const Textfield = (props: Props) => {
  return <FormInput {...props} />
}
