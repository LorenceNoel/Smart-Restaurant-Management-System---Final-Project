import { useState } from 'react'

function AccountPage() {
    const [user, setUser]=useState({id:"",fullname:" " , email:" "})
    const [users, setUsers] = useState([])


    const handleId = (e)=>{
        setUser({...user, id:e.target.value})
    }
    const handlefullname = (e)=>{
    setUser({...user, fullname:e.target.value})
    }
    const submitUserProfile = (e)=>{
        e.preventDefault();
        setUsers([...users, user])
        setUser({id:"", fullname:""})
    }

  return (
    <div>
    <form>
       Enter Id <input type='text' value={user.id} name='id' onChange={handleId} /> <br />
      Enter Fullname <input type='text' value={user.fullname} name='fullname' onChange={handlefullname} /> <br />
       <button type='submit' onClick={submitUserProfile} >Send</button>     
    </form>
      <p>
         {users.map((e,i)=> 
           <li key={i}>{e.id} {e.fullname}</li>
         )}
     </p>
     <p>
        <table border={1}>
            <thead>
                <tr><td>ID</td><td>Fullname</td><td>Email</td></tr>
            </thead>
            <tbody>
                {users.map((e, index)=>{
                    return <tr key={index}><td>{e.id}</td><td>{e.fullname}</td><td>{e.email}</td></tr>
                })}
            </tbody>
        </table>
     </p>

    </div>
  )
}

export default AccountPage
