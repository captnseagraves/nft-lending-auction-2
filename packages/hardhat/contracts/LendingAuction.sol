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
        // Current max bid in ETH
        uint256 loanAmount;
        // Maximum bid in ETH
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
  // New loan lender/bidder
  event LoanUnderwritten(uint256 id, address lender);
  // Loan drawn by NFT owner
  event LoanDrawn(uint256 id);
  // Loan repayed by address
  event LoanRepayed(uint256 id, address lender, address repayer);
  // Loan cancelled by NFT owner
  event LoanCancelled(uint256 id);
  // NFT seized by lender
  event LoanSeized(uint256 id, address lender, address caller);

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
        require(_loanCompleteTime > block.timestamp, "Can't create loan in past");

        // NFT id and increment numLoans
        uint256 loanId = ++numLoans;

        // // Transfer NFT from owner to contract
        IERC721(_tokenAddress).transferFrom(msg.sender, address(this), _tokenId);

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

    /**
   * Helper: Calculate accrued interest for a particular lender
   * @param _loanId PawnLoan id
   * @param _future allows calculating accrued interest in future
   * @return Accrued interest on current top bid, in Ether
   */
  function calculateInterestAccrued(uint256 _loanId, uint256 _future)
    public
    view
    returns (uint256)
  {
    Loan memory loan = loans[_loanId];
    // Seconds that current bid has stayed at top
    uint256 _secondsAsTopBid = block.timestamp + _future - loan.lastBidTime;
    // Seconds that any loan has been active
    uint256 _secondsSinceFirstBid = loan.loanCompleteTime - loan.firstBidTime;
    // Duration of total loan time that current bid has been active
    uint256 _durationAsTopBid = SafeMath.div(_secondsAsTopBid, _secondsSinceFirstBid);
    // Interest rate
    uint256 _interestRate = SafeMath.div(loan.interestRate, 100);
    // Calculating the maximum interest if paying _interestRate for all _secondsSinceFirstBid
    uint256 _maxInterest = SafeMath.mul(_interestRate, loan.loanAmount);
    // Calculating the share of maximum interest to pay to top bidder
    return SafeMath.mul(_durationAsTopBid, _maxInterest);
  }

    /**
    * Helper: Calculates required additional capital (over topbid) to outbid loan
    * @param _loanId PawnLoan id
    * @param _future allows calculating required additional capital in future
    * @return required interest payment to cover current top bidder
   */
  function calculateTotalInterest(uint256 _loanId, uint256 _future) public view returns (uint256) {
    Loan memory loan = loans[_loanId];

    // past lender interest + current accrued interest
    return loan.historicInterest + calculateInterestAccrued(_loanId, _future);
  }

}