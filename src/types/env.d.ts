declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_URL: string
            API_URL: string            
        }
    }
}

export { }