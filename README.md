# worwormeileistung

Data extraction and analysis project for stenographic protocols of sessions in the Austrian parlament. See [woswormeileistung.marioslab.io](https://woswormeileistung.marioslab.io) for more information.

### Data extraction

You can run the data extraction pipeline locally to generate the `persons.json` and `sessions.json` files yourself.

1. Install NodeJS +19
2. Run `npm run build`
3. Run `node build/sessions.js`

You can find the files in the `data/` directory after successful completion.

### Development

1. Install & run Docker
2. Install NodeJS +19

```
npm run dev
```

In VS Code run the `dev`` launch configurations.
