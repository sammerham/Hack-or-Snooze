"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
//TODO: remove hearts if not logged in
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  // icon for favorite/not favorite (solid)/(outline)
  //is this story a favorite?
  //rn story = object in storyList
  //issue: how do i see if it is included in the object? is here somethign else i can compare for?
  //i think it taking the story.id (which is string of numbers) and using it as a key
  //it is taking that key and seeing if the key (of id) is a key in favorties (which is not)
  //(story.storyId in currentUser.favorites) ? "fas" : "far" //will return no so "far"
  let iconStyle = generatefavIconStyle(story);
  console.log(iconStyle);
  const hostName = story.getHostName();
  return $(`
   
  <li id="${story.storyId}">
  <span style="font-size: 0.85em"><i class="${iconStyle} fa-heart"></i></span> 
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/* when new story form submitted, adds story to page*/

async function submitAndShowNewStory(evt) {
  //grab values from form
  //call .addStory using values
  //put new Story on page
  console.log(evt);
  evt.preventDefault();
  let author = $("#author").val();
  let title = $("#title").val();
  let url = $("#url").val();
  console.log(author, title, url);
  let newStory = await storyList.addStory(currentUser, { author, title, url })
  let newStoryHtml = generateStoryMarkup(newStory);
  $allStoriesList.prepend(newStoryHtml);
  // putStoriesOnPage();
  // location.reload();
}

$formStorySubmitButton.on("click", submitAndShowNewStory);

//make a page full of favorite stories
//TODO: refactor, move to nav js, 
function generateFavStoryPage() {
  //hide other forms/pages
  //create new page of only favorited stories
  //loop through user.favorites array and generate the html markup
  //then append to page
  $favStoriesList.empty();
  hidePageComponents();
  console.log(currentUser.favorites)
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
  }
  $favStoriesList.show();
}

//affects teh style of icon depending on favtorite status
//if the story in main storyList is inside the currentUser.favorite list
//user story is array, story list is also array
//how to compare? the Id
//loop through single story(object)
//loop through user list
//loop through the currentUser.favorite array, if array includes passed story then use "fas", otherwise use "far"
//then return "fas" else "far"
//rn story = object in storyList
//TODO: .find inplace of loop
function generateFavIconStyle(story) {
  if (currentUser === undefined) {
    return "far";
  }
  let favStories = currentUser.favorites; //array of objects
  for (let favStory of favStories) {
    if (favStory.storyId === story.storyId) {
      return "fas"
    }
  }
  return "far"
}

//toggle favorite function
//check the icon class
//check if the story the icon will change or 
//look at currentUser.favorite array, if in it removeFavorite(), if not call addFavorite();
//get id of li and compare it story id
//
async function toggleFavorites(evt) {
  // evt.preventDefault;
  let clickedStoryId = $(evt.target).closest("li").attr("id");
  let clickedStory;
  //loop through storyList.stories, give key of story
  //if story.storyId === storyId;
  //clickedStory = story
  //TODO: use .find()
  for (let story of storyList.stories) {
    if (story.storyId === clickedStoryId) {
      clickedStory = story;
    }
  }
  console.log("clickedStory is", clickedStory)
  let iconClass = $(evt.target).hasClass("fas");
  console.log("is the class of this fas?", iconClass)
  // for(let favStory of currentUser.favorites)
  //   if (favStory.storyId === storyId){
  if (iconClass) {
    await currentUser.removeFavorite(clickedStory);
  } else {
    await currentUser.addFavorite(clickedStory)
  }
  $(evt.target).toggleClass("far fas"); //order of result isimportant, try to do logic frst before UI update
}

//onlick for icon is the toggle

$favNavLink.on("click", generateFavStoryPage);
$("body").on("click", ".fa-heart", toggleFavorites)

//might need an event delegator?