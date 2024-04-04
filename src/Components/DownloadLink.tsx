interface Props {
    url: string,
    name: string,
    closeCallback: () => void
}
export default function DownloadLink({ url, name, closeCallback }: Props) {
    return <div className="alert alert-primary" role="alert" style={{ position: "absolute", zIndex: "2", top: "4vh", left: "15vw", width: "70vw" }}>
        <label>Download started!</label>
        <a href={url} download={name} style={{ marginLeft: "10px" }}>Force download</a>
        <label style={{ textDecoration: "underline", cursor: "pointer", marginLeft: "10px" }} onClick={closeCallback}>Close alert</label>
    </div>
}