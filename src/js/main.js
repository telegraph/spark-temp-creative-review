(function() {
  /**
   * Create each link in the given year
   */
  const createSite = (rootEl, site, isYearOpen) => {
    const html = `<div><span class="brand">${site.Brand}</span> · <span class="name">${site.Title}</span></div><span class="type">${site.Type}</span>`;

    const a = document.createElement('a');
    a.target = '_blank';
    a.href = site.Link;
    a.classList.add('site');
    a.innerHTML = html;
    rootEl.appendChild(a);

    if (isYearOpen) {
      rootEl.style.height = `${rootEl.scrollHeight}px`;
    }

    return a;
  }

  const openYear = (yearEl, event) => {
    yearEl.classList.toggle('active');
    const main = yearEl.querySelector('main');

    // only apply the transition if its an event fired to the year.
    // on search there should be no transition...
    if (event) {
      main.style.transition = 'height .4s ease-in-out';

      // removing the transition when we finished
      window.setTimeout(() => {
        main.style.removeProperty('transition');
      }, 400);
    }

    if (yearEl.classList.contains('active')) {
      main.style.height = `${main.scrollHeight}px`;
    } else {
      main.style.height = '0px';
    }
  }

  const createYear = (rootEl, year, isYearOpen) => {
    const html = `<header><span class="title">${year}</span><img class="cross" src="./src/assets/cross-icon.svg" alt="+" /></header><main></main>`;
    const div = document.createElement('div');
    div.classList.add('year');

    if (isYearOpen) {
      div.classList.add('active');
    }

    div.innerHTML = html;

    div.querySelector('header').addEventListener('click', (e) => openYear(div, e));

    return div;
  };

  const render = (data, isYearOpen) => {
    const root = document.getElementById('year-wrapper');

    // need to categorize the links first per year...
    const dataGroupedByYear = data.reduce((obj, x) => {
      const year = x.year;

      if (!obj.hasOwnProperty(year.Name)) {
        obj[year.Name] = [];
      }

      obj[year.Name].push(x);
      return obj;
    }, {});

    // empty the root
    root.innerHTML = '';

    for (let [yearName, value] of Object.entries(dataGroupedByYear)) {
      const year = createYear(root, yearName);
      const yearMain = year.querySelector('main');
      value.forEach(site => createSite(yearMain, site, isYearOpen));

      root.appendChild(year);
    };

    if (isYearOpen) {
      const years = document.querySelectorAll('.year');
      years.forEach(yearEl => openYear(yearEl));
    }

    return data;
  };

  let fuse;
  const fuzzyOptions = {
    keys: ['Brand', 'Name', 'Title', 'Type'],
    threshold: 0.4,
    shouldSort: false,
  };

  const dataPromise = fetch('http://localhost:1337/links')
    .then(response => response.json())

    // render all data
    .then(data => render(data))

    // initialize fuzzy search
    .then(data => {
      // for the search we want to search for links, and then later on find
      // what it returned and match the actual nested array's items with
      fuse = new window.Fuse(data, fuzzyOptions);

      return data;
    });

  const introPromise = fetch('http://localhost:1337/intros')
    .then(response => response.json())
    .then(data => {
      if (data && data.length && data[0].hasOwnProperty('text')) {
        document.getElementById('intro').innerHTML = data[0].text;
      }
    });

  // Search functionality
  // If we type anything into the input, all items must open up
  const input = document.getElementById('search-input');
  input.addEventListener('input', (e) => {
    const inputValue = e.srcElement.value;

    dataPromise.then(data => {
      const result = fuse.search(inputValue);

      if (inputValue) {
        render(result, true);
      } else {
        render(data, false);
      }
    });
  });
})();
