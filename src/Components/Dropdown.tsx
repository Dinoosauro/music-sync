import { ReactNode } from "react"

interface Props {
    title: string,
    children: ReactNode
}
/**
 * A dropdown button, that reveals more items when clicked
 * @param children the items to the dropdown
 * @param title the content displayed inside the dropdown button
 * @returns the dropdown button
 */
export default function Dropdown({ children, title }: Props) {
    return <span className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {title}
        </button>
        <ul className="dropdown-menu">
            {children}
        </ul>
    </span>
}