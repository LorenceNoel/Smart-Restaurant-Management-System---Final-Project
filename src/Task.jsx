import { useState } from 'react'

function Task() {
  const[task, setTask] = useState(['Go to work', 'Eat lunch'])
  
  const addTask = ()=>{
    setTask([...task, 'read book'])
  }
  return(
      <>
        <button onClick={addTask} >Add task</button>

        <p>{task.map((e, i)=> <li key={i}>{e}</li>)}</p>

      </>
   
  )

  
}

export default Task
