Direct Assemblée - server side : the API
===============

This application serves the data from the MySQL database built with the [scraper](https://github.com/direct-assemblee/DirectAssemblee-sraper).

## Setup

### Building the code

1. Install the development environment :

- Install [Node.js](https://nodejs.org/en/download/package-manager/)
- Install [npm5](https://www.npmjs.com/package/npm5
- Install [sails](https://sailsjs.com/get-started) :
    ```shell
    npm install -g sails
    ```

2. Clone the repository:
    ```shell
    git clone <URL>
    ```

3. Install the project dependencies:
    ```shell
    npm install
    ```

4. Launch the scraper :
    ```shell
    sails lift
    ```

  /!\ If you are running the scraper at the same time, make sure to launch this app on another port : `sails lift --port 1328` for example.

5. This project uses Firebase for push notifications. See **Firebase** section below to configure project.

6. This project uses reverse geocoding APIs. Mostly [data.gouv.fr](https://adresse.data.gouv.fr/api), and sometimes [Google Maps API](https://developers.google.com/maps/documentation/javascript/tutorial) (when we couldn't get results with `data.gouv.fr`). See **Google Maps API** section below to configure project.

###  Firebase

This project uses Firebase. It sends push notifications:
- when a deputy has a new work (written question, law proposal)
- when new ballots occur : they are summed up in a single daily notification

You should register your own Firebase account and generate `firebase_service_account.json` file if you want to use push notifications. We use two Firebase projects : one for the development environment and one for production.

So, the existing configuration use two `firebase_service_account.json` files. You can store them in the `config` folder and add a reference in the `config/env/production.js` and `config/env/development.js` files together with the server key:

    ```shell
    firebase: {
      configFile: 'firebase_service_account.json',
      serverKey: 'AAAA.....dkjkf',
    }
    ```

###  Google Maps API

This project uses Google Maps API for reverse geocoding, when [data.gouv.fr](https://adresse.data.gouv.fr/api) don't give us results.

If you want to keep it, you should get your own `api key` from Google. You can store it in `config/env/production.js` and `config/env/development.js`.
    ```shell
    gmap: {
      key: 'AI...xxxx'
    },
    ```

##  Contribute

Pull request are more than welcome ! If you want to do it, use a feature branch and please make sure to use a descriptive title and description for your pull request.

The project uses unit tests. You must update them depending on your changes in the code. All unit tests should pass after your pull request.


## License

Direct Assemblée api is under the AGPLv3.

See  [LICENSE](https://github.com/direct-assemblee/DirectAssemblee-api/blob/master/LICENSE)  for more license info.

## Contact

For any question or if you need help, you can send contact us at contact@direct-assemblee.org.
