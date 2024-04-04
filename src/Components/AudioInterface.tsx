import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import Dropdown from "./Dropdown";
import SaveFile from "../Scripts/SaveFile";
import Checkbox from "./Checkbox";
interface Props {
    audioUrl: string,
    lyrics?: string[],
    name?: string,
    lrcSource?: string
}
interface LyricsStorage {
    start: number,
    verse: string
}
export default function AudioInterface({ audioUrl, lyrics, name, lrcSource }: Props) {
    let ref = useRef<HTMLAudioElement>(null);
    let finalLyrics: LyricsStorage[] = (lyrics ?? []).map(str => { return { start: 0, verse: str } });
    let openInput: HTMLInputElement | undefined;
    let inputMap = new Map<HTMLInputElement | null, number>();
    let divRef = useRef<HTMLDivElement>(null);
    let disableAutoScrolling = false;
    useEffect(() => {
        if (lyrics) {
            let newInput = Array.from(inputMap)[0][0] as HTMLInputElement | undefined;
            newInput && changeInput(newInput);
            ref.current && ref.current.addEventListener("timeupdate", () => {
                if (disableAutoScrolling) return;
                const minorItems = finalLyrics.map((e, i) => { return { ...e, index: i } }).filter(lyric => lyric.start !== 0 && lyric.start < (ref.current?.currentTime ?? 0));
                if (!minorItems[minorItems.length - 1]) return;
                const selectedItem = Array.from(inputMap)[minorItems[minorItems.length - 1].index][0];
                selectedItem && selectedItem !== openInput && changeInput(selectedItem);
            })
        }
        if (lrcSource) {
            const mapSource = lrcSource.split("\n").map(position => position.substring(1, position.indexOf("]")).split(/[:.]+/));
            const availableInputs = Array.from(inputMap);
            for (let i = 0; i < availableInputs.length; i++) {
                if (availableInputs[i][0] && mapSource[availableInputs[i][1]] && finalLyrics[i]) {
                    const getValue = (+mapSource[availableInputs[i][1]][0] * 60) + (+mapSource[availableInputs[i][1]][1]) + (+mapSource[availableInputs[i][1]][2] / 100);
                    finalLyrics[i].start = getValue;
                    if (availableInputs[i][0]) (availableInputs[i][0] as HTMLInputElement).value = getValue.toString();
                    inputMap.set(availableInputs[i][0], i);
                }
            }
        };
    }, [])
    function changeInput(input: HTMLInputElement) {
        if (openInput) openInput.style.backgroundColor = "";
        openInput = input;
        openInput.style.backgroundColor = "var(--bs-warning-border-subtle)";
        divRef.current && divRef.current.scrollTo({ top: (divRef.current.scrollHeight * (inputMap.get(input) ?? 0) / Math.max(inputMap.size, 1)), behavior: "smooth" });
        openInput.focus();
    }
    return <><Card header="Audio controls">
        <audio controls ref={ref} src={audioUrl} autoPlay={true} style={{ width: "100%", borderRadius: "8px" }}></audio><br></br><br></br>
        <div className="btn-group" role="group">
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4].map(speed => <Button type="secondary" click={() => {
                if (ref.current) ref.current.playbackRate = speed;
            }} key={`MusicSync-PlaybackRate-${speed}`}>{speed}</Button>)}
            <input type="number" className="form-control" step={0.25} onInput={(e) => {
                if (ref.current) ref.current.playbackRate = +(e.target as HTMLInputElement).value;
            }}></input>
        </div>
    </Card>
        {lyrics && <><br></br><br></br>
            <Card header="Sync lyrics:">
                <Button click={() => {
                    if (openInput && ref.current) {
                        const position = (inputMap.get(openInput) ?? 0) + 1;
                        let nextInput = Array.from(inputMap).find(([el, id]) => id === position);
                        console.log(nextInput)
                        if (nextInput && nextInput[0]) {
                            nextInput[0].value = (ref.current.currentTime).toString();
                            if (finalLyrics[position]) finalLyrics[position].start = ref.current.currentTime;
                            let openParent = openInput.parentElement?.parentElement as HTMLDivElement;
                            openParent = openParent.nextElementSibling as HTMLDivElement;
                            if (openParent) changeInput(openParent.querySelector("input[type=number]") as HTMLInputElement);
                        }
                    }
                }}>This line ends here</Button>
                <span style={{ marginLeft: "10px" }}></span>
                <Button type="info" click={() => {
                    if (openInput && ref.current) {
                        const position = inputMap.get(openInput);
                        openInput.value = (ref.current.currentTime).toString();
                        if (position !== undefined && finalLyrics[position]) finalLyrics[position].start = ref.current.currentTime; // Explicit !== undefined since otherwise 0 would return false, and therefore the first input wouldn't be updated.
                        let openParent = openInput.parentElement?.parentElement as HTMLDivElement;
                        openParent = openParent.nextElementSibling as HTMLDivElement;
                        if (openParent) changeInput(openParent.querySelector("input[type=number]") as HTMLInputElement);
                    }
                }}>This line starts here</Button>
                <span style={{ marginLeft: "10px" }}></span>
                <Dropdown title="Export">
                    <li><a className="dropdown-item" onClick={() => {
                        const outputStr = finalLyrics.map(({ start, verse }) => {
                            const date = new Date(Math.floor(start * 1000));
                            const fixDateParts = (str: string) => str.length === 1 ? `0${str}` : str;
                            let ms = start.toFixed(2);
                            ms = ms.substring(ms.indexOf(".") + 1);
                            return `[${fixDateParts(Math.floor((date.valueOf() - new Date(0).valueOf()) / (1000 * 60)).toString())}:${fixDateParts(date.getUTCSeconds().toString())}.${ms}]${verse}`
                        }).join("\n");
                        SaveFile({ suggestedName: `${name}.lrc`, types: [{ description: "The output LRC file", accept: { "text/plain": [".lrc", ".txt"] } }], content: new Blob([outputStr]) });
                    }}>Export as a LRC</a></li>
                    <li><a className="dropdown-item" onClick={() => {
                        const outputStr = finalLyrics.map(({ start, verse }) => `[${start}]${verse}`).join("\n");
                        SaveFile({ suggestedName: `${name}-Synced.txt`, types: [{ description: "The output TXT file", accept: { "text/plain": [".txt"] } }], content: new Blob([outputStr]) });
                    }}>Download with seconds</a></li>
                    <li><a className="dropdown-item" onClick={() => {
                        SaveFile({ suggestedName: `${name}-Synced.json`, types: [{ description: "The output JSON file", accept: { "application/json": [".json"] } }], content: new Blob([JSON.stringify(finalLyrics)]) });
                    }}>Download JSON file</a></li>
                    <li><a className="dropdown-item" onClick={() => {
                        const outputStr = finalLyrics.map(({ verse }) => verse).join("\n");
                        SaveFile({ suggestedName: `${name}-Lyrics.txt`, types: [{ description: "The output TXT file, with only the lyrics", accept: { "text/plain": [".txt"] } }], content: new Blob([outputStr]) });
                    }}>Download only lyrics</a></li>
                    <li><a className="dropdown-item" onClick={() => {
                        const outputStr = finalLyrics.map(({ start }) => start).join("\n");
                        SaveFile({ suggestedName: `${name}-VersePosition.txt`, types: [{ description: "The output TXT file, with only the position of the verses", accept: { "text/plain": [".txt"] } }], content: new Blob([outputStr]) });
                    }}>Download only verse position</a></li>
                </Dropdown>
                <Checkbox text={<span>Disable auto scrolling</span>} change={(checked) => disableAutoScrolling = checked}></Checkbox>
                <br></br><br></br>
                <div style={{ height: "40vh", overflow: "auto" }} ref={divRef}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Start</th>
                                <th scope="col">Lyrics</th>
                            </tr>
                            {lyrics.map((verse, position) => <tr key={`MusicSync-Audio-${position}`}>
                                <td><input step={0.03} ref={el => (inputMap.set(el, position))} onClick={(e) => {
                                    if (ref.current) ref.current.currentTime = +(e.target as HTMLInputElement).value;
                                    changeInput(e.target as HTMLInputElement)
                                }} className="form-control" onChange={(e) => {
                                    if (!finalLyrics[position]) finalLyrics[position] = { start: 0, verse: "" };
                                    finalLyrics[position].start = +(e.target as HTMLInputElement).value;
                                    if (ref.current) ref.current.currentTime = +(e.target as HTMLInputElement).value;
                                }} type="number" defaultValue={finalLyrics[position]?.start ?? 0}></input></td>
                                <td><input onClick={() => {
                                    const findItem = Array.from(inputMap).find(([input, num]) => num === position);
                                    if (findItem !== undefined && (findItem[1] as unknown ?? "") !== "") {
                                        changeInput(findItem[0] as HTMLInputElement)
                                        if (ref.current) ref.current.currentTime = +(findItem[0] as HTMLInputElement).value;
                                    }
                                }
                                } className="form-control" onChange={(e) => {
                                    if (!finalLyrics[position]) finalLyrics[position] = { start: 0, verse: "" };
                                    finalLyrics[position].verse = (e.target as HTMLInputElement).value
                                }} type="text" defaultValue={finalLyrics[position]?.verse ?? verse}></input></td>
                            </tr>)}
                        </thead>
                    </table>
                </div>
            </Card>
        </>
        }</>
}