import styled from "styled-components"
import tw from "twin.macro"

export const SpinnerIcon: React.FC = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      className="-ml-1 mr-3 size-5 animate-spin"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </Svg>
  )
}

const Svg = styled.svg`
  ${tw`text-contrast`}
`
