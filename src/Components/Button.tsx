import { ReactNode } from "react";

interface Props {
    type?: "primary" | "secondary" | "success" | "danger" | "warning" | "info",
    children?: ReactNode,
    click?: (e: any) => void,
    isSmall?: boolean
}
/**
 * Creates a Button, following Bootstrap style
 * @param type the color of the button, depending on its function (primary, secondary etc.)
 * @param children the content inside the button
 * @param click the event that'll be fired when clicked
 * @param isSmall use "fit-content" instead of "100%" for the width
 * @returns the Button ReactNode
 */
export default function Button({ type = "primary", children, click, isSmall }: Props) {
    return <button style={{ width: isSmall ? "100%" : "fit-content" }} onClick={(e) => { click && click(e) }} className={`btn btn-${type}`}>{children}</button>
}