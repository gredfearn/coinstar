import React from 'react';
import request from 'superagent';
import { CronJob } from 'cron';

export default class App extends React.Component {
  constructor() {
    super();
    this.state.currencies = ["BTC", "ETH", "NEO", "XLM", "XRP", "ARK"];
    this.state.market = this.buildDefaultState(this.state.currencies);
  }

  buildDefaultState(coins) {
    let state = {};
    coins.forEach(coin => {
      const obj = {
        name: coin,
        value: null,
        up: true
      };

      state[coin] = obj;
    });

    return state;
  }


  fetchPrice(coin) {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=USD,EUR`;
    request
      .get(url)
      .set('accept', 'json')
      .end((err, res) => {
        if(err) {
            console.log(`Error: ${err.message}`);
            return null;
        }

        let market = this.state.market;
        market[coin].up =  market[coin].value < res.body["USD"]
        market[coin].value = res.body["USD"];
        this.setState({ market });
      })
}

  batchCalls(coins) {
    console.log('Coins!', coins);
    let promiseArray = [];
    coins.forEach(coin => {
        promiseArray.push(this.fetchPrice(coin));
    });

    return Promise.all(promiseArray);
  }

  intervalFetchCoins(coins) {
    const job = new CronJob({
       cronTime: '*/10 * * * * *',
       onTick: () => this.batchCalls(coins),
       start: true,
       timeZone: 'America/Chicago',
       runOnInit: true,
     });
    };

  componentWillMount() {
    this.intervalFetchCoins(this.state.currencies);
  }

  render() {
    if (this.state && this.state.market) {
      return (
        <div>
          {this.state.currencies.map((coin, idx) => (
            <div>
              <h1>{this.state.market[coin].name}</h1>
              <h1>{this.state.market[coin].value}</h1>
            </div>
          ))}
        </div>
      )
    }
    return null;
  }
}
