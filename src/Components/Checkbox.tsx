import { ReactNode } from "react"

interface Props {
    change: (checked: boolean) => void,
    text: ReactNode
}
export default function Checkbox({ change, text }: Props) {
    return <div className="form-check">
        <input className="form-check-input" type="checkbox" onChange={(e) => change((e.target as HTMLInputElement).checked)}></input><label className="form-check-label">{text}</label>
    </div>

}