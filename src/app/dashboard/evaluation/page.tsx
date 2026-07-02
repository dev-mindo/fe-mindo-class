import { EvaluationList } from "./_component/EvaluationList"
import { DashboardPageTitle } from "../_component/page-title"

const Page = () => {
    return (
        <>
            <DashboardPageTitle title="Evaluasi" />
            <EvaluationList />
        </>
    )
}

export default Page;
