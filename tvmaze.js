"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodeUl = $("#episodes-list");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const request = await axios.get(
    "https://api.tvmaze.com/search/shows?api_key=vf44cIBhzoMRENkqF8EoLro3yM0x9Xgi&q=" +
      searchTerm
  );
  let shows = request.data.reduce(function (accum, curr, index) {
    accum[index] = {
      id: request.data[index].show.id,
      name: request.data[index].show.name,
      summary: request.data[index].show.summary,
      image: request.data[index].show.image,
    };
    return accum;
  }, []);
  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    if (show.image == null) {
      show.image = { medium: "https://tinyurl.com/tv-missing" };
    }
    if (show.summary == null) {
      show.summary = "No summary here";
    }
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src= "${show.image.medium}"
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  // $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const req = await axios.get(
    "https://api.tvmaze.com/shows/" +
      id +
      "/episodes?specials=1&api_key=vf44cIBhzoMRENkqF8EoLro3yM0x9Xgi"
  );
  // console.log(req);
  let episodes = req.data.reduce(function (accum, curr, index) {
    accum[index] = {
      id: req.data[index].id,
      name: req.data[index].name,
      season: req.data[index].season,
      number: req.data[index].number,
    };
    return accum;
  }, []);
  return episodes;
}

/** Write a clear docstring for this function... */

async function populateEpisodes(episodes) {
  $episodeUl.empty();
  for (let episode of episodes) {
    const $episodeLi = $(
      `<li>${episode.name}: (season ${episode.season}, number ${episode.number})</li>`
    );
    $episodeUl.append($episodeLi);
  }
}

$(document).on("click", ".getEpisodes", async function (e) {
  e.preventDefault();
  let showId = $(this).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});