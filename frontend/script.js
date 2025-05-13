// @ts-check

// SVG Icons (ensure these are valid and properly escaped for string literals)
const iconComment = `<svg class="tweet-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 17H14C15.1046 17 16 16.1046 16 15V12C16 10.8954 15.1046 10 14 10H3L2 8H14C16.2091 8 18 9.79086 18 12V15C18 17.2091 16.2091 19 14 19H10L6 23V19H5C3.89543 19 3 18.1046 3 17V14H5M10 13H12V15H10V13Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iconRetweet = `<svg class="tweet-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10L23 7M23 7L20 4M23 7H14C9.58172 7 6 10.5817 6 15C6 16.4876 6.37272 17.8892 7 19M4 14L1 17M1 17L4 20M1 17H10C14.4183 17 18 13.4183 18 9C18 7.51243 17.6273 6.1108 17 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iconHeartOutline = `<svg class="tweet-icon tweet-icon-heart-outline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.62 20.81C12.43 20.9 12.21 20.98 12 20.98C11.79 20.98 11.57 20.9 11.38 20.81C8.49 19.32 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.62 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.51 19.32 12.62 20.81Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iconHeartFilled = `<svg class="tweet-icon tweet-icon-heart-filled" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.62 20.81C12.43 20.9 12.21 20.98 12 20.98C11.79 20.98 11.57 20.9 11.38 20.81C8.49 19.32 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.62 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.51 19.32 12.62 20.81Z"/></svg>`;

document.addEventListener("DOMContentLoaded", async () => {
  const tweetsContainer = document.getElementById("tweets-container");
  const centerContent = document.querySelector(".center-content"); // Get the scrollable container

  if (!tweetsContainer || !centerContent) {
    console.error("Missing #tweets-container or .center-content in DOM.");
    return;
  }

  let currentPage = 1;
  const tweetsPerPage = 12;
  let isLoading = false;
  let allTweetsLoaded = false; // Flag to prevent further requests if all tweets are loaded

  async function fetchAndDisplayTweets(page = 1) {
    if (isLoading || allTweetsLoaded) return;
    isLoading = true;
    // Optional: Add a loading indicator to the UI here

    // Re-check tweetsContainer to satisfy linter, though it's checked above.
    if (!tweetsContainer) {
        console.error("fetchAndDisplayTweets: Missing #tweets-container in DOM.");
        isLoading = false;
        return;
    }

    try {
      // Assuming the backend supports pagination via query params page & limit
      const response = await fetch(`/tweets?page=${page}&limit=${tweetsPerPage}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      /** @type {Array<{ author: string, content: string, createdAt: string, media: string, username: string, avatar: string, likes: number, retweets: number, replies: number, isLiked?: boolean }>} */
      const tweets = await response.json();

      if (tweets.length === 0) {
        allTweetsLoaded = true; // No more tweets to load
        // Optional: Remove loading indicator or display "no more tweets" message
        isLoading = false;
        return;
      }

      tweets.forEach((tweet) => {
        const tweetCard = document.createElement("div");
        tweetCard.className = "tweet-card";

        // Determine initial like state (assuming 'isLiked' might come from backend, default to false)
        const initialIsLiked = tweet.isLiked || false;
        let currentLikes = tweet.likes;

        tweetCard.innerHTML = `
          <div class="tweet-header">
            <img class="tweet-avatar" src="${tweet.avatar}" alt="Avatar" />
            <div>
              <span class="tweet-author">${tweet.author}</span>
              <span class="tweet-handle">${tweet.username}</span>
            </div>
          </div>
          <div class="tweet-content">${tweet.content}</div>
          <div class="tweet-footer">
            <button class="tweet-action-button tweet-action-comment" aria-label="Comment">
              <span class="icon-container">${iconComment}</span> <span class="count">${tweet.replies}</span>
            </button>
            <button class="tweet-action-button tweet-action-retweet" aria-label="Retweet">
              <span class="icon-container">${iconRetweet}</span> <span class="count">${tweet.retweets}</span>
            </button>
            <button class="tweet-action-button tweet-action-like" aria-label="Like" data-liked="${initialIsLiked}">
              <span class="icon-container">${initialIsLiked ? iconHeartFilled : iconHeartOutline}</span> <span class="count">${currentLikes}</span>
            </button>
            <span class="tweet-timestamp">${formatDate(tweet.createdAt)}</span>
          </div>
        `;
        tweetsContainer.appendChild(tweetCard);

        // Add event listener for the like button
        const likeButton = tweetCard.querySelector('.tweet-action-like');
        const likeIconContainer = likeButton?.querySelector('.icon-container');
        const likeCountSpan = likeButton?.querySelector('.count');

        if (likeButton && likeIconContainer && likeCountSpan) {
          likeButton.addEventListener('click', () => {
            const isLiked = likeButton.getAttribute('data-liked') === 'true';
            if (isLiked) {
              likeButton.setAttribute('data-liked', 'false');
              likeIconContainer.innerHTML = iconHeartOutline;
              currentLikes--;
              // TODO: Add API call to unlike
            } else {
              likeButton.setAttribute('data-liked', 'true');
              likeIconContainer.innerHTML = iconHeartFilled;
              currentLikes++;
              // TODO: Add API call to like
            }
            likeCountSpan.textContent = String(currentLikes);
          });
        }
      });

      currentPage = page; // Update current page only after successful load
    } catch (error) {
      console.error("Error fetching tweets:", error);
      // Optional: Display an error message in the UI
    } finally {
      isLoading = false;
      // Optional: Remove loading indicator here
    }
  }

  // Initial load
  fetchAndDisplayTweets(currentPage);

  // Infinite scroll listener
  centerContent.addEventListener("scroll", () => {
    // Check if scrolled to near the bottom
    // (scrollHeight - scrollTop) is the amount of content not yet visible from the top
    // clientHeight is the visible height of the container
    // A small buffer (e.g., 50-100px) makes the loading smoother
    if (centerContent.scrollHeight - centerContent.scrollTop <= centerContent.clientHeight + 100) {
      if (!isLoading && !allTweetsLoaded) {
        fetchAndDisplayTweets(currentPage + 1);
      }
    }
  });
});

/**
 * Formats an ISO timestamp to a readable string.
 * @param {string} isoDate
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
