const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

use(solidity);

describe("Lending Auctions",function () {
 
  let owner1 = ""
  let owner2 = ""
  let yourCollectible = {}
  let lendingAuction = {}

  describe("Deploy contracts and assign state variables", function () {
      console.log("here 2")
    it("Should set owners", async function () {
        let owners = await ethers.getSigners() 
        
        owner1 = owners[1].address
        owner2 = owners[2].address

        expect(owner1).to.equal(owners[1].address)
        expect(owner2).to.equal(owners[2].address)
        expect(owner2).to.not.equal(owners[3].address)
    });

    it("Should deploy YourCollectible instance", async function () {
      const YourCollectible = await ethers.getContractFactory("YourCollectible");

      yourCollectible = await YourCollectible.deploy();
      expect(yourCollectible).to.exist;
    });

    it("Should deploy LendingAuction instance", async function () {
        const LendingAuction = await ethers.getContractFactory("LendingAuction");
  
        lendingAuction = await LendingAuction.deploy();
        expect(lendingAuction).to.exist;
    });
  });

    describe("YourCollectible tests", function () {
      it("Should mint an NFT and transfer to owner1", async function () {

        expect(await yourCollectible.balanceOf(owner1)).to.equal(0)

        const buffalo = {
            "description": "It's actually a bison?",
            "external_url": "https://austingriffith.com/portfolio/paintings/",
            "image": "https://austingriffith.com/images/paintings/buffalo.jpg",
            "name": "Buffalo",
            "attributes": [
            {
                "trait_type": "BackgroundColor",
                "value": "green"
            },
            {
                "trait_type": "Eyes",
                "value": "googly"
            },
            {
                "trait_type": "Stamina",
                "value": 42
            }
            ]
        }

        const uploaded = await ipfs.add(JSON.stringify(buffalo))

        expect(uploaded).to.exist;

        await yourCollectible.mintItem(owner1,uploaded.path,{gasLimit:400000})

        expect(await yourCollectible.balanceOf(owner1)).to.equal(1)
        expect(await yourCollectible.ownerOf(1)).to.equal(owner1)
      });
    });

    
});