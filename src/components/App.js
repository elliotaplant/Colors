import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Color from '../abis/Color.json';

function intToHex(int) {
  return '#' + int._hex.slice(2).padStart(6, '0').toUpperCase();
}

function hexToInt(hex) {
  return parseInt(hex.slice(1), 16);
}

function expectedBlend(color1, color2) {
  let newColor = '#';
  for (let i = 1; i < color1.length; i += 2) {
    const partialAsInt1 = parseInt(color1[i] + color1[i+1], 16);
    const partialAsInt2 = parseInt(color2[i] + color2[i+1], 16);
    newColor += Math.floor((partialAsInt1 + partialAsInt2)/2).toString(16).toUpperCase();
  }
  return newColor;
}

async function sendTransaction(txn) {
  if (window.ethereum) {
    const txnHash = await window.ethereum.request({
       method: 'eth_sendTransaction',
       params: [txn]
    })
    return window.web3.eth.getTransactionReceipt(txnHash);
  } else if (window.web3) {
    return window.web3.eth.sendTransaction(txn);
  }
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

  mint = async (colorHex) => {
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
        'For example, you can mint "#AABBCC", but you cannot mint "#AABBCD"'
      );
    }

    this.setState({ currentlyMinting: colorHex });
    try {
      await sendTransaction({
        from: this.state.account,
        to: this.state.contractAddress,
        data: this.state.contract.methods.mint(colorInt).encodeABI()
      });
      this.setState({
        yourColors: [...this.state.yourColors, colorHex]
      });
    } catch (e) {
      alert('Error minting your color')
      console.error(e);
    }
  };

  setBlend = async (color) => {
    const newColors = [...this.state.blendColors, color];
    if (newColors.length === 2) {
      const expectedColor = expectedBlend(...newColors);
      this.setState({ currentlyBlending: newColors });
      try {
        await sendTransaction({
          from: this.state.account,
          to: this.state.contractAddress,
          data: this.state.contract.methods.blend(hexToInt(newColors[0]), hexToInt(newColors[1])).encodeABI()
        });
        this.setState({ yourColors: [...this.state.yourColors, expectedColor] });
      } catch (e) {
        alert('Error blending your colors');
      }
      this.setState({ currentlyBlending: null, blendColors: [] })
    } else {
      this.setState({ blendColors: [color] });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contractAddress: '',
      contract: null,
      totalOwned: 0,
      yourColors: [],
      blendColors: [],
      currentlyBlending: null,
      currentlyMinting: null,
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
                <h3>Rules</h3>
                <ul className='text-left'>
                  <li>Only colors of the format #RRGGBB can be minted. To create other colors, you must blend existing colors.</li>
                  <li>You can't mint a color that someone has already minted or created from blending.</li>
                </ul>
                <i>Contract: {this.state.contractAddress}</i>
              </div>
            </main>
          </div>
          <hr />
          <h3>Your colors</h3>
          {this.state.currentlyMinting && <p>Minting {this.state.currentlyMinting}</p>}
          {
            this.state.currentlyBlending &&
              <p>
                Blending {this.state.currentlyBlending[0]} and {this.state.currentlyBlending[1]} into {expectedBlend(this.state.currentlyBlending[0], this.state.currentlyBlending[1])}

              </p>
            }
          <div className='row text-center'>
            {this.state.yourColors.map((color, key) => {
              return (
                <div key={key} className='col-md-3 mb-3'>
                  <div
                    className={'token' + (this.state.blendColors.includes(color) ? ' selected' : '')}
                    style={{ backgroundColor: color }}
                    onClick={() => this.setBlend(color)}
                  >Blend</div>
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
