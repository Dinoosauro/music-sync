import { ReactNode } from "react"

interface Props {
    change: (checked: boolean) => void,
    text: ReactNode
}
/**
 * Creates a checkbox, following Bootstrap style
 * @param change the event that'll be called when the checkbox is checked/unchecked
 * @param text the description of the checkbox
 * @returns a ReactNode with the checkbox
 */
export default function Checkbox({ change, text }: Props) {
    return <div className="form-check">
        <input className="form-check-input" type="checkbox" onChange={(e) => change((e.target as HTMLInputElement).checked)}></input><label className="form-check-label">{text}</label>
    </div>

}