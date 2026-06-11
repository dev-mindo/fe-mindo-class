declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_URL: string
            API_URL: string
            API_URL_PRODUCT: string
            NEXT_PUBLIC_SOCKET_URL: string
            NEXT_PUBLIC_MINDO_MY_CLASS: string
            USER_API_KEY?: string
        }
    }
}

export { }
