const Color = artifacts.require('./Color.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Color', (accounts) => {
  let contract

  before(async () => {
    contract = await Color.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = contract.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await contract.name()
      assert.equal(name, 'Color')
    })

    it('has a symbol', async () => {
      const symbol = await contract.symbol()
      assert.equal(symbol, 'COLOR')
    })
  })

  describe('minting', async () => {

    it('creates a new token', async () => {
      const expected = hexToInt('#EEBBDD')
      const result = await contract.mint(expected)
      const totalSupply = await contract.totalSupply()
      // SUCCESS
      assert.equal(totalSupply, 1)
      const event = result.logs[0].args
      assert.equal(event.tokenId.toNumber(), expected, 'id is correct')
      assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
      assert.equal(event.to, accounts[0], 'to is correct')

      // FAILURE: cannot mint same color twice
      await contract.mint(expected).should.be.rejected;
    })

    it('only mints valid hex colors', async () => {
      await contract.mint('not a color').should.be.rejected; // must be the right length
      await contract.mint(hexToInt('#AABBCCDD')).should.be.rejected; // must be the right length
      await contract.mint(hexToInt('#-11111')).should.be.rejected; // no negative numbers
      await contract.mint(hexToInt('#CLOSEB')).should.be.rejected; // only valid letters allowed
      await contract.mint(hexToInt('#ABCDEG')).should.be.rejected; // only valid letters allowed
      await contract.mint(hexToInt('#123abc')).should.be.rejected; // uppercase only
      await contract.mint(hexToInt('#112234')).should.be.rejected; // new colors must have AABBCC format
    })
  })

  describe('indexing', async () => {
    it('lists colors', async () => {
      const colors = ['#AABBCC', '#FFFFFF', '#000000'];
      const intColors = colors.map(hexToInt)
      // Mint 3 more tokens
      for (const color of intColors) {
        await contract.mint(color);
      }

      const tokenCount = await contract.balanceOf(accounts[0])

      let result = [];

      for (var i = tokenCount - colors.length; i < tokenCount; i++) {
        const colorInt = await contract.tokenOfOwnerByIndex(accounts[0], i);
        result.push(colorInt)
      }

      const hexResult = result.map(intToHex);
      expect(hexResult).to.deep.equal(colors);
    })
  })

  describe('blending', async () => {
    it('blends colors', async () => {
      // const color1 = '#001122';
      // const color2 = '#DD99BB';
      // const expected = '#6F556F';
      // // Mint 3 more tokens
      // await contract.mint(color1);
      // await contract.mint(color2);
      //
      // await contract.blend(color1, color2);
      //
      // const totalSupply = await contract.totalSupply()
      //
      // let result = [];
      //
      // for (var i = totalSupply - colors.length; i < totalSupply; i++) {
      //   const color = await contract.colors(i);
      //   result.push(color)
      // }
      //
      // expect(result).to.deep.equal([color1, color2, expected]);
    })
  })
})

function hexToInt(hex) {
  return parseInt(hex.slice(1), 16);
}

function intToHex(int) {
  return '#' + int.toString(16).padStart(6, '0').toUpperCase();
}
