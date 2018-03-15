pragma solidity ^0.4.17;


contract Swaps {

  mapping(address => bytes20) secretHashes;
  mapping(address => bytes32) private secrets;
  mapping(address => uint) unlockTimes;
  mapping(address => uint256) balances;

  function Swaps() {}

  // TODO remove _unlockTime from arguments
  function open(bytes20 _secretHash, uint _unlockTime) payable {
    require(msg.value > 0);

    secretHashes[msg.sender] = _secretHash;
    unlockTimes[msg.sender] = _unlockTime;
    balances[msg.sender] = msg.value;
  }

  // TODO it's so weird to pass here _ownerAddress
  function withdraw(bytes32 _secret, address _ownerAddress) {
    require(secretHashes[_ownerAddress] == ripemd160(_secret));
    require(now < unlockTimes[_ownerAddress]);

    secrets[_ownerAddress] = _secret;
    msg.sender.transfer(balances[_ownerAddress]);
  }

  function refund() {
    require(now >= unlockTimes[msg.sender]);

    msg.sender.transfer(balances[msg.sender]);
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