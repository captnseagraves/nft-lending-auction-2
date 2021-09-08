const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Lending Auctions",function () {
  let yourCollectible;
 
  let owner1 = ""
  let owner2 = ""

  describe("Deploy contracts and assign state variables", function () {
      console.log("here 2")
    it("Should set owners", async function () {

        let owners = await ethers.getSigners() 
        owner1 = owners[1].address
        owner2 = owners[2].address

        expect(owner1).to.equal(owners[1].address)
        expect(owner2).to.equal(owners[2].address)
        expect(owner2).to.not.equal(owners[3].address)

    //   const YourCollectible = await ethers.getContractFactory("YourCollectible");

    //   yourCollectible = await YourCollectible.deploy();
    //   expect(yourCollectible).to.exist;
    });

    // describe("mint NFTs", function () {
    //   it("Should mint 6 NFTs and transfer to owner1", async function () {

    //     console.log("in the first test")

    //     // ADDRESS TO MINT TO:
    //     const toAddress = "0x5E3df1431aBf51a7729348C7B4bAe6AF80a85803"

    //     console.log("\n\n 🎫 Minting to "+toAddress+"...\n");

    //     const { deployer } = await getNamedAccounts();
    //     const yourCollectible = await ethers.getContract("YourCollectible", deployer);

    //     const buffalo = {
    //         "description": "It's actually a bison?",
    //         "external_url": "https://austingriffith.com/portfolio/paintings/",// <-- this can link to a page for the specific file too
    //         "image": "https://austingriffith.com/images/paintings/buffalo.jpg",
    //         "name": "Buffalo",
    //         "attributes": [
    //         {
    //             "trait_type": "BackgroundColor",
    //             "value": "green"
    //         },
    //         {
    //             "trait_type": "Eyes",
    //             "value": "googly"
    //         },
    //         {
    //             "trait_type": "Stamina",
    //             "value": 42
    //         }
    //         ]
    //     }
    //     console.log("Uploading buffalo...")
    //     const uploaded = await ipfs.add(JSON.stringify(buffalo))

    //     console.log("Minting buffalo with IPFS hash ("+uploaded.path+")")
    //     await yourCollectible.mintItem(toAddress,uploaded.path,{gasLimit:400000})


    //     await sleep(delayMS)

    //             // await yourCollectible.setPurpose(newPurpose);
    //             // expect(await yourCollectible.purpose()).to.equal(newPurpose);
    //   });
    // });
  });
});