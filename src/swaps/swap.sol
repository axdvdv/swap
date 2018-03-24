pragma solidity ^0.4.17;


contract Rating {

  // owner - EthToBtcSwaps Contract
  address owner;
  mapping(address => int) ratings;

  function Rating() {
    owner = msg.sender;
  }

  function change(address _userAddress, int _delta) {
    require(msg.sender == owner);
    ratings[_userAddress] += _delta;
  }

  function getMy() constant returns (int) {
    return ratings[msg.sender];
  }

  function get(address _userAddress) constant returns (int) {
    return ratings[_userAddress];
  }
}

contract EthToBtcSwaps {

  address ratingContractAddress;

  struct Statuses {
  uint opened;
  uint withdrawn;
  uint refunded;
  uint closed;
  }

  struct Swap {
  uint status;
  bytes32 secret;
  bytes20 secretHash;
  uint lockTime;
  uint256 balance;
  }

  Statuses statuses = Statuses(1, 2, 3, 4);

  // ETH Owner => BTC Owner => 1
  mapping(address => mapping(address => uint)) signs;
  // ETH Owner => BTC Owner => Swap
  mapping(address => mapping(address => Swap)) swaps;


  function Swaps() {
    ratingContractAddress = new Rating();
  }

  // BTC Owner (0x1) signs order with ETH Owner (0x2)
  // signs[0x1][0x2] = 1
  // ------------------------------------------------
  // ETH Owner (0x2) signs order with BTC Owner (0x1)
  // signs[0x2][0x1] = 1
  // 0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF
  // 0xf610609b0592c292d04C59d44244bb6CB41C59bd
  function sign(address participantAddress) {
    signs[msg.sender][participantAddress] = 1;
  }

  // ETH Owner (0x2) checks if BTC Owner (0x1) signed
  // returns signs[0x1][0x2] // 1
  function checkIfSigned(address _participantAddress) constant returns (uint) {
    return signs[_participantAddress][msg.sender];
  }

  // ETH Owner creates Swap with secretHash
  // 0xc0933f9be51a284acb6b1a6617a48d795bdeaa80, "0xf610609b0592c292d04C59d44244bb6CB41C59bd", 1841171580000
  function create(bytes20 _secretHash, address _participantAddress, uint _lockTime) payable {
    require(signs[_participantAddress][msg.sender] == 1);

    swaps[msg.sender][_participantAddress] = Swap(
    statuses.opened,
    0x00000000000000000000000000000000000000000000000000000000000000,
    _secretHash,
    _lockTime,
    msg.value
    );
  }

  // BTC Owner can check Swap balance
  function getBalance(address _ownerAddress) constant returns (uint256) {
    return swaps[_ownerAddress][msg.sender].balance;
  }

  // BTC Owner withdraw money
  // ETH Owner receive +1 reputation
  // 0xc0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078, "0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF"
  function withdraw(bytes32 _secret, address _ownerAddress) {
    Swap memory swap = swaps[_ownerAddress][msg.sender];

    require(swap.status == statuses.opened);
    require(swap.secretHash == ripemd160(_secret));

    msg.sender.transfer(swap.balance);
    Rating(ratingContractAddress).change(msg.sender, 1);
    swaps[_ownerAddress][msg.sender].secret = _secret;
    swaps[_ownerAddress][msg.sender].status = statuses.withdrawn;
  }

  // ETH Owner refund money
  // BTC Owner gets -1 reputation
  function refund(address _participantAddress) {
    Swap memory swap = swaps[msg.sender][_participantAddress];

    require(swap.status == statuses.opened);
    require(now >= swap.lockTime);

    msg.sender.transfer(swap.balance);
    clean(msg.sender, _participantAddress);
    Rating(ratingContractAddress).change(_participantAddress, -1);
    swaps[msg.sender][_participantAddress].status = statuses.refunded;
  }

  function getSecret(address _participantAddress) constant returns (bytes32) {
    return swaps[msg.sender][_participantAddress].secret;
  }

  // ETH Owner receive secret
  // BTC Owner receive +1 reputation
  // 0xf610609b0592c292d04C59d44244bb6CB41C59bd
  function close(address _participantAddress) {
    Swap memory swap = swaps[msg.sender][_participantAddress];

    clean(msg.sender, _participantAddress);
    Rating(ratingContractAddress).change(msg.sender, 1);
    swaps[msg.sender][_participantAddress].status = statuses.closed;
  }

  function clean(address _ownerAddress, address _participantAddress) internal {
    delete swaps[_ownerAddress][_participantAddress];
    delete signs[_ownerAddress][_participantAddress];
    delete signs[_participantAddress][_ownerAddress];
  }
}
