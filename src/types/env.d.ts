declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_URL: string
            API_URL: string           
            NEXT_PUBLIC_SOCKET_URL: string
        }
    }
}

export { }