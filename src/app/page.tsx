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

      let stored = JSON.parse(localStorage.getItem("stored") as string) || [];
      console.log({ stored });
      if (stored.length === 0 || !stored) {
        let toBeStored = [];
        for (let i = 0; i < allInObject.length; i++) {
          toBeStored.push({
            name: allInObject[i].task.split(":")[0].trim(),
            firstTime: new Date().getTime(),
            done: 0,
            days: allInObject[i].days
          });
        }
        localStorage.setItem("stored", JSON.stringify(toBeStored));
      }
      setCurrentTasks(allInObject)
    }

    const lastUsage = localStorage.getItem("lastUsage");
    if (lastUsage) {
      const currentDay = new Date().toLocaleDateString();
      if (currentDay !== lastUsage) {
        localStorage.setItem("lastUsage", new Date().toLocaleDateString());
        router.push(`?tasks=${getArrToObjUrl().replaceAll("true", "false")}`);
      }
    } else {
      localStorage.setItem("lastUsage", new Date().toLocaleDateString());
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
    const splittedDays = stored[index].days.split(",");
    const dif = currentTime - stored[index].firstTime;
    const days = Math.ceil(dif / 1000 / 60 / 60 / 24);

    // O total de dias é calculado a partir do momento em que o usuário começa a fazer; existe uma variável chamada firstTime que armazena o momento exato em que ele começou. Se é uma atividade que o usuário faz todos os dias, então o total é momentoAtual - momentoDeInicio e o total de vezes feitas deve ser igual ao total de dias transcorridos. Mas e se é algo que ele faz somente 2 vezes na semana?

    // Supondo que é algo feito somente 2 vezes na semana e o total de dias transcorridos foi 10, a pergunta que deve ser respondida é quanto do total desses dias o usuário deveria der cumprido a tarefa, porque esse é o total pro cálculo da porcentagem

    // Existe um intervalo de espera entre uma atividade e outra. Se o usuário faz uma atividade todos os dias, isso quer dizer que o intervalo de espera para a próxima é de 1 dia, ou seja há a relação 7 => 1, então, pela regra de 3, calcula-se esse intervalo de espera com x/7, onde x é a quantidade de vezes que o usuário faz algo na semana

    const amountPerWeek = splittedDays.includes("-1") ? 7 : splittedDays.length;
    const waitingFactor = amountPerWeek / 7;

    // assim, o total real de dias deve ser:
    const realTotalDays = Math.ceil(days * waitingFactor);
    // e o percentual fica:
    let perc = Number(((stored[index].done / realTotalDays) * 100).toFixed(2));

    console.log({
      name: stored[index].name,
      realTotalDays: [realTotalDays, days * waitingFactor],
      done: stored[index].done,
      perc
    })

    perc = perc > 100 ? 100 : perc;

    return [perc, realTotalDays];
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
              className={`${ct.done ? "bg-purple-800" : "bg-gray-800"} text-white px-4 py-2 rounded-xl mb-2 cursor-pointer hover:brightness-125 relative group flex items-center`}
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
                    done: !ct.done ? 1 : 0,
                    days: ct.days
                  });
                } else {
                  stored[index] = { ...stored[index], done: !ct.done ? stored[index].done + 1 : stored[index].done - 1 }
                }
                localStorage.setItem("stored", JSON.stringify(stored));
                toggleTaskDone(i);
              }}
            >
              {ct.task.split(":")[0].trim()}
              {ct.task.split(":")[1] &&
                <>
                  <span style={{ backgroundColor: ct.task.split(":")[2] || "indigo" }} className={`px-2 py-1 mx-4 text-xs rounded-xl border`}>{ct.task.split(":")[1].trim()}</span>

                  {
                    ct.done && ct.task.split(":")[3] && (
                      <span className="px-2 py-1 mx-4 text-xs rounded-xl border border-dashed bg-gradient-to-r from-green-800 to-green-950 animate-pulse">Reward: {ct.task.split(":")[3].trim()}</span>
                    )
                  }
                </>

              }
              <span className="bg-black px-2 py-1 mx-4 text-xs rounded-xl border opacity-0 group-hover:opacity-100">{getStat(ct.task.split(":")[0].trim())[0]}% from {getStat(ct.task.split(":")[0].trim())[1]} day(s)</span>
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