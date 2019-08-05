const data = fetch('http://localhost:1337/years')
  .then(response => response.json());

export default data;
