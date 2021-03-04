pragma solidity 0.5.0;

import "./ERC721Full.sol";

contract Color is ERC721Full {
  constructor() ERC721Full("Color", "COLOR") public {
  }

  // E.G. color = 16777215 == "#FFFFFF"
  function mint(uint32 _color) public {
    require(!_exists(_color), "Color already exists");
    require(_color >= 0 && _color <= 16777215, "Color must be between 0 and 16777215 (#FFFFFF)");
    require(_color % 17 == 0, "Color % 17 must be zero");
    _mint(msg.sender, _color);
  }

  function blend(uint32 _color1, uint32 _color2) public {
    require(ownerOf(_color1) == msg.sender && ownerOf(_color2) == msg.sender, "You must own both tokens to blend them");

    uint32 _blue1 = _color1 % 256;
    uint32 _blue2 = _color2 % 256;
    uint32 _newBlue = (_blue1 + _blue2) / 2;

    uint32 _green1 = (_color1 / 256) % 256;
    uint32 _green2 = (_color2 / 256) % 256;
    uint32 _newGreen = (_green1 + _green2) / 2;

    uint32 _red1 = (_color1 / 65536) % 256;
    uint32 _red2 = (_color2 / 65536) % 256;
    uint32 _newRed = (_red1 + _red2) / 2;

    uint32 _newColor = _newRed * 65536 + _newGreen * 256 + _newBlue;

    require(!_exists(_newColor), "Color already exists");
    require(_newColor >= 0 && _newColor <= 16777215, "Color must be between 0 and 16777215 (#FFFFFF)");
    _mint(msg.sender, _newColor);
  }
}
