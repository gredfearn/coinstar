import React from 'react';
import request from 'superagent';

export default class App extends React.Component {
	constructor() {
		super();
		this.state.currencies = ["BTC", "ETH", "NEO", "XLM", "XRP", "ARK"];
		this.state.market = this.buildDefaultState(this.state.currencies);
	}

	buildDefaultState(coins) {
		let state = {};
		coins.forEach(coin => {
		const	obj = {
				name: coin,
				value: null,
				up: true
			};

			state[coin] = obj;
		})

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
		let promiseArray = [];
		coins.forEach(coin => {
			promiseArray.push(this.fetchPrice(coin));
		})

		return Promise.all(promiseArray);
	}

	componentWillMount() {
		this.batchCalls(this.state.currencies);
	}

	render() {
		console.log('this.state!', this.state);
    return (
      <div>
        <h1>Hello World</h1>
      </div>
    );
  }
}
