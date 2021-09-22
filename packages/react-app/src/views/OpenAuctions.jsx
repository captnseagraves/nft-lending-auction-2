/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Space } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, AddressInput } from "../components";
import { useEventListener } from "../hooks";
import { now } from "moment";
import moment from 'moment';

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
  const [loanUnderwrittenAmount, setLoanUnderwrittenAmount] = useState("");

  const loanUnderwrittenEvents = useEventListener(readContracts, "LendingAuction", "LoanUnderwritten", localProvider, 1);
  console.log("📟 loanUnderwritten events:", loanUnderwrittenEvents);

  const loanCreatedEvents = useEventListener(readContracts, "LendingAuction", "LoanCreated", localProvider, 1);
  console.log("📟 loanCreated events:", loanCreatedEvents);

  useEffect(() => {
    const updateOpenLoanAuctions = async () => {
      console.log("SEE ME SEE ME SEE ME openLoanAuctions", openLoanAuctions)
      const openLoanAuctionsUpdate = [];
      for (let loanEventIndex = 1; loanEventIndex <= loanCreatedEvents.length; loanEventIndex++) {
        try {
          console.log("Getting loan at index", loanEventIndex);
          const loanAtIndex = await readContracts.LendingAuction.loans(loanEventIndex);
          if(loanAtIndex.tokenOwner != 0x0000000000000000000000000000000000000000 && Number(loanAtIndex.loanCompleteTime) > moment(now()).unix()){
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
                  loanCompleteTime: Number(loanAtIndex.loanCompleteTime),
                  maxLoanAmount: String(loanAtIndex.maxLoanAmount),
                  tokenMetadata: { ...jsonManifest }
                });
              } catch (e) {
                console.log(e);
              }
            } catch (e) {
              console.log(e);
            }
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
                  let firstBidTime = moment.unix(item.firstBidTime);
                  let lastBidTime = moment.unix(item.lastBidTime);
                  let loanCompleteTime = moment.unix(item.loanCompleteTime);
                  let nowNow = moment(now()).unix();
                  console.log("loanCompletTime", loanCompleteTime);
                  console.log("nowNow", typeof nowNow)
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
                        <div> 
                          {item.firstBidTime == 0 ? 
                          <div>
                            <b>This lending auction has no bids yet</b>
                            <br />
                          </div>
                             : 
                            <div>
                              <div>"Time of first bid:" + firstBidTime.format("dddd, MMMM Do YYYY, h:mm:ss a")</div>
                              <div>"Time of last bid:" + lastBidTime.format("dddd, MMMM Do YYYY, h:mm:ss a")</div>
                            </div>
                          }
                        </div>
                        
                        <div>Total historic interest: {item.historicInterest}</div>
                        <div>Current Interest Rate: {item.interestRate}%</div>
                        <div> 
                          {item.lender == 0x0000000000000000000000000000000000000000 ? 
                            <div></div> : 
                            <div>Lender: {" "}
                            <Address
                                address={item.lender}
                                ensProvider={mainnetProvider}
                                blockExplorer={blockExplorer}
                                fontSize={16}
                            />
                        </div>
                          }
                        </div>
                        
                        <div>Max Loan Ask: {item.maxLoanAmount}</div>
                        <div> 
                          {item.loanAmount == 0 ? 
                            <div></div> : 
                            <div>Current max bid: {item.loanAmount}</div>
                          }
                        </div>
                        
                        <div>Minimum bid required: {Number(item.loanAmountDrawn) + 1}</div>
                        <div>
                          This lending auction ends at: 
                          <br />
                          {console.log("item.loanCompleteTime", item.loanCompleteTime)}
                          <b>{loanCompleteTime.format("dddd, MMMM Do YYYY, h:mm:ss a")}</b>
                        </div>
                        Token owner:{" "}
                          <Address
                            address={item.tokenOwner}
                            ensProvider={mainnetProvider}
                            blockExplorer={blockExplorer}
                            fontSize={16}
                          />
                          
                      <Divider />
                      <h4>Underwrite this loan</h4>
                      <div style={{ margin: 8 }}>

                        <Input
                          placeholder="Enter bid amount in Wei"
                          onChange={e => {
                            setLoanUnderwrittenAmount(e.target.value);
                          }}
                        />
                        <br />
                        <Button
                          style={{ marginTop: 8 }}
                          onClick={async () => {
                            const result = tx(writeContracts.LendingAuction.underwriteLoan(
                                item.loanId, 
                                { value: loanUnderwrittenAmount }
                              ), update => {
                              console.log("📡 Transaction Update:", update);
                              if (update && (update.status === "confirmed" || update.status === 1)) {
                                console.log(" 🍾 Transaction " + update.hash + " finished!");
                                console.log(
                                  " ⛽️ " +
                                    update.gasUsed +
                                    "/" +
                                    (update.gasLimit || update.gas) +
                                    " @ " +
                                    parseFloat(update.gasPrice) / 1000000000 +
                                    " gwei",
                                );
                              }
                            });
                            console.log("awaiting metamask/web3 confirm result...", result);
                            console.log(await result);
                          }}
                        >
                          Underwrite Loan
                        </Button>
                      </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
    </div>
  );
}
