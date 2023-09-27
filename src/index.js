import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

const VacationForm = ({ places, users, bookVacation })=> {
  const [placeId, setPlaceId] = useState('');
  const [userId, setUserId] = useState('');
  const [note, setNote] = useState('Have a nice trip!')

  const save = (ev)=> {
    ev.preventDefault();
    const vacation = {
      user_id: userId,
      place_id: placeId,
      note: note
    };
    bookVacation(vacation);
    setUserId('');
    setPlaceId('');
    setNote('');
  }

  return (
    <form onSubmit={save}>
      <select value={ userId } onChange={ ev => setUserId(ev.target.value)}>
        <option value=''>-- choose a user --</option>
        {
          users.map( user => {
            return (
              <option key={ user.id } value={ user.id }>{ user.name }</option>
            );
          })
        }
      </select>
      <select value={ placeId } onChange={ ev => setPlaceId(ev.target.value)}>
        <option value=''>-- choose a place --</option>
        {
          places.map( place => {
            return (
              <option key={ place.id } value={ place.id }>{ place.name }</option>
            );
          })
        }
      </select>
      <input type='text' placeholder="Add a note!" value={ note } onChange={ ev => setNote(ev.target.value)}/>
      <button disabled={ !placeId || !userId }>Book Vacation</button>
    </form>
  );
}

const Users = ({ users, vacations })=> {
  return (
    <div>
      <h2>Users ({ users.length })</h2>
      <ul>
        {
          users.map( user => {
            return (
              <li key={ user.id }>
                { user.name }
                ({ vacations.filter(vacation => vacation.user_id === user.id).length })
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Vacations = ({ vacations, places, cancelVacation, users })=> {
  const [popular, setPopular] = useState('')
  useEffect(()=> {
    const idList = {};
    const ids = vacations.map( vacay => vacay.place_id);
    ids.forEach((id)=> {
      if(idList[id] === undefined){
        idList[id] = 1;
      }else {
        idList[id] += 1;
      }
    })
    const values = Object.values(idList).sort();
    const highest = values[values.length - 1];
    let popkey;
    for(const [key, value] of Object.entries(idList)){
      if(value === highest){
        popkey = key*1;
      }
    const pop = places.find(place => place.id === popkey)  
    if(pop !== undefined){
      setPopular(pop.name)
    }
    }
  }, [vacations])

  return (
    <div>
      <h2>Vacations ({ vacations.length })</h2>
      <h4>Most popular location: { popular }</h4>
      <ul>
        {
          vacations.map( vacation => {
            const place = places.find(place => place.id === vacation.place_id);
            const user = users.find(user => vacation.user_id === user.id)
            return (
              <li key={ vacation.id }>
                { new Date(vacation.created_at).toLocaleString() }
                <div> 
                  to { place ? place.name : '' } for { user ? user.name : ''}
                </div>
                <div>
                  Note: { vacation.note }
                </div>
                <button onClick={()=> cancelVacation(vacation)}>Cancel</button>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Places = ({ places, vacations })=> {
  return (
    <div>
      <h2>Places ({ places.length })</h2>
      <ul>
        {
          places.map( place => {
            return (
              <li key={ place.id }>
                { place.name }
                ({ vacations.filter(vacation => vacation.place_id === place.id).length })
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Register = ({places, users, setPlaces, setUsers})=> {
  const [placeName, setPlaceName] = useState('');
  const [userName, setUserName] = useState('');

  const postUser = async(user)=> {
    const { data } = await axios.post('/api/users', user);
    setUsers([...users, data]);
  }
  const postLocation = async(location)=> {
    const { data } = await axios.post('/api/places', location);
    setPlaces([...places, data]);
  }

  const saveUser = (ev)=> {
    ev.preventDefault();
    const user = {
      name: userName
      };
      postUser(user);
    setUserName('');
  }
  const saveLocation = (ev)=> {
    ev.preventDefault();
    const place = {
      name: placeName
      };
      postLocation(place);
    setPlaceName('');
  }

  return (
    <div>
      <h5>Register User</h5>
      <form onSubmit={saveUser}>
        <input type='text' placeholder='Name' value={ userName } onChange={ev => setUserName(ev.target.value)}/>
        <button>Add</button>
      </form>
      <h5>Add New Location</h5>
      <form onSubmit={saveLocation}>
        <input type='text' placeholder='Location Name' value={ placeName } onChange={ev => setPlaceName(ev.target.value)}/>
        <button>Add</button>
      </form>
    </div>
  )
}

const App = ()=> {
  const [users, setUsers] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/vacations');
      setVacations(response.data);
    }
    fetchData();
  }, []);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/places');
      setPlaces(response.data);
    }
    fetchData();
  }, []);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    }
    fetchData();
  }, []);

  const bookVacation = async(vacation)=> {
    const response = await axios.post('/api/vacations', vacation);
    setVacations([...vacations, response.data]);
  }

  const cancelVacation = async(vacation)=> {
    await axios.delete(`/api/vacations/${vacation.id}`);
    setVacations(vacations.filter(_vacation => _vacation.id !== vacation.id));
  }

  return (
    <div>
      <Register places={ places } users={ users } setPlaces={ setPlaces } setUsers={ setUsers }/>
      <h1>Vacation Planner</h1>
      <VacationForm places={ places } users={ users } bookVacation={ bookVacation }/>
      <main>
        <Vacations
          vacations={ vacations }
          places={ places }
          cancelVacation={ cancelVacation }
          users={users}
        />
        <Users users={ users } vacations={ vacations }/>
        <Places places={ places } vacations={ vacations }/>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<App />);
