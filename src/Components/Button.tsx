import { ReactNode } from "react";

interface Props {
    type?: "primary" | "secondary" | "success" | "danger" | "warning" | "info",
    children?: ReactNode,
    click?: (e: any) => void,
    isSmall?: boolean
}
export default function Button({ type = "primary", children, click, isSmall }: Props) {
    return <button style={{ width: isSmall ? "100%" : "fit-content" }} onClick={(e) => { click && click(e) }} className={`btn btn-${type}`}>{children}</button>
}