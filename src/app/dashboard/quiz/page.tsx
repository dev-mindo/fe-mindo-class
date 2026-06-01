import { ListQuiz } from "./_component/ListQuiz"
import { DashboardPageTitle } from "../_component/page-title"

const Page = () => {
    return (
        <div>
            <DashboardPageTitle title="Kuis" />
            <ListQuiz/>
        </div>
    )
}

export default Page
