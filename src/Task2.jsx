import { useState } from 'react'

function Task2() {
  const[tasks, setTasks] = useState(['Go to work', 'Eat lunch'])
  const[task,setTask]=useState('')
  
  const submitTask = (e)=>{
    e.preventDefault();
    setTasks([...tasks, task])
  }

  const getTask = (e)=>{
    setTask(e.target.value)
  }
  return(
      <>
        Enter task <input type='text' name="task" value={task} onChange={getTask} />
        <button onClick={submitTask} >Add task</button>

        <p>{tasks.map((e, i)=> <li key={i}>{e}</li>)}</p>

      </>
   
  )

  
}

export default Task2
