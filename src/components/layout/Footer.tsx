import React from "react";

const Footer: React.FC = () => (
  <footer
    style={{
      background: "#FAEDE2",
      color: "#7A3E16",
      padding: "2rem 0",
      textAlign: "center",
      borderTop: "1px solid #F8CEA7",
      marginTop: "2rem",
    }}
  >
    <div>
      <strong>Tribal Artistry © {new Date().getFullYear()}</strong>
      <br />
      Empowering tribal artists. Preserving heritage. Connecting cultures.
    </div>
    <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
      <a
        href="/about"
        style={{ color: "#7A3E16", margin: "0 1rem", textDecoration: "underline" }}
      >
        About Us
      </a>
      <a
        href="/contact"
        style={{ color: "#7A3E16", margin: "0 1rem", textDecoration: "underline" }}
      >
        Contact
      </a>
      <a
        href="/privacy"
        style={{ color: "#7A3E16", margin: "0 1rem", textDecoration: "underline" }}
      >
        Privacy Policy
      </a>
    </div>
  </footer>
);

export default Footer;
