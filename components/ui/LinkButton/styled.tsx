import styled from "styled-components"
import tw from "twin.macro"

import type LinkButtonProps from "./props"

export const Button = styled.a<LinkButtonProps>`
  ${tw`block w-full py-2 text-center mb-4 bg-gray-200 rounded text-ss font-bold cursor-pointer text-gray-700 md:(text-primary inline w-auto border-b border-gray-200 p-0 bg-transparent m-0)`}
`
