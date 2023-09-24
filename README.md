# SB102Bot :house_with_garden: :construction_worker:

**NOTE: This entire description was written by `ChatGPT`.**

. |||||||||||||||||
./  ~___~    ~___~ \
.| ,-----.  ,-----. |
.| |  O  |  |  O  | |
.| '-----'  '-----' | 
.|         \        |
.|         oo'      |
.|   |'vvvvvvvv'|   /
. \   '^^^^^^^^'   /
.  '-------+------'
.          |
.      ==\ | /==
.         \|/
.          |
.         /\
.     __/   \__
  
## Introduction
SB102Bot is a Flask-based web application designed for real estate developers in South Florida. It allows you to enter an address and magically reveals the maximum allowable development intensity for multifamily construction at that address. Yup, it's like having your own underwriting assistant who never sleeps.

> "Making South Florida's real estate development as easy as 1-2-3, or well, SB-102!"

## Features :sparkles:

- **Address Input**: Just type in the address, and hit "Underwrite". It's that simple.
- **Geocoding & Reverse Geocoding**: We find out where on Earth your property is.
- **Density Analysis**: The maximum allowable residential density for that location. Get those units!
- **Walk Score**: Because nobody wants to live where you can't walk to a café.
- **Maps & Street View**: See the property from space! Or at least from Google's satellites and cars.
- **Intuitive UI**: We've put in hours of work to make it look like we didn't put in any work at all.
  
## How it Works :gear:

1. The frontend uses Vanilla JS to capture your address.
2. The backend is a Flask app deployed on Vercel.
3. We use Google Maps API for geocoding and fetching those sweet, sweet map images.
4. Our Python backend does all the heavy lifting, fetching density data and walk scores.
5. The results are displayed in a neat HTML report. Right in your browser. Instantly.

## Code Structure :file_folder:

- **public/script2.js**: The JavaScript magic wand. Handles UI changes and API calls.
- **public/index.html**: Where HTML elements come to life.
- **api/analyze_address.py**: The Flask endpoint that ties everything together.

## Setup :wrench:

To get this project running locally:

1. Clone the repository.
2. Obtain API keys for Google Maps and insert them in `script2.js` and `analyze_address.py`.
3. Run `flask run` in the root directory.

## Humor Segment :clown_face:

> Why did the developer go broke?
> 
> Because he kept using `window.alert()` and it kept blocking his income!

## Credits :clap:

- Developer: [Oyoops](https://twitter.com/oyoops)
- Inspiration: The confusing yet fascinating world of South Florida real estate.

## Last Words :memo:

If you find a bug, don't keep it; let us know! If you don't find a bug, well, you're not looking hard enough.

_Last Updated: Sept. 21, 2023_
