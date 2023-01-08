import './App.css';
import {useState} from 'react';
import {useInterval} from "usehooks-ts"

function GetPoster() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);

  useInterval(() => {
    fetch("http://localhost:3000/first")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, (20 * 60 * 1000))

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <img src={items.img}/>
    );
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <GetPoster />
      </header>
    </div>
  );
}

export default App;
