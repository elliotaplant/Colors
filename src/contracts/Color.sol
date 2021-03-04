pragma solidity 0.5.0;

import "./ERC721Full.sol";

contract Color is ERC721Full {
  string[] public colors;
  mapping(string => bool) _colorExists;

  constructor() ERC721Full("Color", "COLOR") public {
  }

  // E.G. color = "#FFFFFF"
  function mint(string memory _color) public {
    require(!_colorExists[_color]);
    bytes memory _colorBts = bytes(_color);
    require(_colorBts.length == 7, "New colors must have 7 characters");
    require(_colorBts[0] == "#", "New colors must start with a # character");
    for (uint i = 1; i < 7; i += 2) {
      require(_colorBts[i] >= "0" && _colorBts[i] <= "F", "New colors must use valid Hex digits");
      require(_colorBts[i] == _colorBts[i+1], "New colors must have the format #AABBCC");
    }

    require(_colorBts[0] == "#");
    uint _id = colors.push(_color);
    _mint(msg.sender, _id);
    _colorExists[_color] = true;
  }

  // E.G. color = "#FFFFFF"
  function blend(string memory _color1, string memory _color2) public {
  }

}
