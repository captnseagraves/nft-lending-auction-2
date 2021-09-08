pragma solidity ^0.8.0;

// ============ Imports ============

import "./SafeMath.sol";
import "./IERC721.sol";
import "hardhat/console.sol";


contract LendingAuction{
    // ============ Structs ============

    // Individual loan
    struct Loan {
        // NFT token address
        address tokenAddress;
        // NFT token owner (loan initiator or 0x0 for repaid)
        address tokenOwner;
        // Current top lender/bidder
        address lender;
        // NFT token id
        uint256 tokenId;
        // Fixed interest rate
        uint256 interestRate;
        // Current max bid
        uint256 loanAmount;
        // Maximum bid
        uint256 maxLoanAmount;
        // Current loan utilization
        uint256 loanAmountDrawn;
        // Timestamp of first bid
        uint256 firstBidTime;
        // Timestamp of last bid
        uint256 lastBidTime;
        // Interest paid by top bidder, thus far
        uint256 historicInterest;
        // Timestamp of loan completion
        uint256 loanCompleteTime;
    }

    // ============ Mutable storage ============

    // Number of loans issued
    uint256 public numLoans;
    // Mapping of loan number to loan struct
    mapping(uint256 => Loan) public loans;

    // ============ Events ============

  // Loan creation event with indexed NFT owner
  event LoanCreated(
    uint256 loanId,
    address indexed owner,
    address tokenAddress,
    uint256 tokenId,
    uint256 maxLoanAmount,
    uint256 loanCompleteTime
  );

    // ============ Functions ============

    function createLoan(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _interestRate,
        uint256 _maxLoanAmount,
        uint256 _loanCompleteTime
    ) external returns (uint256) {
        console.log("_tokenAddress", _tokenAddress);
        console.log("_tokenId", _tokenId);
        console.log("_interestRate", _interestRate);
        console.log("_maxLoanAmount", _maxLoanAmount);
        console.log("_loanCompleteTime", _loanCompleteTime);
        console.log("numLoans", numLoans);



        // // Enforce creating future-dated loan
        // require(_loanCompleteTime > block.timestamp, "Can't create loan in past");

        // NFT id and increment numLoans
        uint256 loanId = ++numLoans;

        // // Transfer NFT from owner to contract
        // IERC721(_tokenAddress).transferFrom(msg.sender, address(this), _tokenId);

        // Create loan
        loans[loanId].tokenAddress = _tokenAddress;
        loans[loanId].tokenOwner = msg.sender;
        loans[loanId].tokenId = _tokenId;
        loans[loanId].interestRate = _interestRate;
        loans[loanId].maxLoanAmount = _maxLoanAmount;
        loans[loanId].loanCompleteTime = _loanCompleteTime;
       
        // Emit creation event
        emit LoanCreated(
            loanId,
            msg.sender,
            _tokenAddress,
            _tokenId,
            _maxLoanAmount,
            _loanCompleteTime
        );

        // Return loan id
        return loanId;
    }


}