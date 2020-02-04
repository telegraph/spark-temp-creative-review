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

  const render = (allData, isYearOpen) => {
    const root = document.getElementById('year-wrapper');

    // we already have them categorized by year, as per the spreadsheet
    // // need to categorize the links first per year...
    // const dataGroupedByYear = data.reduce((obj, x) => {
    //   const year = x.year;

    //   if (!obj.hasOwnProperty(year.Name)) {
    //     obj[year.Name] = [];
    //   }

    //   obj[year.Name].push(x);
    //   return obj;
    // }, {});

    // empty the root
    root.innerHTML = '';

    // create every year label, and the site links inside
    for (let [dateName, data] of Object.entries(allData)) {
      const year = createYear(root, data.dateName);
      const yearMain = year.querySelector('main');
      data.entries.forEach(site => createSite(yearMain, site, isYearOpen));

      root.appendChild(year);
    };

    if (isYearOpen) {
      const years = document.querySelectorAll('.year');
      years.forEach(yearEl => openYear(yearEl));
    }

    return data;
  };

  const fetchDataNext = () => {
    // check if there's any more data to fetch, otherwise render!
    if (fetchIndexNow < dataToFetch.length) {
      // just because they had a random tab that we should actually ignore 
      if (dataToFetch[fetchIndexNow].title != 'IGNORE') {
        const dataPromise = fetch(dataToFetch[fetchIndexNow].url)

        .then(response => response.json())

        .then(dataNew => {
          var entries = dataNew.feed.entry || [];

          var currentTabData = entries.map((currentEntry) => {
            return {
              'Brand': currentEntry['gsx$brandpartner']['$t'] || "",
              'Title': currentEntry['gsx$title']['$t'] || "",
              'Type': currentEntry['gsx$type']['$t'] || "",
              'Link': currentEntry['gsx$link']['$t'] || "",
            };
          });

          allData.push( {
              'dateName': dataToFetch[fetchIndexNow].title,
              'entries': currentTabData,
            }
          );

          // and iterate to the next data index to fetch
          fetchIndexNow++;
          fetchDataNext();
        })
      } else {
        fetchIndexNow++;
        fetchDataNext();
      }
    } else {
      // now we got all the data, render it
      render(allData, false);
    }
  }

  const fetchData = () => {
    fetchIndexNow = 0;
    fetchDataNext();
  }

  let dataToFetch, fetchIndexNow = 0;
  let allData = [];

  let fuse;
  const fuzzyOptions = {
    keys: ['Brand', 'Name', 'Title', 'Type'],
    threshold: 0.4,
    shouldSort: false,
  };

  // get the individual URLs from here:
  // https://spreadsheets.google.com/feeds/worksheets/1_ipymJkVzb-9kg5XPtd3hp-l1Dch5DrUq-7eAY7kDwA/public/full?alt=json
  // then each URL as in the data above, ie:
  // https://spreadsheets.google.com/feeds/list/1_ipymJkVzb-9kg5XPtd3hp-l1Dch5DrUq-7eAY7kDwA/o7ps080/public/full?alt=json

  // const dataPromise = fetch('http://localhost:1337/links')
  const dataPromise = fetch('https://spreadsheets.google.com/feeds/worksheets/1_ipymJkVzb-9kg5XPtd3hp-l1Dch5DrUq-7eAY7kDwA/public/full?alt=json')
    .then(response => response.json())
    // go through all the entries (spreadsheet tabs), and create the entry data for each
    .then(data => {
      var entries = data.feed.entry || [];

      // just go through the json data and build a friendlier array to go through
      dataToFetch = entries.map((currentEntry) => {
        return {
          'title': currentEntry['title']['$t'],
          'url': currentEntry['link'][0]['href'] + '?alt=json',
        };
      });
    })

    .then(data => fetchData(data));

    // // initialize fuzzy search
    // .then(data => {
    //   // for the search we want to search for links, and then later on find
    //   // what it returned and match the actual nested array's items with
    //   fuse = new window.Fuse(data, fuzzyOptions);

    //   return data;
    // });

  // Search functionality
  // If we type anything into the input, all items must open up
  // const input = document.getElementById('search-input');
  // input.addEventListener('input', (e) => {
  //   const inputValue = e.srcElement.value;

  //   dataPromise.then(data => {
  //     const result = fuse.search(inputValue);

  //     if (inputValue) {
  //       render(result, true);
  //     } else {
  //       render(data, false);
  //     }
  //   });
  // });
})();
