import { useEffect, useReducer, useRef, useState } from "react";
import Header from "./Components/Header";
import Button from "./Components/Button";
import AudioInterface from "./Components/AudioInterface";
import Card from "./Components/Card";
import SaveFile from "./Scripts/SaveFile";
import Checkbox from "./Components/Checkbox";
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
    jsmediatags: any
  }
}
export default function App() {
  let [state, updateState] = useState<State>({
    action: 0
  });
  useEffect(() => {
    localStorage.getItem("MusicSync-Theme") === "a" && document.body.setAttribute("data-bs-theme", "light");
  }, [])
  let ref = useRef<HTMLTextAreaElement>(null);
  return <>
    <Header></Header><br></br>
    {state.action === 0 ? <>
      <h2>Choose an audio file:</h2>
      <Button click={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "audio/*";
        input.onchange = async () => {
          if (input.files) {
            const buffer = await input.files[0].arrayBuffer();
            if (metadata.checked) {
              window.jsmediatags.read(input.files[0], {
                onSuccess: (tag: any) => {
                  updateState((prevState) => { return { ...prevState, metadata: tag } });
                  console.log(tag);
                }
              });
            }
            const type = input.files[0].type;
            const name = input.files[0].name;
            updateState((prevState) => { return { ...prevState, blobUrl: URL.createObjectURL(new Blob([buffer], { type: type })), action: 1, name: name } });
          }
        }
        input.click();
      }}>Choose audio</Button><br></br><br></br>
      <Checkbox text={<span>Try reading metadata using the <a href="https://github.com/aadsm/jsmediatags">jsmediatags</a> library</span>} change={(e) => {
        metadata.checked = e;
        if (metadata.checked && !metadata.loaded) {
          let script = document.createElement("script");
          script.onload = () => metadata.loaded = true;
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
          document.body.append(script);
        }
      }}></Checkbox>
    </> : state.action === 1 ? <>
      <h2>Write the lyrics:</h2><br></br>
      <AudioInterface audioUrl={state.blobUrl ?? ""}></AudioInterface><br></br><br></br>
      <Card header="Lyrics">
        <Button click={() => {
          let input = document.createElement("input");
          input.type = "file";
          input.onchange = async () => {
            if (input.files) {
              const text = await input.files[0].text();
              updateState(prevState => { return { ...prevState, lrcItem: text } });
            }
          }
          input.click();
        }}>Import from LRC file</Button><span style={{ marginLeft: "10px" }}></span><Button click={() => {
          let input = document.createElement("input");
          input.type = "file";
          input.onchange = async () => {
            if (input.files && ref.current) ref.current.value = await input.files[0].text();
          }
          input.click();
        }}>Import from text file</Button>
        <br></br><br></br>
        <textarea ref={ref} defaultValue={(() => {
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
        <Button type="secondary" click={() => {
          const format = state.metadata.tags.picture.format.substring(state.metadata.tags.picture.format.lastIndexOf("/") + 1);
          SaveFile({ suggestedName: `${state.name?.substring(0, state.name?.lastIndexOf("."))}.${format}`, isImage: 1, types: [{ description: "The image of the audio file passed", accept: { [state.metadata.tags.picture.format]: [format] } }], content: new Blob([new Uint8Array(state.metadata.tags.picture.data).buffer]) })
        }}>Download album art</Button>
        <span style={{ marginLeft: "10px" }}></span>
        <Button type="secondary" click={() => {
          SaveFile({ suggestedName: `${state.name?.substring(0, state.name?.lastIndexOf("."))}-Metadata.json`, isImage: 2, types: [{ description: "The JSON file containing all the metadata fetched by jsmediatags", accept: { "application/json": [".json"] } }], content: new Blob([JSON.stringify(state.metadata)]) })

        }}>Download all of the fetched metadata</Button>
      </>}
    </> : <>
      <AudioInterface lrcSource={state.lrcItem} name={state.name?.substring(0, state.name?.lastIndexOf("."))} audioUrl={state.blobUrl ?? ""} lyrics={state.lyrics?.split("\n")}></AudioInterface>
    </>
    }
    <br></br><br></br><br></br>
    <Button type="secondary" click={() => {
      localStorage.setItem("MusicSync-Theme", localStorage.getItem("MusicSync-Theme") === "a" ? "b" : "a");
      document.body.setAttribute("data-bs-theme", localStorage.getItem("MusicSync-Theme") === "a" ? "light" : "dark");
    }}>Change theme</Button><span style={{ marginLeft: "10px" }}></span><Button click={() => window.open("https://github.com/dinoosauro/music-sync", "_blank")}>View on GitHub</Button><br></br><br></br>
    <i>Powered by <a href="https://github.com/facebook/react?tab=MIT-1-ov-file#readme" target="_blank">React</a> and <a href="https://github.com/twbs/bootstrap?tab=MIT-1-ov-file#readme" target="_blank">Bootstrap</a> / <a href="https://icons.getbootstrap.com/icons/music-note-list/">Bootstrap Icons (for the logo)</a></i>
  </>
}