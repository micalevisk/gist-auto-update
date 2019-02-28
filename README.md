## Development
```bash
## install global dependencies
$ npm install -g typescript
$ npm install -g wt-cli ## install Webtask.io CLI
```

```bash
$ npm install
$ touch .env ## and set variables like `.env.example`
$ npm start
## go to http://localhost:1234
```

## Deploy
> to avoid this issue: [auth0/wt-cli](https://github.com/auth0/wt-cli/issues/157)
```bash
$ npm run deploy
## and go to https://webtask.io/make to manually update the Scheduler on GUI
```
