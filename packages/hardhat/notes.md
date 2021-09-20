- createLoan performs: 
    - ensures that a loan isn't created in the past
    - increments the numLoans ever created
    - transfers the NFT from the owner to the contract as an escrow agent
    - sets the loan:
        - tokenAddress
        - tokenOwner
        - tokenId
        - interestRate
        - maxLoanAmount
        - loanCompleteTime
    - emits a LoanCreated event
    - returns the loanId


- create loan is more of requestLoan or createLoanAuction
- Why is there a maxLoanAmount? I would think as long as the next interest rate bid is the same or lower and the loanCompleteTime is the same or later the maxLoanAmount wouldn't matter. 
