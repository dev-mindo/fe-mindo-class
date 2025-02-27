import { NavQuiz } from "./_component/navQuiz";
import { Question } from "./_component/question";

export default async function Page() {
  return (
    <NavQuiz
      completed={5}
      time="2025-02-27 11:01:50"
      title=""
      totalQuestion={10}
    >
      <Question/>
      <NavQuiz/>
  )
}
