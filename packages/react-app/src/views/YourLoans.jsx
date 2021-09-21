/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Space, Menu } from "antd";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { Address, Balance } from "../components";
import { useEventListener } from "../hooks";
import YourBorrowing from "./YourBorrowing";
import YourLending from "./YourLending";

export default function YourLoans({
  loanCreatedEvents,
  userSigner,
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

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div>
    <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
        <Menu.Item key="/your-borrowing">
            <Link
              onClick={() => {
                setRoute("/your-borrowing");
              }}
              to="/your-borrowing"
            >
              Borrowing
            </Link>
          </Menu.Item>
          <Menu.Item key="/your-lending">
            <Link
              onClick={() => {
                setRoute("/your-lending");
              }}
              to="/your-lending"
            >
              Lending
            </Link>
          </Menu.Item>
          
        </Menu>

        <Switch>
          
          <Route path="/your-borrowing">
            <YourBorrowing
              address={address}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              loanCreatedEvents={loanCreatedEvents}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/your-lending">
            <YourLending
              address={address}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              loanCreatedEvents={loanCreatedEvents}
              blockExplorer={blockExplorer}
            />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}
