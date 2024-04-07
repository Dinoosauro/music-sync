import { useEffect, useReducer, useRef, useState } from "react";
import Header from "./Components/Header";
import Button from "./Components/Button";
import AudioInterface from "./Components/AudioInterface";
import Card from "./Components/Card";
import SaveFile from "./Scripts/SaveFile";
import Checkbox from "./Components/Checkbox";
import OpenFile from "./Scripts/OpenFile";
interface State {
  action: number,
  blobUrl?: string,
  lyrics?: string,
  name?: string,
  metadata?: any,
  lrcItem?: string
}
let metadata = {
  checked: false,
  loaded: false
}
declare global {
  interface SaveFilePicker {
    id?: string,
    suggestedName?: string,
    types?: {
      description: string,
      accept: {}
    }[]
  }
  interface Window {
    showSaveFilePicker: ({ id, suggestedName, types }: SaveFilePicker) => Promise<FileSystemFileHandle>,
    showOpenFilePicker: ({ id, types }: SaveFilePicker) => Promise<FileSystemFileHandle[]>,
    jsmediatags: any
  }
}
export default function App() {
  let [state, updateState] = useState<State>({
    action: 0
  });
  useEffect(() => {
    localStorage.getItem("MusicSync-Theme") === "a" && document.body.setAttribute("data-bs-theme", "light"); // Update the theme if the user has bad preferences
  }, [])
  let ref = useRef<HTMLTextAreaElement>(null);
  return <>
    <Header></Header><br></br>
    {state.action === 0 ? <>
      <h2>Choose an audio file:</h2>
      <Button click={async () => {
        const file = await OpenFile({ id: "MusicSync-OpenAudio", types: [{ description: "An audio file", accept: { "audio/*": [".mp3", ".m4a", ".ogg", ".flac", ".alac", ".opus", ".mp4", ".aac", ".amr"] } }] })
        const buffer = await file.arrayBuffer();
        if (metadata.checked) { // Read metadata using the jsmediatags library
          window.jsmediatags.read(file, {
            onSuccess: (tag: any) => {
              updateState((prevState) => { return { ...prevState, metadata: tag } });
            }
          });
        }
        const type = file.type;
        const name = file.name;
        updateState((prevState) => { return { ...prevState, blobUrl: URL.createObjectURL(new Blob([buffer], { type: type })), action: 1, name: name } });
      }}>Choose audio</Button><br></br><br></br>
      <Checkbox text={<span>Try reading metadata using the <a href="https://github.com/aadsm/jsmediatags">jsmediatags</a> library</span>} change={(e) => {
        metadata.checked = e;
        if (metadata.checked && !metadata.loaded) { // Load the jsmediatags script only if requested by the user
          let script = document.createElement("script");
          script.onload = () => metadata.loaded = true;
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
          document.body.append(script);
        }
      }}></Checkbox><br></br>
      <Checkbox text="Avoid using the File System API (if available) for FS operations" change={(val) => localStorage.setItem("MusicSync-FileSystemAPI", val ? "a" : "b")}></Checkbox>
    </> : state.action === 1 ? <>
      <h2>Write the lyrics:</h2><br></br>
      <AudioInterface audioUrl={state.blobUrl ?? ""}></AudioInterface><br></br><br></br>
      <Card header="Lyrics">
        <Button click={async () => { // Load a LRC file. Both the lyrics and the verse positions will be fetched from the LRC file
          const file = await OpenFile({ id: "MusicSync-OpenLRC" })
          const text = await file.text();
          updateState(prevState => { return { ...prevState, lrcItem: text } });
        }}>Import from LRC file</Button><span style={{ marginLeft: "10px" }}></span><Button type="info" click={async () => {
          // Import from a simple text file. Basically it's updated the value of the textarea
          const file = await OpenFile({ id: "MusicSync-OpenLRC" })
          if (ref.current) ref.current.value = await file.text();
        }}>Import from text file</Button>
        <br></br><br></br>
        <textarea ref={ref} defaultValue={(() => { // First attempt: get lyrics from the LRC file. Otherwise, look for lyrics fetched with jsmediatags
          if (!state.lrcItem) return;
          return state.lrcItem.split("\n").map(item => item.substring(item.indexOf("]") + 1)).join("\n");
        })() ?? state.metadata?.tags?.lyrics?.lyrics ?? state.metadata?.tags?.lyrics} className="form-control" style={{ width: "100%", height: "30vh", resize: "none" }}></textarea><br></br>
        <i>If you want to keep only the lyrics, you'll be able to download only them as a TXT file in the next step</i>
      </Card><br></br>
      <Button click={() => {
        updateState(prevState => { return { ...prevState, action: 2, lyrics: (ref.current as HTMLTextAreaElement).value } })
      }}>Sync lyrics</Button>
      {state.metadata?.tags?.picture && <>
        <span style={{ marginLeft: "10px" }}></span>
        <Button type="secondary" click={() => { // Download the album image using jsmediatags for fetching it
          const format = state.metadata.tags.picture.format.substring(state.metadata.tags.picture.format.lastIndexOf("/") + 1); // The output file extension
          SaveFile({ suggestedName: `${state.name?.substring(0, state.name?.lastIndexOf("."))}.${format}`, isImage: 1, types: [{ description: "The image of the audio file passed", accept: { [state.metadata.tags.picture.format]: [`.${format}`] } }], content: new Blob([new Uint8Array(state.metadata.tags.picture.data).buffer]) })
        }}>Download album art</Button>
        <span style={{ marginLeft: "10px" }}></span>
      </>}
      {state.metadata && <Button type="secondary" click={() => { // Download everything fetched from jsmediatags as a JSON file. This also includes an ArrayBuffer of the album art, if available.
        SaveFile({ suggestedName: `${state.name?.substring(0, state.name?.lastIndexOf("."))}-Metadata.json`, isImage: 2, types: [{ description: "The JSON file containing all the metadata fetched by jsmediatags", accept: { "application/json": [".json"] } }], content: new Blob([JSON.stringify(state.metadata)]) })

      }}>Download all of the fetched metadata</Button>}
    </> : <>
      <AudioInterface lrcSource={state.lrcItem} name={state.name?.substring(0, state.name?.lastIndexOf("."))} audioUrl={state.blobUrl ?? ""} lyrics={state.lyrics?.split("\n")}></AudioInterface>
    </>
    }
    <br></br><br></br><br></br>
    <Button type="secondary" click={() => { // Change Bootstrap theme
      localStorage.setItem("MusicSync-Theme", localStorage.getItem("MusicSync-Theme") === "a" ? "b" : "a");
      document.body.setAttribute("data-bs-theme", localStorage.getItem("MusicSync-Theme") === "a" ? "light" : "dark");
    }}>Change theme</Button><span style={{ marginLeft: "10px" }}></span><Button click={() => window.open("https://github.com/dinoosauro/music-sync", "_blank")}>View on GitHub</Button><br></br><br></br>
    <i>Powered by <a href="https://github.com/facebook/react?tab=MIT-1-ov-file#readme" target="_blank">React</a> and <a href="https://github.com/twbs/bootstrap?tab=MIT-1-ov-file#readme" target="_blank">Bootstrap</a> / <a href="https://icons.getbootstrap.com/icons/music-note-list/">Bootstrap Icons (for the logo)</a></i>
  </>
}