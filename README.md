# Quote of the Week

This is the source code of the Commonwealth's student-run Quote of the Week website.

It is built using React.js and Redux with a Google Firebase backend, and the search functionalities are provided by Algolia.

## Getting Started

### Requirements

First of all, if you want to contribute to the project, contact me or a current editor to give you the relevant secret keys and your Google account the appropriate user privileges.

Install [Node.js](https://nodejs.org/en/download/), and use it to install React by running

```npm install -g create-react-app```

Install the firebase CLI by running

```npm install -g firebase-tools```

Then sign into Firebase using your Google account by running

```firebase login```

Clone this repository and cd into it. Install the npm packages for both the root directory (for the frontend) and the `functions` directory.

```npm install && cd functions && npm install```

Now that you're in the `functions` directory, run

```firebase functions:config:get > .runtimeconfig.json```

to clone the environmental variables set on the cloud to your local machine for development.

Then, cd back to the root directory and copy `the .env.exmaple` file

```cp .env.example .env```

And populate the resulting `.env` file with real values (which I will provide you with). This is for setting up the API keys for Algolia.

### Local Development

My preferred setup is to have two shells open to the root directory of the project. On one, run `npm start` for the React development server. On another, run `firebase emulators:start --only functions` to start the function emulators.

If you also want to run an emulator of firestore us the command `firebase emulators:start --only functions,firestore --export-on-exit=./saved-data --import=./saved-data` instead.

You may access the [Firebase cloud console](https://console.firebase.google.com/) to play with the database or the [Algolia console](https://www.algolia.com/apps/DLRD60KG2Y) to work with the search indices (sign in with the account that I'll provide you with). 

To deploy the build, simply run

```firebase deploy```

## Code Structure

The website frontend's source code is in `src`, and the Firebase cloud functions code is available in `functions`. `public` provides some static files for React to build the website with. 