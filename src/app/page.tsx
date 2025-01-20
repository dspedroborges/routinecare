"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react';
import { BsCheckCircle, BsCircle, BsClipboard2, BsClipboard2Check, BsEye, BsFire, BsPencil, BsPlusCircleDotted, BsTrash, BsTrashFill } from 'react-icons/bs';

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
  const [registeredStreaks, setRegisteredStreaks] = useState<string[]>([]);

  useEffect(() => {
    if (tasks) {
      const all = tasks.split(">>");
      const allInObject = all.map(a => {
        const [days, task, done] = a.split(";");
        return { days: days, task, done: done == "true" };
      });
      setCurrentTasks(allInObject);
    } else {
      localStorage.removeItem("streaks");
    }
    let streaks: string[] = JSON.parse(localStorage.getItem("streaks") as string) || [];
    setRegisteredStreaks(streaks);
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

  const toggleTaskDone = (index: number) => {
    const copy = JSON.parse(JSON.stringify(currentTasks));
    copy[index] = { ...copy[index], done: !copy[index].done };

    let allDone = true;
    for (let i = 0; i < copy.length; i++) {
      if (!copy[i].done) {
        allDone = false;
        break;
      }
    }

    let streaks: string[] = JSON.parse(localStorage.getItem("streaks") as string) || [];
    const today = new Date().toLocaleDateString();
    if (allDone && streaks?.[streaks.length - 1] !== today) {
      streaks.push(today);
    } else if (!allDone && streaks?.[streaks.length - 1] == today) {
      streaks.pop();
    }

    localStorage.setItem("streaks", JSON.stringify(streaks));
    setRegisteredStreaks(streaks);
    setCurrentTasks(copy);
  }

  return (
    <main className="p-8">
      <h1 className="text-white text-4xl text-center my-4">Routine Care</h1>
      <div className="flex items-center justify-center gap-4">
        <Link href={`/all?tasks=${getArrToObjUrl()}`}>
          <BsPencil className="text-4xl text-white mb-8 hover:scale-90 cursor-pointer" />
        </Link>
      </div>
      <div className="flex items-center gap-2 justify-center">
        {
          registeredStreaks.map((r, i) => {
            return <BsFire key={i} title={r} className="text-red-600 text-xl animate-pulse"/>
          })
        }
      </div>
      {
        currentTasks?.map((ct, i) => {
          const currentDay = new Date().getDay();
          if (ct.days === "-1" || ct.days.split(",").includes(String(currentDay))) {
            return <div
              key={i}
              className={`${ct.done ? "bg-purple-800" : "bg-gray-800"} text-white px-4 py-2 rounded-xl mb-2 cursor-pointer hover:brightness-125 relative group flex items-center`}
              onClick={() => {
                toggleTaskDone(i);
              }}
            >
              {
                ct.task.split(":").map((s, i) => {
                  if (i === 0) {
                    return <span className="mr-4" key={i}>{s}</span>;
                  } else {
                    const [title, color] = s.split("@");
                    return  <span  key={i} style={{ backgroundColor: color || "indigo" }} className={`px-2 py-1 mx-1 text-xs rounded-xl border`}>{title}</span>;
                  }
                })
              }
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