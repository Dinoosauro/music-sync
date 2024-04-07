interface Props {
    update: (e: any) => void,
    hint: string,
    defaultVal: string,
    type: "text" | "number"
}
/**
 * Create an input, following Bootstrap style
 * @param update the function that'll be called when there's an input to, well, the input element
 * @param hint the placeholder to put in the input when it's empty
 * @param defaultVal the default value of the input
 * @param type the type of the input (text, number etc.)
 * @returns a ReactNode of the input
 */
export default function Input({ update, hint, defaultVal, type }: Props) {
    return <div className="input-group mb-3">
        <span className="input-group-text">{hint}</span>
        <input type={type} className="form-control" defaultValue={defaultVal} onInput={(e) => { update((e.target as HTMLInputElement).value) }}></input>
    </div>
}