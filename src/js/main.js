(function() {
  /**
   * Create each link in the given year
   */
  const createSite = (rootEl, site) => {
    const html = `
      <div>
        <span class="brand">${site.Brand}</span> · <span class="name">${site.Title}</span>
      </div>
      <span class="type">${site.Type}</span>
    `;

    const a = document.createElement('a');
    a.target = '_blank';
    a.href = site.Link;
    a.classList.add('site');
    a.innerHTML = html;
    rootEl.appendChild(a);

    return a;
  }

  const createYear = (rootEl, year) => {
    const html = `
      <header>
        <span class="title">${year}</span>

        <img class="cross" src="./src/assets/cross-icon.svg" alt="+" />
      </header>

      <main></main>
    `;

    const div = document.createElement('div');
    div.classList.add('year');
    div.innerHTML = html;
    rootEl.appendChild(div);

    div.addEventListener('click', () => {
      div.classList.toggle('active');
      const main = div.querySelector('main');

      if (div.classList.contains('active')) {
        main.style.height = `${main.scrollHeight}px`;
      } else {
        main.style.height = '0px';
      }
    });

    return div;
  };


  const dataPromise = fetch('http://localhost:1337/years')
    .then(response => response.json());

  const root = document.getElementById('year-wrapper');

  dataPromise.then(data => {
    data.forEach(value => {
      const year = createYear(root, value.Name);
      const yearMain = year.querySelector('main');

      value.links.forEach(site => createSite(yearMain, site));
    });
  });
})();
