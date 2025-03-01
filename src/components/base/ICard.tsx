type CardProps = {    
    className?: string
    children: React.ReactNode
}

const ICard: React.FC<CardProps> = ({className, children}) => {
    return (
        <div className={`${className} p-4 bg-card rounded-lg`}>
            {children}
        </div>
    )
}

export default ICard