import { ReactNode } from "react"

interface Props {
    title: string,
    children: ReactNode
}
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