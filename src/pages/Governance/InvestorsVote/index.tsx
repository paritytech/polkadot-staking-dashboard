import { CardWrapper } from 'library/Graphs/Wrappers';
import { PageRowWrapper } from 'Wrappers';
import { Proposals } from './Proposals';

export const InvestorsVote = () => {
  return (
    <>
      <PageRowWrapper className="page-padding" noVerticalSpacer>
        <CardWrapper>
          <Proposals />
        </CardWrapper>
      </PageRowWrapper>
    </>
  );
};
