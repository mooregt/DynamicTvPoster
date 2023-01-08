import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';

function MyComponent() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);

  // Note: the empty deps array [] means
  // this useEffect will run once
  // similar to componentDidMount()
  useEffect(() => {
    fetch("http://localhost:3000/first")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

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
        <MyComponent />
      </header>
    </div>
  );
}

// setInterval(() => {
//   MyComponent()
// }, 1000);
export default App;
