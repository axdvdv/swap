pragma solidity ^0.4.23;

contract Rating {

  // owner - EthToBtcSwaps Contract
  address owner;
  mapping(address => int) ratings;

  constructor(address _ownerAddress) public {
    owner = _ownerAddress;
  }

  function change(address _userAddress, int _delta) public {
    require(msg.sender == owner);
    ratings[_userAddress] += _delta;
  }

  function getMy() public view returns (int) {
    return ratings[msg.sender];
  }

  function get(address _userAddress) public view returns (int) {
    return ratings[_userAddress];
  }
}

contract EthToBtcSwaps {

  address owner;
  address ratingContractAddress;

  enum Statuses {opened, withdrawn,  refunded, closed}

  struct Swap {
    Statuses status;
    bytes32 secret;
    bytes20 secretHash;
    uint256 lockTime;
    uint256 balance;
  }

  // ETH Owner => BTC Owner => Swap
  mapping(address => mapping(address => Swap)) swaps;

  constructor() public {
    owner = msg.sender;
  }

  function setRatingAddress(address _ratingContractAddress) public {
    require(owner == msg.sender);
    ratingContractAddress = _ratingContractAddress;
  }

  function changeRating(address _user, int _value) internal {
    Rating(ratingContractAddress).change(_user, _value);
  }

  // ETH Owner creates Swap with secretHash
  // 0xc0933f9be51a284acb6b1a6617a48d795bdeaa80, "0xf610609b0592c292d04C59d44244bb6CB41C59bd", 1841171580000
  function Create(bytes20 _secretHash, address _participantAddress, bytes _sign) public payable {
    uint lockTime = now + 3 * 24 * 60 * 60;
    address _signer = recoverSigner(keccak256(msg.sender, _secretHash, lockTime), _sign);
    require(_signer == _participantAddress); 
    swaps[msg.sender][_participantAddress] = Swap(
      Statuses.opened,
      bytes32(0),
      _secretHash,
      lockTime,
      msg.value
    );
  }

  // "0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF", "0xf610609b0592c292d04C59d44244bb6CB41C59bd"
  function getInfo(address _ownerAddress, address _participantAddress) public view returns (Statuses, bytes32,  bytes20,  uint,  uint256) {
    Swap memory swap = swaps[_ownerAddress][_participantAddress];

    return (swap.status, swap.secret, swap.secretHash, swap.lockTime, swap.balance);
  }

  // BTC Owner withdraw money
  // ETH Owner receive +1 reputation
  // 0xc0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078, "0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF"
  function withdraw(bytes32 _secret, address _ownerAddress) public {
    Swap memory swap = swaps[_ownerAddress][msg.sender];

    require(swap.balance > 0);
    require(swap.secretHash == ripemd160(_secret));

    msg.sender.transfer(swap.balance);
    swaps[_ownerAddress][msg.sender].secret = _secret;
    swaps[_ownerAddress][msg.sender].status = Statuses.withdrawn;
    changeRating(msg.sender, 1);
  }

  // ETH Owner refund money
  // BTC Owner gets -1 reputation
  function refund(address _participantAddress, bytes _sign) public {
    Swap memory swap = swaps[msg.sender][_participantAddress];
    address _signer = recoverSigner(keccak256(msg.sender, swap.secretHash, swap.lockTime), _sign);
    require(_signer == _participantAddress);  
    require(swap.status == Statuses.opened);
    require(now >= swap.lockTime);
    msg.sender.transfer(swap.balance);
    changeRating(_participantAddress, -1);
    clean(msg.sender, _participantAddress);
  }

  // "0xf610609b0592c292d04C59d44244bb6CB41C59bd"
  function getSecret(address _participantAddress) public view returns (bytes32) {
    return swaps[msg.sender][_participantAddress].secret;
  }

  function unsafeGetSecret(address _ownerAddress, address _participantAddress) public view returns (bytes32) {
    return swaps[_ownerAddress][_participantAddress].secret;
  }

  // ETH Owner receive secret
  // BTC Owner receive +1 reputation
  // "0xf610609b0592c292d04C59d44244bb6CB41C59bd"
  function close(address _participantAddress) public {
    Swap memory swap = swaps[msg.sender][_participantAddress];
    changeRating(msg.sender, 1);
    clean(msg.sender, _participantAddress);
  }

  function clean(address _ownerAddress, address _participantAddress) internal {
    delete swaps[_ownerAddress][_participantAddress];
  }

  function recoverSigner(bytes32 h, bytes signature) public pure returns(address) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        (r, s, v) = signatureSplit(signature);
        return ecrecover(h, v, r, s);
  }

  function signatureSplit(bytes signature) internal pure returns(bytes32 r, bytes32 s, uint8 v) {
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 0xff)
        }
        require(v == 27 || v == 28);
  }
}
