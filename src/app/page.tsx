"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react';
import { BsCheckCircle, BsCircle, BsClipboard2, BsClipboard2Check, BsEye, BsPencil, BsPlusCircleDotted, BsTrash, BsTrashFill } from 'react-icons/bs';

type Task = { days: string, task: string, done: boolean };

export default function Home() {
  return (
    <Suspense>
      <Content/>
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
      console.log({allInObject})
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
              className={`${ct.done ? "bg-purple-900" : "bg-gray-800"} text-white p-2 rounded-xl mb-2 cursor-pointer hover:brightness-125 relative group`}
              onClick={() => toggleTaskDone(i)}
            >
              {ct.task}
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