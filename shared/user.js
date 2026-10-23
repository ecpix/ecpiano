// Who is using the app. Everyone is anonymous for now.
// Later this will hold the Google account (name, a chosen nickname for leaderboards) and
// trigger cloud sync; the rest of the app only asks `User` and does not need to change.
const User = {
  isSignedIn() { return false; },
  current() { return { anonymous: true }; },
};
