import { BrowserProvider, Contract, isAddress } from "https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm";

const abi = ["function number() view returns (uint256)", "function setNumber(uint256 newNumber)"];
const $ = (id) => document.getElementById(id);
const addressInput = $("address");
let provider;
let signer;
let busy = false;

addressInput.value = localStorage.getItem("simpleStorageAddress") || "";

function status(message, kind = "") {
  $("status").textContent = message;
  $("status").className = `banner ${kind}`;
}

function setBusy(value) {
  busy = value;
  $("connect").disabled = value;
  syncButtons();
}

function syncButtons() {
  const ready = Boolean(signer && isAddress(addressInput.value.trim())) && !busy;
  $("read").disabled = !ready;
  $("save").disabled = !ready;
}

function contract() {
  const address = addressInput.value.trim();
  if (!isAddress(address)) throw new Error("Enter a valid 0x contract address.");
  if (!signer) throw new Error("Connect your wallet first.");
  localStorage.setItem("simpleStorageAddress", address);
  return new Contract(address, abi, signer);
}

function friendlyError(error) {
  if (error?.code === 4001 || error?.code === "ACTION_REJECTED") return "Request cancelled in your wallet.";
  return error?.shortMessage || error?.reason || error?.message || "Something went wrong.";
}

async function refresh() {
  const value = await contract().number();
  $("current").textContent = value.toString();
  status("Number loaded from the blockchain.", "success");
}

async function connect() {
  if (!window.ethereum) {
    status("No wallet found. On a phone, open this URL in MetaMask's built-in browser; on a computer, install a compatible wallet extension.", "error");
    return;
  }
  setBusy(true);
  try {
    provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const account = await signer.getAddress();
    $("wallet").textContent = `${account.slice(0, 6)}…${account.slice(-4)}`;
    $("network").textContent = `${network.name} (${network.chainId})`;
    status("Wallet connected. Confirm your contract address and network.", "success");
    if (isAddress(addressInput.value.trim())) await refresh();
  } catch (error) {
    status(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function save() {
  const raw = $("new-number").value.trim();
  if (!/^\d+$/.test(raw)) {
    status("Enter a whole number from 0 upwards.", "error");
    return;
  }
  setBusy(true);
  try {
    const target = contract();
    status("Confirm the transaction in your wallet.");
    const tx = await target.setNumber(BigInt(raw));
    status(`Transaction sent: ${tx.hash}. Waiting for confirmation…`);
    await tx.wait();
    await refresh();
    status("Number saved and confirmed on the blockchain.", "success");
  } catch (error) {
    status(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

$("connect").addEventListener("click", connect);
$("read").addEventListener("click", async () => {
  setBusy(true);
  try { await refresh(); } catch (error) { status(friendlyError(error), "error"); }
  finally { setBusy(false); }
});
$("save").addEventListener("click", save);
addressInput.addEventListener("input", () => { $("current").textContent = "—"; syncButtons(); });
window.ethereum?.on?.("accountsChanged", () => window.location.reload());
window.ethereum?.on?.("chainChanged", () => window.location.reload());
