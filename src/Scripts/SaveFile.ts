import { createRoot } from "react-dom/client";
import DownloadLink from "../Components/DownloadLink";

interface Props extends SaveFilePicker {
    content: Blob,
    isImage?: number
}
export default async function SaveFile({ suggestedName, types, content, isImage }: Props) {
    try {
        let picker = await window.showSaveFilePicker({ id: `MusicSync-Export${isImage === 1 ? "Image" : isImage === 2 ? "Metadata" : "Lyrics"}`, suggestedName: suggestedName, types: types });
        let write = await picker.createWritable();
        await write.write(content);
        await write.close();
        return false;
    } catch (ex) {
        console.warn("Failed to use Chromium's SaveDirectoryPicker. Defaulting to classic link download");
        let div = document.createElement("div");
        createRoot(div).render(DownloadLink({ url: URL.createObjectURL(content), name: suggestedName ?? "MusicSync.lrc", closeCallback: () => div.remove() }));
        document.body.append(div);
        setTimeout(() => div.querySelector("a")?.click(), 100);
    }
}