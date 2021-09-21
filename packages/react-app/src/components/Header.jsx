import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏦 Lending Auction House"
        subTitle="💰 Where lenders bid for your loan 💰"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
