/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Space } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance } from "../components";

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

export default function OpenAuctions({
  numLoans,
  lendingAuctions,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts
}) {

  const [openLoanAuctions, setOpenLoanAuctions] = useState([]);


  // firstBidTime: BigNumber {_hex: "0x00", _isBigNumber: true}
// historicInterest: BigNumber {_hex: "0x00", _isBigNumber: true}
// interestRate: BigNumber {_hex: "0x00", _isBigNumber: true}
// lastBidTime: BigNumber {_hex: "0x00", _isBigNumber: true}
// lender: "0x0000000000000000000000000000000000000000"
// loanAmount: BigNumber {_hex: "0x00", _isBigNumber: true}
// loanAmountDrawn: BigNumber {_hex: "0x00", _isBigNumber: true}
// loanCompleteTime: BigNumber {_hex: "0x00", _isBigNumber: true}
// maxLoanAmount: BigNumber {_hex: "0x00", _isBigNumber: true}
// tokenAddress: "0x0000000000000000000000000000000000000000"
// tokenId: BigNumber {_hex: "0x00", _isBigNumber: true}
// tokenOwner: "0x0000000000000000000000000000000000000000"


  useEffect(() => {
    const updateOpenLoanAuctions = async () => {
      console.log("SEE ME SEE ME SEE ME openLoanAuctions", openLoanAuctions)
      const openLoanAuctionsUpdate = [];
      for (let loanIndex = 1; loanIndex <= numLoans; loanIndex++) {
        try {
          console.log("Getting loan at index", loanIndex);
          const loanAtIndex = await readContracts.LendingAuction.loans(loanIndex);
          try {
            console.log("fetching NFT details");
            const tokenURI = await readContracts.YourCollectible.tokenURI(loanAtIndex.tokenId);
            const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
            const jsonManifestBuffer = await getFromIPFS(ipfsHash);
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest)
            try {
              console.log("adding loan and NFT details to state update");
              openLoanAuctionsUpdate.push({
                loanId: loanIndex, 
                tokenAddress: loanAtIndex.tokenAddress,
                tokenId: loanAtIndex.tokenId,
                tokenOwner: loanAtIndex.tokenOwner,
                tokenURI: tokenURI,
                firstBidTime: loanAtIndex.firstBidTime,
                historicInterest: loanAtIndex.historicInterest,
                interestRate: loanAtIndex.interestRate,
                lastBidTime: loanAtIndex.lastBidTime,
                lender: loanAtIndex.lender,
                loanAmount: loanAtIndex.loanAmount,
                loanAmountDrawn: loanAtIndex.loanAmountDrawn,
                loanCompleteTime: loanAtIndex.loanCompleteTime,
                maxLoanAmount: loanAtIndex.maxLoanAmount,
                tokenMetadata: { ...jsonManifest }
              });
            } catch (e) {
              console.log(e);
            }
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setOpenLoanAuctions(openLoanAuctionsUpdate);
    };
    updateOpenLoanAuctions();
  }, []);

  return (
    <div>
    <p>Open Auctions</p>   
    <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={openLoanAuctions}
                renderItem={item => {
                  const id = item.loanId;
                  return (
                    <List.Item key={item.loanId + "_" + item.tokenAddress}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> "farts"
                          </div>
                        }
                      >
                        {/* <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div> */}
                      </Card>

                      {/* <div>
                        owner:{" "}
                        <Address
                          address={item.owner}
                          ensProvider={mainnetProvider}
                          blockExplorer={blockExplorer}
                          fontSize={16}
                        />
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                      </div> */}
                    </List.Item>
                  );
                }}
              />
            </div>
    </div>
  );
}
