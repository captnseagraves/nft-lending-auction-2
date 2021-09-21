/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Space } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, AddressInput } from "../components";

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
  loanCreatedEvents,
  lendingAuctions,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer
}) {

  const [openLoanAuctions, setOpenLoanAuctions] = useState([]);
  const [transferToAddresses, setTransferToAddresses] = useState({});

  useEffect(() => {
    const updateOpenLoanAuctions = async () => {
      console.log("SEE ME SEE ME SEE ME openLoanAuctions", openLoanAuctions)
      const openLoanAuctionsUpdate = [];
      for (let loanEventIndex = 1; loanEventIndex <= loanCreatedEvents.length; loanEventIndex++) {
        try {
          console.log("Getting loan at index", loanEventIndex);
          const loanAtIndex = await readContracts.LendingAuction.loans(loanEventIndex);
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
                loanId: String(loanAtIndex.loanId), 
                tokenAddress: loanAtIndex.tokenAddress,
                tokenId: String(loanAtIndex.tokenId),
                tokenOwner: loanAtIndex.tokenOwner,
                tokenURI: tokenURI,
                firstBidTime: String(loanAtIndex.firstBidTime),
                historicInterest: String(loanAtIndex.historicInterest),
                interestRate: String(loanAtIndex.interestRate),
                lastBidTime: String(loanAtIndex.lastBidTime),
                lender: loanAtIndex.lender,
                loanAmount: String(loanAtIndex.loanAmount),
                loanAmountDrawn: String(loanAtIndex.loanAmountDrawn),
                loanCompleteTime: String(loanAtIndex.loanCompleteTime),
                maxLoanAmount: String(loanAtIndex.maxLoanAmount),
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
  }, [loanCreatedEvents]);

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
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{item.tokenId}</span> {item.tokenMetadata.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.tokenMetadata.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.tokenMetadata.description}</div>
                      </Card>

                      <div>
                      <div>loan ID: {item.loanId}</div>
                      <div>Token address: {item.tokenAddress}</div>
                      <div>Time of first bid: {item.firstBidTime}</div>
                      <div>Time of last bid: {item.lastBidTime}</div>
                      <div>Total historic interest: {item.historicInterest}</div>
                      <div>Current Interest Rate: {item.interestRate}</div>
                      <div>Lender: {item.lender}</div>
                      <div>Max Loan Amount: {item.maxLoanAmount}</div>
                      <div>Current max bid: {item.loanAmount}</div>
                      <div>Loan amount drawn: {item.loanAmountDrawn}</div>
                      <div>Loan ends at: {item.loanCompleteTime}</div>
                      <br />
                        Token owner:{" "}
                        <Address
                          address={item.tokenOwner}
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
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
    </div>
  );
}
