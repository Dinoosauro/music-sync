interface Props {
    url: string,
    name: string,
    closeCallback: () => void
}
/**
 * Create an alert with the download link to the resource
 * @param url the URL to download
 * @param name the suggested name
 * @param closeCallback the function that'll be called for closing the alert
 * @returns a ReactNode of the alert with the download link
 */
export default function DownloadLink({ url, name, closeCallback }: Props) {
    return <div className="alert alert-primary" role="alert" style={{ position: "absolute", zIndex: "2", top: "4vh", left: "15vw", width: "70vw" }}>
        <label>Download started!</label>
        <a href={url} download={name} style={{ marginLeft: "10px" }}>Force download</a>
        <label style={{ textDecoration: "underline", cursor: "pointer", marginLeft: "10px" }} onClick={closeCallback}>Close alert</label>
    </div>
}