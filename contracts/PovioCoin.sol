// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

contract PovioCoin {

  //The max number
  uint256 constant private MAX_UINT256 = 2**256 - 1;
  //Mapping is like an object that has key => value 
  //Value can be a struct or it can be another mapping inside of it
  mapping (address => uint) balances;
  mapping (address => mapping (address => uint256)) public allowed;

  // Events stores the arguments passed in transaction logs.
  // These logs are stored on blockchain and are accessible using address of the contract till the contract is present on the blockchain
  // solhint-disable-next-line no-simple-event-func-name
  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  constructor() {
    balances[msg.sender] = 1000;
  }

  // When you define a function you also have to tell what it will return
  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balances[msg.sender] >= _value, "Influence balance" );
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    emit Transfer(msg.sender, _to, _value); //solhint-disable-line indent, no-unused-vars
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      uint256 allowanceBalance = allowed[msg.sender][_from];
      require(balances[_from] >= _value && allowanceBalance >= _value);
      balances[_to] += _value;
      balances[_from] -= _value;
      if (allowanceBalance < MAX_UINT256) {
          allowed[_from][msg.sender] -= _value;
      }
      emit Transfer(_from, _to, _value); //solhint-disable-line indent, no-unused-vars
      return true;
  }
  
  // View functions ensure that they will not modify the state
  function balanceOf(address _owner) public view returns (int balance) {
      return int(balances[_owner]);
  }

  function approve(address _spender, uint256 _value) public returns (bool success) {
      allowed[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value); //solhint-disable-line indent, no-unused-vars
      return true;
  }

  function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
      return allowed[_owner][_spender];
  }
}
