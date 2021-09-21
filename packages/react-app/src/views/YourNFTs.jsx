/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Space } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, AddressInput } from "../components";
import { useEventListener, useContractReader } from "../hooks";
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



export default function YourNFTs({
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

  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [loanInterestRate, setLoanInterestRate] = useState("");
  const [maxLoanAmount, setMaxLoanAmount] = useState("");
  const [loanCompleteTime, setLoanCompleteTime] = useState("");

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [address], 10000);
  console.log("🤗 balance:", balance);

    //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          console.log("tokenURI", tokenURI);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [address, yourBalance]);

  return (
    <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div>
                      </Card>

                      <div>
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
                        <Divider /> 
                        <h4>Create a lending auction for this NFT</h4>
                        <div style={{ margin: 8 }}>
                          <Input
                            placeholder="Interest Rate %"
                            onChange={e => {
                              setLoanInterestRate(e.target.value);
                            }}
                          />
                          <Input
                            placeholder="Max Loan Amount in WEI"
                            onChange={e => {
                              setMaxLoanAmount(e.target.value);
                            }}
                          />
                          
                          <Space direction="vertical" size={12}>
                            <DatePicker 
                              showTime 
                              onOk={ value => {
                                let timestamp = moment(value._d).unix()
                                setLoanCompleteTime(timestamp);
                                }} 
                            /> 
                          </Space>
                          <br />
                          <Button
                            style={{ marginTop: 8 }}
                            onClick={async () => {
                              /* look how you call setPurpose on your contract: */
                              /* notice how you pass a call back for tx updates too */
                              const result = tx(writeContracts.LendingAuction.createLoan(
                                Number(loanInterestRate), 
                                Number(maxLoanAmount), 
                                loanCompleteTime
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
                            Create Loan Ask
                          </Button>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
  );
}
