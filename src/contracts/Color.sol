pragma solidity 0.5.0;

import "./ERC721Full.sol";

contract Color is ERC721Full {
  string[] public colors;
  mapping(string => uint) _colorToId;

  constructor() ERC721Full("Color", "COLOR") public {
  }

  // E.G. color = "#FFFFFF"
  function mint(string memory _color) public {
    require(_colorToId[_color] == 0, "Color already exists");
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
    _colorToId[_color] = _id;
  }

  // E.G. color = "#FFFFFF"
  function blend(string memory _color1, string memory _color2) public {
    // make sure caller owns both tokens
    uint _id1 = _colorToId[_color1];
    uint _id2 = _colorToId[_color2];
    require(ownerOf(_id1) == msg.sender && ownerOf(_id2) == msg.sender, "You must own both colors to blend them");

    // calculate new color
    string memory _newColor = innerBlend(_color1, _color2);

    // check if new color exists
    require(_colorToId[_newColor] == 0, "Color already exists");

    // create new token and give it to caller
    uint _id = colors.push(_newColor);
    _mint(msg.sender, _id);
    _colorToId[_newColor] = _id;
  }

  function innerBlend(string memory _color1, string memory _color2) private returns (string memory color) {
    // Convert strings to bytes for index access
    bytes memory _colorBts1 = bytes(_color1);
    bytes memory _colorBts2 = bytes(_color2);

    bytes memory _newColor = bytes("#000000");

    for (uint i = 1; i < 7; i += 2) {
      _newColor[i] = (_colorBts1[i] + _colorBts1[i + 1]) / 2;
    }

    return string(_newColor);
  }

}
