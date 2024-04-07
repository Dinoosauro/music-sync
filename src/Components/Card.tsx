import { ReactNode } from "react"

interface Props {
    header: string,
    children?: ReactNode,
    cardId?: string
}
/**
 * Creates a Card item, following Bootstrap style
 * @param header the name at the top of the card
 * @param children the content of the card
 * @param cardId an optional string to identify the card (with data-cardid)
 * @returns the ReactNode of the card
 */
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
