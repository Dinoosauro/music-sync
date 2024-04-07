/**
 * The header, with the website icon and the website name.
 * @returns the ReactNode of the header
 */
export default function Header() {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "15px" }}>
        <img width={36} height={36} style={{ marginRight: "10px" }} src="./icon.svg"></img>
        <h1 style={{ margin: "0px" }}>MusicSync</h1>
    </div>
}