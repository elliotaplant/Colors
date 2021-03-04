import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Color from '../abis/Color.json';

function intToHex(int) {
  return int._hex.replace('0x', '#').toUpperCase()
}

function hexToInt(hex) {
  return parseInt(hex.slice(1), 16);
}

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    this.setState({ account });

    const networkId = await web3.eth.net.getId();
    const networkData = Color.networks[networkId];
    if (networkData) {
      const abi = Color.abi;
      const address = networkData.address;
      this.setState({ contractAddress: address });
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      const totalOwned = await contract.methods.balanceOf(account).call();
      this.setState({ totalOwned });
      // Load Colors
      for (var i = 1; i <= totalOwned; i++) {
        const colorInt = await contract.methods.tokenOfOwnerByIndex(account, i - 1).call();
        this.setState({
          yourColors: [...this.state.yourColors, intToHex(colorInt)]
        });
      }
    } else {
      window.alert('Smart contract not deployed to detected network.');
    }
  }

  mint = colorHex => {
    if (colorHex.length !== 7) {
      return alert(
        'Colors must be a valid, uppercase, six digit hex value starting with a "#" ' +
        '(for example, #AABBCC is valid)'
      );
    }

    if (colorHex[0] !== '#') {
      return alert('Colors must be a start with a "#" character');
    }

    const colorInt = hexToInt(colorHex);
    if (Number.isNaN(colorInt)) {
      return alert('Color is not a valid hex value');
    }

    if (colorInt % 17) {
      return alert(
        'You can only mint colors with double equal pairs for each of the Red, Green, and Blue slots. ' +
        'For example, you can mint "AABBCC", but you cannot mint "AABBCD"'
      );
    }

    this.state.contract.methods
      .mint(colorInt)
      .send({ from: this.state.account })
      .once('receipt', () => {
        this.setState({
          yourColors: [...this.state.yourColors, colorHex]
        });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contractAddress: '',
      contract: null,
      totalOwned: 0,
      yourColors: []
    };
  }

  render() {
    return (
      <div>
        <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
          <a
            className='navbar-brand col-sm-3 col-md-2 mr-0'
            href='http://www.dappuniversity.com/bootcamp'
            target='_blank'
            rel='noopener noreferrer'
          >
            Color Tokens
          </a>
          <ul className='navbar-nav px-3'>
            <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
              <small className='text-white'>
                <span id='account'>{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className='container-fluid mt-5'>
          <div className='row'>
            <main role='main' className='col-lg-12 d-flex text-center'>
              <div className='content mr-auto ml-auto'>
                <h1>Issue Token</h1>
                <i>Contract: {this.state.contractAddress}</i>
                <form
                  onSubmit={event => {
                    event.preventDefault();
                    const color = this.color.value;
                    this.mint(color);
                  }}
                >
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='e.g. #FFFFFF'
                    ref={input => {
                      this.color = input;
                    }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
          <h3>Your colors</h3>
          <div className='row text-center'>
            {this.state.yourColors.map((color, key) => {
              return (
                <div key={key} className='col-md-3 mb-3'>
                  <div
                    className='token'
                    style={{ backgroundColor: color }}
                  ></div>
                  <div>{color}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
