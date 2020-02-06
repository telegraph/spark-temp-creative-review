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

  const render = (allDataSorted, isYearOpen) => {
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

    // we know the year labels are always sorted as per the spreadsheet
    let currentYear = null;
    let currentYearContainer = null, currentYearMain = null;

    allDataSorted.forEach(data => {
      if (data != null) {
        // check if the current year label exists
        if (currentYear !== data.DateName) {
          // create a new label, and add the site
          currentYear = data.DateName;
          currentYearContainer = createYear(root, currentYear);
          // add the label/year container to the DOM
          root.appendChild(currentYearContainer);
          currentYearMain = currentYearContainer.querySelector('main');
        }

        // add this site to the current label
        createSite(currentYearMain, data, isYearOpen);
      }
    });

    if (isYearOpen) {
      const years = document.querySelectorAll('.year');
      years.forEach(yearEl => openYear(yearEl));
    }

    // return data;
  };

  const fetchData = (incomingFetchData) => {
    // data could be null, if it is to be ignored
    if (incomingFetchData && incomingFetchData.url ) {
      return fetch(incomingFetchData.url)

      .then(response => response.json())

      .then(dataNew => {
        const entries = dataNew.feed.entry || [];
        
        const currentTabData = entries.map((currentEntry) => {
          return {
            'DateName': incomingFetchData.dateName || "",
            'Brand': currentEntry['gsx$brandpartner']['$t'] || "",
            'Title': currentEntry['gsx$title']['$t'] || "",
            'Type': currentEntry['gsx$type']['$t'] || "",
            'Link': currentEntry['gsx$link']['$t'] || "",
          };
        });

        // add the data to the existing sorted array, so we don't have to re-sort later
        const found = dataToFetch.findIndex(element => element.dateName === incomingFetchData.dateName);
        dataToFetch[found].entries = currentTabData;
        // the search data now will be created after we get everything, so we don't need to sort it
        // searchData = searchData.concat(currentTabData);
      })
    } else {
      return;
    }
  }

  const getUrlVars = () => {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
  }

  const fetchAllData = () => {
    // fetch them all at the same time
    Promise.allSettled(dataToFetch.map(fetchData))
    .then(data => {
      initialSearch = getUrlVars()['search'] || "";

      // create the search data - doing it here so it's already sorted
      // also add the data to the search array, slightly different structure for happy results, but no sub-labelling
      // and needs sorting!
      dataToFetch.forEach(data => {
        if (data.entries !== undefined) {
          searchData = searchData.concat(data.entries);
        }
      });
    })
    // render everything
    .then(result => render(searchData, false))
    // initialize fuzzy search
    .then(data => {
      // for the search we want to search for links, and then later on find
      // what it returned and match the actual nested array's items with
      fuse = new window.Fuse(searchData, fuzzyOptions);
      return;
    })
    .then(data => {
      document.getElementById('search-input').value = initialSearch;
      if(initialSearch && initialSearch != "") {
        performSearch(initialSearch);
      }
    });
  }

  const performSearch = (searchValue) => {
    dataPromise.then(data => {
      const result = fuse.search(searchValue);

      if (searchValue) {
        render(result, true);
      } else {
        render(searchData, false);
      }
    });
  }

  let dataToFetch, searchData = [], initialSearch = '';

  let fuse;
  const fuzzyOptions = {
    keys: ['DateName', 'Brand', 'Title', 'Type'],
    // a higher threshold than 0.1 is no good for year searching
    threshold: 0.1,
    // threshold: 0.4,
    shouldSort: false,
    tokenize: true,
  };

  // get the individual URLs from here:
  // https://spreadsheets.google.com/feeds/worksheets/1_ipymJkVzb-9kg5XPtd3hp-l1Dch5DrUq-7eAY7kDwA/public/full?alt=json
  // then each URL as in the data above, ie:
  // https://spreadsheets.google.com/feeds/list/1_ipymJkVzb-9kg5XPtd3hp-l1Dch5DrUq-7eAY7kDwA/o7ps080/public/full?alt=json

  // const dataPromise = fetch('http://localhost:1337/links')
  const dataPromise = fetch('https://spreadsheets.google.com/feeds/worksheets/1_ipymJkVzb-9kg5XPtd3hp-l1Dch5DrUq-7eAY7kDwA/public/full?alt=json')
    .then(response => response.json())

    .then(data => {
      const entries = data.feed.entry || [];

      // just go through the json data and build a friendlier array to go through
      dataToFetch = entries.map((currentEntry) => {
        if (currentEntry['title']['$t'] != "IGNORE") {
          return {
            'dateName': currentEntry['title']['$t'],
            'url': currentEntry['link'][0]['href'] + '?alt=json',
          };
        } else {
          return {};
        }
      });
    })

    .then(data => fetchAllData(data));

  // Search functionality
  // If we type anything into the input, all items must open up
  const input = document.getElementById('search-input');
  input.addEventListener('input', (e) => {
    const inputValue = e.srcElement.value;
    performSearch(inputValue);
  });
})();
