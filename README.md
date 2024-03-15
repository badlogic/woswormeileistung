# worwormeileistung

Data extraction and analysis project for stenographic protocols of sessions in the Austrian parlament. See [woswormeileistung.marioslab.io](https://woswormeileistung.marioslab.io) for more information.

### Data extraction

You can run the data extraction pipeline locally to generate the `persons.json` and `sessions.json` files yourself.

1. Install NodeJS +19
2. Run `npm run build`
3. Run `node build/process-data.js`

You can find these files in the `data/` directory after successful completion:

-   `persons.json`: all persons who spoke in parlament, with or without mandate, since December 2002
-   `sessions.json`: all sessions since December 2002
-   `plaque.json`: list of persons who put plaques on the speakers podium during their speach, including the number of plaques and their content if available
-   `missing.json`: list of sessions, each with a list of persons who were reported abscent during that session, as well as the session transcript source text from which abscences were extracted.
-   `screamers.json`: list of call outs by persons during speeches of other persons.

### Development

1. Install & run Docker
2. Install NodeJS +19

```
npm run dev
```

In VS Code run the `dev`` launch configurations.
