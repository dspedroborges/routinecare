"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react';
import { BsCaretDown, BsCaretUp, BsCheckCircle, BsCircle, BsClipboard2, BsClipboard2Check, BsHouse, BsPencil, BsPlusCircleDotted, BsTrash, BsTrashFill } from 'react-icons/bs';
import Link from 'next/link';

type Task = { frequency: string, chosenFrequency: string, task: string, done: boolean };

function weekDayToNumber(weekDay: string) {
    if (weekDay == "all") return -1;
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const number = days.indexOf(weekDay.toLowerCase());
    return number;
}

function numberToWeekDay(number: number) {
    if (number == -1) return "all";
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days[number];
}

export default function Page() {
    return (
        <Suspense>
            <Content />
        </Suspense>
    )
}

function Content() {
    const searchParams = useSearchParams();
    let tasks = searchParams.get("tasks");
    const [currentTasks, setCurrentTasks] = useState<Task[]>();
    const [addedClipboard, setAddedClipboard] = useState(false);
    const [showCreateUpdate, setShowCreateUpdate] = useState(false);
    const [indexUpdate, setIndexUpdate] = useState(-1);
    const [showDelete, setShowDelete] = useState(false);
    const addToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
    }
    const router = useRouter();

    useEffect(() => {
        if (tasks) {
            const all = tasks.split(">>");
            const allInObject = all.map(a => {
                const [frequency, chosenFrequency, task, done] = a.split(";");
                return { frequency: frequency, chosenFrequency, task, done: done == "true" };
            });
            setCurrentTasks(allInObject);
        }
    }, []);


    const getArrToObjUrl = () => {
        if (!currentTasks) return "";
        const arrObjToUrl = currentTasks?.map(ct => {
            let allElements: any = [];
            for (const key of Object.keys(ct) as (keyof Task)[]) {
                allElements.push(ct[key])
            }
            return allElements.join(";")
        })

        return arrObjToUrl?.join(">>");
    }

    useEffect(() => {
        if (currentTasks) router.push(`?tasks=${getArrToObjUrl()}`);
    }, [currentTasks]);

    return (
        <main className="p-8">
            <h1 className="text-white text-4xl text-center my-4">Routine Care</h1>
            <div className="flex items-center justify-center gap-4">
                <BsPlusCircleDotted onClick={() => {
                    setIndexUpdate(-1);
                    setShowCreateUpdate(true);
                }} className="text-4xl text-white mb-8 hover:scale-90 cursor-pointer" />
                <Link href={`/?tasks=${getArrToObjUrl()}`}>
                    <BsHouse className="text-4xl text-white mb-8 hover:scale-90 cursor-pointer" />
                </Link>
            </div>            {
                currentTasks?.map((ct, i) => {
                    return <div
                        key={i}
                        className="bg-gray-800 text-white p-2 rounded-xl mb-2 cursor-pointer hover:brightness-125 relative group"
                    >
                        {ct.task}
                        <span className="bg-black px-2 py-1 mx-1 text-xs rounded-xl">{ct.frequency === "weekly" ? ct.chosenFrequency?.split(",").map(d => numberToWeekDay(Number(d))).join(", ") : ct.chosenFrequency}</span>
                        <span className="bg-black px-2 py-1 mx-1 text-xs rounded-xl">{ct.frequency}</span>

                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 gap-2 hidden group-hover:flex">
                            {
                                showDelete ? (
                                    <BsTrashFill onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentTasks(currentTasks.toSpliced(i, 1));
                                        setShowDelete(false);
                                    }} className="hover:scale-110 text-red-300" />
                                ) : (
                                    <BsTrash onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDelete(true);
                                        setTimeout(() => {
                                            setShowDelete(false);
                                        }, 3000);
                                    }} className="hover:scale-110" />
                                )
                            }
                            <BsPencil onClick={(e) => {
                                e.stopPropagation();
                                setIndexUpdate(i);
                                setShowCreateUpdate(true);
                            }} className="hover:scale-110" />

                            <BsCaretUp onClick={() => {
                                const copy = JSON.parse(JSON.stringify(currentTasks));
                                if (i > 0) {
                                    let tmp = copy[i - 1];
                                    copy[i - 1] = copy[i];
                                    copy[i] = tmp;
                                } else {
                                    let tmp = copy[copy.length - 1];
                                    copy[copy.length - 1] = copy[i];
                                    copy[i] = tmp;
                                }
                                setCurrentTasks(copy);
                            }} className="hover:scale-110" />
                            <BsCaretDown onClick={() => {
                                const copy = JSON.parse(JSON.stringify(currentTasks));
                                if (i < currentTasks.length - 1) {
                                    let tmp = copy[i + 1];
                                    copy[i + 1] = copy[i];
                                    copy[i] = tmp;
                                } else {
                                    let tmp = copy[0];
                                    copy[0] = copy[i];
                                    copy[i] = tmp;
                                }
                                setCurrentTasks(copy);
                            }} className="hover:scale-110" />
                        </div>
                    </div>
                })
            }

            {
                addedClipboard ? (
                    <BsClipboard2Check title="URL copied to clipboard" className="fixed bottom-2 right-2 text-green-50 text-4xl hover:scale-95 cursor-pointer" />
                ) : (
                    <BsClipboard2 title="Copy URL to clipboard" className="fixed bottom-2 right-2 text-white text-4xl hover:scale-95 cursor-pointer" onClick={() => {
                        setAddedClipboard(true);
                        addToClipboard();
                        setTimeout(() => {
                            setAddedClipboard(false)
                        }, 2000);
                    }} />
                )
            }

            {
                showCreateUpdate && (
                    <CreateUpdateTask
                        currentTasks={currentTasks || []}
                        setCurrentTasks={setCurrentTasks}
                        index={indexUpdate !== -1 ? indexUpdate : undefined}
                        setShowCreateUpdate={setShowCreateUpdate}
                    />
                )
            }
        </main>
    );
}

function CreateUpdateTask({ index, currentTasks, setCurrentTasks, setShowCreateUpdate }: { index?: number, currentTasks: Task[], setCurrentTasks: Function, setShowCreateUpdate: Function }) {
    const [selectedFrequency, setSelectedFrequency] = useState("");
    const handleAction = (formData: FormData) => {
        const formTask = formData.get("task") as string;
        const frequency = formData.get("frequency") as string;
        const formLabels = (formData.get("labels") as string).split(",").map(l => l.trim());
        let handledDays = undefined;
        switch(frequency) {
            case "weekly":
                handledDays = (formData.get("chosenFrequency") as string).replaceAll(" ", "").split(",").map(d => weekDayToNumber(d)).join(",");
                break;
            case "monthly":
            case "yearly":
                handledDays = formData.get("chosenFrequency") as string;
        }

        if (!formTask || !handledDays) return;

        console.log({formLabels});

        if (index || index === 0) {
            const copy = JSON.parse(JSON.stringify(currentTasks));
            copy[index] = { ...copy[index], chosenFrequency: handledDays, frequency, task: formLabels.length > 0 && formLabels[0] !== "" ? `${formTask}:${formLabels.join(":")}` : formTask };
            setCurrentTasks(copy);
        } else {
            const newTaskData = {
                frequency,
                chosenFrequency: handledDays,
                task: formLabels.length > 0 && formLabels[0] !== "" ? `${formTask}:${formLabels.join(":")}` : formTask,
                done: false,
            }
            setCurrentTasks([newTaskData, ...currentTasks]);
        }
        setShowCreateUpdate(false);
    }

    return (
        <div className="bg-black bg-opacity-80 fixed top-0 left-0 h-screen w-full flex items-center justify-center p-4 z-50" onClick={() => setShowCreateUpdate(false)}>
            <form action={handleAction} onClick={(e) => e.stopPropagation()} className="border p-8 text-white rounded-xl">
                <div>
                    <label htmlFor="task" className="font-bold mb-2 block my-4">Task:</label>
                    <input type="text" name="task" id="task" defaultValue={(index || index === 0) ? currentTasks[index].task.split(":")[0] : ""} className="p-4 rounded-xl bg-gray-800" autoComplete={"off"} autoCorrect="off" autoCapitalize="on" />
                </div>
                <div>
                    <label htmlFor="labels" className="font-bold mb-2 block my-4">Labels:</label>
                    <input type="text" name="labels" id="labels" defaultValue={(index || index === 0) ? currentTasks[index].task.split(":").slice(1) : ""} className="p-4 rounded-xl bg-gray-800" autoComplete={"off"} autoCorrect="off" autoCapitalize="on" />
                </div>
                <div>
                    <label className="font-bold mb-2 block my-4" htmlFor="frequency">Frequency:</label>
                    <select className="p-4 rounded-xl bg-gray-800 w-full" name="frequency" id="frequency" defaultValue={(index || index === 0) ? currentTasks[index].frequency : ""}  onChange={(e) => setSelectedFrequency(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                {
                    selectedFrequency === "weekly" && (
                        <div>
                            <label className="font-bold mb-2 block my-4" htmlFor="chosenFrequency">Days:</label>
                            <Combobox items={["all", "sun", "mon", "tue", "wed", "thu", "fri", "sat"]} prevSelectedItems={(index || index === 0) ? currentTasks[index].chosenFrequency.split(",").map(e => numberToWeekDay(Number(e))) : []} name={"chosenFrequency"} id={"chosenFrequency"} />
                        </div>
                    )
                }
                {
                    selectedFrequency === "monthly" && (
                        <div>
                            <label className="font-bold mb-2 block my-4" htmlFor="chosenFrequency">Day:</label>
                            <input type="number" name="chosenFrequency" defaultValue={(index || index === 0) ? currentTasks[index].chosenFrequency : ""} className="p-4 rounded-xl bg-gray-800" autoComplete={"off"} autoCorrect="off" autoCapitalize="on" />
                        </div>
                    )
                }
                {
                    selectedFrequency === "yearly" && (
                        <div>
                            <label className="font-bold mb-2 block my-4" htmlFor="chosenFrequency">Day:</label>
                            <input type="text" name="chosenFrequency" id="chosenFrequency" defaultValue={(index || index === 0) ? currentTasks[index].chosenFrequency : ""} className="p-4 rounded-xl bg-gray-800" autoComplete={"off"} autoCorrect="off" autoCapitalize="on" />
                        </div>
                    )
                }
                <button className="w-full p-4 rounded-full bg-purple-900 text-white hover:bg-purple-800 hover:scale-95 mt-4">{(index || index === 0) ? "Atualizar" : "Criar"}</button>
            </form>
        </div>
    )
}

function Combobox({ items, name, id, prevSelectedItems, onChange }: { items: string[], name: string, id: string, prevSelectedItems?: string[], onChange?: Function }) {
    const [options] = useState<string[]>(items);
    const [selectedItems, setSelectedItems] = useState<string[]>(prevSelectedItems || []);

    const handleSelect = (item: string) => {
        if (!selectedItems.includes(item)) {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleRemove = (item: string) => {
        setSelectedItems(selectedItems.filter(selected => selected !== item));
    };

    useEffect(() => {
        if (onChange) onChange(selectedItems);
    }, [selectedItems]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValues = e.target.value.split(",").map(value => value.trim());
        const validValues = inputValues.filter(value => options.includes(value));
        setSelectedItems(validValues);
    };

    return (
        <div className="select-none">
            <input
                type="text"
                value={selectedItems.join(", ")}
                onChange={handleChange}
                className="hidden"
                name={name}
                id={id}
            />
            <ul className="border border-dashed rounded p-2 mt-2 max-h-40 overflow-auto">
                {options.map(option => (
                    <li
                        key={option}
                        onClick={() => {
                            if (!selectedItems.includes(option)) {
                                handleSelect(option)
                            } else {
                                handleRemove(option)
                            }
                        }}
                        className={`p-2 cursor-pointer hover:bg-gray-800 rounded-xl mb-1 flex items-center gap-2 ${selectedItems.includes(option) ? "bg-purple-950" : ""}`}
                    >
                        {selectedItems.includes(option) ? <BsCheckCircle className="text-base" /> : <BsCircle className="text-base" />}
                        {option}
                    </li>
                ))}
            </ul>
        </div>
    );
}