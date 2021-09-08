pragma solidity ^0.8.0;

// ============ Imports ============

import "./SafeMath.sol";
import "./IERC721.sol";
import "hardhat/console.sol";


contract LendingAuction{
    // ============ Structs ============

    // Individual loan
    struct PawnLoan {
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
    mapping(uint256 => PawnLoan) public pawnLoans;

    function createLoan() external {
        console.log("logging in function");
    }

}