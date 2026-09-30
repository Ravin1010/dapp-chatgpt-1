# Simple Storage dApp

A mobile-friendly Flask website for the included Solidity `SimpleStorage` contract. Flask serves HTML/CSS/JS; the browser wallet signs blockchain transactions. The server does not hold a private key.

## Important: deploy the contract to a public network

Remix VM runs only inside Remix. Its contract address cannot be reached by a separately hosted website. In Remix, compile `SimpleStorage.sol`, then under **Deploy & Run Transactions** choose **Injected Provider** and connect a wallet on a public test network such as Sepolia. Deploy and copy the **contract address**. Leave **Verify Contract on Explorers** unchecked. Your wallet must use the same network when using this site, and must have enough test network currency for transaction fees.

## Local run

```bash
pip install -r requirements.txt
python app.py
```

Open `http://localhost:5000`. Use the deployed contract address, connect your wallet, read `number`, and save a new integer with `setNumber`.

## Deploy on Render

1. Upload this folder's contents to a GitHub repository (keep `app.py`, `requirements.txt`, `templates/`, and `static/` at the repository root).
2. Create a **Web Service** on Render from that repository. Select the Python runtime.
3. Set **Build Command** to `pip install -r requirements.txt`.
4. Set **Start Command** to `gunicorn app:app`.
5. Open the HTTPS URL Render provides. On a phone, paste that URL into MetaMask Mobile's built-in browser and connect your wallet. Enter the public-network contract address.

The contract address is saved in that browser's local storage, so each device enters it once. The site loads ethers.js from jsDelivr and requires internet access. No API keys are needed.
