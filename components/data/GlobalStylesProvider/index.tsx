import type React from "react"
import { createGlobalStyle } from "styled-components"
import { GlobalStyles as BaseStyles } from "twin.macro"

interface GlobalStyleProps {
  primaryColor: NullableType<HSLProps>
}

const CustomStyles = createGlobalStyle<GlobalStyleProps>`
  :root {
    --primary-h: ${({ primaryColor }) => primaryColor?.h};
    --primary-s: ${({ primaryColor }) => primaryColor?.s};
    --primary-l: ${({ primaryColor }) => primaryColor?.l};
    --primary: hsl(var(--primary-h), var(--primary-s), var(--primary-l));
    --primary-light: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.4);
    --primary-dark: hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) * 0.5));
    --contrast-threshold: 75%;
    --switch: calc((var(--primary-l) - var(--contrast-threshold)) * -10000);
    --contrast: hsl(0, 0%, var(--switch));
  }
`

const GlobalStylesProvider: React.FC<GlobalStyleProps> = ({ primaryColor }) => (
  <>
    <BaseStyles />
    <CustomStyles primaryColor={primaryColor} />
  </>
)

export default GlobalStylesProvider
