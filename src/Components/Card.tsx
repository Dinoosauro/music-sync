import { ReactNode } from "react"

interface Props {
    header: string,
    children?: ReactNode,
    cardId?: string
}
export default function card({ header = "", children, cardId }: Props) {
    return <>
        <div className="card" style={{ transition: "opacity 0.25s ease-in-out" }} data-cardid={cardId}>
            <div className="card-header">
                {header}
            </div>
            <div className="card-body">
                {children}
            </div>
        </div>
    </>
}
