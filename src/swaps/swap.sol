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

  struct Swap {
    bytes32 secret;
    bytes20 secretHash;
    uint lockTime;
    uint256 balance;
  }

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
  function sign(address participantAddress) {
    signs[msg.sender][participantAddress] = 1;
  }

  // ETH Owner (0x2) checks if BTC Owner (0x1) signed
  // returns signs[0x1][0x2] // 1
  function checkIfSigned(address participantAddress) constant returns (uint) {
    return signs[participantAddress][msg.sender];
  }

  // ETH Owner creates Swap with secretHash
  function create(bytes20 _secretHash, address _participantAddress) payable {
    require(signs[_participantAddress][msg.sender] == 1);

    uint lockTime = now + 3 * 24 * 60 * 60;

    swaps[msg.sender][_participantAddress] = Swap(
      0x00000000000000000000000000000000000000000000000000000000000000',
      _secretHash,
      lockTime,
      msg.value
    );
  }

  // BTC Owner withdraw money
  // ETH Owner receive +1 reputation
  function withdraw(bytes32 _secret, address _ownerAddress) {
    Swap memory swap = swaps[_ownerAddress][msg.sender];

    require(swap.secretHash == ripemd160(_secret));

    swap.secret = _secret;
    msg.sender.transfer(swap.balance);
    Rating(ratingContractAddress).change(_ownerAddress, 1);
  }

  // ETH Owner refund money
  // BTC Owner gets -1 reputation
  function refund(address _participantAddress) {
    Swap memory swap = swaps[msg.sender][_participantAddress];

    require(now >= swap.lockTime);

    msg.sender.transfer(swap.balance);
    Rating(ratingContractAddress).change(_participantAddress, -1);
    clean(msg.sender, _participantAddress);
  }

  // ETH Owner receive secret
  // BTC Owner receive +1 reputation
  function getSecret(address _participantAddress) constant returns (bytes32) {
    Swap memory swap = swaps[msg.sender][_participantAddress];

    clean(msg.sender, _participantAddress);
    Rating(ratingContractAddress).change(_participantAddress, 1);

    return swap.secret;
  }

  function clean(address _ownerAddress, address _participantAddress) internal {
    delete swaps[_ownerAddress][_participantAddress];
    delete signs[_ownerAddress][_participantAddress];
    delete signs[_participantAddress][_ownerAddress];
  }
}


// OLD ========================================================== /

contract Swaps {

  address ratingContractAddress;
  mapping(address => bytes20) secretHashes;
  mapping(address => bytes32) private secrets;
  mapping(address => uint) unlockTimes;
  mapping(address => uint256) balances;

  function Swaps() {
    ratingContractAddress = new Rating();
  }

  // TODO remove _unlockTime from arguments
  function open(bytes20 _secretHash, uint _unlockTime) payable {
    require(msg.value > 0);

    secretHashes[msg.sender] = _secretHash;
    unlockTimes[msg.sender] = _unlockTime;
    balances[msg.sender] = msg.value;
  }

  function withdraw(bytes32 _secret, address _ownerAddress) {
    require(secretHashes[_ownerAddress] == ripemd160(_secret));
    require(now < unlockTimes[_ownerAddress]);

    secrets[_ownerAddress] = _secret;
    msg.sender.transfer(balances[_ownerAddress]);
  }

  function refund() {
    require(now >= unlockTimes[msg.sender]);

    msg.sender.transfer(balances[msg.sender]);
    Rating(ratingContractAddress).update();
    clean(msg.sender);
  }

  function getSecret() constant returns (bytes32) {
    return secrets[msg.sender];
    clean(msg.sender);
  }
  
  function clean(address ownerAddress) internal {
    delete secretHashes[ownerAddress];
    delete secrets[ownerAddress];
    delete unlockTimes[ownerAddress];
    delete balances[ownerAddress];
  }
}