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
}
