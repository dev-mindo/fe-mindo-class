import { DiscussionList } from "./_component/DiscussionList";
import { DashboardPageTitle } from "../_component/page-title";

const Page = () => {
  return (
    <>
      <DashboardPageTitle title="Diskusi" />
      <DiscussionList />
    </>
  );
};

export default Page;
