"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react';
import { BsCheckCircle, BsCircle, BsClipboard2, BsClipboard2Check, BsEye, BsPencil, BsPlusCircleDotted, BsTrash, BsTrashFill } from 'react-icons/bs';

type Task = { days: string, task: string, done: boolean };

export default function Home() {
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
  const addToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  }
  const router = useRouter();

  useEffect(() => {
    if (tasks) {
      const all = tasks.split(">>");
      const allInObject = all.map(a => {
        const [days, task, done] = a.split(";");
        return { days: days, task, done: done == "true" };
      });
      console.log({ allInObject })
      setCurrentTasks(allInObject)
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
    if (currentTasks && tasks) router.push(`?tasks=${getArrToObjUrl()}`);
  }, [currentTasks]);

  const toggleTaskDone = (index: number) => {
    const copy = JSON.parse(JSON.stringify(currentTasks));
    copy[index] = { ...copy[index], done: !copy[index].done };
    setCurrentTasks(copy);
  }

  const getStat = (name: string) => {
    let stored = JSON.parse(localStorage.getItem("stored") as string) || [];
    let index = -1;
    for (let k = 0; k < stored.length; k++) {
      if (stored[k].name === name) {
        index = k;
        break;
      }
    }

    if (index === -1) return [0, 0];

    const currentTime = new Date().getTime();
    const dif = currentTime - stored[index].firstTime;
    const days = Math.ceil(dif / 1000 / 60 / 60 / 24);

    console.log({
      dif,
      days,
      done: stored[index].done
    })

    return [Number(((stored[index].done / days) * 100).toFixed(2)), days];
  }

  return (
    <main className="p-8">
      <h1 className="text-white text-4xl text-center my-4">Routine Care</h1>
      <div className="flex items-center justify-center gap-4">
        <Link href={`/all?tasks=${getArrToObjUrl()}`}>
          <BsPencil className="text-4xl text-white mb-8 hover:scale-90 cursor-pointer" />
        </Link>
      </div>
      {
        currentTasks?.map((ct, i) => {
          const currentDay = new Date().getDay();
          if (ct.days === "-1" || ct.days.split(",").includes(String(currentDay))) {
            return <div
              key={i}
              className={`${ct.done ? "bg-purple-800" : "bg-gray-800"} text-white p-2 rounded-xl mb-2 cursor-pointer hover:brightness-125 relative group border`}
              onClick={() => {
                let stored = JSON.parse(localStorage.getItem("stored") as string) || [];
                let index = -1;
                for (let k = 0; k < stored.length; k++) {
                  if (stored[k].name === ct.task.split(":")[0].trim()) {
                    index = k;
                    break;
                  }
                }
                if (index == -1) {
                  stored.push({
                    name: ct.task.split(":")[0].trim(),
                    firstTime: new Date().getTime(),
                    done: !ct.done ? 1 : 0
                  });

                } else {
                  stored[index] = { ...stored[index], done: !ct.done ? stored[index].done + 1 : stored[index].done - 1 }
                }
                localStorage.setItem("stored", JSON.stringify(stored));
                toggleTaskDone(i);
              }}
            >
              {ct.task.split(":")[0].trim()}
              {ct.task.split(":")[1] && <span style={{ backgroundColor: ct.task.split(":")[2] || "indigo" }} className={`px-2 py-1 mx-4 text-xs rounded-xl border`}>{ct.task.split(":")[1].trim()}</span>}
              <span style={{ backgroundColor: "black"}} className={`px-2 py-1 mx-4 text-xs rounded-xl border`}>{getStat(ct.task.split(":")[0].trim())[0]}% de {getStat(ct.task.split(":")[0].trim())[1]} dias</span>
              {ct.done && <BsCheckCircle className="absolute top-1/2 right-4 -translate-y-1/2" />}
            </div>
          }
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
    </main>
  );
}