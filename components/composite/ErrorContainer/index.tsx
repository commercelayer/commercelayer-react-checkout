import { Base } from "components/ui/Base"
import { Container } from "components/ui/Container"
import { Footer } from "components/ui/Footer"

import { FullLogo, LogoWrapper, Main, StyledError, Wrapper } from "./styled"

export const ErrorContainer = ({ children }: { children: ChildrenType }) => {
  return (
    <Base>
      <Container>
        <Wrapper>
          <LogoWrapper>
            <FullLogo className="self-center text-black md:pl-4 md:self-auto" />
          </LogoWrapper>
          <Main>
            <StyledError>{children}</StyledError>
          </Main>
          <Footer />
        </Wrapper>
      </Container>
    </Base>
  )
}
