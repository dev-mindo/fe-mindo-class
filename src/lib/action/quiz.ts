"use server";

import { ApiResponse, fetchApi } from "../utils/fetchApi";

export const getQuiz = async (slug: string, type: string) => {
  try {
    const quiz: ApiResponse = await fetchApi(`/quiz/${slug}/event/${type}`);
    console.log(quiz);
    return quiz;
  } catch (error) {
    console.log(error);
  }
};

export const attemptQuiz = async (id: number) => {
  try {
    const attempt = await fetchApi(`/attempt-quiz/${id}`, {
      method: "POST",
    });
    return attempt;
  } catch (error) {
    console.log(error);
  }
};
